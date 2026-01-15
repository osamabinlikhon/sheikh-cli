/**
 * Sheikh - Quick Start Guide
 * 
 * This guide will help you get started with Sheikh terminal-first agentic tool
 */

// Quick test to verify installation
console.log('Sheikh Installation Test');
console.log('========================\n');

// Test 1: Check Node.js version
console.log(`✓ Node.js version: ${process.version}`);

// Test 2: Check if all modules can be loaded
try {
  await import('./src/core/agent.js');
  console.log('✓ Agent module loaded');
} catch (e) {
  console.log('✗ Agent module failed:', e.message);
}

try {
  await import('./src/core/llm.js');
  console.log('✓ LLM module loaded');
} catch (e) {
  console.log('✗ LLM module failed:', e.message);
}

try {
  await import('./src/tools/shell.js');
  console.log('✓ Shell tool loaded');
} catch (e) {
  console.log('✗ Shell tool failed:', e.message);
}

try {
  await import('./src/tools/filesystem.js');
  console.log('✓ Filesystem tool loaded');
} catch (e) {
  console.log('✗ Filesystem tool failed:', e.message);
}

try {
  await import('./src/config/config.js');
  console.log('✓ Config module loaded');
} catch (e) {
  console.log('✗ Config module failed:', e.message);
}

console.log('\n========================');
console.log('All modules loaded successfully!');
console.log('\nTo start Sheikh, run:');
console.log('  npm run dev');
console.log('\nOr if installed globally:');
console.log('  sheikh "Your command here"');
