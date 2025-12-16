import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET /api/webadmin/push-token-counts
 * Get push token counts for multiple users in a single request
 * Query param: userIds - comma-separated list of user IDs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdsParam = searchParams.get('userIds');

    if (!userIdsParam) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User IDs are required',
        },
        { status: 400 }
      );
    }

    const userIds = userIdsParam.split(',').filter(Boolean);

    if (userIds.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: {},
        },
        { status: 200 }
      );
    }

    // Query to count push subscriptions for each user
    const result = await query(
      `SELECT user_id, COUNT(*) as count 
       FROM push_subscriptions 
       WHERE user_id = ANY($1::uuid[])
       GROUP BY user_id`,
      [userIds]
    );

    // Create a map of userId -> count
    const counts: Record<string, number> = {};
    
    // Initialize all users with 0 count
    userIds.forEach((userId) => {
      counts[userId] = 0;
    });

    // Update with actual counts from database
    result.rows.forEach((row) => {
      counts[row.user_id] = parseInt(row.count, 10);
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: counts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WebAdmin] Get push token counts error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch push token counts',
      },
      { status: 500 }
    );
  }
}
