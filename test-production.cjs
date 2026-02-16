/* eslint-disable no-console */

// Minimal smoke test:
// 1) Fetch OpenAPI
// 2) Count operations (operationId + method)
// 3) Optionally hit a couple of public endpoints

const baseUrl = (process.env.ASTROVISOR_URL || process.env.ASTRO_API_BASE_URL || "https://astrovisor.io").replace(/\/$/, "");
const openapiUrl = process.env.ASTROVISOR_OPENAPI_URL || `${baseUrl}/openapi.json`;

async function tryFetchJson(url, opts) {
  try {
    const res = await fetch(url, opts);
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = { _nonJson: true, text };
    }
    return { ok: res.ok, status: res.status, json };
  } catch (e) {
    return { ok: false, status: 0, json: { error: e?.message || String(e) } };
  }
}

function countOperations(doc) {
  let count = 0;
  const paths = doc?.paths || {};
  for (const p of Object.keys(paths)) {
    const methods = paths[p] || {};
    for (const m of Object.keys(methods)) {
      const mm = String(m).toLowerCase();
      if (!["get", "post", "put", "patch", "delete"].includes(mm)) continue;
      const op = methods[m];
      if (!op || !op.operationId) continue;
      count += 1;
    }
  }
  return count;
}

async function main() {
  console.log(`AstroVisor base URL: ${baseUrl}`);
  console.log(`OpenAPI URL: ${openapiUrl}`);

  const openapi = await tryFetchJson(openapiUrl);
  if (!openapi.ok) {
    console.error(`Failed to fetch OpenAPI: status=${openapi.status}`);
    console.error(JSON.stringify(openapi.json, null, 2));
    process.exit(1);
  }

  const n = countOperations(openapi.json);
  console.log(`OpenAPI info: ${openapi.json?.info?.title || "?"} v${openapi.json?.info?.version || "?"}`);
  console.log(`Operations: ${n}`);
  if (!n) process.exit(1);

  // Public endpoints, best-effort (won't fail the run).
  const health = await tryFetchJson(`${baseUrl}/health`);
  console.log(`GET /health -> ${health.status}`);

  const authHealth = await tryFetchJson(`${baseUrl}/auth/api/health`);
  console.log(`GET /auth/api/health -> ${authHealth.status}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

