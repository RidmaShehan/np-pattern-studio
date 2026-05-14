export const COOKIE_CONSENT_STORAGE_KEY = 'visily_cookie_consent_v1';

export const COOKIE_CONSENT_CHANGED_EVENT = 'visily:cookie-consent-changed';

export type CookieConsentState = {
  v: 1;
  analytics: boolean;
  updatedAt: number;
};

export function parseConsent(raw: string | null): CookieConsentState | null {
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Partial<CookieConsentState>;
    if (o.v !== 1 || typeof o.analytics !== 'boolean' || typeof o.updatedAt !== 'number') {
      return null;
    }
    return { v: 1, analytics: o.analytics, updatedAt: o.updatedAt };
  } catch {
    return null;
  }
}

export function consentAllowsAnalytics(state: CookieConsentState | null): boolean {
  return state?.analytics === true;
}
