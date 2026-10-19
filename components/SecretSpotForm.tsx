'use client';

import { useState, type ReactNode } from 'react';

import BrandIcon from '@/components/BrandIcon';
import { secretSpotWhatsAppUrl } from '@/lib/links';
import { EMPTY_SPOT, SPOT_TYPES, cleanSpot, spotAsText, type SecretSpot } from '@/lib/secretSpot';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'whatsapp'; url: string }
  | { kind: 'error'; message: string };

const input =
  'w-full rounded-2xl border border-sand-200 bg-transparent px-4 py-3 text-[15px] text-charcoal placeholder:text-charcoal-300 transition focus:border-charcoal focus:outline-none';

export default function SecretSpotForm() {
  const [spot, setSpot] = useState<SecretSpot>(EMPTY_SPOT);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [locating, setLocating] = useState(false);

  const set = (key: keyof SecretSpot) => (e: { target: { value: string } }) =>
    setSpot((s) => ({ ...s, [key]: e.target.value }));

  const useMyPosition = () => {
    if (!('geolocation' in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setSpot((s) => ({ ...s, location: `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}` }));
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = cleanSpot(spot);
    if (!clean) {
      setStatus({ kind: 'error', message: 'Indiquez au moins le nom du lieu, la région et ce qui le rend spécial.' });
      return;
    }
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/spot-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...clean, website }),
      });
      if (res.ok) {
        setStatus({ kind: 'sent' });
        return;
      }
      // No webhook configured, or it failed: hand the suggestion over to WhatsApp instead.
      setStatus({ kind: 'whatsapp', url: secretSpotWhatsAppUrl(spotAsText(clean)) });
    } catch {
      setStatus({ kind: 'whatsapp', url: secretSpotWhatsAppUrl(spotAsText(clean)) });
    }
  };

  if (status.kind === 'sent') {
    return (
      <div role="status" className="mt-12 border-t border-sand-200 pt-10">
        <p className="font-serif text-3xl leading-tight">Merci, c’est noté.</p>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-charcoal-500">
          On va voir {spot.name} de plus près. S’il rejoint la carte, vous serez crédité
          {spot.author ? `, ${spot.author}` : ''}.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="/explore" className="rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700">
            Retour à la carte
          </a>
          <button
            type="button"
            onClick={() => {
              setSpot(EMPTY_SPOT);
              setStatus({ kind: 'idle' });
            }}
            className="rounded-pill border border-sand-200 px-5 py-2.5 text-sm text-charcoal-700 transition hover:border-charcoal-300"
          >
            Proposer un autre lieu
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-12 space-y-8 border-t border-sand-200 pt-10" noValidate>
      <Field label="Nom du lieu" required>
        <input className={input} value={spot.name} onChange={set('name')} placeholder="Café des pêcheurs, crique sans nom…" maxLength={120} required />
      </Field>

      <fieldset>
        <legend className="text-sm font-medium text-charcoal">Type de lieu</legend>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SPOT_TYPES.map((t) => {
            const active = spot.type === t;
            return (
              <label
                key={t}
                className={`cursor-pointer rounded-pill border px-4 py-1.5 text-sm transition has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-charcoal ${
                  active ? 'border-charcoal bg-charcoal text-cream' : 'border-sand-200 text-charcoal-700 hover:border-charcoal-300'
                }`}
              >
                <input type="radio" name="type" value={t} checked={active} onChange={set('type')} className="sr-only" />
                {t}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="Région ou ville" required>
          <input className={input} value={spot.area} onChange={set('area')} placeholder="Cap Bon, près d’El Haouaria" maxLength={120} required />
        </Field>
        <Field
          label="Position"
          hint={
            <button
              type="button"
              onClick={useMyPosition}
              className="text-charcoal-500 underline decoration-sand-300 underline-offset-4 transition hover:text-charcoal"
            >
              {locating ? 'Localisation…' : 'J’y suis, utiliser ma position'}
            </button>
          }
        >
          <input className={input} value={spot.location} onChange={set('location')} placeholder="Lien Google Maps ou coordonnées" maxLength={300} />
        </Field>
      </div>

      <Field label="Pourquoi c’est spécial" required>
        <textarea
          className={`${input} min-h-[140px] resize-y`}
          value={spot.why}
          onChange={set('why')}
          placeholder="Ce qu’on y trouve, comment y accéder, ce qu’il faut commander…"
          maxLength={2000}
          required
        />
      </Field>

      <Field label="Meilleur moment">
        <input className={input} value={spot.bestTime} onChange={set('bestTime')} placeholder="Au coucher du soleil, en semaine, de mai à septembre…" maxLength={200} />
      </Field>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field label="Votre prénom" hint="Pour vous créditer">
          <input className={input} value={spot.author} onChange={set('author')} maxLength={80} autoComplete="given-name" />
        </Field>
        <Field label="Email ou WhatsApp" hint="Si on a une question">
          <input className={input} value={spot.contact} onChange={set('contact')} maxLength={120} autoComplete="email" />
        </Field>
      </div>

      {/* Honeypot for bots, hidden from people and screen readers. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      {status.kind === 'error' && (
        <p role="alert" className="border-l-2 border-terracotta pl-3 text-sm text-charcoal-700">
          {status.message}
        </p>
      )}

      {status.kind === 'whatsapp' ? (
        <div role="status" className="rounded-3xl border border-sand-200 p-6">
          <p className="text-[15px] text-charcoal">Dernière étape : envoyez-nous la proposition par WhatsApp.</p>
          <p className="mt-1 text-sm text-charcoal-500">Le message est déjà rédigé, il suffit de l’envoyer.</p>
          <a
            href={status.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700"
          >
            <BrandIcon brand="whatsapp" className="h-4 w-4" />
            Envoyer via WhatsApp
          </a>
        </div>
      ) : (
        <button
          type="submit"
          disabled={status.kind === 'sending'}
          className="rounded-pill bg-charcoal px-6 py-3 text-sm text-cream transition hover:bg-charcoal-700 disabled:opacity-60"
        >
          {status.kind === 'sending' ? 'Envoi…' : 'Proposer ce spot'}
        </button>
      )}
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-charcoal">
          {label}
          {required && <span className="ml-1 font-normal text-charcoal-300">requis</span>}
        </span>
        {hint && <span className="text-xs text-charcoal-300">{hint}</span>}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
