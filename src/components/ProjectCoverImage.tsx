import { cn } from '@/lib/utils';

type ProjectCoverImageProps = {
  imageUrl?: string | null;
  alt: string;
  className?: string;
};

/** Project hero image when `imageUrl` is set; otherwise a neutral gradient placeholder. */
export default function ProjectCoverImage({ imageUrl, alt, className }: ProjectCoverImageProps) {
  const src = typeof imageUrl === 'string' ? imageUrl.trim() : '';

  if (src) {
    return (
      <div className={cn('relative overflow-hidden bg-[#eceff4]', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- user-supplied URLs from any host */}
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
        />
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
