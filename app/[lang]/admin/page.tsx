import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import AdminBoard, { type AdminSubmission } from '@/components/admin/AdminBoard';
import AdminLogin from '@/components/admin/AdminLogin';
import { ADMIN_COOKIE, adminConfigured, isAdminToken } from '@/lib/adminAuth';
import { PRIVATE_BUCKET, defaultCategory, parseCoords, type SubmissionRow } from '@/lib/community';
import { selectRows, signUrls, supabaseConfig } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Modération · Tunisia Go',
  robots: { index: false, follow: false },
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-cream px-5 py-8 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <a href="/" className="font-serif text-2xl tracking-tight text-charcoal">
          Tunisia Go
        </a>
        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-charcoal-300">Modération</p>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-xl rounded-3xl border border-sand-200 bg-sand-50 p-6">
      <h1 className="font-serif text-2xl text-charcoal">{title}</h1>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-charcoal-700">{children}</div>
    </div>
  );
}

export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <Shell>
        <Notice title="Page pas encore activée">
          <p>
            Ajoutez la variable <code className="rounded bg-sand-100 px-1">ADMIN_PASSWORD</code> dans Vercel (8
            caractères minimum), puis redéployez.
          </p>
        </Notice>
      </Shell>
    );
  }

  const jar = await cookies();
  if (!isAdminToken(jar.get(ADMIN_COOKIE)?.value)) {
    return (
      <Shell>
        <AdminLogin />
      </Shell>
    );
  }

  const cfg = supabaseConfig();
  if (!cfg) {
    return (
      <Shell>
        <Notice title="Supabase n’est pas relié">
          <p>
            Ajoutez <code className="rounded bg-sand-100 px-1">SUPABASE_URL</code> et{' '}
            <code className="rounded bg-sand-100 px-1">SUPABASE_SECRET_KEY</code> dans Vercel, puis redéployez.
          </p>
        </Notice>
      </Shell>
    );
  }

  let rows: SubmissionRow[] = [];
  let failed = false;
  try {
    rows = await selectRows<SubmissionRow>(cfg, 'spot_submissions', 'select=*&order=created_at.desc&limit=300');
  } catch (error) {
    console.error('admin: list', error);
    failed = true;
  }
  const signed = await signUrls(
    cfg,
    PRIVATE_BUCKET,
    rows.flatMap((r) => r.photos ?? []),
  ).catch(() => ({}) as Record<string, string>);

  const submissions: AdminSubmission[] = rows.map((r) => {
    const guess = r.lat !== null && r.lng !== null ? ([r.lat, r.lng] as [number, number]) : parseCoords(r.location);
    return {
      id: r.id,
      createdAt: r.created_at,
      status: r.status,
      name: r.name,
      type: r.type,
      area: r.area,
      location: r.location,
      why: r.why,
      bestTime: r.best_time,
      author: r.author,
      contact: r.contact,
      category: r.category ?? defaultCategory(r.type),
      coords: guess ? `${guess[0]}, ${guess[1]}` : '',
      photos: (r.photos ?? []).map((path) => ({ path, url: (signed as Record<string, string>)[path] ?? null })),
      reviewedAt: r.reviewed_at,
    };
  });

  return (
    <Shell>
      {failed ? (
        <Notice title="Impossible de lire les propositions">
          <p>Supabase n’a pas répondu. Réessayez dans un instant.</p>
        </Notice>
      ) : (
        <AdminBoard submissions={submissions} />
      )}
    </Shell>
  );
}
