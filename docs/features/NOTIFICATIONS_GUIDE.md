# Notifications & Real-time Messaging Guide

This guide covers the comprehensive notification and real-time messaging system implemented in the Bicicita.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [WebSocket Events](#websocket-events)
- [Frontend Usage](#frontend-usage)
- [Database Schema](#database-schema)

## 🎯 Overview

The Bicicita now includes a complete real-time notification and messaging system with:

- **Friend Requests**: Send, receive, accept, and reject friend requests
- **Email Notifications**: Automated emails for friend requests
- **In-App Notifications**: Real-time notifications for all events
- **Real-time Messaging**: WebSocket-powered instant messaging
- **Online/Offline Status**: Track user availability
- **Read Receipts**: Message read tracking

## ✨ Features

### 1. pgAdmin Database Management

pgAdmin is now integrated into Docker Compose for easy database inspection:

```bash
# Start all services including pgAdmin
npm run docker:up

# Access pgAdmin at http://localhost:5050
# Email: nacholn@gmail.com
# Password: admin
```

### 2. Friend Request System

- **Send Friend Requests**: Users can send friend requests instead of direct friendships
- **Email Notifications**: Recipients receive email notifications with accept links
- **Accept/Reject**: Users can accept or reject pending friend requests
- **Bidirectional Friendships**: Accepting creates friendships in both directions

### 3. Notification System

Multiple notification types:
- `friend_request`: New friend request received
- `friend_request_accepted`: Friend request accepted
- `message`: New message received
- `system`: System notifications

Features:
- Unread notification counts
- Mark as read (individual or all)
- Notification history
- Real-time delivery via WebSocket

### 4. Real-time Messaging

- **WebSocket Integration**: Instant message delivery
- **No Polling**: Replaced 3-second polling with push-based updates
- **Typing Indicators**: See when friends are typing
- **Online Status**: See who's online in real-time
- **Read Receipts**: Track message read status

### 5. Online/Offline Status

- **Automatic Tracking**: Status updated on connection/disconnection
- **Heartbeat System**: 30-second heartbeat to maintain connection
- **Friend Visibility**: See online status for all friends
- **Last Seen**: Track when users were last active

## 🏗️ Architecture

### Backend Components

```
apps/backend/
├── server.js                              # Custom Next.js server with Socket.IO
├── src/
│   ├── app/api/
│   │   ├── friend-requests/route.ts       # Friend request endpoints
│   │   ├── notifications/route.ts         # Notification endpoints
│   │   ├── user-status/route.ts          # User status endpoints
│   │   └── messages/route.ts             # Enhanced with notifications
│   └── lib/
│       ├── email.ts                       # Email service with Resend
│       ├── notifications.ts               # Notification utilities
│       └── websocket.ts                   # WebSocket emission helpers
└── migrations/
    ├── 1765192065126_create-friend-requests-table.mjs
    ├── 1765192065127_create-notifications-table.mjs
    └── 1765192065128_create-user-status-table.mjs
```

### Frontend Components

```
apps/web/src/
├── contexts/
│   └── WebSocketContext.tsx              # WebSocket management
├── app/
│   ├── notifications/                    # Notifications page
│   ├── friend-requests/                  # Friend requests page
│   └── chat/                            # Enhanced with WebSocket
└── components/
    └── Header.tsx                        # With notification badge
```

## 🚀 Setup

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
# Root
npm install

# Backend
cd apps/backend && npm install

# Web
cd apps/web && npm install
```

### 2. Environment Variables

Add to `apps/backend/.env`:

```env
# Email Configuration (Resend)
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@bicicita.app

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Database Migrations

```bash
cd apps/backend
npm run migrate:up
```

This creates:
- `friend_requests` table
- `notifications` table
- `user_status` table

### 4. Start Services

```bash
# Start PostgreSQL and pgAdmin
npm run docker:up

# Start backend (with WebSocket server)
cd apps/backend
npm run dev

# Start web app (in another terminal)
cd apps/web
npm run dev
```

## 📡 API Endpoints

### Friend Requests

#### Get Friend Requests
```http
GET /api/friend-requests?userId={userId}&type={received|sent}&status={pending|accepted|rejected}
```

#### Send Friend Request
```http
POST /api/friend-requests
Content-Type: application/json

{
  "requesterId": "uuid",
  "addresseeId": "uuid"
}
```

#### Accept/Reject Friend Request
```http
PATCH /api/friend-requests
Content-Type: application/json

{
  "requestId": "uuid",
  "status": "accepted" | "rejected"
}
```

### Notifications

#### Get Notifications
```http
GET /api/notifications?userId={userId}&limit=50&offset=0&unreadOnly=false
```

#### Get Unread Count
```http
GET /api/notifications?userId={userId}&countOnly=true
```

#### Mark as Read
```http
PATCH /api/notifications?userId={userId}&notificationId={id}
```

#### Mark All as Read
```http
PATCH /api/notifications?userId={userId}&markAll=true
```

#### Delete Notification
```http
DELETE /api/notifications?userId={userId}&notificationId={id}
```

### User Status

#### Get User Status
```http
GET /api/user-status?userId={userId}
```

#### Get Multiple Users Status
```http
GET /api/user-status?friendIds={id1,id2,id3}
```

#### Update Status
```http
POST /api/user-status
Content-Type: application/json

{
  "userId": "uuid",
  "status": "online" | "offline" | "away"
}
```

## 🔌 WebSocket Events

### Client → Server

#### Register User
```javascript
socket.emit('register', userId);
```

#### Send Message
```javascript
socket.emit('send_message', {
  receiverId: 'uuid',
  message: 'text'
});
```

#### Typing Indicators
```javascript
socket.emit('typing_start', { receiverId: 'uuid' });
socket.emit('typing_stop', { receiverId: 'uuid' });
```

#### Heartbeat
```javascript
socket.emit('heartbeat');
```

### Server → Client

#### New Message
```javascript
socket.on('new_message', (data) => {
  // data: { senderId, receiverId, message, timestamp }
});
```

#### New Notification
```javascript
socket.on('new_notification', (notification) => {
  // notification: Notification object
});
```

#### User Status Change
```javascript
socket.on('user_status_change', (data) => {
  // data: { userId, status: 'online' | 'offline' | 'away' }
});
```

#### Typing Indicators
```javascript
socket.on('user_typing', (data) => {
  // data: { userId }
});

socket.on('user_stopped_typing', (data) => {
  // data: { userId }
});
```

## 💻 Frontend Usage

### Using WebSocket Context

```typescript
import { useWebSocket } from '@/contexts/WebSocketContext';

function MyComponent() {
  const {
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
    sendTypingIndicator
  } = useWebSocket();

  // Listen for new messages
  useEffect(() => {
    const handleMessage = (message) => {
      console.log('New message:', message);
    };

    onNewMessage(handleMessage);
    return () => offNewMessage(handleMessage);
  }, []);

  // Check if user is online
  const isUserOnline = onlineUsers.has(userId);

  // Send typing indicator
  sendTypingIndicator(receiverId, true); // Start typing
  sendTypingIndicator(receiverId, false); // Stop typing
}
```

### Browser Notifications

The WebSocket context automatically requests and shows browser notifications when new notifications arrive (if permission is granted).

## 🗄️ Database Schema

### friend_requests

```sql
CREATE TABLE friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(user_id),
  addressee_id UUID NOT NULL REFERENCES profiles(user_id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (requester_id, addressee_id, status),
  CHECK (requester_id != addressee_id),
  CHECK (status IN ('pending', 'accepted', 'rejected'))
);
```

### notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  actor_id UUID REFERENCES profiles(user_id),
  related_id UUID,
  related_type VARCHAR(50),
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (type IN ('friend_request', 'friend_request_accepted', 'message', 'system'))
);
```

### user_status

```sql
CREATE TABLE user_status (
  user_id UUID PRIMARY KEY REFERENCES profiles(user_id),
  status VARCHAR(20) NOT NULL DEFAULT 'offline',
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (status IN ('online', 'offline', 'away'))
);
```

## 🔧 Troubleshooting

### WebSocket Not Connecting

1. Ensure backend is running on port 3001
2. Check `NEXT_PUBLIC_BACKEND_URL` environment variable
3. Verify firewall allows WebSocket connections

### Email Not Sending

1. Check `RESEND_API_KEY` is set correctly
2. Verify email domain is configured in Resend
3. Check backend logs for email errors

### Notifications Not Appearing

1. Check WebSocket connection status
2. Verify user is registered with WebSocket server
3. Check browser console for errors
4. Ensure notifications permission is granted

### Database Migration Errors

1. Ensure PostgreSQL is running (`npm run docker:up`)
2. Check `DATABASE_URL` environment variable
3. Try resetting: `npm run docker:reset && npm run migrate:up`

## 📚 Additional Resources

- [Socket.IO Documentation](https://socket.io/docs/)
- [Resend Documentation](https://resend.com/docs)
- [Next.js Custom Server](https://nextjs.org/docs/pages/building-your-application/configuring/custom-server)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🎨 UI Pages

### Notifications Page
- **URL**: `/notifications`
- **Features**: View all notifications, mark as read, click to navigate

### Friend Requests Page
- **URL**: `/friend-requests`
- **Features**: View received/sent requests, accept/reject

### Chat Page
- **URL**: `/chat`
- **Features**: Real-time messaging, typing indicators, online status

## 🔐 Security Considerations

1. **Input Validation**: All inputs are validated before processing
2. **Parameterized Queries**: Prevents SQL injection
3. **Authentication**: All endpoints require valid user authentication
4. **Rate Limiting**: Consider adding rate limiting for production
5. **CORS**: WebSocket CORS is configured for the web app URL

## 🚀 Future Enhancements

- [ ] Push notifications for mobile
- [ ] Message delivery confirmations
- [ ] Group messaging
- [ ] File sharing in chat
- [ ] Notification preferences/settings
- [ ] Block/mute functionality
- [ ] Message search
- [ ] Emoji reactions
