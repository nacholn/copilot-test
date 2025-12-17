import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';
import { Header } from '../components/ui/Header';
import { PWAUpdatePrompt } from '../components/pwa/PWAUpdatePrompt';
import { WebPushNotificationPermission } from '../components/pwa/WebPushNotificationPermission';
import { PWAInstallPrompt } from '../components/pwa/PWAInstallPrompt';
import { defaultViewport } from '../config/viewport';

export const metadata = {
  title: 'Bicicita',
  description:
    'Connect with bicicita around the world. Share routes, find cycling partners, and join the community.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bicicita',
  },
};

export const viewport = defaultViewport;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#007bff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Bicicita" />
      </head>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <WebSocketProvider>
              <Header />
              {children}
              <PWAUpdatePrompt />
              <PWAInstallPrompt />
              <WebPushNotificationPermission />
            </WebSocketProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
