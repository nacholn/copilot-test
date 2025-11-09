/**
 * Next.js Configuration for Backend API
 * 
 * This configuration is optimized for API-only usage.
 * The backend serves as the API provider for all client applications.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@cycling-network/config'],
  // Disable page generation as this is API-only
  experimental: {
    appDir: false,
  },
};

module.exports = nextConfig;
