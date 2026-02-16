# GEMINI.md - Gemini AI Guidelines

## Overview

Sheikh CLI - Agentic coding assistant for Termux and terminal environments.

## Tech Stack

- **Language**: TypeScript
- **UI Framework**: React with Ink (terminal UI)
- **Build**: esbuild
- **Package Manager**: npm

## Development Commands

```bash
npm run dev    # Hot reload development
npm run build  # Production build to dist/index.js
npm run start  # Run built version
npx tsc --noEmit  # Type checking
```

## Project Structure

```
src/          # TypeScript source
dist/         # Compiled output
package.json  # Dependencies and scripts
```

## Key Dependencies

- `@modelcontextprotocol/sdk` - MCP protocol
- `ink` - React for CLI
- `react` - UI library
- `zx` - Shell scripting
- `shelljs` - File operations

## Build Output

- Main: `dist/index.js`
- Format: ESM
- Platform: Node.js
