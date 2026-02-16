import { execSync } from 'child_process';
import * as path from 'path';

export class ShellService {
	async run(command: string, cwd: string): Promise<string> {
		try {
			const result = execSync(command, { 
				cwd, 
				encoding: 'utf-8',
				maxBuffer: 10 * 1024 * 1024 
			});
			return result || 'Command executed';
		} catch (error) {
			const err = error as any;
			return `Error: ${err.stderr || err.message || 'Failed'}`;
		}
	}

	async changeDirectory(dir: string): Promise<string> {
		const resolvedPath = path.resolve(dir);
		try {
			execSync(`cd "${resolvedPath}"`, { stdio: 'ignore' });
			return resolvedPath;
		} catch {
			throw new Error(`Failed to change directory: ${resolvedPath}`);
		}
	}

	async listDirectory(dir: string): Promise<string> {
		try {
			const result = execSync(`ls -la "${dir}"`, { encoding: 'utf-8' });
			return result;
		} catch (error) {
			return `Error: ${error instanceof Error ? error.message : String(error)}`;
		}
	}

	async getGitStatus(cwd: string): Promise<string> {
		try {
			const result = execSync('git status --short', { cwd, encoding: 'utf-8' });
			return result || 'No changes';
		} catch {
			return 'Not a git repo';
		}
	}

	async getGitBranch(cwd: string): Promise<string> {
		try {
			const result = execSync('git branch --show-current', { cwd, encoding: 'utf-8' });
			return result.trim() || 'unknown';
		} catch {
			return 'N/A';
		}
	}
}
