import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import type { ApiResponse } from '@cyclists/config';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// POST login for webadmin (admin users only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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

    // Authenticate with Supabase
    const supabase = getSupabaseAdmin();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Check if user is admin
    const result = await query('SELECT is_admin FROM profiles WHERE user_id = $1', [
      authData.user.id,
    ]);

    if (result.rows.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'User profile not found',
        },
        { status: 404 }
      );
    }

    const isAdmin = result.rows[0].is_admin;

    if (!isAdmin) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Access denied. Admin privileges required.',
        },
        { status: 403 }
      );
    }

    // Return success with session data
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          user: {
            id: authData.user.id,
            email: authData.user.email,
          },
          session: authData.session,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WebAdmin] Login error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
