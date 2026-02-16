import * as fs from 'fs';
import * as path from 'path';

export type PluginHook = 
	| 'tool.execute.before'
	| 'tool.execute.after'
	| 'session.created'
	| 'session.deleted'
	| 'session.idle'
	| 'message.updated'
	| 'file.edited'
	| 'event';

export interface PluginContext {
	project: {
		name: string;
		path: string;
	};
	directory: string;
	worktree: string | null;
	client?: any;
	$: any;
}

export interface PluginHooks {
	'tool.execute.before'?: (input: any, output: any) => Promise<void>;
	'tool.execute.after'?: (input: any, output: any) => Promise<void>;
	'session.created'?: (session: any) => Promise<void>;
	'session.deleted'?: (sessionId: string) => Promise<void>;
	'session.idle'?: (session: any) => Promise<void>;
	'message.updated'?: (message: any) => Promise<void>;
	'file.edited'?: (filePath: string, content: string) => Promise<void>;
	'event'?: (event: any) => Promise<void>;
}

export interface Plugin {
	name: string;
	version?: string;
	hooks: PluginHooks;
}

export class PluginManager {
	private plugins: Map<string, Plugin> = new Map();
	private pluginDirs: string[] = [];

	constructor() {
		this.initPluginDirs();
	}

	private initPluginDirs(): void {
		const home = process.env.HOME || '';
		const cwd = process.cwd();
		
		this.pluginDirs = [
			path.join(home, '.config', 'sheikh', 'plugins'),
			path.join(home, '.sheikh', 'plugins'),
			path.join(cwd, '.sheikh', 'plugins'),
			path.join(cwd, '.sheikh', 'plugins'),
		];
	}

	async loadPlugins(): Promise<void> {
		for (const dir of this.pluginDirs) {
			if (!fs.existsSync(dir)) continue;
			
			const files = fs.readdirSync(dir);
			for (const file of files) {
				if (file.endsWith('.js') || file.endsWith('.ts')) {
					await this.loadPlugin(path.join(dir, file));
				}
			}
		}
	}

	private async loadPlugin(filePath: string): Promise<void> {
		try {
			const module = await import(filePath);
			const pluginExport = module.exports || module;
			
			let plugin: Plugin | undefined;
			
			if (typeof pluginExport === 'function') {
				plugin = await pluginExport({});
			} else if (typeof pluginExport === 'object') {
				plugin = pluginExport.default || pluginExport;
			}
			
			if (plugin && plugin.name) {
				this.plugins.set(plugin.name, plugin);
			}
		} catch (error) {
			console.error(`Failed to load plugin from ${filePath}:`, error);
		}
	}

	async unloadPlugin(name: string): Promise<void> {
		this.plugins.delete(name);
	}

	getPlugin(name: string): Plugin | undefined {
		return this.plugins.get(name);
	}

	listPlugins(): Plugin[] {
		return Array.from(this.plugins.values());
	}

	async executeHook(hook: PluginHook, arg1?: any, arg2?: any): Promise<void> {
		for (const plugin of this.plugins.values()) {
			const handler = plugin.hooks[hook];
			if (handler) {
				try {
					await handler(arg1, arg2);
				} catch (error) {
					console.error(`Plugin ${plugin.name} hook ${hook} failed:`, error);
				}
			}
		}
	}

	async onToolBefore(input: any): Promise<any> {
		let output = { ...input };
		await this.executeHook('tool.execute.before', input, output);
		return output;
	}

	async onToolAfter(input: any, output: any): Promise<void> {
		await this.executeHook('tool.execute.after', input, output);
	}

	async onSessionCreated(session: any): Promise<void> {
		await this.executeHook('session.created', session);
	}

	async onSessionDeleted(sessionId: string): Promise<void> {
		await this.executeHook('session.deleted', sessionId);
	}

	async onSessionIdle(session: any): Promise<void> {
		await this.executeHook('session.idle', session);
	}

	async onMessageUpdated(message: any): Promise<void> {
		await this.executeHook('message.updated', message);
	}

	async onFileEdited(filePath: string, content: string): Promise<void> {
		await this.executeHook('file.edited', filePath, content);
	}

	async onEvent(event: any): Promise<void> {
		await this.executeHook('event', event);
	}
}

export const pluginManager = new PluginManager();

export const createPlugin = (name: string, hooks: PluginHooks): Plugin => ({
	name,
	hooks,
});

export const createToolPlugin = (
	name: string,
	toolName: string,
	handler: (args: any, context: PluginContext) => Promise<any>
): Plugin => ({
	name,
	hooks: {
		'tool.execute.before': async (input, output) => {
			if (input.tool === toolName) {
				output.result = await handler(input.args, input.context);
			}
		},
	},
});
