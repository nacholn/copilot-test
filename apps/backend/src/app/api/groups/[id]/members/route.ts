import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse, GroupMemberWithProfile, AddGroupMemberInput } from '@bicicita/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET all members of a group
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group ID is required',
        },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT 
        gm.id,
        gm.group_id,
        gm.user_id,
        gm.role,
        gm.joined_at,
        p.name as user_name,
        p.email as user_email,
        p.avatar as user_avatar
      FROM group_members gm
      JOIN profiles p ON gm.user_id = p.user_id
      WHERE gm.group_id = $1
      ORDER BY gm.joined_at ASC`,
      [id]
    );

    const members: GroupMemberWithProfile[] = result.rows.map((row) => ({
      id: row.id,
      groupId: row.group_id,
      userId: row.user_id,
      role: row.role,
      joinedAt: new Date(row.joined_at),
      userName: row.user_name,
      userEmail: row.user_email,
      userAvatar: row.user_avatar,
    }));

    return NextResponse.json<ApiResponse<GroupMemberWithProfile[]>>(
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

// POST add a member to a group
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: groupId } = await params;

    if (!groupId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group ID is required',
        },
        { status: 400 }
      );
    }

    const body: Omit<AddGroupMemberInput, 'groupId'> & { userId: string } = await request.json();

    if (!body.userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Check if group exists
    const groupCheck = await query('SELECT id FROM groups WHERE id = $1', [groupId]);
    if (groupCheck.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group not found',
        },
        { status: 404 }
      );
    }

    // Check if user exists
    const userCheck = await query('SELECT user_id FROM profiles WHERE user_id = $1', [body.userId]);
    if (userCheck.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const memberCheck = await query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, body.userId]
    );
    if (memberCheck.rows.length > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User is already a member of this group',
        },
        { status: 400 }
      );
    }

    const role = body.role || 'member';

    const result = await query(
      `INSERT INTO group_members (group_id, user_id, role) 
       VALUES ($1, $2, $3) 
       RETURNING id, group_id, user_id, role, joined_at`,
      [groupId, body.userId, role]
    );

    // Fetch user profile info
    const profileResult = await query(
      'SELECT name, email, avatar FROM profiles WHERE user_id = $1',
      [body.userId]
    );

    const member: GroupMemberWithProfile = {
      id: result.rows[0].id,
      groupId: result.rows[0].group_id,
      userId: result.rows[0].user_id,
      role: result.rows[0].role,
      joinedAt: new Date(result.rows[0].joined_at),
      userName: profileResult.rows[0].name,
      userEmail: profileResult.rows[0].email,
      userAvatar: profileResult.rows[0].avatar,
    };

    return NextResponse.json<ApiResponse<GroupMemberWithProfile>>(
      {
        success: true,
        data: member,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add group member error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
