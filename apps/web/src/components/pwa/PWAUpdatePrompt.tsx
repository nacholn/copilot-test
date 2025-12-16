'use client';

import { useEffect, useState } from 'react';
import styles from './PWAUpdatePrompt.module.css';

export function PWAUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Check for updates periodically (every 60 seconds)
    const checkForUpdates = () => {
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    };

    const interval = setInterval(checkForUpdates, 60000);

    // Listen for service worker updates
    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is installed and waiting
              setWaitingWorker(newWorker);
              setShowPrompt(true);
            }
          });
        }
      });

      // Check if there's already a waiting worker
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowPrompt(true);
      }
    });

    // Listen for controller change (when new SW takes over)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      // Tell the waiting service worker to skip waiting
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.icon}>🔄</div>
        <h2 className={styles.title}>New Version Available!</h2>
        <p className={styles.message}>
          A new version of Cyclists Social Network is available. 
          Update now to get the latest features and improvements.
        </p>
        <div className={styles.buttons}>
          <button className={styles.updateButton} onClick={handleUpdate}>
            Update Now
          </button>
          <button className={styles.dismissButton} onClick={handleDismiss}>
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
