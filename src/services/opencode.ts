export interface OpenCodeConfig {
	hostname?: string;
	port?: number;
	timeout?: number;
	baseUrl?: string;
	model?: string;
	provider?: string;
}

export interface OpenCodeSession {
	id: string;
	title: string;
	createdAt: Date;
	updatedAt: Date;
	messageCount: number;
}

export interface OpenCodeMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: number;
}

export interface Project {
	id: string;
	name: string;
	path: string;
}

export interface Agent {
	id: string;
	name: string;
	description: string;
}

export interface Provider {
	id: string;
	name: string;
	models: string[];
}

export class OpenCodeClient {
	private baseUrl: string;
	private config: OpenCodeConfig;
	private isConnected: boolean = false;

	constructor(config: OpenCodeConfig = {}) {
		this.config = {
			hostname: config.hostname || '127.0.0.1',
			port: config.port || 4096,
			timeout: config.timeout || 5000,
			baseUrl: config.baseUrl || `http://${config.hostname || '127.0.0.1'}:${config.port || 4096}`,
			model: config.model || 'anthropic/claude-3-5-sonnet-20241022',
			provider: config.provider || 'anthropic',
		};
		this.baseUrl = this.config.baseUrl!;
	}

	async connect(): Promise<boolean> {
		try {
			const response = await fetch(`${this.baseUrl}/global/health`, {
				method: 'GET',
			});
			this.isConnected = response.ok;
			return this.isConnected;
		} catch {
			this.isConnected = false;
			return false;
		}
	}

	disconnect(): void {
		this.isConnected = false;
	}

	isReady(): boolean {
		return this.isConnected;
	}

	async healthCheck(): Promise<{ healthy: boolean; version: string } | null> {
		try {
			const response = await fetch(`${this.baseUrl}/global/health`);
			const data = await response.json() as any;
			return data.data || null;
		} catch {
			return null;
		}
	}

	async listSessions(): Promise<OpenCodeSession[]> {
		try {
			const response = await fetch(`${this.baseUrl}/session/list`);
			const data = await response.json() as any;
			return (data.data?.sessions || []).map((s: any) => ({
				id: s.id,
				title: s.title,
				createdAt: new Date(s.created_at),
				updatedAt: new Date(s.updated_at),
				messageCount: s.message_count || 0,
			}));
		} catch {
			return [];
		}
	}

	async getSession(id: string): Promise<OpenCodeSession | null> {
		try {
			const response = await fetch(`${this.baseUrl}/session/${id}`);
			const data = await response.json() as any;
			const s = data.data?.session;
			if (!s) return null;
			return {
				id: s.id,
				title: s.title,
				createdAt: new Date(s.created_at),
				updatedAt: new Date(s.updated_at),
				messageCount: s.message_count || 0,
			};
		} catch {
			return null;
		}
	}

	async createSession(title: string): Promise<OpenCodeSession | null> {
		try {
			const response = await fetch(`${this.baseUrl}/session`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title }),
			});
			const data = await response.json() as any;
			const s = data.data?.session;
			if (!s) return null;
			return {
				id: s.id,
				title: s.title,
				createdAt: new Date(s.created_at),
				updatedAt: new Date(s.updated_at),
				messageCount: 0,
			};
		} catch {
			return null;
		}
	}

	async deleteSession(id: string): Promise<boolean> {
		try {
			const response = await fetch(`${this.baseUrl}/session/${id}`, {
				method: 'DELETE',
			});
			return response.ok;
		} catch {
			return false;
		}
	}

	async sendPrompt(sessionId: string, text: string, options?: {
		model?: string;
		provider?: string;
		noReply?: boolean;
	}): Promise<string | null> {
		try {
			const response = await fetch(`${this.baseUrl}/session/${sessionId}/prompt`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					parts: [{ type: 'text', text }],
					model: {
						providerID: options?.provider || this.config.provider,
						modelID: options?.model || this.config.model,
					},
					noReply: options?.noReply || false,
				}),
			});
			
			if (options?.noReply) return null;
			
			const data = await response.json() as any;
			return data.data?.message?.parts?.[0]?.text || null;
		} catch {
			return null;
		}
	}

	async runShell(sessionId: string, command: string): Promise<string | null> {
		try {
			const response = await fetch(`${this.baseUrl}/session/${sessionId}/shell`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					parts: [{ type: 'text', text: command }],
				}),
			});
			const data = await response.json() as any;
			return data.data?.message?.parts?.[0]?.text || null;
		} catch {
			return null;
		}
	}

	async getMessages(sessionId: string): Promise<OpenCodeMessage[]> {
		try {
			const response = await fetch(`${this.baseUrl}/session/${sessionId}/messages`);
			const data = await response.json() as any;
			return (data.data?.messages || []).map((m: any) => ({
				role: m.role,
				content: m.parts?.map((p: any) => p.text).join('') || '',
				timestamp: new Date(m.created_at).getTime(),
			}));
		} catch {
			return [];
		}
	}

	async listProjects(): Promise<Project[]> {
		try {
			const response = await fetch(`${this.baseUrl}/project/list`);
			const data = await response.json() as any;
			return data.data?.projects || [];
		} catch {
			return [];
		}
	}

	async getCurrentProject(): Promise<Project | null> {
		try {
			const response = await fetch(`${this.baseUrl}/project/current`);
			const data = await response.json() as any;
			return data.data?.project || null;
		} catch {
			return null;
		}
	}

	async listAgents(): Promise<Agent[]> {
		try {
			const response = await fetch(`${this.baseUrl}/app/agents`);
			const data = await response.json() as any;
			return data.data?.agents || [];
		} catch {
			return [];
		}
	}

	async getConfig(): Promise<any> {
		try {
			const response = await fetch(`${this.baseUrl}/config/get`);
			const data = await response.json() as any;
			return data.data?.config || null;
		} catch {
			return null;
		}
	}

	async getProviders(): Promise<{ providers: Provider[]; default: Record<string, string> } | null> {
		try {
			const response = await fetch(`${this.baseUrl}/config/providers`);
			const data = await response.json() as any;
			return data.data || null;
		} catch {
			return null;
		}
	}

	async setAuth(providerId: string, apiKey: string): Promise<boolean> {
		try {
			const response = await fetch(`${this.baseUrl}/auth/${providerId}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ type: 'api', key: apiKey }),
			});
			return response.ok;
		} catch {
			return false;
		}
	}

	async findText(pattern: string, options?: { directory?: string; limit?: number }): Promise<any[]> {
		try {
			const params = new URLSearchParams({ pattern });
			if (options?.directory) params.append('directory', options.directory);
			if (options?.limit) params.append('limit', String(options.limit));
			
			const response = await fetch(`${this.baseUrl}/find/text?${params}`);
			const data = await response.json() as any;
			return data.data?.results || [];
		} catch {
			return [];
		}
	}

	async findFiles(query: string, options?: { type?: 'file' | 'directory'; directory?: string; limit?: number }): Promise<string[]> {
		try {
			const params = new URLSearchParams({ query });
			if (options?.type) params.append('type', options.type);
			if (options?.directory) params.append('directory', options.directory);
			if (options?.limit) params.append('limit', String(options.limit));
			
			const response = await fetch(`${this.baseUrl}/find/files?${params}`);
			const data = await response.json() as any;
			return data.data?.results || [];
		} catch {
			return [];
		}
	}

	async readFile(path: string): Promise<string | null> {
		try {
			const response = await fetch(`${this.baseUrl}/file/read?path=${encodeURIComponent(path)}`);
			const data = await response.json() as any;
			return data.data?.content || null;
		} catch {
			return null;
		}
	}

	async initProject(sessionId: string): Promise<boolean> {
		try {
			const response = await fetch(`${this.baseUrl}/session/${sessionId}/init`, {
				method: 'POST',
			});
			return response.ok;
		} catch {
			return false;
		}
	}
}

export const createOpenCodeClient = (config?: OpenCodeConfig): OpenCodeClient => {
	return new OpenCodeClient(config);
};
