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
    const level = searchParams.get('level') || '';
    const bikeType = searchParams.get('bikeType') || '';
    const city = searchParams.get('city') || '';

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

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sqlQuery = `
      SELECT * FROM profiles 
      ${whereClause}
      ORDER BY created_at DESC
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
