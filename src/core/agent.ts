/**
 * Agent Logic
 * 
 * Main agent orchestrating conversation, tool calls, and reasoning
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  Message, 
  Tool, 
  ToolCall, 
  ToolResult, 
  AgentContext, 
  AgentState,
  StreamingChunk 
} from '../core/types.js';
import { OpenRouterLLM, createOpenRouterLLM } from './llm.js';
import { ConfigLoader, getConfig } from '../config/config.js';
import { ShellTool, createShellTool } from '../tools/shell.js';
import { FileSystemTool, createFileSystemTool } from '../tools/filesystem.js';

export class Agent {
  private llm: OpenRouterLLM;
  private config: ConfigLoader;
  private tools: Map<string, Tool>;
  private messages: Message[];
  private state: AgentState;
  private context: AgentContext;
  private shellTool: ShellTool;
  private fileSystemTool: FileSystemTool;
  private onStateChange?: (state: AgentState) => void;
  private onMessage?: (message: Message) => void;

  constructor(options?: {
    configPath?: string;
    onStateChange?: (state: AgentState) => void;
    onMessage?: (message: Message) => void;
  }) {
    this.config = getConfig(options?.configPath);
    this.tools = new Map();
    this.messages = [];
    this.state = this.createInitialState();
    this.onStateChange = options?.onStateChange;
    this.onMessage = options?.onMessage;

    // Initialize LLM
    const cfg = this.config.getConfig();
    this.llm = createOpenRouterLLM(cfg.openrouter.apiKey, {
      model: cfg.openrouter.model,
      temperature: cfg.openrouter.temperature,
      siteUrl: cfg.openrouter.siteUrl,
      appTitle: cfg.openrouter.appTitle
    });

    // Initialize built-in tools
    this.shellTool = createShellTool({
      shell: cfg.system.shell,
      workingDirectory: cfg.system.workingDirectory,
      maxOutput: cfg.safety.maxShellOutput,
      dangerousCommands: cfg.safety.dangerousCommands,
      confirmPatterns: cfg.safety.confirmPatterns
    });
    this.registerTool(this.shellTool);

    this.fileSystemTool = createFileSystemTool({
      maxFileSize: 1024 * 1024 // 1MB limit by default
    });
    this.registerTool(this.fileSystemTool);

    // Initialize context
    this.context = this.createContext();

    // Add system message
    this.addSystemMessage(this.getSystemPrompt());
  }

  /**
   * Create initial agent state
   */
  private createInitialState(): AgentState {
    return {
      status: 'idle',
      currentModel: 'anthropic/claude-3-5-sonnet',
      tokenUsage: {
        prompt: 0,
        completion: 0,
        total: 0
      },
      sessionStart: new Date(),
      messageCount: 0
    };
  }

  /**
   * Create system prompt for the agent
   */
  private getSystemPrompt(): string {
    return `You are Sheikh, an extensible, terminal-first agentic tool designed for developers.

## Your Capabilities
- Execute shell commands to automate workflows
- Read, write, and manipulate files
- Analyze code and project structure
- Help with git operations, package management, and system administration

## Guidelines
1. Always be clear about what you're doing
2. Show your reasoning when making decisions
3. Ask for confirmation before dangerous operations
4. Use tools efficiently - prefer single commands over multiple
5. Handle errors gracefully and suggest solutions

## Response Format
- Be concise but helpful
- Use code blocks for code and command output
- Explain what commands will do before running them when asked
- For complex tasks, break them down step by step

## Safety
- Never execute commands without user consent unless explicitly asked to run them
- Warn about potentially dangerous commands
- Respect the user's working directory and environment

You have access to tools that can execute commands, read/write files, and interact with the system. Use them wisely to help the user accomplish their goals.`;
  }

  /**
   * Create agent context for tools and plugins
   */
  private createContext(): AgentContext {
    const cfg = this.config.getConfig();
    
    return {
      config: cfg,
      workingDirectory: cfg.system.workingDirectory || process.cwd(),
      environment: process.env as Record<string, string>,
      registerTool: (tool: Tool) => this.registerTool(tool),
      unregisterTool: (toolName: string) => this.tools.delete(toolName),
      sendMessage: (message: Message) => {
        this.messages.push(message);
        this.onMessage?.(message);
      }
    };
  }

  /**
   * Register a tool with the agent
   */
  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  /**
   * Add a message to the conversation
   */
  addMessage(message: Omit<Message, 'id' | 'timestamp'>): Message {
    const fullMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: new Date()
    };
    this.messages.push(fullMessage);
    this.onMessage?.(fullMessage);
    return fullMessage;
  }

  /**
   * Add system message
   */
  addSystemMessage(content: string): void {
    this.addMessage({
      role: 'system',
      content
    });
  }

  /**
   * Add user message
   */
  addUserMessage(content: string): Message {
    return this.addMessage({
      role: 'user',
      content
    });
  }

  /**
   * Process a user message and generate response
   */
  async processMessage(content: string): Promise<Message> {
    // Add user message
    const userMessage = this.addUserMessage(content);
    this.state.messageCount++;

    // Update state to thinking
    this.updateState({ status: 'thinking' });

    try {
      // Get available tools for this request
      const availableTools = Array.from(this.tools.values());
      
      // Make LLM request
      const cfg = this.config.getConfig();
      
      if (cfg.ui.streaming) {
        // Use streaming response
        for await (const chunk of this.streamResponseGen(availableTools)) {
          // Chunks are handled internally by streamResponseGen
        }
        // Get the last assistant message after streaming completes
        const messages = this.messages.filter(m => m.role === 'assistant');
        return messages[messages.length - 1] || this.addMessage({ role: 'assistant', content: '' });
      } else {
        return await this.completeResponse(availableTools);
      }
    } catch (error) {
      this.updateState({ status: 'error' });
      
      const errorMessage = this.addMessage({
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      });
      
      return errorMessage;
    }
  }

  /**
   * Process with streaming response
   */
  private async function* streamResponseGen(tools: Tool[]): AsyncGenerator<StreamingChunk, void, unknown> {
    const responseMessages: Message[] = [];
    let assistantMessage = this.addMessage({
      role: 'assistant',
      content: ''
    });

    const cfg = this.config.getConfig();

    try {
      for await (const chunk of this.llm.stream(this.messages, {
        model: cfg.openrouter.model,
        temperature: cfg.openrouter.temperature,
        maxTokens: cfg.openrouter.maxTokens,
        tools: tools
      })) {
        // Update message content
        if (assistantMessage.content !== chunk.content) {
          assistantMessage.content = chunk.content;
          this.onMessage?.({ ...assistantMessage, content: chunk.content });
        }

        // Handle tool calls
        if (chunk.toolCalls && chunk.toolCalls.length > 0) {
          assistantMessage.toolCalls = chunk.toolCalls;
          this.onMessage?.({ ...assistantMessage, toolCalls: chunk.toolCalls });
        }

        yield chunk;
      }

      // Execute tool calls if present
      if (assistantMessage.toolCalls && assistantMessage.toolCalls.length > 0) {
        this.updateState({ status: 'executing' });
        
        const toolResults = await this.executeToolCalls(assistantMessage.toolCalls);
        assistantMessage.toolResults = toolResults;
        this.onMessage?.(assistantMessage);

        // Add tool results to conversation and continue
        for (const result of toolResults) {
          this.addMessage({
            role: 'tool',
            content: `Tool: ${result.toolName}\nOutput:\n${result.output}${result.error ? `\nError: ${result.error}` : ''}`
          });
        }

        // Get final response after tool execution
        this.updateState({ status: 'thinking' });
        
        const finalMessages: Message[] = [];
        for await (const chunk of this.llm.stream(this.messages, {
          model: cfg.openrouter.model,
          temperature: cfg.openrouter.temperature,
          tools: tools
        })) {
          if (assistantMessage.content !== chunk.content) {
            assistantMessage.content = chunk.content;
            this.onMessage?.({ ...assistantMessage, content: chunk.content });
          }
          yield chunk;
        }
      }

      this.updateState({ status: 'idle' });
      return assistantMessage;
    } catch (error) {
      this.updateState({ status: 'error' });
      throw error;
    }
  }

  /**
   * Process with complete (non-streaming) response
   */
  private async completeResponse(tools: Tool[]): Promise<Message> {
    const cfg = this.config.getConfig();
    
    const { message, usage } = await this.llm.complete(this.messages, {
      model: cfg.openrouter.model,
      temperature: cfg.openrouter.temperature,
      maxTokens: cfg.openrouter.maxTokens,
      tools: tools
    });

    this.updateState({
      tokenUsage: {
        prompt: this.state.tokenUsage.prompt + usage.prompt,
        completion: this.state.tokenUsage.completion + usage.completion,
        total: this.state.tokenUsage.total + usage.total
      }
    });

    // Add assistant message
    const assistantMessage = this.addMessage(message);

    // Execute tool calls if present
    if (message.toolCalls && message.toolCalls.length > 0) {
      this.updateState({ status: 'executing' });
      
      const toolResults = await this.executeToolCalls(message.toolCalls);
      assistantMessage.toolResults = toolResults;
      this.onMessage?.(assistantMessage);

      // Add tool results to conversation
      for (const result of toolResults) {
        this.addMessage({
          role: 'tool',
          content: `Tool: ${result.toolName}\nOutput:\n${result.output}${result.error ? `\nError: ${result.error}` : ''}`
        });
      }

      // Get final response
      this.updateState({ status: 'thinking' });
      
      const { message: finalMessage, usage: finalUsage } = await this.llm.complete(this.messages, {
        model: cfg.openrouter.model,
        temperature: cfg.openrouter.temperature,
        tools: tools
      });

      this.updateState({
        tokenUsage: {
          prompt: this.state.tokenUsage.prompt + finalUsage.prompt,
          completion: this.state.tokenUsage.completion + finalUsage.completion,
          total: this.state.tokenUsage.total + finalUsage.total
        }
      });

      // Update and return final message
      Object.assign(assistantMessage, finalMessage);
      this.updateState({ status: 'idle' });
      return assistantMessage;
    }

    this.updateState({ status: 'idle' });
    return assistantMessage;
  }

  /**
   * Execute tool calls and return results
   */
  private async executeToolCalls(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    const results: ToolResult[] = [];

    for (const call of toolCalls) {
      const tool = this.tools.get(call.toolName);
      
      if (!tool) {
        results.push({
          callId: call.id,
          toolName: call.toolName,
          success: false,
          output: '',
          error: `Tool not found: ${call.toolName}`
        });
        continue;
      }

      try {
        const result = await tool.execute(call.arguments);
        result.callId = call.id;
        results.push(result);
      } catch (error) {
        results.push({
          callId: call.id,
          toolName: call.toolName,
          success: false,
          output: '',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Update agent state and notify listeners
   */
  private updateState(updates: Partial<AgentState>): void {
    this.state = { ...this.state, ...updates };
    this.onStateChange?.(this.state);
  }

  /**
   * Get current state
   */
  getState(): AgentState {
    return { ...this.state };
  }

  /**
   * Get conversation history
   */
  getMessages(): Message[] {
    return [...this.messages];
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    const systemMessage = this.messages[0];
    this.messages = systemMessage ? [systemMessage] : [];
    this.updateState({ messageCount: 0 });
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return this.config.isValid();
  }

  /**
   * Configure API key
   */
  configure(apiKey: string): void {
    this.config.setApiKey(apiKey);
    // Reinitialize LLM with new key
    const cfg = this.config.getConfig();
    this.llm = createOpenRouterLLM(cfg.openrouter.apiKey, {
      model: cfg.openrouter.model,
      temperature: cfg.openrouter.temperature,
      siteUrl: cfg.openrouter.siteUrl,
      appTitle: cfg.openrouter.appTitle
    });
  }

  /**
   * Get shell information
   */
  async getShellInfo(): Promise<{ shell: string; version: string; cwd: string }> {
    return this.shellTool.getShellInfo();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    return this.llm.healthCheck();
  }
}

// Factory function
export function createAgent(options?: {
  configPath?: string;
  onStateChange?: (state: AgentState) => void;
  onMessage?: (message: Message) => void;
}): Agent {
  return new Agent(options);
}
