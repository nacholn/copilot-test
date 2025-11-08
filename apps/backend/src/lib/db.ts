/**
 * Database Connection Module
 * 
 * Provides PostgreSQL database connection and query utilities
 */

import { Pool, QueryResult } from 'pg';

// Create a connection pool
let pool: Pool | null = null;

/**
 * Get or create database connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'cycling_network',
      user: process.env.DB_USER || 'cycling_user',
      password: process.env.DB_PASSWORD || 'cycling_password',
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

/**
 * Execute a query
 */
export async function query(
  text: string,
  params?: any[]
): Promise<QueryResult> {
  const pool = getPool();
  return pool.query(text, params);
}

/**
 * Close the database pool (useful for testing or shutdown)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW()');
    return !!result.rows[0];
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}
