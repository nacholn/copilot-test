import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { GroupConversation } from '@cyclists/config';

/**
 * GET /api/group-conversations?userId=xxx
 * Get group conversations with unread counts for a user
 */
export async function GET(request: NextRequest) {
  try {
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

    // Get groups with last message and unread count
    const result = await db.query(
      `SELECT 
        g.id as "groupId",
        g.name as "groupName",
        g.avatar as "groupAvatar",
        COUNT(DISTINCT gm2.id) as "memberCount",
        (
          SELECT json_build_object(
            'id', gm3.id,
            'groupId', gm3.group_id,
            'senderId', gm3.sender_id,
            'message', gm3.message,
            'createdAt', gm3.created_at
          )
          FROM group_messages gm3
          WHERE gm3.group_id = g.id
          ORDER BY gm3.created_at DESC
          LIMIT 1
        ) as "lastMessage",
        COALESCE(
          (
            SELECT COUNT(*)
            FROM group_messages gm4
            LEFT JOIN group_message_reads gmr ON gmr.group_id = gm4.group_id AND gmr.user_id = $1
            WHERE gm4.group_id = g.id
              AND gm4.sender_id != $1
              AND (
                gmr.last_read_message_id IS NULL 
                OR gm4.created_at > (
                  SELECT created_at 
                  FROM group_messages 
                  WHERE id = gmr.last_read_message_id
                )
              )
          ), 0
        ) as "unreadCount"
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN group_members gm2 ON g.id = gm2.group_id
      WHERE gm.user_id = $1
      GROUP BY g.id, g.name, g.avatar
      ORDER BY (
        SELECT created_at 
        FROM group_messages 
        WHERE group_id = g.id 
        ORDER BY created_at DESC 
        LIMIT 1
      ) DESC NULLS LAST`,
      [userId]
    );

    const conversations: GroupConversation[] = result.rows.map((row: any) => ({
      groupId: row.groupId,
      groupName: row.groupName,
      groupAvatar: row.groupAvatar,
      lastMessage: row.lastMessage || undefined,
      unreadCount: parseInt(row.unreadCount) || 0,
      memberCount: parseInt(row.memberCount) || 0,
    }));

    return NextResponse.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('Error fetching group conversations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch group conversations',
      },
      { status: 500 }
    );
  }
}
