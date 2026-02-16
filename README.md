# 🌟 AstroVisor MCP Server (OpenAPI Synced)

AstroVisor MCP server that **auto-generates tools from the AstroVisor OpenAPI schema**.

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

## Tool Naming

Tools are generated from OpenAPI `operationId`:

`astrovisor_<operationId>`

If two operationIds sanitize to the same name, a numeric suffix is added: `..._2`, `..._3`, etc.

## Tool Arguments Format

All tools share the same argument envelope (to avoid name collisions):

```json
{
  "path": { "paramName": "..." },
  "query": { "q": "..." },
  "body": { "any": "json" }
}
```

- `path`: values for URL templates like `/api/users/{user_id}`
- `query`: URL query string parameters
- `body`: JSON request body for `POST/PUT/PATCH`

If an operation does not have `path`/`query`/`body`, that property is omitted from the schema.

## Local Smoke Test

```bash
ASTROVISOR_URL=https://astrovisor.io npm test
```

## Notes

- The server fetches OpenAPI once at startup and generates the tool list from it.
- You need a valid **dashboard-generated** API key (`pk-...`) to call most `/api/...` endpoints.

