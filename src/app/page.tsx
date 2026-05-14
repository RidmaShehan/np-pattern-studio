import { ReactNode } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Globe,
  Mail,
  MessageCircle,
  Scissors,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import MaintenanceMode from '@/components/MaintenanceMode';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import ProjectCoverImage from '@/components/ProjectCoverImage';
import ServiceCardIcon from '@/components/ServiceCardIcon';
import StaggerOnMount from '@/components/animations/StaggerOnMount';
import RevealOnScroll from '@/components/animations/RevealOnScroll';
import ElfsightReviewsLazy from '@/components/ElfsightReviewsLazy';
import { getPublicContent, getPublicSettings } from '@/lib/content';
import { getElfsightGoogleReviewsAppId } from '@/lib/elfsight';
import { PageSection } from '@/components/public/PageSection';
import {
  bodyMuted,
  btnPrimary,
  btnSecondary,
  cardInner,
  cardSurface,
  eyebrow,
  headingLg,
  headingXl,
  linkAccent,
  mainShell,
} from '@/lib/publicStyles';
import { cn } from '@/lib/utils';

export default async function HomePage() {
  const [content, settings] = await Promise.all([getPublicContent(), getPublicSettings()]);
  if (settings.controls.maintenance_mode) return <MaintenanceMode />;
  if (!settings.controls.pages.home) notFound();
  const elfsightAppId = getElfsightGoogleReviewsAppId(settings);
  return (
    <main className={mainShell}>
      <SiteHeader />

      {settings.controls.sections.hero && (
        <PageSection className="pt-10 md:pt-14">
          <div className={cn(cardSurface, 'p-6 md:p-10 lg:p-12')}>
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
              <StaggerOnMount>
                <div data-reveal className="inline-flex items-center gap-2 rounded-full border border-[#0D1B2A]/10 bg-white/55 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#555555]">
                  <span className="h-1 w-1 rounded-full bg-[#D4AF37]" />
                  {content.hero.badge}
                </div>
                <h1 data-reveal className={cn(headingXl, 'mt-6')}>
                  {content.hero.title}
                </h1>
                <p data-reveal className={cn(bodyMuted, 'mt-6 max-w-xl text-lg md:text-xl')}>
                  {content.hero.description}
                </p>
                <div data-reveal className="mt-8 flex min-h-[44px] flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href="/contact" className={cn(btnPrimary, 'w-full justify-center sm:w-auto')}>
                    {content.hero.primaryCta}
                  </Link>
                  <Link href="/projects" className={cn(btnSecondary, 'w-full justify-center sm:w-auto')}>
                    {content.hero.secondaryCta}
                  </Link>
                </div>
                <div data-reveal className="mt-10 flex items-start gap-3 rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/[0.06] px-5 py-4">
                  <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[#B8941F]" />
                  <p className="text-sm leading-relaxed text-[#0D1B2A]/90">{content.hero.assistantNote}</p>
                </div>
              </StaggerOnMount>

              <RevealOnScroll delay={0.05} y={32} className={cn(cardInner, 'relative overflow-hidden p-6 md:p-8')}>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-[0.65]"
                  style={{
                    backgroundImage:
                      'linear-gradient(145deg, rgba(212,175,55,0.16), transparent 38%), linear-gradient(215deg, rgba(13,27,42,0.10), transparent 45%)',
                  }}
                />
                <div className="relative space-y-6">
                  <div className="mx-auto flex max-w-sm flex-col gap-4">
                    {content.hero.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={content.hero.image_url}
                        alt="Hero"
                        className="aspect-[4/5] w-full rounded-2xl object-cover shadow-[0_4px_32px_-8px_rgba(13,27,42,0.45)] ring-1 ring-white/10"
                      />
                    ) : (
                      <div className="aspect-[4/5] w-full rounded-2xl bg-gradient-to-br from-[#0D1B2A] via-[#162a40] to-[#0D1B2A] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/10" />
                    )}
                    <div className="flex items-center gap-3 rounded-2xl bg-white/85 px-4 py-3 ring-1 ring-[#0D1B2A]/[0.06] backdrop-blur-md">
                      <BadgeCheck className="h-5 w-5 shrink-0 text-[#B8941F]" />
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-[#555555]">
                        Industry standard precision
                      </p>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            </div>

            <RevealOnScroll className="mt-8 grid grid-cols-1 divide-y divide-[#0D1B2A]/[0.06] rounded-2xl bg-white/40 p-1 ring-1 ring-[#0D1B2A]/[0.06] backdrop-blur-md md:grid-cols-3 md:divide-x md:divide-y-0">
              <Metric icon={<Scissors className="h-4 w-4 text-[#D4AF37]" />} label="35+ Years" sub="Experience" />
              <Metric icon={<Sparkles className="h-4 w-4 text-[#D4AF37]" />} label="CAD + Manual" sub="Precision" />
              <Metric icon={<BadgeCheck className="h-4 w-4 text-[#D4AF37]" />} label="Custom fit" sub="Assurance" />
            </RevealOnScroll>
          </div>
        </PageSection>
      )}

      {settings.controls.sections.about && (
        <PageSection>
          <RevealOnScroll>
            <p className={eyebrow}>{content.about.sectionEyebrow}</p>
            <h2 className={cn(headingLg, 'mt-4 max-w-2xl')}>{content.about.title}</h2>
          </RevealOnScroll>
          <RevealOnScroll className="mt-10" delay={0.06}>
            <div className={cn(cardSurface, 'p-6 md:p-10')}>
              <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                <div>
                  <p className="inline-flex rounded-full border border-[#0D1B2A]/10 bg-white/60 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#555555]">
                    {content.about.heritageLabel}
                  </p>
                  <h3 className="mt-6 text-3xl font-semibold tracking-tight md:text-4xl">{content.about.heritageTitle}</h3>
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
      )}

      {settings.controls.sections.services && (
        <PageSection>
          <RevealOnScroll className="text-center">
            <p className={eyebrow}>{content.services.subtitle}</p>
            <h2 className={cn(headingLg, 'mx-auto mt-4 max-w-3xl')}>{content.services.title}</h2>
          </RevealOnScroll>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
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
                    <h3 className="text-2xl font-semibold tracking-tight">{service.title}</h3>
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
      )}

      {settings.controls.sections.projects && (
        <PageSection>
          <RevealOnScroll className="text-center">
            <p className={eyebrow}>Portfolio</p>
            <h2 className={cn(headingLg, 'mx-auto mt-4 max-w-3xl')}>{content.projects.title}</h2>
            <p className={cn(bodyMuted, 'mx-auto mt-5 max-w-3xl text-lg')}>{content.projects.subtitle}</p>
          </RevealOnScroll>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {content.projects.items.map((project, i) => (
              <RevealOnScroll key={project.id || project.name} delay={Math.min(i * 0.08, 0.32)}>
                <article className={cn(cardSurface, 'group h-full overflow-hidden transition duration-300 hover:-translate-y-1')}>
                  <ProjectCoverImage
                    imageUrl={project.image_url}
                    alt={project.name}
                    className="h-40 w-full rounded-t-[1.25rem]"
                  />
                  <div className="px-6 pb-7 pt-6">
                    <h3 className="text-2xl font-semibold tracking-tight">{project.name}</h3>
                    <p className={cn(bodyMuted, 'mt-2 text-[17px]')}>{project.desc}</p>
                    <Link href="/contact" className={cn(linkAccent, 'mt-5')}>
                      Ask about this project <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </PageSection>
      )}

      {settings.controls.sections.reviews && (
        <PageSection>
          <RevealOnScroll>
            <p className={eyebrow}>{content.reviews.subtitle}</p>
            <h2 className={cn(headingLg, 'mt-4 max-w-3xl')}>{content.reviews.title}</h2>
          </RevealOnScroll>
          <RevealOnScroll className="mt-10" delay={0.06}>
            {elfsightAppId ? (
              <div className={cn(cardSurface, 'p-6 md:p-8')}>
                <ElfsightReviewsLazy appId={elfsightAppId} />
              </div>
            ) : (
              <div className={cn(cardSurface, 'flex flex-col gap-4 p-7 md:flex-row md:items-center md:justify-between md:p-8')}>
                <p className={cn(bodyMuted, 'max-w-xl text-[15px]')}>
                  Connect your Elfsight Google Reviews widget in Admin → Site Settings to show live reviews here.
                </p>
                <Link href="/reviews" className={btnSecondary}>
                  Reviews page
                </Link>
              </div>
            )}
          </RevealOnScroll>
        </PageSection>
      )}

      {settings.controls.sections.contact && (
        <PageSection className="pb-20 md:pb-28">
          <RevealOnScroll className="text-center">
            <p className={eyebrow}>{content.contact.subtitle}</p>
            <h2 className={cn(headingLg, 'mt-4')}>{content.contact.title}</h2>
          </RevealOnScroll>
          <RevealOnScroll className="mt-10" delay={0.05}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ContactInfoCard title="WhatsApp" detail={settings.whatsapp_number} icon={<MessageCircle className="h-4 w-4" />} />
              <ContactInfoCard title="Email" detail={settings.contact_info.email} icon={<Mail className="h-4 w-4" />} />
              <ContactInfoCard title="Location" detail={settings.contact_info.address} icon={<Globe className="h-4 w-4" />} />
              <ContactInfoCard title="Hours" detail={settings.contact_info.hours} icon={<Clock3 className="h-4 w-4" />} />
            </div>
          </RevealOnScroll>
          <RevealOnScroll className="mt-8" delay={0.1}>
            <div className={cn(cardSurface, 'flex flex-col items-start gap-6 p-7 md:flex-row md:items-center md:justify-between md:p-10')}>
              <div>
                <p className="text-lg font-medium text-[#0D1B2A]">Ready when you are</p>
                <p className={cn(bodyMuted, 'mt-2 max-w-xl text-[17px]')}>
                  We now have a dedicated contact page for project inquiries — tell us what you&apos;re envisioning.
                </p>
              </div>
              <Link href="/contact" className={btnPrimary}>
                Go to contact form
              </Link>
            </div>
          </RevealOnScroll>
        </PageSection>
      )}

      <SiteFooter />
    </main>
  );
}

function Metric({
  icon,
  label,
  sub,
}: {
  icon: ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-7 text-center sm:flex-row sm:justify-center sm:text-left md:flex-col md:text-center">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/85 ring-1 ring-[#0D1B2A]/[0.06]">
        {icon}
      </div>
      <div>
        <p className="text-xl font-semibold text-[#0D1B2A]">{label}</p>
        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#555555]">{sub}</p>
      </div>
    </div>
  );
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
