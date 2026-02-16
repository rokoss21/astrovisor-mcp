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
- `astrovisor_request` (call any operation by operationId with serialization controls)
- `astrovisor_result_get` (load stored full response by `resultId` and request only needed fragment)

Search also supports common Russian keywords mapping (for example `таро` -> `tarot`, `ленорман` -> `lenormand`).

### Full (advanced)

Set `ASTROVISOR_TOOL_MODE=full` to generate one MCP tool per OpenAPI `operationId`.

Note: this can be too large for Claude Desktop depending on your schema size.

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
- `body`: JSON request body for `POST/PUT/PATCH`
- `response`: output shaping for token efficiency

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

Supported `where` suffix operators:

- `_eq`, `_ne`, `_gt`, `_gte`, `_lt`, `_lte`
- `_in`, `_nin`
- `_contains`, `_startswith`, `_endswith`
- `_exists`, `_regex`

## Local Smoke Test

```bash
ASTROVISOR_URL=https://astrovisor.io npm test
```

## Notes

- The server fetches OpenAPI once at startup and generates the tool list from it.
- You need a valid **dashboard-generated** API key (`pk-...`) to call most `/api/...` endpoints.
