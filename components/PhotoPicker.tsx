'use client';

import { useEffect, useRef, useState } from 'react';

import { useLocale } from '@/lib/i18n/LocaleProvider';
import type { Locale } from '@/lib/i18n/config';
import { resizeImage } from '@/lib/resizeImage';

export interface PickedPhoto {
  id: string;
  blob: Blob;
  preview: string;
}

const COPY: Record<
  Locale,
  {
    title: string;
    hint: (max: number) => string;
    rules: string;
    add: string;
    preparing: string;
    remove: string;
    error: string;
    limit: (max: number) => string;
  }
> = {
  fr: {
    title: 'Ajoutez des photos',
    hint: (max) => `Jusqu’à ${max} : la route, un paysage, une étape…`,
    rules: 'JPEG, PNG, WebP ou HEIC. Elles sont réduites automatiquement, sans perte visible.',
    add: 'Choisir des photos',
    preparing: 'Préparation…',
    remove: 'Retirer la photo',
    error: 'Une photo n’a pas pu être lue. Essayez une autre image (JPEG ou PNG).',
    limit: (max) => `${max} photos au maximum : les premières ont été gardées.`,
  },
  en: {
    title: 'Add photos',
    hint: (max) => `Up to ${max}: the road, a landscape, a stop…`,
    rules: 'JPEG, PNG, WebP or HEIC. They are shrunk automatically, with no visible loss.',
    add: 'Choose photos',
    preparing: 'Preparing…',
    remove: 'Remove photo',
    error: 'One photo could not be read. Try another image (JPEG or PNG).',
    limit: (max) => `${max} photos at most: the first ones were kept.`,
  },
};

/** Picks photos and shrinks them in the browser (see resizeImage) before they are sent. */
export default function PhotoPicker({
  photos,
  onChange,
  max,
  disabled,
}: {
  photos: PickedPhoto[];
  onChange: (next: PickedPhoto[]) => void;
  max: number;
  disabled?: boolean;
}) {
  const { locale } = useLocale();
  const c = COPY[locale];
  const [preparing, setPreparing] = useState(false);
  const [failed, setFailed] = useState(false);
  const [overLimit, setOverLimit] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const previews = useRef<string[]>([]);
  previews.current = photos.map((p) => p.preview);
  useEffect(() => () => previews.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    setFailed(false);
    setOverLimit(files.length > max - photos.length);
    setPreparing(true);
    const picked: PickedPhoto[] = [];
    for (const file of Array.from(files).slice(0, max - photos.length)) {
      try {
        const blob = await resizeImage(file);
        picked.push({ id: crypto.randomUUID(), blob, preview: URL.createObjectURL(blob) });
      } catch {
        setFailed(true);
      }
    }
    onChange([...photos, ...picked].slice(0, max));
    setPreparing(false);
    if (fileInput.current) fileInput.current.value = '';
  };

  const remove = (id: string) => {
    const gone = photos.find((p) => p.id === id);
    if (gone) URL.revokeObjectURL(gone.preview);
    onChange(photos.filter((p) => p.id !== id));
  };

  return (
    <fieldset disabled={disabled}>
      <legend className="flex w-full items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-charcoal">{c.title}</span>
        <span className="text-xs text-charcoal-300">
          {photos.length} / {max}
        </span>
      </legend>
      <p className="mt-1 text-xs text-charcoal-300">{c.hint(max)}</p>
      <p className="mt-0.5 text-xs text-charcoal-300">{c.rules}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photos.map((p, i) => (
          <div key={p.id} className="relative aspect-square overflow-hidden rounded-2xl bg-sand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.preview} alt={`${c.title} ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(p.id)}
              aria-label={c.remove}
              className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-cream/90 text-charcoal backdrop-blur transition hover:bg-cream"
            >
              <svg aria-hidden viewBox="0 0 10 10" className="h-2.5 w-2.5">
                <path d="M1 1l8 8M9 1l-8 8" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </button>
          </div>
        ))}
        {photos.length < max && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-sand-300 px-2 text-center text-xs text-charcoal-500 transition hover:border-charcoal-300 hover:text-charcoal has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-charcoal">
            <svg aria-hidden viewBox="0 0 14 14" className="h-3.5 w-3.5">
              <path d="M7 1v12M1 7h12" fill="none" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            {preparing ? c.preparing : c.add}
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              multiple
              disabled={preparing}
              onChange={(e) => add(e.target.files)}
              className="sr-only"
            />
          </label>
        )}
      </div>
      {failed && <p className="mt-2 text-xs text-charcoal-500">{c.error}</p>}
      {overLimit && <p className="mt-2 text-xs text-charcoal-500">{c.limit(max)}</p>}
    </fieldset>
  );
}
