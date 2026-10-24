import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import BrandLogo from '@/components/BrandLogo';
import AdminBoard, { type AdminSubmission } from '@/components/admin/AdminBoard';
import AdminLogin from '@/components/admin/AdminLogin';
import EventsBoard, { type AdminEvent } from '@/components/admin/EventsBoard';
import ReportsBoard, { type AdminReport } from '@/components/admin/ReportsBoard';
import { ADMIN_COOKIE, adminConfigured, isAdminToken } from '@/lib/adminAuth';
import { PRIVATE_BUCKET, defaultCategory, parseCoords, type SubmissionRow } from '@/lib/community';
import { PLACES } from '@/data/tunisiaData';
import type { EventRow } from '@/lib/events';
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
        <BrandLogo tag="Modération" size={40} />
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
  // Reports are optional: without the table (db/place-reports.sql) the section just stays empty.
  const reports: AdminReport[] = await selectRows<{
    id: string;
    created_at: string;
    status: 'open' | 'done';
    place_id: string;
    place_name: string | null;
    message: string;
    contact: string | null;
  }>(cfg, 'place_reports', 'select=*&order=created_at.desc&limit=200')
    .then((list) =>
      list.map((r) => ({
        id: r.id,
        createdAt: r.created_at,
        status: r.status,
        placeId: r.place_id,
        placeName: r.place_name,
        message: r.message,
        contact: r.contact,
      })),
    )
    .catch(() => []);
  // Events are optional too: without the table (db/events.sql) the admin shows how to create it.
  let eventsMissing = false;
  const events: AdminEvent[] = await selectRows<EventRow>(
    cfg,
    'events',
    'select=*&order=sort.asc,created_at.asc&limit=300',
  )
    .then((list) =>
      list.map((r) => ({
        id: r.id,
        published: r.published,
        kind: r.kind,
        placeId: r.place_id,
        titleFr: r.title_fr,
        titleEn: r.title_en,
        descFr: r.desc_fr,
        descEn: r.desc_en,
        whenFr: r.when_fr,
        whenEn: r.when_en,
        confirmed: r.confirmed,
        startDate: r.start_date ?? '',
        endDate: r.end_date ?? '',
        ticketUrl: r.ticket_url ?? '',
        infoUrl: r.info_url ?? '',
      })),
    )
    .catch(() => {
      eventsMissing = true;
      return [];
    });
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
        <>
          <AdminBoard submissions={submissions} />
          <EventsBoard
            events={events}
            places={PLACES.map((p) => ({ id: p.id, name: p.name }))}
            tableMissing={eventsMissing}
          />
          <ReportsBoard reports={reports} />
        </>
      )}
    </Shell>
  );
}
