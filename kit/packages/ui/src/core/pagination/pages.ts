/**
 * Page numbers to show, null for a gap. Once there are more pages than `2 * siblings + 5`, it is always that many
 * slots, so the buttons never shift as the page changes, and a gap always hides at least two pages.
 */
export function pageItems(page: number, count: number, siblings = 1): (number | null)[] {
  const slots = 2 * siblings + 5;
  const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  if (count <= slots) return range(1, count);
  const p = Math.min(Math.max(page, 1), count);
  if (p <= siblings + 3) return [...range(1, slots - 2), null, count];
  if (p >= count - siblings - 2) return [1, null, ...range(count - slots + 3, count)];
  return [1, null, ...range(p - siblings, p + siblings), null, count];
}

/** The page that still holds the first row of `page` once the page size changes. */
export const pageForResize = (page: number, from: number, to: number) => Math.floor(((page - 1) * from) / to) + 1;
