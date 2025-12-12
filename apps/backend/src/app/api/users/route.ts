import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { transformProfile } from '@/lib/utils';
import type { ApiResponse, UserSearchParams } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET all users with optional search filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('query') || '';
    const nameQuery = searchParams.get('name') || '';
    const level = searchParams.get('level') || '';
    const bikeType = searchParams.get('bikeType') || '';
    const city = searchParams.get('city') || '';
    const distance = searchParams.get('distance');
    const userLatitude = searchParams.get('userLatitude');
    const userLongitude = searchParams.get('userLongitude');

    // Build dynamic query
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    // Search in name, email, city, or bio
    if (searchQuery) {
      conditions.push(`(
        name ILIKE $${paramCount} OR 
        email ILIKE $${paramCount} OR 
        city ILIKE $${paramCount} OR 
        bio ILIKE $${paramCount}
      )`);
      values.push(`%${searchQuery}%`);
      paramCount++;
    }

    // Search by name specifically
    if (nameQuery) {
      conditions.push(`name ILIKE $${paramCount}`);
      values.push(`%${nameQuery}%`);
      paramCount++;
    }

    if (level) {
      conditions.push(`level = $${paramCount}`);
      values.push(level);
      paramCount++;
    }

    if (bikeType) {
      conditions.push(`bike_type = $${paramCount}`);
      values.push(bikeType);
      paramCount++;
    }

    if (city) {
      conditions.push(`city ILIKE $${paramCount}`);
      values.push(`%${city}%`);
      paramCount++;
    }

    // Distance filter using Haversine formula
    // Only applies if distance is provided and user location is available
    if (distance && userLatitude && userLongitude) {
      const distanceNum = parseFloat(distance);
      const userLat = parseFloat(userLatitude);
      const userLng = parseFloat(userLongitude);
      
      if (!isNaN(distanceNum) && !isNaN(userLat) && !isNaN(userLng) && distanceNum > 0) {
        // Haversine formula for calculating distance
        // Add condition to filter profiles within distance
        conditions.push(`
          latitude IS NOT NULL AND longitude IS NOT NULL AND
          (
            6371 * acos(
              cos(radians($${paramCount})) * 
              cos(radians(latitude)) * 
              cos(radians(longitude) - radians($${paramCount + 1})) + 
              sin(radians($${paramCount})) * 
              sin(radians(latitude))
            )
          ) <= $${paramCount + 2}
        `);
        values.push(userLat, userLng, distanceNum);
        paramCount += 3;
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    // Order by interaction score (highest first), then by created_at
    const sqlQuery = `
      SELECT * FROM profiles 
      ${whereClause}
      ORDER BY interaction_score DESC, created_at DESC
    `;

    const result = await query(sqlQuery, values);
    const profiles = result.rows.map(transformProfile);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: profiles,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
