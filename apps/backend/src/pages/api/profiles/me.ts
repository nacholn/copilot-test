/**
 * Current User Profile API Route
 * 
 * GET /api/profiles/me - Get current user's cyclist profile
 * PUT /api/profiles/me - Update current user's cyclist profile
 * 
 * Requires authentication
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
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

  // Verify token and get user
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }

  const userId = payload.userId;

  // Handle GET - Fetch current user's profile
  if (req.method === 'GET') {
    try {
      const result = await query(
        'SELECT * FROM cyclist_profiles WHERE user_id = $1',
        [userId]
      );

      const profile = result.rows[0];

      if (!profile) {
        return res.status(404).json({ 
          error: 'Profile not found',
          message: 'Cyclist profile has not been created yet' 
        });
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

      // Build SET clause dynamically
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.sex !== undefined) {
        setClauses.push(`sex = $${paramIndex++}`);
        values.push(updates.sex);
      }
      if (updates.level !== undefined) {
        setClauses.push(`level = $${paramIndex++}`);
        values.push(updates.level);
      }
      if (updates.birthDate !== undefined) {
        setClauses.push(`birth_date = $${paramIndex++}`);
        values.push(updates.birthDate);
      }
      if (updates.photoUrl !== undefined) {
        setClauses.push(`photo_url = $${paramIndex++}`);
        values.push(updates.photoUrl);
      }
      if (updates.city !== undefined) {
        setClauses.push(`city = $${paramIndex++}`);
        values.push(updates.city);
      }
      if (updates.latitude !== undefined) {
        setClauses.push(`latitude = $${paramIndex++}`);
        values.push(updates.latitude);
      }
      if (updates.longitude !== undefined) {
        setClauses.push(`longitude = $${paramIndex++}`);
        values.push(updates.longitude);
      }
      if (updates.description !== undefined) {
        setClauses.push(`description = $${paramIndex++}`);
        values.push(updates.description);
      }
      if (updates.bikeType !== undefined) {
        setClauses.push(`bike_type = $${paramIndex++}`);
        values.push(updates.bikeType);
      }

      if (setClauses.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      // Add userId to values
      values.push(userId);

      const result = await query(
        `UPDATE cyclist_profiles 
         SET ${setClauses.join(', ')} 
         WHERE user_id = $${paramIndex}
         RETURNING *`,
        values
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
