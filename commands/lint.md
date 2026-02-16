# Lint Command

## Description
Run linter and fix issues

## Usage

```bash
/lint [fix]
```

## Parameters

- `fix` (optional): Automatically fix linting issues

## Behavior

1. Run linter on all source files
2. Report errors and warnings
3. Fix issues if requested

## Example

```
User: /lint fix

Assistant: Running linter with auto-fix...
✓ 3 issues fixed automatically
⚠ 2 manual fixes required:
  - src/App.tsx:45: unused import
  - src/utils.ts:12: any type used
```
