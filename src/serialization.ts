import { randomUUID } from "crypto";

export type ResponseView = "summary" | "compact" | "full";

export type ResponseOptions = {
  view?: ResponseView | string;
  include?: string[];
  exclude?: string[];
  maxItems?: number;
  maxDepth?: number;
  maxString?: number;
  maxObjectKeys?: number;
  responsePath?: string;
  responseOffset?: number;
  responseLimit?: number;
};

export type SerializeContext = {
  operationId?: string;
  method?: string;
  path?: string;
  status?: number;
  source?: "api" | "result_store";
  resultId?: string;
  createdAt?: string;
};

type ResolvedOptions = {
  view: ResponseView;
  include: string[];
  exclude: string[];
  maxItems: number;
  maxDepth: number;
  maxString: number;
  maxObjectKeys: number;
  responsePath?: string;
  responseOffset?: number;
  responseLimit?: number;
};

type TruncationStats = {
  strings: number;
  arrayItems: number;
  objectKeys: number;
  depthCuts: number;
};

type SelectedValue = {
  value: any;
  notFound: boolean;
  path?: string;
  offset?: number;
  limit?: number;
};

export type StoredResult = {
  id: string;
  createdAtMs: number;
  expiresAtMs: number;
  payload: any;
  context?: Record<string, any>;
};

export class InMemoryResultStore {
  private map = new Map<string, StoredResult>();
  private ttlMs: number;
  private maxEntries: number;

  constructor(ttlMs = 30 * 60 * 1000, maxEntries = 128) {
    this.ttlMs = Math.max(60_000, ttlMs);
    this.maxEntries = Math.max(16, maxEntries);
  }

  put(payload: any, context?: Record<string, any>): string {
    this.cleanup();
    while (this.map.size >= this.maxEntries) {
      const oldest = this.map.keys().next().value;
      if (!oldest) break;
      this.map.delete(oldest);
    }

    const id = randomUUID().replace(/-/g, "").slice(0, 16);
    const now = Date.now();
    this.map.set(id, {
      id,
      createdAtMs: now,
      expiresAtMs: now + this.ttlMs,
      payload,
      context,
    });
    return id;
  }

  get(id: string): StoredResult | null {
    this.cleanup();
    const item = this.map.get(id);
    if (!item) return null;
    if (item.expiresAtMs < Date.now()) {
      this.map.delete(id);
      return null;
    }
    return item;
  }

  cleanup() {
    const now = Date.now();
    for (const [id, item] of this.map.entries()) {
      if (item.expiresAtMs < now) this.map.delete(id);
    }
  }

  stats() {
    this.cleanup();
    return { size: this.map.size, ttlMs: this.ttlMs, maxEntries: this.maxEntries };
  }
}

export function parseResponseOptions(input: any, defaults?: Partial<ResponseOptions>): ResponseOptions {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, any>;
  const d = (defaults || {}) as Record<string, any>;
  return {
    view: src.view ?? d.view,
    include: toStringArray(src.include ?? d.include),
    exclude: toStringArray(src.exclude ?? d.exclude),
    maxItems: toNumber(src.maxItems ?? d.maxItems),
    maxDepth: toNumber(src.maxDepth ?? d.maxDepth),
    maxString: toNumber(src.maxString ?? d.maxString),
    maxObjectKeys: toNumber(src.maxObjectKeys ?? d.maxObjectKeys),
    responsePath: toStringOrUndefined(src.responsePath ?? d.responsePath),
    responseOffset: toNumber(src.responseOffset ?? d.responseOffset),
    responseLimit: toNumber(src.responseLimit ?? d.responseLimit),
  };
}

export function serializeForLlm(payload: any, optionsRaw?: ResponseOptions, context?: SerializeContext) {
  const options = resolveOptions(optionsRaw || {});
  const selected = selectValue(payload, options);

  if (selected.notFound) {
    return {
      meta: {
        ...context,
        view: options.view,
        selectedPath: selected.path,
        pathFound: false,
      },
      summary: {
        type: "not_found",
        message: `Path not found: ${selected.path}`,
      },
      data: null,
    };
  }

  const projected = applyProjection(selected.value, options.include, options.exclude);
  const stats: TruncationStats = { strings: 0, arrayItems: 0, objectKeys: 0, depthCuts: 0 };
  const data = truncateValue(projected, options, stats, 0);

  const sourceBytes = safeJsonBytes(selected.value);
  const outputBytes = safeJsonBytes(data);
  const truncated = stats.strings > 0 || stats.arrayItems > 0 || stats.objectKeys > 0 || stats.depthCuts > 0;

  return {
    meta: {
      ...context,
      view: options.view,
      selectedPath: selected.path,
      selectedOffset: selected.offset,
      selectedLimit: selected.limit,
      pathFound: true,
      sourceBytes,
      outputBytes,
      truncated,
      truncation: stats,
    },
    summary: summarizeValue(selected.value),
    data,
  };
}

function resolveOptions(input: ResponseOptions): ResolvedOptions {
  const view = normalizeView(input.view);
  const base = DEFAULTS_BY_VIEW[view];
  return {
    view,
    include: toStringArray(input.include),
    exclude: toStringArray(input.exclude),
    maxItems: clampNumber(input.maxItems, base.maxItems, 1, 5000),
    maxDepth: clampNumber(input.maxDepth, base.maxDepth, 1, 32),
    maxString: clampNumber(input.maxString, base.maxString, 16, 64_000),
    maxObjectKeys: clampNumber(input.maxObjectKeys, base.maxObjectKeys, 1, 5000),
    responsePath: toStringOrUndefined(input.responsePath),
    responseOffset: toNumber(input.responseOffset),
    responseLimit: toNumber(input.responseLimit),
  };
}

function normalizeView(view: any): ResponseView {
  const v = String(view || "").toLowerCase();
  if (v === "summary" || v === "compact" || v === "full") return v;
  return "compact";
}

function selectValue(payload: any, options: ResolvedOptions): SelectedValue {
  let value = payload;
  let notFound = false;
  const selectedPath = options.responsePath;

  if (selectedPath) {
    const got = getByPath(payload, selectedPath);
    if (got === undefined) {
      notFound = true;
      value = null;
    } else {
      value = got;
    }
  }

  let offset: number | undefined;
  let limit: number | undefined;
  if (!notFound && Array.isArray(value) && (options.responseOffset !== undefined || options.responseLimit !== undefined)) {
    offset = Math.max(0, options.responseOffset || 0);
    limit = Math.max(0, options.responseLimit === undefined ? value.length - offset : options.responseLimit);
    value = value.slice(offset, offset + limit);
  }

  return {
    value,
    notFound,
    path: selectedPath,
    offset,
    limit,
  };
}

function applyProjection(value: any, includeRaw: string[], excludeRaw: string[]) {
  let out = cloneSafe(value);

  const include = toStringArray(includeRaw);
  if (include.length > 0) {
    const includeRoot = include.some((p) => isRootPath(p));
    if (includeRoot) {
      out = cloneSafe(value);
    } else {
      const seed = Array.isArray(value) ? [] : {};
      for (const p of include) {
        const seg = parsePath(p);
        if (seg.length === 0) continue;
        const v = getBySegments(value, seg);
        if (v !== undefined) setBySegments(seed, seg, cloneSafe(v));
      }
      out = seed;
    }
  }

  const exclude = toStringArray(excludeRaw);
  for (const p of exclude) {
    const seg = parsePath(p);
    if (seg.length === 0) continue;
    deleteBySegments(out, seg);
  }
  return out;
}

function truncateValue(value: any, options: ResolvedOptions, stats: TruncationStats, depth: number): any {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    if (value.length <= options.maxString) return value;
    stats.strings += 1;
    return `${value.slice(0, options.maxString)}…`;
  }
  if (typeof value !== "object") return value;

  if (depth >= options.maxDepth) {
    stats.depthCuts += 1;
    return "[Truncated: maxDepth]";
  }

  if (Array.isArray(value)) {
    const n = Math.min(value.length, options.maxItems);
    if (value.length > n) stats.arrayItems += value.length - n;
    const out: any[] = [];
    for (let i = 0; i < n; i++) {
      out.push(truncateValue(value[i], options, stats, depth + 1));
    }
    return out;
  }

  const keys = Object.keys(value);
  const n = Math.min(keys.length, options.maxObjectKeys);
  if (keys.length > n) stats.objectKeys += keys.length - n;
  const out: Record<string, any> = {};
  for (const k of keys.slice(0, n)) {
    out[k] = truncateValue((value as any)[k], options, stats, depth + 1);
  }
  return out;
}

function summarizeValue(value: any) {
  if (value === null || value === undefined) return { type: String(value) };
  if (Array.isArray(value)) {
    const sampleTypes = Array.from(new Set(value.slice(0, 10).map((x) => inferType(x))));
    return { type: "array", length: value.length, sampleTypes };
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    return { type: "object", keyCount: keys.length, keys: keys.slice(0, 25) };
  }
  if (typeof value === "string") return { type: "string", length: value.length };
  return { type: typeof value };
}

function inferType(x: any) {
  if (x === null) return "null";
  if (Array.isArray(x)) return "array";
  return typeof x;
}

function safeJsonBytes(value: any): number {
  try {
    return Buffer.byteLength(JSON.stringify(value), "utf8");
  } catch {
    return 0;
  }
}

function toStringArray(input: any): string[] {
  if (!Array.isArray(input)) return [];
  return input.map((v) => String(v)).filter((v) => v.length > 0);
}

function toStringOrUndefined(v: any): string | undefined {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  return s ? s : undefined;
}

function toNumber(v: any): number | undefined {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

function clampNumber(v: any, fallback: number, min: number, max: number): number {
  const n = toNumber(v);
  if (n === undefined) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function isRootPath(path: string): boolean {
  const p = String(path || "").trim();
  return p === "" || p === "/" || p === "$" || p === ".";
}

function parsePath(pathRaw: string): Array<string | number> {
  const path = String(pathRaw || "").trim();
  if (isRootPath(path)) return [];

  if (path.startsWith("/")) {
    return path
      .split("/")
      .slice(1)
      .map((x) => x.replace(/~1/g, "/").replace(/~0/g, "~"))
      .map((x) => (/^\d+$/.test(x) ? Number(x) : x));
  }

  const normalized = path.replace(/\[(\d+)\]/g, ".$1").replace(/^\./, "");
  return normalized
    .split(".")
    .filter(Boolean)
    .map((x) => (/^\d+$/.test(x) ? Number(x) : x));
}

function getByPath(root: any, path: string): any {
  return getBySegments(root, parsePath(path));
}

function getBySegments(root: any, segments: Array<string | number>): any {
  let cur = root;
  for (const seg of segments) {
    if (cur === null || cur === undefined) return undefined;
    if (Array.isArray(cur)) {
      const idx = typeof seg === "number" ? seg : Number(seg);
      if (!Number.isInteger(idx)) return undefined;
      cur = cur[idx];
      continue;
    }
    if (typeof cur === "object") {
      cur = (cur as any)[String(seg)];
      continue;
    }
    return undefined;
  }
  return cur;
}

function setBySegments(root: any, segments: Array<string | number>, value: any) {
  if (segments.length === 0) return;
  let cur = root;
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    const next = segments[i + 1];
    const key = Array.isArray(cur) ? Number(seg) : String(seg);
    const has = Array.isArray(cur) ? Number.isInteger(key) && cur[key] !== undefined : (cur as any)[key] !== undefined;
    if (!has) {
      const container = typeof next === "number" ? [] : {};
      if (Array.isArray(cur)) cur[key] = container;
      else (cur as any)[key] = container;
    }
    cur = Array.isArray(cur) ? cur[key] : (cur as any)[key];
    if (cur === null || typeof cur !== "object") return;
  }
  const last = segments[segments.length - 1];
  const key = Array.isArray(cur) ? Number(last) : String(last);
  if (Array.isArray(cur) && !Number.isInteger(key)) return;
  if (Array.isArray(cur)) cur[key] = value;
  else (cur as any)[key] = value;
}

function deleteBySegments(root: any, segments: Array<string | number>) {
  if (!root || segments.length === 0) return;
  let cur = root;
  for (let i = 0; i < segments.length - 1; i++) {
    const seg = segments[i];
    if (cur === null || cur === undefined) return;
    cur = Array.isArray(cur) ? cur[Number(seg)] : cur[String(seg)];
  }
  if (cur === null || cur === undefined) return;
  const last = segments[segments.length - 1];
  if (Array.isArray(cur)) {
    const idx = Number(last);
    if (!Number.isInteger(idx)) return;
    cur.splice(idx, 1);
  } else if (typeof cur === "object") {
    delete (cur as any)[String(last)];
  }
}

function cloneSafe<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (typeof value !== "object") return value;
  try {
    return structuredClone(value);
  } catch {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return value;
    }
  }
}

const DEFAULTS_BY_VIEW: Record<ResponseView, { maxItems: number; maxDepth: number; maxString: number; maxObjectKeys: number }> = {
  summary: { maxItems: 8, maxDepth: 2, maxString: 200, maxObjectKeys: 16 },
  compact: { maxItems: 30, maxDepth: 4, maxString: 1200, maxObjectKeys: 48 },
  full: { maxItems: 500, maxDepth: 10, maxString: 8000, maxObjectKeys: 500 },
};
