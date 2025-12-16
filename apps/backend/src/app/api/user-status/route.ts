import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse, UserStatus, UserStatusType } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET user status
 * Query params:
 * - userId (required): User ID to get status for
 * - friendIds (optional): Comma-separated list of friend IDs to get status for multiple users
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const friendIdsParam = searchParams.get('friendIds');

    if (!userId && !friendIdsParam) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID or Friend IDs are required',
        },
        { status: 400 }
      );
    }

    if (friendIdsParam) {
      // Get status for multiple users
      const friendIds = friendIdsParam.split(',');
      const result = await query(`SELECT * FROM user_status WHERE user_id = ANY($1)`, [friendIds]);

      const statuses: UserStatus[] = result.rows.map((row) => ({
        userId: row.user_id,
        status: row.status as UserStatusType,
        lastSeen: new Date(row.last_seen),
        updatedAt: new Date(row.updated_at),
      }));

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: statuses,
        },
        { status: 200 }
      );
    } else {
      // Get status for single user
      const result = await query(`SELECT * FROM user_status WHERE user_id = $1`, [userId]);

      if (result.rows.length === 0) {
        // Return offline if no status record exists
        return NextResponse.json<ApiResponse>(
          {
            success: true,
            data: {
              userId,
              status: 'offline' as UserStatusType,
              lastSeen: new Date(),
              updatedAt: new Date(),
            },
          },
          { status: 200 }
        );
      }

      const row = result.rows[0];
      const status: UserStatus = {
        userId: row.user_id,
        status: row.status as UserStatusType,
        lastSeen: new Date(row.last_seen),
        updatedAt: new Date(row.updated_at),
      };

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: status,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('[API] Get user status error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST/PUT update user status
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, status } = body;

    if (!userId || !status) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID and status are required',
        },
        { status: 400 }
      );
    }

    if (!['online', 'offline', 'away'].includes(status)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid status. Must be online, offline, or away',
        },
        { status: 400 }
      );
    }

    // Upsert user status
    const result = await query(
      `INSERT INTO user_status (user_id, status, last_seen, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id)
       DO UPDATE SET 
         status = EXCLUDED.status,
         last_seen = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, status]
    );

    const userStatus: UserStatus = {
      userId: result.rows[0].user_id,
      status: result.rows[0].status as UserStatusType,
      lastSeen: new Date(result.rows[0].last_seen),
      updatedAt: new Date(result.rows[0].updated_at),
    };

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: userStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Update user status error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
