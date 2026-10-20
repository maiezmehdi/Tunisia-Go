'use client';

import { useLocale } from '@/lib/i18n/LocaleProvider';
import { useSound } from '@/lib/sound';

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
  const colour =
    tone === 'light'
      ? playing
        ? 'text-cream'
        : 'text-cream/55 hover:text-cream'
      : playing || invite
        ? 'text-charcoal'
        : 'text-charcoal-300 hover:text-charcoal';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={playing}
      aria-label={playing ? t.soundOff : t.soundOn}
      title={`${t.soundTrack} · ${playing ? t.soundOff : t.soundOn}`}
      className={`group inline-flex items-center gap-2 text-xs font-medium tracking-[0.04em] transition ${colour} ${className}`}
    >
      <span className="relative inline-flex h-4 w-4 items-center justify-center">
        {invite && <span aria-hidden className="absolute -inset-1.5 animate-ping rounded-full border border-terracotta-400" />}
        <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden className={`relative ${playing ? 'tg-sound-on' : ''}`}>
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
  );
}
