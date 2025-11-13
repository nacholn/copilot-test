import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { transformProfile, transformFriendship } from '@/lib/utils';
import type { ApiResponse, AddFriendInput } from '@cyclists/config';

// GET user's friends
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Get all friends for the user with their profile information
    const sqlQuery = `
      SELECT 
        f.id as friendship_id,
        p.*
      FROM friendships f
      JOIN profiles p ON f.friend_id = p.user_id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `;

    const result = await query(sqlQuery, [userId]);
    
    const friends = result.rows.map((row) => ({
      ...transformProfile(row),
      friendshipId: row.friendship_id,
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: friends,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get friends error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST add a friend
export async function POST(request: NextRequest) {
  try {
    const body: AddFriendInput = await request.json();

    if (!body.userId || !body.friendId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID and Friend ID are required',
        },
        { status: 400 }
      );
    }

    // Prevent adding self as friend
    if (body.userId === body.friendId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Cannot add yourself as a friend',
        },
        { status: 400 }
      );
    }

    // Check if both users exist
    const userCheck = await query(
      'SELECT user_id FROM profiles WHERE user_id IN ($1, $2)',
      [body.userId, body.friendId]
    );

    if (userCheck.rows.length !== 2) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'One or both users not found',
        },
        { status: 404 }
      );
    }

    // Check if friendship already exists
    const existingFriendship = await query(
      'SELECT id FROM friendships WHERE user_id = $1 AND friend_id = $2',
      [body.userId, body.friendId]
    );

    if (existingFriendship.rows.length > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Friendship already exists',
        },
        { status: 409 }
      );
    }

    // Create the friendship
    const insertQuery = `
      INSERT INTO friendships (user_id, friend_id)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await query(insertQuery, [body.userId, body.friendId]);
    const friendship = transformFriendship(result.rows[0]);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: friendship,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Add friend error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// DELETE remove a friend
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const friendshipId = searchParams.get('friendshipId');

    if (!friendshipId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Friendship ID is required',
        },
        { status: 400 }
      );
    }

    const deleteQuery = 'DELETE FROM friendships WHERE id = $1 RETURNING *';
    const result = await query(deleteQuery, [friendshipId]);

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Friendship not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: 'Friendship removed successfully' },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Remove friend error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
