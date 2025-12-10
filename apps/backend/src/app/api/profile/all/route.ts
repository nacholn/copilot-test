import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { transformProfile } from '@/lib/utils';
import type { ApiResponse, Profile } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET all profiles
export async function GET() {
  try {
    const result = await query('SELECT * FROM profiles ORDER BY name ASC');

    const profiles: Profile[] = result.rows.map((row) => transformProfile(row));

    return NextResponse.json<ApiResponse<Profile[]>>(
      {
        success: true,
        data: profiles,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get all profiles error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
