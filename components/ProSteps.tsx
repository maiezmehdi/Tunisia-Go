/** Thin step indicator: numbered dots joined by a line, the current one dark. */
export default function ProSteps({ steps, current }: { steps: readonly string[]; current: number }) {
  return (
    <ol className="mb-6 flex items-center gap-2" aria-label={`${current}/${steps.length}`}>
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-2" aria-current={active ? 'step' : undefined}>
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] ${
                active
                  ? 'border-charcoal bg-charcoal text-cream'
                  : done
                    ? 'border-charcoal text-charcoal'
                    : 'border-sand-200 text-charcoal-300'
              }`}
            >
              {n}
            </span>
            <span className={`hidden truncate text-xs sm:block ${active ? 'text-charcoal' : 'text-charcoal-300'}`}>
              {label}
            </span>
            {n < steps.length && <span className={`h-px flex-1 ${done ? 'bg-charcoal' : 'bg-sand-200'}`} />}
          </li>
        );
      })}
    </ol>
  );
}

export const PRO_STEP_LABELS = {
  fr: ['Compte', 'Vous', 'Profil', 'Envoi'],
  en: ['Account', 'You', 'Profile', 'Send'],
} as const;
