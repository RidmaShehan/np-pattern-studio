'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  consentAllowsAnalytics,
  parseConsent,
} from '@/lib/cookieConsent';

function getCountryFromLocale() {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  const region = locale.split('-')[1];
  return region && region.length === 2 ? region.toUpperCase() : null;
}

function readConsentAllowsAnalytics(): boolean {
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    return consentAllowsAnalytics(parseConsent(raw));
  } catch {
    return false;
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const send = () => {
      if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/api')) return;
      if (!readConsentAllowsAnalytics()) return;

      const payload = {
        page_path: pathname,
        country: getCountryFromLocale(),
      };

      void fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {
        // Ignore analytics failures to avoid impacting UX.
      });
    };

    send();

    const onConsentChanged = () => send();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, onConsentChanged);
    window.addEventListener('storage', onConsentChanged);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, onConsentChanged);
      window.removeEventListener('storage', onConsentChanged);
    };
  }, [pathname]);

  return null;
}
