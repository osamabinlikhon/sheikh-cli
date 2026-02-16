import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

interface ChatPanelProps {
	messages: Message[];
	selected: boolean;
}

interface Message {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: number;
	loading?: boolean;
}

const LOADING_FRAMES = ['⋯', '⋱', '⋮', '⋰'];
const LOADING_TEXT = ['Thinking', 'Thinking.', 'Thinking..', 'Thinking...'];

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, selected }) => {
	const [loadingFrame, setLoadingFrame] = useState(0);

	useEffect(() => {
		const hasLoading = messages.some(m => m.loading);
		if (!hasLoading) return;
		
		const interval = setInterval(() => {
			setLoadingFrame((f) => (f + 1) % LOADING_FRAMES.length);
		}, 300);
		return () => clearInterval(interval);
	}, [messages]);

	const renderMessage = (message: Message) => {
		const isUser = message.role === 'user';
		const color = isUser ? 'green' : 'cyan';

		return (
			<Box key={message.id} flexDirection="column" marginY={1}>
				<Box>
					<Text bold color={color}>
						{isUser ? '❯ ' : '◉ '}
					</Text>
					<Text bold color={color}>
						{isUser ? 'You' : 'Assistant'}
					</Text>
					<Text color="gray"> • {new Date(message.timestamp).toLocaleTimeString()}</Text>
				</Box>
				<Box paddingLeft={2} flexDirection="column">
					{message.loading ? (
						<Text color="yellow">{LOADING_TEXT[loadingFrame]}</Text>
					) : (
						message.content.split('\n').map((line, i) => (
							<Text key={i}>{line}</Text>
						))
					)}
				</Box>
			</Box>
		);
	};

	return (
		<Box
			flexDirection="column"
			flexGrow={1}
			borderStyle={selected ? 'bold' : 'round'}
			borderColor={selected ? 'cyan' : 'gray'}
		>
			<Box paddingX={1} paddingY={0} borderStyle="bold" borderColor="cyan" borderBottom>
				<Text bold color="cyan"> Chat</Text>
			</Box>
			<Box flexDirection="column" flexGrow={1} padding={1}>
				{messages.map(renderMessage)}
			</Box>
		</Box>
	);
};
