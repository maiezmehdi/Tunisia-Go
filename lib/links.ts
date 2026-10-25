import type { Place } from '@/data/types';

/**
 * Outbound links for the Action Hub.
 * Affiliate ids and the guide's WhatsApp number come from env variables so
 * they can be set per deployment without touching the code.
 */

const BOOKING_AID = process.env.NEXT_PUBLIC_BOOKING_AID ?? '';
const AIRBNB_AFFILIATE = process.env.NEXT_PUBLIC_AIRBNB_AFFILIATE ?? '';
const GUIDE_WHATSAPP = process.env.NEXT_PUBLIC_GUIDE_WHATSAPP ?? '';
const TRANSFER_WHATSAPP = process.env.NEXT_PUBLIC_TRANSFER_WHATSAPP ?? '';

function withParams(base: string, params: Record<string, string>): string {
  const url = new URL(base);
  for (const [k, v] of Object.entries(params)) if (v) url.searchParams.set(k, v);
  return url.toString();
}

export function bookingUrl(place: Place): string {
  return withParams('https://www.booking.com/searchresults.html', {
    ss: place.stayQuery,
    aid: BOOKING_AID,
    label: `tunisiago-${place.id}`,
  });
}

export function airbnbUrl(place: Place): string {
  const slug = place.stayQuery.replace(/,\s*/g, '--').replace(/\s+/g, '-');
  return withParams(`https://www.airbnb.com/s/${encodeURIComponent(slug)}/homes`, {
    af: AIRBNB_AFFILIATE,
    c: AIRBNB_AFFILIATE ? `tunisiago-${place.id}` : '',
  });
}

function waLink(number: string, text: string): string {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

// A link is only built from a real number: without one the button shows « Disponible bientôt ».
export function guideWhatsAppUrl(place: Place): string | null {
  const number = GUIDE_WHATSAPP || place.contact.whatsapp || '';
  if (!number) return null;
  const greeting = place.contact.guideName ? `Bonjour ${place.contact.guideName}` : 'Bonjour';
  return waLink(
    number,
    `${greeting}, je prépare une visite de ${place.name} (${place.region}) via Tunisia Go. Êtes-vous disponible pour une visite guidée ?`,
  );
}

export function transferWhatsAppUrl(place: Place): string | null {
  const number = TRANSFER_WHATSAPP || GUIDE_WHATSAPP || place.contact.whatsapp || '';
  if (!number) return null;
  return waLink(
    number,
    `Bonjour, je souhaite réserver un transfert vers ${place.name} (${place.region}). Date : … · Départ : … · Passagers : …`,
  );
}

/** The venue's own number, else the guide line (a WhatsApp number is also a phone number). */
export function phoneUrl(place: Place): string | null {
  if (place.contact.phone) return `tel:${place.contact.phone}`;
  const digits = GUIDE_WHATSAPP.replace(/\D/g, '');
  return digits ? `tel:+${digits}` : null;
}

export function googleMapsUrl(place: Place): string {
  const [lat, lng] = place.coords;
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function wazeUrl(place: Place): string {
  const [lat, lng] = place.coords;
  return `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
}

/** Full itinerary in Google Maps directions (origin, waypoints, destination). */
export function googleMapsRouteUrl(places: Place[]): string {
  const pts = places.map((p) => p.coords.join(','));
  const origin = pts[0];
  const destination = pts[pts.length - 1];
  const waypoints = pts.slice(1, -1).join('|');
  return withParams('https://www.google.com/maps/dir/', {
    api: '1',
    origin,
    destination,
    waypoints,
    travelmode: 'driving',
  });
}

/** 4x4 with a driver for the desert pistes, through the transfer partner. */
export function rental4x4WhatsAppUrl(): string | null {
  const number = TRANSFER_WHATSAPP || GUIDE_WHATSAPP;
  if (!number) return null;
  return waLink(
    number,
    'Bonjour, je cherche un 4x4 pour le Sud (Tozeur, Douz, Ksar Ghilane). Avec ou sans chauffeur : … · Dates : … · Passagers : …',
  );
}

/** Fallback when no webhook is configured: the suggestion goes to the team over WhatsApp. */
export function secretSpotWhatsAppUrl(text: string): string | null {
  const number = GUIDE_WHATSAPP || TRANSFER_WHATSAPP;
  return number ? waLink(number, text) : null;
}

/** A guide's or agency's own WhatsApp number (digits with country code), as they registered it. */
export function proWhatsAppUrl(number: string, name: string, locale: 'fr' | 'en'): string | null {
  if (!/^\d{8,15}$/.test(number)) return null;
  return waLink(
    number,
    locale === 'fr'
      ? `Bonjour ${name}, je vous écris depuis Tunisia Go pour préparer un voyage en Tunisie.`
      : `Hello ${name}, I am writing from Tunisia Go to plan a trip to Tunisia.`,
  );
}
