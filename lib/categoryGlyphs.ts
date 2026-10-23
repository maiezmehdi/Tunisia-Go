import type { CategoryId } from '@/data/types';

/**
 * Small line icons (24 x 24 grid, stroke only) for the categories that stand out on the map.
 * The others stay plain dots. Shared by the map pins and the filter pills.
 */
export const CATEGORY_GLYPHS: Partial<Record<CategoryId, string>> = {
  camping: '<path d="M3.5 21 14 3"/><path d="M20.5 21 10 3"/><path d="M15.5 21 12 15l-3.5 6"/><path d="M2 21h20"/>',
  cycling:
    '<circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>',
};

/** An inline SVG string for the map pins (Leaflet takes HTML). */
export function glyphSvg(category: CategoryId): string {
  const inner = CATEGORY_GLYPHS[category];
  return inner
    ? `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`
    : '';
}
