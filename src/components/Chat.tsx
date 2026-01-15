/**
 * Chat Component
 * 
 * Displays conversation history with tool outputs and assistant responses
 */

import React from 'react';
import { Box, Text, Spacer } from 'ink';
import { Message, AgentState } from '../core/types.js';

interface ChatProps {
  messages: Message[];
  state: AgentState;
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}

function getStatusColor(status: AgentState['status']): string {
  switch (status) {
    case 'thinking': return 'yellow';
    case 'executing': return 'cyan';
    case 'error': return 'red';
    default: return 'gray';
  }
}

function getStatusText(status: AgentState['status']): string {
  switch (status) {
    case 'thinking': return 'Thinking...';
    case 'executing': return 'Executing...';
    case 'error': return 'Error';
    default: return 'Idle';
  }
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isTool = message.role === 'tool';

  if (isUser) {
    return (
      <Box flexDirection="column" marginBottom={1}>
        <Box>
          <Text color="cyan" bold>You</Text>
          <Text color="gray"> {formatTimestamp(message.timestamp)}</Text>
        </Box>
        <Box marginTop={0}>
          <Text wrap="wrap">{message.content}</Text>
        </Box>
      </Box>
    );
  }

  if (isTool) {
    return (
      <Box flexDirection="column" marginBottom={1} borderStyle="round" borderColor="gray" paddingX={1}>
        <Box>
          <Text color="magenta" bold>Tool Result</Text>
          <Text color="gray"> {formatTimestamp(message.timestamp)}</Text>
        </Box>
        <Box marginTop={0}>
          <Text wrap="wrap" color="gray">
            {message.content.split('\n').map((line, i) => (
              <Text key={i}>{line}</Text>
            ))}
          </Text>
        </Box>
      </Box>
    );
  }

  if (isAssistant) {
    return (
      <Box flexDirection="column" marginBottom={1} borderStyle="round" borderColor="green" paddingX={1}>
        <Box>
          <Text color="green" bold>Sheikh</Text>
          <Text color="gray"> {formatTimestamp(message.timestamp)}</Text>
        </Box>
        
        {/* Tool calls display */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text color="yellow" bold>Using tools:</Text>
            {message.toolCalls.map((call, i) => (
              <Box key={call.id || i} marginLeft={2}>
                <Text color="cyan">• {call.toolName}</Text>
              </Box>
            ))}
          </Box>
        )}
        
        {/* Tool results display */}
        {message.toolResults && message.toolResults.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text color="magenta" bold>Tool results:</Text>
            {message.toolResults.map((result, i) => (
              <Box key={result.callId || i} flexDirection="column" marginLeft={2} marginTop={0}>
                <Text color={result.success ? 'green' : 'red'}>
                  {result.success ? '✓' : '✗'} {result.toolName}
                </Text>
                {result.output && (
                  <Box marginTop={0}>
                      <Text color="gray">
                      {result.output.substring(0, 200)}
                      {result.output.length > 200 && '...'}
                    </Text>
                  </Box>
                )}
                {result.error && (
                  <Box marginTop={0}>
                    <Text color="red">{result.error}</Text>
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
        
        {/* Main content */}
        {message.content && (
          <Box marginTop={1}>
            <Text wrap="wrap">{message.content}</Text>
          </Box>
        )}
      </Box>
    );
  }

  // System messages
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color="gray" italic>{message.content}</Text>
    </Box>
  );
}

function Chat({ messages, state }: ChatProps) {
  // Filter out system messages from main view (they're still in history)
  const displayMessages = messages.filter(m => m.role !== 'system');

  return (
    <Box flexDirection="column" height="100%">
      {/* Status indicator */}
      <Box marginBottom={1}>
        <Text color={getStatusColor(state.status)}>
          [{getStatusText(state.status)}]
        </Text>
      </Box>

      {/* Messages */}
      <Box flexDirection="column" flexGrow={1} overflow="hidden">
        {displayMessages.length === 0 ? (
          <Box flexDirection="column" justifyContent="center" alignItems="center" flexGrow={1}>
            <Text color="gray">No messages yet</Text>
            <Text color="gray">Ask me something to get started!</Text>
          </Box>
        ) : (
          displayMessages.map((message, index) => (
            <MessageBubble key={message.id || index} message={message} />
          ))
        )}
      </Box>

      <Spacer />

      {/* Current operation indicator */}
      {state.status !== 'idle' && (
        <Box marginTop={1}>
          <Text color={getStatusColor(state.status)}>
            {state.status === 'thinking' && '◐ Thinking...'}
            {state.status === 'executing' && '▶ Executing tools...'}
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default Chat;
