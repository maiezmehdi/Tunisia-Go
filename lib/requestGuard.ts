/**
 * Small protections for the API routes: a per-visitor rate limit and a same-origin check.
 *
 * The rate limit lives in memory, so each server instance counts on its own: it slows down
 * scripts and password guessing, it is not a hard quota.
 */
const buckets = new Map<string, number[]>();

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}

/** True when `key` has used fewer than `limit` hits in the last `windowMs`; counts this hit. */
export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  // Keep memory bounded on long-lived instances.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
  }
  return true;
}

/** Forgets the hits for a key (after a successful login). */
export function reset(key: string) {
  buckets.delete(key);
}

/**
 * Rejects cross-site posts: browsers send Origin on POST, PATCH and DELETE, and it must match
 * the site's own host. Requests without Origin (curl, server to server) are left to the other checks.
 */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  try {
    return !!host && new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Checks a file's first bytes, so a renamed file cannot pass as a photo. */
export async function looksLikeImage(file: File): Promise<boolean> {
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const jpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const png = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  const webp =
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50;
  if (file.type === 'image/jpeg') return jpeg;
  if (file.type === 'image/png') return png;
  if (file.type === 'image/webp') return webp;
  return false;
}
