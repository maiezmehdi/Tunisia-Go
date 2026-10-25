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
