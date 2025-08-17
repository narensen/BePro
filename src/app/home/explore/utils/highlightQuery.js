export function highlightQuery(text, query) {
  if (!query) return text;

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-gray-300 text-black font-semibold rounded px-1">
        {part}
      </mark>
    ) : (
      part
    )
  );
}