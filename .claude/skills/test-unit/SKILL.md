---
name: test-unit
description: Run unit tests with Vitest for React components and hooks
---

# Unit Tests (Vitest)

Run unit tests for Cantou app components and utilities.

## Commands

### Run all tests
```bash
npm run test:unit
```

### Run with UI
```bash
npm run test:unit -- --ui
```

### Run specific file
```bash
npm run test:unit -- src/App.test.jsx
```

### Watch mode
```bash
npm run test:unit -- --watch
```

### Coverage
```bash
npm run test:unit -- --coverage
```

## File Structure

Tests live alongside source code:
```
src/
  App.jsx
  App.test.jsx          # App component tests
  hooks/
    useExpenses.jsx
    useExpenses.test.jsx # Hook tests
  components/
    ExpenseRow.jsx
    ExpenseRow.test.jsx  # Component tests
```

## Test Categories

- **Hooks** (`useExpenses`, `useMeals`, etc.): CRUD logic, localStorage persistence, validation
- **Components**: Rendering, user interactions, prop handling
- **Utilities**: CSS parser (`s()`), formatters (`eur`), helpers

## Coverage Target

Aim for 80%+ coverage on:
- All hooks (CRUD operations)
- All components (render + interactions)
- Utilities (formatters, helpers)

## Notes

- Use `renderHook()` from React Testing Library for hook tests
- Mock localStorage in tests with `vi.stubGlobal()`
- Test happy path + edge cases (empty data, validation errors, persistence failures)
