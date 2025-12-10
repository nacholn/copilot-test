import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse, Conversation, GroupConversation } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET all conversations for a user (both friends and groups)
 * Returns a list of friends with their last message and unread count,
 * plus groups the user is a member of with their last message and unread count
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

    // Get all groups the user is a member of
    const groupsResult = await query(
      `SELECT 
         g.id as group_id,
         g.name as group_name,
         g.main_image as group_image,
         COUNT(DISTINCT gm2.id) as member_count
       FROM group_members gm
       JOIN groups g ON gm.group_id = g.id
       LEFT JOIN group_members gm2 ON g.id = gm2.group_id
       WHERE gm.user_id = $1
       GROUP BY g.id, g.name, g.main_image`,
      [userId]
    );

    const groupConversations: GroupConversation[] = [];

    // For each group, get the last message and unread count
    for (const group of groupsResult.rows) {
      const groupId = group.group_id;

      // Get last message
      const lastMessageResult = await query(
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
         LIMIT 1`,
        [groupId]
      );

      // Get unread count (messages not read by this user)
      const unreadResult = await query(
        `SELECT COUNT(*) as count
         FROM group_messages gm
         WHERE gm.group_id = $1
         AND gm.sender_id != $2
         AND NOT EXISTS (
           SELECT 1 FROM group_message_reads gmr 
           WHERE gmr.message_id = gm.id AND gmr.user_id = $2
         )`,
        [groupId, userId]
      );

      const lastMessage = lastMessageResult.rows.length > 0
        ? {
            id: lastMessageResult.rows[0].id,
            groupId: lastMessageResult.rows[0].group_id,
            senderId: lastMessageResult.rows[0].sender_id,
            message: lastMessageResult.rows[0].message,
            createdAt: new Date(lastMessageResult.rows[0].created_at),
            senderName: lastMessageResult.rows[0].sender_name,
            senderAvatar: lastMessageResult.rows[0].sender_avatar,
          }
        : undefined;

      groupConversations.push({
        groupId,
        groupName: group.group_name,
        groupImage: group.group_image || undefined,
        lastMessage,
        unreadCount: parseInt(unreadResult.rows[0].count),
        memberCount: parseInt(group.member_count),
      });
    }

    // Sort by last message timestamp (most recent first)
    conversations.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime();
    });

    groupConversations.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime();
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          conversations,
          groupConversations,
        },
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
