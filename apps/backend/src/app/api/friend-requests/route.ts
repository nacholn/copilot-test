import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createNotification } from '@/lib/notifications';
import { sendEmail, getFriendRequestEmailTemplate, getFriendRequestAcceptedEmailTemplate } from '@/lib/email';
import type { 
  ApiResponse, 
  SendFriendRequestInput, 
  UpdateFriendRequestInput,
  FriendRequestWithProfile 
} from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET friend requests for a user
 * Query params:
 * - userId (required): User ID to get friend requests for
 * - type (optional): 'received' (default) or 'sent'
 * - status (optional): Filter by status (pending, accepted, rejected)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type') || 'received';
    const status = searchParams.get('status') || 'pending';

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    const userField = type === 'sent' ? 'requester_id' : 'addressee_id';
    const profileJoinField = type === 'sent' ? 'addressee_id' : 'requester_id';

    const result = await query(
      `SELECT 
         fr.*,
         p.name as requester_name,
         p.avatar as requester_avatar,
         p.email as requester_email
       FROM friend_requests fr
       JOIN profiles p ON fr.${profileJoinField} = p.user_id
       WHERE fr.${userField} = $1 AND fr.status = $2
       ORDER BY fr.created_at DESC`,
      [userId, status]
    );

    const friendRequests: FriendRequestWithProfile[] = result.rows.map((row) => ({
      id: row.id,
      requesterId: row.requester_id,
      addresseeId: row.addressee_id,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      requesterName: row.requester_name,
      requesterAvatar: row.requester_avatar,
      requesterEmail: row.requester_email,
    }));

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: friendRequests,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Get friend requests error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST send a friend request
 */
export async function POST(request: NextRequest) {
  try {
    const body: SendFriendRequestInput = await request.json();

    if (!body.requesterId || !body.addresseeId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Requester ID and Addressee ID are required',
        },
        { status: 400 }
      );
    }

    // Prevent self-friend requests
    if (body.requesterId === body.addresseeId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Cannot send friend request to yourself',
        },
        { status: 400 }
      );
    }

    // Check if both users exist
    const userCheck = await query(
      'SELECT user_id, name, email FROM profiles WHERE user_id IN ($1, $2)',
      [body.requesterId, body.addresseeId]
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

    const requester = userCheck.rows.find((u) => u.user_id === body.requesterId);
    const addressee = userCheck.rows.find((u) => u.user_id === body.addresseeId);

    // Check if already friends
    const friendshipCheck = await query(
      'SELECT id FROM friendships WHERE user_id = $1 AND friend_id = $2',
      [body.requesterId, body.addresseeId]
    );

    if (friendshipCheck.rows.length > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Already friends with this user',
        },
        { status: 409 }
      );
    }

    // Check if pending request already exists
    const existingRequest = await query(
      `SELECT id FROM friend_requests 
       WHERE requester_id = $1 AND addressee_id = $2 AND status = 'pending'`,
      [body.requesterId, body.addresseeId]
    );

    if (existingRequest.rows.length > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Friend request already sent',
        },
        { status: 409 }
      );
    }

    // Create the friend request
    const insertResult = await query(
      `INSERT INTO friend_requests (requester_id, addressee_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [body.requesterId, body.addresseeId]
    );

    const friendRequest = insertResult.rows[0];

    // Create notification for the addressee
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await createNotification({
      userId: body.addresseeId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${requester!.name} sent you a friend request`,
      actorId: body.requesterId,
      relatedId: friendRequest.id,
      relatedType: 'friend_request',
      actionUrl: `${appUrl}/friend-requests`,
    });

    // Send email notification
    const emailHtml = getFriendRequestEmailTemplate(
      addressee!.name,
      requester!.name,
      `${appUrl}/friend-requests`
    );

    await sendEmail({
      to: addressee!.email,
      subject: `${requester!.name} sent you a friend request`,
      html: emailHtml,
    });

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          id: friendRequest.id,
          requesterId: friendRequest.requester_id,
          addresseeId: friendRequest.addressee_id,
          status: friendRequest.status,
          createdAt: new Date(friendRequest.created_at),
          updatedAt: new Date(friendRequest.updated_at),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Send friend request error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH update friend request status (accept/reject)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body: UpdateFriendRequestInput = await request.json();

    if (!body.requestId || !body.status) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Request ID and status are required',
        },
        { status: 400 }
      );
    }

    if (!['accepted', 'rejected'].includes(body.status)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Status must be either accepted or rejected',
        },
        { status: 400 }
      );
    }

    // Get the friend request
    const requestResult = await query(
      `SELECT fr.*, 
              req.name as requester_name, req.email as requester_email,
              addr.name as addressee_name, addr.email as addressee_email
       FROM friend_requests fr
       JOIN profiles req ON fr.requester_id = req.user_id
       JOIN profiles addr ON fr.addressee_id = addr.user_id
       WHERE fr.id = $1 AND fr.status = 'pending'`,
      [body.requestId]
    );

    if (requestResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Friend request not found or already processed',
        },
        { status: 404 }
      );
    }

    const friendRequest = requestResult.rows[0];

    // Update the friend request status
    await query(
      `UPDATE friend_requests SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [body.status, body.requestId]
    );

    // If accepted, create bidirectional friendship
    if (body.status === 'accepted') {
      // Create friendship in both directions
      await query(
        `INSERT INTO friendships (user_id, friend_id)
         VALUES ($1, $2), ($2, $1)
         ON CONFLICT DO NOTHING`,
        [friendRequest.requester_id, friendRequest.addressee_id]
      );

      // Create notification for the requester
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      await createNotification({
        userId: friendRequest.requester_id,
        type: 'friend_request_accepted',
        title: 'Friend Request Accepted',
        message: `${friendRequest.addressee_name} accepted your friend request`,
        actorId: friendRequest.addressee_id,
        relatedId: body.requestId,
        relatedType: 'friend_request',
        actionUrl: `${appUrl}/users/${friendRequest.addressee_id}`,
      });

      // Send email notification
      const emailHtml = getFriendRequestAcceptedEmailTemplate(
        friendRequest.requester_name,
        friendRequest.addressee_name,
        `${appUrl}/users/${friendRequest.addressee_id}`
      );

      await sendEmail({
        to: friendRequest.requester_email,
        subject: `${friendRequest.addressee_name} accepted your friend request`,
        html: emailHtml,
      });
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          requestId: body.requestId,
          status: body.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Update friend request error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
