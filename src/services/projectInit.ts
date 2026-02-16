import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

export type ProjectTemplate = 'node' | 'python' | 'go' | 'rust' | 'typescript' | 'react' | 'generic';

export interface ProjectConfig {
	name: string;
	template: ProjectTemplate;
	description?: string;
	author?: string;
	license?: string;
	git: boolean;
	install: boolean;
}

export interface AutoDetectedInfo {
	projectType: string | null;
	packageManager: 'npm' | 'yarn' | 'pnpm' | 'pip' | 'poetry' | 'cargo' | 'go' | null;
	hasGit: boolean;
	termuxStorage: boolean;
}

class ProjectInitializer {
	private templateConfigs: Record<ProjectTemplate, Partial<ProjectConfig>> = {
		node: {
			description: 'Node.js project',
			license: 'MIT',
		},
		typescript: {
			description: 'TypeScript project',
			license: 'MIT',
		},
		react: {
			description: 'React application',
			license: 'MIT',
		},
		python: {
			description: 'Python project',
			license: 'MIT',
		},
		go: {
			description: 'Go project',
			license: 'MIT',
		},
		rust: {
			description: 'Rust project',
			license: 'MIT',
		},
		generic: {
			description: 'Generic project',
			license: 'MIT',
		},
	};

	async init(config: ProjectConfig): Promise<void> {
		const cwd = process.cwd();
		const projectPath = path.join(cwd, config.name);

		if (fs.existsSync(projectPath)) {
			throw new Error(`Directory ${config.name} already exists`);
		}

		fs.mkdirSync(projectPath, { recursive: true });
		process.chdir(projectPath);

		this.createProjectFiles(config);
		this.createSheikhConfig();
		await this.createGitRepo(config.git);

		if (config.install) {
			this.runInstall(config.template);
		}

		console.log(`\n✅ Project ${config.name} created successfully!\n`);
		console.log(`   Template: ${config.template}`);
		console.log(`   Location: ${projectPath}\n`);
		console.log(`   Next steps:`);
		console.log(`   cd ${config.name}`);
		console.log(`   sheikh\n`);
	}

	private createProjectFiles(config: ProjectConfig): void {
		const template = this.templateConfigs[config.template];

		const packageJson: Record<string, unknown> = {
			name: config.name,
			version: '0.1.0',
			description: config.description || template.description,
			author: config.author || '',
			license: config.license || template.license,
			main: 'index.js',
			scripts: this.getScripts(config.template),
			keywords: [],
		};

		if (config.template === 'typescript') {
			packageJson.scripts = {
				build: 'tsc',
				start: 'node dist/index.js',
				dev: 'tsx src/index.ts',
			};
			packageJson.devDependencies = {
				typescript: '^5.0.0',
				'@types/node': '^20.0.0',
				tsx: '^4.0.0',
			};
		}

		if (config.template === 'react') {
			packageJson.scripts = {
				dev: 'vite',
				build: 'vite build',
				preview: 'vite preview',
			};
			packageJson.dependencies = {
				react: '^18.2.0',
				'react-dom': '^18.2.0',
			};
			packageJson.devDependencies = {
				'@vitejs/plugin-react': '^4.0.0',
				vite: '^5.0.0',
				typescript: '^5.0.0',
			};
		}

		if (config.template === 'python') {
			fs.writeFileSync('requirements.txt', '# Add your dependencies here\n');
			fs.writeFileSync('main.py', '#!/usr/bin/env python3\nprint("Hello, World!")\n');
			fs.chmodSync('main.py', '755');
		}

		if (config.template === 'go') {
			fs.writeFileSync('main.go', `package main\n\nfunc main() {\n\tprintln("Hello, World!")\n}\n`);
		}

		if (config.template === 'rust') {
			fs.writeFileSync('src/main.rs', 'fn main() {\n    println!("Hello, World!");\n}\n');
			fs.writeFileSync('Cargo.toml', `[package]\nname = "${config.name}"\nversion = "0.1.0"\nedition = "2021"\n`);
			fs.mkdirSync('src', { recursive: true });
		}

		fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
		fs.writeFileSync('README.md', `# ${config.name}\n\n${config.description || template.description}\n\n## Getting Started\n\n\`\`\`bash\n${this.getInstallCommand(config.template)}\n\`\`\`\n`);
		fs.writeFileSync('.gitignore', this.getGitignore(config.template));
		fs.writeFileSync('LICENSE', this.getLicense(config.license || 'MIT'));
	}

	private getScripts(template: ProjectTemplate): Record<string, string> {
		const scripts: Record<string, string> = {};
		
		switch (template) {
			case 'node':
			case 'typescript':
				scripts.start = 'node index.js';
				scripts.dev = 'node index.js';
				scripts.test = 'echo "No tests specified"';
				break;
			case 'react':
				scripts.dev = 'vite';
				scripts.build = 'vite build';
				break;
			case 'python':
				scripts.start = 'python main.py';
				break;
		}
		
		return scripts;
	}

	private getInstallCommand(template: ProjectTemplate): string {
		switch (template) {
			case 'node':
			case 'typescript':
			case 'react':
				return 'npm install';
			case 'python':
				return 'pip install -r requirements.txt';
			case 'go':
				return 'go run main.go';
			case 'rust':
				return 'cargo run';
			default:
				return 'npm install';
		}
	}

	private runInstall(template: ProjectTemplate): void {
		try {
			switch (template) {
				case 'node':
				case 'typescript':
				case 'react':
					execSync('npm install', { stdio: 'inherit' });
					break;
				case 'python':
					console.log('Run: pip install -r requirements.txt');
					break;
				case 'rust':
					console.log('Run: cargo build');
					break;
			}
		} catch (error) {
			console.warn('Installation failed. Run manually: ' + this.getInstallCommand(template));
		}
	}

	private getGitignore(template: ProjectTemplate): string {
		let ignore = `
node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
`;

		switch (template) {
			case 'python':
				ignore += `
__pycache__/
*.py[cod]
*$py.class
venv/
.venv/
`;
			case 'rust':
				ignore += `
target/
Cargo.lock
`;
			case 'go':
				ignore += `
vendor/
*.exe
`;
		}

		return ignore.trim() + '\n';
	}

	private getLicense(type: string): string {
		const year = new Date().getFullYear();
		return `MIT License

Copyright (c) ${year}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
	}

	private createSheikhConfig(): void {
		const sheikhDir = '.sheikh';
		const settingsDir = path.join(sheikhDir, 'settings');
		const rulesDir = path.join(sheikhDir, 'rules');
		const docsDir = path.join(sheikhDir, 'docs');
		const mcpDir = path.join(sheikhDir, 'mcp');

		fs.mkdirSync(settingsDir, { recursive: true });
		fs.mkdirSync(rulesDir, { recursive: true });
		fs.mkdirSync(docsDir, { recursive: true });
		fs.mkdirSync(mcpDir, { recursive: true });

		fs.writeFileSync(
			path.join(settingsDir, 'project.md'),
			`# Project Settings

This file contains project-specific settings for Sheikh CLI.

## Project Configuration

project_name: "${path.basename(process.cwd())}"
auto_detect: true

## Termux Settings
termux:
  optimize_for_mobile: true
  low_memory_mode: auto
  battery_aware: true

## AI Settings
ai:
  default_model: auto
  context_length: 10000

## MCP Servers
mcp:
  enabled: []
`
		);

		fs.writeFileSync(
			path.join(rulesDir, 'security.md'),
			`# Security Rules

- No hardcoded secrets
- Validate all inputs
- Sanitize file paths
- Use environment variables for secrets
`
		);

		fs.writeFileSync(
			path.join(rulesDir, 'code-style.md'),
			`# Code Style Rules

- Use TypeScript for new code
- Follow existing conventions
- Add types to function signatures
- Keep functions small and focused
`
		);

		fs.writeFileSync(
			path.join(docsDir, 'scopes.md'),
			`# Configuration Scopes

Sheikh CLI uses a hierarchical configuration system:

1. **Managed** - Organization-wide settings
2. **Project** - Settings in \`.sheikh/settings/project.md\`
3. **Local** - Local device settings in \`.sheikh/settings/local.md\`
4. **User** - User settings in \`~/.sheikh/settings/user.md\`
`
		);

		fs.writeFileSync(
			path.join(mcpDir, 'config.md'),
			`# MCP Configuration

## Enabled MCP Servers

Configure MCP servers for this project here.

\`\`\`json
{
  "mcpServers": {}
}
\`\`\`
`
		);
	}

	private async createGitRepo(init: boolean): Promise<void> {
		if (!init) return;

		try {
			if (!fs.existsSync('.git')) {
				execSync('git init', { stdio: 'ignore' });
				execSync('git add .', { stdio: 'ignore' });
				execSync('git commit -m "Initial commit"', { stdio: 'ignore' });
			}
		} catch {
			console.warn('Git initialization failed');
		}
	}

	detect(): AutoDetectedInfo {
		const info: AutoDetectedInfo = {
			projectType: null,
			packageManager: null,
			hasGit: false,
			termuxStorage: false,
		};

		if (fs.existsSync('.git')) {
			info.hasGit = true;
		}

		if (fs.existsSync('package.json')) {
			info.projectType = 'node';
			if (fs.existsSync('yarn.lock')) info.packageManager = 'yarn';
			else if (fs.existsSync('pnpm-lock.yaml')) info.packageManager = 'pnpm';
			else info.packageManager = 'npm';
		} else if (fs.existsSync('requirements.txt') || fs.existsSync('pyproject.toml')) {
			info.projectType = 'python';
			info.packageManager = fs.existsSync('poetry.lock') ? 'poetry' : 'pip';
		} else if (fs.existsSync('Cargo.toml')) {
			info.projectType = 'rust';
			info.packageManager = 'cargo';
		} else if (fs.existsSync('go.mod')) {
			info.projectType = 'go';
			info.packageManager = 'go';
		}

		try {
			const home = process.env.HOME || '';
			info.termuxStorage = home.includes('com.termux');
		} catch {
			// Ignore
		}

		return info;
	}
}

export const projectInitializer = new ProjectInitializer();
