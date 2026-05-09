import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type ServiceCardIconProps = {
  imageUrl?: string | null;
  /** Used for image alt text */
  title: string;
  className?: string;
};

/** Custom image as service “icon”, or default sparkles badge when URL is empty */
export default function ServiceCardIcon({ imageUrl, title, className }: ServiceCardIconProps) {
  const src = typeof imageUrl === 'string' ? imageUrl.trim() : '';

  if (src) {
    return (
      <span
        className={cn(
          'inline-flex h-10 w-10 shrink-0 overflow-hidden rounded-2xl ring-2 ring-[#D4AF37]/20 shadow-sm',
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- user-supplied URLs */}
        <img src={src} alt={title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37]/15 text-[#B8941F] ring-1 ring-[#D4AF37]/25',
        className,
      )}
      aria-hidden
    >
      <Sparkles className="h-5 w-5" />
    </span>
  );
}
