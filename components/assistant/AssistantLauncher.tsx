'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { useLocale } from '@/lib/i18n/LocaleProvider';

// The assistant and its knowledge are only downloaded once the visitor opens it.
const AssistantPanel = dynamic(() => import('./AssistantPanel'), { ssr: false });

/** "Une question ?" button in the bottom-right corner, opening the travel assistant. */
export default function AssistantLauncher() {
  const { locale } = useLocale();
  const pathname = usePathname() ?? '';
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (/\/admin(\/|$)/.test(pathname)) return null;
  // On the map, stay clear of the zoom buttons and the "add a place" button.
  const onMap = /\/explore$/.test(pathname);

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => {
            setLoaded(true);
            setOpen(true);
          }}
          onPointerEnter={() => setLoaded(true)}
          aria-haspopup="dialog"
          className={`fixed inline-flex items-center gap-2 rounded-pill bg-charcoal px-4 py-2.5 text-sm text-cream shadow-lift transition hover:bg-charcoal-700 print:hidden ${
            onMap
              ? 'bottom-[9.25rem] right-3 z-[1050] lg:bottom-24 lg:right-5' // under the place panel
              : 'bottom-4 right-4 z-[1250] sm:bottom-5 sm:right-5'
          }`}
        >
          <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
            <path d="M8.5 2.5c.4 3.4 1.6 4.6 5 5-3.4.4-4.6 1.6-5 5-.4-3.4-1.6-4.6-5-5 3.4-.4 4.6-1.6 5-5z" />
            <path d="M15 11.5c.2 1.7.8 2.3 2.5 2.5-1.7.2-2.3.8-2.5 2.5-.2-1.7-.8-2.3-2.5-2.5 1.7-.2 2.3-.8 2.5-2.5z" />
          </svg>
          {locale === 'fr' ? 'Une question ?' : 'Ask a question'}
        </button>
      )}
      {loaded && <AssistantPanel open={open} onClose={() => setOpen(false)} />}
    </>
  );
}
