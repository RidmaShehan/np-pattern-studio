'use client';

import { type ReactNode, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import { prefersReducedMotion } from '@/components/animations/prefersReducedMotion';

type StaggerOnMountProps = {
  children: ReactNode;
  className?: string;
  /** CSS selector for direct children to animate (default: [data-reveal]) */
  itemSelector?: string;
  stagger?: number;
  delay?: number;
};

export default function StaggerOnMount({
  children,
  className,
  itemSelector = '[data-reveal]',
  stagger = 0.09,
  delay = 0.12,
}: StaggerOnMountProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const items = root.querySelectorAll<HTMLElement>(itemSelector);
    if (items.length === 0) return;

    if (prefersReducedMotion()) {
      gsap.set(items, { clearProps: 'all' });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 36 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          ease: 'power3.out',
          stagger,
          delay,
        },
      );
    }, root);

    return () => ctx.revert();
  }, [itemSelector, stagger, delay]);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
