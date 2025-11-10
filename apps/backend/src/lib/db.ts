import { Pool, QueryResult } from 'pg';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

export async function query(text: string, params?: any[]): Promise<QueryResult> {
  const pool = getDbPool();
  return pool.query(text, params);
}

// Initialize database schema
export async function initializeDatabase(): Promise<void> {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE,
      level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced', 'expert')),
      bike_type VARCHAR(20) NOT NULL CHECK (bike_type IN ('road', 'mountain', 'hybrid', 'electric', 'gravel', 'other')),
      city VARCHAR(255) NOT NULL,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      date_of_birth DATE,
      avatar TEXT,
      bio TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
  `;

  try {
    await query(createTableQuery);
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
