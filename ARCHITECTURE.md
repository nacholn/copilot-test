# Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Turborepo Monorepo                        │
│                     (Build & Cache Orchestration)                │
└─────────────────────────────────────────────────────────────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌──────────────┐          ┌──────────────┐          ┌──────────────┐
│   Backend    │          │     Web      │          │   Mobile     │
│  (Next.js)   │          │  (Next.js)   │          │   (Expo)     │
│  Port 3001   │◄─────────│  Port 3000   │          │              │
└──────────────┘          └──────────────┘          └──────────────┘
        │                         │                         │
        │                         │                         │
        └─────────────────────────┴─────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
            ┌──────────────┐          ┌──────────────┐
            │  @cyclists/  │          │  @cyclists/  │
            │    config    │          │      ui      │
            │              │          │              │
            │ • Types      │          │ • Button     │
            │ • Supabase   │          │ • Input      │
            └──────────────┘          │ • Avatar     │
                    │                 └──────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐        ┌──────────────┐
│   Supabase   │        │  PostgreSQL  │
│     Auth     │        │   Profiles   │
│              │        │   Database   │
│ • Register   │        │              │
│ • Login      │        │ • Profiles   │
│ • Recovery   │        │ • Metadata   │
└──────────────┘        └──────────────┘
```

## Data Flow

### Registration Flow

```
User Input (Web/Mobile)
        │
        ▼
┌──────────────────────┐
│  Register Component  │
│  • Email             │
│  • Password          │
│  • Profile Data      │
└──────────────────────┘
        │
        ▼ POST /api/auth/register
┌──────────────────────┐
│  Backend API Route   │
│  • Validate Input    │
│  • Check Required    │
└──────────────────────┘
        │
        ├──────────────────┐
        │                  │
        ▼                  ▼
┌──────────────┐   ┌──────────────┐
│   Supabase   │   │  PostgreSQL  │
│  Create User │   │ Create       │
│  Return ID   │──►│ Profile      │
└──────────────┘   └──────────────┘
        │
        ▼
  Success Response
        │
        ▼
  Redirect to Profile
```

### Authentication Flow

```
┌─────────┐
│  Login  │
│  Form   │
└─────────┘
     │
     ▼ POST /api/auth/login
┌─────────────┐
│  Backend    │
│  Validate   │
└─────────────┘
     │
     ▼
┌─────────────┐
│  Supabase   │
│  Auth Check │
└─────────────┘
     │
     ├─── Success ──►┌──────────┐
     │               │ Session  │
     │               │ Token    │
     │               └──────────┘
     │
     └─── Failure ──►┌──────────┐
                     │ Error    │
                     │ Response │
                     └──────────┘
```

## Component Architecture

### Backend (apps/backend)

```
apps/backend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── register/
│   │   │   │   │   └── route.ts ─────► POST: Create user + profile
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts ─────► POST: Authenticate user
│   │   │   │   └── recover/
│   │   │   │       └── route.ts ─────► POST: Send recovery email
│   │   │   └── profile/
│   │   │       └── route.ts ─────────► GET/PATCH: Profile CRUD
│   │   └── page.tsx ─────────────────► API documentation page
│   └── lib/
│       └── db.ts ────────────────────► PostgreSQL client + schema
└── package.json
```

### Web (apps/web)

```
apps/web/
├── src/
│   └── app/
│       ├── page.tsx ──────────────► Landing page
│       ├── login/
│       │   └── page.tsx ──────────► Login form
│       ├── register/
│       │   └── page.tsx ──────────► Registration form
│       └── profile/
│           └── page.tsx ──────────► Profile display
├── public/
│   ├── manifest.json ─────────────► PWA manifest
│   └── sw.js ─────────────────────► Service worker
└── package.json
```

### Mobile (apps/mobile)

```
apps/mobile/
├── app/
│   ├── _layout.tsx ───────────────► Root navigation
│   ├── index.tsx ─────────────────► Home screen
│   ├── login.tsx ─────────────────► Login screen
│   ├── register.tsx ──────────────► Register screen
│   └── profile.tsx ───────────────► Profile screen
└── package.json
```

### Shared Packages

```
packages/
├── config/
│   └── src/
│       ├── types.ts ──────────────► TypeScript interfaces
│       ├── supabase.ts ───────────► Supabase client factory
│       └── index.ts
└── ui/
    └── src/
        ├── components/
        │   ├── Button.tsx ────────► Reusable button
        │   ├── Input.tsx ─────────► Reusable input
        │   └── Avatar.tsx ────────► User avatar
        └── index.ts
```

## Technology Stack

### Frontend

- **Framework**: Next.js 14 (Web), Expo SDK 50 (Mobile)
- **Language**: TypeScript (Strict mode)
- **Styling**: CSS Modules (Web), StyleSheet (Mobile)
- **Routing**: App Router (Web), expo-router (Mobile)
- **PWA**: next-pwa with service worker

### Backend

- **Framework**: Next.js 14 API Routes
- **Language**: TypeScript (Strict mode)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **ORM**: Native pg client (parameterized queries)

### Shared

- **Monorepo**: Turborepo
- **Package Manager**: npm workspaces
- **Build Tool**: Turborepo + tsc
- **Code Quality**: Prettier, ESLint

## Database Schema

```sql
┌─────────────────────────────────────────┐
│              profiles                    │
├─────────────────────────────────────────┤
│ id            UUID        PK             │
│ user_id       UUID        UNIQUE FK      │───► Links to Supabase
│ level         VARCHAR(20) NOT NULL       │
│ bike_type     VARCHAR(20) NOT NULL       │
│ city          VARCHAR(255) NOT NULL      │
│ latitude      DECIMAL(10,8)              │
│ longitude     DECIMAL(11,8)              │
│ date_of_birth DATE                       │
│ avatar        TEXT                       │
│ bio           TEXT                       │
│ created_at    TIMESTAMP   DEFAULT NOW()  │
│ updated_at    TIMESTAMP   DEFAULT NOW()  │
└─────────────────────────────────────────┘
         │
         │ Indexes:
         ├─ idx_profiles_user_id
         ├─ idx_profiles_city
         ├─ idx_profiles_level
         └─ idx_profiles_bike_type
```

## API Contracts

### POST /api/auth/register

```typescript
Request:
{
  email: string;
  password: string;
  profile: {
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    bikeType: 'road' | 'mountain' | 'hybrid' | 'electric' | 'gravel' | 'other';
    city: string;
    latitude?: number;
    longitude?: number;
    dateOfBirth?: Date;
    avatar?: string;
    bio?: string;
  }
}

Response:
{
  success: boolean;
  data?: {
    user: SupabaseUser;
    profile: Profile;
  };
  error?: string;
}
```

### POST /api/auth/login

```typescript
Request:
{
  email: string;
  password: string;
}

Response:
{
  success: boolean;
  data?: {
    user: SupabaseUser;
    session: Session;
  };
  error?: string;
}
```

### GET /api/profile?userId={id}

```typescript
Response:
{
  success: boolean;
  data?: Profile;
  error?: string;
}
```

### PATCH /api/profile?userId={id}

```typescript
Request:
{
  level?: string;
  bikeType?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  dateOfBirth?: Date;
  avatar?: string;
  bio?: string;
}

Response:
{
  success: boolean;
  data?: Profile;
  error?: string;
}
```

## Security Architecture

### Authentication

```
Client ──► Backend ──► Supabase Auth ──► JWT Token ──► Client
                │                              │
                └──────────────────────────────┘
                     Validated on each request
```

### Environment Variables

```
Development:
- .env files (gitignored)
- Local values

Production:
- Environment secrets
- CI/CD variables
- Encrypted storage
```

### Data Validation

```
User Input ──► Frontend Validation ──► API Validation ──► Database
              (Type checking)        (Server-side)      (Constraints)
```

## Build Pipeline

```
┌─────────────────────────────────────────────────────────┐
│                    Turborepo                             │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ packages/    │  │ packages/    │  │ apps/*       │  │
│  │ config:build │→ │ ui:build     │→ │ build        │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                  │                  │         │
│         └──────────────────┴──────────────────┘         │
│                    Cached in .turbo/                    │
└─────────────────────────────────────────────────────────┘
```

## Deployment Architecture

### Recommended Setup

```
┌─────────────┐
│   Vercel    │
│             │
│  • Backend  │──────┐
│  • Web      │      │
└─────────────┘      │
                     ▼
                ┌─────────────┐
                │  Supabase   │
                │             │
                │  • Auth     │
                │  • Storage  │
                └─────────────┘
                     │
                     ▼
                ┌─────────────┐
                │ PostgreSQL  │
                │  Database   │
                └─────────────┘

┌─────────────┐
│  EAS Build  │
│             │
│  • iOS      │
│  • Android  │
└─────────────┘
```

## Performance Considerations

### Caching Strategy

- Turborepo: Build output caching
- Next.js: Automatic page caching
- PWA: Service worker caching
- Database: Query result caching (recommended)

### Optimization Points

- Database indexes on common queries
- API response pagination (future)
- Image optimization (Next.js Image)
- Code splitting (automatic)
- Tree shaking (Turborepo)

## Scalability

### Horizontal Scaling

```
Load Balancer
     │
     ├──► Backend Instance 1
     ├──► Backend Instance 2
     └──► Backend Instance N
            │
            ▼
      Database Pool
```

### Vertical Scaling

- Increase database resources
- Optimize queries with indexes
- Add Redis for caching
- Use CDN for static assets

## Monitoring Points

### Application

- API response times
- Error rates
- Authentication success/failure
- Database query performance

### Infrastructure

- Server CPU/Memory
- Database connections
- Disk I/O
- Network latency

### Business Metrics

- User registrations
- Active users
- Profile completeness
- Feature usage

---

**Last Updated**: 2025-11-10
