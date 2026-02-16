import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface SkillConfig {
	name: string;
	description: string;
	enabled: boolean;
	command?: string;
	agentId?: string;
	tier: 'workspace' | 'user' | 'extensions';
}

export interface Skill extends SkillConfig {
	id: string;
	execute?: (params?: Record<string, unknown>) => Promise<string>;
}

export class SkillsManager {
	private skills: Map<string, Skill> = new Map();
	private skillsDir: string;
	private disabledSkills: Set<string> = new Set();

	constructor(baseDir?: string) {
		this.skillsDir = baseDir || path.join(os.homedir(), '.sheikh', 'skills');
	}

	async discoverSkills(): Promise<Skill[]> {
		this.skills.clear();
		await this.loadBuiltInSkills();
		await this.loadWorkspaceSkills();
		await this.loadUserSkills();
		await this.loadExtensionSkills();
		await this.loadDisabledSkills();
		return this.getEnabledSkills();
	}

	private async loadBuiltInSkills(): Promise<void> {
		const builtIn: Skill[] = [
			{
				id: 'code-reviewer',
				name: 'code-reviewer',
				description: 'Review code for issues, bugs, and improvements',
				enabled: true,
				tier: 'extensions',
				agentId: 'code-reviewer',
			},
			{
				id: 'bug-hunter',
				name: 'bug-hunter',
				description: 'Find and fix bugs in code',
				enabled: true,
				tier: 'extensions',
				agentId: 'bug-hunter',
			},
			{
				id: 'test-generator',
				name: 'test-generator',
				description: 'Generate tests for code',
				enabled: true,
				tier: 'extensions',
				agentId: 'test-generator',
			},
			{
				id: 'refactorer',
				name: 'refactorer',
				description: 'Refactor code for better readability',
				enabled: true,
				tier: 'extensions',
				agentId: 'refactorer',
			},
			{
				id: 'explainer',
				name: 'explainer',
				description: 'Explain code and provide documentation',
				enabled: true,
				tier: 'extensions',
				agentId: 'explainer',
			},
		];

		for (const skill of builtIn) {
			this.skills.set(skill.id, skill);
		}
	}

	private async loadWorkspaceSkills(): Promise<void> {
		const workspacePath = path.join(process.cwd(), '.sheikh', 'skills');
		await this.loadSkillsFromDir(workspacePath, 'workspace');
	}

	private async loadUserSkills(): Promise<void> {
		const userPath = path.join(os.homedir(), '.sheikh', 'skills');
		await this.loadSkillsFromDir(userPath, 'user');
	}

	private async loadExtensionSkills(): Promise<void> {
		const extPath = path.join(os.homedir(), '.sheikh', 'extensions', 'skills');
		await this.loadSkillsFromDir(extPath, 'extensions');
	}

	private async loadSkillsFromDir(dir: string, tier: 'workspace' | 'user' | 'extensions'): Promise<void> {
		if (!fs.existsSync(dir)) return;

		const files = fs.readdirSync(dir);
		for (const file of files) {
			if (file.endsWith('.json')) {
				try {
					const filePath = path.join(dir, file);
					const content = fs.readFileSync(filePath, 'utf-8');
					const config = JSON.parse(content) as SkillConfig;
					
					const skill: Skill = {
						...config,
						id: config.name.toLowerCase().replace(/\s+/g, '-'),
						tier,
					};
					
					this.skills.set(skill.id, skill);
				} catch (e) {
					console.error(`Failed to load skill from ${file}:`, e);
				}
			}
		}
	}

	private async loadDisabledSkills(): Promise<void> {
		const configPath = path.join(os.homedir(), '.sheikh', 'disabled-skills.json');
		if (fs.existsSync(configPath)) {
			const content = fs.readFileSync(configPath, 'utf-8');
			const disabled = JSON.parse(content) as string[];
			this.disabledSkills = new Set(disabled);
		}
	}

	private saveDisabledSkills(): void {
		const configPath = path.join(os.homedir(), '.sheikh', 'disabled-skills.json');
		fs.writeFileSync(configPath, JSON.stringify([...this.disabledSkills], null, 2));
	}

	getSkill(id: string): Skill | undefined {
		return this.skills.get(id);
	}

	getAllSkills(): Skill[] {
		return Array.from(this.skills.values());
	}

	getEnabledSkills(): Skill[] {
		return Array.from(this.skills.values()).filter(s => 
			!this.disabledSkills.has(s.id)
		);
	}

	getDisabledSkills(): Skill[] {
		return Array.from(this.skills.values()).filter(s => 
			this.disabledSkills.has(s.id)
		);
	}

	enableSkill(id: string): boolean {
		if (this.skills.has(id)) {
			this.disabledSkills.delete(id);
			this.saveDisabledSkills();
			return true;
		}
		return false;
	}

	disableSkill(id: string): boolean {
		if (this.skills.has(id)) {
			this.disabledSkills.add(id);
			this.saveDisabledSkills();
			return true;
		}
		return false;
	}

	isEnabled(id: string): boolean {
		return !this.disabledSkills.has(id);
	}

	reloadSkills(): Promise<Skill[]> {
		return this.discoverSkills();
	}

	async executeSkill(id: string, params?: Record<string, unknown>): Promise<string> {
		const skill = this.skills.get(id);
		if (!skill) {
			throw new Error(`Skill ${id} not found`);
		}
		
		if (this.disabledSkills.has(id)) {
			throw new Error(`Skill ${id} is disabled`);
		}

		if (skill.execute) {
			return skill.execute(params);
		}

		return `Skill "${skill.name}" is not directly executable. Use with an agent.`;
	}
}

export const skillsManager = new SkillsManager();
