import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { emitNotification } from '@/lib/websocket';
import type { ApiResponse, PostReplyWithAuthor, CreatePostReplyInput } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET replies for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = params.postId;

    if (!postId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Post ID is required',
        },
        { status: 400 }
      );
    }

    // Get replies with author information
    const sqlQuery = `
      SELECT 
        pr.*,
        p.name as author_name,
        p.avatar as author_avatar
      FROM post_replies pr
      JOIN profiles p ON pr.user_id = p.user_id
      WHERE pr.post_id = $1
      ORDER BY pr.created_at ASC
    `;

    const result = await query(sqlQuery, [postId]);

    const replies: PostReplyWithAuthor[] = result.rows.map((row) => ({
      id: row.id,
      postId: row.post_id,
      userId: row.user_id,
      content: row.content,
      createdAt: new Date(row.created_at),
      authorName: row.author_name,
      authorAvatar: row.author_avatar,
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: replies,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Posts] Get replies error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch replies',
      },
      { status: 500 }
    );
  }
}

// POST create a new reply
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const postId = params.postId;
    const body: CreatePostReplyInput = await request.json();

    if (!postId || !body.userId || !body.content) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Check if post exists and get post info
    const postResult = await query(
      `SELECT p.*, prof.name as author_name 
       FROM posts p 
       JOIN profiles prof ON p.user_id = prof.user_id
       WHERE p.id = $1`,
      [postId]
    );

    if (postResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Post not found',
        },
        { status: 404 }
      );
    }

    const post = postResult.rows[0];

    // Get replier's name
    const replierResult = await query(
      'SELECT name FROM profiles WHERE user_id = $1',
      [body.userId]
    );

    if (replierResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    const replierName = replierResult.rows[0].name;

    // Create reply
    const replyResult = await query(
      `INSERT INTO post_replies (post_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [postId, body.userId, body.content]
    );

    const reply = replyResult.rows[0];

    // Get all users who should be notified (post author and other repliers, excluding current user)
    const usersToNotify = await query(
      `SELECT DISTINCT user_id 
       FROM (
         SELECT user_id FROM posts WHERE id = $1
         UNION
         SELECT user_id FROM post_replies WHERE post_id = $1
       ) AS users
       WHERE user_id != $2`,
      [postId, body.userId]
    );

    // Send notifications to all relevant users
    for (const row of usersToNotify.rows) {
      const notification = await createNotification({
        userId: row.user_id,
        type: 'post_reply',
        title: 'New reply on post',
        message: `${replierName} replied to the post "${post.title}"`,
        actorId: body.userId,
        relatedId: postId,
        relatedType: 'post',
        actionUrl: `/posts/${postId}`,
      });

      if (notification) {
        emitNotification(row.user_id, notification);
      }
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: reply.id,
          postId: reply.post_id,
          userId: reply.user_id,
          content: reply.content,
          createdAt: new Date(reply.created_at),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Posts] Create reply error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to create reply',
      },
      { status: 500 }
    );
  }
}
