export type ServiceItem = {
  id?: string;
  title: string;
  text: string;
  /** Optional icon image URL (shown instead of the default sparkles icon) */
  image_url?: string;
  active?: boolean;
};

export interface Widget {
  id: string;
  title: string;
  type: 'hero' | 'services' | 'portfolio' | 'about' | 'testimonials' | 'contact' | 'custom';
  content: Record<string, any>;
  visible: boolean;
  order: number;
  created_at: string;
  updated_at: string;
}

export type FooterNavLink = { href: string; label: string };

export type SiteFooterSettings = {
  brand_title?: string;
  tagline?: string;
  copyright?: string;
  nav_heading?: string;
  connect_heading?: string;
  /** Override default nav links; omit or empty to use site defaults */
  nav_links?: FooterNavLink[];
};

export type SiteControls = {
  maintenance_mode?: boolean;
  pages?: {
    home?: boolean;
    about?: boolean;
    services?: boolean;
    projects?: boolean;
    reviews?: boolean;
    contact?: boolean;
  };
  sections?: {
    hero?: boolean;
    about?: boolean;
    services?: boolean;
    projects?: boolean;
    reviews?: boolean;
    contact?: boolean;
  };
};

export interface SiteSettings {
  id: number;
  social_links: Array<{ platform: string; url: string; icon?: string }>;
  contact_info: {
    email?: string;
    phone?: string;
    address?: string;
    hours?: string;
    map_embed_url?: string;
    /** Elfsight widget app UUID only (e.g. f45ce138-bd56-4e17-a6ef-f0bc1d2901c8). Omit to disable embed. */
    elfsight_google_reviews_app_id?: string;
    footer?: SiteFooterSettings;
    controls?: SiteControls;
  };
  whatsapp_number: string;
  updated_at: string;
}

export interface AnalyticsEntry {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  device_model: string | null;
  os: string | null;
  browser: string | null;
  country: string | null;
  page_path: string | null;
  referrer: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  created_at: string;
}
