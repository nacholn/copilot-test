import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { emitNotification } from '@/lib/websocket';
import type { ApiResponse, GroupMessageWithSender, SendGroupMessageInput } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET group messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

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

    // If userId is provided, verify they are a member
    if (userId) {
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
          { status: 403 }
        );
      }
    }

    // Get messages with sender info and read status
    let sql = `
      SELECT 
        gm.id, gm.group_id, gm.sender_id, gm.message, gm.created_at,
        p.name as sender_name,
        p.avatar as sender_avatar
    `;

    if (userId) {
      sql += `,
        CASE WHEN gmr.user_id IS NOT NULL THEN true ELSE false END as is_read
      `;
    }

    sql += `
      FROM group_messages gm
      JOIN profiles p ON gm.sender_id = p.user_id
    `;

    if (userId) {
      sql += `
        LEFT JOIN group_message_reads gmr ON gm.id = gmr.message_id AND gmr.user_id = $2
      `;
    }

    sql += `
      WHERE gm.group_id = $1
      ORDER BY gm.created_at DESC
      LIMIT $${userId ? '3' : '2'} OFFSET $${userId ? '4' : '3'}
    `;

    const queryParams = userId ? [groupId, userId, limit, offset] : [groupId, limit, offset];
    const result = await query(sql, queryParams);

    const messages: GroupMessageWithSender[] = result.rows.map((row) => ({
      id: row.id,
      groupId: row.group_id,
      senderId: row.sender_id,
      message: row.message,
      createdAt: new Date(row.created_at),
      senderName: row.sender_name,
      senderAvatar: row.sender_avatar,
      isRead: row.is_read || false,
    }));

    return NextResponse.json<ApiResponse>(
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
 * POST send a message to the group
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params;
    const body: { senderId: string; message: string } = await request.json();

    if (!body.senderId || !body.message) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Sender ID and message are required',
        },
        { status: 400 }
      );
    }

    // Verify group exists and get group info
    const groupResult = await query(
      'SELECT id, name FROM groups WHERE id = $1',
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

    // Verify user is a member
    const memberResult = await query(
      'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, body.senderId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User is not a member of this group',
        },
        { status: 403 }
      );
    }

    // Get sender info
    const senderResult = await query(
      'SELECT name, avatar FROM profiles WHERE user_id = $1',
      [body.senderId]
    );

    if (senderResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Sender not found',
        },
        { status: 404 }
      );
    }

    const sender = senderResult.rows[0];

    // Insert message
    const messageResult = await query(
      'INSERT INTO group_messages (group_id, sender_id, message) VALUES ($1, $2, $3) RETURNING *',
      [groupId, body.senderId, body.message]
    );

    const messageRow = messageResult.rows[0];

    // Mark as read for sender
    await query(
      'INSERT INTO group_message_reads (message_id, user_id) VALUES ($1, $2)',
      [messageRow.id, body.senderId]
    );

    // Get all other group members to notify
    const membersResult = await query(
      'SELECT user_id FROM group_members WHERE group_id = $1 AND user_id != $2',
      [groupId, body.senderId]
    );

    // Create notifications for all other members
    for (const member of membersResult.rows) {
      const notification = await createNotification({
        userId: member.user_id,
        type: 'group_message',
        title: `New message in ${group.name}`,
        message: `${sender.name}: ${body.message.substring(0, 50)}${body.message.length > 50 ? '...' : ''}`,
        actorId: body.senderId,
        relatedId: messageRow.id,
        relatedType: 'group_message',
        actionUrl: `/groups/${groupId}/chat`,
      });

      if (notification) {
        emitNotification(member.user_id, notification);
      }
    }

    const message: GroupMessageWithSender = {
      id: messageRow.id,
      groupId: messageRow.group_id,
      senderId: messageRow.sender_id,
      message: messageRow.message,
      createdAt: new Date(messageRow.created_at),
      senderName: sender.name,
      senderAvatar: sender.avatar,
    };

    return NextResponse.json<ApiResponse>(
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
 * PATCH mark messages as read
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params;
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

    // Verify user is a member
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
        { status: 403 }
      );
    }

    // Get all unread messages in this group for this user
    const unreadMessages = await query(
      `SELECT gm.id
       FROM group_messages gm
       WHERE gm.group_id = $1
       AND gm.sender_id != $2
       AND NOT EXISTS (
         SELECT 1 FROM group_message_reads gmr
         WHERE gmr.message_id = gm.id AND gmr.user_id = $2
       )`,
      [groupId, userId]
    );

    // Mark all as read
    for (const msg of unreadMessages.rows) {
      await query(
        'INSERT INTO group_message_reads (message_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [msg.id, userId]
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { markedAsRead: unreadMessages.rows.length },
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
