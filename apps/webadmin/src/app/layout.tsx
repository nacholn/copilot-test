import './globals.css';

export const metadata = {
  title: 'WebAdmin - Group Management',
  description: 'Admin dashboard for managing groups',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
