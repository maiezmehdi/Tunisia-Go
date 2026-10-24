'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export interface AdminUser {
  id: string;
  email: string;
  role: 'owner' | 'editor';
  createdAt: string;
  lastLoginAt: string | null;
}

const DATE = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
const ROLES = { owner: 'Propriétaire', editor: 'Éditeur' } as const;

const input =
  'mt-1 w-full rounded-xl border border-sand-200 bg-white px-3 py-2 text-sm text-charcoal outline-none transition focus:border-charcoal-300';

/** Admin accounts (owners only): add an email and password, change a password or role, remove access. */
export default function UsersBoard({
  users,
  me,
  tableMissing,
}: {
  users: AdminUser[];
  me: string;
  tableMissing: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', role: 'editor' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const call = async (url: string, method: string, body?: unknown) => {
    setBusy(true);
    setMessage('');
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      router.refresh();
      return true;
    }
    const data = (await res?.json().catch(() => null)) as { error?: string; field?: string } | null;
    setMessage(
      data?.error === 'exists'
        ? 'Cet email a déjà un compte.'
        : data?.error === 'self'
          ? 'Vous ne pouvez pas faire ça sur votre propre compte.'
          : data?.field === 'email'
            ? 'Vérifiez l’adresse email.'
            : data?.field === 'password'
              ? 'Le mot de passe doit faire 10 caractères minimum.'
              : 'L’opération a échoué. Réessayez.',
    );
    return false;
  };

  const add = async () => {
    if (await call('/api/admin/users', 'POST', form)) setForm({ email: '', password: '', role: 'editor' });
  };

  const resetPassword = async (u: AdminUser) => {
    const password = window.prompt(`Nouveau mot de passe pour ${u.email} (10 caractères minimum) :`);
    if (password) await call(`/api/admin/users/${u.id}`, 'PATCH', { password });
  };

  return (
    <section className="mt-16 border-t border-sand-200 pt-10" aria-label="Accès à l’admin">
      <h2 className="font-serif text-2xl text-charcoal">Accès à l’admin</h2>
      <p className="mt-1 max-w-xl text-sm text-charcoal-500">
        Donnez un email et un mot de passe à chaque personne. Un éditeur gère les lieux, événements et erreurs ; un
        propriétaire gère aussi les accès. Le mot de passe principal (ADMIN_PASSWORD) fonctionne toujours.
      </p>

      {tableMissing ? (
        <p className="mt-6 max-w-xl rounded-2xl border border-sand-200 bg-sand-50 p-4 text-sm text-charcoal-700">
          La table des accès n’existe pas encore. Exécutez{' '}
          <code className="rounded bg-sand-100 px-1">db/admin-users.sql</code> dans l’éditeur SQL de Supabase.
        </p>
      ) : (
        <>
          <ul className="mt-6 divide-y divide-sand-200 border-y border-sand-200">
            {users.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-charcoal">
                    {u.email}
                    {u.email === me && <span className="ml-2 text-xs font-normal text-charcoal-300">vous</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-charcoal-500">
                    {ROLES[u.role]} · créé le {DATE.format(new Date(u.createdAt))}
                    {u.lastLoginAt && ` · dernière connexion le ${DATE.format(new Date(u.lastLoginAt))}`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => resetPassword(u)}
                    className="rounded-pill border border-charcoal-300 px-4 py-1.5 text-sm text-charcoal transition hover:border-charcoal disabled:opacity-50"
                  >
                    Changer le mot de passe
                  </button>
                  {u.email !== me && (
                    <>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          call(`/api/admin/users/${u.id}`, 'PATCH', { role: u.role === 'owner' ? 'editor' : 'owner' })
                        }
                        className="rounded-pill border border-sand-200 px-4 py-1.5 text-sm text-charcoal-700 transition hover:border-charcoal-300 disabled:opacity-50"
                      >
                        {u.role === 'owner' ? 'Passer éditeur' : 'Passer propriétaire'}
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          window.confirm(`Retirer l’accès de ${u.email} ?`) &&
                          call(`/api/admin/users/${u.id}`, 'DELETE')
                        }
                        className="rounded-pill border border-sand-200 px-4 py-1.5 text-sm text-charcoal-500 transition hover:border-terracotta-700 hover:text-terracotta-700 disabled:opacity-50"
                      >
                        Retirer l’accès
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
            {users.length === 0 && <li className="py-4 text-sm text-charcoal-500">Aucun compte pour le moment.</li>}
          </ul>

          <div className="mt-6 grid gap-4 rounded-3xl border border-sand-200 bg-sand-50 p-5 sm:grid-cols-3">
            <label className="block text-xs font-medium uppercase tracking-[0.14em] text-charcoal-500">
              Email
              <input
                type="email"
                className={input}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </label>
            <label className="block text-xs font-medium uppercase tracking-[0.14em] text-charcoal-500">
              Mot de passe
              <input
                type="text"
                autoComplete="off"
                className={input}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </label>
            <label className="block text-xs font-medium uppercase tracking-[0.14em] text-charcoal-500">
              Rôle
              <select
                className={input}
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="editor">Éditeur</option>
                <option value="owner">Propriétaire</option>
              </select>
            </label>
            <div className="flex items-center gap-4 sm:col-span-3">
              <button
                type="button"
                disabled={busy}
                onClick={add}
                className="rounded-pill bg-charcoal px-5 py-2 text-sm text-cream transition hover:bg-charcoal-700 disabled:opacity-50"
              >
                Ajouter l’accès
              </button>
              {message && (
                <p role="alert" className="text-sm text-terracotta-700">
                  {message}
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
