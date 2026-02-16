# Testing Rules

## Philosophy

- Tests are documentation
- Tests enable confident refactoring
- Write tests before fixing bugs
- Test behavior, not implementation

## Test Structure

### File Organization
```
src/
├── utils.ts
├── utils.test.ts      # Unit tests
├── integration/
│   └── api.test.ts    # Integration tests
└── e2e/
    └── flow.test.ts   # End-to-end tests
```

### Naming Conventions
- Test files: `[module].test.ts`
- Test suites: `describe('[module]', ...)`
- Test cases: `it('should [expected behavior] when [condition]', ...)`

## Unit Tests

### Coverage Requirements
- Core business logic: >90%
- Utility functions: >80%
- UI components: >70%

### What to Test
- ✅ Happy paths
- ✅ Edge cases (empty input, null, undefined)
- ✅ Error conditions
- ✅ Boundary values
- ❌ Implementation details
- ❌ Third-party libraries
- ❌ Trivial code (getters/setters)

### Example
```typescript
// Good
describe('calculateTotal', () => {
  it('should return sum of all items', () => {
    const items = [{ price: 10 }, { price: 20 }];
    expect(calculateTotal(items)).toBe(30);
  });

  it('should return 0 for empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('should throw error for negative price', () => {
    expect(() => calculateTotal([{ price: -10 }]))
      .toThrow('Price cannot be negative');
  });
});
```

## Integration Tests

### Scope
- API endpoints
- Database operations
- External service integrations
- Authentication flows

### Setup
- Use test database
- Reset state between tests
- Mock external APIs
- Test realistic scenarios

## End-to-End Tests

### When to Use
- Critical user flows
- Cross-component interactions
- Smoke tests

### Guidelines
- Keep tests independent
- Clean up after tests
- Use realistic test data
- Minimize test duration

## Test Data

### Fixtures
- Store in `tests/fixtures/`
- Use factories for generating test data
- Keep fixtures minimal and focused

```typescript
// factory.ts
export const createUser = (overrides?: Partial<User>): User => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  ...overrides,
});
```

## Mocking

### When to Mock
- External APIs
- Database (in unit tests)
- File system
- Timers
- Random generators

### Best Practices
- Mock at the boundary
- Restore original behavior after tests
- Use explicit mock values
- Document why mocking is needed

## Test Commands

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific file
npm test -- utils.test.ts

# Run in watch mode
npm run test:watch

# Run e2e tests
npm run test:e2e
```

## CI/CD Integration

- All tests must pass before merge
- Coverage reports generated
- Flaky tests must be fixed or removed
- Test duration < 5 minutes ideally
