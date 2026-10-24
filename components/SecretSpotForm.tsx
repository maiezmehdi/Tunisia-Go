'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import BrandIcon from '@/components/BrandIcon';
import type { Locale } from '@/lib/i18n/config';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { track } from '@/lib/analytics';
import { secretSpotWhatsAppUrl } from '@/lib/links';
import { resizeImage } from '@/lib/resizeImage';
import { EMPTY_SPOT, SPOT_TYPES, SPOT_TYPE_LABELS, cleanSpot, spotAsText, type SecretSpot } from '@/lib/secretSpot';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'whatsapp'; url: string }
  | { kind: 'error'; message: string };

const MAX_PHOTOS = 4;

interface PickedPhoto {
  id: string;
  blob: Blob;
  preview: string;
}

const COPY: Record<
  Locale,
  {
    errorRequired: string;
    errorSend: string;
    errorTooMany: string;
    errorPhotos: string;
    thanks: string;
    thanksBody: (name: string, author: string) => string;
    backToMap: string;
    another: string;
    name: string;
    namePlaceholder: string;
    type: string;
    area: string;
    areaPlaceholder: string;
    position: string;
    locating: string;
    useMyPosition: string;
    positionPlaceholder: string;
    why: string;
    whyPlaceholder: string;
    bestTime: string;
    bestTimePlaceholder: string;
    author: string;
    authorHint: string;
    contact: string;
    contactHint: string;
    whatsappTitle: string;
    whatsappBody: string;
    whatsappButton: string;
    sending: string;
    submit: string;
    required: string;
    photos: string;
    photosHint: (max: number) => string;
    addPhotos: string;
    preparing: string;
    removePhoto: string;
    photoError: string;
    whatsappPhotos: string;
  }
> = {
  fr: {
    errorRequired: 'Indiquez au moins le nom du lieu, la région et ce qui le rend spécial.',
    errorSend: 'L’envoi n’a pas abouti. Réessayez dans un instant.',
    errorTooMany: 'Vous avez déjà envoyé plusieurs propositions : réessayez dans une heure.',
    errorPhotos: 'Les photos sont trop lourdes ou dans un format non accepté (JPEG, PNG ou WebP, 2 Mo maximum).',
    thanks: 'Merci, c’est noté.',
    thanksBody: (name, author) =>
      `On va voir ${name} de plus près. S’il rejoint la carte, vous serez crédité${author ? `, ${author}` : ''}.`,
    backToMap: 'Retour à la carte',
    another: 'Proposer un autre lieu',
    name: 'Nom du lieu',
    namePlaceholder: 'Café des pêcheurs, crique sans nom…',
    type: 'Type de lieu',
    area: 'Région ou ville',
    areaPlaceholder: 'Cap Bon, près d’El Haouaria',
    position: 'Position',
    locating: 'Localisation…',
    useMyPosition: 'J’y suis, utiliser ma position',
    positionPlaceholder: 'Lien Google Maps ou coordonnées',
    why: 'Pourquoi c’est spécial',
    whyPlaceholder: 'Ce qu’on y trouve, comment y accéder, ce qu’il faut commander…',
    bestTime: 'Meilleur moment',
    bestTimePlaceholder: 'Au coucher du soleil, en semaine, de mai à septembre…',
    author: 'Votre prénom',
    authorHint: 'Pour vous créditer',
    contact: 'Email ou WhatsApp',
    contactHint: 'Si on a une question',
    whatsappTitle: 'Dernière étape : envoyez-nous la proposition par WhatsApp.',
    whatsappBody: 'Le message est déjà rédigé, il suffit de l’envoyer.',
    whatsappButton: 'Envoyer via WhatsApp',
    sending: 'Envoi…',
    submit: 'Proposer ce lieu',
    required: 'requis',
    photos: 'Ajoutez des photos utiles',
    photosHint: (max) => `Jusqu’à ${max} : l’entrée, la vue, le plat, le chemin…`,
    addPhotos: 'Choisir des photos',
    preparing: 'Préparation…',
    removePhoto: 'Retirer la photo',
    photoError: 'Une photo n’a pas pu être lue. Essayez une autre image (JPEG ou PNG).',
    whatsappPhotos: 'Pensez à joindre vos photos dans la conversation.',
  },
  en: {
    errorRequired: 'Please give at least the name of the place, the area and what makes it special.',
    errorSend: 'Sending did not work. Please try again in a moment.',
    errorTooMany: 'You have already sent several suggestions: please try again in an hour.',
    errorPhotos: 'The photos are too large or in an unsupported format (JPEG, PNG or WebP, 2 MB max).',
    thanks: 'Thank you, it’s on our list.',
    thanksBody: (name, author) =>
      `We’ll take a closer look at ${name}. If it makes it onto the map, you’ll be credited${author ? `, ${author}` : ''}.`,
    backToMap: 'Back to the map',
    another: 'Suggest another place',
    name: 'Name of the place',
    namePlaceholder: 'The fishermen’s café, a nameless cove…',
    type: 'Kind of place',
    area: 'Area or town',
    areaPlaceholder: 'Cap Bon, near El Haouaria',
    position: 'Location',
    locating: 'Locating…',
    useMyPosition: 'I’m here, use my location',
    positionPlaceholder: 'Google Maps link or coordinates',
    why: 'What makes it special',
    whyPlaceholder: 'What you’ll find there, how to get there, what to order…',
    bestTime: 'Best time to go',
    bestTimePlaceholder: 'At sunset, on weekdays, from May to September…',
    author: 'Your first name',
    authorHint: 'So we can credit you',
    contact: 'Email or WhatsApp',
    contactHint: 'In case we have a question',
    whatsappTitle: 'One last step: send us your suggestion on WhatsApp.',
    whatsappBody: 'The message is already written; all you need to do is send it.',
    whatsappButton: 'Send via WhatsApp',
    sending: 'Sending…',
    submit: 'Suggest this place',
    required: 'required',
    photos: 'Add helpful photos',
    photosHint: (max) => `Up to ${max}: the entrance, the view, the dish, the path…`,
    addPhotos: 'Choose photos',
    preparing: 'Preparing…',
    removePhoto: 'Remove photo',
    photoError: 'One photo could not be read. Try another image (JPEG or PNG).',
    whatsappPhotos: 'Remember to attach your photos in the chat.',
  },
};

const input =
  'w-full rounded-2xl border border-sand-200 bg-transparent px-4 py-3 text-[15px] text-charcoal placeholder:text-charcoal-300 transition focus:border-charcoal focus:outline-none';

export default function SecretSpotForm() {
  const { locale } = useLocale();
  const c = COPY[locale];
  const [spot, setSpot] = useState<SecretSpot>(EMPTY_SPOT);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [locating, setLocating] = useState(false);
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  const [preparing, setPreparing] = useState(false);
  const [photoError, setPhotoError] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const previews = useRef<string[]>([]);
  previews.current = photos.map((p) => p.preview);
  useEffect(() => () => previews.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setPhotoError(false);
    setPreparing(true);
    const room = MAX_PHOTOS - photos.length;
    const picked: PickedPhoto[] = [];
    for (const file of Array.from(files).slice(0, room)) {
      try {
        const blob = await resizeImage(file);
        picked.push({ id: crypto.randomUUID(), blob, preview: URL.createObjectURL(blob) });
      } catch {
        setPhotoError(true);
      }
    }
    setPhotos((prev) => [...prev, ...picked].slice(0, MAX_PHOTOS));
    setPreparing(false);
    if (fileInput.current) fileInput.current.value = '';
  };

  const removePhoto = (id: string) =>
    setPhotos((prev) => {
      const gone = prev.find((p) => p.id === id);
      if (gone) URL.revokeObjectURL(gone.preview);
      return prev.filter((p) => p.id !== id);
    });

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
      setStatus({ kind: 'error', message: c.errorRequired });
      return;
    }
    setStatus({ kind: 'sending' });
    // Saving failed: hand the suggestion over to WhatsApp when a real number is set, else ask to retry.
    const fallback = (code?: number) => {
      // Not a saving problem: say what to change instead of handing over to WhatsApp.
      if (code === 429 || code === 413 || code === 400) {
        setStatus({
          kind: 'error',
          message: code === 429 ? c.errorTooMany : code === 413 ? c.errorPhotos : c.errorRequired,
        });
        return;
      }
      const url = secretSpotWhatsAppUrl(spotAsText(clean));
      setStatus(url ? { kind: 'whatsapp', url } : { kind: 'error', message: c.errorSend });
    };
    try {
      const body = new FormData();
      for (const [key, value] of Object.entries(clean)) body.append(key, value);
      body.append('fax_number', website);
      body.append('locale', locale);
      photos.forEach((p, i) => body.append('photos', p.blob, `photo-${i + 1}.jpg`));
      const res = await fetch('/api/spot-secret', { method: 'POST', body });
      if (res.ok) {
        track('spot_suggested', { type: clean.type, photos: photos.length });
        setStatus({ kind: 'sent' });
        return;
      }
      fallback(res.status);
    } catch {
      fallback();
    }
  };

  if (status.kind === 'sent') {
    return (
      <div role="status" className="mt-12 border-t border-sand-200 pt-10">
        <p className="font-serif text-3xl leading-tight">{c.thanks}</p>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-charcoal-500">
          {c.thanksBody(spot.name, spot.author)}
        </p>
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
              photos.forEach((p) => URL.revokeObjectURL(p.preview));
              setPhotos([]);
              setSpot(EMPTY_SPOT);
              setStatus({ kind: 'idle' });
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
      <Field label={c.name} required>
        <input
          className={input}
          value={spot.name}
          onChange={set('name')}
          placeholder={c.namePlaceholder}
          maxLength={120}
          required
        />
      </Field>

      <fieldset>
        <legend className="text-sm font-medium text-charcoal">{c.type}</legend>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SPOT_TYPES.map((t) => {
            const active = spot.type === t;
            return (
              <label
                key={t}
                className={`cursor-pointer rounded-pill border px-4 py-1.5 text-sm transition has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-charcoal ${
                  active
                    ? 'border-charcoal bg-charcoal text-cream'
                    : 'border-sand-200 text-charcoal-700 hover:border-charcoal-300'
                }`}
              >
                <input type="radio" name="type" value={t} checked={active} onChange={set('type')} className="sr-only" />
                {SPOT_TYPE_LABELS[locale][t]}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field label={c.area} required>
          <input
            className={input}
            value={spot.area}
            onChange={set('area')}
            placeholder={c.areaPlaceholder}
            maxLength={120}
            required
          />
        </Field>
        <Field
          label={c.position}
          hint={
            <button
              type="button"
              onClick={useMyPosition}
              className="text-charcoal-500 underline decoration-sand-300 underline-offset-4 transition hover:text-charcoal"
            >
              {locating ? c.locating : c.useMyPosition}
            </button>
          }
        >
          <input
            className={input}
            value={spot.location}
            onChange={set('location')}
            placeholder={c.positionPlaceholder}
            maxLength={300}
          />
        </Field>
      </div>

      <Field label={c.why} required>
        <textarea
          className={`${input} min-h-[140px] resize-y`}
          value={spot.why}
          onChange={set('why')}
          placeholder={c.whyPlaceholder}
          maxLength={2000}
          required
        />
      </Field>

      <Field label={c.bestTime}>
        <input
          className={input}
          value={spot.bestTime}
          onChange={set('bestTime')}
          placeholder={c.bestTimePlaceholder}
          maxLength={200}
        />
      </Field>

      <fieldset>
        <legend className="flex w-full items-baseline justify-between gap-3 text-sm">
          <span className="font-medium text-charcoal">{c.photos}</span>
          <span className="text-xs text-charcoal-300">{c.photosHint(MAX_PHOTOS)}</span>
        </legend>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {photos.map((p, i) => (
            <div key={p.id} className="relative aspect-square overflow-hidden rounded-2xl bg-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.preview} alt={`${c.photos} ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(p.id)}
                aria-label={c.removePhoto}
                className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-cream/90 text-charcoal backdrop-blur transition hover:bg-cream"
              >
                <svg aria-hidden viewBox="0 0 10 10" className="h-2.5 w-2.5">
                  <path d="M1 1l8 8M9 1l-8 8" fill="none" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-sand-300 px-2 text-center text-xs text-charcoal-500 transition hover:border-charcoal-300 hover:text-charcoal has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-charcoal">
              <svg aria-hidden viewBox="0 0 14 14" className="h-3.5 w-3.5">
                <path d="M7 1v12M1 7h12" fill="none" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              {preparing ? c.preparing : c.addPhotos}
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                multiple
                disabled={preparing}
                onChange={(e) => addPhotos(e.target.files)}
                className="sr-only"
              />
            </label>
          )}
        </div>
        {photoError && <p className="mt-2 text-xs text-charcoal-500">{c.photoError}</p>}
      </fieldset>

      <div className="grid gap-8 sm:grid-cols-2">
        <Field label={c.author} hint={c.authorHint}>
          <input
            className={input}
            value={spot.author}
            onChange={set('author')}
            maxLength={80}
            autoComplete="given-name"
          />
        </Field>
        <Field label={c.contact} hint={c.contactHint}>
          <input
            className={input}
            value={spot.contact}
            onChange={set('contact')}
            maxLength={120}
            autoComplete="email"
          />
        </Field>
      </div>

      {/* Honeypot for bots, hidden from people and screen readers. */}
      <input
        type="text"
        name="fax_number"
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
          <p className="text-[15px] text-charcoal">{c.whatsappTitle}</p>
          <p className="mt-1 text-sm text-charcoal-500">
            {c.whatsappBody}
            {photos.length > 0 && ` ${c.whatsappPhotos}`}
          </p>
          <a
            href={status.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700"
          >
            <BrandIcon brand="whatsapp" className="h-4 w-4" />
            {c.whatsappButton}
          </a>
        </div>
      ) : (
        <button
          type="submit"
          disabled={status.kind === 'sending' || preparing}
          className="rounded-pill bg-charcoal px-6 py-3 text-sm text-cream transition hover:bg-charcoal-700 disabled:opacity-60"
        >
          {status.kind === 'sending' ? c.sending : c.submit}
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
  const requiredLabel = COPY[useLocale().locale].required;
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
    </label>
  );
}
