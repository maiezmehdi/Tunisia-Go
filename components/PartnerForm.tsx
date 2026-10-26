'use client';

import { useEffect, useRef, useState } from 'react';

import { PARTNER_DESCRIPTION_MAX, PARTNER_TYPES } from '@/lib/partners';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { resizeImage } from '@/lib/resizeImage';

const COPY = {
  fr: {
    lead: 'Présentez votre établissement. Nous vérifions la fiche avant de la publier, puis elle apparaîtra dans la section Partenaires.',
    type: 'Type d’établissement',
    name: 'Nom de l’établissement',
    place: 'Lieu',
    placeNone: 'Choisir un lieu…',
    photo: 'Photo',
    choose: 'Choisir une photo',
    change: 'Changer la photo',
    uploading: 'Envoi de la photo…',
    photoError: 'La photo n’a pas pu être envoyée. Essayez une autre image (JPEG ou PNG).',
    description: 'Description',
    descriptionHint: 'Quelques phrases : ce que vous proposez, pour qui, ce qui vous distingue.',
    whatsapp: 'Numéro WhatsApp',
    whatsappHint: 'Avec l’indicatif du pays, par exemple +216 …',
    website: 'Site web',
    contactHint: 'Indiquez au moins un des deux contacts.',
    consent: 'J’accepte que ces informations soient affichées publiquement sur Tunisia Go une fois la fiche vérifiée.',
    save: 'Enregistrer',
    sending: 'Envoi…',
    remove: 'Retirer ma fiche',
    confirmRemove: 'Oui, retirer',
    cancel: 'Annuler',
    loading: 'Chargement…',
    statusPending: 'Fiche reçue : nous la vérifions avant de la publier.',
    statusPublished: 'Fiche vérifiée. Elle sera affichée dans la section Partenaires.',
    statusHidden: 'Cette fiche a été masquée. Contactez-nous si vous pensez qu’il y a une erreur.',
    saved: 'Merci, c’est enregistré. Nous vérifions la fiche avant de la publier.',
    removed: 'Votre fiche a été retirée.',
    invalid: 'Vérifiez le nom et le type de l’établissement.',
    invalidContact: 'Le numéro WhatsApp ou le site ne semble pas valide.',
    needContact: 'Indiquez un numéro WhatsApp ou un site web.',
    needConsent: 'Cochez la case pour autoriser l’affichage.',
    expired: 'Votre connexion a expiré. Reconnectez-vous.',
    failed: 'Cela n’a pas abouti. Réessayez dans un instant.',
  },
  en: {
    lead: 'Present your business. We check the listing before publishing it, then it will appear in the Partners section.',
    type: 'Type of business',
    name: 'Name of the business',
    place: 'Place',
    placeNone: 'Choose a place…',
    photo: 'Photo',
    choose: 'Choose a photo',
    change: 'Change the photo',
    uploading: 'Sending the photo…',
    photoError: 'The photo could not be sent. Try another image (JPEG or PNG).',
    description: 'Description',
    descriptionHint: 'A few sentences: what you offer, for whom, what sets you apart.',
    whatsapp: 'WhatsApp number',
    whatsappHint: 'With the country code, for example +216 …',
    website: 'Website',
    contactHint: 'Give at least one of the two contacts.',
    consent: 'I agree that this information is shown publicly on Tunisia Go once the listing is checked.',
    save: 'Save',
    sending: 'Sending…',
    remove: 'Remove my listing',
    confirmRemove: 'Yes, remove',
    cancel: 'Cancel',
    loading: 'Loading…',
    statusPending: 'Listing received: we check it before publishing it.',
    statusPublished: 'Listing checked. It will be shown in the Partners section.',
    statusHidden: 'This listing has been hidden. Contact us if you think this is a mistake.',
    saved: 'Thank you, it is saved. We check the listing before publishing it.',
    removed: 'Your listing has been removed.',
    invalid: 'Check the name and the type of the business.',
    invalidContact: 'The WhatsApp number or the website does not look valid.',
    needContact: 'Give a WhatsApp number or a website.',
    needConsent: 'Tick the box to allow publication.',
    expired: 'Your sign-in has expired. Please sign in again.',
    failed: 'That did not work. Please try again in a moment.',
  },
} as const;

const field =
  'mt-1.5 w-full rounded-2xl border border-sand-200 bg-white px-4 py-2.5 text-[15px] text-charcoal outline-none transition placeholder:text-charcoal-300 focus:border-charcoal';

interface Entry {
  status: 'published' | 'pending' | 'hidden';
  type: string;
  name: string;
  placeId: string;
  photoPath: string;
  photoUrl: string;
  description: string;
  whatsapp: string;
  website: string;
}

const EMPTY: Entry = {
  status: 'pending',
  type: '',
  name: '',
  placeId: '',
  photoPath: '',
  photoUrl: '',
  description: '',
  whatsapp: '',
  website: '',
};

/** The listing of a partner account (hotel, guesthouse, car rental, restaurant): create, change or remove it. */
export default function PartnerForm({ accessToken, onExpired }: { accessToken: string; onExpired: () => void }) {
  const { locale, catalog } = useLocale();
  const c = COPY[locale];
  const [entry, setEntry] = useState<Entry>(EMPTY);
  const [exists, setExists] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<'ready' | 'saving' | 'uploading'>('ready');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirm, setConfirm] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  const call = (body: Record<string, unknown>) =>
    fetch('/api/partner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, ...body }),
    });

  useEffect(() => {
    let cancelled = false;
    call({ action: 'get' })
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 401) return onExpired();
        if (res.ok) {
          setEntry((await res.json()) as Entry);
          setExists(true);
          setConsent(true);
        } else if (res.status !== 404) setMessage({ ok: false, text: c.failed });
        setLoaded(true);
      })
      .catch(() => !cancelled && (setMessage({ ok: false, text: c.failed }), setLoaded(true)));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (patch: Partial<Entry>) => setEntry((e) => ({ ...e, ...patch }));

  const pick = async (f: File | undefined) => {
    if (!f) return;
    setState('uploading');
    setMessage(null);
    try {
      const blob = await resizeImage(f, 1200, 600_000);
      const body = new FormData();
      body.set('accessToken', accessToken);
      body.set('photo', new File([blob], 'photo.jpg', { type: 'image/jpeg' }));
      const res = await fetch('/api/pro-photo', { method: 'POST', body });
      if (res.status === 401) return onExpired();
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { path: string };
      set({ photoPath: data.path, photoUrl: URL.createObjectURL(blob) });
    } catch {
      setMessage({ ok: false, text: c.photoError });
    }
    setState('ready');
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return setMessage({ ok: false, text: c.needConsent });
    setState('saving');
    setMessage(null);
    try {
      const res = await call({ action: 'save', ...entry, consent });
      if (res.status === 401) return onExpired();
      if (res.ok) {
        setExists(true);
        set({ status: 'pending' });
        return setMessage({ ok: true, text: c.saved });
      }
      const code = ((await res.json().catch(() => ({}))) as { error?: string }).error;
      setMessage({
        ok: false,
        text:
          code === 'invalid'
            ? c.invalid
            : code === 'invalid_contact'
              ? c.invalidContact
              : code === 'need_contact'
                ? c.needContact
                : code === 'consent'
                  ? c.needConsent
                  : c.failed,
      });
    } catch {
      setMessage({ ok: false, text: c.failed });
    } finally {
      setState('ready');
    }
  };

  const remove = async () => {
    setState('saving');
    const res = await call({ action: 'remove' }).catch(() => null);
    setState('ready');
    setConfirm(false);
    if (res?.ok) {
      setEntry(EMPTY);
      setExists(false);
      setConsent(false);
      return setMessage({ ok: true, text: c.removed });
    }
    setMessage({ ok: false, text: c.failed });
  };

  if (!loaded) return <p className="text-sm text-charcoal-500">{c.loading}</p>;

  const regions = [...new Set(catalog.places.map((p) => p.region))].sort((a, b) => a.localeCompare(b, locale));
  const status = exists
    ? entry.status === 'published'
      ? c.statusPublished
      : entry.status === 'hidden'
        ? c.statusHidden
        : c.statusPending
    : '';

  return (
    <form onSubmit={save} className="space-y-4" noValidate>
      <p className="text-sm text-charcoal-500">{c.lead}</p>
      {status && (
        <p className="rounded-2xl border border-sand-200 bg-white px-4 py-3 text-sm text-charcoal-700">{status}</p>
      )}

      <fieldset>
        <legend className="text-sm font-medium text-charcoal">{c.type}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {PARTNER_TYPES.map((t) => (
            <label
              key={t.id}
              className={`cursor-pointer rounded-pill border px-3.5 py-1.5 text-sm transition ${
                entry.type === t.id
                  ? 'border-charcoal bg-charcoal text-cream'
                  : 'border-sand-200 bg-white text-charcoal-700 hover:border-charcoal-300'
              }`}
            >
              <input
                type="radio"
                name="partner-type"
                checked={entry.type === t.id}
                onChange={() => set({ type: t.id })}
                className="sr-only"
              />
              {t[locale]}
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm font-medium text-charcoal">
        {c.name}
        <input value={entry.name} onChange={(e) => set({ name: e.target.value })} maxLength={80} className={field} />
      </label>

      <label className="block text-sm font-medium text-charcoal">
        {c.place}
        <select
          value={entry.placeId}
          onChange={(e) => set({ placeId: e.target.value })}
          className={`${field} font-normal`}
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
      </label>

      <div>
        <p className="text-sm font-medium text-charcoal">{c.photo}</p>
        <div className="mt-2 flex items-center gap-4">
          <span className="grid h-20 w-32 shrink-0 place-items-center overflow-hidden rounded-2xl border border-sand-200 bg-sand-50">
            {entry.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={entry.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : null}
          </span>
          <div>
            <button
              type="button"
              disabled={state === 'uploading'}
              onClick={() => file.current?.click()}
              className="rounded-pill border border-sand-200 px-4 py-1.5 text-sm text-charcoal-700 transition hover:border-charcoal-300 disabled:opacity-60"
            >
              {state === 'uploading' ? c.uploading : entry.photoUrl ? c.change : c.choose}
            </button>
            <input
              ref={file}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              className="sr-only"
              onChange={(e) => {
                void pick(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>
        </div>
      </div>

      <label className="block text-sm font-medium text-charcoal">
        {c.description}
        <textarea
          value={entry.description}
          onChange={(e) => set({ description: e.target.value })}
          maxLength={PARTNER_DESCRIPTION_MAX}
          className={`${field} min-h-[110px] resize-y font-normal`}
        />
        <span className="mt-1 block text-xs font-normal text-charcoal-500">{c.descriptionHint}</span>
      </label>

      <label className="block text-sm font-medium text-charcoal">
        {c.whatsapp}
        <input
          value={entry.whatsapp}
          onChange={(e) => set({ whatsapp: e.target.value })}
          inputMode="tel"
          maxLength={30}
          className={field}
        />
        <span className="mt-1 block text-xs font-normal text-charcoal-500">{c.whatsappHint}</span>
      </label>
      <label className="block text-sm font-medium text-charcoal">
        {c.website}
        <input
          value={entry.website}
          onChange={(e) => set({ website: e.target.value })}
          inputMode="url"
          maxLength={200}
          className={field}
        />
        <span className="mt-1 block text-xs font-normal text-charcoal-500">{c.contactHint}</span>
      </label>

      <label className="flex items-start gap-2.5 text-sm text-charcoal-700">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
        {c.consent}
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={state !== 'ready'}
          className="rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700 disabled:opacity-60"
        >
          {state === 'saving' ? c.sending : c.save}
        </button>
        {exists &&
          (confirm ? (
            <span className="inline-flex gap-3 text-sm">
              <button type="button" onClick={remove} className="text-terracotta-700 underline underline-offset-4">
                {c.confirmRemove}
              </button>
              <button type="button" onClick={() => setConfirm(false)} className="text-charcoal-500">
                {c.cancel}
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirm(true)}
              className="text-sm text-charcoal-500 underline decoration-sand-300 underline-offset-4 hover:text-charcoal"
            >
              {c.remove}
            </button>
          ))}
      </div>
      {message && (
        <p role="alert" className={`text-sm ${message.ok ? 'text-charcoal-700' : 'text-terracotta-700'}`}>
          {message.text}
        </p>
      )}
    </form>
  );
}
