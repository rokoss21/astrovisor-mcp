  // === PROGRESSIONS TOOLS ===
  {
    name: "calculate_secondary_progressions",
    description: "🌙 Calculate secondary progressions (day = year) for psychological development analysis",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Person's name" },
        datetime: { type: "string", description: "Birth date and time (ISO 8601 format)", example: "1988-07-12T12:15:00" },
        latitude: { type: "number", description: "Birth latitude", example: 55.0084 },
        longitude: { type: "number", description: "Birth longitude", example: 82.9357 },
        location: { type: "string", description: "Birth location", example: "Novosibirsk, Russia" },
        timezone: { type: "string", description: "Timezone", example: "Asia/Novosibirsk" },
        progression_date: { type: "string", description: "Progression date (YYYY-MM-DD)", example: "2024-07-12" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "progression_date"]
    }
  },
  {
    name: "calculate_solar_arc_progressions",
    description: "☀️ Calculate solar arc progressions for timing major life events",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Person's name" },
        datetime: { type: "string", description: "Birth date and time (ISO 8601 format)", example: "1988-07-12T12:15:00" },
        latitude: { type: "number", description: "Birth latitude", example: 55.0084 },
        longitude: { type: "number", description: "Birth longitude", example: 82.9357 },
        location: { type: "string", description: "Birth location", example: "Novosibirsk, Russia" },
        timezone: { type: "string", description: "Timezone", example: "Asia/Novosibirsk" },
        progression_date: { type: "string", description: "Progression date (YYYY-MM-DD)", example: "2024-07-12" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "progression_date"]
    }
  },
  {
    name: "calculate_tertiary_progressions",
    description: "🌟 Calculate tertiary progressions for monthly cycles and detailed timing",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Person's name" },
        datetime: { type: "string", description: "Birth date and time (ISO 8601 format)", example: "1988-07-12T12:15:00" },
        latitude: { type: "number", description: "Birth latitude", example: 55.0084 },
        longitude: { type: "number", description: "Birth longitude", example: 82.9357 },
        location: { type: "string", description: "Birth location", example: "Novosibirsk, Russia" },
        timezone: { type: "string", description: "Timezone", example: "Asia/Novosibirsk" },
        progression_date: { type: "string", description: "Progression date (YYYY-MM-DD)", example: "2024-07-12" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "progression_date"]
    }
  },
  {
    name: "compare_progressions",
    description: "⚖️ Compare different progression methods (secondary, solar arc, tertiary) for comprehensive analysis",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Person's name" },
        datetime: { type: "string", description: "Birth date and time (ISO 8601 format)", example: "1988-07-12T12:15:00" },
        latitude: { type: "number", description: "Birth latitude", example: 55.0084 },
        longitude: { type: "number", description: "Birth longitude", example: 82.9357 },
        location: { type: "string", description: "Birth location", example: "Novosibirsk, Russia" },
        timezone: { type: "string", description: "Timezone", example: "Asia/Novosibirsk" },
        progression_date: { type: "string", description: "Progression date (YYYY-MM-DD)", example: "2024-07-12" },
        compare_methods: { type: "array", items: { type: "string" }, description: "Methods to compare", example: ["secondary", "solar_arc"] }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "progression_date"]
    }
  },
  {
    name: "create_progressions_timeline",
    description: "📅 Create comprehensive progressions timeline for life planning and event timing",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Person's name" },
        datetime: { type: "string", description: "Birth date and time (ISO 8601 format)", example: "1988-07-12T12:15:00" },
        latitude: { type: "number", description: "Birth latitude", example: 55.0084 },
        longitude: { type: "number", description: "Birth longitude", example: 82.9357 },
        location: { type: "string", description: "Birth location", example: "Novosibirsk, Russia" },
        timezone: { type: "string", description: "Timezone", example: "Asia/Novosibirsk" },
        progression_date: { type: "string", description: "Progression date (YYYY-MM-DD)", example: "2024-07-12" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "progression_date"]
    }
  },
  {
    name: "analyze_progressions_aspects",
    description: "🎯 Analyze specific progressions aspects for precise timing and influences",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Person's name" },
        datetime: { type: "string", description: "Birth date and time (ISO 8601 format)", example: "1988-07-12T12:15:00" },
        latitude: { type: "number", description: "Birth latitude", example: 55.0084 },
        longitude: { type: "number", description: "Birth longitude", example: 82.9357 },
        location: { type: "string", description: "Birth location", example: "Novosibirsk, Russia" },
        timezone: { type: "string", description: "Timezone", example: "Asia/Novosibirsk" },
        progression_date: { type: "string", description: "Progression date (YYYY-MM-DD)", example: "2024-07-12" }
      },
      required: ["name", "datetime", "latitude", "longitude", "location", "timezone", "progression_date"]
    }
  },
  {
    name: "get_progressions_info",
    description: "ℹ️ Get comprehensive information about progressions module and its capabilities",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    }
  }
