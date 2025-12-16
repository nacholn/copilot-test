import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { uploadImage, deleteImage } from '@/lib/cloudinary';
import type { ApiResponse, ProfileImage } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET all images for a user profile
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT id, user_id, image_url, cloudinary_public_id, is_primary, display_order, created_at
       FROM profile_images
       WHERE user_id = $1
       ORDER BY is_primary DESC, display_order ASC, created_at DESC`,
      [userId]
    );

    const images: ProfileImage[] = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      imageUrl: row.image_url,
      cloudinaryPublicId: row.cloudinary_public_id,
      isPrimary: row.is_primary,
      displayOrder: row.display_order,
      createdAt: new Date(row.created_at),
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: images,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile images error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST upload a new image for a user profile
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    const isPrimary = formData.get('isPrimary') === 'true';
    const file = formData.get('file') as File;

    if (!userId || !file) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID and file are required',
        },
        { status: 400 }
      );
    }

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'File must be an image',
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await uploadImage(buffer, 'cyclists/profiles');

    // If this is marked as primary, unset any existing primary images
    if (isPrimary) {
      await query('UPDATE profile_images SET is_primary = false WHERE user_id = $1', [userId]);
    }

    // Get the next display order
    const orderResult = await query(
      'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM profile_images WHERE user_id = $1',
      [userId]
    );
    const displayOrder = orderResult.rows[0].next_order;

    // Save image record to database
    const insertResult = await query(
      `INSERT INTO profile_images (user_id, image_url, cloudinary_public_id, is_primary, display_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, uploadResult.secure_url, uploadResult.public_id, isPrimary, displayOrder]
    );

    // Update profile avatar if this is primary
    if (isPrimary) {
      await query('UPDATE profiles SET avatar = $1 WHERE user_id = $2', [
        uploadResult.secure_url,
        userId,
      ]);
    }

    const image: ProfileImage = {
      id: insertResult.rows[0].id,
      userId: insertResult.rows[0].user_id,
      imageUrl: insertResult.rows[0].image_url,
      cloudinaryPublicId: insertResult.rows[0].cloudinary_public_id,
      isPrimary: insertResult.rows[0].is_primary,
      displayOrder: insertResult.rows[0].display_order,
      createdAt: new Date(insertResult.rows[0].created_at),
    };

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: image,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload profile image error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE an image from a user profile
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');
    const userId = searchParams.get('userId');

    if (!imageId || !userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Image ID and User ID are required',
        },
        { status: 400 }
      );
    }

    // Get image details
    const imageResult = await query('SELECT * FROM profile_images WHERE id = $1 AND user_id = $2', [
      imageId,
      userId,
    ]);

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

    // Delete from Cloudinary
    try {
      await deleteImage(image.cloudinary_public_id);
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete from database
    await query('DELETE FROM profile_images WHERE id = $1', [imageId]);

    // If this was the primary image, update profile avatar
    if (image.is_primary) {
      // Get the next image to set as primary
      const nextImageResult = await query(
        `SELECT * FROM profile_images 
         WHERE user_id = $1 
         ORDER BY display_order ASC, created_at DESC 
         LIMIT 1`,
        [userId]
      );

      if (nextImageResult.rows.length > 0) {
        const nextImage = nextImageResult.rows[0];
        await query('UPDATE profile_images SET is_primary = true WHERE id = $1', [nextImage.id]);
        await query('UPDATE profiles SET avatar = $1 WHERE user_id = $2', [
          nextImage.image_url,
          userId,
        ]);
      } else {
        // No more images, clear avatar
        await query('UPDATE profiles SET avatar = NULL WHERE user_id = $1', [userId]);
      }
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { deleted: true },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete profile image error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH update image properties (e.g., set as primary)
 */
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');
    const userId = searchParams.get('userId');
    const body = await request.json();

    if (!imageId || !userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Image ID and User ID are required',
        },
        { status: 400 }
      );
    }

    // Verify image belongs to user
    const imageResult = await query('SELECT * FROM profile_images WHERE id = $1 AND user_id = $2', [
      imageId,
      userId,
    ]);

    if (imageResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Image not found',
        },
        { status: 404 }
      );
    }

    // If setting as primary, unset other primary images
    if (body.isPrimary === true) {
      await query('UPDATE profile_images SET is_primary = false WHERE user_id = $1', [userId]);

      await query('UPDATE profile_images SET is_primary = true WHERE id = $1', [imageId]);

      // Update profile avatar
      const image = imageResult.rows[0];
      await query('UPDATE profiles SET avatar = $1 WHERE user_id = $2', [image.image_url, userId]);
    }

    // Get updated image
    const updatedResult = await query('SELECT * FROM profile_images WHERE id = $1', [imageId]);

    const image: ProfileImage = {
      id: updatedResult.rows[0].id,
      userId: updatedResult.rows[0].user_id,
      imageUrl: updatedResult.rows[0].image_url,
      cloudinaryPublicId: updatedResult.rows[0].cloudinary_public_id,
      isPrimary: updatedResult.rows[0].is_primary,
      displayOrder: updatedResult.rows[0].display_order,
      createdAt: new Date(updatedResult.rows[0].created_at),
    };

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: image,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile image error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
