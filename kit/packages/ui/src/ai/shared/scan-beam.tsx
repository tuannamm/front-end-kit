/**
 * # AI · Shared
 *
 * Pieces several AI tasks reuse: bounding boxes over a page, confidence, before/after comparison, the scan beam and a
 * synthetic sample page.
 *
 * ```tsx
 * import { BoxOverlay, ScanBeam, CompareSlider, ConfidenceBadge } from '@dgtx/ui-frek';
 *
 * <ScanBeam><BoxOverlay boxes={lines}><img src={page} alt="Page 1" /></BoxOverlay></ScanBeam>
 * <CompareSlider before={<img src={raw} alt="Original" />} after={<img src={clean} alt="Processed" />} />
 * ```
 *
 * Inside PdfViewer or ImageViewer, pass the overlay through their `renderPage`; it then zooms, pans and turns with the
 * page: `<PdfViewer src={url} renderPage={(page, { index }) => <BoxOverlay boxes={lines[index]}>{page}</BoxOverlay>} />`.
 *
 * ### Polygon boxes
 *
 * Engines such as PaddleOCR, EasyOCR or CRAFT emit text regions as polygons: quads for rotated or skewed lines, many
 * points for curved text on a stamp. Give the box `points` (or pass the engine shape through `toBox` / `normalizeOcr`,
 * which keep them) and BoxOverlay draws the shape instead of its bounding rectangle:
 *
 * ```tsx
 * <BoxOverlay boxes={lines.map(l => ({ id: l.id, text: l.text, confidence: l.score * 100, ...toBox(l.poly, W, H) }))}>
 *   <img src={page} alt="Page 1" />
 * </BoxOverlay>
 * ```
 *
 * - Only the polygon takes the pointer, so overlapping slanted lines each get their own hover.
 * - The hover spotlight has a hole in the shape of the polygon; selected and confidence colours work as for rectangles.
 * - The lens crops a quad along its own edges and turns it level, so a tilted line reads straight above its AI text.
 *   Points must run top-left, top-right, bottom-right, bottom-left (PaddleOCR, EasyOCR and CRAFT do). Other shapes, e.g.
 *   curved text, are cropped by their bounding rectangle. The scan reveal uses the bounding rectangle.
 * - A 4-point polygon that is an upright rectangle stays a rectangle (corner brackets on hover).
 *
 * ## Props
 *
 * ### BoxOverlay
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `boxes` | `OcrBox[]` | **required** | Boxes in 0–1 fractions of the page |
 * | `children` | `ReactNode` | **required** | The page underneath (`<img>`, `<canvas>`, `<SampleInvoice/>`); drawn again inside the lens |
 * | `colorBy` | `'confidence' \| 'kind' \| 'plain'` | `'confidence'` | Blue/amber/red by score, layout palette, or neutral (detection only) |
 * | `hover` | `'lens' \| 'blink'` | `'lens'` | How a hovered box compares the AI text with the original |
 * | `showLabels` | `boolean` |  | Region tags (with `colorBy="kind"`) |
 * | `thresholds` | `Thresholds` | `{ high: 95, low: 80 }` | Confidence levels |
 * | `selectedId` | `string \| null` |  | Box drawn as selected |
 * | `onSelect` | `(box: OcrBox) => void` |  | A box was clicked or pressed |
 * | `animate` | `boolean` | `true` | Staggered draw-in on mount; change `key` to replay |
 * | `hideText` | `boolean` |  | Detection stage: no recognised text yet, hover only highlights |
 * | `pinnedId` | `string \| null` |  | Show this box in its hover state without a pointer (docs, screenshots) |
 * | `textInset` | `number` | `2` | px between a box edge and its first glyph; lines the AI text up in the lens |
 * | `className` | `string` |  | Extra classes |
 *
 * ### OcrBox
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `id` | `string` | **required** | Stable key |
 * | `x` | `number` | **required** | Left, 0–1 of the page width |
 * | `y` | `number` | **required** | Top, 0–1 of the page height |
 * | `w` | `number` | **required** | Width, 0–1 |
 * | `h` | `number` | **required** | Height, 0–1 |
 * | `text` | `string` |  | Recognised text |
 * | `confidence` | `number` |  | 0–100 |
 * | `kind` | `'title' \| 'text' \| 'table' \| 'figure' \| 'stamp' \| 'signature' \| 'field'` |  | Layout region kind |
 * | `label` | `string` |  | Tag text; defaults to the kind's name |
 * | `points` | `Array<[number, number]>` |  | Outline of a rotated, skewed or curved region (0–1 page points, 3 or more). Drawn as-is; `x`/`y`/`w`/`h` are derived from it. `toBox` fills it from an engine polygon |
 *
 * ### ConfidenceBadge
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `value` | `number` | **required** | 0–100 |
 * | `thresholds` | `Thresholds` | `{ high: 95, low: 80 }` | ≥ high is high, < low is low |
 * | `showLabel` | `boolean` |  | Adds the review hint ("Needs review") for QC screens |
 * | `size` | `'sm' \| 'md'` | `'sm'` | Badge size |
 *
 * ### ConfidenceBar
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `value` | `number` | **required** | 0–100 |
 * | `thresholds` | `Thresholds` | `{ high: 95, low: 80 }` | Also drawn as ticks on the bar |
 *
 * ### ConfidenceDots
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `value` | `number` | **required** | 0–100; 99 → 5 dots, 95 → 4, 90 → 3, 85 → 2, ≤ 80 → 1 |
 * | `thresholds` | `Thresholds` | `{ high: 95, low: 80 }` | Colour levels |
 *
 * ### CompareSlider
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `before` | `ReactNode` | **required** | Raw page |
 * | `after` | `ReactNode` | **required** | Processed page, same size |
 * | `defaultValue` | `number` | `50` | Start position, % from the left |
 * | `beforeLabel` | `string` | `'Original'` | Tag on the left |
 * | `afterLabel` | `string` | `'Processed'` | Tag on the right |
 *
 * ### ScanBeam
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `children` | `ReactNode` |  | Content under the beam; with `before`, the page revealed behind it |
 * | `after` | `ReactNode` |  | Same as `children`, to pair with `before` |
 * | `before` | `ReactNode` |  | Page shown ahead of the beam: a wipe from `before` to `children` |
 * | `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | Top → bottom, or left → right |
 * | `duration` | `number` | `2400` | ms per pass |
 * | `repeat` | `number \| 'infinite'` | `1` | Passes; content reveals on the first |
 * | `active` | `boolean` | `true` | Show and play; change `key` to replay |
 * | `reveal` | `'progressive' \| 'whole' \| 'none'` | `'progressive'` | How content inside appears: drawn under the line, popped in when touched, or at once |
 * | `beam` | `boolean` | `true` | `false` hides the line and keeps the reveal (a pure wipe) |
 * | `band` | `number` | `48` | Glow thickness in px |
 * | `onEnd` | `() => void` |  | After the last pass |
 * | `className` | `string` |  | Extra classes |
 *
 * ### ScanReveal
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `x` | `number` | **required** | Left, 0–1 of the beam area |
 * | `y` | `number` | **required** | Top, 0–1 |
 * | `w` | `number` | **required** | Width, 0–1 |
 * | `h` | `number` | **required** | Height, 0–1 |
 * | `children` | `ReactNode` | **required** | Revealed when the beam reaches it |
 * | `position` | `boolean` | `true` | Place it absolutely from x/y/w/h; `false` if you position it yourself |
 * | `className` | `string` |  | Extra classes |
 *
 * ### SampleInvoice
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `onBoxes` | `(boxes: OcrBox[]) => void` |  | Measured line boxes (with text and confidence) once fonts are ready |
 * | `className` | `string` |  | Extra classes |
 *
 * ## Files
 *
 * - `box-overlay.tsx`: BoxOverlay, `OcrBox`, `regionLabels`
 * - `confidence.tsx`: ConfidenceBadge, ConfidenceBar, ConfidenceDots, `confidenceLevel`, `defaultThresholds`
 * - `compare-slider.tsx`: CompareSlider
 * - `scan-beam.tsx`: ScanBeam, ScanReveal, `useScanBeam`, `scanRevealProps`
 * - `sample-invoice.tsx`: SampleInvoice, `sampleInvoiceRegions`, `sampleInvoiceInset`, `sampleInvoiceTable` (its goods table as cells)
 * - `geometry.ts`: `toBox` (any engine box shape → 0–1 box; a polygon keeps its `points`), `bounds`
 * - `shared.css`
 *
 * @generated from README.md in this folder. Edit the README, then run `npm run docs:sync`.
 */

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
