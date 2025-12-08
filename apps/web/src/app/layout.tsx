import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';
import { Header } from '../components/Header';

export const metadata = {
  title: 'Cyclists Social Network',
  description: 'Connect with cyclists around the world',
  manifest: '/manifest.json',
  themeColor: '#FE3C72',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FE3C72" />
      </head>
      <body>
        <LanguageProvider>
          <AuthProvider>
            <WebSocketProvider>
              <Header />
              {children}
            </WebSocketProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
