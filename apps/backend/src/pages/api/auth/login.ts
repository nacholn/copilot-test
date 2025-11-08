/**
 * Login API Route
 * 
 * POST /api/auth/login - Authenticate user and return JWT token
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser } from '@/lib/auth';
import type { ApiResponse } from '@cycling-network/config/types';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
  };
  token: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<LoginResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await authenticateUser(email, password);

    if (!result) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(200).json({
      data: result,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Error in POST /api/auth/login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
