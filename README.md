# 🚴 Cyclists Social Network - Turborepo Monorepo

A full-stack social network for cyclists built with Turborepo, featuring Next.js backend API, Next.js PWA frontend, and Expo React Native mobile app.

## 📦 Project Structure

```
cyclists-social-network/
├── apps/
│   ├── backend/        # Next.js API server (port 3001)
│   ├── web/           # Next.js PWA with service worker
│   └── mobile/        # Expo React Native app with expo-router
├── packages/
│   ├── config/        # Shared TypeScript types and Supabase client
│   └── ui/           # Cross-platform React + React Native components
└── turbo.json        # Turborepo configuration
```

## 🚀 Features

### Backend (apps/backend)

- **Authentication API**: Register, login, password recovery
- **Profile Management**: Create and update user profiles
- **Image Upload API**: Cloudinary integration for profile pictures
- **Supabase Integration**: User authentication with Supabase
- **PostgreSQL Database**: Profile storage with rich schema
- **Next.js API Routes**: RESTful API endpoints

### Web App (apps/web)

- **Progressive Web App**: Offline-capable with service worker
- **Authentication UI**: Login, register, password recovery flows
- **Profile Management**: View and edit user profiles with image upload
- **Drag-Drop Image Upload**: Intuitive profile picture management
- **Responsive Design**: Mobile-first approach
- **Next.js 14**: Latest App Router features

### Mobile App (apps/mobile)

- **Expo React Native**: Cross-platform mobile development
- **Expo Router**: File-based routing system
- **Authentication Flows**: Native mobile auth experience
- **Profile Screens**: Native mobile profile management
- **Shared Components**: Uses @cyclists/ui package

### Shared Packages

- **@cyclists/config**: TypeScript types, Supabase client factory
- **@cyclists/ui**: Cross-platform UI components (Button, Input, Avatar)

## 📋 Prerequisites

- Node.js 18+ (recommended: 20.19.5)
- npm 10+
- PostgreSQL database (or Docker for local development)
- Docker & Docker Compose (optional, for simplified database setup)
- Supabase account

## 🛠️ Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd copilot-test
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

#### Backend (.env)

```bash
cd apps/backend
cp .env.example .env
```

Edit `apps/backend/.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL=postgresql://user:password@host:5432/database
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **📸 Image Upload Setup**: For profile picture uploads, you'll need a [Cloudinary account](https://cloudinary.com). See [CLOUDINARY_SETUP.md](./CLOUDINARY_SETUP.md) for detailed instructions.

#### Web (.env)

```bash
cd apps/web
cp .env.example .env
```

Edit `apps/web/.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### Mobile (.env)

```bash
cd apps/mobile
cp .env.example .env
```

Edit `apps/mobile/.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_API_URL=http://localhost:3001
```

### 4. Database Setup

#### Option A: Using Docker (Recommended for Local Development)

Start PostgreSQL using Docker Compose:

```bash
docker-compose up -d postgres
```

The database will be available at `postgresql://postgres:postgres@localhost:5432/cyclists_db`

Update your `apps/backend/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cyclists_db
```

See [DOCKER.md](DOCKER.md) for detailed Docker setup and management.

#### Option B: Using Local PostgreSQL

If you have PostgreSQL installed locally, create a database and update the `DATABASE_URL` in `apps/backend/.env`.

#### Run Migrations

After setting up the database, run migrations:

```bash
cd apps/backend
npm run migrate:up
```

> **📝 Note**: Migration files use `.mjs` extension with ES module syntax for optimal performance and to avoid Node.js module warnings.

The profile schema includes:

- `id`: UUID primary key
- `user_id`: UUID (links to Supabase auth)
- `level`: Cycling level (beginner, intermediate, advanced, expert)
- `bike_type`: Type of bike (road, mountain, hybrid, electric, gravel, other)
- `city`: User's city
- `latitude`, `longitude`: Optional location coordinates
- `date_of_birth`: Optional date of birth
- `avatar`: Optional profile picture URL
- `bio`: Optional user bio
- Timestamps: `created_at`, `updated_at`

### 5. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Enable Email authentication in Authentication settings
3. Copy your project URL and anon key to the `.env` files
4. Configure email templates for password recovery (optional)

## 🏃 Running the Project

### Development Mode (All apps)

```bash
npm run dev
```

This will start:

- Backend API: http://localhost:3001
- Web app: http://localhost:3000
- Mobile app: Follow Expo CLI instructions

### Individual Apps

#### Backend only

```bash
cd apps/backend
npm run dev
```

#### Web only

```bash
cd apps/web
npm run dev
```

#### Mobile only

```bash
cd apps/mobile
npm start
```

## 🏗️ Building

### Build all apps

```bash
npm run build
```

### Build individual apps

```bash
cd apps/backend && npm run build
cd apps/web && npm run build
cd apps/mobile && npm run build
```

## 📱 Mobile Development

### iOS

```bash
cd apps/mobile
npm run ios
```

### Android

```bash
cd apps/mobile
npm run android
```

### Web (Expo)

```bash
cd apps/mobile
npm run web
```

## 🧪 Testing

```bash
npm run test
```

## 🎨 Code Style

```bash
npm run lint        # Run linters
npm run format      # Format code with Prettier
```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user with profile
- `POST /api/auth/login` - Login user
- `POST /api/auth/recover` - Request password recovery

### Profile

- `GET /api/profile?userId={id}` - Get user profile
- `PATCH /api/profile?userId={id}` - Update user profile

## 🔐 Authentication Flow

1. **Register**: User creates account in Supabase → Profile created in PostgreSQL
2. **Login**: User authenticates with Supabase → Session token returned
3. **Profile Access**: Authenticated requests include session token
4. **Password Recovery**: Email sent via Supabase with reset link

## 📦 Package Linking

The monorepo uses npm workspaces for package linking:

- `@cyclists/config` provides shared types and Supabase client
- `@cyclists/ui` provides cross-platform components
- Apps import packages using workspace protocol (`"@cyclists/config": "*"`)

## 🔧 Turborepo Configuration

The `turbo.json` defines:

- **build**: Builds all packages and apps with dependency awareness
- **dev**: Runs all dev servers concurrently
- **lint**: Runs linting across the monorepo
- **test**: Runs tests with proper dependencies

## ✨ Recent Updates

### New Features Added

- ✅ **Cloudinary Integration**: Profile images now stored securely in the cloud with automatic optimization
- ✅ **Multiple Images**: Users can upload and manage multiple profile images
- ✅ **Friend Chat System**: Real-time messaging between friends with unread indicators
- ✅ **Loading States**: Professional loading indicators throughout the app
- ✅ **Responsive Profile Edit**: Two-column layout on larger screens for better UX
- ✅ **Fixed Header**: Improved spacing to prevent content overlap

See [NEW_FEATURES.md](./NEW_FEATURES.md) for detailed documentation.

## 🌟 Future Enhancements

- [ ] Social features (posts, comments, likes)
- [ ] Route sharing and discovery
- [ ] WebSocket-based real-time messaging
- [ ] Activity tracking and statistics
- [ ] Group rides and events
- [ ] Photo galleries with multiple images
- [ ] Map integration for routes
- [ ] Push notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT

## 🆘 Troubleshooting

### Port already in use

If port 3000 or 3001 is in use, you can change the port:

```bash
# Backend
PORT=3002 npm run dev

# Web
PORT=3003 npm run dev
```

### Database connection issues

- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check firewall settings

### Supabase connection issues

- Verify Supabase URL and keys
- Check project status in Supabase dashboard
- Ensure email authentication is enabled

### Module resolution issues

```bash
# Clear all node_modules and reinstall
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```

## 📧 Support

For issues and questions, please open a GitHub issue.
