# Development Guide

Quick reference for common development tasks in the Cycling Network Platform monorepo.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Supabase credentials
# Get them from https://app.supabase.com

# Start all apps
npm run dev
```

## 📱 Running Specific Apps

### Backend API (Port 3001)
```bash
cd apps/backend
npm run dev
```
Visit: http://localhost:3001/api/health

### Web PWA (Port 3000)
```bash
cd apps/web
npm run dev
```
Visit: http://localhost:3000

### Mobile App
```bash
cd apps/mobile
npm start
```
Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your device

## 🔧 Common Tasks

### Install a New Package

**In a specific app:**
```bash
cd apps/web
npm install package-name
```

**In a shared package:**
```bash
cd packages/ui
npm install package-name
```

**In all apps:**
```bash
npm install package-name -w apps/*
```

### Create a New Shared Component

1. Create web version:
   ```bash
   touch packages/ui/src/components/MyComponent.tsx
   ```

2. Create mobile version:
   ```bash
   touch packages/ui/src/components/MyComponent.native.tsx
   ```

3. Export from index files:
   ```typescript
   // Add to packages/ui/src/index.ts
   export { MyComponent } from './components/MyComponent';
   
   // Add to packages/ui/src/native.ts
   export { MyComponent } from './components/MyComponent.native';
   ```

4. Use in apps:
   ```typescript
   // Web
   import { MyComponent } from '@cycling-network/ui';
   
   // Mobile
   import { MyComponent } from '@cycling-network/ui/native';
   ```

### Add a New API Endpoint

1. Create file in backend:
   ```bash
   touch apps/backend/src/pages/api/my-endpoint.ts
   ```

2. Implement handler:
   ```typescript
   import type { NextApiRequest, NextApiResponse } from 'next';
   
   export default async function handler(
     req: NextApiRequest,
     res: NextApiResponse
   ) {
     if (req.method !== 'GET') {
       return res.status(405).json({ error: 'Method not allowed' });
     }
     
     // Your logic here
     res.status(200).json({ data: 'Hello' });
   }
   ```

3. Test it:
   ```bash
   curl http://localhost:3001/api/my-endpoint
   ```

### Add a New Type

1. Edit shared types:
   ```typescript
   // packages/config/src/types.ts
   export interface MyNewType {
     id: string;
     name: string;
   }
   ```

2. Import in apps:
   ```typescript
   import type { MyNewType } from '@cycling-network/config/types';
   ```

## 🏗️ Building

### Build All Apps
```bash
npm run build
```

### Build Specific App
```bash
cd apps/web
npm run build
```

## 🧹 Cleaning

### Clean All
```bash
npm run clean
```

### Clean Specific App
```bash
cd apps/web
npm run clean
```

### Deep Clean (including node_modules)
```bash
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```

## 🧪 Testing

### Lint All
```bash
npm run lint
```

### Lint Specific App
```bash
cd apps/web
npm run lint
```

## 🔐 Supabase Setup

1. **Create Project:**
   - Go to https://app.supabase.com
   - Click "New Project"
   - Choose organization and name

2. **Get Credentials:**
   - Go to Project Settings > API
   - Copy:
     - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Enable Authentication:**
   - Go to Authentication > Providers
   - Enable "Email" provider
   - Configure other providers as needed

4. **Create Test User:**
   - Go to Authentication > Users
   - Click "Invite User" or "Add User"
   - Use this user to test auth flows

## 📊 Monitoring Dev Servers

When running `npm run dev` from root, you'll see:

```
[backend] ready - started server on 0.0.0.0:3001
[web] ready - started server on 0.0.0.0:3000
[mobile] Metro waiting on exp://192.168.x.x:8081
```

You can access:
- Backend: http://localhost:3001/api/health
- Web: http://localhost:3000
- Mobile: Scan QR in terminal with Expo Go

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill it
kill -9 $(lsof -ti:3000)

# Or change port in package.json
"dev": "next dev -p 3003"
```

### Dependencies Not Found

```bash
# Clear caches and reinstall
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
rm -rf .turbo
npm install
```

### TypeScript Errors

```bash
# Rebuild shared packages
cd packages/config
npm run build

cd ../ui
npm run build
```

### Supabase Connection Issues

1. Check `.env` file exists and has correct values
2. Verify credentials at https://app.supabase.com
3. Check for typos in environment variable names
4. Restart dev servers after changing `.env`

### Expo/Mobile Issues

```bash
# Clear Expo cache
cd apps/mobile
rm -rf .expo
npx expo start -c

# Reset Metro bundler
npx expo start --clear
```

## 🎯 Best Practices

### Before Committing

1. ✅ Lint your code: `npm run lint`
2. ✅ Build to check for errors: `npm run build`
3. ✅ Test in all affected apps
4. ✅ Check no secrets in code
5. ✅ Update documentation if needed

### Code Style

- Use TypeScript for all new files
- Follow existing patterns in the codebase
- Add comments for complex logic
- Use shared types from `@cycling-network/config`
- Keep components small and focused

### Environment Variables

- Never commit `.env` files
- Always update `.env.example` when adding new vars
- Use `NEXT_PUBLIC_` prefix for client-side variables
- Keep sensitive keys (service role) server-side only

## 📱 Mobile Development Tips

### Testing on Physical Device

1. Install Expo Go app from App Store / Play Store
2. Ensure device and computer on same WiFi
3. Scan QR code from terminal
4. Shake device to open developer menu

### Testing on Simulator/Emulator

**iOS (Mac only):**
```bash
cd apps/mobile
npm run ios
```

**Android:**
```bash
cd apps/mobile
npm run android
```

### Debugging

- Shake device → "Debug Remote JS"
- Or press `j` in terminal to open debugger
- Use React DevTools: `npm install -g react-devtools` → `react-devtools`

## 🚀 Deployment Checklist

### Before Deploying

- [ ] All tests pass
- [ ] Build succeeds: `npm run build`
- [ ] Environment variables configured in hosting platform
- [ ] Database migrations applied (if any)
- [ ] API endpoints tested
- [ ] Mobile app built with EAS (for mobile)

### Deployment Targets

- **Backend**: Vercel, Railway, Render
- **Web**: Vercel, Netlify, Cloudflare Pages
- **Mobile**: App Store (iOS), Google Play (Android)

## 📚 Additional Resources

- [Turborepo Docs](https://turbo.build/repo/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Expo Docs](https://docs.expo.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [React Native Docs](https://reactnative.dev/docs/getting-started)

## 🆘 Getting Help

1. Check this guide and README.md
2. Check COPILOT_GUIDE.md for patterns
3. Use GitHub Copilot Chat for code questions
4. Search existing issues
5. Open a new issue with details

---

**Happy developing! 🎉**
