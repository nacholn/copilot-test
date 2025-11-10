import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { UpdateProfileInput, ApiResponse } from '@cyclists/config';

// GET profile by user ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User ID is required',
      }, { status: 400 });
    }

    const result = await query('SELECT * FROM profiles WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Profile not found',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows[0],
    }, { status: 200 });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}

// PATCH update profile
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User ID is required',
      }, { status: 400 });
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
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No fields to update',
      }, { status: 400 });
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
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Profile not found',
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.rows[0],
    }, { status: 200 });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
    }, { status: 500 });
  }
}
