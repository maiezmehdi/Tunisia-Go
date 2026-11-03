'use client';

import ContactLine from '@/components/ContactLine';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

export type AccountSection = { id: string; label: string; content: ReactNode };

/**
 * The signed-in account page as a left menu, one section at a time (a drawer on phones).
 * The section lives in the address (#favoris) so a refresh comes back to it.
 */
export default function AccountShell({
  email,
  typeLabel,
  sections,
  menuLabel,
  closeLabel,
}: {
  email: string;
  typeLabel: string;
  sections: AccountSection[];
  menuLabel: string;
  closeLabel: string;
}) {
  const [active, setActive] = useState(sections[0]?.id ?? '');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (sections.some((s) => s.id === id)) setActive(id);
    // sections are fixed for the lifetime of a signed-in account
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = useCallback((id: string) => {
    setActive(id);
    setOpen(false);
    window.history.replaceState(null, '', `#${id}`);
  }, []);

  const current = sections.find((s) => s.id === active) ?? sections[0];

  const menu = (
    <nav aria-label={menuLabel} className="space-y-4">
      <div className="px-3">
        <p className="break-all text-sm text-charcoal">{email}</p>
        <p className="mt-0.5 text-xs text-charcoal-500">{typeLabel}</p>
      </div>
      <ul className="space-y-0.5">
        {sections.map((s) => {
          const on = s.id === current?.id;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => pick(s.id)}
                aria-current={on ? 'page' : undefined}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                  on ? 'bg-charcoal text-cream' : 'text-charcoal-700 hover:bg-sand-100'
                }`}
              >
                {s.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
      <div className="mb-6 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          className="flex items-center gap-2 rounded-pill border border-sand-200 bg-white px-4 py-2 text-sm text-charcoal"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <path d="M2 4h12M2 8h12M2 12h12" strokeLinecap="round" />
          </svg>
          {current?.label}
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label={closeLabel}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-charcoal/40"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] overflow-y-auto bg-cream px-3 py-6 shadow-xl">
            {menu}
          </div>
        </div>
      )}
      <aside className="hidden lg:block">
        <div className="sticky top-6">{menu}</div>
      </aside>
      <div className="min-w-0 max-w-xl">
        {current?.content}
        <ContactLine className="mt-10" />
      </div>
    </div>
  );
}
