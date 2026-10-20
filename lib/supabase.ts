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
