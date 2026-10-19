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

import { useLayoutEffect, useRef } from 'react';
import type { OcrBox, RegionKind } from './box-overlay';

/* A synthetic VAT invoice drawn in SVG, for demos and docs. Line boxes are measured
   from the rendered text, so overlays line up exactly; region boxes come from the layout. */
const W = 600, H = 780;
type Line = { id: string; x: number; y: number; size: number; bold?: boolean; text: string; conf: number; kind: RegionKind; anchor?: 'end' };
const LINES: Line[] = [
  { id: 'company', x: 40, y: 62, size: 15, bold: true, text: 'CÔNG TY TNHH MINH PHÁT', conf: 99.4, kind: 'title' },
  { id: 'title', x: 40, y: 104, size: 22, bold: true, text: 'HOÁ ĐƠN GIÁ TRỊ GIA TĂNG', conf: 99.1, kind: 'title' },
  { id: 'no', x: 40, y: 146, size: 13, text: 'Số hoá đơn: 0000347', conf: 99.8, kind: 'field' },
  { id: 'date', x: 40, y: 170, size: 13, text: 'Ngày: 02/10/2026', conf: 99.6, kind: 'field' },
  { id: 'tax', x: 330, y: 146, size: 13, text: 'MST: 0312 456 789', conf: 97.9, kind: 'field' },
  { id: 'addr', x: 330, y: 170, size: 13, text: 'Q.7, TP. Hồ Chí Minh', conf: 91.3, kind: 'text' },
  { id: 'r1', x: 92, y: 262, size: 13, text: 'Giấy in A4 (thùng)', conf: 98.7, kind: 'table' },
  { id: 'r2', x: 92, y: 292, size: 13, text: 'Mực in laser HP 85A', conf: 86.4, kind: 'table' },
  { id: 'r3', x: 92, y: 322, size: 13, text: 'Bìa hồ sơ nhựa', conf: 72.5, kind: 'table' },
  { id: 'vat', x: 560, y: 410, size: 13, text: 'Thuế GTGT 8%: 1.152.000', conf: 94.2, kind: 'field', anchor: 'end' },
  { id: 'total', x: 560, y: 440, size: 15, bold: true, text: 'Tổng cộng: 15.552.000 ₫', conf: 99.7, kind: 'field', anchor: 'end' },
  { id: 'note', x: 40, y: 735, size: 11, text: 'Hoá đơn điện tử tra cứu tại hoadon.minhphat.vn', conf: 88.0, kind: 'text' },
];
const REGIONS: OcrBox[] = ([
  { id: 'reg-head', kind: 'title', x: 28, y: 40, w: 410, h: 76 },
  { id: 'reg-meta', kind: 'text', x: 28, y: 128, w: 544, h: 52 },
  { id: 'reg-table', kind: 'table', x: 28, y: 214, w: 544, h: 136 },
  { id: 'reg-total', kind: 'field', x: 330, y: 390, w: 242, h: 60 },
  { id: 'reg-sign', kind: 'signature', x: 60, y: 560, w: 170, h: 100 },
  { id: 'reg-stamp', kind: 'stamp', x: 390, y: 540, w: 150, h: 140 },
] as OcrBox[]).map(r => ({ ...r, x: r.x / W, y: r.y / H, w: r.w / W, h: r.h / H }));

/* The goods table, for TableExtraction: column and row edges in page px, each cell's text and confidence. The name
   column is the OCR lines r1–r3, so it takes their text and confidence (0 below). */
const COLS = [40, 80, 360, 420, 490, 560], ROWS = [220, 244, 272, 302, 342];
const HEAD = ['STT', 'Tên hàng', 'SL', 'Đơn giá', 'Thành tiền'];
const ITEMS = [['12', '650.000', '7.800.000'], ['4', '1.250.000', '5.000.000'], ['30', '18.000', '540.000']];
const CELL_CONF = [[99.6, 99.4, 99.5, 99.2, 99.3], [99.8, 0, 99.1, 98.9, 99.0], [99.7, 0, 97.2, 96.8, 95.9], [99.5, 0, 90.8, 98.1, 93.6]];

export const sampleInvoiceRegions = REGIONS;
/** The goods table as detected cells (0–1 boxes), for TableExtraction. */
export const sampleInvoiceTable = ROWS.slice(0, -1).flatMap((y, row) => COLS.slice(0, -1).map((x, col) => {
  const line = row && col === 1 ? LINES.find(l => l.id === `r${row}`) : undefined;
  return {
    id: `r${row}c${col}`, row, col, header: row === 0, x: x / W, y: y / H, w: (COLS[col + 1] - x) / W, h: (ROWS[row + 1] - y) / H,
    text: line?.text ?? (row === 0 ? HEAD[col] : col === 0 ? String(row) : ITEMS[row - 1][col - 2]),
    confidence: line?.conf ?? CELL_CONF[row][col],
  };
}));
/** Line boxes are measured with this padding around the glyphs; pass it as BoxOverlay textInset. */
export const sampleInvoiceInset = 4;

/** onBoxes receives the measured line boxes (with text and confidence) once fonts are ready. */
export function SampleInvoice({ onBoxes, className }: { onBoxes?: (boxes: OcrBox[]) => void; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  useLayoutEffect(() => {
    if (!onBoxes || !ref.current) return;
    let live = true;
    const measure = () => {
      if (!live || !ref.current) return;
      const boxes = LINES.map(l => {
        const el = ref.current!.querySelector<SVGTextElement>(`[data-id="${l.id}"]`)!;
        const b = el.getBBox(), p = sampleInvoiceInset;
        return { id: l.id, kind: l.kind, text: l.text, confidence: l.conf, x: (b.x - p) / W, y: (b.y - p / 2) / H, w: (b.width + 2 * p) / W, h: (b.height + p) / H };
      });
      onBoxes(boxes);
    };
    measure();
    document.fonts?.ready.then(measure);
    return () => { live = false; };
  }, [onBoxes]);
  return (
    <svg ref={ref} className={className} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Hoá đơn mẫu" style={{ display: 'block', width: '100%', height: 'auto', background: '#FFFFFF' }}>
      <g fontFamily="var(--dtx-font)" fill="#231F20">
        {LINES.map(l => <text key={l.id} data-id={l.id} x={l.x} y={l.y} fontSize={l.size} fontWeight={l.bold ? 700 : 400} textAnchor={l.anchor}>{l.text}</text>)}
        <rect x="40" y="220" width="520" height="24" fill="#EEF1F5" />
        {HEAD.map((h, i) => <text key={h} x={COLS[i] + 8} y="236" fontSize="11" fontWeight="700">{h}</text>)}
        {[262, 292, 322].map((y, i) => (
          <g key={y} fontSize="13">
            <text x="48" y={y}>{i + 1}</text>
            {ITEMS[i].map((v, k) => <text key={k} x={COLS[k + 2] + 8} y={y}>{v}</text>)}
            <line x1="40" x2="560" y1={y + 10} y2={y + 10} stroke="#D5D9E0" />
          </g>
        ))}
        {COLS.slice(1, -1).map(x => <line key={x} x1={x} x2={x} y1="220" y2="342" stroke="#D5D9E0" />)}
        <rect x="40" y="220" width="520" height="122" fill="none" stroke="#B9BFC9" />
        <text x="80" y="580" fontSize="11" fontWeight="700">NGƯỜI MUA HÀNG</text>
        <path d="M78 625c18-22 30 14 46-6s20-18 30 2 22-10 34 0" fill="none" stroke="#1A3C8F" strokeWidth="2" />
        <text x="410" y="560" fontSize="11" fontWeight="700">NGƯỜI BÁN HÀNG</text>
        <g transform="translate(465 615) rotate(-12)" fill="none" stroke="#C42B2B" strokeWidth="3" opacity=".85">
          <circle r="52" /><circle r="40" strokeWidth="1.5" />
          <text textAnchor="middle" y="6" fontSize="14" fontWeight="700" fill="#C42B2B" stroke="none">ĐÃ KÝ</text>
        </g>
        <line x1="40" x2="560" y1="712" y2="712" stroke="#D5D9E0" />
      </g>
    </svg>
  );
}
