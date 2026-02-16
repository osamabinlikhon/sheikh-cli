# Sheikh CLI - Quick Reference Guide

## 🚀 Getting Started (30 seconds)

```bash
# Install
npm install && npm run build

# Run
npm start

# Or develop
npm run dev
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Cancel / Exit |
| `Ctrl+L` | Clear chat |
| `Ctrl+D` | Exit session |
| `Ctrl+G` | Open in editor |
| `Ctrl+O` | Toggle verbose |
| `Ctrl+R` | Search history |
| `Ctrl+T` | Toggle task list |
| `Ctrl+B` | Run background |
| `Alt+P` | Switch model |
| `Tab` | Switch panel |
| `↑/↓` | Navigate history |

## 📝 Commands

```bash
read <file>              # Read file
write <path> <content>   # Write file
glob <pattern>           # Find files
grep <pattern> [path]    # Search files
run <cmd>                # Run shell command
cd <dir>                 # Change directory
ls [dir]                 # List directory
clear                    # Clear chat
help                     # Show help
```

## 📱 Termux Quick Setup

```bash
# One-line GUI setup
bash scripts/setup-termux-gui.sh

# Start GUI
~/sheikh-gui.sh

# Connect VNC Viewer to: 127.0.0.1:5901
```

## ⚙️ Configuration Files

| Scope | Location | Purpose |
|-------|----------|---------|
| Local | `.sheikh/settings/local.md` | Personal project settings |
| Project | `.sheikh/settings/project.md` | Team-shared settings |
| User | `~/.sheikh/settings/user.md` | Personal defaults |
| Managed | `/etc/sheikh/` | IT-enforced (unchangeable) |

## 🤖 Available Models

- `kimi-k2.5-free` - Kimi K2.5 (default)
- `minimax-m2.5-free` - MiniMax M2.5
- `big-pickle` - Big Pickle

Switch with: `Alt+P` or add `model: "model-name"` to config

## 🔌 MCP Servers

```yaml
# In .sheikh/mcp/config.md
mcpServers:
  filesystem:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/home"]
  
  git:
    command: "npx"
    args: ["-y", "@modelcontextprotocol/server-git"]
```

## 🎨 OpenTUI (Alternative UI)

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install OpenTUI
bun add @opentui/core

# Run OpenTUI version
bun src/opentui-app.ts
```

## 🛠️ Common Tasks

### Change Model
```bash
# In session
Alt+P

# Or in config
model: "minimax-m2.5-free"
```

### Enable Verbose Mode
```bash
# Shortcut
Ctrl+O

# Or flag
sheikh --verbose
```

### Run Background Task
```bash
# Type command, then
Ctrl+B
```

### Setup GUI Mode
```bash
bash scripts/setup-termux-gui.sh
~/sheikh-gui.sh
```

### Add Home Screen Widget
```bash
# Create shortcut
mkdir -p ~/.shortcuts
echo '#!/bin/bash\nsheikh' > ~/.shortcuts/sheikh.sh
chmod +x ~/.shortcuts/sheikh.sh

# Add widget from Termux:Widget
```

## 🔧 Troubleshooting

### Build Errors
```bash
# Clean install
rm -rf node_modules dist
npm install
npm run build
```

### VNC Black Screen
```bash
vncserver -kill :1
rm -rf ~/.vnc/*.pid
vncserver :1
```

### Permission Denied
```bash
chmod +x scripts/*.sh
chmod +x ~/.local/bin/sheikh
```

### Out of Memory
```yaml
# In .sheikh/settings/local.md
termux:
  low_memory_mode: true
performance:
  max_concurrent_tasks: 1
```

## 📚 Documentation

- `README.md` - Main documentation
- `TERMUX.md` - Termux installation
- `TERMUX_FEATURES.md` - Advanced Termux features
- `OPENTUI.md` - OpenTUI integration
- `.sheikh/docs/scopes.md` - Configuration system
- `.sheikh/mcp/config.md` - MCP servers

## 💡 Tips

1. **Use Local Config** - Put personal settings in `.sheikh/settings/local.md` (gitignored)
2. **Enable Termux API** - Install for notifications, vibrations, and hardware access
3. **Setup VNC Once** - Then just run `~/sheikh-gui.sh` to start GUI
4. **Use Aliases** - Add shortcuts in `.sheikh/settings/local.md`
5. **Battery Aware** - Enable in config to pause on low battery

## 🔗 Links

- F-Droid: https://f-droid.org/packages/com.termux/
- VNC Viewer: Play Store or https://www.realvnc.com/
- OpenTUI: https://opentui.dev
- Sheikh CLI: https://github.com/yourusername/sheikh-cli

---

**Pro Tip:** Press `Ctrl+R` to search through your command history!
