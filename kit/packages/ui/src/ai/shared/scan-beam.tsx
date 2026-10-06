import { createContext, useContext, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../../cx';
import { useReducedMotion } from '../../motion/primitives';

export type ScanRevealMode = 'progressive' | 'whole' | 'none';
type ScanCtx = { direction: 'vertical' | 'horizontal'; duration: number; mode: Exclude<ScanRevealMode, 'none'> };
const Ctx = createContext<ScanCtx | null>(null);

/** Fraction of the ScanBeam area (0–1) that an element occupies. */
export type ScanExtent = { x: number; y: number; w: number; h: number };

/** The active beam's reveal settings, or null when nothing should be revealed (no beam, inactive, reduced motion, reveal="none"). */
export const useScanBeam = () => useContext(Ctx);

/**
 * className + style that reveal an element of the given extent under the beam:
 * progressive = drawn along the scan direction while the beam crosses it; whole = pops in when the beam first touches it.
 * Returns {} outside an active ScanBeam, so the element simply shows.
 */
export function scanRevealProps(ctx: ScanCtx | null, e: ScanExtent): { className?: string; style?: CSSProperties } {
  if (!ctx) return {};
  const h = ctx.direction === 'horizontal';
  const T = ctx.duration * .97; // the beam's edge travels the area in 97 % of the pass (see dtx-beam keyframes)
  const start = (h ? e.x : e.y) * T, span = Math.max(1, (h ? e.w : e.h) * T);
  if (ctx.mode === 'whole') return { className: 'dtx-reveal-whole', style: { animationDelay: `${start}ms` } };
  return { className: h ? 'dtx-reveal-h' : 'dtx-reveal-v', style: { animationDelay: `${start}ms`, '--rev-ms': `${span}ms` } as CSSProperties };
}

export type ScanBeamProps = {
  /** Content under the beam; with `before`, the page revealed behind it. */
  children?: ReactNode;
  /** Same as children, for symmetry with `before` (and CompareSlider's before/after). */
  after?: ReactNode;
  /** vertical: top → bottom (reading a page). horizontal: left → right (threshold sweep, comparisons). */
  direction?: 'vertical' | 'horizontal';
  /** ms for one pass */
  duration?: number;
  /** passes; 'infinite' loops (content is revealed on the first pass) */
  repeat?: number | 'infinite';
  /** Show and play. Change `key` to replay. */
  active?: boolean;
  /**
   * How content inside is revealed by the beam: BoxOverlay boxes, the processed page of a `before` wipe, any <ScanReveal>.
   * progressive (default): drawn under the beam line by line. whole: each element pops in when the beam first touches it.
   * none: the beam is decoration only; content shows immediately.
   */
  reveal?: ScanRevealMode;
  /**
   * Page shown ahead of the beam. When set, `children` is the page revealed behind it (a wipe: raw → processed),
   * and once the scan is not playing, `children` shows in full.
   */
  before?: ReactNode;
  /** false hides the beam line but keeps the reveal timing (a pure wipe). */
  beam?: boolean;
  /** thickness of the glowing band, px */
  band?: number;
  onEnd?: () => void;
  className?: string;
};

/**
 * The only scanning/wipe effect in the kit. Content inside reveals in sync with the beam (see `reveal`); with `before`
 * it wipes from one page to another. Hidden under reduced motion (content shows in its final state).
 */
export function ScanBeam({ children: kids, after, direction = 'vertical', duration = 2400, repeat = 1, active = true, reveal = 'progressive', before, beam = true, band = 48, onEnd, className }: ScanBeamProps) {
  const children = after ?? kids;
  const reduced = useReducedMotion();
  const playing = active && !reduced;
  const parent = useContext(Ctx);
  const own: ScanCtx | null = playing && reveal !== 'none' ? { direction, duration, mode: reveal } : null;
  const ctx = own ?? parent; // an idle beam passes an outer playing beam through to its content
  return (
    <Ctx.Provider value={ctx}>
      <div className={cx('dtx-beam', className)} data-dir={direction} data-wipe={before !== undefined ? (playing ? 'playing' : 'done') : undefined}>
        {before === undefined ? children : (
          <>
            {/* both layers always render, so the tree stays stable between plays */}
            <div className="dtx-beam__before" inert>{before}</div>
            <div className={cx('dtx-beam__after', scanRevealProps(own, { x: 0, y: 0, w: 1, h: 1 }).className)} style={scanRevealProps(own, { x: 0, y: 0, w: 1, h: 1 }).style}>{children}</div>
          </>
        )}
        {playing && beam && (
          <i className="dtx-beam__track" aria-hidden onAnimationEnd={onEnd}
            style={{ '--beam-ms': `${duration}ms`, '--beam-n': String(repeat), '--beam-band': `${band}px`, '--beam-ease': reveal === 'none' ? 'var(--dtx-ease-standard)' : 'linear' } as CSSProperties} />
        )}
      </div>
    </Ctx.Provider>
  );
}

/** Reveals any element under the enclosing ScanBeam. Place it absolutely yourself, or let x/y/w/h position it (fractions of the beam area). */
export function ScanReveal({ x, y, w, h, position = true, className, children }: ScanExtent & { position?: boolean; className?: string; children: ReactNode }) {
  const r = scanRevealProps(useScanBeam(), { x, y, w, h });
  const pos: CSSProperties = position ? { position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` } : {};
  return <div className={cx(r.className, className)} style={{ ...pos, ...r.style }}>{children}</div>;
}
