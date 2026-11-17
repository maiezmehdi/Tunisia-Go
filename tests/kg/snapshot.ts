/**
 * Snapshots compared by the tests: the sitemap URL list and the breadcrumb of every place page.
 * `npx tsx tests/kg/snapshot.ts write` rewrites the fixtures (only to record an intended change).
 */
import { writeFileSync } from 'node:fs';
import sitemap from '@/app/sitemap';
import { getCatalog } from '@/lib/i18n/catalog';
import { placePageData } from '@/lib/structuredData';

export const sitemapUrls = () => sitemap().map((e) => e.url).sort();

export function breadcrumbs(): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const lang of ['fr', 'en'] as const) {
    for (const p of getCatalog(lang).places) {
      const crumb = placePageData(p, [], lang)[1] as { itemListElement: { name: string; item: string }[] };
      out[`${lang}:${p.id}`] = crumb.itemListElement.map((e) => `${e.name} <${e.item}>`);
    }
  }
  return out;
}

if (process.argv[2] === 'write') {
  const dir = new URL('./fixtures/', import.meta.url);
  writeFileSync(new URL('sitemap-urls.json', dir), JSON.stringify(sitemapUrls(), null, 1) + '\n');
  writeFileSync(new URL('breadcrumbs.before.json', dir), JSON.stringify(breadcrumbs(), null, 1) + '\n');
  console.log('fixtures written');
}
