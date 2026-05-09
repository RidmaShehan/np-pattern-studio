import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import MaintenanceMode from '@/components/MaintenanceMode';
import PageIntro from '@/components/public/PageIntro';
import { PageSection } from '@/components/public/PageSection';
import RevealOnScroll from '@/components/animations/RevealOnScroll';
import ProjectCoverImage from '@/components/ProjectCoverImage';
import { getPublicContent, getPublicSettings } from '@/lib/content';
import { notFound } from 'next/navigation';
import { bodyMuted, cardInner, cardSurface, mainShell } from '@/lib/publicStyles';
import { cn } from '@/lib/utils';

export default async function AboutPage() {
  const [content, settings] = await Promise.all([getPublicContent(), getPublicSettings()]);
  if (settings.controls.maintenance_mode) return <MaintenanceMode />;
  if (!settings.controls.pages.about) notFound();
  return (
    <main className={mainShell}>
      <SiteHeader />
      <PageSection>
        <PageIntro eyebrowText={content.about.sectionEyebrow} title={content.about.title} />
        <RevealOnScroll className="mt-12" delay={0.05}>
          <div className={cn(cardSurface, 'p-6 md:p-10')}>
            <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div>
                <p className="inline-flex rounded-full border border-[#0D1B2A]/10 bg-white/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#555555]">
                  {content.about.heritageLabel}
                </p>
                <h2 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">{content.about.heritageTitle}</h2>
                <p className={cn(bodyMuted, 'mt-5 text-lg')}>{content.about.heritageText}</p>
              </div>
              <div className={cn(cardInner, 'group overflow-hidden p-2')}>
                <ProjectCoverImage
                  imageUrl={content.about.image_url}
                  alt={content.about.heritageTitle}
                  className="aspect-[5/4] w-full rounded-xl"
                />
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </PageSection>
      <SiteFooter />
    </main>
  );
}
