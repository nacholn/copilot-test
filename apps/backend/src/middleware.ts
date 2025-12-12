import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// CORS configuration (can be a single origin or CSV list). For dev you can set '*' as value.
const RAW_ALLOWED =
  process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || process.env.NEXT_PUBLIC_ALLOWED_ORIGIN || '*';
const ALLOWED_ORIGINS = RAW_ALLOWED.split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const ALLOW_CREDENTIALS = process.env.NEXT_PUBLIC_ALLOW_CREDENTIALS === 'true';

function getAllowedOrigin(requestOrigin: string | null) {
  if (ALLOWED_ORIGINS.length === 0) return '*';
  if (ALLOWED_ORIGINS.includes('*')) return '*';
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) return requestOrigin;
  return null;
}

function setCorsHeaders(res: NextResponse, req: NextRequest) {
  const reqOrigin = req.headers.get('origin');
  const allowed = getAllowedOrigin(reqOrigin);

  if (allowed) {
    res.headers.set('Access-Control-Allow-Origin', allowed);
    if (ALLOW_CREDENTIALS && allowed !== '*') {
      res.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // Expose useful headers if needed
  res.headers.set('Access-Control-Expose-Headers', 'Location');

  return res;
}

export function middleware(req: NextRequest) {
  // Only apply CORS for API routes
  if (req.nextUrl.pathname.startsWith('/api')) {
    // Handle preflight OPTIONS request - return 200 with CORS headers
    if (req.method === 'OPTIONS') {
      const res = new NextResponse(null, { status: 200 });
      res.headers.set('Access-Control-Allow-Origin', '*');
      res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.headers.set('Access-Control-Max-Age', '86400');
      return res;
    }

    const res = NextResponse.next();
    return setCorsHeaders(res, req);
  }

  return NextResponse.next();
}

// Only match API routes
export const config = {
  matcher: ['/api/:path*'],
};
