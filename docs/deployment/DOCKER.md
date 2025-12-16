# Docker Setup Guide

This guide explains how to use Docker for local development with the Cyclists Social Network monorepo.

## Overview

The `docker-compose.yml` file provides:

- **PostgreSQL 15**: Database for storing profiles and application data
- **pgAdmin** (optional): Web-based database management tool

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed

## Quick Start

### 1. Start PostgreSQL Database

```bash
docker-compose up -d postgres
```

This starts PostgreSQL in the background. The database will be accessible at:

- **Host**: localhost
- **Port**: 5432
- **Database**: cyclists_db
- **User**: postgres
- **Password**: postgres

### 2. Update Environment Variables

Update your `apps/backend/.env` file with the Docker database URL:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cyclists_db
```

### 3. Run Database Migrations

```bash
cd apps/backend
npm run migrate:up
```

### 4. Start Development Servers

```bash
# In the root directory
npm run dev
```

## Docker Commands

### Start All Services

```bash
# Start PostgreSQL only
docker-compose up -d postgres

# Start PostgreSQL + pgAdmin
docker-compose --profile tools up -d
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (deletes all data)
docker-compose down -v
```

### View Logs

```bash
# View all logs
docker-compose logs

# View PostgreSQL logs
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f postgres
```

### Check Service Status

```bash
docker-compose ps
```

### Restart Services

```bash
# Restart all services
docker-compose restart

# Restart PostgreSQL only
docker-compose restart postgres
```

## Services

### PostgreSQL

**Connection Details:**

- URL: `postgresql://postgres:postgres@localhost:5432/cyclists_db`
- Host: `localhost`
- Port: `5432`
- Database: `cyclists_db`
- Username: `postgres`
- Password: `postgres`

**Data Persistence:**
Data is stored in a Docker volume named `postgres_data` and persists between restarts.

**Health Check:**
PostgreSQL includes a health check that runs every 10 seconds to ensure the database is ready.

### pgAdmin (Optional)

Web-based PostgreSQL management tool.

**Access:**

- URL: http://localhost:5050
- Email: admin@cyclists.local
- Password: admin

**To Enable:**

```bash
docker-compose --profile tools up -d pgadmin
```

**Connect to PostgreSQL from pgAdmin:**

1. Open http://localhost:5050
2. Login with the credentials above
3. Add New Server:
   - **General > Name**: Cyclists DB
   - **Connection > Host**: postgres
   - **Connection > Port**: 5432
   - **Connection > Database**: cyclists_db
   - **Connection > Username**: postgres
   - **Connection > Password**: postgres

## Database Management

### Connect to PostgreSQL

Using psql from your local machine:

```bash
psql postgresql://postgres:postgres@localhost:5432/cyclists_db
```

Using Docker exec:

```bash
docker-compose exec postgres psql -U postgres -d cyclists_db
```

### Backup Database

```bash
docker-compose exec postgres pg_dump -U postgres cyclists_db > backup.sql
```

### Restore Database

```bash
docker-compose exec -T postgres psql -U postgres -d cyclists_db < backup.sql
```

### Reset Database

```bash
# Stop and remove containers and volumes
docker-compose down -v

# Start fresh
docker-compose up -d postgres

# Wait for database to be ready
sleep 5

# Run migrations
cd apps/backend && npm run migrate:up
```

## Environment Variables

You can customize the Docker setup using environment variables:

```bash
# Create a .env file in the root directory
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=mydb
POSTGRES_PORT=5432
PGADMIN_PORT=5050
```

Then reference them in docker-compose.yml:

```yaml
environment:
  POSTGRES_USER: ${POSTGRES_USER:-postgres}
  POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
  POSTGRES_DB: ${POSTGRES_DB:-cyclists_db}
ports:
  - '${POSTGRES_PORT:-5432}:5432'
```

## Production Considerations

⚠️ **Warning**: This Docker setup is for **local development only**.

For production:

- Use managed database services (AWS RDS, Google Cloud SQL, etc.)
- Never use default credentials
- Enable SSL/TLS connections
- Implement proper backup strategies
- Use secrets management
- Configure proper resource limits
- Enable logging and monitoring

## Troubleshooting

### Port Already in Use

If port 5432 is already in use:

```bash
# Check what's using the port
lsof -i :5432

# Stop the service or change the port in docker-compose.yml
ports:
  - "5433:5432"  # Use port 5433 instead

# Update DATABASE_URL accordingly
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/cyclists_db
```

### Database Connection Refused

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# View logs for errors
docker-compose logs postgres

# Restart the service
docker-compose restart postgres
```

### Data Not Persisting

Ensure volumes are not being removed:

```bash
# Don't use -v flag unless you want to delete data
docker-compose down  # Keeps volumes
docker-compose down -v  # DELETES volumes
```

### Permission Denied

On Linux, you may need to adjust volume permissions:

```bash
# Create a custom volume with proper permissions
docker volume create --name postgres_data
```

## Integration with Existing Workflow

### Using with npm scripts

You can add helpful npm scripts to `package.json`:

```json
{
  "scripts": {
    "docker:up": "docker-compose up -d postgres",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f postgres",
    "docker:reset": "docker-compose down -v && docker-compose up -d postgres",
    "dev:docker": "docker-compose up -d postgres && npm run dev"
  }
}
```

### CI/CD Integration

For testing in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
services:
  postgres:
    image: postgres:15-alpine
    env:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: cyclists_db
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

## Alternative: Local PostgreSQL

If you prefer not to use Docker, you can install PostgreSQL locally:

**macOS:**

```bash
brew install postgresql@15
brew services start postgresql@15
createdb cyclists_db
```

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install postgresql-15
sudo systemctl start postgresql
sudo -u postgres createdb cyclists_db
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [pgAdmin Docker Image](https://hub.docker.com/r/dpage/pgadmin4/)

## Support

For issues with:

- **Docker setup**: Check Docker logs and this guide
- **Database migrations**: See `apps/backend/migrations/README.md`
- **Application setup**: See `SETUP.md` and `DEV.md`
