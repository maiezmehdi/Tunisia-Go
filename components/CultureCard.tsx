'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, Landmark, Lightbulb, Pause, Users, UtensilsCrossed, Volume2 } from 'lucide-react';
import { useEffect, useState, type ComponentType } from 'react';

import type { CultureInsights, Place } from '@/data/types';

type InsightKey = keyof CultureInsights;

const TABS: { key: InsightKey; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { key: 'history', label: 'History', icon: Landmark },
  { key: 'customs', label: 'Customs', icon: Users },
  { key: 'food', label: 'Food', icon: UtensilsCrossed },
  { key: 'bestTime', label: 'Best time', icon: CalendarDays },
];

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
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
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
  const [tab, setTab] = useState<InsightKey>('history');
  const narration = useNarration(place.didYouKnow);

  // Reset when switching places
  useEffect(() => setTab('history'), [place.id]);

  return (
    <section className="space-y-4">
      {/* Did you know? */}
      <div className="relative overflow-hidden rounded-3xl bg-charcoal p-5 text-cream">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-terracotta/40 blur-2xl"
        />
        <div className="relative flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-terracotta text-charcoal">
            <Lightbulb className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta-200">Did you know?</p>
            <p className="mt-1.5 font-serif text-[17px] leading-snug">{place.didYouKnow}</p>
          </div>
        </div>
        {narration.supported && (
          <button
            type="button"
            onClick={narration.toggle}
            className="relative mt-4 inline-flex items-center gap-2 rounded-pill bg-cream/10 px-4 py-2 text-sm font-medium text-cream transition hover:bg-cream/20"
            aria-pressed={narration.speaking}
          >
            {narration.speaking ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {narration.speaking ? 'Stop' : 'Listen'}
            {narration.speaking && (
              <span className="flex items-end gap-0.5" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-0.5 rounded-full bg-terracotta-200"
                    animate={{ height: [4, 12, 4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Micro-learning tabs */}
      <div className="rounded-3xl bg-sand p-2">
        <div role="tablist" aria-label="Cultural insights" className="grid grid-cols-4 gap-1">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setTab(key)}
                className={`relative flex flex-col items-center gap-1 rounded-2xl px-2 py-2.5 text-xs font-medium transition ${
                  active ? 'text-charcoal' : 'text-charcoal-500 hover:text-charcoal'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId={`culture-tab-${place.id}`}
                    className="absolute inset-0 rounded-2xl bg-cream shadow-soft"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{label}</span>
              </button>
            );
          })}
        </div>
        <div className="px-3 pb-3 pt-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={tab}
              role="tabpanel"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="text-[15px] leading-relaxed text-charcoal-700"
            >
              {place.insights[tab]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
