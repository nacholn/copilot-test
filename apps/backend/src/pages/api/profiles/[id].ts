/**
 * Individual Cyclist Profile API Route
 * 
 * GET /api/profiles/[id] - Get a specific cyclist profile by user ID
 * 
 * Public endpoint - anyone can view cyclist profiles
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { corsMiddleware } from '@/middleware/cors';
import type { CyclistProfile, ApiResponse } from '@cycling-network/config/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<CyclistProfile>>
) {
  // Apply CORS headers
  if (corsMiddleware(req, res)) {
    return; // Preflight request handled
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const result = await query(
      'SELECT * FROM cyclist_profiles WHERE user_id = $1',
      [id]
    );

    const profile = result.rows[0];

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Convert snake_case to camelCase
    const camelCaseProfile: CyclistProfile = {
      id: profile.id,
      userId: profile.user_id,
      email: profile.email,
      sex: profile.sex,
      level: profile.level,
      birthDate: profile.birth_date,
      photoUrl: profile.photo_url,
      city: profile.city,
      latitude: profile.latitude,
      longitude: profile.longitude,
      description: profile.description,
      bikeType: profile.bike_type,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };

    return res.status(200).json({ data: camelCaseProfile });
  } catch (error) {
    console.error('Error in GET /api/profiles/[id]:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
