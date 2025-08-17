#!/usr/bin/env node

// 🧪 ТЕСТ ПРАВИЛЬНЫХ ЭНДПОИНТОВ MCP СЕРВЕРА 🧪

import axios from 'axios';

const API_BASE_URL = process.env.ASTROVISOR_URL || 'http://127.0.0.1:8002';
const API_KEY = process.env.ASTROVISOR_API_KEY || 'test-key-12345';

console.log('🧪 Testing Corrected Endpoints...');

// Тестовые данные
const testData = {
  name: "Test User",
  datetime: "1990-06-15T12:00:00",
  latitude: 55.7558,
  longitude: 37.6176,
  location: "Moscow",
  timezone: "Europe/Moscow"
};

async function testCorrectEndpoints() {
  console.log('\n🌟 TESTING CORRECT BACKEND ENDPOINTS 🌟');
  
  const tests = [
    // Используем правильные эндпоинты из app.py
    {
      endpoint: '/api/natal/chart',
      data: testData,
      description: '🌟 Natal Chart (Correct Endpoint)'
    },
    
    {
      endpoint: '/api/human-design/calculate',
      data: testData,
      description: '🔮 Human Design (Correct Endpoint)'
    },
    
    {
      endpoint: '/api/numerology/calculate',
      data: {
        name: testData.name,
        datetime: testData.datetime
      },
      description: '🔢 Numerology (Correct Endpoint)'
    },
    
    {
      endpoint: '/api/matrix/calculate',
      data: {
        name: testData.name,
        datetime: testData.datetime,
        location: testData.location
      },
      description: '🎴 Matrix of Destiny (Correct Endpoint)'
    }
  ];
  
  let passed = 0;
  
  for (const test of tests) {
    try {
      console.log(`\n🔍 Testing: ${test.description}`);
      console.log(`   Endpoint: ${test.endpoint}`);
      
      const response = await axios.post(`${API_BASE_URL}${test.endpoint}`, test.data, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      if (response.status === 200) {
        console.log(`   ✅ SUCCESS - Status: ${response.status}`);
        passed++;
      } else {
        console.log(`   ❌ FAILURE - Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      if (error.response) {
        console.log(`   📄 Response: ${error.response.status} ${error.response.statusText}`);
        if (error.response.data) {
          console.log(`   💡 Details:`, JSON.stringify(error.response.data, null, 2));
        }
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 RESULTS: ${passed}/${tests.length} tests passed`);
  return passed === tests.length;
}

testCorrectEndpoints().then(success => {
  if (success) {
    console.log('\n🎉 ALL ENDPOINTS WORKING!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some endpoints need attention.');
    process.exit(1);
  }
});
