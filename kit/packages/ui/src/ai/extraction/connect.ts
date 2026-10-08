/** Pure geometry for FieldLink: the curve between a field and its box. */
export type Pt = [number, number];
export type Rect = { left: number; right: number; top: number; bottom: number };

/**
 * A curve from a field to its box, leaving each from the sides that face each other: sideways when they sit side by
 * side, up or down when stacked (a phone layout). Null when they overlap, since no line can join them readably.
 */
export function connect(f: Rect, b: Rect): { d: string; from: Pt; to: Pt } | null {
  const cy = (r: Rect) => (r.top + r.bottom) / 2, cx = (r: Rect) => (r.left + r.right) / 2;
  let from: Pt, to: Pt, horizontal: boolean;
  if (f.left >= b.right) [from, to, horizontal] = [[f.left, cy(f)], [b.right, cy(b)], true];
  else if (f.right <= b.left) [from, to, horizontal] = [[f.right, cy(f)], [b.left, cy(b)], true];
  else if (f.top >= b.bottom) [from, to, horizontal] = [[cx(f), f.top], [cx(b), b.bottom], false];
  else if (f.bottom <= b.top) [from, to, horizontal] = [[cx(f), f.bottom], [cx(b), b.top], false];
  else return null;
  const i = horizontal ? 0 : 1, k = Math.max(24, Math.abs(to[i] - from[i]) / 2) * Math.sign(to[i] - from[i]);
  const c1: Pt = horizontal ? [from[0] + k, from[1]] : [from[0], from[1] + k];
  const c2: Pt = horizontal ? [to[0] - k, to[1]] : [to[0], to[1] - k];
  const p = (q: Pt) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
  return { d: `M${p(from)}C${p(c1)} ${p(c2)} ${p(to)}`, from, to };
}
