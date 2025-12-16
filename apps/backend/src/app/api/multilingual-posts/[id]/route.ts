import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse, UpdateMultilingualPostInput, MultilingualPost } from '@cyclists/config';
import { getAvailableLanguages } from '@cyclists/config';

export const dynamic = 'force-dynamic';

// GET /api/multilingual-posts/:id - Get a single post
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const result = await query(
      `SELECT 
        mp.*,
        prof.name as author_name,
        prof.avatar as author_avatar
      FROM multilingual_posts mp
      JOIN profiles prof ON mp.author_id = prof.user_id
      WHERE mp.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    const post: MultilingualPost = {
      id: row.id,
      author_id: row.author_id,
      title: row.title,
      content: row.content,
      default_language: row.default_language,
      available_languages: row.available_languages,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };

    return NextResponse.json<ApiResponse<MultilingualPost>>({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Error fetching multilingual post:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

// PATCH /api/multilingual-posts/:id - Update a post
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body: UpdateMultilingualPostInput = await request.json();

    // Check if post exists
    const existingPost = await query('SELECT * FROM multilingual_posts WHERE id = $1', [id]);

    if (existingPost.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const current = existingPost.rows[0];
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Update title if provided
    if (body.title) {
      updates.push(`title = $${paramIndex}`);
      values.push(JSON.stringify(body.title));
      paramIndex++;
    }

    // Update content if provided
    if (body.content) {
      updates.push(`content = $${paramIndex}`);
      values.push(JSON.stringify(body.content));
      paramIndex++;
    }

    // Update default_language if provided
    if (body.default_language) {
      updates.push(`default_language = $${paramIndex}`);
      values.push(body.default_language);
      paramIndex++;
    }

    // Recalculate available_languages if title or content changed
    if (body.title || body.content) {
      const finalTitle = body.title || current.title;
      const finalContent = body.content || current.content;

      const titleLanguages = getAvailableLanguages(finalTitle);
      const contentLanguages = getAvailableLanguages(finalContent);
      const availableLanguages = titleLanguages.filter((lang) => contentLanguages.includes(lang));

      updates.push(`available_languages = $${paramIndex}`);
      values.push(availableLanguages);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add the id for WHERE clause
    values.push(id);

    const updateQuery = `
      UPDATE multilingual_posts 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, values);
    const row = result.rows[0];

    const updatedPost: MultilingualPost = {
      id: row.id,
      author_id: row.author_id,
      title: row.title,
      content: row.content,
      default_language: row.default_language,
      available_languages: row.available_languages,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };

    return NextResponse.json<ApiResponse<MultilingualPost>>({
      success: true,
      data: updatedPost,
    });
  } catch (error) {
    console.error('Error updating multilingual post:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE /api/multilingual-posts/:id - Delete a post
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const result = await query('DELETE FROM multilingual_posts WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>({ success: true });
  } catch (error) {
    console.error('Error deleting multilingual post:', error);
    return NextResponse.json<ApiResponse>(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
