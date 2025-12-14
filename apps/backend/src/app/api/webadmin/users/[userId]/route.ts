import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { deleteImage } from '@/lib/cloudinary';
import type { ApiResponse, Profile, UpdateProfileInput } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET single user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    const result = await query('SELECT * FROM profiles WHERE user_id = $1', [userId]);

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    const user: Profile = {
      id: row.id,
      userId: row.user_id,
      email: row.email,
      name: row.name,
      level: row.level,
      bikeType: row.bike_type,
      city: row.city,
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth) : undefined,
      avatar: row.avatar,
      bio: row.bio,
      isAdmin: row.is_admin || false,
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
      lastMessageSentAt: row.last_message_sent_at ? new Date(row.last_message_sent_at) : undefined,
      lastPostCreatedAt: row.last_post_created_at
        ? new Date(row.last_post_created_at)
        : undefined,
      lastFriendAcceptedAt: row.last_friend_accepted_at
        ? new Date(row.last_friend_accepted_at)
        : undefined,
      interactionScore: row.interaction_score || 0,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return NextResponse.json<ApiResponse<Profile>>(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WebAdmin] Get user error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// PATCH update a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    const body: UpdateProfileInput = await request.json();

    const updateFields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (body.email !== undefined) {
      updateFields.push(`email = $${paramCount}`);
      values.push(body.email);
      paramCount++;
    }

    if (body.name !== undefined) {
      updateFields.push(`name = $${paramCount}`);
      values.push(body.name);
      paramCount++;
    }

    if (body.level !== undefined) {
      updateFields.push(`level = $${paramCount}`);
      values.push(body.level);
      paramCount++;
    }

    if (body.bikeType !== undefined) {
      updateFields.push(`bike_type = $${paramCount}`);
      values.push(body.bikeType);
      paramCount++;
    }

    if (body.city !== undefined) {
      updateFields.push(`city = $${paramCount}`);
      values.push(body.city);
      paramCount++;
    }

    if (body.latitude !== undefined) {
      updateFields.push(`latitude = $${paramCount}`);
      values.push(body.latitude);
      paramCount++;
    }

    if (body.longitude !== undefined) {
      updateFields.push(`longitude = $${paramCount}`);
      values.push(body.longitude);
      paramCount++;
    }

    if (body.dateOfBirth !== undefined) {
      updateFields.push(`date_of_birth = $${paramCount}`);
      values.push(body.dateOfBirth);
      paramCount++;
    }

    if (body.avatar !== undefined) {
      updateFields.push(`avatar = $${paramCount}`);
      values.push(body.avatar);
      paramCount++;
    }

    if (body.bio !== undefined) {
      updateFields.push(`bio = $${paramCount}`);
      values.push(body.bio);
      paramCount++;
    }

    if (body.isAdmin !== undefined) {
      updateFields.push(`is_admin = $${paramCount}`);
      values.push(body.isAdmin);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'At least one field must be provided to update',
        },
        { status: 400 }
      );
    }

    values.push(userId);
    const result = await query(
      `UPDATE profiles 
       SET ${updateFields.join(', ')} 
       WHERE user_id = $${paramCount} 
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    const row = result.rows[0];
    const user: Profile = {
      id: row.id,
      userId: row.user_id,
      email: row.email,
      name: row.name,
      level: row.level,
      bikeType: row.bike_type,
      city: row.city,
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth) : undefined,
      avatar: row.avatar,
      bio: row.bio,
      isAdmin: row.is_admin || false,
      lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
      lastMessageSentAt: row.last_message_sent_at ? new Date(row.last_message_sent_at) : undefined,
      lastPostCreatedAt: row.last_post_created_at
        ? new Date(row.last_post_created_at)
        : undefined,
      lastFriendAcceptedAt: row.last_friend_accepted_at
        ? new Date(row.last_friend_accepted_at)
        : undefined,
      interactionScore: row.interaction_score || 0,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return NextResponse.json<ApiResponse<Profile>>(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WebAdmin] Update user error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// DELETE a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Get user's profile images from Cloudinary to delete
    const profileImagesResult = await query(
      'SELECT cloudinary_public_id FROM profile_images WHERE user_id = $1',
      [userId]
    );

    // Get user's post images from Cloudinary to delete
    const postImagesResult = await query(
      `SELECT pi.cloudinary_public_id 
       FROM post_images pi
       JOIN posts p ON pi.post_id = p.id
       WHERE p.user_id = $1`,
      [userId]
    );

    // Delete profile from database first (cascade will handle related data)
    const result = await query('DELETE FROM profiles WHERE user_id = $1 RETURNING id', [userId]);

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Delete user from Supabase after database deletion succeeds
    const supabase = getSupabaseAdmin();
    const { error: supabaseError } = await supabase.auth.admin.deleteUser(userId);

    if (supabaseError) {
      console.error('[WebAdmin] Error deleting user from Supabase:', supabaseError);
      // Note: Database deletion already succeeded, so we just log the error
      // The user profile is removed but Supabase user still exists
    }

    // Delete all images from Cloudinary in parallel
    const allImages = [
      ...profileImagesResult.rows.map((row) => row.cloudinary_public_id),
      ...postImagesResult.rows.map((row) => row.cloudinary_public_id),
    ].filter(Boolean);

    if (allImages.length > 0) {
      const deletePromises = allImages.map((publicId) =>
        deleteImage(publicId).catch((error) => {
          console.error(`[WebAdmin] Error deleting image ${publicId} from Cloudinary:`, error);
          // Return null to continue with other deletions
          return null;
        })
      );

      await Promise.allSettled(deletePromises);
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { userId },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WebAdmin] Delete user error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
