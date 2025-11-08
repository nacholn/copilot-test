/**
 * Cyclist Profiles List API Route
 * 
 * GET /api/profiles - Get all cyclist profiles (public)
 * 
 * Query parameters:
 * - limit: Number of results (default: 50, max: 100)
 * - offset: Pagination offset (default: 0)
 * - city: Filter by city
 * - level: Filter by cyclist level
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@cycling-network/config/supabase';
import type { CyclistProfile, ApiResponse } from '@cycling-network/config/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<CyclistProfile[]>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = createServerClient();

    // Parse query parameters
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const city = req.query.city as string;
    const level = req.query.level as string;

    // Build query
    let query = supabase
      .from('cyclist_profiles')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (level) {
      query = query.eq('level', level);
    }

    const { data: profiles, error } = await query;

    if (error) {
      console.error('Error fetching profiles:', error);
      return res.status(500).json({ error: 'Failed to fetch profiles' });
    }

    // Convert snake_case to camelCase
    const camelCaseProfiles: CyclistProfile[] = profiles.map((profile: any) => ({
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
    }));

    return res.status(200).json({ 
      data: camelCaseProfiles,
      message: `Found ${camelCaseProfiles.length} profiles`
    });
  } catch (error) {
    console.error('Error in GET /api/profiles:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
