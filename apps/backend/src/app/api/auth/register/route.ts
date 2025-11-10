import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@cyclists/config';
import { query } from '@/lib/db';
import type { RegisterInput, ApiResponse } from '@cyclists/config';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterInput = await request.json();
    const { email, password, profile } = body;

    // Validate required fields
    if (!email || !password || !profile.level || !profile.bikeType || !profile.city) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Create user in Supabase
    const supabase = createSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: authError?.message || 'Failed to create user',
        },
        { status: 400 }
      );
    }

    // Create profile in PostgreSQL
    const insertQuery = `
      INSERT INTO profiles (user_id, level, bike_type, city, latitude, longitude, date_of_birth, avatar, bio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      authData.user.id,
      profile.level,
      profile.bikeType,
      profile.city,
      profile.latitude || null,
      profile.longitude || null,
      profile.dateOfBirth || null,
      profile.avatar || null,
      profile.bio || null,
    ];
    const result = await query(insertQuery, values);

    // Transform snake_case to camelCase for frontend
    const profileData = result.rows[0];
    const transformedProfile = {
      id: profileData.id,
      userId: profileData.user_id,
      level: profileData.level,
      bikeType: profileData.bike_type,
      city: profileData.city,
      latitude: profileData.latitude,
      longitude: profileData.longitude,
      dateOfBirth: profileData.date_of_birth,
      avatar: profileData.avatar,
      bio: profileData.bio,
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
    };

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          user: authData.user,
          profile: transformedProfile,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
