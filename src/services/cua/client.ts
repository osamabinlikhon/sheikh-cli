import { spawn, ChildProcess, execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { EventEmitter } from 'events';
import type { CUAAction, CUAObservation, CUIElement, CUAResult } from './types.js';

export interface CUAConfig {
	display?: string;
	screenshotTool: 'scrot' | 'import' | 'gnome-screenshot' | 'xfce4-screenshooter';
	mouseTool: 'xdotool' | 'wmctrl';
	keyboardTool: 'xdotool' | 'xte';
	screenshotDelay?: number;
}

export class CUAClient extends EventEmitter {
	private config: CUAConfig;
	private display: string;
	private screenshotPath: string;
	private isConnected: boolean = false;

	constructor(config: Partial<CUAConfig> = {}) {
		super();
		this.config = {
			screenshotTool: 'scrot',
			mouseTool: 'xdotool',
			keyboardTool: 'xdotool',
			screenshotDelay: 100,
			...config,
		};
		this.display = config.display || ':1';
		this.screenshotPath = '/tmp/cua-screenshot.png';
	}

	async connect(): Promise<void> {
		try {
			this.takeScreenshot();
			this.isConnected = true;
			this.emit('connected');
		} catch (error) {
			throw new Error(`Failed to connect to display ${this.display}: ${error}`);
		}
	}

	disconnect(): void {
		this.isConnected = false;
		this.emit('disconnected');
	}

	private runCommand(cmd: string, args: string[] = []): string {
		const fullCmd = `DISPLAY=${this.display} ${cmd} ${args.join(' ')}`;
		try {
			return execSync(fullCmd, { encoding: 'utf-8', timeout: 10000 });
		} catch (error: any) {
			return error.stdout || error.message;
		}
	}

	async takeScreenshot(encoding: 'base64' | 'raw' = 'base64'): Promise<CUAObservation> {
		const tool = this.config.screenshotTool;
		let screenshot: Buffer | string;

		try {
			switch (tool) {
				case 'scrot':
					execSync(`DISPLAY=${this.display} scrot -d ${this.config.screenshotDelay || 0} ${this.screenshotPath}`, { timeout: 5000 });
					screenshot = readFileSync(this.screenshotPath);
					break;
				case 'import':
					execSync(`DISPLAY=${this.display} import -window root ${this.screenshotPath}`, { timeout: 5000 });
					screenshot = readFileSync(this.screenshotPath);
					break;
				case 'xfce4-screenshooter':
					execSync(`DISPLAY=${this.display} xfce4-screenshooter -f ${this.screenshotPath}`, { timeout: 5000 });
					screenshot = readFileSync(this.screenshotPath);
					break;
				default:
					throw new Error(`Unknown screenshot tool: ${tool}`);
			}
		} catch (error: any) {
			return {
				screen_width: 0,
				screen_height: 0,
				error: `Screenshot failed: ${error.message}`,
			};
		}

		const sizeOutput = this.runCommand('xdotool', ['getdisplaygeometry']);
		const [width, height] = sizeOutput.trim().split(' ').map(Number);

		const base64 = screenshot.toString('base64');
		return {
			screenshot: encoding === 'base64' ? base64 : undefined,
			screen_width: width || 1920,
			screen_height: height || 1080,
		};
	}

	async click(x: number, y: number, button: 'left' | 'middle' | 'right' = 'left'): Promise<CUAResult> {
		const btn = button === 'left' ? 1 : button === 'middle' ? 2 : 3;
		this.runCommand('xdotool', ['mousemove', String(x), String(y), 'click', String(btn)]);
		return this.createResult('clicked', { x, y });
	}

	async doubleClick(x: number, y: number): Promise<CUAResult> {
		const btn = 1;
		this.runCommand('xdotool', ['mousemove', String(x), String(y), 'click', '--repeat', '2', String(btn)]);
		return this.createResult('double-clicked', { x, y });
	}

	async rightClick(x: number, y: number): Promise<CUAResult> {
		this.runCommand('xdotool', ['mousemove', String(x), String(y), 'click', '3']);
		return this.createResult('right-clicked', { x, y });
	}

	async moveMouse(x: number, y: number): Promise<CUAResult> {
		this.runCommand('xdotool', ['mousemove', String(x), String(y)]);
		return this.createResult('moved', { x, y });
	}

	async hover(x: number, y: number): Promise<CUAResult> {
		return this.moveMouse(x, y);
	}

	async type(text: string, delay: number = 50): Promise<CUAResult> {
		const cleaned = text.replace(/"/g, '\\"').replace(/\n/g, '\\n');
		this.runCommand('xdotool', ['type', '--delay', String(delay), cleaned]);
		return this.createResult(`typed: "${text.slice(0, 20)}..."`);
	}

	async keyPress(key: string, modifiers: string[] = []): Promise<CUAResult> {
		const modArgs = modifiers.flatMap(m => ['--modifiers', m]);
		this.runCommand('xdotool', [...modArgs, 'key', key]);
		return this.createResult(`pressed: ${key}`);
	}

	async drag(startX: number, startY: number, endX: number, endY: number): Promise<CUAResult> {
		this.runCommand('xdotool', [
			'mousemove', String(startX), String(startY),
			'mousedown', '1',
			'mousemove', String(endX), String(endY),
			'mouseup', '1'
		]);
		return this.createResult(`dragged from (${startX},${startY}) to (${endX},${endY})`);
	}

	async scroll(direction: 'up' | 'down' | 'left' | 'right', amount: number = 3): Promise<CUAResult> {
		const count = amount * 120;
		const button = direction === 'up' ? 4 : direction === 'down' ? 5 : direction === 'left' ? 6 : 7;
		this.runCommand('xdotool', ['click', '--repeat', String(amount), String(button)]);
		return this.createResult(`scrolled ${direction} ${amount} times`);
	}

	async wait(duration: number): Promise<CUAResult> {
		await new Promise(resolve => setTimeout(resolve, duration));
		return this.createResult(`waited ${duration}ms`);
	}

	async locateElement(text: string, type?: string): Promise<CUIElement[]> {
		const output = this.runCommand('xdotool', ['search', '--name', '--any', text]);
		const windowIds = output.trim().split('\n').filter(Boolean);
		
		const elements: CUIElement[] = [];
		for (const winId of windowIds) {
			const geo = this.runCommand('xdotool', ['getwindowgeometry', winId]);
			const match = geo.match(/Position: (\d+),(\d+)/);
			const sizeMatch = geo.match(/Geometry: (\d+)x(\d+)/);
			
			if (match && sizeMatch) {
				elements.push({
					id: winId,
					type: (type as any) || 'window',
					label: text,
					x: parseInt(match[1]),
					y: parseInt(match[2]),
					width: parseInt(sizeMatch[1]),
					height: parseInt(sizeMatch[2]),
					clickable: true,
					inputable: false,
					visible: true,
					text,
				});
			}
		}
		
		return elements;
	}

	async performAction(action: CUAAction): Promise<CUAResult> {
		switch (action.type) {
			case 'click':
				return this.click(action.x || 0, action.y || 0);
			case 'double_click':
				return this.doubleClick(action.x || 0, action.y || 0);
			case 'right_click':
				return this.rightClick(action.x || 0, action.y || 0);
			case 'move':
				return this.moveMouse(action.x || 0, action.y || 0);
			case 'type':
				return this.type(action.text || '');
			case 'keypress':
				return this.keyPress(action.text || '');
			case 'drag':
				return this.drag(action.x || 0, action.y || 0, action.x! + 100, action.y! + 100);
			case 'wait':
				return this.wait(action.duration || 1000);
			case 'screenshot':
				const obs = await this.takeScreenshot();
				return { success: true, observation: obs, action_taken: 'screenshot' };
			default:
				return { success: false, observation: { screen_width: 0, screen_height: 0 }, error: `Unknown action: ${action.type}` };
		}
	}

	private createResult(actionTaken: string, coords?: { x: number; y: number }): CUAResult {
		const observation: CUAObservation = {
			screen_width: 1920,
			screen_height: 1080,
		};
		
		if (coords) {
			observation.elements = [{
				id: 'cursor',
				type: 'icon',
				x: coords.x,
				y: coords.y,
				width: 1,
				height: 1,
				clickable: false,
				inputable: false,
				visible: true,
			}];
		}
		
		return {
			success: true,
			observation,
			action_taken: actionTaken,
		};
	}

	isActive(): boolean {
		return this.isConnected;
	}
}

export const createCUAClient = (config?: Partial<CUAConfig>): CUAClient => {
	return new CUAClient(config);
};
