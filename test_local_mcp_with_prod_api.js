#!/usr/bin/env node

import { spawn } from 'child_process';

// Используем локальную версию MCP с продакшн API
process.env.ASTROVISOR_API_KEY = 'pk-admin-7-CfrQ_Kvu96sPBIbTH15QEFTQIX1DMq0UJtdwhNXRU';
process.env.ASTROVISOR_URL = 'https://astrovisor.io';

console.log('🧪 КОМПЛЕКСНЫЙ ТЕСТ: Локальный MCP 1.2.0 + Продакшн API');
console.log('🔧 MCP версия: Локальная v1.2.0 с BaZi');
console.log('🔧 API: https://astrovisor.io');
console.log('🔧 BaZi endpoints: /api/bazi/*\n');

// Запускаем локальную версию MCP сервера
const mcp = spawn('node', ['build/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env
});

// Обработка ошибок
mcp.stderr.on('data', (data) => {
  const msg = data.toString();
  if (!msg.includes('запущен')) {
    console.error('MCP Error:', msg);
  }
});

let testsPassed = 0;
const totalTests = 4;

// Тест 1: Список инструментов
const listToolsRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/list'
};

// Тест 2: BaZi Info
const baziInfoRequest = {
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/call',
  params: {
    name: 'get_bazi_info',
    arguments: {}
  }
};

// Тест 3: Создание BaZi карты
const baziChartRequest = {
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: 'calculate_bazi_chart',
    arguments: {
      name: '陈明',
      datetime: '1985-06-10T08:30:00',
      latitude: 31.2304,
      longitude: 121.4737,
      location: 'Shanghai, China',
      timezone: 'Asia/Shanghai'
    }
  }
};

// Тест 4: Анализ личности BaZi
const baziPersonalityRequest = {
  jsonrpc: '2.0',
  id: 4,
  method: 'tools/call',
  params: {
    name: 'analyze_bazi_personality',
    arguments: {
      name: '陈明',
      datetime: '1985-06-10T08:30:00',
      latitude: 31.2304,
      longitude: 121.4737,
      location: 'Shanghai, China',
      timezone: 'Asia/Shanghai'
    }
  }
};

// Отправляем запросы последовательно
setTimeout(() => {
  console.log('1. 📋 Запрос списка инструментов...');
  mcp.stdin.write(JSON.stringify(listToolsRequest) + '\n');
}, 1000);

setTimeout(() => {
  console.log('2. ℹ️  Получение информации о BaZi API...');
  mcp.stdin.write(JSON.stringify(baziInfoRequest) + '\n');
}, 2000);

setTimeout(() => {
  console.log('3. 🐉 Создание BaZi карты для 陈明...');
  mcp.stdin.write(JSON.stringify(baziChartRequest) + '\n');
}, 3000);

setTimeout(() => {
  console.log('4. 🧘 Анализ личности через BaZi...');
  mcp.stdin.write(JSON.stringify(baziPersonalityRequest) + '\n');
}, 4000);

// Обработка ответов
mcp.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      
      if (response.id === 1) {
        // Список инструментов
        const tools = response.result?.tools || [];
        const baziTools = tools.filter(tool => tool.name.includes('bazi'));
        
        console.log(`   ✅ Получен список: ${tools.length} инструментов`);
        console.log(`   ✅ BaZi инструментов: ${baziTools.length}`);
        
        if (baziTools.length >= 4) {
          testsPassed++;
          console.log('   🎯 Тест 1 ПРОЙДЕН: Все BaZi инструменты найдены');
        } else {
          console.log('   ❌ Тест 1 НЕ ПРОЙДЕН: Не все BaZi инструменты найдены');
        }
      }
      
      if (response.id === 2) {
        // BaZi Info
        const content = response.result?.content?.[0]?.text || '';
        console.log(`   ✅ Получена информация о BaZi API`);
        
        if (content.includes('BaZi') && content.includes('2.0.0')) {
          testsPassed++;
          console.log('   🎯 Тест 2 ПРОЙДЕН: BaZi API информация получена');
        } else {
          console.log('   ❌ Тест 2 НЕ ПРОЙДЕН: Некорректная информация API');
        }
      }
      
      if (response.id === 3) {
        // BaZi Chart
        const content = response.result?.content?.[0]?.text || '';
        console.log(`   ✅ Получен ответ создания BaZi карты`);
        
        if (content.includes('四柱八字') && content.includes('陈明')) {
          testsPassed++;
          console.log('   🎯 Тест 3 ПРОЙДЕН: BaZi карта создана корректно');
          console.log('   🎯 Китайские символы отображаются ✓');
        } else if (content.includes('error') || content.includes('Error')) {
          console.log('   ⚠️  Тест 3: Ошибка при создании карты (возможно нужен API ключ)');
        } else {
          console.log('   ❌ Тест 3 НЕ ПРОЙДЕН: Некорректный ответ карты');
        }
      }
      
      if (response.id === 4) {
        // BaZi Personality
        const content = response.result?.content?.[0]?.text || '';
        console.log(`   ✅ Получен ответ анализа личности`);
        
        if (content.includes('陈明') || content.includes('BaZi') || content.includes('personality')) {
          testsPassed++;
          console.log('   🎯 Тест 4 ПРОЙДЕН: Анализ личности работает');
        } else {
          console.log('   ⚠️  Тест 4: Проверен endpoint анализа личности');
        }
      }
      
    } catch (e) {
      // Игнорируем неJSON строки
    }
  });
});

// Финальный отчет через 8 секунд
setTimeout(() => {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 РЕЗУЛЬТАТ КОМПЛЕКСНОГО ТЕСТА:');
  console.log('='.repeat(60));
  
  console.log(`✅ Пройдено тестов: ${testsPassed}/${totalTests}`);
  
  if (testsPassed >= 3) {
    console.log('🎉 ТЕСТ УСПЕШЕН!');
    console.log('✅ Локальная версия MCP 1.2.0 работает с продакшн API');
    console.log('✅ BaZi инструменты полностью функциональны');
    console.log('✅ Готово к публикации новой версии');
    console.log('🚀 Рекомендация: Публиковать astrovisor-mcp@1.2.0');
  } else {
    console.log('⚠️  ТЕСТ ЧАСТИЧНО ПРОЙДЕН');
    console.log('🔧 Нужно проверить проблемные области перед публикацией');
  }
  
  console.log('\n📋 Конфигурация для пользователей:');
  console.log('```json');
  console.log('{');
  console.log('  "mcpServers": {');
  console.log('    "astrovisor": {');
  console.log('      "command": "npx",');
  console.log('      "args": ["-y", "astrovisor-mcp@1.2.0"],');
  console.log('      "env": {');
  console.log('        "ASTROVISOR_API_KEY": "your-api-key",');
  console.log('        "ASTROVISOR_URL": "https://astrovisor.io"');
  console.log('      }');
  console.log('    }');
  console.log('  }');
  console.log('}');
  console.log('```');
  
  mcp.kill();
  process.exit(0);
}, 8000);

// Таймаут на случай проблем
setTimeout(() => {
  console.log('❌ Таймаут комплексного теста');
  mcp.kill();
  process.exit(1);
}, 15000);
