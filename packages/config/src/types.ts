/**
 * Shared types for Cycling Network Platform
 * 
 * This file contains common type definitions used across all applications
 * in the monorepo for consistent type safety.
 */

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface Route {
  id: string;
  name: string;
  distance: number;
  elevation: number;
  userId: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
