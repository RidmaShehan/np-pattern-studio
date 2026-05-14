import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail, replyEmailHtml } from '@/lib/gmail';

const replySchema = z.object({
  messageId: z.string().uuid(),
  replyText: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Admin-only
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messageId, replyText } = replySchema.parse(body);

    // Fetch the original message
    const { data: msg, error: fetchErr } = await supabase
      .from('messages')
      .select('*')
      .eq('id', messageId)
      .single();

    if (fetchErr || !msg) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Persist the reply and mark as read
    const { error: updateErr } = await supabase
      .from('messages')
      .update({
        admin_reply: replyText,
        replied_at: new Date().toISOString(),
        read: true,
      })
      .eq('id', messageId);

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to save reply' }, { status: 500 });
    }

    // Send reply email if the message has a customer email
    let emailSent = false;
    if (msg.email) {
      try {
        const { data: settings } = await supabase
          .from('site_settings')
          .select('contact_info')
          .eq('id', 1)
          .single();

        const contactInfo = settings?.contact_info as Record<string, string> | null;
        const refreshToken = contactInfo?.gmail_refresh_token;
        const senderEmail = contactInfo?.gmail_sender_email || contactInfo?.email;

        if (refreshToken && senderEmail) {
          await sendEmail({
            refreshToken,
            senderEmail,
            to: msg.email,
            subject: `Re: ${msg.subject ?? 'Your enquiry'} — Pattern.lk`,
            html: replyEmailHtml({
              customerName: msg.name,
              originalMessage: msg.message,
              replyText,
            }),
          });
          emailSent = true;
        }
      } catch {
        // Email failure is non-fatal; reply is already saved
      }
    }

    return NextResponse.json({ success: true, emailSent });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
