import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

interface StatusBarProps {
	model: string;
	isProcessing: boolean;
	messageCount: number;
	verbose: boolean;
	currentDir: string;
	showTaskList: boolean;
	taskCount?: number;
}

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export const StatusBar: React.FC<StatusBarProps> = ({
	model,
	isProcessing,
	messageCount,
	verbose,
	currentDir,
	showTaskList,
	taskCount = 0,
}) => {
	const [frame, setFrame] = useState(0);

	useEffect(() => {
		if (!isProcessing) return;
		const interval = setInterval(() => {
			setFrame((f) => (f + 1) % SPINNER.length);
		}, 80);
		return () => clearInterval(interval);
	}, [isProcessing]);

	const dirName = currentDir.split('/').pop() || currentDir;

	return (
		<Box
			flexDirection="row"
			justifyContent="space-between"
			borderStyle="bold"
			borderColor="cyan"
			borderTop
			paddingX={1}
			paddingY={0}
		>
			<Text color="cyan">Sheikh CLI</Text>
			<Text>
				<Text color="yellow">{model}</Text>
				{isProcessing ? (
					<Text color="yellow"> {SPINNER[frame]}</Text>
				) : (
					<Text color="green"> ●</Text>
				)}
				{verbose && <Text color="magenta"> [V]</Text>}
				{showTaskList && <Text color="blue"> [Tasks:{taskCount}]</Text>}
			</Text>
			<Text color="gray">{messageCount} msgs | {dirName}</Text>
		</Box>
	);
};
