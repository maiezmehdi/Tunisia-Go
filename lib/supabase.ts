/**
 * Minimal Supabase client for the server (REST and Storage over fetch, no SDK).
 * Needs SUPABASE_URL and SUPABASE_SECRET_KEY (a `sb_secret_…` key, or the legacy service_role key).
 * The key bypasses row level security, so it must never reach the browser.
 */
export interface SupabaseConfig {
  url: string;
  key: string;
}

export function supabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, '');
  const key = (process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  return url && key ? { url, key } : null;
}

function authHeaders(key: string): Record<string, string> {
  // New `sb_secret_` keys go in `apikey` only; legacy JWT keys are also sent as a bearer token.
  return key.startsWith('sb_') ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` };
}

export async function uploadObject(
  cfg: SupabaseConfig,
  bucket: string,
  path: string,
  body: ArrayBuffer,
  contentType: string,
): Promise<void> {
  const res = await fetch(`${cfg.url}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: { ...authHeaders(cfg.key), 'Content-Type': contentType, 'x-upsert': 'false' },
    body,
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`storage ${res.status}: ${await res.text().catch(() => '')}`);
}

export async function insertRow(cfg: SupabaseConfig, table: string, row: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${cfg.url}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...authHeaders(cfg.key), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(row),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`insert ${res.status}: ${await res.text().catch(() => '')}`);
}

/**
 * Reads rows with a PostgREST query string, e.g. `select=*&status=eq.approved`.
 * Uncached by default; pass `cached` from statically built pages (they revalidate by tag).
 */
export async function selectRows<T>(
  cfg: SupabaseConfig,
  table: string,
  query: string,
  cached?: { revalidate: number; tags: string[] },
): Promise<T[]> {
  const res = await fetch(`${cfg.url}/rest/v1/${table}?${query}`, {
    headers: authHeaders(cfg.key),
    ...(cached ? { next: cached } : { cache: 'no-store' as const }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`select ${res.status}: ${await res.text().catch(() => '')}`);
  return (await res.json()) as T[];
}

export async function updateRow(
  cfg: SupabaseConfig,
  table: string,
  id: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const res = await fetch(`${cfg.url}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { ...authHeaders(cfg.key), 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(patch),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`update ${res.status}: ${await res.text().catch(() => '')}`);
}

/** Short-lived links to private files (the admin page uses them to show submitted photos). */
export async function signUrls(
  cfg: SupabaseConfig,
  bucket: string,
  paths: string[],
  expiresIn = 3600,
): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const res = await fetch(`${cfg.url}/storage/v1/object/sign/${bucket}`, {
    method: 'POST',
    headers: { ...authHeaders(cfg.key), 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn, paths }),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`sign ${res.status}: ${await res.text().catch(() => '')}`);
  const out: Record<string, string> = {};
  for (const item of (await res.json()) as { path: string; signedURL?: string; error?: string | null }[]) {
    if (item.signedURL) out[item.path] = `${cfg.url}/storage/v1${item.signedURL}`;
  }
  return out;
}

/** Copies a file between buckets (approved photos go from the private bucket to the public one). */
export async function copyObject(
  cfg: SupabaseConfig,
  from: { bucket: string; path: string },
  to: { bucket: string; path: string },
): Promise<void> {
  const res = await fetch(`${cfg.url}/storage/v1/object/copy`, {
    method: 'POST',
    headers: { ...authHeaders(cfg.key), 'Content-Type': 'application/json', 'x-upsert': 'true' },
    body: JSON.stringify({
      bucketId: from.bucket,
      sourceKey: from.path,
      destinationBucket: to.bucket,
      destinationKey: to.path,
    }),
    signal: AbortSignal.timeout(15000),
  });
  // 409: already copied by an earlier approval.
  if (!res.ok && res.status !== 409) throw new Error(`copy ${res.status}: ${await res.text().catch(() => '')}`);
}

export function publicUrl(cfg: SupabaseConfig, bucket: string, path: string): string {
  return `${cfg.url}/storage/v1/object/public/${bucket}/${path}`;
}

export async function deleteObjects(cfg: SupabaseConfig, bucket: string, paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const res = await fetch(`${cfg.url}/storage/v1/object/${bucket}`, {
    method: 'DELETE',
    headers: { ...authHeaders(cfg.key), 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefixes: paths }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`delete ${res.status}: ${await res.text().catch(() => '')}`);
}

export async function deleteRow(cfg: SupabaseConfig, table: string, id: string): Promise<void> {
  const res = await fetch(`${cfg.url}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { ...authHeaders(cfg.key), Prefer: 'return=minimal' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`delete ${res.status}: ${await res.text().catch(() => '')}`);
}

/** Inserts a row, or replaces the one with the same primary key (or the same `onConflict` column). */
export async function upsertRow(
  cfg: SupabaseConfig,
  table: string,
  row: Record<string, unknown>,
  onConflict?: string,
): Promise<void> {
  const res = await fetch(`${cfg.url}/rest/v1/${table}${onConflict ? `?on_conflict=${onConflict}` : ''}`, {
    method: 'POST',
    headers: {
      ...authHeaders(cfg.key),
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(row),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`upsert ${res.status}: ${await res.text().catch(() => '')}`);
}

/** Deletes every row matching a PostgREST filter, e.g. `place_id=eq.tunis`. */
export async function deleteWhere(cfg: SupabaseConfig, table: string, filter: string): Promise<void> {
  const res = await fetch(`${cfg.url}/rest/v1/${table}?${filter}`, {
    method: 'DELETE',
    headers: { ...authHeaders(cfg.key), Prefer: 'return=minimal' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`delete ${res.status}: ${await res.text().catch(() => '')}`);
}
