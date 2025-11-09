# Cycling Network Platform

A modern, full-stack monorepo for the best cycling network application. Built with Next.js, React Native, Expo, and Supabase.

## 🏗️ Architecture

This monorepo uses **Turborepo** for efficient building, caching, and orchestration of multiple applications and shared packages.

### Apps

- **`apps/backend`** - Next.js API routes serving as the backend API provider for all clients
- **`apps/web`** - Next.js web application with PWA support (Progressive Web App)
- **`apps/mobile`** - Expo React Native mobile application

### Packages

- **`packages/config`** - Shared configuration, types, and Supabase client utilities
- **`packages/ui`** - Shared UI components for both React (web) and React Native (mobile)

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Supabase Account** (Free tier) - Sign up at [supabase.com](https://supabase.com)

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd copilot-test
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup Supabase:**
   ```bash
   # See SUPABASE_SETUP.md for detailed instructions
   
   # Quick version:
   # 1. Create project at https://supabase.com/dashboard
   # 2. Run migration SQL in SQL Editor
   # 3. Configure OAuth providers (optional)
   # 4. Get API keys from Settings → API
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

5. **Run all apps in development mode:**
   ```bash
   npm run dev
   ```

   This starts:
   - Backend API on http://localhost:3001
   - Web PWA on http://localhost:3000
   - Mobile app with Expo (follow CLI instructions)

### Running Individual Apps

```bash
# Backend API
cd apps/backend && npm run dev

# Web PWA
cd apps/web && npm run dev

# Mobile (requires Expo Go app on your device)
cd apps/mobile && npm start
```

## 📦 Package Scripts

From the root directory:

- **`npm run dev`** - Start all apps in development mode
- **`npm run build`** - Build all apps
- **`npm run lint`** - Lint all apps
- **`npm run clean`** - Clean all build artifacts

## 🔐 Authentication

All apps use **Supabase Authentication** with the following features:

- ✅ Email/password authentication with verification
- ✅ OAuth providers (Google, Apple, Microsoft/Outlook)
- ✅ Password recovery via email
- ✅ Session management
- ✅ Auto-refresh tokens
- ✅ Persistent sessions
- ✅ Row Level Security (RLS)

### Setting up Authentication

1. **Create Supabase project** at [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Run database migration** from `apps/backend/database/supabase/001_create_cyclist_profiles.sql`
3. **Configure OAuth providers** (optional but recommended):
   - Google: For Gmail users
   - Apple: For iPhone/Mac users
   - Microsoft: For Outlook users
4. **Copy credentials** to `.env` file:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (backend only)

📖 **Detailed setup guide**: See `SUPABASE_SETUP.md`  
🔑 **OAuth configuration**: See `OAUTH_PROVIDERS.md`

## 🎨 Shared UI Components

The `@cycling-network/ui` package provides cross-platform components:

### Web/Desktop Usage
```tsx
import { Button } from '@cycling-network/ui';

<Button onClick={handleClick} variant="primary">
  Click me
</Button>
```

### Mobile Usage
```tsx
import { Button } from '@cycling-network/ui/native';

<Button onPress={handlePress} variant="primary">
  Click me
</Button>
```

## 📱 Progressive Web App (PWA)

The web app includes PWA support:

- **Offline support** - Service worker caching
- **Installable** - Add to home screen on mobile/desktop
- **App-like experience** - Full-screen mode, splash screen

To test PWA features, build and serve the web app:
```bash
cd apps/web
npm run build
npm run start
```

## 📂 Project Structure

```
copilot-test/
├── apps/
│   ├── backend/        # Next.js API routes
│   │   ├── src/pages/api/
│   │   └── package.json
│   ├── web/            # Next.js PWA
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── mobile/         # Expo React Native
│       ├── app/
│       ├── components/
│       └── package.json
├── packages/
│   ├── config/         # Shared config & types
│   │   ├── src/
│   │   └── package.json
│   └── ui/             # Shared UI components
│       ├── src/components/
│       └── package.json
├── .env.example        # Environment variables template
├── turbo.json          # Turborepo configuration
├── package.json        # Root package.json
└── README.md
```

## 🤖 GitHub Copilot Integration

This repository is optimized for GitHub Copilot agents to assist with development.

### Specialized Agents

We've configured 5 specialized agents to help you work more efficiently:

- **Backend API Agent** - Expert in Next.js API routes and server-side operations
- **Web PWA Agent** - Specialist in React, Next.js web app, and PWA features
- **Mobile App Agent** - Expert in Expo, React Native, and mobile development
- **Shared UI Agent** - Specialist in cross-platform component development
- **Config Package Agent** - Expert in shared types and configuration

📚 **See `.github/agents/README.md`** for detailed agent documentation and usage examples.

### Using Copilot in this Repo

1. **Code Completion** - Copilot provides context-aware suggestions based on:
   - Shared types from `@cycling-network/config`
   - UI components from `@cycling-network/ui`
   - Supabase patterns
   - Next.js and React Native best practices

2. **Copilot Chat with Agents** - Reference agents in your prompts:
   ```
   @backend-api-agent Create a new endpoint for fetching user routes
   ```
   Or ask questions:
   ```
   How do I add a new screen to the mobile app?
   ```

3. **Best Practices** - The codebase follows:
   - **Atomic Design** for UI components
   - **TypeScript** for type safety
   - **Monorepo patterns** with workspace packages
   - **Modern React** with hooks
   - **Accessibility** standards
   - **Performance** optimizations

### Example Copilot Prompts with Agents

- **Backend**: "@backend-api-agent Create an endpoint to fetch user routes"
- **Shared UI**: "@shared-ui-agent Create a Card component for web and mobile"
- **Web**: "@web-pwa-agent Implement password reset flow with Supabase"
- **Mobile**: "@mobile-app-agent Add pull-to-refresh to the activities list"
- **Config**: "@config-package-agent Add types for the route sharing feature"

## 🛠️ Development Workflow

### Adding a New Feature

1. **Determine scope** - Which apps need this feature?
2. **Add shared types** - Update `packages/config/src/types.ts` if needed
3. **Create UI components** - Add to `packages/ui/src/components/` for reusability
4. **Implement in apps** - Add feature to relevant apps
5. **Test across platforms** - Verify on web, desktop, and mobile

### Adding a New Shared Component

1. Create component files:
   ```
   packages/ui/src/components/
   ├── MyComponent.tsx        # Web version
   └── MyComponent.native.tsx # Mobile version
   ```

2. Export from index files:
   ```typescript
   // packages/ui/src/index.ts
   export { MyComponent } from './components/MyComponent';
   
   // packages/ui/src/native.ts
   export { MyComponent } from './components/MyComponent.native';
   ```

3. Use in apps:
   ```typescript
   // Web
   import { MyComponent } from '@cycling-network/ui';
   
   // Mobile
   import { MyComponent } from '@cycling-network/ui/native';
   ```

## 🧪 Testing

Testing infrastructure can be added based on your needs:

- **Unit tests** - Jest + React Testing Library
- **E2E tests** - Playwright (web), Detox (mobile)
- **API tests** - Supertest for backend endpoints

## 🚢 Deployment

### Backend API
- Deploy to Vercel, Railway, or any Node.js hosting
- Set environment variables in hosting platform

### Web PWA
- Deploy to Vercel (recommended for Next.js)
- Automatic PWA optimizations

### Mobile
- Use [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- Submit to App Store and Google Play

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)

## 🤝 Contributing

This is a skeleton/boilerplate project. Feel free to:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

GitHub Copilot can help you throughout the contribution process!

## 📝 License

This project is provided as-is for educational and development purposes.

## 🆘 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Use GitHub Copilot Chat for development questions
- Check Supabase docs for authentication issues

---

**Built with ❤️ and GitHub Copilot**