---
name: test-e2e
description: Run end-to-end tests with Playwright for full user workflows
---

# E2E Tests (Playwright)

Run end-to-end tests for complete user journeys across all screens.

## Commands

### Run all E2E tests
```bash
npm run test:e2e
```

### Run specific test file
```bash
npm run test:e2e -- budget.spec.js
```

### Run in headed mode (see browser)
```bash
npm run test:e2e -- --headed
```

### Debug mode
```bash
npm run test:e2e -- --debug
```

### Report (HTML)
```bash
npm run test:e2e
npx playwright show-report
```

## File Structure

Tests in `e2e/`:
```
e2e/
  budget.spec.js       # Budget CRUD: add, edit, delete expenses
  meals.spec.js        # Meals CRUD: add, edit, delete meals
  shopping.spec.js     # Shopping CRUD: add, remove items
  planning.spec.js     # Planning CRUD: edit activities
  smoke.spec.js        # Basic navigation + persistence
```

## Test Scenarios

### Budget Tab
- [x] Add expense
- [ ] Edit expense (amount, label, category)
- [ ] Delete expense with confirmation
- [ ] Filter by category
- [ ] Verify persistence (reload page)

### Meals Tab
- [ ] Add meal for day
- [ ] Edit meal dish name
- [ ] Delete meal
- [ ] Verify persistence

### Shopping Tab
- [ ] Add item to category
- [ ] Toggle item checked
- [ ] Delete item
- [ ] Verify category progress

### Planning Tab
- [ ] Edit activity time/title
- [ ] Add new activity to day
- [ ] Delete activity
- [ ] Switch between days

## Notes

- Tests run against local dev server (start with `npm run dev`)
- Use data-testid for element selection (more stable than text matching)
- Each test should be independent (no shared state between tests)
- Clear localStorage before each test suite
