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

app.get("/mcp", (_req, res) => {
  res.json({
    name: "AstroVisor MCP HTTP Server",
    version: "4.0.0",
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
    const apiKey = extractApiKey(req);
    if (!apiKey) return res.status(401).json({ error: "API key required (Authorization: Bearer or X-API-Key)." });

    const { opsByTool } = await ensureLoaded();
    const toolName = req.params.toolName;
    const op = opsByTool.get(toolName);
    if (!op) return res.status(404).json({ error: `Tool not found: ${toolName}` });

    const args = (req.body && (req.body.arguments ?? req.body)) || {};
    const urlPath = fillPathTemplate(op.path, args.path);

    const client = createApiClient(apiKey);
    const resp = await client.request({
      method: op.method,
      url: urlPath,
      params: args.query,
      data: args.body,
    });

    res.json({ content: [{ type: "text", text: JSON.stringify(resp.data, null, 2) }] });
  } catch (e: any) {
    const status = e?.response?.status || 500;
    const detail = e?.response?.data ?? e?.message ?? String(e);
    res.status(status).json({ error: detail });
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`AstroVisor MCP HTTP Server v4.0.0 listening on :${PORT}`);
});

