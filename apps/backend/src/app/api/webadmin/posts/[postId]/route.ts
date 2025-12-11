import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// PATCH update post SEO fields and publication_date (webadmin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const body = await request.json();

    if (!postId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Post ID is required',
        },
        { status: 400 }
      );
    }

    // Extract fields that can be updated from webadmin
    const { metaDescription, keywords, publicationDate } = body;

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (metaDescription !== undefined) {
      updates.push(`meta_description = $${paramIndex}`);
      values.push(metaDescription);
      paramIndex++;
    }

    if (keywords !== undefined) {
      updates.push(`keywords = $${paramIndex}`);
      values.push(keywords);
      paramIndex++;
    }

    if (publicationDate !== undefined) {
      updates.push(`publication_date = $${paramIndex}`);
      values.push(publicationDate);
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
          error: 'Post not found',
        },
        { status: 404 }
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
          metaDescription: post.meta_description,
          keywords: post.keywords,
          publicationDate: post.publication_date ? new Date(post.publication_date) : undefined,
          createdAt: new Date(post.created_at),
          updatedAt: new Date(post.updated_at),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WebAdmin] Update post error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to update post',
      },
      { status: 500 }
    );
  }
}
