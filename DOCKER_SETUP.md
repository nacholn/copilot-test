# Docker PostgreSQL Setup

This guide explains how to set up and use the local PostgreSQL database with Docker Compose.

## Quick Start

### 1. Start the Database

```bash
# Start PostgreSQL and pgAdmin
docker-compose up -d

# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f postgres
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

The default values will work with the Docker setup:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cycling_network
DB_USER=cycling_user
DB_PASSWORD=cycling_password
JWT_SECRET=your-secret-key-change-in-production
```

### 3. Verify Database

The database schema is automatically created when the container starts for the first time.

Test the connection:

```bash
# Connect with psql
docker-compose exec postgres psql -U cycling_user -d cycling_network

# Run a test query
\dt  # List tables
SELECT * FROM users;
\q   # Quit
```

## Services

### PostgreSQL Database
- **Port**: 5432
- **Database**: cycling_network
- **User**: cycling_user
- **Password**: cycling_password
- **Data persistence**: Docker volume `cycling_network_postgres_data`

### pgAdmin (Web UI)
- **URL**: http://localhost:5050
- **Email**: admin@cycling.local
- **Password**: admin

#### Connect to Database in pgAdmin:
1. Open http://localhost:5050
2. Right-click "Servers" → "Register" → "Server"
3. General tab: Name = "Cycling Network"
4. Connection tab:
   - Host: postgres (or host.docker.internal on Mac/Windows)
   - Port: 5432
   - Database: cycling_network
   - Username: cycling_user
   - Password: cycling_password

## Database Schema

### Tables

#### users
Stores user authentication data:
- `id` (UUID) - Primary key
- `email` (TEXT) - Unique user email
- `password_hash` (TEXT) - Bcrypt hashed password
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### cyclist_profiles
Stores cyclist profile information (auto-created on user registration):
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users table
- `email` (TEXT) - User email
- `sex` - Gender (male, female, other, prefer_not_to_say)
- `level` - Cycling level (beginner, intermediate, advanced, professional)
- `birth_date` (DATE) - Date of birth
- `photo_url` (TEXT) - Profile photo URL (auto-generated with initials)
- `city` (TEXT) - City/location
- `latitude` (DECIMAL) - GPS latitude
- `longitude` (DECIMAL) - GPS longitude
- `description` (TEXT) - Optional bio
- `bike_type` - Bike type (road, mountain, hybrid, gravel, electric, other)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Default Test User

A test user is created automatically:
- **Email**: test@cycling.local
- **Password**: password123

## Common Commands

### Start/Stop Database

```bash
# Start services
docker-compose up -d

# Stop services (keeps data)
docker-compose stop

# Stop and remove containers (keeps data)
docker-compose down

# Stop, remove containers AND delete data
docker-compose down -v
```

### Database Backup

```bash
# Backup
docker-compose exec postgres pg_dump -U cycling_user cycling_network > backup.sql

# Restore
docker-compose exec -T postgres psql -U cycling_user cycling_network < backup.sql
```

### View Logs

```bash
# All services
docker-compose logs -f

# PostgreSQL only
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 postgres
```

### Execute SQL

```bash
# Interactive psql
docker-compose exec postgres psql -U cycling_user -d cycling_network

# Execute single query
docker-compose exec postgres psql -U cycling_user -d cycling_network -c "SELECT COUNT(*) FROM users;"

# Execute SQL file
docker-compose exec -T postgres psql -U cycling_user -d cycling_network < migration.sql
```

## Troubleshooting

### Port 5432 already in use

If you have PostgreSQL running locally:

```bash
# Stop local PostgreSQL (Ubuntu/Debian)
sudo service postgresql stop

# Or change port in docker-compose.yml
ports:
  - "5433:5432"  # Use 5433 instead
```

Then update `.env`:
```env
DB_PORT=5433
```

### Container won't start

```bash
# Check logs
docker-compose logs postgres

# Remove containers and volumes, start fresh
docker-compose down -v
docker-compose up -d
```

### Connection refused

Make sure:
1. Container is running: `docker-compose ps`
2. Database is healthy: `docker-compose logs postgres | grep "ready"`
3. Environment variables are correct in `.env`
4. Backend is using correct connection settings

### Reset database

```bash
# Stop and remove everything including data
docker-compose down -v

# Start fresh
docker-compose up -d

# Schema is automatically recreated
```

## Production Notes

⚠️ **This setup is for development only!**

For production:
1. Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
2. Change all default passwords
3. Generate strong JWT_SECRET: `openssl rand -base64 32`
4. Enable SSL/TLS connections
5. Set up automated backups
6. Configure proper network security
7. Don't expose pgAdmin publicly

## Migration to Production Database

When ready to deploy:

1. Export your data:
```bash
docker-compose exec postgres pg_dump -U cycling_user cycling_network > production-data.sql
```

2. Update `.env` with production credentials:
```env
DB_HOST=your-production-db.host
DB_PORT=5432
DB_NAME=production_db
DB_USER=production_user
DB_PASSWORD=strong-production-password
JWT_SECRET=strong-random-secret
```

3. Run schema on production:
```bash
psql -h your-production-db.host -U production_user -d production_db -f apps/backend/database/init/001_create_schema.sql
```

4. Import data if needed:
```bash
psql -h your-production-db.host -U production_user -d production_db < production-data.sql
```

## Need Help?

- Check Docker logs: `docker-compose logs`
- Check PostgreSQL docs: https://www.postgresql.org/docs/
- Check Docker Compose docs: https://docs.docker.com/compose/
