/**
 * Security headers. The Content-Security-Policy lists every outside service the site uses:
 * - Google Fonts (styles and font files)
 * - CARTO map tiles, Wikimedia Commons photos, Supabase (community photos, moderation)
 * - PostHog EU (statistics, loaded only after cookie consent)
 * Add a host here before using a new service, or the browser will block it.
 */
const dev = process.env.NODE_ENV !== 'production';
const preview = process.env.VERCEL_ENV === 'preview';

const IMAGES = [
  'https://basemaps.cartocdn.com',
  'https://*.basemaps.cartocdn.com',
  'https://upload.wikimedia.org',
  // Wikimedia now serves resized photos from thumb.wikimedia.org.
  'https://*.wikimedia.org',
  'https://*.supabase.co',
];
const POSTHOG = ['https://eu.i.posthog.com', 'https://eu-assets.i.posthog.com', 'https://*.posthog.com'];
// Vercel's comment toolbar on preview deployments only.
const VERCEL_LIVE = preview ? ['https://vercel.live', 'https://*.pusher.com', 'wss://*.pusher.com'] : [];

const csp = [
  "default-src 'self'",
  // Next.js inlines its boot scripts, hence 'unsafe-inline' (a nonce would turn every page dynamic).
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''} https://eu-assets.i.posthog.com ${VERCEL_LIVE.join(' ')}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  `img-src 'self' data: blob: ${IMAGES.join(' ')} ${VERCEL_LIVE.join(' ')}`,
  `connect-src 'self' ${[...IMAGES, ...POSTHOG, 'https://fonts.googleapis.com', 'https://fonts.gstatic.com', ...VERCEL_LIVE].join(' ')}${dev ? ' ws:' : ''}`,
  "media-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  `frame-src ${preview ? 'https://vercel.live' : "'none'"}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(dev ? [] : ['upgrade-insecure-requests']),
]
  .map((d) => d.replace(/\s+/g, ' ').trim())
  .join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // The place form may ask for the visitor's position; nothing else needs a device feature.
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), browsing-topics=(), interest-cohort=()',
  },
];

const noIndex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // The service worker must never be served from a stale HTTP cache.
      { source: '/sw.js', headers: [{ key: 'Cache-Control', value: 'no-cache' }] },
      { source: '/admin', headers: noIndex },
      { source: '/en/admin', headers: noIndex },
      { source: '/api/:path*', headers: noIndex },
    ];
  },
};
export default nextConfig;
