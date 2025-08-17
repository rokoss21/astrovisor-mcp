# 🌟 AstroVisor MCP Server

Professional astrology tools for Claude Desktop via the Model Context Protocol (MCP).

🆕 **NEW in v2.3.1**: Complete **Progressions System** with **7 specialized tools** including Secondary, Solar Arc, and Tertiary progressions for precise life timing and developmental analysis!

✨ Also includes complete **BaZi (Chinese Astrology)** system with **15 specialized tools** including Four Pillars, Luck Pillars, Symbolic Stars, career guidance, and comprehensive life analysis!

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
      "args": ["-y", "astrovisor-mcp@2.3.1"],
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
      "command": "astrovisor-mcp@2.3.1",
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

## 🛠️ Available Tools (28 Professional Instruments!)

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

### 🌙 NEW! Complete Progressions System (7 tools!)

Transform your understanding of life timing and developmental astrology:

#### Core Progressions Methods:

- **calculate_secondary_progressions** - 🌙 Secondary progressions (day = year symbolism)
  - Parameters: Birth data + `progression_date` (YYYY-MM-DD)
  - Returns: Progressed planetary positions, aspects to natal chart, progressed lunar phases
  - Features: Psychological development, inner growth timing, emotional evolution

- **calculate_solar_arc_progressions** - ☀️ Solar arc progressions for major life events
  - Parameters: Birth data + `progression_date` (YYYY-MM-DD)
  - Returns: Solar arc directed positions, life event timing, peak influence periods
  - Features: Career peaks, relationship milestones, major achievements timing

- **calculate_tertiary_progressions** - 🌟 Tertiary progressions for monthly cycles
  - Parameters: Birth data + `progression_date` (YYYY-MM-DD) 
  - Returns: Lunar month progressions, detailed timing cycles, short-term influences
  - Features: Monthly timing, decision-making windows, detailed life planning

#### Advanced Progressions Analysis:

- **compare_progressions** - ⚖️ Compare multiple progression methods simultaneously
  - Parameters: Birth data + `progression_date` + optional `compare_methods` array
  - Returns: Side-by-side comparison, consensus indicators, differential analysis
  - Features: Multi-method validation, timing confirmation, comprehensive perspective

- **create_progressions_timeline** - 📅 Comprehensive life timeline with key events
  - Parameters: Birth data + `progression_date` (YYYY-MM-DD)
  - Returns: Life timeline, major transit periods, development phases, event windows
  - Features: Life planning, optimal timing identification, long-term strategy

- **analyze_progressions_aspects** - 🎯 Precise aspect analysis with exact timing
  - Parameters: Birth data + `progression_date` (YYYY-MM-DD)
  - Returns: Exact aspect orbs, formation/separation timing, intensity measurements
  - Features: Surgical precision timing, aspect strength, influence duration

#### System Information:

- **get_progressions_info** - ℹ️ Complete progressions methodology and capabilities
  - Parameters: None
  - Returns: System explanation, methodology details, usage guidelines
  - Features: Educational content, technical specifications, interpretation guidelines

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

### NEW! Progressions Timing:
- "Calculate my secondary progressions for December 2024"
- "Show me solar arc progressions for my career peak timing"
- "Create a progressions timeline for the next 2 years"
- "Compare all progression methods for March 2025"
- "Analyze progression aspects for precise timing this month"
- "What do tertiary progressions say about next month?"
- "Explain how progressions work and their methodology"

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

- **Windows**: `%APPDATA%\\Claude\\claude_desktop_config.json`
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

- 🔮 **28 Professional Tools**: Most complete astrology MCP server available
- 🌙 **NEW! Complete Progressions**: 7 specialized timing and development tools  
- 🐲 **Complete BaZi System**: 15 specialized Chinese astrology tools
- 🎯 **Easy Setup**: One command installation via npx
- 🔐 **Secure**: API key authentication
- 🌍 **Global Access**: Works worldwide via HTTPS
- 📱 **Modern**: Built with latest MCP protocol
- ⚡ **Fast**: Optimized for performance with Swiss Ephemeris precision

## 🏆 About the Creator

Created by **Emil Rokossovskiy** - [GitHub Profile](https://github.com/rokoss21/)

Professional developer specializing in AI integrations and astrological software.

## 🌙 NEW: Complete Progressions System v2.3.1

### What Makes Our Progressions System Revolutionary:

#### ⏰ Multiple Timing Methods:
- **Secondary Progressions**: Classic day-for-year symbolic system
- **Solar Arc Directions**: Sun's movement applied to all planets
- **Tertiary Progressions**: Lunar month progressions for detailed timing
- **Comparative Analysis**: Multi-method validation and consensus

#### 🎯 Precision Features:
- **Exact Aspect Timing**: When aspects form and separate
- **Orb Calculations**: Precise influence strength measurement
- **Duration Analysis**: How long influences will last
- **Peak Timing**: When effects are strongest

#### 📅 Life Planning Tools:
- **Timeline Creation**: Visual life development mapping
- **Event Windows**: Optimal timing for major decisions
- **Development Phases**: Understanding psychological evolution
- **Milestone Prediction**: Career, relationship, and personal peaks

#### 🔬 Technical Excellence:
- **Swiss Ephemeris Precision**: Astronomical accuracy
- **Modern Interpretations**: Psychological and practical insights
- **Multi-Method Validation**: Cross-reference for reliability
- **Flexible Date Ranges**: Any progression date from 1800-2100

### Example Progressions Analysis Output:

```
🌙 Secondary Progressions for March 2024:
✨ Progressed Sun: 15°23' Gemini (natal 8°12' Taurus)
🌙 Progressed Moon: 2°47' Virgo - New Phase beginning
🎯 Key Aspects:
   • Progressed Venus conjunct natal Jupiter (exact Feb 2024) - Love expansion
   • Progressed MC sextile natal Sun (exact April 2024) - Career recognition
   
☀️ Solar Arc Progressions:
🎯 SA Mars square natal Venus (exact May 2024) - Relationship dynamics
🌟 SA Jupiter trine natal Ascendant (exact June 2024) - New opportunities

⚖️ Consensus Timing:
💎 March-June 2024: Relationship and career expansion period
🎯 Peak timing: April 15-30, 2024
```

## 🌟 Complete System Overview

### Progressions vs Transits vs Natal:
- **Natal Chart**: Your blueprint and potential at birth
- **Transits**: Current planetary influences (external triggers)
- **Progressions**: Your inner development and psychological evolution (internal growth)

### When to Use Each Progression Method:
- **Secondary**: Psychological development, inner changes, personality evolution
- **Solar Arc**: Major life events, career milestones, relationship changes
- **Tertiary**: Monthly planning, detailed timing, short-term decision making

### Perfect Integration with Other Systems:
- **BaZi Progressions**: Combine with Luck Pillars for East-West synthesis
- **Transit Confirmations**: Validate timing with current planetary movements
- **Natal Promises**: See which birth potentials are being activated

---

**Get your API key at [astrovisor.io](https://astrovisor.io) and explore the most comprehensive astrology system available for Claude!** 🌟

**Keywords**: mcp, astrology, claude, ai, progressions, secondary-progressions, solar-arc, tertiary-progressions, timing, life-planning, bazi, chinese-astrology, four-pillars, luck-pillars, symbolic-stars, career-guidance, compatibility, personality-analysis, natal-chart, human-design, numerology, vedic-astrology, transits, professional-astrology, developmental-astrology, psychological-astrology
