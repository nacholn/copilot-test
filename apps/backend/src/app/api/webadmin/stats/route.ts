import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse } from '@bicicita/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET statistics for webadmin dashboard
export async function GET(request: NextRequest) {
  try {
    // Get total users count
    const usersResult = await query('SELECT COUNT(*) as count FROM profiles');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Get admin users count
    const adminsResult = await query('SELECT COUNT(*) as count FROM profiles WHERE is_admin = true');
    const totalAdmins = parseInt(adminsResult.rows[0].count);

    // Get total groups count
    const groupsResult = await query('SELECT COUNT(*) as count FROM groups');
    const totalGroups = parseInt(groupsResult.rows[0].count);

    // Get total posts count
    const postsResult = await query('SELECT COUNT(*) as count FROM posts');
    const totalPosts = parseInt(postsResult.rows[0].count);

    // Get public posts count
    const publicPostsResult = await query(
      "SELECT COUNT(*) as count FROM posts WHERE visibility = 'public'"
    );
    const publicPosts = parseInt(publicPostsResult.rows[0].count);

    // Get total messages count
    const messagesResult = await query('SELECT COUNT(*) as count FROM messages');
    const totalMessages = parseInt(messagesResult.rows[0].count);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          totalUsers,
          totalAdmins,
          totalGroups,
          totalPosts,
          publicPosts,
          totalMessages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WebAdmin] Get stats error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: `Failed to fetch statistics: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
