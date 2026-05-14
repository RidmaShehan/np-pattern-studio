'use client';

import dynamic from 'next/dynamic';
import { extractElfsightAppId } from '@/lib/elfsight';

const ElfsightReviews = dynamic(() => import('@/components/ElfsightReviews'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[120px] rounded-2xl bg-[#0D1B2A]/[0.04]" aria-busy="true" aria-label="Loading reviews" />
  ),
});

/** Skip loading Elfsight’s bundle when there is no parsable UUID (avoids useless third-party work). */
export default function ElfsightReviewsLazy(props: { appId?: string | null }) {
  if (!extractElfsightAppId(props.appId)) return null;
  return <ElfsightReviews {...props} />;
}
