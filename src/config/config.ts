/**
 * Configuration Loader
 * 
 * Manages ~/.sheikhrc configuration with support for JSON/YAML formats
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { SheikhConfig } from './types.js';

const DEFAULT_CONFIG: SheikhConfig = {
  openrouter: {
    apiKey: '',
    model: 'anthropic/claude-3-5-sonnet',
    temperature: 0.7,
    maxTokens: 4096,
    siteUrl: 'https://github.com/sheikh/cli',
    appTitle: 'Sheikh CLI'
  },
  plugins: {
    enabled: [],
    paths: []
  },
  ui: {
    theme: 'dark',
    streaming: true,
    compact: false
  },
  safety: {
    dangerousCommands: 'confirm',
    confirmPatterns: [
      'rm -rf',
      'rm -r',
      'dd if=',
      'mkfs',
      'chmod -R 000',
      'chown -R',
      ':(){:|:&};:',
      '> /dev/null',
      'wget',
      'curl'
    ],
    maxShellOutput: 10000
  },
  system: {
    shell: process.env.SHELL || process.env.COMSPEC || '/bin/sh',
    workingDirectory: process.cwd()
  }
};

export class ConfigLoader {
  private configPath: string;
  private config: SheikhConfig;
  private configDir: string;

  constructor(configPath?: string) {
    this.configPath = configPath || path.join(os.homedir(), '.sheikhrc');
    this.configDir = path.dirname(this.configPath);
    this.config = this.loadConfig();
  }

  /**
   * Load configuration from file or create default
   */
  private loadConfig(): SheikhConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const content = fs.readFileSync(this.configPath, 'utf-8');
        const parsed = this.parseConfig(content);
        return this.mergeWithDefault(parsed);
      }
    } catch (error) {
      console.warn(`Warning: Could not load config from ${this.configPath}:`, error);
    }
    return this.mergeWithDefault(DEFAULT_CONFIG);
  }

  /**
   * Parse configuration content (supports JSON and YAML)
   */
  private parseConfig(content: string): Partial<SheikhConfig> {
    try {
      // Try JSON first
      return JSON.parse(content);
    } catch {
      // Try YAML if JSON fails
      try {
        return this.parseYAML(content);
      } catch {
        console.warn('Warning: Config file is neither valid JSON nor YAML');
        return {};
      }
    }
  }

  /**
   * Simple YAML parser for basic key-value structures
   */
  private parseYAML(content: string): Partial<SheikhConfig> {
    const result: Record<string, unknown> = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;
      
      const key = trimmed.substring(0, colonIndex).trim();
      let value = trimmed.substring(colonIndex + 1).trim();
      
      // Remove quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      
      // Handle boolean and number
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (!isNaN(Number(value)) && value !== '') value = Number(value);
      
      // Handle nested objects
      if (trimmed.endsWith(':') && !trimmed.includes('#')) {
        // This is a simplified parser - for complex YAML, use a library like js-yaml
        continue;
      }
      
      this.setNestedValue(result, key, value);
    }
    
    return result as Partial<SheikhConfig>;
  }

  /**
   * Set a nested value in an object
   */
  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const parts = path.split('.');
    let current = obj;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) {
        current[parts[i]] = {};
      }
      current = current[parts[i]] as Record<string, unknown>;
    }
    
    current[parts[parts.length - 1]] = value;
  }

  /**
   * Merge parsed config with defaults
   */
  private mergeWithDefault(parsed: Partial<SheikhConfig>): SheikhConfig {
    return {
      openrouter: { ...DEFAULT_CONFIG.openrouter, ...parsed.openrouter },
      plugins: { ...DEFAULT_CONFIG.plugins, ...parsed.plugins },
      ui: { ...DEFAULT_CONFIG.ui, ...parsed.ui },
      safety: { ...DEFAULT_CONFIG.safety, ...parsed.safety },
      system: { ...DEFAULT_CONFIG.system, ...parsed.system }
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): SheikhConfig {
    return this.config;
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<SheikhConfig>): void {
    this.config = this.mergeWithDefault(updates);
  }

  /**
   * Save configuration to file
   */
  saveConfig(): void {
    try {
      // Ensure config directory exists
      if (!fs.existsSync(this.configDir)) {
        fs.mkdirSync(this.configDir, { recursive: true });
      }
      
      const content = JSON.stringify(this.config, null, 2);
      fs.writeFileSync(this.configPath, content, 'utf-8');
    } catch (error) {
      console.error(`Error saving config to ${this.configPath}:`, error);
    }
  }

  /**
   * Set API key and save
   */
  setApiKey(apiKey: string): void {
    this.config.openrouter.apiKey = apiKey;
    this.saveConfig();
  }

  /**
   * Set default model and save
   */
  setModel(model: string): void {
    this.config.openrouter.model = model;
    this.saveConfig();
  }

  /**
   * Get the config file path
   */
  getConfigPath(): string {
    return this.configPath;
  }

  /**
   * Check if configuration is valid (has API key)
   */
  isValid(): boolean {
    return Boolean(this.config.openrouter.apiKey);
  }

  /**
   * Create default config file if it doesn't exist
   */
  createDefaultConfig(): void {
    if (!fs.existsSync(this.configPath)) {
      this.saveConfig();
    }
  }
}

// Singleton instance
let configInstance: ConfigLoader | null = null;

export function getConfig(configPath?: string): ConfigLoader {
  if (!configInstance) {
    configInstance = new ConfigLoader(configPath);
  }
  return configInstance;
}

export function resetConfig(): void {
  configInstance = null;
}
