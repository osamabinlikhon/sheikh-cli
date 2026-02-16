# Code Style Rules

## General Principles

- Write clear, readable code
- Prioritize maintainability over cleverness
- Follow DRY (Don't Repeat Yourself) principle
- Keep functions focused and small
- Use meaningful names

## TypeScript/JavaScript

### Naming Conventions
- PascalCase for classes, interfaces, types, enums, React components
- camelCase for variables, functions, methods, properties
- UPPER_SNAKE_CASE for constants
- Leading underscore for private fields (if not using `#`)

### Formatting
- Indentation: tabs (width: 2)
- Max line length: 100 characters
- Semicolons: required
- Quotes: single for strings, double for JSX attributes
- Trailing commas: always

### Functions
- Max 20 lines per function
- Max 4 parameters per function (use object for more)
- Single responsibility principle
- Early returns preferred over nested conditionals

### Types
- Explicit return types for exported functions
- Avoid `any`, use `unknown` when type is uncertain
- Use interfaces for object shapes
- Use types for unions/intersections

### Imports
- Group: external libraries, then internal modules, then relative
- Alphabetize within groups
- No unused imports

### Error Handling
- Use try-catch for async operations
- Create custom error types for domain errors
- Never swallow errors silently

## Comments

- JSDoc for public APIs
- Explain "why", not "what"
- TODO/FIXME format: `// TODO(username): description`
- No commented-out code (use git history)

## Testing

- Test file naming: `[name].test.ts` or `[name].spec.ts`
- One describe block per function/component
- Test descriptions should read like sentences
- AAA pattern: Arrange, Act, Assert
- Mock external dependencies
- Aim for >80% coverage on critical paths
