import { cache } from 'react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { PublicSiteSeo, ServiceItem, SiteControls, SITE_SEO_DEFAULTS } from '@/types';

type WidgetRecord = {
  type: string;
  content: Record<string, unknown>;
};

export type ProjectItem = { id?: string; name: string; desc: string; image_url?: string; active?: boolean };
export type ReviewItem = { quote: string; name: string; role: string };

export type SiteContent = {
  hero: {
    badge: string;
    title: string;
    highlight: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    assistantNote: string;
    /** Optional hero image (base64 data URL or public URL). Shown in the right panel of the hero card. */
    image_url: string;
  };
  about: {
    title: string;
    heritageTitle: string;
    heritageText: string;
    /** Small caps line above main title (homepage + /about) */
    sectionEyebrow: string;
    /** Pill label above heritage block */
    heritageLabel: string;
    image_url: string;
  };
  services: {
    title: string;
    subtitle: string;
    items: ServiceItem[];
  };
  projects: {
    title: string;
    subtitle: string;
    items: ProjectItem[];
  };
  reviews: {
    title: string;
    subtitle: string;
    items: ReviewItem[];
  };
  contact: {
    title: string;
    subtitle: string;
  };
};

export type PublicFooterSettings = {
  brand_title: string;
  tagline: string;
  copyright: string;
  nav_heading: string;
  connect_heading: string;
  nav_links: Array<{ href: string; label: string }>;
};

export type { PublicSiteSeo } from '@/types';

export type PublicSettings = {
  whatsapp_number: string;
  contact_info: {
    email: string;
    phone: string;
    address: string;
    hours: string;
    map_embed_url: string;
  };
  social_links: Array<{ platform: string; url: string }>;
  footer: PublicFooterSettings;
  controls: Required<SiteControls>;
  /** Elfsight Google Reviews app UUID; empty = do not load third-party embed (avoids console errors). */
  elfsight_google_reviews_app_id: string;
  seo: PublicSiteSeo;
};

const defaultContent: SiteContent = {
  hero: {
    badge: 'SRI LANKA - 35 YEARS OF MASTERY',
    title: 'The art of precision pattern making',
    highlight: 'precision',
    description: 'Masterful apparel solutions tailored to your vision. We blend traditional craftsmanship with modern CAD technology.',
    primaryCta: 'Get a free quote',
    secondaryCta: 'View our work',
    assistantNote: 'CAD workflow optimized',
    image_url: '',
  },
  about: {
    title: 'Masters of the craft, built over decades',
    heritageTitle: 'Three and a half decades of unwavering excellence.',
    heritageText:
      "Founded in 1988 in Sri Lanka's apparel heartland, Pattern.lk began as a boutique atelier. Today we merge legacy craftsmanship with CAD-driven systems for global brands.",
    sectionEyebrow: 'About us',
    heritageLabel: 'Our heritage',
    image_url: '',
  },
  services: {
    title: 'Technical precision for every stitch',
    subtitle: 'OUR SERVICES',
    items: [
      { title: 'Pattern Development', text: 'Technical pattern drafting with production-ready precision for high-end apparel.' },
      { title: 'Sizing & Grading', text: 'Grade-rule systems that preserve silhouette and fit consistency across all sizes.' },
      { title: 'Tech Pack Design', text: 'Comprehensive technical packs with callouts, specs, and construction details.' },
      { title: 'Sample Creation', text: 'Prototype support for premium fabrics and structured garments from first pass.' },
      { title: 'Marker Making', text: 'Fabric-efficient marker planning that optimizes layout and reduces waste.' },
      { title: 'Bulk Production Support', text: 'On-call development support to de-risk quality and fit during manufacturing.' },
    ],
  },
  projects: {
    title: 'Our Projects',
    subtitle: 'Explore our gallery of technical triumphs. From complex high-fashion drapes to precision-engineered activewear.',
    items: [
      { name: 'The Signature Tailored Blazer', desc: 'Architecture-inspired blazer with precision-engineered balance lines.' },
      { name: 'High-Performance Compression Set', desc: '4-way stretch activewear grading that preserves tension and support.' },
      { name: 'Silk Charmouse Evening Gown', desc: 'Bias-cut evening wear with soft drape behavior mapped for consistency.' },
      { name: 'Structured Utility Outerwear', desc: 'Reinforced seam architecture for functional, urban outerwear collections.' },
    ],
  },
  reviews: {
    title: "Trusted by the world's most discerning fashion houses.",
    subtitle: 'TESTIMONIALS',
    items: [
      {
        quote: 'The precision in their digital grading is unmatched. We saw a 18% reduction in fabric waste after switching our technical patterns to Pattern.lk.',
        name: 'Anusha Wijesinghe',
        role: 'Founder, Atelier Apparel',
      },
      {
        quote: 'Working with a team that has 35 years of heritage gives us immense confidence. They understand the nuances of fit like no one else in Sri Lanka.',
        name: 'Julian Reed',
        role: 'Creative Director, Sette & Co',
      },
      {
        quote: 'Their tech packs are incredibly detailed. It streamlined our entire production process with overseas manufacturers.',
        name: 'Sarah Mendis',
        role: 'Lead Designer, Ceylon Silk',
      },
      {
        quote: 'From manual drafting to CAD, their versatility is what keeps us coming back. They are an essential extension of our design studio.',
        name: 'Michael de Silva',
        role: 'Operations Manager, Urban Fit',
      },
    ],
  },
  contact: {
    title: "Let's craft your next masterpiece together",
    subtitle: 'GET IN TOUCH',
  },
};

const defaultFooter: PublicFooterSettings = {
  brand_title: 'Pattern.lk',
  tagline:
    'Premium apparel pattern making with 35+ years of precision and craftsmanship in the heart of Sri Lanka.',
  copyright: '© 2026 Pattern.lk. All rights reserved.',
  nav_heading: 'NAVIGATION',
  connect_heading: 'CONNECT',
  nav_links: [
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/projects', label: 'Projects' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/contact', label: 'Contact' },
  ],
};

const defaultSettings: PublicSettings = {
  whatsapp_number: '+94 77 000 0000',
  contact_info: {
    email: 'hello@pattern.lk',
    phone: '+94 77 000 0000',
    address: 'Colombo, Sri Lanka',
    hours: 'Mon-Fri, 9-6',
    map_embed_url: 'https://www.google.com/maps?q=Colombo%2C%20Sri%20Lanka&output=embed',
  },
  social_links: [],
  footer: defaultFooter,
  elfsight_google_reviews_app_id: '',
  seo: SITE_SEO_DEFAULTS,
  controls: {
    maintenance_mode: false,
    pages: {
      home: true,
      about: true,
      services: true,
      projects: true,
      reviews: true,
      contact: true,
    },
    sections: {
      hero: true,
      about: true,
      services: true,
      projects: true,
      reviews: true,
      contact: true,
    },
  },
};

function getWidget(widgets: WidgetRecord[], type: string) {
  return widgets.find(widget => widget.type === type)?.content ?? {};
}

function getString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function getOptionalString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function getArray<T>(value: unknown, fallback: T[]) {
  return Array.isArray(value) ? (value as T[]) : fallback;
}

export async function getPublicContent() {
  if (!isSupabaseConfigured()) return defaultContent;

  const supabase = await createClient();
  const { data } = await supabase.from('widgets').select('type, content').eq('visible', true).order('order');
  const widgets = (data ?? []) as WidgetRecord[];

  const hero = getWidget(widgets, 'hero');
  const about = getWidget(widgets, 'about');
  const services = getWidget(widgets, 'services');
  const projects = getWidget(widgets, 'portfolio');
  const reviews = getWidget(widgets, 'testimonials');
  const contact = getWidget(widgets, 'contact');

  return {
    hero: {
      badge: getString(hero.badge, defaultContent.hero.badge),
      title: getString(hero.title, defaultContent.hero.title),
      highlight: getString(hero.highlight, defaultContent.hero.highlight),
      description: getString(hero.description, defaultContent.hero.description),
      primaryCta: getString(hero.primaryCta, defaultContent.hero.primaryCta),
      secondaryCta: getString(hero.secondaryCta, defaultContent.hero.secondaryCta),
      assistantNote: getString(hero.assistantNote, defaultContent.hero.assistantNote),
      image_url: getOptionalString(hero.image_url),
    },
    about: {
      title: getString(about.title, defaultContent.about.title),
      heritageTitle: getString(about.heritageTitle, defaultContent.about.heritageTitle),
      heritageText: getString(about.heritageText, defaultContent.about.heritageText),
      sectionEyebrow: getString(about.sectionEyebrow, defaultContent.about.sectionEyebrow),
      heritageLabel: getString(about.heritageLabel, defaultContent.about.heritageLabel),
      image_url: getOptionalString(about.image_url),
    },
    services: {
      title: getString(services.title, defaultContent.services.title),
      subtitle: getString(services.subtitle, defaultContent.services.subtitle),
      items: getArray<ServiceItem>(services.items, defaultContent.services.items)
        .filter(item => item.active !== false)
        .map(item => ({
          ...item,
          image_url: getOptionalString(item.image_url),
        })),
    },
    projects: {
      title: getString(projects.title, defaultContent.projects.title),
      subtitle: getString(projects.subtitle, defaultContent.projects.subtitle),
      items: getArray<ProjectItem>(projects.items, defaultContent.projects.items).filter(item => item.active !== false),
    },
    reviews: {
      title: getString(reviews.title, defaultContent.reviews.title),
      subtitle: getString(reviews.subtitle, defaultContent.reviews.subtitle),
      items: getArray<ReviewItem>(reviews.items, defaultContent.reviews.items),
    },
    contact: {
      title: getString(contact.title, defaultContent.contact.title),
      subtitle: getString(contact.subtitle, defaultContent.contact.subtitle),
    },
  } satisfies SiteContent;
}

export const getPublicSettings = cache(async (): Promise<PublicSettings> => {
  if (!isSupabaseConfigured()) {
    const fromEnv = (process.env.NEXT_PUBLIC_ELFSIGHT_GOOGLE_REVIEWS_APP_ID ?? '').trim();
    return fromEnv ? { ...defaultSettings, elfsight_google_reviews_app_id: fromEnv } : defaultSettings;
  }

  const supabase = await createClient();
  const { data } = await supabase.from('site_settings').select('whatsapp_number, contact_info, social_links').eq('id', 1).single();

  if (!data) {
    const fromEnv = (process.env.NEXT_PUBLIC_ELFSIGHT_GOOGLE_REVIEWS_APP_ID ?? '').trim();
    return fromEnv ? { ...defaultSettings, elfsight_google_reviews_app_id: fromEnv } : defaultSettings;
  }

  const rawFooter = data.contact_info?.footer as Record<string, unknown> | undefined;
  const rawControls = data.contact_info?.controls as SiteControls | undefined;
  const rawSeo = data.contact_info?.seo as Record<string, unknown> | undefined;
  const navFromDb = getArray<{ href: string; label: string }>(rawFooter?.nav_links, []);
  const rawElfsight = data.contact_info?.elfsight_google_reviews_app_id as unknown;
  const elfsightFromDb =
    rawElfsight == null
      ? ''
      : typeof rawElfsight === 'string'
        ? rawElfsight.trim()
        : String(rawElfsight).trim();
  const elfsightFromEnv = (process.env.NEXT_PUBLIC_ELFSIGHT_GOOGLE_REVIEWS_APP_ID ?? '').trim();
  const elfsight_google_reviews_app_id = elfsightFromDb || elfsightFromEnv;

  const site_title = getString(rawSeo?.site_title, SITE_SEO_DEFAULTS.site_title);
  const meta_description = getString(rawSeo?.meta_description, SITE_SEO_DEFAULTS.meta_description);
  const og_title = getString(rawSeo?.og_title, site_title);
  const og_description = getString(rawSeo?.og_description, meta_description);
  const og_image_url = getOptionalString(rawSeo?.og_image_url) || SITE_SEO_DEFAULTS.og_image_url;
  const favicon_url = getOptionalString(rawSeo?.favicon_url) || SITE_SEO_DEFAULTS.favicon_url;

  return {
    whatsapp_number: getString(data.whatsapp_number, defaultSettings.whatsapp_number),
    contact_info: {
      email: getString(data.contact_info?.email, defaultSettings.contact_info.email),
      phone: getString(data.contact_info?.phone, defaultSettings.contact_info.phone),
      address: getString(data.contact_info?.address, defaultSettings.contact_info.address),
      hours: getString(data.contact_info?.hours, defaultSettings.contact_info.hours),
      map_embed_url: getString(data.contact_info?.map_embed_url, defaultSettings.contact_info.map_embed_url),
    },
    social_links: getArray<{ platform: string; url: string }>(data.social_links, defaultSettings.social_links),
    footer: {
      brand_title: getString(rawFooter?.brand_title, defaultFooter.brand_title),
      tagline: getString(rawFooter?.tagline, defaultFooter.tagline),
      copyright: getString(rawFooter?.copyright, defaultFooter.copyright),
      nav_heading: getString(rawFooter?.nav_heading, defaultFooter.nav_heading),
      connect_heading: getString(rawFooter?.connect_heading, defaultFooter.connect_heading),
      nav_links: navFromDb.length > 0 ? navFromDb : defaultFooter.nav_links,
    },
    elfsight_google_reviews_app_id,
    seo: {
      site_title,
      meta_description,
      og_title,
      og_description,
      og_image_url,
      favicon_url,
    },
    controls: {
      maintenance_mode: rawControls?.maintenance_mode ?? defaultSettings.controls.maintenance_mode,
      pages: {
        home: rawControls?.pages?.home ?? defaultSettings.controls.pages.home,
        about: rawControls?.pages?.about ?? defaultSettings.controls.pages.about,
        services: rawControls?.pages?.services ?? defaultSettings.controls.pages.services,
        projects: rawControls?.pages?.projects ?? defaultSettings.controls.pages.projects,
        reviews: rawControls?.pages?.reviews ?? defaultSettings.controls.pages.reviews,
        contact: rawControls?.pages?.contact ?? defaultSettings.controls.pages.contact,
      },
      sections: {
        hero: rawControls?.sections?.hero ?? defaultSettings.controls.sections.hero,
        about: rawControls?.sections?.about ?? defaultSettings.controls.sections.about,
        services: rawControls?.sections?.services ?? defaultSettings.controls.sections.services,
        projects: rawControls?.sections?.projects ?? defaultSettings.controls.sections.projects,
        reviews: rawControls?.sections?.reviews ?? defaultSettings.controls.sections.reviews,
        contact: rawControls?.sections?.contact ?? defaultSettings.controls.sections.contact,
      },
    },
  } satisfies PublicSettings;
});
