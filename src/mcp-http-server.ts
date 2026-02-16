#!/usr/bin/env node
import express from "express";
import cors from "cors";
import axios from "axios";
import "dotenv/config";

import { fillPathTemplate, generateOperations, generateTools, loadOpenApi, type OperationMeta } from "./openapi.js";

const PORT = Number(process.env.MCP_HTTP_PORT || 3001);
const API_BASE_URL = process.env.ASTROVISOR_URL || process.env.ASTRO_API_BASE_URL || "https://astrovisor.io";
const OPENAPI_URL = process.env.ASTROVISOR_OPENAPI_URL || `${API_BASE_URL.replace(/\/$/, "")}/openapi.json`;

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

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
      opsByTool: Map<string, OperationMeta>;
    }
  | null = null;

async function ensureLoaded() {
  if (cached) return cached;
  const doc = await loadOpenApi(OPENAPI_URL);
  const ops = generateOperations(doc);
  const tools = generateTools(doc, ops);
  const opsByTool = new Map<string, OperationMeta>();
  for (const op of ops) opsByTool.set(op.toolName, op);
  cached = { tools, opsByTool };
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
          serverInfo: { name: "astrovisor-mcp-http", version: "4.0.0" },
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
      const apiKey = extractApiKey(req);
      if (!apiKey) {
        return res.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32602, message: "API key required (Authorization: Bearer or X-API-Key)." },
        });
      }

      const { opsByTool } = await ensureLoaded();
      const toolName = params?.name;
      const op = opsByTool.get(toolName);
      if (!op) {
        return res.json({ jsonrpc: "2.0", id, error: { code: -32602, message: `Tool not found: ${toolName}` } });
      }

      const args = params?.arguments || {};
      const urlPath = fillPathTemplate(op.path, args.path);
      const client = createApiClient(apiKey);
      const resp = await client.request({ method: op.method, url: urlPath, params: args.query, data: args.body });

      return res.json({
        jsonrpc: "2.0",
        id,
        result: { content: [{ type: "text", text: JSON.stringify(resp.data, null, 2) }] },
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
  console.log(`AstroVisor MCP HTTP (JSON-RPC) Server v4.0.0 listening on :${PORT}`);
});

