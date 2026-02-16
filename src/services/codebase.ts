import * as fs from 'fs/promises';
import * as path from 'path';

export interface GrepResult {
	file: string;
	line: number;
	content: string;
}

export class CodebaseService {
	private rootDir: string;

	constructor(rootDir: string = process.cwd()) {
		this.rootDir = rootDir;
	}

	async glob(pattern: string, maxFiles: number = 100): Promise<string[]> {
		const results: string[] = [];
		
		const walkDir = async (dir: string, depth: number = 0): Promise<void> => {
			if (results.length >= maxFiles) return;
			if (depth > 10) return;

			try {
				const entries = await fs.readdir(dir, { withFileTypes: true });
				
				for (const entry of entries) {
					if (results.length >= maxFiles) break;
					
					const fullPath = path.join(dir, entry.name);
					
					if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') {
						continue;
					}

					if (entry.isDirectory()) {
						await walkDir(fullPath, depth + 1);
					} else if (entry.isFile()) {
						const relativePath = path.relative(this.rootDir, fullPath);
						
						if (this.matchPattern(relativePath, pattern)) {
							results.push(relativePath);
						}
					}
				}
			} catch {
				// Skip inaccessible directories
			}
		};

		await walkDir(this.rootDir);
		return results;
	}

	private matchPattern(filePath: string, pattern: string): boolean {
		if (pattern === '*' || pattern === '') return true;
		
		const regexPattern = pattern
			.replace(/\./g, '\\.')
			.replace(/\*\*/g, '.*')
			.replace(/\*/g, '[^/]*')
			.replace(/\?/g, '.');
		
		const regex = new RegExp(`^${regexPattern}$`, 'i');
		return regex.test(filePath);
	}

	async grep(searchPattern: string, searchPath: string = '.', maxResults: number = 50): Promise<GrepResult[]> {
		const results: GrepResult[] = [];
		const searchDir = path.resolve(searchPath);

		const walkAndGrep = async (dir: string, depth: number = 0): Promise<void> => {
			if (results.length >= maxResults) return;
			if (depth > 10) return;

			try {
				const entries = await fs.readdir(dir, { withFileTypes: true });

				for (const entry of entries) {
					if (results.length >= maxResults) break;

					const fullPath = path.join(dir, entry.name);

					if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') {
						continue;
					}

					if (entry.isDirectory()) {
						await walkAndGrep(fullPath, depth + 1);
					} else if (entry.isFile() && this.isTextFile(entry.name)) {
						try {
							const content = await fs.readFile(fullPath, 'utf-8');
							const lines = content.split('\n');
							
							const regex = new RegExp(searchPattern, 'i');
							
							lines.forEach((line, index) => {
								if (results.length >= maxResults) return;
								if (regex.test(line)) {
									results.push({
										file: path.relative(this.rootDir, fullPath),
										line: index + 1,
										content: line.trim(),
									});
								}
							});
						} catch {
							// Skip binary files
						}
					}
				}
			} catch {
				// Skip inaccessible directories
			}
		};

		await walkAndGrep(searchDir);
		return results;
	}

	private isTextFile(filename: string): boolean {
		const textExtensions = [
			'.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt',
			'.html', '.css', '.scss', '.yaml', '.yml', '.xml',
			'.py', '.rb', '.go', '.rs', '.java', '.c', '.cpp', '.h',
			'.sh', '.bash', '.sql', '.graphql',
		];
		const ext = path.extname(filename).toLowerCase();
		return textExtensions.includes(ext);
	}
}
