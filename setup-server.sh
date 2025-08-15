#!/bin/bash

# Установка Node.js (если не установлен)
if ! command -v node &> /dev/null; then
    echo "Установка Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
fi

# Установка PM2 для управления процессами
npm install -g pm2

# Переход в директорию проекта
cd /root/astrovisor-mcp

# Установка зависимостей
npm install

# Создание конфигурации PM2 для MCP сервера
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'mcp-server',
    script: 'build/index.js',
    env: {
      PREDICT_CLI_API_KEY: "pk-_sOoRSMnb3YGXNo-f2SxsP3jFws.4k5ScYi9Th9fw5u5kjpvXD0YaGyxx32-GW6n2NRm9Eg",
      PREDICT_CLI_API_URL: "http://127.0.0.1:8002"
    }
  }]
};
EOF

echo "Настройка завершена!"
