/**
 * Sheikh Configuration
 * 
 * Manages ~/.sheikhrc configuration with support for JSON format
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const DEFAULT_CONFIG = {
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

/**
 * Load configuration from file or create default
 */
function loadConfig(configPath) {
  try {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, 'utf-8');
      const parsed = JSON.parse(content);
      return mergeWithDefault(parsed);
    }
  } catch (error) {
    console.warn(`Warning: Could not load config from ${configPath}:`, error.message);
  }
  return mergeWithDefault(DEFAULT_CONFIG);
}

/**
 * Merge parsed config with defaults
 */
function mergeWithDefault(parsed) {
  return {
    openrouter: { ...DEFAULT_CONFIG.openrouter, ...parsed.openrouter },
    plugins: { ...DEFAULT_CONFIG.plugins, ...parsed.plugins },
    ui: { ...DEFAULT_CONFIG.ui, ...parsed.ui },
    safety: { ...DEFAULT_CONFIG.safety, ...parsed.safety },
    system: { ...DEFAULT_CONFIG.system, ...parsed.system }
  };
}

/**
 * Save configuration to file
 */
function saveConfig(config, configPath) {
  try {
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    const content = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, content, 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error saving config to ${configPath}:`, error.message);
    return false;
  }
}

/**
 * ConfigLoader class for managing Sheikh configuration
 */
export class ConfigLoader {
  constructor(configPath) {
    this.configPath = configPath || path.join(os.homedir(), '.sheikhrc');
    this.config = loadConfig(this.configPath);
  }

  getConfig() {
    return this.config;
  }

  updateConfig(updates) {
    this.config = mergeWithDefault(updates);
  }

  saveConfig() {
    return saveConfig(this.config, this.configPath);
  }

  setApiKey(apiKey) {
    this.config.openrouter.apiKey = apiKey;
    this.saveConfig();
  }

  setModel(model) {
    this.config.openrouter.model = model;
    this.saveConfig();
  }

  getConfigPath() {
    return this.configPath;
  }

  isValid() {
    return Boolean(this.config.openrouter.apiKey);
  }

  createDefaultConfig() {
    if (!fs.existsSync(this.configPath)) {
      this.saveConfig();
    }
  }
}

// Singleton instance
let configInstance = null;

export function getConfig(configPath) {
  if (!configInstance) {
    configInstance = new ConfigLoader(configPath);
  }
  return configInstance;
}

export function resetConfig() {
  configInstance = null;
}
