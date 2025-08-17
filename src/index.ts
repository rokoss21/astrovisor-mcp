#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import axios from 'axios';

// 🌟 ASTROVISOR COMPLETE MCP SERVER WITH ALL BAZI TOOLS 🌟
const API_KEY = process.env.ASTROVISOR_API_KEY;
const API_BASE_URL = process.env.ASTROVISOR_URL || 'https://astrovisor.io';

if (!API_KEY) {
  throw new Error('ASTROVISOR_API_KEY environment variable is required');
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

const server = new Server({
  name: "astrovisor-complete-server",
  version: "2.2.0"
}, {
  capabilities: {
    tools: {}
  }
});

// Base schema for birth data
const birthDataSchema = {
  name: { type: "string", description: "Person's name" },
  datetime: { type: "string", description: "Birth date and time in ISO format" },
  latitude: { type: "number", description: "Birth location latitude" },
  longitude: { type: "number", description: "Birth location longitude" },
  location: { type: "string", description: "Birth location name" },
  timezone: { type: "string", description: "IANA timezone" }
};

const baziDataSchema = {
  ...birthDataSchema,
  gender: { type: "string", enum: ["male", "female"], description: "Gender for accurate analysis" }
};

// 🌟 COMPLETE TOOL SET INCLUDING ALL 15 BAZI TOOLS 🌟
const tools = [
  // ===== CORE ASTROLOGY =====
  {
    name: "calculate_natal_chart",
    description: "🌟 Complete natal chart analysis with planets, houses, and aspects",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "calculate_vedic_chart",
    description: "🕉️ Vedic astrology (Jyotish) with sidereal zodiac",
    inputSchema: {
      type: "object", 
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "calculate_human_design",
    description: "🔮 Human Design bodygraph with type, strategy, and authority",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "calculate_numerology",
    description: "🔢 Complete numerological analysis",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "calculate_matrix_of_destiny",
    description: "🎴 Matrix of Destiny with arcanas and energy centers",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "calculate_transits",
    description: "🌍 Current planetary transits and their influences",
    inputSchema: {
      type: "object",
      properties: {
        ...birthDataSchema,
        transit_date: { type: "string", description: "Date for transit analysis (optional)" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },

  // ===== COMPLETE BAZI SYSTEM (15 TOOLS!) =====
  {
    name: "calculate_bazi_chart",
    description: "🐲 Complete BaZi Four Pillars of Destiny chart",
    inputSchema: {
      type: "object",
      properties: baziDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "gender"]
    }
  },
  {
    name: "analyze_bazi_personality",
    description: "🧠 Deep personality analysis via BaZi system",
    inputSchema: {
      type: "object",
      properties: baziDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "gender"]
    }
  },
  {
    name: "calculate_bazi_compatibility",
    description: "💕 Relationship compatibility analysis between two people",
    inputSchema: {
      type: "object",
      properties: {
        person1_name: { type: "string", description: "First person's name" },
        person1_datetime: { type: "string", description: "First person's birth datetime" },
        person1_latitude: { type: "number", description: "First person's latitude" },
        person1_longitude: { type: "number", description: "First person's longitude" },
        person1_location: { type: "string", description: "First person's location" },
        person1_timezone: { type: "string", description: "First person's timezone" },
        person1_gender: { type: "string", enum: ["male", "female"], description: "First person's gender" },
        person2_name: { type: "string", description: "Second person's name" },
        person2_datetime: { type: "string", description: "Second person's birth datetime" },
        person2_latitude: { type: "number", description: "Second person's latitude" },
        person2_longitude: { type: "number", description: "Second person's longitude" },
        person2_location: { type: "string", description: "Second person's location" },
        person2_timezone: { type: "string", description: "Second person's timezone" },
        person2_gender: { type: "string", enum: ["male", "female"], description: "Second person's gender" }
      },
      required: ["person1_name", "person1_datetime", "person1_latitude", "person1_longitude", "person1_location", "person1_timezone", "person1_gender", "person2_name", "person2_datetime", "person2_latitude", "person2_longitude", "person2_location", "person2_timezone", "person2_gender"]
    }
  },
  {
    name: "get_bazi_info",
    description: "ℹ️ General information about BaZi system and methodology",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "analyze_bazi_twelve_palaces",
    description: "🏛️ BaZi Twelve Palaces (life areas) analysis",
    inputSchema: {
      type: "object",
      properties: baziDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "gender"]
    }
  },
  {
    name: "analyze_bazi_life_focus",
    description: "🎯 BaZi life focus and main themes analysis",
    inputSchema: {
      type: "object",
      properties: baziDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "gender"]
    }
  },
  {
    name: "analyze_bazi_symbolic_stars",
    description: "⭐ BaZi Symbolic Stars (Shen Sha) analysis",
    inputSchema: {
      type: "object",
      properties: baziDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "gender"]
    }
  },
  {
    name: "calculate_bazi_luck_pillars",
    description: "🍀 BaZi Luck Pillars (10-year periods) analysis",
    inputSchema: {
      type: "object",
      properties: baziDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "gender"]
    }
  },
  {
    name: "calculate_bazi_annual_forecast",
    description: "📅 BaZi annual forecast and yearly influences",
    inputSchema: {
      type: "object",
      properties: {
        ...baziDataSchema,
        target_year: { type: "number", description: "Year for forecast (optional, defaults to current year)" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "gender"]
    }
  },
  {
    name: "get_bazi_complete_analysis",
    description: "📋 Complete comprehensive BaZi analysis (all aspects)",
    inputSchema: {
      type: "object",
      properties: baziDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "gender"]
    }
  },
  {
    name: "get_bazi_career_guidance",
    description: "💼 BaZi-based career and professional guidance",
    inputSchema: {
      type: "object",
      properties: baziDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "gender"]
    }
  },
  {
    name: "get_bazi_relationship_guidance",
    description: "❤️ BaZi relationship and marriage guidance",
    inputSchema: {
      type: "object",
      properties: baziDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "gender"]
    }
  },
  {
    name: "get_bazi_health_insights",
    description: "🏥 BaZi health insights and wellness guidance",
    inputSchema: {
      type: "object",
      properties: baziDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "gender"]
    }
  },
  {
    name: "analyze_bazi_nayin",
    description: "🎵 BaZi Nayin (sound) analysis - traditional element sounds",
    inputSchema: {
      type: "object",
      properties: baziDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "gender"]
    }
  },
  {
    name: "analyze_bazi_useful_god",
    description: "🙏 BaZi Useful God (beneficial elements) analysis",
    inputSchema: {
      type: "object",
      properties: baziDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "gender"]
    }
  }
];

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    let endpoint = '';
    let requestData = {};
    let method = 'POST'; // Default method

    // Route mapping
    switch (name) {
      // Core Astrology
      case "calculate_natal_chart":
        endpoint = '/api/natal/chart';
        requestData = args;
        break;
      case "calculate_vedic_chart":
        endpoint = '/api/jyotish/calculate';
        requestData = args;
        break;
      case "calculate_human_design":
        endpoint = '/api/human-design/calculate';
        requestData = args;
        break;
      case "calculate_numerology":
        endpoint = '/api/numerology/calculate';
        requestData = args;
        break;
      case "calculate_matrix_of_destiny":
        endpoint = '/api/matrix/calculate';
        requestData = args;
        break;
      case "calculate_transits":
        endpoint = '/api/natal/transits';
        requestData = args;
        break;

      // Complete BaZi System (15 tools)
      case "calculate_bazi_chart":
        endpoint = '/api/bazi/chart';
        requestData = args;
        break;
      case "analyze_bazi_personality":
        endpoint = '/api/bazi/personality';
        requestData = args;
        break;
      case "calculate_bazi_compatibility":
        endpoint = '/api/bazi/compatibility';
        requestData = args;
        break;
      case "get_bazi_info":
        endpoint = '/api/bazi/info';
        method = 'GET';
        requestData = {};
        break;
      case "analyze_bazi_twelve_palaces":
        endpoint = '/api/bazi/twelve-palaces';
        requestData = args;
        break;
      case "analyze_bazi_life_focus":
        endpoint = '/api/bazi/life-focus';
        requestData = args;
        break;
      case "analyze_bazi_symbolic_stars":
        endpoint = '/api/bazi/symbolic-stars';
        requestData = args;
        break;
      case "calculate_bazi_luck_pillars":
        endpoint = '/api/bazi/luck-pillars';
        requestData = args;
        break;
      case "calculate_bazi_annual_forecast":
        endpoint = '/api/bazi/annual-forecast';
        requestData = args;
        break;
      case "get_bazi_complete_analysis":
        endpoint = '/api/bazi/complete-analysis';
        requestData = args;
        break;
      case "get_bazi_career_guidance":
        endpoint = '/api/bazi/career-guidance';
        requestData = args;
        break;
      case "get_bazi_relationship_guidance":
        endpoint = '/api/bazi/relationship-guidance';
        requestData = args;
        break;
      case "get_bazi_health_insights":
        endpoint = '/api/bazi/health-insights';
        requestData = args;
        break;
      case "analyze_bazi_nayin":
        endpoint = '/api/bazi/nayin-analysis';
        requestData = args;
        break;
      case "analyze_bazi_useful_god":
        endpoint = '/api/bazi/useful-god';
        requestData = args;
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    // Make request based on method
    const response = method === 'GET' 
      ? await apiClient.get(endpoint)
      : await apiClient.post(endpoint, requestData);
      
    const result = JSON.stringify(response.data, null, 2);

    return {
      content: [{
        type: "text", 
        text: `✨ ${name} result:\n\n${result}`
      }]
    };

  } catch (error: any) {
    let errorMessage = `❌ Error executing ${name}`;
    
    if (error.response) {
      errorMessage += `\nHTTP ${error.response.status}: ${error.response.statusText}`;
      if (error.response.data) {
        errorMessage += `\nDetails: ${JSON.stringify(error.response.data, null, 2)}`;
      }
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage += `\nConnection error to API: ${API_BASE_URL}`;
    } else {
      errorMessage += `\nInternal error: ${error.message}`;
    }
    
    return {
      content: [{
        type: "text",
        text: errorMessage
      }]
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🌟 AstroVisor Complete MCP Server - ALL 21 TOOLS INCLUDING FULL BAZI SYSTEM! 🌟");
}

main().catch(console.error);
