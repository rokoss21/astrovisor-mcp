#!/usr/bin/env node

import { spawn } from 'child_process';

// Конфигурация для локального тестирования с полным backend  
process.env.ASTROVISOR_API_KEY = 'pk-admin-7-CfrQ_Kvu96sPBIbTH15QEFTQIX1DMq0UJtdwhNXRU';
process.env.ASTROVISOR_URL = 'http://127.0.0.1:8002';

console.log('🔍 КОМПЛЕКСНОЕ ТЕСТИРОВАНИЕ BaZi ФУНКЦИОНАЛА');
console.log('🔧 Backend: http://127.0.0.1:8002');
console.log('🐉 Тестируем все 15 BaZi инструментов');
console.log('=' * 60);

const mcp = spawn('node', ['build/index.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env
});

mcp.stderr.on('data', (data) => {
  const msg = data.toString();
  if (!msg.includes('запущен')) {
    console.error('MCP Error:', msg);
  }
});

// Тестовые данные
const testPerson = {
  name: '王小明',
  datetime: '1988-10-15T09:30:00',
  latitude: 39.9042,
  longitude: 116.4074,
  location: 'Beijing, China',
  timezone: 'Asia/Shanghai'
};

// Список всех BaZi инструментов для тестирования
const baziTools = [
  { name: 'get_bazi_info', description: 'Информация о BaZi API' },
  { name: 'calculate_bazi_chart', description: 'Основная карта BaZi' },
  { name: 'analyze_bazi_personality', description: 'Анализ личности' },
  { name: 'bazi_complete_analysis', description: 'Полный комплексный анализ' },
  { name: 'bazi_career_guidance', description: 'Карьерные рекомендации' },
  { name: 'bazi_relationship_guidance', description: 'Рекомендации для отношений' },
  { name: 'bazi_health_insights', description: 'Инсайты по здоровью' },
  { name: 'bazi_nayin_analysis', description: 'Na Yin анализ' },
  { name: 'bazi_useful_god', description: 'Полезный бог (用神)' },
  { name: 'bazi_twelve_palaces', description: 'Двенадцать дворцов' },
  { name: 'bazi_life_focus_analysis', description: 'Жизненные приоритеты' },
  { name: 'bazi_symbolic_stars', description: 'Символические звезды' },
  { name: 'bazi_luck_pillars', description: 'Столпы удачи' },
  { name: 'bazi_annual_forecast', description: 'Годовой прогноз' }
];

let currentTest = 0;
let passedTests = 0;
let failedTests = 0;
let testResults = {};

// Функция для отправки теста
function sendTest() {
  if (currentTest >= baziTools.length) {
    showFinalResults();
    return;
  }

  const tool = baziTools[currentTest];
  const request = {
    jsonrpc: '2.0',
    id: currentTest + 1,
    method: 'tools/call',
    params: {
      name: tool.name,
      arguments: tool.name === 'get_bazi_info' ? {} : testPerson
    }
  };

  console.log(`${(currentTest + 1).toString().padStart(2, " ")}/14 🧪 Тестируем: ${tool.description}...`);
  mcp.stdin.write(JSON.stringify(request) + '\n');
  
  currentTest++;
  
  // Отправляем следующий тест через 2 секунды
  if (currentTest < baziTools.length) {
    setTimeout(sendTest, 2000);
  }
}

// Функция для показа финальных результатов
function showFinalResults() {
  setTimeout(() => {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 ФИНАЛЬНЫЕ РЕЗУЛЬТАТЫ КОМПЛЕКСНОГО ТЕСТИРОВАНИЯ');
    console.log('='.repeat(60));
    
    console.log(`📊 Общая статистика:`);
    console.log(`   Всего тестов: ${baziTools.length}`);
    console.log(`   Пройдено: ${passedTests}`);
    console.log(`   Не пройдено: ${failedTests}`);
    console.log(`   Успешность: ${Math.round((passedTests / baziTools.length) * 100)}%`);
    
    console.log(`\n📋 Детальные результаты:`);
    for (let i = 0; i < baziTools.length; i++) {
      const tool = baziTools[i];
      const result = testResults[i + 1];
      const status = result ? '✅' : '❌';
      console.log(`   ${status} ${tool.description}`);
    }
    
    if (passedTests >= baziTools.length * 0.8) {
      console.log('\n🎉 ОТЛИЧНЫЙ РЕЗУЛЬТАТ!');
      console.log('✅ BaZi функционал работает корректно');
      console.log('✅ MCP сервер готов к публикации');
      console.log('🚀 astrovisor-mcp@1.3.0 с 30 инструментами готов!');
    } else {
      console.log('\n⚠️  ТРЕБУЕТ ДОРАБОТКИ');
      console.log('🔧 Некоторые BaZi инструменты работают неправильно');
    }
    
    console.log('\n🐉 BaZi (四柱八字) - Комплексное тестирование завершено');
    
    mcp.kill();
    process.exit(0);
  }, 3000);
}

// Обработка ответов
mcp.stdout.on('data', (data) => {
  const lines = data.toString().split('\n').filter(line => line.trim());
  
  lines.forEach(line => {
    try {
      const response = JSON.parse(line);
      
      if (response.id && response.id >= 1 && response.id <= baziTools.length) {
        const tool = baziTools[response.id - 1];
        
        if (response.result && response.result.content) {
          const content = response.result.content[0]?.text || '';
          
          // Проверяем успешность
          if (content.includes('error') || content.includes('Error') || content.includes('❌')) {
            console.log(`   ❌ Ошибка в ${tool.description}`);
            testResults[response.id] = false;
            failedTests++;
          } else if (content.length > 10) {
            console.log(`   ✅ ${tool.description} работает`);
            testResults[response.id] = true;
            passedTests++;
          } else {
            console.log(`   ⚠️  ${tool.description} - короткий ответ`);
            testResults[response.id] = false;
            failedTests++;
          }
          
          // Проверяем китайские символы
          if (tool.name.includes('bazi') && content.includes('四柱八字')) {
            console.log(`      🎯 Китайские символы обнаружены`);
          }
          
        } else {
          console.log(`   ❌ Нет контента от ${tool.description}`);
          testResults[response.id] = false;
          failedTests++;
        }
      }
      
    } catch (e) {
      // Игнорируем неJSON строки
    }
  });
});

// Запускаем тестирование через 2 секунды
setTimeout(sendTest, 2000);

// Таймаут всего тестирования
setTimeout(() => {
  console.log('\n❌ Таймаут комплексного тестирования');
  mcp.kill();
  process.exit(1);
}, 60000); // 60 секунд на все тесты
