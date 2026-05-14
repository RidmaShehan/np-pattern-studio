import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/gmail';
import { createClient } from '@/lib/supabase/server';

/** Admin-only: initiate Gmail OAuth flow. */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = getAuthUrl();
  return NextResponse.redirect(url);
}
