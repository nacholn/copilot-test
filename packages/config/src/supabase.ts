/**
 * Supabase Client Configuration
 * 
 * This module provides factory functions to create Supabase clients
 * for different environments (client-side, server-side).
 * 
 * Usage:
 * - Use createBrowserClient() in client-side code (React, React Native)
 * - Use createServerClient() in API routes or server-side rendering
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client for browser/client-side usage
 * Uses the public anon key which is safe to expose
 */
export function createBrowserClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Creates a Supabase client for server-side usage
 * Can optionally use service role key for admin operations
 */
export function createServerClient(useServiceRole = false): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = useServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Supabase configuration constants
 */
export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
};
