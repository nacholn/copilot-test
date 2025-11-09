# Troubleshooting Guide

Common issues and solutions for the Cycling Network Platform.

## Authentication Issues

### "Failed to fetch" Error When Logging In

**Problem:** You see `Error: Failed to fetch` when trying to log in from the web app.

**Causes and Solutions:**

1. **Backend API not running**
   ```bash
   # Check if backend is running on port 3001
   curl http://localhost:3001/api/health
   
   # If not, start the backend:
   cd apps/backend && npm run dev
   ```

2. **CORS not configured (FIXED)**
   - This has been fixed in the latest version
   - The backend now allows requests from `http://localhost:3000`
   - Restart the backend if you updated the code

3. **Wrong environment variable**
   - ❌ **DO NOT** use `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ Use `NEXT_PUBLIC_API_URL=http://localhost:3001` in your `.env` file
   - Copy `.env.example` to `.env` if you haven't already:
     ```bash
     cp .env.example .env
     ```

4. **Database not running**
   ```bash
   # Check if Docker containers are running
   docker-compose ps
   
   # If not, start them:
   docker-compose up -d
   ```

### "Invalid token" Error When Saving Profile

**Problem:** Profile saves fail with "invalid token" error.

**Solution:** This was fixed in commit d6028d4. Make sure you:
1. Pull the latest code
2. Restart the backend: `cd apps/backend && npm run dev`
3. Clear browser localStorage and log in again
4. The web and mobile apps now use JWT tokens correctly

### "Unauthorized" Error

**Problem:** API requests return 401 Unauthorized.

**Solutions:**

1. **Token expired or missing**
   - Log out and log in again
   - Clear browser localStorage: `localStorage.clear()` in browser console

2. **Token not sent with request**
   - Check browser Network tab
   - Verify `Authorization: Bearer <token>` header is present

## Database Issues

### "Connection refused" Error

**Problem:** Backend can't connect to PostgreSQL.

**Solutions:**

1. **Docker not running**
   ```bash
   # Check Docker status
   docker-compose ps
   
   # Start Docker services
   docker-compose up -d
   
   # Check logs
   docker-compose logs postgres
   ```

2. **Wrong database credentials**
   - Check your `.env` file matches `docker-compose.yml`
   - Default credentials:
     - DB_HOST=localhost
     - DB_PORT=5432
     - DB_NAME=cycling_network
     - DB_USER=cycling_user
     - DB_PASSWORD=cycling_password

3. **Port already in use**
   ```bash
   # Check if port 5432 is already in use
   lsof -i :5432
   
   # Stop the process or change the port in docker-compose.yml
   ```

### Database Not Initialized

**Problem:** Tables don't exist.

**Solution:**
```bash
# Recreate the database
docker-compose down -v  # Remove volumes
docker-compose up -d    # Restart with fresh database

# The schema will auto-initialize from apps/backend/database/init/
```

## Build Issues

### TypeScript Errors

**Problem:** `npm run build` fails with TypeScript errors.

**Solutions:**

1. **Missing dependencies**
   ```bash
   npm install
   ```

2. **Stale build cache**
   ```bash
   # Clean all caches
   npm run clean
   
   # Or manually
   rm -rf node_modules package-lock.json
   rm -rf apps/*/node_modules apps/*/.next
   rm -rf packages/*/node_modules packages/*/dist
   npm install
   ```

### Next.js Build Fails

**Problem:** Next.js build fails in web or backend app.

**Solution:**
```bash
# Clean Next.js cache
cd apps/web && rm -rf .next
cd apps/backend && rm -rf .next

# Rebuild
npm run build
```

## Runtime Issues

### Port Already in Use

**Problem:** Can't start app because port is in use.

**Solutions:**

1. **Find and kill the process**
   ```bash
   # For port 3001 (backend)
   lsof -i :3001
   kill -9 <PID>
   
   # For port 3000 (web)
   lsof -i :3000
   kill -9 <PID>
   ```

2. **Change the port**
   ```bash
   # Backend
   cd apps/backend && PORT=3002 npm run dev
   
   # Web
   cd apps/web && PORT=3001 npm run dev
   
   # Remember to update NEXT_PUBLIC_API_URL if you change backend port
   ```

### "Module not found" Errors

**Problem:** Import errors for `@cycling-network/*` packages.

**Solution:**
```bash
# Rebuild packages
npm run build

# Or rebuild specific package
cd packages/ui && npm run build
cd packages/config && npm run build
```

## Mobile App Issues (Expo)

### Can't Connect to Backend from Physical Device

**Problem:** Mobile app can't reach the backend API.

**Solution:**
```bash
# 1. Find your computer's IP address
# On Mac/Linux:
ifconfig | grep "inet "
# On Windows:
ipconfig

# 2. Update EXPO_PUBLIC_API_URL in .env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3001  # Use your IP

# 3. Make sure your phone and computer are on the same WiFi network

# 4. Restart Expo
cd apps/mobile && npm start
```

### AsyncStorage Errors

**Problem:** Errors related to AsyncStorage on mobile.

**Solution:**
```bash
cd apps/mobile
expo install @react-native-async-storage/async-storage
```

## General Tips

### Reset Everything

If all else fails, reset the entire project:

```bash
# 1. Stop all services
docker-compose down -v
pkill -f "next dev"
pkill -f "expo"

# 2. Clean everything
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules apps/*/.next
rm -rf packages/*/node_modules packages/*/dist

# 3. Reinstall
npm install

# 4. Start fresh
docker-compose up -d
cd apps/backend && npm run dev
# In another terminal:
cd apps/web && npm run dev
```

### Check Service Status

Quick health check for all services:

```bash
# Database
docker-compose ps

# Backend API
curl http://localhost:3001/api/health

# Web app
curl http://localhost:3000
```

### Enable Debug Mode

Get more detailed error messages:

```bash
# Backend
cd apps/backend
DEBUG=* npm run dev

# Web
cd apps/web
npm run dev
```

## Getting Help

If you're still stuck:

1. Check the logs:
   - Backend: Terminal where `npm run dev` is running
   - Database: `docker-compose logs postgres`
   - Browser: Developer Tools → Console and Network tabs

2. Review documentation:
   - `README.md` - Getting started
   - `DOCKER_SETUP.md` - Docker and database setup
   - `AUTHENTICATION_FIX.md` - Authentication system details
   - `CYCLIST_PROFILES.md` - Profile system details

3. Common environment setup:
   ```bash
   # Verify your .env file
   cat .env
   
   # Should have (at minimum):
   # NEXT_PUBLIC_API_URL=http://localhost:3001
   # DB_HOST=localhost
   # DB_NAME=cycling_network
   # JWT_SECRET=your-secret-key
   ```

4. Test authentication manually:
   ```bash
   # Test login endpoint
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@cycling.local","password":"password123"}'
   
   # Should return: {"data":{"user":{"id":"...","email":"..."},"token":"..."},"message":"Login successful"}
   ```
