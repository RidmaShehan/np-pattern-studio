/** True when URL can be served through `next/image` (matches `remotePatterns` in next.config). */
export function isSupabasePublicStorageUrl(src: string): boolean {
  try {
    const u = new URL(src);
    if (u.protocol !== 'https:') return false;
    return /\.supabase\.co$/i.test(u.hostname);
  } catch {
    return false;
  }
}
