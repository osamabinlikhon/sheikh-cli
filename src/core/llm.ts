/**
 * OpenRouter LLM Integration
 * 
 * Handles communication with OpenRouter API for chat completions
 * Supports streaming, tool calling, and token tracking
 */

import OpenAI from 'openai';
import { 
  Message, 
  Tool, 
  ToolCall, 
  ToolResult, 
  LLMOptions, 
  StreamingChunk 
} from '../core/types.js';

export class OpenRouterLLM {
  private client: OpenAI;
  private defaultModel: string;
  private defaultTemperature: number;
  private siteUrl: string;
  private appTitle: string;

  constructor(apiKey: string, options?: { model?: string; temperature?: number; siteUrl?: string; appTitle?: string }) {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    });
    
    this.defaultModel = options?.model || 'anthropic/claude-3-5-sonnet';
    this.defaultTemperature = options?.temperature || 0.7;
    this.siteUrl = options?.siteUrl || 'https://github.com/sheikh/cli';
    this.appTitle = options?.appTitle || 'Sheikh CLI';
  }

  /**
   * Convert internal message format to OpenAI format
   */
  private toOpenAIMessage(message: Message): OpenAI.Chat.ChatCompletionMessageParam {
    const msg: OpenAI.Chat.ChatCompletionMessageParam = {
      role: message.role as 'user' | 'assistant' | 'system',
      content: message.content
    };

    if (message.toolCalls && message.toolCalls.length > 0) {
      msg.tool_calls = message.toolCalls.map(call => ({
        id: call.id,
        type: 'function',
        function: {
          name: call.toolName,
          arguments: JSON.stringify(call.arguments)
        }
      }));
    }

    return msg;
  }

  /**
   * Convert tools to OpenAI function declarations
   */
  private toToolDefinitions(tools: Tool[]): OpenAI.Chat.ChatCompletionTool[] {
    return tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters as OpenAI.Chat.ChatCompletionToolFunctionParameters
      }
    }));
  }

  /**
   * Send a chat completion request
   */
  async complete(
    messages: Message[],
    options?: Partial<LLMOptions>
  ): Promise<{
    message: Message;
    usage: { prompt: number; completion: number; total: number };
  }> {
    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? this.defaultTemperature;
    const maxTokens = options?.maxTokens;
    const tools = options?.tools;

    const openaiMessages = messages.map(m => this.toOpenAIMessage(m));
    
    const request: OpenAI.Chat.ChatCompletionCreateParams = {
      model: model,
      messages: openaiMessages,
      temperature: temperature,
      max_tokens: maxTokens,
      stream: false
    };

    if (tools && tools.length > 0) {
      request.tools = this.toToolDefinitions(tools);
    }

    try {
      const response = await this.client.chat.completions.create(request);

      if (!response.choices[0]?.message) {
        throw new Error('No response from OpenRouter');
      }

      const choice = response.choices[0].message;
      
      const message: Message = {
        id: response.id,
        role: 'assistant',
        content: choice.content || '',
        timestamp: new Date(),
        toolCalls: choice.tool_calls?.map(tc => ({
          id: tc.id!,
          toolName: tc.function!.name,
          arguments: JSON.parse(tc.function!.arguments)
        }))
      };

      const usage = {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0
      };

      return { message, usage };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Stream a chat completion
   */
  async *stream(
    messages: Message[],
    options?: Partial<LLMOptions>
  ): AsyncGenerator<StreamingChunk, void, unknown> {
    const model = options?.model || this.defaultModel;
    const temperature = options?.temperature ?? this.defaultTemperature;
    const maxTokens = options?.maxTokens;
    const tools = options?.tools;

    const openaiMessages = messages.map(m => this.toOpenAIMessage(m));

    const request: OpenAI.Chat.ChatCompletionCreateParams = {
      model: model,
      messages: openaiMessages,
      temperature: temperature,
      max_tokens: maxTokens,
      stream: true
    };

    if (tools && tools.length > 0) {
      request.tools = this.toToolDefinitions(tools);
    }

    try {
      const stream = await this.client.chat.completions.create(request);

      let content = '';
      let done = false;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        
        if (delta?.content) {
          content += delta.content;
        }

        const toolCalls = delta?.tool_calls?.map(tc => ({
          id: tc.id || '',
          toolName: tc.function?.name || '',
          arguments: tc.function?.arguments ? JSON.parse(tc.function.arguments) : {}
        })) || [];

        done = chunk.choices[0]?.finish_reason !== null;

        yield {
          content: content,
          done: done || false,
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined
        };

        if (done) break;
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors with meaningful messages
   */
  private handleError(error: unknown): Error {
    if (error instanceof OpenAI.APIError) {
      switch (error.status) {
        case 401:
          return new Error('Invalid API key. Please check your OpenRouter API key in ~/.sheikhrc');
        case 429:
          return new Error('Rate limit exceeded. Please wait before making more requests.');
        case 500:
          return new Error('OpenRouter server error. Please try again later.');
        default:
          return new Error(`OpenRouter API error: ${error.message}`);
      }
    }
    
    if (error instanceof Error) {
      return error;
    }
    
    return new Error('An unknown error occurred while communicating with OpenRouter');
  }

  /**
   * Get available models from OpenRouter
   */
  async listModels(): Promise<{ id: string; name: string; pricing: { input: string; output: string } }[]> {
    try {
      const response = await this.client.models.list();
      
      // Filter to popular models and format response
      return response.data
        .filter(model => model.id.includes('gpt-4') || model.id.includes('claude') || model.id.includes('llama'))
        .map(model => ({
          id: model.id,
          name: model.id.split('/').pop() || model.id,
          pricing: {
            input: 'varies',
            output: 'varies'
          }
        }));
    } catch (error) {
      console.error('Failed to list models:', error);
      return [];
    }
  }

  /**
   * Check API connectivity and key validity
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.chat.completions.create({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 1
      });
      return true;
    } catch {
      return false;
    }
  }
}

// Factory function for creating LLM instances
export function createOpenRouterLLM(
  apiKey: string,
  options?: { model?: string; temperature?: number; siteUrl?: string; appTitle?: string }
): OpenRouterLLM {
  return new OpenRouterLLM(apiKey, options);
}
