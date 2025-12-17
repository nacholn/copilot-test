# GitHub Copilot Instructions for Cyclists Social Network

This file provides context and guidelines for GitHub Copilot when working with this monorepo.

## Quick Reference

**Project Type**: Turborepo Monorepo | **Language**: TypeScript (strict) | **Package Manager**: npm

**Key Workspaces:**

- `apps/backend` - Next.js 14 API (port 3001) - PostgreSQL + Supabase
- `apps/web` - Next.js 14 PWA (port 3000) - CSS Modules
- `apps/mobile` - Expo SDK 50 + expo-router - React Native
- `packages/config` - Shared types + Supabase client
- `packages/ui` - Cross-platform components (React Native primitives)

**Tech Stack**: Next.js 14, Expo SDK 50, PostgreSQL, Supabase Auth, Turborepo, TypeScript

**Key Commands:**

- `npm run dev` - Start all apps
- `npm run build` - Build everything
- `npm run lint` - Lint code
- `npm install <pkg> --workspace=<workspace>` - Add dependency

## Project Overview

This is a Turborepo monorepo for a social network application for cyclists, featuring:

- **Backend API**: Next.js API routes on port 3001
- **Web PWA**: Next.js Progressive Web App on port 3000
- **Mobile App**: Expo React Native application with expo-router
- **Shared Packages**: `@bicicita/config` (types & Supabase) and `@bicicita/ui` (components)

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

## File Structure and Naming Conventions

### File Organization

- **API Routes**: Place in `apps/backend/src/app/api/[endpoint]/route.ts`
- **Web Pages**: Place in `apps/web/src/app/[route]/page.tsx`
- **Mobile Screens**: Place in `apps/mobile/app/[screen].tsx`
- **Shared Types**: Export from `packages/config/src/types.ts`
- **UI Components**: Place in `packages/ui/src/components/[Component].tsx`
- **Database Migrations**: Place in `apps/backend/migrations/[timestamp]-[name].js`

### Naming Conventions

- **Components**: PascalCase (e.g., `Button.tsx`, `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`, `validateEmail.ts`)
- **Types/Interfaces**: PascalCase with descriptive names (e.g., `User`, `ProfileData`)
- **API Routes**: kebab-case (e.g., `/api/user-profile`, `/api/auth/login`)
- **CSS Modules**: Component name + `.module.css` (e.g., `Button.module.css`)

### Monorepo Workspace Usage

When adding dependencies:

```bash
# Add to specific workspace
npm install <package> --workspace=apps/backend

# Add to root (for dev tools)
npm install <package> -D

# Link local packages (already configured)
# Use: "@bicicita/config": "*" in package.json
```

## Coding Guidelines

### TypeScript

**DO:**

- Use strict mode (already configured)
- Define explicit types for all function parameters and return values
- Use interfaces for data structures
- Export shared types from `packages/config`
- Use `unknown` instead of `any` when type is truly unknown

**DON'T:**

- Use `any` types
- Skip type annotations on function parameters
- Define types inline in multiple files (centralize in packages/config)

**Examples:**

```typescript
// ✅ Good: Explicit types, shared interface
import { User } from '@bicicita/config';

async function getUserProfile(userId: string): Promise<User | null> {
  // ...
}

// ❌ Bad: Missing types, using any
async function getUserProfile(userId) {
  // ...
}
```

### API Endpoints

**DO:**

- Use Next.js API routes in `apps/backend/src/app/api/`
- Validate all inputs before processing
- Return consistent response format: `{ success: boolean, data?: T, error?: string }`
- Use parameterized queries for all database operations
- Handle errors gracefully with try-catch blocks
- Use appropriate HTTP status codes (200, 201, 400, 401, 404, 500)
- Log errors for debugging

**DON'T:**

- Concatenate user input into SQL queries (SQL injection risk)
- Return raw error messages to clients (security risk)
- Skip input validation
- Use inconsistent response formats

**Example:**

```typescript
// ✅ Good: Validated input, parameterized query, consistent response
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const result = await db.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);

    return NextResponse.json({
      success: true,
      data: result.rows[0] || null,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// ❌ Bad: No validation, SQL injection risk, inconsistent response
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const result = await db.query(`SELECT * FROM profiles WHERE user_id = '${userId}'`);
  return NextResponse.json(result.rows[0]);
}
```

### Components

**DO:**

- Keep components small and focused (single responsibility)
- Use functional components with hooks
- Make components in `packages/ui` cross-platform compatible
- Use React Native primitives (View, Text, TouchableOpacity) for shared components
- Separate business logic from presentation
- Add proper TypeScript prop types
- Use CSS Modules for web-only components
- Use StyleSheet.create for mobile components

**DON'T:**

- Use class components (prefer functional + hooks)
- Use platform-specific imports in shared components
- Put business logic directly in components
- Use inline styles extensively
- Import DOM-specific code in shared components

**Example:**

```typescript
// ✅ Good: Shared component with proper types
// packages/ui/src/components/Button.tsx
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({ title, onPress, variant = 'primary', disabled }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { padding: 12, borderRadius: 8 },
  primary: { backgroundColor: '#007bff' },
  secondary: { backgroundColor: '#6c757d' },
  disabled: { opacity: 0.5 },
  text: { color: '#fff', textAlign: 'center', fontWeight: '600' }
});

// ❌ Bad: Platform-specific, no types, inline styles
export function Button({ title, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '12px', background: 'blue' }}>
      {title}
    </button>
  );
}
```

### Database Operations

**DO:**

- Use migrations in `apps/backend/migrations/` directory
- Create migrations with `npm run migrate:create <name>` in apps/backend
- Always use parameterized queries ($1, $2, etc.)
- Create indexes for frequently queried fields
- Use transactions for multi-step operations
- Add timestamps (created_at, updated_at) to tables
- Use UUIDs for primary keys
- Add proper foreign key constraints

**DON'T:**

- Modify schema directly in code
- Concatenate user input into SQL strings
- Skip migrations for schema changes
- Forget to add indexes on foreign keys
- Use sequential integers for public-facing IDs

**Example Migration:**

```javascript
// ✅ Good: Proper migration with indexes and constraints
exports.up = (pgm) => {
  pgm.createTable('posts', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'profiles(user_id)' },
    title: { type: 'varchar(255)', notNull: true },
    content: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('posts', 'user_id');
  pgm.createIndex('posts', 'created_at');
};

exports.down = (pgm) => {
  pgm.dropTable('posts');
};

// ❌ Bad: No indexes, no constraints, no timestamps
exports.up = (pgm) => {
  pgm.createTable('posts', {
    id: 'serial',
    user_id: 'integer',
    title: 'text',
    content: 'text',
  });
};
```

### Environment Variables

**DO:**

- Prefix public variables with `NEXT_PUBLIC_` (Next.js) or `EXPO_PUBLIC_` (Expo)
- Keep sensitive data in environment variables
- Provide `.env.example` files with placeholder values
- Document all required variables in README
- Use different variables for different environments
- Validate required env vars at startup

**DON'T:**

- Commit `.env` files to git (should be in .gitignore)
- Expose sensitive data in client-side code
- Use public prefixes for sensitive data like API keys
- Skip validation of required environment variables

**Example:**

```typescript
// ✅ Good: Validated environment variables
// apps/backend/src/lib/env.ts
function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  supabaseUrl: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  databaseUrl: getEnvVar('DATABASE_URL'), // Private - not NEXT_PUBLIC_
};

// .env.example
// NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
// DATABASE_URL=postgresql://user:password@localhost:5432/db

// ❌ Bad: No validation, secrets exposed
export const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  databasePassword: process.env.NEXT_PUBLIC_DB_PASSWORD, // DON'T expose secrets!
};
```

### Testing

**Testing Strategy:**

- Unit tests for business logic and utilities
- Integration tests for API endpoints
- Component tests for UI components
- E2E tests for critical user flows

**When to Add Tests:**

- When adding new utility functions
- When creating new API endpoints
- When fixing bugs (add regression test)
- When adding critical business logic

**Test File Location:**

- Co-locate with source: `Button.tsx` → `Button.test.tsx`
- Or use `__tests__` directory in the same folder

**Note:** This repository currently has minimal test infrastructure. When adding tests, follow the patterns established in similar TypeScript/React projects.

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

## Development Workflow

### Before Starting

1. Understand which workspace you're working in (backend, web, mobile, or shared packages)
2. Check existing implementations for similar features
3. Verify environment variables are documented
4. Identify shared types that can be reused

### Making Changes

1. **Update Types First**: Add/modify types in `packages/config/src/types.ts`
2. **Create/Update Components**: Build in appropriate location
3. **Add API Endpoints**: Create in `apps/backend/src/app/api/`
4. **Update Documentation**: Keep README and inline docs current
5. **Test Locally**: Use `npm run dev` to verify changes

### Committing Changes

- Use clear, descriptive commit messages
- Run `npm run format` before committing
- Run `npm run lint` to check for issues
- Test affected functionality

## Notes for Copilot

### General Behavior

- **Always** use TypeScript (never JavaScript)
- **Always** validate user inputs before processing
- **Always** use parameterized queries for database operations
- **Always** handle errors with try-catch blocks
- **Always** return consistent API response formats

### Code Suggestions

- Reference existing implementations before creating new patterns
- Maintain consistency with the established codebase style
- Consider cross-platform compatibility when working in `packages/ui`
- Suggest appropriate error handling for all code
- Include type definitions for all new functions and components
- Prefer functional components with hooks over class components

### Security Considerations

- Never concatenate user input into SQL queries
- Never expose sensitive data in client-side code
- Always validate and sanitize user inputs
- Use environment variables for sensitive configuration
- Consider rate limiting for authentication endpoints

### Performance Considerations

- Suggest database indexes for new foreign keys
- Recommend caching strategies when appropriate
- Use Next.js Image component for images
- Lazy load components when beneficial
- Consider Turborepo caching for build optimization

### When Suggesting Changes

1. **Location**: Place code in the correct workspace/directory
2. **Types**: Define or import appropriate TypeScript types
3. **Error Handling**: Include try-catch and user-friendly errors
4. **Documentation**: Add JSDoc comments for complex logic
5. **Testing**: Suggest test cases when adding new functionality
6. **Dependencies**: Use `npm install --workspace=<workspace>` for adding packages
