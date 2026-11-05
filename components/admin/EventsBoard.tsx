'use client';

import { notify, useGone, useRefresh } from '@/components/admin/feedback';
import { useState } from 'react';

import type { EventKind } from '@/data/events';

export interface AdminEvent {
  id: string;
  published: boolean;
  kind: EventKind;
  placeId: string;
  titleFr: string;
  titleEn: string;
  descFr: string;
  descEn: string;
  whenFr: string;
  whenEn: string;
  confirmed: boolean;
  startDate: string;
  endDate: string;
  ticketUrl: string;
  infoUrl: string;
  /** Sent by a visitor from /evenements, still to be checked. */
  proposed?: boolean;
  contact?: string;
}

type Form = Omit<AdminEvent, 'id' | 'proposed' | 'contact'>;

const EMPTY: Form = {
  published: true,
  kind: 'music',
  placeId: '',
  titleFr: '',
  titleEn: '',
  descFr: '',
  descEn: '',
  whenFr: '',
  whenEn: '',
  confirmed: false,
  startDate: '',
  endDate: '',
  ticketUrl: '',
  infoUrl: '',
};

const KINDS: Record<EventKind, string> = {
  music: 'Musique et festivals',
  gathering: 'Rassemblements',
  culture: 'Culture',
};

const FIELD_LABELS: Record<string, string> = {
  placeId: 'le lieu',
  titleFr: 'le titre (français)',
  titleEn: 'le titre (anglais)',
  descFr: 'la description (français)',
  descEn: 'la description (anglais)',
  whenFr: 'la date affichée (français)',
  whenEn: 'la date affichée (anglais)',
  ticketUrl: 'le lien de billetterie',
  infoUrl: 'le lien d’information',
  startDate: 'la date de début',
  endDate: 'la date de fin',
};

const input =
  'w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-charcoal-300';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-charcoal-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-charcoal-300">{hint}</span>}
    </label>
  );
}

/** Add, edit, hide or delete the events shown on /evenements. Only real, sourced dates go here. */
export default function EventsBoard({
  events,
  places,
  tableMissing,
}: {
  events: AdminEvent[];
  places: { id: string; name: string }[];
  tableMissing: boolean;
}) {
  const [pending, refresh] = useRefresh();
  const [gone, hide] = useGone(events);
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const open = (e?: AdminEvent) => {
    setError('');
    if (e) {
      const { id, proposed: _p, contact: _c, ...rest } = e;
      setEditing(id);
      setForm(rest);
    } else {
      setEditing('new');
      setForm(EMPTY);
    }
  };
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const call = async (url: string, method: string, body?: unknown) => {
    setBusy(true);
    setError('');
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      refresh();
      return true;
    }
    const data = (await res?.json().catch(() => null)) as { field?: string } | null;
    setError(
      data?.field
        ? `Vérifiez ${FIELD_LABELS[data.field] ?? data.field}.`
        : 'L’enregistrement a échoué. Réessayez dans un instant.',
    );
    return false;
  };

  const save = async () => {
    const ok =
      editing === 'new'
        ? await call('/api/admin/events', 'POST', form)
        : await call(`/api/admin/events/${editing}`, 'PATCH', form);
    if (ok) {
      notify('Enregistré');
      setEditing(null);
    }
  };

  const remove = async (e: AdminEvent) => {
    if (!window.confirm(`Supprimer « ${e.titleFr} » ?`)) return;
    if (await call(`/api/admin/events/${e.id}`, 'DELETE')) {
      hide(e.id);
      notify('Événement supprimé');
    }
  };

  const placeName = (id: string) => places.find((p) => p.id === id)?.name ?? id;

  return (
    <section className="mt-16 border-t border-sand-200 pt-10" aria-label="Événements">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-charcoal">Événements</h2>
          <p className="mt-1 max-w-xl text-sm text-charcoal-500">
            Affichés sur la page Événements. N’indiquez une date que si elle est annoncée par une source fiable, sinon
            laissez « à confirmer ».
          </p>
        </div>
        {!tableMissing && (
          <button
            type="button"
            onClick={() => open()}
            className="rounded-pill bg-charcoal px-5 py-2 text-sm text-cream transition hover:bg-charcoal-700"
          >
            Ajouter un événement
          </button>
        )}
      </div>

      {tableMissing && (
        <p className="mt-6 max-w-xl rounded-2xl border border-sand-200 bg-sand-50 p-4 text-sm text-charcoal-700">
          La table des événements n’existe pas encore dans Supabase. Exécutez le fichier{' '}
          <code className="rounded bg-sand-100 px-1">db/events.sql</code> dans l’éditeur SQL de Supabase.
        </p>
      )}

      {editing && (
        <div className="mt-6 rounded-3xl border border-sand-200 bg-sand-50 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Titre (français)">
              <input className={input} value={form.titleFr} onChange={(e) => set('titleFr', e.target.value)} />
            </Field>
            <Field label="Titre (anglais)">
              <input className={input} value={form.titleEn} onChange={(e) => set('titleEn', e.target.value)} />
            </Field>
            <Field label="Description (français)">
              <textarea
                rows={3}
                className={input}
                value={form.descFr}
                onChange={(e) => set('descFr', e.target.value)}
              />
            </Field>
            <Field label="Description (anglais)">
              <textarea
                rows={3}
                className={input}
                value={form.descEn}
                onChange={(e) => set('descEn', e.target.value)}
              />
            </Field>
            <Field label="Date affichée (français)" hint="Ex. 19 – 22 décembre 2026, ou « Chaque été · à confirmer »">
              <input className={input} value={form.whenFr} onChange={(e) => set('whenFr', e.target.value)} />
            </Field>
            <Field label="Date affichée (anglais)" hint="Ex. 19 – 22 December 2026">
              <input className={input} value={form.whenEn} onChange={(e) => set('whenEn', e.target.value)} />
            </Field>
            <Field label="Début" hint="Seulement si la date est confirmée">
              <input
                type="date"
                className={input}
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
              />
            </Field>
            <Field label="Fin">
              <input
                type="date"
                className={input}
                value={form.endDate}
                onChange={(e) => set('endDate', e.target.value)}
              />
            </Field>
            <Field label="Lieu (photo et carte)">
              <select className={input} value={form.placeId} onChange={(e) => set('placeId', e.target.value)}>
                <option value="">Choisir…</option>
                {places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Type">
              <select className={input} value={form.kind} onChange={(e) => set('kind', e.target.value as EventKind)}>
                {Object.entries(KINDS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Lien de billetterie" hint="Vide : le bouton affiche « Billetterie à confirmer »">
              <input
                className={input}
                inputMode="url"
                placeholder="https://"
                value={form.ticketUrl}
                onChange={(e) => set('ticketUrl', e.target.value)}
              />
            </Field>
            <Field label="Lien d’information (annonce, site officiel)">
              <input
                className={input}
                inputMode="url"
                placeholder="https://"
                value={form.infoUrl}
                onChange={(e) => set('infoUrl', e.target.value)}
              />
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap gap-5 text-sm text-charcoal-700">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.confirmed} onChange={(e) => set('confirmed', e.target.checked)} />
              Dates confirmées (affiche « Annoncé »)
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} />
              Visible sur le site
            </label>
          </div>
          {error && (
            <p role="alert" className="mt-4 text-sm text-terracotta-700">
              {error}
            </p>
          )}
          <div className="mt-5 flex gap-3">
            <button
              type="button"
              disabled={busy || pending}
              onClick={save}
              className="rounded-pill bg-charcoal px-5 py-2 text-sm text-cream transition hover:bg-charcoal-700 disabled:opacity-50"
            >
              Enregistrer
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-pill border border-sand-200 px-5 py-2 text-sm text-charcoal-700 transition hover:border-charcoal-300"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {!tableMissing && (
        <ul className="mt-6 divide-y divide-sand-200 border-y border-sand-200">
          {[...events]
            .sort((a, b) => Number(b.proposed ?? false) - Number(a.proposed ?? false))
            .filter((e) => !gone.has(e.id))
            .map((e) => (
              <li key={e.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                <div className="min-w-0 max-w-2xl">
                  <p className="text-sm font-medium text-charcoal">
                    {e.titleFr}
                    {e.proposed ? (
                      <span className="ml-2 rounded-pill bg-terracotta-100 px-2 py-0.5 text-xs font-normal text-terracotta-700">
                        Proposé · à valider
                      </span>
                    ) : (
                      !e.published && (
                        <span className="ml-2 rounded-pill bg-sand-100 px-2 py-0.5 text-xs font-normal text-charcoal-500">
                          Masqué
                        </span>
                      )
                    )}
                  </p>
                  <p className="mt-0.5 text-sm text-charcoal-500">
                    {e.whenFr} · {placeName(e.placeId)} · {e.confirmed ? 'Annoncé' : 'À confirmer'}
                  </p>
                  {e.proposed && e.contact && (
                    <p className="mt-0.5 text-sm text-charcoal-700">Contact : {e.contact}</p>
                  )}
                  {e.proposed && (
                    <p className="mt-0.5 text-xs text-charcoal-300">
                      Texte saisi dans une seule langue, recopié dans l’autre : corrigez la traduction avant de publier.
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy || pending}
                    onClick={() => open(e)}
                    className="rounded-pill border border-charcoal-300 px-4 py-1.5 text-sm text-charcoal transition hover:border-charcoal disabled:opacity-50"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    disabled={busy || pending}
                    onClick={() => call(`/api/admin/events/${e.id}`, 'PATCH', { published: !e.published })}
                    className="rounded-pill border border-sand-200 px-4 py-1.5 text-sm text-charcoal-700 transition hover:border-charcoal-300 disabled:opacity-50"
                  >
                    {e.published ? 'Masquer' : e.proposed ? 'Publier' : 'Afficher'}
                  </button>
                  <button
                    type="button"
                    disabled={busy || pending}
                    onClick={() => remove(e)}
                    className="rounded-pill border border-sand-200 px-4 py-1.5 text-sm text-charcoal-500 transition hover:border-terracotta-700 hover:text-terracotta-700 disabled:opacity-50"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          {events.length === 0 && <li className="py-4 text-sm text-charcoal-500">Aucun événement pour le moment.</li>}
        </ul>
      )}
    </section>
  );
}
