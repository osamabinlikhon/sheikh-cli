# AGENTS.md - Agentic Coding Guidelines

This file provides guidance for AI agents working in this codebase.

## Project Overview

- **Project**: Sheikh CLI - Agentic coding tool for Termux and terminal environments
- **Language**: TypeScript with React (Ink-based TUI)
- **Package Manager**: npm
- **Build Tool**: esbuild

## Build/Lint/Test Commands

### Build
```bash
npm run build
```
Compiles TypeScript with esbuild to `dist/index.js`.

### Development
```bash
npm run dev    # Run with tsx (hot reload)
npm run start  # Run compiled version
```

### Testing
```bash
npm test           # Run all tests
npm test -- <pattern>  # Run specific test file
```

Note: This project currently has no test scripts or lint scripts configured in package.json. Consider adding them.

### Type Checking
```bash
npx tsc --noEmit   # Type check without emitting
```

---

## Code Style Guidelines

### General Principles
- Write clear, readable code
- Prioritize maintainability over cleverness
- Follow DRY (Don't Repeat Yourself) principle
- Keep functions focused and small

### Naming Conventions
- **PascalCase**: classes, interfaces, types, enums, React components
- **camelCase**: variables, functions, methods, properties
- **UPPER_SNAKE_CASE**: constants
- **Leading underscore**: private fields (if not using `#`)

### Formatting
- **Indentation**: tabs (width: 2)
- **Max line length**: 100 characters
- **Semicolons**: required
- **Quotes**: single for strings, double for JSX attributes
- **Trailing commas**: always

### TypeScript Specific
- Explicit return types for exported functions
- Avoid `any`, use `unknown` when type is uncertain
- Use interfaces for object shapes
- Use types for unions/intersections
- tsconfig uses `strict: false` and `noImplicitAny: false`

### Imports
- Group: external libraries, then internal modules, then relative
- Alphabetize within groups
- No unused imports

### Functions
- Max 20 lines per function
- Max 4 parameters (use object for more)
- Early returns preferred over nested conditionals

### Error Handling
- Use try-catch for async operations
- Create custom error types for domain errors
- Never swallow errors silently

---

## Testing Guidelines

### Test Structure
- Test files: `[name].test.ts` or `[name].spec.ts`
- Location: Same directory as source, or in `tests/` subdirectory
- One describe block per function/component
- Test descriptions: `it('should [expected behavior] when [condition]', ...)`

### AAA Pattern
```typescript
describe('functionName', () => {
  it('should do X when Y', () => {
    // Arrange
    const input = ...;
    // Act
    const result = functionName(input);
    // Assert
    expect(result).toBe(...);
  });
});
```

### Coverage Targets
- Core business logic: >90%
- Utility functions: >80%
- UI components: >70%

### What to Test
- Happy paths, edge cases, error conditions, boundary values
- Do NOT test: implementation details, third-party libraries, trivial code

---

## Security Guidelines

### Secrets
- NEVER commit API keys, passwords, private keys, credentials
- Use `.env` files (already gitignored)
- Never log secrets

### Input Validation
- Validate at boundary
- Whitelist over blacklist
- Sanitize before use

### Dependencies
- Run `npm audit` regularly
- Review new dependencies before adding
- Use lock files

---

## Project Configuration

### Editor Settings
- Preferred: `${EDITOR:-nano}`
- File associations: `*.ts` → typescript, `*.tsx` → typescript-react

### Performance
- Max file size to read: 1MB
- Shell command timeout: 120s
- Max files in glob: 1000

### MCP Servers
Filesystem and Git MCP servers are configured for development.

---

## Additional Rules

### Comments
- JSDoc for public APIs
- Explain "why", not "what"
- TODO format: `// TODO(username): description`
- No commented-out code

### Before Committing
- Run `npm run build` to verify compilation
- Check for any lint issues
- Ensure no hardcoded secrets
