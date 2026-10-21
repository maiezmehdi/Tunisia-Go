'use client';

import { useState } from 'react';

import { useLocale } from '@/lib/i18n/LocaleProvider';

const COPY = {
  fr: {
    open: 'Signaler une erreur',
    hint: 'Une information fausse ou dépassée ? Dites-nous ce qu’il faut corriger.',
    message: 'Ce qui est faux ou à corriger',
    contact: 'Votre contact (facultatif)',
    contactHint: 'E-mail ou WhatsApp, seulement si vous voulez une réponse.',
    send: 'Envoyer',
    sending: 'Envoi…',
    cancel: 'Annuler',
    thanks: 'Merci, c’est transmis. Nous vérifions et corrigeons la fiche.',
    tooShort: 'Décrivez l’erreur en quelques mots.',
    failed: 'L’envoi n’a pas abouti. Réessayez dans un instant.',
  },
  en: {
    open: 'Report an error',
    hint: 'Something wrong or out of date? Tell us what to correct.',
    message: 'What is wrong or needs fixing',
    contact: 'Your contact (optional)',
    contactHint: 'Email or WhatsApp, only if you would like a reply.',
    send: 'Send',
    sending: 'Sending…',
    cancel: 'Cancel',
    thanks: 'Thank you, it has been passed on. We will check and correct the page.',
    tooShort: 'Please describe the error in a few words.',
    failed: 'Sending did not work. Please try again in a moment.',
  },
} as const;

const field =
  'mt-1.5 w-full rounded-2xl border border-sand-200 bg-white px-4 py-2.5 text-[15px] text-charcoal outline-none transition placeholder:text-charcoal-300 focus:border-charcoal';

/** « Signaler une erreur » on a place page: a short note that lands on the moderation page. */
export default function PlaceReport({ placeId }: { placeId: string }) {
  const { locale } = useLocale();
  const c = COPY[locale];
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5) {
      setStatus('error');
      setError(c.tooShort);
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/report-place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeId, message, contact, website, locale }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('sent');
    } catch {
      setStatus('error');
      setError(c.failed);
    }
  };

  if (status === 'sent') {
    return (
      <p role="status" className="text-sm text-charcoal-700">
        {c.thanks}
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-charcoal-500 underline decoration-sand-300 underline-offset-4 transition hover:text-charcoal hover:decoration-charcoal"
      >
        {c.open}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-4" noValidate>
      <p className="text-sm text-charcoal-500">{c.hint}</p>
      <label className="block text-sm font-medium text-charcoal">
        {c.message}
        <textarea
          className={`${field} min-h-[110px] resize-y font-normal`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1500}
          required
        />
      </label>
      <label className="block text-sm font-medium text-charcoal">
        {c.contact}
        <input
          className={`${field} font-normal`}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          maxLength={200}
          autoComplete="off"
        />
        <span className="mt-1 block text-xs font-normal text-charcoal-300">{c.contactHint}</span>
      </label>
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
      {status === 'error' && (
        <p role="alert" className="border-l-2 border-terracotta pl-3 text-sm text-charcoal-700">
          {error}
        </p>
      )}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700 disabled:opacity-60"
        >
          {status === 'sending' ? c.sending : c.send}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-charcoal-500 underline-offset-4 hover:underline"
        >
          {c.cancel}
        </button>
      </div>
    </form>
  );
}
