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
 * - `sample-invoice.tsx`: SampleInvoice, `sampleInvoiceRegions`, `sampleInvoiceInset`
 * - `geometry.ts`: `toBox` (any engine box shape → 0–1 box; a polygon keeps its `points`), `bounds`
 * - `shared.css`
 *
 * @generated from README.md in this folder. Edit the README, then run `npm run docs:sync`.
 */

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cx } from '../../cx';
import { useReducedMotion } from '../../motion/primitives';
import { scanRevealProps, useScanBeam } from './scan-beam';
import { ConfidenceDots, confidenceLevel, confidenceWord, defaultThresholds, type Thresholds } from './confidence';
import { bounds } from './geometry';

export type RegionKind = 'title' | 'text' | 'table' | 'figure' | 'stamp' | 'signature' | 'field';
/** Coordinates are 0–1 fractions of the document, so boxes survive any display size. */
export type OcrBox = {
  id: string; x: number; y: number; w: number; h: number; text?: string; confidence?: number; kind?: RegionKind; label?: string;
  /** Outline of a rotated, skewed or curved region, as 0–1 page points. Drawn as-is; x/y/w/h are then derived from it. */
  points?: Array<[number, number]>;
};
/**
 * How a hovered box lets a reviewer compare the AI reading with the original.
 * lens:  the original region magnified, with the AI text directly beneath at the same scale and left edge (default).
 * blink: in place, the box flips between original pixels and AI text (blink comparator). Falls back to lens under reduced motion.
 */
export type BoxHover = 'lens' | 'blink';

// Outline ≥ 3:1 on white paper (WCAG 1.4.11) and white 10px tag text ≥ 4.5:1 on the fill (checked by test:a11y).
const KIND_RGB: Record<RegionKind, string> = { title: '26 111 191', text: '19 123 182', table: '145 39 214', figure: '94 118 0', stamp: '148 96 0', signature: '196 43 43', field: '26 111 191' };
const LEVEL_RGB = { high: '37 130 215', medium: '148 96 0', low: '196 43 43' };
export const regionLabels: Record<RegionKind, string> = { title: 'Title', text: 'Text', table: 'Table', figure: 'Figure', stamp: 'Stamp', signature: 'Signature', field: 'Field' };

export type BoxOverlayProps = {
  boxes: OcrBox[];
  /** The page underneath: <img>, <canvas>, <SampleInvoice/>… Rendered a second time inside the lens. */
  children: ReactNode;
  /** confidence: blue/amber/red by score. kind: layout-analysis palette. plain: neutral outline (detection only). */
  colorBy?: 'confidence' | 'kind' | 'plain';
  hover?: BoxHover;
  showLabels?: boolean;
  thresholds?: Thresholds;
  selectedId?: string | null;
  onSelect?: (box: OcrBox) => void;
  /** Staggered draw-in on mount; change `key` to replay. */
  animate?: boolean;
  /** No recognised text yet (detection stage): hover only highlights. */
  hideText?: boolean;
  /** Show this box in its hover state without a pointer. For docs, demos, screenshots. */
  pinnedId?: string | null;
  /** Gap (px at page size) between a box edge and its first glyph; lines the AI text up under the original in the lens. Tight engine boxes ≈ 1–2. */
  textInset?: number;
  className?: string;
};

function usePageSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.offsetWidth, h: el.offsetHeight }));
    ro.observe(el); setSize({ w: el.offsetWidth, h: el.offsetHeight });
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

let ctx: CanvasRenderingContext2D | null = null;
/** Font size at which `text` is `width` px wide (Roboto 400), so the AI line spans exactly the original line. */
function fitFontSize(text: string, width: number, max: number) {
  ctx ??= document.createElement('canvas').getContext('2d');
  if (!ctx || !text) return max;
  ctx.font = `400 100px ${getComputedStyle(document.documentElement).getPropertyValue('--dtx-font') || 'Roboto, Arial, sans-serif'}`;
  const w100 = ctx.measureText(text).width;
  return w100 ? Math.min(max, (width / w100) * 100) : max;
}

/**
 * Original crop magnified on top, AI text on the same scale underneath, both starting at the same x,
 * so a reviewer reads them as two lines of one paragraph.
 */
function Lens({ b, page, size, rgb, thresholds, inset, children }: { b: OcrBox; page: ReactNode; size: { w: number; h: number }; rgb: string; thresholds: Thresholds; inset: number; children?: ReactNode }) {
  const PAD = 8, TAG = 30;
  // a quad (TL, TR, BR, BL, as engines emit them) is cropped along its own edges and turned level, so a tilted line
  // reads straight above its AI text; any other shape is cropped by its bounding rectangle
  const q = b.points?.length === 4 ? b.points.map(([px, py]) => [px * size.w, py * size.h]) : null;
  const [ox, oy] = q ? q[0] : [b.x * size.w, b.y * size.h];
  const angle = q ? Math.atan2(q[1][1] - q[0][1], q[1][0] - q[0][0]) : 0;
  const bw = q ? Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]) : b.w * size.w;
  const bh = q ? Math.hypot(q[3][0] - q[0][0], q[3][1] - q[0][1]) : b.h * size.h;
  const k = Math.max(1.4, Math.min(4, 34 / Math.max(bh, 1)));            // magnify the line to ~34px tall
  const maxW = size.w - 2 * PAD;
  // at least 260px so the score line stays on one row; the crop itself is only ever the box
  const lensW = Math.min(Math.max(bw * k + 2 * PAD + TAG, 260), maxW);
  const left = Math.max(PAD, Math.min(b.x * size.w - PAD, size.w - lensW - PAD));
  const below = b.y + b.h < .62;
  const lv = b.confidence !== undefined ? confidenceLevel(b.confidence, thresholds) : null;
  const pos: Record<string, string | number> = { left, width: lensW, '--c': rgb };
  if (below) pos.top = (b.y + b.h) * size.h + 10; else pos.bottom = (1 - b.y) * size.h + 10;
  const style = pos as CSSProperties;
  return (
    <div className="dtx-ocr__lens" style={style} data-below={below ? '' : undefined} aria-hidden>
      <div className="dtx-ocr__lens-row">
        <span className="dtx-ocr__lens-tag">Original</span>
        {/* exactly the box, magnified: a 2-character box shows those 2 characters, not its neighbours */}
        <div className="dtx-ocr__lens-crop" style={{ width: Math.min(bw * k, lensW - TAG - PAD), height: bh * k, marginLeft: PAD }}>
          <div inert style={{ position: 'absolute', width: size.w * k, left: 0, top: 0, transformOrigin: '0 0', transform: `rotate(${-angle}rad) translate(${-ox * k}px, ${-oy * k}px)` }}>{page}</div>
        </div>
      </div>
      <div className="dtx-ocr__lens-row">
        <span className="dtx-ocr__lens-tag">AI</span>
        <div className="dtx-ocr__lens-text" style={{ fontSize: fitFontSize(b.text ?? '', (bw - 2 * inset) * k, bh * k * .8), paddingLeft: PAD + inset * k }}>{children ?? b.text}</div>
      </div>
      {b.confidence !== undefined && lv && (
        <div className="dtx-ocr__lens-score">
          <ConfidenceDots value={b.confidence} thresholds={thresholds} />
          <span className="dtx-num">{b.confidence.toFixed(1)}%</span>
          <span className={`dtx-tone-${lv === 'high' ? 'ok' : lv === 'medium' ? 'warn' : 'err'}`} style={{ color: 'var(--t)', fontWeight: 500 }}>{confidenceWord[lv]}</span>
          {b.kind && <span className="dtx-ocr__lens-kind">{regionLabels[b.kind]}</span>}
        </div>
      )}
    </div>
  );
}

/**
 * Bounding boxes over a document, built for checking AI reading against the original.
 * Hover or focus a box (or pass pinnedId) to compare; boxes are keyboard-reachable buttons.
 */
/** The polygon in the box's own 0–100 space, as an SVG path. */
const polyPath = (b: OcrBox) => `M${b.points!.map(([px, py]) => `${(((px - b.x) / (b.w || 1)) * 100).toFixed(2)} ${(((py - b.y) / (b.h || 1)) * 100).toFixed(2)}`).join('L')}Z`;

export function BoxOverlay({ boxes: input, children, colorBy = 'confidence', hover = 'lens', showLabels, thresholds = defaultThresholds, selectedId, onSelect, animate = true, hideText, pinnedId, textInset = 2, className }: BoxOverlayProps) {
  const reduced = useReducedMotion();
  // a polygon is the truth: its bounding rectangle places the button, the scan reveal and the lens
  const boxes = input.map(b => (b.points && b.points.length > 2 ? { ...b, ...bounds(b.points) } : b));
  const beam = useScanBeam(); // inside an active ScanBeam, boxes reveal with the beam
  const mode: BoxHover = hover === 'blink' && reduced ? 'lens' : hover;
  const pageRef = useRef<HTMLDivElement>(null);
  const size = usePageSize(pageRef);
  const [hovered, setHovered] = useState<string | null>(null);
  const activeId = hovered ?? pinnedId ?? null;
  const active = boxes.find(b => b.id === activeId);
  const rgbOf = (b: OcrBox) => colorBy === 'kind' ? KIND_RGB[b.kind ?? 'text'] : colorBy === 'plain' ? '26 111 191' : LEVEL_RGB[confidenceLevel(b.confidence ?? 100, thresholds)];
  const labelOf = (b: OcrBox) => b.label ?? (b.kind ? regionLabels[b.kind] : undefined);

  // blink comparator: flip original ↔ AI text while a box is active
  const [showAi, setShowAi] = useState(true);
  useEffect(() => {
    if (mode !== 'blink' || !active) return;
    setShowAi(true);
    const t = setInterval(() => setShowAi(v => !v), 700);
    return () => clearInterval(t);
  }, [mode, active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const comparing = active && !hideText && active.text;
  return (
    <div className={cx('dtx-ocr', className)} data-hover={mode} data-active={active ? '' : undefined}>
      <div className="dtx-ocr__page" ref={pageRef}>
        {children}
        <div className="dtx-ocr__layer">
          {boxes.map((b, i) => {
            const isActive = activeId === b.id;
            const rv = scanRevealProps(beam, b);
            return (
              <button
                key={b.id}
                type="button"
                data-box={b.id}
                className={cx('dtx-ocr__box', animate && !beam && 'dtx-ocr__box--animate', rv.className)}
                data-selected={selectedId === b.id ? '' : undefined}
                data-active={isActive ? '' : undefined}
                data-shape={b.points && b.points.length > 2 ? 'poly' : undefined}
                aria-label={(hideText ? [labelOf(b) ?? 'Text region'] : [labelOf(b), b.text, b.confidence !== undefined && `${b.confidence.toFixed(1)}%`]).filter(Boolean).join(' · ')}
                onClick={() => onSelect?.(b)}
                onPointerEnter={() => setHovered(b.id)} onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(b.id)} onBlur={() => setHovered(null)}
                style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: `${b.w * 100}%`, height: `${b.h * 100}%`, '--c': rgbOf(b), animationDelay: `${i * 35}ms`, ...rv.style } as CSSProperties}
              >
                {b.points && b.points.length > 2 && (
                  <svg className="dtx-ocr__poly" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                    <path className="dtx-ocr__poly-dim" d={`M-1e4 -1e4H1e4V1e4H-1e4Z${polyPath(b)}`} />
                    <path className="dtx-ocr__poly-shape" d={polyPath(b)} />
                  </svg>
                )}
                {showLabels && labelOf(b) && colorBy === 'kind' && <span className="dtx-ocr__tag">{labelOf(b)}</span>}
                {mode === 'blink' && isActive && comparing && (
                  <>
                    <span className="dtx-ocr__blink" data-on={showAi ? '' : undefined}>{b.text}</span>
                    <span className="dtx-ocr__blink-tag">{showAi ? 'AI' : 'Original'}{b.confidence !== undefined && <> · <span className="dtx-num">{b.confidence.toFixed(1)}%</span></>}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
        {mode === 'lens' && comparing && size.w > 0 && (
          <Lens key={active.id} b={active} page={children} size={size} rgb={rgbOf(active)} thresholds={thresholds} inset={textInset} />
        )}
      </div>
    </div>
  );
}
