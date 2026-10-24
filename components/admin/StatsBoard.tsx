/** Counts from the database, a link to the visit statistics and the backup download. */
export default function StatsBoard({
  counts,
  pending,
  openReports,
}: {
  counts: { label: string; value: number }[];
  pending: number;
  openReports: number;
}) {
  return (
    <section className="mb-12" aria-label="Tableau de bord">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-sand-200 bg-sand-200 sm:grid-cols-4">
        {counts.map((c) => (
          <div key={c.label} className="bg-cream p-5">
            <dt className="text-[11px] uppercase tracking-[0.18em] text-charcoal-300">{c.label}</dt>
            <dd className="mt-1 font-serif text-3xl text-charcoal">{c.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-sm text-charcoal-500">
        {pending > 0
          ? `${pending} proposition${pending > 1 ? 's' : ''} à examiner. `
          : 'Aucune proposition en attente. '}
        {openReports > 0
          ? `${openReports} signalement${openReports > 1 ? 's' : ''} ouvert${openReports > 1 ? 's' : ''}.`
          : 'Aucun signalement ouvert.'}
      </p>
      <p className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <a
          href="/api/admin/backup"
          className="text-charcoal underline decoration-sand-300 underline-offset-4 hover:decoration-charcoal"
        >
          Télécharger une sauvegarde (JSON)
        </a>
        <a
          href="https://eu.posthog.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-charcoal underline decoration-sand-300 underline-offset-4 hover:decoration-charcoal"
        >
          Voir les visites (PostHog)
        </a>
      </p>
    </section>
  );
}
