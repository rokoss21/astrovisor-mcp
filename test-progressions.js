#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test data
const testPersonData = {
  name: "Test Person",
  datetime: "1988-07-12T12:15:00",
  latitude: 55.0084,
  longitude: 82.9357,
  location: "Novosibirsk, Russia",
  timezone: "Asia/Novosibirsk",
  progression_date: "2024-07-12"
};

// Test cases for progressions
const progressionsTests = [
  {
    name: "get_progressions_info",
    description: "Test progressions info (no params needed)",
    args: {}
  },
  {
    name: "calculate_secondary_progressions",
    description: "Test secondary progressions calculation",
    args: testPersonData
  },
  {
    name: "calculate_solar_arc_progressions",
    description: "Test solar arc progressions",
    args: testPersonData
  },
  {
    name: "calculate_tertiary_progressions",
    description: "Test tertiary progressions",
    args: testPersonData
  },
  {
    name: "compare_progressions",
    description: "Test progressions comparison",
    args: {
      ...testPersonData,
      compare_methods: ["secondary", "solar_arc"]
    }
  },
  {
    name: "create_progressions_timeline",
    description: "Test progressions timeline",
    args: testPersonData
  },
  {
    name: "analyze_progressions_aspects",
    description: "Test progressions aspects analysis",
    args: testPersonData
  }
];

console.log('🧪 Testing AstroVisor MCP Server - Progressions Tools');
console.log('='.repeat(60));

function runTest(testCase) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing: ${testCase.description}`);
    
    const mcpProcess = spawn('node', [join(__dirname, 'build/index.js')], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    let stdout = '';
    let stderr = '';
    
    mcpProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    mcpProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Send MCP messages
    const listToolsMessage = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list"
    }) + '\n';

    const callToolMessage = JSON.stringify({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: testCase.name,
        arguments: testCase.args
      }
    }) + '\n';

    mcpProcess.stdin.write(listToolsMessage);
    
    setTimeout(() => {
      mcpProcess.stdin.write(callToolMessage);
    }, 1000);

    setTimeout(() => {
      mcpProcess.kill();
      
      const success = stdout.includes('"jsonrpc":"2.0"') && 
                     stdout.includes('"result"') && 
                     !stdout.includes('"error"');
      
      if (success) {
        console.log(`✅ ${testCase.name}: PASSED`);
        
        // Try to extract and show first part of result
        try {
          const lines = stdout.split('\n');
          const resultLine = lines.find(line => line.includes('"result"'));
          if (resultLine) {
            const result = JSON.parse(resultLine);
            if (result.result && result.result.content) {
              const content = result.result.content[0].text;
              const preview = content.length > 200 ? 
                content.substring(0, 200) + '...' : content;
              console.log(`📋 Preview: ${preview}`);
            }
          }
        } catch (e) {
          // Silent catch for parsing issues
        }
      } else {
        console.log(`❌ ${testCase.name}: FAILED`);
        if (stderr) console.log(`   Error: ${stderr}`);
        if (stdout.includes('"error"')) {
          console.log(`   Response error detected in: ${stdout}`);
        }
      }
      
      resolve(success);
    }, 5000);
  });
}

// Run all tests sequentially
async function runAllTests() {
  console.log(`\n📋 Running ${progressionsTests.length} progressions tests...\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of progressionsTests) {
    const success = await runTest(testCase);
    if (success) passed++;
    else failed++;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`🏆 PROGRESSIONS TEST RESULTS:`);
  console.log(`   ✅ Passed: ${passed}/${progressionsTests.length}`);
  console.log(`   ❌ Failed: ${failed}/${progressionsTests.length}`);
  console.log(`   📊 Success rate: ${Math.round(passed / progressionsTests.length * 100)}%`);
  
  if (passed === progressionsTests.length) {
    console.log(`\n🎉 All progressions tools are working correctly!`);
    return true;
  } else {
    console.log(`\n⚠️  Some progressions tools need attention.`);
    return false;
  }
}

runAllTests().then(success => {
  process.exit(success ? 0 : 1);
});
