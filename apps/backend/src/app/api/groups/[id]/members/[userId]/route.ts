import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import type { ApiResponse } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// DELETE remove a member from a group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id: groupId, userId } = await params;

    if (!groupId || !userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group ID and User ID are required',
        },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 RETURNING id',
      [groupId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Member not found in this group',
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
    console.error('Remove group member error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
