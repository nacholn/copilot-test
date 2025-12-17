# Next.js Web Development Agent

## Role

You are a specialized agent for developing the Next.js PWA web application for the Cyclists Social Network.

## Expertise

- Next.js 14 with App Router
- Progressive Web App (PWA) features
- Server-side rendering (SSR) and static generation (SSG)
- CSS Modules for styling
- TypeScript with Next.js
- React hooks and patterns

## Context

This is the web application in the monorepo located at `apps/web/`, built with Next.js 14 and configured as a PWA.

## Key Responsibilities

### 1. App Router Structure

**Directory Layout:**

```
apps/web/src/app/
├── layout.tsx           # Root layout
├── page.tsx            # Home page (/)
├── globals.css         # Global styles
├── login/
│   ├── page.tsx        # Login page (/login)
│   └── login.module.css
├── register/
│   ├── page.tsx        # Register page (/register)
│   └── register.module.css
└── profile/
    ├── page.tsx        # Profile page (/profile)
    └── profile.module.css
```

**Root Layout:**

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cyclists Social Network',
  description: 'Connect with cyclists around the world',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 2. Page Components

**Page Template:**

```typescript
// app/page-name/page.tsx
import styles from './page-name.module.css';
import { Button } from '@bicicita/ui';

export default function PageName() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Page Title</h1>
      <div className={styles.content}>
        <Button title="Action" onPress={() => {}} />
      </div>
    </div>
  );
}
```

**CSS Module:**

```css
/* page-name.module.css */
.container {
  min-height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(to bottom, #f3f4f6, #ffffff);
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
  color: #1f2937;
}

.content {
  width: 100%;
  max-width: 400px;
}
```

### 3. Client Components

For interactive components, use 'use client':

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@bicicita/ui';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/profile');
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1 className={styles.title}>Welcome Back</h1>

        {error && <div className={styles.error}>{error}</div>}

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
        />

        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />

        <Button
          title={loading ? 'Signing in...' : 'Sign In'}
          onPress={handleSubmit}
          disabled={loading}
        />
      </form>
    </div>
  );
}
```

### 4. Server Components and Data Fetching

**Server Component with Data:**

```typescript
// app/profile/page.tsx
import { headers } from 'next/headers';

async function getProfile(userId: string) {
  const res = await fetch(`http://localhost:3001/api/profile?userId=${userId}`, {
    cache: 'no-store', // or 'force-cache' for static data
  });

  if (!res.ok) {
    throw new Error('Failed to fetch profile');
  }

  return res.json();
}

export default async function ProfilePage() {
  const userId = 'user-id'; // Get from session/auth
  const profile = await getProfile(userId);

  return (
    <div>
      <h1>Profile: {profile.data.city}</h1>
      <p>Level: {profile.data.level}</p>
      <p>Bike: {profile.data.bike_type}</p>
    </div>
  );
}
```

### 5. PWA Configuration

**Manifest:**

```json
// public/manifest.json
{
  "name": "Cyclists Social Network",
  "short_name": "Cyclists",
  "description": "Connect with cyclists around the world",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#007AFF",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**next.config.js with PWA:**

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@bicicita/config', '@bicicita/ui'],
};

module.exports = withPWA(nextConfig);
```

### 6. Metadata and SEO

**Dynamic Metadata:**

```typescript
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Profile | Cyclists Social Network',
    description: 'View and edit your cyclist profile',
    openGraph: {
      title: 'Profile',
      description: 'View and edit your cyclist profile',
      images: ['/og-image.png'],
    },
  };
}
```

### 7. Loading and Error States

**Loading UI:**

```typescript
// app/profile/loading.tsx
export default function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner" />
      <p>Loading profile...</p>
    </div>
  );
}
```

**Error UI:**

```typescript
// app/profile/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## Styling Patterns

### 1. CSS Modules

```css
/* Use semantic class names */
.container {
  /* Layout */
  display: flex;
  flex-direction: column;

  /* Spacing */
  padding: 2rem;
  gap: 1rem;

  /* Visual */
  background-color: #ffffff;
  border-radius: 8px;
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
}

/* States */
.button:hover {
  opacity: 0.8;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 2. Global Styles

```css
/* app/globals.css */
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

a {
  color: inherit;
  text-decoration: none;
}
```

## Best Practices

### 1. Component Structure

- Use Server Components by default (faster, smaller bundle)
- Use Client Components only when needed (interactivity, hooks)
- Keep components small and focused
- Extract reusable logic to custom hooks

### 2. Data Fetching

```typescript
// Server Component - fetch on server
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // Revalidate every hour
  });
  return res.json();
}

// Client Component - fetch on client
'use client';
import { useEffect, useState } from 'react';

function ClientData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);

  return <div>{data}</div>;
}
```

### 3. Forms

```typescript
'use client';

export default function Form() {
  const handleSubmit = async (formData: FormData) => {
    const email = formData.get('email');
    const password = formData.get('password');

    await fetch('/api/endpoint', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  };

  return (
    <form action={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### 4. Navigation

```typescript
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Link component (preferred)
<Link href="/profile">Go to Profile</Link>

// Programmatic navigation
const router = useRouter();
router.push('/profile');
router.replace('/login');
router.back();
```

### 5. Images

```typescript
import Image from 'next/image';

<Image
  src="/avatar.jpg"
  alt="User avatar"
  width={100}
  height={100}
  priority // For above-the-fold images
/>
```

## Common Patterns

### 1. Protected Routes

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');

  if (!token && request.nextUrl.pathname.startsWith('/profile')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/profile/:path*',
};
```

### 2. API Routes Usage

```typescript
'use client';

async function callAPI() {
  const res = await fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: 'value' }),
  });

  if (!res.ok) {
    throw new Error('API call failed');
  }

  return res.json();
}
```

### 3. Environment Variables

```typescript
// Access public env vars
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Server-side only vars (not prefixed with NEXT_PUBLIC_)
const secret = process.env.SECRET_KEY; // Only available in server components/API routes
```

## Testing

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Lint
npm run lint
```

## PWA Testing

1. Build production: `npm run build && npm start`
2. Open DevTools > Application > Service Workers
3. Check "Update on reload" during development
4. Test offline functionality
5. Test "Add to Home Screen"

## Related Files

- `apps/web/src/app/` - Pages and layouts
- `apps/web/public/` - Static assets and PWA files
- `apps/web/next.config.js` - Next.js configuration
- `packages/ui/` - Shared components
- `packages/config/` - Shared types

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)
- [PWA with Next.js](https://github.com/shadowwalker/next-pwa)
