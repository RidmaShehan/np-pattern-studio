-- NP Pattern Studio: seed / refresh services and about widget content (public.widgets JSONB)

-- ---------------------------------------------------------------------------
-- Services
-- ---------------------------------------------------------------------------

WITH svc AS (
  SELECT id
  FROM public.widgets
  WHERE type = 'services'
  ORDER BY "order", created_at
  LIMIT 1
),
svc_content AS (
  SELECT $json$
{
  "title": "Professional solutions from pattern to production",
  "subtitle": "OUR SERVICES",
  "items": [
    {
      "id": "np-svc-pattern-design",
      "title": "Pattern Design (Digital & Manual)",
      "text": "Professional digital and manual garment pattern making tailored for accurate fitting, quality construction, and efficient production. With over 35 years of industry experience, we create precise patterns for all types of apparel, ensuring excellent fit, easy production handling, and industry-standard garment development for startups and established fashion brands alike.",
      "active": true
    },
    {
      "id": "np-svc-grading",
      "title": "Pattern Grading",
      "text": "Accurate pattern grading services to convert base patterns into multiple sizes while maintaining proper fit, balance, and garment proportions. Ideal for fashion brands preparing collections for commercial production.",
      "active": true
    },
    {
      "id": "np-svc-tech-pack",
      "title": "Tech Pack Design",
      "text": "Comprehensive tech pack creation including garment specifications, measurements, construction details, fabric information, trims, and production instructions. Our detailed tech packs help manufacturers reduce errors and achieve consistent quality.",
      "active": true
    },
    {
      "id": "np-svc-fit-samples",
      "title": "Garment Fit Samples",
      "text": "Professional fit sample development to evaluate garment sizing, fitting, comfort, and overall appearance before production. We ensure every sample meets design expectations and production standards.",
      "active": true
    },
    {
      "id": "np-svc-mini-bulk",
      "title": "Mini Bulk Optimization",
      "text": "Efficient mini bulk production planning and optimization for startups and small fashion brands. We help improve garment consistency, reduce production issues, and support smooth small-scale manufacturing processes.",
      "active": true
    }
  ]
}
$json$::jsonb AS content
)
UPDATE public.widgets w
SET
  title = 'Services Section',
  content = (SELECT content FROM svc_content),
  visible = true,
  updated_at = NOW()
FROM svc
WHERE w.id = svc.id;

INSERT INTO public.widgets (title, type, content, visible, "order")
SELECT
  'Services Section',
  'services',
  (SELECT content FROM (
    SELECT $json$
{
  "title": "Professional solutions from pattern to production",
  "subtitle": "OUR SERVICES",
  "items": [
    {
      "id": "np-svc-pattern-design",
      "title": "Pattern Design (Digital & Manual)",
      "text": "Professional digital and manual garment pattern making tailored for accurate fitting, quality construction, and efficient production. With over 35 years of industry experience, we create precise patterns for all types of apparel, ensuring excellent fit, easy production handling, and industry-standard garment development for startups and established fashion brands alike.",
      "active": true
    },
    {
      "id": "np-svc-grading",
      "title": "Pattern Grading",
      "text": "Accurate pattern grading services to convert base patterns into multiple sizes while maintaining proper fit, balance, and garment proportions. Ideal for fashion brands preparing collections for commercial production.",
      "active": true
    },
    {
      "id": "np-svc-tech-pack",
      "title": "Tech Pack Design",
      "text": "Comprehensive tech pack creation including garment specifications, measurements, construction details, fabric information, trims, and production instructions. Our detailed tech packs help manufacturers reduce errors and achieve consistent quality.",
      "active": true
    },
    {
      "id": "np-svc-fit-samples",
      "title": "Garment Fit Samples",
      "text": "Professional fit sample development to evaluate garment sizing, fitting, comfort, and overall appearance before production. We ensure every sample meets design expectations and production standards.",
      "active": true
    },
    {
      "id": "np-svc-mini-bulk",
      "title": "Mini Bulk Optimization",
      "text": "Efficient mini bulk production planning and optimization for startups and small fashion brands. We help improve garment consistency, reduce production issues, and support smooth small-scale manufacturing processes.",
      "active": true
    }
  ]
}
$json$::jsonb AS content
  ) x),
  true,
  COALESCE((SELECT MAX("order") + 1 FROM public.widgets), 0)
WHERE NOT EXISTS (SELECT 1 FROM public.widgets WHERE type = 'services');

-- ---------------------------------------------------------------------------
-- About
-- ---------------------------------------------------------------------------

WITH ab AS (
  SELECT id
  FROM public.widgets
  WHERE type = 'about'
  ORDER BY "order", created_at
  LIMIT 1
),
about_content AS (
  SELECT $json$
{
  "sectionEyebrow": "About us",
  "title": "About Us",
  "heritageLabel": "NP Pattern Studio",
  "heritageTitle": "Welcome to NP Pattern Studio",
  "heritageText": "A professional garment pattern making and technical design studio based in the heart of Galle. With over 35 years of industry experience, we provide reliable and industry-standard solutions for fashion brands, apparel manufacturers, and emerging designers. Our expertise covers every stage of garment development, including digital and manual pattern design, grading, tech pack creation, garment fit samples, and mini bulk production optimization. We combine technical precision with creative understanding to ensure every garment meets the highest standards of fit, quality, and production efficiency. At NP Pattern Studio, we believe that a perfect garment begins with a perfect pattern. Whether you are launching a new fashion label or expanding an established brand, we are committed to delivering professional craftsmanship, accurate technical support, and dependable service tailored to your production needs.",
  "image_url": ""
}
$json$::jsonb AS content
)
UPDATE public.widgets w
SET
  title = 'About Section',
  content = (SELECT content FROM about_content),
  visible = true,
  updated_at = NOW()
FROM ab
WHERE w.id = ab.id;

INSERT INTO public.widgets (title, type, content, visible, "order")
SELECT
  'About Section',
  'about',
  (SELECT content FROM (
    SELECT $json$
{
  "sectionEyebrow": "About us",
  "title": "About Us",
  "heritageLabel": "NP Pattern Studio",
  "heritageTitle": "Welcome to NP Pattern Studio",
  "heritageText": "A professional garment pattern making and technical design studio based in the heart of Galle. With over 35 years of industry experience, we provide reliable and industry-standard solutions for fashion brands, apparel manufacturers, and emerging designers. Our expertise covers every stage of garment development, including digital and manual pattern design, grading, tech pack creation, garment fit samples, and mini bulk production optimization. We combine technical precision with creative understanding to ensure every garment meets the highest standards of fit, quality, and production efficiency. At NP Pattern Studio, we believe that a perfect garment begins with a perfect pattern. Whether you are launching a new fashion label or expanding an established brand, we are committed to delivering professional craftsmanship, accurate technical support, and dependable service tailored to your production needs.",
  "image_url": ""
}
$json$::jsonb AS content
  ) x),
  true,
  COALESCE((SELECT MAX("order") + 1 FROM public.widgets), 0)
WHERE NOT EXISTS (SELECT 1 FROM public.widgets WHERE type = 'about');
