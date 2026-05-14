import type { ReactNode } from 'react';
import { Clock3, Globe, Mail, MessageCircle } from 'lucide-react';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import ContactForm from '@/components/ContactForm';
import MaintenanceMode from '@/components/MaintenanceMode';
import PageIntro from '@/components/public/PageIntro';
import { PageSection } from '@/components/public/PageSection';
import RevealOnScroll from '@/components/animations/RevealOnScroll';
import { getPublicContent, getPublicSettings } from '@/lib/content';
import { notFound } from 'next/navigation';
import { cardSurface, eyebrow, mainShell } from '@/lib/publicStyles';
import { cn } from '@/lib/utils';

export default async function ContactPage() {
  const [content, settings] = await Promise.all([getPublicContent(), getPublicSettings()]);
  if (settings.controls.maintenance_mode) return <MaintenanceMode />;
  if (!settings.controls.pages.contact) notFound();
  const mapUrl = toEmbedMapUrl(settings.contact_info.map_embed_url || settings.contact_info.address);
  return (
    <main className={mainShell}>
      <SiteHeader />
      <PageSection className="pb-20 md:pb-28">
        <PageIntro
          eyebrowText={content.contact.subtitle}
          title={content.contact.title}
          align="center"
        />
        <RevealOnScroll className="mt-12" delay={0.05}>
          <ContactForm />
        </RevealOnScroll>

        <RevealOnScroll className="mt-10 md:mt-12" delay={0.06}>
          <ContactDetailsPanel
            whatsapp={settings.whatsapp_number}
            email={settings.contact_info.email}
            address={settings.contact_info.address}
            hours={settings.contact_info.hours}
          />
        </RevealOnScroll>

        {mapUrl ? (
          <RevealOnScroll
            className="mt-10 overflow-hidden rounded-[1.35rem] ring-1 ring-[#0D1B2A]/[0.06] shadow-[0_22px_60px_-38px_rgba(13,27,42,0.55)] md:mt-12"
            delay={0.08}
          >
            <iframe
              title="Business location map"
              src={mapUrl}
              className="aspect-[4/5] min-h-[200px] w-full bg-[#E6EAF0] sm:aspect-[21/9] sm:min-h-[240px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </RevealOnScroll>
        ) : null}
      </PageSection>
      <SiteFooter />
    </main>
  );
}

function toEmbedMapUrl(raw: string | undefined) {
  const input = raw?.trim();
  if (!input) return '';

  if (input.includes('output=embed') || input.includes('/maps/embed')) {
    return input;
  }

  try {
    const url = new URL(input);
    const knownQuery =
      url.searchParams.get('q') ||
      url.searchParams.get('query') ||
      url.searchParams.get('destination') ||
      url.searchParams.get('daddr');

    if (knownQuery) {
      return `https://www.google.com/maps?q=${encodeURIComponent(knownQuery)}&output=embed`;
    }
  } catch {
    // Not a full URL; treat as address/place text.
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(input)}&output=embed`;
}

function whatsappHref(raw: string) {
  const digits = raw.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : undefined;
}

function mailtoHref(email: string) {
  const t = email.trim();
  return t ? `mailto:${t}` : undefined;
}

function mapsSearchHref(address: string) {
  const t = address.trim();
  return t ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t)}` : undefined;
}

function ContactDetailsPanel({
  whatsapp,
  email,
  address,
  hours,
}: {
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
}) {
  const rows: Array<{
    title: string;
    value: string;
    icon: ReactNode;
    href?: string;
    external?: boolean;
  }> = [
    {
      title: 'WhatsApp',
      value: whatsapp,
      icon: <MessageCircle className="h-5 w-5" aria-hidden />,
      href: whatsappHref(whatsapp),
      external: true,
    },
    {
      title: 'Email',
      value: email,
      icon: <Mail className="h-5 w-5" aria-hidden />,
      href: mailtoHref(email),
    },
    {
      title: 'Studio',
      value: address,
      icon: <Globe className="h-5 w-5" aria-hidden />,
      href: mapsSearchHref(address),
      external: true,
    },
    {
      title: 'Hours',
      value: hours,
      icon: <Clock3 className="h-5 w-5" aria-hidden />,
    },
  ].filter(row => row.value.trim().length > 0);

  if (rows.length === 0) return null;

  return (
    <section className={cn(cardSurface, 'p-6 md:p-9')}>
      <header className="border-b border-[#0D1B2A]/[0.06] pb-6 md:pb-8">
        <p className={eyebrow}>Contact</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#0D1B2A] md:text-2xl">Studio &amp; direct lines</h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#555555]">
          Prefer WhatsApp for quick questions; use email when you need to share files or longer briefs.
        </p>
      </header>
      <ul className="mt-0 divide-y divide-[#0D1B2A]/[0.06]" role="list">
        {rows.map(row => (
          <li key={row.title} className="flex gap-4 py-5 md:gap-5 md:py-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37]/12 text-[#B8941F] ring-1 ring-[#D4AF37]/25">
              {row.icon}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#555555]">{row.title}</p>
              {row.href && row.value.trim() ? (
                <a
                  href={row.href}
                  className="mt-2 block text-[15px] font-medium leading-snug text-[#0D1B2A] underline decoration-[#0D1B2A]/15 underline-offset-[5px] transition hover:decoration-[#D4AF37] hover:decoration-2"
                  {...(row.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {row.value}
                </a>
              ) : (
                <p className="mt-2 whitespace-pre-line text-[15px] font-medium leading-snug text-[#0D1B2A]">{row.value}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
