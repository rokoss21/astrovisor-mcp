# Changelog

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
- `get_horary_info` - Horary astrology info
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

### 📝 Full Tool List (50 tools)

**Core Astrology (8):**
- calculate_natal_chart, get_natal_info
- calculate_vedic_chart, get_vedic_info  
- calculate_human_design, get_human_design_info
- calculate_numerology, get_numerology_info
- calculate_matrix_of_destiny, get_matrix_info

**BaZi Chinese Astrology (15):**
- calculate_bazi_chart, analyze_bazi_personality
- calculate_bazi_compatibility, get_bazi_info
- analyze_bazi_twelve_palaces, analyze_bazi_life_focus
- analyze_bazi_symbolic_stars, calculate_bazi_luck_pillars
- calculate_bazi_annual_forecast, get_bazi_complete_analysis
- get_bazi_career_guidance, get_bazi_relationship_guidance
- get_bazi_health_insights, analyze_bazi_nayin
- analyze_bazi_useful_god

**Progressions & Timing (13):**
- calculate_secondary_progressions, calculate_solar_arc_progressions
- calculate_tertiary_progressions, compare_progressions
- create_progressions_timeline, analyze_progressions_aspects
- get_progressions_info
- calculate_directions, get_directions_info
- calculate_solar_return, calculate_lunar_return, get_solar_info
- find_best_times, get_electional_info

**Relationship & Location (9):**
- analyze_synastry, calculate_composite_chart, get_relationships_info
- calculate_astrocartography_map, find_best_locations, get_astrocartography_info
- calculate_transits, find_transits_in_period, get_transits_info

**Specialized Analysis (5):**
- analyze_horary_question, get_horary_info

### 🎯 Perfect for Claude Desktop

All 50 tools are fully compatible with Claude Desktop MCP integration.
Complete professional astrology analysis at your fingertips!

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
