import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const serverUrl = process.env.MCP_URL;
const apiKey = process.env.ASTROVISOR_API_KEY;
const secondaryApiKey = process.env.ASTROVISOR_SECONDARY_API_KEY;

if (!serverUrl || !apiKey) {
  throw new Error("MCP_URL and ASTROVISOR_API_KEY are required");
}

const transport = new StreamableHTTPClientTransport(new URL(serverUrl), {
  requestInit: {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-API-Key": apiKey,
    },
  },
});

const client = new Client(
  { name: "astrovisor-production-e2e", version: "1.0.0" },
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
      name: "Remote MCP E2E",
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
      name: "Remote MCP E2E",
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

  let resultIsolation = "not-tested";
  if (secondaryApiKey) {
    const secondaryTransport = new StreamableHTTPClientTransport(new URL(serverUrl), {
      requestInit: {
        headers: {
          Authorization: `Bearer ${secondaryApiKey}`,
          "X-API-Key": secondaryApiKey,
        },
      },
    });
    const secondaryClient = new Client(
      { name: "astrovisor-production-e2e-secondary", version: "1.0.0" },
      { capabilities: {} },
    );
    try {
      await secondaryClient.connect(secondaryTransport);
      try {
        await secondaryClient.callTool({
          name: "astrovisor_result_get",
          arguments: {
            resultId,
            response: { view: "summary", tokenBudget: 1000 },
          },
        });
        throw new Error("Stored result was accessible with a different API key");
      } catch (error) {
        if (String(error).includes("Stored result was accessible")) throw error;
        if (!/not found|expired/i.test(String(error))) {
          throw new Error(`Unexpected result-isolation error: ${String(error)}`);
        }
        resultIsolation = "enforced";
      }
    } finally {
      await secondaryTransport.close();
    }
  }

  console.log(JSON.stringify({
    connected: true,
    transport: "streamable-http",
    serverUrl,
    tools: toolNames,
    metadata: {
      operationId: natalMetadata.operationId,
      method: natalMetadata.method,
      path: natalMetadata.path,
    },
    calls: {
      natal: {
        operationId: natal.meta.operationId,
        status: natal.meta.status,
        sourceBytes: natal.meta.sourceBytes,
        outputBytes: natal.meta.outputBytes,
        truncated: natal.meta.truncated,
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
    resultIsolation,
  }));
} finally {
  await transport.close();
}
