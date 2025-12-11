import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { emitNotification } from '@/lib/websocket';
import type {
  ApiResponse,
  GroupMessage,
  GroupMessageWithSender,
  SendGroupMessageInput,
} from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET messages for a group
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: groupId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!groupId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group ID is required',
        },
        { status: 400 }
      );
    }

    // Get messages for the group
    const result = await query(
      `SELECT 
        gm.id,
        gm.group_id,
        gm.sender_id,
        gm.message,
        gm.created_at,
        p.name as sender_name,
        p.avatar as sender_avatar
       FROM group_messages gm
       JOIN profiles p ON gm.sender_id = p.user_id
       WHERE gm.group_id = $1
       ORDER BY gm.created_at DESC
       LIMIT $2 OFFSET $3`,
      [groupId, limit, offset]
    );

    const messages: GroupMessageWithSender[] = result.rows.map((row) => ({
      id: row.id,
      groupId: row.group_id,
      senderId: row.sender_id,
      message: row.message,
      createdAt: new Date(row.created_at),
      senderName: row.sender_name,
      senderAvatar: row.sender_avatar,
    }));

    return NextResponse.json<ApiResponse<GroupMessageWithSender[]>>(
      {
        success: true,
        data: messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get group messages error:', error);
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
 * POST send a new message to a group
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: groupId } = await params;
    const body: Omit<SendGroupMessageInput, 'groupId'> = await request.json();

    if (!groupId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group ID is required',
        },
        { status: 400 }
      );
    }

    if (!body.senderId || !body.message) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Sender ID and message are required',
        },
        { status: 400 }
      );
    }

    // Verify sender is a member of the group
    const memberCheck = await query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, body.senderId]
    );

    if (memberCheck.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'You must be a member of the group to send messages',
        },
        { status: 403 }
      );
    }

    // Get sender info and group info
    const senderResult = await query('SELECT name FROM profiles WHERE user_id = $1', [
      body.senderId,
    ]);
    const groupResult = await query('SELECT name FROM groups WHERE id = $1', [groupId]);

    if (senderResult.rows.length === 0 || groupResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Sender or group not found',
        },
        { status: 404 }
      );
    }

    const senderName = senderResult.rows[0].name;
    const groupName = groupResult.rows[0].name;

    // Insert message
    const result = await query(
      `INSERT INTO group_messages (group_id, sender_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [groupId, body.senderId, body.message]
    );

    const message: GroupMessage = {
      id: result.rows[0].id,
      groupId: result.rows[0].group_id,
      senderId: result.rows[0].sender_id,
      message: result.rows[0].message,
      createdAt: new Date(result.rows[0].created_at),
    };

    // Get all other group members to notify them
    const membersResult = await query(
      'SELECT user_id FROM group_members WHERE group_id = $1 AND user_id != $2',
      [groupId, body.senderId]
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const messagePreview =
      body.message.length > 50 ? body.message.substring(0, 50) + '...' : body.message;

    // Create notifications for all other members
    for (const member of membersResult.rows) {
      const notification = await createNotification({
        userId: member.user_id,
        type: 'message',
        title: `New message in ${groupName}`,
        message: `${senderName}: ${messagePreview}`,
        actorId: body.senderId,
        relatedId: message.id,
        relatedType: 'group_message',
        actionUrl: `${appUrl}/chat?groupId=${groupId}`,
      });

      // Emit notification via WebSocket
      if (notification) {
        emitNotification(member.user_id, notification);
      }
    }

    return NextResponse.json<ApiResponse<GroupMessage>>(
      {
        success: true,
        data: message,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Send group message error:', error);
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
 * PATCH mark messages as read for a user in a group
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: groupId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!groupId || !userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group ID and User ID are required',
        },
        { status: 400 }
      );
    }

    // Mark all unread messages as read using a single query
    await query(
      `INSERT INTO group_message_reads (message_id, user_id)
       SELECT gm.id, $2
       FROM group_messages gm
       WHERE gm.group_id = $1 
       AND gm.sender_id != $2
       AND NOT EXISTS (
         SELECT 1 FROM group_message_reads gmr 
         WHERE gmr.message_id = gm.id AND gmr.user_id = $2
       )
       ON CONFLICT (message_id, user_id) DO NOTHING`,
      [groupId, userId]
    );

    // Mark all group message notifications as read
    await query(
      `UPDATE notifications 
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 
       AND related_type = 'group_message' 
       AND related_id IN (
         SELECT id FROM group_messages WHERE group_id = $2
       )
       AND is_read = false`,
      [userId, groupId]
    );

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { updated: true },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Mark group messages as read error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
