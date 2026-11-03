'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';

import BrandLogo from '@/components/BrandLogo';
import { ToastHost } from '@/components/admin/feedback';

export type AdminSection = {
  id: string;
  label: string;
  /** Items waiting for a decision, shown next to the name. */
  badge?: number;
  content: ReactNode;
};

export type AdminGroup = { title: string; sections: AdminSection[] };

/**
 * The admin page as a left menu: one section on screen at a time instead of one long page.
 * Every section is rendered by the server; this only decides which one is visible.
 * The section lives in the address (#lieux) so a refresh or a shared link comes back to it.
 * On phones the menu is a drawer opened from a top bar.
 */
export default function AdminShell({ groups }: { groups: AdminGroup[] }) {
  const all = groups.flatMap((g) => g.sections);
  const [active, setActive] = useState(all[0]?.id ?? '');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (all.some((s) => s.id === id)) setActive(id);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
    // the list of sections does not change while the page is open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pick = useCallback((id: string) => {
    setActive(id);
    setOpen(false);
    window.history.replaceState(null, '', `#${id}`);
    window.scrollTo({ top: 0 });
  }, []);

  const logout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' }).catch(() => null);
    window.location.reload();
  };

  const current = all.find((s) => s.id === active) ?? all[0];

  const menu = (
    <nav aria-label="Sections de l’administration" className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="px-3 text-[11px] uppercase tracking-[0.18em] text-charcoal-300">{g.title}</p>
            <ul className="mt-2 space-y-0.5">
              {g.sections.map((s) => {
                const on = s.id === current?.id;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => pick(s.id)}
                      aria-current={on ? 'page' : undefined}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                        on ? 'bg-charcoal text-cream' : 'text-charcoal-700 hover:bg-sand-100'
                      }`}
                    >
                      <span>{s.label}</span>
                      {s.badge ? (
                        <span
                          className={`ml-2 rounded-pill px-2 py-0.5 text-[11px] leading-none ${
                            on ? 'bg-cream/20 text-cream' : 'bg-terracotta-500 text-cream'
                          }`}
                        >
                          {s.badge}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-sand-200 px-6 py-4">
        <button type="button" onClick={logout} className="text-sm text-charcoal-500 underline-offset-4 hover:underline">
          Se déconnecter
        </button>
      </div>
    </nav>
  );

  return (
    <div className="min-h-dvh bg-cream lg:flex">
      {/* Phones and tablets: top bar + drawer */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-sand-200 bg-cream/95 px-5 py-3 backdrop-blur lg:hidden">
        <BrandLogo tag={null} size={32} compact />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          className="flex items-center gap-2 rounded-pill border border-sand-200 px-4 py-2 text-sm text-charcoal"
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
      </header>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-charcoal/40"
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-cream shadow-xl">{menu}</div>
        </div>
      )}

      {/* Desktop: fixed left menu */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-sand-200 bg-cream lg:flex">
        <div className="px-6 pt-7">
          <BrandLogo tag="Modération" size={36} />
        </div>
        <div className="min-h-0 flex-1">{menu}</div>
      </aside>

      <ToastHost />
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-10 lg:py-10">
        <div className="mx-auto max-w-4xl [&>section]:mt-0 [&>section]:border-t-0 [&>section]:pt-0">
          {current?.content}
        </div>
      </main>
    </div>
  );
}
