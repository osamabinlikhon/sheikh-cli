# CLAUDE.md - Claude Code Guidelines

## Project Context

Sheikh CLI is an agentic coding tool for Termux and terminal environments. It's built with TypeScript and React (Ink-based TUI).

## Quick Start

```bash
npm install
npm run dev    # Development
npm run build  # Build
```

## Key Commands

- `npm run build` - Compile with esbuild
- `npm run dev` - Run with tsx (hot reload)
- `npm run start` - Run compiled version
- `npx tsc --noEmit` - Type check

## Architecture

- Entry: `src/index.tsx`
- MCP servers configured for filesystem and git
- Ink-based TUI for terminal UI

## Important Notes

- Package name: `sheikh-termux`
- Uses esbuild for bundling
- React 19 with Ink 6.x for TUI
- TypeScript with loose strict mode
