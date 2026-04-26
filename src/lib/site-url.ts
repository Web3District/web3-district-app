/**
 * Public site URL for links, emails, and share buttons.
 * Set NEXT_PUBLIC_BASE_URL in .env.local (e.g. http://localhost:3001).
 */
export function getPublicSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3001"
  );
}
