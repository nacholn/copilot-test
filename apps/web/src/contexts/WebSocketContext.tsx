'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import type { Notification, Message } from '@cyclists/config';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
  notifications: Notification[];
  unreadNotificationCount: number;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  onNewMessage: (callback: (message: any) => void) => void;
  offNewMessage: (callback: (message: any) => void) => void;
  sendTypingIndicator: (receiverId: string, isTyping: boolean) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [messageCallbacks] = useState<Set<(message: any) => void>>(() => new Set());

  // Initialize socket connection
  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const newSocket = io(backendUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);
      // Register user with server
      newSocket.emit('register', user.id);
    });

    newSocket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      setIsConnected(false);
    });

    // Handle new notification
    newSocket.on('new_notification', (notification: Notification) => {
      console.log('[WebSocket] New notification received:', notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadNotificationCount((prev) => prev + 1);
      
      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: notification.type || 'notification',
          requireInteraction: false,
        } as NotificationOptions);

        // When notification is clicked, navigate to notifications page
        browserNotification.onclick = () => {
          window.focus();
          window.location.href = notification.actionUrl || '/notifications';
          browserNotification.close();
        };
      }
    });

    // Handle new message
    newSocket.on('new_message', (message: any) => {
      console.log('[WebSocket] New message received:', message);
      // Call all registered callbacks - Set.forEach is more efficient
      messageCallbacks.forEach((callback) => callback(message));
      
      // Show browser notification for new messages if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        const senderName = message.senderName || message.sender?.name || 'Someone';
        const messagePreview = message.content?.substring(0, 50) || 'New message';
        
        const browserNotification = new Notification(`New message from ${senderName}`, {
          body: messagePreview + (message.content?.length > 50 ? '...' : ''),
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: 'new-message',
          requireInteraction: false,
        } as NotificationOptions);

        // When notification is clicked, navigate to chat or notifications
        browserNotification.onclick = () => {
          window.focus();
          // Try to navigate to the specific chat, fallback to notifications
          const chatUrl = message.senderId ? `/chat?userId=${message.senderId}` : '/notifications';
          window.location.href = chatUrl;
          browserNotification.close();
        };
      }
    });

    // Handle user status changes
    newSocket.on('user_status_change', ({ userId, status }: { userId: string; status: string }) => {
      console.log(`[WebSocket] User ${userId} is now ${status}`);
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        if (status === 'online') {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });

    setSocket(newSocket);

    // Heartbeat to keep connection alive and update last_seen
    const heartbeatInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit('heartbeat');
      }
    }, 30000); // Every 30 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(heartbeatInterval);
      newSocket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fetch initial notifications
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      // Configurable notification limit
      const NOTIFICATION_LIMIT = 20;
      // Use URLSearchParams for safe URL encoding
      const params = new URLSearchParams({
        userId: user.id,
        limit: NOTIFICATION_LIMIT.toString(),
      });
      const response = await fetch(`/api/notifications?${params}`);
      const data = await response.json();
      if (data.success) {
        setNotifications(data.data);
        // Count unread
        const unreadCount = data.data.filter((n: Notification) => !n.isRead).length;
        setUnreadNotificationCount(unreadCount);
      }
    } catch (error) {
      console.error('[WebSocket] Error fetching notifications:', error);
    }
  };

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadNotificationCount((prev) => prev + 1);
    }
  }, []);

  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      if (!user) return;

      try {
        const response = await fetch(
          `/api/notifications?userId=${user.id}&notificationId=${notificationId}`,
          { method: 'PATCH' }
        );

        if (response.ok) {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notificationId ? { ...n, isRead: true, readAt: new Date() } : n
            )
          );
          setUnreadNotificationCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error('[WebSocket] Error marking notification as read:', error);
      }
    },
    [user]
  );

  const markAllNotificationsAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/notifications?userId=${user.id}&markAll=true`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true, readAt: new Date() }))
        );
        setUnreadNotificationCount(0);
      }
    } catch (error) {
      console.error('[WebSocket] Error marking all notifications as read:', error);
    }
  }, [user]);

  const onNewMessage = useCallback((callback: (message: any) => void) => {
    messageCallbacks.add(callback);
  }, [messageCallbacks]);

  const offNewMessage = useCallback((callback: (message: any) => void) => {
    messageCallbacks.delete(callback);
  }, [messageCallbacks]);

  const sendTypingIndicator = useCallback(
    (receiverId: string, isTyping: boolean) => {
      if (socket && isConnected) {
        if (isTyping) {
          socket.emit('typing_start', { receiverId });
        } else {
          socket.emit('typing_stop', { receiverId });
        }
      }
    },
    [socket, isConnected]
  );

  const value: WebSocketContextType = {
    socket,
    isConnected,
    onlineUsers,
    notifications,
    unreadNotificationCount,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    onNewMessage,
    offNewMessage,
    sendTypingIndicator,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
}

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
}
