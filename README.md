# Sheikh CLI 🤖

**AI-Powered Development for Terminal & Termux**

🔌 Extensible: MCP (Model Context Protocol) support for custom integrations  
💻 Terminal-first: Designed for developers who live in the command line  
🛡️ Open source: Apache 2.0 licensed  
🔧 Built-in tools: Google Search grounding, file operations, shell commands, web fetching

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Termux](https://img.shields.io/badge/Termux-Compatible-green.svg)](https://termux.dev/)

## ✨ Features

- 🤖 **AI-Powered** - Built-in support for multiple AI models (Kimi, MiniMax, Big Pickle)
- 📱 **Termux Optimized** - Perfect for Android development on the go
- 🖥️ **GUI Support** - Full X11 desktop environment via VNC
- 🎨 **Beautiful UI** - React Ink-based terminal interface with OpenTUI support
- ⚡ **Extensible** - Plugin system with skills, commands, and MCP servers
- 🔧 **4-Scope Config** - Managed, Project, Local, and User configuration scopes
- 🔌 **MCP Support** - Model Context Protocol for custom integrations
- 🔒 **Secure** - Built-in security rules and permission system

## 🚀 Quick Start

### Standard Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sheikh-cli.git
cd sheikh-cli

# Install dependencies
npm install

# Build
npm run build

# Run
npm start

# Or run in development mode
npm run dev
```

### Termux Installation

```bash
# Install Termux from F-Droid (recommended)
# Then run:
pkg install git nodejs

# Clone and setup
git clone https://github.com/yourusername/sheikh-cli.git
cd sheikh-cli
npm install
npm run build

# Optional: Setup GUI
bash scripts/setup-termux-gui.sh
```

For detailed Termux setup, see [TERMUX.md](TERMUX.md) and [TERMUX_FEATURES.md](TERMUX_FEATURES.md).

## 🎯 Usage

### Basic Commands

```bash
# Start Sheikh CLI
sheikh

# Use specific model
sheikh --model minimax-m2.5-free

# Run command directly
sheikh --run "git status"

# Enable verbose mode
sheikh --verbose
```

### Interactive Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Cancel current operation |
| `Ctrl+L` | Clear chat history |
| `Ctrl+D` | Exit session |
| `Ctrl+G` | Open in editor |
| `Ctrl+O` | Toggle verbose mode |
| `Ctrl+R` | Reverse search history |
| `Ctrl+T` | Toggle task list |
| `Ctrl+B` | Run in background |
| `Alt+P` | Switch AI model |
| `Tab` | Switch panel (chat/files) |
| `↑/↓` | Navigate command history |

### Built-in Commands

```
read <file>              - Read file content
write <path> <content>   - Write to file
glob <pattern>           - Find files
grep <pattern> [path]    - Search in files
run <cmd>                - Execute shell command
cd <dir>                 - Change directory
ls [dir]                 - List directory
clear                    - Clear chat
help                     - Show help
```

## 🏗️ Architecture

### 4-Scope Configuration System

Sheikh CLI uses a hierarchical configuration system:

```
1. Managed (/etc/sheikh/)    ← IT-enforced, unchangeable
2. Command Line (--flags)    ← Session overrides
3. Local (.sheikh/settings/local.md)     ← Personal project
4. Project (.sheikh/settings/project.md) ← Team-shared
5. User (~/.sheikh/settings/user.md)     ← Personal defaults
```

See [Configuration Guide](.sheikh/docs/scopes.md) for details.

### Project Structure

```
sheikh-cli/
├── src/                    # Source code
│   ├── components/         # UI components
│   ├── services/          # Core services
│   └── App.tsx            # Main application
├── .sheikh/               # Configuration
│   ├── settings/          # Scope settings
│   ├── rules/             # Coding rules
│   ├── mcp/               # MCP servers
│   └── docs/              # Documentation
├── skills/                # Auto-discovered skills
├── commands/              # Slash commands
└── scripts/               # Helper scripts
```

## 📱 Termux Features

### Add-ons Support

| Add-on | Description | Status |
|--------|-------------|--------|
| **Termux:API** | Access Android features (camera, location, sensors) | ✅ Supported |
| **Termux:Boot** | Auto-start on device boot | ✅ Supported |
| **Termux:Float** | Floating window mode | ✅ Supported |
| **Termux:Styling** | Custom themes and fonts | ✅ Supported |
| **Termux:Tasker** | Automation integration | ✅ Supported |
| **Termux:Widget** | Home screen shortcuts | ✅ Supported |

Install from F-Droid: https://f-droid.org/packages/com.termux/

### Graphical Environment (X11)

Run Sheikh CLI with full GUI:

```bash
# Setup GUI (one-time)
bash scripts/setup-termux-gui.sh

# Start GUI mode
~/sheikh-gui.sh

# Or manually
vncserver :1
export DISPLAY=:1
xfce4-terminal -e sheikh
```

**X11 Viewers:**
- **VNC Viewer** - Best for interacting with graphical environment
- **XServer XSDL** - Standalone Xorg server, no VNC setup needed
- **Android XServer** - Core X11 protocol with clipboard sharing

**Enable X11 Repository:**
```bash
pkg install x11-repo
```

**Desktop Environments:**
- XFCE (Recommended)
- LXQt
- MATE
- Fluxbox (Lightweight)
- Openbox (Customizable)

See [TERMUX_FEATURES.md](TERMUX_FEATURES.md) for complete setup.

## 🎨 OpenTUI Integration

Sheikh CLI supports OpenTUI as an alternative rendering engine:

```bash
# Install Bun (required for OpenTUI)
curl -fsSL https://bun.sh/install | bash

# Install OpenTUI
bun add @opentui/core

# Run with OpenTUI
bun src/opentui-app.ts
```

See [OPENTUI.md](OPENTUI.md) for integration details.

### Quick OpenTUI Example

```typescript
import { createCliRenderer, Box, Text } from "@opentui/core"

const renderer = await createCliRenderer({
  exitOnCtrlC: true,
})

renderer.root.add(
  Box(
    { borderStyle: "rounded", padding: 1, flexDirection: "column", gap: 1 },
    Text({ content: "Welcome to Sheikh CLI!", fg: "#FFFF00" }),
    Text({ content: "Press Ctrl+C to exit" }),
  ),
)
```

## 🔌 MCP Servers

Sheikh CLI supports Model Context Protocol (MCP) servers for extended functionality:

### Local MCPs
- **filesystem** - File operations
- **git** - Git repository analysis
- **sqlite** - Database queries
- **puppeteer** - Browser automation
- **fetch** - Web content retrieval

### Remote MCPs
- **brave-search** - Web search
- **cloud-db** - Cloud database access

### Termux MCPs
- **termux-api** - Android hardware access
- **storage** - Shared storage operations

Configure in `.sheikh/mcp/config.md`

## ⚙️ Configuration

### Local Settings (Recommended)

Create `.sheikh/settings/local.md`:

```yaml
# Sheikh CLI Configuration
is_termux: true

termux:
  home_dir: "/data/data/com.termux/files/home"
  use_termux_api: true
  low_memory_mode: true
  battery_aware: true
  vibrate_on_complete: true

model: "kimi-k2.5-free"
verbose: false
```

### Available Models

- `kimi-k2.5-free` - Kimi K2.5 (default)
- `minimax-m2.5-free` - MiniMax M2.5
- `big-pickle` - Big Pickle (stealth)

## 🛡️ Security

Sheikh CLI includes comprehensive security features:

- **Security Rules** - Defined in `.sheikh/rules/security.md`
- **Code Review** - Automated security scanning
- **Secrets Detection** - Prevents accidental commits
- **Permission System** - Granular access control
- **Audit Logging** - Track all actions

## 🧪 Development

### Building

```bash
# Development mode
npm run dev

# Production build
npm run build

# Run built version
npm start
```

### Testing

```bash
# Run tests
npm test

# With coverage
npm run test:coverage
```

### Linting

```bash
# Check code
npm run lint

# Fix issues
npm run lint:fix
```

## 📚 Documentation

- [README.md](README.md) - This file
- [TERMUX.md](TERMUX.md) - Termux installation guide
- [TERMUX_FEATURES.md](TERMUX_FEATURES.md) - Advanced Termux features
- [OPENTUI.md](OPENTUI.md) - OpenTUI integration
- [.sheikh/docs/scopes.md](.sheikh/docs/scopes.md) - Configuration scopes
- [.sheikh/mcp/config.md](.sheikh/mcp/config.md) - MCP configuration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ink](https://github.com/vadimdemedes/ink) - React for terminals
- [OpenTUI](https://opentui.dev) - Modern TUI library
- [Termux](https://termux.dev/) - Android terminal emulator
- All contributors and users

## 📞 Support

- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/sheikh-cli/issues)
- 📖 Documentation: See docs in `.sheikh/docs/`

---

**Happy coding with Sheikh CLI!** 🚀

Made with ❤️ for terminal lovers everywhere.
