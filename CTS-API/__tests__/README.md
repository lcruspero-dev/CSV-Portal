# CTS-API Jest Test Suite Documentation

## Overview

This directory contains comprehensive Jest tests for the CTS-API backend. Tests are organized by type and cover controllers, middleware, models, utilities, and integration workflows.

## Directory Structure

```
__tests__/
├── controllers/
│   ├── employeeTimeController.test.js
│   └── userController.test.js
├── middleware/
│   ├── authMiddleware.test.js
│   └── errorMiddleware.test.js
├── models/
│   └── userModel.test.js
├── utils/
│   └── dateUtils.test.js
├── integration/
│   └── workflowIntegration.test.js
└── hello.test.js
```

## Running Tests

### Run all tests

```bash
npm test
```

### Run tests in watch mode (auto-rerun on file changes)

```bash
npm run test:watch
```

### Run tests with coverage report

```bash
npm run test:coverage
```

### Run specific test file

```bash
npm test -- employeeTimeController.test.js
```

### Run specific test suite

```bash
npm test -- --testNamePattern="createEmployeeTimeIn"
```

## Test Files Overview

### 1. Controller Tests

#### `employeeTimeController.test.js`

Tests for employee time tracking operations:

- ✅ `getEmployeeTimes()` - Retrieve all employee time records
- ✅ `createEmployeeTimeIn()` - Record employee clock-in
- ✅ `createEmployeeTimeOut()` - Record employee clock-out
- ✅ Login limit validation (1 vs 2 login limit)
- ✅ Error handling

**Key Tests:**

- Duplicate entry prevention
- Login limit enforcement
- Database error handling

#### `userController.test.js`

Tests for user management operations:

- ✅ `registerUser()` - Register new user
- ✅ `loginUser()` - Authenticate user
- ✅ `getMe()` - Get current user profile
- ✅ Password hashing and validation
- ✅ Token generation

**Key Tests:**

- Email validation
- Password matching
- Admin flag handling
- User existence checks

### 2. Middleware Tests

#### `authMiddleware.test.js`

Tests for authentication middleware:

- ✅ Token verification
- ✅ Bearer token parsing
- ✅ User attachment to request
- ✅ Authorization error responses

**Key Tests:**

- Valid token authentication
- Missing token rejection (401)
- Invalid token format rejection
- Non-existent user handling (404)

#### `errorMiddleware.test.js`

Tests for error handling middleware:

- ✅ Status code forwarding
- ✅ Error message formatting
- ✅ Default 500 status fallback
- ✅ Console error logging

### 3. Model Tests

#### `userModel.test.js`

Tests for User model validation:

- ✅ Email format validation
- ✅ Required field validation
- ✅ Default value assignment
- ✅ Field length limits
- ✅ Admin flag handling

**Validations Tested:**

- Email must be valid format
- Name, email, password required
- Default role = "user"
- Default isAdmin = false
- Default status = "active"

### 4. Utility Tests

#### `dateUtils.test.js`

Tests for date and time utilities:

- ✅ Date formatting (MM/DD/YYYY)
- ✅ Time parsing (12-hour format)
- ✅ Time to seconds conversion
- ✅ Duration calculations
- ✅ Night shift handling (midnight crossover)
- ✅ Break time calculations

**Helper Functions Tested:**

- `formatDate()` - Convert date to MM/DD/YYYY
- `parseTime()` - Parse 12-hour format with AM/PM
- `convertToSeconds()` - Convert time to total seconds
- Duration calculations for work, breaks, lunch

### 5. Integration Tests

#### `workflowIntegration.test.js`

Tests for complete multi-component workflows:

- ✅ User registration → Login flow
- ✅ Time-in → Time-out workflow
- ✅ Multi-day time tracking
- ✅ Duplicate prevention validation
- ✅ Error recovery scenarios

## Test Coverage Goals

| Component   | Coverage | Status |
| ----------- | -------- | ------ |
| Controllers | 80%+     | ✅     |
| Middleware  | 80%+     | ✅     |
| Models      | 80%+     | ✅     |
| Utilities   | 80%+     | ✅     |
| **Overall** | **80%+** | ✅     |

## Jest Configuration

The Jest configuration is in `jest.config.js`:

- **Test Environment:** Node.js
- **Coverage Threshold:** 80% for all metrics
- **Test Patterns:** `**/*.test.js`, `**/__tests__/**/*.js`
- **Ignored Paths:** `/node_modules/`, `/dist/`

## Mocking Strategy

### Database Models

```javascript
jest.mock("../../models/userModel");
User.findOne.mockResolvedValue(mockUser);
```

### External Libraries

```javascript
jest.mock("bcryptjs");
bcrypt.hash.mockResolvedValue("hashedPassword");
```

### Request/Response Objects

```javascript
const mockReq = {
  user: { _id: "user123" },
  body: { name: "John" },
  params: { id: "123" },
};

const mockRes = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
};
```

## Common Test Patterns

### Testing Async Controller Actions

```javascript
test("should create user", async () => {
  User.create.mockResolvedValue(mockUser);
  await userController.registerUser(mockReq, mockRes);
  expect(mockRes.status).toHaveBeenCalledWith(201);
});
```

### Testing Error Cases

```javascript
test("should handle errors", async () => {
  User.create.mockRejectedValue(new Error("DB error"));
  await userController.registerUser(mockReq, mockRes);
  expect(mockRes.status).toHaveBeenCalledWith(500);
});
```

### Testing Model Validation

```javascript
test("should reject invalid email", () => {
  const user = new User({ email: "invalid" });
  const error = user.validateSync();
  expect(error).toBeDefined();
});
```

## Debugging Tests

### Run single test file with verbose output

```bash
npm test -- employeeTimeController.test.js --verbose
```

### Run with debugging

```bash
node --inspect-brk ./node_modules/.bin/jest --runInBand
```

### Log during tests

```javascript
console.log("Debug info:", variable);
```

## Adding New Tests

### 1. Create test file in appropriate directory

```javascript
// __tests__/controllers/newController.test.js
const newController = require("../../controllers/newController");
```

### 2. Follow naming convention

- File: `<name>.test.js`
- Test suites: `describe()`
- Test cases: `test()` or `it()`

### 3. Use setup/teardown

```javascript
beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});
```

### 4. Test both success and failure paths

```javascript
describe("myFunction", () => {
  test("should succeed with valid input", () => {});
  test("should fail with invalid input", () => {});
  test("should handle errors gracefully", () => {});
});
```

## Best Practices

1. **Isolation:** Each test should be independent
2. **Clarity:** Test names should describe what is being tested
3. **Mocking:** Mock external dependencies (DB, APIs)
4. **Coverage:** Aim for 80%+ code coverage
5. **Async/Await:** Use async/await for promise handling
6. **Cleanup:** Clear mocks between tests with `beforeEach`

## Continuous Integration

Tests should run automatically:

- On every commit (pre-commit hook)
- Before deployment
- In CI/CD pipeline

Example GitHub Actions:

```yaml
- name: Run Jest Tests
  run: npm test -- --coverage
```

## Troubleshooting

### Tests fail with "Cannot find module"

- Ensure mock paths are correct
- Check that file exists at specified path

### Async tests timeout

- Increase timeout: `jest.setTimeout(10000)`
- Ensure promises resolve properly

### Mock not working

- Call `jest.clearAllMocks()` in `beforeEach`
- Verify mock is called before assertions

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Jest API Reference](https://jestjs.io/docs/api)
- [Testing Node.js Applications](https://jestjs.io/docs/testing-frameworks)

## Next Steps

1. ✅ Run `npm test` to verify setup
2. 📊 Check coverage with `npm run test:coverage`
3. 📝 Add more tests for critical paths
4. 🔄 Integrate tests into CI/CD pipeline
5. 📈 Maintain 80%+ coverage threshold
