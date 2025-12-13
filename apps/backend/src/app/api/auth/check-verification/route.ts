import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: 'Invalid email format' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Use admin API to list users filtered by email (more efficient)
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    if (error) {
      console.error('Error listing users:', error);
      return NextResponse.json(
        { success: false, error: 'Unable to check verification status' },
        { status: 500 }
      );
    }

    // Find user by email (case-insensitive)
    const user = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      // If not found in first page, search all users
      const { data: allData, error: allError } = await supabaseAdmin.auth.admin.listUsers();

      if (allError) {
        console.error('Error listing all users:', allError);
        return NextResponse.json(
          { success: false, error: 'Unable to check verification status' },
          { status: 500 }
        );
      }

      const foundUser = allData.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

      if (!foundUser) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        verified: !!foundUser.email_confirmed_at,
        userId: foundUser.id,
      });
    }

    return NextResponse.json({
      success: true,
      verified: !!user.email_confirmed_at,
      userId: user.id,
    });
  } catch (error) {
    console.error('Check verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check verification status' },
      { status: 500 }
    );
  }
}
