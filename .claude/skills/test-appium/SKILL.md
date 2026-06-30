---
name: test-appium
description: Run mobile tests with Appium for Android APK
---

# Mobile Tests (Appium)

Run end-to-end tests on Android device/emulator using Appium.

## Prerequisites

1. Appium server running:
   ```bash
   appium
   ```

2. Android emulator or device connected:
   ```bash
   adb devices
   ```

3. APK built and installed:
   ```bash
   ./build-docker.sh
   # Copy APK to device if needed
   adb install build/outputs/apk/cantou-release.apk
   ```

## Commands

### Run all mobile tests
```bash
npm run test:appium
```

### Run specific test
```bash
npm run test:appium -- tests/appium/budget.spec.js
```

### Run with device logs
```bash
npm run test:appium -- --verbose
```

## File Structure

Tests in `tests/appium/`:
```
tests/appium/
  wdio.conf.js         # Appium + WebdriverIO config
  budget.spec.js       # Budget CRUD tests
  meals.spec.js        # Meals tests
  shopping.spec.js     # Shopping tests
  helpers/
    selectors.js       # Android accessibility IDs
    setup.js          # Test setup/teardown
```

## Test Scenarios

### Budget (Android)
- [x] Navigate to Budget tab
- [ ] Add expense with numeric keypad
- [ ] Edit expense amount
- [ ] Delete expense with confirmation
- [ ] Verify persistence after app restart

### Meals (Android)
- [ ] Edit meal dish name
- [ ] Select day from dropdown
- [ ] Confirm changes save

### Shopping (Android)
- [ ] Toggle item checkbox
- [ ] Add new item to category
- [ ] Delete item

### Performance
- [ ] App startup time < 3s
- [ ] Interaction response < 500ms
- [ ] Scroll smoothness

## Notes

- Use accessibility IDs (`testID` in React → `accessibility id` in Appium)
- Test on real device when possible (emulator may have perf issues)
- Appium server must be running on port 4723
- Tests should handle both portrait and landscape orientations
- Always verify data persists in localStorage after interactions
