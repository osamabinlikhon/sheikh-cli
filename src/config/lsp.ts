export interface LSPServer {
	id: string;
	name: string;
	command: string;
	args: string[];
	filetypes: string[];
	rootPatterns: string[];
	settings?: Record<string, unknown>;
	env?: Record<string, string>;
}

export const LSP_SERVERS: LSPServer[] = [
	{
		id: 'typescript',
		name: 'TypeScript',
		command: 'typescript-language-server',
		args: ['--stdio'],
		filetypes: ['typescript', 'javascript', 'javascriptreact', 'typescriptreact'],
		rootPatterns: ['tsconfig.json', 'jsconfig.json', 'package.json'],
	},
	{
		id: 'pyright',
		name: 'Pyright (Python)',
		command: 'pyright-langserver',
		args: ['--stdio'],
		filetypes: ['python'],
		rootPatterns: ['pyproject.toml', 'setup.py', 'requirements.txt', '.git'],
	},
	{
		id: 'rust_analyzer',
		name: 'Rust Analyzer',
		command: 'rust-analyzer',
		args: [],
		filetypes: ['rust'],
		rootPatterns: ['Cargo.toml', '.git'],
	},
	{
		id: 'gopls',
		name: 'Go Language Server',
		command: 'gopls',
		args: [],
		filetypes: ['go'],
		rootPatterns: ['go.mod', '.git'],
	},
	{
		id: 'jedi_language_server',
		name: 'Jedi (Python)',
		command: 'jedi-language-server',
		args: [],
		filetypes: ['python'],
		rootPatterns: ['pyproject.toml', 'setup.py', '.git'],
	},
	{
		id: 'clangd',
		name: 'Clangd (C/C++)',
		command: 'clangd',
		args: [],
		filetypes: ['c', 'cpp', 'objc', 'objcpp'],
		rootPatterns: ['compile_commands.json', '.git', 'CMakeLists.txt'],
	},
	{
		id: 'html',
		name: 'HTML Language Server',
		command: 'vscode-html-language-server',
		args: ['--stdio'],
		filetypes: ['html', 'handlebars', 'razor'],
		rootPatterns: ['.git'],
	},
	{
		id: 'css',
		name: 'CSS Language Server',
		command: 'vscode-css-language-server',
		args: ['--stdio'],
		filetypes: ['css', 'scss', 'less'],
		rootPatterns: ['.git'],
	},
	{
		id: 'json',
		name: 'JSON Language Server',
		command: 'vscode-json-language-server',
		args: ['--stdio'],
		filetypes: ['json', 'jsonc'],
		rootPatterns: ['.git', 'package.json'],
	},
	{
		id: 'yaml',
		name: 'YAML Language Server',
		command: 'yaml-language-server',
		args: ['--stdio'],
		filetypes: ['yaml', 'yml'],
		rootPatterns: ['.git'],
	},
	{
		id: 'dockerfile',
		name: 'Dockerfile Language Server',
		command: 'dockerfile-language-server',
		args: ['--stdio'],
		filetypes: ['dockerfile'],
		rootPatterns: ['Dockerfile', '.git'],
	},
	{
		id: 'bash',
		name: 'Bash Language Server',
		command: 'bash-language-server',
		args: ['start'],
		filetypes: ['sh', 'bash', 'zsh'],
		rootPatterns: ['.git', '.bashrc', '.zshrc'],
	},
	{
		id: 'vue',
		name: 'Vue Language Server',
		command: 'volar',
		args: ['--stdio'],
		filetypes: ['vue'],
		rootPatterns: ['package.json', 'vite.config.ts', '.git'],
	},
	{
		id: 'svelte',
		name: 'Svelte Language Server',
		command: 'svelte-language-server',
		args: ['--stdio'],
		filetypes: ['svelte'],
		rootPatterns: ['package.json', '.git'],
	},
];

export const getLSPForFiletype = (filetype: string): LSPServer[] => {
	return LSP_SERVERS.filter((s) => s.filetypes.includes(filetype));
};

export const getLSPForLanguage = (language: string): LSPServer | undefined => {
	return LSP_SERVERS.find((s) => s.id === language);
};

export const getAllLSPIds = (): string[] => {
	return LSP_SERVERS.map((s) => s.id);
};
