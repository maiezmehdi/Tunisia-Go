import type { Metadata } from 'next';

import SecretSpotForm from '@/components/SecretSpotForm';

export const metadata: Metadata = {
  title: 'Ajouter un spot secret · Tunisia Go',
  description: 'Un café, une crique isolée, un point de vue : partagez un lieu que seuls les habitués connaissent.',
};

export default function SpotSecretPage() {
  return (
    <main className="min-h-dvh bg-cream text-charcoal">
      <header className="border-b border-sand-200">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="/" className="leading-none">
            <span className="block font-serif text-2xl tracking-tight">Tunisia Go</span>
            <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.24em] text-charcoal-300">
              Spot secret
            </span>
          </a>
          <a
            href="/explore"
            className="text-sm text-charcoal-500 underline-offset-4 transition hover:text-charcoal hover:underline"
          >
            Retour à la carte
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-charcoal-300">Ajouter un spot secret</p>
        <h1 className="mt-2 font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          Un lieu que seuls les habitués connaissent ?
        </h1>
        <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-charcoal-500">
          Un café de village, une crique isolée du Cap Bon, un point de vue au bout d’une piste. Racontez-le : chaque
          proposition est relue avant d’apparaître sur la carte.
        </p>
        <SecretSpotForm />
      </div>
    </main>
  );
}
