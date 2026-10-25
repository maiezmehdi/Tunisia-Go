'use client';

import { useState } from 'react';

type Copy = {
  button: string;
  busy: string;
  note?: string;
  proposal: string;
  accept: string;
  ignore: string;
  errors: Record<string, string>;
  failed: string;
};

const ADMIN: Copy = {
  button: 'Reformuler',
  busy: 'Reformulation…',
  proposal: 'Proposition (relisez-la : rien n’est changé tant que vous ne l’utilisez pas)',
  accept: 'Utiliser ce texte',
  ignore: 'Ignorer',
  errors: {
    not_configured: 'La reformulation n’est pas encore activée (clé Gemini manquante sur Vercel).',
    too_many: 'Trop de demandes, réessayez dans une minute.',
    invalid: 'Écrivez d’abord un texte d’au moins 20 caractères.',
  },
  failed: 'La reformulation a échoué, réessayez.',
};

const VISITOR: Record<'fr' | 'en', Copy> = {
  fr: {
    button: 'Améliorer mon texte',
    busy: 'Un instant…',
    note: 'Un coup de pouce pour bien écrire : on corrige et on clarifie votre texte sans rien y ajouter, et il sera mieux compris par Google. Vous gardez le dernier mot.',
    proposal: 'Voici une version plus claire. Rien ne change tant que vous ne la choisissez pas.',
    accept: 'Utiliser cette version',
    ignore: 'Garder la mienne',
    errors: {
      not_configured: 'Cette aide n’est pas encore disponible. Vous pouvez envoyer votre texte tel quel.',
      too_many: 'Vous avez beaucoup essayé, réessayez un peu plus tard.',
      invalid: 'Écrivez d’abord quelques phrases (20 caractères au moins).',
    },
    failed: 'Ça n’a pas marché pour le moment. Vous pouvez envoyer votre texte tel quel.',
  },
  en: {
    button: 'Improve my text',
    busy: 'One moment…',
    note: 'A little help with the writing: we fix and clarify your text without adding anything, and Google will understand it better. You have the final say.',
    proposal: 'Here is a clearer version. Nothing changes until you choose it.',
    accept: 'Use this version',
    ignore: 'Keep mine',
    errors: {
      not_configured: 'This help is not available yet. You can send your text as it is.',
      too_many: 'You have tried a lot, please try again a little later.',
      invalid: 'Write a few sentences first (at least 20 characters).',
    },
    failed: 'That did not work right now. You can send your text as it is.',
  },
};

/**
 * Asks for a cleaner version of the text next to a field. The proposal is only shown:
 * nothing changes until the admin accepts it, and nothing is saved by this button.
 */
export default function RewriteButton({
  value,
  lang = 'fr',
  kind,
  name,
  audience = 'admin',
  onAccept,
}: {
  audience?: 'admin' | 'visitor';
  value: string;
  lang?: 'fr' | 'en';
  kind: 'place' | 'trip';
  name?: string;
  onAccept: (text: string) => void;
}) {
  const copy = audience === 'admin' ? ADMIN : VISITOR[lang];
  const [busy, setBusy] = useState(false);
  const [proposal, setProposal] = useState('');
  const [message, setMessage] = useState('');

  const ask = async () => {
    setBusy(true);
    setMessage('');
    setProposal('');
    const res = await fetch(audience === 'admin' ? '/api/admin/rewrite' : '/api/rewrite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: value, lang, kind, name }),
    }).catch(() => null);
    setBusy(false);
    const data = (await res?.json().catch(() => null)) as { text?: string; error?: string } | null;
    if (res?.ok && data?.text) setProposal(data.text);
    else setMessage(copy.errors[data?.error ?? ''] ?? copy.failed);
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={ask}
        disabled={busy || value.trim().length < 20}
        className="rounded-pill border border-sand-200 px-3 py-1 text-xs text-charcoal-700 transition hover:border-charcoal-300 disabled:opacity-40"
      >
        {busy ? copy.busy : copy.button}
      </button>
      {copy.note && !proposal && <p className="mt-2 max-w-prose text-xs text-charcoal-500">{copy.note}</p>}
      {message && (
        <p role="alert" className="mt-2 text-xs text-terracotta-700">
          {message}
        </p>
      )}
      {proposal && (
        <div className="mt-2 rounded-2xl border border-sand-200 bg-white p-3">
          <p className="text-xs text-charcoal-500">{copy.proposal}</p>
          <p className="mt-2 whitespace-pre-line text-sm text-charcoal">{proposal}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                onAccept(proposal);
                setProposal('');
              }}
              className="rounded-pill bg-charcoal px-4 py-1 text-xs text-cream transition hover:bg-charcoal-700"
            >
              {copy.accept}
            </button>
            <button
              type="button"
              onClick={() => setProposal('')}
              className="rounded-pill border border-sand-200 px-4 py-1 text-xs text-charcoal-700 transition hover:border-charcoal-300"
            >
              {copy.ignore}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
