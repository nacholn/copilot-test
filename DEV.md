# Development Guide

Quick reference for common development tasks.

## Quick Start

```bash
# One-time setup
./scripts/setup-dev.sh

# Start PostgreSQL (using Docker)
docker-compose up -d postgres

# Run migrations
cd apps/backend && npm run migrate:up && cd ../..

# Start all development servers
npm run dev
```

## Development Commands

### Build Commands

```bash
# Build everything
npm run build

# Build specific workspace
npm run build --workspace=apps/backend
npm run build --workspace=apps/web
npm run build --workspace=packages/config
npm run build --workspace=packages/ui

# Clean build artifacts
npm run clean
```

### Development Servers

```bash
# Start all dev servers (uses Turborepo)
npm run dev

# Start individual servers
cd apps/backend && npm run dev    # Port 3001
cd apps/web && npm run dev         # Port 3000
cd apps/mobile && npm start        # Expo DevTools
```

### Linting & Formatting

```bash
# Run all linters
npm run lint

# Format all code
npm run format

# Lint specific workspace
npm run lint --workspace=apps/backend
```

### Package Management

```bash
# Add dependency to specific app
npm install <package> --workspace=apps/backend
npm install <package> --workspace=apps/web
npm install <package> --workspace=apps/mobile

# Add dev dependency
npm install -D <package> --workspace=packages/ui

# Update all dependencies
npm update

# Check for outdated packages
npm outdated
```

## Testing the API

### Using curl

**Register a new user:**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "profile": {
      "level": "intermediate",
      "bikeType": "road",
      "city": "San Francisco"
    }
  }'
```

**Login:**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get profile:**

```bash
curl http://localhost:3001/api/profile?userId=<user-id>
```

**Update profile:**

```bash
curl -X PATCH http://localhost:3001/api/profile?userId=<user-id> \
  -H "Content-Type: application/json" \
  -d '{
    "level": "advanced",
    "bio": "Love cycling!"
  }'
```

**Recover password:**

```bash
curl -X POST http://localhost:3001/api/auth/recover \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

## Docker Operations

### PostgreSQL

```bash
docker-compose up -d postgres     # Start database
docker-compose down               # Stop all services
docker-compose logs postgres      # View logs
docker-compose restart postgres   # Restart database
```

See [DOCKER.md](DOCKER.md) for comprehensive Docker documentation.

## Database Operations

### Run migrations

```bash
cd apps/backend
npm run migrate:up        # Apply all pending migrations
npm run migrate:down      # Rollback last migration
npm run migrate:create name  # Create new migration
```

### Connect to database

```bash
psql $DATABASE_URL
```

### View profiles

```sql
SELECT * FROM profiles;
```

### Delete test data

```sql
DELETE FROM profiles WHERE email LIKE '%test%';
```

## Troubleshooting

### Clear all caches

```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
rm -rf .turbo apps/*/.next apps/*/.expo packages/*/dist
npm install
npm run build
```

### Reset database

```bash
cd apps/backend
# Rollback all migrations
npm run migrate:down

# Re-apply all migrations
npm run migrate:up
```

### Port already in use

```bash
# Find process using port
lsof -ti:3000
lsof -ti:3001

# Kill process
kill -9 $(lsof -ti:3000)
kill -9 $(lsof -ti:3001)
```

### Supabase connection issues

1. Check environment variables are set
2. Verify Supabase project is active
3. Check API keys are correct
4. Restart dev server after changing .env

## Mobile Development

### Start Expo

```bash
cd apps/mobile
npm start
```

### Run on device

1. Install Expo Go app on your phone
2. Scan QR code from terminal
3. App will load on your device

### Run on simulator

```bash
# iOS (requires Mac with Xcode)
npm run ios

# Android (requires Android Studio)
npm run android
```

### Clear Expo cache

```bash
cd apps/mobile
rm -rf .expo node_modules
npm install
npm start -- --clear
```

## IDE Setup

### VS Code Extensions

- ESLint
- Prettier
- TypeScript and JavaScript
- React Native Tools
- Expo Tools

### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Useful Links

- [Turborepo Docs](https://turbo.build/repo/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Expo Docs](https://docs.expo.dev)
- [Supabase Docs](https://supabase.com/docs)
- [React Native Docs](https://reactnative.dev/docs)

## Hot Reload

All apps support hot reload:

- **Backend**: Changes to API routes reload automatically
- **Web**: Changes to pages/components reload automatically
- **Mobile**: Changes reload in Expo Go automatically

## Production Build

```bash
# Build for production
npm run build

# Test production builds locally
cd apps/backend && npm run build && npm start
cd apps/web && npm run build && npm start
```

## Common Issues

**"Cannot find module '@cyclists/config'"**

- Run `npm run build --workspace=packages/config`
- Restart your dev server

**"Database connection failed"**

- Check DATABASE_URL in .env
- Ensure PostgreSQL is running
- Test connection: `psql $DATABASE_URL`

**"Supabase client error"**

- Verify SUPABASE_URL and SUPABASE_ANON_KEY
- Check project status in Supabase dashboard
- Ensure authentication is enabled

**Expo Metro bundler issues**

- Clear cache: `npm start -- --clear`
- Reset: `rm -rf .expo && npm start`
- Check node_modules are installed

## Tips

- Use Turborepo's cache to speed up builds
- Keep terminal windows organized (backend/web/mobile)
- Test on both web and mobile regularly
- Use git branches for features
- Commit often with meaningful messages
- Check logs when things go wrong
