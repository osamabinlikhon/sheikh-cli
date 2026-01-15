#!/usr/bin/env node

/**
 * Sheikh Interactive Test
 * 
 * Tests agent conversation with actual LLM queries
 */

import { createAgent } from './src/core/agent.js';
import { ConfigLoader } from './src/config/config.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Sheikh Conversation Test');
console.log('============================\n');

// Initialize agent
const configPath = path.join(__dirname, '.sheikhrc');
const agent = createAgent({
  configPath: configPath,
  onStateChange: (state) => {
    console.log(`   [State: ${state.status}]`);
  },
  onMessage: (message) => {
    if (message.role === 'assistant' && message.content) {
      const preview = message.content.replace(/\n/g, ' ').substring(0, 100);
      console.log(`   [Assistant: ${preview}...]`);
    }
  }
});

// Test queries
const queries = [
  'What is 2 + 2?',
  'List the files in the current directory',
  'What is your name?'
];

async function runTests() {
  console.log('Running conversation tests...\n');
  
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`Test ${i + 1}: "${query}"`);
    console.log('-' .repeat(50));
    
    try {
      const response = await agent.processMessage(query);
      
      console.log('\n✅ Response received');
      console.log(`   Tokens used: ${agent.getState().tokenUsage.total}`);
      console.log(`   Response length: ${response.content?.length || 0} chars`);
      
      if (response.content) {
        const lines = response.content.split('\n').filter(l => l.trim());
        console.log(`   Response preview:`);
        lines.slice(0, 3).forEach(line => {
          console.log(`     ${line.substring(0, 80)}`);
        });
      }
      
      if (response.toolCalls && response.toolCalls.length > 0) {
        console.log(`   Tools used: ${response.toolCalls.map(tc => tc.toolName).join(', ')}`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log();
  }
  
  console.log('============================');
  console.log('✅ All conversation tests completed!');
  console.log(`   Total tokens used: ${agent.getState().tokenUsage.total}`);
}

runTests().catch(console.error);
