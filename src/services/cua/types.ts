export interface CUAAction {
	type: 'click' | 'double_click' | 'right_click' | 'drag' | 'type' | 'keypress' | 'wait' | 'screenshot' | 'move';
	x?: number;
	y?: number;
	key?: string;
	text?: string;
	duration?: number;
}

export interface CUAObservation {
	screenshot?: string;
	screen_width: number;
	screen_height: number;
	elements?: CUIElement[];
	error?: string;
}

export interface CUIElement {
	id: string;
	type: 'button' | 'input' | 'link' | 'text' | 'image' | 'window' | 'icon';
	label?: string;
	x: number;
	y: number;
	width: number;
	height: number;
	clickable: boolean;
	inputable: boolean;
	visible: boolean;
	text?: string;
	href?: string;
}

export interface CUATool {
	name: string;
	description: string;
	parameters: {
		type: 'object';
		properties: Record<string, unknown>;
		required?: string[];
	};
}

export interface CUAResult {
	success: boolean;
	observation: CUAObservation;
	action_taken?: string;
	error?: string;
}

export const CUA_TOOLS: CUATool[] = [
	{
		name: 'computer_call',
		description: 'Perform a computer action (click, type, keypress, etc.)',
		parameters: {
			type: 'object',
			properties: {
				action: {
					type: 'string',
					enum: ['click', 'double_click', 'right_click', 'drag', 'type', 'keypress', 'wait', 'screenshot', 'move'],
					description: 'The action to perform',
				},
				x: {
					type: 'number',
					description: 'X coordinate for mouse actions',
				},
				y: {
					type: 'number',
					description: 'Y coordinate for mouse actions',
				},
				text: {
					type: 'string',
					description: 'Text to type or key to press',
				},
				duration: {
					type: 'number',
					description: 'Duration in milliseconds for wait/drag actions',
				},
			},
			required: ['action'],
		},
	},
	{
		name: 'computer_screenshot',
		description: 'Take a screenshot of the current screen',
		parameters: {
			type: 'object',
			properties: {
				encoding: {
					type: 'string',
					enum: ['base64', 'raw'],
					description: 'Image encoding format',
				},
			},
		},
	},
	{
		name: 'computer_locate',
		description: 'Locate UI elements on screen',
		parameters: {
			type: 'object',
			properties: {
				text: {
					type: 'string',
					description: 'Text to locate',
				},
				type: {
					type: 'string',
					enum: ['button', 'input', 'link', 'text', 'image', 'icon'],
					description: 'Element type to filter by',
				},
			},
		},
	},
	{
		name: 'computer_hover',
		description: 'Hover over an element at coordinates',
		parameters: {
			type: 'object',
			properties: {
				x: {
					type: 'number',
					description: 'X coordinate',
				},
				y: {
					type: 'number',
					description: 'Y coordinate',
				},
			},
			required: ['x', 'y'],
		},
	},
	{
		name: 'computer_scrollable',
		description: 'Scroll the screen in a direction',
		parameters: {
			type: 'object',
			properties: {
				direction: {
					type: 'string',
					enum: ['up', 'down', 'left', 'right'],
					description: 'Scroll direction',
				},
				amount: {
					type: 'number',
					description: 'Number of scroll units',
				},
			},
			required: ['direction'],
		},
	},
];
