# 🌟 Astrovisor MCP Server

Professional astrology tools for Claude Desktop via the Model Context Protocol (MCP).

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
      "args": ["-y", "astrovisor-mcp"],
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
      "command": "astrovisor-mcp",
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

## 🛠️ Available Tools

### 🎯 Core Astrology Modules

- **calculate_natal_chart** - Complete natal chart analysis with planets, houses, and aspects
  - Parameters: `name`, `date` (YYYY-MM-DD), `time` (HH:MM), `location`, `latitude`, `longitude`, `timezone`
  - Returns: Planet positions, house cusps, aspects, interpretations

- **calculate_jyotish** - Vedic astrology calculations with sidereal zodiac
  - Parameters: `name`, `date`, `time`, `location`, `latitude`, `longitude`, `timezone`
  - Returns: Sidereal positions, nakshatras, dashas, divisional charts

- **calculate_solar_return** - Solar return charts for yearly predictions
  - Parameters: `name`, `birth_date`, `birth_time`, `birth_location`, `birth_latitude`, `birth_longitude`, `birth_timezone`, `return_year`
  - Returns: Solar return chart with predictions for the year

### 🔮 Advanced Techniques

- **calculate_progressions** - Secondary progressions analysis
  - Parameters: Birth data + `progression_date`
  - Returns: Progressed planets, aspects to natal chart

- **calculate_directions** - Solar arc directions
  - Parameters: Birth data + `target_date` 
  - Returns: Directed planets, activation dates

- **analyze_relationship** - Synastry and composite charts
  - Parameters: Two sets of birth data (`partner1`, `partner2`)
  - Returns: Compatibility analysis, composite chart

### 🌍 Location & Timing

- **calculate_astrocartography** - Location-based astrology
  - Parameters: Birth data + `analysis_type`
  - Returns: Planetary lines on world map, location recommendations

- **find_electional_times** - Best timing for events
  - Parameters: Birth data + `purpose`, `start_date`, `end_date`, `location`
  - Returns: Optimal dates and times for important events

### 📊 Specialized Systems

- **analyze_horary** - Horary astrology questions
  - Parameters: `question`, `question_time`, `location`
  - Returns: Chart analysis and answer to specific question

- **calculate_numerology** - Numerological analysis
  - Parameters: `name`, `date`, `full_name`
  - Returns: Life path number, destiny number, personal year cycles

- **calculate_matrix** - Matrix of Destiny
  - Parameters: `name`, `date`
  - Returns: Arcana analysis, karmic tasks, talents

- **calculate_human_design** - Human Design bodygraph
  - Parameters: `name`, `date`, `time`, `location`, `latitude`, `longitude`, `timezone`
  - Returns: Type, strategy, authority, centers, channels, gates

### 🔧 Utility

- **validate_api_key** - Check your API key status
  - Parameters: None
  - Returns: Key validity, usage statistics, rate limits

## 📋 Configuration Files Location

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

## 🔧 Environment Variables

- `ASTROVISOR_API_KEY` - Your Astrovisor API key (required) - get it at [astrovisor.io](https://astrovisor.io)
- `ASTROVISOR_URL` - Astrovisor server URL (default: https://astrovisor.io)

## 📝 Example Usage in Claude

After setup, you can ask Claude:

- "Calculate my natal chart for January 1, 1990 at 12:00 PM in New York"
- "What astrological tools are available?"
- "Analyze the compatibility between two people born on different dates"
- "Find the best time for a wedding in 2025"
- "Calculate my numerology profile"
- "What's my Human Design type?"

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

- 🔮 **14 Professional Tools**: Complete astrology toolkit including Western, Vedic, and modern systems
- 🎯 **Easy Setup**: One command installation via npx
- 🔐 **Secure**: API key authentication
- 🌍 **Global Access**: Works worldwide via HTTPS
- 📱 **Modern**: Built with latest MCP protocol
- ⚡ **Fast**: Optimized for performance with Swiss Ephemeris precision

## 🏆 About the Creator

Created by **Emil Rokossovskiy** - [GitHub Profile](https://github.com/rokoss21/)

Professional developer specializing in AI integrations and astrological software.

---

**Get your API key at [astrovisor.io](https://astrovisor.io) and start exploring professional astrology with Claude!** 🌟
