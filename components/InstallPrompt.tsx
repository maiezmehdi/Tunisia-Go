'use client';

import { useEffect, useState } from 'react';

import { CONSENT_CHANGE, readConsent } from '@/lib/consent';
import type { Locale } from '@/lib/i18n/config';
import { useLocale } from '@/lib/i18n/LocaleProvider';

const COPY: Record<Locale, { title: string; body: string; ios: string; install: string; later: string }> = {
  fr: {
    title: 'Installer Tunisia Go',
    body: 'Gardez la carte et vos road trips sur l’écran d’accueil, même sans réseau.',
    ios: 'Touchez le bouton Partager, puis « Sur l’écran d’accueil ».',
    install: 'Installer',
    later: 'Plus tard',
  },
  en: {
    title: 'Install Tunisia Go',
    body: 'Keep the map and your road trips on your home screen, even offline.',
    ios: 'Tap the Share button, then “Add to Home Screen”.',
    install: 'Install',
    later: 'Not now',
  },
};

const KEY = 'tg-install-dismissed';
const INSTALLED = 'tg-installed';
const PAUSE = 1000 * 60 * 60 * 24 * 14;
const DELAY = 15000;

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

function dismissedRecently(): boolean {
  try {
    if (localStorage.getItem(INSTALLED)) return true;
    const at = Number(localStorage.getItem(KEY));
    return !!at && Date.now() - at < PAUSE;
  } catch {
    return false;
  }
}

function installed(): boolean {
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) {
    try {
      localStorage.setItem(INSTALLED, '1');
    } catch {
      /* nothing to remember */
    }
  }
  return standalone;
}

/** A discreet "install the app" card: Chrome's install prompt on Android, short instructions on iPhone. */
export default function InstallPrompt() {
  const { locale } = useLocale();
  const c = COPY[locale];
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (installed() || dismissedRecently()) return;
    const ua = navigator.userAgent;
    setIos(/iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua));
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
    };
    const onInstalled = () => {
      try {
        localStorage.setItem(INSTALLED, '1');
      } catch {
        /* nothing to remember */
      }
      setOpen(false);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    // Wait a little, and for the cookie choice, so two banners never stack.
    const timer = window.setTimeout(() => setReady(true), DELAY);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!ready || (!event && !ios)) return;
    if (readConsent()) return setOpen(true);
    const onChoice = () => setOpen(true);
    window.addEventListener(CONSENT_CHANGE, onChoice);
    return () => window.removeEventListener(CONSENT_CHANGE, onChoice);
  }, [ready, event, ios]);

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {
      /* private mode: it will simply come back next visit */
    }
    setOpen(false);
  };

  const install = async () => {
    if (!event) return;
    setOpen(false);
    await event.prompt().catch(() => undefined);
    const choice = await event.userChoice.catch(() => null);
    if (choice?.outcome === 'dismissed') dismiss();
    // An accepted install fires `appinstalled`, which remembers it for good.
    setEvent(null);
  };

  if (!open) return null;
  return (
    <aside
      role="complementary"
      aria-label={c.title}
      className="fixed inset-x-4 bottom-20 z-[1500] rounded-3xl border border-sand-200 bg-cream p-4 shadow-lift sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-xs print:hidden"
    >
      <p className="font-serif text-lg text-charcoal">{c.title}</p>
      <p className="mt-1 text-sm text-charcoal-500">{event ? c.body : c.ios}</p>
      <div className="mt-3 flex items-center gap-4">
        {event && (
          <button
            type="button"
            onClick={install}
            className="rounded-pill bg-charcoal px-4 py-2 text-sm text-cream transition hover:bg-charcoal-700"
          >
            {c.install}
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="text-sm text-charcoal-500 underline decoration-sand-300 underline-offset-4 hover:text-charcoal"
        >
          {c.later}
        </button>
      </div>
    </aside>
  );
}
