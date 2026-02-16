import React from 'react';
import { Box, Text } from 'ink';

interface Message {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: number;
	loading?: boolean;
}

interface SidebarProps {
	messages: Message[];
	selected: boolean;
	gitBranch: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ messages, gitBranch }) => {
	const userMessages = messages.filter((m) => m.role === 'user').length;
	const aiMessages = messages.filter((m) => m.role === 'assistant').length;

	return (
		<Box flexDirection="column">
			<Box paddingX={1} paddingY={0} borderStyle="bold" borderColor="cyan" borderBottom>
				<Text bold color="cyan">Sheikh</Text>
			</Box>
			<Box flexDirection="column" padding={1}>
				<Text bold color="white">Stats</Text>
				<Text color="gray">─────────</Text>
				<Text>Messages: {messages.length}</Text>
				<Text color="green">You: {userMessages}</Text>
				<Text color="cyan">AI: {aiMessages}</Text>
				<Text>─────────</Text>
				<Text bold color="white">Git</Text>
				<Text color="gray">─────────</Text>
				<Text>Branch: {gitBranch || 'N/A'}</Text>
			</Box>
			<Box flexDirection="column" padding={1} marginTop={1}>
				<Text color="gray">─────────</Text>
				<Text bold color="cyan">Shortcuts</Text>
				<Text color="gray">─────────</Text>
				<Text color="gray">Ctrl+C Cancel</Text>
				<Text color="gray">Ctrl+L Clear</Text>
				<Text color="gray">Ctrl+O Verbose</Text>
				<Text color="gray">Ctrl+G Editor</Text>
				<Text color="gray">Ctrl+T Tasks</Text>
				<Text color="gray">Ctrl+B Background</Text>
				<Text color="gray">Alt+P Model</Text>
				<Text color="gray">Tab Switch</Text>
				<Text color="gray">↑↓ History</Text>
				<Text color="gray">Ctrl+R Search</Text>
			</Box>
		</Box>
	);
};
