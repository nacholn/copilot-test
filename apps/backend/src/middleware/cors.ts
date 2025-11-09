/**
 * CORS Middleware
 * 
 * Enables Cross-Origin Resource Sharing for API endpoints
 * Allows requests from web and mobile applications
 */

import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Apply CORS headers to API responses
 * Allows requests from localhost during development
 */
export function corsMiddleware(req: NextApiRequest, res: NextApiResponse) {
  // Allow requests from web app (localhost:3000) and mobile
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:19006', // Expo web
  ];

  const origin = req.headers.origin;
  
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
}
