import './globals.css';
import { Navigation } from '../components/Navigation';
import { AuthProvider } from '../components/AuthProvider';

export const metadata = {
  title: 'WebAdmin - Management Dashboard',
  description: 'Admin dashboard for managing groups and posts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
