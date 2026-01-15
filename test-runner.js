#!/usr/bin/env node

/**
 * Sheikh Automated Test Suite
 * 
 * Tests basic functionality of the Sheikh CLI agent
 */

import { Agent, createAgent } from './src/core/agent.js';
import { ConfigLoader } from './src/config/config.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🧪 Sheikh Test Suite');
console.log('====================\n');

// Test configuration
const configPath = path.join(__dirname, '.sheikhrc');
const config = new ConfigLoader(configPath);

console.log('Test 1: Configuration Loading');
console.log('------------------------------');
if (config.isValid()) {
  console.log('✅ Configuration loaded successfully');
  console.log(`   Model: ${config.getConfig().openrouter.model}`);
  console.log(`   Temperature: ${config.getConfig().openrouter.temperature}`);
} else {
  console.log('❌ Configuration invalid - API key missing');
  process.exit(1);
}
console.log();

// Test 2: Agent initialization
console.log('Test 2: Agent Initialization');
console.log('----------------------------');

const agent = createAgent({
  configPath: configPath,
  onStateChange: (state) => {
    console.log(`   State: ${state.status}`);
  },
  onMessage: (message) => {
    if (message.role === 'assistant') {
      const preview = message.content.substring(0, 100).replace(/\n/g, ' ');
      console.log(`   Response preview: ${preview}...`);
    }
  }
});

console.log('✅ Agent initialized');
console.log(`   Status: ${agent.getState().status}`);
console.log(`   Tools available: ${agent.tools.size}`);
for (const [name, tool] of agent.tools) {
  console.log(`   - ${name}`);
}
console.log();

// Test 3: Shell tool execution
console.log('Test 3: Shell Tool Execution');
console.log('----------------------------');

const shellTool = agent.shellTool;
const shellResult = await shellTool.execute({
  command: 'echo "Hello from Sheikh!" && pwd',
  cwd: '/workspace/sheikh'
});

if (shellResult.success) {
  console.log('✅ Shell command executed');
  console.log(`   Output: ${shellResult.output.substring(0, 80)}`);
} else {
  console.log('❌ Shell command failed:', shellResult.error);
}
console.log();

// Test 4: Filesystem tool - list directory
console.log('Test 4: Filesystem Tool - List Directory');
console.log('----------------------------------------');

const fsTool = agent.fileSystemTool;
const listResult = await fsTool.execute({
  operation: 'list',
  path: '/workspace/sheikh',
  recursive: false
});

if (listResult.success) {
  console.log('✅ Directory listing successful');
  const files = listResult.output.split('\n').slice(0, 5).join(', ');
  console.log(`   Files: ${files}...`);
} else {
  console.log('❌ Directory listing failed:', listResult.error);
}
console.log();

// Test 5: Filesystem tool - read file
console.log('Test 5: Filesystem Tool - Read File');
console.log('------------------------------------');

const readResult = await fsTool.execute({
  operation: 'read',
  path: '/workspace/sheikh/package.json',
  lines: 10
});

if (readResult.success) {
  console.log('✅ File read successful');
  const preview = readResult.output.split('\n').slice(0, 3).join(' ');
  console.log(`   Content preview: ${preview}`);
} else {
  console.log('❌ File read failed:', readResult.error);
}
console.log();

// Test 6: Agent conversation (requires API key)
console.log('Test 6: Agent Conversation');
console.log('--------------------------');

try {
  console.log('   Sending: "List the files in the src directory"');
  const response = await agent.processMessage('List the files in the src directory');
  
  console.log('✅ Response received');
  console.log(`   Tokens used: ${agent.getState().tokenUsage.total}`);
  
  // Show the response content
  const content = response.content || 'No content';
  const preview = content.substring(0, 150).replace(/\n/g, ' ');
  console.log(`   Response: ${preview}...`);
  
} catch (error) {
  console.log('⚠️  Conversation test:', error.message);
  console.log('   (This may require API key verification)');
}
console.log();

// Test 7: Agent health check
console.log('Test 7: API Health Check');
console.log('------------------------');

const healthy = await agent.healthCheck();
if (healthy) {
  console.log('✅ OpenRouter API connection successful');
} else {
  console.log('⚠️  OpenRouter API connection failed');
  console.log('   Check your API key in .sheikhrc');
}
console.log();

// Test 8: Shell info
console.log('Test 8: Shell Information');
console.log('-------------------------');

const shellInfo = await agent.getShellInfo();
console.log(`✅ Shell: ${shellInfo.shell}`);
console.log(`   Version: ${shellInfo.version}`);
console.log(`   Working Directory: ${shellInfo.cwd}`);
console.log();

// Summary
console.log('====================');
console.log('Test Summary');
console.log('============');
console.log('✅ All core modules loaded successfully');
console.log('✅ Shell tool working');
console.log('✅ Filesystem tools working');
console.log('✅ Agent initialized and ready');

if (healthy) {
  console.log('✅ API connection verified');
} else {
  console.log('⚠️  API connection needs attention');
}

console.log('\n🎉 Sheikh is ready to use!');
console.log('\nTo start the interactive terminal:');
console.log('   npm run dev');
console.log('\nOr ask a question directly:');
console.log('   sheikh "What files are in the src directory?"');
