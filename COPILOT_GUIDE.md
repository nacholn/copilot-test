# GitHub Copilot Developer Guide

This guide helps developers and GitHub Copilot agents understand the codebase structure and best practices for contributing to the Cycling Network Platform.

## 🎯 Project Overview

This is a **monorepo** containing multiple applications and shared packages:

- **Backend** (`apps/backend`) - Next.js API provider
- **Web PWA** (`apps/web`) - Progressive Web App
- **Mobile** (`apps/mobile`) - Expo React Native app
- **Shared Packages** (`packages/`) - Config and UI components

## 📐 Architecture Patterns

### Monorepo Structure

```
apps/          → Applications (deployable)
packages/      → Shared code (not deployable)
```

- Apps depend on packages
- Packages never depend on apps
- Use workspace references: `"@cycling-network/package-name": "workspace:*"`

### Shared Code Philosophy

**When to create shared code:**
- Type definitions used across apps → `packages/config/src/types.ts`
- UI components needed in multiple apps → `packages/ui/src/components/`
- Utility functions → `packages/config/src/`

**When NOT to create shared code:**
- App-specific business logic
- One-off components
- Platform-specific features

### Type Safety

All packages and apps use **TypeScript** with strict mode enabled:

```typescript
// ✅ Good: Explicit types
interface UserProps {
  userId: string;
  onUpdate: (user: User) => void;
}

// ❌ Bad: Implicit any
function handleUser(user) { ... }
```

## 🎨 UI Component Guidelines

### Cross-Platform Components

Components in `packages/ui/src/components/` must support both:
1. **Web** - React with HTML elements
2. **Mobile** - React Native components

**File naming convention:**
```
Button.tsx        → Web version (React)
Button.native.tsx → Mobile version (React Native)
```

### Creating a New Shared Component

1. **Create both versions:**
   ```bash
   # Web version
   packages/ui/src/components/Card.tsx
   
   # Mobile version  
   packages/ui/src/components/Card.native.tsx
   ```

2. **Keep interfaces identical:**
   ```typescript
   // Both files should export same interface
   export interface CardProps {
     title: string;
     children: React.ReactNode;
     onPress?: () => void;  // Use onPress (works for both)
   }
   ```

3. **Export from index files:**
   ```typescript
   // packages/ui/src/index.ts
   export { Card } from './components/Card';
   
   // packages/ui/src/native.ts
   export { Card } from './components/Card.native';
   ```

### Styling Guidelines

**Web:**
- Use inline styles or CSS-in-JS
- Follow responsive design principles
- Ensure accessibility (ARIA labels, keyboard navigation)

**Mobile:**
- Use React Native StyleSheet
- Design for touch interactions
- Consider safe areas

```typescript
// ✅ Good: Accessible button
<button
  aria-label="Submit form"
  onClick={handleClick}
  style={{ ... }}
>
  Submit
</button>

// ✅ Good: Responsive styles
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Submit form"
  onPress={handlePress}
  style={styles.button}
>
  <Text>Submit</Text>
</TouchableOpacity>
```

## 🔐 Authentication Patterns

### Supabase Client Creation

**Never hardcode credentials.** Always use environment variables.

```typescript
// ✅ Good: Use shared client factory
import { createBrowserClient } from '@cycling-network/config/supabase';
const supabase = createBrowserClient();

// ❌ Bad: Create client directly
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);
```

### Authentication Flows

**Client-side (Web/Mobile):**
```typescript
import { createBrowserClient } from '@cycling-network/config/supabase';

const supabase = createBrowserClient();

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Sign out
await supabase.auth.signOut();

// Listen to auth changes
supabase.auth.onAuthStateChange((event, session) => {
  // Update UI based on session
});
```

**Server-side (Backend API):**
```typescript
import { createServerClient } from '@cycling-network/config/supabase';

const supabase = createServerClient();

// Verify token from header
const token = req.headers.authorization?.replace('Bearer ', '');
const { data: { user }, error } = await supabase.auth.getUser(token);
```

## 🔧 Backend API Development

### Creating New Endpoints

Place API routes in `apps/backend/src/pages/api/`:

```typescript
// apps/backend/src/pages/api/routes/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@cycling-network/config/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Method guard
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createServerClient();
    const { id } = req.query;
    
    // Your logic here
    
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### API Best Practices

- ✅ Use HTTP status codes correctly (200, 400, 401, 404, 500)
- ✅ Validate input with guards
- ✅ Return consistent response format
- ✅ Handle errors gracefully
- ✅ Use TypeScript types from `@cycling-network/config/types`

## 🚀 Adding New Features

### Step-by-Step Process

1. **Define Types** (if needed)
   ```typescript
   // packages/config/src/types.ts
   export interface Activity {
     id: string;
     name: string;
     distance: number;
   }
   ```

2. **Create Backend API** (if needed)
   ```typescript
   // apps/backend/src/pages/api/activities.ts
   // Implement GET, POST, etc.
   ```

3. **Create Shared UI Component** (if reusable)
   ```typescript
   // packages/ui/src/components/ActivityCard.tsx
   // Web version
   
   // packages/ui/src/components/ActivityCard.native.tsx
   // Mobile version
   ```

4. **Implement in Apps**
   ```typescript
   // apps/web/src/pages/activities.tsx
   // apps/mobile/app/activities.tsx
   ```

## 🧪 Testing Strategy

### Running Tests

```bash
# Run all tests
npm run test

# Test specific app
cd apps/web && npm test
```

### Writing Tests

```typescript
// Component test example
import { render, screen } from '@testing-library/react';
import { Button } from '@cycling-network/ui';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## 📦 Package Management

### Adding Dependencies

**For a specific app:**
```bash
cd apps/web
npm install package-name
```

**For a shared package:**
```bash
cd packages/ui
npm install package-name
```

**For all apps:**
```bash
# From root
npm install package-name -w apps/*
```

### Using Shared Packages

```typescript
// ✅ Good: Import from package
import { Button } from '@cycling-network/ui';
import { createBrowserClient } from '@cycling-network/config/supabase';
import type { User } from '@cycling-network/config/types';

// ❌ Bad: Relative imports across packages
import { Button } from '../../../packages/ui/src/components/Button';
```

## 🎭 Environment Variables

### Where to Define

```
.env                          → Root (gitignored)
.env.example                  → Template (committed)
apps/backend/.env.local       → Backend overrides (gitignored)
apps/web/.env.local           → Web overrides (gitignored)
```

### Required Variables

```bash
# Supabase (required for all apps)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Backend only
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

### Using Environment Variables

```typescript
// ✅ Good: Check for existence
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

// ✅ Good: Use from config
import { supabaseConfig } from '@cycling-network/config';
```

## 🔄 Git Workflow

### Branch Naming

```
feature/add-route-planning
fix/auth-redirect-loop
refactor/button-component
docs/update-readme
```

### Commit Messages

```bash
# ✅ Good
git commit -m "feat: add route planning feature"
git commit -m "fix: resolve auth redirect loop"
git commit -m "refactor: simplify button component API"

# ❌ Bad
git commit -m "updates"
git commit -m "fix bug"
```

## 🤖 Copilot Tips

### Effective Prompts

**Good prompts:**
- "Create a new API endpoint for fetching user activities"
- "Add a Card component to the shared UI package with web and mobile versions"
- "Implement password reset using Supabase in the web app"

**Better prompts with context:**
- "Create a new API endpoint at /api/activities that uses Supabase to fetch activities for the authenticated user, following the pattern in /api/auth/session.ts"
- "Add a Card component to packages/ui following the Button component pattern, with title, description props, and click handler"

### Using Copilot Effectively

1. **Start with types** - Define interfaces first, let Copilot suggest implementation
2. **Reference existing code** - Point to similar files as examples
3. **Iterate** - Ask for refinements: "make this more accessible", "add error handling"
4. **Validate** - Always review generated code for security and correctness

## 📚 Common Patterns

### Data Fetching (Web)

```typescript
const [data, setData] = useState<Activity[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  async function fetchData() {
    try {
      const response = await fetch('/api/activities');
      const json = await response.json();
      setData(json.data);
    } catch (err) {
      setError('Failed to fetch');
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, []);
```

### Form Handling

```typescript
const [formData, setFormData] = useState({ email: '', password: '' });

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData(prev => ({
    ...prev,
    [e.target.name]: e.target.value,
  }));
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // Submit logic
};
```

## 🚨 Common Pitfalls

### ❌ Don't

```typescript
// Don't hardcode URLs
const API_URL = 'http://localhost:3001';

// Don't use any type
function handleData(data: any) { }

// Don't create circular dependencies
// packages/config importing from apps/backend

// Don't commit secrets
const SUPABASE_KEY = 'eyJxxx...';

// Don't skip error handling
const data = await fetch('/api/data').then(r => r.json());
```

### ✅ Do

```typescript
// Use environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Use proper types
function handleData(data: Activity[]) { }

// Keep dependencies clean
// apps → packages (never reverse)

// Use environment variables
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Handle errors
try {
  const response = await fetch('/api/data');
  if (!response.ok) throw new Error('Failed');
  const data = await response.json();
} catch (error) {
  // Handle error
}
```

## 📖 Resources

- **Turborepo**: https://turbo.build/repo/docs
- **Next.js**: https://nextjs.org/docs
- **Expo**: https://docs.expo.dev/
- **Supabase**: https://supabase.com/docs
- **React Native**: https://reactnative.dev/docs/getting-started

## 💡 Quick Reference

### File Creation Checklist

**New Shared Component:**
- [ ] Create `Component.tsx` (web)
- [ ] Create `Component.native.tsx` (mobile)
- [ ] Export from `packages/ui/src/index.ts`
- [ ] Export from `packages/ui/src/native.ts`
- [ ] Add TypeScript interfaces
- [ ] Test in both web and mobile apps

**New API Endpoint:**
- [ ] Create file in `apps/backend/src/pages/api/`
- [ ] Add TypeScript types
- [ ] Implement HTTP method guards
- [ ] Add authentication if needed
- [ ] Handle errors
- [ ] Test with all clients

**New App Page:**
- [ ] Create in `apps/[app]/src/pages/` or `apps/mobile/app/`
- [ ] Import shared components
- [ ] Add authentication if needed
- [ ] Test responsiveness (web)
- [ ] Test on device (mobile)

---

**Happy coding with GitHub Copilot! 🚀**
