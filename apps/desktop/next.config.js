/**
 * Next.js Configuration for Desktop App
 * 
 * This configuration is optimized for Electron integration.
 * The Next.js app runs inside Electron as the renderer process.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@cycling-network/config', '@cycling-network/ui'],
  // Output standalone for Electron
  output: 'export',
  // Disable image optimization for Electron
  images: {
    unoptimized: true,
  },
  // Use trailing slash for static export
  trailingSlash: true,
};

module.exports = nextConfig;
