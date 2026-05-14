import Image from 'next/image';
import { cn } from '@/lib/utils';
import { isSupabasePublicStorageUrl } from '@/lib/optimizableImageUrl';

type ProjectCoverImageProps = {
  imageUrl?: string | null;
  alt: string;
  className?: string;
};

/** Project hero image when `imageUrl` is set; otherwise a neutral gradient placeholder. */
export default function ProjectCoverImage({ imageUrl, alt, className }: ProjectCoverImageProps) {
  const src = typeof imageUrl === 'string' ? imageUrl.trim() : '';

  if (src) {
    const useOptimizer = isSupabasePublicStorageUrl(src);

    return (
      <div className={cn('relative overflow-hidden bg-[#eceff4]', className)}>
        {useOptimizer ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 560px"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            quality={80}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element -- hosts outside image remotePatterns */
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        'bg-gradient-to-br from-[#0D1B2A]/10 via-white/40 to-[#D4AF37]/15 ring-1 ring-[#0D1B2A]/[0.06]',
        className,
      )}
    />
  );
}
