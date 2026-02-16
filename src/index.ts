#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import axios from "axios";
import "dotenv/config";

import { fillPathTemplate, generateOperations, generateTools, loadOpenApi, type McpToolDef, type OperationMeta } from "./openapi.js";

const API_BASE_URL = process.env.ASTROVISOR_URL || process.env.ASTRO_API_BASE_URL || "https://astrovisor.io";
const API_KEY = process.env.ASTROVISOR_API_KEY || process.env.ASTRO_API_KEY || "";
const OPENAPI_URL = process.env.ASTROVISOR_OPENAPI_URL || `${API_BASE_URL.replace(/\/$/, "")}/openapi.json`;

if (!API_KEY) {
  throw new Error("ASTROVISOR_API_KEY or ASTRO_API_KEY environment variable is required");
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    // Support both styles; backend accepts either.
    Authorization: `Bearer ${API_KEY}`,
    "X-API-Key": API_KEY,
  },
});

const server = new Server(
  { name: "astrovisor-mcp", version: "4.0.0" },
  { capabilities: { tools: {} } }
);

let cached: {
  tools: McpToolDef[];
  opsByTool: Map<string, OperationMeta>;
} | null = null;

async function ensureLoaded() {
  if (cached) return cached;
  const doc = await loadOpenApi(OPENAPI_URL);
  const operations = generateOperations(doc);
  const tools = generateTools(doc, operations);
  const opsByTool = new Map<string, OperationMeta>();
  for (const op of operations) opsByTool.set(op.toolName, op);
  cached = { tools, opsByTool };
  return cached;
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const { tools } = await ensureLoaded();
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params as any;
  const { opsByTool } = await ensureLoaded();
  const op = opsByTool.get(name);
  if (!op) {
    throw new Error(`Unknown tool: ${name}`);
  }

  const pathParams = (args && args.path) || undefined;
  const queryParams = (args && args.query) || undefined;
  const body = (args && args.body) || undefined;

  const urlPath = fillPathTemplate(op.path, pathParams);

  try {
    const resp = await apiClient.request({
      method: op.method,
      url: urlPath,
      params: queryParams,
      data: body,
    });

    // Some endpoints return {success, data}, others return raw JSON.
    const data = resp.data;
    const pretty = JSON.stringify(data, null, 2);
    return { content: [{ type: "text", text: pretty }] };
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
  console.error(`AstroVisor MCP v4.0.0 ready. OpenAPI: ${OPENAPI_URL}. Tools: ${tools.length}.`);
}

main().catch((e) => {
  console.error("Server error:", e);
  process.exit(1);
});
