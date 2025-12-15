# Expo Push Notifications vs Web PWA Push Notifications

## Yes, Expo Push Notifications Use a Different Process

While both web PWA and Expo mobile apps can receive push notifications, they use **completely different systems** with different APIs, services, and implementation approaches.

## Key Differences

| Aspect | Web PWA (VAPID) | Expo Mobile |
|--------|----------------|-------------|
| **Service** | Browser Push Service (Chrome, Firefox, etc.) | Expo Push Notification Service (EPNS) |
| **Authentication** | VAPID keys (public/private) | Expo Access Token |
| **Subscription** | `pushManager.subscribe()` | `Notifications.getExpoPushTokenAsync()` |
| **Token Format** | PushSubscription object with endpoint | Expo Push Token (e.g., `ExponentPushToken[xxx]`) |
| **Push Server** | Your backend directly to browser push service | Your backend → Expo servers → Device |
| **Library** | `web-push` (Node.js) | `expo-notifications` + Expo API |
| **Permissions** | Browser Notification API | Native iOS/Android permissions |
| **Works Offline** | Yes (with service worker) | Yes (native push) |
| **Background** | Service worker handles | Native system handles |

## Architecture Comparison

### Web PWA Push Flow
```
Your Backend (VAPID) → Browser Push Service → Service Worker → User
```

### Expo Push Flow
```
Your Backend (Expo Token) → Expo Push Service → APNs/FCM → User
```

## Expo Push Notifications Implementation

### Step 1: Install Expo Notifications

```bash
cd apps/mobile
npx expo install expo-notifications expo-device expo-constants
```

### Step 2: Configure app.json

Add notification configuration to `apps/mobile/app.json`:

```json
{
  "expo": {
    "name": "Cyclists Social Network",
    "slug": "cyclists-social-network",
    "version": "0.1.0",
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#FE3C72",
      "androidMode": "default",
      "androidCollapsedTitle": "#{unread_notifications} new notifications"
    },
    "android": {
      "package": "com.cyclists.socialnetwork",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FE3C72"
      },
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "bundleIdentifier": "com.cyclists.socialnetwork",
      "supportsTablet": true
    }
  }
}
```

### Step 3: Request Permissions (React Native)

Create `apps/mobile/hooks/useNotifications.ts`:

```typescript
import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string>('');
  const [notification, setNotification] = useState<Notifications.Notification>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    // Listen for notifications received while app is open
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // Listen for user interaction with notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      // Navigate based on notification data
      if (data.url) {
        // Handle navigation (e.g., to chat or notifications screen)
        console.log('Navigate to:', data.url);
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FE3C72',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id', // Get from app.json or expo.dev
    })).data;
    
    console.log('Expo Push Token:', token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
```

### Step 4: Send Token to Backend

Create API endpoint to store Expo push tokens:

**Backend:** `apps/backend/src/app/api/expo-push-tokens/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, expoPushToken, deviceId } = body;

    if (!userId || !expoPushToken) {
      return NextResponse.json(
        { success: false, error: 'Missing userId or expoPushToken' },
        { status: 400 }
      );
    }

    // Validate Expo push token format
    if (!expoPushToken.startsWith('ExponentPushToken[')) {
      return NextResponse.json(
        { success: false, error: 'Invalid Expo push token format' },
        { status: 400 }
      );
    }

    // Store or update token
    const existingResult = await db.query(
      'SELECT id FROM expo_push_tokens WHERE expo_push_token = $1',
      [expoPushToken]
    );

    if (existingResult.rows.length > 0) {
      await db.query(
        'UPDATE expo_push_tokens SET user_id = $1, device_id = $2, updated_at = CURRENT_TIMESTAMP WHERE expo_push_token = $3',
        [userId, deviceId || null, expoPushToken]
      );
    } else {
      await db.query(
        'INSERT INTO expo_push_tokens (user_id, expo_push_token, device_id) VALUES ($1, $2, $3)',
        [userId, expoPushToken, deviceId || null]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving Expo push token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save token' },
      { status: 500 }
    );
  }
}
```

### Step 5: Database Migration for Expo Tokens

Create migration:

```javascript
exports.up = (pgm) => {
  pgm.createTable('expo_push_tokens', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { 
      type: 'uuid', 
      notNull: true, 
      references: 'profiles(user_id)',
      onDelete: 'CASCADE'
    },
    expo_push_token: { type: 'text', notNull: true, unique: true },
    device_id: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('expo_push_tokens', 'user_id');
  pgm.createIndex('expo_push_tokens', 'expo_push_token');
};

exports.down = (pgm) => {
  pgm.dropTable('expo_push_tokens');
};
```

### Step 6: Send Push Notifications from Backend

Create `apps/backend/src/lib/expo-push-notifications.ts`:

```typescript
import fetch from 'node-fetch';

export interface ExpoPushMessage {
  to: string | string[]; // Expo push token(s)
  title: string;
  body: string;
  data?: {
    url?: string;
    [key: string]: any;
  };
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
}

export async function sendExpoPushNotification(message: ExpoPushMessage) {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Expo push notification error:', data);
      throw new Error('Failed to send Expo push notification');
    }

    console.log('Expo push notification sent:', data);
    return data;
  } catch (error) {
    console.error('Error sending Expo push notification:', error);
    throw error;
  }
}

export async function sendExpoPushNotificationToUser(
  userId: string,
  notification: {
    title: string;
    body: string;
    data?: any;
  }
) {
  try {
    // Get user's Expo push tokens from database
    const result = await db.query(
      'SELECT expo_push_token FROM expo_push_tokens WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      console.log('No Expo push tokens found for user:', userId);
      return;
    }

    const tokens = result.rows.map(row => row.expo_push_token);

    // Send to all user's devices
    await sendExpoPushNotification({
      to: tokens,
      title: notification.title,
      body: notification.body,
      data: notification.data,
      sound: 'default',
      priority: 'high',
    });
  } catch (error) {
    console.error('Error sending Expo notification to user:', error);
  }
}
```

### Step 7: Integrate with Messaging System

Update your messaging logic to send both web and Expo push notifications:

```typescript
// In apps/backend/src/lib/notifications.ts
import { sendPushNotification } from './push-notifications'; // Web VAPID
import { sendExpoPushNotificationToUser } from './expo-push-notifications'; // Expo

export async function notifyUser(userId: string, notification: {
  title: string;
  message: string;
  type: string;
  actionUrl?: string;
}) {
  // Send WebSocket notification (real-time)
  // ... existing WebSocket code ...

  // Send Web PWA push notification (VAPID)
  try {
    const webSubscriptions = await db.query(
      'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1',
      [userId]
    );

    for (const sub of webSubscriptions.rows) {
      await sendPushNotification({
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      }, {
        title: notification.title,
        body: notification.message,
        data: { url: notification.actionUrl },
      }).catch(err => console.error('Web push failed:', err));
    }
  } catch (error) {
    console.error('Error sending web push:', error);
  }

  // Send Expo push notification (Mobile)
  try {
    await sendExpoPushNotificationToUser(userId, {
      title: notification.title,
      body: notification.message,
      data: {
        url: notification.actionUrl,
        type: notification.type,
      },
    });
  } catch (error) {
    console.error('Error sending Expo push:', error);
  }
}
```

### Step 8: Handle Notifications in Mobile App

Update `apps/mobile/app/_layout.tsx` or main component:

```typescript
import { useNotifications } from '../hooks/useNotifications';
import { useEffect } from 'react';

export default function RootLayout() {
  const { expoPushToken } = useNotifications();
  const { user } = useAuth(); // Your auth context

  useEffect(() => {
    if (expoPushToken && user?.id) {
      // Send token to backend
      fetch('/api/expo-push-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          expoPushToken,
          deviceId: 'device-id-here', // Get from Device.modelName or similar
        }),
      }).catch(err => console.error('Failed to register push token:', err));
    }
  }, [expoPushToken, user]);

  return (
    // ... your layout components
  );
}
```

## Important Differences to Remember

### 1. **No VAPID Keys Needed for Expo**
   - Expo manages push infrastructure
   - No need for public/private key pairs
   - Just use Expo push tokens

### 2. **Different Token Formats**
   - Web: Full subscription object with endpoint, p256dh, auth
   - Expo: Simple string like `ExponentPushToken[xxxxxx]`

### 3. **Different APIs**
   - Web: `navigator.serviceWorker.pushManager`
   - Expo: `Notifications.getExpoPushTokenAsync()`

### 4. **Different Backend Sending**
   - Web: Send directly to browser push service with VAPID
   - Expo: Send to Expo servers, they forward to APNs/FCM

### 5. **Permission Handling**
   - Web: Browser notification permission API
   - Expo: Native iOS/Android permission dialogs

### 6. **Background Behavior**
   - Web: Service worker handles push events
   - Expo: Native system handles push notifications

### 7. **Testing**
   - Web: Works in browser (Chrome DevTools)
   - Expo: Requires physical device or Expo Go app

## Expo Push Notification Tool

Test Expo push notifications easily:
https://expo.dev/notifications

Enter your Expo push token and send a test notification!

## Production Considerations

### For Web PWA:
- Need VAPID keys
- Works in browsers (Chrome, Firefox, Edge, Safari 16.4+)
- Service worker required
- HTTPS required

### For Expo Mobile:
- Need Expo project ID
- For production: Build standalone app with EAS Build
- For iOS: Need Apple Developer account and APNs certificate
- For Android: Automatic through Expo/FCM

## Summary

**Yes, they are different systems:**

- **Web PWA**: Use VAPID with `web-push` library
- **Expo Mobile**: Use Expo Push Notification Service with `expo-notifications`

**Best practice for your app:**
- Implement **both** systems
- Store both types of tokens in separate database tables
- When sending notifications, send to both web subscribers (VAPID) and mobile users (Expo)
- This ensures all users receive notifications regardless of platform

The good news is that the backend notification logic can be unified - you just call both push services when sending a notification!
