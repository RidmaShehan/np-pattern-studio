'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { btnPrimary } from '@/lib/publicStyles';
import { prefersReducedMotion } from '@/components/animations/prefersReducedMotion';

export type SiteHeaderNavItem = { href: string; label: string };

type SiteHeaderClientProps = {
  brandTitle: string;
  navItems: SiteHeaderNavItem[];
  showContactCta?: boolean;
};

export default function SiteHeaderClient({ brandTitle, navItems, showContactCta = true }: SiteHeaderClientProps) {
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const desktopNavRef = useRef<HTMLElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const mobileInit = useRef(true);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const bar = barRef.current;
    const logo = logoRef.current;
    const nav = desktopNavRef.current;
    if (!bar || !logo) return;

    const ctx = gsap.context(() => {
      gsap.from(bar, {
        y: -16,
        autoAlpha: 0,
        duration: 0.65,
        ease: 'power3.out',
      });
      gsap.from(logo, {
        x: -10,
        autoAlpha: 0,
        duration: 0.55,
        delay: 0.05,
        ease: 'power3.out',
      });
      const links = nav?.querySelectorAll('a');
      if (links && links.length) {
        gsap.from(links, {
          y: -8,
          autoAlpha: 0,
          stagger: 0.05,
          duration: 0.45,
          delay: 0.12,
          ease: 'power2.out',
        });
      }
    }, bar);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const el = mobileRef.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.style.height = open ? 'auto' : '0px';
      el.style.opacity = open ? '1' : '0';
      el.style.pointerEvents = open ? 'auto' : 'none';
      return;
    }

    if (mobileInit.current) {
      mobileInit.current = false;
      if (!open) {
        gsap.set(el, { height: 0, autoAlpha: 0 });
      }
      return;
    }

    if (open) {
      gsap.fromTo(
        el,
        { height: 0, autoAlpha: 0 },
        { height: 'auto', autoAlpha: 1, duration: 0.42, ease: 'power3.out' },
      );
      const links = el.querySelectorAll('a');
      gsap.from(links, {
        x: -12,
        autoAlpha: 0,
        stagger: 0.05,
        duration: 0.35,
        ease: 'power2.out',
        delay: 0.06,
      });
    } else {
      gsap.to(el, { height: 0, autoAlpha: 0, duration: 0.28, ease: 'power3.in' });
    }
  }, [open]);

  return (
    <>
      <header
        ref={barRef}
        className={cn(
          'sticky top-0 z-40 border-b border-[#0D1B2A]/[0.06] bg-[#FAFBFC]/92 backdrop-blur-md supports-[backdrop-filter]:bg-[#FAFBFC]/78 md:bg-[#FAFBFC]/85 md:backdrop-blur-xl md:supports-[backdrop-filter]:bg-[#FAFBFC]/72',
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:h-[4.25rem] md:px-6">
          <Link href="/" ref={logoRef} className="group relative text-lg font-semibold tracking-tight text-[#0D1B2A] md:text-xl">
            <span className="relative">
              {brandTitle}
              <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-[#D4AF37] transition-all duration-300 group-hover:w-full" />
            </span>
          </Link>

          <nav ref={desktopNavRef} className="hidden items-center gap-8 text-[13px] font-medium text-[#555555] md:flex">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="relative py-2 transition-colors hover:text-[#0D1B2A] after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-[#D4AF37]/80 after:transition-transform hover:after:scale-x-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {showContactCta ? (
              <Link href="/contact" className={cn(btnPrimary, 'hidden px-5 py-2 text-[13px] md:inline-flex')}>
                Start a project
              </Link>
            ) : null}
            <button
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#0D1B2A]/10 bg-white/60 text-[#0D1B2A] shadow-sm backdrop-blur-sm md:hidden"
              onClick={() => setOpen(v => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div
          ref={mobileRef}
          className="overflow-hidden border-t border-[#0D1B2A]/[0.06] bg-[#FAFBFC]/95 md:hidden"
          style={{ height: 0 }}
        >
          <div className="space-y-1 px-4 py-4">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-3 py-3 text-[15px] font-medium text-[#0D1B2A] transition hover:bg-white/70"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {showContactCta ? (
              <Link
                href="/contact"
                className={cn(btnPrimary, 'mt-2 w-full text-center')}
                onClick={() => setOpen(false)}
              >
                Start a project
              </Link>
            ) : null}
          </div>
        </div>
      </header>
      {open ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-30 bg-[#0D1B2A]/25 md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
