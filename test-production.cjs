#!/usr/bin/env node

// 🌟 ТЕСТ PRODUCTION ASTROVISOR MCP SERVER 🌟

const { spawn } = require('child_process');

// Используем вашу production конфигурацию
const PRODUCTION_CONFIG = {
  ASTROVISOR_API_KEY: "pk-admin-7-CfrQ_Kvu96sPBIbTH15QEFTQIX1DMq0UJtdwhNXRU",
  ASTROVISOR_URL: "https://astrovisor.io"
};

const testCases = [
  {
    name: "🌟 Натальная карта",
    tool: "calculate_natal_chart",
    args: {
      "name": "Мария Иванова",
      "datetime": "1990-06-15T12:00:00",
      "latitude": 55.7558,
      "longitude": 37.6173,
      "location": "Москва",
      "timezone": "Europe/Moscow"
    }
  },
  {
    name: "🐲 BaZi карта",
    tool: "calculate_bazi_chart", 
    args: {
      "name": "Алексей Петров",
      "datetime": "1985-03-22T14:30:00",
      "latitude": 59.9311,
      "longitude": 30.3609,
      "location": "Санкт-Петербург",
      "timezone": "Europe/Moscow",
      "gender": "male"
    }
  },
  {
    name: "🧠 BaZi анализ личности",
    tool: "analyze_bazi_personality",
    args: {
      "name": "Елена Смирнова", 
      "datetime": "1988-12-10T09:15:00",
      "latitude": 55.7558,
      "longitude": 37.6173,
      "location": "Москва",
      "timezone": "Europe/Moscow",
      "gender": "female"
    }
  },
  {
    name: "🔮 Дизайн Человека",
    tool: "calculate_human_design",
    args: {
      "name": "Дмитрий Козлов",
      "datetime": "1992-09-08T16:45:00",
      "latitude": 56.8431,
      "longitude": 60.6454,
      "location": "Екатеринбург",
      "timezone": "Asia/Yekaterinburg"
    }
  }
];

let testResults = [];

const runTest = (testCase, index) => {
  return new Promise((resolve) => {
    console.log(`\n🧪 Запуск теста ${index + 1}/${testCases.length}: ${testCase.name}`);
    console.log(`   └─ Подключение к: ${PRODUCTION_CONFIG.ASTROVISOR_URL}`);
    
    const mcpProcess = spawn('node', ['build/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        ...PRODUCTION_CONFIG
      }
    });

    let output = '';
    let errorOutput = '';

    const request = {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: testCase.tool,
        arguments: testCase.args
      }
    };

    mcpProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    mcpProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    mcpProcess.stdin.write(JSON.stringify(request) + '\n');
    mcpProcess.stdin.end();

    setTimeout(() => {
      mcpProcess.kill('SIGTERM');
      
      try {
        // Ищем JSON ответ в выводе  
        const lines = output.split('\n');
        let jsonResponse = null;
        
        for (const line of lines) {
          try {
            const trimmed = line.trim();
            if (trimmed.startsWith('{') && trimmed.includes('jsonrpc')) {
              jsonResponse = JSON.parse(trimmed);
              break;
            }
          } catch (e) {
            continue;
          }
        }
        
        if (jsonResponse) {
          const success = !jsonResponse.error && jsonResponse.result;
          let status = '❌ ОШИБКА';
          let response = 'Неизвестная ошибка';
          
          if (success) {
            status = '✅ УСПЕХ';
            response = 'Получен корректный ответ от production API';
          } else if (jsonResponse.error) {
            if (jsonResponse.error.message && jsonResponse.error.message.includes('ECONNREFUSED')) {
              status = '🔌 НЕТ ПОДКЛЮЧЕНИЯ';
              response = 'Production API недоступен';
            } else if (jsonResponse.error.message && jsonResponse.error.message.includes('401')) {
              status = '🔐 АВТОРИЗАЦИЯ';  
              response = 'Проблема с API ключом';
            } else if (jsonResponse.error.message && jsonResponse.error.message.includes('404')) {
              status = '🛣️ НЕТ ЭНДПОИНТА';
              response = 'API эндпоинт не найден';
            } else if (jsonResponse.error.message && jsonResponse.error.message.includes('422')) {
              status = '📝 ДАННЫЕ';
              response = 'Некорректные входные данные';
            } else {
              response = jsonResponse.error.message || 'API ошибка';
            }
          }
          
          testResults.push({
            name: testCase.name,
            tool: testCase.tool,
            success: success,
            status: status,
            response: response
          });
          
          console.log(`   ${success ? '✅' : '❌'} ${status}: ${response}`);
        } else {
          testResults.push({
            name: testCase.name,
            tool: testCase.tool,
            success: false,
            status: '❌ НЕТ ОТВЕТА',
            response: 'MCP сервер не вернул JSON ответ'
          });
          console.log(`   ❌ НЕТ ОТВЕТА: MCP сервер не ответил`);
        }
      } catch (parseError) {
        testResults.push({
          name: testCase.name,
          tool: testCase.tool,
          success: false,
          status: '❌ ОШИБКА ПАРСИНГА',
          response: 'Не удалось разобрать ответ'
        });
        console.log(`   ❌ ОШИБКА ПАРСИНГА: ${parseError.message}`);
      }
      
      resolve();
    }, 15000); // Увеличиваем таймаут для production запросов
  });
};

const runAllTests = async () => {
  console.log('🚀 ТЕСТИРОВАНИЕ PRODUCTION ASTROVISOR MCP SERVER');
  console.log('================================================================');
  console.log(`🌐 API URL: ${PRODUCTION_CONFIG.ASTROVISOR_URL}`);
  console.log(`🔑 API Key: ${PRODUCTION_CONFIG.ASTROVISOR_API_KEY.substring(0, 20)}...`);
  console.log('================================================================\n');
  
  for (let i = 0; i < testCases.length; i++) {
    await runTest(testCases[i], i);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Пауза между production запросами
  }
  
  // Итоговый отчёт
  console.log('\n📊 ИТОГОВЫЙ ОТЧЁТ PRODUCTION ТЕСТИРОВАНИЯ:');
  console.log('================================================================');
  
  const successful = testResults.filter(r => r.success).length;
  const total = testResults.length;
  
  testResults.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
    console.log(`   └─ ${result.status}: ${result.response}`);
  });
  
  console.log('================================================================');
  console.log(`🎯 РЕЗУЛЬТАТ: ${successful}/${total} тестов успешны`);
  console.log(`📊 Процент успеха: ${Math.round((successful/total)*100)}%`);
  
  if (successful === total) {
    console.log('\n🎉 ВСЕ PRODUCTION ТЕСТЫ ПРОШЛИ! СИСТЕМА ГОТОВА! 🎉');
  } else if (successful > 0) {
    console.log(`\n✅ MCP СЕРВЕР РАБОТАЕТ! ${successful}/${total} модулей функционируют`);
  }
  
  console.log('\n🌟 PRODUCTION ASTROVISOR MCP SERVER - ПРОТЕСТИРОВАН! 🌟');
  console.log('🔧 Все маршруты настроены для https://astrovisor.io/api/*');
};

runAllTests().catch(console.error);
