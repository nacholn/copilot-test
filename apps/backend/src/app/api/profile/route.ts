import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { transformProfile, toSnakeCase } from '@/lib/utils';
import type { UpdateProfileInput, CreateProfileInput, ApiResponse } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET profile by user ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }
    const result = await query('SELECT * FROM profiles WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Profile not found',
        },
        { status: 404 }
      );
    }

    const transformedProfile = transformProfile(result.rows[0]);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: transformedProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// PATCH update profile
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    const body: UpdateProfileInput = await request.json();
    const snakeCaseBody = toSnakeCase(body);

    const updateFields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    // Dynamically build update query
    Object.entries(snakeCaseBody).forEach(([key, value]) => {
      updateFields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    if (updateFields.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'No fields to update',
        },
        { status: 400 }
      );
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const updateQuery = `
      UPDATE profiles
      SET ${updateFields.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING *
    `;
    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Profile not found',
        },
        { status: 404 }
      );
    }

    const transformedProfile = transformProfile(result.rows[0]);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: transformedProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST create new profile
export async function POST(request: NextRequest) {
  try {
    const body: CreateProfileInput = await request.json();

    // Validate required fields
    if (!body.userId || !body.email || !body.name || !body.level || !body.bikeType || !body.city) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Missing required fields: userId, email, name, level, bikeType, city',
        },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const existingProfile = await query('SELECT id FROM profiles WHERE user_id = $1', [
      body.userId,
    ]);
    if (existingProfile.rows.length > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Profile already exists for this user',
        },
        { status: 409 }
      );
    }

    const insertQuery = `
      INSERT INTO profiles (user_id, email, name, level, bike_type, city, latitude, longitude, date_of_birth, avatar, bio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      body.userId,
      body.email,
      body.name,
      body.level,
      body.bikeType,
      body.city,
      body.latitude || null,
      body.longitude || null,
      body.dateOfBirth || null,
      body.avatar || null,
      body.bio || null,
    ];
    const result = await query(insertQuery, values);

    const transformedProfile = transformProfile(result.rows[0]);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: transformedProfile,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create profile error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
