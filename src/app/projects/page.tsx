import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import MaintenanceMode from '@/components/MaintenanceMode';
import PageIntro from '@/components/public/PageIntro';
import { PageSection } from '@/components/public/PageSection';
import RevealOnScroll from '@/components/animations/RevealOnScroll';
import ProjectCoverImage from '@/components/ProjectCoverImage';
import { getPublicContent, getPublicSettings } from '@/lib/content';
import { notFound } from 'next/navigation';
import { bodyMuted, cardSurface, linkAccent, mainShell } from '@/lib/publicStyles';
import { cn } from '@/lib/utils';

export default async function ProjectsPage() {
  const [content, settings] = await Promise.all([getPublicContent(), getPublicSettings()]);
  if (settings.controls.maintenance_mode) return <MaintenanceMode />;
  if (!settings.controls.pages.projects) notFound();
  return (
    <main className={mainShell}>
      <SiteHeader />
      <PageSection>
        <PageIntro
          eyebrowText="Portfolio"
          title={content.projects.title}
          description={content.projects.subtitle}
          align="center"
        />
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {content.projects.items.map((project, i) => (
            <RevealOnScroll key={project.id || project.name} delay={Math.min(i * 0.08, 0.32)}>
              <article className={cn(cardSurface, 'group h-full overflow-hidden transition duration-300 hover:-translate-y-1')}>
                <ProjectCoverImage
                  imageUrl={project.image_url}
                  alt={project.name}
                  className="h-48 w-full md:h-52"
                />
                <div className="px-6 pb-7 pt-6">
                  <h2 className="text-2xl font-semibold tracking-tight">{project.name}</h2>
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
      <SiteFooter />
    </main>
  );
}
