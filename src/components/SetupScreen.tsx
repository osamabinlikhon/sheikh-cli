/**
 * Setup Screen Component
 * 
 * Initial configuration screen for first-time users
 */

import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import gradient from 'gradient-string';

interface SetupScreenProps {
  onComplete: (apiKey: string) => void;
}

const ASCII_LOGO = `
 ██████╗ ██████╗ ███╗   ██╗ ██████╗ ██████╗  █████╗ ███╗   ███╗
██╔════╝██╔═══██╗████╗  ██║██╔════╝ ██╔══██╗██╔══██╗████╗ ████║
██║     ██║   ██║██╔██╗ ██║██║  ███╗██████╔╝███████║██╔████╔██║
██║     ██║   ██║██║╚██╗██║██║   ██║██╔══██╗██╔══██║██║╚██╔╝██║
╚██████╗╚██████╔╝██║ ╚████║╚██████╔╝██║  ██║██║  ██║██║ ╚═╝ ██║
 ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝
`;

type SetupStep = 'welcome' | 'apiKey' | 'verify' | 'complete';

interface SetupState {
  step: SetupStep;
  apiKey: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

function SetupScreen({ onComplete }: SetupScreenProps) {
  const { exit } = useApp();
  const [state, setState] = useState<SetupState>({
    step: 'welcome',
    apiKey: '',
    isLoading: false,
    error: null,
    success: false
  });

  // Handle keyboard input
  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      exit();
    }

    if (state.step === 'welcome' && key.return) {
      setState(prev => ({ ...prev, step: 'apiKey' }));
    }
  });

  // Handle API key verification
  const verifyApiKey = async (apiKey: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Test the API key by making a simple request
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/sheikh/cli',
          'X-Title': 'Sheikh CLI'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 5
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      setState(prev => ({ ...prev, isLoading: false, success: true, step: 'complete' }));
      
      // Wait a moment then complete setup
      setTimeout(() => {
        onComplete(apiKey);
      }, 1000);
    } catch (err) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to verify API key'
      }));
    }
  };

  // Handle Enter key on API key input
  useInput((input, key) => {
    if (state.step === 'apiKey' && key.return) {
      if (state.apiKey.trim().length > 0) {
        verifyApiKey(state.apiKey);
      }
    }
  }, { isActive: state.step === 'apiKey' });

  // Render welcome step
  if (state.step === 'welcome') {
    return (
      <Box flexDirection="column" padding={2}>
        <Text color="cyan" bold>{gradient.pastel(ASCII_LOGO)}</Text>
        
        <Box marginTop={2} flexDirection="column">
          <Text color="white">Welcome to Sheikh!</Text>
          <Text color="gray" dim>
            An extensible, terminal-first agentic tool for developers.
          </Text>
        </Box>

        <Box marginTop={2} flexDirection="column">
          <Text color="yellow" bold>Before we begin, you'll need:</Text>
          <Box marginTop={1} marginLeft={2} flexDirection="column">
            <Text color="gray">1. An OpenRouter API key</Text>
            <Text color="gray" dim>   Get one at: https://openrouter.ai/keys</Text>
          </Box>
        </Box>

        <Box marginTop={3}>
          <Text color="cyan">Press ENTER to continue →</Text>
        </Box>
      </Box>
    );
  }

  // Render API key input step
  if (state.step === 'apiKey') {
    return (
      <Box flexDirection="column" padding={2}>
        <Text color="cyan" bold>{gradient.pastel('Sheikh')}</Text>
        
        <Box marginTop={2} flexDirection="column">
          <Text color="white">Enter your OpenRouter API key:</Text>
          <Text color="gray" dim>
            The key starts with 'sk-or-v1-' and looks like:
          </Text>
          <Text color="gray" dim>
            sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
          </Text>
        </Box>

        <Box marginTop={2}>
          <Text color="cyan">sk-or-v1-</Text>
          <input
            type="password"
            value={state.apiKey}
            onChange={(e) => setState(prev => ({ ...prev, apiKey: e.target.value }))}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontFamily: 'monospace',
              width: '60ch',
              outline: 'none'
            }}
            autoFocus
          />
        </Box>

        {state.error && (
          <Box marginTop={2}>
            <Text color="red">Error: {state.error}</Text>
          </Box>
        )}

        {state.isLoading && (
          <Box marginTop={2}>
            <Text color="yellow">Verifying API key...</Text>
          </Box>
        )}

        <Box marginTop={3}>
          <Text color="gray" dim>Press ENTER to verify | Ctrl+C to cancel</Text>
        </Box>
      </Box>
    );
  }

  // Render completion step
  if (state.step === 'complete') {
    return (
      <Box flexDirection="column" padding={2}>
        <Text color="green" bold size={20}>✓</Text>
        
        <Box marginTop={1}>
          <Text color="green">API key verified successfully!</Text>
        </Box>

        <Box marginTop={2}>
          <Text color="white">Starting Sheikh...</Text>
        </Box>
      </Box>
    );
  }

  return null;
}

export default SetupScreen;
