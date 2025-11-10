import './globals.css';

export const metadata = {
  title: 'Cyclists Social Network',
  description: 'Connect with cyclists around the world',
  manifest: '/manifest.json',
  themeColor: '#007AFF',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#007AFF" />
      </head>
      <body>{children}</body>
    </html>
  );
}
