---
name: astrovisor
description: Set up and use AstroVisor MCP for personal astrology, natal charts, transits, compatibility, synastry, Tarot, numerology, Human Design, BaZi, Jyotish, forecasting, rectification, and other AstroVisor calculations. Use when the user asks for an astrology or esoteric calculation, wants to create or enrich reusable Markdown profiles for themselves or other people, mentions birth date/time/place, needs AstroVisor API-key or MCP onboarding, or wants a prior AstroVisor result explained or compared.
---

# AstroVisor

Use AstroVisor MCP as the calculation source and this skill's Markdown profiles as
user-controlled memory. Never invent astronomical results, endpoint schemas, birth
times, coordinates, timezones, or profile facts.

## Start every task

1. Determine the subject:
   - “me/my” means the configured default profile;
   - a name or profile id means that profile;
   - a relationship calculation requires every involved profile;
   - an unknown person requires a new profile or one-time birth data.
2. Run the profile CLI to inspect only the needed metadata:

   ```bash
   node "<skill-root>/scripts/astrovisor-skill.mjs" profile list --json
   ```

   Resolve `<skill-root>` from the current `SKILL.md` path. Claude Code may also
   provide `${CLAUDE_SKILL_DIR}`.
3. If credentials or connectivity may be missing, run:

   ```bash
   node "<skill-root>/scripts/astrovisor-skill.mjs" doctor --json
   ```

4. Load the selected profile only when needed:

   ```bash
   node "<skill-root>/scripts/astrovisor-skill.mjs" profile show <id> --json
   node "<skill-root>/scripts/astrovisor-skill.mjs" profile validate <id> --json
   ```

Do not dump every profile into context. Do not treat the default profile as consent
to use another person's data.

## Onboard credentials

If `doctor` reports a missing key, ask for an AstroVisor dashboard API key beginning
with `pk-`. Offer either:

- the secure interactive command:

  ```bash
  node "<skill-root>/scripts/astrovisor-skill.mjs" config set-key
  ```

- an existing `ASTROVISOR_API_KEY` environment variable.

If the user supplies the key to the agent and authorizes saving it, pass it to
`config set-key --stdin` without echoing it. Never place a real key in `SKILL.md`, a
profile, source control, a generated answer, or command output. The default secret
file is outside the skill and is created with private permissions. A local skill
`.env` is supported only when the user explicitly requests it.

If MCP tools are unavailable, read `references/client-setup.md` and give the exact
setup for the current host. Do not claim that a calculation ran until an MCP tool
actually returns it.

## Create and enrich people profiles

Keep one Markdown file per person. Read `references/profile-schema.md` before
creating a profile or changing unfamiliar fields.

Create a draft or run the essential-data wizard:

```bash
node "<skill-root>/scripts/astrovisor-skill.mjs" profile create <id>
node "<skill-root>/scripts/astrovisor-skill.mjs" profile create <id> --interactive
```

The minimum exact-birth dataset is:

- display name;
- local birth date;
- local birth time and its accuracy;
- birth place;
- decimal latitude and longitude;
- IANA timezone such as `Europe/Minsk`.

If place is known but coordinates/timezone are missing, use AstroVisor operation
`search_locations_api_search_locations_post`. Ask the user to choose when multiple
locations match, then save the confirmed normalized place, coordinates, and
timezone. Never silently choose a same-named city.

If birth time is unknown, record `birth_time_accuracy: "unknown"` and leave the
time empty. Explain which calculations are time-sensitive. Never silently substitute
12:00 or another conventional time.

### Progressive enrichment

Read `profile_update_policy` from the profile, then the global
`ASTROVISOR_PROFILE_UPDATE_POLICY`:

- `ask` (default): propose exact field changes and save only after confirmation;
- `auto-explicit`: save facts the user states explicitly for an unambiguous profile,
  then briefly report what changed;
- `off`: use supplied data for the current request without modifying profiles.

Never promote an inference to a confirmed field. Put a potentially useful inference
under “Candidate facts awaiting confirmation” only with permission. Keep AI-derived
observations labeled, dated, and separate from user-confirmed facts.

Use `profile set` for deterministic scalar updates:

```bash
node "<skill-root>/scripts/astrovisor-skill.mjs" profile set <id> \
  --set 'birth_time_accuracy=exact' \
  --set 'focus_areas=["relationships","career"]'
```

Normal file editing is appropriate for narrative Markdown sections and life-event
tables. Preserve frontmatter keys, privacy boundaries, provenance, and update log.

## Run calculations

Prefer the six compact MCP tools. Follow this order:

1. Call `astrovisor_conventions` once per session when available.
2. Search/list operations with `astrovisor_openapi_search` or
   `astrovisor_openapi_list`.
3. Inspect the selected operation with `astrovisor_openapi_get`.
4. Validate profile completeness against the returned required fields.
5. Render a standard request seed when useful:

   ```bash
   node "<skill-root>/scripts/astrovisor-skill.mjs" profile render <id> --format core
   node "<skill-root>/scripts/astrovisor-skill.mjs" profile render <id> --format birth
   ```

6. Call `astrovisor_request` with the exact operation id and schema.
7. For large results, use `view: "compact"`, `store: true`, and a modest
   `tokenBudget`; retrieve targeted paths later with `astrovisor_result_get`.

For two or more people, load and validate each profile separately. Map each profile
to the operation's actual request fields rather than concatenating or overwriting
them. Ask which relationship, date, location, or forecast horizon matters when that
changes the calculation.

Read `references/request-contract.md` before constructing an unfamiliar or
multi-person payload. Read `references/workflows.md` for operation selection,
unknown birth time, location enrichment, rectification, and response handling.

## Interpret responsibly

- Separate returned calculation facts from interpretation.
- State the system, settings, subjects, and relevant time window.
- Describe uncertainty from approximate/unknown birth data.
- Treat astrology and divination as reflective or entertainment-oriented material,
  not scientific certainty.
- Do not use results as medical, legal, financial, safety, or mental-health
  diagnosis/advice.
- Avoid deterministic claims about death, illness, pregnancy, crime, fidelity, or
  another person's hidden intentions.
- Respect profile `sensitive_topics`, `avoid_topics`, and consent fields.
- Do not expose private profile data unless the user requests it.

## Resources

- `scripts/astrovisor-skill.mjs`: credentials, installation, profiles, rendering,
  client snippets, and diagnostics.
- `scripts/astrovisor-mcp-launcher.mjs`: stdio launcher that reads the private skill
  environment without putting the key in client configuration.
- `references/profile-schema.md`: complete profile schema and enrichment rules.
- `references/workflows.md`: calculation and interpretation workflows.
- `references/request-contract.md`: strict live-schema request construction and
  profile-to-API mapping.
- `references/client-setup.md`: Codex, ChatGPT desktop, Claude Code, and Claude
  Desktop setup.
- `assets/profile-template.md`: maximum-fields Markdown profile template.
- `assets/skill.env.example`: non-secret configuration template.
