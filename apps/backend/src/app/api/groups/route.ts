import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse, Group, GroupWithDetails, CreateGroupInput, UpdateGroupInput, GroupSearchParams } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET groups (search/filter)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryText = searchParams.get('query');
    const type = searchParams.get('type') as GroupSearchParams['type'];
    const city = searchParams.get('city');
    const userId = searchParams.get('userId'); // To check membership status

    let sql = `
      SELECT 
        g.id, g.name, g.description, g.type, g.city, 
        g.latitude, g.longitude, g.main_image, g.cloudinary_public_id,
        g.created_by, g.created_at, g.updated_at,
        COUNT(DISTINCT gm.id) as member_count,
        p.name as creator_name,
        p.avatar as creator_avatar
    `;

    // If userId is provided, check if user is a member
    if (userId) {
      sql += `,
        CASE WHEN ugm.user_id IS NOT NULL THEN true ELSE false END as is_member
      `;
    }

    sql += `
      FROM groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id
      LEFT JOIN profiles p ON g.created_by = p.user_id
    `;

    if (userId) {
      sql += `
        LEFT JOIN group_members ugm ON g.id = ugm.group_id AND ugm.user_id = $1
      `;
    }

    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = userId ? 2 : 1;

    if (queryText) {
      conditions.push(`(g.name ILIKE $${paramIndex} OR g.description ILIKE $${paramIndex})`);
      params.push(`%${queryText}%`);
      paramIndex++;
    }

    if (type) {
      conditions.push(`g.type = $${paramIndex}`);
      params.push(type);
      paramIndex++;
    }

    if (city) {
      conditions.push(`g.city ILIKE $${paramIndex}`);
      params.push(`%${city}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += `
      GROUP BY g.id, p.name, p.avatar
    `;

    if (userId) {
      sql += `, ugm.user_id`;
    }

    sql += ` ORDER BY g.created_at DESC`;

    const finalParams = userId ? [userId, ...params] : params;
    const result = await query(sql, finalParams);

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
      isMember: row.is_member || false,
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: groups,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get groups error:', error);
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
 * POST create a new group
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateGroupInput = await request.json();

    if (!body.name || !body.type || !body.createdBy) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Name, type, and creator are required',
        },
        { status: 400 }
      );
    }

    // Validate type
    if (!['location', 'general'].includes(body.type)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Type must be "location" or "general"',
        },
        { status: 400 }
      );
    }

    // If type is location, city is required
    if (body.type === 'location' && !body.city) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'City is required for location-based groups',
        },
        { status: 400 }
      );
    }

    // Verify user exists
    const userResult = await query(
      'SELECT user_id FROM profiles WHERE user_id = $1',
      [body.createdBy]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Create group
    const result = await query(
      `INSERT INTO groups (name, description, type, city, latitude, longitude, main_image, cloudinary_public_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        body.name,
        body.description || null,
        body.type,
        body.city || null,
        body.latitude || null,
        body.longitude || null,
        body.mainImage || null,
        body.cloudinaryPublicId || null,
        body.createdBy,
      ]
    );

    const groupRow = result.rows[0];

    // Automatically add creator as a member
    await query(
      'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
      [groupRow.id, body.createdBy]
    );

    const group: Group = {
      id: groupRow.id,
      name: groupRow.name,
      description: groupRow.description,
      type: groupRow.type,
      city: groupRow.city,
      latitude: groupRow.latitude ? parseFloat(groupRow.latitude) : undefined,
      longitude: groupRow.longitude ? parseFloat(groupRow.longitude) : undefined,
      mainImage: groupRow.main_image,
      cloudinaryPublicId: groupRow.cloudinary_public_id,
      createdBy: groupRow.created_by,
      createdAt: new Date(groupRow.created_at),
      updatedAt: new Date(groupRow.updated_at),
    };

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: group,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
