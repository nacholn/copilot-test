'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useWebSocket } from '../../contexts/WebSocketContext';
import { AuthGuard } from '../../components/AuthGuard';
import { Avatar } from '../../components/Avatar';
import styles from './notifications.module.css';

export default function Notifications() {
  const { user } = useAuth();
  const { notifications, unreadNotificationCount, markNotificationAsRead, markAllNotificationsAsRead } = useWebSocket();

  const handleNotificationClick = (notificationId: string, actionUrl?: string) => {
    markNotificationAsRead(notificationId);
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return '👥';
      case 'friend_request_accepted':
        return '✅';
      case 'message':
        return '💬';
      case 'system':
        return '🔔';
      default:
        return '📢';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return new Date(date).toLocaleDateString();
    }
  };

  return (
    <AuthGuard>
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h1 className={styles.title}>Notifications</h1>
            {unreadNotificationCount > 0 && (
              <button onClick={markAllNotificationsAsRead} className={styles.markAllButton}>
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>No notifications yet.</p>
              <p className={styles.emptySubtext}>When someone sends you a friend request or message, you&apos;ll see it here.</p>
              <Link href="/" className={styles.button}>
                Back to Home
              </Link>
            </div>
          ) : (
            <div className={styles.notificationsList}>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${styles.notificationCard} ${!notification.isRead ? styles.unread : ''}`}
                  onClick={() => handleNotificationClick(notification.id, notification.actionUrl)}
                >
                  <div className={styles.notificationIcon}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className={styles.notificationContent}>
                    <h3 className={styles.notificationTitle}>{notification.title}</h3>
                    <p className={styles.notificationMessage}>{notification.message}</p>
                    <span className={styles.notificationTime}>
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  {!notification.isRead && (
                    <div className={styles.unreadDot}></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
