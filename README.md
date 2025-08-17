# 🌟 AstroVisor MCP Server

[![npm version](https://badge.fury.io/js/astrovisor-mcp.svg)](https://badge.fury.io/js/astrovisor-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**The most comprehensive astrology MCP server for Claude Desktop** - Now with **100% API coverage** and **50 professional astrology tools**!

## 🎉 Version 2.4.0 - Complete API Coverage!

This major release achieves **100% coverage** of all AstroVisor API endpoints with **50 MCP tools** across **14 astrology modules**!

## ✨ Features

### 🏗️ Complete Module Coverage (14 modules, 100% API coverage)

- 🌟 **Natal Astrology** (2 tools) - Birth chart analysis
- 🕉️ **Vedic Astrology** (2 tools) - Jyotish system
- ☀️ **Solar Returns** (3 tools) - Annual & lunar returns
- 📈 **Progressions** (7 tools) - Secondary, solar arc, tertiary
- 🎯 **Directions** (2 tools) - Solar arc timing
- 💕 **Relationships** (3 tools) - Synastry & composite
- 🗺️ **Astrocartography** (3 tools) - Location astrology
- ⏰ **Electional** (2 tools) - Optimal timing
- ❓ **Horary** (2 tools) - Question astrology
- 🌍 **Transits** (3 tools) - Current planetary movements
- ⚡ **Human Design** (2 tools) - Energy types & strategy
- 🔢 **Numerology** (2 tools) - Life path & destiny
- 🎭 **Matrix of Destiny** (2 tools) - 22 archetypes
- 🐉 **BaZi Chinese Astrology** (15 tools) - Four Pillars system

### 🎯 50 Professional Tools

All tools include comprehensive analysis, recommendations, and insights suitable for professional astrology practice.

## 🚀 Quick Start

### Installation

```bash
npm install -g astrovisor-mcp
```

### Claude Desktop Configuration

Add to your Claude Desktop MCP settings (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "astrovisor": {
      "command": "astrovisor-mcp",
      "env": {
        "ASTROVISOR_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Get Your API Key

Visit [AstroVisor.io](https://astrovisor.io) to get your API key.

## 📚 Complete Tool Reference

### 🌟 Natal Astrology
- `calculate_natal_chart` - Complete birth chart with planets, houses, aspects
- `get_natal_info` - Information about natal astrology

### 🕉️ Vedic Astrology (Jyotish)
- `calculate_vedic_chart` - Vedic chart with divisional charts and dashas
- `get_vedic_info` - Information about Vedic astrology

### ☀️ Solar Returns  
- `calculate_solar_return` - Annual solar return chart
- `calculate_lunar_return` - Monthly lunar return chart
- `get_solar_info` - Information about returns

### 📈 Progressions (7 tools)
- `calculate_secondary_progressions` - Day = year progressions
- `calculate_solar_arc_progressions` - Solar arc progressions  
- `calculate_tertiary_progressions` - Monthly progressions
- `compare_progressions` - Compare different methods
- `create_progressions_timeline` - Timeline of progressions
- `analyze_progressions_aspects` - Progression aspects
- `get_progressions_info` - Information about progressions

### 🎯 Directions
- `calculate_directions` - Solar arc directions for timing
- `get_directions_info` - Information about directions

### 💕 Relationships
- `analyze_synastry` - Synastry between two people
- `calculate_composite_chart` - Composite relationship chart
- `get_relationships_info` - Information about relationship analysis

### 🗺️ Astrocartography
- `calculate_astrocartography_map` - World map with planetary lines
- `find_best_locations` - Find optimal places to live/visit
- `get_astrocartography_info` - Information about astrocartography

### ⏰ Electional Astrology
- `find_best_times` - Find optimal timing for events
- `get_electional_info` - Information about electional methods

### ❓ Horary Astrology  
- `analyze_horary_question` - Traditional horary analysis
- `get_horary_info` - Information about horary methods

### 🌍 Transits
- `calculate_transits` - Current transits to natal chart
- `find_transits_in_period` - Find transits in date range
- `get_transits_info` - Information about transits

### ⚡ Human Design
- `calculate_human_design` - Type, strategy, authority, profile
- `get_human_design_info` - Information about Human Design

### 🔢 Numerology
- `calculate_numerology` - Life path, destiny, personal year numbers
- `get_numerology_info` - Information about numerology

### 🎭 Matrix of Destiny
- `calculate_matrix_of_destiny` - 22 archetypes analysis
- `get_matrix_info` - Information about Matrix system

### 🐉 BaZi Chinese Astrology (15 tools)
- `calculate_bazi_chart` - Four Pillars chart
- `analyze_bazi_personality` - Personality analysis
- `calculate_bazi_compatibility` - Relationship compatibility
- `get_bazi_info` - System information
- `analyze_bazi_twelve_palaces` - Life areas analysis
- `analyze_bazi_life_focus` - Life priorities
- `analyze_bazi_symbolic_stars` - Symbolic stars
- `calculate_bazi_luck_pillars` - 10-year cycles
- `calculate_bazi_annual_forecast` - Yearly forecast
- `get_bazi_complete_analysis` - Complete analysis
- `get_bazi_career_guidance` - Career guidance
- `get_bazi_relationship_guidance` - Relationship guidance  
- `get_bazi_health_insights` - Health insights
- `analyze_bazi_nayin` - Nayin (60 sounds) analysis
- `analyze_bazi_useful_god` - Beneficial elements

## 💡 Usage Examples

### Basic Natal Chart
```
Please calculate my natal chart for John Doe, born July 12, 1988 at 12:15 PM in Novosibirsk, Russia.
```

### BaZi Analysis  
```
Analyze the BaZi personality for a male born on July 12, 1988 at 12:15 PM in Novosibirsk, Russia.
```

### Relationship Compatibility
```
Calculate BaZi compatibility between John (male, July 12, 1988, 12:15 PM, Novosibirsk) and Jane (female, May 15, 1990, 2:30 PM, Moscow).
```

### Current Transits
```
Show me current planetary transits for today for someone born July 12, 1988 at 12:15 PM in Novosibirsk.
```

### Find Best Location  
```
Where should I move for better career opportunities? I was born July 12, 1988 at 12:15 PM in Novosibirsk, Russia.
```

## 🔧 Technical Details

### API Integration
- **Base URL**: https://astrovisor.io
- **Authentication**: Bearer token via `ASTROVISOR_API_KEY`
- **Timeout**: 30 seconds per request
- **Format**: JSON responses with comprehensive data

### Parameters

Most tools require basic birth data:
- `name` - Person's name
- `datetime` - ISO 8601 format (e.g., "1988-07-12T12:15:00")
- `latitude` - Birth latitude (e.g., 55.0084)  
- `longitude` - Birth longitude (e.g., 82.9357)
- `location` - Birth location (e.g., "Novosibirsk, Russia")
- `timezone` - Timezone (e.g., "Asia/Novosibirsk")

Additional parameters:
- `gender` - For BaZi tools: "male" or "female"
- `target_date` - For transits/progressions: "YYYY-MM-DD"
- `person1_*`, `person2_*` - For compatibility tools

### Error Handling
- Comprehensive error messages
- Status code reporting  
- Timeout handling
- Rate limiting respect

## 🌟 Why AstroVisor MCP?

- **Complete Coverage**: 100% of AstroVisor API endpoints
- **Professional Quality**: Suitable for professional astrology practice
- **Multi-System**: 14 different astrology systems
- **Easy Integration**: Simple Claude Desktop setup
- **Comprehensive**: 50 specialized tools
- **Reliable**: Production-tested API backend
- **Up-to-date**: Regular updates and improvements

## 📊 Compatibility Matrix

| Module | Tools | Coverage | Status |
|--------|-------|----------|---------|
| Natal | 2 | 100% | ✅ Complete |
| Vedic | 2 | 100% | ✅ Complete |  
| Solar | 3 | 100% | ✅ Complete |
| Progressions | 7 | 100% | ✅ Complete |
| Directions | 2 | 100% | ✅ Complete |
| Relationships | 3 | 100% | ✅ Complete |
| Astrocartography | 3 | 100% | ✅ Complete |
| Electional | 2 | 100% | ✅ Complete |
| Horary | 2 | 100% | ✅ Complete |
| Transits | 3 | 100% | ✅ Complete |
| Human Design | 2 | 100% | ✅ Complete |
| Numerology | 2 | 100% | ✅ Complete |
| Matrix | 2 | 100% | ✅ Complete |
| BaZi | 15 | 100% | ✅ Complete |

## 🔄 Updates & Migration

### From v2.3.x to v2.4.0
No breaking changes! All existing tools work identically.
22 new tools added as bonus features.

### Automatic Updates
The MCP server automatically handles API changes and improvements.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/rokoss21/astrovisor-mcp/issues)
- **Documentation**: [AstroVisor API Docs](https://astrovisor.io/docs)
- **Email**: emil@astrovisor.io

## 📜 License

MIT License - see [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

- Swiss Ephemeris for astronomical calculations
- AstroVisor API team for comprehensive backend
- Claude Desktop team for MCP framework
- Astrology community for feedback and testing

---

**Perfect for professional astrologers, students, and enthusiasts using Claude Desktop!**

🌟 **Star us on GitHub** if you find this useful!
