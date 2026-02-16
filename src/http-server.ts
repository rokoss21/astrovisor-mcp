#!/usr/bin/env node
import express from "express";
import cors from "cors";
import axios from "axios";
import "dotenv/config";

import {
  fillPathTemplate,
  generateCompactTools,
  generateOperations,
  generateTools,
  indexOperationsById,
  listOperations,
  loadOpenApi,
  searchOperations,
  type OperationMeta,
} from "./openapi.js";
import { InMemoryResultStore, parseResponseOptions, serializeForLlm } from "./serialization.js";

const PORT = Number(process.env.MCP_HTTP_PORT || 3001);
const API_BASE_URL = process.env.ASTROVISOR_URL || process.env.ASTRO_API_BASE_URL || "https://astrovisor.io";
const OPENAPI_URL = process.env.ASTROVISOR_OPENAPI_URL || `${API_BASE_URL.replace(/\/$/, "")}/openapi.json`;
const TOOL_MODE = (process.env.ASTROVISOR_TOOL_MODE || "compact").toLowerCase(); // compact|full
const DEFAULT_RESPONSE_VIEW = process.env.ASTROVISOR_RESPONSE_VIEW || "compact";
const DEFAULT_TOKEN_BUDGET = Number(process.env.ASTROVISOR_DEFAULT_TOKEN_BUDGET || 250_000);
const RESULT_TTL_MS = Number(process.env.ASTROVISOR_RESULT_TTL_MS || 30 * 60 * 1000);
const RESULT_MAX_ENTRIES = Number(process.env.ASTROVISOR_RESULT_MAX_ENTRIES || 128);

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
const resultStore = new InMemoryResultStore(RESULT_TTL_MS, RESULT_MAX_ENTRIES);

function extractApiKey(req: express.Request): string {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7);
  const x = req.headers["x-api-key"];
  if (typeof x === "string" && x) return x;
  if (typeof req.query.api_key === "string" && req.query.api_key) return req.query.api_key;
  if (req.body && typeof req.body.api_key === "string" && req.body.api_key) return req.body.api_key;
  return process.env.ASTROVISOR_API_KEY || process.env.ASTRO_API_KEY || "";
}

function createApiClient(apiKey: string) {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
      "Content-Type": "application/json",
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

let cached:
  | {
      tools: any[];
      operations: OperationMeta[];
      opsByTool?: Map<string, OperationMeta>;
      opsById?: Map<string, OperationMeta[]>;
    }
  | null = null;

async function ensureLoaded() {
  if (cached) return cached;
  const doc = await loadOpenApi(OPENAPI_URL);
  const operations = generateOperations(doc);

  if (TOOL_MODE === "full") {
    const tools = generateTools(doc, operations);
    const opsByTool = new Map<string, OperationMeta>();
    for (const op of operations) opsByTool.set(op.toolName, op);
    cached = { tools, operations, opsByTool };
    return cached;
  }

  const tools = generateCompactTools();
  const opsById = indexOperationsById(operations);
  cached = { tools, operations, opsById };
  return cached;
}

app.get("/mcp", (_req, res) => {
  res.json({
    name: "AstroVisor MCP HTTP Server",
    version: "4.2.2",
    mode: TOOL_MODE,
    openapi: OPENAPI_URL,
    endpoints: {
      tools: "/mcp/tools",
      call: "/mcp/tools/:toolName",
      health: "/mcp/health",
    },
  });
});

app.get("/mcp/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/mcp/tools", async (_req, res) => {
  try {
    const { tools } = await ensureLoaded();
    res.json({ tools });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || String(e) });
  }
});

app.post("/mcp/tools/:toolName", async (req, res) => {
  try {
    const toolName = req.params.toolName;
    const args = (req.body && (req.body.arguments ?? req.body)) || {};
    const state = await ensureLoaded();

    if (TOOL_MODE !== "full") {
      if (toolName === "astrovisor_openapi_search") {
        const found = searchOperations(state.operations, args.q, args.tag, args.limit);
        const out = found.map((op) => ({
          operationId: op.operationId,
          method: op.method.toUpperCase(),
          path: op.path,
          summary: op.summary,
          tags: op.tags || [],
        }));
        return res.json({ content: [{ type: "text", text: JSON.stringify(out, null, 2) }] });
      }

      if (toolName === "astrovisor_openapi_get") {
        const operationId = String(args.operationId || "");
        if (!operationId) return res.status(400).json({ error: "operationId is required" });
        const ops = state.opsById?.get(operationId) || [];
        if (!ops.length) return res.status(404).json({ error: `operationId not found: ${operationId}` });
        if (ops.length > 1) {
          const list = ops.map((op) => ({ operationId: op.operationId, method: op.method.toUpperCase(), path: op.path, summary: op.summary }));
          return res.json({ content: [{ type: "text", text: JSON.stringify({ multiple: true, operations: list }, null, 2) }] });
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
        };
        return res.json({ content: [{ type: "text", text: JSON.stringify(meta, null, 2) }] });
      }

      if (toolName === "astrovisor_openapi_list") {
        const listed = listOperations(state.operations, {
          tag: args.tag,
          method: args.method,
          pathPrefix: args.pathPrefix,
          offset: args.offset,
          limit: args.limit,
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
        return res.json({ content: [{ type: "text", text: JSON.stringify(out, null, 2) }] });
      }

      if (toolName === "astrovisor_result_get") {
        const resultId = String(args.resultId || "").trim();
        if (!resultId) return res.status(400).json({ error: "resultId is required" });
        const item = resultStore.get(resultId);
        if (!item) return res.status(404).json({ error: `resultId not found or expired: ${resultId}`, store: resultStore.stats() });

        const responseOptions = parseResponseOptions(args.response, { view: DEFAULT_RESPONSE_VIEW, tokenBudget: DEFAULT_TOKEN_BUDGET });
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
        return res.json({ content: [{ type: "text", text: JSON.stringify(envelope, null, 2) }] });
      }

      if (toolName !== "astrovisor_request") return res.status(404).json({ error: `Tool not found: ${toolName}` });

      const apiKey = extractApiKey(req);
      if (!apiKey) return res.status(401).json({ error: "API key required (Authorization: Bearer or X-API-Key)." });

      const operationId = String(args.operationId || "");
      if (!operationId) return res.status(400).json({ error: "operationId is required" });

      let candidates = state.opsById?.get(operationId) || [];
      if (!candidates.length) return res.status(404).json({ error: `operationId not found: ${operationId}` });

      const wantMethod = args.method ? String(args.method).toLowerCase() : undefined;
      const wantPath = args.pathTemplate ? String(args.pathTemplate) : undefined;
      if (wantMethod) candidates = candidates.filter((op) => op.method === wantMethod);
      if (wantPath) candidates = candidates.filter((op) => op.path === wantPath);

      if (candidates.length !== 1) {
        return res.status(400).json({
          error: "operationId is ambiguous; provide method and/or pathTemplate",
          matches: candidates.map((op) => ({ method: op.method.toUpperCase(), path: op.path, summary: op.summary })),
        });
      }

      const op = candidates[0];
      const urlPath = fillPathTemplate(op.path, args.path);
      const client = createApiClient(apiKey);
      const body = normalizeBodyInput(args.body);
      const resp = await client.request({ method: op.method, url: urlPath, params: args.query, data: body });
      const responseOptions = parseResponseOptions(args.response, { view: DEFAULT_RESPONSE_VIEW, tokenBudget: DEFAULT_TOKEN_BUDGET });
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
      if (resultId) {
        (envelope as any).next = { tool: "astrovisor_result_get", arguments: { resultId } };
      }
      return res.json({ content: [{ type: "text", text: JSON.stringify(envelope, null, 2) }] });
    }

    const apiKey = extractApiKey(req);
    if (!apiKey) return res.status(401).json({ error: "API key required (Authorization: Bearer or X-API-Key)." });

    const op = state.opsByTool?.get(toolName);
    if (!op) return res.status(404).json({ error: `Tool not found: ${toolName}` });
    const urlPath = fillPathTemplate(op.path, args.path);
    const client = createApiClient(apiKey);
    const body = normalizeBodyInput(args.body);
    const resp = await client.request({ method: op.method, url: urlPath, params: args.query, data: body });
    const responseOptions = parseResponseOptions(undefined, { view: DEFAULT_RESPONSE_VIEW, tokenBudget: DEFAULT_TOKEN_BUDGET });
    const envelope = serializeForLlm(resp.data, responseOptions, {
      source: "api",
      operationId: op.operationId,
      method: op.method.toUpperCase(),
      path: op.path,
      status: resp.status,
    });
    return res.json({ content: [{ type: "text", text: JSON.stringify(envelope, null, 2) }] });
  } catch (e: any) {
    const status = e?.response?.status || 500;
    const detail = e?.response?.data ?? e?.message ?? String(e);
    res.status(status).json({ error: detail });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`AstroVisor MCP HTTP Server v4.2.2 listening on :${PORT} (mode=${TOOL_MODE})`);
});
