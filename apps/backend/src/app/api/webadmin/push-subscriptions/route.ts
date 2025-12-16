import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET /api/webadmin/push-subscriptions
 * Get detailed push subscriptions for a user (including timestamps)
 */
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

    const result = await query(
      'SELECT endpoint, created_at, updated_at FROM push_subscriptions WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    const subscriptions = result.rows.map((row) => ({
      endpoint: row.endpoint,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: subscriptions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WebAdmin] Get push subscriptions error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch push subscriptions',
      },
      { status: 500 }
    );
  }
}
