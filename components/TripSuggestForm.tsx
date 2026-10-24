'use client';

import { useRef, useState, type ReactNode } from 'react';

import { useLocale } from '@/lib/i18n/LocaleProvider';
import type { Locale } from '@/lib/i18n/config';
import { track } from '@/lib/analytics';
import { MAX_DAYS, MAX_STOPS, MIN_STOPS } from '@/lib/tripSuggest';

export interface PlaceChoice {
  id: string;
  name: string;
  region: string;
}

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string };

const COPY: Record<
  Locale,
  {
    name: string;
    namePlaceholder: string;
    description: string;
    descriptionPlaceholder: string;
    days: string;
    daysUnit: (n: number) => string;
    stops: string;
    stopsHint: (min: number, max: number) => string;
    addStop: string;
    pickStop: string;
    moveUp: string;
    moveDown: string;
    removeStop: string;
    author: string;
    authorHint: string;
    contact: string;
    contactHint: string;
    required: string;
    submit: string;
    sending: string;
    errorName: string;
    errorDescription: string;
    errorStops: (min: number) => string;
    errorSend: string;
    errorTooMany: string;
    thanks: string;
    thanksBody: (name: string) => string;
    backToMap: string;
    another: string;
    count: (n: number, max: number) => string;
  }
> = {
  fr: {
    name: 'Nom du trip',
    namePlaceholder: 'Du Cap Bon aux îles Kerkennah',
    description: 'Ce qui fait l’intérêt de ce parcours',
    descriptionPlaceholder: 'Pour qui, à quelle saison, ce qu’on voit en chemin, les conseils de route…',
    days: 'Durée',
    daysUnit: (n) => (n > 1 ? `${n} jours` : '1 jour'),
    stops: 'Les étapes, dans l’ordre',
    stopsHint: (min, max) => `De ${min} à ${max} lieux de la carte`,
    addStop: 'Ajouter une étape',
    pickStop: 'Choisir un lieu…',
    moveUp: 'Monter',
    moveDown: 'Descendre',
    removeStop: 'Retirer',
    author: 'Votre prénom',
    authorHint: 'Pour vous créditer',
    contact: 'Email ou WhatsApp',
    contactHint: 'Si on a une question',
    required: 'requis',
    submit: 'Proposer ce trip',
    sending: 'Envoi…',
    errorName: 'Donnez un nom au trip.',
    errorDescription: 'Quelques mots de plus : au moins 10 caractères.',
    errorStops: (min) => `Ajoutez au moins ${min} étapes.`,
    errorSend: 'L’envoi n’a pas abouti. Réessayez dans un instant.',
    errorTooMany: 'Vous avez déjà envoyé plusieurs propositions : réessayez dans une heure.',
    thanks: 'Merci, c’est noté.',
    thanksBody: (name) =>
      `On va regarder « ${name} » de près. S’il rejoint la carte, vous le retrouverez dans les road trips.`,
    backToMap: 'Retour à la carte',
    another: 'Proposer un autre trip',
    count: (n, max) => `${n} / ${max}`,
  },
  en: {
    name: 'Name of the trip',
    namePlaceholder: 'From Cap Bon to the Kerkennah islands',
    description: 'What makes this route worth it',
    descriptionPlaceholder: 'Who it suits, which season, what you see on the way, tips for the road…',
    days: 'Length',
    daysUnit: (n) => (n > 1 ? `${n} days` : '1 day'),
    stops: 'The stops, in order',
    stopsHint: (min, max) => `${min} to ${max} places from the map`,
    addStop: 'Add a stop',
    pickStop: 'Choose a place…',
    moveUp: 'Move up',
    moveDown: 'Move down',
    removeStop: 'Remove',
    author: 'Your first name',
    authorHint: 'So we can credit you',
    contact: 'Email or WhatsApp',
    contactHint: 'In case we have a question',
    required: 'required',
    submit: 'Suggest this trip',
    sending: 'Sending…',
    errorName: 'Please give the trip a name.',
    errorDescription: 'A few more words, please: at least 10 characters.',
    errorStops: (min) => `Please add at least ${min} stops.`,
    errorSend: 'Sending did not work. Please try again in a moment.',
    errorTooMany: 'You have already sent several suggestions: please try again in an hour.',
    thanks: 'Thank you, it’s on our list.',
    thanksBody: (name) =>
      `We’ll take a closer look at “${name}”. If it makes it onto the map, you’ll find it among the road trips.`,
    backToMap: 'Back to the map',
    another: 'Suggest another trip',
    count: (n, max) => `${n} / ${max}`,
  },
};

const input =
  'w-full rounded-2xl border border-sand-200 bg-transparent px-4 py-3 text-[15px] text-charcoal placeholder:text-charcoal-300 transition focus:border-charcoal focus:outline-none';
const small =
  'rounded-pill border border-sand-200 px-3 py-1 text-xs text-charcoal-700 transition hover:border-charcoal-300 disabled:opacity-40 disabled:hover:border-sand-200';

/** Suggest a road trip: an ordered list of places from the map. Saved as pending and moderated in /admin. */
export default function TripSuggestForm({ places }: { places: PlaceChoice[] }) {
  const { locale } = useLocale();
  const c = COPY[locale];
  const openedAt = useRef(Date.now());
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [days, setDays] = useState(3);
  const [stops, setStops] = useState<string[]>([]);
  const [author, setAuthor] = useState('');
  const [contact, setContact] = useState('');
  const [errors, setErrors] = useState<{ name?: string; description?: string; stops?: string }>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const byId = new Map(places.map((p) => [p.id, p]));
  const sorted = [...places].sort((a, b) => a.name.localeCompare(b.name, locale));

  const move = (i: number, by: -1 | 1) =>
    setStops((s) => {
      const next = [...s];
      [next[i], next[i + by]] = [next[i + by], next[i]];
      return next;
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = {
      name: name.trim() ? undefined : c.errorName,
      description: description.trim().length >= 10 ? undefined : c.errorDescription,
      stops: stops.length >= MIN_STOPS ? undefined : c.errorStops(MIN_STOPS),
    };
    setErrors(next);
    if (next.name || next.description || next.stops) {
      const first = next.name ? 'trip-name' : next.description ? 'trip-description' : 'trip-stops';
      document.getElementById(first)?.focus();
      return;
    }
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/trip-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          days,
          stops,
          author,
          contact,
          locale,
          elapsed: Date.now() - openedAt.current,
        }),
      });
      if (res.ok) {
        track('trip_suggested', { stops: stops.length, days });
        setStatus({ kind: 'sent' });
        return;
      }
      setStatus({ kind: 'error', message: res.status === 429 ? c.errorTooMany : c.errorSend });
    } catch {
      setStatus({ kind: 'error', message: c.errorSend });
    }
  };

  if (status.kind === 'sent') {
    return (
      <div role="status" className="mt-12 border-t border-sand-200 pt-10">
        <p className="font-serif text-3xl leading-tight">{c.thanks}</p>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-charcoal-500">{c.thanksBody(name)}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/explore"
            className="rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700"
          >
            {c.backToMap}
          </a>
          <button
            type="button"
            onClick={() => {
              setName('');
              setDescription('');
              setDays(3);
              setStops([]);
              setStatus({ kind: 'idle' });
              openedAt.current = Date.now();
            }}
            className="rounded-pill border border-sand-200 px-5 py-2.5 text-sm text-charcoal-700 transition hover:border-charcoal-300"
          >
            {c.another}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-12 space-y-8 border-t border-sand-200 pt-10" noValidate>
      <Field label={c.name} required requiredLabel={c.required} error={errors.name}>
        <input
          id="trip-name"
          className={`${input} ${errors.name ? 'border-terracotta' : ''}`}
          aria-invalid={!!errors.name}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={c.namePlaceholder}
          maxLength={100}
        />
      </Field>

      <Field
        label={c.description}
        required
        requiredLabel={c.required}
        hint={`${description.length} / 1500`}
        error={errors.description}
      >
        <textarea
          id="trip-description"
          className={`${input} min-h-[140px] resize-y ${errors.description ? 'border-terracotta' : ''}`}
          aria-invalid={!!errors.description}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={c.descriptionPlaceholder}
          maxLength={1500}
        />
      </Field>

      <Field label={c.days}>
        <select className={input} value={days} onChange={(e) => setDays(Number(e.target.value))}>
          {Array.from({ length: MAX_DAYS }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {c.daysUnit(n)}
            </option>
          ))}
        </select>
      </Field>

      <fieldset>
        <legend className="flex w-full items-baseline justify-between gap-3 text-sm">
          <span className="font-medium text-charcoal">
            {c.stops}
            <span className="ml-1 font-normal text-charcoal-300">{c.required}</span>
          </span>
          <span className="text-xs text-charcoal-300">{c.count(stops.length, MAX_STOPS)}</span>
        </legend>
        <p className="mt-1 text-xs text-charcoal-300">{c.stopsHint(MIN_STOPS, MAX_STOPS)}</p>

        {stops.length > 0 && (
          <ol className="mt-3 space-y-2">
            {stops.map((id, i) => {
              const p = byId.get(id);
              return (
                <li key={id} className="flex items-center gap-3 rounded-2xl border border-sand-200 px-4 py-2.5">
                  <span className="w-5 shrink-0 font-serif text-lg text-charcoal-300">{i + 1}</span>
                  <span className="min-w-0 flex-1 text-[15px] text-charcoal">
                    {p?.name ?? id}
                    {p?.region && <span className="ml-2 text-xs text-charcoal-300">{p.region}</span>}
                  </span>
                  <button type="button" className={small} disabled={i === 0} onClick={() => move(i, -1)}>
                    {c.moveUp}
                  </button>
                  <button type="button" className={small} disabled={i === stops.length - 1} onClick={() => move(i, 1)}>
                    {c.moveDown}
                  </button>
                  <button type="button" className={small} onClick={() => setStops((s) => s.filter((x) => x !== id))}>
                    {c.removeStop}
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        {stops.length < MAX_STOPS && (
          <select
            id="trip-stops"
            aria-label={c.addStop}
            className={`${input} mt-3 ${errors.stops ? 'border-terracotta' : ''}`}
            aria-invalid={!!errors.stops}
            value=""
            onChange={(e) => {
              if (e.target.value) setStops((s) => [...s, e.target.value]);
              setErrors((prev) => ({ ...prev, stops: undefined }));
            }}
          >
            <option value="">
              {c.addStop} : {c.pickStop}
            </option>
            {sorted
              .filter((p) => !stops.includes(p.id))
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.region})
                </option>
              ))}
          </select>
        )}
        {errors.stops && (
          <p role="alert" className="mt-2 text-xs text-terracotta">
            {errors.stops}
          </p>
        )}
      </fieldset>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field label={c.author} hint={c.authorHint}>
          <input
            className={input}
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={80}
            autoComplete="given-name"
          />
        </Field>
        <Field label={c.contact} hint={c.contactHint}>
          <input
            className={input}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            maxLength={120}
            autoComplete="email"
          />
        </Field>
      </div>

      {status.kind === 'error' && (
        <p role="alert" className="border-l-2 border-terracotta pl-3 text-sm text-charcoal-700">
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={status.kind === 'sending'}
        className="rounded-pill bg-charcoal px-6 py-3 text-sm text-cream transition hover:bg-charcoal-700 disabled:opacity-60"
      >
        {status.kind === 'sending' ? c.sending : c.submit}
      </button>
    </form>
  );
}

function Field({
  label,
  required,
  requiredLabel,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  requiredLabel?: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-charcoal">
          {label}
          {required && <span className="ml-1 font-normal text-charcoal-300">{requiredLabel}</span>}
        </span>
        {hint && <span className="text-xs text-charcoal-300">{hint}</span>}
      </span>
      <span className="mt-2 block">{children}</span>
      {error && (
        <span role="alert" className="mt-2 block text-xs text-terracotta">
          {error}
        </span>
      )}
    </label>
  );
}
