# Test Command

## Description
Run the test suite with coverage

## Usage

```bash
/test [pattern]
```

## Parameters

- `pattern` (optional): Test file pattern to match

## Behavior

1. Run `npm test` or `npm test -- [pattern]`
2. Show test results
3. Display coverage summary

## Examples

```
User: /test

Assistant: Running all tests...
✓ 42 tests passed
✓ Coverage: 87%
```

```
User: /test api

Assistant: Running tests matching 'api'...
✓ 8 tests passed
```
