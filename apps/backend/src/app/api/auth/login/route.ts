import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@bicicita/config';
import { query } from '@/lib/db';
import type { LoginInput, ApiResponse } from '@bicicita/config';

export async function POST(request: NextRequest) {
  try {
    const body: LoginInput = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error?.message || 'Failed to login',
        },
        { status: 401 }
      );
    }

    // Update last_login_at for interaction score tracking
    try {
      await query(
        'UPDATE profiles SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = $1',
        [data.user.id]
      );
    } catch (updateError) {
      console.error('Error updating last_login_at:', updateError);
      // Don't fail the login if this update fails
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          user: data.user,
          session: data.session,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
