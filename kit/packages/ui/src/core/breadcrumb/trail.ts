/**
 * Which crumbs to show: all of them when they fit in `max`, otherwise the first one, a gap (null), then the last
 * `max - 1` (the current page and its nearest parents matter most). `max` below 2 is treated as 2.
 */
export function visibleCrumbs(count: number, max: number): (number | null)[] {
  const all = Array.from({ length: count }, (_, i) => i);
  const keep = Math.max(2, max);
  if (count <= keep) return all;
  return [0, null, ...all.slice(count - (keep - 1))];
}
