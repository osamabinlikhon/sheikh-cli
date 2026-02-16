import * as process from 'process';

export interface CLIOptions {
	debug: boolean;
	version: boolean;
	help: boolean;
	model: string;
	prompt: string;
	promptInteractive: string;
	sandbox: boolean;
	approvalMode: 'default' | 'auto_edit' | 'yolo';
	yolo: boolean;
	experimentalACP: boolean;
	experimentalZedIntegration: boolean;
	allowedMcpServerNames: string[];
	allowedTools: string[];
	extensions: string[];
	listExtensions: boolean;
	resume: string;
	listSessions: boolean;
	deleteSession: string;
	includeDirectories: string[];
	screenReader: boolean;
	outputFormat: 'text' | 'json' | 'stream-json';
}

export const DEFAULT_OPTIONS: CLIOptions = {
	debug: false,
	version: false,
	help: false,
	model: 'auto',
	prompt: '',
	promptInteractive: '',
	sandbox: false,
	approvalMode: 'default',
	yolo: false,
	experimentalACP: false,
	experimentalZedIntegration: false,
	allowedMcpServerNames: [],
	allowedTools: [],
	extensions: [],
	listExtensions: false,
	resume: '',
	listSessions: false,
	deleteSession: '',
	includeDirectories: [],
	screenReader: false,
	outputFormat: 'text',
};

export function parseCLIArgs(args: string[] = process.argv.slice(2)): CLIOptions {
	const options: CLIOptions = { ...DEFAULT_OPTIONS };
	
	const knownAliases: Record<string, keyof CLIOptions> = {
		'-d': 'debug',
		'--debug': 'debug',
		'-v': 'version',
		'--version': 'version',
		'-h': 'help',
		'--help': 'help',
		'-m': 'model',
		'--model': 'model',
		'-p': 'prompt',
		'--prompt': 'prompt',
		'-i': 'promptInteractive',
		'--prompt-interactive': 'promptInteractive',
		'-s': 'sandbox',
		'--sandbox': 'sandbox',
		'-y': 'yolo',
		'--yolo': 'yolo',
		'-r': 'resume',
		'--resume': 'resume',
		'-l': 'listExtensions',
		'--list-extensions': 'listExtensions',
		'-e': 'extensions',
		'--extensions': 'extensions',
		'-o': 'outputFormat',
		'--output-format': 'outputFormat',
		'--approval-mode': 'approvalMode',
		'--experimental-acp': 'experimentalACP',
		'--experimental-zed-integration': 'experimentalZedIntegration',
		'--allowed-mcp-server-names': 'allowedMcpServerNames',
		'--allowed-tools': 'allowedTools',
		'--list-sessions': 'listSessions',
		'--delete-session': 'deleteSession',
		'--include-directories': 'includeDirectories',
		'--screen-reader': 'screenReader',
	};

	let i = 0;
	while (i < args.length) {
		const arg = args[i];
		const optionKey = knownAliases[arg];

		if (optionKey) {
			const nextArg = args[i + 1];
			
			if (typeof options[optionKey] === 'boolean') {
				(options as unknown as Record<string, unknown>)[optionKey] = true;
				i++;
			} else if (Array.isArray(options[optionKey])) {
				if (nextArg && !nextArg.startsWith('-')) {
					const arr = nextArg.split(',').map(s => s.trim());
					(options as unknown as Record<string, unknown>)[optionKey] = arr;
					i += 2;
				} else {
					i++;
				}
			} else if (nextArg && !nextArg.startsWith('-')) {
				(options as unknown as Record<string, unknown>)[optionKey] = nextArg;
				i += 2;
			} else {
				i++;
			}
		} else if (arg.startsWith('--')) {
			i++;
		} else if (arg.startsWith('-')) {
			for (const char of arg.slice(1)) {
				if (char === 'd') options.debug = true;
				else if (char === 'v') options.version = true;
				else if (char === 'h') options.help = true;
				else if (char === 'y') options.yolo = true;
				else if (char === 'l') options.listExtensions = true;
				else if (char === 's') options.sandbox = true;
			}
			i++;
		} else {
			i++;
		}
	}

	if (options.yolo) {
		options.approvalMode = 'yolo';
	}

	return options;
}

export function printHelp(): void {
	console.log(`
Sheikh CLI - AI-Powered Coding Assistant

Usage: sheikh [options] [prompt]

Options:
  -d, --debug                    Run in debug mode with verbose logging
  -v, --version                  Show CLI version number and exit
  -h, --help                     Show help information
  -m, --model <model>           Model to use (default: auto)
  -p, --prompt <text>           Prompt text
  -i, --prompt-interactive      Execute prompt and continue in interactive mode
  -s, --sandbox                 Run in sandboxed environment
      --approval-mode <mode>     Approval mode: default, auto_edit, yolo
  -y, --yolo                    Auto-approve all actions
      --experimental-acp         Start in ACP mode (experimental)
      --experimental-zed-integration  Run in Zed editor integration mode
      --allowed-mcp-server-names <names>  Allowed MCP servers
      --allowed-tools <tools>    Tools allowed without confirmation
  -e, --extensions <exts>       Extensions to use
  -l, --list-extensions         List available extensions
  -r, --resume <session>        Resume previous session (use "latest" or index)
      --list-sessions           List available sessions
      --delete-session <index>  Delete a session
      --include-dirs <dirs>     Additional directories
      --screen-reader           Enable screen reader mode
  -o, --output-format <fmt>    Output format: text, json, stream-json

Examples:
  sheikh "Hello, help me write a function"
  sheikh -m minimax-m2.5-free --debug
  sheikh --resume latest
  sheikh --sandbox "Analyze this code"
`);
}

export function printVersion(): void {
	console.log('Sheikh CLI v1.0.0');
}
