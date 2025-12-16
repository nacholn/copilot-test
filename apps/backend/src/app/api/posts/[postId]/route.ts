import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET single post with all images and details
export async function GET(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const postId = params.postId;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!postId || !userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Post ID and User ID are required',
        },
        { status: 400 }
      );
    }

    // Get post with author info
    const postQuery = `
      SELECT 
        p.*,
        prof.name as author_name,
        prof.avatar as author_avatar
      FROM posts p
      JOIN profiles prof ON p.user_id = prof.user_id
      WHERE p.id = $1
        AND (
          p.visibility = 'public' 
          OR (p.visibility = 'friends' AND (
            p.user_id = $2 
            OR EXISTS (
              SELECT 1 FROM friendships 
              WHERE user_id = $2 AND friend_id = p.user_id
            )
          ))
        )
    `;

    const postResult = await query(postQuery, [postId, userId]);

    if (postResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Post not found',
        },
        { status: 404 }
      );
    }

    const postRow = postResult.rows[0];

    // Get all images for this post
    const imagesQuery = `
      SELECT *
      FROM post_images
      WHERE post_id = $1
      ORDER BY display_order ASC
    `;

    const imagesResult = await query(imagesQuery, [postId]);

    // Get reply count
    const replyCountResult = await query(
      'SELECT COUNT(*) as count FROM post_replies WHERE post_id = $1',
      [postId]
    );

    const post = {
      id: postRow.id,
      userId: postRow.user_id,
      title: postRow.title,
      content: postRow.content,
      visibility: postRow.visibility,
      createdAt: new Date(postRow.created_at),
      updatedAt: new Date(postRow.updated_at),
      authorName: postRow.author_name,
      authorAvatar: postRow.author_avatar,
      images: imagesResult.rows.map((img) => ({
        id: img.id,
        postId: img.post_id,
        imageUrl: img.image_url,
        cloudinaryPublicId: img.cloudinary_public_id,
        displayOrder: img.display_order,
        createdAt: new Date(img.created_at),
      })),
      replyCount: parseInt(replyCountResult.rows[0]?.count || '0'),
    };

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: post,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Posts] Get single post error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch post',
      },
      { status: 500 }
    );
  }
}

// PATCH update post (title, content, visibility)
export async function PATCH(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const postId = params.postId;
    const body = await request.json();
    const { title, content, visibility, userId } = body;

    if (!postId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Post ID is required',
        },
        { status: 400 }
      );
    }

    // userId is required for authorization
    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID is required for authorization',
        },
        { status: 400 }
      );
    }

    // Verify the post belongs to the user
    const ownerCheck = await query('SELECT user_id FROM posts WHERE id = $1', [postId]);

    if (ownerCheck.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Post not found',
        },
        { status: 404 }
      );
    }

    if (ownerCheck.rows[0].user_id !== userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Not authorized to edit this post',
        },
        { status: 403 }
      );
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex}`);
      values.push(title);
      paramIndex++;
    }

    if (content !== undefined) {
      updates.push(`content = $${paramIndex}`);
      values.push(content);
      paramIndex++;
    }

    if (visibility !== undefined) {
      if (visibility !== 'public' && visibility !== 'friends') {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Invalid visibility value',
          },
          { status: 400 }
        );
      }
      updates.push(`visibility = $${paramIndex}`);
      values.push(visibility);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'No fields to update',
        },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updates.push('updated_at = CURRENT_TIMESTAMP');

    // Add postId as the last parameter
    values.push(postId);

    const updateQuery = `
      UPDATE posts 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Failed to update post',
        },
        { status: 500 }
      );
    }

    const post = result.rows[0];

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: post.id,
          userId: post.user_id,
          title: post.title,
          content: post.content,
          visibility: post.visibility,
          slug: post.slug,
          createdAt: new Date(post.created_at),
          updatedAt: new Date(post.updated_at),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Posts] Update post error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to update post',
      },
      { status: 500 }
    );
  }
}
