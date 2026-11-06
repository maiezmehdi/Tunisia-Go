import type { Metadata } from "next";
import { cookies } from "next/headers";

import BrandLogo from "@/components/BrandLogo";
import AddPlaceForm from "@/components/admin/AddPlaceForm";
import AdminBoard, {
  type AdminSubmission,
} from "@/components/admin/AdminBoard";
import UsersBoard, { type AdminUser } from "@/components/admin/UsersBoard";
import AdminShell, { type AdminGroup } from "@/components/admin/AdminShell";
import AdminLogin from "@/components/admin/AdminLogin";
import EventsBoard, { type AdminEvent } from "@/components/admin/EventsBoard";
import PlaceOverridesBoard from "@/components/admin/PlaceOverridesBoard";
import LexiconBoard, { type AdminWord } from "@/components/admin/LexiconBoard";
import StatsBoard from "@/components/admin/StatsBoard";
import TripsBoard, { type AdminTrip } from "@/components/admin/TripsBoard";
import type { TripRow } from "@/lib/tripSuggest";
import PartnersBoard, {
  type AdminPartner,
} from "@/components/admin/PartnersBoard";
import ProsBoard, { type AdminPro } from "@/components/admin/ProsBoard";
import ClicksBoard, { type AdminClick } from "@/components/admin/ClicksBoard";
import RatingsBoard, {
  type AdminRating,
} from "@/components/admin/RatingsBoard";
import ReportsBoard, {
  type AdminReport,
} from "@/components/admin/ReportsBoard";
import { ADMIN_COOKIE, adminConfigured, adminSession } from "@/lib/adminAuth";
import {
  PRIVATE_BUCKET,
  PUBLIC_BUCKET,
  defaultCategory,
  parseCoords,
  type SubmissionRow,
} from "@/lib/community";
import { LEXICON } from "@/data/lexicon";
import type { LexiconRow } from "@/lib/lexiconExtra";
import { PLACES } from "@/data/tunisiaData";
import type { EventRow } from "@/lib/events";
import { PARTNER_TYPES } from "@/lib/partners";
import { PRO_ACTIVITIES, PRO_LANGUAGES } from "@/lib/pros";
import { loadRatingStatsFresh, type RatingStat } from "@/lib/ratings";
import {
  publicUrl,
  selectRows,
  signUrls,
  supabaseConfig,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Modération · Tunisia Go",
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

function Notice({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-xl rounded-3xl border border-sand-200 bg-sand-50 p-6">
      <h1 className="font-serif text-2xl text-charcoal">{title}</h1>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-charcoal-700">
        {children}
      </div>
    </div>
  );
}

export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <Shell>
        <Notice title="Page pas encore activée">
          <p>
            Ajoutez la variable{" "}
            <code className="rounded bg-sand-100 px-1">ADMIN_PASSWORD</code>{" "}
            dans Vercel (8 caractères minimum), puis redéployez.
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
            Ajoutez{" "}
            <code className="rounded bg-sand-100 px-1">SUPABASE_URL</code> et{" "}
            <code className="rounded bg-sand-100 px-1">
              SUPABASE_SECRET_KEY
            </code>{" "}
            dans Vercel, puis redéployez.
          </p>
        </Notice>
      </Shell>
    );
  }

  let rows: SubmissionRow[] = [];
  let failed = false;
  try {
    rows = await selectRows<SubmissionRow>(
      cfg,
      "spot_submissions",
      "select=*&order=created_at.desc&limit=300",
    );
  } catch (error) {
    console.error("admin: list", error);
    failed = true;
  }
  // Reports are optional: without the table (db/place-reports.sql) the section just stays empty.
  const reports: AdminReport[] = await selectRows<{
    id: string;
    created_at: string;
    status: "open" | "done";
    place_id: string;
    place_name: string | null;
    message: string;
    contact: string | null;
  }>(cfg, "place_reports", "select=*&order=created_at.desc&limit=200")
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
  // Ratings are optional too: without the table (db/place-ratings.sql) the section says how to create it.
  let ratingsMissing = false;
  const ratingStats = await loadRatingStatsFresh().catch(
    (): Record<string, RatingStat> => {
      ratingsMissing = true;
      return {};
    },
  );
  const ratings: AdminRating[] = PLACES.map((p) => ({
    placeId: p.id,
    name: p.name,
    average: ratingStats[p.id]?.average ?? null,
    votes: ratingStats[p.id]?.votes ?? 0,
  }));
  // Clicks on outside links: optional too (db/link-clicks.sql).
  let clicksMissing = false;
  const clickFrom = new Date(Date.now() - 89 * 86400000)
    .toISOString()
    .slice(0, 10);
  const clicks: AdminClick[] = await selectRows<{
    day: string;
    kind: string;
    page: string;
    place_id: string;
    clicks: number;
  }>(
    cfg,
    "link_clicks",
    `select=day,kind,page,place_id,clicks&day=gte.${clickFrom}&limit=20000`,
  )
    .then((rows) =>
      rows.map((r) => ({
        day: r.day,
        kind: r.kind,
        page: r.page,
        place: r.place_id,
        clicks: r.clicks,
      })),
    )
    .catch(() => {
      clicksMissing = true;
      return [];
    });
  // Guides and agencies are optional too: without db/pros.sql the section says how to create the tables.
  let prosMissing = false;
  const proReports = await selectRows<{ listing_id: string }>(
    cfg,
    "pro_reports",
    "select=listing_id&limit=5000",
  ).catch(() => []);
  const pros: AdminPro[] = await selectRows<{
    id: string;
    created_at: string;
    status: AdminPro["status"];
    kind: AdminPro["kind"];
    name: string;
    whatsapp: string;
    card_number: string | null;
    socials: string | null;
    facebook: string | null;
    instagram: string | null;
    tiktok: string | null;
    auto_published: boolean;
    bio: string | null;
    experience: string | null;
    languages: string[] | null;
    activities: string[] | null;
    price_note: string | null;
    place_id: string | null;
    photo_path: string | null;
  }>(cfg, "pro_listings", "select=*&order=created_at.desc&limit=500")
    .then((list) =>
      list.map((r) => ({
        id: r.id,
        createdAt: r.created_at,
        status: r.status,
        kind: r.kind,
        name: r.name,
        whatsapp: r.whatsapp,
        card: r.card_number,
        socials: r.socials,
        networks: [r.facebook, r.instagram, r.tiktok].filter(
          (x): x is string => !!x,
        ),
        autoPublished: r.auto_published,
        reports: proReports.filter((x) => x.listing_id === r.id).length,
        bio: r.bio,
        experience: r.experience,
        details: [
          ...(r.languages ?? []).map(
            (id) => PRO_LANGUAGES.find((l) => l.id === id)?.fr ?? id,
          ),
          ...(r.activities ?? []).map(
            (id) => PRO_ACTIVITIES.find((a) => a.id === id)?.fr ?? id,
          ),
          ...(r.price_note ? [r.price_note] : []),
        ].join(" · "),
        placeName: r.place_id
          ? (PLACES.find((pl) => pl.id === r.place_id)?.name ?? null)
          : null,
        photoUrl: r.photo_path
          ? publicUrl(cfg, "pro-photos", r.photo_path)
          : null,
      })),
    )
    .catch(() => {
      prosMissing = true;
      return [];
    });
  // Partners (hotels, guesthouses…): same idea, with db/partners.sql.
  let partnersMissing = false;
  const partners: AdminPartner[] = await selectRows<{
    id: string;
    created_at: string;
    status: AdminPartner["status"];
    partner_type: string;
    name: string;
    place_id: string | null;
    photo_path: string | null;
    description: string | null;
    whatsapp: string | null;
    website: string | null;
  }>(cfg, "partner_listings", "select=*&order=updated_at.desc&limit=500")
    .then((list) =>
      list.map((r) => ({
        id: r.id,
        createdAt: r.created_at,
        status: r.status,
        typeLabel:
          PARTNER_TYPES.find((t) => t.id === r.partner_type)?.fr ??
          r.partner_type,
        name: r.name,
        placeName: r.place_id
          ? (PLACES.find((pl) => pl.id === r.place_id)?.name ?? null)
          : null,
        description: r.description,
        whatsapp: r.whatsapp,
        website: r.website,
        photoUrl: r.photo_path
          ? publicUrl(cfg, "pro-photos", r.photo_path)
          : null,
      })),
    )
    .catch(() => {
      partnersMissing = true;
      return [];
    });
  // Events are optional too: without the table (db/events.sql) the admin shows how to create it.
  let eventsMissing = false;
  const events: AdminEvent[] = await selectRows<EventRow>(
    cfg,
    "events",
    "select=*&order=sort.asc,created_at.asc&limit=300",
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
        startDate: r.start_date ?? "",
        endDate: r.end_date ?? "",
        ticketUrl: r.ticket_url ?? "",
        infoUrl: r.info_url ?? "",
        proposed: r.proposed === true,
        contact: r.contact ?? "",
      })),
    )
    .catch(() => {
      eventsMissing = true;
      return [];
    });
  // Accounts are optional too, and only owners see them.
  let usersMissing = false;
  const users: AdminUser[] =
    session.role === "owner"
      ? await selectRows<{
          id: string;
          email: string;
          role: "owner" | "editor";
          created_at: string;
          last_login_at: string | null;
        }>(
          cfg,
          "admin_users",
          "select=id,email,role,created_at,last_login_at&order=created_at.asc",
        )
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
  const overridesMissing = await selectRows(
    cfg,
    "place_overrides",
    "select=place_id&limit=1",
  )
    .then(() => false)
    .catch(() => true);
  let lexiconMissing = false;
  const words: AdminWord[] = await selectRows<LexiconRow>(
    cfg,
    "lexicon_words",
    "select=*&order=created_at.asc&limit=300",
  )
    .then((list) =>
      list.map((w) => ({
        id: w.id,
        groupId: w.group_id,
        latin: w.latin,
        ar: w.ar,
        meaningFr: w.meaning_fr,
      })),
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
    const guess =
      r.lat !== null && r.lng !== null
        ? ([r.lat, r.lng] as [number, number])
        : parseCoords(r.location);
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
      coords: guess ? `${guess[0]}, ${guess[1]}` : "",
      photos: (r.photos ?? []).map((path) => ({
        path,
        url: (signed as Record<string, string>)[path] ?? null,
      })),
      reviewedAt: r.reviewed_at,
      nameEn: r.name_en ?? "",
      whyEn: r.why_en ?? "",
      bestTimeEn: r.best_time_en ?? "",
      publicPhotos: (r.public_photos ?? []).map((path) => ({
        path,
        url: publicUrl(cfg, PUBLIC_BUCKET, path),
      })),
    };
  });

  // Suggested road trips: optional too (db/trip-submissions.sql).
  let tripsMissing = false;
  const placeNames: Record<string, string> = {
    ...Object.fromEntries(PLACES.map((p) => [p.id, p.name])),
    ...Object.fromEntries(
      rows
        .filter((r) => r.status === "approved")
        .map((r) => [`c-${r.id}`, r.name]),
    ),
  };
  const tripRows: TripRow[] = await selectRows<TripRow>(
    cfg,
    "trip_submissions",
    "select=*&order=created_at.desc&limit=300",
  ).catch(() => {
    tripsMissing = true;
    return [];
  });
  const tripPhotoUrls = await signUrls(
    cfg,
    PRIVATE_BUCKET,
    tripRows.flatMap((r) => r.photos ?? []),
  ).catch(() => ({}) as Record<string, string>);
  const trips: AdminTrip[] = tripRows.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    status: r.status,
    name: r.name,
    description: r.description,
    days: r.days,
    stops: r.stops.map((id) => placeNames[id] ?? "(lieu retiré)"),
    author: r.author,
    contact: r.contact,
    nameEn: r.name_en ?? "",
    descriptionEn: r.description_en ?? "",
    photos: (r.photos ?? []).map((path) => ({
      path,
      url: tripPhotoUrls[path] ?? null,
    })),
    publicPhotos: r.public_photos ?? [],
  }));

  if (failed) {
    return (
      <Shell>
        <Notice title="Impossible de lire les propositions">
          <p>Supabase n’a pas répondu. Réessayez dans un instant.</p>
        </Notice>
      </Shell>
    );
  }

  const placeList = PLACES.map((p) => ({ id: p.id, name: p.name }));
  const count = (list: { status: string }[]) =>
    list.filter((x) => x.status === "pending").length;
  const pendingSubs = count(submissions);
  const pendingTrips = count(trips);
  const openReports = reports.filter((x) => x.status === "open").length;

  const groups: AdminGroup[] = [
    {
      title: "Tableau de bord",
      sections: [
        {
          id: "accueil",
          label: "Vue d’ensemble",
          content: (
            <StatsBoard
              counts={[
                { label: "Lieux du site", value: PLACES.length },
                {
                  label: "Lieux ajoutés",
                  value: submissions.filter((x) => x.status === "approved")
                    .length,
                },
                { label: "Événements", value: events.length },
                { label: "Mots ajoutés", value: words.length },
              ]}
              pending={pendingSubs + pendingTrips}
              openReports={openReports}
            />
          ),
        },
      ],
    },
    {
      title: "À modérer",
      sections: [
        {
          id: "propositions",
          label: "Lieux proposés",
          badge: pendingSubs,
          content: <AdminBoard submissions={submissions} />,
        },
        {
          id: "trips",
          label: "Trips proposés",
          badge: pendingTrips,
          content: <TripsBoard trips={trips} tableMissing={tripsMissing} />,
        },
        {
          id: "signalements",
          label: "Signalements",
          badge: openReports,
          content: <ReportsBoard reports={reports} />,
        },
      ],
    },
    {
      title: "Contenu du site",
      sections: [
        { id: "ajouter", label: "Ajouter un lieu", content: <AddPlaceForm /> },
        {
          id: "lieux",
          label: "Lieux du site",
          content: (
            <PlaceOverridesBoard
              places={placeList}
              tableMissing={overridesMissing}
            />
          ),
        },
        {
          id: "evenements",
          label: "Événements",
          content: (
            <EventsBoard
              events={events}
              places={placeList}
              tableMissing={eventsMissing}
            />
          ),
        },
        {
          id: "mots",
          label: "Mots du cru",
          content: (
            <LexiconBoard
              groups={LEXICON.map((g) => ({ id: g.id, title: g.title.fr }))}
              words={words}
              tableMissing={lexiconMissing}
            />
          ),
        },
      ],
    },
    {
      title: "Communauté",
      sections: [
        {
          id: "guides",
          label: "Guides et agences",
          badge: count(pros),
          content: <ProsBoard pros={pros} tableMissing={prosMissing} />,
        },
        {
          id: "partenaires",
          label: "Partenaires",
          badge: count(partners),
          content: (
            <PartnersBoard partners={partners} tableMissing={partnersMissing} />
          ),
        },
        {
          id: "clics",
          label: "Clics sur les liens",
          content: (
            <ClicksBoard
              clicks={clicks}
              placeNames={placeNames}
              tableMissing={clicksMissing}
            />
          ),
        },
        {
          id: "avis",
          label: "Avis (étoiles)",
          content: (
            <RatingsBoard ratings={ratings} tableMissing={ratingsMissing} />
          ),
        },
        ...(session.role === "owner"
          ? [
              {
                id: "comptes",
                label: "Comptes admin",
                content: (
                  <UsersBoard
                    users={users}
                    me={session.email}
                    tableMissing={usersMissing}
                  />
                ),
              },
            ]
          : []),
      ],
    },
  ];

  return <AdminShell groups={groups} />;
}
