/**
 * Register API Route
 * 
 * POST /api/auth/register - Create new user account
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createUser, generateToken, getUserByEmail } from '@/lib/auth';
import type { ApiResponse } from '@cycling-network/config/types';

interface RegisterRequest {
  email: string;
  password: string;
}

interface RegisterResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<RegisterResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password }: RegisterRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create user
    const user = await createUser(email, password);
    const token = generateToken(user);

    return res.status(201).json({
      data: {
        user: {
          id: user.id,
          email: user.email,
        },
        token,
      },
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Error in POST /api/auth/register:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
