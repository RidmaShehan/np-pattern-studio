-- Add whatsapp, admin reply, and gmail credentials to support Gmail-powered messaging

-- Add whatsapp column to messages
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- Add admin reply tracking columns
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS admin_reply TEXT,
  ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;

-- Store Gmail OAuth refresh token inside site_settings.contact_info
-- (no schema change needed — contact_info is already JSONB)
-- We use the key: contact_info->>'gmail_refresh_token'
-- And the sender email: contact_info->>'gmail_sender_email'
