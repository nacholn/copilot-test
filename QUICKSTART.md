# Quick Start Guide

Get the project up and running in less than 5 minutes!

## Option 1: Docker (Easiest) 🐳

**Prerequisites:** Docker and Docker Compose installed

```bash
# Clone the repository
git clone https://github.com/nacholn/copilot-test.git
cd copilot-test

# Start everything with one command
docker-compose up -d

# Check that services are running
docker-compose ps

# View logs
docker-compose logs -f
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

**Stop the application:**
```bash
docker-compose down
```

---

## Option 2: Manual Setup (Full Control) 💻

**Prerequisites:** Node.js v16+ and npm v7+

### Step 1: Clone the Repository

```bash
git clone https://github.com/nacholn/copilot-test.git
cd copilot-test
```

### Step 2: Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start the backend server
npm run dev
```

The backend will start on http://localhost:3001

Keep this terminal open!

### Step 3: Setup Frontend (New Terminal)

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start the frontend
npm start
```

The frontend will start on http://localhost:3000 and automatically open in your browser.

---

## Verify Installation

### Test Backend API

```bash
# Health check
curl http://localhost:3001/health

# Get users
curl http://localhost:3001/api/users

# Create a user
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'
```

### Test Frontend

1. Open http://localhost:3000 in your browser
2. You should see the user list with 2 default users
3. Click "Refresh" button to reload users

---

## What's Next?

### For Developers

1. **Explore the Code**
   - Backend: `/backend/src/`
   - Frontend: `/frontend/src/`

2. **Read Agent Documentation**
   - Development: [docs/.agents/DEVELOPMENT_AGENT.md](docs/.agents/DEVELOPMENT_AGENT.md)
   - Testing: [docs/.agents/TESTING_AGENT.md](docs/.agents/TESTING_AGENT.md)
   - Deployment: [docs/.agents/DEPLOYMENT_AGENT.md](docs/.agents/DEPLOYMENT_AGENT.md)
   - Security: [docs/.agents/SECURITY_AGENT.md](docs/.agents/SECURITY_AGENT.md)

3. **Start Developing**
   - Make changes and see them live reload
   - Add new features
   - Write tests

### For Testers

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

See [Testing Agent Documentation](docs/.agents/TESTING_AGENT.md)

### For DevOps

- Review [Deployment Agent Documentation](docs/.agents/DEPLOYMENT_AGENT.md)
- Configure environment variables
- Set up CI/CD pipeline
- Deploy to cloud platform

### For Security Reviewers

- Review [Security Agent Documentation](docs/.agents/SECURITY_AGENT.md)
- Run security audits: `npm audit`
- Check dependencies
- Review security headers

---

## Project Structure

```
copilot-test/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── controllers/  # Business logic
│   │   ├── routes/       # API routes
│   │   └── server.js     # Express app
│   └── package.json
│
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API integration
│   │   └── App.js        # Root component
│   └── package.json
│
├── docs/                 # Documentation
│   ├── .agents/          # Agent-specific guides
│   └── ARCHITECTURE.md   # System architecture
│
├── docker-compose.yml    # Docker orchestration
├── README.md             # Main documentation
└── CONTRIBUTING.md       # Contribution guide
```

---

## Common Issues & Solutions

### Port Already in Use

**Backend (3001):**
```bash
# Edit backend/.env
PORT=3002
```

**Frontend (3000):**
```bash
# Will prompt to use different port automatically
# Or set in frontend/.env: PORT=3001
```

### Dependencies Won't Install

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Cannot Connect Frontend to Backend

1. Check backend is running: `curl http://localhost:3001/health`
2. Check CORS configuration in `backend/src/server.js`
3. Verify API URL in `frontend/.env`: `REACT_APP_API_URL=http://localhost:3001/api`
4. Restart both services

### Docker Issues

```bash
# Stop all containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

---

## Useful Commands

### Development

```bash
# Backend
cd backend
npm run dev           # Start with auto-reload
npm test              # Run tests
npm test -- --watch   # Run tests in watch mode

# Frontend
cd frontend
npm start             # Start dev server
npm test              # Run tests
npm run build         # Build for production
```

### Docker

```bash
docker-compose up -d        # Start in background
docker-compose down         # Stop all services
docker-compose logs -f      # View logs
docker-compose ps           # Check status
docker-compose restart      # Restart services
```

### Git

```bash
git status                  # Check changes
git add .                   # Stage all changes
git commit -m "message"     # Commit changes
git push                    # Push to remote
```

---

## Learning Resources

### Documentation
- [Main README](README.md) - Complete project documentation
- [Architecture](docs/ARCHITECTURE.md) - System design
- [Contributing](CONTRIBUTING.md) - How to contribute

### Agent Guides
- [Development Agent](docs/.agents/DEVELOPMENT_AGENT.md)
- [Testing Agent](docs/.agents/TESTING_AGENT.md)
- [Deployment Agent](docs/.agents/DEPLOYMENT_AGENT.md)
- [Security Agent](docs/.agents/SECURITY_AGENT.md)

### Technology Documentation
- [React](https://react.dev/)
- [Express](https://expressjs.com/)
- [Node.js](https://nodejs.org/)
- [Docker](https://docs.docker.com/)

---

## Get Help

- 📖 Check the [README](README.md)
- 🐛 Found a bug? [Create an issue](https://github.com/nacholn/copilot-test/issues)
- 💡 Have an idea? [Start a discussion](https://github.com/nacholn/copilot-test/discussions)
- 🤝 Want to contribute? Read [CONTRIBUTING.md](CONTRIBUTING.md)

---

## What You Get

After following this guide, you'll have:

✅ A working full-stack application  
✅ React frontend displaying user data  
✅ Express backend with REST API  
✅ Docker setup for easy deployment  
✅ Comprehensive documentation  
✅ Agent-specific instructions  
✅ Ready-to-develop environment  

**Happy coding! 🚀**
