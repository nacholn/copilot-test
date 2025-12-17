import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@bicicita/config';
import type { RecoverPasswordInput, ApiResponse } from '@bicicita/config';

export async function POST(request: NextRequest) {
  try {
    const body: RecoverPasswordInput = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Email is required',
        },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });

    if (error) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { message: 'Password recovery email sent' },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password recovery error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
