import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

export interface EnvironmentInfo {
	isTermux: boolean;
	isAndroid: boolean;
	isLinux: boolean;
	isWSL: boolean;
	platform: string;
	arch: string;
	prefix: string;
	homeDir: string;
	storagePath: string | null;
	termuxVersion: string | null;
	availableMemory: number;
	totalMemory: number;
	cpuCount: number;
	batteryLevel: number | null;
	batteryCharging: boolean;
	packageManager: 'apt' | 'pkg' | 'yum' | 'dnf' | null;
	termuxApi: boolean;
}

export interface TermuxPaths {
	home: string;
	prefix: string;
	storage: string;
	sharedStorage: string;
	downloads: string;
	documents: string;
	temp: string;
}

class EnvironmentDetector {
	private cachedInfo: EnvironmentInfo | null = null;
	private termuxPaths: TermuxPaths | null = null;

	detect(): EnvironmentInfo {
		if (this.cachedInfo) {
			return this.cachedInfo;
		}

		const isTermux = this.checkIsTermux();
		const isAndroid = isTermux || this.checkIsAndroid();
		const platform = process.platform;
		const arch = process.arch;

		const prefix = process.env.PREFIX || '/usr';
		const homeDir = os.homedir();

		const paths = this.getTermuxPaths();

		const termuxVersion = this.getTermuxVersion();
		const termuxApi = this.checkTermuxApi();

		const totalMemory = os.totalmem();
		const availableMemory = os.freemem();
		const cpuCount = os.cpus().length;

		const battery = this.getBatteryInfo();

		const packageManager = this.detectPackageManager();

		this.cachedInfo = {
			isTermux,
			isAndroid,
			isLinux: platform === 'linux',
			isWSL: this.checkIsWSL(),
			platform,
			arch,
			prefix,
			homeDir,
			storagePath: paths?.sharedStorage || null,
			termuxVersion,
			availableMemory,
			totalMemory,
			cpuCount,
			batteryLevel: battery?.level || null,
			batteryCharging: battery?.charging || false,
			packageManager,
			termuxApi,
		};

		return this.cachedInfo;
	}

	private checkIsTermux(): boolean {
		const prefix = process.env.PREFIX || '';
		return prefix.includes('com.termux') || 
		       fs.existsSync('/data/data/com.termux') ||
		       fs.existsSync('/data/data/com.termux/files/usr');
	}

	private checkIsAndroid(): boolean {
		return fs.existsSync('/system/bin') && 
		       fs.existsSync('/system/build.prop');
	}

	private checkIsWSL(): boolean {
		if (process.platform !== 'linux') return false;
		try {
			const version = fs.readFileSync('/proc/version', 'utf-8');
			return version.toLowerCase().includes('microsoft') || 
			       version.toLowerCase().includes('wsl');
		} catch {
			return false;
		}
	}

	private checkTermuxApi(): boolean {
		try {
			return fs.existsSync('/data/data/com.termux/files/usr/bin/termux-api');
		} catch {
			return false;
		}
	}

	private getTermuxVersion(): string | null {
		try {
			const versionFile = '/data/data/com.termux/files/usr/etc/termux.version';
			if (fs.existsSync(versionFile)) {
				return fs.readFileSync(versionFile, 'utf-8').trim();
			}
		} catch {
			// Ignore
		}
		return null;
	}

	getTermuxPaths(): TermuxPaths | null {
		if (this.termuxPaths) {
			return this.termuxPaths;
		}

		if (!this.checkIsTermux()) {
			return null;
		}

		const prefix = process.env.PREFIX || '/data/data/com.termux/files/usr';
		const home = process.env.HOME || '/data/data/com.termux/files/home';

		this.termuxPaths = {
			home,
			prefix,
			storage: path.join(home, 'storage'),
			sharedStorage: '/storage/emulated/0',
			downloads: '/storage/emulated/0/Download',
			documents: '/storage/emulated/0/Documents',
			temp: os.tmpdir(),
		};

		return this.termuxPaths;
	}

	private detectPackageManager(): 'apt' | 'pkg' | 'yum' | 'dnf' | null {
		if (this.checkIsTermux()) {
			return 'pkg';
		}

		if (fs.existsSync('/usr/bin/apt')) {
			return 'apt';
		}
		if (fs.existsSync('/usr/bin/dnf')) {
			return 'dnf';
		}
		if (fs.existsSync('/usr/bin/yum')) {
			return 'yum';
		}

		return null;
	}

	private getBatteryInfo(): { level: number; charging: boolean } | null {
		if (!this.checkIsTermux()) {
			return null;
		}

		try {
			const { execSync } = require('child_process');
			const output = execSync('termux-battery-status', { 
				encoding: 'utf-8',
				timeout: 5000 
			});
			const status = JSON.parse(output);
			return {
				level: status.percentage || 0,
				charging: status.plugged === 'AC' || status.plugged === 'USB',
			};
		} catch {
			return null;
		}
	}

	isLowMemory(): boolean {
		const info = this.detect();
		const memoryGB = info.totalMemory / (1024 * 1024 * 1024);
		return memoryGB < 2;
	}

	isLowBattery(): boolean {
		const info = this.detect();
		return info.batteryLevel !== null && info.batteryLevel < 20;
	}

	isOnBattery(): boolean {
		const info = this.detect();
		return info.batteryCharging === false;
	}

	getOptimalSettings(): {
		maxConcurrentTasks: number;
		enableStreaming: boolean;
		cacheEnabled: boolean;
		aggressiveGC: boolean;
	} {
		const info = this.detect();
		
		if (this.isLowMemory() || this.isOnBattery()) {
			return {
				maxConcurrentTasks: 1,
				enableStreaming: true,
				cacheEnabled: true,
				aggressiveGC: true,
			};
		}

		if (info.totalMemory > 8 * 1024 * 1024 * 1024) {
			return {
				maxConcurrentTasks: 4,
				enableStreaming: true,
				cacheEnabled: true,
				aggressiveGC: false,
			};
		}

		return {
			maxConcurrentTasks: 2,
			enableStreaming: true,
			cacheEnabled: true,
			aggressiveGC: false,
		};
	}

	clearCache(): void {
		this.cachedInfo = null;
		this.termuxPaths = null;
	}
}

export const environmentDetector = new EnvironmentDetector();
export default environmentDetector;
