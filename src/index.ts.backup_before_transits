#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import axios from 'axios';

// Получаем API ключ из переменных окружения
const API_KEY = process.env.ASTROVISOR_API_KEY;
const API_BASE_URL = process.env.ASTROVISOR_URL || 'http://127.0.0.1:8003';

if (!API_KEY) {
  throw new Error('ASTROVISOR_API_KEY environment variable is required');
}

// Создаем axios instance для API
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Создаем MCP сервер
const server = new Server({
  name: "predict-cli-server",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

// Список всех инструментов
const tools = [
  {
    name: "calculate_natal_chart",
    description: "Рассчитывает натальную карту на основе данных рождения",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Имя человека" },
        datetime: { type: "string", description: "Дата и время рождения в формате ISO" },
        latitude: { type: "number", description: "Широта места рождения" },
        longitude: { type: "number", description: "Долгота места рождения" },
        location: { type: "string", description: "Название места рождения" },
        timezone: { type: "string", description: "Часовой пояс" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "calculate_vedic_chart",
    description: "Рассчитывает ведическую карту (Jyotish) на основе данных рождения",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Имя человека" },
        datetime: { type: "string", description: "Дата и время рождения в формате ISO" },
        latitude: { type: "number", description: "Широта места рождения" },
        longitude: { type: "number", description: "Долгота места рождения" },
        location: { type: "string", description: "Название места рождения" },
        timezone: { type: "string", description: "Часовой пояс" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "calculate_numerology",
    description: "Выполняет полный нумерологический анализ личности",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Полное имя человека" },
        datetime: { type: "string", description: "Дата рождения в формате ISO" },
        latitude: { type: "number", description: "Широта (опционально)" },
        longitude: { type: "number", description: "Долгота (опционально)" },
        location: { type: "string", description: "Место рождения (опционально)" },
        timezone: { type: "string", description: "Часовой пояс (опционально)" }
      },
      required: ["name", "datetime"]
    }
  },
  {
    name: "calculate_human_design",
    description: "Рассчитывает полный анализ Дизайна Человека (бодиграф)",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Имя человека" },
        datetime: { type: "string", description: "Дата и время рождения в формате ISO" },
        latitude: { type: "number", description: "Широта места рождения" },
        longitude: { type: "number", description: "Долгота места рождения" },
        location: { type: "string", description: "Название места рождения" },
        timezone: { type: "string", description: "Часовой пояс" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "calculate_matrix_of_destiny",
    description: "Рассчитывает Матрицу Судьбы",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Имя человека" },
        datetime: { type: "string", description: "Дата рождения в формате ISO" },
        latitude: { type: "number", description: "Широта (опционально)" },
        longitude: { type: "number", description: "Долгота (опционально)" },
        location: { type: "string", description: "Место рождения (опционально)" },
        timezone: { type: "string", description: "Часовой пояс (опционально)" }
      },
      required: ["name", "datetime"]
    }
  },
  {
    name: "calculate_solar_return",
    description: "Рассчитывает соляр (прогноз на год)",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Имя человека" },
        datetime: { type: "string", description: "Дата и время рождения в формате ISO" },
        latitude: { type: "number", description: "Широта места рождения" },
        longitude: { type: "number", description: "Долгота места рождения" },
        location: { type: "string", description: "Место рождения" },
        timezone: { type: "string", description: "Часовой пояс рождения" },
        return_year: { type: "number", description: "Год для расчета соляра" },
        return_latitude: { type: "number", description: "Текущая широта (опционально)" },
        return_longitude: { type: "number", description: "Текущая долгота (опционально)" },
        return_location: { type: "string", description: "Текущее место (опционально)" },
        return_timezone: { type: "string", description: "Текущий часовой пояс (опционально)" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "return_year"]
    }
  },
  {
    name: "calculate_progressions",
    description: "Рассчитывает прогрессии",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Имя человека" },
        datetime: { type: "string", description: "Дата и время рождения в формате ISO" },
        latitude: { type: "number", description: "Широта места рождения" },
        longitude: { type: "number", description: "Долгота места рождения" },
        location: { type: "string", description: "Место рождения" },
        timezone: { type: "string", description: "Часовой пояс рождения" },
        progression_date: { type: "string", description: "Дата для расчета прогрессий в формате YYYY-MM-DD" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "progression_date"]
    }
  },
  {
    name: "calculate_solar_arc_directions",
    description: "Рассчитывает солярные дуги (дирекции)",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Имя человека" },
        birth_datetime: { type: "string", description: "Дата и время рождения в формате ISO" },
        birth_latitude: { type: "number", description: "Широта места рождения" },
        birth_longitude: { type: "number", description: "Долгота места рождения" },
        birth_location: { type: "string", description: "Место рождения" },
        birth_timezone: { type: "string", description: "Часовой пояс рождения" },
        target_date: { type: "string", description: "Дата для расчета дирекций в формате ISO" }
      },
      required: ["name", "birth_datetime", "birth_latitude", "birth_longitude", "birth_location", "birth_timezone", "target_date"]
    }
  },
  {
    name: "calculate_relationship_synastry",
    description: "Анализ отношений (синастрия)",
    inputSchema: {
      type: "object",
      properties: {
        person1_name: { type: "string", description: "Имя первого человека" },
        person1_datetime: { type: "string", description: "Дата и время рождения первого человека" },
        person1_latitude: { type: "number", description: "Широта места рождения первого человека" },
        person1_longitude: { type: "number", description: "Долгота места рождения первого человека" },
        person1_location: { type: "string", description: "Место рождения первого человека" },
        person1_timezone: { type: "string", description: "Часовой пояс первого человека" },
        person2_name: { type: "string", description: "Имя второго человека" },
        person2_datetime: { type: "string", description: "Дата и время рождения второго человека" },
        person2_latitude: { type: "number", description: "Широта места рождения второго человека" },
        person2_longitude: { type: "number", description: "Долгота места рождения второго человека" },
        person2_location: { type: "string", description: "Место рождения второго человека" },
        person2_timezone: { type: "string", description: "Часовой пояс второго человека" }
      },
      required: ["person1_name", "person1_datetime", "person1_latitude", "person1_longitude", "person1_location", "person1_timezone", "person2_name", "person2_datetime", "person2_latitude", "person2_longitude", "person2_location", "person2_timezone"]
    }
  },
  {
    name: "calculate_astrocartography",
    description: "Рассчитывает астрокартографию",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Имя человека" },
        datetime: { type: "string", description: "Дата и время рождения в формате ISO" },
        latitude: { type: "number", description: "Широта места рождения" },
        longitude: { type: "number", description: "Долгота места рождения" },
        location: { type: "string", description: "Название места рождения" },
        timezone: { type: "string", description: "Часовой пояс" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "find_best_times",
    description: "Элективная астрология - поиск лучших времен для событий",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Имя человека" },
        datetime: { type: "string", description: "Дата и время рождения в формате ISO" },
        birth_latitude: { type: "number", description: "Широта места рождения" },
        birth_longitude: { type: "number", description: "Долгота места рождения" },
        birth_location: { type: "string", description: "Место рождения" },
        birth_timezone: { type: "string", description: "Часовой пояс рождения" },
        purpose: { type: "string", description: "Цель события (wedding, business_start, travel, etc.)" },
        start_date: { type: "string", description: "Начальная дата поиска в формате ISO" },
        end_date: { type: "string", description: "Конечная дата поиска в формате ISO" },
        event_latitude: { type: "number", description: "Широта места события" },
        event_longitude: { type: "number", description: "Долгота места события" },
        event_location: { type: "string", description: "Название места события" },
        event_timezone: { type: "string", description: "Часовой пояс места события" }
      },
      required: ["name", "datetime", "birth_latitude", "birth_longitude", "birth_location", "birth_timezone", "purpose", "start_date", "end_date", "event_latitude", "event_longitude", "event_location", "event_timezone"]
    }
  },
  {
    name: "analyze_horary_question",
    description: "Хорарная астрология - анализ вопроса",
    inputSchema: {
      type: "object",
      properties: {
        question: { type: "string", description: "Вопрос для хорарного анализа" },
        querent_name: { type: "string", description: "Имя кверента (задающего вопрос)" },
        question_datetime: { type: "string", description: "Дата и время задания вопроса в формате ISO" },
        latitude: { type: "number", description: "Широта места задания вопроса" },
        longitude: { type: "number", description: "Долгота места задания вопроса" },
        location: { type: "string", description: "Место задания вопроса" },
        timezone: { type: "string", description: "Часовой пояс" }
      },
      required: ["question", "querent_name", "question_datetime", "latitude", "longitude", "location", "timezone"]
    }
  },
  {
    name: "get_api_info",
    description: "Получить информацию об AstroCore API",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  },
  {
    name: "check_api_health",
    description: "Проверить статус AstroCore API",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  }
];

// Обработчик списка инструментов
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools
  };
});

// Обработчик вызова инструментов
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "calculate_natal_chart":
        const natalResponse = await apiClient.post('/api/natal/chart', args);
        return {
          content: [
            {
              type: "text",
              text: `🌟 Натальная карта для ${args.name}\n\n${JSON.stringify(natalResponse.data, null, 2)}`,
            },
          ],
        };

      case "calculate_vedic_chart":
        const vedicResponse = await apiClient.post('/api/jyotish/calculate', args);
        return {
          content: [
            {
              type: "text",
              text: `🕉️ Ведическая карта для ${args.name}\n\n${JSON.stringify(vedicResponse.data, null, 2)}`,
            },
          ],
        };

      case "calculate_numerology":
        const numerologyResponse = await apiClient.post('/api/numerology/calculate', {
          ...args,
          latitude: args.latitude || 0,
          longitude: args.longitude || 0,
          location: args.location || "Unknown",
          timezone: args.timezone || "UTC"
        });
        return {
          content: [
            {
              type: "text",
              text: `🔢 Нумерологический анализ для ${args.name}\n\n${JSON.stringify(numerologyResponse.data, null, 2)}`,
            },
          ],
        };

      case "calculate_human_design":
        const humanDesignResponse = await apiClient.post('/api/human-design/calculate', args);
        return {
          content: [
            {
              type: "text",
              text: `👤 Дизайн Человека для ${args.name}\n\n${JSON.stringify(humanDesignResponse.data, null, 2)}`,
            },
          ],
        };

      case "calculate_matrix_of_destiny":
        const matrixResponse = await apiClient.post('/api/matrix/calculate', {
          ...args,
          latitude: args.latitude || 0,
          longitude: args.longitude || 0,
          location: args.location || "Unknown",
          timezone: args.timezone || "UTC"
        });
        return {
          content: [
            {
              type: "text",
              text: `🔮 Матрица Судьбы для ${args.name}\n\n${JSON.stringify(matrixResponse.data, null, 2)}`,
            },
          ],
        };

      case "calculate_solar_return":
        const solarResponse = await apiClient.post('/api/solar/return', args);
        return {
          content: [
            {
              type: "text",
              text: `☀️ Соляр на ${args.return_year} год для ${args.name}\n\n${JSON.stringify(solarResponse.data, null, 2)}`,
            },
          ],
        };

      case "calculate_progressions":
        const progressionsResponse = await apiClient.post('/api/progressions/secondary', args);
        return {
          content: [
            {
              type: "text",
              text: `📈 Прогрессии на ${args.progression_date} для ${args.name}\n\n${JSON.stringify(progressionsResponse.data, null, 2)}`,
            },
          ],
        };

      case "calculate_solar_arc_directions":
        const directionsResponse = await apiClient.post('/api/directions/calculate', {
          name: args.name,
          datetime: args.birth_datetime,
          latitude: args.birth_latitude,
          longitude: args.birth_longitude,
          location: args.birth_location,
          timezone: args.birth_timezone,
          birth_datetime: args.birth_datetime,
          birth_latitude: args.birth_latitude,
          birth_longitude: args.birth_longitude,
          birth_location: args.birth_location,
          birth_timezone: args.birth_timezone,
          target_date: args.target_date
        });
        return {
          content: [
            {
              type: "text",
              text: `🎯 Солярные дуги на ${args.target_date} для ${args.name}\n\n${JSON.stringify(directionsResponse.data, null, 2)}`,
            },
          ],
        };

      case "calculate_relationship_synastry":
        const relationshipResponse = await apiClient.post('/api/relationship/synastry', {
          partner1: {
            name: args.person1_name,
            datetime: args.person1_datetime,
            latitude: args.person1_latitude,
            longitude: args.person1_longitude,
            location: args.person1_location,
            timezone: args.person1_timezone
          },
          partner2: {
            name: args.person2_name,
            datetime: args.person2_datetime,
            latitude: args.person2_latitude,
            longitude: args.person2_longitude,
            location: args.person2_location,
            timezone: args.person2_timezone
          }
        });
        return {
          content: [
            {
              type: "text",
              text: `💕 Анализ отношений между ${args.person1_name} и ${args.person2_name}\n\n${JSON.stringify(relationshipResponse.data, null, 2)}`,
            },
          ],
        };

      case "calculate_astrocartography":
        const astrocartographyResponse = await apiClient.post('/api/astrocartography/world-map', {
          birth_data: {
            name: args.name,
            datetime: args.datetime,
            latitude: args.latitude,
            longitude: args.longitude,
            location: args.location,
            timezone: args.timezone
          },
          analysis_type: "overall",
          quick_mode: true
        });
        return {
          content: [
            {
              type: "text",
              text: `🗺️ Астрокартография для ${args.name}\n\n${JSON.stringify(astrocartographyResponse.data, null, 2)}`,
            },
          ],
        };

      case "find_best_times":
        const electionalResponse = await apiClient.post('/api/electional/find-best-times', {
          birth_data: {
            name: args.name,
            datetime: args.datetime,
            latitude: args.birth_latitude,
            longitude: args.birth_longitude,
            location: args.birth_location,
            timezone: args.birth_timezone
          },
          purpose: args.purpose,
          start_date: args.start_date,
          end_date: args.end_date,
          location: {
            latitude: args.event_latitude,
            longitude: args.event_longitude,
            location: args.event_location,
            timezone: args.event_timezone
          }
        });
        return {
          content: [
            {
              type: "text",
              text: `📅 Лучшие времена для ${args.purpose} с ${args.start_date} по ${args.end_date}\n\n${JSON.stringify(electionalResponse.data, null, 2)}`,
            },
          ],
        };

      case "analyze_horary_question":
        const horaryResponse = await apiClient.post('/api/horary/analyze-question', {
          question: args.question,
          querent_name: args.querent_name,
          question_time: args.question_datetime,
          location: {
            latitude: args.latitude,
            longitude: args.longitude,
            location: args.location,
            timezone: args.timezone
          }
        });
        return {
          content: [
            {
              type: "text",
              text: `❓ Хорарный анализ вопроса: "${args.question}"\n\n${JSON.stringify(horaryResponse.data, null, 2)}`,
            },
          ],
        };

      case "get_api_info":
        const infoResponse = await apiClient.get('/api/info/endpoints');
        return {
          content: [
            {
              type: "text",
              text: `ℹ️ Информация об AstroCore API\n\n${JSON.stringify(infoResponse.data, null, 2)}`,
            },
          ],
        };

      case "check_api_health":
        const healthResponse = await apiClient.get('/health');
        return {
          content: [
            {
              type: "text",
              text: `✅ Статус AstroCore API: ${healthResponse.data.status}\n\n${JSON.stringify(healthResponse.data, null, 2)}`,
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    let errorMessage = `❌ Ошибка при выполнении ${name}: `;
    
    if (error.response) {
      // HTTP ошибка
      errorMessage += `HTTP ${error.response.status} - `;
      if (error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage += error.response.data;
        } else if (error.response.data.detail) {
          if (Array.isArray(error.response.data.detail)) {
            errorMessage += error.response.data.detail.map((d: any) =>
              `${d.loc?.join('.')} - ${d.msg}`
            ).join('; ');
          } else {
            errorMessage += JSON.stringify(error.response.data.detail);
          }
        } else {
          errorMessage += JSON.stringify(error.response.data);
        }
      }
    } else {
      errorMessage += error.message || 'Неизвестная ошибка';
    }
    
    return {
      content: [
        {
          type: "text",
          text: errorMessage,
        },
      ],
      isError: true,
    };
  }
});

// Запуск сервера
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('🌟 AstroCore MCP Server запущен и готов к работе!');