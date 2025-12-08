import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import type { ApiResponse, Message, SendMessageInput } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET messages between two users (conversation)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const friendId = searchParams.get('friendId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId || !friendId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID and Friend ID are required',
        },
        { status: 400 }
      );
    }

    // Get messages between the two users
    const result = await query(
      `SELECT id, sender_id, receiver_id, message, is_read, created_at
       FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`,
      [userId, friendId, limit, offset]
    );

    const messages: Message[] = result.rows.map((row) => ({
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      message: row.message,
      isRead: row.is_read,
      createdAt: new Date(row.created_at),
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get messages error:', error);
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
 * POST send a new message
 */
export async function POST(request: NextRequest) {
  try {
    const body: SendMessageInput = await request.json();

    if (!body.senderId || !body.receiverId || !body.message) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Sender ID, Receiver ID, and message are required',
        },
        { status: 400 }
      );
    }

    // Validate that sender and receiver are not the same
    if (body.senderId === body.receiverId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Cannot send message to yourself',
        },
        { status: 400 }
      );
    }

    // Verify both users exist and get their names
    const usersResult = await query(
      'SELECT user_id, name FROM profiles WHERE user_id = $1 OR user_id = $2',
      [body.senderId, body.receiverId]
    );

    if (usersResult.rows.length !== 2) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'One or both users not found',
        },
        { status: 404 }
      );
    }

    const sender = usersResult.rows.find((u) => u.user_id === body.senderId);

    // Insert message
    const result = await query(
      `INSERT INTO messages (sender_id, receiver_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [body.senderId, body.receiverId, body.message]
    );

    const message: Message = {
      id: result.rows[0].id,
      senderId: result.rows[0].sender_id,
      receiverId: result.rows[0].receiver_id,
      message: result.rows[0].message,
      isRead: result.rows[0].is_read,
      createdAt: new Date(result.rows[0].created_at),
    };

    // Create notification for the receiver
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const messagePreview = body.message.length > 50 
      ? body.message.substring(0, 50) + '...' 
      : body.message;
    
    await createNotification({
      userId: body.receiverId,
      type: 'message',
      title: 'New Message',
      message: `${sender!.name}: ${messagePreview}`,
      actorId: body.senderId,
      relatedId: message.id,
      relatedType: 'message',
      actionUrl: `${appUrl}/chat?friendId=${body.senderId}`,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: message,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Send message error:', error);
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
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const friendId = searchParams.get('friendId');

    if (!userId || !friendId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID and Friend ID are required',
        },
        { status: 400 }
      );
    }

    // Mark all messages from friendId to userId as read
    await query(
      `UPDATE messages 
       SET is_read = true 
       WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false`,
      [friendId, userId]
    );

    // Mark all message notifications from friendId as read
    await query(
      `UPDATE notifications 
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND actor_id = $2 AND type = 'message' AND is_read = false`,
      [userId, friendId]
    );

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { updated: true },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Mark messages as read error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
