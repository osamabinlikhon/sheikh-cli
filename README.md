# Sheikh - Terminal-First Agentic Tool for Developers

<p align="center">
  <img src="https://img.shields.io/badge/Sheikh-CLI-blue?style=for-the-badge&logo=terminal" alt="Sheikh CLI">
  <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License">
</p>

<p align="center">
  An extensible, terminal-first agentic CLI tool designed for developers who live in the command line. Built with Node.js, TypeScript, and Ink (React for Terminal UI).
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## ✨ Features

Sheikh brings the power of AI agents directly to your terminal with a rich, interactive experience:

- **Terminal-First UI**: Beautiful React-based terminal interface built with Ink
- **Streaming Responses**: Real-time character-by-character output from LLMs
- **Extensible Architecture**: Plugin system for adding custom tools and capabilities
- **Multi-Model Support**: Works with any OpenRouter-compatible model
- **Secure Configuration**: Local configuration with API key management
- **Interactive Chat**: Full-featured chat interface with history
- **File Operations**: Read, write, and manage files directly from chat
- **Shell Integration**: Execute shell commands with safety controls

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- An OpenRouter API key (get one at [openrouter.ai](https://openrouter.ai))

### Installation

```bash
# Clone the repository
git clone https://github.com/osamabinador/Sheikh-CLi.git
cd Sheikh-CLi

# Install dependencies
npm install

# Build the project
npm run build

# Install globally (optional)
npm install -g .

# Or run directly
npm run dev -- "Your first prompt"
```

### Initial Setup

On first launch, Sheikh will prompt you for your OpenRouter API key. Your configuration is saved locally at `~/.sheikhrc`.

---

## 📖 Usage

### Basic Commands

```bash
# Interactive chat mode
sheikh

# Single prompt mode
sheikh "List files in current directory"

# Specify a different model
sheikh -m openai/gpt-4o "Create a React component"

# Disable streaming for slower connections
sheikh --no-stream "Analyze this code"

# Allow dangerous commands without confirmation
sheikh --unsafe "Clean up temporary files"
```

### Command Line Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--model` | `-m` | LLM model to use | `anthropic/claude-3-5-sonnet` |
| `--temperature` | `-t` | Set creativity level (0-1) | `0.7` |
| `--no-stream` | - | Disable streaming responses | `false` |
| `--unsafe` | - | Skip safety confirmations | `false` |
| `--config` | `-c` | Config file path | `~/.sheikhrc` |
| `--help` | - | Show help | - |
| `--version` | - | Show version | - |

### Interactive Commands

Once in the interactive chat, use these commands:

- `/clear` - Clear the conversation history
- `/model [name]` - Switch to a different model
- `/tokens` - Show token usage statistics
- `/exit` - Quit the application

---

## ⚙️ Configuration

Sheikh uses a local configuration file for storing API keys and preferences. By default, this is located at `~/.sheikhrc`.

### Manual Configuration

Create or edit `~/.sheikhrc`:

```json
{
  "apiKey": "your-openrouter-api-key",
  "defaultModel": "openai/gpt-4o-mini",
  "temperature": 0.7,
  "stream": true,
  "unsafeMode": false
}
```

### Available Models

Sheikh supports any model available through OpenRouter. Popular choices include:

| Model | Provider | Best For |
|-------|----------|----------|
| `anthropic/claude-3-5-sonnet` | Anthropic | General reasoning, coding |
| `openai/gpt-4o` | OpenAI | Fast responses, multitasking |
| `openai/gpt-4o-mini` | OpenAI | Cost-effective tasks |
| `google/gemini-pro` | Google | Large context, analysis |
| `meta-llama/llama-3.1-405b` | Meta | Open-source alternative |

---

## 🏗️ Architecture

Sheikh is built with a clean, modular architecture using Hexagonal principles:

```
src/
├── bin/sheikh.js          # CLI entry point
├── components/            # React/Ink UI components
│   ├── App.tsx           # Main application component
│   ├── Chat.tsx          # Chat history display
│   ├── Input.tsx         # User input field
│   └── SetupScreen.tsx   # Initial configuration
├── core/                  # Business logic
│   ├── agent.ts          # Agent state machine
│   ├── llm.ts            # LLM integration
│   └── types.ts          # TypeScript type definitions
├── tools/                 # Built-in tools
│   ├── filesystem.ts     # File operations
│   └── shell.ts          # Shell command execution
├── plugins/               # Plugin system
│   ├── loader.ts         # Plugin loader
│   └── types.ts          # Plugin type definitions
├── config/                # Configuration management
└── utils/                 # Utility functions
```

### Core Components

**Agent Brain** (`src/core/agent.ts`): Manages conversation state, tool selection, and response generation.

**LLM Adapter** (`src/core/llm.ts`): Handles communication with OpenRouter API with streaming support.

**UI Layer** (`src/components/`): React components rendered in the terminal using Ink.

**Tool System** (`src/tools/`): Extensible tools for file operations and shell commands.

---

## 🛠️ Development

### Project Structure

```
Sheikh-CLi/
├── bin/                  # Executable entry points
├── src/                  # Source code
│   ├── components/       # UI components (React/Ink)
│   ├── core/            # Core agent logic
│   ├── tools/           # Built-in tools
│   ├── plugins/         # Plugin system
│   ├── config/          # Configuration
│   └── utils/           # Utilities
├── dist/                # Compiled JavaScript
├── test files/          # Test scripts
└── package.json
```

### Development Commands

```bash
# Run in development mode (no build required)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Start from dist
npm start

# Clean dist folder
rm -rf dist && npm run build
```

### Adding New Tools

Create a new tool by extending the base Tool class:

```typescript
// src/tools/customTool.ts
import { Tool, ToolResult } from '../core/types';

export class CustomTool extends Tool {
  name = 'custom_tool';
  description = 'Description of what this tool does';
  
  async execute(args: string): Promise<ToolResult> {
    // Your tool logic here
    return { success: true, output: 'Result' };
  }
}
```

### Creating Plugins

Extend the plugin system to add new capabilities:

```typescript
// src/plugins/myPlugin.ts
import { Plugin, PluginContext } from './types';

export class MyPlugin implements Plugin {
  name = 'my-plugin';
  
  async initialize(context: PluginContext): Promise<void> {
    // Set up your plugin
  }
  
  async execute(input: string): Promise<string> {
    // Plugin logic
    return result;
  }
}
```

---

## 📊 Visualization Demo

Sheikh includes a visualization demo that showcases streaming and terminal graphics:

```bash
# Run the visualization dashboard
python3 sheikh_ops_dashboard.py
```

This demonstrates:

- ASCII art banners
- Character-by-character text streaming
- Animated progress bars
- Color-coded bar charts
- Real-time log streaming
- Auto-generated reports

---

## 🔒 Security

- **API Keys**: Stored locally in `~/.sheikhrc` with user-only permissions
- **Command Safety**: Shell commands require explicit approval unless `--unsafe` is used
- **Sandboxing**: File operations are scoped to accessible directories
- **No External Calls**: All API calls go through OpenRouter only

### Safety Best Practices

1. Review all shell commands before execution
2. Use `--unsafe` only when absolutely necessary
3. Keep your API key secure and never commit it to version control
4. Consider using a dedicated API key with restricted permissions

---

## 📝 API Reference

### Agent API

```typescript
import { Agent } from './src/core/agent';

const agent = new Agent({
  model: 'anthropic/claude-3-5-sonnet',
  temperature: 0.7,
  stream: true
});

// Send a message
const response = await agent.send('Hello, Sheikh!');

// Stream responses
for await (const chunk of agent.stream('Tell me a story')) {
  process.stdout.write(chunk);
}
```

### Tool System

```typescript
import { ShellTool, FilesystemTool } from './src/tools';

// Execute shell commands
const shell = new ShellTool();
const result = await shell.execute('ls -la');

// Manage files
const fs = new FilesystemTool();
await fs.readFile('/path/to/file.txt');
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR-USERNAME/Sheikh-CLi.git
cd Sheikh-CLi

# Create feature branch
git checkout -b feature/your-feature

# Install dependencies
npm install

# Make changes, then build and test
npm run build
npm test

# Submit PR
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Ink](https://github.com/vadimdemedes/ink) - React for interactive CLI
- [OpenRouter](https://openrouter.ai) - Unified LLM API gateway
- [React](https://reactjs.org) - UI framework
- [Node.js](https://nodejs.org) - JavaScript runtime

---

<p align="center">
  Built with ❤️ by the Sheikh Team
</p>
