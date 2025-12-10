import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse, GroupWithDetails } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET user's groups (groups they are a member of)
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

    // Get all groups the user is a member of with details
    const result = await query(
      `SELECT 
        g.id, g.name, g.description, g.type, g.city, 
        g.latitude, g.longitude, g.main_image, g.cloudinary_public_id,
        g.created_by, g.created_at, g.updated_at,
        COUNT(DISTINCT gm.id) as member_count,
        p.name as creator_name,
        p.avatar as creator_avatar,
        gm_user.joined_at,
        (
          SELECT COUNT(*)
          FROM group_messages gm2
          WHERE gm2.group_id = g.id
          AND gm2.sender_id != $1
          AND NOT EXISTS (
            SELECT 1 FROM group_message_reads gmr
            WHERE gmr.message_id = gm2.id AND gmr.user_id = $1
          )
        ) as unread_count,
        (
          SELECT json_build_object(
            'id', gm_last.id,
            'groupId', gm_last.group_id,
            'senderId', gm_last.sender_id,
            'message', gm_last.message,
            'createdAt', gm_last.created_at
          )
          FROM group_messages gm_last
          WHERE gm_last.group_id = g.id
          ORDER BY gm_last.created_at DESC
          LIMIT 1
        ) as last_message
      FROM group_members gm_user
      JOIN groups g ON gm_user.group_id = g.id
      LEFT JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN profiles p ON g.created_by = p.user_id
      WHERE gm_user.user_id = $1
      GROUP BY g.id, p.name, p.avatar, gm_user.joined_at
      ORDER BY g.updated_at DESC`,
      [userId]
    );

    const groups: GroupWithDetails[] = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      city: row.city,
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      mainImage: row.main_image,
      cloudinaryPublicId: row.cloudinary_public_id,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      memberCount: parseInt(row.member_count),
      creatorName: row.creator_name,
      creatorAvatar: row.creator_avatar,
      isMember: true,
      unreadCount: parseInt(row.unread_count) || 0,
      lastMessage: row.last_message ? {
        id: row.last_message.id,
        groupId: row.last_message.groupId,
        senderId: row.last_message.senderId,
        message: row.last_message.message,
        createdAt: new Date(row.last_message.createdAt),
      } : undefined,
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: groups,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get my groups error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
