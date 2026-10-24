export type CategoryId = 'heritage' | 'sahara' | 'beach' | 'culture' | 'culinary' | 'souk' | 'camping' | 'cycling';

export interface Category {
  id: CategoryId;
  label: string;
  /** Short label for the filter pills */
  short: string;
}

export type LatLng = [number, number];

/** Caption for a placeholder slide, shown when no photo could be loaded. */
export interface PlaceImage {
  caption: string;
}

/** A real photo, loaded from Wikimedia Commons with its credit. */
export interface Photo {
  src: string;
  width?: number;
  height?: number;
  title: string;
  author: string;
  license: string;
  sourceUrl: string;
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
  /** English Wikipedia article used to find photos */
  wiki?: string;
  /** French Wikipedia article, tried when the English one has fewer than two photos */
  wikiFr?: string;
  /** Wikimedia Commons search used as a last resort (default: name and town) */
  photoSearch?: string;
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
  /** Set on places suggested by visitors and approved on the moderation page. */
  community?: { author: string | null; /** Visitor keywords, already in the page language. */ tags?: string[] };
}

export interface Itinerary {
  id: string;
  name: string;
  tagline: string;
  description: string;
  days: number;
  /** Ordered place ids */
  stops: string[];
  /** Set on road trips suggested by visitors and approved on the moderation page. */
  community?: { author: string | null };
  /** Public photo URLs of an approved visitor trip. */
  photos?: string[];
}
