# Frontend Backend Project

A full-stack application template with React frontend and Node.js/Express backend, designed to work with different development agents.

## Project Structure

```
.
├── frontend/          # React frontend application
│   ├── public/        # Static files
│   └── src/           # React components and services
├── backend/           # Node.js/Express API server
│   └── src/           # Server code, routes, and controllers
├── docs/              # Documentation
│   └── .agents/       # Agent-specific instructions
└── docker-compose.yml # Docker setup for easy deployment
```

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker (optional, for containerized deployment)

### Running Locally

#### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend server will start on `http://localhost:3001`

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

The frontend will start on `http://localhost:3000`

### Using Docker

```bash
docker-compose up -d
```

This will start both frontend and backend services in containers.

## Features

### Backend
- RESTful API with Express.js
- CORS enabled for frontend communication
- Environment-based configuration
- Basic user CRUD operations
- Health check endpoint (`/health`)
- Error handling middleware

### Frontend
- React 18 with functional components and hooks
- Axios for API communication
- Responsive design with CSS Grid
- Component-based architecture
- Environment-based API configuration

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Health
- `GET /health` - Health check endpoint

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start  # Uses React dev server with hot reload
```

### Testing
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Agent Instructions

This project includes specific instructions for different development agents:

- **Development Agent** - See [docs/.agents/DEVELOPMENT_AGENT.md](docs/.agents/DEVELOPMENT_AGENT.md)
- **Deployment Agent** - See [docs/.agents/DEPLOYMENT_AGENT.md](docs/.agents/DEPLOYMENT_AGENT.md)
- **Testing Agent** - See [docs/.agents/TESTING_AGENT.md](docs/.agents/TESTING_AGENT.md)
- **Security Agent** - See [docs/.agents/SECURITY_AGENT.md](docs/.agents/SECURITY_AGENT.md)

## Environment Variables

### Backend (.env)
```
PORT=3001
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001/api
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

ISC