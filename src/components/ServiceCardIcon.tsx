import Image from 'next/image';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isSupabasePublicStorageUrl } from '@/lib/optimizableImageUrl';

type ServiceCardIconProps = {
  imageUrl?: string | null;
  /** Used for image alt text */
  title: string;
  className?: string;
  /**
   * "cover"  → full-width banner image at the top of a card (default)
   * "icon"   → small inline badge (legacy / fallback)
   */
  variant?: 'cover' | 'icon';
};

export default function ServiceCardIcon({
  imageUrl,
  title,
  className,
  variant = 'cover',
}: ServiceCardIconProps) {
  const src = typeof imageUrl === 'string' ? imageUrl.trim() : '';

  /* ── Cover variant (full-width top-of-card image) ── */
  if (variant === 'cover') {
    if (src) {
      const optimized = isSupabasePublicStorageUrl(src);
      return (
        <div className={cn('relative w-full overflow-hidden bg-[#eceff4]', className)}>
          {optimized ? (
            <Image
              src={src}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 560px"
              quality={80}
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={src}
              alt={title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
      );
    }

    /* No image – gradient placeholder */
    return (
      <div
        aria-hidden
        className={cn(
          'w-full bg-gradient-to-br from-[#0D1B2A]/8 via-white/50 to-[#D4AF37]/12 ring-1 ring-[#0D1B2A]/[0.05]',
          className,
        )}
      />
    );
  }

  /* ── Icon variant (small inline badge) ── */
  if (src) {
    const optimized = isSupabasePublicStorageUrl(src);
    return (
      <span
        className={cn(
          'relative inline-flex h-14 w-14 shrink-0 overflow-hidden rounded-2xl ring-2 ring-[#D4AF37]/20 shadow-sm',
          className,
        )}
      >
        {optimized ? (
          <Image
            src={src}
            alt={title}
            width={56}
            height={56}
            sizes="56px"
            quality={80}
            className="h-full w-full object-cover"
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={src} alt={title} className="h-full w-full object-cover" loading="lazy" decoding="async" />
        )}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37]/15 text-[#B8941F] ring-1 ring-[#D4AF37]/25',
        className,
      )}
      aria-hidden
    >
      <Sparkles className="h-6 w-6" />
    </span>
  );
}
