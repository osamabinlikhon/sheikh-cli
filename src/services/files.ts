import * as fs from 'fs/promises';
import * as path from 'path';

export class FileService {
	async readFile(filePath: string): Promise<string> {
		const resolvedPath = path.resolve(filePath);
		try {
			const content = await fs.readFile(resolvedPath, 'utf-8');
			return content;
		} catch (error) {
			throw new Error(`Failed to read file: ${resolvedPath} - ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	async writeFile(filePath: string, content: string): Promise<void> {
		const resolvedPath = path.resolve(filePath);
		const dir = path.dirname(resolvedPath);
		try {
			await fs.mkdir(dir, { recursive: true });
			await fs.writeFile(resolvedPath, content, 'utf-8');
		} catch (error) {
			throw new Error(`Failed to write file: ${resolvedPath} - ${error instanceof Error ? error.message : String(error)}`);
		}
	}
}
