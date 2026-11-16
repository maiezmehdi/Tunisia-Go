import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/seo';
import { siteMode } from '@/lib/siteMode';

/** Private areas: the moderation pages and the API (forms, accounts, admin). */
const PRIVATE = ['/admin', '/en/admin', '/api/'];
/** Public resources under /api/ that crawlers need: the share cards (og:image) of places and regions. */
const PUBLIC_API = ['/api/og/'];

/**
 * GPTBot (OpenAI's training crawler) has its own rule, separate from OAI-SearchBot (ChatGPT
 * search). ROBOTS_GPTBOT=disallow in Vercel keeps the site out of training without leaving
 * ChatGPT search; anything else (or unset) allows it, as before.
 */
function gptbotAllowed(): boolean {
  return process.env.ROBOTS_GPTBOT?.trim().toLowerCase() !== 'disallow';
}

export default function robots(): MetadataRoute.Robots {
  // Preview deployments (tunisiago-git-….vercel.app) and the separate admin site stay out of
  // search results.
  const production = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production';
  if (!production || siteMode() === 'only') {
    return { rules: [{ userAgent: '*', disallow: '/' }] };
  }

  const open = { allow: ['/', ...PUBLIC_API], disallow: PRIVATE };
  return {
    // A crawler follows only the most specific group that names it, so each group repeats the
    // private paths.
    rules: [
      { userAgent: '*', ...open },
      { userAgent: 'OAI-SearchBot', ...open },
      gptbotAllowed() ? { userAgent: 'GPTBot', ...open } : { userAgent: 'GPTBot', disallow: '/' },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
