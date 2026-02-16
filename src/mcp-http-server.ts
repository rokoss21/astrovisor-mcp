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

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.post("/mcp", async (req, res) => {
  const { method, params, id } = req.body || {};

  try {
    if (method === "initialize") {
      return res.json({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: "astrovisor-mcp-http", version: "4.2.0" },
        },
      });
    }

    if (method === "notifications/initialized") {
      return res.json({ jsonrpc: "2.0", id, result: {} });
    }

    if (method === "tools/list") {
      const { tools } = await ensureLoaded();
      return res.json({ jsonrpc: "2.0", id, result: { tools } });
    }

    if (method === "tools/call") {
      const args = params?.arguments || {};
      const toolName = params?.name;
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
          return res.json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(out, null, 2) }] } });
        }

        if (toolName === "astrovisor_openapi_get") {
          const operationId = String(args.operationId || "");
          if (!operationId) return res.json({ jsonrpc: "2.0", id, error: { code: -32602, message: "operationId is required" } });
          const ops = state.opsById?.get(operationId) || [];
          if (!ops.length) return res.json({ jsonrpc: "2.0", id, error: { code: -32602, message: `operationId not found: ${operationId}` } });
          if (ops.length > 1) {
            const list = ops.map((op) => ({ operationId: op.operationId, method: op.method.toUpperCase(), path: op.path, summary: op.summary }));
            return res.json({
              jsonrpc: "2.0",
              id,
              result: { content: [{ type: "text", text: JSON.stringify({ multiple: true, operations: list }, null, 2) }] },
            });
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
          return res.json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(meta, null, 2) }] } });
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
          return res.json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(out, null, 2) }] } });
        }

        if (toolName === "astrovisor_result_get") {
          const resultId = String(args.resultId || "").trim();
          if (!resultId) return res.json({ jsonrpc: "2.0", id, error: { code: -32602, message: "resultId is required" } });
          const item = resultStore.get(resultId);
          if (!item) {
            return res.json({
              jsonrpc: "2.0",
              id,
              error: { code: -32602, message: `resultId not found or expired: ${resultId}` },
            });
          }
          const responseOptions = parseResponseOptions(args.response, { view: DEFAULT_RESPONSE_VIEW });
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
          return res.json({ jsonrpc: "2.0", id, result: { content: [{ type: "text", text: JSON.stringify(envelope, null, 2) }] } });
        }

        if (toolName !== "astrovisor_request") {
          return res.json({ jsonrpc: "2.0", id, error: { code: -32602, message: `Tool not found: ${toolName}` } });
        }

        const apiKey = extractApiKey(req);
        if (!apiKey) {
          return res.json({
            jsonrpc: "2.0",
            id,
            error: { code: -32602, message: "API key required (Authorization: Bearer or X-API-Key)." },
          });
        }

        const operationId = String(args.operationId || "");
        if (!operationId) return res.json({ jsonrpc: "2.0", id, error: { code: -32602, message: "operationId is required" } });

        let candidates = state.opsById?.get(operationId) || [];
        if (!candidates.length) return res.json({ jsonrpc: "2.0", id, error: { code: -32602, message: `operationId not found: ${operationId}` } });

        const wantMethod = args.method ? String(args.method).toLowerCase() : undefined;
        const wantPath = args.pathTemplate ? String(args.pathTemplate) : undefined;
        if (wantMethod) candidates = candidates.filter((op) => op.method === wantMethod);
        if (wantPath) candidates = candidates.filter((op) => op.path === wantPath);

        if (candidates.length !== 1) {
          return res.json({
            jsonrpc: "2.0",
            id,
            error: {
              code: -32602,
              message: `operationId is ambiguous; provide method and/or pathTemplate. Matches: ${JSON.stringify(
                candidates.map((op) => ({ method: op.method.toUpperCase(), path: op.path })),
              )}`,
            },
          });
        }

        const op = candidates[0];
        const urlPath = fillPathTemplate(op.path, args.path);
        const client = createApiClient(apiKey);
        const resp = await client.request({ method: op.method, url: urlPath, params: args.query, data: args.body });
        const responseOptions = parseResponseOptions(args.response, { view: DEFAULT_RESPONSE_VIEW });
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
        if (resultId) (envelope as any).next = { tool: "astrovisor_result_get", arguments: { resultId } };
        return res.json({
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text: JSON.stringify(envelope, null, 2) }] },
        });
      }

      const apiKey = extractApiKey(req);
      if (!apiKey) {
        return res.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32602, message: "API key required (Authorization: Bearer or X-API-Key)." },
        });
      }

      const op = state.opsByTool?.get(toolName);
      if (!op) return res.json({ jsonrpc: "2.0", id, error: { code: -32602, message: `Tool not found: ${toolName}` } });

      const urlPath = fillPathTemplate(op.path, args.path);
      const client = createApiClient(apiKey);
      const resp = await client.request({ method: op.method, url: urlPath, params: args.query, data: args.body });
      const responseOptions = parseResponseOptions(undefined, { view: DEFAULT_RESPONSE_VIEW });
      const envelope = serializeForLlm(resp.data, responseOptions, {
        source: "api",
        operationId: op.operationId,
        method: op.method.toUpperCase(),
        path: op.path,
        status: resp.status,
      });

      return res.json({
        jsonrpc: "2.0",
        id,
        result: { content: [{ type: "text", text: JSON.stringify(envelope, null, 2) }] },
      });
    }

    return res.json({ jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } });
  } catch (e: any) {
    const detail = e?.response?.data ?? e?.message ?? String(e);
    return res.json({ jsonrpc: "2.0", id, error: { code: -32603, message: typeof detail === "string" ? detail : JSON.stringify(detail) } });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`AstroVisor MCP HTTP (JSON-RPC) Server v4.2.0 listening on :${PORT} (mode=${TOOL_MODE})`);
});
