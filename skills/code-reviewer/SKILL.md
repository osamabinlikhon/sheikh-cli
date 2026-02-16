# Code Reviewer Skill

## Description

Automated code review assistant that analyzes code for quality, security, performance, and maintainability issues.

## Invocation

This skill is automatically invoked when:
- User asks for code review
- User mentions "review", "check", "audit" in context of code
- Before committing changes to repository
- When analyzing pull requests

## Capabilities

### Code Analysis
- **Quality**: Check for code smells, anti-patterns, and best practices
- **Security**: Identify potential security vulnerabilities
- **Performance**: Detect performance bottlenecks and optimization opportunities
- **Maintainability**: Assess code complexity, documentation, and test coverage

### Language Support
- TypeScript/JavaScript
- Python
- Go
- Rust
- Java
- C/C++
- Shell scripts

## Workflow

1. **Read Code**: Load the file(s) to be reviewed
2. **Analyze**: Run static analysis checks
3. **Review**: Examine logic, patterns, and conventions
4. **Report**: Provide actionable feedback with severity levels

## Output Format

```
## Code Review: [filename]

### Summary
- Severity: [Critical | High | Medium | Low]
- Issues Found: [count]
- Lines Reviewed: [count]

### Issues

#### 🔴 Critical
1. **[Issue Title]** (Line [number])
   - **Problem**: Description
   - **Impact**: Why it matters
   - **Fix**: Suggested solution

#### 🟠 High
...

#### 🟡 Medium
...

#### 🟢 Low
...

### Recommendations
- [Specific improvements]

### Positive Highlights
- [Good practices found]
```

## Guidelines

### Security Checks
- [ ] SQL injection vulnerabilities
- [ ] XSS vulnerabilities
- [ ] Hardcoded secrets/credentials
- [ ] Insecure dependencies
- [ ] Path traversal risks
- [ ] Unsafe deserialization

### Performance Checks
- [ ] N+1 queries
- [ ] Memory leaks
- [ ] Blocking operations
- [ ] Inefficient algorithms (O(n²) when O(n) possible)
- [ ] Unnecessary re-renders/computations

### Quality Checks
- [ ] Function/method length (< 50 lines ideally)
- [ ] Cyclomatic complexity (< 10 ideally)
- [ ] Meaningful variable names
- [ ] Consistent formatting
- [ ] Proper error handling
- [ ] Type safety
- [ ] Documentation coverage

### Testing Checks
- [ ] Unit test coverage
- [ ] Edge cases handled
- [ ] Integration tests where appropriate
- [ ] Mock usage correctness

## Example Usage

```
User: "Please review src/services/api.ts"

Assistant: [Runs code review skill]

## Code Review: src/services/api.ts

### Summary
- Severity: Medium
- Issues Found: 3
- Lines Reviewed: 142

### Issues

#### 🟠 High
1. **Missing Error Handling** (Line 45)
   - **Problem**: API call lacks try-catch block
   - **Impact**: Unhandled exceptions will crash the application
   - **Fix**: Wrap in try-catch and handle specific error types

#### 🟡 Medium
...

### Recommendations
...
```

## Configuration

Users can customize review strictness:
- `strict`: Enforce all rules strictly
- `balanced`: Reasonable defaults (default)
- `lenient`: Only critical issues

## Dependencies

None required. Uses built-in code analysis capabilities.
