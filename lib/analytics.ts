/**
 * Audience statistics, loaded only after the visitor accepts (see CookieConsent).
 * Uses PostHog's EU cloud when NEXT_PUBLIC_POSTHOG_KEY is set; does nothing otherwise.
 */
type PostHog = {
  init: (key: string, options: Record<string, unknown>) => void;
  opt_in_capturing: () => void;
  opt_out_capturing: () => void;
  capture: (event: string, properties?: Record<string, unknown>) => void;
};
declare global {
  interface Window {
    posthog?: PostHog;
  }
}

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com';
let loading = false;

export const analyticsEnabled = Boolean(KEY);

export function startAnalytics() {
  if (!KEY) return;
  if (window.posthog?.opt_in_capturing && loading) {
    window.posthog.opt_in_capturing();
    return;
  }
  if (loading) return;
  loading = true;
  const script = document.createElement('script');
  script.async = true;
  script.src = `${HOST.replace('.i.posthog.com', '-assets.i.posthog.com')}/static/array.js`;
  script.onload = () =>
    window.posthog?.init(KEY, {
      api_host: HOST,
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
    });
  document.head.appendChild(script);
}

export function stopAnalytics() {
  window.posthog?.opt_out_capturing();
}

/** Records a product event (trip saved offline, spot suggested…) when statistics are on. */
export function track(event: string, properties?: Record<string, unknown>) {
  window.posthog?.capture(event, properties);
}
