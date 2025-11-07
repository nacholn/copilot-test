/**
 * Health Check API Route
 * 
 * Simple endpoint to verify the API is running
 * GET /api/health
 */

import type { NextApiRequest, NextApiResponse } from 'next';

type HealthResponse = {
  status: string;
  timestamp: string;
  service: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'cycling-network-backend',
  });
}
