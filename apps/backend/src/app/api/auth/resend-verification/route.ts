import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@cyclists/config';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Resend verification email using Supabase
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      console.error('Resend verification error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
