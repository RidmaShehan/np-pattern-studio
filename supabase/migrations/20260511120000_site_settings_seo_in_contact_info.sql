-- Site-wide SEO: stored in site_settings.contact_info JSON under key "seo".
-- Keys: site_title, meta_description, og_title, og_description, og_image_url, favicon_url
-- (matches SITE_SEO_DEFAULTS in src/types/index.ts). Existing values win over defaults.

UPDATE public.site_settings
SET contact_info =
  contact_info
  || jsonb_build_object(
    'seo',
    jsonb_build_object(
      'site_title',
      'Visily Studio | Premium Digital Experiences',
      'meta_description',
      'Crafting exceptional digital products and experiences. Explore our work, services, and connect with us.',
      'og_title',
      'Visily Studio | Premium Digital Experiences',
      'og_description',
      'We design and build beautiful, high-performance digital products.',
      'og_image_url',
      '/og-image.jpg',
      'favicon_url',
      '/favicon.ico'
    ) || COALESCE(contact_info->'seo', '{}'::jsonb)
  )
WHERE id = 1;
