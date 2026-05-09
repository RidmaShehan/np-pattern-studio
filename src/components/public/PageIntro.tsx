import RevealOnScroll from '@/components/animations/RevealOnScroll';
import { cn } from '@/lib/utils';
import { bodyMuted, eyebrow, headingXl } from '@/lib/publicStyles';

type PageIntroProps = {
  eyebrowText: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
};

export default function PageIntro({ eyebrowText, title, description, align = 'left' }: PageIntroProps) {
  const center = align === 'center';
  return (
    <RevealOnScroll className={cn(center && 'mx-auto max-w-3xl text-center')}>
      <p className={eyebrow}>{eyebrowText}</p>
      <h1 className={cn(headingXl, 'mt-4')}>{title}</h1>
      {description ? <p className={cn(bodyMuted, 'mt-5 text-lg md:text-xl', center && 'mx-auto')}>{description}</p> : null}
    </RevealOnScroll>
  );
}
