// Pure size maths behind Splitter; no DOM, so split.check.ts can run it in node.

/** A number is px, a string like '30%' is a share of the space the panels split. */
export type PanelSize = number | `${number}%`;
export type PanelLimits = { min?: PanelSize; max?: PanelSize; collapsible?: boolean };

export function toPx(v: PanelSize | undefined, avail: number, fallback: number) {
  return v === undefined ? fallback : typeof v === 'number' ? v : (parseFloat(v) / 100) * avail;
}

/** Starting fractions of `avail`: panels with a defaultSize get it, the others share what is left equally. */
export function initialFractions(defaults: (PanelSize | undefined)[], avail: number): number[] {
  if (avail <= 0) return defaults.map(() => 1 / defaults.length);
  const fixed = defaults.map(d => (d === undefined ? null : toPx(d, avail, 0)));
  const free = fixed.filter(v => v === null).length;
  const rest = Math.max(0, avail - fixed.reduce<number>((s, v) => s + (v ?? 0), 0));
  return fixed.map(v => (v ?? rest / free) / avail);
}

/**
 * New px size of panel A when the handle between A (size a) and B (size b) is asked to put A at `to`.
 * Only A and B change, so their total is kept. Each side's min/max holds; with `snap`, a collapsible panel dragged
 * under half its min closes to 0.
 */
export function moveHandle(a: number, b: number, to: number, avail: number, A: PanelLimits, B: PanelLimits, snap = true) {
  const total = a + b;
  const minA = toPx(A.min, avail, 0), minB = toPx(B.min, avail, 0);
  if (snap && A.collapsible && to < minA / 2) return 0;
  if (snap && B.collapsible && total - to < minB / 2) return total;
  const lo = Math.max(minA, total - toPx(B.max, avail, Infinity));
  const hi = Math.min(toPx(A.max, avail, Infinity), total - minB);
  return Math.min(hi, Math.max(lo, to));
}
