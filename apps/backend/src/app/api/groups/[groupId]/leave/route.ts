import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/groups/:groupId/leave
 * Leave a group
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Check if user is the only admin
    const adminCountResult = await db.query(
      `SELECT COUNT(*) as count FROM group_members 
       WHERE group_id = $1 AND role = 'admin'`,
      [groupId]
    );

    const userRoleResult = await db.query(
      `SELECT role FROM group_members 
       WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (userRoleResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'User is not a member of this group',
        },
        { status: 400 }
      );
    }

    const adminCount = parseInt(adminCountResult.rows[0].count);
    const userRole = userRoleResult.rows[0].role;

    if (userRole === 'admin' && adminCount === 1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot leave group as the only admin. Please assign another admin first.',
        },
        { status: 400 }
      );
    }

    // Remove user from group
    await db.query(
      `DELETE FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    return NextResponse.json({
      success: true,
      data: { message: 'Successfully left the group' },
    });
  } catch (error) {
    console.error('Error leaving group:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to leave group',
      },
      { status: 500 }
    );
  }
}
