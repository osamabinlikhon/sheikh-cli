/**
 * Input Component
 * 
 * Terminal input with history navigation and autocomplete
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';

interface InputProps {
  onSubmit: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  initialValue?: string;
}

interface HistoryItem {
  value: string;
  timestamp: Date;
}

function Input({ 
  onSubmit, 
  placeholder = 'Type a message...', 
  disabled = false,
  initialValue = '' 
}: InputProps) {
  const [value, setValue] = useState(initialValue);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<any>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Simple in-memory history storage for terminal environment
  let memoryHistory: HistoryItem[] = [];

  // Load history from storage on mount
  useEffect(() => {
    try {
      // Try to load from file system first (Node.js environment)
      const { readFileSync, existsSync } = require('fs');
      const homeDir = process.env.HOME || process.env.USERPROFILE || '';
      const historyFile = `${homeDir}/.sheikh_history`;
      
      if (existsSync(historyFile)) {
        const saved = readFileSync(historyFile, 'utf-8');
        const parsed = JSON.parse(saved);
        setHistory(parsed);
        memoryHistory = parsed;
      }
    } catch {
      // Ignore history loading errors
    }
  }, []);

  // Handle submission
  const handleSubmit = useCallback((input: string) => {
    if (!input.trim()) return;

    // Add to history
    const newItem = { value: input.trim(), timestamp: new Date() };
    const newHistory = [newItem, ...history.slice(0, 99)]; // Keep last 100 items
    setHistory(newHistory);
    memoryHistory = newHistory;
    
    try {
      // Save to file system (Node.js environment)
      const { writeFileSync, existsSync } = require('fs');
      const homeDir = process.env.HOME || process.env.USERPROFILE || '';
      const historyFile = `${homeDir}/.sheikh_history`;
      writeFileSync(historyFile, JSON.stringify(newHistory));
    } catch {
      // Ignore history saving errors
    }

    // Reset state
    setValue('');
    setHistoryIndex(-1);
    setSuggestions([]);

    // Submit
    onSubmit(input);
  }, [history, onSubmit]);

  // Handle keyboard input
  useInput((input, key) => {
    if (disabled) return;

    // History navigation
    if (key.upArrow) {
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setValue(history[newIndex].value);
      }
    }

    if (key.downArrow) {
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setValue(history[newIndex].value);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setValue('');
      }
    }

    // Clear on Ctrl+L or clear screen command
    if (key.ctrl && input === 'l') {
      setValue('');
      setHistoryIndex(-1);
    }
  }, { isActive: !disabled });

  // Common commands for autocomplete
  const commonCommands = [
    'List files in current directory',
    'Show git status',
    'Create a new file',
    'Run npm install',
    'Show disk usage',
    'Check running processes',
    'Show network connections',
    'Find files matching',
    'Read file',
    'Write to file',
    'Create directory',
    'Delete file',
    'Execute shell command',
    'Show memory usage',
    'Show CPU usage'
  ];

  // Generate suggestions
  const generateSuggestions = (input: string): string[] => {
    if (!input || input.length < 2) return [];
    
    const lower = input.toLowerCase();
    return commonCommands
      .filter(cmd => cmd.toLowerCase().includes(lower))
      .slice(0, 5);
  };

  // Handle value change
  const handleChange = useCallback((newValue: string) => {
    setValue(newValue);
    setHistoryIndex(-1);
    setSuggestions(generateSuggestions(newValue));
  }, []);

  return (
    <Box flexDirection="column">
      {/* Input line */}
      <Box>
        <Text color="cyan" bold>sheikh</Text>
        <Text color="gray"> › </Text>
        <TextInput
          value={value}
          onChange={handleChange}
          onSubmit={handleSubmit}
          placeholder={disabled ? 'Processing...' : placeholder}
          focus={!disabled}
        />
        />
        {disabled && (
          <Text color="yellow"> ◐</Text>
        )}
      </Box>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Box flexDirection="column" marginTop={0} marginLeft={8}>
          {suggestions.map((suggestion, index) => (
            <Text key={index} color="gray">
              {index === 0 ? '▸ ' : '  '}{suggestion}
            </Text>
          ))}
        </Box>
      )}

      {/* History indicator */}
      {history.length > 0 && historyIndex === -1 && (
        <Box marginTop={0}>
          <Text color="gray">
            ↑ {history.length} previous {history.length === 1 ? 'command' : 'commands'}
          </Text>
        </Box>
      )}

      {/* Current history item indicator */}
      {historyIndex >= 0 && (
        <Box marginTop={0}>
          <Text color="gray">
            Viewing history ({historyIndex + 1}/{history.length}): Press Enter to use, ↓ to clear
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default Input;
