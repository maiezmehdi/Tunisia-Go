import type { Metadata } from 'next';
import { cookies } from 'next/headers';

import BrandLogo from '@/components/BrandLogo';
import AddPlaceForm from '@/components/admin/AddPlaceForm';
import AdminBoard, { type AdminSubmission } from '@/components/admin/AdminBoard';
import UsersBoard, { type AdminUser } from '@/components/admin/UsersBoard';
import AdminLogin from '@/components/admin/AdminLogin';
import EventsBoard, { type AdminEvent } from '@/components/admin/EventsBoard';
import PlaceOverridesBoard from '@/components/admin/PlaceOverridesBoard';
import LexiconBoard, { type AdminWord } from '@/components/admin/LexiconBoard';
import StatsBoard from '@/components/admin/StatsBoard';
import TripsBoard, { type AdminTrip } from '@/components/admin/TripsBoard';
import type { TripRow } from '@/lib/tripSuggest';
import ReportsBoard, { type AdminReport } from '@/components/admin/ReportsBoard';
import { ADMIN_COOKIE, adminConfigured, adminSession } from '@/lib/adminAuth';
import { PRIVATE_BUCKET, PUBLIC_BUCKET, defaultCategory, parseCoords, type SubmissionRow } from '@/lib/community';
import { LEXICON } from '@/data/lexicon';
import type { LexiconRow } from '@/lib/lexiconExtra';
import { PLACES } from '@/data/tunisiaData';
import type { EventRow } from '@/lib/events';
import { publicUrl, selectRows, signUrls, supabaseConfig } from '@/lib/supabase';

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
  const session = adminSession(jar.get(ADMIN_COOKIE)?.value);
  if (!session) {
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
  // Accounts are optional too, and only owners see them.
  let usersMissing = false;
  const users: AdminUser[] =
    session.role === 'owner'
      ? await selectRows<{
          id: string;
          email: string;
          role: 'owner' | 'editor';
          created_at: string;
          last_login_at: string | null;
        }>(cfg, 'admin_users', 'select=id,email,role,created_at,last_login_at&order=created_at.asc')
          .then((list) =>
            list.map((u) => ({
              id: u.id,
              email: u.email,
              role: u.role,
              createdAt: u.created_at,
              lastLoginAt: u.last_login_at,
            })),
          )
          .catch(() => {
            usersMissing = true;
            return [];
          })
      : [];
  // Edits of built-in places need place_overrides (db/place-overrides.sql).
  const overridesMissing = await selectRows(cfg, 'place_overrides', 'select=place_id&limit=1')
    .then(() => false)
    .catch(() => true);
  let lexiconMissing = false;
  const words: AdminWord[] = await selectRows<LexiconRow>(
    cfg,
    'lexicon_words',
    'select=*&order=created_at.asc&limit=300',
  )
    .then((list) =>
      list.map((w) => ({ id: w.id, groupId: w.group_id, latin: w.latin, ar: w.ar, meaningFr: w.meaning_fr })),
    )
    .catch(() => {
      lexiconMissing = true;
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
      tags: r.tags ?? [],
      author: r.author,
      contact: r.contact,
      category: r.category ?? defaultCategory(r.type),
      coords: guess ? `${guess[0]}, ${guess[1]}` : '',
      photos: (r.photos ?? []).map((path) => ({ path, url: (signed as Record<string, string>)[path] ?? null })),
      reviewedAt: r.reviewed_at,
      nameEn: r.name_en ?? '',
      whyEn: r.why_en ?? '',
      bestTimeEn: r.best_time_en ?? '',
      publicPhotos: (r.public_photos ?? []).map((path) => ({ path, url: publicUrl(cfg, PUBLIC_BUCKET, path) })),
    };
  });

  // Suggested road trips: optional too (db/trip-submissions.sql).
  let tripsMissing = false;
  const placeNames: Record<string, string> = {
    ...Object.fromEntries(PLACES.map((p) => [p.id, p.name])),
    ...Object.fromEntries(rows.filter((r) => r.status === 'approved').map((r) => [`c-${r.id}`, r.name])),
  };
  const trips: AdminTrip[] = await selectRows<TripRow>(
    cfg,
    'trip_submissions',
    'select=*&order=created_at.desc&limit=300',
  )
    .then((list) =>
      list.map((r) => ({
        id: r.id,
        createdAt: r.created_at,
        status: r.status,
        name: r.name,
        description: r.description,
        days: r.days,
        stops: r.stops.map((id) => placeNames[id] ?? '(lieu retiré)'),
        author: r.author,
        contact: r.contact,
        nameEn: r.name_en ?? '',
        descriptionEn: r.description_en ?? '',
      })),
    )
    .catch(() => {
      tripsMissing = true;
      return [];
    });

  return (
    <Shell>
      {failed ? (
        <Notice title="Impossible de lire les propositions">
          <p>Supabase n’a pas répondu. Réessayez dans un instant.</p>
        </Notice>
      ) : (
        <>
          <StatsBoard
            counts={[
              { label: 'Lieux du site', value: PLACES.length },
              { label: 'Lieux ajoutés', value: submissions.filter((x) => x.status === 'approved').length },
              { label: 'Événements', value: events.length },
              { label: 'Mots ajoutés', value: words.length },
            ]}
            pending={
              submissions.filter((x) => x.status === 'pending').length +
              trips.filter((x) => x.status === 'pending').length
            }
            openReports={reports.filter((x) => x.status === 'open').length}
          />
          <AdminBoard submissions={submissions} />
          <TripsBoard trips={trips} tableMissing={tripsMissing} />
          <AddPlaceForm />
          <PlaceOverridesBoard
            places={PLACES.map((p) => ({ id: p.id, name: p.name }))}
            tableMissing={overridesMissing}
          />
          <EventsBoard
            events={events}
            places={PLACES.map((p) => ({ id: p.id, name: p.name }))}
            tableMissing={eventsMissing}
          />
          <LexiconBoard
            groups={LEXICON.map((g) => ({ id: g.id, title: g.title.fr }))}
            words={words}
            tableMissing={lexiconMissing}
          />
          <ReportsBoard reports={reports} />
          {session.role === 'owner' && <UsersBoard users={users} me={session.email} tableMissing={usersMissing} />}
        </>
      )}
    </Shell>
  );
}
