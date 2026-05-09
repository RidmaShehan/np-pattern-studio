'use client';

import Script from 'next/script';
import { extractElfsightAppId } from '@/lib/elfsight';

/** Loads Elfsight only when a valid app UUID is provided (otherwise returns null). */
export default function ElfsightReviews({ appId }: { appId?: string | null }) {
  const id = extractElfsightAppId(appId);
  if (!id) return null;

  return (
    <>
      <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
      <div className={`elfsight-app-${id}`} data-elfsight-app-lazy />
    </>
  );
}
