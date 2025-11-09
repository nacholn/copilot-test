# Authentication Fix - JWT Token Integration

## Issue
Users were getting "invalid token" errors when trying to save their cyclist profile because the web and mobile apps were still using Supabase authentication while the backend had been switched to custom JWT authentication.

## Root Cause
After migrating from Supabase to Docker PostgreSQL with custom JWT authentication, the frontend applications (web and mobile) were still attempting to use Supabase client tokens, which were incompatible with the backend's JWT verification system.

## Solution
Replaced Supabase authentication in both web and mobile apps with custom JWT authentication that matches the backend implementation.

### Changes Made

#### 1. Web App (`apps/web`)
- **Created** `src/lib/auth.ts` - New authentication utilities for JWT token management
  - `login(email, password)` - Authenticate and store JWT token
  - `register(email, password)` - Register new user and store JWT token
  - `logout()` - Clear authentication data
  - `getToken()` - Retrieve current JWT token from localStorage
  - `getUser()` - Get current user info
  - `isAuthenticated()` - Check authentication status

- **Updated** `src/components/AuthDemo.tsx`
  - Removed Supabase client dependency
  - Now uses local JWT authentication utilities
  - Stores tokens in localStorage

- **Updated** `src/pages/profile.tsx`
  - Removed Supabase client dependency
  - Uses JWT token from localStorage for API requests
  - Proper token attachment in Authorization header

#### 2. Mobile App (`apps/mobile`)
- **Created** `lib/auth.ts` - New authentication utilities for JWT token management
  - Same API as web version but uses AsyncStorage instead of localStorage
  - Async/await for all storage operations

- **Updated** `components/AuthDemo.tsx`
  - Removed Supabase client dependency
  - Now uses JWT authentication utilities
  - Stores tokens in AsyncStorage

- **Updated** `app/profile.tsx`
  - Removed Supabase client dependency
  - Uses JWT token from AsyncStorage for API requests
  - Proper async token retrieval

- **Updated** `app/index.tsx`
  - Changed "Supabase authentication" to "JWT authentication" in feature description

## How It Works Now

### Login Flow
1. User enters email and password
2. Frontend calls `POST /api/auth/login` with credentials
3. Backend validates credentials and returns JWT token
4. Frontend stores token in localStorage (web) or AsyncStorage (mobile)
5. Token is used for all subsequent authenticated API requests

### Profile Update Flow
1. User modifies profile fields and clicks "Save"
2. Frontend retrieves JWT token from storage
3. Frontend calls `PUT /api/profiles/me` with token in `Authorization: Bearer {token}` header
4. Backend verifies JWT token using `verifyToken()` function
5. Backend updates profile and returns updated data
6. Frontend displays success message

## Testing

### Test Credentials
- Email: `test@cycling.local`
- Password: `password123`

### Verification Steps
1. **Start Docker database**:
   ```bash
   docker-compose up -d
   ```

2. **Start backend**:
   ```bash
   cd apps/backend && npm run dev
   ```

3. **Test login API**:
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@cycling.local","password":"password123"}'
   ```

4. **Test profile update** (use token from login response):
   ```bash
   curl -X PUT http://localhost:3001/api/profiles/me \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -d '{"city":"Barcelona","level":"advanced"}'
   ```

5. **Test web app**:
   ```bash
   cd apps/web && npm run dev
   # Visit http://localhost:3000
   # Login with test credentials
   # Navigate to profile page
   # Update profile fields
   ```

6. **Test mobile app**:
   ```bash
   cd apps/mobile && npm start
   # Scan QR code with Expo Go
   # Login with test credentials
   # Navigate to profile screen
   # Update profile fields
   ```

## Benefits
- ✅ Consistent authentication across all platforms
- ✅ No external dependencies (Supabase) required
- ✅ Full control over token generation and validation
- ✅ Works offline-first (tokens stored locally)
- ✅ Simple token refresh mechanism can be added later

## Future Improvements
- Add token refresh mechanism (before expiration)
- Add token blacklist for logout security
- Add remember me functionality
- Add biometric authentication support (mobile)
- Add password reset flow
