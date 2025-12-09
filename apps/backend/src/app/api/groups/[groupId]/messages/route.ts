import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { GroupMessageWithSender, SendGroupMessageInput } from '@cyclists/config';

/**
 * GET /api/groups/:groupId/messages
 * Get group messages
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

    // Verify user is a member
    const memberResult = await db.query(
      `SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'User is not a member of this group',
        },
        { status: 403 }
      );
    }

    // Get messages with sender info
    const result = await db.query(
      `SELECT 
        gm.id,
        gm.group_id as "groupId",
        gm.sender_id as "senderId",
        gm.message,
        gm.created_at as "createdAt",
        p.name as "senderName",
        p.avatar as "senderAvatar"
      FROM group_messages gm
      JOIN profiles p ON gm.sender_id = p.user_id
      WHERE gm.group_id = $1
      ORDER BY gm.created_at DESC
      LIMIT $2`,
      [groupId, limit]
    );

    const messages: GroupMessageWithSender[] = result.rows;

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching group messages:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch group messages',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups/:groupId/messages
 * Send a message to the group
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const { groupId } = params;
    const body: SendGroupMessageInput = await request.json();
    const { senderId, message } = body;

    if (!senderId || !message) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sender ID and message are required',
        },
        { status: 400 }
      );
    }

    // Verify user is a member
    const memberResult = await db.query(
      `SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, senderId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'User is not a member of this group',
        },
        { status: 403 }
      );
    }

    // Insert message
    const messageResult = await db.query(
      `INSERT INTO group_messages (group_id, sender_id, message)
       VALUES ($1, $2, $3)
       RETURNING 
         id,
         group_id as "groupId",
         sender_id as "senderId",
         message,
         created_at as "createdAt"`,
      [groupId, senderId, message]
    );

    const newMessage = messageResult.rows[0];

    // Get sender info
    const senderResult = await db.query(
      `SELECT name, avatar FROM profiles WHERE user_id = $1`,
      [senderId]
    );

    const messageWithSender: GroupMessageWithSender = {
      ...newMessage,
      senderName: senderResult.rows[0].name,
      senderAvatar: senderResult.rows[0].avatar,
    };

    // TODO: Send notifications to group members (excluding sender)
    // This would be handled by WebSocket in a real-time implementation

    return NextResponse.json(
      {
        success: true,
        data: messageWithSender,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending group message:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send group message',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/groups/:groupId/messages
 * Mark messages as read for a user
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
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Verify user is a member
    const memberResult = await db.query(
      `SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId]
    );

    if (memberResult.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'User is not a member of this group',
        },
        { status: 403 }
      );
    }

    // Get the latest message ID
    const latestMessageResult = await db.query(
      `SELECT id FROM group_messages 
       WHERE group_id = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [groupId]
    );

    if (latestMessageResult.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: { message: 'No messages to mark as read' },
      });
    }

    const latestMessageId = latestMessageResult.rows[0].id;

    // Update or insert read status
    await db.query(
      `INSERT INTO group_message_reads (group_id, user_id, last_read_message_id, last_read_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (group_id, user_id) 
       DO UPDATE SET 
         last_read_message_id = $3,
         last_read_at = CURRENT_TIMESTAMP`,
      [groupId, userId, latestMessageId]
    );

    return NextResponse.json({
      success: true,
      data: { message: 'Messages marked as read' },
    });
  } catch (error) {
    console.error('Error marking group messages as read:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to mark messages as read',
      },
      { status: 500 }
    );
  }
}
