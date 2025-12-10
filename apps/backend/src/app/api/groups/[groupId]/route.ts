import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse, GroupWithDetails, UpdateGroupInput } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET a specific group
 */
export async function GET(
  request: NextRequest,
  context: { params: { groupId: string } }
) {
  try {
    const { groupId } = context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let sql = `
      SELECT 
        g.id, g.name, g.description, g.type, g.city, 
        g.latitude, g.longitude, g.main_image, g.cloudinary_public_id,
        g.created_by, g.created_at, g.updated_at,
        COUNT(DISTINCT gm.id) as member_count,
        p.name as creator_name,
        p.avatar as creator_avatar
    `;

    if (userId) {
      sql += `,
        CASE WHEN ugm.user_id IS NOT NULL THEN true ELSE false END as is_member
      `;
    }

    sql += `
      FROM groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN profiles p ON g.created_by = p.user_id
    `;

    if (userId) {
      sql += `
        LEFT JOIN group_members ugm ON g.id = ugm.group_id AND ugm.user_id = $2
      `;
    }

    sql += `
      WHERE g.id = $1
      GROUP BY g.id, p.name, p.avatar
    `;

    if (userId) {
      sql += `, ugm.user_id`;
    }

    const params = userId ? [groupId, userId] : [groupId];
    const result = await query(sql, params);

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group not found',
        },
        { status: 404 }
      );
    }

    const row = result.rows[0];

    // Get group images
    const imagesResult = await query(
      'SELECT id, group_id, image_url, cloudinary_public_id, display_order, created_at FROM group_images WHERE group_id = $1 ORDER BY display_order',
      [groupId]
    );

    const group: GroupWithDetails = {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      city: row.city,
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      mainImage: row.main_image,
      cloudinaryPublicId: row.cloudinary_public_id,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      memberCount: parseInt(row.member_count),
      creatorName: row.creator_name,
      creatorAvatar: row.creator_avatar,
      isMember: row.is_member || false,
      images: imagesResult.rows.map((img) => ({
        id: img.id,
        groupId: img.group_id,
        imageUrl: img.image_url,
        cloudinaryPublicId: img.cloudinary_public_id,
        displayOrder: img.display_order,
        createdAt: new Date(img.created_at),
      })),
    };

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: group,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get group error:', error);
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
 * PATCH update a group
 */
export async function PATCH(
  request: NextRequest,
  context: { params: { groupId: string } }
) {
  try {
    const { groupId } = context.params;
    const body: UpdateGroupInput & { userId: string } = await request.json();

    if (!body.userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Verify group exists and user is the creator
    const groupResult = await query(
      'SELECT created_by FROM groups WHERE id = $1',
      [groupId]
    );

    if (groupResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group not found',
        },
        { status: 404 }
      );
    }

    if (groupResult.rows[0].created_by !== body.userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Only the group creator can update the group',
        },
        { status: 403 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (body.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(body.name);
      paramIndex++;
    }

    if (body.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(body.description);
      paramIndex++;
    }

    if (body.type !== undefined) {
      if (!['location', 'general'].includes(body.type)) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Type must be "location" or "general"',
          },
          { status: 400 }
        );
      }
      updates.push(`type = $${paramIndex}`);
      values.push(body.type);
      paramIndex++;
    }

    if (body.city !== undefined) {
      updates.push(`city = $${paramIndex}`);
      values.push(body.city);
      paramIndex++;
    }

    if (body.latitude !== undefined) {
      updates.push(`latitude = $${paramIndex}`);
      values.push(body.latitude);
      paramIndex++;
    }

    if (body.longitude !== undefined) {
      updates.push(`longitude = $${paramIndex}`);
      values.push(body.longitude);
      paramIndex++;
    }

    if (body.mainImage !== undefined) {
      updates.push(`main_image = $${paramIndex}`);
      values.push(body.mainImage);
      paramIndex++;
    }

    if (body.cloudinaryPublicId !== undefined) {
      updates.push(`cloudinary_public_id = $${paramIndex}`);
      values.push(body.cloudinaryPublicId);
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

    values.push(groupId);
    const result = await query(
      `UPDATE groups SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    const row = result.rows[0];
    const group = {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      city: row.city,
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      mainImage: row.main_image,
      cloudinaryPublicId: row.cloudinary_public_id,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: group,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update group error:', error);
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
 * DELETE a group
 */
export async function DELETE(
  request: NextRequest,
  context: { params: { groupId: string } }
) {
  try {
    const { groupId } = context.params;
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

    // Verify group exists and user is the creator
    const groupResult = await query(
      'SELECT created_by FROM groups WHERE id = $1',
      [groupId]
    );

    if (groupResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group not found',
        },
        { status: 404 }
      );
    }

    if (groupResult.rows[0].created_by !== userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Only the group creator can delete the group',
        },
        { status: 403 }
      );
    }

    // Delete group (cascade will handle members, messages, images)
    await query('DELETE FROM groups WHERE id = $1', [groupId]);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: 'Group deleted successfully' },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete group error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
