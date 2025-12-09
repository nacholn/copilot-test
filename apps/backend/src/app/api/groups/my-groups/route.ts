import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { GroupWithDetails } from '@cyclists/config';

/**
 * GET /api/groups/my-groups?userId=xxx
 * Get groups that the user is a member of
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

    // Get groups the user is a member of
    const result = await db.query(
      `SELECT 
        g.id,
        g.name,
        g.description,
        g.location,
        g.avatar,
        g.created_by as "createdBy",
        g.created_at as "createdAt",
        g.updated_at as "updatedAt",
        COUNT(DISTINCT gm2.id) as "memberCount",
        gm.role = 'admin' as "isAdmin",
        true as "isMember"
      FROM groups g
      JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN group_members gm2 ON g.id = gm2.group_id
      WHERE gm.user_id = $1
      GROUP BY g.id, g.name, g.description, g.location, g.avatar, g.created_by, g.created_at, g.updated_at, gm.role
      ORDER BY g.created_at DESC`,
      [userId]
    );

    // Fetch images for each group
    const groupsWithImages: GroupWithDetails[] = await Promise.all(
      result.rows.map(async (group: any) => {
        const imagesResult = await db.query(
          `SELECT 
            id,
            group_id as "groupId",
            image_url as "imageUrl",
            cloudinary_public_id as "cloudinaryPublicId",
            is_primary as "isPrimary",
            display_order as "displayOrder",
            created_at as "createdAt"
          FROM group_images
          WHERE group_id = $1
          ORDER BY display_order ASC`,
          [group.id]
        );

        return {
          ...group,
          memberCount: parseInt(group.memberCount) || 0,
          isAdmin: group.isAdmin || false,
          isMember: true,
          images: imagesResult.rows,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: groupsWithImages,
    });
  } catch (error) {
    console.error('Error fetching user groups:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch user groups',
      },
      { status: 500 }
    );
  }
}
