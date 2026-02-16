#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import "dotenv/config";

import {
  buildOperationAliasIndex,
  fillPathTemplate,
  generateCompactTools,
  generateOperations,
  generateTools,
  indexOperationsById,
  listOperations,
  listOperationAliases,
  loadOpenApi,
  normalizeOperationAlias,
  searchOperations,
  type McpToolDef,
  type OperationMeta,
} from "./openapi.js";
import { ASTROVISOR_LLM_CONVENTIONS, buildOperationLlmHints, normalizeRequestBodyForOperation } from "./interop.js";
import { InMemoryResultStore, parseResponseOptions, serializeForLlm } from "./serialization.js";

const API_BASE_URL = process.env.ASTROVISOR_URL || process.env.ASTRO_API_BASE_URL || "https://astrovisor.io";
const OPENAPI_URL = process.env.ASTROVISOR_OPENAPI_URL || `${API_BASE_URL.replace(/\/$/, "")}/openapi.json`;
const TOOL_MODE = (process.env.ASTROVISOR_TOOL_MODE || "compact").toLowerCase(); // compact|full
const DEFAULT_RESPONSE_VIEW = process.env.ASTROVISOR_RESPONSE_VIEW || "compact";
const DEFAULT_TOKEN_BUDGET = Number(process.env.ASTROVISOR_DEFAULT_TOKEN_BUDGET || 250_000);
const RESULT_TTL_MS = Number(process.env.ASTROVISOR_RESULT_TTL_MS || 30 * 60 * 1000);
const RESULT_MAX_ENTRIES = Number(process.env.ASTROVISOR_RESULT_MAX_ENTRIES || 128);
const MCP_VERSION = "4.2.3";

function getApiKey(): string {
  return process.env.ASTROVISOR_API_KEY || process.env.ASTRO_API_KEY || "";
}

function createApiClient(apiKey: string) {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
      "Content-Type": "application/json",
      // Support both styles; backend accepts either.
      Authorization: `Bearer ${apiKey}`,
      "X-API-Key": apiKey,
    },
  });
}

function normalizeBodyInput(rawBody: any): any {
  if (typeof rawBody !== "string") return rawBody;
  const trimmed = rawBody.trim();
  if (!trimmed) return undefined;
  if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) return rawBody;
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error("body is a string but not valid JSON. Pass an object or valid JSON string.");
  }
}

const server = new Server(
  { name: "astrovisor-mcp", version: MCP_VERSION },
  { capabilities: { tools: {} } }
);
const resultStore = new InMemoryResultStore(RESULT_TTL_MS, RESULT_MAX_ENTRIES);

let cached: {
  tools: McpToolDef[];
  operations: OperationMeta[];
  opsByTool?: Map<string, OperationMeta>;
  opsById?: Map<string, OperationMeta[]>;
  opAliases?: Map<string, OperationMeta[]>;
} | null = null;

async function ensureLoaded() {
  if (cached) return cached;
  const doc = await loadOpenApi(OPENAPI_URL);
  const operations = generateOperations(doc);
  const opAliases = buildOperationAliasIndex(operations);
  if (TOOL_MODE === "full") {
    const tools = generateTools(doc, operations);
    const opsByTool = new Map<string, OperationMeta>();
    for (const op of operations) opsByTool.set(op.toolName, op);
    cached = { tools, operations, opsByTool, opAliases };
    return cached;
  }

  const tools = generateCompactTools();
  const opsById = indexOperationsById(operations);
  cached = { tools, operations, opsById, opAliases };
  return cached;
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const { tools } = await ensureLoaded();
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params as any;
  const state = await ensureLoaded();

  // Compact toolset: request/search/get
  if (TOOL_MODE !== "full") {
    if (name === "astrovisor_openapi_search") {
      const q = args?.q;
      const tag = args?.tag;
      const limit = args?.limit;
      const found = searchOperations(state.operations, q, tag, limit);
      const out = found.map((op) => ({
        operationId: op.operationId,
        method: op.method.toUpperCase(),
        path: op.path,
        summary: op.summary,
        tags: op.tags || [],
      }));
      return { content: [{ type: "text", text: JSON.stringify(out, null, 2) }] };
    }

    if (name === "astrovisor_openapi_get") {
      const operationId = String(args?.operationId || "");
      if (!operationId) throw new Error("operationId is required");
      const ops = state.opsById?.get(operationId) || state.opAliases?.get(normalizeOperationAlias(operationId)) || [];
      if (!ops.length) throw new Error(`operationId not found: ${operationId}`);
      if (ops.length > 1) {
        const list = ops.map((op) => ({ operationId: op.operationId, method: op.method.toUpperCase(), path: op.path, summary: op.summary }));
        return { content: [{ type: "text", text: JSON.stringify({ multiple: true, operations: list }, null, 2) }] };
      }
      const op = ops[0];
      const meta = {
        operationId: op.operationId,
        method: op.method.toUpperCase(),
        path: op.path,
        summary: op.summary,
        tags: op.tags || [],
        parameters: op.parameters || [],
        requestBody: op.requestBody || undefined,
        requestBodySchema: op.requestBodySchema || undefined,
        aliases: listOperationAliases(op),
        llmHints: buildOperationLlmHints(op),
      };
      return { content: [{ type: "text", text: JSON.stringify(meta, null, 2) }] };
    }

    if (name === "astrovisor_conventions") {
      return { content: [{ type: "text", text: JSON.stringify(ASTROVISOR_LLM_CONVENTIONS, null, 2) }] };
    }

    if (name === "astrovisor_openapi_list") {
      const listed = listOperations(state.operations, {
        tag: args?.tag,
        method: args?.method,
        pathPrefix: args?.pathPrefix,
        offset: args?.offset,
        limit: args?.limit,
      });
      const out = {
        total: listed.total,
        offset: listed.offset,
        limit: listed.limit,
        items: listed.items.map((op) => ({
          operationId: op.operationId,
          method: op.method.toUpperCase(),
          path: op.path,
          summary: op.summary,
          tags: op.tags || [],
        })),
      };
      return { content: [{ type: "text", text: JSON.stringify(out, null, 2) }] };
    }

    if (name === "astrovisor_result_get") {
      const resultId = String(args?.resultId || "").trim();
      if (!resultId) throw new Error("resultId is required");
      const item = resultStore.get(resultId);
      if (!item) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  error: `resultId not found or expired: ${resultId}`,
                  store: resultStore.stats(),
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      const responseOptions = parseResponseOptions(args?.response, { view: DEFAULT_RESPONSE_VIEW, tokenBudget: DEFAULT_TOKEN_BUDGET });
      const envelope = serializeForLlm(item.payload, responseOptions, {
        source: "result_store",
        resultId,
        operationId: item.context?.operationId,
        method: item.context?.method,
        path: item.context?.path,
        status: item.context?.status,
        createdAt: item.context?.createdAt,
      });
      (envelope as any).store = resultStore.stats();
      return { content: [{ type: "text", text: JSON.stringify(envelope, null, 2) }] };
    }

    if (name !== "astrovisor_request") throw new Error(`Unknown tool: ${name}`);

    const apiKey = getApiKey();
    if (!apiKey) {
      return { content: [{ type: "text", text: "API key required: set ASTROVISOR_API_KEY (or ASTRO_API_KEY)." }] };
    }

    const operationId = String(args?.operationId || "");
    if (!operationId) throw new Error("operationId is required");

    let candidates = state.opsById?.get(operationId) || state.opAliases?.get(normalizeOperationAlias(operationId)) || [];
    if (!candidates.length) throw new Error(`operationId not found: ${operationId}`);

    const wantMethod = args?.method ? String(args.method).toLowerCase() : undefined;
    const wantPath = args?.pathTemplate ? String(args.pathTemplate) : undefined;
    if (wantMethod) candidates = candidates.filter((op) => op.method === wantMethod);
    if (wantPath) candidates = candidates.filter((op) => op.path === wantPath);

    if (candidates.length !== 1) {
      const list = candidates.map((op) => ({ method: op.method.toUpperCase(), path: op.path, summary: op.summary }));
      throw new Error(
        `operationId is ambiguous (${candidates.length} matches). Provide method and/or pathTemplate. Matches: ${JSON.stringify(list)}`,
      );
    }

    const op = candidates[0];
    const pathParams = (args && args.path) || undefined;
    const queryParams = (args && args.query) || undefined;
    const normalizedBodyInput = normalizeBodyInput((args && args.body) || undefined);
    const normalized = normalizeRequestBodyForOperation(op, normalizedBodyInput);
    const urlPath = fillPathTemplate(op.path, pathParams);

    try {
      const client = createApiClient(apiKey);
      const resp = await client.request({ method: op.method, url: urlPath, params: queryParams, data: normalized.body });
      const responseOptions = parseResponseOptions(args?.response, { view: DEFAULT_RESPONSE_VIEW, tokenBudget: DEFAULT_TOKEN_BUDGET });
      const shouldStore = args?.response?.store !== false;
      const resultId = shouldStore
        ? resultStore.put(resp.data, {
            operationId: op.operationId,
            method: op.method.toUpperCase(),
            path: op.path,
            status: resp.status,
            createdAt: new Date().toISOString(),
          })
        : undefined;

      const envelope = serializeForLlm(resp.data, responseOptions, {
        source: "api",
        resultId,
        operationId: op.operationId,
        method: op.method.toUpperCase(),
        path: op.path,
        status: resp.status,
      });
      (envelope as any).store = resultStore.stats();
      if (normalized.normalized) (envelope as any).requestNormalization = normalized.notes;
      if (resultId) {
        (envelope as any).next = {
          tool: "astrovisor_result_get",
          arguments: { resultId },
        };
      }
      return { content: [{ type: "text", text: JSON.stringify(envelope, null, 2) }] };
    } catch (err: any) {
      const status = err?.response?.status;
      const detail = err?.response?.data ?? err?.message ?? String(err);
      const pretty = typeof detail === "string" ? detail : JSON.stringify(detail, null, 2);
      return { content: [{ type: "text", text: `API error${status ? ` (${status})` : ""}: ${pretty}` }] };
    }
  }

  // Full toolset: one MCP tool per operation.
  let op = state.opsByTool?.get(name);
  if (!op) {
    const aliasCandidates = state.opAliases?.get(normalizeOperationAlias(name)) || [];
    if (aliasCandidates.length === 1) {
      op = aliasCandidates[0];
    } else if (aliasCandidates.length > 1) {
      throw new Error(
        `Ambiguous tool alias: ${name}. Matches: ${JSON.stringify(
          aliasCandidates.map((x) => ({ toolName: x.toolName, operationId: x.operationId, method: x.method.toUpperCase(), path: x.path })),
        )}`,
      );
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return { content: [{ type: "text", text: "API key required: set ASTROVISOR_API_KEY (or ASTRO_API_KEY)." }] };
  }

  const pathParams = (args && args.path) || undefined;
  const queryParams = (args && args.query) || undefined;
  const normalizedBodyInput = normalizeBodyInput((args && args.body) || undefined);
  const normalized = normalizeRequestBodyForOperation(op, normalizedBodyInput);
  const urlPath = fillPathTemplate(op.path, pathParams);

  try {
    const client = createApiClient(apiKey);
    const resp = await client.request({ method: op.method, url: urlPath, params: queryParams, data: normalized.body });
    const responseOptions = parseResponseOptions(undefined, { view: DEFAULT_RESPONSE_VIEW, tokenBudget: DEFAULT_TOKEN_BUDGET });
    const envelope = serializeForLlm(resp.data, responseOptions, {
      source: "api",
      operationId: op.operationId,
      method: op.method.toUpperCase(),
      path: op.path,
      status: resp.status,
    });
    if (normalized.normalized) (envelope as any).requestNormalization = normalized.notes;
    return { content: [{ type: "text", text: JSON.stringify(envelope, null, 2) }] };
  } catch (err: any) {
    const status = err?.response?.status;
    const detail = err?.response?.data ?? err?.message ?? String(err);
    const pretty = typeof detail === "string" ? detail : JSON.stringify(detail, null, 2);
    return { content: [{ type: "text", text: `API error${status ? ` (${status})` : ""}: ${pretty}` }] };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  const { tools } = await ensureLoaded();
  console.error(`AstroVisor MCP v${MCP_VERSION} ready. Mode=${TOOL_MODE}. OpenAPI: ${OPENAPI_URL}. Tools: ${tools.length}.`);
}

main().catch((e) => {
  console.error("Server error:", e);
  process.exit(1);
});
