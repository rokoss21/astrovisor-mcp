#!/usr/bin/env node

// 🧪 ТЕСТ ИНТЕГРАЦИИ MCP СЕРВЕРА С ПОЛНЫМ BACKEND 🧪

import axios from 'axios';
import { spawn } from 'child_process';

const API_BASE_URL = process.env.ASTROVISOR_URL || 'http://127.0.0.1:8002';
const API_KEY = process.env.ASTROVISOR_API_KEY || 'test-key-12345';

console.log('🧪 Starting Ultimate MCP Integration Test...');
console.log(`API URL: ${API_BASE_URL}`);

// Тестовые данные
const testData = {
  name: "Test User",
  datetime: "1990-06-15T12:00:00",
  latitude: 55.7558,
  longitude: 37.6176,
  location: "Moscow",
  timezone: "Europe/Moscow"
};

// Функция для тестирования эндпоинта
async function testEndpoint(endpoint, data, description) {
  try {
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`   Endpoint: ${endpoint}`);
    
    const response = await axios.post(`${API_BASE_URL}${endpoint}`, data, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    if (response.status === 200 && response.data) {
      console.log(`   ✅ SUCCESS - Status: ${response.status}`);
      console.log(`   📊 Response keys: ${Object.keys(response.data).join(', ')}`);
      return true;
    } else {
      console.log(`   ❌ FAILURE - Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
    if (error.response) {
      console.log(`   📄 Response: ${error.response.status} ${error.response.statusText}`);
    }
    return false;
  }
}

// Основные тесты
async function runIntegrationTests() {
  console.log('\n🌟 ULTIMATE MCP BACKEND INTEGRATION TESTS 🌟');
  console.log('=' * 60);
  
  const tests = [
    // Натальная астрология
    {
      endpoint: '/api/natal/calculate',
      data: testData,
      description: '🌟 Natal Chart Calculation'
    },
    
    // BaZi
    {
      endpoint: '/api/bazi/chart',
      data: { ...testData, gender: 'male' },
      description: '🐲 BaZi Chart Analysis'
    },
    
    {
      endpoint: '/api/bazi/personality',
      data: { 
        name: testData.name,
        datetime: testData.datetime,
        location: testData.location,
        gender: 'male'
      },
      description: '🧠 BaZi Personality Analysis'
    },
    
    // Дизайн Человека
    {
      endpoint: '/api/human-design/calculate',
      data: testData,
      description: '🔮 Human Design Analysis'
    },
    
    // Нумерология
    {
      endpoint: '/api/numerology/calculate',
      data: {
        name: testData.name,
        datetime: testData.datetime
      },
      description: '🔢 Numerology Analysis'
    },
    
    // Матрица Судьбы
    {
      endpoint: '/api/matrix/calculate',
      data: {
        name: testData.name,
        datetime: testData.datetime,
        location: testData.location
      },
      description: '🎴 Matrix of Destiny Analysis'
    },
    
    // Транзиты
    {
      endpoint: '/api/transits/calculate',
      data: {
        name: testData.name,
        birth_datetime: testData.datetime,
        birth_latitude: testData.latitude,
        birth_longitude: testData.longitude,
        birth_location: testData.location,
        birth_timezone: testData.timezone,
        transit_date: "2024-12-31"
      },
      description: '⚡ Transits Analysis'
    }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const success = await testEndpoint(test.endpoint, test.data, test.description);
    if (success) passed++;
    
    // Небольшая пауза между запросами
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 INTEGRATION TEST RESULTS:');
  console.log('=' * 40);
  console.log(`   ✅ Passed: ${passed}/${total}`);
  console.log(`   📈 Success Rate: ${((passed/total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED! MCP Integration Ready! 🎉');
  } else {
    console.log(`\n⚠️  ${total - passed} tests failed. Check backend status.`);
  }
  
  return passed === total;
}

// Тест доступности API
async function testApiHealth() {
  try {
    console.log('🩺 Testing API Health...');
    const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 10000 });
    console.log(`   ✅ API Health: ${response.status}`);
    return true;
  } catch (error) {
    console.log(`   ❌ API Health Check Failed: ${error.message}`);
    return false;
  }
}

// Главная функция
async function main() {
  console.log('🚀 Ultimate Astrovisor MCP Integration Test Suite');
  console.log('🎯 Testing all modules and endpoints...\n');
  
  // Проверяем здоровье API
  const healthOk = await testApiHealth();
  if (!healthOk) {
    console.log('⚠️  API is not responding. Make sure backend is running.');
    console.log('   Start with: cd /root/backend && uvicorn master:app --host 0.0.0.0 --port 8002');
    process.exit(1);
  }
  
  // Запускаем интеграционные тесты
  const success = await runIntegrationTests();
  
  if (success) {
    console.log('\n🏆 MCP INTEGRATION TEST: SUCCESS');
    console.log('🌟 All modules are ready for MCP usage!');
    process.exit(0);
  } else {
    console.log('\n❌ MCP INTEGRATION TEST: PARTIAL FAILURE');
    console.log('🔧 Some modules need attention.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('💥 Critical error in test suite:', error);
  process.exit(1);
});
