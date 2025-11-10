# GitHub Copilot Instructions for Cyclists Social Network

This file provides context and guidelines for GitHub Copilot when working with this monorepo.

## Project Overview

This is a Turborepo monorepo for a social network application for cyclists, featuring:

- **Backend API**: Next.js API routes on port 3001
- **Web PWA**: Next.js Progressive Web App on port 3000
- **Mobile App**: Expo React Native application with expo-router
- **Shared Packages**: `@cyclists/config` (types & Supabase) and `@cyclists/ui` (components)

## Technology Stack

- **Monorepo**: Turborepo with npm workspaces
- **Language**: TypeScript (strict mode)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with node-pg-migrate
- **Frontend**: Next.js 14 (web), Expo SDK 50 (mobile)
- **Styling**: CSS Modules (web), StyleSheet (mobile)
- **Code Quality**: Prettier, ESLint

## Architecture Patterns

### Authentication Flow

- Users are created in Supabase (auth.users)
- Profiles are stored in PostgreSQL (profiles table)
- Registration creates both simultaneously
- Session tokens are managed by Supabase

### Data Storage

- **Supabase**: Authentication, session management
- **PostgreSQL**: User profiles, cycling data, social features

### Code Organization

```
apps/
  backend/      # Next.js API routes
  web/         # Next.js PWA
  mobile/      # Expo React Native
packages/
  config/      # Shared types & Supabase client
  ui/          # Cross-platform components
```

## Coding Guidelines

### TypeScript

- Use strict mode
- Define explicit types for all function parameters and return values
- Avoid `any` types
- Use interfaces for data structures
- Export types from `packages/config`

### API Endpoints

- Use Next.js API routes in `apps/backend/src/app/api/`
- Validate all inputs
- Return consistent response format: `{ success: boolean, data?: T, error?: string }`
- Use parameterized queries for database operations
- Handle errors gracefully

### Components

- Keep components small and focused
- Use functional components with hooks
- Make components cross-platform when in `packages/ui`
- Use React Native primitives for shared components
- Separate business logic from presentation

### Database Operations

- Use migrations in `apps/backend/migrations/` directory
- Never modify schema directly in code
- Always use parameterized queries (prevent SQL injection)
- Create indexes for frequently queried fields
- Use transactions for multi-step operations

### Environment Variables

- Prefix public variables with `NEXT_PUBLIC_` or `EXPO_PUBLIC_`
- Keep sensitive data in environment variables
- Provide `.env.example` files
- Document all required variables

## Common Tasks

### Adding a New API Endpoint

1. Create route file in `apps/backend/src/app/api/[endpoint]/route.ts`
2. Define types in `packages/config/src/types.ts`
3. Add validation
4. Implement handler with proper error handling
5. Update API documentation

### Adding a New Database Table

1. Run `npm run migrate:create <name>` in apps/backend
2. Edit the migration file in `apps/backend/migrations/`
3. Run `npm run migrate:up` to apply
4. Define TypeScript types in `packages/config/src/types.ts`
5. Update API endpoints as needed

### Creating a Shared Component

1. Create component in `packages/ui/src/components/`
2. Use React Native primitives (View, Text, TouchableOpacity, etc.)
3. Export from `packages/ui/src/index.ts`
4. Test on both web and mobile

### Testing Changes

```bash
# Build all packages
npm run build

# Run linters
npm run lint

# Start development servers
npm run dev

# Test individual apps
cd apps/backend && npm run dev
cd apps/web && npm run dev
cd apps/mobile && npm start
```

## Database Schema

### profiles table

- `id`: UUID primary key
- `user_id`: UUID unique (links to Supabase auth.users)
- `level`: ENUM (beginner, intermediate, advanced, expert)
- `bike_type`: ENUM (road, mountain, hybrid, electric, gravel, other)
- `city`: VARCHAR(255)
- `latitude`, `longitude`: DECIMAL
- `date_of_birth`: DATE
- `avatar`: TEXT (URL)
- `bio`: TEXT
- `created_at`, `updated_at`: TIMESTAMP

## Best Practices

### Security

- Validate all user inputs
- Use parameterized queries
- Store sensitive data in environment variables
- Implement rate limiting on authentication endpoints
- Use HTTPS in production

### Performance

- Use indexes on frequently queried columns
- Implement caching where appropriate
- Optimize images with Next.js Image component
- Use Turborepo caching for builds
- Lazy load components when possible

### Error Handling

- Provide meaningful error messages
- Log errors for debugging
- Return user-friendly error responses
- Handle edge cases gracefully
- Use try-catch blocks

### Code Quality

- Run Prettier before committing
- Fix ESLint warnings
- Write descriptive commit messages
- Add comments for complex logic
- Keep functions small and focused

## Useful Commands

```bash
# Development
npm run dev                    # Start all apps
npm run build                  # Build everything
npm run lint                   # Lint all code
npm run format                 # Format with Prettier

# Database migrations
cd apps/backend
npm run migrate:up             # Apply migrations
npm run migrate:down           # Rollback last migration
npm run migrate:create name    # Create new migration

# Package management
npm install pkg --workspace=apps/backend
npm run clean                  # Clean build artifacts
```

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Expo Documentation](https://docs.expo.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [node-pg-migrate Documentation](https://salsita.github.io/node-pg-migrate/)

## Notes for Copilot

- When suggesting code, prefer TypeScript over JavaScript
- Use the established patterns and conventions in the codebase
- Consider cross-platform compatibility for shared components
- Always validate user inputs and handle errors
- Follow the existing code structure and naming conventions
- Reference existing implementations when adding similar features
- Suggest tests when adding new functionality
- Consider security implications in all suggestions
