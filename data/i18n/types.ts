import type { CultureInsights } from '@/data/types';

/**
 * French text for one place. Every field mirrors the English one in
 * data/tunisiaData.ts. `name` and `region` are only set when they differ
 * in French (e.g. "Amphithéâtre d'El Jem").
 */
export interface PlaceTextFr {
  name?: string;
  region?: string;
  tagline: string;
  description: string;
  didYouKnow: string;
  insights: CultureInsights;
  visitDuration: string;
  /** Same order and count as `images` in the English data */
  captions: string[];
}
