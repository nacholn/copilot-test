# Quick Setup Guide

## Prerequisites Checklist

Before you begin, ensure you have:

- [ ] Node.js 18+ installed (recommended: 20.19.5)
- [ ] npm 10+ installed
- [ ] PostgreSQL database running
- [ ] Supabase account created

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install dependencies for all apps and packages in the monorepo.

### 2. Setup Environment Variables

#### Backend

```bash
cd apps/backend
cp .env.example .env
```

Edit `apps/backend/.env` with your values:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL`: Frontend URL (http://localhost:3000)

#### Web

```bash
cd apps/web
cp .env.example .env
```

Edit `apps/web/.env` with the same Supabase credentials.

#### Mobile

```bash
cd apps/mobile
cp .env.example .env
```

Edit `apps/mobile/.env` with the same Supabase credentials.

### 3. Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up
3. Go to Settings > API
4. Copy your Project URL and anon/public key
5. Go to Authentication > Providers
6. Enable Email provider
7. Configure email templates (optional but recommended)

### 4. Setup PostgreSQL Database

#### Using Docker (Recommended)

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Update apps/backend/.env with:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cyclists_db
```

See [Docker Setup](../deployment/DOCKER.md) for more details.

#### Using Local PostgreSQL

If you prefer a local installation, ensure PostgreSQL is running and update `DATABASE_URL` in `apps/backend/.env`.

#### Run Migrations

```bash
cd apps/backend
npm run migrate:up
```

This will create the profiles table with the following schema:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  level VARCHAR(20) NOT NULL,
  bike_type VARCHAR(20) NOT NULL,
  city VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  date_of_birth DATE,
  avatar TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Start Development

Open three terminal windows:

**Terminal 1 - Backend:**

```bash
cd apps/backend
npm run dev
```

Backend will be available at http://localhost:3001

**Terminal 2 - Web:**

```bash
cd apps/web
npm run dev
```

Web app will be available at http://localhost:3000

**Terminal 3 - Mobile (Optional):**

```bash
cd apps/mobile
npm start
```

Follow Expo CLI instructions to open in Expo Go or simulator.

### 6. Test the Application

1. Open http://localhost:3000
2. Click "Get Started" to create an account
3. Fill in the registration form with:
   - Email address
   - Password (minimum 6 characters)
   - Cycling level
   - Bike type
   - City
   - Optional: Date of birth
4. Submit the form
5. Check that the profile is created successfully

## Troubleshooting

### Backend won't start

- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check logs for specific errors

### "Supabase client not configured" error

- Verify environment variables are set correctly
- Restart the development server after changing .env files
- Check that Supabase URL and keys don't have extra spaces

### CORS errors

- Ensure NEXT_PUBLIC_APP_URL matches your frontend URL
- Check Supabase project settings > API > CORS allowed origins

### Mobile app won't build

- Run `npm install` in apps/mobile
- Clear Expo cache: `cd apps/mobile && rm -rf .expo`
- Try restarting the Metro bundler

## Next Steps

- [ ] Customize the UI theme and branding
- [ ] Add more profile fields as needed
- [ ] Implement route sharing features
- [ ] Add social features (posts, comments)
- [ ] Setup push notifications
- [ ] Configure deployment pipelines

## Useful Commands

```bash
# Build all apps and packages
npm run build

# Run linters
npm run lint

# Format code
npm run format

# Clean all build artifacts
npm run clean

# Install new dependency in a workspace
npm install <package> --workspace=apps/backend
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Turborepo                           │
├─────────────────────────────────────────────────────────┤
│  Apps                         │  Packages                │
│  ├── backend (Next.js)        │  ├── config             │
│  │   └── API Routes           │  │   ├── Types          │
│  │       ├── /auth/register   │  │   └── Supabase       │
│  │       ├── /auth/login      │  └── ui                 │
│  │       └── /profile         │      ├── Button         │
│  ├── web (Next.js PWA)        │      ├── Input          │
│  │   ├── Service Worker       │      └── Avatar         │
│  │   └── Auth UI              │                          │
│  └── mobile (Expo)            │                          │
│      ├── expo-router           │                          │
│      └── Auth Screens         │                          │
└─────────────────────────────────────────────────────────┘
           │                    │
           ▼                    ▼
    ┌──────────┐          ┌──────────┐
    │ Supabase │          │PostgreSQL│
    │   Auth   │          │ Profiles │
    └──────────┘          └──────────┘
```

## Support

For issues and questions, please open a GitHub issue or refer to:

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev)
- [Supabase Documentation](https://supabase.com/docs)
