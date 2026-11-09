/**
 * Visible breadcrumb (Accueil › Lieux › Carthage). The matching BreadcrumbList JSON-LD is in
 * lib/structuredData.ts. The last item is the current page, without a link.
 */
export default function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-charcoal-300">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => (
          <li key={`${item.name}-${i}`} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden>›</span>}
            {item.href ? (
              <a href={item.href} className="underline-offset-4 transition hover:text-charcoal hover:underline">
                {item.name}
              </a>
            ) : (
              <span aria-current="page" className="text-charcoal-500">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
