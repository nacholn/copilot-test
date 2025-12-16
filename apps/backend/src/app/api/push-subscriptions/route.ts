import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';

/**
 * POST /api/push-subscriptions
 * Subscribe to push notifications
 * 
 * TODO: Add authentication middleware to verify that the authenticated user
 * matches the userId being subscribed. This prevents users from subscribing
 * push notifications for other users.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, subscription } = body;

    if (!userId || !subscription) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or subscription' },
        { status: 400 }
      );
    }

    const { endpoint, keys } = subscription;
    
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { success: false, error: 'Invalid subscription format' },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const existingResult = await query(
      'SELECT id FROM push_subscriptions WHERE endpoint = $1',
      [endpoint]
    );

    if (existingResult.rows.length > 0) {
      // Update existing subscription
      await query(
        'UPDATE push_subscriptions SET user_id = $1, p256dh = $2, auth = $3, updated_at = CURRENT_TIMESTAMP WHERE endpoint = $4',
        [userId, keys.p256dh, keys.auth, endpoint]
      );
    } else {
      // Insert new subscription
      await query(
        'INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth) VALUES ($1, $2, $3, $4)',
        [userId, endpoint, keys.p256dh, keys.auth]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/push-subscriptions
 * Unsubscribe from push notifications
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: 'Missing endpoint' },
        { status: 400 }
      );
    }

    await query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting push subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete subscription' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/push-subscriptions
 * Get user's push subscriptions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Missing userId' },
        { status: 400 }
      );
    }

    const result = await query(
      'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1',
      [userId]
    );

    const subscriptions = result.rows.map(row => ({
      endpoint: row.endpoint,
      keys: {
        p256dh: row.p256dh,
        auth: row.auth,
      },
    }));

    return NextResponse.json({ success: true, data: subscriptions });
  } catch (error) {
    console.error('Error fetching push subscriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}
