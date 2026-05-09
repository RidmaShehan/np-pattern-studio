-- Supabase Schema for Visily Website (manual bootstrap — prefer supabase/migrations/)
-- Run this in Supabase SQL Editor if you are not using the CLI migration.

-- Widgets / Sections (dynamic homepage + inner pages; portfolio = projects)
CREATE TABLE IF NOT EXISTS widgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN ('hero', 'services', 'portfolio', 'about', 'testimonials', 'contact', 'custom')
  ),
  content JSONB NOT NULL DEFAULT '{}',
  visible BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  social_links JSONB DEFAULT '[]',
  contact_info JSONB DEFAULT '{}',
  whatsapp_number TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS analytics (
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

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read visible widgets" ON widgets;
DROP POLICY IF EXISTS "Authenticated manage widgets" ON widgets;
DROP POLICY IF EXISTS "Public read settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated manage settings" ON site_settings;
DROP POLICY IF EXISTS "Allow analytics inserts" ON analytics;
DROP POLICY IF EXISTS "Authenticated read analytics" ON analytics;
DROP POLICY IF EXISTS "Public insert contact messages" ON messages;
DROP POLICY IF EXISTS "Authenticated manage messages" ON messages;

CREATE POLICY "Public read visible widgets" ON widgets FOR SELECT USING (visible = true);
CREATE POLICY "Authenticated manage widgets" ON widgets FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Public read settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Authenticated manage settings" ON site_settings FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow analytics inserts" ON analytics FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated read analytics" ON analytics FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Public insert contact messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated manage messages" ON messages FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

INSERT INTO site_settings (id, social_links, contact_info, whatsapp_number)
VALUES (1, '[]', '{"email": "info@example.com", "phone": "+1234567890", "address": "123 Main St"}', '+1234567890')
ON CONFLICT (id) DO NOTHING;
