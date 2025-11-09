/**
 * Authentication Utilities - Mobile Client
 * 
 * Handles JWT token storage and authentication state
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  id: string;
  email: string;
  token: string;
}

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@auth_user';

/**
 * Store authentication data in AsyncStorage
 */
export async function setAuth(user: AuthUser): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, user.token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify({
      id: user.id,
      email: user.email,
    }));
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
}

/**
 * Get current authentication token
 */
export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
}

/**
 * Get current user
 */
export async function getUser(): Promise<{ id: string; email: string } | null> {
  try {
    const userStr = await AsyncStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

/**
 * Clear authentication data
 */
export async function clearAuth(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error clearing auth:', error);
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<AuthUser> {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
  
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
  
  await setAuth(authUser);
  return authUser;
}

/**
 * Register a new user
 */
export async function register(email: string, password: string): Promise<AuthUser> {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
  
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
  
  await setAuth(authUser);
  return authUser;
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  await clearAuth();
}
