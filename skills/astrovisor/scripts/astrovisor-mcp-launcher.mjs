#!/usr/bin/env node

import os from "node:os";
import process from "node:process";
import { spawn } from "node:child_process";
import { resolveConfig } from "./lib.mjs";

const config = resolveConfig();
const apiKey = config.values.ASTROVISOR_API_KEY;

if (!apiKey) {
  console.error(
    "AstroVisor API key is missing. Run astrovisor-skill config set-key first.",
  );
  process.exit(1);
}
if (!String(apiKey).startsWith("pk-")) {
  console.error("AstroVisor API key must begin with pk-.");
  process.exit(1);
}

const packageSpec =
  process.env.ASTROVISOR_MCP_PACKAGE || "astrovisor-mcp@4.3.0";
const executable = process.platform === "win32" ? "npx.cmd" : "npx";
const child = spawn(
  executable,
  ["--yes", `--package=${packageSpec}`, "--", "astrovisor-mcp"],
  {
    cwd: os.tmpdir(),
    stdio: "inherit",
    env: {
      ...process.env,
      ASTROVISOR_API_KEY: apiKey,
      ASTROVISOR_URL: config.values.ASTROVISOR_URL,
      ASTROVISOR_OPENAPI_URL: `${String(
        config.values.ASTROVISOR_URL,
      ).replace(/\/$/, "")}/openapi.json`,
      ASTROVISOR_TOOL_MODE:
        process.env.ASTROVISOR_TOOL_MODE || "compact",
      ASTROVISOR_RESPONSE_VIEW:
        process.env.ASTROVISOR_RESPONSE_VIEW || "compact",
      ASTROVISOR_DEFAULT_TOKEN_BUDGET:
        process.env.ASTROVISOR_DEFAULT_TOKEN_BUDGET || "250000",
    },
  },
);

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    if (!child.killed) child.kill(signal);
  });
}

child.on("error", (error) => {
  console.error(`Could not start AstroVisor MCP: ${error.message}`);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 1);
  }
});
