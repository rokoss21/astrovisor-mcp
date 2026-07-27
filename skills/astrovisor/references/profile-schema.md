# AstroVisor person profile schema

## Contents

- Storage and privacy
- Identity and relationships
- Birth data
- Current location
- Calculation preferences
- Narrative context
- Progressive enrichment
- Validation and request mapping

## Storage and privacy

Store one person per `.md` file. The default directory is the private
`profiles/` directory under the AstroVisor skill home. Override it with
`ASTROVISOR_PROFILE_DIR`.

Never store an API key in a profile. Treat all profile files as private personal
data. Do not commit them by default.

The frontmatter is a flat YAML-compatible map. Keep array values as JSON-style
arrays. Keep narrative or repeating records in Markdown sections rather than
inventing nested frontmatter.

Core control fields:

- `schema_version`: template version.
- `id`: lowercase stable id used in commands and relationships.
- `profile_type`: normally `person`.
- `consent_to_store`: whether the data owner/user approved persistence.
- `consent_scope`: normally `private-local`.
- `profile_update_policy`: `inherit`, `ask`, `auto-explicit`, or `off`.
- `allow_relationship_comparison`: permission to use the profile in
  multi-person analysis.
- `allow_rectification`: permission to use life events for birth-time
  rectification.
- `data_owner`, `data_provided_by`: provenance labels.
- `created_at`, `updated_at`: ISO timestamps.

## Identity and relationships

Use `display_name` for ordinary output. Preserve distinct names when relevant:

- `preferred_name`
- `full_name`
- `birth_full_name`
- `current_legal_name`
- `numerology_name`
- `aliases`

Do not demand legal names unless the chosen calculation needs them. Numerology may
use a full birth name, current name, or both; inspect the operation schema.

Relationship and language fields:

- `pronouns`
- `gender_identity`
- `sex_at_birth`
- `bazi_gender`
- `relationship_to_owner`
- `related_profile_ids`
- `tags`
- `primary_language`
- `locale`
- `interpretation_language`

Ask only for sex/gender fields required by the selected system. Do not infer them
from a name, photograph, relationship, or pronouns.

## Birth data

Store birth date and time as local civil values:

- `birth_date`: `YYYY-MM-DD`
- `birth_time`: `HH:MM` or `HH:MM:SS`
- `birth_time_accuracy`: `exact`, `approximate`, `range`, or `unknown`
- `birth_time_range_start`, `birth_time_range_end`: time window when known

Location fields:

- `birth_place`, `birth_city`, `birth_admin_area`, `birth_country`
- `birth_latitude`, `birth_longitude`: decimal coordinates
- `birth_timezone`: IANA timezone, not only an offset
- `birth_utc_offset`, `birth_dst_status`: optional historical clarification
- `birth_calendar`: normally `gregorian`

Provenance and rectification:

- `birth_data_source`
- `birth_data_confidence`
- `birth_certificate_checked`
- `rectification_status`
- `rectified_birth_time`
- `rectification_confidence`

Never overwrite the reported birth time with a rectified value. Keep both and state
which one a calculation uses.

## Current location

Forecasts may use birthplace, current place, event place, or a requested relocation
place. Keep the current residence separately:

- `current_place`, `current_city`, `current_country`
- `current_latitude`, `current_longitude`, `current_timezone`
- `residence_history_available`

Always inspect the selected operation. Do not replace birth coordinates with current
coordinates merely because the calculation concerns the present.

## Calculation preferences

These are defaults, not substitutes for endpoint schemas:

- `zodiac_type`: `tropical` or `sidereal`
- `house_system`
- `sidereal_ayanamsa`
- `preferred_astrology_systems`
- `preferred_divination_systems`
- `human_design_variant`
- `numerology_system`
- `tarot_deck`
- `forecast_horizon`
- `interpretation_depth`
- `interpretation_tone`
- `focus_areas`
- `sensitive_topics`
- `avoid_topics`
- `goals`

If an API operation uses different names or allowed values, follow
`astrovisor_openapi_get`; ask before changing a durable preference.

## Narrative context

Use the Markdown body for information that does not fit a scalar field:

- current goals and questions;
- work, education, health, home, relationships, finances, and worldview;
- dated life events with location, time accuracy, source, and confidence;
- relationships to other profile ids;
- interpretation preferences and privacy boundaries;
- selected calculation settings;
- concise prior-result notes;
- candidate facts awaiting confirmation;
- update log.

Do not fill every section merely because it exists. Capture only information the
user provides and wants stored.

## Progressive enrichment

Apply the configured update policy:

1. Identify the exact target profile.
2. Separate explicit facts from interpretations or guesses.
3. Normalize safe formats without changing meaning.
4. Under `ask`, show proposed field/section changes and wait for confirmation.
5. Under `auto-explicit`, save only explicit, unambiguous facts and report the
   change afterward.
6. Under `off`, do not persist.
7. Update `updated_at` and add a concise update-log entry.

Never silently store secrets, contact/payment identifiers, medical diagnoses,
political/religious inferences, sexual orientation, or allegations. Store sensitive
facts only when explicitly supplied, relevant, and approved.

## Validation and request mapping

Run:

```bash
node "<skill-root>/scripts/astrovisor-skill.mjs" profile validate <id> --json
```

For common request shapes:

```bash
node "<skill-root>/scripts/astrovisor-skill.mjs" profile render <id> --format core
node "<skill-root>/scripts/astrovisor-skill.mjs" profile render <id> --format birth
```

`core` maps to:

```json
{
  "name": "Display name",
  "datetime": "YYYY-MM-DDTHH:MM:SS",
  "latitude": 0,
  "longitude": 0,
  "location": "City, Country",
  "timezone": "Area/City"
}
```

`birth` uses the equivalent `birth_*` keys. These are only seeds. Inspect the
actual operation metadata and add, rename, or omit fields as required.
