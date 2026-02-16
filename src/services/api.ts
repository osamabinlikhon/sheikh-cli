export class ApiClient {
	private apiKey: string;
	private baseUrl = 'https://opencode.ai/zen/v1/chat/completions';

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	async chat(messages: any[], model: string, context: string): Promise<string> {
		const systemMessage = `You are OpenCode CLI, an AI coding assistant.
Tools: read, write, glob, grep, run, cd, ls
Context: ${context}

Be helpful, concise, and use commands when needed.`;

		const formattedMessages = [
			{ role: 'system', content: systemMessage },
			...messages.map((m) => ({ role: m.role, content: m.content })),
		];

		try {
			const response = await fetch(this.baseUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${this.apiKey}`,
				},
				body: JSON.stringify({
					model,
					messages: formattedMessages,
					stream: false,
				}),
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`API error: ${response.status} - ${error}`);
			}

			const data = await response.json() as any;
			return data.choices?.[0]?.message?.content || 'No response from API';
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`API request failed: ${error.message}`);
			}
			throw new Error('API request failed');
		}
	}
}
