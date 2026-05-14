import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail, thankYouEmailHtml } from '@/lib/gmail';

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  whatsapp: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const data = contactSchema.parse(body);

    const { error } = await supabase.from('messages').insert({
      name: data.name,
      email: data.email || '',
      whatsapp: data.whatsapp || null,
      subject: data.subject || null,
      message: data.message,
    });

    if (error) {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    // Send thank-you email if a valid email was provided
    if (data.email) {
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
            to: data.email,
            subject: 'Thank you for reaching out — Pattern.lk',
            html: thankYouEmailHtml({
              name: data.name,
              subject: data.subject,
            }),
          });
        }
      } catch {
        // Email failure is non-fatal — the message is already saved
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
