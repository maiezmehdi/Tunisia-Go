# Tunisia Go

An all-in-one tourism and discovery platform for Tunisia: an interactive map of
monuments, desert, beaches, crafts and food, curated road trips with route
estimates, and a location drawer that turns inspiration into bookings
(accommodation, transfers, a local guide on WhatsApp, navigation).

## Stack

- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS 3 with a custom palette and radii (`tailwind.config.js`)
- Framer Motion for drawers, tabs and transitions
- Leaflet + react-leaflet, CARTO Positron tiles on OpenStreetMap data
- Photos from Wikimedia Commons, with author and licence credits

## Getting started

```bash
npm install
cp .env.example .env.local   # optional: affiliate ids and WhatsApp numbers
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run typecheck`.

## Project layout

| Path | What it does |
| --- | --- |
| `app/page.tsx` | Server page: loads the photos, then renders the explorer |
| `components/Explorer.tsx` | Main layout: top bar with layer filters, Map / Split toggle, editorial feed, map, road trips panel and drawer |
| `components/InteractiveMap.tsx` | Leaflet map with category markers, glowing hover/active states, itinerary route lines and camera moves |
| `components/ActionDrawer.tsx` | Place inspector: photo carousel, story, action hub (Tunisie Booking, Airbnb, transfer, WhatsApp guide, call, Google Maps, Waze) |
| `components/ItinerarySelector.tsx` | Circuit picker with stops, leg distances and driving times, and a Google Maps link for the full route |
| `components/CultureCard.tsx` | "Did you know?" snippet with read-aloud narration, plus History / Customs / Food / Best time tabs |
| `components/EditorialFeed.tsx` | Magazine-style list shown next to the map in Split mode |
| `data/tunisiaData.ts` | Mock dataset: 29 places across every region and 4 itineraries |
| `data/types.ts` | TypeScript interfaces for places, categories and itineraries |
| `lib/geo.ts` | Distance and driving-time estimates |
| `lib/links.ts` | Outbound links (affiliates, wa.me, tel:, Google Maps, Waze) |
| `lib/photos.ts` | Fetches up to 4 photos per place from the Wikipedia article named in `wiki`, refreshed daily |
| `data/seasons.ts` | Best months per place (best / fine / better avoided), used by the month filter and the "When to go" strip |
| `app/pratique/page.tsx` | "Logistique & Pratique": 4x4 rental, driving, money, SIM cards, health, customs |
| `app/spot-secret/page.tsx`, `app/api/spot-secret/route.ts` | "Ajouter un spot secret" form and the route that forwards suggestions |
| `public/sw.js`, `lib/offline.ts`, `lib/tiles.ts` | Offline mode: service worker, and saving a road trip's map tiles and photos |

## Mock data to replace before launch

- **Phone numbers**: the « Appeler le lieu » row only shows for a place with a real
  `contact.phone` in `data/tunisiaData.ts`. The guide row only shows when a guide or agency
  is published for the place's region (`/api/pros-regions`).
- **Stays**: the « Tunisie Booking » button opens https://tn.tunisiebooking.com/. The
  Airbnb affiliate id is read from `NEXT_PUBLIC_AIRBNB_AFFILIATE`; without it the
  button opens a plain search for the place.
- **Map key**: set `NEXT_PUBLIC_CARTO_API_KEY` (in Vercel: Settings → Environment
  Variables, then redeploy). Without it CARTO shows an "API key required" watermark.
- **Photos** come from the English Wikipedia article in each place's `wiki` field.
  Change that title to get different photos. A place with no usable photo shows a
  plain panel with its caption.
- **Secret spot suggestions** go to `SECRET_SPOT_WEBHOOK_URL` (a Slack, Discord,
  Make or Zapier webhook). Without it, the form opens WhatsApp with the
  suggestion already written, sent to the guide number.
- **Driving times** are estimates (straight-line distance × 1.3 at 70 km/h).
  A routing service such as OSRM could replace them later.

## Offline mode

The app is installable (manifest in `app/manifest.ts`) and registers `public/sw.js`
in production builds. Pages and scripts are cached as they are visited. In the
road trips panel, "Save for offline use" downloads the map tiles along the route
(zooms 5 to 14 around the stops), the photos of every stop and the app itself, so
the trip stays usable where the network drops. Bump `VERSION` in `public/sw.js`
when the cache layout changes.

## Languages

The site is in French (default) and English. Pages live under `app/[lang]/`, but
URLs carry no prefix: `middleware.ts` rewrites each request to `/fr/...` or
`/en/...` from the `tg-lang` cookie, or from the browser language on a first
visit. The FR · EN switch in each header sets that cookie. A link to
`/en/explore` (or `/fr/...`) switches the language and redirects to `/explore`.

- Map interface strings: `lib/i18n/ui.ts`.
- Places, road trips and categories: English in `data/tunisiaData.ts`, French in
  `data/i18n/` (merged by `lib/i18n/catalog.ts`). A new place needs an entry in
  `data/i18n/places.fr.a.ts` or `places.fr.b.ts`, otherwise it shows in English.
- Landing, Pratique and Spot secret keep their copy next to the page, per language.
