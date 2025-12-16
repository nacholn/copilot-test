import { NextRequest, NextResponse } from 'next/server';
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/lib/notifications';
import type { ApiResponse } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET notifications for a user
 * Query params:
 * - userId (required): User ID to get notifications for
 * - limit (optional): Number of notifications to return (default: 50)
 * - offset (optional): Offset for pagination (default: 0)
 * - unreadOnly (optional): Only return unread notifications (default: false)
 * - countOnly (optional): Only return unread count (default: false)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const countOnly = searchParams.get('countOnly') === 'true';

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // If only count is requested
    if (countOnly) {
      const count = await getUnreadNotificationCount(userId);
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: { count },
        },
        { status: 200 }
      );
    }

    // Get notifications
    const notifications = await getUserNotifications(userId, limit, offset, unreadOnly);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: notifications,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Get notifications error:', error);
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
 * PATCH mark notification(s) as read
 * Query params:
 * - userId (required): User ID
 * - notificationId (optional): Specific notification to mark as read
 * - markAll (optional): Mark all notifications as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const notificationId = searchParams.get('notificationId');
    const markAll = searchParams.get('markAll') === 'true';

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    if (markAll) {
      // Mark all as read
      const count = await markAllNotificationsAsRead(userId);
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: { count },
        },
        { status: 200 }
      );
    } else if (notificationId) {
      // Mark specific notification as read
      const success = await markNotificationAsRead(notificationId, userId);
      if (!success) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Notification not found or already read',
          },
          { status: 404 }
        );
      }
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: { notificationId },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Either notificationId or markAll must be provided',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[API] Mark notification as read error:', error);
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
 * DELETE a notification
 * Query params:
 * - userId (required): User ID
 * - notificationId (required): Notification to delete
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const notificationId = searchParams.get('notificationId');

    if (!userId || !notificationId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID and Notification ID are required',
        },
        { status: 400 }
      );
    }

    const success = await deleteNotification(notificationId, userId);
    if (!success) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Notification not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { notificationId },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[API] Delete notification error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
