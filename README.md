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
| `components/ActionDrawer.tsx` | Place inspector: photo carousel, story, action hub (Booking, Airbnb, transfer, WhatsApp guide, call, Google Maps, Waze) |
| `components/ItinerarySelector.tsx` | Circuit picker with stops, leg distances and driving times, and a Google Maps link for the full route |
| `components/CultureCard.tsx` | "Did you know?" snippet with read-aloud narration, plus History / Customs / Food / Best time tabs |
| `components/EditorialFeed.tsx` | Magazine-style list shown next to the map in Split mode |
| `data/tunisiaData.ts` | Mock dataset: 29 places across every region and 4 itineraries |
| `data/types.ts` | TypeScript interfaces for places, categories and itineraries |
| `lib/geo.ts` | Distance and driving-time estimates |
| `lib/links.ts` | Outbound links (affiliates, wa.me, tel:, Google Maps, Waze) |
| `lib/photos.ts` | Fetches up to 4 photos per place from the Wikipedia article named in `wiki`, refreshed daily |

## Mock data to replace before launch

- **Phone and WhatsApp numbers** are placeholders (`+216 00 000 000`). Set real
  numbers per place in `data/tunisiaData.ts`, or one number for all places with
  `NEXT_PUBLIC_GUIDE_WHATSAPP` and `NEXT_PUBLIC_TRANSFER_WHATSAPP`.
- **Affiliate ids** for Booking.com and Airbnb are read from
  `NEXT_PUBLIC_BOOKING_AID` and `NEXT_PUBLIC_AIRBNB_AFFILIATE`. Without them the
  buttons open plain searches for the place.
- **Map key**: set `NEXT_PUBLIC_CARTO_API_KEY` (in Vercel: Settings → Environment
  Variables, then redeploy). Without it CARTO shows an "API key required" watermark.
- **Photos** come from the English Wikipedia article in each place's `wiki` field.
  Change that title to get different photos. A place with no usable photo shows a
  plain panel with its caption.
- **Driving times** are estimates (straight-line distance × 1.3 at 70 km/h).
  A routing service such as OSRM could replace them later.
