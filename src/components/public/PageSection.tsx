import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageSection({
  children,
  className,
  tight,
}: {
  children: ReactNode;
  className?: string;
  /** Less vertical padding for nested groupings */
  tight?: boolean;
}) {
  return (
    <section
      className={cn(
        'mx-auto w-full max-w-6xl px-4 md:px-6',
        tight ? 'py-10 md:py-12' : 'py-14 md:py-24',
        className,
      )}
    >
      {children}
    </section>
  );
}
