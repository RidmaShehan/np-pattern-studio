import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import MaintenanceMode from '@/components/MaintenanceMode';
import ElfsightReviewsLazy from '@/components/ElfsightReviewsLazy';
import PageIntro from '@/components/public/PageIntro';
import { PageSection } from '@/components/public/PageSection';
import RevealOnScroll from '@/components/animations/RevealOnScroll';
import { getPublicContent, getPublicSettings } from '@/lib/content';
import { getElfsightGoogleReviewsAppId } from '@/lib/elfsight';
import { notFound } from 'next/navigation';
import { bodyMuted, cardSurface, mainShell } from '@/lib/publicStyles';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
  const [content, settings] = await Promise.all([getPublicContent(), getPublicSettings()]);
  if (settings.controls.maintenance_mode) return <MaintenanceMode />;
  if (!settings.controls.pages.reviews) notFound();
  const elfsightAppId = getElfsightGoogleReviewsAppId(settings);

  return (
    <main className={mainShell}>
      <SiteHeader />
      <PageSection>
        <PageIntro eyebrowText={content.reviews.subtitle} title={content.reviews.title} align="center" />

        <RevealOnScroll className="mx-auto mt-12 w-full max-w-5xl" delay={0.06}>
          {elfsightAppId ? (
            <div className={cn(cardSurface, 'p-6 md:p-10')}>
              <ElfsightReviewsLazy appId={elfsightAppId} />
            </div>
          ) : (
            <div className={cn(cardSurface, 'p-8 text-center md:p-12')}>
              <p className="text-lg font-medium text-[#0D1B2A]">Google Reviews widget is not connected yet</p>
              <p className={cn(bodyMuted, 'mx-auto mt-3 max-w-lg text-[15px]')}>
                Sign in to the admin dashboard, open <strong className="font-medium text-[#0D1B2A]">Site Settings</strong>,
                and paste your Elfsight app ID (the UUID from your Google Reviews embed). Alternatively set{' '}
                <code className="rounded-md bg-[#E8ECF4] px-1.5 py-0.5 text-sm">NEXT_PUBLIC_ELFSIGHT_GOOGLE_REVIEWS_APP_ID</code>{' '}
                in your environment configuration.
              </p>
            </div>
          )}
        </RevealOnScroll>
      </PageSection>
      <SiteFooter />
    </main>
  );
}
