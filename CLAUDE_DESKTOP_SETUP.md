# 🌟 AstroCore MCP для Claude Desktop

## ⚠️ Важно: Claude Desktop и HTTP MCP

К сожалению, **Claude Desktop пока не поддерживает HTTP-based MCP серверы**. Claude Desktop работает только со **stdio-based** MCP серверами.

## 🔧 Решение: STDIO MCP Сервер

Для работы с Claude Desktop используйте наш stdio MCP сервер:

### Конфигурация для Claude Desktop:

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

### Шаги для установки:

1. **Скачайте MCP сервер:**
   ```bash
   git clone https://github.com/your-repo/astrovisor-mcp
   cd astrovisor-mcp
   npm install
   npm run build
   ```

2. **Получите API ключ** от AstroCore

3. **Добавьте конфигурацию** в Claude Desktop:
   
   **Местоположение файла конфигурации:**
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux**: `~/.config/claude/claude_desktop_config.json`

4. **Замените путь и API ключ** в конфигурации

5. **Перезапустите Claude Desktop**

## 🌐 Альтернатива: HTTP MCP для Web

Для веб-интеграций используйте HTTP MCP:

```
URL: https://astrovisor.io/mcp
Headers: Authorization: Bearer YOUR-API-KEY
```

## 🛠️ Доступные инструменты:

- `calculate_natal_chart` - Расчет натальной карты
- `calculate_jyotish` - Ведическая астрология
- `calculate_solar_return` - Соляр
- `validate_api_key` - Проверка API ключа

## 📞 Поддержка

Если нужна помощь с настройкой:
- Email: support@astrocore.api
- GitHub: [Issues](https://github.com/your-repo/astrovisor-mcp/issues)

## 📋 Проверка работы

После настройки спросите Claude:
- "Какие астрологические инструменты доступны?"
- "Можешь рассчитать мою натальную карту?"
