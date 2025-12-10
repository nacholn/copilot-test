import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { emitNotification } from '@/lib/websocket';
import type { ApiResponse, Profile, JoinGroupInput } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET group members
 */
export async function GET(
  request: NextRequest,
  context: { params: { groupId: string } }
) {
  try {
    const { groupId } = context.params;

    // Verify group exists
    const groupResult = await query('SELECT id FROM groups WHERE id = $1', [groupId]);

    if (groupResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group not found',
        },
        { status: 404 }
      );
    }

    // Get all members with their profile info
    const result = await query(
      `SELECT 
        p.user_id, p.email, p.name, p.level, p.bike_type, p.city,
        p.latitude, p.longitude, p.date_of_birth, p.avatar, p.bio,
        p.created_at, p.updated_at,
        gm.joined_at
      FROM group_members gm
      JOIN profiles p ON gm.user_id = p.user_id
      WHERE gm.group_id = $1
      ORDER BY gm.joined_at ASC`,
      [groupId]
    );

    const members: (Profile & { joinedAt: Date })[] = result.rows.map((row) => ({
      id: row.user_id,
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
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      joinedAt: new Date(row.joined_at),
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: members,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get group members error:', error);
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
 * POST join a group
 */
export async function POST(
  request: NextRequest,
  context: { params: { groupId: string } }
) {
  try {
    const { groupId } = context.params;
    const body: { userId: string } = await request.json();

    if (!body.userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Verify group exists and get group info
    const groupResult = await query(
      'SELECT id, name, created_by FROM groups WHERE id = $1',
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

    const group = groupResult.rows[0];

    // Verify user exists
    const userResult = await query(
      'SELECT user_id, name FROM profiles WHERE user_id = $1',
      [body.userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    const user = userResult.rows[0];

    // Check if already a member
    const memberResult = await query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, body.userId]
    );

    if (memberResult.rows.length > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User is already a member of this group',
        },
        { status: 400 }
      );
    }

    // Add user to group
    await query(
      'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
      [groupId, body.userId]
    );

    // Notify group creator if user is not the creator
    if (group.created_by !== body.userId) {
      const notification = await createNotification({
        userId: group.created_by,
        type: 'group_member_joined',
        title: 'New Group Member',
        message: `${user.name} joined your group "${group.name}"`,
        actorId: body.userId,
        relatedId: groupId,
        relatedType: 'group',
        actionUrl: `/groups/${groupId}`,
      });

      if (notification) {
        emitNotification(group.created_by, notification);
      }
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: 'Successfully joined group' },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Join group error:', error);
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
 * DELETE leave a group
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

    // Verify group exists
    const groupResult = await query(
      'SELECT id, created_by FROM groups WHERE id = $1',
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

    // Prevent creator from leaving their own group
    if (groupResult.rows[0].created_by === userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group creator cannot leave the group. Delete the group instead.',
        },
        { status: 400 }
      );
    }

    // Check if user is a member
    const memberResult = await query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User is not a member of this group',
        },
        { status: 400 }
      );
    }

    // Remove user from group
    await query(
      'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: 'Successfully left group' },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Leave group error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
