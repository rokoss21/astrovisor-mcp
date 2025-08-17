# 🌟 AstroVisor MCP Server

Professional astrology tools for Claude Desktop via the Model Context Protocol (MCP).

🆕 **NEW in v2.2.1**: Complete **BaZi (Chinese Astrology)** system with **15 specialized tools** including Four Pillars, Luck Pillars, Symbolic Stars, career guidance, and comprehensive life analysis!

[![npm version](https://badge.fury.io/js/astrovisor-mcp.svg)](https://badge.fury.io/js/astrovisor-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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

Then use in Claude Desktop config:

```json
{
  "mcpServers": {
    "astrovisor": {
      "command": "astrovisor-mcp@2.2.0",
      "env": {
        "ASTROVISOR_API_KEY": "your-api-key-here",
        "ASTROVISOR_URL": "https://astrovisor.io"
      }
    }
  }
}
```

## 🔑 Getting Your API Key

1. Visit **[astrovisor.io](https://astrovisor.io)** 
2. Sign up for an account
3. Get your API key from the dashboard
4. Replace `your-api-key-here` in the config above

## 🛠️ Available Tools (21 Professional Instruments)

### 🎯 Core Astrology Modules (6 tools)

- **calculate_natal_chart** - Complete natal chart analysis with planets, houses, and aspects
  - Parameters: `name`, `datetime`, `latitude`, `longitude`, `location`, `timezone`
  - Returns: Planet positions, house cusps, aspects, interpretations

- **calculate_vedic_chart** - Vedic astrology (Jyotish) with sidereal zodiac
  - Parameters: `name`, `datetime`, `latitude`, `longitude`, `location`, `timezone`
  - Returns: Sidereal positions, nakshatras, dashas, divisional charts

- **calculate_human_design** - Human Design bodygraph with type, strategy, and authority
  - Parameters: `name`, `datetime`, `latitude`, `longitude`, `location`, `timezone`
  - Returns: Type, strategy, authority, centers, channels, gates

- **calculate_numerology** - Complete numerological analysis
  - Parameters: `name`, `datetime`, `latitude`, `longitude`, `location`, `timezone`
  - Returns: Life path number, destiny number, personal year cycles

- **calculate_matrix_of_destiny** - Matrix of Destiny with arcanas and energy centers
  - Parameters: `name`, `datetime`, `latitude`, `longitude`, `location`, `timezone`
  - Returns: Arcana analysis, karmic tasks, talents

- **calculate_transits** - Current planetary transits and their influences
  - Parameters: Birth data + `transit_date` (optional)
  - Returns: Transit aspects, planetary returns, period tension analysis
  - Features: All 10 planets, 10 aspect types, significance scoring

### 🐲 Complete BaZi Chinese Astrology System (15 tools!)

#### Core BaZi Analysis:

- **calculate_bazi_chart** - Complete BaZi Four Pillars of Destiny chart
  - Parameters: `name`, `datetime`, `latitude`, `longitude`, `location`, `timezone`, `gender`
  - Returns: Four Pillars chart, Day Master analysis, element balance, life themes

- **analyze_bazi_personality** - Deep personality analysis via BaZi system
  - Parameters: `name`, `datetime`, `latitude`, `longitude`, `location`, `timezone`, `gender`
  - Returns: Character traits, strengths, weaknesses, behavioral patterns

- **calculate_bazi_compatibility** - Relationship compatibility between two people
  - Parameters: Two complete birth datasets with gender
  - Returns: Compatibility score, relationship dynamics, harmony analysis

- **get_bazi_info** - General information about BaZi methodology and system
  - Parameters: None
  - Returns: BaZi system explanation, features, methodology

#### Advanced BaZi Techniques:

- **analyze_bazi_twelve_palaces** - Twelve life areas (palaces) analysis
  - Parameters: `name`, `datetime`, `latitude`, `longitude`, `location`, `timezone`, `gender`
  - Returns: Analysis of 12 life areas: career, wealth, relationships, health, etc.

- **analyze_bazi_life_focus** - Main life themes and focus areas
  - Parameters: `name`, `datetime`, `latitude`, `longitude`, `location`, `timezone`, `gender`
  - Returns: Primary life themes, karmic lessons, spiritual path

- **analyze_bazi_symbolic_stars** - Symbolic Stars (Shen Sha) analysis
  - Parameters: `name`, `datetime`, `latitude`, `longitude`, `location`, `timezone`, `gender`
  - Returns: Special star configurations, lucky and unlucky influences

- **calculate_bazi_luck_pillars** - 10-year luck periods analysis
  - Parameters: `name`, `datetime`, `latitude`, `longitude`, `location`, `timezone`, `gender`
  - Returns: Life period analysis, favorable and challenging decades

- **calculate_bazi_annual_forecast** - Yearly influences and predictions
  - Parameters: Birth data + `target_year` (optional, defaults to current year)
  - Returns: Annual forecast, monthly influences, timing recommendations

#### Comprehensive BaZi Reports:

- **get_bazi_complete_analysis** - Full comprehensive BaZi analysis (all aspects)
  - Parameters: `name`, `datetime`, `latitude`, `longitude`, `location`, `timezone`, `gender`
  - Returns: Complete analysis combining all BaZi techniques

- **get_bazi_career_guidance** - Professional and career guidance
  - Parameters: `name`, `datetime`, `latitude`, `longitude`, `location`, `timezone`, `gender`
  - Returns: Career recommendations, suitable professions, business guidance

- **get_bazi_relationship_guidance** - Love and marriage guidance
  - Parameters: `name`, `datetime`, `latitude`, `longitude`, `location`, `timezone`, `gender`
  - Returns: Relationship advice, marriage timing, partner compatibility

- **get_bazi_health_insights** - Health and wellness insights
  - Parameters: `name`, `datetime`, `latitude`, `longitude`, `location`, `timezone`, `gender`
  - Returns: Health tendencies, wellness recommendations, prevention advice

- **analyze_bazi_nayin** - Traditional Nayin (sound) element analysis
  - Parameters: `name`, `datetime`, `latitude`, `longitude`, `location`, `timezone`, `gender`
  - Returns: Nayin analysis, traditional sound elements, hidden meanings

- **analyze_bazi_useful_god** - Beneficial elements and remedies analysis
  - Parameters: `name`, `datetime`, `latitude`, `longitude`, `location`, `timezone`, `gender`
  - Returns: Beneficial elements, favorable directions, enhancement methods

## 📝 Example Usage in Claude

### Core Astrology:
- "Calculate my natal chart for January 1, 1990 at 12:00 PM in New York"
- "What are my current planetary transits for this month?"
- "What's my Human Design type and strategy?"
- "Calculate my numerology profile and life path number"

### BaZi Chinese Astrology:
- "Calculate my complete BaZi chart for March 15, 1985 at 2:30 PM in Beijing"
- "Analyze my BaZi personality and character traits"
- "What do my BaZi Luck Pillars say about my next 10-year cycle?"
- "Give me BaZi career guidance based on my Four Pillars"
- "Analyze my BaZi compatibility with someone born June 20, 1992"
- "What are my BaZi Symbolic Stars and their meanings?"
- "Show me my BaZi annual forecast for 2024"
- "What does BaZi say about my health and wellness?"
- "Give me a complete comprehensive BaZi analysis"

## 📋 Configuration Files Location

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

## 🔧 Environment Variables

- `ASTROVISOR_API_KEY` - Your Astrovisor API key (required) - get it at [astrovisor.io](https://astrovisor.io)
- `ASTROVISOR_URL` - Astrovisor server URL (default: https://astrovisor.io)

## 🆘 Troubleshooting

### MCP Server Not Found
- Make sure Node.js is installed (version 18+)
- Verify the configuration syntax is correct
- Restart Claude Desktop after configuration changes

### Invalid API Key
- Get your API key from [astrovisor.io](https://astrovisor.io)
- Ensure the key is properly set in the environment variables
- Check the key format: should start with `pk-`

### Tools Not Appearing
- Verify Claude Desktop can access the internet
- Check Claude Desktop logs for error messages
- Try running `npx astrovisor-mcp` manually to test

## 🌐 Alternative: HTTP MCP

For web integrations, use our HTTP MCP endpoint:

```
URL: https://astrovisor.io/mcp
Headers: Authorization: Bearer your-api-key
```

## 📞 Support

- **Website**: [astrovisor.io](https://astrovisor.io)
- **API Documentation**: [astrovisor.io/docs](https://astrovisor.io/docs)
- **GitHub Issues**: [github.com/rokoss21/astrovisor-mcp/issues](https://github.com/rokoss21/astrovisor-mcp/issues)
- **Email**: support@astrovisor.io

## 📄 License

MIT License - see LICENSE file for details.

## 🌟 Features

- 🔮 **21 Professional Tools**: Most complete astrology MCP server available
- 🐲 **Complete BaZi System**: 15 specialized Chinese astrology tools
- 🎯 **Easy Setup**: One command installation via npx
- 🔐 **Secure**: API key authentication
- 🌍 **Global Access**: Works worldwide via HTTPS
- 📱 **Modern**: Built with latest MCP protocol
- ⚡ **Fast**: Optimized for performance with Swiss Ephemeris precision

## 🏆 About the Creator

Created by **Emil Rokossovskiy** - [GitHub Profile](https://github.com/rokoss21/)

Professional developer specializing in AI integrations and astrological software.

## 🌟 NEW: Complete BaZi System v2.2.1

### What Makes Our BaZi System Special:

#### 🐲 Traditional Authenticity:
- Based on authentic Chinese astrological principles
- Complete Four Pillars (Year, Month, Day, Hour) calculation
- Heavenly Stems (天干) and Earthly Branches (地支) analysis
- Five Element (五行) balance assessment
- Yin/Yang polarity analysis

#### 🎯 Advanced Techniques:
- **Luck Pillars (大運)**: 10-year life period analysis
- **Symbolic Stars (神煞)**: Special star configurations and influences
- **Twelve Palaces (十二宫)**: Comprehensive life areas analysis
- **Useful God (用神)**: Beneficial element identification
- **Nayin (納音)**: Traditional sound element analysis

#### 💼 Life Guidance:
- **Career & Professional**: Suitable professions, business timing, success factors
- **Relationships & Marriage**: Compatibility analysis, marriage timing, relationship advice
- **Health & Wellness**: Constitutional analysis, health tendencies, prevention
- **Annual Forecasting**: Year-by-year analysis, monthly influences, optimal timing

#### 🔬 Modern Integration:
- Gender-specific interpretations for accurate analysis
- Location-precise calculations using geographic coordinates
- Psychological insights combined with traditional methods
- Comprehensive compatibility analysis between two people
- Complete English explanations of Chinese concepts

### Example BaZi Analysis Output:

```
🐲 Four Pillars: 甲子 丁卯 戊申 庚申
💎 Day Master: 戊土 (Yang Earth)
⚖️ Element Balance: Earth 40%, Metal 30%, Wood 20%, Water 10%
🎯 Life Theme: Steady growth through persistent effort
🍀 Luck Pillars: Currently in favorable Wood period (2020-2030)
⭐ Symbolic Stars: Noble Person, Academic Star present
💼 Career: Finance, real estate, consulting highly favorable
❤️ Relationships: Best compatibility with Water and Wood types
🏥 Health: Strong constitution, watch digestive system
```

## 🌟 Transits Analysis Features

### Transit Calculation Features:
- **Comprehensive Analysis**: All major and minor aspects to natal planets
- **Planetary Returns**: Automatic detection with precision timing
- **Period Tension Scoring**: Algorithmic assessment of influences
- **Significance Rating**: Smart filtering of most important transits
- **Duration Estimates**: How long each influence will last
- **Detailed Interpretations**: Rich astrological meanings

### Supported Planets & Weights:
- **Personal Planets**: Sun (1.0), Moon (0.6), Mercury (0.4), Venus (0.5), Mars (0.7)
- **Social Planets**: Jupiter (1.2), Saturn (1.3) 
- **Outer Planets**: Uranus (1.1), Neptune (1.1), Pluto (1.2)

### Advanced Features:
- **Customizable Orbs**: Adjust sensitivity (0.1x to 3.0x)
- **Significance Filtering**: Focus on important transits (0.0 to 1.0 scale)
- **Aspect Types**: Major + minor aspects included
- **Smart Returns**: Detects planetary returns within 2° orb
- **Tension Analysis**: Overall supportive vs challenging climate

---

**Get your API key at [astrovisor.io](https://astrovisor.io) and explore the most comprehensive astrology system available for Claude!** 🌟

**Keywords**: mcp, astrology, claude, ai, bazi, chinese-astrology, four-pillars, luck-pillars, symbolic-stars, career-guidance, compatibility, personality-analysis, natal-chart, human-design, numerology, vedic-astrology, transits, professional-astrology
