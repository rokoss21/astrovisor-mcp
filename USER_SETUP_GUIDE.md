# 🌟 AstroCore MCP Server - Настройка для пользователей

Этот MCP сервер позволяет использовать AstroCore API через протокол Model Context Protocol (MCP).

## 📋 Требования

1. **Получить API ключ** на https://astrovisor.io
2. **Node.js** версии 18 или выше
3. **MCP-совместимый клиент** (например, Claude Desktop)

## 🚀 Быстрая настройка

### Шаг 1: Получение API ключа

1. Перейдите на https://astrovisor.io
2. Зарегистрируйтесь или войдите в аккаунт
3. Получите свой API ключ (формат: `pk-xxxxxxxxxx`)

### Шаг 2: Настройка MCP клиента

Добавьте следующую конфигурацию в ваш MCP клиент:

```json
{
  "mcpServers": {
    "astrovisor-api": {
      "command": "node",
      "args": ["/path/to/astrovisor-mcp/build/index.js"],
      "env": {
        "PREDICT_CLI_API_KEY": "ВАШ_API_КЛЮЧ_ЗДЕСЬ",
        "PREDICT_CLI_API_URL": "https://astrovisor.io"
      }
    }
  }
}
```

**Важно:** Замените:
- `ВАШ_API_КЛЮЧ_ЗДЕСЬ` на ваш реальный API ключ
- `/path/to/astrovisor-mcp/build/index.js` на реальный путь к серверу

### Шаг 3: Использование

После настройки вы получите доступ к следующим инструментам:

#### 🌟 Доступные инструменты:

1. **calculate_natal_chart** - Натальная карта
2. **calculate_vedic_chart** - Ведическая астрология (Jyotish)
3. **calculate_solar_return** - Солярное возвращение
4. **calculate_progressions** - Прогрессии
5. **calculate_directions** - Дирекции
6. **analyze_relationship** - Анализ отношений
7. **find_best_locations** - Астрокартография
8. **analyze_horary_question** - Хорарная астрология
9. **calculate_numerology** - Нумерология
10. **calculate_matrix** - Матрица судьбы
11. **calculate_human_design** - Дизайн человека

## 💡 Пример использования

После настройки вы можете просить вашего MCP клиента:

```
Рассчитай натальную карту для человека по имени Иван, 
родившегося 1 января 1990 года в 12:00 в Москве
```

MCP сервер автоматически преобразует это в вызов соответствующего API.

## 🔐 Безопасность

- **Никогда не делитесь своим API ключом**
- **Не публикуйте конфигурацию с реальным ключом** в публичных репозиториях
- **Используйте переменные окружения** для дополнительной безопасности

## ⚡ Расширенная настройка

Если вы хотите использовать переменные окружения:

1. Создайте `.env` файл:
```bash
PREDICT_CLI_API_KEY=ваш_api_ключ
PREDICT_CLI_API_URL=https://astrovisor.io
```

2. Измените конфигурацию MCP:
```json
{
  "mcpServers": {
    "astrovisor-api": {
      "command": "node",
      "args": ["/path/to/astrovisor-mcp/build/index.js"],
      "env": {
        "PREDICT_CLI_API_KEY": "${PREDICT_CLI_API_KEY}",
        "PREDICT_CLI_API_URL": "${PREDICT_CLI_API_URL}"
      }
    }
  }
}
```

## 🆘 Поддержка

При возникновении проблем:

1. **Проверьте API ключ** - убедитесь что он валиден на https://astrovisor.io/v1/auth/validate
2. **Проверьте логи** - посмотрите на ошибки в консоли MCP клиента
3. **Обратитесь в поддержку** на https://astrovisor.io

## 🔄 Обновления

Следите за обновлениями на:
- GitHub репозитории проекта
- https://astrovisor.io для новых функций API

---

**Примечание:** Этот MCP сервер является прокси для AstroCore API. Все вычисления происходят на серверах AstroCore с использованием вашего личного API ключа.
