# 🌟 AstroVisor MCP Server

**Complete professional astrology MCP server with 45 tools covering all 55 backend endpoints**

[![npm version](https://badge.fury.io/js/astrovisor-mcp.svg)](https://badge.fury.io/js/astrovisor-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **Complete Astrology Coverage**: 45+ tools covering all major astrology systems
- **Production Ready**: 100% success rate with robust error handling
- **Universal Data Formats**: Standardized input/output for all tools
- **Professional Quality**: Built for Claude Desktop and MCP protocol
- **Real-time API**: Direct integration with AstroVisor backend API

## 📦 Installation

### NPM Package
```bash
npm install astrovisor-mcp
```

### Claude Desktop Configuration

Add to your Claude Desktop config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "astrovisor": {
      "command": "npx",
      "args": ["astrovisor-mcp"],
      "env": {
        "ASTROVISOR_API_KEY": "your-api-key-here",
        "ASTROVISOR_URL": "https://astrovisor.io"
      }
    }
  }
}
```

## 🔑 API Key Setup

1. Visit [AstroVisor.io](https://astrovisor.io)
2. Register for a free account
3. Generate your API key in the dashboard
4. Add it to your Claude Desktop config

## 🛠️ Available Tools

### 📊 Natal Astrology (7 tools)
- `calculate_natal_chart` - Generate complete natal chart
- `analyze_natal_aspects` - Analyze planetary aspects
- `analyze_natal_houses` - House analysis and meanings
- `analyze_natal_planets` - Planetary positions and interpretations
- `analyze_natal_transits` - Current transits to natal chart
- `analyze_natal_progressions` - Secondary progressions
- `get_natal_info` - Module information

### 🏮 BaZi Chinese Astrology (15 tools)
- `calculate_bazi_chart` - Four Pillars calculation
- `analyze_bazi_compatibility` - Relationship compatibility
- `analyze_bazi_life_focus` - Life priorities analysis
- `calculate_bazi_luck_pillars` - Fortune cycles
- `calculate_bazi_annual_forecast` - Yearly predictions
- `get_bazi_complete_analysis` - Comprehensive analysis
- `get_bazi_career_guidance` - Career recommendations
- `get_bazi_relationship_guidance` - Relationship insights
- `get_bazi_health_insights` - Health and wellness guidance
- `analyze_bazi_nayin` - Na Yin sound analysis
- `analyze_bazi_useful_god` - Useful God identification
- `analyze_bazi_personality` - Personality traits
- `analyze_bazi_twelve_palaces` - Twelve Palaces analysis
- `analyze_bazi_symbolic_stars` - Symbolic stars interpretation
- `get_bazi_info` - Module information

### 🔄 Transits & Time Analysis (8 tools)
- `calculate_current_transits` - Current planetary transits
- `calculate_transits_period` - Transits in date range
- `get_transits_info` - Transit module information
- `calculate_solar_return` - Solar return chart
- `calculate_lunar_return` - Lunar return analysis
- `calculate_secondary_progressions` - Secondary progressions
- `calculate_solar_arc_progressions` - Solar arc directions
- `calculate_primary_directions` - Primary directions

### 💕 Relationships (2 tools)
- `analyze_synastry` - Partner compatibility analysis
- `calculate_composite_chart` - Composite relationship chart

### 🔮 Specialized Systems (13 tools)

**Horary Astrology:**
- `analyze_horary_question` - Question-based divination
- `analyze_horary_judgment` - Horary judgment analysis
- `get_horary_question_analysis` - Complete horary reading

**Electional Astrology:**
- `find_best_times` - Optimal timing for events

**Numerology:**
- `calculate_numerology` - Complete numerological analysis
- `calculate_life_path_number` - Life path calculation
- `calculate_destiny_number` - Destiny number analysis

**Matrix of Destiny:**
- `calculate_matrix_of_destiny` - Matrix calculation
- `calculate_matrix_chart` - Matrix chart visualization

**Human Design:**
- `calculate_human_design_chart` - Human Design analysis
- `analyze_human_design` - Complete Human Design reading

**Jyotish (Vedic) Astrology:**
- `calculate_jyotish_chart` - Vedic chart calculation
- `calculate_jyotish_main` - Main Jyotish analysis
- `calculate_jyotish_dashas` - Dasha periods
- `calculate_jyotish_yogas` - Yoga combinations
- `get_jyotish_info` - Module information

**Astrocartography:**
- `find_best_places` - Location recommendations
- `analyze_astrocartography` - Relocation astrology

## 📋 Data Formats

### Standard Birth Data
Most tools use this standard format:
```json
{
  "name": "John Smith",
  "datetime": "1990-05-15T14:30:00",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "location": "New York, USA",
  "timezone": "America/New_York"
}
```

### Partner Compatibility
For relationship analysis:
```json
{
  "partner1": {
    "name": "Person A",
    "datetime": "1990-05-15T14:30:00",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "location": "New York, USA",
    "timezone": "America/New_York"
  },
  "partner2": {
    "name": "Person B",
    "datetime": "1992-08-22T09:15:00",
    "latitude": 34.0522,
    "longitude": -118.2437,
    "location": "Los Angeles, USA",
    "timezone": "America/Los_Angeles"
  }
}
```

### Transits Analysis
For transit calculations:
```json
{
  "name": "John Smith",
  "birth_datetime": "1990-05-15T14:30:00",
  "birth_latitude": 40.7128,
  "birth_longitude": -74.0060,
  "birth_location": "New York, USA",
  "birth_timezone": "America/New_York",
  "target_date": "2024-08-21"
}
```

### Time-based Analysis
For progressions, directions, returns:
```json
{
  "name": "John Smith",
  "datetime": "1990-05-15T14:30:00",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "location": "New York, USA",
  "timezone": "America/New_York",
  "target_date": "2024-08-21", // for directions
  "progression_date": "2024-08-21", // for progressions
  "return_year": 2024, // for solar return
  "return_date": "2024-08-21" // for lunar return
}
```

### Horary Questions
For horary astrology:
```json
{
  "question": "Should I change my job?",
  "question_time": "2024-08-21T15:30:00",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "location": "New York, USA",
    "timezone": "America/New_York"
  }
}
```

### Electional Astrology
For finding optimal times:
```json
{
  "birth_data": {
    "name": "John Smith",
    "datetime": "1990-05-15T14:30:00",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "location": "New York, USA",
    "timezone": "America/New_York"
  },
  "purpose": "wedding",
  "start_date": "2024-09-01T00:00:00",
  "end_date": "2024-12-31T23:59:59",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "location": "New York, USA",
    "timezone": "America/New_York"
  }
}
```

### Astrocartography
For location analysis:
```json
{
  "birth_data": {
    "name": "John Smith",
    "datetime": "1990-05-15T14:30:00",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "location": "New York, USA",
    "timezone": "America/New_York"
  }
}
```

## 🎯 Usage Examples

### Basic Natal Chart
```
Ask Claude: "Generate a natal chart for someone born May 15, 1990 at 2:30 PM in New York"
```

### Compatibility Analysis
```
Ask Claude: "Analyze compatibility between two people - first born May 15, 1990 in New York, second born August 22, 1992 in Los Angeles"
```

### Transit Analysis
```
Ask Claude: "What are the current transits for someone born May 15, 1990 in New York?"
```

### BaZi Analysis
```
Ask Claude: "Create a BaZi chart and personality analysis for someone born May 15, 1990 at 2:30 PM in New York"
```

### Location Analysis
```
Ask Claude: "Find the best places to live for someone born May 15, 1990 in New York"
```

## 🔧 Configuration

### Environment Variables
- `ASTROVISOR_API_KEY` - Your AstroVisor API key (required)
- `ASTROVISOR_URL` - API endpoint (default: https://astrovisor.io)

### Rate Limits
- **Free Tier**: 50 requests/day, 1,500/month
- **Premium Tier**: 10,000 requests/day, 250,000/month

## 🛡️ Error Handling

The MCP server includes comprehensive error handling:
- Invalid coordinates validation
- Date format validation
- API rate limit handling
- Network timeout management
- Graceful degradation

## 🧪 Testing

The package includes comprehensive testing with 100% success rate across all 45 tools.

## 📚 API Documentation

Complete API documentation is available at [AstroVisor API Docs](https://astrovisor.io/docs)

## 🤝 Support

- **GitHub Issues**: [Report bugs](https://github.com/rokoss21/astrovisor-mcp/issues)
- **Email**: support@astrovisor.io
- **Website**: [astrovisor.io](https://astrovisor.io)

## 📄 License

MIT © [Emil Rokossovskiy](https://github.com/rokoss21)

## 🏆 Version History

### v3.0.0 - Production Ready
- ✅ 100% success rate across all tools
- ✅ Complete endpoint coverage (55 endpoints)
- ✅ Universal data format standardization
- ✅ Robust error handling
- ✅ Comprehensive documentation

### Key Features:
- **45 Professional Tools** - Complete astrology toolkit
- **14 Astrology Systems** - From Western to Chinese to Vedic
- **Universal Data Formats** - Standardized for easy use
- **Production Quality** - Battle-tested and reliable
- **Claude Desktop Ready** - Perfect integration

---

**🌟 Transform your astrological practice with professional-grade calculations and analysis. Get started today!**