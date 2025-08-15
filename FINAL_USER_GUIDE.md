# 🌟 AstroCore MCP Server - Финальная Инструкция

## 🎯 Переменные Окружения

**Обновленные, более понятные названия:**

- `ASTROVISOR_API_KEY` - Ваш API ключ AstroCore
- `ASTROVISOR_URL` - URL сервера AstroCore (по умолчанию: https://astrovisor.io)

## 📋 Конфигурация для Claude Desktop

### Правильная конфигурация (STDIO MCP):

```json
{
  "mcpServers": {
    "astrovisor": {
      "command": "node",
      "args": ["/path/to/astrovisor-mcp/build/index.js"],
      "env": {
        "ASTROVISOR_API_KEY": "YOUR-API-KEY-HERE",
        "ASTROVISOR_URL": "https://astrovisor.io"
      }
    }
  }
}
```

### Пример с реальными путями:

**Windows:**
```json
{
  "mcpServers": {
    "astrovisor": {
      "command": "node",
      "args": ["C:\\Users\\YourName\\astrovisor-mcp\\build\\index.js"],
      "env": {
        "ASTROVISOR_API_KEY": "pk-your-actual-key-here",
        "ASTROVISOR_URL": "https://astrovisor.io"
      }
    }
  }
}
```

**macOS/Linux:**
```json
{
  "mcpServers": {
    "astrovisor": {
      "command": "node",
      "args": ["/Users/yourname/astrovisor-mcp/build/index.js"],
      "env": {
        "ASTROVISOR_API_KEY": "pk-your-actual-key-here", 
        "ASTROVISOR_URL": "https://astrovisor.io"
      }
    }
  }
}
```

## 🔧 Шаги установки:

1. **Получите API ключ** от AstroCore
2. **Скачайте MCP сервер** (файлы build/index.js и зависимости)
3. **Найдите файл конфигурации Claude Desktop:**
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/claude/claude_desktop_config.json`
4. **Добавьте конфигурацию** с правильным путем к index.js
5. **Замените YOUR-API-KEY-HERE** на ваш настоящий ключ
6. **Перезапустите Claude Desktop**

## 🌐 Альтернатива: HTTP MCP (для веб-интеграций)

Если нужен HTTP доступ:
```
URL: https://astrovisor.io/mcp
Method: POST
Headers: Authorization: Bearer YOUR-API-KEY
```

## ✅ Проверка работы

После настройки спросите Claude:
- "Какие астрологические инструменты доступны?"
- "Рассчитай мою натальную карту"
- "Проверь мой API ключ"

## 🛠️ Доступные инструменты:

- `calculate_natal_chart` - Натальная карта
- `calculate_jyotish` - Ведическая астрология
- `calculate_solar_return` - Соляр
- `validate_api_key` - Проверка API ключа

## 🆘 Решение проблем:

- **Сервер не найден**: Проверьте путь к index.js
- **API ключ недействителен**: Убедитесь что ключ корректный
- **Claude не видит инструменты**: Перезапустите Claude Desktop

## 📞 Поддержка:

support@astrocore.api
