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
  offset?: number;
  limit?: number;
  cursor?: string;
  select?: string[];
  where?: Record<string, any>;
  sort?: string | string[];
  tokenBudget?: number;
  query?: {
    offset?: number;
    limit?: number;
    cursor?: string;
    select?: string[];
    where?: Record<string, any>;
    sort?: string | string[];
  };
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
  select: string[];
  where?: Record<string, any>;
  sort: string[];
  tokenBudget?: number;
  cursor?: string;
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
};

type QueryResult = {
  value: any;
  meta: {
    totalBefore?: number;
    totalMatched?: number;
    offset?: number;
    limit?: number;
    cursor?: string;
    nextCursor?: string;
    sort?: string[];
    hasWhere?: boolean;
    hasSelect?: boolean;
  };
};

type BudgetResult = {
  data: any;
  outputBytes: number;
  sourceBytes: number;
  stats: TruncationStats;
  budgetAdjusted: boolean;
  effective: {
    maxItems: number;
    maxDepth: number;
    maxString: number;
    maxObjectKeys: number;
  };
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
  const srcQuery = src.query && typeof src.query === "object" ? src.query : {};
  const dQuery = d.query && typeof d.query === "object" ? d.query : {};

  return {
    view: src.view ?? d.view,
    include: toStringArray(src.include ?? d.include),
    exclude: toStringArray(src.exclude ?? d.exclude),
    maxItems: toNumber(src.maxItems ?? d.maxItems),
    maxDepth: toNumber(src.maxDepth ?? d.maxDepth),
    maxString: toNumber(src.maxString ?? d.maxString),
    maxObjectKeys: toNumber(src.maxObjectKeys ?? d.maxObjectKeys),
    responsePath: toStringOrUndefined(src.responsePath ?? d.responsePath),
    responseOffset: toNumber(src.responseOffset ?? src.offset ?? srcQuery.offset ?? d.responseOffset ?? d.offset ?? dQuery.offset),
    responseLimit: toNumber(src.responseLimit ?? src.limit ?? srcQuery.limit ?? d.responseLimit ?? d.limit ?? dQuery.limit),
    offset: toNumber(src.offset ?? srcQuery.offset ?? d.offset ?? dQuery.offset),
    limit: toNumber(src.limit ?? srcQuery.limit ?? d.limit ?? dQuery.limit),
    cursor: toStringOrUndefined(src.cursor ?? srcQuery.cursor ?? d.cursor ?? dQuery.cursor),
    select: toStringArray(src.select ?? srcQuery.select ?? d.select ?? dQuery.select),
    where: toObjectOrUndefined(src.where ?? srcQuery.where ?? d.where ?? dQuery.where),
    sort: toStringArrayFromAny(src.sort ?? srcQuery.sort ?? d.sort ?? dQuery.sort),
    tokenBudget: toNumber(src.tokenBudget ?? d.tokenBudget),
  };
}

export function serializeForLlm(payload: any, optionsRaw?: ResponseOptions, context?: SerializeContext) {
  const options = resolveOptions(optionsRaw || {});
  const selected = selectValue(payload, options);

  if (selected.notFound) {
    return {
      format: "astrovisor.serialized.v2",
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
  const queried = applyQuery(projected, options);
  const budgeted = truncateWithBudget(queried.value, options);
  const truncated =
    budgeted.stats.strings > 0 ||
    budgeted.stats.arrayItems > 0 ||
    budgeted.stats.objectKeys > 0 ||
    budgeted.stats.depthCuts > 0;

  return {
    format: "astrovisor.serialized.v2",
    meta: {
      ...context,
      view: options.view,
      selectedPath: selected.path,
      pathFound: true,
      sourceBytes: budgeted.sourceBytes,
      outputBytes: budgeted.outputBytes,
      truncated,
      truncation: budgeted.stats,
      tokenBudget: options.tokenBudget,
      budgetAdjusted: budgeted.budgetAdjusted,
      effectiveLimits: budgeted.effective,
      query: queried.meta,
      availablePaths: listAvailablePaths(projected),
    },
    summary: {
      source: summarizeValue(projected),
      selected: summarizeValue(queried.value),
    },
    data: budgeted.data,
  };
}

function resolveOptions(input: ResponseOptions): ResolvedOptions {
  const view = normalizeView(input.view);
  const base = DEFAULTS_BY_VIEW[view];
  const responseOffset = toNumber(input.responseOffset ?? input.offset);
  const responseLimit = toNumber(input.responseLimit ?? input.limit);

  return {
    view,
    include: toStringArray(input.include),
    exclude: toStringArray(input.exclude),
    maxItems: clampNumber(input.maxItems, base.maxItems, 1, 5000),
    maxDepth: clampNumber(input.maxDepth, base.maxDepth, 1, 32),
    maxString: clampNumber(input.maxString, base.maxString, 16, 64_000),
    maxObjectKeys: clampNumber(input.maxObjectKeys, base.maxObjectKeys, 1, 5000),
    responsePath: toStringOrUndefined(input.responsePath),
    responseOffset,
    responseLimit,
    select: toStringArray(input.select),
    where: toObjectOrUndefined(input.where),
    sort: toStringArrayFromAny(input.sort),
    tokenBudget: clampNumberOrUndefined(input.tokenBudget, 2048, 1_000_000),
    cursor: toStringOrUndefined(input.cursor),
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

  return {
    value,
    notFound,
    path: selectedPath,
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

function applyQuery(value: any, options: ResolvedOptions): QueryResult {
  if (value === null || value === undefined) {
    return { value, meta: {} };
  }

  if (!Array.isArray(value)) {
    const selectedObject = options.select.length ? applySelect(value, options.select) : value;
    return {
      value: selectedObject,
      meta: {
        hasWhere: !!options.where,
        hasSelect: options.select.length > 0,
        sort: options.sort.length ? options.sort : undefined,
      },
    };
  }

  const totalBefore = value.length;
  const filtered = options.where ? value.filter((item) => evaluateWhere(item, options.where as Record<string, any>)) : value.slice();
  const totalMatched = filtered.length;
  const sorted = options.sort.length ? sortItems(filtered, options.sort) : filtered;
  const window = resolveWindow(totalMatched, options);
  const sliced = sorted.slice(window.offset, window.offset + window.limit);
  const selected = options.select.length ? sliced.map((item) => applySelect(item, options.select)) : sliced;

  return {
    value: selected,
    meta: {
      totalBefore,
      totalMatched,
      offset: window.offset,
      limit: window.limit,
      cursor: window.cursor,
      nextCursor: window.nextCursor,
      sort: options.sort.length ? options.sort : undefined,
      hasWhere: !!options.where,
      hasSelect: options.select.length > 0,
    },
  };
}

function resolveWindow(total: number, options: ResolvedOptions): { offset: number; limit: number; cursor?: string; nextCursor?: string } {
  const decodedOffset = decodeCursor(options.cursor);
  const rawOffset = decodedOffset ?? options.responseOffset ?? 0;
  const offset = Math.max(0, Math.min(total, Math.floor(rawOffset)));
  const requestedLimit = options.responseLimit ?? options.maxItems;
  const limit = Math.max(0, Math.min(total - offset, Math.floor(requestedLimit)));
  const nextOffset = offset + limit;
  const nextCursor = nextOffset < total ? encodeCursor(nextOffset) : undefined;
  return { offset, limit, cursor: options.cursor, nextCursor };
}

function truncateWithBudget(value: any, options: ResolvedOptions): BudgetResult {
  let current = {
    maxItems: options.maxItems,
    maxDepth: options.maxDepth,
    maxString: options.maxString,
    maxObjectKeys: options.maxObjectKeys,
  };

  const sourceBytes = safeJsonBytes(value);
  let bestData: any = value;
  let bestBytes = sourceBytes;
  let bestStats: TruncationStats = { strings: 0, arrayItems: 0, objectKeys: 0, depthCuts: 0 };
  let adjusted = false;

  for (let i = 0; i < 8; i++) {
    const stats: TruncationStats = { strings: 0, arrayItems: 0, objectKeys: 0, depthCuts: 0 };
    const data = truncateValue(value, current, stats, 0);
    const bytes = safeJsonBytes(data);
    bestData = data;
    bestBytes = bytes;
    bestStats = stats;

    if (!options.tokenBudget || bytes <= options.tokenBudget) {
      break;
    }

    adjusted = true;
    const next = {
      maxItems: Math.max(1, Math.floor(current.maxItems * 0.6)),
      maxDepth: Math.max(1, current.maxDepth - 1),
      maxString: Math.max(32, Math.floor(current.maxString * 0.75)),
      maxObjectKeys: Math.max(4, Math.floor(current.maxObjectKeys * 0.7)),
    };

    const unchanged =
      next.maxItems === current.maxItems &&
      next.maxDepth === current.maxDepth &&
      next.maxString === current.maxString &&
      next.maxObjectKeys === current.maxObjectKeys;
    current = next;
    if (unchanged) break;
  }

  return {
    data: bestData,
    outputBytes: bestBytes,
    sourceBytes,
    stats: bestStats,
    budgetAdjusted: adjusted,
    effective: current,
  };
}

function truncateValue(
  value: any,
  options: { maxItems: number; maxDepth: number; maxString: number; maxObjectKeys: number },
  stats: TruncationStats,
  depth: number,
): any {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    if (value.length <= options.maxString) return value;
    stats.strings += 1;
    return `${value.slice(0, options.maxString)}...`;
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

function listAvailablePaths(value: any, maxDepth = 3, maxPaths = 128): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  function push(path: string) {
    if (seen.has(path)) return;
    seen.add(path);
    out.push(path);
  }

  function walk(node: any, path: string, depth: number) {
    if (out.length >= maxPaths) return;
    push(path);
    if (depth >= maxDepth || node === null || node === undefined) return;

    if (Array.isArray(node)) {
      if (node.length > 0) walk(node[0], `${path}[]`, depth + 1);
      return;
    }

    if (typeof node !== "object") return;
    for (const key of Object.keys(node)) {
      if (out.length >= maxPaths) return;
      const childPath = path === "$" ? key : `${path}.${key}`;
      walk(node[key], childPath, depth + 1);
    }
  }

  walk(value, "$", 0);
  return out;
}

function applySelect(value: any, selectPaths: string[]) {
  if (!selectPaths.length || value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.map((item) => applySelectObject(item, selectPaths));
  }
  return applySelectObject(value, selectPaths);
}

function applySelectObject(value: any, selectPaths: string[]) {
  if (value === null || value === undefined) return value;
  if (typeof value !== "object") return value;

  const includeRoot = selectPaths.some((p) => isRootPath(p));
  if (includeRoot) return cloneSafe(value);

  const seed: any = Array.isArray(value) ? [] : {};
  for (const p of selectPaths) {
    const seg = parsePath(p);
    if (seg.length === 0) continue;
    const v = getBySegments(value, seg);
    if (v !== undefined) setBySegments(seed, seg, cloneSafe(v));
  }
  return seed;
}

function evaluateWhere(item: any, where: Record<string, any>): boolean {
  const clauses = Object.entries(where);
  if (!clauses.length) return true;

  for (const [rawKey, expected] of clauses) {
    const parsed = parseWhereKey(rawKey);
    const actual = parsed.path ? getByPath(item, parsed.path) : item;
    if (!evaluateClause(actual, parsed.op, expected)) return false;
  }
  return true;
}

function parseWhereKey(raw: string): { path: string; op: string } {
  const key = String(raw || "").trim();
  const ops = [
    "_startswith",
    "_endswith",
    "_contains",
    "_exists",
    "_regex",
    "_gte",
    "_lte",
    "_gt",
    "_lt",
    "_eq",
    "_ne",
    "_in",
    "_nin",
  ];
  for (const suffix of ops) {
    if (key.endsWith(suffix)) {
      return { path: key.slice(0, -suffix.length), op: suffix.slice(1) };
    }
  }
  return { path: key, op: "eq" };
}

function evaluateClause(actual: any, op: string, expected: any): boolean {
  switch (op) {
    case "eq":
      return compareEqual(actual, expected);
    case "ne":
      return !compareEqual(actual, expected);
    case "gt":
      return compareOrdered(actual, expected, (a, b) => a > b);
    case "gte":
      return compareOrdered(actual, expected, (a, b) => a >= b);
    case "lt":
      return compareOrdered(actual, expected, (a, b) => a < b);
    case "lte":
      return compareOrdered(actual, expected, (a, b) => a <= b);
    case "in":
      return Array.isArray(expected) ? expected.some((x) => compareEqual(actual, x)) : false;
    case "nin":
      return Array.isArray(expected) ? !expected.some((x) => compareEqual(actual, x)) : true;
    case "contains":
      return containsValue(actual, expected);
    case "startswith":
      return typeof actual === "string" && typeof expected === "string" ? actual.startsWith(expected) : false;
    case "endswith":
      return typeof actual === "string" && typeof expected === "string" ? actual.endsWith(expected) : false;
    case "exists":
      return Boolean(expected) ? actual !== undefined && actual !== null : actual === undefined || actual === null;
    case "regex":
      return matchRegex(actual, expected);
    default:
      return false;
  }
}

function containsValue(actual: any, expected: any): boolean {
  if (typeof actual === "string") return String(actual).toLowerCase().includes(String(expected ?? "").toLowerCase());
  if (Array.isArray(actual)) return actual.some((v) => compareEqual(v, expected));
  return false;
}

function matchRegex(actual: any, expected: any): boolean {
  if (typeof actual !== "string") return false;
  if (typeof expected === "string") {
    try {
      return new RegExp(expected, "i").test(actual);
    } catch {
      return false;
    }
  }
  if (expected && typeof expected === "object") {
    const pattern = String((expected as any).pattern || "");
    const flags = String((expected as any).flags || "");
    if (!pattern) return false;
    try {
      return new RegExp(pattern, flags).test(actual);
    } catch {
      return false;
    }
  }
  return false;
}

function compareEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a === null || a === undefined || b === null || b === undefined) return false;
  if (typeof a === "number" && typeof b === "number") return Number.isFinite(a) && Number.isFinite(b) && a === b;
  if (typeof a === "string" || typeof b === "string") return String(a) === String(b);
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

function compareOrdered(a: any, b: any, fn: (left: number, right: number) => boolean): boolean {
  const left = toComparableNumber(a);
  const right = toComparableNumber(b);
  if (left === null || right === null) return false;
  return fn(left, right);
}

function toComparableNumber(value: any): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
    const t = Date.parse(value);
    return Number.isNaN(t) ? null : t;
  }
  if (value instanceof Date) return Number.isFinite(value.getTime()) ? value.getTime() : null;
  return null;
}

function sortItems(items: any[], sortClauses: string[]): any[] {
  const clauses = sortClauses
    .map((clause) => String(clause || "").trim())
    .filter(Boolean)
    .map((clause) => ({ desc: clause.startsWith("-"), path: clause.startsWith("-") ? clause.slice(1) : clause }))
    .filter((clause) => clause.path.length > 0);
  if (!clauses.length) return items;

  return items.slice().sort((a, b) => {
    for (const clause of clauses) {
      const av = clause.path === "$" ? a : getByPath(a, clause.path);
      const bv = clause.path === "$" ? b : getByPath(b, clause.path);
      const cmp = compareSortValue(av, bv);
      if (cmp !== 0) return clause.desc ? -cmp : cmp;
    }
    return 0;
  });
}

function compareSortValue(a: any, b: any): number {
  if (a === b) return 0;
  if (a === undefined || a === null) return 1;
  if (b === undefined || b === null) return -1;

  const an = toComparableNumber(a);
  const bn = toComparableNumber(b);
  if (an !== null && bn !== null) {
    if (an < bn) return -1;
    if (an > bn) return 1;
    return 0;
  }

  const as = String(a);
  const bs = String(b);
  return as.localeCompare(bs);
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
  return input.map((v) => String(v)).map((v) => v.trim()).filter((v) => v.length > 0);
}

function toStringArrayFromAny(input: any): string[] {
  if (input === undefined || input === null) return [];
  if (Array.isArray(input)) return toStringArray(input);
  const single = String(input).trim();
  return single ? [single] : [];
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

function toObjectOrUndefined(v: any): Record<string, any> | undefined {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  return v as Record<string, any>;
}

function clampNumber(v: any, fallback: number, min: number, max: number): number {
  const n = toNumber(v);
  if (n === undefined) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function clampNumberOrUndefined(v: any, min: number, max: number): number | undefined {
  const n = toNumber(v);
  if (n === undefined) return undefined;
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

function encodeCursor(offset: number): string {
  const payload = JSON.stringify({ offset: Math.max(0, Math.floor(offset)) });
  return Buffer.from(payload, "utf8").toString("base64url");
}

function decodeCursor(cursor?: string): number | undefined {
  if (!cursor) return undefined;
  try {
    const json = Buffer.from(cursor, "base64url").toString("utf8");
    const data = JSON.parse(json);
    const offset = toNumber(data?.offset);
    if (offset === undefined) return undefined;
    return Math.max(0, Math.floor(offset));
  } catch {
    return undefined;
  }
}

const DEFAULTS_BY_VIEW: Record<ResponseView, { maxItems: number; maxDepth: number; maxString: number; maxObjectKeys: number }> = {
  summary: { maxItems: 8, maxDepth: 2, maxString: 200, maxObjectKeys: 16 },
  compact: { maxItems: 30, maxDepth: 4, maxString: 1200, maxObjectKeys: 48 },
  full: { maxItems: 500, maxDepth: 10, maxString: 8000, maxObjectKeys: 500 },
};
