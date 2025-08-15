#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.MCP_HTTP_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const DEFAULT_API_KEY = process.env.ASTROVISOR_API_KEY || '';
const API_BASE_URL = process.env.ASTROVISOR_URL || 'http://127.0.0.1:8002';

// Extract API key from request
const extractApiKey = (req: express.Request): string => {
  let apiKey = '';
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    apiKey = req.headers.authorization.substring(7);
  }
  
  if (!apiKey && req.headers['x-api-key']) {
    apiKey = req.headers['x-api-key'] as string;
  }
  
  if (!apiKey) {
    apiKey = DEFAULT_API_KEY;
  }
  
  return apiKey;
};

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

// MCP Tools Definition
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
        timezone: { type: "string", description: "Timezone" }
      },
      required: ["name", "date", "time", "location", "latitude", "longitude", "timezone"]
    }
  },
  {
    name: "calculate_jyotish", 
    description: "Calculate Vedic astrology chart",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Person's name" },
        date: { type: "string", description: "Birth date (YYYY-MM-DD)" },
        time: { type: "string", description: "Birth time (HH:MM)" },
        location: { type: "string", description: "Birth location" },
        latitude: { type: "number", description: "Latitude" },
        longitude: { type: "number", description: "Longitude" },
        timezone: { type: "string", description: "Timezone" }
      },
      required: ["name", "date", "time", "location", "latitude", "longitude", "timezone"]
    }
  },
  {
    name: "validate_api_key",
    description: "Validate your API key and get usage information", 
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];

// Main MCP endpoint
app.post('/mcp', async (req, res) => {
  const { method, params, id } = req.body;
  
  try {
    switch (method) {
      case 'initialize':
        return res.json({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: {
              tools: {
                listChanged: false
              }
            },
            serverInfo: {
              name: "AstroCore MCP Server",
              version: "1.0.0"
            }
          }
        });
      
      case 'notifications/initialized':
        return res.json({
          jsonrpc: "2.0",
          id,
          result: {}
        });
      
      case 'tools/list':
        return res.json({
          jsonrpc: "2.0", 
          id,
          result: {
            tools: MCP_TOOLS
          }
        });
      
      case 'tools/call':
        const { name, arguments: args } = params;
        
        // Extract API key
        const apiKey = extractApiKey(req);
        
        if (!apiKey) {
          return res.json({
            jsonrpc: "2.0",
            id,
            error: {
              code: -32602,
              message: "API key required in Authorization header"
            }
          });
        }
        
        const apiClient = createApiClient(apiKey);
        let result;
        
        try {
          switch (name) {
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
              
            case 'validate_api_key':
              result = await apiClient.get('/v1/auth/validate');
              break;
              
            default:
              return res.json({
                jsonrpc: "2.0",
                id,
                error: {
                  code: -32602,
                  message: `Tool '${name}' not found`
                }
              });
          }
          
          return res.json({
            jsonrpc: "2.0",
            id,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(result.data, null, 2)
                }
              ]
            }
          });
          
        } catch (apiError: any) {
          return res.json({
            jsonrpc: "2.0",
            id,
            error: {
              code: apiError.response?.status === 401 ? -32602 : -32603,
              message: apiError.response?.status === 401 ? 
                "Invalid API key" : 
                `API Error: ${apiError.response?.data?.detail || apiError.message}`
            }
          });
        }
      
      default:
        return res.json({
          jsonrpc: "2.0",
          id,
          error: {
            code: -32601,
            message: "Method not found"
          }
        });
    }
    
  } catch (error: any) {
    return res.json({
      jsonrpc: "2.0",
      id,
      error: {
        code: -32603,
        message: `Internal error: ${error.message}`
      }
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    name: "AstroCore MCP Server",
    version: "1.0.0", 
    mcp_endpoint: "/mcp",
    instructions: "Use POST to /mcp with MCP protocol JSON-RPC requests"
  });
});

app.listen(PORT, () => {
  console.log(`🌟 AstroCore MCP HTTP Server (MCP Protocol) запущен на порту ${PORT}`);
  console.log(`📡 MCP Endpoint: http://localhost:${PORT}/mcp`);
  console.log(`🔑 API ключ: Authorization: Bearer <your-key>`);
});
