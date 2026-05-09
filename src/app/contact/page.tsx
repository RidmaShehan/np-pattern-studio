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
import { cardSurface, mainShell } from '@/lib/publicStyles';
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ContactInfoCard title="WhatsApp" detail={settings.whatsapp_number} icon={<MessageCircle className="h-4 w-4" />} />
            <ContactInfoCard title="Email" detail={settings.contact_info.email} icon={<Mail className="h-4 w-4" />} />
            <ContactInfoCard title="Location" detail={settings.contact_info.address} icon={<Globe className="h-4 w-4" />} />
            <ContactInfoCard title="Hours" detail={settings.contact_info.hours} icon={<Clock3 className="h-4 w-4" />} />
          </div>
        </RevealOnScroll>

        {mapUrl ? (
          <RevealOnScroll className="mt-8 overflow-hidden rounded-[1.35rem] ring-1 ring-[#0D1B2A]/[0.06] shadow-[0_22px_60px_-38px_rgba(13,27,42,0.55)]">
            <iframe
              title="Business location map"
              src={mapUrl}
              className="aspect-[21/9] min-h-[240px] w-full bg-[#E6EAF0]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </RevealOnScroll>
        ) : null}

        <RevealOnScroll delay={0.08}>
          <ContactForm />
        </RevealOnScroll>
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

function ContactInfoCard({
  title,
  detail,
  icon,
}: {
  title: string;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <article className={cn(cardSurface, 'p-5')}>
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37]/12 text-[#B8941F] ring-1 ring-[#D4AF37]/25">
        {icon}
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#555555]">{title}</p>
      <p className="mt-2 text-[15px] font-medium leading-snug text-[#0D1B2A]">{detail}</p>
    </article>
  );
}
