import { Pool, QueryResult } from 'pg';

let pool: Pool | null = null;

// Determine SSL configuration:
// - Use DATABASE_SSL=true/false to explicitly control SSL
// - Falls back to enabling SSL only in production
function getSslConfig(): boolean | { rejectUnauthorized: boolean } {
  const sslEnv = process.env.DATABASE_SSL;

  // Explicit SSL configuration takes precedence
  if (sslEnv === 'true') {
    return { rejectUnauthorized: false };
  }
  if (sslEnv === 'false') {
    return false;
  }

  // Default: SSL in production only
  return process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false;
}

export function getDbPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: getSslConfig(),
    });
  }
  return pool;
}

export async function query(text: string, params?: unknown[]): Promise<QueryResult> {
  const pool = getDbPool();
  return pool.query(text, params);
}
