'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function getCountryFromLocale() {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  const region = locale.split('-')[1];
  return region && region.length === 2 ? region.toUpperCase() : null;
}

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/api')) return;

    const payload = {
      page_path: pathname,
      country: getCountryFromLocale(),
    };

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      // Ignore analytics failures to avoid impacting UX.
    });
  }, [pathname]);

  return null;
}
