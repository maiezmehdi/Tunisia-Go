'use client';

import { useEffect, useRef, useState } from 'react';

import { useLocale } from '@/lib/i18n/LocaleProvider';
import { useSound } from '@/lib/sound';

/** Set once the hint bubble has been shown, so it only appears on the first visit. */
const HINT_KEY = 'tg-sound-hint';
const HINT_DELAY = 3000;
const HINT_DURATION = 7000;

const BARS = [
  { x: 1, h: 6, rest: 3, d: '0s' },
  { x: 5, h: 12, rest: 7, d: '-0.45s' },
  { x: 9, h: 9, rest: 5, d: '-0.2s' },
  { x: 13, h: 5, rest: 2.5, d: '-0.7s' },
];

/**
 * A discreet sound button: four thin bars that move while the ambience plays, rest low when
 * it is off. With `label`, the track name sits next to it from the sm breakpoint up.
 */
export default function SoundToggle({
  tone = 'dark',
  label = false,
  className = '',
}: {
  tone?: 'dark' | 'light';
  label?: boolean;
  className?: string;
}) {
  const { t } = useLocale();
  const { playing, mood, toggle } = useSound();
  const invite = !playing && mood === 'south';
  const ref = useRef<HTMLButtonElement>(null);
  const [hint, setHint] = useState(false);

  // First visit only: point the button out after a few seconds (no sound is played).
  useEffect(() => {
    let seen = true;
    try {
      seen = localStorage.getItem(HINT_KEY) === '1';
    } catch {
      /* storage blocked: skip the hint */
    }
    if (seen) return;
    let hide: number | undefined;
    const show = window.setTimeout(() => {
      // Several buttons can be on the page (desktop and phone headers): only the visible one speaks.
      const el = ref.current;
      if (!el || el.offsetParent === null || document.querySelector('[data-sound-hint="on"]')) return;
      try {
        localStorage.setItem(HINT_KEY, '1');
      } catch {
        /* ignore */
      }
      setHint(true);
      hide = window.setTimeout(() => setHint(false), HINT_DURATION);
    }, HINT_DELAY);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);
  const colour =
    tone === 'light'
      ? playing
        ? 'text-cream'
        : 'text-cream/55 hover:text-cream'
      : playing || invite
        ? 'text-charcoal'
        : 'text-charcoal-300 hover:text-charcoal';

  return (
    <span className="relative inline-flex">
      <button
        ref={ref}
        type="button"
        onClick={() => {
          setHint(false);
          toggle();
        }}
        aria-pressed={playing}
        aria-label={playing ? t.soundOff : t.soundOn}
        data-tip={playing ? t.soundOff : t.soundOn}
        className={`group inline-flex items-center gap-2 text-xs font-medium tracking-[0.04em] transition ${colour} ${className}`}
      >
        <span className="relative inline-flex h-4 w-4 items-center justify-center">
          {invite && (
            <span aria-hidden className="absolute -inset-1.5 animate-ping rounded-full border border-terracotta-400" />
          )}
          <svg
            viewBox="0 0 16 16"
            width="16"
            height="16"
            aria-hidden
            className={`relative ${playing ? 'tg-sound-on' : ''}`}
          >
            {BARS.map((b) => (
              <rect
                key={b.x}
                x={b.x}
                y={8 - (playing ? b.h : b.rest) / 2}
                width="1.6"
                height={playing ? b.h : b.rest}
                rx="0.8"
                fill="currentColor"
                style={{ animationDelay: b.d, transformOrigin: `${b.x + 0.8}px 8px` }}
              />
            ))}
          </svg>
        </span>
        {(label || invite) && (
          <span className={`hidden whitespace-nowrap sm:inline ${invite ? 'text-terracotta-500' : ''}`}>
            {invite ? t.soundInvite : t.soundTrack}
          </span>
        )}
      </button>
      {hint && (
        <span
          role="status"
          data-sound-hint="on"
          className={`tg-hint absolute right-1/2 top-full z-[1500] mt-3 w-max max-w-[15rem] translate-x-1/2 rounded-2xl px-3.5 py-2.5 text-left text-xs leading-snug shadow-soft ${
            tone === 'light' ? 'bg-cream text-charcoal' : 'bg-charcoal text-cream'
          }`}
        >
          <span
            aria-hidden
            className={`absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 ${tone === 'light' ? 'bg-cream' : 'bg-charcoal'}`}
          />
          <span className="font-medium">{t.soundTrack}</span>
          <span className="mt-0.5 block opacity-75">{t.soundHint}</span>
        </span>
      )}
    </span>
  );
}
