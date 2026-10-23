import type { CategoryId } from '@/data/types';
import { CATEGORY_GLYPHS } from '@/lib/categoryGlyphs';

/** The category's small line icon, when it has one (camping, cycling). Decorative: the label is next to it. */
export default function CategoryGlyph({
  category,
  className = 'h-3.5 w-3.5',
}: {
  category: CategoryId;
  className?: string;
}) {
  const inner = CATEGORY_GLYPHS[category];
  if (!inner) return null;
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}
