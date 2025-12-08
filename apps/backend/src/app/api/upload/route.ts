import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, deleteImage } from '@/lib/cloudinary';
import type { ApiResponse } from '@cyclists/config';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string;

    if (!file) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'No file provided',
        },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'File must be an image',
        },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'File size must be less than 10MB',
        },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const result = await uploadImage(buffer, folder || 'cyclists/uploads');

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Upload failed',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Public ID is required',
        },
        { status: 400 }
      );
    }

    await deleteImage(publicId);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: 'Image deleted successfully' },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Delete failed',
      },
      { status: 500 }
    );
  }
}
