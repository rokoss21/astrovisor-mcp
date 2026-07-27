import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
export const SKILL_ROOT = path.dirname(SCRIPT_DIR);
export const PROFILE_TEMPLATE_PATH = path.join(
  SKILL_ROOT,
  "assets",
  "profile-template.md",
);

export const DEFAULTS = Object.freeze({
  ASTROVISOR_URL: "https://astrovisor.io",
  ASTROVISOR_MCP_URL: "https://mcp.astrovisor.io/",
  ASTROVISOR_DEFAULT_PROFILE: "me",
  ASTROVISOR_PROFILE_UPDATE_POLICY: "ask",
});

export const PROFILE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;
export const UPDATE_POLICIES = new Set(["ask", "auto-explicit", "off"]);
export const TIME_ACCURACIES = new Set([
  "exact",
  "approximate",
  "range",
  "unknown",
]);

const ENV_ORDER = [
  "ASTROVISOR_API_KEY",
  "ASTROVISOR_URL",
  "ASTROVISOR_MCP_URL",
  "ASTROVISOR_DEFAULT_PROFILE",
  "ASTROVISOR_PROFILE_UPDATE_POLICY",
  "ASTROVISOR_PROFILE_DIR",
];

export function resolveSkillHome(env = process.env) {
  if (env.ASTROVISOR_SKILL_HOME) {
    return path.resolve(expandHome(env.ASTROVISOR_SKILL_HOME));
  }
  if (process.platform === "win32" && env.APPDATA) {
    return path.join(env.APPDATA, "AstroVisor");
  }
  const configBase = env.XDG_CONFIG_HOME
    ? path.resolve(expandHome(env.XDG_CONFIG_HOME))
    : path.join(os.homedir(), ".config");
  return path.join(configBase, "astrovisor");
}

export function resolveConfig(env = process.env) {
  const home = resolveSkillHome(env);
  const defaultEnvFile = path.join(home, "skill.env");
  const customEnvFile = env.ASTROVISOR_SKILL_ENV
    ? path.resolve(expandHome(env.ASTROVISOR_SKILL_ENV))
    : null;
  const localEnvFile = path.join(SKILL_ROOT, ".env");

  const localValues = readEnvFile(localEnvFile);
  const defaultValues = readEnvFile(defaultEnvFile);
  const customValues = customEnvFile ? readEnvFile(customEnvFile) : {};

  const values = {
    ...DEFAULTS,
    ...localValues,
    ...defaultValues,
    ...customValues,
  };

  for (const name of ENV_ORDER) {
    if (env[name] !== undefined && env[name] !== "") {
      values[name] = env[name];
    }
  }

  const profileDir = path.resolve(
    expandHome(
      values.ASTROVISOR_PROFILE_DIR || path.join(home, "profiles"),
    ),
  );

  return {
    home,
    defaultEnvFile,
    customEnvFile,
    localEnvFile,
    profileDir,
    values,
    sources: {
      local: fs.existsSync(localEnvFile) ? localEnvFile : null,
      default: fs.existsSync(defaultEnvFile) ? defaultEnvFile : null,
      custom:
        customEnvFile && fs.existsSync(customEnvFile) ? customEnvFile : null,
      process: ENV_ORDER.filter((name) => Boolean(env[name])),
    },
  };
}

export function ensurePrivateDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  try {
    fs.chmodSync(directory, 0o700);
  } catch {
    // Windows and some mounted filesystems do not expose POSIX mode bits.
  }
}

export function writePrivateFile(filePath, content) {
  ensurePrivateDirectory(path.dirname(filePath));
  fs.writeFileSync(filePath, content, { encoding: "utf8", mode: 0o600 });
  try {
    fs.chmodSync(filePath, 0o600);
  } catch {
    // Best effort on non-POSIX filesystems.
  }
}

export function readEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return {};
  const output = {};
  for (const rawLine of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const normalized = line.startsWith("export ") ? line.slice(7).trim() : line;
    const separator = normalized.indexOf("=");
    if (separator < 1) continue;
    const key = normalized.slice(0, separator).trim();
    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) continue;
    output[key] = unquoteEnv(normalized.slice(separator + 1).trim());
  }
  return output;
}

export function writeEnvFile(filePath, values) {
  const lines = [
    "# AstroVisor private skill configuration.",
    "# Never commit this file.",
  ];
  const emitted = new Set();
  for (const name of ENV_ORDER) {
    if (values[name] === undefined || values[name] === "") continue;
    lines.push(`${name}=${quoteEnv(String(values[name]))}`);
    emitted.add(name);
  }
  for (const [name, value] of Object.entries(values).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    if (
      emitted.has(name) ||
      value === undefined ||
      value === "" ||
      !/^[A-Z][A-Z0-9_]*$/.test(name)
    ) {
      continue;
    }
    lines.push(`${name}=${quoteEnv(String(value))}`);
  }
  writePrivateFile(filePath, `${lines.join("\n")}\n`);
}

function quoteEnv(value) {
  if (/^[A-Za-z0-9_./:@+-]+$/.test(value)) return value;
  return JSON.stringify(value);
}

function unquoteEnv(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    if (value.startsWith('"')) {
      try {
        return JSON.parse(value);
      } catch {
        return value.slice(1, -1);
      }
    }
    return value.slice(1, -1);
  }
  return value;
}

export function maskKey(key) {
  if (!key) return null;
  if (key.length <= 10) return `${key.slice(0, 3)}***`;
  return `${key.slice(0, 3)}***${key.slice(-4)}`;
}

export function assertProfileId(id) {
  if (!PROFILE_ID_PATTERN.test(id || "")) {
    throw new Error(
      "Profile id must use 1-64 lowercase letters, numbers, or hyphens.",
    );
  }
  return id;
}

export function profilePath(id, config = resolveConfig()) {
  return path.join(config.profileDir, `${assertProfileId(id)}.md`);
}

export function listProfileFiles(config = resolveConfig()) {
  if (!fs.existsSync(config.profileDir)) return [];
  return fs
    .readdirSync(config.profileDir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.endsWith(".md") &&
        PROFILE_ID_PATTERN.test(entry.name.slice(0, -3)),
    )
    .map((entry) => path.join(config.profileDir, entry.name))
    .sort();
}

export function parseProfileDocument(text, filePath = "<profile>") {
  const normalized = text.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    throw new Error(`${filePath}: missing YAML frontmatter start`);
  }
  const closing = normalized.indexOf("\n---\n", 4);
  if (closing < 0) {
    throw new Error(`${filePath}: missing YAML frontmatter end`);
  }
  const rawFrontmatter = normalized.slice(4, closing);
  const body = normalized.slice(closing + 5);
  const data = {};
  const order = [];

  for (const [index, rawLine] of rawFrontmatter.split("\n").entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    if (/^\s/.test(rawLine)) {
      throw new Error(
        `${filePath}:${index + 2}: nested YAML is not supported; use flat fields`,
      );
    }
    const match = /^([a-z][a-z0-9_]*):(?:\s*(.*))?$/.exec(line);
    if (!match) {
      throw new Error(`${filePath}:${index + 2}: invalid frontmatter line`);
    }
    const [, key, rawValue = ""] = match;
    if (Object.hasOwn(data, key)) {
      throw new Error(`${filePath}:${index + 2}: duplicate field ${key}`);
    }
    data[key] = parseYamlScalar(rawValue);
    order.push(key);
  }

  return { data, order, body };
}

export function readProfileFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Profile not found: ${filePath}`);
  }
  return {
    filePath,
    ...parseProfileDocument(fs.readFileSync(filePath, "utf8"), filePath),
  };
}

export function serializeProfileDocument({ data, order = [], body = "" }) {
  const keys = [
    ...order.filter((key, index) => order.indexOf(key) === index),
    ...Object.keys(data)
      .filter((key) => !order.includes(key))
      .sort(),
  ];
  const lines = ["---"];
  for (const key of keys) {
    if (!Object.hasOwn(data, key)) continue;
    lines.push(`${key}: ${serializeYamlScalar(data[key])}`);
  }
  lines.push("---", "", body.replace(/^\n+/, "").replace(/\s+$/, ""), "");
  return lines.join("\n");
}

function parseYamlScalar(rawValue) {
  const value = rawValue.trim();
  if (value === "") return "";
  if (
    value.startsWith('"') ||
    value.startsWith("[") ||
    value.startsWith("{")
  ) {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error(`Invalid JSON-style YAML value: ${value}`);
    }
  }
  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'");
  }
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null" || value === "~") return null;
  if (/^-?(?:\d+|\d*\.\d+)$/.test(value)) return Number(value);
  return value;
}

function serializeYamlScalar(value) {
  if (value === null || value === undefined) return '""';
  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value) || typeof value === "object") {
    return JSON.stringify(value);
  }
  return JSON.stringify(String(value));
}

export function loadTemplate(id, timestamp = new Date().toISOString()) {
  assertProfileId(id);
  const raw = fs
    .readFileSync(PROFILE_TEMPLATE_PATH, "utf8")
    .replaceAll("{{id}}", id)
    .replaceAll("{{timestamp}}", timestamp);
  return parseProfileDocument(raw, PROFILE_TEMPLATE_PATH);
}

export function normalizeSetValue(raw) {
  const value = String(raw).trim();
  if (
    value.startsWith("[") ||
    value.startsWith("{") ||
    value.startsWith('"')
  ) {
    try {
      return JSON.parse(value);
    } catch {
      throw new Error(`Cannot parse value as JSON: ${value}`);
    }
  }
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?(?:\d+|\d*\.\d+)$/.test(value)) return Number(value);
  return value;
}

export function validateProfile(profile) {
  const data = profile.data || profile;
  const errors = [];
  const warnings = [];

  if (!PROFILE_ID_PATTERN.test(String(data.id || ""))) {
    errors.push("id is missing or invalid");
  }
  if (!String(data.display_name || "").trim()) {
    warnings.push("display_name is missing");
  }
  if (data.profile_type && data.profile_type !== "person") {
    warnings.push(`profile_type is ${data.profile_type}, expected person`);
  }
  if (data.birth_date && !isValidDateString(String(data.birth_date))) {
    errors.push("birth_date must be a real YYYY-MM-DD date");
  }
  if (data.birth_time && !isValidTimeString(String(data.birth_time))) {
    errors.push("birth_time must be HH:MM or HH:MM:SS");
  }
  if (
    data.birth_time_accuracy &&
    !TIME_ACCURACIES.has(String(data.birth_time_accuracy))
  ) {
    errors.push(
      "birth_time_accuracy must be exact, approximate, range, or unknown",
    );
  }
  if (
    data.profile_update_policy &&
    data.profile_update_policy !== "inherit" &&
    !UPDATE_POLICIES.has(String(data.profile_update_policy))
  ) {
    errors.push(
      "profile_update_policy must be inherit, ask, auto-explicit, or off",
    );
  }
  if (data.birth_latitude !== "" && data.birth_latitude != null) {
    const latitude = Number(data.birth_latitude);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      errors.push("birth_latitude must be between -90 and 90");
    }
  }
  if (data.birth_longitude !== "" && data.birth_longitude != null) {
    const longitude = Number(data.birth_longitude);
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      errors.push("birth_longitude must be between -180 and 180");
    }
  }
  if (data.birth_timezone && !isValidTimezone(String(data.birth_timezone))) {
    errors.push("birth_timezone must be a valid IANA timezone");
  }
  if (
    data.birth_time_accuracy === "unknown" &&
    String(data.birth_time || "").trim()
  ) {
    warnings.push(
      "birth_time is set while birth_time_accuracy is unknown; confirm intent",
    );
  }
  if (
    data.birth_time_accuracy !== "unknown" &&
    data.birth_date &&
    !data.birth_time
  ) {
    warnings.push("birth_time is missing despite a non-unknown accuracy");
  }
  if (data.consent_to_store !== true) {
    warnings.push("consent_to_store is not true");
  }

  const hasBirthDate = Boolean(data.birth_date);
  const hasBirthTime =
    Boolean(data.birth_time) &&
    data.birth_time_accuracy !== "unknown";
  const hasCoordinates =
    data.birth_latitude !== "" &&
    data.birth_latitude != null &&
    data.birth_longitude !== "" &&
    data.birth_longitude != null &&
    Number.isFinite(Number(data.birth_latitude)) &&
    Number.isFinite(Number(data.birth_longitude));
  const hasTimezone = Boolean(data.birth_timezone);
  const hasPlace = Boolean(data.birth_place || data.birth_city);

  const missingExactBirth = [];
  if (!hasBirthDate) missingExactBirth.push("birth_date");
  if (!hasBirthTime) missingExactBirth.push("birth_time");
  if (!hasCoordinates) {
    missingExactBirth.push("birth_latitude", "birth_longitude");
  }
  if (!hasTimezone) missingExactBirth.push("birth_timezone");

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    readiness: {
      exact_birth: missingExactBirth.length === 0,
      date_only: hasBirthDate,
      location_enrichment_needed:
        hasPlace && (!hasCoordinates || !hasTimezone),
      numerology: Boolean(
        hasBirthDate &&
          (data.numerology_name ||
            data.birth_full_name ||
            data.full_name ||
            data.display_name),
      ),
      relationship_allowed: data.allow_relationship_comparison === true,
    },
    missing: {
      exact_birth: [...new Set(missingExactBirth)],
    },
  };
}

export function renderProfileRequest(profile, format = "core") {
  const data = profile.data || profile;
  const validation = validateProfile(data);
  if (!validation.readiness.exact_birth) {
    throw new Error(
      `Profile is not ready for an exact-birth request. Missing: ${validation.missing.exact_birth.join(", ")}`,
    );
  }
  const localDatetime = `${data.birth_date}T${normalizeTime(data.birth_time)}`;
  const location =
    data.birth_place ||
    [data.birth_city, data.birth_admin_area, data.birth_country]
      .filter(Boolean)
      .join(", ");
  const name =
    data.display_name ||
    data.preferred_name ||
    data.full_name ||
    data.birth_full_name;

  if (format === "core") {
    return {
      name,
      datetime: localDatetime,
      latitude: Number(data.birth_latitude),
      longitude: Number(data.birth_longitude),
      location,
      timezone: data.birth_timezone,
    };
  }
  if (format === "birth") {
    return {
      name,
      birth_datetime: localDatetime,
      birth_latitude: Number(data.birth_latitude),
      birth_longitude: Number(data.birth_longitude),
      birth_location: location,
      birth_timezone: data.birth_timezone,
    };
  }
  throw new Error("Format must be core or birth.");
}

export function summarizeProfile(profile) {
  const data = profile.data || profile;
  const validation = validateProfile(data);
  return {
    id: data.id,
    display_name:
      data.display_name || data.preferred_name || data.full_name || data.id,
    relationship_to_owner: data.relationship_to_owner || null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    exact_birth_ready: validation.readiness.exact_birth,
    date_only_ready: validation.readiness.date_only,
    consent_to_store: data.consent_to_store === true,
    updated_at: data.updated_at || null,
  };
}

export function resolveProfile(query, profiles) {
  const needle = String(query || "").trim().toLocaleLowerCase();
  if (!needle) return [];
  const score = (data) => {
    const id = String(data.id || "").toLocaleLowerCase();
    const exactFields = [
      id,
      data.display_name,
      data.preferred_name,
      data.full_name,
    ]
      .filter(Boolean)
      .map((value) => String(value).toLocaleLowerCase());
    const aliases = Array.isArray(data.aliases)
      ? data.aliases.map((value) => String(value).toLocaleLowerCase())
      : [];
    if (id === needle) return 100;
    if (exactFields.includes(needle) || aliases.includes(needle)) return 90;
    if (
      [...exactFields, ...aliases].some((value) => value.startsWith(needle))
    ) {
      return 60;
    }
    if (
      [...exactFields, ...aliases].some((value) => value.includes(needle))
    ) {
      return 30;
    }
    return 0;
  };
  return profiles
    .map((profile) => ({ profile, score: score(profile.data || profile) }))
    .filter((item) => item.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        String(a.profile.data.id).localeCompare(String(b.profile.data.id)),
    )
    .map((item) => item.profile);
}

export function expandHome(input) {
  const value = String(input);
  if (value === "~") return os.homedir();
  if (value.startsWith("~/") || value.startsWith("~\\")) {
    return path.join(os.homedir(), value.slice(2));
  }
  return value;
}

function isValidDateString(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidTimeString(value) {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) return false;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = match[3] === undefined ? 0 : Number(match[3]);
  return hours >= 0 && hours <= 23 && minutes <= 59 && seconds <= 59;
}

function isValidTimezone(value) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function normalizeTime(value) {
  return String(value).length === 5 ? `${value}:00` : String(value);
}
