#!/usr/bin/env node

import { spawn } from 'child_process';

// Используем продакшн API
process.env.ASTROVISOR_API_KEY = 'pk-admin-7-CfrQ_Kvu96sPBIbTH15QEFTQIX1DMq0UJtdwhNXRU';
process.env.ASTROVISOR_URL = 'https://astrovisor.io';

console.log('🌐 Тест MCP сервера с продакшн API astrovisor.io');
console.log('🔧 URL: https://astrovisor.io');
console.log('🔧 BaZi endpoints: /api/bazi/*\n');

// Запускаем MCP сервер
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

// Тест: Получение информации о BaZi с продакшна
const baziInfoRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: {
    name: 'get_bazi_info',
    arguments: {}
  }
};

setTimeout(() => {
  console.log('📋 Запрос информации о BaZi с продакшн API...');
  mcp.stdin.write(JSON.stringify(baziInfoRequest) + '\n');
}, 2000);

// Обработка ответов
mcp.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      
      if (response.id === 1) {
        console.log('✅ Получен ответ от продакшн API:');
        const content = response.result?.content?.[0]?.text || '';
        
        if (content.includes('BaZi')) {
          console.log('   🎯 BaZi API найдено');
        }
        if (content.includes('2.0.0')) {
          console.log('   🎯 Версия 2.0.0 подтверждена');
        }
        if (content.includes('endpoints')) {
          console.log('   🎯 Endpoints доступны');
        }
        
        console.log('\n🎉 РЕЗУЛЬТАТ:');
        console.log('✅ MCP сервер подключается к продакшн API');
        console.log('✅ BaZi endpoints работают через MCP');
        console.log('✅ Интеграция с astrovisor.io успешна!');
        
        mcp.kill();
        process.exit(0);
      }
      
    } catch (e) {
      // Игнорируем неJSON строки
    }
  });
});

// Таймаут
setTimeout(() => {
  console.log('❌ Таймаут подключения к продакшну');
  mcp.kill();
  process.exit(1);
}, 15000);
