# Development Agent Instructions

## Overview
As a development agent, your primary responsibility is to implement new features, fix bugs, and maintain code quality in both the frontend and backend applications.

## Project Setup

### Backend (Node.js/Express)
- Location: `/backend`
- Entry point: `src/server.js`
- Package manager: npm
- Framework: Express.js

### Frontend (React)
- Location: `/frontend`
- Entry point: `src/index.js`
- Package manager: npm
- Framework: React 18

## Development Workflow

### 1. Starting Development Environment

```bash
# Terminal 1 - Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
cp .env.example .env
npm start
```

### 2. Making Changes

#### Backend Changes
- Controllers: `/backend/src/controllers/` - Business logic for endpoints
- Routes: `/backend/src/routes/` - API route definitions
- Middleware: `/backend/src/middleware/` - Custom middleware functions
- Main server: `/backend/src/server.js` - Express app configuration

#### Frontend Changes
- Components: `/frontend/src/components/` - React components
- Services: `/frontend/src/services/` - API integration layer
- Styles: Component-specific CSS files
- Main app: `/frontend/src/App.js` - Root component

### 3. Code Style Guidelines

#### Backend
- Use `const` and `let` instead of `var`
- Use async/await for asynchronous operations
- Always handle errors with try-catch blocks
- Return consistent response format: `{ success: boolean, data?: any, error?: string }`
- Use meaningful variable and function names
- Add comments for complex logic

#### Frontend
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use meaningful component and variable names
- Implement proper error handling
- Add loading states for async operations

### 4. Adding New Features

#### Backend API Endpoint
1. Create controller function in appropriate controller file
2. Add route in `/backend/src/routes/api.js`
3. Test endpoint manually or with tests
4. Update API documentation

#### Frontend Feature
1. Create new component in `/frontend/src/components/`
2. Add service function in `/frontend/src/services/api.js` if API call needed
3. Integrate component into parent component
4. Add styles in component-specific CSS file

### 5. Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

### 6. Common Tasks

#### Add New Backend Route
```javascript
// In controller file
const newFunction = (req, res) => {
  // Implementation
};

// In routes/api.js
router.get('/new-route', controller.newFunction);
```

#### Add New Frontend Component
```javascript
// components/NewComponent.js
import React from 'react';
import './NewComponent.css';

function NewComponent({ props }) {
  return (
    <div className="new-component">
      {/* Component content */}
    </div>
  );
}

export default NewComponent;
```

#### Add New API Service
```javascript
// services/api.js
export const newApiCall = async (params) => {
  const response = await api.get('/new-endpoint', { params });
  return response.data.data;
};
```

## Debugging

### Backend Debugging
- Check console logs in terminal running `npm run dev`
- Use `console.log()` for debugging
- Check `/health` endpoint to verify server is running
- Use Postman or curl to test API endpoints directly

### Frontend Debugging
- Use React DevTools browser extension
- Check browser console for errors
- Use `console.log()` for debugging
- Verify API calls in Network tab of browser DevTools

## Environment Configuration

### Backend Environment Variables
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment mode (development/production)

### Frontend Environment Variables
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:3001/api)

## Best Practices

1. **Always test locally** before committing code
2. **Write clean, readable code** with proper formatting
3. **Handle errors gracefully** with user-friendly messages
4. **Keep components and functions small** and focused
5. **Use meaningful names** for variables, functions, and components
6. **Add comments** for complex logic
7. **Follow the existing code style** in the project
8. **Update documentation** when adding new features

## Troubleshooting

### Backend Issues
- **Port already in use**: Change PORT in `.env` file
- **Module not found**: Run `npm install` in backend directory
- **CORS errors**: Check CORS configuration in `server.js`

### Frontend Issues
- **Cannot connect to API**: Verify backend is running and REACT_APP_API_URL is correct
- **Module not found**: Run `npm install` in frontend directory
- **Blank page**: Check browser console for errors

## Quick Reference

### Backend Commands
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm start            # Start production server
npm test             # Run tests
```

### Frontend Commands
```bash
npm install          # Install dependencies
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
```

## Support
For questions or issues, please consult the main README.md or create an issue in the repository.
