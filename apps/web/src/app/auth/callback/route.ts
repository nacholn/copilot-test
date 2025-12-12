import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@cyclists/config';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = getSupabaseClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to register page to complete profile if needed
  return NextResponse.redirect(new URL('/register', request.url));
}
