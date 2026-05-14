-- Hero image_url + favicon / OG image base64 support
-- -------------------------------------------------------
-- No schema change required: widgets.content and
-- site_settings.contact_info are already JSONB columns that
-- accept arbitrary keys.
--
-- This migration:
--   1. Ensures every existing hero widget row has image_url = ''
--      so the frontend never reads undefined.
--   2. Ensures site_settings row 1 has seo.favicon_url and
--      seo.og_image_url keys initialised (keeps existing values).
-- -------------------------------------------------------

-- 1. Backfill image_url into hero widget content if missing
UPDATE public.widgets
SET content = content || '{"image_url": ""}'::jsonb
WHERE type = 'hero'
  AND (content -> 'image_url') IS NULL;

-- 2. Ensure seo keys exist in site_settings (do not overwrite existing values)
UPDATE public.site_settings
SET contact_info = contact_info ||
  jsonb_build_object(
    'seo',
    jsonb_build_object(
      'favicon_url', COALESCE(contact_info -> 'seo' ->> 'favicon_url', '/favicon.ico'),
      'og_image_url', COALESCE(contact_info -> 'seo' ->> 'og_image_url', '/og-image.jpg')
    ) || COALESCE(contact_info -> 'seo', '{}'::jsonb)
  )
WHERE id = 1
  AND (
    (contact_info -> 'seo' -> 'favicon_url') IS NULL
    OR (contact_info -> 'seo' -> 'og_image_url') IS NULL
  );
