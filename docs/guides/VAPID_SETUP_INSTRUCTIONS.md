# VAPID Setup Instructions

This file provides quick setup instructions for the VAPID web push notification system that has been implemented.

## What Was Implemented

✅ Backend push notification service (`apps/backend/src/lib/web-push-notifications.ts`)
✅ Database migration for push subscriptions table
✅ API endpoints for subscription management (`/api/push-subscriptions`)
✅ Frontend subscription logic in `WebPushNotificationPermission` component
✅ Integration with notification creation system

## Quick Setup Steps

### 1. Generate VAPID Keys

Run this command in the backend directory:

```bash
cd apps/backend
node -e "const webPush = require('web-push'); const vapidKeys = webPush.generateVAPIDKeys(); console.log('Public Key:', vapidKeys.publicKey); console.log('\nPrivate Key:', vapidKeys.privateKey);"
```

### 2. Configure Environment Variables

**Backend** (`apps/backend/.env`):

```env
VAPID_PUBLIC_KEY=your-generated-public-key
VAPID_PRIVATE_KEY=your-generated-private-key
VAPID_SUBJECT=mailto:your-email@example.com
```

**Frontend** (`apps/web/.env.local`):

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-generated-public-key
```

⚠️ **Important**: Use the SAME public key in both backend and frontend!

### 3. Run Database Migration

```bash
cd apps/backend
npm run migrate:up
```

This creates the `push_subscriptions` table.

### 4. Restart Applications

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Web
cd apps/web
npm run dev
```

## How It Works

1. **User logs in** → WebPushNotificationPermission component shows prompt after 3 seconds
2. **User grants permission** → Component subscribes to push notifications using VAPID public key
3. **Subscription saved** → Frontend sends subscription to `/api/push-subscriptions` endpoint
4. **Backend stores** → Subscription saved in `push_subscriptions` table with user_id
5. **Notifications sent** → When `createNotification()` is called, web push is sent automatically

## Testing

### Test in Browser DevTools

1. Open your app in Chrome/Firefox
2. Open DevTools → Application tab → Service Workers
3. Check that service worker is registered
4. Application tab → Push Messaging → should show subscription

### Send Test Notification

You can test by triggering any notification in the app (friend request, message, etc.). The notification will automatically be sent via web push.

### Manual Test from Backend

Create a test script in `apps/backend`:

```typescript
import { sendWebPushNotificationToUser } from './src/lib/web-push-notifications';

sendWebPushNotificationToUser('user-id-here', {
  title: 'Test Notification',
  body: 'This is a test push notification!',
  icon: '/icon-192x192.png',
  data: { url: '/notifications' },
});
```

## Browser Support

- ✅ Chrome 50+
- ✅ Firefox 44+
- ✅ Edge 17+
- ✅ Safari 16.4+ (macOS 13+, iOS 16.4+)
- ✅ Opera 37+

## Troubleshooting

### "VAPID keys not configured" warning

- Make sure environment variables are set in both backend and frontend
- Restart both applications after setting env vars

### Push subscription not working

- Ensure HTTPS is used (or localhost for development)
- Check browser console for errors
- Verify VAPID public key matches in backend and frontend

### Notifications not appearing

- Check notification permission status in browser settings
- Ensure user has granted permission
- Check that subscription is saved in database
- Verify VAPID keys are correct

## Security Notes

- ✅ Private key stored only on backend (never exposed to client)
- ✅ Public key can be safely shared with frontend
- ✅ Subscriptions linked to user accounts
- ✅ Automatic cleanup of expired subscriptions (410/404 status)
- ✅ Each device gets its own subscription (supports multiple devices per user)

## Next Steps

The VAPID system is now fully implemented and integrated. Notifications will automatically be sent via web push when created through the `createNotification()` function.

To further enhance:

- Add notification preferences in user settings
- Implement notification categories
- Add quiet hours support
- Create admin dashboard for monitoring push delivery

For detailed documentation, see `VAPID_IMPLEMENTATION_GUIDE.md`.
