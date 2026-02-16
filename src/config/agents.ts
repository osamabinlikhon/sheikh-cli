export type AgentCapability = 'read' | 'write' | 'execute' | 'analyze' | 'review' | 'test' | 'debug';

export interface AgentTool {
	toolId: string;
	enabled: boolean;
	config?: Record<string, unknown>;
}

export interface Agent {
	id: string;
	name: string;
	description: string;
	capabilities: AgentCapability[];
	tools: AgentTool[];
	model?: string;
	systemPrompt?: string;
	maxIterations: number;
	timeout: number;
}

export const AGENTS: Agent[] = [
	{
		id: 'code-reviewer',
		name: 'Code Reviewer',
		description: 'Reviews code for issues, bugs, and improvements',
		capabilities: ['read', 'analyze', 'review'],
		tools: [
			{ toolId: 'read_file', enabled: true },
			{ toolId: 'glob_files', enabled: true },
			{ toolId: 'grep_search', enabled: true },
			{ toolId: 'git_log', enabled: true },
		],
		systemPrompt: 'You are a code reviewer. Analyze code for bugs, security issues, and best practices. Provide constructive feedback.',
		maxIterations: 10,
		timeout: 300000,
	},
	{
		id: 'bug-hunter',
		name: 'Bug Hunter',
		description: 'Finds and fixes bugs in code',
		capabilities: ['read', 'write', 'analyze', 'debug'],
		tools: [
			{ toolId: 'read_file', enabled: true },
			{ toolId: 'write_file', enabled: true },
			{ toolId: 'grep_search', enabled: true },
			{ toolId: 'run_command', enabled: true, config: { allowedCommands: ['npm test', 'npm run', 'pytest', 'cargo test'] } },
		],
		systemPrompt: 'You are a bug hunter. Find the root cause of bugs and fix them. Run tests to verify fixes.',
		maxIterations: 15,
		timeout: 300000,
	},
	{
		id: 'test-generator',
		name: 'Test Generator',
		description: 'Generates tests for code',
		capabilities: ['read', 'write', 'analyze', 'test'],
		tools: [
			{ toolId: 'read_file', enabled: true },
			{ toolId: 'glob_files', enabled: true },
			{ toolId: 'write_file', enabled: true },
			{ toolId: 'run_command', enabled: true },
		],
		systemPrompt: 'You are a test generator. Write comprehensive tests for the provided code. Follow testing best practices.',
		maxIterations: 8,
		timeout: 180000,
	},
	{
		id: 'refactorer',
		name: 'Refactorer',
		description: 'Refactors code for better readability and performance',
		capabilities: ['read', 'write', 'analyze'],
		tools: [
			{ toolId: 'read_file', enabled: true },
			{ toolId: 'write_file', enabled: true },
			{ toolId: 'glob_files', enabled: true },
			{ toolId: 'analyze_codebase', enabled: true },
		],
		systemPrompt: 'You are a refactoring expert. Improve code structure, reduce duplication, and enhance performance while maintaining functionality.',
		maxIterations: 12,
		timeout: 240000,
	},
	{
		id: 'explainer',
		name: 'Explainer',
		description: 'Explains code and provides documentation',
		capabilities: ['read', 'analyze'],
		tools: [
			{ toolId: 'read_file', enabled: true },
			{ toolId: 'glob_files', enabled: true },
			{ toolId: 'grep_search', enabled: true },
			{ toolId: 'analyze_codebase', enabled: true },
		],
		systemPrompt: 'You are a code explainer. Explain code in simple terms. Provide documentation and comments where helpful.',
		maxIterations: 5,
		timeout: 60000,
	},
	{
		id: 'general',
		name: 'General Assistant',
		description: 'General purpose coding assistant',
		capabilities: ['read', 'write', 'execute', 'analyze', 'review', 'test', 'debug'],
		tools: [
			{ toolId: 'read_file', enabled: true },
			{ toolId: 'write_file', enabled: true },
			{ toolId: 'glob_files', enabled: true },
			{ toolId: 'grep_search', enabled: true },
			{ toolId: 'run_command', enabled: true },
			{ toolId: 'git_status', enabled: true },
			{ toolId: 'git_log', enabled: true },
			{ toolId: 'analyze_codebase', enabled: true },
			{ toolId: 'list_directory', enabled: true },
		],
		systemPrompt: 'You are a helpful coding assistant. Help with reading, writing, and understanding code. Execute commands when needed.',
		maxIterations: 20,
		timeout: 600000,
	},
];

export const getAgent = (id: string): Agent | undefined => {
	return AGENTS.find((a) => a.id === id);
};

export const getAgentsByCapability = (capability: AgentCapability): Agent[] => {
	return AGENTS.filter((a) => a.capabilities.includes(capability));
};

export const getAgentNames = (): string[] => {
	return AGENTS.map((a) => a.id);
};
