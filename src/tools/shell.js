/**
 * Shell Command Tool
 * 
 * Executes shell commands with safety checks and output streaming
 */

import { execa } from 'execa';
import * as fs from 'fs';
import * as path from 'path';

const DANGEROUS_PATTERNS = [
  /rm\s+-rf\b/i,
  /rm\s+-r\b/i,
  /dd\s+if=/i,
  /mkfs/i,
  /chmod\s+-R\s+0/i,
  /chown\s+-R\s+0/i,
  /:\(\)\s*:\s*\|\s*:&\s*;:/i,
  />\s*\/dev\/null/i,
  /wget\s+/i,
  /curl\s+-O\s+/i,
  /\|\s*xargs\s+rm\b/i,
  />\s*[a-zA-Z\/]/,
];

/**
 * ShellTool class for executing shell commands
 */
export class ShellTool {
  constructor(options = {}) {
    this.name = 'shell';
    this.description = 'Execute shell commands and return the output. Use this for file operations, git commands, package management, and any system operations.';
    
    this.parameters = {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'The shell command to execute'
        },
        cwd: {
          type: 'string',
          description: 'Working directory (optional, defaults to current)'
        },
        timeout: {
          type: 'number',
          description: 'Timeout in milliseconds (default: 30000)'
        },
        ignoreErrors: {
          type: 'boolean',
          description: 'Continue even if command fails (default: false)'
        },
        dryRun: {
          type: 'boolean',
          description: 'Preview command without executing (default: false)'
        }
      },
      required: ['command']
    };

    this.options = options;
  }

  /**
   * Execute a shell command
   */
  async execute(args) {
    const command = args.command;
    const cwd = args.cwd || this.options.workingDirectory || process.cwd();
    const timeout = args.timeout || this.options.timeout || 30000;
    const ignoreErrors = args.ignoreErrors || false;
    const dryRun = args.dryRun || false;

    if (!command || typeof command !== 'string') {
      return {
        callId: '',
        toolName: 'shell',
        success: false,
        output: '',
        error: 'Command is required and must be a string'
      };
    }

    const dangerLevel = this.assessDangerLevel(command);
    
    if (dryRun) {
      return {
        callId: '',
        toolName: 'shell',
        success: true,
        output: `[DRY RUN] Would execute: ${command}\n[Working Directory: ${cwd}]`
      };
    }

    if (dangerLevel === 'high' && this.options.dangerousCommands === 'block') {
      return {
        callId: '',
        toolName: 'shell',
        success: false,
        output: '',
        error: `Command blocked due to safety policy: ${command}`
      };
    }

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
          NO_COLOR: '1',
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
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  /**
   * Assess danger level of a command
   */
  assessDangerLevel(command) {
    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(command)) {
        return 'high';
      }
    }

    if (this.options.confirmPatterns) {
      for (const pattern of this.options.confirmPatterns) {
        if (new RegExp(pattern, 'i').test(command)) {
          return 'high';
        }
      }
    }

    if (/>(?!dev\/null)/.test(command) || />>/.test(command)) {
      return 'medium';
    }

    if (/curl|wget|nc\s+/.test(command)) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Truncate output if it exceeds max size
   */
  truncateOutput(output) {
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
  async getShellInfo() {
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

/**
 * Factory function for creating shell tools
 */
export function createShellTool(options) {
  return new ShellTool(options);
}
