'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './WebPushNotificationPermission.module.css';

export function WebPushNotificationPermission() {
  const { user } = useAuth();
  const [showPrompt, setShowPrompt] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isDismissedRecently, setIsDismissedRecently] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    // Check current permission status
    setPermission(Notification.permission);

    // Check if user dismissed recently (within last 7 days)
    const dismissedAt = localStorage.getItem('notificationPromptDismissed');
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      setIsDismissedRecently(daysSinceDismissed < 7);
    }

    // Show prompt if user is logged in and permission is default
    if (user && Notification.permission === 'default') {
      // Wait a bit before showing the prompt to avoid overwhelming the user
      const timeout = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [user]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setShowPrompt(false);

      if (result === 'granted') {
        console.log('Notification permission granted');
        
        // Register for push notifications if service worker is available
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          await subscribeToPushNotifications();
        }

        // Show a test notification
        const welcomeNotification = new Notification('Notifications Enabled! 🎉', {
          body: 'You will now receive updates about messages and friend requests.',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: 'notification-enabled',
        });

        // Close notification when clicked
        welcomeNotification.onclick = () => {
          welcomeNotification.close();
        };
      } else {
        console.log('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    // Store in localStorage to not show again for a while
    localStorage.setItem('notificationPromptDismissed', Date.now().toString());
  };

  // Helper function to convert VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Subscribe to push notifications
  const subscribeToPushNotifications = async () => {
    if (!user?.id) return;

    try {
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Get VAPID public key from environment
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
          console.error('VAPID public key not configured');
          return;
        }

        // Subscribe to push
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      // Send subscription to backend
      const response = await fetch('/api/push-subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          subscription: subscription.toJSON(),
        }),
      });

      if (response.ok) {
        console.log('Push subscription saved successfully');
      } else {
        console.error('Failed to save push subscription');
      }
    } catch (error) {
      console.error('Error subscribing to push:', error);
    }
  };

  // Don't show if permission already granted or denied, or if no user, or if dismissed recently
  if (!user || !showPrompt || permission !== 'default' || isDismissedRecently) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>🔔</div>
        <div className={styles.text}>
          <h3 className={styles.title}>Stay Updated!</h3>
          <p className={styles.message}>
            Enable notifications to get instant updates about messages and friend requests.
          </p>
        </div>
        <div className={styles.buttons}>
          <button className={styles.enableButton} onClick={requestPermission}>
            Enable
          </button>
          <button className={styles.dismissButton} onClick={dismissPrompt}>
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
