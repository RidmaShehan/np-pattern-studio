'use client';

import { useEffect, useId, useReducer } from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  type CookieConsentState,
} from '@/lib/cookieConsent';
import { btnPrimary, btnSecondary, cardSurface } from '@/lib/publicStyles';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

function saveConsent(analytics: boolean) {
  const next: CookieConsentState = {
    v: 1,
    analytics,
    updatedAt: Date.now(),
  };
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / private mode
  }
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_CHANGED_EVENT));
}

type BannerState = { phase: 'server' } | { phase: 'client'; open: boolean };

export default function CookieConsent() {
  const pathname = usePathname();
  const titleId = useId();
  const descId = useId();
  const [banner, dispatch] = useReducer(
    (_: BannerState, action: BannerState): BannerState => action,
    { phase: 'server' },
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
      const hasChoice = raw !== null && raw !== '';
      dispatch({ phase: 'client', open: !hasChoice });
    } catch {
      dispatch({ phase: 'client', open: true });
    }
  }, []);

  if (banner.phase !== 'client' || !banner.open) return null;
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/api')) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[200] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 pointer-events-none"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div
        className={cn(
          cardSurface,
          'pointer-events-auto w-full max-w-[min(40rem,calc(100vw-2rem))] overflow-hidden',
          'border border-[#0D1B2A]/[0.08] shadow-[0_-8px_60px_-24px_rgba(13,27,42,0.35)]',
        )}
      >
        <div className="relative px-5 py-5 sm:px-6 sm:py-6">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#0D1B2A] via-[#D4AF37] to-[#0D1B2A] opacity-90" aria-hidden />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0D1B2A]/[0.06] text-[#0D1B2A]"
              aria-hidden
            >
              <Cookie className="h-5 w-5 text-[#B8941F]" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p id={titleId} className="text-base font-semibold tracking-tight text-[#0D1B2A]">
                Cookies &amp; your privacy
              </p>
              <p id={descId} className="text-sm leading-relaxed text-[#555555]">
                We use essential cookies so this site works properly. With your permission, we also collect
                anonymous visit data to improve pages and understand traffic — handled in line with Sri
                Lanka&apos;s{' '}
                <span className="text-[#0D1B2A]/90">
                  Personal Data Protection Act (PDPA, Act No. 9 of 2022)
                </span>
                . You can ask how we use data or exercise your rights by contacting us.
              </p>
              <p className="text-xs leading-relaxed text-[#555555]/85">
                Essential-only mode skips optional analytics. You can reset this anytime by clearing stored data
                for this site in your browser.{' '}
                <Link href="/contact" className="font-medium text-[#B8941F] underline-offset-2 hover:underline">
                  Contact Visily
                </Link>
                {process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL ? (
                  <>
                    {' · '}
                    <a
                      href={process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL}
                      className="font-medium text-[#B8941F] underline-offset-2 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy policy
                    </a>
                  </>
                ) : null}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2.5 sm:mt-6 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              className={cn(btnSecondary, 'w-full sm:w-auto')}
              onClick={() => {
                saveConsent(false);
                dispatch({ phase: 'client', open: false });
              }}
            >
              Essential only
            </button>
            <button
              type="button"
              className={cn(btnPrimary, 'w-full sm:w-auto')}
              onClick={() => {
                saveConsent(true);
                dispatch({ phase: 'client', open: false });
              }}
            >
              Accept &amp; continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
