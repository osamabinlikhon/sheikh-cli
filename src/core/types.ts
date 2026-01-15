/**
 * Sheikh Core Types
 * 
 * Type definitions for the agentic tool system
 */

// Message roles in the conversation
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

// Base message structure
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

// Tool call definition
export interface ToolCall {
  id: string;
  toolName: string;
  arguments: Record<string, unknown>;
}

// Tool execution result
export interface ToolResult {
  callId: string;
  toolName: string;
  success: boolean;
  output: string;
  error?: string;
}

// Tool definition
export interface Tool {
  name: string;
  description: string;
  parameters: ToolParameters;
  execute: (args: Record<string, unknown>) => Promise<ToolResult>;
  dangerous?: boolean;
}

// Tool parameters schema (OpenAI function calling format)
export interface ToolParameters {
  type: 'object';
  properties: Record<string, ToolParameter>;
  required?: string[];
}

export interface ToolParameter {
  type: string;
  description: string;
  enum?: string[];
}

// Configuration structure
export interface SheikhConfig {
  openrouter: {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens?: number;
    siteUrl?: string;
    appTitle?: string;
  };
  plugins: {
    enabled: string[];
    paths: string[];
  };
  ui: {
    theme: 'dark' | 'light' | 'auto';
    streaming: boolean;
    compact: boolean;
  };
  safety: {
    dangerousCommands: 'allow' | 'confirm' | 'block';
    confirmPatterns: string[];
    maxShellOutput?: number;
  };
  system: {
    shell: string;
    workingDirectory?: string;
    env?: Record<string, string>;
  };
}

// Plugin interface
export interface SheikhPlugin {
  name: string;
  version: string;
  description: string;
  author?: string;
  tools: Tool[];
  hooks?: PluginHooks;
  initialize?: (agent: AgentContext) => Promise<void>;
}

export interface PluginHooks {
  onMessage?: (message: Message, context: AgentContext) => Promise<Message | void>;
  onToolCall?: (toolCall: ToolCall, context: AgentContext) => Promise<ToolResult | void>;
  onShutdown?: (context: AgentContext) => Promise<void>;
}

// Agent context passed to plugins and tools
export interface AgentContext {
  config: SheikhConfig;
  workingDirectory: string;
  gitBranch?: string;
  gitStatus?: string;
  environment: Record<string, string>;
  registerTool: (tool: Tool) => void;
  unregisterTool: (toolName: string) => void;
  sendMessage: (message: Message) => void;
}

// Agent state
export interface AgentState {
  status: 'idle' | 'thinking' | 'executing' | 'error';
  currentModel: string;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  sessionStart: Date;
  messageCount: number;
}

// LLM provider options
export interface LLMOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  tools?: Tool[];
  systemMessage?: string;
}

// Streaming chunk from LLM
export interface StreamingChunk {
  content: string;
  done: boolean;
  toolCalls?: ToolCall[];
}

// CLI flags interface
export interface CLIFlags {
  model: string;
  temperature: number;
  stream: boolean;
  unsafe: boolean;
  config: string;
  help: boolean;
  version: boolean;
}
