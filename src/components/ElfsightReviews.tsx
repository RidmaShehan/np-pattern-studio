'use client';

import Script from 'next/script';

function normalizeElfsightAppId(raw: unknown): string {
  if (raw == null) return '';
  const base = typeof raw === 'string' ? raw : String(raw);
  let s = base.trim();
  s = s.replace(/^elfsight-app-/i, '').replace(/\s+/g, '');
  return s;
}

/** Loads Elfsight only when a valid app UUID is provided (otherwise returns null). */
export default function ElfsightReviews({ appId }: { appId?: string | null }) {
  const id = normalizeElfsightAppId(appId);
  if (!id) return null;

  return (
    <>
      <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
      <div className={`elfsight-app-${id}`} data-elfsight-app-lazy />
    </>
  );
}
