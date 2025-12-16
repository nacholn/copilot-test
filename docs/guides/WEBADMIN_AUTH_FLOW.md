# WebAdmin Authentication Flow

## Overview

This document describes the authentication flow implemented for the webadmin application.

## Components

### 1. Authentication Utilities (`src/lib/auth.ts`)

```typescript
interface Session {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user?: { id: string; email: string; }
}

// Check if user is authenticated
isAuthenticated(): boolean

// Get current session
getSession(): Session | null

// Clear session and logout
logout(): void
```

**Key Features:**

- Validates session exists in localStorage
- Checks token expiration
- Auto-clears expired sessions
- Server-side safe (returns false/null on server)

### 2. AuthProvider Component (`src/components/AuthProvider.tsx`)

Wraps the entire application to protect routes:

```typescript
<AuthProvider>
  <Navigation />
  {children}
</AuthProvider>
```

**Functionality:**

- Runs on every page navigation
- Checks authentication status
- Redirects to `/login` if not authenticated
- Excludes `/login` page from checks

### 3. Updated Navigation Component

**Added Features:**

- Logout button when user is authenticated
- Navigation hidden on login page
- Displays logout option in nav bar
- Calls `logout()` and redirects to `/login`

### 4. Updated Login Page

**Added Features:**

- Checks if already authenticated on mount
- Redirects to dashboard if logged in
- Prevents unnecessary login attempts

## Authentication Flow

### Login Flow

```
1. User visits any page
   ↓
2. AuthProvider checks isAuthenticated()
   ↓
3. If not authenticated → Redirect to /login
   ↓
4. User enters credentials
   ↓
5. POST /api/webadmin/auth/login
   ↓
6. API checks is_admin field
   ↓
7. If admin: Return session → Store in localStorage
   ↓
8. Redirect to dashboard (/)
```

### Protected Page Access

```
1. User navigates to any page
   ↓
2. AuthProvider runs useEffect on pathname change
   ↓
3. Checks isAuthenticated()
   ↓
4. If valid session exists:
   - Check token expiration
   - If not expired → Allow access
   - If expired → Clear session → Redirect to /login
   ↓
5. If no session → Redirect to /login
```

### Logout Flow

```
1. User clicks Logout button
   ↓
2. logout() function called
   ↓
3. localStorage.removeItem('webadmin_session')
   ↓
4. Router.push('/login')
   ↓
5. User redirected to login page
```

## Session Structure

The session is stored in localStorage as JSON:

```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_at": 1234567890,
  "user": {
    "id": "uuid-here",
    "email": "admin@example.com"
  }
}
```

## Security Considerations

### Current Implementation

- Session stored in localStorage
- Token expiration checked before each request
- Expired sessions automatically cleared
- Only admin users can authenticate

### Recommended Improvements for Production

1. **HttpOnly Cookies**: Move session to httpOnly cookies for better XSS protection
2. **CSRF Protection**: Implement CSRF tokens for state-changing requests
3. **Token Refresh**: Implement automatic token refresh before expiration
4. **Secure Flag**: Ensure cookies are sent only over HTTPS
5. **Rate Limiting**: Add rate limiting on login endpoint
6. **Session Timeout**: Implement idle timeout (clear session after inactivity)

## Testing Checklist

- [ ] Login with valid admin credentials
- [ ] Login with non-admin credentials (should fail)
- [ ] Login with invalid credentials (should fail)
- [ ] Access dashboard when authenticated
- [ ] Access dashboard when not authenticated (should redirect)
- [ ] Navigate between pages when authenticated
- [ ] Navigate between pages when not authenticated (should redirect)
- [ ] Click logout button
- [ ] Verify session cleared after logout
- [ ] Verify redirect to login after logout
- [ ] Try accessing protected page after logout (should redirect)
- [ ] Login again after logout
- [ ] Check token expiration (wait for expiration time)
- [ ] Verify navigation hidden on login page
- [ ] Verify logout button appears when authenticated

## Code Changes Summary

### New Files

1. `apps/webadmin/src/lib/auth.ts` - Authentication utilities
2. `apps/webadmin/src/components/AuthProvider.tsx` - Auth wrapper component

### Modified Files

1. `apps/webadmin/src/app/layout.tsx` - Added AuthProvider
2. `apps/webadmin/src/app/login/page.tsx` - Added auth check
3. `apps/webadmin/src/components/Navigation.tsx` - Added logout button

## Usage Example

### Checking Authentication in Components

```typescript
import { isAuthenticated, getSession } from '@/lib/auth';

function MyComponent() {
  const session = getSession();

  if (!isAuthenticated()) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {session?.user?.email}</div>;
}
```

### Manual Logout

```typescript
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

function MyComponent() {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

## Environment Variables

No additional environment variables required. The authentication uses:

- Existing `NEXT_PUBLIC_SUPABASE_URL`
- Existing `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Existing `SUPABASE_SERVICE_ROLE_KEY` (backend only)

## Future Enhancements

1. **Remember Me**: Add option to persist session longer
2. **Multi-Factor Auth**: Add 2FA for admin users
3. **Session Management**: Show active sessions, allow revocation
4. **Audit Logs**: Log all admin actions with user info
5. **Role-Based Access**: Extend beyond admin/user binary
6. **Password Reset**: Add forgot password flow
7. **Account Lockout**: Lock account after failed login attempts
8. **Activity Monitoring**: Track last login, login history
