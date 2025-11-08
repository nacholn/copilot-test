/**
 * Authentication Utilities
 * 
 * Handles JWT token generation, verification, and password hashing
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
}

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query(
    'SELECT id, email, created_at FROM users WHERE email = $1',
    [email]
  );

  return result.rows[0] as User || null;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const result = await query(
    'SELECT id, email, created_at FROM users WHERE id = $1',
    [userId]
  );

  return result.rows[0] as User || null;
}

/**
 * Create a new user
 */
export async function createUser(
  email: string,
  password: string
): Promise<User> {
  const passwordHash = await hashPassword(password);

  const result = await query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
    [email, passwordHash]
  );

  return result.rows[0] as User;
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: User; token: string } | null> {
  const result = await query(
    'SELECT id, email, created_at, password_hash FROM users WHERE email = $1',
    [email]
  );

  const user = result.rows[0] as (User & { password_hash: string }) | undefined;
  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return null;
  }

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
    token,
  };
}
