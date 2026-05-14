import type { PublicSettings } from '@/lib/content';

/** RFC-style UUID v1–v5 (variant nibble 8–b). Elfsight app IDs match this shape. */
const ELF_UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;

function coerceToString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  return String(value).trim();
}

function normalizeElfsightUuid(fragment: string): string {
  const m = fragment.match(ELF_UUID_RE);
  return m ? m[0].toLowerCase() : '';
}

/**
 * Accept UUID inside snippets, URLs, or free text, or a full `elfsight-app-{uuid}` class token.
 * Rejects loose `elfsight-app-…` slugs so we do not mount a widget that will only error against Elfsight’s API.
 */
export function extractElfsightAppId(value: unknown): string {
  const input = coerceToString(value);
  if (!input) return '';

  const fromText = normalizeElfsightUuid(input);
  if (fromText) return fromText;

  const classMatch = input.match(/elfsight-app-([0-9a-f-]{36})/i);
  if (classMatch) return normalizeElfsightUuid(classMatch[1]);

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
