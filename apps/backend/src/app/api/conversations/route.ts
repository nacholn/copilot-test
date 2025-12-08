import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse, Conversation } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET all conversations for a user
 * Returns a list of friends with their last message and unread count
 */
export async function GET(request: NextRequest) {
  try {
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

    // Get all friends
    const friendsResult = await query(
      `SELECT DISTINCT
         CASE 
           WHEN f.user_id = $1 THEN f.friend_id
           ELSE f.user_id
         END as friend_id,
         p.name as friend_name,
         p.avatar as friend_avatar
       FROM friendships f
       JOIN profiles p ON (
         CASE 
           WHEN f.user_id = $1 THEN f.friend_id
           ELSE f.user_id
         END = p.user_id
       )
       WHERE f.user_id = $1 OR f.friend_id = $1`,
      [userId]
    );

    const conversations: Conversation[] = [];

    // For each friend, get the last message and unread count
    for (const friend of friendsResult.rows) {
      const friendId = friend.friend_id;

      // Get last message
      const lastMessageResult = await query(
        `SELECT id, sender_id, receiver_id, message, is_read, created_at
         FROM messages
         WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId, friendId]
      );

      // Get unread count
      const unreadResult = await query(
        `SELECT COUNT(*) as count
         FROM messages
         WHERE sender_id = $1 AND receiver_id = $2 AND is_read = false`,
        [friendId, userId]
      );

      const lastMessage = lastMessageResult.rows.length > 0
        ? {
            id: lastMessageResult.rows[0].id,
            senderId: lastMessageResult.rows[0].sender_id,
            receiverId: lastMessageResult.rows[0].receiver_id,
            message: lastMessageResult.rows[0].message,
            isRead: lastMessageResult.rows[0].is_read,
            createdAt: new Date(lastMessageResult.rows[0].created_at),
          }
        : undefined;

      conversations.push({
        friendId,
        friendName: friend.friend_name,
        friendAvatar: friend.friend_avatar || undefined,
        lastMessage,
        unreadCount: parseInt(unreadResult.rows[0].count),
      });
    }

    // Sort by last message timestamp (most recent first)
    conversations.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime();
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: conversations,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
