export * from './types';
export * from './supabase';
export * from './utils/i18n';

/**
 * Client-friendly API URL helper.
 * Uses NEXT_PUBLIC_API_URL when available, falls back to localhost for dev.
 */
export const API_URL: string =
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:3001';

export function getApiUrl(): string {
  return API_URL;
}
