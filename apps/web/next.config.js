/**
 * Next.js Configuration for Web PWA
 * 
 * Includes PWA support with next-pwa plugin for progressive web app features.
 * Optimized for performance and accessibility.
 */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@cycling-network/config', '@cycling-network/ui'],
  // Performance optimizations
  swcMinify: true,
  // Image optimization
  images: {
    domains: [],
  },
};

module.exports = withPWA(nextConfig);
