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
      `INSERT INTO groups (name, description) 
       VALUES ($1, $2) 
       RETURNING id, name, description, created_at, updated_at`,
      [body.name, body.description || null]
    );

    const group: Group = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      description: result.rows[0].description,
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
