/** Structured data for search engines (schema.org JSON-LD). */
export default function JsonLd({ data }: { data: unknown }) {
  // Escape "<" so no text in the data can close the script tag.
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
