import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@cyclists/config';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user has a profile
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${backendUrl}/api/profile?userId=${data.user.id}`);
        const profileData = await response.json();

        if (profileData.success && profileData.data) {
          // User has profile, redirect to profile page
          return NextResponse.redirect(new URL('/profile', request.url));
        }
      } catch (err) {
        console.error('Error checking profile:', err);
      }

      // No profile, redirect to home (they'll use the modal to complete registration)
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Fallback redirect to home on error
  return NextResponse.redirect(new URL('/', request.url));
}
