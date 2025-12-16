import webPush from 'web-push';
import { query } from './db';

// Configure web-push with VAPID details
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@cyclists.com';

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} else {
  console.warn('VAPID keys not configured. Web push notifications will not work.');
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    url?: string;
    [key: string]: any;
  };
  tag?: string;
}

/**
 * Send push notification to a user's device
 */
export async function sendWebPushNotification(
  subscription: PushSubscription,
  payload: PushNotificationPayload
): Promise<void> {
  try {
    const pushPayload = JSON.stringify(payload);

    await webPush.sendNotification(subscription, pushPayload, {
      TTL: 86400, // 24 hours
    });

    console.log('Push notification sent successfully');
  } catch (error) {
    console.error('Error sending push notification:', error);

    // Handle subscription expiration - check if error has statusCode property
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 410 || statusCode === 404) {
        console.log('Subscription expired or not found, removing from database');
        // Remove expired subscription
        try {
          await query('DELETE FROM push_subscriptions WHERE endpoint = $1', [
            subscription.endpoint,
          ]);
        } catch (dbError) {
          console.error('Error removing expired subscription:', dbError);
        }
      }
    }

    throw error;
  }
}

/**
 * Send push notification to multiple subscriptions
 */
export async function sendWebPushNotificationToMany(
  subscriptions: PushSubscription[],
  payload: PushNotificationPayload
): Promise<void> {
  const promises = subscriptions.map((subscription) =>
    sendWebPushNotification(subscription, payload).catch((err) => {
      console.error('Failed to send to subscription:', err);
    })
  );

  await Promise.all(promises);
}

/**
 * Send push notification to all of a user's devices
 */
export async function sendWebPushNotificationToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<void> {
  try {
    // Get user's push subscriptions from database
    const result = await query(
      'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      console.log('No push subscriptions found for user:', userId);
      return;
    }

    const subscriptions: PushSubscription[] = result.rows.map((row) => ({
      endpoint: row.endpoint,
      keys: {
        p256dh: row.p256dh,
        auth: row.auth,
      },
    }));

    await sendWebPushNotificationToMany(subscriptions, payload);
  } catch (error) {
    console.error('Error sending push notification to user:', error);
    throw error;
  }
}

export { webPush };
