'use client';

import { useState } from 'react';

import type { EventKind } from '@/data/events';
import type { Locale } from '@/lib/i18n/config';

const COPY = {
  fr: {
    open: 'Proposer un événement',
    intro:
      'Vous organisez un festival, une soirée ou un rendez-vous ? Décrivez-le : nous le vérifions avant de le publier, rien n’apparaît tout seul.',
    title: 'Nom de l’événement',
    kind: 'Type',
    kinds: { music: 'Musique et festivals', gathering: 'Rassemblements et traditions', culture: 'Culture' } as Record<
      EventKind,
      string
    >,
    place: 'Lieu le plus proche',
    pick: 'Choisir…',
    when: 'Date',
    whenHint: 'Ex. 19 – 22 décembre 2026',
    description: 'Description',
    link: 'Lien d’information ou de billetterie (facultatif)',
    contact: 'Votre contact (WhatsApp ou e-mail)',
    contactHint: 'Pour vérifier l’événement. Il n’est jamais affiché sur le site.',
    send: 'Envoyer la proposition',
    sending: 'Envoi…',
    thanks: 'Merci, votre proposition est bien reçue. Nous la vérifions et nous vous contactons si besoin.',
    again: 'Proposer un autre événement',
    errInvalid: 'Vérifiez les champs marqués.',
    errMany: 'Trop d’envois pour le moment. Réessayez plus tard.',
    errFail: 'L’envoi a échoué. Réessayez dans un instant.',
  },
  en: {
    open: 'Suggest an event',
    intro:
      'Do you run a festival, a night or a gathering? Describe it: we check it before publishing, nothing appears on its own.',
    title: 'Event name',
    kind: 'Type',
    kinds: { music: 'Music and festivals', gathering: 'Gatherings and traditions', culture: 'Culture' } as Record<
      EventKind,
      string
    >,
    place: 'Nearest place',
    pick: 'Choose…',
    when: 'Date',
    whenHint: 'E.g. 19 – 22 December 2026',
    description: 'Description',
    link: 'Info or ticket link (optional)',
    contact: 'Your contact (WhatsApp or e-mail)',
    contactHint: 'So we can check the event. It is never shown on the site.',
    send: 'Send the suggestion',
    sending: 'Sending…',
    thanks: 'Thank you, we received your suggestion. We will check it and contact you if needed.',
    again: 'Suggest another event',
    errInvalid: 'Please check the highlighted fields.',
    errMany: 'Too many submissions for now. Please try again later.',
    errFail: 'Sending failed. Please try again in a moment.',
  },
} as const;

const input =
  'mt-1 w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-charcoal-300';
const label = 'text-xs font-medium uppercase tracking-[0.14em] text-charcoal-500';

const EMPTY = { title: '', kind: 'music', placeId: '', when: '', description: '', infoUrl: '', contact: '', website: '' };

/** Public "suggest an event" form: saved hidden, reviewed in /admin before anything is published. */
export default function EventProposalForm({
  locale,
  places,
}: {
  locale: Locale;
  places: { id: string; name: string }[];
}) {
  const c = COPY[locale];
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');
  const [bad, setBad] = useState('');
  const set = (key: keyof typeof EMPTY, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    setError('');
    setBad('');
    const res = await fetch('/api/event-proposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).catch(() => null);
    if (res?.ok) {
      setForm(EMPTY);
      setState('done');
      return;
    }
    setState('idle');
    const data = (await res?.json().catch(() => null)) as { field?: string } | null;
    if (res?.status === 429) setError(c.errMany);
    else if (res?.status === 400) {
      setBad(data?.field ?? '');
      setError(c.errInvalid);
    } else setError(c.errFail);
  };

  const mark = (field: string) => (bad === field ? ' border-terracotta-600' : '');

  return (
    <section className="mt-14 border-t border-sand-200 pt-10" aria-label={c.open}>
      <details className="group">
        <summary className="cursor-pointer font-serif text-2xl text-charcoal">{c.open}</summary>
        <div className="mt-4 max-w-2xl">
          <p className="text-[15px] leading-relaxed text-charcoal-500">{c.intro}</p>
          {state === 'done' ? (
            <div className="mt-6">
              <p role="status" className="text-sm text-charcoal-700">
                {c.thanks}
              </p>
              <button
                type="button"
                onClick={() => setState('idle')}
                className="mt-4 text-sm underline decoration-sand-300 underline-offset-4 hover:text-charcoal"
              >
                {c.again}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className={label}>{c.title}</span>
                <input
                  required
                  maxLength={120}
                  className={input + mark('title')}
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                />
              </label>
              <label className="block">
                <span className={label}>{c.kind}</span>
                <select className={input} value={form.kind} onChange={(e) => set('kind', e.target.value)}>
                  {Object.entries(c.kinds).map(([value, text]) => (
                    <option key={value} value={value}>
                      {text}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={label}>{c.place}</span>
                <select
                  required
                  className={input + mark('placeId')}
                  value={form.placeId}
                  onChange={(e) => set('placeId', e.target.value)}
                >
                  <option value="">{c.pick}</option>
                  {places.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className={label}>{c.when}</span>
                <input
                  required
                  maxLength={120}
                  placeholder={c.whenHint}
                  className={input + mark('when')}
                  value={form.when}
                  onChange={(e) => set('when', e.target.value)}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className={label}>{c.description}</span>
                <textarea
                  required
                  rows={4}
                  maxLength={600}
                  className={input + mark('description')}
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className={label}>{c.link}</span>
                <input
                  inputMode="url"
                  placeholder="https://"
                  className={input + mark('infoUrl')}
                  value={form.infoUrl}
                  onChange={(e) => set('infoUrl', e.target.value)}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className={label}>{c.contact}</span>
                <input
                  required
                  maxLength={120}
                  className={input + mark('contact')}
                  value={form.contact}
                  onChange={(e) => set('contact', e.target.value)}
                />
                <span className="mt-1 block text-xs text-charcoal-300">{c.contactHint}</span>
              </label>
              {/* Hidden from people; a bot that fills it is ignored. */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  name="website"
                  value={form.website}
                  onChange={(e) => set('website', e.target.value)}
                />
              </div>
              {error && (
                <p role="alert" className="text-sm text-terracotta-700 sm:col-span-2">
                  {error}
                </p>
              )}
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={state === 'sending'}
                  className="rounded-pill bg-charcoal px-5 py-2 text-sm text-cream transition hover:bg-charcoal-700 disabled:opacity-50"
                >
                  {state === 'sending' ? c.sending : c.send}
                </button>
              </div>
            </form>
          )}
        </div>
      </details>
    </section>
  );
}
