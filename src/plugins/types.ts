/**
 * Plugin System Types
 * 
 * Type definitions for the plugin system
 */

import { Tool, AgentContext } from '../core/types.js';

/**
 * Plugin metadata structure
 */
export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
  license?: string;
  repository?: string;
  keywords?: string[];
}

/**
 * Plugin interface that all plugins must implement
 */
export interface SheikhPlugin {
  /** Plugin metadata */
  metadata: PluginMetadata;
  
  /** Tools provided by this plugin */
  tools: Tool[];
  
  /** Optional initialization function */
  initialize?: (context: AgentContext) => Promise<void>;
  
  /** Optional shutdown function */
  shutdown?: (context: AgentContext) => Promise<void>;
}

/**
 * Plugin hook types
 */
export interface PluginHooks {
  /** Called before each agent message is processed */
  onMessage?: (message: unknown, context: AgentContext) => Promise<unknown>;
  
  /** Called before each tool is executed */
  onToolCall?: (toolCall: unknown, context: AgentContext) => Promise<unknown>;
  
  /** Called when agent state changes */
  onStateChange?: (state: unknown, context: AgentContext) => Promise<void>;
  
  /** Called on agent shutdown */
  onShutdown?: (context: AgentContext) => Promise<void>;
}

/**
 * Plugin configuration passed during initialization
 */
export interface PluginConfig {
  /** Plugin name */
  name: string;
  
  /** Plugin version */
  version: string;
  
  /** Plugin configuration options */
  options?: Record<string, unknown>;
  
  /** Agent context */
  context: AgentContext;
}

/**
 * Plugin initialization result
 */
export interface PluginResult {
  /** Plugin name */
  name: string;
  
  /** Plugin version */
  version: string;
  
  /** Whether initialization succeeded */
  success: boolean;
  
  /** Error message if initialization failed */
  error?: string;
  
  /** Tools registered by this plugin */
  tools: string[];
}

/**
 * Plugin lifecycle states
 */
export type PluginState = 
  | 'discovered'
  | 'loading'
  | 'loaded'
  | 'initializing'
  | 'initialized'
  | 'shutting_down'
  | 'shutdown'
  | 'error';

/**
 * Plugin information for display
 */
export interface PluginInfo {
  name: string;
  version: string;
  state: PluginState;
  toolCount: number;
  author?: string;
  description?: string;
}

/**
 * Function signature for plugin factories
 */
export type PluginFactory = (config: PluginConfig) => Promise<SheikhPlugin> | SheikhPlugin;

/**
 * Static plugin definition for declarative plugins
 */
export interface StaticPluginDefinition {
  /** Plugin name */
  name: string;
  
  /** Plugin version */
  version: string;
  
  /** Plugin description */
  description: string;
  
  /** Tools to register */
  tools: Tool[];
  
  /** Optional initialization function */
  initialize?: (context: AgentContext) => Promise<void>;
}
