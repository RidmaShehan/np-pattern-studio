import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/gmail';
import { createClient } from '@/lib/supabase/server';

/** Receives the OAuth2 code from Google, exchanges it, stores the refresh token. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/admin/settings?gmail=error`);
  }

  try {
    const supabase = await createClient();

    // Verify the admin is signed in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(`${appUrl}/admin/login`);
    }

    const tokens = await exchangeCodeForTokens(code);
    if (!tokens.refresh_token) {
      return NextResponse.redirect(`${appUrl}/admin/settings?gmail=no_refresh_token`);
    }

    // Fetch current contact_info to merge
    const { data: settings } = await supabase
      .from('site_settings')
      .select('contact_info')
      .eq('id', 1)
      .single();

    const contactInfo = (settings?.contact_info as Record<string, unknown>) ?? {};

    await supabase.from('site_settings').update({
      contact_info: {
        ...contactInfo,
        gmail_refresh_token: tokens.refresh_token,
      },
    }).eq('id', 1);

    return NextResponse.redirect(`${appUrl}/admin/settings?gmail=connected`);
  } catch {
    return NextResponse.redirect(`${appUrl}/admin/settings?gmail=error`);
  }
}
