# AstroVisor MCP

[![npm version](https://img.shields.io/npm/v/astrovisor-mcp.svg)](https://www.npmjs.com/package/astrovisor-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933.svg)](package.json)

AstroVisor MCP connects MCP-compatible AI clients to the complete AstroVisor API.
It supports local stdio and production Streamable HTTP, discovers operations from
the live OpenAPI document, and returns large calculation results through a compact,
queryable response layer.

This repository is the protocol and server layer. For reusable personal workflows,
private people profiles, interactive credential setup, and safe AI request
construction, install the separate
[AstroVisor Skill](https://github.com/rokoss21/astrovisor-skill).

```text
AstroVisor Skill (optional workflow layer)
    ↓
AstroVisor MCP (this repository)
live OpenAPI · authentication · API calls · result retrieval
    ↓
AstroVisor API
```

## Highlights

- Six compact MCP tools covering 456 current API operations.
- Live OpenAPI discovery instead of hundreds of hardcoded tool definitions.
- Stdio support for Claude Desktop, Claude Code, Codex, and other local clients.
- Authenticated Streamable HTTP at `https://mcp.astrovisor.io/`.
- Exact `operationId`, path, query, and JSON body serialization.
- Common core and `birth_*` request-profile normalization.
- Compact, full, and summary response views with token budgets.
- Filtering, projection, sorting, pagination, and targeted path retrieval.
- Temporary result storage isolated by caller API key.
- Optional full mode with one generated tool per OpenAPI operation.

Capabilities include natal astrology, transits, progressions, solar returns,
synastry, compatibility, Jyotish, BaZi, Human Design, Gene Keys, numerology,
Tarot, Lenormand, astrocartography, horary, electional, and every other operation
published by the live AstroVisor OpenAPI schema.

## Choose your integration

| Need | Recommended setup |
| --- | --- |
| Personal assistant with reusable profiles | [AstroVisor Skill](https://github.com/rokoss21/astrovisor-skill) |
| Cloud or generic MCP client | Remote Streamable HTTP |
| Claude Desktop or local stdio client | `npx astrovisor-mcp` |
| Backend/operator deployment | Internal JSON-RPC adapter plus public gateway |
| Direct Node.js dependency | `npm install astrovisor-mcp` |

Requirements:

- Node.js 20 or newer for local stdio;
- an AstroVisor dashboard API key beginning with `pk-`;
- an MCP client supporting stdio or Streamable HTTP.

## Quick start

### Remote Streamable HTTP

Endpoint:

```text
https://mcp.astrovisor.io/
```

Authenticate with either:

```http
Authorization: Bearer pk-...
```

or:

```http
X-API-Key: pk-...
```

The compatibility endpoint `https://mcp.astrovisor.io/mcp` is also available.
Health:

```text
https://mcp.astrovisor.io/health
```

### Local stdio

Run without a global installation:

```bash
ASTROVISOR_API_KEY="pk-..." \
npx --yes --package=astrovisor-mcp@5.0.0 -- astrovisor-mcp
```

Or install globally:

```bash
npm install --global astrovisor-mcp@5.0.0
ASTROVISOR_API_KEY="pk-..." astrovisor-mcp
```

For personal use, prefer the private launcher included in
[AstroVisor Skill](https://github.com/rokoss21/astrovisor-skill). It avoids putting
the key in MCP configuration or shell history.

## Client configuration

### Codex and ChatGPT desktop

Remote HTTP using an environment variable:

```toml
[mcp_servers.astrovisor]
url = "https://mcp.astrovisor.io/"
bearer_token_env_var = "ASTROVISOR_API_KEY"
startup_timeout_sec = 30
tool_timeout_sec = 120
```

Codex CLI, the IDE extension, and ChatGPT desktop share Codex MCP configuration on
the same host. Verify with:

```bash
codex mcp list
```

In the interactive client, use `/mcp`.

For profile-aware workflows and generated secret-free configuration, follow the
[AstroVisor Skill Codex setup](https://github.com/rokoss21/astrovisor-skill#codex-and-chatgpt-desktop).

Official documentation:
[Codex MCP](https://learn.chatgpt.com/docs/extend/mcp).

### Claude Code

Remote HTTP:

```bash
claude mcp add --transport http --scope user astrovisor \
  https://mcp.astrovisor.io/ \
  --header "Authorization: Bearer pk-..."
```

Local stdio:

```bash
claude mcp add --transport stdio --scope user \
  --env ASTROVISOR_API_KEY=pk-... \
  astrovisor -- \
  npx --yes --package=astrovisor-mcp@5.0.0 -- astrovisor-mcp
```

Verify:

```bash
claude mcp get astrovisor
claude mcp list
```

Remote HTTP is the preferred transport for a cloud-hosted server. For personal
credentials, the
[AstroVisor Skill launcher](https://github.com/rokoss21/astrovisor-skill#claude-code)
keeps the key outside Claude configuration and shell history.

Official documentation:
[Claude Code MCP](https://code.claude.com/docs/en/mcp).

### Claude Desktop

Direct stdio configuration:

```json
{
  "mcpServers": {
    "astrovisor": {
      "command": "npx",
      "args": [
        "--yes",
        "--package=astrovisor-mcp@5.0.0",
        "--",
        "astrovisor-mcp"
      ],
      "env": {
        "ASTROVISOR_API_KEY": "pk-...",
        "ASTROVISOR_URL": "https://astrovisor.io",
        "ASTROVISOR_TOOL_MODE": "compact"
      }
    }
  }
}
```

Restart Claude Desktop after changing `claude_desktop_config.json`.

For a configuration with no embedded API key, use the
[AstroVisor Skill Claude Desktop setup](https://github.com/rokoss21/astrovisor-skill#claude-desktop).

## Compact toolset

Compact mode is the default. It keeps tool definitions small while preserving
access to every live API operation.

| Tool | Purpose |
| --- | --- |
| `astrovisor_conventions` | Read global request, alias, and response conventions |
| `astrovisor_openapi_search` | Search operations by intent or keyword |
| `astrovisor_openapi_list` | List operations by tags, path, method, or page |
| `astrovisor_openapi_get` | Inspect one canonical operation and request schema |
| `astrovisor_request` | Execute any operation by `operationId` |
| `astrovisor_result_get` | Retrieve a stored result or a narrow fragment |

The correct discovery chain is:

```text
astrovisor_conventions
    ↓
astrovisor_openapi_search / astrovisor_openapi_list
    ↓
astrovisor_openapi_get
    ↓
astrovisor_request
    ↓
astrovisor_result_get (when a stored or narrower result is needed)
```

Never guess an operation id or request body. `astrovisor_openapi_get` returns:

- canonical `operationId`;
- HTTP method and path;
- path and query parameters;
- `requestBodySchema`;
- aliases;
- required body fields;
- an LLM-oriented example body.

## Request contract

Call `astrovisor_request` with this outer envelope:

```json
{
  "operationId": "<canonical operation id from astrovisor_openapi_get>",
  "path": {},
  "query": {},
  "body": {},
  "response": {
    "view": "compact",
    "tokenBudget": 12000,
    "store": true
  }
}
```

Rules:

- put URL-template variables only in `path`;
- put query-string values only in `query`;
- put the API JSON request only in `body`;
- preserve booleans, numbers, arrays, and objects as JSON types;
- do not wrap `body` in `data`, `payload`, or `request` unless the live schema
  requires it;
- do not send empty strings as substitutes for required fields;
- use the live schema when it differs from examples or cached knowledge.

The MCP normalizes common aliases between:

```text
datetime, latitude, longitude, location, timezone
```

and:

```text
birth_datetime, birth_latitude, birth_longitude,
birth_location, birth_timezone
```

Normalization is a compatibility feature, not a reason to skip live schema
inspection.

For a strict personal and multi-person workflow, use the
[AstroVisor Skill request contract](https://github.com/rokoss21/astrovisor-skill/blob/main/astrovisor/references/request-contract.md).

## Large results and precision retrieval

Every compact response uses the `astrovisor.serialized.v2` envelope and can include:

- `meta.query.totalBefore`, `totalMatched`, `offset`, `limit`, and `nextCursor`;
- `meta.availablePaths` for discoverable follow-up paths;
- `meta.pathFound` for path validation;
- `meta.truncated` when additional retrieval is appropriate;
- `summary.source` and `summary.selected`;
- a temporary `resultId`;
- token-optimized `data`.

Response controls:

| Field | Purpose |
| --- | --- |
| `responsePath` | Select a subtree before other processing |
| `select` | Project specific fields |
| `where` | Filter using field/operator expressions |
| `sort` | Apply deterministic ordering |
| `cursor` | Continue cursor pagination |
| `responseOffset` / `responseLimit` | Offset pagination |
| `include` / `exclude` | Keep or omit paths |
| `maxItems` | Bound large arrays |
| `tokenBudget` | Bound serialized output |
| `store` | Keep the full response temporarily |

Example:

```json
{
  "operationId": "<operation id>",
  "body": {
    "<required field>": "<confirmed value>"
  },
  "response": {
    "view": "compact",
    "responsePath": "data.items",
    "select": ["date", "strength", "theme"],
    "where": {
      "strength_gte": 0.75
    },
    "sort": ["-strength", "date"],
    "responseLimit": 20,
    "tokenBudget": 12000,
    "store": true
  }
}
```

Retrieve the next fragment without recalculating:

```json
{
  "resultId": "<result id>",
  "response": {
    "view": "compact",
    "responsePath": "data.items",
    "cursor": "<next cursor>",
    "select": ["date", "strength", "theme"],
    "responseLimit": 20,
    "tokenBudget": 12000
  }
}
```

Supported `where` suffixes:

```text
_eq _ne _gt _gte _lt _lte
_in _nin
_contains _startswith _endswith
_exists _regex
```

If `meta.pathFound` is false, select a path from `meta.availablePaths` instead of
repeating the same request.

## Full tool mode

Set:

```bash
export ASTROVISOR_TOOL_MODE=full
```

Full mode creates one MCP tool per OpenAPI `operationId` and accepts several legacy
operation aliases. It is useful for specialized clients but can consume too much
context in clients with strict tool-definition limits. Compact mode is recommended
for general use.

## Environment variables

### Stdio and internal adapter

| Variable | Default | Purpose |
| --- | --- | --- |
| `ASTROVISOR_API_KEY` | required | Dashboard API key |
| `ASTROVISOR_URL` | `https://astrovisor.io` | API base URL |
| `ASTROVISOR_OPENAPI_URL` | `<ASTROVISOR_URL>/openapi.json` | OpenAPI override |
| `ASTROVISOR_TOOL_MODE` | `compact` | `compact` or `full` |
| `ASTROVISOR_RESPONSE_VIEW` | `compact` | Default response view |
| `ASTROVISOR_DEFAULT_TOKEN_BUDGET` | implementation default | Serialized byte budget |
| `ASTROVISOR_RESULT_TTL_MS` | `1800000` | Result cache TTL |
| `ASTROVISOR_RESULT_MAX_ENTRIES` | `128` | Maximum cached results |

### Public gateway

| Variable | Default | Purpose |
| --- | --- | --- |
| `MCP_PUBLIC_HTTP_HOST` | `127.0.0.1` | Gateway bind host |
| `MCP_PUBLIC_HTTP_PORT` | `3002` | Gateway bind port |
| `INTERNAL_MCP_URL` | `http://127.0.0.1:3001/mcp` | Internal adapter URL |
| `API_KEY_VALIDATION_PATH` | `/internal/mcp/validate-api-key` | Non-billable key validation endpoint |
| `API_KEY_VALIDATION_CACHE_MS` | `60000` | Validation cache time |
| `MCP_INTERNAL_VALIDATION_TOKEN` | required | Internal validation credential |

## Self-hosting

The production topology is:

```text
Remote MCP client
    ↓ TLS
Reverse proxy
    ↓ loopback
Public Streamable HTTP gateway
    ↓ loopback
Internal JSON-RPC adapter
    ↓
AstroVisor API
```

Build and start the two Node services:

```bash
npm ci
npm run build
npm run start:jsonrpc
npm run start:public
```

Operational requirements:

- keep the AstroVisor API, internal adapter, and public gateway on loopback;
- terminate TLS at a reverse proxy;
- require `MCP_INTERNAL_VALIDATION_TOKEN` for key validation;
- ensure key validation does not record billable API usage;
- apply process supervision, memory limits, and restart policies;
- never log raw caller API keys or full private request bodies.

## Development

```bash
git clone https://github.com/rokoss21/astrovisor-mcp.git
cd astrovisor-mcp
npm ci
npm run build
npm run test:unit
```

Production OpenAPI smoke test:

```bash
ASTROVISOR_URL=https://astrovisor.io npm test
```

Stdio end-to-end test:

```bash
ASTROVISOR_API_KEY=pk-... npm run test:e2e:stdio
```

Remote end-to-end test:

```bash
MCP_URL=https://mcp.astrovisor.io/ \
ASTROVISOR_API_KEY=pk-... \
npm run test:e2e:remote
```

Security check:

```bash
npm audit --omit=dev
```

## Migration from 4.3.x

AstroVisor Skill now has its own canonical repository and npm package:

- GitHub: [rokoss21/astrovisor-skill](https://github.com/rokoss21/astrovisor-skill)
- npm: [`astrovisor-skill`](https://www.npmjs.com/package/astrovisor-skill)

Install it directly:

```bash
npx --yes --package=astrovisor-skill@1.0.0 -- \
  astrovisor-skill install --target both
```

Version 5.0.0 removes the bundled `astrovisor-skill` binary. This avoids npm
binary-name collisions and gives each project a single release lifecycle. Replace
commands that install the skill through `astrovisor-mcp` with the standalone
package command above. The MCP tool and transport contracts are unchanged.

## Related projects

- [AstroVisor Skill](https://github.com/rokoss21/astrovisor-skill) — profiles,
  onboarding, request workflows, and responsible interpretation.
- [AstroVisor](https://astrovisor.io) — API, dashboard, and product.

## License

[MIT](LICENSE)
