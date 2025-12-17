import type { Notification } from '@bicicita/config';

/**
 * Get the global Socket.IO instance
 * This is set by the custom server.js
 */
function getIO(): any {
  if (typeof global !== 'undefined' && (global as any).io) {
    return (global as any).io;
  }
  console.warn('[WebSocket] Socket.IO instance not available');
  return null;
}

/**
 * Emit a notification to a specific user via WebSocket
 */
export function emitNotification(userId: string, notification: Notification): void {
  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit('new_notification', notification);
    console.log(`[WebSocket] Notification emitted to user ${userId}`);
  }
}

/**
 * Emit a new message notification to a user via WebSocket
 */
export function emitMessage(
  receiverId: string,
  messageData: {
    id: string;
    senderId: string;
    message: string;
    createdAt: Date;
  }
): void {
  const io = getIO();
  if (io) {
    io.to(`user:${receiverId}`).emit('new_message', messageData);
    console.log(`[WebSocket] Message emitted to user ${receiverId}`);
  }
}

/**
 * Emit user status change to all friends
 */
export function emitUserStatusChange(userId: string, status: 'online' | 'offline' | 'away'): void {
  const io = getIO();
  if (io) {
    // The WebSocket server handles broadcasting to friends
    // This is just a fallback if needed
    io.emit('user_status_change', { userId, status });
  }
}
