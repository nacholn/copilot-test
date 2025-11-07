# Frontend Setup Guide

This guide will help you set up and run the React frontend application.

## Prerequisites

- Node.js v16 or higher
- npm v7 or higher

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` file and configure the API URL:
```
REACT_APP_API_URL=http://localhost:3001/api
```

## Running the Application

### Development Mode
```bash
npm start
```

The app will start on `http://localhost:3000` and automatically reload when you make changes.

### Production Build
```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

## Project Structure

```
frontend/
├── public/               # Static files
│   └── index.html
├── src/
│   ├── components/       # React components
│   │   ├── UserList.js
│   │   └── UserList.css
│   ├── services/         # API integration
│   │   └── api.js
│   ├── App.js            # Root component
│   ├── App.css
│   ├── index.js          # Entry point
│   └── index.css
├── package.json
├── .env.example
├── Dockerfile
└── nginx.conf
```

## Available Scripts

### `npm start`
Runs the app in development mode on [http://localhost:3000](http://localhost:3000).

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm run eject`
**Note: this is a one-way operation!** Ejects from Create React App configuration.

## Creating Components

### Basic Component Structure

```javascript
import React from 'react';
import './ComponentName.css';

function ComponentName({ props }) {
  return (
    <div className="component-name">
      {/* Component content */}
    </div>
  );
}

export default ComponentName;
```

### Component with State and Effects

```javascript
import React, { useState, useEffect } from 'react';
import './ComponentName.css';

function ComponentName() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data or perform side effects
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // API call
      const result = await api.getData();
      setData(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="component-name">
      {/* Render data */}
    </div>
  );
}

export default ComponentName;
```

## API Integration

### Adding New API Calls

Edit `src/services/api.js`:

```javascript
export const newApiCall = async (params) => {
  const response = await api.get('/endpoint', { params });
  return response.data.data;
};
```

Use in components:

```javascript
import { newApiCall } from '../services/api';

const data = await newApiCall({ id: 1 });
```

## Styling

### Component-specific CSS
Each component should have its own CSS file:
```
ComponentName.js
ComponentName.css
```

### Global Styles
Edit `src/index.css` for global styles.

### CSS Modules (Optional)
Rename CSS files to `ComponentName.module.css` and import:
```javascript
import styles from './ComponentName.module.css';
<div className={styles.container}>
```

## Testing

### Running Tests
```bash
npm test
```

### Example Component Test
```javascript
import { render, screen } from '@testing-library/react';
import ComponentName from './ComponentName';

test('renders component', () => {
  render(<ComponentName />);
  const element = screen.getByText(/expected text/i);
  expect(element).toBeInTheDocument();
});
```

## State Management

For simple state, use React hooks (useState, useContext).

For complex state, consider:
- Redux
- MobX
- Zustand
- Context API + useReducer

## Routing (If needed)

Install React Router:
```bash
npm install react-router-dom
```

Basic setup:
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## Environment Variables

All custom environment variables must start with `REACT_APP_`:

```
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_CUSTOM_VAR=value
```

Access in code:
```javascript
const apiUrl = process.env.REACT_APP_API_URL;
```

## Common Issues

### Blank page after build
- Check browser console for errors
- Ensure all assets are properly imported
- Verify API URL is correct for production

### API calls failing
- Check REACT_APP_API_URL in .env
- Ensure backend is running
- Check CORS configuration on backend

### Dependencies issues
Delete `node_modules` and `package-lock.json`, then run `npm install` again.

## Performance Optimization

### Code Splitting
```javascript
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}
```

### Memoization
```javascript
import React, { useMemo, useCallback } from 'react';

const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
```

## Production Deployment

### Build for Production
```bash
npm run build
```

### Serve Static Build
```bash
npm install -g serve
serve -s build -p 3000
```

See the [Deployment Agent Documentation](../docs/.agents/DEPLOYMENT_AGENT.md) for more deployment options.

## Browser Support

The app works in all modern browsers:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Debugging

### React DevTools
Install React DevTools browser extension for debugging.

### Console Logging
Use `console.log()` for debugging during development.

### Network Tab
Use browser Network tab to inspect API calls.

## Additional Resources

- React Documentation: https://react.dev/
- Create React App: https://create-react-app.dev/
- React Router: https://reactrouter.com/
- Testing Library: https://testing-library.com/react
