export const metadata = {
  title: 'Bicicita - Backend',
  description: 'Backend API for Bicicita',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
