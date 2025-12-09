import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Group, CreateGroupInput, GroupWithDetails, ApiResponse } from '@cyclists/config';

/**
 * GET /api/groups
 * Get all groups or filter by location
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const userId = searchParams.get('userId');
    const query = searchParams.get('query');

    let sqlQuery = `
      SELECT 
        g.id,
        g.name,
        g.description,
        g.location,
        g.avatar,
        g.created_by as "createdBy",
        g.created_at as "createdAt",
        g.updated_at as "updatedAt",
        COUNT(DISTINCT gm.id) as "memberCount",
        CASE WHEN SUM(CASE WHEN gm.user_id = $1 AND gm.role = 'admin' THEN 1 ELSE 0 END) > 0 
          THEN true ELSE false END as "isAdmin",
        CASE WHEN SUM(CASE WHEN gm.user_id = $1 THEN 1 ELSE 0 END) > 0 
          THEN true ELSE false END as "isMember"
      FROM groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id
    `;

    const params: any[] = [userId || ''];
    const conditions: string[] = [];

    if (location) {
      conditions.push(`g.location = $${params.length + 1}`);
      params.push(location);
    }

    if (query) {
      conditions.push(`(g.name ILIKE $${params.length + 1} OR g.description ILIKE $${params.length + 1})`);
      params.push(`%${query}%`);
    }

    if (conditions.length > 0) {
      sqlQuery += ' WHERE ' + conditions.join(' AND ');
    }

    sqlQuery += `
      GROUP BY g.id, g.name, g.description, g.location, g.avatar, g.created_by, g.created_at, g.updated_at
      ORDER BY g.created_at DESC
    `;

    const result = await db.query(sqlQuery, params);

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
          isMember: group.isMember || false,
          images: imagesResult.rows,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: groupsWithImages,
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch groups',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/groups
 * Create a new group
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateGroupInput = await request.json();
    const { name, description, location, createdBy, images } = body;

    if (!name || !createdBy) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and createdBy are required',
        },
        { status: 400 }
      );
    }

    // Create the group
    const groupResult = await db.query(
      `INSERT INTO groups (name, description, location, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING 
         id,
         name,
         description,
         location,
         avatar,
         created_by as "createdBy",
         created_at as "createdAt",
         updated_at as "updatedAt"`,
      [name, description || null, location || 'general', createdBy]
    );

    const group: Group = groupResult.rows[0];

    // Add creator as admin member
    await db.query(
      `INSERT INTO group_members (group_id, user_id, role)
       VALUES ($1, $2, 'admin')`,
      [group.id, createdBy]
    );

    // Add images if provided
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        await db.query(
          `INSERT INTO group_images (group_id, image_url, cloudinary_public_id, is_primary, display_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [group.id, image.imageUrl, image.cloudinaryPublicId, i === 0, i]
        );
      }

      // Update group avatar to first image
      if (images[0]) {
        await db.query(
          `UPDATE groups SET avatar = $1 WHERE id = $2`,
          [images[0].imageUrl, group.id]
        );
        group.avatar = images[0].imageUrl;
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: group,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create group',
      },
      { status: 500 }
    );
  }
}
