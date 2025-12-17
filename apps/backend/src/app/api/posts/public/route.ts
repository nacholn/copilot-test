import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse, PostWithDetails } from '@bicicita/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET public posts (no authentication required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get public posts with author info and reply count
    // Use COALESCE for optional columns that may not exist in older databases
    const result = await query(
      `
      SELECT 
        p.id,
        p.user_id,
        p.title,
        p.content,
        p.visibility,
        p.created_at,
        p.updated_at,
        COALESCE(p.slug, '') as slug,
        COALESCE(p.meta_description, '') as meta_description,
        COALESCE(p.keywords, '') as keywords,
        p.publication_date,
        prof.name as author_name,
        prof.avatar as author_avatar,
        (SELECT COUNT(*) FROM post_replies WHERE post_id = p.id) as reply_count,
        (SELECT image_url FROM post_images WHERE post_id = p.id ORDER BY display_order LIMIT 1) as first_image_url
      FROM posts p
      JOIN profiles prof ON p.user_id = prof.user_id
      WHERE p.visibility = 'public'
      ORDER BY p.created_at DESC      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    console.log('[Posts] Public posts query returned', result.rows.length, 'rows');

    const posts: PostWithDetails[] = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      visibility: row.visibility,
      slug: row.slug,
      metaDescription: row.meta_description,
      keywords: row.keywords,
      publicationDate: row.publication_date ? new Date(row.publication_date) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      authorName: row.author_name,
      authorAvatar: row.author_avatar,
      images: row.first_image_url
        ? [
            {
              id: 'preview',
              postId: row.id,
              imageUrl: row.first_image_url,
              cloudinaryPublicId: '',
              displayOrder: 0,
              createdAt: new Date(row.created_at),
            },
          ]
        : [],
      replyCount: parseInt(row.reply_count || '0'),
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: posts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Posts] Get public posts error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch posts',
      },
      { status: 500 }
    );
  }
}
