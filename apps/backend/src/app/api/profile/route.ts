import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { UpdateProfileInput, CreateProfileInput, ApiResponse } from '@cyclists/config';

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

    // Transform snake_case to camelCase for frontend
    const profile = result.rows[0];
    const transformedProfile = {
      id: profile.id,
      userId: profile.user_id,
      level: profile.level,
      bikeType: profile.bike_type,
      city: profile.city,
      latitude: profile.latitude,
      longitude: profile.longitude,
      dateOfBirth: profile.date_of_birth,
      avatar: profile.avatar,
      bio: profile.bio,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };

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
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    // Dynamically build update query
    Object.entries(body).forEach(([key, value]) => {
      if (value !== undefined) {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${snakeKey} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
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

    // Transform snake_case to camelCase for frontend
    const profile = result.rows[0];
    const transformedProfile = {
      id: profile.id,
      userId: profile.user_id,
      level: profile.level,
      bikeType: profile.bike_type,
      city: profile.city,
      latitude: profile.latitude,
      longitude: profile.longitude,
      dateOfBirth: profile.date_of_birth,
      avatar: profile.avatar,
      bio: profile.bio,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };

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
    if (!body.userId || !body.level || !body.bikeType || !body.city) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Missing required fields: userId, level, bikeType, city',
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
      INSERT INTO profiles (user_id, level, bike_type, city, latitude, longitude, date_of_birth, avatar, bio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      body.userId,
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

    // Transform snake_case to camelCase for frontend
    const profile = result.rows[0];
    const transformedProfile = {
      id: profile.id,
      userId: profile.user_id,
      level: profile.level,
      bikeType: profile.bike_type,
      city: profile.city,
      latitude: profile.latitude,
      longitude: profile.longitude,
      dateOfBirth: profile.date_of_birth,
      avatar: profile.avatar,
      bio: profile.bio,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };

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
