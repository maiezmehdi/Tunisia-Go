'use client';

import { useEffect, useState } from 'react';

import { useLocale } from '@/lib/i18n/LocaleProvider';

const COPY = {
  fr: {
    none: 'Pas encore d’avis',
    votes: (n: number) => `${n} avis`,
    invite: 'Donnez votre note',
    yours: (n: number) => `Votre note : ${n}/5. Cliquez pour la changer.`,
    thanks: 'Merci pour votre avis.',
    failed: 'Le vote n’a pas abouti. Réessayez dans un instant.',
    tooMany: 'Trop de votes pour le moment. Réessayez plus tard.',
    label: (n: number) => `${n} sur 5`,
    group: 'Note du lieu',
  },
  en: {
    none: 'No ratings yet',
    votes: (n: number) => `${n} ${n === 1 ? 'rating' : 'ratings'}`,
    invite: 'Give your rating',
    yours: (n: number) => `Your rating: ${n}/5. Click to change it.`,
    thanks: 'Thank you for your rating.',
    failed: 'The vote did not go through. Please try again in a moment.',
    tooMany: 'Too many votes for now. Please try again later.',
    label: (n: number) => `${n} out of 5`,
    group: 'Rate this place',
  },
} as const;

const KEY = (id: string) => `tg-rating-${id}`;

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1L3.2 9.6l6.1-.8z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Star rating on a place page. No account: one vote per visitor, checked on the server. */
export default function PlaceRating({
  placeId,
  average,
  votes,
}: {
  placeId: string;
  average: number | null;
  votes: number;
}) {
  const { locale } = useLocale();
  const c = COPY[locale];
  const [stat, setStat] = useState({ average, votes });
  const [mine, setMine] = useState(0);
  const [hover, setHover] = useState(0);
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error' | 'limit'>('idle');

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(KEY(placeId)));
      if (saved >= 1 && saved <= 5) setMine(saved);
    } catch {
      /* storage blocked: the vote still works, it just is not remembered here */
    }
  }, [placeId]);

  const vote = async (stars: number) => {
    setState('sending');
    try {
      const res = await fetch('/api/rate-place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, stars }),
      });
      if (res.status === 429) return setState('limit');
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { average: number; votes: number };
      setStat({ average: data.average, votes: data.votes });
      setMine(stars);
      try {
        localStorage.setItem(KEY(placeId), String(stars));
      } catch {
        /* ignore */
      }
      setState('sent');
    } catch {
      setState('error');
    }
  };

  const shown = hover || mine || Math.round(stat.average ?? 0);
  const format = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', { maximumFractionDigits: 1 });

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <div role="group" aria-label={c.group} className="flex text-terracotta-700" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={state === 'sending'}
              onClick={() => vote(n)}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(0)}
              aria-label={c.label(n)}
              aria-pressed={mine === n}
              className="p-0.5 transition hover:scale-110 disabled:opacity-60"
            >
              <Star filled={n <= shown} />
            </button>
          ))}
        </div>
        <p className="text-sm text-charcoal-500">
          {stat.average !== null && stat.votes > 0 ? (
            <>
              <span className="font-medium text-charcoal">{format.format(stat.average)}</span> · {c.votes(stat.votes)}
            </>
          ) : (
            c.none
          )}
        </p>
      </div>
      <p role="status" className="mt-1 min-h-5 text-xs text-charcoal-500">
        {state === 'sent'
          ? c.thanks
          : state === 'error'
            ? c.failed
            : state === 'limit'
              ? c.tooMany
              : mine
                ? c.yours(mine)
                : c.invite}
      </p>
    </div>
  );
}
