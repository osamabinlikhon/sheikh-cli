/**
 * Plugin Loader
 * 
 * Discovers, loads, and manages Sheikh plugins
 */

import * as fs from 'fs';
import * as path from 'path';
import { dynamicImport } from '../utils/import.js';
import { SheikhPlugin, AgentContext, Tool } from '../core/types.js';

export interface PluginLoadResult {
  name: string;
  version: string;
  success: boolean;
  error?: string;
  tools: string[];
}

export class PluginLoader {
  private plugins: Map<string, SheikhPlugin> = new Map();
  private pluginPaths: string[] = [];
  private context: AgentContext | null = null;

  constructor(pluginPaths?: string[]) {
    if (pluginPaths) {
      this.pluginPaths = pluginPaths;
    } else {
      // Default plugin paths
      this.pluginPaths = [
        path.join(process.cwd(), '.sheikh', 'plugins'),
        path.join(process.env.HOME || '', '.sheikh', 'plugins'),
        path.join(__dirname, '..', '..', 'plugins')
      ];
    }
  }

  /**
   * Set the agent context for plugin initialization
   */
  setContext(context: AgentContext): void {
    this.context = context;
  }

  /**
   * Discover available plugins in configured paths
   */
  discoverPlugins(): string[] {
    const discovered: string[] = [];

    for (const pluginPath of this.pluginPaths) {
      if (!fs.existsSync(pluginPath)) continue;

      try {
        const entries = fs.readdirSync(pluginPath, { withFileTypes: true });
        
        for (const entry of entries) {
          if (!entry.isDirectory()) continue;
          
          const fullPath = path.join(pluginPath, entry.name);
          const packageJson = path.join(fullPath, 'package.json');
          
          if (fs.existsSync(packageJson)) {
            try {
              const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
              if (pkg.keywords?.includes('sheikh-plugin')) {
                discovered.push(fullPath);
              }
            } catch {
              // Skip invalid package.json
            }
          }
        }
      } catch {
        // Skip paths we can't read
      }
    }

    return discovered;
  }

  /**
   * Load a single plugin from a path
   */
  async loadPlugin(pluginPath: string): Promise<PluginLoadResult> {
    try {
      const packageJsonPath = path.join(pluginPath, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      const name = packageJson.name;
      const version = packageJson.version || '1.0.0';
      
      // Try to load the main module
      const mainFile = packageJson.main || 'index.js';
      const mainPath = path.join(pluginPath, mainFile);
      
      if (!fs.existsSync(mainPath)) {
        return {
          name,
          version,
          success: false,
          error: `Main file not found: ${mainPath}`,
          tools: []
        };
      }

      // Dynamic import the plugin
      const pluginModule = await dynamicImport(mainPath);
      
      // Get the plugin factory or default export
      const pluginAny = pluginModule as any;
      const pluginExport = pluginAny.default || pluginModule;
      
      if (typeof pluginExport !== 'function') {
        return {
          name,
          version,
          success: false,
          error: 'Plugin must export a function',
          tools: []
        };
      }

      // Instantiate the plugin
      const plugin = await pluginExport(this.context);
      
      // Validate plugin structure
      if (!plugin.name || !plugin.tools) {
        return {
          name,
          version,
          success: false,
          error: 'Plugin must have name and tools',
          tools: []
        };
      }

      // Store the plugin
      this.plugins.set(plugin.name, plugin);

      // Register tools with the agent context
      if (this.context) {
        for (const tool of plugin.tools) {
          this.context.registerTool(tool);
        }
      }

      // Call initialize hook if present
      if (plugin.initialize && this.context) {
        await plugin.initialize(this.context);
      }

      // Call hooks if present
      if (plugin.hooks && this.context) {
        this.registerHooks(plugin.hooks);
      }

      return {
        name: plugin.name,
        version: plugin.version,
        success: true,
        tools: plugin.tools.map(t => t.name)
      };
    } catch (error) {
      const name = path.basename(pluginPath);
      return {
        name,
        version: 'unknown',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        tools: []
      };
    }
  }

  /**
   * Register plugin hooks with the agent
   */
  private registerHooks(hooks: SheikhPlugin['hooks']): void {
    // Hook registration is handled by the agent
    // This is a placeholder for hook integration
  }

  /**
   * Load all enabled plugins from configuration
   */
  async loadEnabledPlugins(enabledNames: string[]): Promise<PluginLoadResult[]> {
    const results: PluginLoadResult[] = [];
    const discovered = this.discoverPlugins();

    for (const pluginPath of discovered) {
      const packageJsonPath = path.join(pluginPath, 'package.json');
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // Check if plugin is enabled
      if (!enabledNames.includes(pkg.name) && !enabledNames.includes('*')) {
        continue;
      }

      const result = await this.loadPlugin(pluginPath);
      results.push(result);
    }

    return results;
  }

  /**
   * Get all loaded plugins
   */
  getLoadedPlugins(): SheikhPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get a specific plugin by name
   */
  getPlugin(name: string): SheikhPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(name: string): Promise<boolean> {
    const plugin = this.plugins.get(name);
    if (!plugin) return false;

    // Call shutdown hook if present
    if (plugin.hooks?.onShutdown && this.context) {
      await plugin.hooks.onShutdown(this.context);
    }

    // Unregister tools
    if (this.context) {
      for (const tool of plugin.tools) {
        this.context.unregisterTool(tool.name);
      }
    }

    this.plugins.delete(name);
    return true;
  }

  /**
   * Create a simple example plugin
   */
  static createExamplePlugin(): string {
    return `/**
 * Example Sheikh Plugin
 * 
 * Add this to your .sheikhrc config to enable
 */

import { Tool, SheikhPlugin } from '@sheikh/cli';

const weatherTool: Tool = {
  name: 'weather',
  description: 'Get weather information for a location',
  parameters: {
    type: 'object',
    properties: {
      location: {
        type: 'string',
        description: 'City name or coordinates'
      },
      units: {
        type: 'string',
        enum: ['metric', 'imperial'],
        description: 'Temperature units'
      }
    },
    required: ['location']
  },
  async execute(args) {
    const { location, units = 'metric' } = args;
    
    // This would typically call a weather API
    return {
      callId: '',
      toolName: 'weather',
      success: true,
      output: \`Weather for \${location}: 22°C, Partly Cloudy\`
    };
  }
};

export default function examplePlugin() {
  const plugin: SheikhPlugin = {
    name: 'sheikh-plugin-example',
    version: '1.0.0',
    description: 'Example plugin demonstrating plugin system',
    tools: [weatherTool],
    initialize: async (context) => {
      console.log('Example plugin initialized');
    }
  };

  return plugin;
}
`;
  }
}

// Export factory function
export function createPluginLoader(pluginPaths?: string[]): PluginLoader {
  return new PluginLoader(pluginPaths);
}
