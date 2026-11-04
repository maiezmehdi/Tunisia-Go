'use client';

import { useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * The Tunisia Go mark: a square of the mosaic-eye photo with a Tifinagh-inspired letter on top.
 * The letters take turns every 220 ms (from the design handoff); with reduced motion, or
 * when `animated` is false, the mark rests on the Σ-like letter.
 */
const RING = 'M9,79 A21,21 0 1,0 51,79 A21,21 0 1,0 9,79';
const GLYPHS = [
  { w: 60, d: RING },
  { w: 70, d: 'M70,9 H9 V101 H70' },
  { w: 60, d: RING },
  { w: 100, d: 'M50,0 V110 M12,0 C12,42 88,42 88,0 M12,110 C12,68 88,68 88,110' },
  { w: 80, d: 'M78,9 H14 L56,55 L14,101 H78' },
  { w: 100, d: 'M12,0 V34 L50,60 L88,34 V0 M50,60 V110' },
];
const REST = 4;
const SPEED = 220;

export function BrandMark({
  size = 40,
  animated = true,
  className = '',
}: {
  size?: number;
  animated?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(REST);
  const run = animated && !reduce;

  useEffect(() => {
    if (!run) {
      setI(REST);
      return;
    }
    const id = window.setInterval(() => {
      if (!document.hidden) setI((n) => (n + 1) % GLYPHS.length);
    }, SPEED);
    return () => window.clearInterval(id);
  }, [run]);

  // Letters are 110 units tall and fill 96/170 of the square in the design.
  const h = Math.round(size * (96 / 170) * 100) / 100;
  return (
    <span
      aria-hidden
      className={`relative inline-block shrink-0 overflow-hidden bg-charcoal bg-cover bg-center ${className}`}
      style={{ width: size, height: size, backgroundImage: 'url(/brand/eye-mosaic.webp)' }}
    >
      {GLYPHS.map((g, k) => (
        <svg
          key={k}
          viewBox={`0 0 ${g.w} 110`}
          className="absolute left-1/2 top-1/2 overflow-visible"
          style={{ height: h, transform: 'translate(-50%, -50%)', opacity: k === i ? 1 : 0 }}
        >
          <path d={g.d} fill="none" stroke="#F3EEE6" strokeWidth={18} strokeLinecap="butt" strokeLinejoin="miter" />
        </svg>
      ))}
    </span>
  );
}

/** Mark plus wordmark. `tone="light"` is for dark backgrounds: the words turn white. */
export default function BrandLogo({
  tag = 'Road trips & atlas',
  tone = 'dark',
  size = 40,
  compact = false,
  markOnlyOnPhone = false,
  className = '',
}: {
  tag?: string | null;
  tone?: 'dark' | 'light';
  size?: number;
  /** Phones: smaller words (the tag line stays). */
  compact?: boolean;
  /** Phones: the mark alone, for crowded headers. */
  markOnlyOnPhone?: boolean;
  className?: string;
}) {
  const name = tone === 'light' ? 'text-cream' : 'text-charcoal';
  const sub = tone === 'light' ? 'text-cream/70' : 'text-charcoal-500';
  return (
    <a href="/" aria-label="Tunisia Go" className={`inline-flex shrink-0 items-center gap-3 leading-none ${className}`}>
      <BrandMark size={size} />
      <span className={markOnlyOnPhone ? 'hidden flex-col sm:flex' : 'flex flex-col'}>
        <span
          className={`whitespace-nowrap font-serif uppercase tracking-[-0.01em] ${name} ${
            compact ? 'text-[17px] sm:text-[22px]' : 'text-[22px]'
          }`}
        >
          Tunisia Go
        </span>
        {tag && (
          <span className={`mt-1.5 whitespace-nowrap font-serif text-[9.5px] uppercase tracking-[0.22em] ${sub}`}>
            {tag}
          </span>
        )}
      </span>
    </a>
  );
}
