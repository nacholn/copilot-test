import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse, PostWithDetails } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET post by slug (public access)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Slug is required',
        },
        { status: 400 }
      );
    }

    // Get post by slug with author info and images
    const result = await query(
      `
      SELECT 
        p.*,
        prof.name as author_name,
        prof.avatar as author_avatar,
        (SELECT COUNT(*) FROM post_replies WHERE post_id = p.id) as reply_count
      FROM posts p
      JOIN profiles prof ON p.user_id = prof.user_id
      WHERE p.slug = $1 AND p.visibility = 'public'
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Post not found',
        },
        { status: 404 }
      );
    }

    const row = result.rows[0];

    // Get post images
    const imagesResult = await query(
      `SELECT id, post_id, image_url, cloudinary_public_id, display_order, created_at
       FROM post_images
       WHERE post_id = $1
       ORDER BY display_order`,
      [row.id]
    );

    const post: PostWithDetails = {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      content: row.content,
      visibility: row.visibility,
      slug: row.slug,
      metaDescription: row.meta_description,
      keywords: row.keywords,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      authorName: row.author_name,
      authorAvatar: row.author_avatar,
      images: imagesResult.rows.map((img) => ({
        id: img.id,
        postId: img.post_id,
        imageUrl: img.image_url,
        cloudinaryPublicId: img.cloudinary_public_id,
        displayOrder: img.display_order,
        createdAt: new Date(img.created_at),
      })),
      replyCount: parseInt(row.reply_count || '0'),
    };

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: post,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Posts] Get post by slug error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch post',
      },
      { status: 500 }
    );
  }
}
