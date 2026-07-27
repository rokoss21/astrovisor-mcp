# AstroVisor MCP request contract

## Contents

- Mandatory discovery sequence
- Request envelope
- Profile-to-body mapping
- Location requests
- One-person requests
- Multi-person requests
- Dates and forecasts
- Response shaping
- Errors and retries

## Mandatory discovery sequence

Never guess a REST path, operation id, body shape, enum, or required field.

For every new calculation type:

1. Call `astrovisor_openapi_search` or `astrovisor_openapi_list`.
2. Select an operation by purpose, method, path, summary, and tags.
3. Call `astrovisor_openapi_get` with that operation id or supported alias.
4. Read:
   - canonical `operationId`;
   - `method` and `path`;
   - path/query parameters;
   - `requestBodySchema`;
   - `llmHints.requiredBodyFields`;
   - `llmHints.exampleBody`;
   - aliases and conventions.
5. Create the body from the live example and replace values with confirmed profile
   data. Remove example-only values that are not appropriate.
6. Check every required field before calling `astrovisor_request`.

Repeat discovery when the user changes calculation type. Cached metadata is fine
within one session, but the live OpenAPI schema remains authoritative.

## Request envelope

Call the compact MCP tool with this outer structure:

```json
{
  "operationId": "<canonical operationId from astrovisor_openapi_get>",
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

- Put URL-template variables only in `path`.
- Put query-string values only in `query`.
- Put JSON request content only in `body`.
- Do not wrap the API body inside another `data`, `payload`, or `request` object
  unless the live schema explicitly requires it.
- Preserve booleans and numbers as JSON types.
- Use ISO local datetimes and IANA timezones when the schema requests them.
- Do not send empty strings as substitutes for required fields.

## Profile-to-body mapping

Render a normalized seed:

```bash
node "<skill-root>/scripts/astrovisor-skill.mjs" profile render <id> --format core
node "<skill-root>/scripts/astrovisor-skill.mjs" profile render <id> --format birth
```

Core aliases:

| Profile | Common API field |
| --- | --- |
| `display_name` | `name` |
| `birth_date` + `birth_time` | `datetime` |
| `birth_latitude` | `latitude` |
| `birth_longitude` | `longitude` |
| `birth_place` | `location` |
| `birth_timezone` | `timezone` |

Birth aliases use `birth_datetime`, `birth_latitude`, `birth_longitude`,
`birth_location`, and `birth_timezone`.

This mapping is a seed, not a schema override. Prefer exact live field names from
`astrovisor_openapi_get`. AstroVisor MCP normalizes common core/birth aliases, but
the agent should still construct the canonical shape when metadata provides it.

## Location requests

For `search_locations_api_search_locations_post`:

```json
{
  "operationId": "search_locations_api_search_locations_post",
  "body": {
    "query": "Minsk, Belarus"
  },
  "response": {
    "view": "full",
    "tokenBudget": 6000,
    "store": false
  }
}
```

Present multiple matches and wait for a choice before writing coordinates/timezone.

## One-person requests

Start from exactly one rendered profile. Add calculation-specific options from the
live schema. Keep birth datetime distinct from `target_date`, `event_datetime`,
`year`, or another forecast parameter.

Before calling, state internally:

- selected profile id;
- time accuracy;
- selected operation id;
- missing required fields;
- settings added from user preferences.

If required fields are missing, ask rather than manufacture values.

## Multi-person requests

Render each profile separately. Inspect how the operation names subjects, for
example `person1/person2`, `partner1/partner2`, nested `birth_data`, or another
schema. Construct that exact shape.

Never flatten two profiles into one object. Never reuse the first person's
coordinates/timezone for the second. Require relationship-comparison consent for
stored third-party profiles.

For example, only after live metadata confirms that relationship synastry still
uses `PartnerData` with `partner1` and `partner2`, the body may look like:

```json
{
  "partner1": {
    "name": "Person One",
    "datetime": "1990-05-15T14:30:00",
    "latitude": 55.7558,
    "longitude": 37.6176,
    "location": "Moscow, Russia",
    "timezone": "Europe/Moscow"
  },
  "partner2": {
    "name": "Person Two",
    "datetime": "1992-08-03T09:10:00",
    "latitude": 53.9006,
    "longitude": 27.559,
    "location": "Minsk, Belarus",
    "timezone": "Europe/Minsk"
  }
}
```

If metadata instead returns `person1/person2`, different nested keys, or additional
required fields, use that current structure and discard this example.

## Dates and forecasts

Distinguish:

- local birth datetime;
- current instant;
- requested target date/range;
- event or relocation place;
- forecast timezone.

If the endpoint expects a date, send `YYYY-MM-DD`. If it expects datetime, follow
the schema example and timezone semantics. Do not append `Z` to a local birth time
unless the endpoint explicitly expects UTC.

## Response shaping

Use compact output for large calculations:

```json
{
  "view": "compact",
  "tokenBudget": 12000,
  "store": true
}
```

Use `responsePath`, `select`, `where`, `sort`, `responseLimit`, or nested
`response.query` only when their fields match the desired output. Inspect metadata
before follow-up retrieval.

## Errors and retries

- `400/422`: re-read the live schema and correct the smallest invalid part.
- `401/403`: run credential diagnostics; never ask for the key again if the local
  key is present but merely invalid without first reporting that distinction.
- `404` operation/path: search/list again; do not assert that a capability is absent
  until discovery confirms it.
- `429`: report rate limiting and wait/retry only with user approval or documented
  retry metadata.
- truncated result: use `astrovisor_result_get`; do not recalculate.

Report the canonical operation id, status, and correction. Do not expose the API
key or raw private profile data in error output.
