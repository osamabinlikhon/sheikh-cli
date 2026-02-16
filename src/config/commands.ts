export interface CommandArgument {
	name: string;
	type: 'string' | 'number' | 'boolean' | 'path';
	required: boolean;
	description: string;
	default?: string;
}

export interface Command {
	name: string;
	description: string;
	aliases: string[];
	args: CommandArgument[];
	category: 'file' | 'git' | 'system' | 'ai' | 'config' | 'help';
	execute: (args: string[]) => Promise<string>;
	requiresPermission?: string;
	requiresModel?: boolean;
}

export const COMMANDS: Command[] = [
	{
		name: 'read',
		description: 'Read file content',
		aliases: ['r', 'cat'],
		args: [
			{ name: 'path', type: 'path', required: true, description: 'Path to file' },
		],
		category: 'file',
		execute: async (args) => {
			return `read ${args.join(' ')}`;
		},
	},
	{
		name: 'write',
		description: 'Write content to file',
		aliases: ['w'],
		args: [
			{ name: 'path', type: 'path', required: true, description: 'Path to file' },
			{ name: 'content', type: 'string', required: true, description: 'Content to write' },
		],
		category: 'file',
		requiresPermission: 'file:write',
		execute: async (args) => {
			return `write ${args.join(' ')}`;
		},
	},
	{
		name: 'glob',
		description: 'Find files matching pattern',
		aliases: ['g'],
		args: [
			{ name: 'pattern', type: 'string', required: false, default: '*', description: 'Glob pattern' },
		],
		category: 'file',
		execute: async (args) => {
			return `glob ${args.join(' ')}`;
		},
	},
	{
		name: 'grep',
		description: 'Search for pattern in files',
		aliases: [],
		args: [
			{ name: 'pattern', type: 'string', required: true, description: 'Search pattern' },
			{ name: 'path', type: 'path', required: false, default: '.', description: 'Path to search' },
		],
		category: 'file',
		execute: async (args) => {
			return `grep ${args.join(' ')}`;
		},
	},
	{
		name: 'run',
		description: 'Execute shell command',
		aliases: ['!', 'exec'],
		args: [
			{ name: 'command', type: 'string', required: true, description: 'Command to execute' },
		],
		category: 'system',
		requiresPermission: 'shell:execute',
		execute: async (args) => {
			return `run ${args.join(' ')}`;
		},
	},
	{
		name: 'cd',
		description: 'Change current directory',
		aliases: [],
		args: [
			{ name: 'directory', type: 'path', required: false, description: 'Directory path' },
		],
		category: 'system',
		execute: async (args) => {
			return `cd ${args.join(' ')}`;
		},
	},
	{
		name: 'ls',
		description: 'List directory contents',
		aliases: ['dir', 'll'],
		args: [
			{ name: 'path', type: 'path', required: false, description: 'Directory path' },
		],
		category: 'system',
		execute: async (args) => {
			return `ls ${args.join(' ')}`;
		},
	},
	{
		name: 'clear',
		description: 'Clear chat messages',
		aliases: ['cl'],
		args: [],
		category: 'help',
		execute: async () => {
			return 'clear';
		},
	},
	{
		name: 'help',
		description: 'Show available commands',
		aliases: ['?'],
		args: [
			{ name: 'command', type: 'string', required: false, description: 'Command name' },
		],
		category: 'help',
		execute: async (args) => {
			return `help ${args.join(' ')}`;
		},
	},
	{
		name: 'git',
		description: 'Git operations',
		aliases: ['g'],
		args: [
			{ name: 'subcommand', type: 'string', required: true, description: 'Git subcommand (status, commit, etc.)' },
		],
		category: 'git',
		requiresPermission: 'git:execute',
		execute: async (args) => {
			return `git ${args.join(' ')}`;
		},
	},
	{
		name: 'model',
		description: 'Switch AI model',
		aliases: ['m'],
		args: [
			{ name: 'modelId', type: 'string', required: false, description: 'Model ID' },
		],
		category: 'ai',
		execute: async (args) => {
			return `model ${args.join(' ')}`;
		},
	},
	{
		name: 'theme',
		description: 'Change CLI theme',
		aliases: [],
		args: [
			{ name: 'themeId', type: 'string', required: false, description: 'Theme name' },
		],
		category: 'config',
		execute: async (args) => {
			return `theme ${args.join(' ')}`;
		},
	},
	{
		name: 'config',
		description: 'Manage configuration',
		aliases: ['cfg'],
		args: [
			{ name: 'action', type: 'string', required: true, description: 'Action (get, set, list)' },
			{ name: 'key', type: 'string', required: false, description: 'Config key' },
			{ name: 'value', type: 'string', required: false, description: 'Config value' },
		],
		category: 'config',
		execute: async (args) => {
			return `config ${args.join(' ')}`;
		},
	},
];

export const getCommand = (name: string): Command | undefined => {
	const cmd = COMMANDS.find((c) => c.name === name);
	if (cmd) return cmd;
	return COMMANDS.find((c) => c.aliases.includes(name));
};

export const getCommandsByCategory = (category: string): Command[] => {
	return COMMANDS.filter((c) => c.category === category);
};

export const getAllCommandNames = (): string[] => {
	return COMMANDS.flatMap((c) => [c.name, ...c.aliases]);
};
