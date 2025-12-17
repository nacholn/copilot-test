import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse, GroupWithMemberCount } from '@bicicita/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET public groups (no authentication required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const orderBy = searchParams.get('orderBy') || 'created_at'; // 'created_at' or 'member_count'

    // Validate orderBy parameter to prevent SQL injection
    const validOrderBy = ['created_at', 'member_count'];
    const safeOrderBy = validOrderBy.includes(orderBy) ? orderBy : 'created_at';

    let orderClause = 'g.created_at DESC';
    if (safeOrderBy === 'member_count') {
      orderClause = 'member_count DESC, g.created_at DESC';
    }
    const result = await query(
      `
      SELECT 
        g.id,
        g.name,
        g.description,
        COALESCE(g.type, 'general') as type,
        COALESCE(g.slug, '') as slug,
        COALESCE(g.meta_description, '') as meta_description,
        COALESCE(g.keywords, '') as keywords,
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
      ORDER BY ${orderClause}      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    console.log('[Groups] Public groups query returned', result.rows.length, 'rows');

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
    console.error('Get public groups error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to fetch groups',
      },
      { status: 500 }
    );
  }
}
