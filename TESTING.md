# Testing Guide - RetailGen AI

## Overview

This guide outlines the testing strategy, tools, and best practices for RetailGen AI.

**Testing Philosophy:** Write tests that give confidence, not just coverage.

---

## Testing Stack

- **Unit Tests:** Jest
- **Component Tests:** React Testing Library
- **Integration Tests:** Jest + Mocks
- **E2E Tests:** Playwright (recommended)
- **Coverage:** Jest Coverage Reports

---

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test validation.test.ts
```

---

## Test Structure

### Unit Tests (`__tests__/`)

Test individual functions and utilities in isolation.

**Example:**
```typescript
import { sanitizeInput } from '@/lib/security/validation';

describe('sanitizeInput', () => {
  it('should remove HTML tags', () => {
    const input = '<script>alert("xss")</script>Hello';
    expect(sanitizeInput(input)).toBe('alert("xss")Hello');
  });
});
```

### Component Tests (`__tests__/components/`)

Test React components with user interactions.

**Example:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests (`__tests__/api/`)

Test API routes with mocked dependencies.

**Example:**
```typescript
import { POST } from '@/app/api/generate-copy/route';

jest.mock('@/lib/ai/openaiClient');

describe('Generate Copy API', () => {
  it('returns generated copy', async () => {
    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
  });
});
```

---

## Coverage Goals

| Type | Target | Current |
|------|--------|---------|
| **Statements** | 80% | TBD |
| **Branches** | 70% | TBD |
| **Functions** | 70% | TBD |
| **Lines** | 70% | TBD |

---

## Best Practices

### 1. Test Behavior, Not Implementation

❌ **Bad:**
```typescript
it('calls setState with correct value', () => {
  // Testing implementation details
});
```

✅ **Good:**
```typescript
it('displays updated value when button is clicked', () => {
  // Testing user-visible behavior
});
```

### 2. Use Descriptive Test Names

❌ **Bad:**
```typescript
it('works', () => { ... });
```

✅ **Good:**
```typescript
it('should validate email and show error for invalid format', () => { ... });
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should add item to cart', () => {
  // Arrange
  const cart = new ShoppingCart();
  const item = { id: 1, name: 'Product' };
  
  // Act
  cart.addItem(item);
  
  // Assert
  expect(cart.items).toContain(item);
});
```

### 4. Mock External Dependencies

```typescript
jest.mock('@/lib/ai/openaiClient', () => ({
  generateCopy: jest.fn().mockResolvedValue({ headline: 'Test' }),
}));
```

### 5. Test Edge Cases

- Empty inputs
- Null/undefined values
- Maximum values
- Error conditions

---

## E2E Testing (Playwright)

### Setup

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### Example E2E Test

```typescript
import { test, expect } from '@playwright/test';

test('user can create a creative', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Sign in
  await page.click('text=Sign In');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Create creative
  await page.click('text=New Project');
  await page.fill('input[name="name"]', 'Test Creative');
  await page.click('text=Create');
  
  // Verify
  await expect(page).toHaveURL(/\/app\/builder/);
});
```

---

## Performance Testing

### Load Testing (k6)

```javascript
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 10, // 10 virtual users
  duration: '30s',
};

export default function () {
  let res = http.get('http://localhost:3000/api/health');
  check(res, { 'status is 200': (r) => r.status === 200 });
}
```

---

## Security Testing

### Dependency Scanning

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### OWASP ZAP

1. Download OWASP ZAP
2. Configure proxy to localhost:3000
3. Run automated scan
4. Review findings

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
```

---

## Test Maintenance

### When to Update Tests

- When requirements change
- When bugs are found (add regression test)
- When refactoring code
- When tests become flaky

### Avoiding Flaky Tests

- Don't rely on timing (use `waitFor`)
- Mock external services
- Clean up after tests
- Avoid global state

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

*Last Updated: December 2, 2025*
