# Changelog

## [4.0.0] - 2026-02-16 - OPENAPI SYNC (BREAKING)

### ⚠️ Breaking Changes
- Tools are now generated from AstroVisor OpenAPI `operationId` (tool names: `astrovisor_<operationId>`)
- Tool arguments are now namespaced as `{ path, query, body }` to avoid collisions

### ✨ Improvements
- Full endpoint coverage by syncing to `openapi.json` (as of API `v8.0.0`: **456 operations**)

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
