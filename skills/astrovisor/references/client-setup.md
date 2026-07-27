# AstroVisor client setup

Use the root repository `README.md` for the full user-facing guide. This reference
is for an agent repairing or completing setup.

## Preferred credential model

Use the private skill environment and stdio launcher:

```bash
node "<skill-root>/scripts/astrovisor-skill.mjs" config set-key
node "<skill-root>/scripts/astrovisor-skill.mjs" client-config codex
node "<skill-root>/scripts/astrovisor-skill.mjs" client-config claude-code
node "<skill-root>/scripts/astrovisor-skill.mjs" client-config claude-desktop
```

The launcher reads the key at runtime, so generated client configuration contains
no secret.

## Codex and ChatGPT desktop

Install the skill to `~/.agents/skills/astrovisor`. Configure MCP in
`~/.codex/config.toml`:

```toml
[mcp_servers.astrovisor]
command = "node"
args = ["/absolute/path/to/astrovisor/scripts/astrovisor-mcp-launcher.mjs"]
startup_timeout_sec = 30
tool_timeout_sec = 120
```

Alternatively configure Streamable HTTP and export the key in the Codex host
environment:

```toml
[mcp_servers.astrovisor]
url = "https://mcp.astrovisor.io/"
bearer_token_env_var = "ASTROVISOR_API_KEY"
```

## Claude Code

Install the skill to `~/.claude/skills/astrovisor`, then add stdio MCP:

```bash
claude mcp add --transport stdio --scope user astrovisor -- \
  node /absolute/path/to/astrovisor/scripts/astrovisor-mcp-launcher.mjs
```

Remote HTTP is also supported:

```bash
claude mcp add --transport http --scope user astrovisor \
  https://mcp.astrovisor.io/ \
  --header "Authorization: Bearer pk-..."
```

The stdio launcher is preferred because it keeps the key out of Claude
configuration and shell history.

## Claude Desktop

Add stdio MCP to `claude_desktop_config.json`:

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

Restart the client after MCP configuration changes. Run `doctor --json`, then ask
the host to list AstroVisor tools. A correct compact connection exposes six tools.
