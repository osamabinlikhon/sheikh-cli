export type ToolCapability = 'read' | 'write' | 'execute' | 'search' | 'browse' | 'analyze';

export interface ToolParameter {
	name: string;
	type: 'string' | 'number' | 'boolean' | 'array' | 'object';
	description: string;
	required: boolean;
	default?: unknown;
}

export interface ToolDefinition {
	id: string;
	name: string;
	description: string;
	category: 'file' | 'git' | 'search' | 'code' | 'system' | 'custom';
	parameters: ToolParameter[];
	capabilities: ToolCapability[];
	requiresPermission?: string;
	handler: (params: Record<string, unknown>) => Promise<unknown>;
}

export const BUILTIN_TOOLS: ToolDefinition[] = [
	{
		id: 'read_file',
		name: 'Read File',
		description: 'Read the contents of a file from the filesystem',
		category: 'file',
		parameters: [
			{ name: 'path', type: 'string', description: 'Absolute path to file', required: true },
			{ name: 'offset', type: 'number', description: 'Line offset to start from', required: false, default: 0 },
			{ name: 'limit', type: 'number', description: 'Number of lines to read', required: false },
		],
		capabilities: ['read'],
		requiresPermission: 'file:read',
		handler: async (params) => ({ path: params.path }),
	},
	{
		id: 'write_file',
		name: 'Write File',
		description: 'Write content to a file',
		category: 'file',
		parameters: [
			{ name: 'path', type: 'string', description: 'Absolute path to file', required: true },
			{ name: 'content', type: 'string', description: 'Content to write', required: true },
		],
		capabilities: ['write'],
		requiresPermission: 'file:write',
		handler: async (params) => ({ path: params.path }),
	},
	{
		id: 'glob_files',
		name: 'Glob Files',
		description: 'Find files matching a glob pattern',
		category: 'file',
		parameters: [
			{ name: 'pattern', type: 'string', description: 'Glob pattern', required: true },
			{ name: 'path', type: 'string', description: 'Base path to search', required: false },
		],
		capabilities: ['search'],
		handler: async (params) => ({ pattern: params.pattern }),
	},
	{
		id: 'grep_search',
		name: 'Grep Search',
		description: 'Search for patterns in files',
		category: 'search',
		parameters: [
			{ name: 'pattern', type: 'string', description: 'Regex pattern', required: true },
			{ name: 'path', type: 'string', description: 'Path to search in', required: false, default: '.' },
			{ name: 'include', type: 'string', description: 'File patterns to include', required: false },
		],
		capabilities: ['search'],
		handler: async (params) => ({ pattern: params.pattern }),
	},
	{
		id: 'run_command',
		name: 'Run Command',
		description: 'Execute a shell command',
		category: 'system',
		parameters: [
			{ name: 'command', type: 'string', description: 'Command to execute', required: true },
			{ name: 'cwd', type: 'string', description: 'Working directory', required: false },
		],
		capabilities: ['execute'],
		requiresPermission: 'shell:execute',
		handler: async (params) => ({ command: params.command }),
	},
	{
		id: 'git_status',
		name: 'Git Status',
		description: 'Get git repository status',
		category: 'git',
		parameters: [
			{ name: 'path', type: 'string', description: 'Repository path', required: false },
		],
		capabilities: ['read'],
		handler: async () => ({}),
	},
	{
		id: 'git_log',
		name: 'Git Log',
		description: 'Get git commit history',
		category: 'git',
		parameters: [
			{ name: 'path', type: 'string', description: 'Repository path', required: false },
			{ name: 'limit', type: 'number', description: 'Number of commits', required: false, default: 10 },
		],
		capabilities: ['read'],
		handler: async () => ({}),
	},
	{
		id: 'analyze_codebase',
		name: 'Analyze Codebase',
		description: 'Analyze codebase structure and dependencies',
		category: 'code',
		parameters: [
			{ name: 'path', type: 'string', description: 'Project root path', required: true },
			{ name: 'depth', type: 'number', description: 'Analysis depth', required: false, default: 3 },
		],
		capabilities: ['analyze'],
		handler: async (params) => ({ path: params.path }),
	},
	{
		id: 'list_directory',
		name: 'List Directory',
		description: 'List contents of a directory',
		category: 'file',
		parameters: [
			{ name: 'path', type: 'string', description: 'Directory path', required: true },
			{ name: 'all', type: 'boolean', description: 'Show hidden files', required: false, default: false },
		],
		capabilities: ['read'],
		handler: async (params) => ({ path: params.path }),
	},
];

export const getTool = (id: string): ToolDefinition | undefined => {
	return BUILTIN_TOOLS.find((t) => t.id === id);
};

export const getToolsByCategory = (category: string): ToolDefinition[] => {
	return BUILTIN_TOOLS.filter((t) => t.category === category);
};

export const getToolsByCapability = (capability: ToolCapability): ToolDefinition[] => {
	return BUILTIN_TOOLS.filter((t) => t.capabilities.includes(capability));
};

export const getToolNames = (): string[] => {
	return BUILTIN_TOOLS.map((t) => t.id);
};
