#!/usr/bin/env node

/**
 * Sheikh CLI Entry Point
 * 
 * Extensible, terminal-first agentic tool for developers
 * Built with Node.js, TypeScript, and Ink
 */

import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import App from '../src/components/App.js';

const cli = meow(`
  Sheikh - Terminal-First Agentic Tool
  
  Usage
    $ sheikh [options]

  Options
    --model, -m      Specify LLM model (default: openrouter/anthropic/claude-3-5-sonnet)
    --temperature, -t Set temperature (default: 0.7)
    --no-stream      Disable streaming responses
    --unsafe         Enable dangerous commands without confirmation
    --config, -c     Config file path (default: ~/.sheikhrc)
    --help           Show this help
    --version        Show version

  Examples
    $ sheikh "List files in current directory"
    $ sheikh -m openai/gpt-4o "Create a React component"
    $ sheikh --unsafe "Run rm -rf on temp files"

  For more information, visit:
    https://github.com/sheikh/cli
`, {
  importMeta: import.meta,
  flags: {
    model: {
      type: 'string',
      shortFlag: 'm',
      default: 'anthropic/claude-3-5-sonnet'
    },
    temperature: {
      type: 'number',
      shortFlag: 't',
      default: 0.7
    },
    stream: {
      type: 'boolean',
      default: true
    },
    unsafe: {
      type: 'boolean',
      default: false
    },
    config: {
      type: 'string',
      shortFlag: 'c',
      default: '~/.sheikhrc'
    }
  }
});

// Initialize and render the App
const app = React.createElement(App, {
  cli: cli
});

render(app, {
  patchConsole: false,
  exitOnCtrlC: true
});
