import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { deleteImage } from '@/lib/cloudinary';
import type { ApiResponse, PostImage } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET all images for a post
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

    const images: PostImage[] = result.rows.map((img) => ({
      id: img.id,
      postId: img.post_id,
      imageUrl: img.image_url,
      cloudinaryPublicId: img.cloudinary_public_id,
      displayOrder: img.display_order,
      createdAt: new Date(img.created_at),
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: images,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WebAdmin] Get post images error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch post images',
      },
      { status: 500 }
    );
  }
}

// DELETE an image from a post
export async function DELETE(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');

    if (!postId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Post ID is required',
        },
        { status: 400 }
      );
    }

    if (!imageId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Image ID is required',
        },
        { status: 400 }
      );
    }

    // Get the image to find its Cloudinary public ID
    const imageResult = await query(
      `
      SELECT id, cloudinary_public_id, display_order
      FROM post_images 
      WHERE id = $1 AND post_id = $2
      `,
      [imageId, postId]
    );

    if (imageResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Image not found',
        },
        { status: 404 }
      );
    }

    const image = imageResult.rows[0];

    // Delete from Cloudinary if public ID exists
    if (image.cloudinary_public_id) {
      try {
        await deleteImage(image.cloudinary_public_id);
      } catch (cloudinaryError) {
        console.error('Error deleting from Cloudinary:', cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Delete from database
    await query('DELETE FROM post_images WHERE id = $1', [imageId]);

    // Reorder remaining images
    await query(
      `
      UPDATE post_images 
      SET display_order = display_order - 1 
      WHERE post_id = $1 AND display_order > $2
      `,
      [postId, image.display_order]
    );

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: 'Image deleted successfully' },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WebAdmin] Delete post image error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to delete image',
      },
      { status: 500 }
    );
  }
}

// PATCH to reorder images
export async function PATCH(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;
    const body = await request.json();
    const { imageOrders } = body as { imageOrders: { id: string; displayOrder: number }[] };

    if (!postId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Post ID is required',
        },
        { status: 400 }
      );
    }

    if (!imageOrders || !Array.isArray(imageOrders)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Image orders array is required',
        },
        { status: 400 }
      );
    }

    // Update each image's display order
    for (const { id, displayOrder } of imageOrders) {
      await query('UPDATE post_images SET display_order = $1 WHERE id = $2 AND post_id = $3', [
        displayOrder,
        id,
        postId,
      ]);
    }

    // Fetch updated images
    const result = await query(
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

    const images: PostImage[] = result.rows.map((img) => ({
      id: img.id,
      postId: img.post_id,
      imageUrl: img.image_url,
      cloudinaryPublicId: img.cloudinary_public_id,
      displayOrder: img.display_order,
      createdAt: new Date(img.created_at),
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: images,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WebAdmin] Reorder post images error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to reorder images',
      },
      { status: 500 }
    );
  }
}
