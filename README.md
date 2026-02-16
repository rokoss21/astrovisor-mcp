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

## Tool Mode

### Compact (default)

Claude Desktop has a limited context window. Sending hundreds of tool definitions can cause:

- `Context size exceeds the limit`
- tool definition validation errors

So the default mode exposes a tiny toolset:

- `astrovisor_openapi_search` (find operationIds)
- `astrovisor_openapi_get` (inspect one operation)
- `astrovisor_request` (call any operation by operationId)

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

2) Call it by `operationId`:

```json
{
  "operationId": "SomeOperationId",
  "path": { "paramName": "..." },
  "query": { "q": "..." },
  "body": { "any": "json" }
}
```

- `path`: values for URL templates like `/api/users/{user_id}`
- `query`: URL query string parameters
- `body`: JSON request body for `POST/PUT/PATCH`

## Local Smoke Test

```bash
ASTROVISOR_URL=https://astrovisor.io npm test
```

## Notes

- The server fetches OpenAPI once at startup and generates the tool list from it.
- You need a valid **dashboard-generated** API key (`pk-...`) to call most `/api/...` endpoints.
