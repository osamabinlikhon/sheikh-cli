import { Key } from 'ink';

export interface KeyBinding {
	key: string;
	ctrl?: boolean;
	meta?: boolean;
	shift?: boolean;
	action: string;
	description: string;
}

export const KEY_BINDINGS: KeyBinding[] = [
	{ key: 'c', ctrl: true, action: 'cancel', description: 'Cancel current input/generation' },
	{ key: 'l', ctrl: true, action: 'clear', description: 'Clear chat (keeps history)' },
	{ key: 'd', ctrl: true, action: 'exit', description: 'Exit session' },
	{ key: 'o', ctrl: true, action: 'verbose', description: 'Toggle verbose mode' },
	{ key: 'r', ctrl: true, action: 'search', description: 'Reverse search history' },
	{ key: 'g', ctrl: true, action: 'editor', description: 'Open in default editor' },
	{ key: 't', ctrl: true, action: 'tasks', description: 'Toggle task list' },
	{ key: 'b', ctrl: true, action: 'background', description: 'Run in background' },
	{ key: 'tab', action: 'switch', description: 'Switch panel (chat/files)' },
	{ key: 'upArrow', action: 'historyUp', description: 'Navigate command history up' },
	{ key: 'downArrow', action: 'historyDown', description: 'Navigate command history down' },
	{ key: 'p', meta: true, action: 'model', description: 'Switch model' },
];

export const KEY_BINDING_MAP = KEY_BINDINGS.reduce((acc, binding) => {
	const modifier = binding.ctrl ? 'ctrl+' : binding.meta ? 'meta+' : '';
	acc[modifier + binding.key] = binding.action;
	return acc;
}, {} as Record<string, string>);
