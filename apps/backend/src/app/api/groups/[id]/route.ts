import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse, Group, UpdateGroupInput } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET a single group by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group ID is required',
        },
        { status: 400 }
      );
    }

    const result = await query('SELECT * FROM groups WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group not found',
        },
        { status: 404 }
      );
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
      { status: 200 }
    );
  } catch (error) {
    console.error('Get group error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// PATCH update a group
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group ID is required',
        },
        { status: 400 }
      );
    }

    const body: UpdateGroupInput = await request.json();

    if (
      !body.name &&
      !body.description &&
      body.type === undefined &&
      body.mainImage === undefined &&
      body.city === undefined &&
      body.latitude === undefined &&
      body.longitude === undefined
    ) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'At least one field must be provided to update',
        },
        { status: 400 }
      );
    }

    const updateFields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (body.name !== undefined) {
      updateFields.push(`name = $${paramCount}`);
      values.push(body.name);
      paramCount++;
    }

    if (body.description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      values.push(body.description);
      paramCount++;
    }

    if (body.type !== undefined) {
      updateFields.push(`type = $${paramCount}`);
      values.push(body.type);
      paramCount++;
    }

    if (body.mainImage !== undefined) {
      updateFields.push(`main_image = $${paramCount}`);
      values.push(body.mainImage);
      paramCount++;
    }

    if (body.mainImagePublicId !== undefined) {
      updateFields.push(`main_image_public_id = $${paramCount}`);
      values.push(body.mainImagePublicId);
      paramCount++;
    }

    if (body.city !== undefined) {
      updateFields.push(`city = $${paramCount}`);
      values.push(body.city);
      paramCount++;
    }

    if (body.latitude !== undefined) {
      updateFields.push(`latitude = $${paramCount}`);
      values.push(body.latitude);
      paramCount++;
    }

    if (body.longitude !== undefined) {
      updateFields.push(`longitude = $${paramCount}`);
      values.push(body.longitude);
      paramCount++;
    }

    values.push(id);

    const result = await query(
      `UPDATE groups 
       SET ${updateFields.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING id, name, description, type, main_image, main_image_public_id, city, latitude, longitude, created_at, updated_at`,
      values
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
      { status: 200 }
    );
  } catch (error) {
    console.error('Update group error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// DELETE a group
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group ID is required',
        },
        { status: 400 }
      );
    }

    const result = await query('DELETE FROM groups WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { id: result.rows[0].id },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete group error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
