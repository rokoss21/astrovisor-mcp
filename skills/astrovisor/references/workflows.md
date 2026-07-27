# AstroVisor workflows

## Contents

- Operation selection
- New-person intake
- Location enrichment
- Unknown or approximate birth time
- One-person calculations
- Multi-person calculations
- Forecasts and current location
- Rectification
- Large results and follow-ups
- Profile updates after a result

## Operation selection

1. Convert the user's desired outcome into search terms, not a guessed endpoint.
2. Search/list OpenAPI operations.
3. Inspect the best candidate with `astrovisor_openapi_get`.
4. Confirm that required data and system match the user's intent.
5. Ask only questions that affect the selected operation.
6. Call through `astrovisor_request`.

Typical categories include natal, transits, progressions, solar return, directions,
synastry, composite/relationship, Jyotish, BaZi, Human Design, numerology, Gene
Keys, Tarot, Lenormand, astrocartography, local space, parans, horary, elections,
and calendars. The live OpenAPI schema is authoritative.

## New-person intake

Start with purpose and consent:

1. Who is the calculation about?
2. Should the data be used once or saved as a private profile?
3. What calculation or question is wanted?
4. Collect only the fields required for that calculation.
5. Offer extended profile enrichment after the first useful result.

For a reusable exact-birth profile, request name, date, local time, time accuracy,
place, and permission to resolve coordinates/timezone. Ask for system-specific
identity/name fields only when needed.

## Location enrichment

When a profile has a place string but lacks coordinates or an IANA timezone:

1. Call `search_locations_api_search_locations_post` with
   `{ "query": "<place>" }`.
2. If one exact match exists, show the normalized place, country, coordinates, and
   timezone.
3. If multiple matches exist, ask the user to choose.
4. Save only the confirmed result.

Do not geocode an approximate historical place into a modern city without noting
the normalization.

## Unknown or approximate birth time

- `unknown`: leave `birth_time` empty.
- `approximate`: preserve the supplied time and explain sensitivity.
- `range`: preserve both range endpoints.
- `exact`: record the source when known.

Before running a time-sensitive system, explain affected outputs such as houses,
angles, Moon position near boundaries, Human Design gates, divisional charts, or
timing. Prefer time-independent calculations when they answer the request. Never
present a placeholder-time chart as exact.

## One-person calculations

Resolve one profile, validate it, inspect the operation, then map only relevant
fields. Keep current/event dates separate from birth datetime. Include profile
preferences only when the endpoint accepts them.

Return:

1. calculation identity and settings;
2. concise factual highlights from the response;
3. interpretation tied to those highlights;
4. uncertainty/limitations;
5. optional next calculations.

## Multi-person calculations

Resolve every person explicitly. Check `allow_relationship_comparison` before using
a stored third-party profile. Validate each birth dataset independently.

Do not merge profile objects. Inspect whether the endpoint expects `person1`,
`person2`, `partner`, arrays, or named birth fields. Ask for relationship context
and desired focus because compatibility, business partnership, family dynamics, and
event timing are different questions.

For groups, state pair/group coverage and avoid ranking people's worth.

## Forecasts and current location

Clarify:

- target date or date range;
- birthplace versus current/event location;
- local timezone for the forecast;
- desired granularity and focus.

Use compact summaries first. For long periods, retrieve statistics or strongest
events, then page targeted windows instead of returning a raw full timeline.

## Rectification

Use only with explicit permission. Collect multiple dated, verifiable life events
with location and time accuracy. Preserve the reported time and candidate rectified
time separately. Describe rectification as uncertain hypothesis testing, not proof.

## Large results and follow-ups

Default to:

```json
{
  "response": {
    "view": "compact",
    "store": true,
    "tokenBudget": 12000
  }
}
```

Inspect `meta.availablePaths`, `meta.pathFound`, `meta.truncated`, query counts, and
`resultId`. Use `astrovisor_result_get` with a narrower `responsePath`, `select`,
`where`, `sort`, and pagination instead of repeating the calculation.

## Profile updates after a result

Candidate durable updates include:

- confirmed normalized location/timezone;
- corrected birth-data accuracy/source;
- user-selected calculation settings;
- changed interpretation preferences;
- concise result id/date/system note;
- a user-confirmed life event.

Do not store calculated placements as identity facts. Put optional prior-result
notes in the Markdown body with the calculation date and system.
