import './globals.css';
import { Navigation } from '../components/Navigation';

export const metadata = {
  title: 'WebAdmin - Management Dashboard',
  description: 'Admin dashboard for managing groups and posts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
