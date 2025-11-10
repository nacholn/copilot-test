export const metadata = {
  title: 'Cyclists Social Network - Backend',
  description: 'Backend API for Cyclists Social Network',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
