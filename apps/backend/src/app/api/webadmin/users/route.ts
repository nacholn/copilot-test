import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse, Profile } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET all users for webadmin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';

    let whereClause = '';
    const params: unknown[] = [limit, offset];

    if (search) {
      whereClause = 'WHERE p.name ILIKE $3 OR p.email ILIKE $3 OR p.city ILIKE $3';
      params.push(`%${search}%`);
    }

    const result = await query(
      `
      SELECT 
        p.id,
        p.user_id,
        p.email,
        p.name,
        p.level,
        p.bike_type,
        p.city,
        p.latitude,
        p.longitude,
        p.date_of_birth,
        p.avatar,
        p.bio,
        p.is_admin,
        p.last_login_at,
        p.last_message_sent_at,
        p.last_post_created_at,
        p.last_friend_accepted_at,
        p.interaction_score,
        p.created_at,
        p.updated_at
      FROM profiles p
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
      `,
      params
    );

    const users: Profile[] = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      email: row.email,
      name: row.name,
      level: row.level,
      bikeType: row.bike_type,
      city: row.city,
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth) : undefined,
      avatar: row.avatar,
      bio: row.bio,
      isAdmin: row.is_admin || false,
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
      lastMessageSentAt: row.last_message_sent_at ? new Date(row.last_message_sent_at) : undefined,
      lastPostCreatedAt: row.last_post_created_at ? new Date(row.last_post_created_at) : undefined,
      lastFriendAcceptedAt: row.last_friend_accepted_at
        ? new Date(row.last_friend_accepted_at)
        : undefined,
      interactionScore: row.interaction_score || 0,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: users,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WebAdmin] Get users error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: `Failed to fetch users: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
