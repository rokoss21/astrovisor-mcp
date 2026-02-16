# Changelog

## [4.2.6] - 2026-02-16

### 📘 Documentation
- Added a production-ready **Universal LLM Prompt** to README for cross-client MCP usage.
- Added compact call/follow-up templates for large responses and transit-heavy workflows.

### 🔧 Packaging
- Removed accidental self-dependency (`astrovisor-mcp`) from `dependencies`.
- Synced internal server version constants to `4.2.6`.

## [4.2.3] - 2026-02-16

### 🤝 Cross-LLM Interoperability
- Added automatic request body profile normalization across common AstroVisor field variants:
  - core profile: `datetime/latitude/longitude/location/timezone`
  - birth profile: `birth_datetime/birth_latitude/birth_longitude/birth_location/birth_timezone`
- Added compatibility alias resolution for operations/tool names:
  - supports legacy short aliases and old verb variants in full mode calls
  - supports operation alias fallback in compact mode (`operationId`)
- Added richer AI guidance metadata to `astrovisor_openapi_get`:
  - `requestBodySchema`
  - `aliases`
  - `llmHints` (`requiredBodyFields`, `exampleBody`, profile + quick instructions)
- Added new compact tool: `astrovisor_conventions`
  - returns global interoperability conventions for non-Claude clients.

### 🔧 Packaging
- Bumped version to `4.2.3`.
- Removed accidental self-dependency from `package.json`.

## [4.2.2] - 2026-02-16

### 🔧 Reliability
- Publishes the Claude stability fixes from `4.2.1` with default size budgeting and stringified-JSON `body` parsing in all server modes.

## [4.2.1] - 2026-02-16

### 🛡️ Claude Large-Result Stability Fixes
- Added default global byte budget for serialization when no explicit `response.tokenBudget` is provided:
  - env: `ASTROVISOR_DEFAULT_TOKEN_BUDGET` (default: `250000` bytes)
- Applied the default budget across stdio MCP and both HTTP wrappers for:
  - `astrovisor_request`
  - `astrovisor_result_get`
- Added automatic parsing for `body` when tools pass JSON as a string:
  - supports Claude calls where `body` is accidentally serialized as text
  - returns a clear validation error if string JSON is invalid
- Keeps heavy endpoints (for example yearly transit forecasts) below Claude tool-result size limits by default.

## [4.2.0] - 2026-02-16

### 🎯 Universal Precision Serialization
- Added a universal response shaping DSL for heavy endpoints:
  - `select`, `where`, `sort`
  - `cursor`, `offset`, `limit` (aliases for paging)
  - optional nested `response.query` block
- Added operator-based filtering for array items:
  - `_eq`, `_ne`, `_gt`, `_gte`, `_lt`, `_lte`
  - `_in`, `_nin`
  - `_contains`, `_startswith`, `_endswith`
  - `_exists`, `_regex`
- Added deterministic window metadata in response:
  - `meta.query.totalBefore`, `totalMatched`, `offset`, `limit`, `nextCursor`
- Added discoverability hints:
  - `meta.availablePaths` for targeted follow-up extraction.
- Added adaptive byte-budget compaction:
  - `response.tokenBudget` to keep payload size bounded while preserving key signal.
- Serialization envelope upgraded to `format: "astrovisor.serialized.v2"`.

## [4.1.0] - 2026-02-16

### 🧠 Token-Efficient Serialization
- Added universal response serialization envelope for MCP outputs:
  - `meta` (sizes/truncation/view/path/window)
  - `summary` (high-signal shape info)
  - `data` (token-optimized payload)
- Added response shaping controls via `response` options:
  - `view`, `include`, `exclude`, `maxItems`, `maxDepth`, `maxString`, `maxObjectKeys`
  - `responsePath`, `responseOffset`, `responseLimit`
- Added in-memory result caching with `resultId` and new tool:
  - `astrovisor_result_get`
- Applied compact serialization flow across stdio MCP and HTTP/JSON-RPC wrappers.

## [4.0.3] - 2026-02-16

### 🔍 Search & Discovery
- Improved `astrovisor_openapi_search` to better match multilingual queries (e.g. `таро` -> `tarot`).
- Added `astrovisor_openapi_list` with filters (`tag`, `method`, `pathPrefix`) and pagination (`offset`, `limit`) to inspect all endpoints directly.

## [4.0.2] - 2026-02-16

### 🛠️ Compatibility
- Default tool mode is now `compact` to avoid Claude Desktop context limit issues (no more 456 tool definitions sent at once).
- New compact tools:
  - `astrovisor_openapi_search`
  - `astrovisor_openapi_get`
  - `astrovisor_request` (call any endpoint by `operationId`)
- Set `ASTROVISOR_TOOL_MODE=full` to generate the full per-endpoint tool list (advanced use only).

## [4.0.1] - 2026-02-16

### 🐛 Fixes
- Tool names are now capped at 64 characters (Claude tool definition limit). Long names are shortened with a stable hash suffix.

## [4.0.0] - 2026-02-16 - OPENAPI SYNC (BREAKING)

### ⚠️ Breaking Changes
- Tools are now generated from AstroVisor OpenAPI `operationId` (tool names: `astrovisor_<operationId>`)
- Tool arguments are now namespaced as `{ path, query, body }` to avoid collisions

### ✨ Improvements
- Full endpoint coverage by syncing to `openapi.json` (as of API `v8.0.0`: **456 operations**)
- Optional HTTP wrappers:
  - `npm run start:http` (simple REST wrapper)
  - `npm run start:jsonrpc` (MCP JSON-RPC over HTTP)

---

## [2.4.0] - 2025-08-17 - COMPLETE API COVERAGE

### 🎉 Major Release - Full API Integration

This is a **MAJOR RELEASE** that achieves **100% API coverage** with all documented endpoints!

### ✨ New Features

#### 23 New MCP Tools Added:
- **Info endpoints for ALL modules** (14 tools)
- **Astrocartography module** (3 tools)
- **Directions module** (2 tools) 
- **Electional astrology** (2 tools)
- **Horary astrology** (2 tools)
- **Relationship analysis** (3 tools)
- **Solar returns** (3 tools)
- **Enhanced transits** (1 tool)

#### Complete Module Coverage:
- ✅ ASTROCARTOGRAPHY: 3/3 endpoints (100%)
- ✅ BAZI: 14/14 endpoints (100%)
- ✅ DIRECTIONS: 2/2 endpoints (100%)
- ✅ ELECTIONAL: 2/2 endpoints (100%)
- ✅ HORARY: 2/2 endpoints (100%)
- ✅ HUMAN-DESIGN: 2/2 endpoints (100%)
- ✅ JYOTISH: 2/2 endpoints (100%)
- ✅ MATRIX: 2/2 endpoints (100%)
- ✅ NATAL: 2/2 endpoints (100%)
- ✅ NUMEROLOGY: 2/2 endpoints (100%)
- ✅ PROGRESSIONS: 7/7 endpoints (100%)
- ✅ RELATIONSHIP: 3/3 endpoints (100%)
- ✅ SOLAR: 3/3 endpoints (100%)
- ✅ TRANSITS: 3/3 endpoints (100%)

### 📊 Statistics
- **Total MCP Tools**: 50 (was 28)
- **API Coverage**: 100% (49/49 documented endpoints)
- **New Tools Added**: 22
- **Modules**: 14 complete modules

### 🔧 Technical Improvements

#### New Tools by Category:

**Info & Documentation Tools:**
- `get_natal_info` - Natal astrology information
- `get_vedic_info` - Vedic astrology information  
- `get_solar_info` - Solar returns information
- `get_progressions_info` - Progressions information
- `get_directions_info` - Directions information
- `get_relationships_info` - Relationship analysis info
- `get_astrocartography_info` - Astrocartography info
- `get_electional_info` - Electional astrology info
- `get_horary_info` - Horary methods info
- `get_transits_info` - Transits information
- `get_human_design_info` - Human Design info
- `get_numerology_info` - Numerology information
- `get_matrix_info` - Matrix of Destiny info

**Astrocartography Tools:**
- `calculate_astrocartography_map` - Generate world map with planetary lines
- `find_best_locations` - Find optimal places based on astro lines
- `get_astrocartography_info` - Module information

**Solar Returns Tools:**
- `calculate_solar_return` - Annual solar return charts
- `calculate_lunar_return` - Monthly lunar return charts  
- `get_solar_info` - Solar returns information

**Relationship Analysis Tools:**
- `analyze_synastry` - Synastry between two people
- `calculate_composite_chart` - Composite relationship chart
- `get_relationships_info` - Relationship methods info

**Directions Tools:**
- `calculate_directions` - Solar arc directions
- `get_directions_info` - Directions information

**Electional Astrology Tools:**
- `find_best_times` - Find optimal timing for events
- `get_electional_info` - Electional methods info

**Horary Astrology Tools:**
- `analyze_horary_question` - Traditional horary analysis
- `get_horary_info` - Horary methods info

**Enhanced Transits:**
- `find_transits_in_period` - Find transits in date range
- `get_transits_info` - Transits module info

### 🔄 API Improvements

#### Fixed Data Transformations:
- **BaZi Compatibility**: Nested person1/person2 structure
- **Transits**: Proper field mapping (datetime → birth_datetime)
- **Relationships**: Nested person data structures

#### Enhanced Error Handling:
- Better error messages with tool names
- Status code reporting
- Comprehensive error context

### 📚 Updated Documentation

#### Schema Improvements:
- All tools have complete input schemas
- Proper required field definitions
- Enhanced descriptions and examples
- Consistent parameter naming

### 🚀 Migration from v2.3.x

No breaking changes for existing tools. All v2.3.x tools work identically.
New tools are additive and follow existing patterns.

---

## [2.3.3] - 2025-08-17

### 🔧 Bug Fixes
- Fixed authentication issues with Bearer token
- Improved environment variable handling
- Fixed shebang in executable for npx compatibility

### 🚀 Performance
- Better error handling
- Timeout improvements
- Connection stability enhancements

## Previous versions...
- [2.3.2] - Authentication fixes
- [2.3.1] - Progressions hotfix
- [2.3.0] - Added progressions tools
- [2.2.x] - Transits fixes
- [2.1.x] - BaZi enhancements  
- [2.0.x] - Major BaZi integration
- [1.x.x] - Initial releases
