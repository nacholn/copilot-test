const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { getDbPool } = require('./dist/lib/db');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3001', 10);

// Prepare Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

/**
 * Track online users and their active socket connections
 * Structure: Map<userId, Set<socketId>>
 * 
 * Why a Set of socketIds per user?
 * - Users can have multiple devices/tabs connected simultaneously
 * - Each tab/device creates a separate WebSocket connection
 * - We track all connections to properly manage online/offline status
 * - User is only marked offline when ALL their connections are closed
 */
const onlineUsers = new Map();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
  });

  io.on('connection', (socket) => {
    console.log('[WebSocket] Client connected:', socket.id);

    // Handle user authentication/registration
    socket.on('register', async (userId) => {
      if (!userId) {
        console.error('[WebSocket] Register failed: no userId provided');
        return;
      }

      // Add socket to user's socket set
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
      }
      onlineUsers.get(userId).add(socket.id);
      
      // Store userId in socket data
      socket.data.userId = userId;

      console.log(`[WebSocket] User ${userId} registered with socket ${socket.id}`);

      // Update user status to online in database
      try {
        const pool = getDbPool();
        await pool.query(
          `INSERT INTO user_status (user_id, status, last_seen, updated_at)
           VALUES ($1, 'online', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (user_id)
           DO UPDATE SET 
             status = 'online',
             last_seen = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP`,
          [userId]
        );

        // Notify friends about user coming online
        const friendsResult = await pool.query(
          `SELECT DISTINCT
             CASE 
               WHEN f.user_id = $1 THEN f.friend_id
               ELSE f.user_id
             END as friend_id
           FROM friendships f
           WHERE f.user_id = $1 OR f.friend_id = $1`,
          [userId]
        );

        // Broadcast online status to friends
        friendsResult.rows.forEach((row) => {
          const friendId = row.friend_id;
          if (onlineUsers.has(friendId)) {
            onlineUsers.get(friendId).forEach((socketId) => {
              io.to(socketId).emit('user_status_change', {
                userId,
                status: 'online',
              });
            });
          }
        });
      } catch (error) {
        console.error('[WebSocket] Error updating user status:', error);
      }

      // Join a room with the user's ID for direct messaging
      socket.join(`user:${userId}`);
    });

    // Handle new message
    socket.on('send_message', async (data) => {
      const { receiverId, message } = data;
      const senderId = socket.data.userId;

      if (!senderId || !receiverId || !message) {
        socket.emit('error', { message: 'Invalid message data' });
        return;
      }

      try {
        // The message is already saved via API, just broadcast via WebSocket
        io.to(`user:${receiverId}`).emit('new_message', {
          senderId,
          receiverId,
          message,
          timestamp: new Date(),
        });

        console.log(`[WebSocket] Message from ${senderId} to ${receiverId}`);
      } catch (error) {
        console.error('[WebSocket] Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle notification sent
    socket.on('send_notification', (data) => {
      const { userId, notification } = data;

      if (!userId || !notification) {
        return;
      }

      // Send notification to user
      io.to(`user:${userId}`).emit('new_notification', notification);
      console.log(`[WebSocket] Notification sent to user ${userId}`);
    });

    // Handle typing indicator
    socket.on('typing_start', (data) => {
      const { receiverId } = data;
      const senderId = socket.data.userId;

      if (senderId && receiverId) {
        io.to(`user:${receiverId}`).emit('user_typing', { userId: senderId });
      }
    });

    socket.on('typing_stop', (data) => {
      const { receiverId } = data;
      const senderId = socket.data.userId;

      if (senderId && receiverId) {
        io.to(`user:${receiverId}`).emit('user_stopped_typing', { userId: senderId });
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      const userId = socket.data.userId;
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);

      if (userId) {
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);

          // If user has no more active sockets, mark as offline
          if (userSockets.size === 0) {
            onlineUsers.delete(userId);

            try {
              const pool = getDbPool();
              await pool.query(
                `UPDATE user_status 
                 SET status = 'offline', 
                     last_seen = CURRENT_TIMESTAMP, 
                     updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = $1`,
                [userId]
              );

              // Notify friends about user going offline
              const friendsResult = await pool.query(
                `SELECT DISTINCT
                   CASE 
                     WHEN f.user_id = $1 THEN f.friend_id
                     ELSE f.user_id
                   END as friend_id
                 FROM friendships f
                 WHERE f.user_id = $1 OR f.friend_id = $1`,
                [userId]
              );

              // Broadcast offline status to friends
              friendsResult.rows.forEach((row) => {
                const friendId = row.friend_id;
                if (onlineUsers.has(friendId)) {
                  onlineUsers.get(friendId).forEach((socketId) => {
                    io.to(socketId).emit('user_status_change', {
                      userId,
                      status: 'offline',
                    });
                  });
                }
              });

              console.log(`[WebSocket] User ${userId} marked as offline`);
            } catch (error) {
              console.error('[WebSocket] Error updating user status on disconnect:', error);
            }
          }
        }
      }
    });

    // Handle heartbeat for keeping connection alive
    socket.on('heartbeat', async () => {
      const userId = socket.data.userId;
      if (userId) {
        try {
          const pool = getDbPool();
          await pool.query(
            `UPDATE user_status 
             SET last_seen = CURRENT_TIMESTAMP, 
                 updated_at = CURRENT_TIMESTAMP
             WHERE user_id = $1`,
            [userId]
          );
        } catch (error) {
          console.error('[WebSocket] Error updating heartbeat:', error);
        }
      }
    });
  });

  // Make io instance available globally for API routes
  global.io = io;

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> WebSocket server running on ws://${hostname}:${port}`);
    });
});
