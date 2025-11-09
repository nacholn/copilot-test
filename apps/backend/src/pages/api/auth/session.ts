/**
 * Session API Route
 * 
 * Returns the current authenticated user session
 * GET /api/auth/session
 * 
 * This is a demo endpoint showing how to verify authentication
 * with Supabase on the backend.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@cycling-network/config/supabase';

type SessionResponse = {
  user?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SessionResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createServerClient();
    
    // Get session from authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
}
