import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useReducedMotion } from '../../motion/primitives';

/**
 * The unwarp service's lattice (pz-auto_preprocessing /unwarp, include_grid): `cols` × `rows` points in 0–1 of the
 * RAW image, row-major. Either flat `[x, y, x, y, …]` (the preprocess.done payload) or `points[row][col] = [x, y]`.
 */
export type UnwarpGrid = { cols: number; rows: number; points: number[] | [number, number][][] };

/** Demo lattice for a curled page (11 × 9, like the service): middle rows bow with the curl, the sides pinch. */
export function syntheticUnwarpGrid(cols = 11, rows = 9): UnwarpGrid {
  const points: number[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const u = c / (cols - 1), v = r / (rows - 1);
    // stays on the page: top/bottom edges follow the paper, middle rows bow most, sides pinch slightly
    const bow = Math.sin(Math.PI * u) * Math.sin(Math.PI * v);
    points.push(0.5 + (u - 0.5) * (1 - 0.06 * Math.sin(Math.PI * v)), v - 0.04 * bow + 0.015 * (u - 0.5) * Math.sin(Math.PI * v));
  }
  return { cols, rows, points };
}

const flat = (g: UnwarpGrid) => (typeof g.points[0] === 'number' ? (g.points as number[]) : (g.points as [number, number][][]).flat(2));

/** cubic-bezier as a function of time, same curve as --dtx-ease-emphasis */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const c = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x: number) => { let lo = 0, hi = 1, t = x; for (let i = 0; i < 24; i++) { t = (lo + hi) / 2; if (c(x1, x2, t) < x) lo = t; else hi = t; } return c(y1, y2, t); };
}
const emphasis = bezier(.05, .7, .1, 1);
/** slow-in slow-out: the stretch should be watched, not snapped */
const stretchEase = bezier(.45, 0, .2, 1);

/**
 * Unwarp's lattice (same language as the stengg inference view): on the raw page the points pop in diagonally from
 * the top-left inside a dashed outline through the border points. When applied, every point travels to its place on
 * a regular grid in step with the page flattening, holds so the alignment can be read, then fades.
 */
export function UnwarpMesh({ applied, duration, grid, pop = true }: { applied: boolean; duration: number; grid?: UnwarpGrid; /** points pop in diagonally on mount */ pop?: boolean }) {
  const reduced = useReducedMotion();
  const g = grid ?? syntheticUnwarpGrid();
  const raw = flat(g);
  const [t, setT] = useState(applied ? 1 : 0);
  const prev = useRef(applied);
  useEffect(() => {
    const was = prev.current; prev.current = applied;
    if (applied === was) return;
    if (reduced) { setT(applied ? 1 : 0); return; }
    const from = applied ? 0 : 1, to = applied ? 1 : 0, t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => { const k = Math.min(1, (now - t0) / duration); setT(k >= 1 ? to : from + (to - from) * emphasis(k)); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [applied, duration, reduced]);

  const at = (c: number, r: number) => {
    const i = (r * g.cols + c) * 2, u = c / (g.cols - 1), v = r / (g.rows - 1);
    const x = raw[i] ?? u, y = raw[i + 1] ?? v;
    return { x: x + (u - x) * t, y: y + (v - y) * t, d: (u + v) / 2 };
  };
  const pts = Array.from({ length: g.rows }, (_, r) => Array.from({ length: g.cols }, (_, c) => at(c, r)));
  const ring = [...pts[0], ...pts.slice(1, -1).map(row => row[row.length - 1]), ...[...pts[pts.length - 1]].reverse(), ...pts.slice(1, -1).map(row => row[0]).reverse()];
  return (
    <span className="dtx-pp__mesh" aria-hidden data-done={applied && t >= 1 ? '' : undefined} data-pop={pop ? '' : undefined}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <polygon points={ring.map(q => `${(q.x * 100).toFixed(2)},${(q.y * 100).toFixed(2)}`).join(' ')} />
      </svg>
      {pts.flat().map((p, i) => <i key={i} style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, '--d': p.d } as CSSProperties} />)}
    </span>
  );
}

type Img = { src: string; width: number; height: number };
type P = [number, number];

/** n evenly spaced indices of 0..len-1, always including both ends */
const sample = (len: number, n: number) => (len <= n ? Array.from({ length: len }, (_, i) => i) : Array.from({ length: n }, (_, i) => Math.round((i * (len - 1)) / (n - 1))));

/**
 * The points shown over the page: a sparse lattice (≤ 7 × 5) in pop order — the 4 corners, then the border,
 * then the interior — so it reads as points being placed one by one, not a sheet falling onto the page.
 */
function shownPoints(cols: number, rows: number) {
  const cs = sample(cols, 7), rs = sample(rows, 5);
  const all = rs.flatMap((r, ri) => cs.map((c, ci) => {
    const corner = (ri === 0 || ri === rs.length - 1) && (ci === 0 || ci === cs.length - 1);
    const edge = ri === 0 || ri === rs.length - 1 || ci === 0 || ci === cs.length - 1;
    return { c, r, group: corner ? 0 : edge ? 1 : 2, d: ri + ci };
  }));
  return all.sort((a, b) => a.group - b.group || a.d - b.d).map((p, i) => ({ ...p, order: i, delay: i * 45 + p.group * 160 }));
}

/**
 * CSS matrix3d that maps a w×h element onto the quad tl,tr,br,bl (projective, Heckbert's square→quad).
 */
function rectToQuad(w: number, h: number, [p0, p1, p2, p3]: [P, P, P, P]) {
  const [x0, y0] = p0, [x1, y1] = p1, [x2, y2] = p2, [x3, y3] = p3;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3, dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  let g = 0, hh = 0;
  if (Math.abs(dx3) > 1e-9 || Math.abs(dy3) > 1e-9) {
    const det = dx1 * dy2 - dx2 * dy1 || 1e-9;
    g = (dx3 * dy2 - dx2 * dy3) / det; hh = (dx1 * dy3 - dx3 * dy1) / det;
  }
  const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, c = x0, d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3, f = y0;
  return `matrix3d(${a / w},${d / w},0,${g / w},${b / h},${e / h},0,${hh / h},0,0,1,0,${c},${f},0,1)`;
}

/**
 * Real unwarp result, shown as a stretch: the raw page with the service's lattice; on apply the page is pulled flat
 * cell by cell along that lattice (each lattice cell of the unwarped page is projected from its raw quad to its
 * regular place) while the points travel with it. Ends exactly on the unwarped image; the aligned points hold, then fade.
 * `grid` is the /unwarp lattice on the raw image.
 */
export function UnwarpView({ raw, unwarped, grid, applied, duration = 1800, hold = 500, alt = 'Trang tài liệu' }: {
  raw: Img; unwarped: Img; grid: UnwarpGrid; applied: boolean; duration?: number;
  /** ms the complete lattice stays on the raw page before the stretch starts, even if `applied` turns true earlier */
  hold?: number; alt?: string;
}) {
  const reduced = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [t, setT] = useState(applied ? 1 : 0);
  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  // phase 1 timing: when the last point has popped in (see shownPoints delays + pop duration)
  const pops = shownPoints(grid.cols, grid.rows);
  const introMs = (pops[pops.length - 1]?.delay ?? 0) + 320;
  const rawSince = useRef(performance.now());
  const [stretching, setStretching] = useState(applied && reduced);
  useEffect(() => {
    if (!applied) { setT(0); setStretching(false); rawSince.current = performance.now(); return; }
    if (reduced) { setT(1); setStretching(true); return; }
    let raf = 0;
    // never cut the lattice short: wait until it has fully appeared and been visible for `hold`
    const wait = Math.max(0, rawSince.current + introMs + hold - performance.now());
    const timer = setTimeout(() => {
      setStretching(true);
      const t0 = performance.now();
      const tick = (now: number) => { const k = Math.min(1, (now - t0) / duration); setT(k >= 1 ? 1 : stretchEase(k)); if (k < 1) raf = requestAnimationFrame(tick); }; // exact 1 at the end: the bezier solver lands at 0.9999…
      raf = requestAnimationFrame(tick);
    }, wait);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [applied, duration, reduced, hold, introMs]);

  const { cols, rows } = grid, pts = flat(grid);
  const { w: W, h: H } = size;
  // unwarped page fitted (contain) into the raw page's box
  const s = Math.min(W / unwarped.width, H / unwarped.height), pw = unwarped.width * s, ph = unwarped.height * s, ox = (W - pw) / 2, oy = (H - ph) / 2;
  const at = (c: number, r: number): P => {
    const i = (r * cols + c) * 2, u = c / (cols - 1), v = r / (rows - 1);
    const sx = (pts[i] ?? u) * W, sy = (pts[i + 1] ?? v) * H, dx = ox + u * pw, dy = oy + v * ph;
    return [sx + (dx - sx) * t, sy + (dy - sy) * t];
  };
  const cw = pw / (cols - 1), ch = ph / (rows - 1);
  const started = stretching && W > 0;
  const done = started && t >= 1;
  return (
    <div className="dtx-uw" ref={box} style={{ aspectRatio: `${raw.width} / ${raw.height}` }} data-state={!started ? 'raw' : done ? 'done' : 'stretch'}>
      <img className="dtx-uw__raw" src={raw.src} width={raw.width} height={raw.height} alt={started ? '' : alt} />
      {started && !done && (
        <div className="dtx-uw__cells" aria-hidden>
          {Array.from({ length: (rows - 1) * (cols - 1) }, (_, k) => {
            const r = Math.floor(k / (cols - 1)), c = k % (cols - 1);
            return <i key={k} style={{ width: cw + 1, height: ch + 1, transform: rectToQuad(cw, ch, [at(c, r), at(c + 1, r), at(c + 1, r + 1), at(c, r + 1)]),
              backgroundImage: `url(${unwarped.src})`, backgroundSize: `${pw}px ${ph}px`, backgroundPosition: `${-c * cw}px ${-r * ch}px` }} />;
          })}
        </div>
      )}
      {done && <img className="dtx-uw__flat" src={unwarped.src} width={unwarped.width} height={unwarped.height} alt={alt} style={{ left: ox, top: oy, width: pw, height: ph }} />}
      {W > 0 && (
        <span className="dtx-uw__pts" aria-hidden data-pop={!started ? '' : undefined} data-done={done ? '' : undefined}>
          {shownPoints(cols, rows).map(q => {
            const [x, y] = at(q.c, q.r);
            // position in `translate`, not `transform`: the pop animates `scale`, which CSS applies before `translate` but after `transform`
            return <i key={`${q.c}-${q.r}`} style={{ translate: `${x}px ${y}px`, animationDelay: `${q.delay}ms` }} />;
          })}
        </span>
      )}
    </div>
  );
}
