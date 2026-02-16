import { EventEmitter } from 'events';
import * as os from 'os';
import { environmentDetector } from './environment.js';

export type ResourceLevel = 'low' | 'normal' | 'high';

export interface ResourceStatus {
	memory: {
		used: number;
		total: number;
		percentage: number;
		level: ResourceLevel;
	};
	battery: {
		level: number | null;
		charging: boolean;
		levelStatus: ResourceLevel;
	};
	cpu: {
		load: number;
		count: number;
	};
}

export interface ResourceThresholds {
	memory: {
		low: number;
		high: number;
	};
	battery: {
		low: number;
		critical: number;
	};
}

export class ResourceManager extends EventEmitter {
	private thresholds: ResourceThresholds = {
		memory: {
			low: 0.3,
			high: 0.7,
		},
		battery: {
			low: 20,
			critical: 10,
		},
	};
	private pollingInterval: NodeJS.Timeout | null = null;
	private lastStatus: ResourceStatus | null = null;
	private isPaused: boolean = false;
	private pausedTasks: Set<string> = new Set();

	constructor() {
		super();
	}

	setThresholds(thresholds: Partial<ResourceThresholds>): void {
		this.thresholds = { ...this.thresholds, ...thresholds };
	}

	startPolling(intervalMs: number = 5000): void {
		if (this.pollingInterval) {
			clearInterval(this.pollingInterval);
		}

		this.poll();

		this.pollingInterval = setInterval(() => {
			this.poll();
		}, intervalMs);
	}

	stopPolling(): void {
		if (this.pollingInterval) {
			clearInterval(this.pollingInterval);
			this.pollingInterval = null;
		}
	}

	private poll(): void {
		const status = this.getStatus();

		if (this.lastStatus) {
			this.checkForChanges(this.lastStatus, status);
		}

		this.lastStatus = status;
		this.emit('status', status);

		if (status.battery.levelStatus === 'low' && !status.battery.charging) {
			this.emit('lowBattery', status.battery);
		}

		if (status.memory.level === 'low') {
			this.emit('lowMemory', status.memory);
		}

		this.updatePauseState(status);
	}

	private checkForChanges(oldStatus: ResourceStatus, newStatus: ResourceStatus): void {
		if (oldStatus.memory.level !== newStatus.memory.level) {
			this.emit('memoryLevelChange', {
				old: oldStatus.memory.level,
				new: newStatus.memory.level,
			});
		}

		if (oldStatus.battery.levelStatus !== newStatus.battery.levelStatus) {
			this.emit('batteryLevelChange', {
				old: oldStatus.battery.levelStatus,
				new: newStatus.battery.levelStatus,
			});
		}

		if (oldStatus.battery.charging !== newStatus.battery.charging) {
			this.emit('chargingChange', {
				charging: newStatus.battery.charging,
			});
		}
	}

	private updatePauseState(status: ResourceStatus): void {
		const shouldPause = 
			status.battery.level !== null && 
			status.battery.level < this.thresholds.battery.low &&
			!status.battery.charging;

		if (shouldPause && !this.isPaused) {
			this.pause();
		} else if (!shouldPause && this.isPaused) {
			this.resume();
		}
	}

	getStatus(): ResourceStatus {
		const env = environmentDetector.detect();
		const totalMem = env.totalMemory;
		const freeMem = env.availableMemory;
		const usedMem = totalMem - freeMem;
		const memPercentage = usedMem / totalMem;

		const batteryLevel = env.batteryLevel;
		const batteryCharging = env.batteryCharging;

		const cpuLoad = os.loadavg()[0] / os.cpus().length;
		const cpuCount = env.cpuCount;

		return {
			memory: {
				used: usedMem,
				total: totalMem,
				percentage: memPercentage,
				level: this.getMemoryLevel(memPercentage),
			},
			battery: {
				level: batteryLevel,
				charging: batteryCharging,
				levelStatus: this.getBatteryLevel(batteryLevel),
			},
			cpu: {
				load: cpuLoad,
				count: cpuCount,
			},
		};
	}

	private getMemoryLevel(percentage: number): ResourceLevel {
		if (percentage >= this.thresholds.memory.high) {
			return 'high';
		} else if (percentage <= this.thresholds.memory.low) {
			return 'low';
		}
		return 'normal';
	}

	private getBatteryLevel(level: number | null): ResourceLevel {
		if (level === null) {
			return 'normal';
		}
		if (level <= this.thresholds.battery.critical) {
			return 'low';
		} else if (level <= this.thresholds.battery.low) {
			return 'normal';
		}
		return 'high';
	}

	pause(): void {
		this.isPaused = true;
		this.emit('paused');
	}

	resume(): void {
		this.isPaused = false;
		this.emit('resumed');
	}

	isPausedState(): boolean {
		return this.isPaused;
	}

	shouldThrottle(): boolean {
		const status = this.getStatus();
		return (
			status.memory.level === 'high' ||
			status.battery.levelStatus === 'normal' ||
			status.cpu.load > 0.8
		);
	}

	getOptimalBatchSize(): number {
		const status = this.getStatus();

		if (status.memory.level === 'low' || status.battery.levelStatus === 'normal') {
			return 1;
		}

		if (status.memory.level === 'high') {
			return 1;
		}

		return Math.max(2, Math.floor(status.cpu.count / 2));
	}

	forceGC(): void {
		if (global.gc) {
			global.gc();
		}
	}

	formatBytes(bytes: number): string {
		const units = ['B', 'KB', 'MB', 'GB'];
		let value = bytes;
		let unitIndex = 0;

		while (value >= 1024 && unitIndex < units.length - 1) {
			value /= 1024;
			unitIndex++;
		}

		return `${value.toFixed(1)} ${units[unitIndex]}`;
	}

	getFormattedStatus(): string {
		const status = this.getStatus();
		const mem = status.memory;
		const batt = status.battery;

		return `Resources:
  Memory: ${this.formatBytes(mem.used)} / ${this.formatBytes(mem.total)} (${Math.round(mem.percentage * 100)}%)
  Battery: ${batt.level !== null ? batt.level + '%' : 'N/A'} ${batt.charging ? '⚡' : ''}
  CPU: ${(status.cpu.load * 100).toFixed(0)}% load
  Status: ${this.isPaused ? '⏸️ Paused' : '▶️ Active'}`;
	}
}

export const resourceManager = new ResourceManager();
