'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

import {
  onAction,
  onMessage,
  welcome,
  menu,
  EMPTY_PROFILE,
  type Action,
  type Profile,
  type Reply,
} from '@/lib/assistant/engine';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import type { Locale } from '@/lib/i18n/config';
import { useMyTrip } from '@/lib/myTrip';
import { useBackToClose } from '@/lib/useBackToClose';

interface Message {
  id: number;
  from: 'me' | 'bot';
  text: string;
  reply?: Reply;
}

interface Conversation {
  locale: Locale;
  messages: Message[];
  profile: Profile;
}

/** The conversation stays in this tab only, so it survives opening a place page. Nothing leaves the browser. */
const STORAGE_KEY = 'tg-assistant';
const MAX_MESSAGES = 60;

const UI = {
  fr: {
    title: 'Assistant de voyage',
    subtitle: 'Dites-moi ce que vous cherchez : durée, région, envies.',
    close: 'Fermer',
    restart: 'Recommencer',
    placeholder: 'Écrivez votre question…',
    send: 'Envoyer',
    open: 'Ouvrir la fiche',
    add: 'Ajouter',
    added: 'Dans mon voyage',
    addAll: (n: number) => `Ajouter les ${n} étapes à mon voyage`,
    addedAll: 'Ajoutées à votre voyage.',
    openTrip: 'Ouvrir mon voyage',
    seeTrip: 'Voir ce road trip',
    you: 'Vous',
    aiNote: 'Réponse rédigée à partir des pages du site.',
    thinking: 'Je cherche…',
  },
  en: {
    title: 'Travel assistant',
    subtitle: 'Tell me what you are after: how long, where, what you love.',
    close: 'Close',
    restart: 'Start again',
    placeholder: 'Type your question…',
    send: 'Send',
    open: 'Open the place',
    add: 'Add',
    added: 'In my trip',
    addAll: (n: number) => `Add the ${n} stops to my trip`,
    addedAll: 'Added to your trip.',
    openTrip: 'Open my trip',
    seeTrip: 'See this road trip',
    you: 'You',
    aiNote: 'Answer written from the pages of this site.',
    thinking: 'Looking…',
  },
};

function fresh(locale: Locale): Conversation {
  const reply = welcome(locale);
  return { locale, profile: EMPTY_PROFILE, messages: [{ id: 1, from: 'bot', text: reply.text, reply }] };
}

function load(locale: Locale): Conversation {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null') as Conversation | null;
    if (saved?.locale === locale && Array.isArray(saved.messages) && saved.messages.length) return saved;
  } catch {
    // Private mode or a broken entry: start over.
  }
  return fresh(locale);
}

export default function AssistantPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  useBackToClose(open, onClose);
  const { locale } = useLocale();
  const ui = UI[locale];
  const trip = useMyTrip();
  const [conv, setConv] = useState<Conversation>(() => load(locale));
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conv));
    } catch {
      // Storage full or blocked: the conversation simply won't survive a reload.
    }
  }, [conv]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    // Show the start of the answer, right under the visitor's question, rather than its end.
    const asked = list.querySelectorAll<HTMLElement>('[data-from="me"]');
    const last = asked[asked.length - 1];
    list.scrollTo({ top: last ? last.offsetTop - list.offsetTop - 12 : 0, behavior: 'smooth' });
  }, [conv.messages.length, pending, open]);

  useEffect(() => {
    if (!open) return;
    // Phones would pop the keyboard over the answer: focus the field on larger screens only.
    if (window.matchMedia('(min-width: 640px)').matches) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    // A click anywhere outside the card closes it (on phones the panel fills the screen).
    const onPointer = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, onClose]);

  function push(userText: string, result: { reply: Reply; profile: Profile }) {
    setConv((c) => {
      const next = c.messages[c.messages.length - 1].id + 1;
      const messages: Message[] = [
        ...c.messages,
        { id: next, from: 'me', text: userText },
        { id: next + 1, from: 'bot', text: result.reply.text, reply: result.reply },
      ];
      return { ...c, profile: result.profile, messages: messages.slice(-MAX_MESSAGES) };
    });
  }

  function choose(label: string, action: Action) {
    push(label, onAction(action, conv.profile, locale));
  }

  async function send(e: FormEvent) {
    e.preventDefault();
    const text = draft.trim().slice(0, 300);
    if (!text || pending) return;
    setDraft('');
    const local = onMessage(text, conv.profile, locale, trip.ids.length);
    // The guided road trip and ready-made trip plans stay with the built-in assistant.
    if (conv.profile.step || local.reply.trip) return push(text, local);
    setPending(text);
    try {
      const history = conv.messages.slice(-6).map((m) => ({ role: m.from === 'me' ? 'user' : 'model', text: m.text }));
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text, history, locale }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { text?: string; places?: string[]; itinerary?: string };
      if (!data.text) throw new Error('empty');
      push(text, {
        profile: conv.profile,
        reply: {
          text: data.text,
          places: data.places?.length ? data.places : undefined,
          itinerary: data.itinerary,
          chips: menu(locale),
          ai: true,
        },
      });
    } catch {
      // Not configured, over the limit or offline: the built-in assistant answers instead.
      push(text, local);
    } finally {
      setPending(null);
    }
  }

  const lastBot = [...conv.messages].reverse().find((m) => m.from === 'bot')?.id;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={ui.title}
      ref={panelRef}
      className={`fixed inset-0 z-[1600] flex-col ${open ? 'flex' : 'hidden'} bg-cream text-charcoal print:hidden sm:inset-auto sm:bottom-5 sm:right-5 sm:h-[min(640px,calc(100vh-2.5rem))] sm:w-[400px] sm:overflow-hidden sm:rounded-3xl sm:border sm:border-sand-200 sm:shadow-lift`}
    >
      <header className="flex items-start justify-between gap-3 border-b border-sand-200 px-5 py-4">
        <div>
          <h2 className="font-serif text-lg leading-tight">{ui.title}</h2>
          <p className="mt-1 text-xs text-charcoal-500">{ui.subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setConv(fresh(locale))}
            className="rounded-pill px-2.5 py-1.5 text-xs text-charcoal-500 transition hover:text-charcoal"
          >
            {ui.restart}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label={ui.close}
            className="grid h-9 w-9 place-items-center rounded-full text-charcoal transition hover:bg-sand-100"
          >
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <div ref={listRef} aria-live="polite" className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 py-4">
        {conv.messages.map((m) =>
          m.from === 'me' ? (
            <p
              key={m.id}
              data-from="me"
              className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-sand-100 px-3.5 py-2 text-sm"
            >
              <span className="sr-only">{ui.you} : </span>
              {m.text}
            </p>
          ) : (
            <BotMessage key={m.id} reply={m.reply!} showChips={m.id === lastBot} onChoose={choose} />
          ),
        )}
        {pending && (
          <>
            <p
              data-from="me"
              className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-sand-100 px-3.5 py-2 text-sm"
            >
              <span className="sr-only">{ui.you} : </span>
              {pending}
            </p>
            <p className="text-sm text-charcoal-500">{ui.thinking}</p>
          </>
        )}
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-sand-200 px-4 py-3">
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={300}
          placeholder={ui.placeholder}
          aria-label={ui.placeholder}
          enterKeyHint="send"
          className="min-w-0 flex-1 rounded-pill border border-sand-300 bg-white/60 px-4 py-2.5 text-[16px] outline-none transition placeholder:text-charcoal-300 focus:border-charcoal sm:text-sm"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="rounded-pill bg-charcoal px-4 py-2.5 text-sm text-cream transition hover:bg-charcoal-700 disabled:opacity-40"
        >
          {ui.send}
        </button>
      </form>
    </div>
  );
}

function BotMessage({
  reply,
  showChips,
  onChoose,
}: {
  reply: Reply;
  showChips: boolean;
  onChoose: (label: string, action: Action) => void;
}) {
  const { locale, catalog } = useLocale();
  const ui = UI[locale];
  const itinerary = reply.itinerary ? catalog.itineraries.find((it) => it.id === reply.itinerary) : undefined;
  return (
    <div className="max-w-[95%] space-y-3 text-sm leading-relaxed">
      <p>{reply.text}</p>
      {reply.ai && <p className="text-xs text-charcoal-300">{ui.aiNote}</p>}

      {reply.trip && <TripBlock ids={reply.trip} />}

      {reply.places && (
        <ul className="space-y-2">
          {reply.places.map((id) => (
            <PlaceCard key={id} id={id} />
          ))}
        </ul>
      )}

      {itinerary && (
        <div className="rounded-2xl border border-sand-200 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.14em] text-charcoal-500">
            {locale === 'fr' ? 'Road trip du site' : 'Site road trip'}
          </p>
          <p className="mt-1 font-serif text-base">{itinerary.name}</p>
          <p className="text-charcoal-500">{itinerary.tagline}</p>
          <a
            href={`/explore?trip=${encodeURIComponent(itinerary.id)}`}
            className="mt-2 inline-block underline decoration-sand-300 underline-offset-4 hover:decoration-charcoal"
          >
            {ui.seeTrip}
          </a>
        </div>
      )}

      {reply.notes && (
        <div className="space-y-2">
          {reply.notes.map((n) => (
            <div key={n.guide + n.title} className="rounded-2xl bg-sand-100/70 px-4 py-3">
              <p className="font-medium">{n.title}</p>
              <p className="mt-1 text-charcoal-700">{n.text}</p>
            </div>
          ))}
        </div>
      )}

      {reply.words && (
        <ul className="divide-y divide-sand-200 rounded-2xl border border-sand-200">
          {reply.words.map((w) => (
            <li key={w.id} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
              <span>
                <span className="font-serif text-base">{w.latin}</span>
                <span className="ml-2 text-charcoal-500">{w.meaning[locale]}</span>
              </span>
              <span lang="ar" dir="rtl" className="shrink-0 text-base text-charcoal-500">
                {w.ar}
              </span>
            </li>
          ))}
        </ul>
      )}

      {reply.links && (
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          {reply.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="underline decoration-sand-300 underline-offset-4 hover:decoration-charcoal"
            >
              {l.label}
            </a>
          ))}
        </p>
      )}

      {showChips && reply.chips && (
        <div className="flex flex-wrap gap-2 pt-1">
          {reply.chips.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => onChoose(c.label, c.action)}
              className="rounded-pill border border-charcoal-300 px-3.5 py-1.5 text-sm transition hover:border-charcoal hover:bg-charcoal hover:text-cream"
            >
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PlaceCard({ id, index }: { id: string; index?: number }) {
  const { locale, catalog } = useLocale();
  const ui = UI[locale];
  const trip = useMyTrip();
  const place = catalog.placeById[id];
  if (!place) return null;
  const inTrip = trip.has(id);
  return (
    <li className="flex gap-3 rounded-2xl border border-sand-200 px-4 py-3">
      {index !== undefined && <span className="mt-0.5 w-4 shrink-0 font-serif text-charcoal-500">{index + 1}</span>}
      <div className="min-w-0 flex-1">
        <p className="font-serif text-base leading-snug">{place.name}</p>
        <p className="text-xs text-charcoal-500">
          {place.region} · {catalog.categoryById[place.category]?.short}
        </p>
        <p className="mt-1 text-charcoal-700">{place.tagline}</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <a
            href={`/explore?place=${encodeURIComponent(id)}`}
            className="underline decoration-sand-300 underline-offset-4 hover:decoration-charcoal"
          >
            {ui.open}
          </a>
          <button
            type="button"
            onClick={() => trip.toggle(id)}
            aria-pressed={inTrip}
            className={inTrip ? 'text-charcoal' : 'text-charcoal-500 hover:text-charcoal'}
          >
            {inTrip ? ui.added : `+ ${ui.add}`}
          </button>
        </div>
      </div>
    </li>
  );
}

function TripBlock({ ids }: { ids: string[] }) {
  const { locale } = useLocale();
  const ui = UI[locale];
  const trip = useMyTrip();
  const allIn = trip.ready && ids.every((id) => trip.has(id));
  return (
    <div className="space-y-2">
      <ol className="space-y-2">
        {ids.map((id, i) => (
          <PlaceCard key={id} id={id} index={i} />
        ))}
      </ol>
      {allIn ? (
        <p>
          {ui.addedAll}{' '}
          <a href="/mon-voyage" className="underline decoration-sand-300 underline-offset-4 hover:decoration-charcoal">
            {ui.openTrip}
          </a>
        </p>
      ) : (
        <button
          type="button"
          onClick={() => trip.add(ids)}
          className="w-full rounded-pill bg-charcoal px-4 py-2.5 text-sm text-cream transition hover:bg-charcoal-700"
        >
          {ui.addAll(ids.length)}
        </button>
      )}
    </div>
  );
}
