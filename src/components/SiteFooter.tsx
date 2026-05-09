import Link from 'next/link';
import { ExternalLink, Globe, Mail, MessageCircle } from 'lucide-react';
import { ReactNode } from 'react';
import { getPublicSettings } from '@/lib/content';
import RevealOnScroll from '@/components/animations/RevealOnScroll';
import { cn } from '@/lib/utils';

export default async function SiteFooter() {
  const settings = await getPublicSettings();
  const { footer } = settings;
  const visibleLinks = footer.nav_links.filter(item => {
    if (item.href === '/') return settings.controls.pages.home;
    if (item.href === '/about') return settings.controls.pages.about;
    if (item.href === '/services') return settings.controls.pages.services;
    if (item.href === '/projects') return settings.controls.pages.projects;
    if (item.href === '/reviews') return settings.controls.pages.reviews;
    if (item.href === '/contact') return settings.controls.pages.contact;
    return true;
  });

  return (
    <RevealOnScroll className="mt-20 w-full md:mt-28">
      <footer className="w-full border-t border-white/10 bg-[#0D1B2A] text-[#EFF1F5]">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-16">
          <div className="grid gap-12 md:grid-cols-[1.2fr_auto_auto] md:gap-10">
            <div>
              <p className="text-2xl font-semibold tracking-tight">{footer.brand_title}</p>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/72">{footer.tagline}</p>
              <div className="mt-8 flex flex-wrap gap-3">
              {settings.social_links.length > 0 ? (
                settings.social_links.map(link => (
                  <a
                    key={`${link.platform}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 text-xs font-medium text-white/90 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-[#D4AF37]/50 hover:bg-white/10"
                  >
                    <SocialPlatformIcon platform={link.platform} />
                    <span>{link.platform}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-55" />
                  </a>
                ))
              ) : (
                <>
                  <SocialIcon>
                    <Globe className="h-4 w-4" />
                  </SocialIcon>
                  <SocialIcon>
                    <MessageCircle className="h-4 w-4" />
                  </SocialIcon>
                  <SocialIcon>
                    <Mail className="h-4 w-4" />
                  </SocialIcon>
                </>
              )}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#D4AF37]/90">{footer.nav_heading}</p>
            <div className="mt-5 space-y-3 text-sm">
              {visibleLinks.map(item => (
                <Link key={item.href} href={item.href} className="block text-white/70 transition hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#D4AF37]/90">{footer.connect_heading}</p>
            <div className="mt-5 space-y-3 text-sm text-white/72">
              <p className="inline-flex items-center gap-2">
                <MessageCircle className="h-4 w-4 shrink-0 text-[#D4AF37]" /> {settings.whatsapp_number}
              </p>
              <p className="inline-flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#D4AF37]" /> {settings.contact_info.email}
              </p>
              {settings.contact_info.phone ? <p>{settings.contact_info.phone}</p> : null}
              {settings.contact_info.address ? <p className="max-w-xs leading-relaxed">{settings.contact_info.address}</p> : null}
            </div>
          </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-8 text-sm text-white/55">{footer.copyright}</div>
        </div>
      </footer>
    </RevealOnScroll>
  );
}

function SocialPlatformIcon({ platform }: { platform: string }) {
  const key = platform.toLowerCase();
  if (key.includes('whatsapp')) return <MessageCircle className="h-4 w-4 shrink-0 text-[#D4AF37]" />;
  if (key.includes('email') || key.includes('mail')) return <Mail className="h-4 w-4 shrink-0 text-[#D4AF37]" />;
  return <Globe className="h-4 w-4 shrink-0 text-[#D4AF37]" />;
}

function SocialIcon({ children }: { children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80',
      )}
    >
      {children}
    </span>
  );
}
