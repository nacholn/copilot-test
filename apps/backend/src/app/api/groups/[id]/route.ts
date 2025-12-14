import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { deleteImage } from '@/lib/cloudinary';
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
      slug: result.rows[0].slug,
      metaDescription: result.rows[0].meta_description,
      keywords: result.rows[0].keywords,
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
      body.slug === undefined &&
      body.metaDescription === undefined &&
      body.keywords === undefined &&
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

    // If slug is being updated, check for uniqueness
    if (body.slug !== undefined) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (body.slug && !slugRegex.test(body.slug)) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Slug must contain only lowercase letters, numbers, and hyphens',
          },
          { status: 400 }
        );
      }

      if (body.slug) {
        const existingSlug = await query('SELECT id FROM groups WHERE slug = $1 AND id != $2', [
          body.slug,
          id,
        ]);

        if (existingSlug.rows.length > 0) {
          return NextResponse.json<ApiResponse>(
            {
              success: false,
              error: 'A group with this slug already exists. Please choose a different slug.',
            },
            { status: 409 }
          );
        }
      }
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

    if (body.slug !== undefined) {
      updateFields.push(`slug = $${paramCount}`);
      values.push(body.slug);
      paramCount++;
    }

    if (body.metaDescription !== undefined) {
      updateFields.push(`meta_description = $${paramCount}`);
      values.push(body.metaDescription);
      paramCount++;
    }

    if (body.keywords !== undefined) {
      updateFields.push(`keywords = $${paramCount}`);
      values.push(body.keywords);
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
       RETURNING id, name, description, type, slug, meta_description, keywords, main_image, main_image_public_id, city, latitude, longitude, created_at, updated_at`,
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
      slug: result.rows[0].slug,
      metaDescription: result.rows[0].meta_description,
      keywords: result.rows[0].keywords,
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
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Get group data including main image
    const groupResult = await query('SELECT main_image_public_id FROM groups WHERE id = $1', [id]);

    if (groupResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group not found',
        },
        { status: 404 }
      );
    }

    // Get all images for this group to delete from Cloudinary
    const imagesResult = await query(
      'SELECT cloudinary_public_id FROM group_images WHERE group_id = $1',
      [id]
    );

    // Delete the group (cascade will handle group_images, group_members, etc.)
    const result = await query('DELETE FROM groups WHERE id = $1 RETURNING id', [id]);

    // Delete main image from Cloudinary if it exists
    const mainImagePublicId = groupResult.rows[0].main_image_public_id;
    if (mainImagePublicId) {
      try {
        await deleteImage(mainImagePublicId);
      } catch (error) {
        console.error(`Error deleting main image ${mainImagePublicId} from Cloudinary:`, error);
      }
    }

    // Delete all gallery images from Cloudinary
    for (const row of imagesResult.rows) {
      if (row.cloudinary_public_id) {
        try {
          await deleteImage(row.cloudinary_public_id);
        } catch (error) {
          console.error(
            `Error deleting image ${row.cloudinary_public_id} from Cloudinary:`,
            error
          );
          // Continue with other deletions even if one fails
        }
      }
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
