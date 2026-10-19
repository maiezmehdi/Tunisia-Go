export type CategoryId = 'heritage' | 'sahara' | 'beach' | 'culture' | 'culinary';

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  /** Marker fill colour */
  color: string;
  /** Soft tag background */
  tint: string;
}

export type LatLng = [number, number];

export interface PlaceImage {
  /** Optional photo URL. When missing or broken, an illustrated postcard is shown. */
  src?: string;
  caption: string;
  /** Gradient used for the illustrated fallback, as two CSS colours */
  palette: [string, string];
}

export interface CultureInsights {
  history: string;
  customs: string;
  food: string;
  bestTime: string;
}

export interface PlaceContact {
  /** E.164 phone number for the venue or provider (mock data) */
  phone?: string;
  /** Digits only, used for wa.me links (mock data) */
  whatsapp?: string;
  guideName?: string;
}

export interface Place {
  id: string;
  name: string;
  nameAr?: string;
  region: string;
  /** City or area used for accommodation searches */
  stayQuery: string;
  category: CategoryId;
  coords: LatLng;
  unesco?: boolean;
  tagline: string;
  description: string;
  didYouKnow: string;
  insights: CultureInsights;
  visitDuration: string;
  images: PlaceImage[];
  contact: PlaceContact;
}

export interface Itinerary {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  days: number;
  /** Ordered place ids */
  stops: string[];
  color: string;
}
