# Конфигурация MCP для удаленного подключения

## Способ 1: SSH туннель (Рекомендуется)

Добавьте в ваш MCP конфиг:

```json
{
  "mcpServers": {
    "predict-cli-server-remote": {
      "command": "ssh",
      "args": [
        "-o", "StrictHostKeyChecking=no",
        "root@202.71.15.202",
        "cd /root/astrovisor-mcp && node build/index.js"
      ],
      "env": {
        "PREDICT_CLI_API_KEY": "pk-_sOoRSMnb3YGXNo-f2SxsP3jFws.4k5ScYi9Th9fw5u5kjpvXD0YaGyxx32-GW6n2NRm9Eg",
        "PREDICT_CLI_API_URL": "http://127.0.0.1:8002"
      }
    }
  }
}
```

## Способ 2: Локальная копия с удаленным API

Скопируйте MCP сервер локально и подключайтесь к удаленному API:

```json
{
  "mcpServers": {
    "predict-cli-server": {
      "command": "node",
      "args": ["/path/to/local/astrovisor-mcp/build/index.js"],
      "env": {
        "PREDICT_CLI_API_KEY": "pk-_sOoRSMnb3YGXNo-f2SxsP3jFws.4k5ScYi9Th9fw5u5kjpvXD0YaGyxx32-GW6n2NRm9Eg",
        "PREDICT_CLI_API_URL": "http://202.71.15.202:8002"
      }
    }
  }
}
```

## Требования для SSH подключения:

1. SSH ключи настроены для подключения к серверу
2. Node.js установлен локально
3. MCP сервер доступен на удаленной машине

## Тестирование подключения:

```bash
# Проверка SSH доступа
ssh root@202.71.15.202 "node /root/astrovisor-mcp/build/index.js --version"

# Проверка API
curl http://202.71.15.202:8002/health
```
