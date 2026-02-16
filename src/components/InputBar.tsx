import React from 'react';
import { Box, Text } from 'ink';

interface InputBarProps {
	value: string;
	onChange: (value: string) => void;
	onSubmit: () => void;
	isProcessing: boolean;
	currentDir: string;
}

export const InputBar: React.FC<InputBarProps> = ({
	value,
	onChange,
	onSubmit,
	isProcessing,
	currentDir,
}) => {
	return (
		<Box flexDirection="row" borderStyle="bold" borderColor="cyan" borderTop paddingX={1} paddingY={0}>
			<Text color="cyan">❯ {currentDir}</Text>
			<Text> </Text>
			<Text>
				{value}
				{isProcessing ? (
					<Text color="yellow"> (processing...)</Text>
				) : (
					<Text color="cyan">▋</Text>
				)}
			</Text>
		</Box>
	);
};
