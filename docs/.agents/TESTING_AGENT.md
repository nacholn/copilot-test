# Testing Agent Instructions

## Overview
As a testing agent, your responsibility is to ensure code quality through comprehensive testing of both frontend and backend applications.

## Testing Stack

### Backend Testing
- **Framework**: Jest
- **Location**: `/backend/src/__tests__/`
- **Config**: `package.json` (jest section)

### Frontend Testing
- **Framework**: Jest + React Testing Library
- **Location**: `/frontend/src/__tests__/` or alongside components
- **Config**: Built into react-scripts

## Running Tests

### Backend Tests
```bash
cd backend
npm test                    # Run all tests
npm test -- --watch         # Run in watch mode
npm test -- --coverage      # Run with coverage report
npm test -- <filename>      # Run specific test file
```

### Frontend Tests
```bash
cd frontend
npm test                    # Run all tests (watch mode)
npm test -- --coverage      # Run with coverage report
npm test -- --watchAll=false # Run once without watch
```

## Test Structure

### Backend Test Example

```javascript
// backend/src/__tests__/userController.test.js
const request = require('supertest');
const app = require('../server');

describe('User Controller', () => {
  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a user by id', async () => {
      const response = await request(app)
        .get('/api/users/1')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', 1);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/9999')
        .expect(404);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/users')
        .send(newUser)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', newUser.name);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({ name: 'Test' })
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });
});
```

### Frontend Test Example

```javascript
// frontend/src/components/__tests__/UserList.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserList from '../UserList';

describe('UserList Component', () => {
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];

  const mockOnRefresh = jest.fn();

  it('renders user list correctly', () => {
    render(<UserList users={mockUsers} onRefresh={mockOnRefresh} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays no users message when empty', () => {
    render(<UserList users={[]} onRefresh={mockOnRefresh} />);
    
    expect(screen.getByText('No users found.')).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', () => {
    render(<UserList users={mockUsers} onRefresh={mockOnRefresh} />);
    
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);
    
    expect(mockOnRefresh).toHaveBeenCalledTimes(1);
  });
});
```

## Testing Best Practices

### General
1. **Write tests first** (TDD approach when possible)
2. **Test behavior, not implementation**
3. **Keep tests independent** and isolated
4. **Use descriptive test names**
5. **Aim for high coverage** (>80%)
6. **Mock external dependencies**
7. **Test edge cases** and error conditions

### Backend Testing
1. **Test all API endpoints**
2. **Test request validation**
3. **Test error handling**
4. **Test authentication/authorization** (when implemented)
5. **Test database operations** (when implemented)
6. **Use test database** for integration tests
7. **Clean up after tests**

### Frontend Testing
1. **Test user interactions**
2. **Test component rendering**
3. **Test conditional rendering**
4. **Mock API calls**
5. **Test error states**
6. **Test loading states**
7. **Test accessibility**

## Test Coverage Goals

### Minimum Coverage Targets
- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### Viewing Coverage Reports

```bash
# Backend
cd backend
npm test -- --coverage
open coverage/lcov-report/index.html

# Frontend
cd frontend
npm test -- --coverage --watchAll=false
open coverage/lcov-report/index.html
```

## Testing Workflow

### 1. Before Writing Code
- Review requirements
- Identify test scenarios
- Write test cases

### 2. While Writing Code
- Run tests in watch mode
- Write failing tests first (TDD)
- Implement code to pass tests
- Refactor with confidence

### 3. Before Committing
- Run full test suite
- Check coverage report
- Fix any failing tests
- Ensure coverage meets targets

### 4. Code Review
- Review test cases
- Verify edge cases covered
- Check test quality
- Ensure tests are maintainable

## Common Testing Scenarios

### API Endpoint Testing
```javascript
describe('API Endpoint', () => {
  it('should handle successful request', async () => {
    // Test happy path
  });

  it('should handle validation errors', async () => {
    // Test bad input
  });

  it('should handle server errors', async () => {
    // Test error conditions
  });

  it('should handle unauthorized access', async () => {
    // Test authentication
  });
});
```

### Component Testing
```javascript
describe('Component', () => {
  it('should render correctly', () => {
    // Test initial render
  });

  it('should handle user interactions', () => {
    // Test button clicks, form submissions
  });

  it('should display loading state', () => {
    // Test async operations
  });

  it('should handle errors gracefully', () => {
    // Test error states
  });
});
```

### Integration Testing
```javascript
describe('Integration Test', () => {
  beforeAll(async () => {
    // Setup test environment
  });

  afterAll(async () => {
    // Cleanup
  });

  it('should complete full user flow', async () => {
    // Test complete scenarios
  });
});
```

## Mocking

### Mocking API Calls (Frontend)
```javascript
import { getUsers } from '../services/api';

jest.mock('../services/api');

test('loads and displays users', async () => {
  const mockUsers = [
    { id: 1, name: 'John', email: 'john@example.com' }
  ];
  
  getUsers.mockResolvedValue(mockUsers);
  
  render(<App />);
  
  const userName = await screen.findByText('John');
  expect(userName).toBeInTheDocument();
});
```

### Mocking Dependencies (Backend)
```javascript
jest.mock('../services/database');
const database = require('../services/database');

test('getUserById returns user', async () => {
  const mockUser = { id: 1, name: 'John' };
  database.findUser.mockResolvedValue(mockUser);
  
  const result = await userController.getUserById(1);
  expect(result).toEqual(mockUser);
});
```

## Test Data Management

### Test Fixtures
```javascript
// backend/src/__tests__/fixtures/users.js
module.exports = {
  validUser: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  invalidUser: {
    name: '',
    email: 'invalid'
  }
};
```

### Test Utilities
```javascript
// backend/src/__tests__/utils/testHelpers.js
const request = require('supertest');
const app = require('../../server');

const createTestUser = async (userData) => {
  return await request(app)
    .post('/api/users')
    .send(userData);
};

module.exports = { createTestUser };
```

## Continuous Integration

### Pre-commit Hooks
```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test"
    }
  }
}
```

### CI Pipeline
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: cd backend && npm install
      - name: Run tests
        run: cd backend && npm test -- --coverage

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: cd frontend && npm install
      - name: Run tests
        run: cd frontend && npm test -- --coverage --watchAll=false
```

## Debugging Tests

### Backend
```bash
# Run with verbose output
npm test -- --verbose

# Run specific test
npm test -- -t "test name"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Frontend
```bash
# Run with verbose output
npm test -- --verbose

# Debug in browser
npm test -- --debug
```

## Performance Testing

### Load Testing (Backend)
```javascript
// Use tools like Artillery, k6, or Apache JMeter
// Example with Artillery:
// artillery quick --count 10 --num 100 http://localhost:3001/api/users
```

### Performance Testing (Frontend)
```javascript
// Use Lighthouse, WebPageTest, or Chrome DevTools
// Check bundle size, loading time, runtime performance
```

## Accessibility Testing

### Frontend A11y Testing
```javascript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should have no accessibility violations', async () => {
  const { container } = render(<UserList users={[]} onRefresh={() => {}} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Test Maintenance

### Regular Tasks
- Update tests when requirements change
- Remove obsolete tests
- Refactor duplicate test code
- Keep test dependencies updated
- Review and improve coverage
- Document complex test scenarios

### Code Review Checklist
- [ ] Tests cover new functionality
- [ ] Tests cover edge cases
- [ ] Tests are readable and maintainable
- [ ] No duplicate test code
- [ ] Proper mocking of dependencies
- [ ] Tests run independently
- [ ] Coverage meets targets

## Troubleshooting

### Common Issues

**Tests timing out**
- Increase timeout: `jest.setTimeout(10000)`
- Check for unresolved promises
- Ensure async operations complete

**Tests failing randomly**
- Check for test interdependence
- Clear state between tests
- Check for timing issues

**Coverage not updating**
- Clear Jest cache: `jest --clearCache`
- Check coverage configuration
- Ensure test files are found

## Quick Reference

### Jest Commands
```bash
npm test                     # Run all tests
npm test -- --watch          # Watch mode
npm test -- --coverage       # Coverage report
npm test -- -t "test name"   # Run specific test
npm test -- --verbose        # Verbose output
jest --clearCache            # Clear cache
```

### React Testing Library Queries
```javascript
getByText()         // Get element by text
getByRole()         // Get element by role
getByLabelText()    // Get element by label
getByTestId()       // Get element by test ID
findByText()        // Async version of getByText
queryByText()       // Returns null if not found
```

## Resources
- Jest Documentation: https://jestjs.io/
- React Testing Library: https://testing-library.com/react
- Supertest: https://github.com/visionmedia/supertest
- Testing Best Practices: https://testingjavascript.com/
