import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bicycle Network - Find Your Cycling Match',
  description: 'Connect with cyclists in your area. Swipe, match, and ride together!',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
