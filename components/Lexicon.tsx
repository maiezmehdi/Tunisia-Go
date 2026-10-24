'use client';

import { useEffect, useRef, useState } from 'react';

import { LEXICON, type Word, type WordGroup } from '@/data/lexicon';
import { track } from '@/lib/analytics';
import { useLocale } from '@/lib/i18n/LocaleProvider';
import { useSound } from '@/lib/sound';
import { bestVoice } from '@/lib/voice';

const COPY = {
  fr: {
    eyebrow: 'Les mots du cru',
    title: 'Quelques mots de tunisien pour la route',
    intro:
      'Le tunisien (derja) mêle arabe, berbère, français et italien. Trois mots suffisent pour faire sourire un commerçant ou un chauffeur : voici ceux qui servent vraiment.',
    listen: 'Écouter',
    listening: 'Lecture…',
    voiceNote: 'Lecture par la voix arabe de votre appareil : l’accent tunisien se rattrape sur place.',
  },
  en: {
    eyebrow: 'Local words',
    title: 'A few words of Tunisian for the road',
    intro:
      'Tunisian Arabic (derja) mixes Arabic, Berber, French and Italian. Three words are enough to get a smile from a shopkeeper or a driver: here are the ones you will actually use.',
    listen: 'Listen',
    listening: 'Playing…',
    voiceNote: 'Read by your device’s Arabic voice: the Tunisian accent you will pick up on the spot.',
  },
};

/** Says a word with an Arabic voice when the device has one, otherwise reads the Latin spelling in French. */
function useSpeaker() {
  const { duck } = useSound();
  const [playing, setPlaying] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const [hasArabic, setHasArabic] = useState(false);
  const voices = useRef<{ ar: SpeechSynthesisVoice | null; fr: SpeechSynthesisVoice | null }>({ ar: null, fr: null });

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    setSupported(true);
    const pick = () => {
      voices.current = { ar: bestVoice('ar'), fr: bestVoice('fr-FR') };
      setHasArabic(!!voices.current.ar);
    };
    pick();
    window.speechSynthesis.addEventListener('voiceschanged', pick);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', pick);
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => duck(playing !== null), [playing, duck]);

  const say = (word: Word) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const { ar, fr } = voices.current;
    const u = new SpeechSynthesisUtterance(ar ? (word.say ?? word.ar) : word.latin.replace(/[?!]/g, ''));
    u.lang = ar ? ar.lang : 'fr-FR';
    const voice = ar ?? fr;
    if (voice) u.voice = voice;
    u.rate = 0.82;
    u.onend = u.onerror = () => setPlaying((p) => (p === word.id ? null : p));
    setPlaying(word.id);
    synth.speak(u);
    track('word_listened', { word: word.id });
  };

  return { supported, hasArabic, playing, say };
}

export default function Lexicon({ groups = LEXICON }: { groups?: WordGroup[] }) {
  const { locale } = useLocale();
  const c = COPY[locale];
  const speaker = useSpeaker();

  return (
    <section id="mots" className="scroll-mt-6 border-t border-sand-200 pt-12">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">{c.eyebrow}</p>
      <h2 className="mt-1.5 max-w-2xl font-serif text-3xl leading-tight sm:text-4xl">{c.title}</h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-charcoal-700">{c.intro}</p>

      <div className="mt-10 space-y-12">
        {groups.map((group) => (
          <div key={group.id}>
            <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-500">
              {group.title[locale]}
            </h3>
            <ul className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {group.words.map((word) => {
                const playing = speaker.playing === word.id;
                return (
                  <li key={word.id} className="flex flex-col border-t border-sand-200 py-5">
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="font-serif text-2xl leading-tight text-charcoal">{word.latin}</p>
                      <p lang="ar" dir="rtl" className="shrink-0 font-serif text-xl text-charcoal-300">
                        {word.ar}
                      </p>
                    </div>
                    <p className="mt-1 text-[15px] text-charcoal-700">{word.meaning[locale]}</p>
                    {word.tip && <p className="mt-2 text-sm leading-relaxed text-charcoal-500">{word.tip[locale]}</p>}
                    {speaker.supported && (
                      <button
                        type="button"
                        onClick={() => speaker.say(word)}
                        aria-pressed={playing}
                        aria-label={`${c.listen} : ${word.latin}`}
                        className="mt-3 inline-flex items-center gap-2 self-start text-sm text-charcoal-500 transition hover:text-charcoal"
                      >
                        <svg aria-hidden viewBox="0 0 14 12" className={`h-3 w-3.5 ${playing ? 'tg-sound-on' : ''}`}>
                          {[1, 5, 9, 13].map((x, i) => (
                            <rect
                              key={x}
                              className="tg-sound-bar"
                              x={x - 1}
                              y={[4, 1, 3, 5][i]}
                              width="1.6"
                              height={[4, 10, 6, 2][i]}
                              rx="0.8"
                              fill="currentColor"
                              style={{ animationDelay: `${i * 0.12}s` }}
                            />
                          ))}
                        </svg>
                        <span className="underline decoration-sand-300 underline-offset-4">
                          {playing ? c.listening : c.listen}
                        </span>
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      {speaker.supported && speaker.hasArabic && <p className="mt-8 text-xs text-charcoal-300">{c.voiceNote}</p>}
    </section>
  );
}
