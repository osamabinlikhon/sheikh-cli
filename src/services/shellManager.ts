import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

export interface ShellProcess {
	id: string;
	command: string;
	args: string[];
	cwd: string;
	pid: number;
	startedAt: number;
	status: 'running' | 'completed' | 'failed';
	exitCode?: number;
	proc: ChildProcess;
	output: string[];
}

export class ShellManager extends EventEmitter {
	private shells: Map<string, ShellProcess> = new Map();
	private shellCounter = 0;

	constructor() {
		super();
	}

	runCommand(command: string, cwd: string = process.cwd()): string {
		const id = `shell-${++this.shellCounter}`;
		const [cmd, ...args] = command.split(' ');
		
		const proc = spawn(cmd, args, {
			cwd,
			stdio: ['pipe', 'pipe', 'pipe'],
			detached: false,
		});

		const shell: ShellProcess = {
			id,
			command: cmd,
			args,
			cwd,
			pid: proc.pid || 0,
			startedAt: Date.now(),
			status: 'running',
			output: [],
			proc,
		};

		this.shells.set(id, shell);

		proc.stdout?.on('data', (data: Buffer) => {
			const text = data.toString();
			shell.output.push(text);
			this.emit('output', id, text);
		});

		proc.stderr?.on('data', (data: Buffer) => {
			const text = data.toString();
			shell.output.push(`[stderr] ${text}`);
			this.emit('error', id, text);
		});

		proc.on('exit', (code) => {
			shell.status = code === 0 ? 'completed' : 'failed';
			shell.exitCode = code ?? undefined;
			this.emit('exit', id, code);
		});

		return id;
	}

	runBackground(command: string, cwd: string = process.cwd()): string {
		const id = `bg-${++this.shellCounter}`;
		const [cmd, ...args] = command.split(' ');
		
		const proc = spawn(cmd, args, {
			cwd,
			detached: true,
			stdio: 'ignore',
		});

		proc.unref();

		const shell: ShellProcess = {
			id,
			command: cmd,
			args,
			cwd,
			pid: proc.pid || 0,
			startedAt: Date.now(),
			status: 'running',
			output: [],
			proc,
		};

		this.shells.set(id, shell);

		setTimeout(() => {
			if (shell.status === 'running') {
				shell.status = 'completed';
				this.emit('exit', id, 0);
			}
		}, 1000);

		return id;
	}

	getShell(id: string): ShellProcess | undefined {
		return this.shells.get(id);
	}

	getAllShells(): ShellProcess[] {
		return Array.from(this.shells.values());
	}

	getRunningShells(): ShellProcess[] {
		return this.getAllShells().filter(s => s.status === 'running');
	}

	killShell(id: string): boolean {
		const shell = this.shells.get(id);
		if (shell && shell.status === 'running') {
			shell.proc.kill();
			shell.status = 'failed';
			shell.exitCode = -1;
			return true;
		}
		return false;
	}

	clearShell(id: string): boolean {
		return this.shells.delete(id);
	}

	clearAll(): void {
		for (const shell of this.shells.values()) {
			if (shell.status === 'running') {
				shell.proc.kill();
			}
		}
		this.shells.clear();
	}

	clearCompleted(): void {
		for (const [id, shell] of this.shells.entries()) {
			if (shell.status !== 'running') {
				this.shells.delete(id);
			}
		}
	}

	getShellOutput(id: string): string[] {
		return this.shells.get(id)?.output || [];
	}

	formatShellList(): string {
		const shells = this.getAllShells();
		if (shells.length === 0) {
			return 'No background shells running.';
		}

		let output = 'Background Shells:\n';
		output += '─'.repeat(60) + '\n';
		
		for (const shell of shells) {
			const duration = Date.now() - shell.startedAt;
			const durationStr = this.formatDuration(duration);
			const statusIcon = shell.status === 'running' ? '●' : shell.status === 'completed' ? '✓' : '✗';
			
			output += `${statusIcon} [${shell.id}] ${shell.command} ${shell.args.join(' ')}\n`;
			output += `   PID: ${shell.pid} | Duration: ${durationStr} | Exit: ${shell.exitCode ?? 'N/A'}\n`;
			output += '─'.repeat(60) + '\n';
		}

		return output;
	}

	private formatDuration(ms: number): string {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);

		if (hours > 0) return `${hours}h ${minutes % 60}m`;
		if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
		return `${seconds}s`;
	}
}

export const shellManager = new ShellManager();
