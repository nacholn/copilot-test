import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse, Group, GroupWithMemberCount, CreateGroupInput } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET all groups with member counts
export async function GET() {
  try {
    const result = await query(`
      SELECT 
        g.id,
        g.name,
        g.description,
        g.type,
        g.main_image,
        g.main_image_public_id,
        g.city,
        g.latitude,
        g.longitude,
        g.created_at,
        g.updated_at,
        COUNT(gm.id) as member_count
      FROM groups g
      LEFT JOIN group_members gm ON g.id = gm.group_id
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `);

    const groups: GroupWithMemberCount[] = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      mainImage: row.main_image,
      mainImagePublicId: row.main_image_public_id,
      city: row.city,
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      memberCount: parseInt(row.member_count, 10),
    }));

    return NextResponse.json<ApiResponse<GroupWithMemberCount[]>>(
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

// POST create a new group
export async function POST(request: NextRequest) {
  try {
    const body: CreateGroupInput = await request.json();

    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group name is required',
        },
        { status: 400 }
      );
    }

    if (!body.type) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group type is required',
        },
        { status: 400 }
      );
    }

    // Validate location-based groups must have city
    if (body.type === 'location' && !body.city) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Location-based groups must have a city',
        },
        { status: 400 }
      );
    }

    // Check if group with same name already exists
    const existingGroup = await query('SELECT id FROM groups WHERE name = $1', [body.name]);

    if (existingGroup.rows.length > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'A group with this name already exists',
        },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO groups (name, description, type, main_image, main_image_public_id, city, latitude, longitude) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, name, description, type, main_image, main_image_public_id, city, latitude, longitude, created_at, updated_at`,
      [
        body.name,
        body.description || null,
        body.type,
        body.mainImage || null,
        body.mainImagePublicId || null,
        body.city || null,
        body.latitude || null,
        body.longitude || null,
      ]
    );

    // Insert additional images if provided
    if (body.images && body.images.length > 0) {
      for (let i = 0; i < body.images.length; i++) {
        const image = body.images[i];
        await query(
          'INSERT INTO group_images (group_id, image_url, cloudinary_public_id, display_order) VALUES ($1, $2, $3, $4)',
          [result.rows[0].id, image.imageUrl, image.cloudinaryPublicId, i]
        );
      }
    }

    const group: Group = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      description: result.rows[0].description,
      type: result.rows[0].type,
      mainImage: result.rows[0].main_image,
      mainImagePublicId: result.rows[0].main_image_public_id,
      city: result.rows[0].city,
      latitude: result.rows[0].latitude ? parseFloat(result.rows[0].latitude) : undefined,
      longitude: result.rows[0].longitude ? parseFloat(result.rows[0].longitude) : undefined,
      createdAt: new Date(result.rows[0].created_at),
      updatedAt: new Date(result.rows[0].updated_at),
    };

    return NextResponse.json<ApiResponse<Group>>(
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
