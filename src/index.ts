/**
 * Sheikh CLI - Main Entry Point
 * 
 * Extensible, terminal-first agentic tool for developers
 * 
 * @package @sheikh/cli
 * @version 1.0.0
 * @license MIT
 */

// Core exports
export { Agent, createAgent } from './core/agent.js';
export { OpenRouterLLM, createOpenRouterLLM } from './core/llm.js';
export * from './core/types.js';

// Configuration
export { ConfigLoader, getConfig, resetConfig } from './config/config.js';

// Tools
export { ShellTool, createShellTool } from './tools/shell.js';
export { FileSystemTool, createFileSystemTool } from './tools/filesystem.js';

// Plugins
export { PluginLoader, createPluginLoader } from './plugins/loader.js';
export type { PluginLoadResult } from './plugins/loader.js';
export * from './plugins/types.js';

// UI Components
export { default as App } from './components/App.js';
export { default as Chat } from './components/Chat.js';
export { default as Input } from './components/Input.js';
export { default as SetupScreen } from './components/SetupScreen.js';

// Utility functions
export { dynamicImport, importJson, loadScript } from './utils/import.js';
