/**
 * Individual Cyclist Profile API Route
 * 
 * GET /api/profiles/[id] - Get a specific cyclist profile by user ID
 * 
 * Public endpoint - anyone can view cyclist profiles
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@cycling-network/config/supabase';
import type { CyclistProfile, ApiResponse } from '@cycling-network/config/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<CyclistProfile>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const supabase = createServerClient();

    const { data: profile, error } = await supabase
      .from('cyclist_profiles')
      .select('*')
      .eq('user_id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Profile not found' });
      }
      console.error('Error fetching profile:', error);
      return res.status(500).json({ error: 'Failed to fetch profile' });
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
