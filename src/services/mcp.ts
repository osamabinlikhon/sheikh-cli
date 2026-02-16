import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

export interface MCPServerConfig {
	id: string;
	name: string;
	command: string;
	args: string[];
	env?: Record<string, string>;
	description?: string;
}

export interface MCPTool {
	name: string;
	description: string;
	inputSchema: {
		type: string;
		properties: Record<string, unknown>;
		required?: string[];
	};
}

export interface MCPResource {
	uri: string;
	name: string;
	description?: string;
	mimeType?: string;
}

export interface MCPRequest {
	jsonrpc: '2.0';
	id: number | string;
	method: string;
	params?: Record<string, unknown>;
}

export interface MCPResponse {
	jsonrpc: '2.0';
	id: number | string;
	result?: unknown;
	error?: {
		code: number;
		message: string;
		data?: unknown;
	};
}

export class MCPClient extends EventEmitter {
	private servers: Map<string, MCPServerConfig> = new Map();
	private processes: Map<string, ChildProcess> = new Map();
	private tools: Map<string, MCPTool[]> = new Map();
	private resources: Map<string, MCPResource[]> = new Map();
	private requestId = 0;
	private pendingRequests: Map<number | string, {
		resolve: (value: unknown) => void;
		reject: (reason: unknown) => void;
	}> = new Map();

	constructor() {
		super();
	}

	async addServer(config: MCPServerConfig): Promise<void> {
		this.servers.set(config.id, config);
		await this.startServer(config.id);
	}

	async removeServer(id: string): Promise<void> {
		await this.stopServer(id);
		this.servers.delete(id);
	}

	async startServer(id: string): Promise<void> {
		const config = this.servers.get(id);
		if (!config) throw new Error(`Server ${id} not found`);

		const proc = spawn(config.command, config.args, {
			stdio: ['pipe', 'pipe', 'pipe'],
			env: { ...process.env, ...config.env },
		});

		this.processes.set(id, proc);

		const rl = readline.createInterface({
			input: proc.stdout!,
			crlfDelay: Infinity,
		});

		rl.on('line', (line) => {
			try {
				const response: MCPResponse = JSON.parse(line);
				this.handleResponse(response);
			} catch (e) {
				this.emit('error', `Failed to parse MCP response: ${line}`);
			}
		});

		proc.stderr?.on('data', (data) => {
			this.emit('stderr', id, data.toString());
		});

		proc.on('exit', (code) => {
			this.emit('exit', id, code);
			this.processes.delete(id);
		});

		await this.initializeServer(id);
		await this.listTools(id);
		await this.listResources(id);
	}

	async stopServer(id: string): Promise<void> {
		const proc = this.processes.get(id);
		if (proc) {
			proc.kill();
			this.processes.delete(id);
			this.tools.delete(id);
			this.resources.delete(id);
		}
	}

	private async initializeServer(id: string): Promise<void> {
		await this.sendRequest(id, 'initialize', {
			protocolVersion: '2024-11-05',
			capabilities: {},
			clientInfo: {
				name: 'sheikh-cli',
				version: '1.0.0',
			},
		});
	}

	private async listTools(id: string): Promise<void> {
		const response = await this.sendRequest(id, 'tools/list', {});
		const result = response.result as { tools: MCPTool[] };
		this.tools.set(id, result?.tools || []);
	}

	private async listResources(id: string): Promise<void> {
		const response = await this.sendRequest(id, 'resources/list', {});
		const result = response.result as { resources: MCPResource[] };
		this.resources.set(id, result?.resources || []);
	}

	private async sendRequest(id: string, method: string, params: Record<string, unknown> = {}): Promise<MCPResponse> {
		const proc = this.processes.get(id);
		if (!proc) throw new Error(`Server ${id} is not running`);

		const request: MCPRequest = {
			jsonrpc: '2.0',
			id: ++this.requestId,
			method,
			params,
		};

		return new Promise((resolve, reject) => {
			this.pendingRequests.set(request.id, { resolve, reject });
			proc.stdin!.write(JSON.stringify(request) + '\n');

			setTimeout(() => {
				if (this.pendingRequests.has(request.id)) {
					this.pendingRequests.delete(request.id);
					reject(new Error(`Request ${method} timed out`));
				}
			}, 30000);
		});
	}

	private handleResponse(response: MCPResponse): void {
		const pending = this.pendingRequests.get(response.id);
		if (pending) {
			this.pendingRequests.delete(response.id);
			if (response.error) {
				pending.reject(new Error(response.error.message));
			} else {
				pending.resolve(response);
			}
		}
	}

	async callTool(serverId: string, toolName: string, args: Record<string, unknown> = {}): Promise<unknown> {
		const response = await this.sendRequest(serverId, 'tools/call', {
			name: toolName,
			arguments: args,
		});
		const result = response.result as { content: Array<{ type: string; text?: string }> };
		return result?.content?.[0]?.text || result;
	}

	async readResource(serverId: string, uri: string): Promise<unknown> {
		const response = await this.sendRequest(serverId, 'resources/read', { uri });
		return response.result;
	}

	getTools(serverId: string): MCPTool[] {
		return this.tools.get(serverId) || [];
	}

	getAllTools(): Map<string, MCPTool[]> {
		return this.tools;
	}

	getResources(serverId: string): MCPResource[] {
		return this.resources.get(serverId) || [];
	}

	getAllResources(): Map<string, MCPResource[]> {
		return this.resources;
	}

	isServerRunning(id: string): boolean {
		return this.processes.has(id);
	}

	getServers(): MCPServerConfig[] {
		return Array.from(this.servers.values());
	}

	async stop(): Promise<void> {
		for (const id of this.processes.keys()) {
			await this.stopServer(id);
		}
	}
}

export async function loadMCPConfig(configPath: string): Promise<MCPServerConfig[]> {
	if (!fs.existsSync(configPath)) {
		return [];
	}

	const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
	const mcpServers = config.mcpServers as Record<string, {
		command?: string;
		args?: string[];
		url?: string;
		env?: Record<string, string>;
		description?: string;
	}>;

	if (!mcpServers) return [];

	return Object.entries(mcpServers).map(([id, server]) => ({
		id,
		name: id,
		command: server.command || 'npx',
		args: server.args || [],
		env: server.env,
		description: server.description,
	}));
}
