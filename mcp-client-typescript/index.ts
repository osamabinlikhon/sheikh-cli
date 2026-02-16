import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

interface MCPTool {
	name: string;
	description: string;
	inputSchema: object;
}

class MCPClient {
	private client: Client | null = null;
	private transport: StdioClientTransport | null = null;

	async connect(command: string, args: string[] = []): Promise<void> {
		this.transport = new StdioClientTransport({
			command,
			args,
		});

		this.client = new Client(
			{
				name: 'mcp-client-typescript',
				version: '1.0.0',
			},
			{
				capabilities: {},
			}
		);

		await this.client.connect(this.transport);
		console.log('Connected to MCP server');
	}

	async disconnect(): Promise<void> {
		if (this.client) {
			await this.client.close();
			this.client = null;
		}
	}

	async listTools(): Promise<MCPTool[]> {
		if (!this.client) {
			throw new Error('Client not connected');
		}

		const response = await (this.client as any).request(
			{ method: 'tools/list' },
			{}
		);

		return response.tools || [];
	}

	async callTool(name: string, args: Record<string, unknown> = {}): Promise<any> {
		if (!this.client) {
			throw new Error('Client not connected');
		}

		const response = await (this.client as any).request(
			{ method: 'tools/call', params: { name, arguments: args } },
			{}
		);

		return response;
	}

	async listResources(): Promise<any> {
		if (!this.client) {
			throw new Error('Client not connected');
		}

		const response = await (this.client as any).request(
			{ method: 'resources/list' },
			{}
		);

		return response;
	}

	async readResource(uri: string): Promise<any> {
		if (!this.client) {
			throw new Error('Client not connected');
		}

		const response = await (this.client as any).request(
			{ method: 'resources/read', params: { uri } },
			{}
		);

		return response;
	}
}

async function main() {
	const client = new MCPClient();

	try {
		console.log('Connecting to MCP server...');
		await client.connect('npx', ['-y', '@modelcontextprotocol/server-filesystem', '/tmp']);

		console.log('\n--- Available Tools ---');
		const tools = await client.listTools();
		for (const tool of tools) {
			console.log(`- ${tool.name}: ${tool.description}`);
		}

		console.log('\n--- Calling Tool ---');
		const result = await client.callTool('read_file', { path: '/tmp/test.txt' });
		console.log('Result:', JSON.stringify(result, null, 2));

		console.log('\n--- Listing Resources ---');
		const resources = await client.listResources();
		console.log('Resources:', JSON.stringify(resources, null, 2));

	} catch (error) {
		console.error('Error:', error);
	} finally {
		await client.disconnect();
		console.log('\nDisconnected');
	}
}

main();
