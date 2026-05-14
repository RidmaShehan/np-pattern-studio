import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import ServiceCardIcon from '@/components/ServiceCardIcon';
import SiteHeader from '@/components/SiteHeader';
import MaintenanceMode from '@/components/MaintenanceMode';
import PageIntro from '@/components/public/PageIntro';
import { PageSection } from '@/components/public/PageSection';
import RevealOnScroll from '@/components/animations/RevealOnScroll';
import { getPublicContent, getPublicSettings } from '@/lib/content';
import { notFound } from 'next/navigation';
import { bodyMuted, cardSurface, linkAccent, mainShell } from '@/lib/publicStyles';
import { cn } from '@/lib/utils';

export default async function ServicesPage() {
  const [content, settings] = await Promise.all([getPublicContent(), getPublicSettings()]);
  if (settings.controls.maintenance_mode) return <MaintenanceMode />;
  if (!settings.controls.pages.services) notFound();
  return (
    <main className={mainShell}>
      <SiteHeader />
      <PageSection>
        <PageIntro
          eyebrowText={content.services.subtitle}
          title={content.services.title}
          align="center"
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {content.services.items.map((service, i) => (
            <RevealOnScroll key={service.id || service.title} delay={Math.min(i * 0.07, 0.35)}>
              <article className={cn(cardSurface, 'group h-full overflow-hidden transition duration-300 hover:-translate-y-1')}>
                <ServiceCardIcon
                  imageUrl={service.image_url}
                  title={service.title}
                  variant="cover"
                  className="h-48 rounded-t-[1.25rem]"
                />
                <div className="p-7">
                  <h2 className="text-2xl font-semibold tracking-tight">{service.title}</h2>
                  <p className={cn(bodyMuted, 'mt-3 text-[17px]')}>{service.text}</p>
                  <Link href="/contact" className={cn(linkAccent, 'mt-7')}>
                    Ask about this service <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </PageSection>
      <SiteFooter />
    </main>
  );
}
