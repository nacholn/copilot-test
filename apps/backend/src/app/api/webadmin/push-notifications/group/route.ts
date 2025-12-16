import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendWebPushNotificationToMany } from '@/lib/web-push-notifications';
import type { ApiResponse } from '@cyclists/config';
import type { PushSubscription } from '@/lib/web-push-notifications';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

interface SendGroupPushNotificationRequest {
  groupId: string;
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
 * POST /api/webadmin/push-notifications/group
 * Send push notification to all members of a group
 */
export async function POST(request: NextRequest) {
  try {
    const body: SendGroupPushNotificationRequest = await request.json();
    const { groupId, notification } = body;

    if (!groupId) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Group ID is required',
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

    // Get all user IDs in the group
    const membersResult = await query(
      'SELECT user_id FROM group_members WHERE group_id = $1',
      [groupId]
    );

    if (membersResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'No members found in this group',
        },
        { status: 404 }
      );
    }

    const userIds = membersResult.rows.map((row) => row.user_id);

    // Get all push subscriptions for these users
    const subscriptionsResult = await query(
      'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ANY($1)',
      [userIds]
    );

    if (subscriptionsResult.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: { 
            message: 'No push subscriptions found for group members',
            memberCount: userIds.length,
            subscriptionCount: 0
          },
        },
        { status: 200 }
      );
    }

    const subscriptions: PushSubscription[] = subscriptionsResult.rows.map((row) => ({
      endpoint: row.endpoint,
      keys: {
        p256dh: row.p256dh,
        auth: row.auth,
      },
    }));

    // Send push notification to all subscriptions
    await sendWebPushNotificationToMany(subscriptions, notification);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { 
          message: 'Notifications sent successfully',
          memberCount: userIds.length,
          subscriptionCount: subscriptions.length
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WebAdmin] Send group push notification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: `Failed to send notification: ${errorMessage}`,
      },
      { status: 500 }
    );
  }
}
