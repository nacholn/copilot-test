import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@cyclists/config';
import { query } from '@/lib/db';
import { transformProfile } from '@/lib/utils';
import type { RegisterInput, ApiResponse } from '@cyclists/config';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterInput = await request.json();
    const { email, password, profile } = body;

    // Validate required fields
    if (!email || !password || !profile.email || !profile.name || !profile.level || !profile.bikeType || !profile.city) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Missing required fields: email, password, name, level, bikeType, city',
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
      INSERT INTO profiles (user_id, email, name, level, bike_type, city, latitude, longitude, date_of_birth, avatar, bio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      authData.user.id,
      profile.email,
      profile.name,
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

    const transformedProfile = transformProfile(result.rows[0]);

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
