# AstroVisor MCP + Universal AI Skill

AstroVisor connects AI clients to the complete AstroVisor calculation API.
Version 4.3.0 includes:

- the `astrovisor-mcp` server for stdio and Streamable HTTP;
- the universal `astrovisor` Agent Skill for Codex, ChatGPT desktop and Claude
  Code;
- private Markdown profiles for yourself and any number of other people;
- interactive API-key/profile onboarding and progressive profile enrichment;
- strict live-OpenAPI request construction so the AI uses the correct operation,
  fields, JSON types and response controls.

The MCP exposes six compact tools backed by 456 current API operations. New
operations are discovered from the live OpenAPI schema instead of being hardcoded
into the skill.

## Capabilities

- Natal charts, transits, progressions, solar returns and directions.
- Synastry, compatibility, relationship and multi-person calculations.
- Jyotish, BaZi, Human Design, Gene Keys, numerology and Matrix systems.
- Tarot, Lenormand and other documented divination endpoints.
- Astrocartography, local space, parans, horary and electional workflows.
- Live OpenAPI search and exact operation metadata.
- Automatic normalization between common core and `birth_*` request profiles.
- Token-budgeted response filtering, projection and pagination.
- Temporary result storage for narrow follow-up retrieval.
- Per-API-key result isolation on the remote MCP gateway.

## Requirements

- Node.js 20 or newer.
- An AstroVisor dashboard API key beginning with `pk-`.
- One of the supported clients, or any MCP client supporting stdio/Streamable
  HTTP.

Never commit a real API key or private profile.

## Quick Start: Install the Skill

Install the same skill for both Codex/ChatGPT desktop and Claude Code:

```bash
npx --yes --package=astrovisor-mcp@4.3.0 -- \
  astrovisor-skill install --target both
```

This copies the skill to:

- `~/.agents/skills/astrovisor` for Codex and ChatGPT desktop;
- `~/.claude/skills/astrovisor` for Claude Code.

The two installed copies share one private configuration/profile directory. To
install only one:

```bash
# Codex / ChatGPT desktop
npx --yes --package=astrovisor-mcp@4.3.0 -- \
  astrovisor-skill install --target codex

# Claude Code
npx --yes --package=astrovisor-mcp@4.3.0 -- \
  astrovisor-skill install --target claude
```

For project-scoped installation:

```bash
npx --yes --package=astrovisor-mcp@4.3.0 -- \
  astrovisor-skill install --target both --scope project \
  --project-dir /path/to/project
```

Project paths are `.agents/skills/astrovisor` and
`.claude/skills/astrovisor`. Use user scope for a personal assistant available
from every repository; use project scope for a team/project workflow.

### Install from Git

```bash
git clone https://github.com/rokoss21/astrovisor-mcp.git
cd astrovisor-mcp
node skills/astrovisor/scripts/astrovisor-skill.mjs \
  install --target both
```

### Optional global CLI

```bash
npm install --global astrovisor-mcp@4.3.0
astrovisor-skill --help
astrovisor-mcp
```

The npm package contains both binaries:

- `astrovisor-mcp`: MCP stdio server;
- `astrovisor-skill`: skill/profile/configuration manager.

## Configure the API Key

The recommended command prompts without echoing the key:

```bash
node "$HOME/.agents/skills/astrovisor/scripts/astrovisor-skill.mjs" \
  config set-key
```

Claude-only installation:

```bash
node "$HOME/.claude/skills/astrovisor/scripts/astrovisor-skill.mjs" \
  config set-key
```

The default private file is:

```text
macOS/Linux: ~/.config/astrovisor/skill.env
Windows:     %APPDATA%\AstroVisor\skill.env
```

It is created with private permissions where supported. Generated MCP client
configuration uses a launcher and does not contain the key.

### Let the AI ask for credentials

When the skill is invoked and no key is configured, the AI is instructed to:

1. explain that a dashboard key beginning with `pk-` is needed;
2. ask whether the user wants to supply it for the current process or save it;
3. use the hidden interactive command above whenever possible;
4. if explicitly authorized to store a supplied key, pass it to
   `config set-key --stdin` without echoing it;
5. mask the key in diagnostics and never place it in profiles or Git.

For maximum security, enter the key yourself in the hidden terminal prompt instead
of pasting it into a chat.

### Other credential modes

Runtime environment variable (highest precedence):

```bash
export ASTROVISOR_API_KEY="pk-..."
```

Custom private env file:

```bash
export ASTROVISOR_SKILL_ENV="/private/path/astrovisor.env"
```

Explicit local skill `.env` (supported but less portable):

```bash
node "$HOME/.agents/skills/astrovisor/scripts/astrovisor-skill.mjs" \
  config set-key --storage local
```

Local `.env` is gitignored, but it belongs to one installed copy and may be lost
during replacement. The external private file is the recommended default.

Configuration precedence:

1. process environment;
2. `ASTROVISOR_SKILL_ENV`;
3. private `skill.env`;
4. installed skill `.env`;
5. safe defaults.

Inspect configuration without revealing the key:

```bash
node "$HOME/.agents/skills/astrovisor/scripts/astrovisor-skill.mjs" \
  config status --json
```

## Markdown People Profiles

The skill stores one person per Markdown file. The default directory is:

```text
~/.config/astrovisor/profiles/
```

Find the actual configured path:

```bash
node "$HOME/.agents/skills/astrovisor/scripts/astrovisor-skill.mjs" \
  profile path --json
```

Each file contains flat YAML frontmatter for machine-safe fields and ordinary
Markdown sections for evolving personal context. The maximum-fields template is
at [`skills/astrovisor/assets/profile-template.md`](skills/astrovisor/assets/profile-template.md).

It supports:

- display, preferred, legal, birth and numerology names;
- aliases, pronouns, language, relationship and related profile ids;
- birth date/time, time accuracy or range, place, coordinates and IANA timezone;
- source/confidence, birth-certificate state and rectification candidates;
- current location/timezone separately from birthplace;
- tropical/sidereal, house system, ayanamsa and system preferences;
- Tarot deck, forecast horizon, interpretation language/depth/tone;
- goals, focus areas, sensitive/avoided topics and privacy boundaries;
- consent for persistence, relationship comparison and rectification;
- work, education, family, health context, relationships and worldview;
- important dated life events;
- prior calculation notes, candidate facts and an update log.

The existence of a field does not mean it must be filled. The AI collects only
information relevant to the current request and progressively enriches the profile
with approved data.

### Create your own profile

Interactive essential-data wizard:

```bash
node "$HOME/.agents/skills/astrovisor/scripts/astrovisor-skill.mjs" \
  profile create me --interactive --default
```

Create an empty maximum-fields template for later AI/manual editing:

```bash
node "$HOME/.agents/skills/astrovisor/scripts/astrovisor-skill.mjs" \
  profile create me --default
```

### Create profiles for other people

Use stable lowercase ids:

```bash
node "$HOME/.agents/skills/astrovisor/scripts/astrovisor-skill.mjs" \
  profile create partner --interactive

node "$HOME/.agents/skills/astrovisor/scripts/astrovisor-skill.mjs" \
  profile create child-anna

node "$HOME/.agents/skills/astrovisor/scripts/astrovisor-skill.mjs" \
  profile create client-ivan
```

Manual files can be placed directly into the profile directory or imported:

```bash
node "$HOME/.agents/skills/astrovisor/scripts/astrovisor-skill.mjs" \
  profile import /path/to/person.md
```

### List, resolve, inspect and validate

```bash
SKILL="$HOME/.agents/skills/astrovisor/scripts/astrovisor-skill.mjs"

node "$SKILL" profile list --json
node "$SKILL" profile resolve "Anna" --json
node "$SKILL" profile show partner --json
node "$SKILL" profile validate partner --json
```

List/resolve output intentionally contains metadata rather than every birth field.
The AI loads the full selected profile only when the task needs it.

### Deterministic profile updates

```bash
node "$SKILL" profile set me \
  --set 'birth_time_accuracy=exact' \
  --set 'focus_areas=["career","relationships"]' \
  --set 'interpretation_language=ru'
```

Narrative sections and life-event tables can be edited as Markdown. Keep
user-confirmed facts separate from AI-derived observations.

### Progressive AI enrichment

Configure the global policy:

```bash
node "$SKILL" config set \
  --set ASTROVISOR_PROFILE_UPDATE_POLICY=ask
```

Policies:

- `ask` (default): the AI shows exact proposed changes and waits for confirmation;
- `auto-explicit`: explicitly stated, unambiguous facts are saved automatically and
  reported afterward;
- `off`: no profile writes.

A profile can override the global policy with `profile_update_policy`.

The AI must never silently convert an inference into a confirmed fact. With
permission, uncertain facts go to “Candidate facts awaiting confirmation”. This
allows the profile to grow during normal conversations without contaminating
calculation inputs.

## Correct API Request Construction

The skill does not hardcode or guess API request shapes. For every new calculation
type, the AI must:

1. call `astrovisor_openapi_search` or `astrovisor_openapi_list`;
2. choose the relevant operation;
3. call `astrovisor_openapi_get`;
4. read the canonical `operationId`, parameters, `requestBodySchema`,
   `llmHints.requiredBodyFields` and `llmHints.exampleBody`;
5. load and validate only the selected profile(s);
6. map confirmed profile values into the exact `path`, `query` and `body` fields;
7. check every required field and ask for missing information;
8. call `astrovisor_request`;
9. use `astrovisor_result_get` for targeted follow-up retrieval.

The profile manager can render the two common birth-data seeds:

```bash
node "$SKILL" profile render me --format core
node "$SKILL" profile render me --format birth
```

Core output:

```json
{
  "name": "Emil",
  "datetime": "1990-05-15T14:30:00",
  "latitude": 53.9006,
  "longitude": 27.559,
  "location": "Minsk, Belarus",
  "timezone": "Europe/Minsk"
}
```

Birth output uses `birth_datetime`, `birth_latitude`, `birth_longitude`,
`birth_location` and `birth_timezone`. These are schema seeds, not replacements
for live `astrovisor_openapi_get` metadata.

For multiple people, the AI renders and validates every profile independently and
maps them into the exact schema (`person1/person2`, nested birth data or whatever
the selected live operation defines). It never merges two profiles or reuses one
person's coordinates for another.

Unknown birth time remains empty with `birth_time_accuracy: "unknown"`. The skill
never silently substitutes noon.

## Codex and ChatGPT Desktop Setup

Codex loads personal skills from `~/.agents/skills`; repository skills live in
`.agents/skills`. Codex CLI, the IDE extension and ChatGPT desktop share Codex MCP
configuration.

1. Install the skill:

   ```bash
   npx --yes --package=astrovisor-mcp@4.3.0 -- \
     astrovisor-skill install --target codex
   ```

2. Save the key:

   ```bash
   node "$HOME/.agents/skills/astrovisor/scripts/astrovisor-skill.mjs" \
     config set-key
   ```

3. Generate the exact MCP configuration:

   ```bash
   node "$HOME/.agents/skills/astrovisor/scripts/astrovisor-skill.mjs" \
     client-config codex
   ```

4. Paste it into `~/.codex/config.toml`. It looks like:

   ```toml
   [mcp_servers.astrovisor]
   command = "node"
   args = ["/absolute/path/to/astrovisor/scripts/astrovisor-mcp-launcher.mjs"]
   startup_timeout_sec = 30
   tool_timeout_sec = 120
   ```

5. Restart Codex/ChatGPT desktop if the new MCP server does not appear. Use `/mcp`
   to inspect servers. Invoke the skill explicitly with `$astrovisor`, or ask a
   matching astrology/profile question and allow implicit activation.

Codex can also use remote HTTP if the key is exported into the Codex host:

```toml
[mcp_servers.astrovisor]
url = "https://mcp.astrovisor.io/"
bearer_token_env_var = "ASTROVISOR_API_KEY"
```

Official references: [Codex skills](https://learn.chatgpt.com/docs/build-skills),
[Codex MCP](https://learn.chatgpt.com/docs/extend/mcp).

## Claude Code Setup

Claude Code discovers personal skills in `~/.claude/skills` and project skills in
`.claude/skills`.

1. Install the skill:

   ```bash
   npx --yes --package=astrovisor-mcp@4.3.0 -- \
     astrovisor-skill install --target claude
   ```

2. Save the key using the installed CLI.

3. Generate the MCP command:

   ```bash
   node "$HOME/.claude/skills/astrovisor/scripts/astrovisor-skill.mjs" \
     client-config claude-code
   ```

4. Run the emitted command. It will use this structure:

   ```bash
   claude mcp add --transport stdio --scope user astrovisor -- \
     node /absolute/path/to/astrovisor/scripts/astrovisor-mcp-launcher.mjs
   ```

5. Verify:

   ```bash
   claude mcp get astrovisor
   claude mcp list
   ```

6. Inside Claude Code, use `/mcp` to inspect the connection and `/astrovisor` to
   invoke the skill.

Direct remote HTTP is also possible, but putting a key directly into a CLI command
can leave it in shell history:

```bash
claude mcp add --transport http --scope user astrovisor \
  https://mcp.astrovisor.io/ \
  --header "Authorization: Bearer pk-..."
```

The private stdio launcher is therefore recommended.

Official references: [Claude Code skills](https://code.claude.com/docs/en/slash-commands),
[Claude Code MCP](https://code.claude.com/docs/en/mcp).

## Claude Desktop Setup

Claude Desktop can use the MCP server through stdio. Local Claude Code skill
discovery and Claude Desktop MCP configuration are separate features.

Generate `claude_desktop_config.json` content:

```bash
node "$HOME/.claude/skills/astrovisor/scripts/astrovisor-skill.mjs" \
  client-config claude-desktop
```

The output contains no API key:

```json
{
  "mcpServers": {
    "astrovisor": {
      "command": "node",
      "args": [
        "/absolute/path/to/astrovisor/scripts/astrovisor-mcp-launcher.mjs"
      ]
    }
  }
}
```

Restart Claude Desktop after editing the configuration. If you only want MCP and
not the Claude Code skill, use the original direct package configuration:

```json
{
  "mcpServers": {
    "astrovisor": {
      "command": "npx",
      "args": [
        "--yes",
        "--package=astrovisor-mcp@4.3.0",
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

The explicit package pin and neutral launcher working directory prevent an old
global `astrovisor-mcp` binary from taking precedence.

Official reference:
[Claude Desktop local MCP](https://support.anthropic.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop).

## Example Skill Prompts

Codex:

```text
Use $astrovisor. Check whether my profile is complete, ask only for missing natal
data, save confirmed values, and calculate my natal chart.
```

Claude Code:

```text
/astrovisor Create separate profiles for me and my partner, resolve both birth
locations, then run the correct synastry operation with a relationships focus.
```

Progressive enrichment:

```text
Use AstroVisor. During our conversation, keep my profile updated with facts I state
explicitly. Ask before saving sensitive or inferred information.
```

Unknown birth time:

```text
Use AstroVisor for Anna. Her date and place are known but the time is unknown. Save
that honestly, explain limitations, and choose calculations that do not pretend the
time is exact.
```

Multi-profile:

```text
Compare profiles me, partner and business-cofounder. Verify consent and data
completeness for each person, discover the live group/relationship operations, and
show which request shape you used.
```

Russian:

```text
Используй AstroVisor. Создай отдельный профиль для мамы, задай только необходимые
вопросы, сохрани подтверждённые данные и сделай прогноз на ближайшие три месяца.
```

## Diagnostics and Testing

Full local/remote diagnostic:

```bash
node "$SKILL" doctor --json
```

It checks:

- Node.js version;
- private configuration and masked key;
- every Markdown profile's syntax and core-field validity;
- public MCP health;
- authenticated MCP initialization;
- compact tool count.

It does not bill an astrology calculation.

Skill self-test:

```bash
npm run test:skill
```

MCP tests:

```bash
ASTROVISOR_URL=https://astrovisor.io npm test
npm run test:unit
ASTROVISOR_API_KEY=pk-... npm run test:e2e:stdio
MCP_URL=https://mcp.astrovisor.io/ \
ASTROVISOR_API_KEY=pk-... \
npm run test:e2e:remote
```

## Update the Installed Skill

Run the installer with `--force`:

```bash
npx --yes --package=astrovisor-mcp@4.3.0 -- \
  astrovisor-skill install --target both --force
```

Existing skill folders are renamed to timestamped recoverable backups before
replacement. Private default profiles and `skill.env` live outside the installed
skill, so they are not overwritten.

## Privacy and Safety

- Profiles contain personal data; keep them private and out of Git.
- Store one person per file and use explicit consent for third-party comparison.
- Never infer birth time, gender, coordinates, timezone or legal name.
- Keep AI-derived observations separate from confirmed facts.
- Do not store API keys in profiles.
- Astrology/divination interpretations are reflective, not scientific certainty.
- Do not use results as medical, legal, financial, safety or mental-health advice.
- Do not make deterministic claims about death, illness, pregnancy, crime,
  fidelity or another person's hidden intentions.

## Remote Streamable HTTP

Clients supporting static HTTP authentication can connect without npm:

```text
MCP URL: https://mcp.astrovisor.io/
Authorization: Bearer pk-...
```

`X-API-Key: pk-...` is also accepted. The compatibility alias
`https://mcp.astrovisor.io/mcp` remains available. Health information:
`https://mcp.astrovisor.io/health`.

## Install as a Dependency

```bash
npm install astrovisor-mcp@4.3.0
```

## MCP Client Environment Variables

- `ASTROVISOR_API_KEY` (required): dashboard API key.
- `ASTROVISOR_URL` (default `https://astrovisor.io`): API base URL.
- `ASTROVISOR_OPENAPI_URL`: optional OpenAPI override.
- `ASTROVISOR_TOOL_MODE`: `compact` (default) or `full`.
- `ASTROVISOR_RESPONSE_VIEW`: `summary`, `compact`, or `full`.
- `ASTROVISOR_DEFAULT_TOKEN_BUDGET`: serialized response byte budget.
- `ASTROVISOR_RESULT_TTL_MS`: result cache TTL.
- `ASTROVISOR_RESULT_MAX_ENTRIES`: maximum cached results.

Skill-specific variables are documented in
[`skills/astrovisor/assets/skill.env.example`](skills/astrovisor/assets/skill.env.example).

## Self-Hosting the Remote Gateway

The public gateway is an operator component, not a replacement for the
AstroVisor API. It uses the official MCP Streamable HTTP transport and
forwards requests to the internal JSON-RPC adapter.

```text
Remote client
  -> public Streamable HTTP gateway
  -> internal JSON-RPC adapter
  -> AstroVisor API
```

Start the internal adapter and public gateway:

```bash
npm run build
npm run start:jsonrpc
npm run start:public
```

Gateway variables:

- `MCP_PUBLIC_HTTP_HOST` (default `127.0.0.1`)
- `MCP_PUBLIC_HTTP_PORT` (default `3002`)
- `INTERNAL_MCP_URL` (default `http://127.0.0.1:3001/mcp`)
- `API_KEY_VALIDATION_PATH` (default `/internal/mcp/validate-api-key`)
- `API_KEY_VALIDATION_CACHE_MS` (default `60000`)
- `MCP_INTERNAL_VALIDATION_TOKEN` (required)

The configured validation endpoint must verify caller keys without
recording billable API usage and must itself require
`X-Internal-MCP-Token`. Put TLS and public routing in a reverse proxy;
keep the API, JSON-RPC adapter and gateway listeners on loopback.

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

## Validation

```bash
# OpenAPI and public API smoke checks
ASTROVISOR_URL=https://astrovisor.io npm test

# Deterministic interop tests
npm run test:unit

# Claude Desktop-style stdio E2E
ASTROVISOR_API_KEY=pk-... npm run test:e2e:stdio

# Remote Streamable HTTP E2E
MCP_URL=https://mcp.astrovisor.io/ \
ASTROVISOR_API_KEY=pk-... \
npm run test:e2e:remote
```

## Notes

- The server fetches OpenAPI once at startup and generates the tool list from it.
- You need a valid **dashboard-generated** API key (`pk-...`) to call most `/api/...` endpoints.
- The production remote endpoint and npm stdio package are tested against
  natal, current transits, Tarot and stored-result retrieval.
