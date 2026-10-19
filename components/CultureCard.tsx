'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import type { CultureInsights, Place } from '@/data/types';
import { useLocale } from '@/lib/i18n/LocaleProvider';

type InsightKey = keyof CultureInsights;

const TAB_KEYS: InsightKey[] = ['history', 'customs', 'food', 'bestTime'];

/** Reads text aloud with the browser's speech engine. No audio files needed. */
function useNarration(text: string, lang = 'en-GB') {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported('speechSynthesis' in window), []);

  useEffect(() => {
    if (!supported) return;
    setSpeaking(false);
    return () => window.speechSynthesis.cancel();
  }, [supported, text]);

  const toggle = () => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    if (speaking) {
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.98;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    synth.speak(utterance);
    setSpeaking(true);
  };

  return { speaking, toggle, supported };
}

export interface CultureCardProps {
  place: Place;
}

export default function CultureCard({ place }: CultureCardProps) {
  const { t, locale } = useLocale();
  const [tab, setTab] = useState<InsightKey>('history');
  const narration = useNarration(place.didYouKnow, locale === 'fr' ? 'fr-FR' : 'en-GB');
  const TABS = TAB_KEYS.map((key) => ({ key, label: t.insightTabs[key] }));

  useEffect(() => setTab('history'), [place.id]);

  return (
    <section className="space-y-8">
      {/* Did you know? */}
      <figure className="border-l-2 border-terracotta pl-5">
        <figcaption className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">
          {t.didYouKnow}
        </figcaption>
        <blockquote className="mt-2 font-serif text-[19px] leading-snug text-charcoal">{place.didYouKnow}</blockquote>
        {narration.supported && (
          <button
            type="button"
            onClick={narration.toggle}
            aria-pressed={narration.speaking}
            className="mt-3 text-sm text-charcoal-500 underline decoration-sand-300 underline-offset-4 transition hover:text-charcoal hover:decoration-charcoal"
          >
            {narration.speaking ? t.stopReading : t.listen}
          </button>
        )}
      </figure>

      {/* Micro-learning tabs */}
      <div>
        <div role="tablist" aria-label={t.culturalInsights} className="flex gap-6 border-b border-sand-200">
          {TABS.map(({ key, label }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setTab(key)}
                className={`relative -mb-px pb-2.5 text-sm transition ${
                  active ? 'text-charcoal' : 'text-charcoal-300 hover:text-charcoal-700'
                }`}
              >
                {label}
                {active && (
                  <motion.span
                    layoutId={`culture-tab-${place.id}`}
                    className="absolute inset-x-0 -bottom-px h-px bg-charcoal"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}
              </button>
            );
          })}
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={tab}
            role="tabpanel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="pt-4 text-[15px] leading-relaxed text-charcoal-700"
          >
            {place.insights[tab]}
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
}
