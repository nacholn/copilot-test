import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';
import { Header } from '../components/Header';
import { PWAUpdatePrompt } from '../components/PWAUpdatePrompt';
import { NotificationPermission } from '../components/NotificationPermission';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';

export const metadata = {
  title: 'Cyclists Social Network',
  description: 'Connect with cyclists around the world. Share routes, find cycling partners, and join the community.',
  manifest: '/manifest.json',
  themeColor: '#FE3C72',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Cyclists',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#FE3C72" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Cyclists" />
      </head>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <WebSocketProvider>
              <Header />
              {children}
              <PWAUpdatePrompt />
              <PWAInstallPrompt />
              <NotificationPermission />
            </WebSocketProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
