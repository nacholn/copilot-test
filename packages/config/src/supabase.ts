/**
 * Supabase Client Configuration
 * 
 * This module provides factory functions to create Supabase clients
 * for different environments (client-side, server-side).
 * 
 * Features:
 * - Authentication (email/password + OAuth providers)
 * - PostgreSQL database access
 * - Automatic session management
 * - Row Level Security (RLS)
 * 
 * Usage:
 * - Use createBrowserClient() in client-side code (React, React Native)
 * - Use createServerClient() in API routes or server-side operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Creates a Supabase client for browser/client-side usage
 * Uses the public anon key which is safe to expose
 * 
 * Features:
 * - Persistent sessions (localStorage/AsyncStorage)
 * - Automatic token refresh
 * - OAuth redirect detection
 */
export function createBrowserClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // More secure for OAuth
    },
  });
}

/**
 * Creates a Supabase client for server-side usage
 * Can optionally use service role key for admin operations
 * 
 * @param useServiceRole - If true, uses service role key (bypasses RLS)
 */
export function createServerClient(useServiceRole = false): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = useServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env file'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Supabase configuration constants
 */
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};
