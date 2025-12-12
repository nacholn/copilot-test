import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateUniqueSlug } from '@/lib/slug';
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
        g.slug,
        g.meta_description,
        g.keywords,
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
      slug: row.slug,
      metaDescription: row.meta_description,
      keywords: row.keywords,
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

    // Create group first to get ID for slug generation
    const result = await query(
      `INSERT INTO groups (name, description, type, main_image, main_image_public_id, city, latitude, longitude) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
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

    const groupId = result.rows[0].id;

    // Generate and update slug
    const slug = generateUniqueSlug(body.name, groupId);
    await query(`UPDATE groups SET slug = $1, meta_description = $2, keywords = $3 WHERE id = $4`, [
      slug,
      body.metaDescription,
      body.keywords,
      groupId,
    ]);

    // Insert additional images if provided
    if (body.images && body.images.length > 0) {
      for (let i = 0; i < body.images.length; i++) {
        const image = body.images[i];
        await query(
          'INSERT INTO group_images (group_id, image_url, cloudinary_public_id, display_order) VALUES ($1, $2, $3, $4)',
          [groupId, image.imageUrl, image.cloudinaryPublicId, i]
        );
      }
    }

    const row = result.rows[0];
    const group: Group = {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      slug: slug,
      metaDescription: body.metaDescription,
      keywords: body.keywords,
      mainImage: row.main_image,
      mainImagePublicId: row.main_image_public_id,
      city: row.city,
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
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
