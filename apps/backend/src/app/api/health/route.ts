import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    message: 'Backend is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}
