# 🌟 AstroVisor MCP Server (OpenAPI Synced)

AstroVisor MCP server that syncs to the AstroVisor **OpenAPI schema**.

That means when the backend adds new systems/endpoints, this MCP server picks them up automatically (no manual tool mapping).

## Install

```bash
npm install astrovisor-mcp
```

## Claude Desktop Config

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "astrovisor": {
      "command": "npx",
      "args": ["astrovisor-mcp"],
      "env": {
        "ASTROVISOR_API_KEY": "pk-...",
        "ASTROVISOR_URL": "https://astrovisor.io"
      }
    }
  }
}
```

## Environment Variables

- `ASTROVISOR_API_KEY` (required): your AstroVisor API key
- `ASTROVISOR_URL` (optional): API base URL (default: `https://astrovisor.io`)
- `ASTROVISOR_OPENAPI_URL` (optional): override OpenAPI URL (default: `${ASTROVISOR_URL}/openapi.json`)
- `ASTROVISOR_TOOL_MODE` (optional): `compact` (default) or `full`
- `ASTROVISOR_RESPONSE_VIEW` (optional): default response serialization view (`summary`, `compact`, `full`; default `compact`)
- `ASTROVISOR_DEFAULT_TOKEN_BUDGET` (optional): default max serialized response size in bytes when request does not specify `response.tokenBudget` (default `250000`)
- `ASTROVISOR_RESULT_TTL_MS` (optional): in-memory result cache TTL (default `1800000`)
- `ASTROVISOR_RESULT_MAX_ENTRIES` (optional): max cached results (default `128`)

## Tool Mode

### Compact (default)

Claude Desktop has a limited context window. Sending hundreds of tool definitions can cause:

- `Context size exceeds the limit`
- tool definition validation errors

So the default mode exposes a tiny toolset:

- `astrovisor_openapi_search` (find operationIds)
- `astrovisor_openapi_list` (get endpoint list with filters/pagination)
- `astrovisor_openapi_get` (inspect one operation)
- `astrovisor_conventions` (global interop conventions for any LLM client)
- `astrovisor_request` (call any operation by operationId with serialization controls)
- `astrovisor_result_get` (load stored full response by `resultId` and request only needed fragment)

Search also supports common Russian keywords mapping (for example `таро` -> `tarot`, `ленорман` -> `lenormand`).

### Full (advanced)

Set `ASTROVISOR_TOOL_MODE=full` to generate one MCP tool per OpenAPI `operationId`.

Note: this can be too large for Claude Desktop depending on your schema size.

Full mode also accepts legacy aliases in tool calls (for better compatibility with non-Claude clients), for example:

- short operation aliases (`calculate_current_transits`)
- old verb variants (`create_*` <-> `calculate_*`)
- names with or without `astrovisor_` prefix

## Calling The API (Compact Mode)

1) Find the operation you want:

```json
{
  "q": "gene keys",
  "limit": 10
}
```

Or list all Tarot endpoints directly:

```json
{
  "pathPrefix": "/api/tarot",
  "limit": 200
}
```

2) Call it by `operationId`:

```json
{
  "operationId": "SomeOperationId",
  "path": { "paramName": "..." },
  "query": { "q": "..." },
  "body": { "any": "json" },
  "response": {
    "view": "compact",
    "responsePath": "data.items",
    "responseOffset": 0,
    "responseLimit": 20,
    "select": ["id", "date", "strength", "system", "theme"],
    "where": {
      "strength_gte": 0.75,
      "theme_contains": "career"
    },
    "sort": ["-strength", "date"],
    "include": ["items", "meta"],
    "exclude": ["items.0.debug"],
    "maxItems": 50,
    "tokenBudget": 120000,
    "store": true
  }
}
```

- `path`: values for URL templates like `/api/users/{user_id}`
- `query`: URL query string parameters
- `body`: JSON request body for `POST/PUT/PATCH` (object preferred; valid JSON string is auto-parsed)
- body field profiles are auto-normalized across common aliases:
  - core profile: `datetime/latitude/longitude/location/timezone`
  - birth profile: `birth_datetime/birth_latitude/birth_longitude/birth_location/birth_timezone`
- `response`: output shaping for token efficiency

Use `astrovisor_openapi_get` before calling an operation. It now returns:

- `requestBodySchema`
- `aliases`
- `llmHints` with:
  - `requiredBodyFields`
  - `exampleBody`
  - quick parameter instructions

Every `astrovisor_request` response includes metadata and, by default, `resultId`.
Use it to fetch only what you need later:

```json
{
  "resultId": "abc123...",
  "response": {
    "responsePath": "data.items",
    "cursor": "eyJvZmZzZXQiOjEwMH0",
    "responseLimit": 20,
    "select": ["id", "date", "strength", "system"],
    "where": { "strength_gte": 0.8 },
    "sort": "-strength",
    "view": "compact"
  }
}
```

## Precision Retrieval (Universal For All LLMs)

Large AstroVisor payloads are now handled with a consistent envelope:

- `format`: serialization version marker (`astrovisor.serialized.v2`)
- `meta.query.totalBefore/totalMatched/offset/limit/nextCursor`
- `meta.availablePaths`: discoverable paths for targeted follow-up reads
- `summary.source` + `summary.selected`: shape before/after query shaping
- `data`: token-optimized result chunk

`response` supports both flat and nested (`response.query`) selectors:

- `responsePath`: select subtree first
- `select`: field projection
- `where`: filtering with operator suffixes
- `sort`: deterministic ordering (`-field` for desc)
- `cursor` / `responseOffset` / `responseLimit`: pagination
- `tokenBudget`: auto-compact output under byte budget

Compatibility notes:

- `responsePath/responseOffset/responseLimit` are accepted both at `response.*` and `response.query.*`
- `where` accepts either:
  - object form: `{ "tension_score_gte": 19.8 }`
  - clause array form: `[{"path":"tension_score","op":"gte","value":19.8}]`
- always check `meta.pathFound`; if `false`, your `responsePath` is wrong.

Supported `where` suffix operators:

- `_eq`, `_ne`, `_gt`, `_gte`, `_lt`, `_lte`
- `_in`, `_nin`
- `_contains`, `_startswith`, `_endswith`
- `_exists`, `_regex`

## Universal LLM Prompt

Use this prompt for any AI client (Claude, ChatGPT, Gemini, Perplexity, etc.) to work with AstroVisor MCP reliably:

```text
You are an MCP integration assistant for AstroVisor. Work deterministically, minimize token usage, and never guess endpoint shapes.

Goal:
- Resolve user intent to the correct AstroVisor API operation.
- Execute calls via MCP reliably.
- Handle very large responses (especially transits) without context overflow.

Rules:
1. Always start with tools discovery (tools/list) and adapt to available tools.
2. If present, call astrovisor_conventions first and follow it.
3. In compact mode, always resolve operations in this order:
   - astrovisor_openapi_search or astrovisor_openapi_list
   - astrovisor_openapi_get
   - astrovisor_request
4. Never call an operation before reading astrovisor_openapi_get output.
5. Build request body from llmHints.requiredBodyFields and llmHints.exampleBody.
6. Prefer exact required field names. If only alias fields are available, still send them (MCP may normalize), then report normalization.
7. For large responses, default to compact retrieval:
   - view: "compact"
   - store: true
   - tokenBudget: 12000 (or lower if needed)
8. For targeted extraction, use:
   - response.query.responsePath (or responsePath)
   - query.select
   - query.where
   - query.sort
   - query.limit / query.cursor
9. Always inspect metadata:
   - If meta.pathFound=false, stop and retry with a valid path from meta.availablePaths.
   - If meta.truncated=true, continue via astrovisor_result_get with tighter selectors.
10. For transit/yearly analytics, do not pull raw full timeline first:
    - first summary/statistics
    - then paged timeline windows with filters
11. If operation/tool name is unknown, retry with aliases from openapi_get.aliases or search/list again.
12. If an API error occurs, report exact status + message and propose one minimal corrective call.

Default compact call template:
{
  "operationId": "<from openapi_get>",
  "body": { "<required fields only>": "..." },
  "response": {
    "view": "compact",
    "query": {
      "responsePath": "<target path>",
      "select": ["<field1>", "<field2>"],
      "where": { "<field_op>": "<value>" },
      "sort": ["-<field>"],
      "limit": 20
    },
    "tokenBudget": 12000,
    "store": true
  }
}

Result follow-up template:
{
  "resultId": "<meta.resultId>",
  "response": {
    "view": "compact",
    "query": {
      "responsePath": "<narrower path>",
      "cursor": "<meta.query.nextCursor>",
      "select": ["<fields>"],
      "where": { "<field_op>": "<value>" },
      "limit": 20
    },
    "tokenBudget": 12000
  }
}

Output policy:
- Be concise and factual.
- Show what was called, what matched, and why.
- Never claim "endpoint does not exist" before openapi_list/openapi_search verification.
```

## Local Smoke Test

```bash
ASTROVISOR_URL=https://astrovisor.io npm test
```

## Notes

- The server fetches OpenAPI once at startup and generates the tool list from it.
- You need a valid **dashboard-generated** API key (`pk-...`) to call most `/api/...` endpoints.
