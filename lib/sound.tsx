'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

/** The ambient track, served from public/. */
const SRC = '/audio/ambiance-sud.mp3';
/** Remembers, for this tab only, that the visitor switched the sound on (and where the track was). */
const STORE = 'tg-sound';
/** Kept low on purpose: an ambience, not a soundtrack. */
const VOLUME = { default: 0.22, south: 0.38 };
/** Road trips of the Grand Sud: the music fits them best. */
export const SOUTH_TRIPS = new Set(['star-wars']);

export type SoundMood = keyof typeof VOLUME;

interface SoundValue {
  playing: boolean;
  mood: SoundMood;
  toggle: () => void;
  setMood: (mood: SoundMood) => void;
  /** Turns the music right down while something is read aloud. */
  duck: (on: boolean) => void;
}

const SoundContext = createContext<SoundValue | null>(null);

function remember(on: boolean, time = 0) {
  try {
    if (on) sessionStorage.setItem(STORE, String(Math.floor(time)));
    else sessionStorage.removeItem(STORE);
  } catch {
    /* storage blocked: the sound simply won't carry over to the next page */
  }
}

/**
 * One audio element for the whole site. Nothing ever plays until the visitor presses the
 * sound button; after that the choice follows them from page to page in the same tab.
 */
export function SoundProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [mood, setMoodState] = useState<SoundMood>('default');
  const moodRef = useRef<SoundMood>('default');
  const duckRef = useRef(false);
  const level = () => (duckRef.current ? 0.04 : VOLUME[moodRef.current]);

  const audio = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio(SRC);
      a.loop = true;
      a.preload = 'none';
      a.volume = 0;
      audioRef.current = a;
    }
    return audioRef.current;
  }, []);

  const fadeTo = useCallback((target: number, ms: number, done?: () => void) => {
    const a = audioRef.current;
    if (!a) return;
    if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    const from = a.volume;
    const start = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - start) / ms);
      a.volume = from + (target - from) * k;
      if (k < 1) fadeRef.current = requestAnimationFrame(step);
      else {
        fadeRef.current = null;
        done?.();
      }
    };
    fadeRef.current = requestAnimationFrame(step);
  }, []);

  const start = useCallback(
    (from = 0) => {
      const a = audio();
      if (from && !a.currentTime) a.currentTime = from;
      return a.play().then(() => {
        setPlaying(true);
        fadeTo(level(), 1800);
      });
    },
    [audio, fadeTo],
  );

  const stop = useCallback(() => {
    setPlaying(false);
    fadeTo(0, 600, () => audioRef.current?.pause());
  }, [fadeTo]);

  const toggle = useCallback(() => {
    if (playing) {
      stop();
      remember(false);
    } else {
      start()
        .then(() => remember(true, audioRef.current?.currentTime))
        .catch(() => setPlaying(false));
    }
  }, [playing, start, stop]);

  const setMood = useCallback(
    (next: SoundMood) => {
      moodRef.current = next;
      setMoodState(next);
      if (audioRef.current && !audioRef.current.paused) fadeTo(level(), 2400);
    },
    [fadeTo],
  );

  const duck = useCallback(
    (on: boolean) => {
      if (duckRef.current === on) return;
      duckRef.current = on;
      if (audioRef.current && !audioRef.current.paused) fadeTo(level(), on ? 400 : 1500);
    },
    [fadeTo],
  );

  // Carry the visitor's own choice over from the previous page. Browsers may refuse to
  // play before a click on this page; the button then simply shows the sound as off.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(STORE);
    } catch {
      /* ignore */
    }
    if (saved !== null) start(Number(saved) || 0).catch(() => setPlaying(false));
  }, [start]);

  // Remember the position on the way out, pause in background tabs.
  useEffect(() => {
    const save = () => {
      const a = audioRef.current;
      if (a && !a.paused) remember(true, a.currentTime);
    };
    const onVisibility = () => {
      const a = audioRef.current;
      if (!a || !playing) return;
      if (document.hidden) a.pause();
      else a.play().catch(() => setPlaying(false));
    };
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', save);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [playing]);

  useEffect(
    () => () => {
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
      audioRef.current?.pause();
    },
    [],
  );

  const value = useMemo(() => ({ playing, mood, toggle, setMood, duck }), [playing, mood, toggle, setMood, duck]);
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundValue {
  const value = useContext(SoundContext);
  if (!value) throw new Error('useSound must be used inside <SoundProvider>');
  return value;
}
