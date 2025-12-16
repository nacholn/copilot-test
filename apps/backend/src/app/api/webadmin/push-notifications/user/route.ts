import { NextRequest, NextResponse } from 'next/server';
import { sendWebPushNotificationToUser } from '@/lib/web-push-notifications';
import type { ApiResponse } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

interface SendPushNotificationRequest {
  userId: string;
  notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    data?: {
      url?: string;
      [key: string]: any;
    };
    tag?: string;
  };
}

/**
 * POST /api/webadmin/push-notifications/user
 * Send push notification to a specific user
 */
export async function POST(request: NextRequest) {
  try {
    const body: SendPushNotificationRequest = await request.json();
    const { userId, notification } = body;

    if (!userId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    if (!notification || !notification.title || !notification.body) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Notification title and body are required',
        },
        { status: 400 }
      );
    }

    // Send push notification to all user's devices
    await sendWebPushNotificationToUser(userId, notification);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: 'Notification sent successfully' },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WebAdmin] Send push notification error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to send notification',
      },
      { status: 500 }
    );
  }
}
