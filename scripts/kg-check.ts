/**
 * npm run kg:check — validates the Knowledge Graph (data/kg, lib/kg).
 * Exit code 1 when a rule fails. The comparison with the Supabase `events` table (read only, SELECT)
 * runs only when SUPABASE_URL and a server key are set; otherwise it is reported as skipped, not as passed.
 * Use `--events-file <path.json>` to compare an exported list of rows instead.
 */
import { readFileSync } from 'node:fs';
import { EVENTS } from '@/data/events';
import { runChecks } from '@/lib/kg/check';
import { compareEventSources, type EventSourceRow } from '@/lib/kg/events';
import { RELATIONS, ENTITIES, isPublished } from '@/lib/kg';
import { selectRows, supabaseConfig } from '@/lib/supabase';

async function eventRows(): Promise<{ rows: EventSourceRow[] | null; from: string }> {
  const i = process.argv.indexOf('--events-file');
  if (i > 0 && process.argv[i + 1]) {
    return { rows: JSON.parse(readFileSync(process.argv[i + 1], 'utf8')) as EventSourceRow[], from: process.argv[i + 1] };
  }
  const cfg = supabaseConfig();
  if (!cfg) return { rows: null, from: 'aucune variable Supabase' };
  const rows = await selectRows<EventSourceRow>(cfg, 'events', 'select=id,place_id,title_fr,published,confirmed,start_date,end_date');
  return { rows, from: 'Supabase (lecture seule)' };
}

async function main() {
  let failed = false;
  for (const r of runChecks()) {
    const ok = r.errors.length === 0;
    if (!r.warning) failed ||= !ok;
    console.log(`${ok ? '✓' : r.warning ? '!' : '✗'} ${r.rule}${ok ? '' : ` (${r.errors.length})`}`);
    for (const e of r.errors) console.log(`    - ${e}`);
  }
  const pub = RELATIONS.filter(isPublished).length;
  console.log(`  ${ENTITIES.length} entités, ${RELATIONS.length} relations dont ${pub} publiées.`);

  try {
    const { rows, from } = await eventRows();
    if (!rows) {
      console.log(`– C. Écarts entre Supabase et le fichier des événements : non exécuté (${from}).`);
    } else {
      const issues = compareEventSources(rows, EVENTS);
      // A divergence is a warning: Supabase is the source of truth, the file is only the fallback.
      console.log(`${issues.length ? '!' : '✓'} C. Écarts entre Supabase et le fichier des événements (${from}) : ${issues.length}`);
      for (const e of issues) console.log(`    - ${e}`);
    }
  } catch (e) {
    console.log(`– C. Écarts entre Supabase et le fichier des événements : non exécuté (${(e as Error).message}).`);
  }
  process.exit(failed ? 1 : 0);
}

main();
