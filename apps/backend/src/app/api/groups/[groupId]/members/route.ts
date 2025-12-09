import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/groups/:groupId/members
 * Get group members
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params;

    const result = await db.query(
      `SELECT 
        gm.id,
        gm.group_id as "groupId",
        gm.user_id as "userId",
        gm.role,
        gm.joined_at as "joinedAt",
        p.name,
        p.email,
        p.avatar
      FROM group_members gm
      JOIN profiles p ON gm.user_id = p.user_id
      WHERE gm.group_id = $1
      ORDER BY gm.role DESC, gm.joined_at ASC`,
      [groupId]
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching group members:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch group members',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/:groupId/members?userId=xxx&requesterId=yyy
 * Remove a member from group (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params;
    const { searchParams } = new URL(request.url);
    const userIdToRemove = searchParams.get('userId');
    const requesterId = searchParams.get('requesterId');

    if (!userIdToRemove || !requesterId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID and Requester ID are required',
        },
        { status: 400 }
      );
    }

    // Check if requester is admin
    const requesterResult = await db.query(
      `SELECT role FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, requesterId]
    );

    if (requesterResult.rows.length === 0 || requesterResult.rows[0].role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Only group admins can remove members',
        },
        { status: 403 }
      );
    }

    // Check if user to remove is the only admin
    const adminCountResult = await db.query(
      `SELECT COUNT(*) as count FROM group_members 
       WHERE group_id = $1 AND role = 'admin'`,
      [groupId]
    );

    const userToRemoveResult = await db.query(
      `SELECT role FROM group_members 
       WHERE group_id = $1 AND user_id = $2`,
      [groupId, userIdToRemove]
    );

    if (userToRemoveResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'User is not a member of this group',
        },
        { status: 400 }
      );
    }

    const adminCount = parseInt(adminCountResult.rows[0].count);
    const userRole = userToRemoveResult.rows[0].role;

    if (userRole === 'admin' && adminCount === 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot remove the only admin from the group',
        },
        { status: 400 }
      );
    }

    // Remove user from group
    await db.query(
      `DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userIdToRemove]
    );

    return NextResponse.json({
      success: true,
      data: { message: 'Member removed successfully' },
    });
  } catch (error) {
    console.error('Error removing group member:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove group member',
      },
      { status: 500 }
    );
  }
}
