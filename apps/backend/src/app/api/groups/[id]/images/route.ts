import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse, GroupImage } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// GET all images for a group
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

    const result = await query(
      'SELECT * FROM group_images WHERE group_id = $1 ORDER BY display_order ASC',
      [id]
    );

    const images: GroupImage[] = result.rows.map((row) => ({
      id: row.id,
      groupId: row.group_id,
      imageUrl: row.image_url,
      cloudinaryPublicId: row.cloudinary_public_id,
      displayOrder: row.display_order,
      createdAt: new Date(row.created_at),
    }));

    return NextResponse.json<ApiResponse<GroupImage[]>>(
      {
        success: true,
        data: images,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get group images error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST add an image to a group
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: groupId } = await params;

    if (!groupId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group ID is required',
        },
        { status: 400 }
      );
    }

    const body: { imageUrl: string; cloudinaryPublicId: string } = await request.json();

    if (!body.imageUrl || !body.cloudinaryPublicId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Image URL and Cloudinary public ID are required',
        },
        { status: 400 }
      );
    }

    // Get the next display order
    const orderResult = await query(
      'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM group_images WHERE group_id = $1',
      [groupId]
    );

    const nextOrder = orderResult.rows[0].next_order;

    const result = await query(
      'INSERT INTO group_images (group_id, image_url, cloudinary_public_id, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [groupId, body.imageUrl, body.cloudinaryPublicId, nextOrder]
    );

    const image: GroupImage = {
      id: result.rows[0].id,
      groupId: result.rows[0].group_id,
      imageUrl: result.rows[0].image_url,
      cloudinaryPublicId: result.rows[0].cloudinary_public_id,
      displayOrder: result.rows[0].display_order,
      createdAt: new Date(result.rows[0].created_at),
    };

    return NextResponse.json<ApiResponse<GroupImage>>(
      {
        success: true,
        data: image,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add group image error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// DELETE remove an image from a group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await params;
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');

    if (!groupId || !imageId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group ID and Image ID are required',
        },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM group_images WHERE id = $1 AND group_id = $2 RETURNING id',
      [imageId, groupId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Image not found',
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
    console.error('Delete group image error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
