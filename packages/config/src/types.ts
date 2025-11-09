/**
 * Shared types for Cycling Network Platform
 * 
 * This file contains common type definitions used across all applications
 * in the monorepo for consistent type safety.
 */

import type { User as SupabaseUser } from '@supabase/supabase-js';

// Re-export Supabase User type for consistency
export type User = SupabaseUser;

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

/**
 * Cyclist Profile
 * Stores detailed information about each cyclist user
 */
export interface CyclistProfile {
  id: string;
  user_id: string; // Foreign key to auth.users
  email: string;
  sex?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  level?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  birth_date?: string; // ISO date string
  photo_url?: string; // URL to photo or generated avatar
  city?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  bike_type?: 'road' | 'mountain' | 'hybrid' | 'gravel' | 'electric' | 'other';
  created_at: string;
  updated_at: string;
}

/**
 * Request body for creating/updating cyclist profile
 */
export interface UpdateCyclistProfileRequest {
  sex?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  level?: 'beginner' | 'intermediate' | 'advanced' | 'professional';
  birth_date?: string;
  photo_url?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  bike_type?: 'road' | 'mountain' | 'hybrid' | 'gravel' | 'electric' | 'other';
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Supabase Database Type Definitions
 * Generated from database schema for type-safe queries
 */
export interface Database {
  public: {
    Tables: {
      cyclist_profiles: {
        Row: CyclistProfile;
        Insert: Omit<CyclistProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<CyclistProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
