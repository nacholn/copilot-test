# Expo Push Notifications vs Web PWA Push Notifications

## Yes, Expo Push Notifications Use a Different Process

While both web PWA and Expo mobile apps can receive push notifications, they use **completely different systems** with different APIs, services, and implementation approaches.

## Key Differences

| Aspect             | Web PWA (VAPID)                               | Expo Mobile                                      |
| ------------------ | --------------------------------------------- | ------------------------------------------------ |
| **Service**        | Browser Push Service (Chrome, Firefox, etc.)  | Expo Push Notification Service (EPNS)            |
| **Authentication** | VAPID keys (public/private)                   | Expo Access Token                                |
| **Subscription**   | `pushManager.subscribe()`                     | `Notifications.getExpoPushTokenAsync()`          |
| **Token Format**   | PushSubscription object with endpoint         | Expo Push Token (e.g., `ExponentPushToken[xxx]`) |
| **Push Server**    | Your backend directly to browser push service | Your backend → Expo servers → Device             |
| **Library**        | `web-push` (Node.js)                          | `expo-notifications` + Expo API                  |
| **Permissions**    | Browser Notification API                      | Native iOS/Android permissions                   |
| **Works Offline**  | Yes (with service worker)                     | Yes (native push)                                |
| **Background**     | Service worker handles                        | Native system handles                            |

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
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
      }
    });

    // Listen for notifications received while app is open
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification);
    });

    // Listen for user interaction with notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
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

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Get from app.json or expo.dev
      })
    ).data;

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
    return NextResponse.json({ success: false, error: 'Failed to save token' }, { status: 500 });
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
      onDelete: 'CASCADE',
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

    const tokens = result.rows.map((row) => row.expo_push_token);

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

export async function notifyUser(
  userId: string,
  notification: {
    title: string;
    message: string;
    type: string;
    actionUrl?: string;
  }
) {
  // Send WebSocket notification (real-time)
  // ... existing WebSocket code ...

  // Send Web PWA push notification (VAPID)
  try {
    const webSubscriptions = await db.query(
      'SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = $1',
      [userId]
    );

    for (const sub of webSubscriptions.rows) {
      await sendPushNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        {
          title: notification.title,
          body: notification.message,
          data: { url: notification.actionUrl },
        }
      ).catch((err) => console.error('Web push failed:', err));
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

## iOS and Android Configuration Requirements

### Short Answer: It Depends on Your Build Type

**Using Expo Go or Development Builds:**

- ✅ **No Firebase configuration needed**
- ✅ **No Apple Developer account needed**
- Expo handles everything automatically
- Perfect for development and testing

**Using EAS Build (Production Standalone Apps):**

- **iOS:** ✅ Requires Apple Developer account ($99/year)
- **Android:** ⚠️ Firebase/FCM optional (Expo handles it, but you can configure for advanced features)

### Detailed Breakdown

#### For iOS Production Apps

**Requirements:**

1. **Apple Developer Account** ($99/year)
   - Required to build and distribute iOS apps
   - Required for APNs (Apple Push Notification service)
2. **APNs Certificate/Key**
   - Expo automatically handles APNs setup with EAS Build
   - You don't need to manually create certificates
   - EAS Build manages the provisioning profiles and push certificates

**Steps:**

1. Sign up for Apple Developer Program: https://developer.apple.com/programs/
2. Run `eas build --platform ios`
3. EAS will guide you through the setup
4. Expo automatically configures APNs for you

**You DON'T need to:**

- Manually create push certificates
- Download .p8 files
- Configure APNs manually
- Use Xcode for push notification setup

#### For Android Production Apps

**Requirements:**

1. **No Google Play Developer account required** for push notifications
   - Only needed for Play Store distribution ($25 one-time fee)
2. **No Firebase/FCM configuration required** by default
   - Expo uses its own FCM credentials automatically
   - Push notifications work out of the box with EAS Build

**Optional Firebase Configuration:**

- If you want to use your own FCM project (for analytics, custom features, etc.)
- Add `google-services.json` to your project
- Configure in `app.json`:

```json
{
  "android": {
    "googleServicesFile": "./google-services.json"
  }
}
```

**Steps for basic setup:**

1. Run `eas build --platform android`
2. Push notifications work automatically
3. No Firebase setup needed unless you want custom configuration

### Expo Go vs Standalone Apps

#### Development with Expo Go

```
✅ Push notifications work immediately
✅ No Apple Developer account needed
✅ No Firebase configuration needed
✅ Use for testing during development
```

**How it works:**

- Expo Go has built-in push notification credentials
- You get an Expo Push Token
- Send notifications via Expo's push service
- Perfect for development

#### Production Standalone Apps (EAS Build)

```
iOS: Requires Apple Developer account ($99/year)
Android: No additional accounts needed (Play Store is optional)
```

**How it works:**

- Your own app bundle
- Expo still manages push infrastructure
- More control and customization
- Required for App Store/Play Store distribution

## Production Considerations

### For Web PWA:

- Need VAPID keys
- Works in browsers (Chrome, Firefox, Edge, Safari 16.4+)
- Service worker required
- HTTPS required

### For Expo Mobile:

- Need Expo project ID
- For production: Build standalone app with EAS Build
- **iOS:** Apple Developer account required ($99/year), APNs managed by Expo
- **Android:** No Firebase setup required by default, FCM managed by Expo
- **Both:** Push notifications work automatically through Expo Push Service

## Configuration Comparison Table

| Configuration       | Expo Go (Dev)   | EAS Build iOS          | EAS Build Android        | Web PWA         |
| ------------------- | --------------- | ---------------------- | ------------------------ | --------------- |
| Apple Developer     | ❌ Not needed   | ✅ Required ($99/year) | ❌ Not needed            | ❌ Not needed   |
| Firebase/FCM Setup  | ❌ Not needed   | ❌ Not needed          | ❌ Not needed (optional) | ❌ Not needed   |
| VAPID Keys          | ❌ Not needed   | ❌ Not needed          | ❌ Not needed            | ✅ Required     |
| APNs Certificate    | ❌ Auto-handled | ✅ Auto by EAS         | ❌ Not applicable        | ❌ Not needed   |
| Google Play Account | ❌ Not needed   | ❌ Not needed          | ❌ Not needed\*          | ❌ Not needed   |
| Push Service        | Expo Push       | Expo Push              | Expo Push                | Browser Push    |
| Setup Complexity    | ⭐ Very Easy    | ⭐⭐ Easy              | ⭐ Very Easy             | ⭐⭐⭐ Moderate |

\*Only needed for Play Store distribution, not for push notifications

## Frequently Asked Questions

### Do I need Firebase for Android push notifications?

**No.** Expo manages FCM credentials automatically. You only need Firebase if:

- You want to use Firebase Analytics
- You need Firebase Realtime Database or Firestore
- You want custom FCM configuration

### Do I need an Apple Developer account for testing?

**No.** Use Expo Go for testing. You only need an Apple Developer account when:

- Building a standalone app with EAS Build
- Submitting to the App Store
- Testing on devices without Expo Go

### Can I use my own Firebase project?

**Yes.** You can optionally configure your own Firebase project:

1. Create a Firebase project
2. Download `google-services.json`
3. Add to your Expo project
4. Configure in `app.json`

But this is **not required** for push notifications to work.

### What's the easiest way to get started?

1. **Development:** Use Expo Go - zero configuration needed
2. **Production iOS:** Get Apple Developer account, use EAS Build
3. **Production Android:** Just use EAS Build - no extra accounts needed

### Do push notifications cost money?

- **Expo Push Service:** Free (Expo manages infrastructure)
- **Apple Developer:** $99/year (required for iOS production apps)
- **Google Play:** $25 one-time (optional, only for Play Store)
- **Firebase:** Free tier sufficient for most apps
- **Web Push (VAPID):** Free (no external service fees)

## Summary

**Yes, they are different systems:**

- **Web PWA**: Use VAPID with `web-push` library
- **Expo Mobile**: Use Expo Push Notification Service with `expo-notifications`

**Configuration Requirements:**

- **Development (Expo Go):** Nothing needed - works immediately! 🎉
- **iOS Production:** Apple Developer account ($99/year), APNs managed by Expo
- **Android Production:** No Firebase/FCM setup needed, managed by Expo
- **Web PWA:** VAPID keys (free, self-managed)

**Best practice for your app:**

- Implement **both** systems
- Store both types of tokens in separate database tables
- When sending notifications, send to both web subscribers (VAPID) and mobile users (Expo)
- This ensures all users receive notifications regardless of platform

The good news is that:

- Expo handles most complexity automatically
- No Firebase configuration needed for basic push notifications
- Backend notification logic can be unified - just call both push services!
- Development testing requires zero configuration
