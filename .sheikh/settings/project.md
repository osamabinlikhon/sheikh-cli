# Sheikh CLI - Project Settings (Scope: Project)
# Shared with all team members
# Location: .sheikh/settings/project.md
# Precedence: Overrides User scope, overridden by Local scope

## Scope Priority
# Managed > Command Line > Local > Project > User

## Model Configuration

### Default Model
model: "kimi-k2.5-free"

### Available Models
- "kimi-k2.5-free"
- "minimax-m2.5-free"  
- "big-pickle"

### Model Switching
Allow model switching: true
Preserve context on switch: true

## Feature Flags

```json
{
  "auto_complete": true,
  "suggestions": true,
  "code_review_on_save": true,
  "verbose_mode": false,
  "background_tasks": true,
  "auto_detect_commands": true,
  "termux_compatibility": true
}
```

## Behavior Settings

### Context Preservation
- Max conversation history: 100 messages
- Auto-compact after: 50 messages
- Preserve file context: true

### Permission Defaults
- Auto-accept read operations: true
- Auto-accept write operations: false
- Auto-accept shell commands: false
- Show confirmations: true

### Notification Settings
- Task completion: true
- Background process updates: true
- Errors: true
- Warnings: true

## Editor Integration

### Preferred Editor
editor: "${EDITOR:-nano}"

### File Associations
```json
{
  "*.ts": "typescript",
  "*.tsx": "typescript-react",
  "*.js": "javascript",
  "*.jsx": "javascript-react",
  "*.py": "python",
  "*.go": "go",
  "*.rs": "rust",
  "*.java": "java",
  "*.sh": "shell"
}
```

## UI Preferences

### Theme
theme: "dark"

### Layout
- Show sidebar: true
- Show status bar: true
- Show task list: false
- Compact mode: false

### Shortcuts
Custom keybindings can override defaults in `.sheikh/keybindings.json`

## Performance

### Limits
- Max file size to read: 1MB
- Max files in glob: 1000
- Shell command timeout: 120s
- API timeout: 60s

### Caching
- Cache file listings: true
- Cache git status: true
- Cache duration: 30s

## MCP Servers

### Local MCP Servers
```json
{
  "filesystem": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home"]
  },
  "git": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-git"]
  }
}
```

### Remote MCP Servers
```json
{
  "brave-search": {
    "url": "https://api.brave.com/mcp",
    "apiKey": "${BRAVE_API_KEY}"
  }
}
```
