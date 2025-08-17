# 🚨 ПРОБЛЕМА: NPX кэширует старую версию!

## 🔍 Проблема:
Ошибка `http://localhost:8000: No such file or directory` означает, что NPX использует кэшированную старую версию пакета.

## 🔧 РЕШЕНИЕ: Принудительное обновление

### Обновите конфигурацию Claude Desktop:

```json
{
  "mcpServers": {
    "astrovisor": {
      "command": "npx",
      "args": ["--yes", "--force", "astrovisor-mcp@latest"],
      "env": {
        "ASTROVISOR_API_KEY": "pk-admin-7-CfrQ_Kvu96sPBIbTH15QEFTQIX1DMq0UJtdwhNXRU",
        "ASTROVISOR_URL": "https://astrovisor.io"
      }
    }
  }
}
```

### 🔑 Ключевые изменения:
- `--force` - принудительно обновить кэш
- `@latest` - всегда использовать последнюю версию
- `--yes` - автоматически подтвердить установку

## 🚀 Шаги:
1. **Обновить конфигурацию** с `--force` флагом
2. **Полностью перезапустить Claude Desktop**
3. **Тестировать**: NPX загрузит свежую версию

## ✅ Ожидаемый результат:
```
🌟 AstroVisor MCP Server v2.3.3 with Progressions started
```

## 🧪 Тест после запуска:
```
"Покажи информацию о прогрессиях"
```

---
**Принудительное обновление решит проблему кэширования!** 🔄
