import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/groups/:groupId/join
 * Join a group
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

    // Check if group exists
    const groupResult = await db.query(
      `SELECT id FROM groups WHERE id = $1`,
      [groupId]
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

    // Check if already a member
    const memberResult = await db.query(
      `SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (memberResult.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'User is already a member of this group',
        },
        { status: 400 }
      );
    }

    // Add user as member
    await db.query(
      `INSERT INTO group_members (group_id, user_id, role)
       VALUES ($1, $2, 'member')`,
      [groupId, userId]
    );

    return NextResponse.json({
      success: true,
      data: { message: 'Successfully joined the group' },
    });
  } catch (error) {
    console.error('Error joining group:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to join group',
      },
      { status: 500 }
    );
  }
}
