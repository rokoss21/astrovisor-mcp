import type { OperationMeta } from "./openapi.js";

const CORE_PROFILE_FIELDS = ["name", "datetime", "latitude", "longitude", "location", "timezone"] as const;
const BIRTH_PROFILE_FIELDS = [
  "name",
  "birth_datetime",
  "birth_latitude",
  "birth_longitude",
  "birth_location",
  "birth_timezone",
] as const;

const CORE_ALIASES: Record<string, string[]> = {
  name: ["full_name", "person_name"],
  datetime: ["birth_datetime", "date_time", "dateTime", "birthDateTime", "birth_date_time"],
  latitude: ["birth_latitude", "lat", "birth_lat", "geo_lat"],
  longitude: ["birth_longitude", "lon", "lng", "birth_lon", "birth_lng", "geo_lng"],
  location: ["birth_location", "place", "birth_place", "city"],
  timezone: ["birth_timezone", "tz", "time_zone"],
};

const BIRTH_ALIASES: Record<string, string[]> = {
  birth_datetime: ["datetime", "date_time", "dateTime", "birthDateTime", "birth_date_time"],
  birth_latitude: ["latitude", "lat", "birth_lat", "geo_lat"],
  birth_longitude: ["longitude", "lon", "lng", "birth_lon", "birth_lng", "geo_lng"],
  birth_location: ["location", "place", "birth_place", "city"],
  birth_timezone: ["timezone", "tz", "time_zone"],
};

export const ASTROVISOR_LLM_CONVENTIONS = {
  version: 1,
  bodyProfiles: {
    core_profile: {
      required: CORE_PROFILE_FIELDS,
      usedBy: [
        "/api/natal/chart",
        "/api/bazi/chart",
      ],
    },
    birth_profile: {
      required: BIRTH_PROFILE_FIELDS,
      usedBy: [
        "/api/transits/current",
        "/api/transits/period",
        "/api/transits/forecast",
      ],
    },
  },
  guidance: [
    "Prefer exact required fields from astrovisor_openapi_get.llmHints.requiredBodyFields.",
    "If endpoint expects core profile, use datetime/latitude/longitude/location/timezone.",
    "If endpoint expects birth profile, use birth_datetime/birth_latitude/birth_longitude/birth_location/birth_timezone.",
    "In compact mode, call astrovisor_openapi_get first, then astrovisor_request with returned operationId.",
  ],
};

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toSet(values: string[] | undefined): Set<string> {
  return new Set((values || []).filter(Boolean));
}

function getBodySchemaProperties(op: OperationMeta): Record<string, any> {
  const props = op.requestBodySchema?.properties;
  return isObject(props) ? props : {};
}

function getExpectedBodyKeys(op: OperationMeta): Set<string> {
  return new Set(Object.keys(getBodySchemaProperties(op)));
}

function getRequiredBodyKeys(op: OperationMeta): Set<string> {
  const req = op.requestBodySchema?.required;
  return toSet(Array.isArray(req) ? req : []);
}

function applyFirstAlias(
  out: Record<string, any>,
  targetKey: string,
  aliases: string[],
  applied: Record<string, string>,
) {
  if (out[targetKey] !== undefined && out[targetKey] !== null) return;
  for (const sourceKey of aliases) {
    if (out[sourceKey] !== undefined && out[sourceKey] !== null) {
      out[targetKey] = out[sourceKey];
      applied[targetKey] = sourceKey;
      return;
    }
  }
}

function detectProfile(op: OperationMeta): "core" | "birth" | "mixed" | "unknown" {
  const expected = getExpectedBodyKeys(op);
  const required = getRequiredBodyKeys(op);
  const hasCore = CORE_PROFILE_FIELDS.some((k) => expected.has(k) || required.has(k));
  const hasBirth = BIRTH_PROFILE_FIELDS.some((k) => expected.has(k) || required.has(k));
  if (hasCore && hasBirth) return "mixed";
  if (hasCore) return "core";
  if (hasBirth) return "birth";
  return "unknown";
}

export function normalizeRequestBodyForOperation(
  op: OperationMeta,
  body: unknown,
): { body: unknown; normalized: boolean; notes?: Record<string, any> } {
  if (!isObject(body)) return { body, normalized: false };

  const out: Record<string, any> = { ...body };
  const appliedAliases: Record<string, string> = {};
  const expected = getExpectedBodyKeys(op);
  const required = getRequiredBodyKeys(op);
  const profile = detectProfile(op);
  const shouldFillCore = profile === "core" || profile === "mixed";
  const shouldFillBirth = profile === "birth" || profile === "mixed";

  if (shouldFillCore || (profile === "unknown" && ("birth_datetime" in out || "birth_latitude" in out))) {
    for (const [key, aliases] of Object.entries(CORE_ALIASES)) {
      applyFirstAlias(out, key, aliases, appliedAliases);
    }
  }

  if (shouldFillBirth || (profile === "unknown" && ("datetime" in out || "latitude" in out))) {
    for (const [key, aliases] of Object.entries(BIRTH_ALIASES)) {
      applyFirstAlias(out, key, aliases, appliedAliases);
    }
  }

  const removedKeys: string[] = [];
  if (op.requestBodySchema?.type === "object" && op.requestBodySchema?.additionalProperties === false && expected.size > 0) {
    for (const key of Object.keys(out)) {
      if (!expected.has(key)) {
        delete out[key];
        removedKeys.push(key);
      }
    }
  }

  const missingRequired = Array.from(required).filter((k) => out[k] === undefined || out[k] === null);
  const normalized = Object.keys(appliedAliases).length > 0 || removedKeys.length > 0;
  if (!normalized) return { body: out, normalized: false };

  return {
    body: out,
    normalized: true,
    notes: {
      profile,
      appliedAliases,
      removedKeys,
      missingRequired,
    },
  };
}

function sampleValueForField(field: string, schema: any): any {
  const f = String(field).toLowerCase();
  if (f.includes("date") || f.includes("time")) return "2000-01-01T12:00:00";
  if (f === "start_date" || f === "end_date") return "2000-01-01";
  if (f.includes("latitude")) return 40.7128;
  if (f.includes("longitude")) return -74.006;
  if (f.includes("timezone")) return "America/New_York";
  if (f.includes("location")) return "New York, USA";
  if (f === "name") return "John Doe";
  if (Array.isArray(schema?.enum) && schema.enum.length) return schema.enum[0];
  if (schema?.type === "number" || schema?.type === "integer") return 0;
  if (schema?.type === "boolean") return false;
  return "<value>";
}

export function buildOperationLlmHints(op: OperationMeta): Record<string, any> {
  const bodyProps = getBodySchemaProperties(op);
  const requiredBodyFields = Array.from(getRequiredBodyKeys(op));
  const profile = detectProfile(op);
  const exampleBody: Record<string, any> = {};
  for (const field of requiredBodyFields) {
    exampleBody[field] = sampleValueForField(field, bodyProps[field]);
  }

  const aliasHelp = {
    toCoreProfile: CORE_ALIASES,
    toBirthProfile: BIRTH_ALIASES,
  };

  return {
    profile,
    requiredBodyFields,
    optionalBodyFields: Object.keys(bodyProps).filter((k) => !requiredBodyFields.includes(k)),
    exampleBody,
    aliasHelp,
    quickInstructions: [
      "Use requiredBodyFields exactly when possible.",
      "If you only have birth_* fields and endpoint expects core profile, MCP normalizes automatically.",
      "If you only have core fields and endpoint expects birth profile, MCP normalizes automatically.",
    ],
  };
}
