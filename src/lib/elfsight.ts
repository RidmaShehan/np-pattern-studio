import type { PublicSettings } from '@/lib/content';

function coerceToString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  return String(value).trim();
}

/** Accept UUID, class names, embed snippets, and share URLs. */
export function extractElfsightAppId(value: unknown): string {
  const input = coerceToString(value);
  if (!input) return '';

  // 1) Match canonical UUID from snippets, URLs, or free text.
  const uuidMatch = input.match(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
  if (uuidMatch) return uuidMatch[0].toLowerCase();

  // 2) Accept `elfsight-app-...` class format if user pasted only that.
  const classMatch = input.match(/elfsight-app-([0-9a-z-]+)/i);
  if (classMatch) return classMatch[1].trim();

  return '';
}

/** Elfsight app ID from CMS first, then NEXT_PUBLIC env fallback. */
export function getElfsightGoogleReviewsAppId(
  settings: Pick<PublicSettings, 'elfsight_google_reviews_app_id'> | null | undefined,
): string {
  const fromSettings = extractElfsightAppId(settings?.elfsight_google_reviews_app_id);
  if (fromSettings) return fromSettings;
  return extractElfsightAppId(process.env.NEXT_PUBLIC_ELFSIGHT_GOOGLE_REVIEWS_APP_ID);
}
