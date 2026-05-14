import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;

export function getOAuth2Client(refreshToken?: string) {
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/gmail/callback`;
  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, redirectUri);
  if (refreshToken) {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
  }
  return oauth2Client;
}

export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/gmail.send'],
  });
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/** Build an RFC 2822 email, base64url-encode it for the Gmail API. */
function buildRawEmail({
  to,
  from,
  subject,
  html,
}: {
  to: string;
  from: string;
  subject: string;
  html: string;
}) {
  const msg = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
  ].join('\r\n');

  return Buffer.from(msg).toString('base64url');
}

export async function sendEmail({
  refreshToken,
  senderEmail,
  to,
  subject,
  html,
}: {
  refreshToken: string;
  senderEmail: string;
  to: string;
  subject: string;
  html: string;
}) {
  const auth = getOAuth2Client(refreshToken);
  const gmail = google.gmail({ version: 'v1', auth });

  const raw = buildRawEmail({ to, from: senderEmail, subject, html });
  await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
}

// ── Email Templates ────────────────────────────────────────────────

export function thankYouEmailHtml({
  name,
  subject,
  brandName = 'Pattern.lk',
}: {
  name: string;
  subject?: string | null;
  brandName?: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Thank you — ${brandName}</title>
</head>
<body style="margin:0;padding:0;background:#F5F4F0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:580px;background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 30px rgba(13,27,42,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#0D1B2A;padding:36px 40px 32px;">
              <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;color:#D4AF37;">${brandName}</p>
              <p style="margin:6px 0 0;font-size:12px;letter-spacing:3px;color:#D4AF37;opacity:0.7;text-transform:uppercase;">Pattern &amp; Design Studio</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:13px;letter-spacing:3px;color:#888;text-transform:uppercase;">Message received</p>
              <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;letter-spacing:-0.5px;color:#0D1B2A;line-height:1.25;">
                Thank you, ${name}!
              </h1>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#555;">
                We have received your enquiry${subject ? ` regarding <strong style="color:#0D1B2A;">${subject}</strong>` : ''} and truly appreciate you reaching out to us.
              </p>
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#555;">
                Our team reviews every message carefully. You can expect a personal reply from us within <strong style="color:#0D1B2A;">1–2 business days</strong>. If your project is time-sensitive, feel free to reach us directly on WhatsApp for faster communication.
              </p>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#555;">
                We look forward to learning more about your vision and exploring how we can bring it to life with precision and craftsmanship.
              </p>
              <!-- Divider -->
              <div style="border-top:1px solid #E8E6E0;margin-bottom:28px;"></div>
              <p style="margin:0;font-size:14px;color:#888;line-height:1.6;">
                With gratitude,<br/>
                <strong style="color:#0D1B2A;">The ${brandName} Team</strong><br/>
                <span style="font-size:12px;">35+ years of precision pattern making · Sri Lanka</span>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F5F4F0;padding:20px 40px;border-top:1px solid #E8E6E0;">
              <p style="margin:0;font-size:11px;color:#AAA;line-height:1.6;text-align:center;">
                You are receiving this because you submitted a contact form at ${brandName}.<br/>
                Please do not reply to this automated email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function replyEmailHtml({
  customerName,
  originalMessage,
  replyText,
  brandName = 'Pattern.lk',
}: {
  customerName: string;
  originalMessage: string;
  replyText: string;
  brandName?: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reply from ${brandName}</title>
</head>
<body style="margin:0;padding:0;background:#F5F4F0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:580px;background:#FFFFFF;border-radius:20px;overflow:hidden;box-shadow:0 4px 30px rgba(13,27,42,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#0D1B2A;padding:36px 40px 32px;">
              <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;color:#D4AF37;">${brandName}</p>
              <p style="margin:6px 0 0;font-size:12px;letter-spacing:3px;color:#D4AF37;opacity:0.7;text-transform:uppercase;">Pattern &amp; Design Studio</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 8px;font-size:13px;letter-spacing:3px;color:#888;text-transform:uppercase;">Reply from us</p>
              <h1 style="margin:0 0 24px;font-size:26px;font-weight:700;letter-spacing:-0.5px;color:#0D1B2A;line-height:1.25;">
                Hi ${customerName},
              </h1>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#555;">
                Thank you for your patience. Here is our response to your enquiry:
              </p>
              <!-- Reply box -->
              <div style="background:#F5F4F0;border-left:3px solid #D4AF37;border-radius:8px;padding:20px 24px;margin-bottom:32px;">
                <p style="margin:0;font-size:15px;line-height:1.75;color:#0D1B2A;white-space:pre-wrap;">${replyText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              </div>
              <!-- Original message reference -->
              <div style="border-top:1px solid #E8E6E0;padding-top:24px;margin-bottom:28px;">
                <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;color:#AAA;text-transform:uppercase;">Your original message</p>
                <p style="margin:0;font-size:13px;line-height:1.65;color:#999;white-space:pre-wrap;">${originalMessage.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              </div>
              <div style="border-top:1px solid #E8E6E0;margin-bottom:28px;"></div>
              <p style="margin:0;font-size:14px;color:#888;line-height:1.6;">
                Warm regards,<br/>
                <strong style="color:#0D1B2A;">The ${brandName} Team</strong><br/>
                <span style="font-size:12px;">35+ years of precision pattern making · Sri Lanka</span>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F5F4F0;padding:20px 40px;border-top:1px solid #E8E6E0;">
              <p style="margin:0;font-size:11px;color:#AAA;line-height:1.6;text-align:center;">
                You are receiving this because you previously contacted ${brandName}.<br/>
                Please reply directly to this email if you have further questions.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
