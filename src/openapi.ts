import axios from "axios";
import { createHash } from "crypto";

export type OpenApiDocument = {
  openapi: string;
  info?: { title?: string; version?: string };
  paths: Record<string, Record<string, any>>;
  components?: { schemas?: Record<string, any> };
};

export type McpToolDef = {
  name: string;
  description: string;
  inputSchema: any;
};

export type OperationMeta = {
  toolName: string;
  operationId: string;
  method: string;
  path: string;
  summary?: string;
  tags?: string[];
  parameters?: any[];
  requestBody?: any;
};

function sanitizeToolName(s: string): string {
  const cleaned = s.trim().replace(/[^a-zA-Z0-9_]+/g, "_").toLowerCase();
  if (!cleaned) return "astrovisor_unknown";
  if (cleaned.startsWith("astrovisor_")) return cleaned;
  if (/^[0-9]/.test(cleaned)) return `astrovisor_${cleaned}`;
  return `astrovisor_${cleaned}`;
}

const MAX_TOOL_NAME_LEN = 64;

function shortHashHex(input: string, len = 10): string {
  // Deterministic, safe characters for tool names.
  return createHash("sha1").update(input).digest("hex").slice(0, len);
}

function enforceToolNameLimit(name: string): string {
  if (name.length <= MAX_TOOL_NAME_LEN) return name;
  const h = shortHashHex(name, 10);
  const keep = Math.max(1, MAX_TOOL_NAME_LEN - (1 + h.length));
  return `${name.slice(0, keep)}_${h}`;
}

function getJsonRequestSchema(op: any): any | null {
  const rb = op?.requestBody;
  if (!rb) return null;
  const content = rb?.content || {};
  const json = content["application/json"] || content["application/*+json"];
  const schema = json?.schema;
  if (!schema) return null;
  return schema;
}

function mergeAllOf(schemas: any[]): any {
  // Best-effort merge for object schemas (good enough for MCP input docs).
  const out: any = { type: "object", properties: {}, required: [] as string[] };
  for (const s of schemas) {
    if (!s) continue;
    if (s.type && s.type != "object") return { allOf: schemas };
    if (s.properties) {
      Object.assign(out.properties, s.properties);
    }
    if (Array.isArray(s.required)) {
      out.required.push(...s.required);
    }
  }
  out.required = Array.from(new Set(out.required));
  if (out.required.length === 0) delete out.required;
  return out;
}

function resolveRef(ref: string, doc: OpenApiDocument): any {
  // Only supports local refs like "#/components/schemas/Foo".
  const m = ref.match(/^#\/components\/schemas\/(.+)$/);
  if (!m) return { $ref: ref };
  const key = m[1];
  const schema = doc.components?.schemas?.[key];
  if (!schema) return { $ref: ref };
  return schema;
}

function toJsonSchema(schema: any, doc: OpenApiDocument, depth = 0): any {
  if (!schema || depth > 12) return schema || {};

  if (schema.$ref) {
    const resolved = resolveRef(schema.$ref, doc);
    return toJsonSchema(resolved, doc, depth + 1);
  }

  if (schema.allOf && Array.isArray(schema.allOf)) {
    const parts = schema.allOf.map((s: any) => toJsonSchema(s, doc, depth + 1));
    return mergeAllOf(parts);
  }

  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    return { oneOf: schema.oneOf.map((s: any) => toJsonSchema(s, doc, depth + 1)) };
  }

  if (schema.anyOf && Array.isArray(schema.anyOf)) {
    return { anyOf: schema.anyOf.map((s: any) => toJsonSchema(s, doc, depth + 1)) };
  }

  const out: any = { ...schema };
  delete out.nullable;

  if (schema.nullable) {
    // OpenAPI3 nullable -> JSON Schema anyOf with null
    const base = { ...out };
    return { anyOf: [base, { type: "null" }] };
  }

  if (out.properties) {
    const props: any = {};
    for (const [k, v] of Object.entries(out.properties)) {
      props[k] = toJsonSchema(v, doc, depth + 1);
    }
    out.properties = props;
  }

  if (out.items) {
    out.items = toJsonSchema(out.items, doc, depth + 1);
  }

  return out;
}

function buildParamObject(params: any[], where: "path" | "query", doc: OpenApiDocument) {
  const selected = (params || []).filter((p) => (p?.in || "") === where);
  const props: any = {};
  const required: string[] = [];
  for (const p of selected) {
    const name = p?.name;
    if (!name) continue;
    props[name] = toJsonSchema(p.schema || { type: "string" }, doc);
    if (p.description) props[name].description = p.description;
    if (p.required) required.push(name);
  }
  const obj: any = { type: "object", properties: props, additionalProperties: false };
  if (required.length) obj.required = required;
  return { obj, has: selected.length > 0, hasRequired: required.length > 0 };
}

export async function loadOpenApi(openApiUrl: string): Promise<OpenApiDocument> {
  const resp = await axios.get(openApiUrl, { timeout: 30000 });
  return resp.data as OpenApiDocument;
}

export function generateOperations(doc: OpenApiDocument): OperationMeta[] {
  const raw: Array<Omit<OperationMeta, "toolName"> & { toolNameBase: string }> = [];
  for (const [path, methods] of Object.entries(doc.paths || {})) {
    for (const [methodRaw, op] of Object.entries(methods || {})) {
      const method = methodRaw.toLowerCase();
      if (!["get", "post", "put", "patch", "delete"].includes(method)) continue;
      const operationId = (op as any)?.operationId;
      if (!operationId) continue;
      const toolNameBase = sanitizeToolName(operationId);
      raw.push({
        toolNameBase,
        operationId,
        method,
        path,
        summary: (op as any)?.summary,
        tags: (op as any)?.tags,
        parameters: (op as any)?.parameters,
        requestBody: (op as any)?.requestBody,
      });
    }
  }

  // Make tool names unique even if operationIds sanitize to the same value.
  raw.sort(
    (a, b) =>
      a.toolNameBase.localeCompare(b.toolNameBase) ||
      a.method.localeCompare(b.method) ||
      a.path.localeCompare(b.path) ||
      a.operationId.localeCompare(b.operationId),
  );

  const counts = new Map<string, number>();
  const used = new Set<string>();
  const out: OperationMeta[] = [];
  for (const r of raw) {
    const n = (counts.get(r.toolNameBase) || 0) + 1;
    counts.set(r.toolNameBase, n);
    const proposed = n === 1 ? r.toolNameBase : `${r.toolNameBase}_${n}`;
    let toolName = enforceToolNameLimit(proposed);
    // Defensive: if truncation ever causes a collision, disambiguate.
    for (let i = 2; used.has(toolName) && i < 50; i++) {
      toolName = enforceToolNameLimit(`${proposed}_${shortHashHex(`${proposed}:${i}`, 6)}`);
    }
    used.add(toolName);
    out.push({
      toolName,
      operationId: r.operationId,
      method: r.method,
      path: r.path,
      summary: r.summary,
      tags: r.tags,
      parameters: r.parameters,
      requestBody: r.requestBody,
    });
  }
  return out;
}

export function generateTools(doc: OpenApiDocument, operations: OperationMeta[]): McpToolDef[] {
  const tools: McpToolDef[] = [];
  for (const op of operations) {
    const tags = op.tags && op.tags.length ? op.tags.join(", ") : "AstroVisor";
    const title = op.summary || op.operationId;

    const { obj: pathObj, has: hasPath, hasRequired: hasReqPath } = buildParamObject(op.parameters || [], "path", doc);
    const { obj: queryObj, has: hasQuery, hasRequired: hasReqQuery } = buildParamObject(op.parameters || [], "query", doc);
    const bodySchemaRaw = getJsonRequestSchema(op);
    const bodySchema = bodySchemaRaw ? toJsonSchema(bodySchemaRaw, doc) : undefined;

    const props: any = {};
    const required: string[] = [];
    if (hasPath) {
      props.path = pathObj;
      if (hasReqPath) required.push("path");
    }
    if (hasQuery) {
      props.query = queryObj;
      if (hasReqQuery) required.push("query");
    }
    if (bodySchema) {
      props.body = bodySchema;
      if (op.requestBody?.required) required.push("body");
    }

    const inputSchema: any = {
      type: "object",
      properties: props,
      additionalProperties: false,
    };
    if (required.length) inputSchema.required = required;

    tools.push({
      name: op.toolName,
      description: `[${tags}] ${title} (${op.method.toUpperCase()} ${op.path})`,
      inputSchema,
    });
  }
  return tools;
}

export function fillPathTemplate(path: string, pathParams: Record<string, any> | undefined): string {
  return path.replace(/\\{([^}]+)\\}/g, (_, key) => {
    const v = pathParams?.[key];
    if (v === undefined || v === null) throw new Error(`Missing required path param: ${key}`);
    return encodeURIComponent(String(v));
  });
}
