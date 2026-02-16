# Sheikh CLI - MCP Server Configuration
# Model Context Protocol servers for extending functionality

## Overview

MCP (Model Context Protocol) servers provide additional capabilities to Sheikh CLI
through standardized interfaces. Servers can be LOCAL (running on your machine)
or REMOTE (hosted in the cloud).

## Local MCP Servers

Local servers run on your machine and have full access to your environment.

### Filesystem Server
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home"],
      "description": "Access and manipulate files"
    }
  }
}
```

### Git Server
```json
{
  "mcpServers": {
    "git": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-git"],
      "description": "Git operations and repository analysis"
    }
  }
}
```

### SQLite Server
```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "/path/to/db.sqlite"],
      "description": "Query SQLite databases"
    }
  }
}
```

### Memory Server
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "description": "Knowledge graph for persistent memory"
    }
  }
}
```

### Puppeteer Server
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
      "description": "Browser automation and web scraping"
    }
  }
}
```

### Fetch Server
```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"],
      "description": "Web content fetching"
    }
  }
}
```

## Remote MCP Servers

Remote servers are hosted in the cloud and accessed via HTTP/WebSocket.

### Brave Search
```json
{
  "mcpServers": {
    "brave-search": {
      "url": "https://api.brave.com/mcp",
      "apiKey": "${BRAVE_API_KEY}",
      "description": "Web search via Brave API"
    }
  }
}
```

### Cloud Database
```json
{
  "mcpServers": {
    "cloud-db": {
      "url": "wss://db.example.com/mcp",
      "apiKey": "${DB_API_KEY}",
      "description": "Cloud database access"
    }
  }
}
```

## Termux-Specific MCP Servers

Optimized for Android/Termux environment.

### Termux API Server
```json
{
  "mcpServers": {
    "termux-api": {
      "command": "termux-api",
      "args": [],
      "description": "Access Android device features",
      "env": {
        "TERMUX_API_VERSION": "0.50"
      }
    }
  }
}
```

### Storage Access
```json
{
  "mcpServers": {
    "storage": {
      "command": "node",
      "args": ["./scripts/mcp-storage.js"],
      "description": "Access shared storage on Android"
    }
  }
}
```

## Configuration File Locations

MCP servers can be configured at different scopes:

1. **Managed**: `/etc/sheikh/mcp.json` - Organization-wide
2. **User**: `~/.sheikh/mcp.json` - Personal servers
3. **Project**: `.sheikh/mcp.json` - Team-shared
4. **Local**: `.sheikh/mcp.local.json` - Personal project overrides

## Security Considerations

### Local Servers
- Have full filesystem access (respects scope permissions)
- Can execute shell commands
- Use with caution - review code before running

### Remote Servers
- API keys stored in environment variables
- HTTPS required for production
- Rate limiting applies

### Best Practices
1. Pin versions in npx commands
2. Use environment variables for secrets
3. Review server permissions before enabling
4. Disable unused servers to reduce attack surface

## Writing Custom MCP Servers

### Basic Structure
```typescript
// my-mcp-server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

const server = new Server({
  name: 'my-server',
  version: '1.0.0'
}, {
  capabilities: {
    tools: {}
  }
});

server.setRequestHandler('tools/list', async () => {
  return {
    tools: [{
      name: 'my_tool',
      description: 'Does something useful',
      inputSchema: {
        type: 'object',
        properties: {
          input: { type: 'string' }
        }
      }
    }]
  };
});

server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'my_tool') {
    const input = request.params.arguments?.input;
    return {
      content: [{
        type: 'text',
        text: `Processed: ${input}`
      }]
    };
  }
  throw new Error('Unknown tool');
});

server.listen();
```

## Troubleshooting

### Server Won't Start
- Check Node.js version (>= 18)
- Verify npx is available
- Check firewall settings for remote servers

### Connection Issues
- Verify API keys are set in environment
- Check server URL is accessible
- Review server logs

### Performance
- Limit concurrent MCP servers
- Use local servers for heavy operations
- Cache results when possible
