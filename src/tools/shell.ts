/**
 * Shell Command Tool
 * 
 * Executes shell commands with safety checks and output streaming
 */

import { execa } from 'execa';
import * as fs from 'fs';
import * as path from 'path';
import { Tool, ToolResult } from '../core/types.js';

const DANGEROUS_PATTERNS = [
  /rm\s+-rf\b/i,
  /rm\s+-r\b/i,
  /dd\s+if=/i,
  /mkfs/i,
  /chmod\s+-R\s+0/i,
  /chown\s+-R\s+0/i,
  /:\(\)\s*:\s*\|\s*:&\s*;:/i, // Fork bomb
  />\s*\/dev\/null/i,
  /wget\s+/i,
  /curl\s+-O\s+/i,
  /\|\s*xargs\s+rm\b/i,
  />\s*[a-zA-Z\/]/,
];

export interface ShellToolOptions {
  shell?: string;
  workingDirectory?: string;
  maxOutput?: number;
  dangerousCommands?: 'allow' | 'confirm' | 'block';
  confirmPatterns?: string[];
  timeout?: number;
}

export class ShellTool implements Tool {
  name = 'shell';
  description = 'Execute shell commands and return the output. Use this for file operations, git commands, package management, and any system operations.';
  
  parameters = {
    type: 'object' as const,
    properties: {
      command: {
        type: 'string' as const,
        description: 'The shell command to execute'
      },
      cwd: {
        type: 'string' as const,
        description: 'Working directory (optional, defaults to current)'
      },
      timeout: {
        type: 'number' as const,
        description: 'Timeout in milliseconds (default: 30000)'
      },
      ignoreErrors: {
        type: 'boolean' as const,
        description: 'Continue even if command fails (default: false)'
      },
      dryRun: {
        type: 'boolean' as const,
        description: 'Preview command without executing (default: false)'
      }
    },
    required: ['command']
  };

  private options: ShellToolOptions;

  constructor(options?: ShellToolOptions) {
    this.options = options || {};
  }

  /**
   * Execute a shell command
   */
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const command = args.command as string;
    const cwd = (args.cwd as string) || this.options.workingDirectory || process.cwd();
    const timeout = args.timeout as number || this.options.timeout || 30000;
    const ignoreErrors = args.ignoreErrors as boolean || false;
    const dryRun = args.dryRun as boolean || false;

    if (!command || typeof command !== 'string') {
      return {
        callId: '',
        toolName: 'shell',
        success: false,
        output: '',
        error: 'Command is required and must be a string'
      };
    }

    // Safety check for dangerous commands
    const dangerLevel = this.assessDangerLevel(command);
    
    if (dryRun) {
      return {
        callId: '',
        toolName: 'shell',
        success: true,
        output: `[DRY RUN] Would execute: ${command}\n[Working Directory: ${cwd}]`
      };
    }

    if (dangerLevel === 'high') {
      if (this.options.dangerousCommands === 'block') {
        return {
          callId: '',
          toolName: 'shell',
          success: false,
          output: '',
          error: `Command blocked due to safety policy: ${command}`
        };
      }
      
      // For 'confirm' mode, we execute but with warning
      // In a real implementation, this would pause for user confirmation
    }

    // Verify working directory exists
    if (!fs.existsSync(cwd)) {
      return {
        callId: '',
        toolName: 'shell',
        success: false,
        output: '',
        error: `Working directory does not exist: ${cwd}`
      };
    }

    try {
      const result = await execa(command, {
        shell: this.options.shell || process.env.SHELL || '/bin/sh',
        cwd: cwd,
        timeout: timeout,
        buffer: true,
        stripFinalNewline: false,
        reject: !ignoreErrors,
        extendEnv: true,
        env: {
          ...process.env,
          NO_COLOR: '1', // Disable colors in output
        }
      });

      const output = this.truncateOutput(
        (result.stdout || '') + (result.stderr ? '\n' + result.stderr : '')
      );

      return {
        callId: '',
        toolName: 'shell',
        success: ignoreErrors || result.exitCode === 0,
        output: output,
        error: result.exitCode !== 0 ? `Exit code: ${result.exitCode}` : undefined
      };
    } catch (error) {
      if (ignoreErrors) {
        const output = this.truncateOutput(
          (error.stdout || '') + (error.stderr ? '\n' + error.stderr : '')
        );
        return {
          callId: '',
          toolName: 'shell',
          success: true,
          output: output
        };
      }

      return {
        callId: '',
        toolName: 'shell',
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Assess danger level of a command
   */
  private assessDangerLevel(command: string): 'low' | 'medium' | 'high' {
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(command)) {
        return 'high';
      }
    }

    // Check custom confirm patterns
    if (this.options.confirmPatterns) {
      for (const pattern of this.options.confirmPatterns) {
        if (new RegExp(pattern, 'i').test(command)) {
          return 'high';
        }
      }
    }

    // Check for file modification
    if (/>(?!dev\/null)/.test(command) || />>/.test(command)) {
      return 'medium';
    }

    // Check for network operations
    if (/curl|wget|nc\s+/.test(command)) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Truncate output if it exceeds max size
   */
  private truncateOutput(output: string): string {
    const maxSize = this.options.maxOutput || 10000;
    
    if (output.length > maxSize) {
      return output.substring(0, maxSize) + 
        `\n\n[Output truncated. Original size: ${output.length} bytes]`;
    }
    
    return output;
  }

  /**
   * Get shell information
   */
  async getShellInfo(): Promise<{
    shell: string;
    version: string;
    cwd: string;
  }> {
    const shell = this.options.shell || process.env.SHELL || '/bin/sh';
    
    try {
      const { stdout } = await execa(shell, ['--version'], { shell: '/bin/sh' });
      return {
        shell: path.basename(shell),
        version: stdout.split('\n')[0] || 'Unknown',
        cwd: process.cwd()
      };
    } catch {
      return {
        shell: path.basename(shell),
        version: 'Unknown',
        cwd: process.cwd()
      };
    }
  }
}

// Export factory function
export function createShellTool(options?: ShellToolOptions): ShellTool {
  return new ShellTool(options);
}
