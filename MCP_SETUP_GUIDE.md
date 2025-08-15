# 🌟 AstroCore MCP Server Setup Guide

## 📡 HTTP MCP Server URL
```
https://astrovisor.io/mcp
```

## 🔑 Authentication Methods

Your API key can be provided in several ways:

### Method 1: Authorization Header (Recommended)
```json
{
  "mcpServers": {
    "astrovisor": {
      "url": "https://astrovisor.io/mcp",
      "headers": {
        "Authorization": "Bearer YOUR-API-KEY-HERE"
      }
    }
  }
}
```

### Method 2: X-API-Key Header
```json
{
  "mcpServers": {
    "astrovisor": {
      "url": "https://astrovisor.io/mcp",
      "headers": {
        "X-API-Key": "YOUR-API-KEY-HERE"
      }
    }
  }
}
```

### Method 3: Query Parameter
```json
{
  "mcpServers": {
    "astrovisor": {
      "url": "https://astrovisor.io/mcp?api_key=YOUR-API-KEY-HERE"
    }
  }
}
```

## 🛠️ Available Tools

1. **calculate_natal_chart** - Calculate and analyze natal charts
2. **calculate_jyotish** - Vedic astrology calculations  
3. **calculate_solar_return** - Solar return charts
4. **validate_api_key** - Validate your API key

## 📋 Setup Instructions

1. Get your API key from your AstroCore account
2. Choose one of the configuration methods above
3. Replace `YOUR-API-KEY-HERE` with your actual API key
4. Add the configuration to your Claude Desktop config file
5. Restart Claude Desktop

## 🔗 Example Configuration File Location

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/claude/claude_desktop_config.json`

## ✅ Testing Your Setup

You can test your MCP server by asking Claude:
- "Can you calculate my natal chart?"
- "What astrological tools are available?"
- "Validate my API key"

## 🆘 Troubleshooting

- **401 Unauthorized**: Check your API key is correct
- **Connection Error**: Verify the URL is exactly `https://astrovisor.io/mcp`
- **Tool Not Found**: Make sure you're using the correct tool names

## 📞 Support

For support, contact us at support@astrocore.api
