/**
 * Current User Profile API Route
 * 
 * GET /api/profiles/me - Get current user's cyclist profile
 * PUT /api/profiles/me - Update current user's cyclist profile
 * 
 * Requires authentication
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@cycling-network/config/supabase';
import type { CyclistProfile, ApiResponse, UpdateCyclistProfileRequest } from '@cycling-network/config/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<CyclistProfile>>
) {
  // Get auth token
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  const supabase = createServerClient();
  
  // Verify user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }

  // Handle GET - Fetch current user's profile
  if (req.method === 'GET') {
    try {
      const { data: profile, error } = await supabase
        .from('cyclist_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If profile doesn't exist, return 404
        if (error.code === 'PGRST116') {
          return res.status(404).json({ 
            error: 'Profile not found',
            message: 'Cyclist profile has not been created yet' 
          });
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
      console.error('Error in GET /api/profiles/me:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Handle PUT - Update current user's profile
  if (req.method === 'PUT') {
    try {
      const updates: UpdateCyclistProfileRequest = req.body;

      // Convert camelCase to snake_case for database
      const dbUpdates: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.sex !== undefined) dbUpdates.sex = updates.sex;
      if (updates.level !== undefined) dbUpdates.level = updates.level;
      if (updates.birthDate !== undefined) dbUpdates.birth_date = updates.birthDate;
      if (updates.photoUrl !== undefined) dbUpdates.photo_url = updates.photoUrl;
      if (updates.city !== undefined) dbUpdates.city = updates.city;
      if (updates.latitude !== undefined) dbUpdates.latitude = updates.latitude;
      if (updates.longitude !== undefined) dbUpdates.longitude = updates.longitude;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.bikeType !== undefined) dbUpdates.bike_type = updates.bikeType;

      const { data: profile, error } = await supabase
        .from('cyclist_profiles')
        .update(dbUpdates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return res.status(500).json({ error: 'Failed to update profile' });
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

      return res.status(200).json({ 
        data: camelCaseProfile,
        message: 'Profile updated successfully' 
      });
    } catch (error) {
      console.error('Error in PUT /api/profiles/me:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}
