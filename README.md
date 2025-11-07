# Cycling Network Platform

A modern, full-stack monorepo for the best cycling network application. Built with Next.js, React Native, Expo, and Supabase.

## 🏗️ Architecture

This monorepo uses **Turborepo** for efficient building, caching, and orchestration of multiple applications and shared packages.

### Apps

- **`apps/backend`** - Next.js API routes serving as the backend API provider for all clients
- **`apps/web`** - Next.js web application with PWA support (Progressive Web App)
- **`apps/desktop`** - Next.js application with Electron integration for native desktop experience
- **`apps/mobile`** - Expo React Native mobile application

### Packages

- **`packages/config`** - Shared configuration, types, and Supabase client utilities
- **`packages/ui`** - Shared UI components for both React (web/desktop) and React Native (mobile)

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Supabase Account** - Sign up at [supabase.com](https://supabase.com)

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

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   - Get `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your [Supabase project settings](https://app.supabase.com)

4. **Run all apps in development mode:**
   ```bash
   npm run dev
   ```

   This starts:
   - Backend API on http://localhost:3001
   - Web PWA on http://localhost:3000
   - Desktop app on http://localhost:3002
   - Mobile app with Expo (follow CLI instructions)

### Running Individual Apps

```bash
# Backend API
cd apps/backend && npm run dev

# Web PWA
cd apps/web && npm run dev

# Desktop
cd apps/desktop && npm run dev

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

- Email/password authentication
- Session management
- Auto-refresh tokens
- Persistent sessions

### Setting up Authentication

1. Create a Supabase project at [app.supabase.com](https://app.supabase.com)
2. Enable Email authentication in Authentication > Providers
3. Create test users in Authentication > Users
4. Copy your project URL and anon key to `.env`

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

## 🖥️ Desktop App (Electron)

The desktop app uses Electron for native desktop features:

### Development
```bash
cd apps/desktop
npm run dev          # Start Next.js dev server
npm run electron:dev # In another terminal, start Electron
```

### Building
```bash
cd apps/desktop
npm run build        # Build Next.js app
npm run electron:build # Build Electron executable
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
│   ├── desktop/        # Next.js + Electron
│   │   ├── src/
│   │   ├── electron/
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

### Using Copilot in this Repo

1. **Code Completion** - Copilot provides context-aware suggestions based on:
   - Shared types from `@cycling-network/config`
   - UI components from `@cycling-network/ui`
   - Supabase patterns
   - Next.js and React Native best practices

2. **Copilot Chat** - Ask questions about:
   - How to add new features
   - Authentication flows
   - Component usage
   - API endpoints

3. **Best Practices** - The codebase follows:
   - **Atomic Design** for UI components
   - **TypeScript** for type safety
   - **Monorepo patterns** with workspace packages
   - **Modern React** with hooks
   - **Accessibility** standards
   - **Performance** optimizations

### Example Copilot Prompts

- "Add a new API endpoint for fetching user routes"
- "Create a new shared UI component for a card"
- "Implement password reset flow with Supabase"
- "Add offline support to the mobile app"

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
   // Web/Desktop
   import { MyComponent } from '@cycling-network/ui';
   
   // Mobile
   import { MyComponent } from '@cycling-network/ui/native';
   ```

## 🧪 Testing

Testing infrastructure can be added based on your needs:

- **Unit tests** - Jest + React Testing Library
- **E2E tests** - Playwright (web/desktop), Detox (mobile)
- **API tests** - Supertest for backend endpoints

## 🚢 Deployment

### Backend API
- Deploy to Vercel, Railway, or any Node.js hosting
- Set environment variables in hosting platform

### Web PWA
- Deploy to Vercel (recommended for Next.js)
- Automatic PWA optimizations

### Desktop
- Build with `electron-builder`
- Distribute via GitHub Releases or app stores

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