import React, { useState, useRef, useCallback, useEffect } from 'react';
import { render, Box, Text, useInput } from 'ink';
import { ChatPanel } from './components/ChatPanel.js';
import { Sidebar } from './components/Sidebar.js';
import { InputBar } from './components/InputBar.js';
import { StatusBar } from './components/StatusBar.js';
import { ApiClient } from './services/api.js';
import { FileService } from './services/files.js';
import { ShellService } from './services/shell.js';
import { CodebaseService } from './services/codebase.js';
import { KEY_BINDINGS } from './config/keyBindings.js';
import { spawn } from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

export interface Message {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: number;
	loading?: boolean;
}

interface Task {
	id: string;
	name: string;
	status: 'running' | 'completed' | 'failed';
	startTime: number;
}

const AVAILABLE_MODELS = [
	'kimi-k2.5-free',
	'minimax-m2.5-free',
	'big-pickle',
];

const buildWelcomeMessage = (activeModel: string): string => {
	const shortcuts = KEY_BINDINGS.map((b) => {
		const modifier = b.ctrl ? 'Ctrl+' : b.meta ? 'Alt+' : '';
		return `  ${modifier}${b.key.padEnd(6)} - ${b.description}`;
	}).join('\n');

	return `Welcome to Sheikh CLI! An agentic coding tool for Termux.

I can help you:
• Read, edit, write files
• Search with glob/grep
• Execute shell commands
• Understand your codebase

Available Models:
${AVAILABLE_MODELS.map((m) => `• ${m}${m === activeModel ? ' (active)' : ''}`).join('\n')}

Keyboard Shortcuts:
${shortcuts}

Commands:
  read <file>           - Read file content
  write <path> <content> - Write to file
  glob <pattern>        - Find files
  grep <pattern> [path] - Search in files
  run <cmd>             - Execute shell command
  cd <dir>              - Change directory
  ls [dir]              - List directory
  clear                 - Clear chat
  help                  - Show this help

What would you like me to help with?`;
};

interface Props {
	apiKey?: string;
	model?: string;
}

const App: React.FC<Props> = ({ apiKey, model: initialModel = 'kimi-k2.5-free' }) => {
	const [model, setModel] = useState(initialModel);
	const [messages, setMessages] = useState<Message[]>([
		{
			id: '1',
			role: 'assistant',
			content: buildWelcomeMessage(initialModel),
			timestamp: Date.now(),
		},
	]);
	const [input, setInput] = useState('');
	const [isProcessing, setIsProcessing] = useState(false);
	const [selectedPanel, setSelectedPanel] = useState<'chat' | 'files'>('chat');
	const [currentDir, setCurrentDir] = useState(process.cwd());
	const [commandHistory, setCommandHistory] = useState<string[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [verbose, setVerbose] = useState(false);
	const [gitBranch, setGitBranch] = useState('');
	const [showTaskList, setShowTaskList] = useState(false);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [backgroundProcesses, setBackgroundProcesses] = useState<{id: string, command: string, process: any}[]>([]);
	const inputRef = useRef(input);

	const api = new ApiClient(apiKey || '');
	const fileService = new FileService();
	const shellService = new ShellService();
	const codebaseService = new CodebaseService(currentDir);

	shellService.getGitBranch(currentDir).then(setGitBranch).catch(() => setGitBranch('N/A'));

	const processCommand = async (cmd: string): Promise<string> => {
		const trimmed = cmd.trim();
		const args = trimmed.split(/\s+/);
		const command = args[0].toLowerCase();
		const rest = args.slice(1).join(' ');

		try {
			switch (command) {
				case 'read': {
					const content = await fileService.readFile(rest);
					return `File: ${rest}\n\`\`\`\n${content}\n\`\`\``;
				}
				case 'write': {
					const match = rest.match(/^(\S+)\s+(.+)$/s);
					if (!match) return 'Usage: write <path> <content>';
					const [, path, content] = match;
					await fileService.writeFile(path, content);
					return `✓ Written to ${path}`;
				}
				case 'glob': {
					const files = await codebaseService.glob(rest || '*');
					return files.length > 0 ? files.map((f) => `• ${f}`).join('\n') : 'No files found';
				}
				case 'grep': {
					const parts = rest.split(/\s+/);
					if (parts.length < 2) return 'Usage: grep <pattern> [path]';
					const results = await codebaseService.grep(parts[0], parts[1] || '.');
					return results.length > 0
						? results.slice(0, 20).map((r) => `${r.file}:${r.line}: ${r.content}`).join('\n')
						: 'No matches found';
				}
				case 'run': {
					const result = await shellService.run(rest, currentDir);
					return result;
				}
				case 'cd': {
					const newDir = await shellService.changeDirectory(rest || process.env.HOME || '/');
					setCurrentDir(newDir);
					const branch = await shellService.getGitBranch(newDir);
					setGitBranch(branch);
					return `Changed directory to ${newDir}`;
				}
				case 'ls': {
					const files = await shellService.listDirectory(rest || currentDir);
					return files;
				}
				case 'clear':
					setMessages([]);
					return '';
				case 'help':
					return `Commands:
• read <file> - Read file
• write <path> <content> - Write file
• glob <pattern> - Find files
• grep <pattern> [path] - Search
• run <cmd> - Execute command
• cd <dir> - Change directory
• ls [dir] - List directory
• clear - Clear chat
• help - Show this`;
				default:
					return `Unknown: ${command}. Type "help" for commands.`;
			}
		} catch (error) {
			return `Error: ${error instanceof Error ? error.message : String(error)}`;
		}
	};

	const sendMessage = async (content: string) => {
		const userMessage: Message = {
			id: Date.now().toString(),
			role: 'user',
			content,
			timestamp: Date.now(),
		};
		setMessages((prev) => [...prev, userMessage]);
		setInput('');
		inputRef.current = '';
		setIsProcessing(true);

		const assistantMessage: Message = {
			id: (Date.now() + 1).toString(),
			role: 'assistant',
			content: '',
			timestamp: Date.now(),
			loading: true,
		};
		setMessages((prev) => [...prev, assistantMessage]);

		try {
			const isCommand = content.startsWith('/') || 
				['read', 'write', 'glob', 'grep', 'run', 'cd', 'ls', 'clear', 'help'].includes(content.split(' ')[0]);
			
			if (verbose) console.log('[Verbose] Processing:', isCommand ? 'command' : 'chat');
			
			if (isCommand) {
				const result = await processCommand(content);
				setMessages((prev) =>
					prev.map((m) =>
						m.id === assistantMessage.id ? { ...m, content: result, loading: false } : m
					)
				);
			} else {
				const context = await buildContext();
				if (verbose) console.log('[Verbose] Context:', context.slice(0, 200));
				const response = await api.chat([...messages, userMessage], model, context);
				setMessages((prev) =>
					prev.map((m) =>
						m.id === assistantMessage.id ? { ...m, content: response, loading: false } : m
					)
				);
			}
		} catch (error) {
			setMessages((prev) =>
				prev.map((m) =>
					m.id === assistantMessage.id
						? { ...m, content: `Error: ${error instanceof Error ? error.message : String(error)}`, loading: false }
						: m
				)
			);
		} finally {
			setIsProcessing(false);
		}
	};

	const buildContext = async (): Promise<string> => {
		const files = await codebaseService.glob('**/*.{ts,tsx,js,jsx,json,md}', 20);
		const dir = await shellService.listDirectory(currentDir);
		const gitStatus = await shellService.getGitStatus(currentDir);
		return `Directory: ${currentDir}
Git: ${gitBranch}
Files (${files.length}): ${files.slice(0, 15).join(', ')}${files.length > 15 ? '...' : ''}
LS:\n${dir}
Git: ${gitStatus}`;
	};

	const openInEditor = async () => {
		const tmpFile = path.join(os.tmpdir(), `opencode-${Date.now()}.txt`);
		fs.writeFileSync(tmpFile, inputRef.current || '');
		const editor = process.env.EDITOR || 'nano';
		
		const child = spawn(editor, [tmpFile], {
			stdio: 'inherit',
			detached: true
		});
		
		child.on('exit', () => {
			const content = fs.readFileSync(tmpFile, 'utf-8');
			setInput(content);
			inputRef.current = content;
			fs.unlinkSync(tmpFile);
		});
	};

	const switchModel = () => {
		const currentIndex = AVAILABLE_MODELS.indexOf(model);
		const nextIndex = (currentIndex + 1) % AVAILABLE_MODELS.length;
		const newModel = AVAILABLE_MODELS[nextIndex];
		setModel(newModel);
		
		const systemMessage: Message = {
			id: Date.now().toString(),
			role: 'system',
			content: `Switched to model: ${newModel}`,
			timestamp: Date.now(),
		};
		setMessages((prev) => [...prev, systemMessage]);
	};

	const runBackground = async (command: string) => {
		const taskId = Date.now().toString();
		const task: Task = {
			id: taskId,
			name: command,
			status: 'running',
			startTime: Date.now(),
		};
		setTasks((prev) => [...prev, task]);
		
		const result = await shellService.run(command, currentDir);
		
		setTasks((prev) =>
			prev.map((t) =>
				t.id === taskId ? { ...t, status: result.startsWith('Error') ? 'failed' : 'completed' } : t
			)
		);
		
		const systemMessage: Message = {
			id: (Date.now() + 1).toString(),
			role: 'system',
			content: `Background task completed: ${command}\n${result.slice(0, 200)}`,
			timestamp: Date.now(),
		};
		setMessages((prev) => [...prev, systemMessage]);
	};

	useInput((input, key) => {
		const ctrl = key.ctrl;
		const meta = key.meta;
		
		if (ctrl && input === 'c') {
			setInput('');
			inputRef.current = '';
			setIsProcessing(false);
		} else if (ctrl && input === 'l') {
			setMessages([]);
		} else if (ctrl && input === 'o') {
			setVerbose((v) => !v);
		} else if (ctrl && input === 'r') {
			setInput('> ');
			inputRef.current = '> ';
		} else if (ctrl && input === 'g') {
			openInEditor();
		} else if (ctrl && input === 't') {
			setShowTaskList((v) => !v);
		} else if (ctrl && input === 'b') {
			const cmd = inputRef.current || input;
			if (cmd.trim()) {
				runBackground(cmd);
				setInput('');
				inputRef.current = '';
			}
		} else if (key.tab) {
			setSelectedPanel((prev) => (prev === 'chat' ? 'files' : 'chat'));
		} else if (key.upArrow) {
			if (historyIndex < commandHistory.length - 1) {
				const newIndex = historyIndex + 1;
				setHistoryIndex(newIndex);
				setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
			}
		} else if (key.downArrow) {
			if (historyIndex > 0) {
				const newIndex = historyIndex - 1;
				setHistoryIndex(newIndex);
				setInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
			} else if (historyIndex === 0) {
				setHistoryIndex(-1);
				setInput('');
			}
		} else if (meta && input === 'p') {
			switchModel();
		}
	});

	const handleSubmit = () => {
		const cmd = inputRef.current || input;
		if (cmd.trim() && !isProcessing) {
			setCommandHistory((prev) => [...prev, cmd]);
			setHistoryIndex(-1);
			sendMessage(cmd);
		}
	};

	const handleInputChange = (value: string) => {
		setInput(value);
		inputRef.current = value;
	};

	const dirName = currentDir.split('/').pop() || currentDir;

	return (
		<Box flexDirection="column" height={100}>
			<Box flexDirection="row" flexGrow={1}>
				<Box width={28} borderColor="cyan" borderStyle="round">
					<Sidebar
						messages={messages}
						selected={selectedPanel === 'files'}
						gitBranch={gitBranch}
					/>
				</Box>
				<Box flexDirection="column" flexGrow={1}>
					<ChatPanel
						messages={messages}
						selected={selectedPanel === 'chat'}
					/>
					<InputBar
						value={input}
						onChange={handleInputChange}
						onSubmit={handleSubmit}
						isProcessing={isProcessing}
						currentDir={dirName}
					/>
				</Box>
			</Box>
			<StatusBar
				model={model}
				isProcessing={isProcessing}
				messageCount={messages.length}
				verbose={verbose}
				currentDir={currentDir}
				showTaskList={showTaskList}
				taskCount={tasks.length}
			/>
		</Box>
	);
};

export default App;
