import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  StdioClientTransport,
  getDefaultEnvironment,
} from "@modelcontextprotocol/sdk/client/stdio.js";

const apiKey = process.env.ASTROVISOR_API_KEY;
const apiUrl = process.env.ASTROVISOR_URL || "https://astrovisor.io";
const packageName = process.env.MCP_PACKAGE || "astrovisor-mcp@4.3.0";
const command = process.env.MCP_COMMAND || "npx";
const commandArgs = process.env.MCP_ARGS_JSON
  ? JSON.parse(process.env.MCP_ARGS_JSON)
  : ["--yes", `--package=${packageName}`, "--", "astrovisor-mcp"];

if (!apiKey) {
  throw new Error("ASTROVISOR_API_KEY is required");
}

const transport = new StdioClientTransport({
  command,
  args: commandArgs,
  env: {
    ...getDefaultEnvironment(),
    ASTROVISOR_API_KEY: apiKey,
    ASTROVISOR_URL: apiUrl,
    ASTROVISOR_OPENAPI_URL: `${apiUrl.replace(/\/$/, "")}/openapi.json`,
    ASTROVISOR_TOOL_MODE: "compact",
    ASTROVISOR_RESPONSE_VIEW: "compact",
    ASTROVISOR_DEFAULT_TOKEN_BUDGET: "250000",
    ...(process.env.ASTROVISOR_SKILL_HOME
      ? { ASTROVISOR_SKILL_HOME: process.env.ASTROVISOR_SKILL_HOME }
      : {}),
    ...(process.env.ASTROVISOR_MCP_PACKAGE
      ? { ASTROVISOR_MCP_PACKAGE: process.env.ASTROVISOR_MCP_PACKAGE }
      : {}),
  },
  stderr: "pipe",
});

const stderrLines = [];
transport.stderr?.on("data", (chunk) => {
  const text = String(chunk).trim();
  if (text) stderrLines.push(text);
});

const client = new Client(
  { name: "astrovisor-claude-desktop-e2e", version: "1.0.0" },
  { capabilities: {} },
);

function firstText(result) {
  const text = result.content?.find((item) => item.type === "text")?.text;
  if (!text) throw new Error("MCP result did not contain a text block");
  return text;
}

async function callEnvelope(operationId, args = {}) {
  const result = await client.callTool({
    name: "astrovisor_request",
    arguments: {
      operationId,
      ...args,
    },
  });
  const text = firstText(result);
  if (text.startsWith("API error")) throw new Error(text);
  const envelope = JSON.parse(text);
  if (envelope.meta?.status !== 200) {
    throw new Error(`Unexpected ${operationId} response: ${text}`);
  }
  return envelope;
}

try {
  await client.connect(transport);

  const tools = await client.listTools();
  const toolNames = tools.tools.map((tool) => tool.name);
  if (toolNames.length !== 6 || !toolNames.includes("astrovisor_request")) {
    throw new Error(`Unexpected tool list: ${JSON.stringify(toolNames)}`);
  }

  const metadata = await client.callTool({
    name: "astrovisor_openapi_get",
    arguments: { operationId: "calculate_natal" },
  });
  const natalMetadata = JSON.parse(firstText(metadata));

  const natal = await callEnvelope("calculate_natal", {
    body: {
      name: "Claude Desktop MCP E2E",
      datetime: "1990-05-15T14:30:00",
      latitude: 55.7558,
      longitude: 37.6176,
      location: "Moscow, Russia",
      timezone: "Europe/Moscow",
    },
    response: {
      view: "summary",
      tokenBudget: 2500,
      store: true,
    },
  });

  const transits = await callEnvelope("calculate_current_transits", {
    body: {
      name: "Claude Desktop MCP E2E",
      datetime: "1990-05-15T14:30:00",
      latitude: 55.7558,
      longitude: 37.6176,
      location: "Moscow, Russia",
      timezone: "Europe/Moscow",
      target_date: "2026-07-27T12:00:00",
    },
    response: {
      view: "summary",
      tokenBudget: 2500,
      store: false,
    },
  });

  const tarot = await callEnvelope("get_daily_card", {
    query: { deck_type: "rws" },
    response: {
      view: "full",
      tokenBudget: 2500,
      store: false,
    },
  });

  const resultId = natal.meta?.resultId;
  if (!resultId) throw new Error("Natal response did not include resultId");
  const stored = await client.callTool({
    name: "astrovisor_result_get",
    arguments: {
      resultId,
      response: {
        view: "summary",
        responsePath: "planets",
        tokenBudget: 2000,
      },
    },
  });
  const storedEnvelope = JSON.parse(firstText(stored));
  if (storedEnvelope.meta?.source !== "result_store") {
    throw new Error("Stored result could not be retrieved");
  }

  console.log(JSON.stringify({
    connected: true,
    transport: "stdio",
    command: [command, ...commandArgs].join(" "),
    apiUrl,
    serverStderr: stderrLines,
    tools: toolNames,
    metadata: {
      operationId: natalMetadata.operationId,
      method: natalMetadata.method,
      path: natalMetadata.path,
    },
    calls: {
      natal: {
        status: natal.meta.status,
        operationId: natal.meta.operationId,
        sourceBytes: natal.meta.sourceBytes,
        outputBytes: natal.meta.outputBytes,
        resultStored: true,
      },
      transits: {
        status: transits.meta.status,
        operationId: transits.meta.operationId,
      },
      tarotDaily: {
        status: tarot.meta.status,
        operationId: tarot.meta.operationId,
      },
      resultGet: {
        source: storedEnvelope.meta.source,
        operationId: storedEnvelope.meta.operationId,
      },
    },
  }));
} finally {
  await transport.close();
}
