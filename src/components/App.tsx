/**
 * Main App Component
 * 
 * Root component for the Sheikh terminal interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import gradient from 'gradient-string';
import { Agent, createAgent } from '../core/agent.js';
import { Message, AgentState, CLIFlags } from '../core/types.js';
import { ConfigLoader, getConfig } from '../config/config.js';
import Chat from './Chat.js';
import Input from './Input.js';
import SetupScreen from './SetupScreen.js';

interface AppProps {
  cli?: {
    input: string[];
    flags: CLIFlags;
  };
}

const ASCII_LOGO = `
 ██████╗ ██████╗ ███╗   ██╗ ██████╗ ██████╗  █████╗ ███╗   ███╗
██╔════╝██╔═══██╗████╗  ██║██╔════╝ ██╔══██╗██╔══██╗████╗ ████║
██║     ██║   ██║██╔██╗ ██║██║  ███╗██████╔╝███████║██╔████╔██║
██║     ██║   ██║██║╚██╗██║██║   ██║██╔══██╗██╔══██║██║╚██╔╝██║
╚██████╗╚██████╔╝██║ ╚████║╚██████╔╝██║  ██║██║  ██║██║ ╚═╝ ██║
 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝
                                                             
                    Terminal-First Agentic Tool
`;

interface AppState {
  agent: Agent | null;
  messages: Message[];
  state: AgentState;
  isSetup: boolean;
  isLoading: boolean;
  shellInfo: { shell: string; version: string; cwd: string } | null;
  error: string | null;
}

function App({ cli }: AppProps) {
  const { exit } = useApp();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentState, setAgentState] = useState<AgentState>({
    status: 'idle',
    currentModel: 'loading...',
    tokenUsage: { prompt: 0, completion: 0, total: 0 },
    sessionStart: new Date(),
    messageCount: 0
  });
  const [isSetup, setIsSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [shellInfo, setShellInfo] = useState<{ shell: string; version: string; cwd: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize agent
  useEffect(() => {
    async function init() {
      try {
        const config = getConfig();
        
        // Check if API key is configured
        if (!config.isValid()) {
          setIsSetup(true);
          setIsLoading(false);
          return;
        }

        // Create agent
        const newAgent = createAgent({
          onStateChange: (state) => setAgentState(state),
          onMessage: (message) => setMessages(prev => {
            const exists = prev.find(m => m.id === message.id);
            if (exists) {
              return prev.map(m => m.id === message.id ? message : m);
            }
            return [...prev, message];
          })
        });

        setAgent(newAgent);

        // Get shell info
        const info = await newAgent.getShellInfo();
        setShellInfo(info);

        // Check health
        const healthy = await newAgent.healthCheck();
        if (!healthy) {
          setError('Failed to connect to OpenRouter. Please check your API key.');
        }

        // Process initial input if provided
        if (cli?.input && cli.input.length > 0) {
          const input = cli.input.join(' ');
          await newAgent.processMessage(input);
        }

        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      }
    }

    init();
  }, [cli]);

  // Handle input submission
  const handleSubmit = useCallback(async (input: string) => {
    if (!agent || !input.trim()) return;

    try {
      await agent.processMessage(input);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing message');
    }
  }, [agent]);

  // Handle setup completion
  const handleSetupComplete = useCallback((apiKey: string) => {
    if (agent) {
      agent.configure(apiKey);
    } else {
      const config = getConfig();
      config.setApiKey(apiKey);
      window.location.reload(); // Simple reload to reinitialize
    }
    setIsSetup(false);
  }, [agent]);

  // Handle keyboard interrupt
  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exit();
    }
  });

  // Show setup screen if needed
  if (isSetup) {
    return <SetupScreen onComplete={handleSetupComplete} />;
  }

  // Show loading
  if (isLoading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="cyan">{gradient.pastel(ASCII_LOGO)}</Text>
        <Box marginTop={1}>
          <Text color="gray">Initializing Sheikh...</Text>
        </Box>
        {error && (
          <Box marginTop={1}>
            <Text color="red">{error}</Text>
          </Box>
        )}
      </Box>
    );
  }

  // Main interface
  return (
    <Box flexDirection="column" height="100%">
      {/* Header */}
      <Box borderStyle="round" borderColor="cyan" paddingX={2} marginBottom={1}>
        <Box flexDirection="column">
          <Text color="cyan" bold>{gradient.pastel('Sheikh')}</Text>
          <Box flexDirection="row" gap={2}>
            <Text color="gray" dim>Model: {agentState.currentModel}</Text>
            <Text color="gray" dim>│</Text>
            <Text color="gray" dim>Tokens: {agentState.tokenUsage.total}</Text>
            <Text color="gray" dim>│</Text>
            <Text color="gray" dim>Shell: {shellInfo?.shell || 'unknown'}</Text>
          </Box>
        </Box>
      </Box>

      {/* Chat Area */}
      <Box flexDirection="column" flexGrow={1} overflow="hidden">
        <Chat messages={messages} state={agentState} />
      </Box>

      {/* Input Area */}
      <Box marginTop={1}>
        <Input 
          onSubmit={handleSubmit}
          placeholder="Ask Sheikh to help you..."
          disabled={agentState.status !== 'idle'}
        />
      </Box>

      {/* Footer */}
      <Box marginTop={1}>
        <Text color="gray" dim>
          Press &lt;Ctrl+C&gt; to exit  │  Tab to complete  │  ↑↓ for history
        </Text>
      </Box>
    </Box>
  );
}

export default App;
