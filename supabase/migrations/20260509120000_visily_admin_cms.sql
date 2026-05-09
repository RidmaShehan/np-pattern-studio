-- Visily website: CMS tables for admin panel + public reads
-- Applies to: widgets (sections), site_settings, analytics, messages
-- Run via: supabase db push / supabase migration up, or paste in SQL Editor for hosted projects

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- widgets: hero, services, portfolio (projects), about, testimonials, contact, custom
-- Content is JSONB (titles, items with image_url, etc.)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  visible BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT widgets_type_check CHECK (
    type IN (
      'hero',
      'services',
      'portfolio',
      'about',
      'testimonials',
      'contact',
      'custom'
    )
  )
);

-- Upgrade older DBs where portfolio was missing from the CHECK constraint
ALTER TABLE public.widgets DROP CONSTRAINT IF EXISTS widgets_type_check;
ALTER TABLE public.widgets ADD CONSTRAINT widgets_type_check CHECK (
  type IN (
    'hero',
    'services',
    'portfolio',
    'about',
    'testimonials',
    'contact',
    'custom'
  )
);

CREATE INDEX IF NOT EXISTS idx_widgets_order ON public.widgets ("order");
CREATE INDEX IF NOT EXISTS idx_widgets_type ON public.widgets (type);

DROP TRIGGER IF EXISTS tr_widgets_updated_at ON public.widgets;
CREATE TRIGGER tr_widgets_updated_at
  BEFORE UPDATE ON public.widgets
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- site_settings: single row id = 1 (social_links, contact_info, controls, whatsapp)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  social_links JSONB DEFAULT '[]',
  contact_info JSONB DEFAULT '{}',
  whatsapp_number TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);

DROP TRIGGER IF EXISTS tr_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER tr_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

INSERT INTO public.site_settings (id, social_links, contact_info, whatsapp_number)
VALUES (
  1,
  '[]'::jsonb,
  '{"email": "", "phone": "", "address": ""}'::jsonb,
  ''
)
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- analytics (visitor tracking from /api/analytics)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT,
  user_agent TEXT,
  device_model TEXT,
  os TEXT,
  browser TEXT,
  country TEXT,
  page_path TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics (created_at DESC);

-- ---------------------------------------------------------------------------
-- messages (contact form -> admin inbox)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages (created_at DESC);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop named policies if re-running / upgrading (safe for dev)
DROP POLICY IF EXISTS "Public read visible widgets" ON public.widgets;
DROP POLICY IF EXISTS "Public can read visible widgets" ON public.widgets;
DROP POLICY IF EXISTS "Authenticated manage widgets" ON public.widgets;
DROP POLICY IF EXISTS "Authenticated users manage widgets" ON public.widgets;

DROP POLICY IF EXISTS "Public read settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public can read settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated manage settings" ON public.site_settings;
DROP POLICY IF EXISTS "Authenticated users manage settings" ON public.site_settings;

DROP POLICY IF EXISTS "Authenticated read analytics" ON public.analytics;
DROP POLICY IF EXISTS "Authenticated users view analytics" ON public.analytics;
DROP POLICY IF EXISTS "Allow analytics inserts" ON public.analytics;
DROP POLICY IF EXISTS "Service role insert analytics" ON public.analytics;

DROP POLICY IF EXISTS "Public insert contact messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated manage messages" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users view messages" ON public.messages;

-- widgets: published site reads visible rows; admins manage all rows (incl. drafts)
CREATE POLICY "Public read visible widgets"
  ON public.widgets FOR SELECT
  USING (visible = true);

CREATE POLICY "Authenticated manage widgets"
  ON public.widgets FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- site_settings: single row readable by anon (Next.js server uses anon key); admins update
CREATE POLICY "Public read settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated manage settings"
  ON public.site_settings FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- analytics: anon/authenticated insert via API route; only admins read
CREATE POLICY "Allow analytics inserts"
  ON public.analytics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated read analytics"
  ON public.analytics FOR SELECT
  USING (auth.role() = 'authenticated');

-- messages: contact form inserts with anon key; admins manage
CREATE POLICY "Public insert contact messages"
  ON public.messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated manage messages"
  ON public.messages FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
