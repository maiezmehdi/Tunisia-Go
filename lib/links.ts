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

export function guideWhatsAppUrl(place: Place): string {
  const number = GUIDE_WHATSAPP || place.contact.whatsapp || '';
  const greeting = place.contact.guideName ? `Bonjour ${place.contact.guideName}` : 'Bonjour';
  return waLink(
    number,
    `${greeting}, je prépare une visite de ${place.name} (${place.region}) via Tunisia Go. Êtes-vous disponible pour une visite guidée ?`,
  );
}

export function transferWhatsAppUrl(place: Place): string {
  const number = TRANSFER_WHATSAPP || GUIDE_WHATSAPP || place.contact.whatsapp || '';
  return waLink(
    number,
    `Bonjour, je souhaite réserver un transfert vers ${place.name} (${place.region}). Date : … · Départ : … · Passagers : …`,
  );
}

export function phoneUrl(place: Place): string | null {
  return place.contact.phone ? `tel:${place.contact.phone}` : null;
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
export function rental4x4WhatsAppUrl(): string {
  return waLink(
    TRANSFER_WHATSAPP || GUIDE_WHATSAPP || '21600000000',
    'Bonjour, je cherche un 4x4 pour le Sud (Tozeur, Douz, Ksar Ghilane). Avec ou sans chauffeur : … · Dates : … · Passagers : …',
  );
}

/** Fallback when no webhook is configured: the suggestion goes to the team over WhatsApp. */
export function secretSpotWhatsAppUrl(text: string): string {
  return waLink(GUIDE_WHATSAPP || TRANSFER_WHATSAPP || '21600000000', text);
}
