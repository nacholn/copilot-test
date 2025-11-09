/**
 * Authentication Utilities - Web Client
 * 
 * Handles JWT token storage and authentication state
 */

export interface AuthUser {
  id: string;
  email: string;
  token: string;
}

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

/**
 * Store authentication data in localStorage
 */
export function setAuth(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(TOKEN_KEY, user.token);
  localStorage.setItem(USER_KEY, JSON.stringify({
    id: user.id,
    email: user.email,
  }));
}

/**
 * Get current authentication token
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get current user
 */
export function getUser(): { id: string; email: string } | null {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Clear authentication data
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<AuthUser> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  const response = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  const data = await response.json();
  
  const authUser: AuthUser = {
    id: data.data.user.id,
    email: data.data.user.email,
    token: data.data.token,
  };
  
  setAuth(authUser);
  return authUser;
}

/**
 * Register a new user
 */
export async function register(email: string, password: string): Promise<AuthUser> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  const response = await fetch(`${apiUrl}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  const data = await response.json();
  
  const authUser: AuthUser = {
    id: data.data.user.id,
    email: data.data.user.email,
    token: data.data.token,
  };
  
  setAuth(authUser);
  return authUser;
}

/**
 * Logout
 */
export function logout(): void {
  clearAuth();
}
