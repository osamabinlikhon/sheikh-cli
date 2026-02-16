export interface Model {
	id: string;
	name: string;
	provider: string;
	endpoint?: string;
	apiKey?: string;
	maxTokens: number;
	temperature: number;
	supportsStreaming: boolean;
	supportsVision: boolean;
	contextWindow: number;
}

export const MODELS: Model[] = [
	{
		id: 'kimi-k2.5-free',
		name: 'Kimi k2.5 Free',
		provider: 'Moonshot',
		maxTokens: 128000,
		temperature: 0.7,
		supportsStreaming: true,
		supportsVision: true,
		contextWindow: 200000,
	},
	{
		id: 'minimax-m2.5-free',
		name: 'MiniMax M2.5 Free',
		provider: 'MiniMax',
		maxTokens: 100000,
		temperature: 0.7,
		supportsStreaming: true,
		supportsVision: true,
		contextWindow: 150000,
	},
	{
		id: 'big-pickle',
		name: 'Big Pickle',
		provider: 'OpenAI',
		maxTokens: 32000,
		temperature: 0.7,
		supportsStreaming: true,
		supportsVision: false,
		contextWindow: 128000,
	},
	{
		id: 'claude-3-opus',
		name: 'Claude 3 Opus',
		provider: 'Anthropic',
		endpoint: 'https://api.anthropic.com/v1',
		maxTokens: 200000,
		temperature: 0.7,
		supportsStreaming: true,
		supportsVision: true,
		contextWindow: 200000,
	},
	{
		id: 'gpt-4o',
		name: 'GPT-4o',
		provider: 'OpenAI',
		endpoint: 'https://api.openai.com/v1',
		maxTokens: 128000,
		temperature: 0.7,
		supportsStreaming: true,
		supportsVision: true,
		contextWindow: 128000,
	},
];

export const DEFAULT_MODEL = 'kimi-k2.5-free';

export const getModel = (id: string): Model | undefined => {
	return MODELS.find((m) => m.id === id);
};

export const getModelByProvider = (provider: string): Model[] => {
	return MODELS.filter((m) => m.provider === provider);
};
