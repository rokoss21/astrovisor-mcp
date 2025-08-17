#!/usr/bin/env python3
"""
Добавление расширенных BaZi инструментов в MCP сервер
"""

def add_extended_bazi_tools():
    # Читаем текущий файл
    with open('src/index.ts', 'r') as f:
        content = f.read()
    
    # Расширенные BaZi инструменты
    extended_tools = '''  {
    name: "bazi_complete_analysis",
    description: "Полный комплексный анализ BaZi - все аспекты личности, карьеры, отношений, здоровья",
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
    name: "bazi_career_guidance",
    description: "Карьерные рекомендации на основе BaZi - идеальная профессия, стиль работы, лидерство",
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
    name: "bazi_relationship_guidance",  
    description: "Рекомендации для отношений через BaZi - стиль общения, совместимые типы партнеров",
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
    name: "bazi_health_insights",
    description: "Инсайты по здоровью через BaZi - конституция, слабые органы, рекомендации по питанию",
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
    name: "bazi_nayin_analysis",
    description: "Na Yin анализ мелодических элементов - духовные практики, карьерные направления",
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
    name: "bazi_useful_god",
    description: "Анализ Полезного Бога (用神) - ключевой элемент для гармонии, благоприятные периоды",
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
    name: "bazi_twelve_palaces",
    description: "Анализ Двенадцати Дворцов жизни - детальный анализ всех сфер жизни",
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
    name: "bazi_life_focus_analysis",
    description: "Анализ жизненных приоритетов - сильные и слабые сферы жизни, фокус развития",
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
    name: "bazi_symbolic_stars",
    description: "Анализ символических звезд BaZi - особые астрологические влияния и таланты",
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
    name: "bazi_luck_pillars",
    description: "Анализ Столпов Удачи - жизненные циклы, благоприятные и неблагоприятные периоды",
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
    name: "bazi_annual_forecast",
    description: "Годовой прогноз BaZi - что ожидать в текущем и следующем году",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Имя человека" },
        datetime: { type: "string", description: "Дата и время рождения в формате ISO" },
        latitude: { type: "number", description: "Широта места рождения" },
        longitude: { type: "number", description: "Долгота места рождения" },
        location: { type: "string", description: "Название места рождения" },
        timezone: { type: "string", description: "Часовой пояс" },
        year: { type: "number", description: "Год для прогноза (необязательно, по умолчанию текущий)" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone"]
    }
  },'''

    # Расширенные case'ы для switch
    extended_cases = '''      case "bazi_complete_analysis":
        const baziCompleteResponse = await apiClient.post('/api/bazi/complete-analysis', args);
        return {
          content: [
            {
              type: "text",
              text: `🔮 Полный анализ BaZi для ${args.name}

${JSON.stringify(baziCompleteResponse.data, null, 2)}`,
            },
          ],
        };

      case "bazi_career_guidance":
        const baziCareerResponse = await apiClient.post('/api/bazi/career-guidance', args);
        return {
          content: [
            {
              type: "text",
              text: `💼 Карьерные рекомендации BaZi для ${args.name}

${JSON.stringify(baziCareerResponse.data, null, 2)}`,
            },
          ],
        };

      case "bazi_relationship_guidance":
        const baziRelationshipResponse = await apiClient.post('/api/bazi/relationship-guidance', args);
        return {
          content: [
            {
              type: "text",
              text: `💕 Рекомендации для отношений BaZi для ${args.name}

${JSON.stringify(baziRelationshipResponse.data, null, 2)}`,
            },
          ],
        };

      case "bazi_health_insights":
        const baziHealthResponse = await apiClient.post('/api/bazi/health-insights', args);
        return {
          content: [
            {
              type: "text",
              text: `🏥 Инсайты по здоровью BaZi для ${args.name}

${JSON.stringify(baziHealthResponse.data, null, 2)}`,
            },
          ],
        };

      case "bazi_nayin_analysis":
        const baziNayinResponse = await apiClient.post('/api/bazi/nayin-analysis', args);
        return {
          content: [
            {
              type: "text",
              text: `🎵 Na Yin анализ для ${args.name}

${JSON.stringify(baziNayinResponse.data, null, 2)}`,
            },
          ],
        };

      case "bazi_useful_god":
        const baziUsefulGodResponse = await apiClient.post('/api/bazi/useful-god', args);
        return {
          content: [
            {
              type: "text",
              text: `⚡ Анализ Полезного Бога (用神) для ${args.name}

${JSON.stringify(baziUsefulGodResponse.data, null, 2)}`,
            },
          ],
        };

      case "bazi_twelve_palaces":
        const baziPalacesResponse = await apiClient.post('/api/bazi/twelve-palaces', args);
        return {
          content: [
            {
              type: "text",
              text: `🏛️ Двенадцать Дворцов для ${args.name}

${JSON.stringify(baziPalacesResponse.data, null, 2)}`,
            },
          ],
        };

      case "bazi_life_focus_analysis":
        const baziLifeFocusResponse = await apiClient.post('/api/bazi/life-focus', args);
        return {
          content: [
            {
              type: "text",
              text: `🎯 Анализ жизненных приоритетов для ${args.name}

${JSON.stringify(baziLifeFocusResponse.data, null, 2)}`,
            },
          ],
        };

      case "bazi_symbolic_stars":
        const baziStarsResponse = await apiClient.post('/api/bazi/symbolic-stars', args);
        return {
          content: [
            {
              type: "text",
              text: `⭐ Символические звезды для ${args.name}

${JSON.stringify(baziStarsResponse.data, null, 2)}`,
            },
          ],
        };

      case "bazi_luck_pillars":
        const baziLuckPillarsResponse = await apiClient.post('/api/bazi/luck-pillars', args);
        return {
          content: [
            {
              type: "text",
              text: `🍀 Столпы Удачи для ${args.name}

${JSON.stringify(baziLuckPillarsResponse.data, null, 2)}`,
            },
          ],
        };

      case "bazi_annual_forecast":
        const baziAnnualResponse = await apiClient.post('/api/bazi/annual-forecast', args);
        return {
          content: [
            {
              type: "text",
              text: `📅 Годовой прогноз BaZi для ${args.name}

${JSON.stringify(baziAnnualResponse.data, null, 2)}`,
            },
          ],
        };

'''

    # Находим место для вставки расширенных инструментов (после базовых BaZi инструментов)
    insert_point = content.find('    name: "check_api_health",')
    if insert_point != -1:
        content = content[:insert_point] + extended_tools + '\n  {\n    ' + content[insert_point:]
    
    # Находим место для вставки case'ов (после базовых BaZi case'ов)  
    case_insert_point = content.find('      case "check_api_health":')
    if case_insert_point != -1:
        content = content[:case_insert_point] + extended_cases + '\n      ' + content[case_insert_point:]
    
    # Записываем обновленный файл
    with open('src/index.ts', 'w') as f:
        f.write(content)
    
    print("✅ Расширенные BaZi инструменты добавлены в MCP сервер!")
    print("📊 Добавлено 11 новых BaZi инструментов")
    print("🎯 Общее количество BaZi инструментов: 15 (4 базовых + 11 расширенных)")
    print("🔢 Общее количество MCP инструментов: 30 (15 западных + 15 BaZi)")
    return True

if __name__ == "__main__":
    add_extended_bazi_tools()
