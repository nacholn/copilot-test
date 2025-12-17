import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse, PostWithDetails, PostImage } from '@bicicita/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET all posts for webadmin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const visibility = searchParams.get('visibility'); // Filter by visibility

    let whereClause = '';
    const params: unknown[] = [limit, offset];

    if (visibility && (visibility === 'public' || visibility === 'friends')) {
      whereClause = 'WHERE p.visibility = $3';
      params.push(visibility);
    }

    // Fetch posts
    const result = await query(
      `
      SELECT 
        p.*,
        prof.name as author_name,
        prof.avatar as author_avatar,
        (SELECT COUNT(*) FROM post_replies WHERE post_id = p.id) as reply_count
      FROM posts p
      JOIN profiles prof ON p.user_id = prof.user_id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2
      `,
      params
    );

    // Fetch all images for these posts
    const postIds = result.rows.map((row) => row.id);
    let imagesMap: Record<string, PostImage[]> = {};

    if (postIds.length > 0) {
      const imagesResult = await query(
        `
        SELECT 
          id,
          post_id,
          image_url,
          cloudinary_public_id,
          display_order,
          created_at
        FROM post_images 
        WHERE post_id = ANY($1)
        ORDER BY post_id, display_order
        `,
        [postIds]
      );

      // Group images by post_id
      imagesResult.rows.forEach((img) => {
        const postId = img.post_id;
        if (!imagesMap[postId]) {
          imagesMap[postId] = [];
        }
        imagesMap[postId].push({
          id: img.id,
          postId: img.post_id,
          imageUrl: img.image_url,
          cloudinaryPublicId: img.cloudinary_public_id,
          displayOrder: img.display_order,
          createdAt: new Date(img.created_at),
        });
      });
    }

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
      images: imagesMap[row.id] || [],
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
    console.error('[WebAdmin] Get posts error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: `Failed to fetch posts: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
