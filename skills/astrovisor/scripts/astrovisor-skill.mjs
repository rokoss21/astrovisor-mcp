#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import readline from "node:readline/promises";
import {
  DEFAULTS,
  PROFILE_ID_PATTERN,
  SKILL_ROOT,
  assertProfileId,
  ensurePrivateDirectory,
  listProfileFiles,
  loadTemplate,
  maskKey,
  normalizeSetValue,
  parseProfileDocument,
  profilePath,
  readEnvFile,
  readProfileFile,
  renderProfileRequest,
  resolveConfig,
  resolveProfile,
  serializeProfileDocument,
  summarizeProfile,
  validateProfile,
  writeEnvFile,
  writePrivateFile,
} from "./lib.mjs";

const SKILL_VERSION = "1.0.0";
const MCP_PACKAGE_VERSION = "4.3.0";
const HELP = `
AstroVisor skill ${SKILL_VERSION}

Usage:
  astrovisor-skill install [--target codex|claude|both] [--scope user|project]
                           [--project-dir PATH] [--force] [--json]
  astrovisor-skill config init [--json]
  astrovisor-skill config status [--json]
  astrovisor-skill config path [--json]
  astrovisor-skill config set-key [--stdin] [--storage private|local]
  astrovisor-skill config set --set NAME=VALUE [--set NAME=VALUE ...]
  astrovisor-skill profile path [--json]
  astrovisor-skill profile list [--json]
  astrovisor-skill profile create ID [--interactive] [--default]
                                     [--set FIELD=VALUE ...]
  astrovisor-skill profile import FILE [--default]
  astrovisor-skill profile set ID --set FIELD=VALUE [--set FIELD=VALUE ...]
  astrovisor-skill profile show ID [--json]
  astrovisor-skill profile resolve NAME_OR_ID [--json]
  astrovisor-skill profile validate [ID] [--json]
  astrovisor-skill profile render ID --format core|birth
  astrovisor-skill client-config codex|claude-code|claude-desktop|all
  astrovisor-skill doctor [--offline] [--json]

Environment:
  ASTROVISOR_SKILL_HOME          Private config root
  ASTROVISOR_SKILL_ENV           Custom env file
  ASTROVISOR_PROFILE_DIR         Markdown profile directory
  ASTROVISOR_API_KEY             Runtime key (highest precedence)
  ASTROVISOR_URL                 API base URL
  ASTROVISOR_MCP_URL             Streamable HTTP MCP URL
  ASTROVISOR_DEFAULT_PROFILE     Default profile id
  ASTROVISOR_PROFILE_UPDATE_POLICY  ask|auto-explicit|off
`.trim();

async function main() {
  const [command = "help", ...rest] = process.argv.slice(2);
  if (["help", "--help", "-h"].includes(command)) {
    console.log(HELP);
    return;
  }
  if (["version", "--version", "-v"].includes(command)) {
    console.log(SKILL_VERSION);
    return;
  }

  if (command === "install") return installSkill(parseArgs(rest));
  if (command === "config") return configCommand(rest);
  if (command === "profile") return profileCommand(rest);
  if (command === "client-config") return clientConfigCommand(rest);
  if (command === "doctor") return doctorCommand(parseArgs(rest));
  throw new Error(`Unknown command: ${command}\n\n${HELP}`);
}

function parseArgs(tokens) {
  const positionals = [];
  const options = new Map();
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith("--")) {
      positionals.push(token);
      continue;
    }
    const equals = token.indexOf("=");
    if (equals > 2) {
      addOption(options, token.slice(2, equals), token.slice(equals + 1));
      continue;
    }
    const key = token.slice(2);
    const next = tokens[index + 1];
    if (next !== undefined && !next.startsWith("--")) {
      addOption(options, key, next);
      index += 1;
    } else {
      addOption(options, key, true);
    }
  }
  return { positionals, options };
}

function addOption(options, key, value) {
  const current = options.get(key);
  if (current === undefined) options.set(key, value);
  else if (Array.isArray(current)) current.push(value);
  else options.set(key, [current, value]);
}

function option(args, name, fallback = undefined) {
  const value = args.options.get(name);
  return value === undefined ? fallback : value;
}

function repeatedOption(args, name) {
  const value = args.options.get(name);
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function hasOption(args, name) {
  return args.options.has(name);
}

async function installSkill(args) {
  const target = String(option(args, "target", "both"));
  const scope = String(option(args, "scope", "user"));
  const json = hasOption(args, "json");
  const force = hasOption(args, "force");
  const projectDir = path.resolve(
    String(option(args, "project-dir", process.cwd())),
  );

  if (!["codex", "claude", "both"].includes(target)) {
    throw new Error("--target must be codex, claude, or both");
  }
  if (!["user", "project"].includes(scope)) {
    throw new Error("--scope must be user or project");
  }

  const destinations = [];
  if (target === "codex" || target === "both") {
    destinations.push({
      client: "codex",
      path:
        scope === "user"
          ? path.join(os.homedir(), ".agents", "skills", "astrovisor")
          : path.join(projectDir, ".agents", "skills", "astrovisor"),
    });
  }
  if (target === "claude" || target === "both") {
    destinations.push({
      client: "claude",
      path:
        scope === "user"
          ? path.join(os.homedir(), ".claude", "skills", "astrovisor")
          : path.join(projectDir, ".claude", "skills", "astrovisor"),
    });
  }

  const results = [];
  for (const destination of destinations) {
    results.push({
      client: destination.client,
      ...(await copySkill(destination.path, force)),
    });
  }

  const output = {
    installed: results,
    skill_version: SKILL_VERSION,
    scope,
    next: [
      "Run config set-key using either installed copy.",
      "Run client-config for the target AI client.",
      "Run doctor --json.",
    ],
  };
  if (json) console.log(JSON.stringify(output, null, 2));
  else {
    for (const result of results) {
      console.log(
        `${result.client}: ${result.status} -> ${result.path}` +
          (result.backup ? ` (backup: ${result.backup})` : ""),
      );
    }
    console.log("\nNext: configure the private API key, MCP client, and profiles.");
  }
}

async function copySkill(destination, force) {
  const sourceReal = fs.realpathSync(SKILL_ROOT);
  if (fs.existsSync(destination)) {
    try {
      if (fs.realpathSync(destination) === sourceReal) {
        return { status: "already-linked", path: destination };
      }
    } catch {
      // Continue with the normal existing-target flow.
    }
    if (!force) {
      return {
        status: "skipped-existing",
        path: destination,
        hint: "Use --force to replace it with a recoverable backup.",
      };
    }
  }

  ensurePrivateDirectory(path.dirname(destination));
  let backup = null;
  if (fs.existsSync(destination)) {
    backup = `${destination}.backup-${compactTimestamp()}`;
    fs.renameSync(destination, backup);
  }

  const staging = `${destination}.install-${process.pid}-${Date.now()}`;
  try {
    fs.cpSync(SKILL_ROOT, staging, {
      recursive: true,
      force: false,
      errorOnExist: true,
      filter: (source) => path.basename(source) !== ".env",
    });
    fs.renameSync(staging, destination);
    fs.writeFileSync(
      path.join(destination, ".gitignore"),
      ".env\nprofiles/\n*.backup-*\n",
      "utf8",
    );
  } catch (error) {
    if (fs.existsSync(staging)) fs.rmSync(staging, { recursive: true });
    if (backup && !fs.existsSync(destination)) {
      fs.renameSync(backup, destination);
      backup = null;
    }
    throw error;
  }

  return { status: "installed", path: destination, backup };
}

async function configCommand(tokens) {
  const [subcommand = "status", ...rest] = tokens;
  const args = parseArgs(rest);
  const config = resolveConfig();

  if (subcommand === "init") {
    ensurePrivateDirectory(config.home);
    ensurePrivateDirectory(config.profileDir);
    if (!fs.existsSync(config.defaultEnvFile)) {
      writeEnvFile(config.defaultEnvFile, DEFAULTS);
    }
    return printResult(
      {
        initialized: true,
        home: config.home,
        env_file: config.defaultEnvFile,
        profile_dir: config.profileDir,
      },
      args,
    );
  }

  if (subcommand === "path") {
    return printResult(
      {
        home: config.home,
        private_env_file: config.defaultEnvFile,
        custom_env_file: config.customEnvFile,
        local_env_file: config.localEnvFile,
        profile_dir: config.profileDir,
      },
      args,
    );
  }

  if (subcommand === "status") {
    const key = config.values.ASTROVISOR_API_KEY;
    return printResult(
      {
        configured: Boolean(key),
        api_key: maskKey(key),
        api_url: config.values.ASTROVISOR_URL,
        mcp_url: config.values.ASTROVISOR_MCP_URL,
        default_profile: config.values.ASTROVISOR_DEFAULT_PROFILE,
        profile_update_policy:
          config.values.ASTROVISOR_PROFILE_UPDATE_POLICY,
        profile_dir: config.profileDir,
        sources: config.sources,
      },
      args,
    );
  }

  if (subcommand === "set-key") {
    const storage = String(option(args, "storage", "private"));
    if (!["private", "local"].includes(storage)) {
      throw new Error("--storage must be private or local");
    }
    const key = hasOption(args, "stdin")
      ? (await readAllStdin()).trim()
      : await readSecret("AstroVisor API key: ");
    if (!key.startsWith("pk-") || key.length < 10) {
      throw new Error("Expected an AstroVisor dashboard API key beginning with pk-.");
    }
    const destination =
      storage === "local" ? config.localEnvFile : config.defaultEnvFile;
    const values = {
      ...DEFAULTS,
      ...readEnvFile(destination),
      ASTROVISOR_API_KEY: key,
    };
    writeEnvFile(destination, values);
    console.log(`API key saved privately as ${maskKey(key)} in ${destination}`);
    return;
  }

  if (subcommand === "set") {
    const updates = parseAssignments(repeatedOption(args, "set"), {
      allowNames: new Set([
        "ASTROVISOR_URL",
        "ASTROVISOR_MCP_URL",
        "ASTROVISOR_DEFAULT_PROFILE",
        "ASTROVISOR_PROFILE_UPDATE_POLICY",
        "ASTROVISOR_PROFILE_DIR",
      ]),
    });
    if (Object.keys(updates).length === 0) {
      throw new Error("Provide at least one --set NAME=VALUE.");
    }
    if (
      updates.ASTROVISOR_PROFILE_UPDATE_POLICY &&
      !["ask", "auto-explicit", "off"].includes(
        updates.ASTROVISOR_PROFILE_UPDATE_POLICY,
      )
    ) {
      throw new Error(
        "ASTROVISOR_PROFILE_UPDATE_POLICY must be ask, auto-explicit, or off.",
      );
    }
    if (updates.ASTROVISOR_DEFAULT_PROFILE) {
      assertProfileId(updates.ASTROVISOR_DEFAULT_PROFILE);
    }
    const values = {
      ...DEFAULTS,
      ...readEnvFile(config.defaultEnvFile),
      ...updates,
    };
    writeEnvFile(config.defaultEnvFile, values);
    console.log(
      `Updated ${Object.keys(updates).join(", ")} in ${config.defaultEnvFile}`,
    );
    return;
  }

  throw new Error(`Unknown config command: ${subcommand}`);
}

async function profileCommand(tokens) {
  const [subcommand = "list", ...rest] = tokens;
  const args = parseArgs(rest);
  const config = resolveConfig();

  if (subcommand === "path") {
    ensurePrivateDirectory(config.profileDir);
    return printResult({ profile_dir: config.profileDir }, args);
  }

  if (subcommand === "list") {
    const profiles = listProfileFiles(config).map((filePath) => {
      const profile = readProfileFile(filePath);
      return { ...summarizeProfile(profile), path: filePath };
    });
    if (hasOption(args, "json")) {
      console.log(JSON.stringify(profiles, null, 2));
    } else if (profiles.length === 0) {
      console.log(`No profiles in ${config.profileDir}`);
    } else {
      for (const profile of profiles) {
        console.log(
          `${profile.id}\t${profile.display_name}\t` +
            `exact_birth=${profile.exact_birth_ready}\t` +
            `consent=${profile.consent_to_store}`,
        );
      }
    }
    return;
  }

  if (subcommand === "create") {
    const id = assertProfileId(args.positionals[0]);
    ensurePrivateDirectory(config.profileDir);
    const destination = profilePath(id, config);
    if (fs.existsSync(destination)) {
      throw new Error(`Profile already exists: ${destination}`);
    }
    const timestamp = new Date().toISOString();
    const profile = loadTemplate(id, timestamp);
    applyProfileAssignments(profile, repeatedOption(args, "set"));
    if (hasOption(args, "interactive")) {
      await runProfileWizard(profile);
    }
    profile.data.updated_at = timestamp;
    writePrivateFile(destination, serializeProfileDocument(profile));
    if (hasOption(args, "default")) setDefaultProfile(id, config);
    console.log(`Created profile: ${destination}`);
    return;
  }

  if (subcommand === "import") {
    const source = path.resolve(String(args.positionals[0] || ""));
    if (!source || !fs.existsSync(source)) {
      throw new Error("Provide an existing Markdown profile file.");
    }
    const raw = fs.readFileSync(source, "utf8");
    const parsed = parseProfileDocument(raw, source);
    const id = assertProfileId(String(parsed.data.id || ""));
    const validation = validateProfile(parsed);
    if (!validation.valid) {
      throw new Error(`Invalid profile: ${validation.errors.join("; ")}`);
    }
    ensurePrivateDirectory(config.profileDir);
    const destination = profilePath(id, config);
    if (fs.existsSync(destination)) {
      throw new Error(`Profile already exists: ${destination}`);
    }
    writePrivateFile(destination, serializeProfileDocument(parsed));
    if (hasOption(args, "default")) setDefaultProfile(id, config);
    console.log(`Imported profile: ${destination}`);
    return;
  }

  if (subcommand === "set") {
    const id = assertProfileId(args.positionals[0]);
    const filePath = profilePath(id, config);
    const profile = readProfileFile(filePath);
    const assignments = repeatedOption(args, "set");
    if (assignments.length === 0) {
      throw new Error("Provide at least one --set FIELD=VALUE.");
    }
    const changed = applyProfileAssignments(profile, assignments);
    profile.data.updated_at = new Date().toISOString();
    appendUpdateLog(profile, changed);
    writePrivateFile(filePath, serializeProfileDocument(profile));
    console.log(`Updated ${id}: ${changed.join(", ")}`);
    return;
  }

  if (subcommand === "show") {
    const id = resolveRequestedProfileId(args.positionals[0], config);
    const profile = readProfileFile(profilePath(id, config));
    if (hasOption(args, "json")) {
      console.log(
        JSON.stringify(
          {
            path: profile.filePath,
            profile: profile.data,
            narrative: profile.body,
            validation: validateProfile(profile),
          },
          null,
          2,
        ),
      );
    } else {
      process.stdout.write(serializeProfileDocument(profile));
    }
    return;
  }

  if (subcommand === "resolve") {
    const query = args.positionals.join(" ").trim();
    if (!query) throw new Error("Provide a profile id, name, or alias.");
    const profiles = listProfileFiles(config).map(readProfileFile);
    const matches = resolveProfile(query, profiles).map((profile) => ({
      ...summarizeProfile(profile),
      path: profile.filePath,
    }));
    if (hasOption(args, "json")) {
      console.log(JSON.stringify(matches, null, 2));
    } else if (matches.length === 0) {
      console.log("No matching profile.");
    } else {
      for (const match of matches) {
        console.log(`${match.id}\t${match.display_name}\t${match.path}`);
      }
    }
    return;
  }

  if (subcommand === "validate") {
    const requested = args.positionals[0];
    const files = requested
      ? [profilePath(resolveRequestedProfileId(requested, config), config)]
      : listProfileFiles(config);
    const results = files.map((filePath) => {
      try {
        const profile = readProfileFile(filePath);
        return {
          id: profile.data.id,
          path: filePath,
          ...validateProfile(profile),
        };
      } catch (error) {
        return {
          id: path.basename(filePath, ".md"),
          path: filePath,
          valid: false,
          errors: [String(error.message || error)],
          warnings: [],
        };
      }
    });
    if (hasOption(args, "json")) {
      console.log(JSON.stringify(results.length === 1 ? results[0] : results, null, 2));
    } else if (results.length === 0) {
      console.log(`No profiles in ${config.profileDir}`);
    } else {
      for (const result of results) {
        console.log(
          `${result.id}: ${result.valid ? "valid" : "invalid"}` +
            (result.errors.length ? `; ${result.errors.join("; ")}` : "") +
            (result.warnings.length
              ? `; warnings: ${result.warnings.join("; ")}`
              : ""),
        );
      }
    }
    if (results.some((result) => !result.valid)) process.exitCode = 1;
    return;
  }

  if (subcommand === "render") {
    const id = resolveRequestedProfileId(args.positionals[0], config);
    const format = String(option(args, "format", "core"));
    const profile = readProfileFile(profilePath(id, config));
    console.log(JSON.stringify(renderProfileRequest(profile, format), null, 2));
    return;
  }

  throw new Error(`Unknown profile command: ${subcommand}`);
}

function applyProfileAssignments(profile, assignmentTokens) {
  const updates = parseAssignments(assignmentTokens);
  const known = new Set([...profile.order, ...Object.keys(profile.data)]);
  const changed = [];
  for (const [field, value] of Object.entries(updates)) {
    if (!/^[a-z][a-z0-9_]*$/.test(field)) {
      throw new Error(`Invalid profile field: ${field}`);
    }
    if (!known.has(field)) {
      throw new Error(
        `Unknown profile field: ${field}. Edit Markdown directly for custom narrative data.`,
      );
    }
    profile.data[field] = normalizeSetValue(value);
    changed.push(field);
  }
  return changed;
}

function parseAssignments(tokens, { allowNames = null } = {}) {
  const output = {};
  for (const token of tokens) {
    if (token === true) throw new Error("--set requires NAME=VALUE.");
    const separator = String(token).indexOf("=");
    if (separator < 1) {
      throw new Error(`Expected NAME=VALUE, received: ${token}`);
    }
    const name = String(token).slice(0, separator).trim();
    const value = String(token).slice(separator + 1);
    if (allowNames && !allowNames.has(name)) {
      throw new Error(`Unsupported configuration field: ${name}`);
    }
    output[name] = value;
  }
  return output;
}

async function runProfileWizard(profile) {
  const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    const questions = [
      ["display_name", "Display name"],
      ["relationship_to_owner", "Relationship to profile owner"],
      ["birth_date", "Birth date (YYYY-MM-DD)"],
      ["birth_time", "Local birth time (HH:MM, blank if unknown)"],
      [
        "birth_time_accuracy",
        "Time accuracy (exact/approximate/range/unknown)",
      ],
      ["birth_place", "Birth place"],
      ["birth_latitude", "Birth latitude (decimal, optional)"],
      ["birth_longitude", "Birth longitude (decimal, optional)"],
      ["birth_timezone", "Birth IANA timezone (optional)"],
      ["primary_language", "Primary language (optional)"],
    ];
    for (const [field, label] of questions) {
      const current = profile.data[field];
      const answer = (
        await terminal.question(
          `${label}${current ? ` [${formatPromptValue(current)}]` : ""}: `,
        )
      ).trim();
      if (answer) profile.data[field] = normalizeSetValue(answer);
    }
    const consent = (
      await terminal.question("Save this profile as private local data? [y/N]: ")
    )
      .trim()
      .toLowerCase();
    profile.data.consent_to_store = ["y", "yes", "д", "да"].includes(consent);
    profile.data.data_provided_by = "interactive-user";
  } finally {
    terminal.close();
  }
}

function formatPromptValue(value) {
  return Array.isArray(value) ? JSON.stringify(value) : String(value);
}

function appendUpdateLog(profile, fields) {
  const row = `| ${new Date().toISOString()} | ${fields.join(", ")} | Explicit CLI update | Confirmed |`;
  const trimmed = profile.body.replace(/\s+$/, "");
  if (trimmed.includes("## Update log")) {
    profile.body = `${trimmed}\n${row}\n`;
  } else {
    profile.body = `${trimmed}\n\n## Update log\n\n| Date | Fields/section | Source | Confirmation |\n| --- | --- | --- | --- |\n${row}\n`;
  }
}

function resolveRequestedProfileId(requested, config) {
  if (requested) return assertProfileId(requested);
  return assertProfileId(
    String(config.values.ASTROVISOR_DEFAULT_PROFILE || "me"),
  );
}

function setDefaultProfile(id, config) {
  const values = {
    ...DEFAULTS,
    ...readEnvFile(config.defaultEnvFile),
    ASTROVISOR_DEFAULT_PROFILE: id,
  };
  writeEnvFile(config.defaultEnvFile, values);
}

function clientConfigCommand(tokens) {
  const [client = "all"] = tokens;
  if (!["codex", "claude-code", "claude-desktop", "all"].includes(client)) {
    throw new Error(
      "Client must be codex, claude-code, claude-desktop, or all.",
    );
  }
  const launcher = path.join(
    SKILL_ROOT,
    "scripts",
    "astrovisor-mcp-launcher.mjs",
  );
  const snippets = {
    codex: `[mcp_servers.astrovisor]\ncommand = "node"\nargs = [${JSON.stringify(launcher)}]\nstartup_timeout_sec = 30\ntool_timeout_sec = 120`,
    "claude-code": `claude mcp add --transport stdio --scope user astrovisor -- node ${shellQuote(launcher)}`,
    "claude-desktop": JSON.stringify(
      {
        mcpServers: {
          astrovisor: {
            command: "node",
            args: [launcher],
          },
        },
      },
      null,
      2,
    ),
  };
  if (client === "all") {
    console.log(
      [
        "# Codex (~/.codex/config.toml)",
        snippets.codex,
        "",
        "# Claude Code",
        snippets["claude-code"],
        "",
        "# Claude Desktop (claude_desktop_config.json)",
        snippets["claude-desktop"],
      ].join("\n"),
    );
  } else {
    console.log(snippets[client]);
  }
}

async function doctorCommand(args) {
  const config = resolveConfig();
  const key = config.values.ASTROVISOR_API_KEY;
  const nodeMajor = Number(process.versions.node.split(".")[0]);
  const report = {
    ok: true,
    skill_version: SKILL_VERSION,
    node: {
      version: process.versions.node,
      supported: nodeMajor >= 20,
    },
    config: {
      home: config.home,
      env_file:
        config.sources.custom ||
        config.sources.default ||
        config.sources.local ||
        null,
      profile_dir: config.profileDir,
      api_key_configured: Boolean(key),
      api_key: maskKey(key),
      api_url: config.values.ASTROVISOR_URL,
      mcp_url: config.values.ASTROVISOR_MCP_URL,
      profile_update_policy:
        config.values.ASTROVISOR_PROFILE_UPDATE_POLICY,
    },
    profiles: {
      count: 0,
      valid: 0,
      invalid: [],
    },
    remote: {
      tested: false,
      health: null,
      authenticated: false,
      tools: null,
      error: null,
    },
  };

  const profileFiles = listProfileFiles(config);
  report.profiles.count = profileFiles.length;
  for (const filePath of profileFiles) {
    try {
      const result = validateProfile(readProfileFile(filePath));
      if (result.valid) report.profiles.valid += 1;
      else {
        report.profiles.invalid.push({
          id: path.basename(filePath, ".md"),
          errors: result.errors,
        });
      }
    } catch (error) {
      report.profiles.invalid.push({
        id: path.basename(filePath, ".md"),
        errors: [String(error.message || error)],
      });
    }
  }

  if (!hasOption(args, "offline")) {
    report.remote.tested = true;
    try {
      report.remote.health = await fetchHealth(
        config.values.ASTROVISOR_MCP_URL,
      );
      if (key) {
        const mcp = await testMcpConnection(
          config.values.ASTROVISOR_MCP_URL,
          key,
        );
        report.remote.authenticated = true;
        report.remote.tools = mcp.tools;
        report.remote.server = mcp.server;
      }
    } catch (error) {
      report.remote.error = String(error.message || error);
    }
  }

  report.ok =
    report.node.supported &&
    Boolean(key) &&
    report.profiles.invalid.length === 0 &&
    (hasOption(args, "offline") ||
      (report.remote.health?.status === "ok" &&
        report.remote.authenticated &&
        report.remote.tools === 6));

  if (hasOption(args, "json")) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`AstroVisor skill ${report.skill_version}`);
    console.log(
      `Node ${report.node.version}: ${report.node.supported ? "ok" : "requires >=20"}`,
    );
    console.log(
      `API key: ${report.config.api_key || "missing"}; profiles: ${report.profiles.valid}/${report.profiles.count} valid`,
    );
    if (report.remote.tested) {
      console.log(
        `Remote MCP: ${
          report.remote.authenticated
            ? `authenticated, ${report.remote.tools} tools`
            : report.remote.error || "not authenticated"
        }`,
      );
    }
    console.log(report.ok ? "Doctor: PASS" : "Doctor: ACTION REQUIRED");
  }
  if (!report.ok) process.exitCode = 1;
}

async function fetchHealth(mcpUrl) {
  const healthUrl = new URL("health", ensureTrailingSlash(mcpUrl));
  const response = await fetch(healthUrl, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    throw new Error(`Health check failed with HTTP ${response.status}`);
  }
  return response.json();
}

async function testMcpConnection(mcpUrl, key) {
  const url = ensureTrailingSlash(mcpUrl);
  const commonHeaders = {
    Authorization: `Bearer ${key}`,
    "X-API-Key": key,
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  let sessionId = null;
  try {
    const initialized = await postMcp(
      url,
      commonHeaders,
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-06-18",
          capabilities: {},
          clientInfo: {
            name: "astrovisor-skill-doctor",
            version: SKILL_VERSION,
          },
        },
      },
      null,
      true,
    );
    sessionId = initialized.sessionId;
    await postMcp(
      url,
      commonHeaders,
      {
        jsonrpc: "2.0",
        method: "notifications/initialized",
        params: {},
      },
      sessionId,
      false,
    );
    const toolsResult = await postMcp(
      url,
      commonHeaders,
      { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} },
      sessionId,
      true,
    );
    const tools = toolsResult.payload?.result?.tools;
    if (!Array.isArray(tools)) {
      throw new Error("MCP tools/list did not return a tools array");
    }
    return {
      tools: tools.length,
      server: initialized.payload?.result?.serverInfo || null,
    };
  } finally {
    if (sessionId) {
      try {
        await fetch(url, {
          method: "DELETE",
          headers: { ...commonHeaders, "MCP-Session-Id": sessionId },
          signal: AbortSignal.timeout(10_000),
        });
      } catch {
        // Session cleanup is best effort and does not affect the diagnostic.
      }
    }
  }
}

async function postMcp(
  url,
  commonHeaders,
  body,
  sessionId,
  expectPayload,
) {
  const headers = { ...commonHeaders };
  if (sessionId) headers["MCP-Session-Id"] = sessionId;
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  const text = await response.text();
  if (!response.ok) {
    let detail = text.slice(0, 300);
    try {
      detail = JSON.parse(text).error || JSON.parse(text).message || detail;
    } catch {
      // Keep the bounded plain-text detail.
    }
    throw new Error(`MCP HTTP ${response.status}: ${detail}`);
  }
  const payload = expectPayload ? parseMcpPayload(text) : null;
  return {
    payload,
    sessionId: response.headers.get("mcp-session-id") || sessionId,
  };
}

function parseMcpPayload(text) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("MCP returned an empty response");
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);
  const dataLines = trimmed
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .filter(Boolean);
  for (const line of dataLines) {
    try {
      return JSON.parse(line);
    } catch {
      // Continue until a JSON event is found.
    }
  }
  throw new Error("MCP response was neither JSON nor parseable SSE");
}

function printResult(value, args) {
  if (hasOption(args, "json")) {
    console.log(JSON.stringify(value, null, 2));
  } else {
    for (const [key, item] of Object.entries(value)) {
      console.log(`${key}: ${formatPromptValue(item)}`);
    }
  }
}

async function readAllStdin() {
  let output = "";
  for await (const chunk of process.stdin) output += chunk;
  return output;
}

async function readSecret(prompt) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      "Interactive secret entry needs a TTY. Pipe the key to --stdin instead.",
    );
  }
  process.stdout.write(prompt);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding("utf8");
  let value = "";
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      process.stdin.off("data", onData);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
    };
    const onData = (character) => {
      if (character === "\u0003") {
        cleanup();
        reject(new Error("Cancelled"));
      } else if (character === "\r" || character === "\n") {
        cleanup();
        resolve(value);
      } else if (character === "\u007f" || character === "\b") {
        value = value.slice(0, -1);
      } else if (character >= " ") {
        value += character;
      }
    };
    process.stdin.on("data", onData);
  });
}

function shellQuote(value) {
  if (process.platform === "win32") {
    return `"${String(value).replaceAll('"', '\\"')}"`;
  }
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function ensureTrailingSlash(value) {
  return String(value).endsWith("/") ? String(value) : `${value}/`;
}

function compactTimestamp() {
  return new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
}

main().catch((error) => {
  console.error(`AstroVisor skill error: ${error.message || error}`);
  process.exitCode = 1;
});
