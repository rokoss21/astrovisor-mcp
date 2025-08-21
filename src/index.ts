#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import 'dotenv/config';

// API Configuration
const API_BASE_URL = process.env.ASTROVISOR_URL || process.env.ASTRO_API_BASE_URL || 'https://astrovisor.io';
const API_KEY = process.env.ASTROVISOR_API_KEY || process.env.ASTRO_API_KEY || '';

if (!API_KEY) {
  throw new Error('ASTROVISOR_API_KEY or ASTRO_API_KEY environment variable is required');
}

// API Client
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`
  },
  timeout: 30000
});

// Common schema definitions
const birthDataSchema = {
  name: { type: "string", description: "Person's name" },
  datetime: { type: "string", description: "Birth date and time (ISO 8601 format)", example: "1990-05-15T14:30:00" },
  latitude: { type: "number", description: "Birth latitude", example: 40.7128 },
  longitude: { type: "number", description: "Birth longitude", example: -74.0060 },
  location: { type: "string", description: "Birth location", example: "New York, USA" },
  timezone: { type: "string", description: "Timezone", example: "America/New_York" }
};

const relationshipSchema = {
  partner1: {
    type: "object",
    properties: birthDataSchema,
    required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
  },
  partner2: {
    type: "object", 
    properties: birthDataSchema,
    required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
  }
};

const astrocartographySchema = {
  birth_data: {
    type: "object",
    properties: birthDataSchema,
    required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
  }
};

const server = new Server({
  name: 'astrovisor-mcp',
  version: '3.0.0',
}, {
  capabilities: {
    tools: {}
  }
});

// Complete tools array with all 55 endpoints
const tools = [
  // === NATAL ASTROLOGY (7 endpoints) ===
  {
    name: "calculate_natal_chart",
    description: "🌟 Calculate comprehensive natal (birth) chart with planets, houses, aspects, and personality analysis",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "analyze_natal_aspects",
    description: "🔮 Analyze natal chart aspects and their meanings",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "analyze_natal_houses",
    description: "🏠 Analyze natal chart houses and their significance",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "analyze_natal_planets",
    description: "🪐 Analyze natal planet positions and their meanings",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "analyze_natal_transits",
    description: "🌍 Analyze current transits to natal chart",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "analyze_natal_progressions",
    description: "📈 Analyze progressions in natal chart",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "get_natal_info",
    description: "ℹ️ Get comprehensive information about natal astrology module",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },

  // === BAZI CHINESE ASTROLOGY (15 endpoints) ===
  {
    name: "calculate_bazi_chart",
    description: "🐉 Calculate BaZi (Four Pillars) chart with elements, stems, and branches",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "analyze_bazi_compatibility",
    description: "💕 Analyze BaZi compatibility between two people",
    inputSchema: {
      type: "object",
      properties: relationshipSchema,
      required: ["partner1", "partner2"]
    }
  },
  {
    name: "analyze_bazi_life_focus",
    description: "🎯 Analyze life focus and priorities through BaZi",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "calculate_bazi_luck_pillars",
    description: "🍀 Calculate BaZi luck pillars and fortune cycles",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "calculate_bazi_annual_forecast",
    description: "📅 Calculate BaZi annual forecast and predictions",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "get_bazi_complete_analysis",
    description: "📊 Get complete BaZi analysis with all aspects",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "get_bazi_career_guidance",
    description: "💼 Get BaZi career guidance and profession recommendations",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "get_bazi_relationship_guidance",
    description: "❤️ Get BaZi relationship guidance and compatibility insights",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "get_bazi_health_insights",
    description: "🏥 Get BaZi health insights and wellness recommendations",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "analyze_bazi_nayin",
    description: "🔮 Analyze BaZi Nayin (60 combinations) meanings",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "analyze_bazi_useful_god",
    description: "⭐ Analyze BaZi Useful God and favorable elements",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "analyze_bazi_personality",
    description: "👤 Analyze personality traits through BaZi system",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "analyze_bazi_twelve_palaces",
    description: "🏛️ Analyze BaZi twelve palaces and life aspects",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "analyze_bazi_symbolic_stars",
    description: "⭐ Analyze BaZi symbolic stars and special combinations",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "get_bazi_info",
    description: "ℹ️ Get comprehensive information about BaZi Chinese astrology",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },

  // === TRANSITS (3 endpoints) ===
  {
    name: "calculate_current_transits",
    description: "🌍 Calculate current planetary transits and their effects",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "calculate_transits_period",
    description: "📅 Calculate transits for specific time period",
    inputSchema: {
      type: "object",
      properties: {
        ...birthDataSchema,
        start_date: { type: "string", description: "Start date (YYYY-MM-DD)", example: "2024-01-01" },
        end_date: { type: "string", description: "End date (YYYY-MM-DD)", example: "2024-12-31" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "start_date", "end_date"]
    }
  },
  {
    name: "get_transits_info",
    description: "ℹ️ Get information about planetary transits",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },

  // === SOLAR RETURNS (2 endpoints) ===
  {
    name: "calculate_solar_return",
    description: "☀️ Calculate Solar Return chart for yearly forecast",
    inputSchema: {
      type: "object",
      properties: {
        ...birthDataSchema,
        return_year: { type: "number", description: "Year for solar return calculation", example: 2024 }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "return_year"]
    }
  },
  {
    name: "calculate_lunar_return",
    description: "🌙 Calculate Lunar Return chart for monthly cycles",
    inputSchema: {
      type: "object",
      properties: {
        ...birthDataSchema,
        return_date: { type: "string", description: "Date for lunar return calculation (YYYY-MM-DD)", example: "2024-08-21" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "return_date"]
    }
  },

  // === PROGRESSIONS (2 endpoints) ===
  {
    name: "calculate_secondary_progressions",
    description: "🌙 Calculate secondary progressions (day = year)",
    inputSchema: {
      type: "object",
      properties: {
        ...birthDataSchema,
        progression_date: { type: "string", description: "Date for progression analysis (YYYY-MM-DD)", example: "2024-08-21" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "progression_date"]
    }
  },
  {
    name: "calculate_solar_arc_progressions",
    description: "☀️ Calculate solar arc progressions for major events timing",
    inputSchema: {
      type: "object",
      properties: {
        ...birthDataSchema,
        progression_date: { type: "string", description: "Date for progression analysis (YYYY-MM-DD)", example: "2024-08-21" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "progression_date"]
    }
  },

  // === DIRECTIONS (1 endpoint) ===
  {
    name: "calculate_primary_directions",
    description: "🎯 Calculate primary directions for precise timing",
    inputSchema: {
      type: "object",
      properties: {
        ...birthDataSchema,
        target_date: { type: "string", description: "Target date for directions (YYYY-MM-DD)", example: "2024-08-21" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "target_date"]
    }
  },

  // === RELATIONSHIP ANALYSIS (2 endpoints) ===
  {
    name: "analyze_synastry",
    description: "💕 Analyze synastry between two people for compatibility",
    inputSchema: {
      type: "object",
      properties: relationshipSchema,
      required: ["partner1", "partner2"]
    }
  },
  {
    name: "calculate_composite_chart",
    description: "🤝 Calculate composite chart for relationship analysis",
    inputSchema: {
      type: "object",
      properties: relationshipSchema,
      required: ["partner1", "partner2"]
    }
  },

  // === HORARY ASTROLOGY (3 endpoints) ===
  {
    name: "analyze_horary_question",
    description: "❓ Analyze horary question for specific answers",
    inputSchema: {
      type: "object",
      properties: {
        question: { type: "string", description: "The question to analyze" },
        question_time: { type: "string", description: "Time when question was asked (ISO 8601)" },
        location: {
          type: "object",
          properties: {
            latitude: { type: "number", description: "Location latitude" },
            longitude: { type: "number", description: "Location longitude" },
            name: { type: "string", description: "Location name" }
          }
        }
      },
      required: ["question", "question_time", "location"]
    }
  },
  {
    name: "analyze_horary_judgment",
    description: "⚖️ Get horary judgment and interpretation",
    inputSchema: {
      type: "object",
      properties: {
        question: { type: "string", description: "The question to analyze" },
        question_time: { type: "string", description: "Time when question was asked (ISO 8601)" },
        location: {
          type: "object",
          properties: {
            latitude: { type: "number", description: "Location latitude" },
            longitude: { type: "number", description: "Location longitude" },
            name: { type: "string", description: "Location name" }
          }
        }
      },
      required: ["question", "question_time", "location"]
    }
  },
  {
    name: "get_horary_question_analysis",
    description: "🔍 Get detailed horary question analysis",
    inputSchema: {
      type: "object",
      properties: {
        question: { type: "string", description: "The question to analyze" },
        question_time: { type: "string", description: "Time when question was asked (ISO 8601)" },
        location: {
          type: "object",
          properties: {
            latitude: { type: "number", description: "Location latitude" },
            longitude: { type: "number", description: "Location longitude" },
            name: { type: "string", description: "Location name" }
          }
        }
      },
      required: ["question", "question_time", "location"]
    }
  },

  // === ELECTIONAL ASTROLOGY (1 endpoint) ===
  {
    name: "find_best_times",
    description: "⏰ Find best times for important events and activities",
    inputSchema: {
      type: "object",
      properties: {
        ...birthDataSchema,
        event_type: { type: "string", description: "Type of event", example: "wedding" },
        start_date: { type: "string", description: "Search start date (YYYY-MM-DD)" },
        end_date: { type: "string", description: "Search end date (YYYY-MM-DD)" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "event_type", "start_date", "end_date"]
    }
  },

  // === NUMEROLOGY (3 endpoints) ===
  {
    name: "calculate_numerology",
    description: "🔢 Calculate complete numerological analysis",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "calculate_life_path_number",
    description: "🛤️ Calculate life path number and its meaning",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "calculate_destiny_number",
    description: "⭐ Calculate destiny number and life purpose",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },

  // === MATRIX OF DESTINY (2 endpoints) ===
  {
    name: "calculate_matrix_of_destiny",
    description: "🎴 Calculate Matrix of Destiny with Tarot arcana",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "calculate_matrix_chart",
    description: "📊 Calculate Matrix of Destiny chart with detailed analysis",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },

  // === HUMAN DESIGN (2 endpoints) ===
  {
    name: "calculate_human_design_chart",
    description: "👤 Calculate Human Design bodygraph chart",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "analyze_human_design",
    description: "🔍 Analyze Human Design with type, strategy, and authority",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },

  // === JYOTISH/VEDIC (5 endpoints) ===
  {
    name: "calculate_jyotish_chart",
    description: "🕉️ Calculate Jyotish (Vedic) astrology chart",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "calculate_jyotish_main",
    description: "📊 Calculate main Jyotish analysis",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "calculate_jyotish_dashas",
    description: "🔄 Calculate Jyotish dasha periods",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "calculate_jyotish_yogas",
    description: "🧘 Calculate Jyotish yogas and combinations",
    inputSchema: {
      type: "object",
      properties: birthDataSchema,
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "get_jyotish_info",
    description: "ℹ️ Get information about Jyotish (Vedic) astrology",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },

  // === ASTROCARTOGRAPHY (2 endpoints) ===
  {
    name: "find_best_places",
    description: "🗺️ Find best places to live based on astrocartography",
    inputSchema: {
      type: "object",
      properties: astrocartographySchema,
      required: ["birth_data"]
    }
  },
  {
    name: "analyze_astrocartography",
    description: "🌍 Analyze astrocartography for location influences",
    inputSchema: {
      type: "object",
      properties: astrocartographySchema,
      required: ["birth_data"]
    }
  }
];

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Tool execution handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let endpoint = '';
    let requestData = {};

    switch (name) {
      // === NATAL ASTROLOGY ===
      case 'calculate_natal_chart':
        endpoint = '/api/natal/chart';
        requestData = args;
        break;
      case 'analyze_natal_aspects':
        endpoint = '/api/natal/aspects';
        requestData = args;
        break;
      case 'analyze_natal_houses':
        endpoint = '/api/natal/houses';
        requestData = args;
        break;
      case 'analyze_natal_planets':
        endpoint = '/api/natal/planets';
        requestData = args;
        break;
      case 'analyze_natal_transits':
        endpoint = '/api/natal/transits';
        requestData = args;
        break;
      case 'analyze_natal_progressions':
        endpoint = '/api/natal/progressions';
        requestData = args;
        break;
      case 'get_natal_info':
        endpoint = '/api/natal/info';
        const natalResponse = await apiClient.get(endpoint);
        return {
          content: [{
            type: "text",
            text: `ℹ️ Natal Astrology Information:\n\n${JSON.stringify(natalResponse.data, null, 2)}`
          }]
        };

      // === BAZI CHINESE ASTROLOGY ===
      case 'calculate_bazi_chart':
        endpoint = '/api/bazi/chart';
        requestData = args;
        break;
      case 'analyze_bazi_compatibility':
        endpoint = '/api/bazi/compatibility';
        requestData = args;
        break;
      case 'analyze_bazi_life_focus':
        endpoint = '/api/bazi/life-focus';
        requestData = args;
        break;
      case 'calculate_bazi_luck_pillars':
        endpoint = '/api/bazi/luck-pillars';
        requestData = args;
        break;
      case 'calculate_bazi_annual_forecast':
        endpoint = '/api/bazi/annual-forecast';
        requestData = args;
        break;
      case 'get_bazi_complete_analysis':
        endpoint = '/api/bazi/complete-analysis';
        requestData = args;
        break;
      case 'get_bazi_career_guidance':
        endpoint = '/api/bazi/career-guidance';
        requestData = args;
        break;
      case 'get_bazi_relationship_guidance':
        endpoint = '/api/bazi/relationship-guidance';
        requestData = args;
        break;
      case 'get_bazi_health_insights':
        endpoint = '/api/bazi/health-insights';
        requestData = args;
        break;
      case 'analyze_bazi_nayin':
        endpoint = '/api/bazi/nayin-analysis';
        requestData = args;
        break;
      case 'analyze_bazi_useful_god':
        endpoint = '/api/bazi/useful-god';
        requestData = args;
        break;
      case 'analyze_bazi_personality':
        endpoint = '/api/bazi/personality';
        requestData = args;
        break;
      case 'analyze_bazi_twelve_palaces':
        endpoint = '/api/bazi/twelve-palaces';
        requestData = args;
        break;
      case 'analyze_bazi_symbolic_stars':
        endpoint = '/api/bazi/symbolic-stars';
        requestData = args;
        break;
      case 'get_bazi_info':
        endpoint = '/api/bazi/info';
        const baziResponse = await apiClient.get(endpoint);
        return {
          content: [{
            type: "text",
            text: `ℹ️ BaZi Chinese Astrology Information:\n\n${JSON.stringify(baziResponse.data, null, 2)}`
          }]
        };

      // === TRANSITS ===
      case 'calculate_current_transits':
        endpoint = '/api/transits/calculate';
        requestData = args;
        break;
      case 'calculate_transits_period':
        endpoint = '/api/transits/period';
        requestData = args;
        break;
      case 'get_transits_info':
        endpoint = '/api/transits/info';
        const transitsResponse = await apiClient.get(endpoint);
        return {
          content: [{
            type: "text",
            text: `ℹ️ Transits Information:\n\n${JSON.stringify(transitsResponse.data, null, 2)}`
          }]
        };

      // === SOLAR RETURNS ===
      case 'calculate_solar_return':
        endpoint = '/api/solar/return';
        requestData = args;
        break;
      case 'calculate_lunar_return':
        endpoint = '/api/solar/lunar-return';
        requestData = args;
        break;

      // === PROGRESSIONS ===
      case 'calculate_secondary_progressions':
        endpoint = '/api/progressions/secondary';
        requestData = args;
        break;
      case 'calculate_solar_arc_progressions':
        endpoint = '/api/progressions/solar-arc';
        requestData = args;
        break;

      // === DIRECTIONS ===
      case 'calculate_primary_directions':
        endpoint = '/api/directions/primary';
        requestData = args;
        break;

      // === RELATIONSHIPS ===
      case 'analyze_synastry':
        endpoint = '/api/relationship/synastry';
        requestData = args;
        break;
      case 'calculate_composite_chart':
        endpoint = '/api/relationship/composite';
        requestData = args;
        break;

      // === HORARY ===
      case 'analyze_horary_question':
        endpoint = '/api/horary/analyze-question';
        requestData = args;
        break;
      case 'analyze_horary_judgment':
        endpoint = '/api/horary/judgment';
        requestData = args;
        break;
      case 'get_horary_question_analysis':
        endpoint = '/api/horary/question';
        requestData = args;
        break;

      // === ELECTIONAL ===
      case 'find_best_times':
        endpoint = '/api/electional/find-best-times';
        requestData = args;
        break;

      // === NUMEROLOGY ===
      case 'calculate_numerology':
        endpoint = '/api/numerology/calculate';
        requestData = args;
        break;
      case 'calculate_life_path_number':
        endpoint = '/api/numerology/life-path';
        requestData = args;
        break;
      case 'calculate_destiny_number':
        endpoint = '/api/numerology/destiny-number';
        requestData = args;
        break;

      // === MATRIX ===
      case 'calculate_matrix_of_destiny':
        endpoint = '/api/matrix/calculate';
        requestData = args;
        break;
      case 'calculate_matrix_chart':
        endpoint = '/api/matrix/chart';
        requestData = args;
        break;

      // === HUMAN DESIGN ===
      case 'calculate_human_design_chart':
        endpoint = '/api/human_design/chart';
        requestData = args;
        break;
      case 'analyze_human_design':
        endpoint = '/api/human_design/analysis';
        requestData = args;
        break;

      // === JYOTISH ===
      case 'calculate_jyotish_chart':
        endpoint = '/api/jyotish/chart';
        requestData = args;
        break;
      case 'calculate_jyotish_main':
        endpoint = '/api/jyotish/calculate';
        requestData = args;
        break;
      case 'calculate_jyotish_dashas':
        endpoint = '/api/jyotish/dashas';
        requestData = args;
        break;
      case 'calculate_jyotish_yogas':
        endpoint = '/api/jyotish/yogas';
        requestData = args;
        break;
      case 'get_jyotish_info':
        endpoint = '/api/jyotish/info';
        const jyotishResponse = await apiClient.get(endpoint);
        return {
          content: [{
            type: "text",
            text: `ℹ️ Jyotish (Vedic) Astrology Information:\n\n${JSON.stringify(jyotishResponse.data, null, 2)}`
          }]
        };

      // === ASTROCARTOGRAPHY ===
      case 'find_best_places':
        endpoint = '/api/astrocartography/best-places';
        requestData = args;
        break;
      case 'analyze_astrocartography':
        endpoint = '/api/astrocartography/analysis';
        requestData = args;
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    // Make API call for POST endpoints
    const response = await apiClient.post(endpoint, requestData);

    if (response.data && response.data.success) {
      const result = response.data.data || response.data;
      const message = response.data.message || '';
      const processingTime = response.data.processing_time || 0;

      return {
        content: [{
          type: "text",
          text: `✅ ${message}\n\n📊 Results:\n${JSON.stringify(result, null, 2)}\n\n⏱️ Processing time: ${processingTime.toFixed(3)}s`
        }]
      };
    } else {
      throw new Error(response.data?.message || 'Unknown API error');
    }

  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data?.detail || error.response.data?.message || error.response.statusText;
      return {
        content: [{
          type: "text",
          text: `❌ API Error (${error.response.status}): ${errorMessage}`
        }]
      };
    } else {
      return {
        content: [{
          type: "text",
          text: `❌ Error: ${error.message}`
        }]
      };
    }
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`🚀 AstroVisor MCP Server v3.0.0 running with ${tools.length} tools`);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});