# 🔑 Админская конфигурация MCP сервера AstroVisor

## Ваш админский API ключ
```
pk-admin-7-CfrQ_Kvu96sPBIbTH15QEFTQIX1DMq0UJtdwhNXRU
```

**Характеристики:**
- ✅ Безлимитный доступ (999,999 запросов)
- ✅ Действует 10 лет
- ✅ Админские права
- ✅ Статус: Активен

## 🛠 Конфигурация для Claude Desktop

Скопируйте эту конфигурацию в файл настроек Claude Desktop:

**Путь к файлу настроек:**
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "astrovisor": {
      "command": "node",
      "args": ["/root/astrovisor-mcp/build/index.js"],
      "env": {
        "PREDICT_CLI_API_KEY": "pk-admin-7-CfrQ_Kvu96sPBIbTH15QEFTQIX1DMq0UJtdwhNXRU",
        "PREDICT_CLI_API_URL": "https://astrovisor.io"
      }
    }
  }
}
```

## 🚀 Запуск MCP сервера

Если нужно запустить сервер отдельно:

```bash
cd /root/astrovisor-mcp
PREDICT_CLI_API_KEY="pk-admin-7-CfrQ_Kvu96sPBIbTH15QEFTQIX1DMq0UJtdwhNXRU" \
PREDICT_CLI_API_URL="https://astrovisor.io" \
node build/index.js
```

## ✅ Проверка работоспособности

API ключ протестирован и работает:
- ✅ Проверка ключа: `/v1/auth/validate`
- ✅ MCP сервер запускается без ошибок
- ✅ Все эндпоинты доступны

**Статистика ключа:**
- Использований: 0
- Лимит: 999,999
- Осталось: 999,999

🎉 **Готово к использованию!**
