'use client';

import { MessageCircle } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/components/animations/prefersReducedMotion';

interface WhatsAppButtonProps {
  phoneNumber: string;
}

export default function WhatsAppButton({ phoneNumber }: WhatsAppButtonProps) {
  const pathname = usePathname();
  const [allowRender, setAllowRender] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (!phoneNumber || pathname?.startsWith('/admin')) return;
    const t = window.setTimeout(() => setAllowRender(true), 1600);
    return () => window.clearTimeout(t);
  }, [phoneNumber, pathname]);

  useLayoutEffect(() => {
    const btn = btnRef.current;
    if (!allowRender || !btn) return;
    if (prefersReducedMotion()) {
      gsap.set(btn, { scale: 1, autoAlpha: 1 });
      return;
    }
    gsap.fromTo(
      btn,
      { scale: 0.15, autoAlpha: 0, rotate: -10 },
      { scale: 1, autoAlpha: 1, rotate: 0, duration: 0.75, ease: 'elastic.out(1, 0.55)', delay: 0.08 },
    );
  }, [allowRender]);

  const handleClick = () => {
    const message = encodeURIComponent('Hi! I would like to know more about your services.');
    window.open(`https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${message}`, '_blank');
    if (!btnRef.current || prefersReducedMotion()) return;
    gsap.timeline().to(btnRef.current, { scale: 0.94, duration: 0.1, ease: 'power2.out' }).to(btnRef.current, { scale: 1, duration: 0.45, ease: 'elastic.out(1, 0.6)' });
  };

  const handleHover = (hover: boolean) => {
    const btn = btnRef.current;
    if (!btn || prefersReducedMotion()) return;
    gsap.to(btn, { scale: hover ? 1.06 : 1, duration: 0.35, ease: 'power2.out' });
  };

  if (!phoneNumber || pathname?.startsWith('/admin')) return null;
  if (!allowRender) return null;

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={handleClick}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
      onFocus={() => handleHover(true)}
      onBlur={() => handleHover(false)}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#128C43] text-white shadow-[0_18px_50px_-20px_rgba(18,140,67,0.75)] ring-4 ring-[#128C43]/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D4AF37]/45"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </button>
  );
}
