'use client';

import { useRef, useState } from 'react';

import RewriteButton from '@/components/RewriteButton';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { resizeImage } from '@/lib/resizeImage';

export interface ProProfile {
  bio: string;
  experience: string;
  placeId: string;
  /** Path of the uploaded photo in storage, sent back when the entry is saved. */
  photoPath: string;
  /** What to show as the photo: the stored one, or the one just picked. */
  photoUrl: string;
}

const COPY = {
  fr: {
    photo: 'Photo du lieu ou de l’enseigne',
    photoHint:
      'La photo de votre agence, de votre bureau ou du lieu où vous accueillez les voyageurs. Elle est réduite automatiquement.',
    choose: 'Choisir une photo',
    change: 'Changer la photo',
    uploading: 'Envoi de la photo…',
    photoError: 'La photo n’a pas pu être envoyée. Essayez une autre image (JPEG ou PNG).',
    place: 'Lieu où vous exercez',
    placeHint: 'Le lieu du site le plus proche de votre activité : il place votre fiche sur la carte.',
    placeNone: 'Choisir un lieu',
    bio: 'Présentation',
    bioHint: 'Qui vous êtes, ce que vous proposez, les langues que vous parlez.',
    experience: 'Expérience',
    experienceHint: 'Depuis combien de temps, les régions et types de voyages que vous connaissez bien.',
  },
  en: {
    photo: 'Photo of the place or storefront',
    photoHint:
      'A photo of your agency, your office or the place where you welcome travellers. It is shrunk automatically.',
    choose: 'Choose a photo',
    change: 'Change the photo',
    uploading: 'Sending the photo…',
    photoError: 'The photo could not be sent. Try another image (JPEG or PNG).',
    place: 'Where you work',
    placeHint: 'The site’s place closest to your activity: it puts your listing on the map.',
    placeNone: 'Choose a place',
    bio: 'About you',
    bioHint: 'Who you are, what you offer, the languages you speak.',
    experience: 'Experience',
    experienceHint: 'How long you have been doing this, the regions and kinds of trips you know well.',
  },
} as const;

const field =
  'mt-1.5 w-full rounded-2xl border border-sand-200 bg-white px-4 py-2.5 text-[15px] text-charcoal outline-none transition placeholder:text-charcoal-300 focus:border-charcoal';

/** Photo, place of work and bio, shared by the sign-up form and the edit page. */
export default function ProProfileFields({
  accessToken,
  value,
  onChange,
  onExpired,
  bioMax,
  experienceMax,
}: {
  accessToken: string;
  value: ProProfile;
  onChange: (patch: Partial<ProProfile>) => void;
  onExpired: () => void;
  bioMax: number;
  experienceMax: number;
}) {
  const { locale, catalog } = useLocale();
  const c = COPY[locale];
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<'idle' | 'uploading' | 'error'>('idle');

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setState('uploading');
    try {
      const blob = await resizeImage(file, 1200, 600_000);
      const body = new FormData();
      body.set('accessToken', accessToken);
      body.set('photo', new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
      const res = await fetch('/api/pro-photo', { method: 'POST', body });
      if (res.status === 401) return onExpired();
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { path: string };
      onChange({ photoPath: data.path, photoUrl: URL.createObjectURL(blob) });
      setState('idle');
    } catch {
      setState('error');
    }
  };

  const regions = [...new Set(catalog.places.map((p) => p.region))].sort((a, b) => a.localeCompare(b, locale));

  return (
    <>
      <div>
        <p className="text-sm font-medium text-charcoal">{c.photo}</p>
        <div className="mt-2 flex items-center gap-4">
          <span className="grid h-20 w-32 shrink-0 place-items-center overflow-hidden rounded-2xl border border-sand-200 bg-sand-50">
            {value.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : null}
          </span>
          <div>
            <button
              type="button"
              disabled={state === 'uploading'}
              onClick={() => input.current?.click()}
              className="rounded-pill border border-sand-200 px-4 py-1.5 text-sm text-charcoal-700 transition hover:border-charcoal-300 disabled:opacity-60"
            >
              {state === 'uploading' ? c.uploading : value.photoUrl ? c.change : c.choose}
            </button>
            <input
              ref={input}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              className="sr-only"
              onChange={(e) => {
                void pick(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <p className="mt-1.5 text-xs text-charcoal-500">{c.photoHint}</p>
          </div>
        </div>
        {state === 'error' && (
          <p role="alert" className="mt-2 text-sm text-terracotta-700">
            {c.photoError}
          </p>
        )}
      </div>

      <label className="block text-sm font-medium text-charcoal">
        {c.place}
        <select
          className={`${field} font-normal`}
          value={value.placeId}
          onChange={(e) => onChange({ placeId: e.target.value })}
        >
          <option value="">{c.placeNone}</option>
          {regions.map((region) => (
            <optgroup key={region} label={region}>
              {catalog.places
                .filter((p) => p.region === region)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <span className="mt-1 block text-xs font-normal text-charcoal-500">{c.placeHint}</span>
      </label>

      <div>
        <label className="block text-sm font-medium text-charcoal" htmlFor="pro-bio">
          {c.bio}
        </label>
        <textarea
          id="pro-bio"
          className={`${field} min-h-[120px] resize-y font-normal`}
          value={value.bio}
          maxLength={bioMax}
          onChange={(e) => onChange({ bio: e.target.value })}
        />
        <div className="flex items-start justify-between gap-4">
          <p className="mt-1 text-xs text-charcoal-500">{c.bioHint}</p>
          <span className="mt-1 shrink-0 text-xs text-charcoal-300">
            {value.bio.length}/{bioMax}
          </span>
        </div>
        <RewriteButton
          audience="visitor"
          value={value.bio}
          lang={locale}
          kind="bio"
          onAccept={(text) => onChange({ bio: text.slice(0, bioMax) })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-charcoal" htmlFor="pro-experience">
          {c.experience}
        </label>
        <textarea
          id="pro-experience"
          className={`${field} min-h-[90px] resize-y font-normal`}
          value={value.experience}
          maxLength={experienceMax}
          onChange={(e) => onChange({ experience: e.target.value })}
        />
        <div className="flex items-start justify-between gap-4">
          <p className="mt-1 text-xs text-charcoal-500">{c.experienceHint}</p>
          <span className="mt-1 shrink-0 text-xs text-charcoal-300">
            {value.experience.length}/{experienceMax}
          </span>
        </div>
        <RewriteButton
          audience="visitor"
          value={value.experience}
          lang={locale}
          kind="bio"
          onAccept={(text) => onChange({ experience: text.slice(0, experienceMax) })}
        />
      </div>
    </>
  );
}
