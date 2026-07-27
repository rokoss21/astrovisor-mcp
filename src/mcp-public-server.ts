#!/usr/bin/env node
import express from "express";
import cors from "cors";
import axios from "axios";
import { createHash, randomUUID } from "crypto";
import "dotenv/config";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

const HOST = process.env.MCP_PUBLIC_HTTP_HOST || "127.0.0.1";
const PORT = Number(process.env.MCP_PUBLIC_HTTP_PORT || 3002);
const INTERNAL_MCP_URL = process.env.INTERNAL_MCP_URL || "http://127.0.0.1:3001/mcp";
const API_BASE_URL = (process.env.ASTROVISOR_URL || "http://127.0.0.1:8002").replace(/\/$/, "");
const API_KEY_VALIDATION_PATH =
  process.env.API_KEY_VALIDATION_PATH || "/internal/mcp/validate-api-key";
const API_KEY_VALIDATION_CACHE_MS = Number(process.env.API_KEY_VALIDATION_CACHE_MS || 60_000);
const MCP_INTERNAL_VALIDATION_TOKEN = process.env.MCP_INTERNAL_VALIDATION_TOKEN || "";
const MCP_VERSION = "5.0.0";

if (!MCP_INTERNAL_VALIDATION_TOKEN) {
  throw new Error("MCP_INTERNAL_VALIDATION_TOKEN is required");
}

const app = express();
app.disable("x-powered-by");
app.use(cors({
  origin: true,
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Authorization",
    "Content-Type",
    "Accept",
    "MCP-Protocol-Version",
    "MCP-Session-Id",
    "X-API-Key",
  ],
  exposedHeaders: ["MCP-Session-Id"],
}));
app.use(express.json({ limit: "2mb" }));

const internalClient = axios.create({
  timeout: 65_000,
  headers: { "Content-Type": "application/json" },
});

const validationCache = new Map<string, number>();

function extractClientApiKey(req: express.Request): string {
  const authorization = req.headers.authorization;
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7).trim();
  const xApiKey = req.headers["x-api-key"];
  return typeof xApiKey === "string" ? xApiKey.trim() : "";
}

function fingerprintApiKey(apiKey: string): string {
  return createHash("sha256").update(apiKey).digest("hex");
}

function cleanupValidationCache(now: number) {
  for (const [fingerprint, expiresAt] of validationCache.entries()) {
    if (expiresAt <= now) validationCache.delete(fingerprint);
  }
}

async function validateClientApiKey(apiKey: string): Promise<boolean> {
  const now = Date.now();
  cleanupValidationCache(now);
  const fingerprint = fingerprintApiKey(apiKey);
  if ((validationCache.get(fingerprint) || 0) > now) return true;

  try {
    const response = await axios.post(
      `${API_BASE_URL}${API_KEY_VALIDATION_PATH}`,
      { api_key: apiKey },
      {
        timeout: 10_000,
        headers: {
          "Content-Type": "application/json",
          "X-Internal-MCP-Token": MCP_INTERNAL_VALIDATION_TOKEN,
        },
        validateStatus: () => true,
      },
    );
    if (response.status < 200 || response.status >= 300 || response.data?.valid !== true) {
      return false;
    }
    validationCache.set(fingerprint, now + API_KEY_VALIDATION_CACHE_MS);
    return true;
  } catch {
    throw new Error("AstroVisor API key validation is temporarily unavailable");
  }
}

async function callInternalRpc(method: string, params: Record<string, any>, apiKey: string): Promise<any> {
  const response = await internalClient.post(
    INTERNAL_MCP_URL,
    {
      jsonrpc: "2.0",
      id: randomUUID(),
      method,
      params,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-API-Key": apiKey,
      },
    },
  );

  if (response.data?.error) {
    const code = Number(response.data.error.code);
    throw new McpError(
      Number.isFinite(code) ? code : ErrorCode.InternalError,
      String(response.data.error.message || "Internal MCP adapter error"),
    );
  }

  return response.data?.result;
}

function createPublicMcpServer(apiKey: string): Server {
  const server = new Server(
    { name: "astrovisor-mcp", version: MCP_VERSION },
    {
      capabilities: { tools: { listChanged: false } },
      instructions:
        "Use astrovisor_openapi_search/get to discover operations, then astrovisor_request. " +
        "All calculation calls are authorized with the caller's AstroVisor API key.",
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const result = await callInternalRpc("tools/list", {}, apiKey);
    return { tools: result?.tools || [] };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const result = await callInternalRpc(
      "tools/call",
      {
        name: request.params.name,
        arguments: request.params.arguments || {},
      },
      apiKey,
    );
    return result;
  });

  return server;
}

app.get("/health", async (_req, res) => {
  try {
    const response = await axios.get(INTERNAL_MCP_URL.replace(/\/mcp$/, "/health"), {
      timeout: 10_000,
    });
    return res.json({
      status: response.data?.status === "ok" ? "ok" : "unavailable",
      version: MCP_VERSION,
      transport: "streamable-http",
      authentication: "astrovisor-api-key",
      internal: {
        openapi: response.data?.openapi,
        operations: response.data?.operations,
        tools: response.data?.tools,
      },
    });
  } catch {
    return res.status(503).json({
      status: "unavailable",
      version: MCP_VERSION,
      transport: "streamable-http",
    });
  }
});

app.post("/mcp", async (req, res) => {
  const apiKey = extractClientApiKey(req);
  if (!apiKey) {
    res.setHeader("WWW-Authenticate", 'Bearer realm="AstroVisor MCP"');
    return res.status(401).json({ error: "AstroVisor API key required" });
  }

  try {
    if (!(await validateClientApiKey(apiKey))) {
      res.setHeader("WWW-Authenticate", 'Bearer realm="AstroVisor MCP", error="invalid_token"');
      return res.status(401).json({ error: "Invalid AstroVisor API key" });
    }
  } catch {
    return res.status(503).json({ error: "AstroVisor API key validation is temporarily unavailable" });
  }

  const server = createPublicMcpServer(apiKey);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on("close", () => {
    void transport.close();
    void server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Public MCP request failed:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        id: null,
        error: { code: ErrorCode.InternalError, message: "Internal server error" },
      });
    }
  }
});

app.get("/mcp", (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    id: null,
    error: { code: -32000, message: "Method not allowed in stateless mode" },
  });
});

app.delete("/mcp", (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    id: null,
    error: { code: -32000, message: "Method not allowed in stateless mode" },
  });
});

app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof SyntaxError) {
    return res.status(400).json({
      jsonrpc: "2.0",
      id: null,
      error: { code: ErrorCode.ParseError, message: "Invalid JSON" },
    });
  }
  return res.status(500).json({
    jsonrpc: "2.0",
    id: null,
    error: { code: ErrorCode.InternalError, message: "Internal server error" },
  });
});

app.listen(PORT, HOST, () => {
  console.log(
    `AstroVisor public MCP v${MCP_VERSION} listening on http://${HOST}:${PORT} ` +
    "(transport=streamable-http, auth=astrovisor-api-key)",
  );
});
