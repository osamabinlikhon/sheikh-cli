export type AnimationType = 'spinner' | 'dots' | 'bar' | 'pulse' | 'bounce' | 'typewriter';

export interface AnimationFrame {
	frames: string[];
	interval: number;
}

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const DOTS_FRAMES = ['⋯', '⋱', '⋮', '⋰'];
const BAR_FRAMES = ['▌', '▀', '▐', '▄', '▌'];
const PULSE_FRAMES = ['●', '○', '○', '○'];
const BOUNCE_FRAMES = [' ━', '━━', '━━━', '━━ ', '━━ ', '━ '];

export const ANIMATIONS: Record<AnimationType, AnimationFrame> = {
	spinner: { frames: SPINNER_FRAMES, interval: 80 },
	dots: { frames: DOTS_FRAMES, interval: 200 },
	bar: { frames: BAR_FRAMES, interval: 100 },
	pulse: { frames: PULSE_FRAMES, interval: 150 },
	bounce: { frames: BOUNCE_FRAMES, interval: 100 },
	typewriter: { frames: ['|', '/', '─', '\\'], interval: 100 },
};

export class TerminalAnimator {
	private activeAnimations: Map<string, NodeJS.Timeout> = new Map();
	private frameIndex: Map<string, number> = new Map();

	start(label: string, type: AnimationType = 'spinner'): void {
		if (this.activeAnimations.has(label)) {
			return;
		}

		const anim = ANIMATIONS[type];
		this.frameIndex.set(label, 0);

		const interval = setInterval(() => {
			const idx = this.frameIndex.get(label) || 0;
			this.frameIndex.set(label, (idx + 1) % anim.frames.length);
		}, anim.interval);

		this.activeAnimations.set(label, interval);
	}

	stop(label: string): void {
		const interval = this.activeAnimations.get(label);
		if (interval) {
			clearInterval(interval);
			this.activeAnimations.delete(label);
			this.frameIndex.delete(label);
		}
	}

	stopAll(): void {
		for (const label of this.activeAnimations.keys()) {
			this.stop(label);
		}
	}

	getFrame(label: string): string {
		const animType = this.detectAnimationType(label);
		const anim = ANIMATIONS[animType];
		const idx = this.frameIndex.get(label) || 0;
		return anim.frames[idx];
	}

	private detectAnimationType(label: string): AnimationType {
		const lower = label.toLowerCase();
		if (lower.includes('loading') || lower.includes('wait')) return 'spinner';
		if (lower.includes('thinking') || lower.includes('dots')) return 'dots';
		if (lower.includes('progress') || lower.includes('bar')) return 'bar';
		if (lower.includes('pulse')) return 'pulse';
		return 'spinner';
	}

	isRunning(label: string): boolean {
		return this.activeAnimations.has(label);
	}
}

export const animator = new TerminalAnimator();

export function loadingText(text: string, type: AnimationType = 'spinner'): string {
	const anim = ANIMATIONS[type];
	const frame = anim.frames[Math.floor(Date.now() / anim.interval) % anim.frames.length];
	return `${frame} ${text}`;
}

export async function animateText(
	text: string,
	delay: number = 30,
	onChar?: (char: string, index: number) => void
): Promise<string> {
	let result = '';
	for (let i = 0; i < text.length; i++) {
		result += text[i];
		if (onChar) {
			onChar(text[i], i);
		}
		await new Promise(r => setTimeout(r, delay));
	}
	return result;
}

export function progressBar(
	current: number,
	total: number,
	width: number = 20,
	filled: string = '█',
	empty: string = '░'
): string {
	const percentage = current / total;
	const filledWidth = Math.round(percentage * width);
	const emptyWidth = width - filledWidth;
	return `${filled.repeat(filledWidth)}${empty.repeat(emptyWidth)} ${Math.round(percentage * 100)}%`;
}

export function fadeIn(text: string, steps: number = 3): string[] {
	const lines = text.split('\n');
	const result: string[] = [];
	
	for (const line of lines) {
		const words = line.split(' ');
		const totalWords = words.length;
		
		for (let s = 1; s <= steps; s++) {
			const wordCount = Math.floor((totalWords * s) / steps);
			result.push(words.slice(0, wordCount).join(' ') || '');
		}
	}
	
	return result;
}

export class TypewriterEffect {
	private text: string;
	private index: number = 0;
	private cursor: string = '▋';
	private showCursor: boolean = true;

	constructor(text: string) {
		this.text = text;
	}

	next(): string {
		if (this.index < this.text.length) {
			this.index++;
		}
		this.showCursor = !this.showCursor;
		return this.getText();
	}

	getText(): string {
		const visible = this.text.slice(0, this.index);
		const cursor = this.showCursor ? this.cursor : ' ';
		return visible + cursor;
	}

	reset(): void {
		this.index = 0;
		this.showCursor = true;
	}

	isComplete(): boolean {
		return this.index >= this.text.length;
	}
}

export const Effects = {
	rainbow: (text: string): string => {
		const colors = ['\x1b[31m', '\x1b[33m', '\x1b[32m', '\x1b[36m', '\x1b[34m', '\x1b[35m'];
		const reset = '\x1b[0m';
		return text.split('').map((c, i) => colors[i % colors.length] + c).join('') + reset;
	},

	bold: (text: string): string => `\x1b[1m${text}\x1b[22m`,
	dim: (text: string): string => `\x1b[2m${text}\x1b[22m`,
	italic: (text: string): string => `\x1b[3m${text}\x1b[23m`,
	underline: (text: string): string => `\x1b[4m${text}\x1b[24m`,
	strikethrough: (text: string): string => `\x1b[9m${text}\x1b[29m`,

	blink: (text: string): string => `\x1b[5m${text}\x1b[25m`,
	reverse: (text: string): string => `\x1b[7m${text}\x1b[27m`,
	hidden: (text: string): string => `\x1b[8m${text}\x1b[28m`,

	red: (text: string): string => `\x1b[31m${text}\x1b[0m`,
	green: (text: string): string => `\x1b[32m${text}\x1b[0m`,
	yellow: (text: string): string => `\x1b[33m${text}\x1b[0m`,
	blue: (text: string): string => `\x1b[34m${text}\x1b[0m`,
	magenta: (text: string): string => `\x1b[35m${text}\x1b[0m`,
	cyan: (text: string): string => `\x1b[36m${text}\x1b[0m`,
	white: (text: string): string => `\x1b[37m${text}\x1b[0m`,

	bgRed: (text: string): string => `\x1b[41m${text}\x1b[0m`,
	bgGreen: (text: string): string => `\x1b[42m${text}\x1b[0m`,
	bgBlue: (text: string): string => `\x1b[44m${text}\x1b[0m`,
	bgYellow: (text: string): string => `\x1b[43m${text}\x1b[0m`,
};
