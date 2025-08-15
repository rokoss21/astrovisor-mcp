#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import axios from 'axios';

const app = express();
const PORT = process.env.MCP_HTTP_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Default API configuration (can be overridden by user)
const DEFAULT_API_KEY = process.env.ASTROVISOR_API_KEY || '';
const API_BASE_URL = process.env.ASTROVISOR_URL || 'http://127.0.0.1:8002';

// Middleware to extract API key from request
const extractApiKey = (req: express.Request): string => {
  // Try multiple sources for API key
  let apiKey = '';
  
  // 1. From Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    apiKey = req.headers.authorization.substring(7);
  }
  
  // 2. From X-API-Key header
  if (!apiKey && req.headers['x-api-key']) {
    apiKey = req.headers['x-api-key'] as string;
  }
  
  // 3. From query parameter
  if (!apiKey && req.query.api_key) {
    apiKey = req.query.api_key as string;
  }
  
  // 4. From request body
  if (!apiKey && req.body && req.body.api_key) {
    apiKey = req.body.api_key;
  }
  
  // 5. Fall back to default (for backward compatibility)
  if (!apiKey) {
    apiKey = DEFAULT_API_KEY;
  }
  
  return apiKey;
};

// Create axios instance with dynamic API key
const createApiClient = (apiKey: string) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  });
};

// MCP Server capabilities
const MCP_TOOLS = [
  {
    name: "calculate_natal_chart",
    description: "Calculate and analyze a natal chart",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Person's name" },
        date: { type: "string", description: "Birth date (YYYY-MM-DD)" },
        time: { type: "string", description: "Birth time (HH:MM)" },
        location: { type: "string", description: "Birth location" },
        latitude: { type: "number", description: "Latitude" },
        longitude: { type: "number", description: "Longitude" },
        timezone: { type: "string", description: "Timezone" },
        api_key: { type: "string", description: "Your API key (optional, can also be in headers)", required: false }
      },
      required: ["name", "date", "time", "location", "latitude", "longitude", "timezone"]
    }
  },
  {
    name: "calculate_jyotish",
    description: "Calculate Vedic astrology (Jyotish) chart",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Person's name" },
        date: { type: "string", description: "Birth date (YYYY-MM-DD)" },
        time: { type: "string", description: "Birth time (HH:MM)" },
        location: { type: "string", description: "Birth location" },
        latitude: { type: "number", description: "Latitude" },
        longitude: { type: "number", description: "Longitude" },
        timezone: { type: "string", description: "Timezone" },
        api_key: { type: "string", description: "Your API key (optional, can also be in headers)", required: false }
      },
      required: ["name", "date", "time", "location", "latitude", "longitude", "timezone"]
    }
  },
  {
    name: "calculate_solar_return",
    description: "Calculate solar return for a specific year",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Person's name" },
        birth_date: { type: "string", description: "Birth date (YYYY-MM-DD)" },
        birth_time: { type: "string", description: "Birth time (HH:MM)" },
        birth_location: { type: "string", description: "Birth location" },
        birth_latitude: { type: "number", description: "Birth latitude" },
        birth_longitude: { type: "number", description: "Birth longitude" },
        birth_timezone: { type: "string", description: "Birth timezone" },
        return_year: { type: "number", description: "Year for solar return" },
        api_key: { type: "string", description: "Your API key (optional, can also be in headers)", required: false }
      },
      required: ["name", "birth_date", "birth_time", "birth_location", "birth_latitude", "birth_longitude", "birth_timezone", "return_year"]
    }
  },
  {
    name: "validate_api_key",
    description: "Validate your API key and get usage information",
    inputSchema: {
      type: "object",
      properties: {
        api_key: { type: "string", description: "Your API key to validate (optional, can also be in headers)", required: false }
      },
      required: []
    }
  }
];

// HTTP MCP Endpoints
app.get('/mcp/tools', async (req, res) => {
  try {
    res.json({
      tools: MCP_TOOLS
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list tools' });
  }
});

app.post('/mcp/tools/:toolName', async (req, res) => {
  try {
    const { toolName } = req.params;
    const { arguments: args } = req.body;
    
    // Extract API key from request
    const apiKey = extractApiKey(req);
    
    if (!apiKey) {
      return res.status(401).json({
        error: 'API key required. Provide it via Authorization header, X-API-Key header, or in the request body.'
      });
    }
    
    // Create API client with user's key
    const apiClient = createApiClient(apiKey);
    
    let result;
    
    try {
      switch (toolName) {
        case 'calculate_natal_chart':
          result = await apiClient.post('/api/natal/chart', {
            name: args.name,
            datetime: `${args.date}T${args.time}:00`,
            latitude: args.latitude,
            longitude: args.longitude,
            location: args.location,
            timezone: args.timezone
          });
          break;
          
        case 'calculate_jyotish':
          result = await apiClient.post('/api/jyotish/calculate', {
            name: args.name,
            datetime: `${args.date}T${args.time}:00`,
            latitude: args.latitude,
            longitude: args.longitude,
            location: args.location,
            timezone: args.timezone
          });
          break;
          
        case 'calculate_solar_return':
          result = await apiClient.post('/api/solar/return', {
            name: args.name,
            datetime: `${args.birth_date}T${args.birth_time}:00`,
            latitude: args.birth_latitude,
            longitude: args.birth_longitude,
            location: args.birth_location,
            timezone: args.birth_timezone,
            return_year: args.return_year
          });
          break;
          
        case 'validate_api_key':
          result = await apiClient.get('/v1/auth/validate');
          break;
          
        default:
          return res.status(404).json({ error: `Tool '${toolName}' not found` });
      }
      
      res.json({
        content: [
          {
            type: "text",
            text: JSON.stringify(result.data, null, 2)
          }
        ]
      });
      
    } catch (apiError: any) {
      // Handle API errors
      if (apiError.response?.status === 401) {
        return res.status(401).json({
          error: 'Invalid API key. Please check your API key and try again.'
        });
      }
      
      return res.status(apiError.response?.status || 500).json({
        error: `API Error: ${apiError.response?.data?.detail || apiError.message}`
      });
    }
    
  } catch (error: any) {
    console.error('Tool execution error:', error.message);
    res.status(500).json({
      error: `Failed to execute tool: ${error.message}`
    });
  }
});

// Health check
app.get('/mcp/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// MCP Server info
app.get('/mcp', (req, res) => {
  res.json({
    name: "AstroCore MCP Server",
    version: "1.0.0",
    description: "HTTP-based MCP server for AstroCore API - Revolutionary astrological system",
    authentication: {
      required: true,
      methods: [
        "Authorization: Bearer <your-api-key>",
        "X-API-Key: <your-api-key>",
        "Query parameter: ?api_key=<your-api-key>",
        "Request body: { \"api_key\": \"<your-api-key>\" }"
      ],
      note: "Get your API key from your account dashboard"
    },
    capabilities: {
      tools: true
    },
    endpoints: {
      tools: "/mcp/tools",
      execute: "/mcp/tools/:toolName",
      health: "/mcp/health"
    }
  });
});

app.listen(PORT, () => {
  console.log(`🌟 AstroCore HTTP MCP Server запущен на порту ${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}/mcp`);
  console.log(`🔑 API ключи принимаются через: Authorization header, X-API-Key header, query param, или в теле запроса`);
});
