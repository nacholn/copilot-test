import type { Viewport } from 'next';

/**
 * Shared viewport configuration for the PWA
 * Can be reused across layout and pages
 */
export const defaultViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#FE3C72',
};
