import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { uploadImage } from '@/lib/cloudinary';
import { createNotification } from '@/lib/notifications';
import { emitNotification } from '@/lib/websocket';
import { generateUniqueSlug } from '@/lib/slug';
import type { ApiResponse, CreatePostInput, PostWithDetails } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET posts list
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const showAll = searchParams.get('showAll') === 'true';

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Build query to get posts with author info and reply count
    let sqlQuery = `
      SELECT 
        p.*,
        prof.name as author_name,
        prof.avatar as author_avatar,
        (SELECT COUNT(*) FROM post_replies WHERE post_id = p.id) as reply_count,
        (SELECT image_url FROM post_images WHERE post_id = p.id ORDER BY display_order LIMIT 1) as first_image_url,
        (SELECT COUNT(*) FROM post_images WHERE post_id = p.id) as image_count,
        pv.last_reply_count_seen,
        pv.viewed_at
      FROM posts p
      JOIN profiles prof ON p.user_id = prof.user_id
      LEFT JOIN post_views pv ON p.id = pv.post_id AND pv.user_id = $1
      WHERE 
        (p.visibility = 'public' 
         OR (p.visibility = 'friends' AND (
           p.user_id = $1 
           OR EXISTS (
             SELECT 1 FROM friendships 
             WHERE user_id = $1 AND friend_id = p.user_id
           )
         ))
        )
    `;

    // If not showing all, filter for unseen or with new activity
    if (!showAll) {
      sqlQuery += `
        AND (
          pv.id IS NULL 
          OR (SELECT COUNT(*) FROM post_replies WHERE post_id = p.id) > pv.last_reply_count_seen
          OR (p.user_id = $1 AND (SELECT COUNT(*) FROM post_replies WHERE post_id = p.id) > COALESCE(pv.last_reply_count_seen, 0))
          OR (EXISTS (
            SELECT 1 FROM post_replies pr 
            WHERE pr.post_id = p.id AND pr.user_id = $1
            AND (SELECT COUNT(*) FROM post_replies WHERE post_id = p.id AND created_at > pr.created_at) > 0
          ))
        )
      `;
    }

    sqlQuery += ' ORDER BY p.created_at DESC';

    const result = await query(sqlQuery, [userId]);

    // For list view, we only need to show if there's an image, not full details
    // The actual image data will be fetched when viewing the post detail
    const posts: PostWithDetails[] = result.rows.map((row) => ({
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
      images: row.first_image_url ? [{
        id: 'preview', // Placeholder ID for list view
        postId: row.id,
        imageUrl: row.first_image_url,
        cloudinaryPublicId: '', // Not needed for list view
        displayOrder: 0,
        createdAt: new Date(row.created_at),
      }] : [],
      replyCount: parseInt(row.reply_count || '0'),
      hasNewActivity: row.viewed_at ? parseInt(row.reply_count || '0') > (row.last_reply_count_seen || 0) : true,
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: posts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Posts] Get posts error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch posts',
      },
      { status: 500 }
    );
  }
}

// POST create a new post
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const visibility = formData.get('visibility') as 'public' | 'friends';
    const metaDescription = formData.get('metaDescription') as string | null;
    const keywords = formData.get('keywords') as string | null;
    const images = formData.getAll('images') as File[];

    if (!userId || !title || !content || !visibility) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Validate visibility
    if (visibility !== 'public' && visibility !== 'friends') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid visibility value',
        },
        { status: 400 }
      );
    }

    // Create post first to get the ID for slug generation
    const postResult = await query(
      `INSERT INTO posts (user_id, title, content, visibility)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, title, content, visibility]
    );

    const post = postResult.rows[0];

    // Generate and update slug
    const slug = generateUniqueSlug(title, post.id);
    await query(
      `UPDATE posts SET slug = $1, meta_description = $2, keywords = $3 WHERE id = $4`,
      [slug, metaDescription, keywords, post.id]
    );

    // Upload images to Cloudinary if provided
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const buffer = Buffer.from(await image.arrayBuffer());
        
        try {
          const uploadResult = await uploadImage(buffer, 'cyclists/posts');
          
          await query(
            `INSERT INTO post_images (post_id, image_url, cloudinary_public_id, display_order)
             VALUES ($1, $2, $3, $4)`,
            [post.id, uploadResult.secure_url, uploadResult.public_id, i]
          );
        } catch (uploadError) {
          console.error('[Posts] Image upload error:', uploadError);
          // Continue with other images even if one fails
        }
      }
    }

    // Get post author name for notifications
    const authorResult = await query(
      'SELECT name FROM profiles WHERE user_id = $1',
      [userId]
    );
    const authorName = authorResult.rows[0]?.name || 'Someone';

    // Send notifications to friends based on post visibility
    // For both public and friends-only posts, notify the creator's friends
    const friendsResult = await query(
      'SELECT friend_id FROM friendships WHERE user_id = $1',
      [userId]
    );

    // Send notification to each friend
    for (const row of friendsResult.rows) {
      const friendId = row.friend_id;
      
      // Create notification
      const notification = await createNotification({
        userId: friendId,
        type: 'new_post',
        title: visibility === 'public' ? 'New public post' : 'New post from friend',
        message: `${authorName} shared a new post: "${title}"`,
        actorId: userId,
        relatedId: post.id,
        relatedType: 'post',
        actionUrl: `/p/${slug}`,
      });

      // Emit via WebSocket for real-time notification
      if (notification) {
        emitNotification(friendId, notification);
      }
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: post.id,
          userId: post.user_id,
          title: post.title,
          content: post.content,
          visibility: post.visibility,
          slug: slug,
          metaDescription: metaDescription || undefined,
          keywords: keywords || undefined,
          createdAt: new Date(post.created_at),
          updatedAt: new Date(post.updated_at),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Posts] Create post error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to create post',
      },
      { status: 500 }
    );
  }
}
