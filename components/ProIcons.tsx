/** Small line icons (inline SVG, 16 px) for the facts on a guide or agency card. */
const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

export function LanguageIcon({ className = '' }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <circle cx="8" cy="8" r="6" />
      <path d="M2 8h12M8 2c2 1.8 3 3.8 3 6s-1 4.2-3 6c-2-1.8-3-3.8-3-6s1-4.2 3-6z" />
    </svg>
  );
}

export function ActivityIcon({ className = '' }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <circle cx="8" cy="8" r="6" />
      <path d="M10.5 5.5L9 9l-3.5 1.5L7 7z" />
    </svg>
  );
}

export function PriceIcon({ className = '' }: { className?: string }) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 8.5V3a.5.5 0 0 1 .5-.5h5.5l5 5-5.5 5.5z" />
      <circle cx="5.5" cy="5.5" r=".75" />
    </svg>
  );
}

const brand = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true } as const;

export function FacebookIcon({ className = '' }: { className?: string }) {
  return (
    <svg {...brand} className={className}>
      <path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.6V3.4c-.3 0-1.2-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.4H7.5V13h2.8v8h3.2z" />
    </svg>
  );
}

export function InstagramIcon({ className = '' }: { className?: string }) {
  return (
    <svg {...brand} className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TikTokIcon({ className = '' }: { className?: string }) {
  return (
    <svg {...brand} className={className}>
      <path d="M16.6 3c.3 2.2 1.6 3.7 3.7 3.9v3a7 7 0 0 1-3.7-1.2v6.1a5.8 5.8 0 1 1-5.8-5.8c.3 0 .6 0 .9.1v3.1a2.8 2.8 0 1 0 1.9 2.6V3h3z" />
    </svg>
  );
}
