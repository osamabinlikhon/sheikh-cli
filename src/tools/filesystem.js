/**
 * Filesystem Tool
 * 
 * Provides file operations: read, write, list, search, and metadata
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * FileSystemTool class for file operations
 */
export class FileSystemTool {
  constructor(options = {}) {
    this.name = 'filesystem';
    this.description = 'Read, write, and manipulate files and directories. Supports file reading, writing, listing directories, and searching for files.';
    
    this.parameters = {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          description: 'Operation type: read, write, list, exists, mkdir, delete, search, glob'
        },
        path: {
          type: 'string',
          description: 'File or directory path'
        },
        content: {
          type: 'string',
          description: 'Content to write (for write operation)'
        },
        encoding: {
          type: 'string',
          description: 'Text encoding (default: utf-8)'
        },
        pattern: {
          type: 'string',
          description: 'Search pattern (for search/glob operations)'
        },
        recursive: {
          type: 'boolean',
          description: 'Search recursively (default: true)'
        },
        maxDepth: {
          type: 'number',
          description: 'Maximum directory depth for recursive operations'
        },
        lines: {
          type: 'number',
          description: 'Number of lines to read from start/end'
        }
      },
      required: ['operation', 'path']
    };

    this.options = options;
  }

  /**
   * Execute file operation
   */
  async execute(args) {
    const operation = args.operation;
    const filePath = args.path;
    
    if (!operation || !filePath) {
      return {
        callId: '',
        toolName: 'filesystem',
        success: false,
        output: '',
        error: 'Operation and path are required'
      };
    }

    try {
      switch (operation.toLowerCase()) {
        case 'read':
          return await this.readFile(filePath, args.encoding, args.lines);
        case 'write':
          return await this.writeFile(filePath, args.content);
        case 'list':
          return await this.listDirectory(filePath, args.recursive, args.maxDepth);
        case 'exists':
          return this.checkExists(filePath);
        case 'mkdir':
          return await this.createDirectory(filePath);
        case 'delete':
          return await this.deleteFile(filePath);
        case 'search':
          return await this.searchFiles(filePath, args.pattern, args.recursive);
        case 'glob':
          return await this.globFiles(filePath, args.pattern);
        default:
          return {
            callId: '',
            toolName: 'filesystem',
            success: false,
            output: '',
            error: `Unknown operation: ${operation}`
          };
      }
    } catch (error) {
      return {
        callId: '',
        toolName: 'filesystem',
        success: false,
        output: '',
        error: error.message || 'Unknown error'
      };
    }
  }

  /**
   * Read a file
   */
  async readFile(filePath, encoding, lines) {
    try {
      const stat = await fs.promises.stat(filePath);
      
      if (stat.isDirectory()) {
        return {
          callId: '',
          toolName: 'filesystem',
          success: false,
          output: '',
          error: `Path is a directory: ${filePath}`
        };
      }

      if (this.options.maxFileSize && stat.size > this.options.maxFileSize) {
        return {
          callId: '',
          toolName: 'filesystem',
          success: false,
          output: '',
          error: `File too large: ${stat.size} bytes (max: ${this.options.maxFileSize})`
        };
      }

      let content;
      
      if (lines) {
        const fileContent = await fs.promises.readFile(filePath, { encoding: 'utf-8' });
        const allLines = fileContent.split('\n');
        content = allLines.slice(0, lines).join('\n');
      } else {
        content = await fs.promises.readFile(filePath, { encoding: encoding || 'utf-8' });
      }

      return {
        callId: '',
        toolName: 'filesystem',
        success: true,
        output: content
      };
    } catch (error) {
      return {
        callId: '',
        toolName: 'filesystem',
        success: false,
        output: '',
        error: `Failed to read file: ${filePath}`
      };
    }
  }

  /**
   * Write content to a file
   */
  async writeFile(filePath, content) {
    if (content === undefined) {
      return {
        callId: '',
        toolName: 'filesystem',
        success: false,
        output: '',
        error: 'Content is required for write operation'
      };
    }

    try {
      const dir = path.dirname(filePath);
      if (dir !== '.' && dir !== filePath) {
        await fs.promises.mkdir(dir, { recursive: true });
      }

      await fs.promises.writeFile(filePath, content, 'utf-8');

      return {
        callId: '',
        toolName: 'filesystem',
        success: true,
        output: `Successfully wrote to ${filePath} (${content.length} bytes)`
      };
    } catch (error) {
      return {
        callId: '',
        toolName: 'filesystem',
        success: false,
        output: '',
        error: `Failed to write file: ${filePath}`
      };
    }
  }

  /**
   * List directory contents
   */
  async listDirectory(filePath, recursive, maxDepth) {
    try {
      const items = await this.readDirRecursive(filePath, 1, maxDepth || (recursive ? 10 : 1));
      
      return {
        callId: '',
        toolName: 'filesystem',
        success: true,
        output: items
      };
    } catch (error) {
      return {
        callId: '',
        toolName: 'filesystem',
        success: false,
        output: '',
        error: `Failed to list directory: ${filePath}`
      };
    }
  }

  /**
   * Recursively read directory
   */
  async readDirRecursive(dir, currentDepth, maxDepth) {
    const indent = '  '.repeat(currentDepth);
    let output = '';
    
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          output += `${indent}📁 ${entry.name}/\n`;
          if (currentDepth < maxDepth) {
            output += await this.readDirRecursive(fullPath, currentDepth + 1, maxDepth);
          }
        } else {
          const stat = await fs.promises.stat(fullPath);
          const size = this.formatSize(stat.size);
          output += `${indent}📄 ${entry.name} (${size})\n`;
        }
      }
      
      return output;
    } catch {
      return `${indent}[Error reading directory]\n`;
    }
  }

  /**
   * Check if path exists
   */
  checkExists(filePath) {
    try {
      const exists = fs.existsSync(filePath);
      const stat = exists ? fs.statSync(filePath) : null;
      
      return {
        callId: '',
        toolName: 'filesystem',
        success: true,
        output: exists 
          ? `Path exists: ${filePath} (${stat.isDirectory() ? 'directory' : 'file'})`
          : `Path does not exist: ${filePath}`
      };
    } catch (error) {
      return {
        callId: '',
        toolName: 'filesystem',
        success: false,
        output: '',
        error: `Failed to check path: ${filePath}`
      };
    }
  }

  /**
   * Create directory
   */
  async createDirectory(filePath) {
    try {
      await fs.promises.mkdir(filePath, { recursive: true });
      
      return {
        callId: '',
        toolName: 'filesystem',
        success: true,
        output: `Created directory: ${filePath}`
      };
    } catch (error) {
      return {
        callId: '',
        toolName: 'filesystem',
        success: false,
        output: '',
        error: `Failed to create directory: ${filePath}`
      };
    }
  }

  /**
   * Delete file or directory
   */
  async deleteFile(filePath) {
    try {
      const stat = await fs.promises.lstat(filePath);
      
      if (stat.isDirectory()) {
        await fs.promises.rm(filePath, { recursive: true, force: true });
      } else {
        await fs.promises.unlink(filePath);
      }
      
      return {
        callId: '',
        toolName: 'filesystem',
        success: true,
        output: `Deleted: ${filePath}`
      };
    } catch (error) {
      return {
        callId: '',
        toolName: 'filesystem',
        success: false,
        output: '',
        error: `Failed to delete: ${filePath}`
      };
    }
  }

  /**
   * Search for text in files
   */
  async searchFiles(dir, pattern, recursive) {
    if (!pattern) {
      return {
        callId: '',
        toolName: 'filesystem',
        success: false,
        output: '',
        error: 'Pattern is required for search operation'
      };
    }

    try {
      const regex = new RegExp(pattern, 'gi');
      const matches = [];
      
      await this.searchInDirectory(dir, regex, recursive ?? true, matches);
      
      if (matches.length === 0) {
        return {
          callId: '',
          toolName: 'filesystem',
          success: true,
          output: `No matches found for "${pattern}" in ${dir}`
        };
      }

      return {
        callId: '',
        toolName: 'filesystem',
        success: true,
        output: `Found ${matches.length} matches for "${pattern}":\n\n${matches.slice(0, 50).join('\n')}`
      };
    } catch (error) {
      return {
        callId: '',
        toolName: 'filesystem',
        success: false,
        output: '',
        error: `Search failed: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Search in directory recursively
   */
  async searchInDirectory(dir, regex, recursive, matches) {
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
          if (entry.isDirectory() && recursive) {
            await this.searchInDirectory(fullPath, regex, recursive, matches);
          }
          continue;
        }
        
        if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js') || entry.name.endsWith('.json'))) {
          try {
            const content = await fs.promises.readFile(fullPath, 'utf-8');
            const lines = content.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
              if (regex.test(lines[i])) {
                matches.push(`${fullPath}:${i + 1}: ${lines[i].trim()}`);
              }
            }
            
            regex.lastIndex = 0;
          } catch {
            // Skip files we can't read
          }
        } else if (entry.isDirectory() && recursive) {
          await this.searchInDirectory(fullPath, regex, recursive, matches);
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  /**
   * Find files matching glob pattern
   */
  async globFiles(dir, pattern) {
    if (!pattern) {
      return {
        callId: '',
        toolName: 'filesystem',
        success: false,
        output: '',
        error: 'Pattern is required for glob operation'
      };
    }

    try {
      const globPattern = pattern
        .replace(/\./g, '\\.')
        .replace(/\*/g, '.*')
        .replace(/\?/g, '.');
      const regex = new RegExp(`^${globPattern}$`, 'i');
      
      const matches = [];
      
      await this.globInDirectory(dir, regex, matches);
      
      if (matches.length === 0) {
        return {
          callId: '',
          toolName: 'filesystem',
          success: true,
          output: `No files matching "${pattern}" found in ${dir}`
        };
      }

      return {
        callId: '',
        toolName: 'filesystem',
        success: true,
        output: `Found ${matches.length} files matching "${pattern}":\n\n${matches.join('\n')}`
      };
    } catch (error) {
      return {
        callId: '',
        toolName: 'filesystem',
        success: false,
        output: '',
        error: `Glob search failed: ${error.message || 'Unknown error'}`
      };
    }
  }

  /**
   * Find files matching pattern in directory
   */
  async globInDirectory(dir, regex, matches) {
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.name.startsWith('.')) continue;
        
        if (regex.test(entry.name)) {
          matches.push(path.relative(process.cwd(), fullPath));
        }
        
        if (entry.isDirectory() && entry.name !== 'node_modules') {
          await this.globInDirectory(fullPath, regex, matches);
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  /**
   * Format file size for display
   */
  formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

/**
 * Factory function for creating filesystem tools
 */
export function createFileSystemTool(options) {
  return new FileSystemTool(options);
}
