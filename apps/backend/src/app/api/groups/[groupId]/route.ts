import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { GroupWithDetails, UpdateGroupInput } from '@cyclists/config';

/**
 * GET /api/groups/:groupId
 * Get group details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Get group details
    const groupResult = await db.query(
      `SELECT 
        g.id,
        g.name,
        g.description,
        g.location,
        g.avatar,
        g.created_by as "createdBy",
        g.created_at as "createdAt",
        g.updated_at as "updatedAt",
        COUNT(DISTINCT gm.id) as "memberCount",
        CASE WHEN SUM(CASE WHEN gm.user_id = $2 AND gm.role = 'admin' THEN 1 ELSE 0 END) > 0 
          THEN true ELSE false END as "isAdmin",
        CASE WHEN SUM(CASE WHEN gm.user_id = $2 THEN 1 ELSE 0 END) > 0 
          THEN true ELSE false END as "isMember"
      FROM groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id
      WHERE g.id = $1
      GROUP BY g.id, g.name, g.description, g.location, g.avatar, g.created_by, g.created_at, g.updated_at`,
      [groupId, userId || '']
    );

    if (groupResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Group not found',
        },
        { status: 404 }
      );
    }

    const group = groupResult.rows[0];

    // Get group images
    const imagesResult = await db.query(
      `SELECT 
        id,
        group_id as "groupId",
        image_url as "imageUrl",
        cloudinary_public_id as "cloudinaryPublicId",
        is_primary as "isPrimary",
        display_order as "displayOrder",
        created_at as "createdAt"
      FROM group_images
      WHERE group_id = $1
      ORDER BY display_order ASC`,
      [groupId]
    );

    const groupWithDetails: GroupWithDetails = {
      ...group,
      memberCount: parseInt(group.memberCount) || 0,
      isAdmin: group.isAdmin || false,
      isMember: group.isMember || false,
      images: imagesResult.rows,
    };

    return NextResponse.json({
      success: true,
      data: groupWithDetails,
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch group',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/groups/:groupId
 * Update group (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const body: UpdateGroupInput = await request.json();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Check if user is admin
    const memberResult = await db.query(
      `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (memberResult.rows.length === 0 || memberResult.rows[0].role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Only group admins can update the group',
        },
        { status: 403 }
      );
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (body.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(body.name);
    }
    if (body.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(body.description);
    }
    if (body.location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      values.push(body.location);
    }
    if (body.avatar !== undefined) {
      updates.push(`avatar = $${paramCount++}`);
      values.push(body.avatar);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No fields to update',
        },
        { status: 400 }
      );
    }

    values.push(groupId);

    const result = await db.query(
      `UPDATE groups
       SET ${updates.join(', ')}
       WHERE id = $${paramCount}
       RETURNING 
         id,
         name,
         description,
         location,
         avatar,
         created_by as "createdBy",
         created_at as "createdAt",
         updated_at as "updatedAt"`,
      values
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating group:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update group',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/:groupId
 * Delete group (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Check if user is admin
    const memberResult = await db.query(
      `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (memberResult.rows.length === 0 || memberResult.rows[0].role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Only group admins can delete the group',
        },
        { status: 403 }
      );
    }

    // Delete group (cascade will handle related tables)
    await db.query(`DELETE FROM groups WHERE id = $1`, [groupId]);

    return NextResponse.json({
      success: true,
      data: { message: 'Group deleted successfully' },
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete group',
      },
      { status: 500 }
    );
  }
}
