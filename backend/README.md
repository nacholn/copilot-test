# Backend Setup Guide

This guide will help you set up and run the backend API server.

## Prerequisites

- Node.js v16 or higher
- npm v7 or higher

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` file and configure as needed:
```
PORT=3001
NODE_ENV=development
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

The server will start on `http://localhost:3001` and automatically reload when you make changes.

### Production Mode
```bash
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Business logic for API endpoints
│   │   └── userController.js
│   ├── routes/           # API route definitions
│   │   └── api.js
│   ├── middleware/       # Custom middleware functions
│   └── server.js         # Main server file
├── package.json
├── .env.example
└── Dockerfile
```

## API Endpoints

### Health Check
- **GET** `/health` - Check server status

### Users
- **GET** `/api/users` - Get all users
- **GET** `/api/users/:id` - Get user by ID
- **POST** `/api/users` - Create new user
- **PUT** `/api/users/:id` - Update user
- **DELETE** `/api/users/:id` - Delete user

## Testing the API

### Using curl

```bash
# Get all users
curl http://localhost:3001/api/users

# Get user by ID
curl http://localhost:3001/api/users/1

# Create new user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Update user
curl -X PUT http://localhost:3001/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Jane Doe", "email": "jane@example.com"}'

# Delete user
curl -X DELETE http://localhost:3001/api/users/1
```

### Using Postman

Import the API endpoints into Postman:
1. Base URL: `http://localhost:3001`
2. Create requests for each endpoint
3. Set appropriate headers and body data

## Running Tests

```bash
npm test
```

## Adding New Endpoints

1. **Create controller function** in `src/controllers/`:
```javascript
const newEndpoint = (req, res) => {
  // Your logic here
  res.json({ success: true, data: {} });
};

module.exports = { newEndpoint };
```

2. **Add route** in `src/routes/api.js`:
```javascript
const controller = require('../controllers/yourController');
router.get('/new-endpoint', controller.newEndpoint);
```

## Common Issues

### Port already in use
Change the `PORT` in your `.env` file to use a different port.

### Dependencies issues
Delete `node_modules` and `package-lock.json`, then run `npm install` again.

### CORS errors
Check the CORS configuration in `src/server.js` and ensure the frontend URL is allowed.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment mode | development |

## Production Deployment

See the [Deployment Agent Documentation](../docs/.agents/DEPLOYMENT_AGENT.md) for production deployment instructions.

## Additional Resources

- Express.js Documentation: https://expressjs.com/
- Node.js Best Practices: https://github.com/goldbergyoni/nodebestpractices
