'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) router.refresh();
    else setError(res?.status === 401 ? 'Mot de passe incorrect.' : 'Connexion impossible, réessayez.');
  };

  return (
    <form onSubmit={submit} className="max-w-sm space-y-4">
      <h1 className="font-serif text-3xl text-charcoal">Lieux proposés</h1>
      <label className="block">
        <span className="text-sm text-charcoal-700">Mot de passe</span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-2xl border border-sand-200 bg-white px-4 py-3 text-charcoal outline-none focus:border-charcoal"
          required
        />
      </label>
      {error && <p className="text-sm text-terracotta-600">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="rounded-pill bg-charcoal px-5 py-2.5 text-sm font-medium text-cream transition hover:bg-charcoal-700 disabled:opacity-60"
      >
        {busy ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}
