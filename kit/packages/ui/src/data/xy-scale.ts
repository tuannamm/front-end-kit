/** Pure geometry for LineChart and AreaChart: a readable value scale, and SVG paths through points with gaps. */
export type Pt = [number, number];
type Seg = [Pt, Pt, Pt, Pt]; // from, control 1, control 2, to

/**
 * Gridline values over [lo, hi] in steps of 1, 2, 2.5 or 5 × 10ⁿ, about `count` of them, so labels land on round
 * numbers. A given `min`/`max` is kept as is; the other end is rounded outwards to a step.
 */
export function niceScale(lo: number, hi: number, { min, max, count = 4 }: { min?: number; max?: number; count?: number } = {}) {
  const a = min ?? lo, b = max ?? hi;
  const span = b > a ? b - a : Math.abs(a) || 1;
  const raw = span / count, mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw * (1 - 1e-9))!;
  const from = min ?? Math.floor(a / step + 1e-9) * step;
  const to = max ?? (b > a ? Math.ceil(b / step - 1e-9) * step : from + step * count);
  const ticks: number[] = [];
  for (let k = Math.ceil(from / step - 1e-9); k * step <= to + step * 1e-9; k++) ticks.push(+(k * step).toPrecision(12));
  return { min: from, max: to, step, ticks };
}

/** Index runs of consecutive non-null values: [3, null, 4, 5] → [[0], [2, 3]]. */
export function runs(values: readonly (number | null)[]) {
  const out: number[][] = [];
  values.forEach((v, i) => {
    if (v === null) return;
    const last = out[out.length - 1];
    if (last && last[last.length - 1] === i - 1) last.push(i); else out.push([i]);
  });
  return out;
}

const sign = (v: number) => (v < 0 ? -1 : 1);
/**
 * Cubic segments through points sorted by x, monotone between neighbours (Steffen's method, as d3's curveMonotoneX):
 * the curve never swings above a peak or below a dip, so it never shows a value the data does not have.
 */
export function monotone(p: Pt[]): Seg[] {
  const n = p.length;
  if (n < 2) return [];
  const h = p.slice(1).map((q, i) => q[0] - p[i][0]);
  const s = p.slice(1).map((q, i) => (q[1] - p[i][1]) / h[i]);
  const m = p.map((_, i) => {
    if (i === 0 || i === n - 1) return NaN;
    const [s0, s1, h0, h1] = [s[i - 1], s[i], h[i - 1], h[i]];
    return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), .5 * Math.abs((s0 * h1 + s1 * h0) / (h0 + h1))) || 0;
  });
  // ends: the tangent that keeps the end segment a parabola through its inner neighbour's tangent
  m[0] = n === 2 ? s[0] : (3 * s[0] - m[1]) / 2;
  m[n - 1] = n === 2 ? s[0] : (3 * s[n - 2] - m[n - 2]) / 2;
  return h.map((hi, i) => [p[i], [p[i][0] + hi / 3, p[i][1] + m[i] * hi / 3], [p[i + 1][0] - hi / 3, p[i + 1][1] - m[i + 1] * hi / 3], p[i + 1]]);
}

const f = ([x, y]: Pt) => `${+x.toFixed(1)},${+y.toFixed(1)}`;
const segs = (p: Pt[], smooth: boolean) => smooth ? monotone(p).map(([, a, b, to]) => `C${f(a)} ${f(b)} ${f(to)}`).join('') : p.slice(1).map(q => `L${f(q)}`).join('');
const back = (p: Pt[], smooth: boolean) => smooth ? monotone(p).reverse().map(([from, a, b]) => `C${f(b)} ${f(a)} ${f(from)}`).join('') : p.slice(0, -1).reverse().map(q => `L${f(q)}`).join('');

/** A line through the points; a null breaks it. */
export function linePath(points: readonly (Pt | null)[], smooth = false) {
  return runs(points.map(p => (p ? 0 : null))).map(r => { const p = r.map(i => points[i]!); return `M${f(p[0])}${segs(p, smooth)}`; }).join('');
}

/** The band between `upper` and `lower` (same length), one closed shape per run of non-null upper points. */
export function areaPath(upper: readonly (Pt | null)[], lower: readonly Pt[], smooth = false) {
  return runs(upper.map(p => (p ? 0 : null))).map(r => {
    const top = r.map(i => upper[i]!), bottom = r.map(i => lower[i]);
    return `M${f(top[0])}${segs(top, smooth)}L${f(bottom[bottom.length - 1])}${back(bottom, smooth)}Z`;
  }).join('');
}
