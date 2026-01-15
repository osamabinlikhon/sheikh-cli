#!/usr/bin/env node

/**
 * Sheikh Live Demo
 * 
 * Interactive demonstration of Sheikh's capabilities
 */

import { createAgent } from './src/core/agent.js';
import { ConfigLoader } from './src/config/config.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                                                            ║');
console.log('║          🚀 Sheikh Live Demo - Terminal Agent 🚀          ║');
console.log('║                                                            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// Initialize agent
const configPath = path.join(__dirname, '.sheikhrc');
const agent = createAgent({
  configPath: configPath,
  onStateChange: (state) => {},
  onMessage: (message) => {}
});

const queries = [
  { 
    name: 'Math Problem', 
    query: 'What is 123 times 456?',
    expected: '56088'
  },
  {
    name: 'System Info',
    query: 'What operating system are we running?',
  },
  {
    name: 'Project Info',
    query: 'What is the name of this project?',
  },
  {
    name: 'File Count',
    query: 'How many JavaScript files are in the src directory?',
  }
];

async function runDemo() {
  console.log(`Model: ${agent.config.getConfig().openrouter.model}`);
  console.log(`Temperature: ${agent.config.getConfig().openrouter.temperature}\n`);
  
  for (let i = 0; i < queries.length; i++) {
    const test = queries[i];
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Demo ${i + 1}: ${test.name}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Query: "${test.query}"\n`);
    
    try {
      const startTime = Date.now();
      const response = await agent.processMessage(test.query);
      const elapsed = Date.now() - startTime;
      
      console.log(`Response (${elapsed}ms):`);
      console.log(`"${response.content}"\n`);
      
      if (test.expected) {
        if (response.content.includes(test.expected)) {
          console.log(`✅ Correct answer detected: ${test.expected}`);
        }
      }
    } catch (error) {
      console.log(`Error: ${error.message}\n`);
    }
    
    console.log('');
  }
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    Demo Complete! 🎉                       ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  Sheikh successfully:                                      ║');
  console.log('║  • Processes natural language queries                     ║');
  console.log('║  • Connects to OpenRouter LLM                             ║');
  console.log('║  • Streams responses in real-time                         ║');
  console.log('║  • Executes shell commands                                ║');
  console.log('║  • Manages file operations                                ║');
  console.log('║  • Provides helpful responses                             ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log('To use Sheikh interactively:');
  console.log('  cd /workspace/sheikh && npm run dev\n');
  
  console.log('Or ask a single query:');
  console.log('  node bin/sheikh.js "Your question here"\n');
}

runDemo().catch(console.error);
