import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse } from '@bicicita/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// POST mark post as viewed
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = params.postId;
    const body = await request.json();
    const userId = body.userId;

    if (!postId || !userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Post ID and User ID are required',
        },
        { status: 400 }
      );
    }

    // Get current reply count for the post
    const replyCountResult = await query(
      'SELECT COUNT(*) as count FROM post_replies WHERE post_id = $1',
      [postId]
    );

    const replyCount = parseInt(replyCountResult.rows[0]?.count || '0');

    // Check if view record exists
    const existingView = await query(
      'SELECT id FROM post_views WHERE post_id = $1 AND user_id = $2',
      [postId, userId]
    );

    if (existingView.rows.length > 0) {
      // Update existing view
      await query(
        `UPDATE post_views 
         SET last_reply_count_seen = $1, viewed_at = CURRENT_TIMESTAMP
         WHERE post_id = $2 AND user_id = $3`,
        [replyCount, postId, userId]
      );
    } else {
      // Create new view record
      await query(
        `INSERT INTO post_views (post_id, user_id, last_reply_count_seen)
         VALUES ($1, $2, $3)`,
        [postId, userId, replyCount]
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: 'Post marked as viewed' },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Posts] Mark as viewed error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to mark post as viewed',
      },
      { status: 500 }
    );
  }
}
