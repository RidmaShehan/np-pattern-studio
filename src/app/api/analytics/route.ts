import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { UAParser } from 'ua-parser-js';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const uaString = request.headers.get('user-agent') || '';
    const parser = new UAParser(uaString);
    const result = parser.getResult();

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';

    const countryFromHeaders =
      request.headers.get('x-vercel-ip-country') ||
      request.headers.get('cf-ipcountry') ||
      null;

    const { error } = await supabase.from('analytics').insert({
      ip_address: ip,
      user_agent: uaString,
      device_model: result.device.model || result.os.name || 'Unknown',
      os: result.os.name || 'Unknown',
      browser: result.browser.name || 'Unknown',
      country: body.country || countryFromHeaders,
      page_path: body.page_path || '/',
      referrer: request.headers.get('referer') || null,
    });

    if (error) {
      console.error('Analytics insert error:', error);
      return NextResponse.json({ success: false }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Analytics error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
