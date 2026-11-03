'use client';

import { useState } from 'react';

import { useLocale } from '@/lib/i18n/LocaleProvider';

const COPY = {
  fr: {
    title: 'Modifier mon e-mail ou mon mot de passe',
    newEmail: 'Nouvelle adresse e-mail',
    newPassword: 'Nouveau mot de passe',
    optional: 'laissez vide pour ne pas changer',
    current: 'Mot de passe actuel',
    save: 'Enregistrer',
    sending: 'Un instant…',
    done: 'C’est enregistré.',
    donePassword: 'Votre mot de passe a bien été modifié.',
    nothing: 'Indiquez une nouvelle adresse ou un nouveau mot de passe.',
    badEmail: 'Cette adresse e-mail ne semble pas valide.',
    weak: 'Le mot de passe doit avoir au moins 8 caractères.',
    exists: 'Un compte existe déjà avec cet e-mail.',
    wrong: 'Le mot de passe actuel est incorrect.',
    tooMany: 'Trop d’essais. Réessayez plus tard.',
    failed: 'Cela n’a pas abouti. Réessayez dans un instant.',
  },
  en: {
    title: 'Change my e-mail or password',
    newEmail: 'New e-mail address',
    newPassword: 'New password',
    optional: 'leave empty to keep it',
    current: 'Current password',
    save: 'Save',
    sending: 'One moment…',
    done: 'Saved.',
    donePassword: 'Your password has been changed.',
    nothing: 'Enter a new address or a new password.',
    badEmail: 'This e-mail address does not look valid.',
    weak: 'The password must be at least 8 characters.',
    exists: 'An account already exists with this e-mail.',
    wrong: 'The current password is wrong.',
    tooMany: 'Too many attempts. Please try again later.',
    failed: 'That did not work. Please try again in a moment.',
  },
} as const;

const input =
  'mt-1.5 w-full rounded-2xl border border-sand-200 bg-white px-4 py-2.5 text-[15px] font-normal text-charcoal outline-none transition placeholder:text-charcoal-300 focus:border-charcoal';

/** Change the e-mail and/or the password; the current password is asked first. */
export default function AccountSettings({ accessToken }: { accessToken: string }) {
  const { locale } = useLocale();
  const c = COPY[locale];
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [current, setCurrent] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() && !newPassword) return setMessage({ ok: false, text: c.nothing });
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, action: 'update', currentPassword: current, newEmail, newPassword }),
      });
      if (res.ok) {
        setMessage({ ok: true, text: newPassword ? c.donePassword : c.done });
        // The page shows the new address after a reload.
        return void window.setTimeout(() => window.location.reload(), 2500);
      }
      const code = ((await res.json().catch(() => ({}))) as { error?: string }).error;
      setMessage({
        ok: false,
        text:
          code === 'invalid'
            ? c.badEmail
            : code === 'weak'
              ? c.weak
              : code === 'exists'
                ? c.exists
                : code === 'wrong'
                  ? c.wrong
                  : res.status === 429
                    ? c.tooMany
                    : c.failed,
      });
    } catch {
      setMessage({ ok: false, text: c.failed });
    } finally {
      setBusy(false);
    }
  };

  return (
    <details className="rounded-3xl border border-sand-200 bg-white px-5 py-4">
      <summary className="cursor-pointer text-[15px] text-charcoal">{c.title}</summary>
      <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
        <label className="block text-sm font-medium text-charcoal">
          {c.newEmail} <span className="font-normal text-charcoal-500">({c.optional})</span>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            autoComplete="email"
            maxLength={254}
            className={input}
          />
        </label>
        <label className="block text-sm font-medium text-charcoal">
          {c.newPassword} <span className="font-normal text-charcoal-500">({c.optional})</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            className={input}
          />
        </label>
        <label className="block text-sm font-medium text-charcoal">
          {c.current}
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            required
            className={input}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700 disabled:opacity-60"
        >
          {busy ? c.sending : c.save}
        </button>
        {message && (
          <p role="alert" className={`text-sm ${message.ok ? 'text-charcoal-700' : 'text-terracotta-700'}`}>
            {message.text}
          </p>
        )}
      </form>
    </details>
  );
}
