import { query } from './db';
import type {
  Notification,
  NotificationWithActor,
  CreateNotificationInput,
  NotificationType,
} from '@cyclists/config';
import { sendWebPushNotificationToUser } from './web-push-notifications';

/**
 * Create a new notification
 */
export async function createNotification(
  input: CreateNotificationInput
): Promise<Notification | null> {
  try {
    const result = await query(
      `INSERT INTO notifications 
       (user_id, type, title, message, actor_id, related_id, related_type, action_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        input.userId,
        input.type,
        input.title,
        input.message,
        input.actorId || null,
        input.relatedId || null,
        input.relatedType || null,
        input.actionUrl || null,
      ]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const notification = {
      id: row.id,
      userId: row.user_id,
      type: row.type as NotificationType,
      title: row.title,
      message: row.message,
      actorId: row.actor_id,
      relatedId: row.related_id,
      relatedType: row.related_type,
      isRead: row.is_read,
      readAt: row.read_at ? new Date(row.read_at) : undefined,
      actionUrl: row.action_url,
      createdAt: new Date(row.created_at),
    };

    // Send web push notification asynchronously
    sendWebPushNotificationToUser(input.userId, {
      title: input.title,
      body: input.message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: {
        url: input.actionUrl || '/notifications',
        type: input.type,
      },
      tag: input.type,
    }).catch((err) => {
      console.error('[Notifications] Failed to send web push:', err);
    });

    return notification;
  } catch (error) {
    console.error('[Notifications] Create error:', error);
    return null;
  }
}

/**
 * Get notifications for a user with actor information
 */
export async function getUserNotifications(
  userId: string,
  limit: number = 50,
  offset: number = 0,
  unreadOnly: boolean = false
): Promise<NotificationWithActor[]> {
  try {
    const whereClause = unreadOnly
      ? 'WHERE n.user_id = $1 AND n.is_read = false'
      : 'WHERE n.user_id = $1';

    const result = await query(
      `SELECT 
         n.*,
         p.name as actor_name,
         p.avatar as actor_avatar
       FROM notifications n
       LEFT JOIN profiles p ON n.actor_id = p.user_id
       ${whereClause}
       ORDER BY n.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type as NotificationType,
      title: row.title,
      message: row.message,
      actorId: row.actor_id,
      actorName: row.actor_name,
      actorAvatar: row.actor_avatar,
      relatedId: row.related_id,
      relatedType: row.related_type,
      isRead: row.is_read,
      readAt: row.read_at ? new Date(row.read_at) : undefined,
      actionUrl: row.action_url,
      createdAt: new Date(row.created_at),
    }));
  } catch (error) {
    console.error('[Notifications] Get user notifications error:', error);
    return [];
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const result = await query(
      `SELECT COUNT(*) as count
       FROM notifications
       WHERE user_id = $1 AND is_read = false`,
      [userId]
    );

    return parseInt(result.rows[0]?.count || '0');
  } catch (error) {
    console.error('[Notifications] Get unread count error:', error);
    return 0;
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  try {
    const result = await query(
      `UPDATE notifications
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2 AND is_read = false
       RETURNING id`,
      [notificationId, userId]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('[Notifications] Mark as read error:', error);
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<number> {
  try {
    const result = await query(
      `UPDATE notifications
       SET is_read = true, read_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND is_read = false
       RETURNING id`,
      [userId]
    );

    return result.rows.length;
  } catch (error) {
    console.error('[Notifications] Mark all as read error:', error);
    return 0;
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string, userId: string): Promise<boolean> {
  try {
    const result = await query(
      `DELETE FROM notifications
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [notificationId, userId]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('[Notifications] Delete error:', error);
    return false;
  }
}
