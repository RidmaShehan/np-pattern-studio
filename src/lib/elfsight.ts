import type { PublicSettings } from '@/lib/content';

/** Elfsight app UUID from CMS + env — tolerant of missing/wrong types at runtime */
export function getElfsightGoogleReviewsAppId(
  settings: Pick<PublicSettings, 'elfsight_google_reviews_app_id'> | null | undefined,
): string {
  if (!settings) return '';
  const raw = settings.elfsight_google_reviews_app_id as unknown;
  if (raw == null) return '';
  if (typeof raw === 'string') return raw.trim();
  return String(raw).trim();
}
