import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse, GroupWithMemberCount, GroupImage } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET group by slug (public access)
export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Slug is required',
        },
        { status: 400 }
      );
    }

    // Get group by slug with member count
    const result = await query(
      `
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
      WHERE g.slug = $1
      GROUP BY g.id
      `,
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group not found',
        },
        { status: 404 }
      );
    }

    const row = result.rows[0];

    // Get group images
    const imagesResult = await query(
      `SELECT id, group_id, image_url, cloudinary_public_id, display_order, created_at
       FROM group_images
       WHERE group_id = $1
       ORDER BY display_order`,
      [row.id]
    );

    const images: GroupImage[] = imagesResult.rows.map((img) => ({
      id: img.id,
      groupId: img.group_id,
      imageUrl: img.image_url,
      cloudinaryPublicId: img.cloudinary_public_id,
      displayOrder: img.display_order,
      createdAt: new Date(img.created_at),
    }));

    const group: GroupWithMemberCount & { images: GroupImage[] } = {
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
      images,
    };

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: group,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get group by slug error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch group',
      },
      { status: 500 }
    );
  }
}
