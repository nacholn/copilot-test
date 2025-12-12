import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse, PostWithDetails, PostImage } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET single post by ID (webadmin only)
export async function GET(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;

    if (!postId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Post ID is required',
        },
        { status: 400 }
      );
    }

    const result = await query(
      `
      SELECT 
        p.*,
        prof.name as author_name,
        prof.avatar as author_avatar,
        (SELECT COUNT(*) FROM post_replies WHERE post_id = p.id) as reply_count
      FROM posts p
      JOIN profiles prof ON p.user_id = prof.user_id
      WHERE p.id = $1
      `,
      [postId]
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

    // Fetch all images for this post
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
      WHERE post_id = $1
      ORDER BY display_order
      `,
      [postId]
    );

    const images: PostImage[] = imagesResult.rows.map((img) => ({
      id: img.id,
      postId: img.post_id,
      imageUrl: img.image_url,
      cloudinaryPublicId: img.cloudinary_public_id,
      displayOrder: img.display_order,
      createdAt: new Date(img.created_at),
    }));

    const row = result.rows[0];
    const post: PostWithDetails = {
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
      images: images,
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
    console.error('[WebAdmin] Get post error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch post',
      },
      { status: 500 }
    );
  }
}

// PATCH update post fields (webadmin only)
export async function PATCH(request: NextRequest, { params }: { params: { postId: string } }) {
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
    } // Extract fields that can be updated from webadmin
    const { title, content, visibility, slug, metaDescription, keywords, publicationDate } = body;

    // Validate visibility if provided
    if (visibility !== undefined && !['public', 'friends'].includes(visibility)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Visibility must be "public" or "friends"',
        },
        { status: 400 }
      );
    }

    // If slug is being updated, check for uniqueness
    if (slug !== undefined) {
      // Validate slug format (alphanumeric, hyphens only)
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slug)) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Slug must contain only lowercase letters, numbers, and hyphens',
          },
          { status: 400 }
        );
      }

      // Check if slug already exists for another post
      const existingSlug = await query('SELECT id FROM posts WHERE slug = $1 AND id != $2', [
        slug,
        postId,
      ]);

      if (existingSlug.rows.length > 0) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'A post with this slug already exists. Please choose a different slug.',
          },
          { status: 409 }
        );
      }
    }

    // Build dynamic update query
    const updates: string[] = [];
    const values: unknown[] = [];
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
      updates.push(`visibility = $${paramIndex}`);
      values.push(visibility);
      paramIndex++;
    }

    if (slug !== undefined) {
      updates.push(`slug = $${paramIndex}`);
      values.push(slug);
      paramIndex++;
    }

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
