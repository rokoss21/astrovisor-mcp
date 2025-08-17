# 🌟 AstroVisor MCP Server

Professional astrology tools for Claude Desktop via the Model Context Protocol (MCP).

🆕 **NEW in v2.2.0**: Complete **BaZi (Chinese Astrology)** system with **15 specialized tools** including Four Pillars, Luck Pillars, Symbolic Stars, and comprehensive life guidance!

[![npm version](https://badge.fury.io/js/astrovisor-mcp.svg)](https://badge.fury.io/js/astrovisor-mcp) ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

## 🚀 Quick Start

### Installation via npx (Recommended)
Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "astrovisor": {
      "command": "npx",
      "args": ["-y", "astrovisor-mcp@2.2.0"],
      "env": {
        "ASTROVISOR_API_KEY": "your-api-key-here",
        "ASTROVISOR_URL": "https://astrovisor.io"
      }
    }
  }
}
```

### Global Installation
```bash
npm install -g astrovisor-mcp
```

## 🔑 Getting Your API Key

1. Visit [astrovisor.io](https://astrovisor.io)
2. Sign up for an account
3. Get your API key from the dashboard
4. Replace `your-api-key-here` in the config above

## 🛠️ Available Tools

### 🎯 Core Astrology Modules (6 tools)

**calculate_natal_chart** - Complete natal chart analysis with planets, houses, and aspects

**calculate_vedic_chart** - Vedic astrology (Jyotish) with sidereal zodiac  

**calculate_human_design** - Human Design bodygraph with type, strategy, and authority

**calculate_numerology** - Complete numerological analysis

**calculate_matrix_of_destiny** - Matrix of Destiny with arcanas and energy centers

**calculate_transits** - Current planetary transits and their influences

### 🐲 Complete BaZi Chinese Astrology System (15 tools!)

#### Core BaZi Analysis:
**calculate_bazi_chart** - Complete BaZi Four Pillars of Destiny chart
**analyze_bazi_personality** - Deep personality analysis via BaZi system
**calculate_bazi_compatibility** - Relationship compatibility between two people
**get_bazi_info** - General information about BaZi methodology

#### Advanced BaZi Techniques:
**analyze_bazi_twelve_palaces** - Twelve life areas (palaces) analysis
**analyze_bazi_life_focus** - Main life themes and focus areas
**analyze_bazi_symbolic_stars** - Symbolic Stars (Shen Sha) analysis
**calculate_bazi_luck_pillars** - 10-year luck periods analysis
**calculate_bazi_annual_forecast** - Yearly influences and predictions

#### Comprehensive BaZi Reports:
**get_bazi_complete_analysis** - Full comprehensive BaZi analysis
**get_bazi_career_guidance** - Professional and career guidance
**get_bazi_relationship_guidance** - Love and marriage guidance  
**get_bazi_health_insights** - Health and wellness insights
**analyze_bazi_nayin** - Traditional Nayin (sound) element analysis
**analyze_bazi_useful_god** - Beneficial elements and remedies

## 📝 Example Usage in Claude

### Core Astrology:
- "Calculate my natal chart for January 1, 1990 at 12:00 PM in New York"
- "What are my current planetary transits?"
- "What's my Human Design type?"

### BaZi Chinese Astrology:
- "Calculate my complete BaZi chart for March 15, 1985 in Beijing"
- "Analyze my BaZi personality and character traits" 
- "What do my BaZi Luck Pillars say about my 10-year cycles?"
- "Give me BaZi career guidance based on my birth data"
- "Analyze my BaZi compatibility with someone born June 20, 1992"
- "What are my BaZi Symbolic Stars and their meanings?"
- "Show me my BaZi annual forecast for this year"

## 🌟 NEW: Complete BaZi System v2.2.0

### What's Included:
- **15 Specialized BaZi Tools**: From basic charts to advanced techniques
- **Four Pillars Analysis**: Complete Year, Month, Day, Hour pillars
- **Luck Pillars**: 10-year life period analysis
- **Symbolic Stars**: Traditional Shen Sha interpretations  
- **Life Guidance**: Career, relationships, health insights
- **Compatibility Analysis**: Deep relationship analysis
- **Annual Forecasting**: Yearly influences and predictions

### BaZi Features:
- **Traditional Methods**: Based on authentic Chinese astrology
- **Gender Considerations**: Male/female specific interpretations
- **Comprehensive Reports**: From quick insights to full analysis
- **Modern Integration**: Combined with psychological insights
- **Professional Grade**: Suitable for professional astrologers

## 📋 Configuration Files Location

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
- **Linux**: `~/.config/claude/claude_desktop_config.json`

## 🔧 Environment Variables

- **ASTROVISOR_API_KEY** - Your Astrovisor API key (required)
- **ASTROVISOR_URL** - API server URL (default: https://astrovisor.io)

## 🆘 Troubleshooting

### MCP Server Not Found
- Ensure Node.js 18+ is installed
- Verify configuration syntax
- Restart Claude Desktop after changes

### Invalid API Key  
- Get your key from [astrovisor.io](https://astrovisor.io)
- Key should start with `pk-`
- Set properly in environment variables

## 📞 Support

- **Website**: [astrovisor.io](https://astrovisor.io)
- **API Documentation**: [astrovisor.io/docs](https://astrovisor.io/docs)
- **Email**: support@astrovisor.io

## 🌟 Features

- 🔮 **21 Professional Tools**: Most complete astrology MCP server
- 🐲 **Full BaZi System**: 15 specialized Chinese astrology tools
- 🎯 **Easy Setup**: One command installation
- 🔐 **Secure**: API key authentication
- 🌍 **Global Access**: Works worldwide via HTTPS
- ⚡ **Fast**: Swiss Ephemeris precision

## 📄 License

MIT License - Professional use allowed.

---

Get your API key at [astrovisor.io](https://astrovisor.io) and explore the most comprehensive astrology system available for Claude! 🌟

**Keywords**: mcp, astrology, claude, ai, bazi, chinese-astrology, four-pillars, luck-pillars, symbolic-stars, career-guidance, compatibility, personality-analysis, natal-chart, human-design, numerology, vedic-astrology
