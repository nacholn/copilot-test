# Project Architecture

## System Overview

This is a full-stack web application with a clear separation between frontend and backend components.

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                            │
│                     (Web Browser)                        │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/HTTPS
                     │ Port 3000
┌────────────────────▼────────────────────────────────────┐
│                   FRONTEND                               │
│                   React 18                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Components                                      │   │
│  │  - App.js (Root)                                 │   │
│  │  - UserList.js                                   │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Services                                        │   │
│  │  - api.js (API Integration)                      │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │ REST API
                     │ Port 3001
┌────────────────────▼────────────────────────────────────┐
│                   BACKEND                                │
│               Node.js + Express                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Routes                                          │   │
│  │  - /api/users (GET, POST, PUT, DELETE)          │   │
│  │  - /health (GET)                                 │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Controllers                                     │   │
│  │  - userController.js                             │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Middleware                                      │   │
│  │  - CORS, JSON Parser, Error Handler             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18
- **HTTP Client**: Axios
- **Styling**: CSS3
- **Build Tool**: Create React App (Webpack)
- **Dev Server**: React Scripts

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Middleware**: CORS, Body Parser
- **Dev Tool**: Nodemon

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Web Server**: Nginx (for production frontend)

## Component Architecture

### Frontend Components

```
App
├── Header (Project Title)
└── Main
    └── UserList
        └── UserCard (x N)
```

### Backend Structure

```
server.js
├── Middleware Stack
│   ├── CORS
│   ├── JSON Parser
│   └── Error Handler
└── Routes
    ├── /health → Health Check
    └── /api → API Routes
        └── /users → User Controller
            ├── GET /users → getAllUsers
            ├── GET /users/:id → getUserById
            ├── POST /users → createUser
            ├── PUT /users/:id → updateUser
            └── DELETE /users/:id → deleteUser
```

## Data Flow

### Fetching Users

```
1. User visits page
   ↓
2. App.js useEffect triggers
   ↓
3. api.getUsers() called
   ↓
4. Axios GET request to http://localhost:3001/api/users
   ↓
5. Express routes request to userController.getAllUsers
   ↓
6. Controller fetches users from data store
   ↓
7. Response sent back with { success: true, data: [...] }
   ↓
8. Frontend updates state with users
   ↓
9. UserList component renders user cards
```

### Creating a User

```
1. User submits form (future feature)
   ↓
2. api.createUser({ name, email }) called
   ↓
3. Axios POST request to http://localhost:3001/api/users
   ↓
4. Express routes request to userController.createUser
   ↓
5. Controller validates input
   ↓
6. New user created and added to data store
   ↓
7. Response sent with new user data
   ↓
8. Frontend updates state and re-renders list
```

## Deployment Architecture

### Development Environment

```
┌──────────────┐         ┌──────────────┐
│  Terminal 1  │         │  Terminal 2  │
│              │         │              │
│  npm run dev │         │   npm start  │
│  (Backend)   │         │  (Frontend)  │
│  Port 3001   │         │  Port 3000   │
└──────────────┘         └──────────────┘
       │                        │
       └────────┬───────────────┘
                │
         ┌──────▼──────┐
         │  Developer  │
         │   Browser   │
         └─────────────┘
```

### Docker Environment

```
┌─────────────────────────────────────┐
│        Docker Compose               │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Frontend Container           │ │
│  │  - Node build                 │ │
│  │  - Nginx serve                │ │
│  │  - Port 3000:80               │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Backend Container            │ │
│  │  - Node.js runtime            │ │
│  │  - Express server             │ │
│  │  - Port 3001:3001             │ │
│  └───────────────────────────────┘ │
│                                     │
│  app-network (Bridge)               │
└─────────────────────────────────────┘
```

### Production Environment (Typical)

```
                    Internet
                       │
                       ▼
              ┌────────────────┐
              │  Load Balancer │
              │   (Optional)   │
              └───────┬────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
    ┌────▼────┐              ┌────▼────┐
    │ Frontend│              │ Backend │
    │  Nginx  │──────────────│ Node.js │
    │ Static  │   API Calls  │ Express │
    │  Files  │              │         │
    └─────────┘              └────┬────┘
                                  │
                            ┌─────▼─────┐
                            │  Database │
                            │ (Future)  │
                            └───────────┘
```

## API Endpoints

### User Management API

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/users` | Get all users | - | `{ success: true, data: [...] }` |
| GET | `/api/users/:id` | Get user by ID | - | `{ success: true, data: {...} }` |
| POST | `/api/users` | Create user | `{ name, email }` | `{ success: true, data: {...} }` |
| PUT | `/api/users/:id` | Update user | `{ name?, email? }` | `{ success: true, data: {...} }` |
| DELETE | `/api/users/:id` | Delete user | - | `{ success: true, message: "..." }` |

### Health Check API

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/health` | Check server status | `{ status: "ok", timestamp: "..." }` |

## Security Layers

```
┌─────────────────────────────────────┐
│  HTTPS/TLS Encryption               │ ← Transport Security
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  CORS Policy                        │ ← Origin Validation
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Rate Limiting                      │ ← DDoS Protection
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Input Validation                   │ ← Injection Prevention
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  Authentication (Future)            │ ← Access Control
└─────────────────────────────────────┘
```

## Scalability Considerations

### Horizontal Scaling

```
         Load Balancer
              │
    ┌─────────┼─────────┐
    │         │         │
Frontend₁  Frontend₂  Frontend₃
    │         │         │
    └─────────┼─────────┘
              │
         API Gateway
              │
    ┌─────────┼─────────┐
    │         │         │
Backend₁   Backend₂  Backend₃
    │         │         │
    └─────────┼─────────┘
              │
          Database
```

## Development Workflow

```
┌─────────────┐
│ Local Dev   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Git Commit  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Git Push   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   CI/CD     │ ← Run Tests, Build, Deploy
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Deployment  │
└─────────────┘
```

## Agent Roles

### Development Agent
- Implements features
- Fixes bugs
- Writes tests
- Updates documentation

### Testing Agent
- Writes test cases
- Runs test suites
- Monitors coverage
- Ensures quality

### Deployment Agent
- Manages deployments
- Configures environments
- Monitors production
- Handles rollbacks

### Security Agent
- Reviews code security
- Audits dependencies
- Configures security headers
- Responds to incidents

## Future Enhancements

1. **Database Integration**
   - PostgreSQL/MongoDB for persistent storage
   - Prisma/Mongoose ORM

2. **Authentication**
   - JWT-based authentication
   - OAuth 2.0 integration
   - Role-based access control

3. **Testing**
   - Unit tests for all components
   - Integration tests for API
   - E2E tests with Cypress

4. **CI/CD Pipeline**
   - GitHub Actions workflow
   - Automated testing
   - Automated deployment

5. **Monitoring**
   - Application Performance Monitoring
   - Error tracking (Sentry)
   - Log aggregation

6. **Advanced Features**
   - Real-time updates (WebSockets)
   - File uploads
   - Search and filtering
   - Pagination

## References

- [Backend Documentation](../backend/README.md)
- [Frontend Documentation](../frontend/README.md)
- [Agent Instructions](../.agents/)
- [Contributing Guide](../CONTRIBUTING.md)
