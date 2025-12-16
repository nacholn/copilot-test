# WebAdmin Push Notifications Implementation

## Overview

This document describes the implementation of enhanced user information display and web push notification features in the webadmin application.

## Features Implemented

### 1. Enhanced User Information Display

The user list in webadmin now displays comprehensive information about each user:

- **Basic Info**: Avatar, name, email, city, cycling level
- **Activity Dates**:
  - Last Login Date
  - Last Post Created Date
- **Engagement Metrics**:
  - Interaction Score (color-coded badge)
  - Push Token Count (clickable to view details)
- **Admin Status**: Visual indicator for admin users
- **Actions**: Edit, Send Push, Delete buttons

### 2. Push Token Management

Users can view detailed information about each user's web push subscriptions:

- Click on the push token count in the user list
- Modal displays all subscriptions with:
  - Full endpoint URL (truncated in table, full in tooltip)
  - Creation timestamp
  - Last update timestamp

### 3. Push Notification Sending

#### Send to Individual Users

From the user list, admins can send push notifications to individual users:

1. Click the 📲 button next to a user
2. Fill in the notification form:
   - **Title** (required): Notification headline
   - **Message** (required): Notification body text
   - **Action URL** (optional): URL to open when notification is clicked
3. Click "Send Notification"

#### Send to Group Members

From the group detail page, admins can send push notifications to all group members:

1. Click "📲 Send Push to All Members" button
2. Fill in the notification form (same as individual)
3. Click "Send Notification"
4. Notification is sent to all active push subscriptions for group members

## Architecture

### Frontend Components

#### 1. UserList Component (`apps/webadmin/src/components/UserList.tsx`)

Enhanced table component that displays user information with the following features:

- Fetches push token counts for all users on mount
- Displays dates in readable format (e.g., "Dec 16, 2024")
- Shows interaction scores with colored badges
- Provides callbacks for viewing tokens and sending notifications

**Props:**
```typescript
interface UserListProps {
  users: Profile[];
  onEdit: (user: Profile) => void;
  onDelete: (userId: string) => Promise<void>;
  onViewPushTokens?: (user: Profile) => void;
  onSendPush?: (user: Profile) => void;
}
```

#### 2. PushTokensModal Component (`apps/webadmin/src/components/PushTokensModal.tsx`)

Modal dialog that displays all push subscriptions for a user:

- Fetches detailed subscription data from backend
- Shows endpoint URLs (truncated in table, full in tooltip)
- Displays creation and update timestamps
- Responsive table layout

**Props:**
```typescript
interface PushTokensModalProps {
  user: Profile;
  onClose: () => void;
}
```

#### 3. SendNotificationModal Component (`apps/webadmin/src/components/SendNotificationModal.tsx`)

Modal form for composing and sending push notifications:

- Works for both individual users and groups
- Form validation for required fields
- Success/error feedback
- Optional action URL for notification clicks

**Props:**
```typescript
interface SendNotificationModalProps {
  user?: Profile;           // For individual user notifications
  groupId?: string;          // For group notifications
  groupName?: string;
  onClose: () => void;
  onSuccess?: () => void;
}
```

### Backend API Endpoints

#### 1. Get Push Subscriptions (`GET /api/webadmin/push-subscriptions`)

Retrieves detailed push subscription information for a user.

**Query Parameters:**
- `userId` (required): The user's ID

**Response:**
```typescript
{
  success: true,
  data: [
    {
      endpoint: string,
      createdAt: string,
      updatedAt: string
    }
  ]
}
```

**Implementation:** `apps/backend/src/app/api/webadmin/push-subscriptions/route.ts`

#### 2. Get Push Token Counts (Batch) (`GET /api/webadmin/push-token-counts`)

Retrieves push token counts for multiple users in a single request. This batch endpoint optimizes performance by eliminating N+1 query patterns.

**Query Parameters:**
- `userIds` (required): Comma-separated list of user IDs

**Response:**
```typescript
{
  success: true,
  data: {
    "user-id-1": 2,
    "user-id-2": 0,
    "user-id-3": 1
  }
}
```

**Implementation:** `apps/backend/src/app/api/webadmin/push-token-counts/route.ts`

**Performance:** Uses a single database query with `GROUP BY` to fetch counts for all users efficiently.

#### 3. Send Push to User (`POST /api/webadmin/push-notifications/user`)

Sends a push notification to all of a user's devices.

**Request Body:**
```typescript
{
  userId: string,
  notification: {
    title: string,
    body: string,
    icon?: string,
    badge?: string,
    data?: {
      url?: string,
      [key: string]: any
    },
    tag?: string
  }
}
```

**Response:**
```typescript
{
  success: true,
  data: { message: "Notification sent successfully" }
}
```

**Implementation:** `apps/backend/src/app/api/webadmin/push-notifications/user/route.ts`

#### 4. Send Push to Group (`POST /api/webadmin/push-notifications/group`)

Sends a push notification to all members of a group.

**Request Body:**
```typescript
{
  groupId: string,
  notification: {
    title: string,
    body: string,
    icon?: string,
    badge?: string,
    data?: {
      url?: string,
      [key: string]: any
    },
    tag?: string
  }
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    message: "Notifications sent successfully",
    memberCount: number,
    subscriptionCount: number
  }
}
```

**Implementation:** `apps/backend/src/app/api/webadmin/push-notifications/group/route.ts`

## Database Schema

### Push Subscriptions Table

The `push_subscriptions` table stores web push notification subscriptions:

```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
```

## Usage Guide

### For Webadmin Users

#### Viewing User Information

1. Navigate to the Users page in webadmin
2. The user list displays all users with their activity information
3. Use the search box to filter users by name, email, or city

#### Viewing Push Tokens

1. In the user list, find the "Push Tokens" column
2. Each user has a clickable badge showing their token count
3. Click the badge to open a modal with detailed subscription information
4. The modal shows endpoint URLs and timestamps for each subscription

#### Sending Notifications to Individual Users

1. In the user list, click the 📲 button next to a user
2. Fill in the notification form:
   - Enter a title (required)
   - Enter a message (required)
   - Optionally add an action URL
3. Click "Send Notification"
4. Wait for success confirmation

#### Sending Notifications to Groups

1. Navigate to a group's detail page
2. Click the "📲 Send Push to All Members" button
3. Fill in the notification form
4. Click "Send Notification"
5. The notification is sent to all group members who have push subscriptions

### For Developers

#### Adding New Notification Types

To add new notification types, modify the notification payload in the modal:

```typescript
const payload = {
  userId: user.userId,
  notification: {
    title: 'Your Title',
    body: 'Your Message',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: 'custom-tag',  // For grouping/replacing notifications
    data: {
      url: '/custom-url',
      customField: 'customValue'
    }
  }
};
```

#### Error Handling

The implementation includes comprehensive error handling:

- **Frontend**: Displays error messages in the modal
- **Backend**: Logs errors and returns meaningful error messages
- **Push Library**: Automatically removes expired subscriptions (410/404 errors)

#### Testing Push Notifications

To test push notifications:

1. Ensure VAPID keys are configured in the backend environment
2. Register for push notifications in the web app
3. Use webadmin to send a test notification
4. Check browser console for any errors
5. Verify notification appears in the browser

## Security Considerations

### Current Implementation

- Push notification endpoints are not currently protected by authentication
- Admin access is required to access webadmin pages
- All API endpoints log errors for debugging

### Recommended Improvements

For production use, consider implementing:

1. **Authentication Middleware**: Verify admin status on all webadmin API routes
2. **Rate Limiting**: Prevent abuse of notification sending
3. **Audit Logging**: Track who sends notifications and when
4. **Notification Limits**: Implement daily/hourly limits per admin
5. **Content Validation**: Sanitize notification content to prevent XSS
6. **Permission Checks**: Verify admins have permission to message specific users/groups

## Dependencies

### New Dependencies

None - uses existing project dependencies:
- `web-push`: Already installed for push notification functionality
- Next.js API routes for backend
- React hooks for frontend state management

### Existing Dependencies Used

- `@cyclists/config`: Shared types
- `web-push`: Push notification library
- PostgreSQL: Database for storing subscriptions

## Performance Considerations

### Frontend Optimizations

- Push token counts are fetched using batch endpoint (single request)
- Eliminates N+1 query pattern that would occur with individual requests
- Efficient handling of large user lists
- Displays loading states during data fetching

### Backend Optimizations

- **Batch endpoint** for push token counts eliminates N+1 queries
- Single database query with `GROUP BY` for optimal performance
- Uses parameterized queries to prevent SQL injection
- Parallel push notification sending with `Promise.all`
- Automatic cleanup of expired subscriptions
- Database indexes on `user_id` and `endpoint` columns
- Efficient handling of large user lists (scales linearly, not quadratically)

## Future Enhancements

### Potential Improvements

1. **Batch Notifications**: Send to multiple selected users at once
2. **Notification Templates**: Save and reuse common notification templates
3. **Scheduled Notifications**: Schedule notifications for future delivery
4. **Notification History**: Track sent notifications and delivery status
5. **Analytics**: Show delivery rates and click-through rates
6. **Rich Notifications**: Support for images and action buttons
7. **User Preferences**: Allow users to opt-out of certain notification types
8. **Notification Preview**: Preview how notification will appear before sending

## Troubleshooting

### Common Issues

#### Notifications Not Sending

1. Check VAPID keys are configured in backend `.env`:
   ```
   VAPID_PUBLIC_KEY=your_public_key
   VAPID_PRIVATE_KEY=your_private_key
   VAPID_SUBJECT=mailto:admin@example.com
   ```

2. Verify user has active push subscriptions in database:
   ```sql
   SELECT * FROM push_subscriptions WHERE user_id = 'user-id';
   ```

3. Check browser console for push notification errors

#### Push Token Count Not Displaying

1. Verify `/api/push-subscriptions` endpoint is accessible
2. Check browser console for API errors
3. Ensure push subscriptions table exists in database

#### Modal Not Opening

1. Check browser console for JavaScript errors
2. Verify component imports are correct
3. Ensure modal state is being set correctly

## Conclusion

This implementation provides a comprehensive solution for managing and sending web push notifications in the webadmin interface. It includes:

- ✅ Enhanced user information display
- ✅ Push token management
- ✅ Individual user notifications
- ✅ Group member notifications
- ✅ Comprehensive error handling
- ✅ Good performance with parallel requests
- ✅ Clean, maintainable code structure

The system is ready for use and can be extended with additional features as needed.
