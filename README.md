# Tunisia Go

An all-in-one tourism and discovery platform for Tunisia: an interactive map of
monuments, desert, beaches, crafts and food, curated road trips with route
estimates, and a location drawer that turns inspiration into bookings
(accommodation, transfers, a local guide on WhatsApp, navigation).

## Stack

- Next.js 15 (App Router), React 19, TypeScript
- Tailwind CSS 3 with a custom palette and radii (`tailwind.config.js`)
- Framer Motion for drawers, tabs and transitions
- Leaflet + react-leaflet, CARTO Voyager tiles on OpenStreetMap data
- Lucide icons

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
| `app/page.tsx` | Main layout: top bar with layer filters, Map / Split toggle, editorial feed, map, circuits panel and drawer |
| `components/InteractiveMap.tsx` | Leaflet map with category markers, glowing hover/active states, itinerary route lines and camera moves |
| `components/ActionDrawer.tsx` | Place inspector: photo carousel, story, action hub (Booking, Airbnb, transfer, WhatsApp guide, call, Google Maps, Waze) |
| `components/ItinerarySelector.tsx` | Circuit picker with stops, leg distances and driving times, and a Google Maps link for the full route |
| `components/CultureCard.tsx` | "Did you know?" snippet with read-aloud narration, plus History / Customs / Food / Best time tabs |
| `components/EditorialFeed.tsx` | Magazine-style list shown next to the map in Split mode |
| `data/tunisiaData.ts` | Mock dataset: 29 places across every region and 4 itineraries |
| `data/types.ts` | TypeScript interfaces for places, categories and itineraries |
| `lib/geo.ts` | Distance and driving-time estimates |
| `lib/links.ts` | Outbound links (affiliates, wa.me, tel:, Google Maps, Waze) |

## Mock data to replace before launch

- **Phone and WhatsApp numbers** are placeholders (`+216 00 000 000`). Set real
  numbers per place in `data/tunisiaData.ts`, or one number for all places with
  `NEXT_PUBLIC_GUIDE_WHATSAPP` and `NEXT_PUBLIC_TRANSFER_WHATSAPP`.
- **Affiliate ids** for Booking.com and Airbnb are read from
  `NEXT_PUBLIC_BOOKING_AID` and `NEXT_PUBLIC_AIRBNB_AFFILIATE`. Without them the
  buttons open plain searches for the place.
- **Photos**: each place has three captioned slides. Add a `src` to any slide in
  `data/tunisiaData.ts` to show a real photo; until then an illustrated postcard
  is drawn.
- **Driving times** are estimates (straight-line distance × 1.3 at 70 km/h).
  A routing service such as OSRM could replace them later.
