export interface ThemeColors {
	primary: string;
	secondary: string;
	success: string;
	warning: string;
	error: string;
	info: string;
	text: string;
	textMuted: string;
	border: string;
	background: string;
	backgroundAlt: string;
	prompt: string;
	user: string;
	assistant: string;
	system: string;
}

export interface Theme {
	id: string;
	name: string;
	colors: ThemeColors;
	icons: {
		user: string;
		assistant: string;
		system: string;
		error: string;
		success: string;
		warning: string;
		loading: string;
	};
	borderStyle: 'round' | 'bold' | 'double' | 'single' | 'dashed';
}

export const THEMES: Record<string, Theme> = {
	default: {
		id: 'default',
		name: 'Default',
		colors: {
			primary: 'cyan',
			secondary: 'magenta',
			success: 'green',
			warning: 'yellow',
			error: 'red',
			info: 'blue',
			text: 'white',
			textMuted: 'gray',
			border: 'cyan',
			background: 'black',
			backgroundAlt: 'black',
			prompt: 'cyan',
			user: 'green',
			assistant: 'cyan',
			system: 'yellow',
		},
		icons: {
			user: '❯',
			assistant: '◉',
			system: '⚙',
			error: '✗',
			success: '✓',
			warning: '⚠',
			loading: '...',
		},
		borderStyle: 'round',
	},
	dracula: {
		id: 'dracula',
		name: 'Dracula',
		colors: {
			primary: 'magenta',
			secondary: 'cyan',
			success: 'green',
			warning: 'yellow',
			error: 'red',
			info: 'blue',
			text: 'white',
			textMuted: 'gray',
			border: 'magenta',
			background: 'black',
			backgroundAlt: '#282a36',
			prompt: 'magenta',
			user: 'green',
			assistant: 'cyan',
			system: 'yellow',
		},
		icons: {
			user: '❯',
			assistant: '👻',
			system: '⚙',
			error: '✗',
			success: '✓',
			warning: '⚠',
			loading: '...',
		},
		borderStyle: 'bold',
	},
	monokai: {
		id: 'monokai',
		name: 'Monokai',
		colors: {
			primary: 'magenta',
			secondary: 'yellow',
			success: 'green',
			warning: 'yellow',
			error: 'red',
			info: 'cyan',
			text: 'white',
			textMuted: 'gray',
			border: 'magenta',
			background: 'black',
			backgroundAlt: '#272822',
			prompt: 'magenta',
			user: 'green',
			assistant: 'yellow',
			system: 'cyan',
		},
		icons: {
			user: '❯',
			assistant: '◉',
			system: '⚙',
			error: '✗',
			success: '✓',
			warning: '⚠',
			loading: '...',
		},
		borderStyle: 'round',
	},
	nord: {
		id: 'nord',
		name: 'Nord',
		colors: {
			primary: 'blue',
			secondary: 'cyan',
			success: 'green',
			warning: 'yellow',
			error: 'red',
			info: 'cyan',
			text: 'white',
			textMuted: 'gray',
			border: 'blue',
			background: 'black',
			backgroundAlt: '#2e3440',
			prompt: 'blue',
			user: 'green',
			assistant: 'cyan',
			system: 'yellow',
		},
		icons: {
			user: '❯',
			assistant: '◉',
			system: '⚙',
			error: '✗',
			success: '✓',
			warning: '⚠',
			loading: '...',
		},
		borderStyle: 'round',
	},
	solarized: {
		id: 'solarized',
		name: 'Solarized Dark',
		colors: {
			primary: 'blue',
			secondary: 'magenta',
			success: 'green',
			warning: 'yellow',
			error: 'red',
			info: 'cyan',
			text: 'white',
			textMuted: 'gray',
			border: 'blue',
			background: 'black',
			backgroundAlt: '#002b36',
			prompt: 'blue',
			user: 'green',
			assistant: 'yellow',
			system: 'cyan',
		},
		icons: {
			user: '❯',
			assistant: '◉',
			system: '⚙',
			error: '✗',
			success: '✓',
			warning: '⚠',
			loading: '...',
		},
		borderStyle: 'bold',
	},
};

export const DEFAULT_THEME = 'default';

export const getTheme = (id: string): Theme => {
	return THEMES[id] || THEMES[DEFAULT_THEME];
};

export const getThemeNames = (): string[] => {
	return Object.keys(THEMES);
};
