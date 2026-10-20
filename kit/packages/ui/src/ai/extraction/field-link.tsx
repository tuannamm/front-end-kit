/**
 * # AI · Extraction
 *
 * `DocumentScan`: a beam sweeps a document, each linked row highlights as the beam passes, and its extracted field
 * appears with a confidence score. Phases: idle → scanning → done.
 *
 * ```tsx
 * import { DocumentScan, type ScanRow, type ScanField } from '@dgtx/ui-frek';
 *
 * <DocumentScan fileName="HD-0347.pdf" title="VAT invoice" rows={rows} fields={fields} />
 * ```
 *
 * `FieldLink`: a line from an extracted field to the box it was read from. Hover or focus a field and the line runs to
 * its box, in that box's colour; hover a box and it runs back to its field. Mark each field `data-source="<box id>"`;
 * BoxOverlay boxes already carry `data-box`. It only draws the line: the page, the field list and the layout stay yours.
 * Side by side, the line leaves the facing edges; stacked (a phone), it runs from the field's top to the box's bottom.
 *
 * ```tsx
 * import { FieldLink, BoxOverlay } from '@dgtx/ui-frek';
 *
 * <FieldLink linked={selected} className="grid gap-16 sm:grid-cols-[1fr_240px]">
 *   <BoxOverlay boxes={lines} selectedId={selected}>{page}</BoxOverlay>
 *   <ul>{fields.map(f => <li key={f.key}><button data-source={f.lineId}>{f.label} · {f.value}</button></li>)}</ul>
 * </FieldLink>
 * ```
 *
 * Any element can be an end: `data-box` is just an attribute, so a table cell or a region outside BoxOverlay works too.
 *
 * `TableExtraction`: a detected table, checked cell by cell. The cell grid is drawn over the page (BoxOverlay, coloured by
 * confidence) beside the table rebuilt from the cells. A cell below the high threshold is tinted and shows its score; a
 * count of those sits under the table. Hover a cell on either side and FieldLink joins it to its twin; hover a box on
 * the page for the lens.
 *
 * ```tsx
 * import { TableExtraction, type TableCell } from '@dgtx/ui-frek';
 *
 * <TableExtraction cells={cells} page={<img src={page} alt="Page 1" />} caption="Goods" />
 * ```
 *
 * A `TableCell` is an OcrBox (box in 0–1 fractions, `text`, `confidence`, `points`) plus its place in the grid, the shape
 * table engines emit (Azure Document Intelligence, Textract, PaddleOCR table): 0-based `row` and `col`, optional spans.
 * Pass engine boxes through `toBox`. A hole no cell covers renders as an empty cell, so the columns stay aligned.
 *
 * ## Props
 *
 * ### DocumentScan
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `fileName` | `string` | **required** | Shown above the document |
 * | `title` | `string` | **required** | Document title |
 * | `rows` | `ScanRow[]` | **required** | Lines of the document |
 * | `fields` | `ScanField[]` | **required** | Extracted fields, in reveal order |
 * | `engine` | `string` | `'DIGI-XTRACT'` | Engine name in the results panel |
 * | `phase` | `'idle' \| 'scanning' \| 'done'` |  | Controlled phase. Leave out to auto-play |
 * | `loop` | `boolean` | `true` | Restart after done (auto-play only) |
 * | `scanMs` | `number` | `2400` | ms per sweep |
 * | `lowConfidence` | `number` | `95` | Below this a field shows in the warning colour |
 * | `onPhaseChange` | `(phase: ScanPhase) => void` |  | Phase changed |
 *
 * ### ScanRow
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `label` | `string` | **required** | Left text |
 * | `value` | `string` | **required** | Right text |
 * | `field` | `string` |  | Key of the ScanField this row produces; it highlights under the beam |
 * | `strong` | `boolean` |  | Bold row, e.g. the total |
 * | `rule` | `true` |  | A divider instead of a row: `{ rule: true }` |
 *
 * ### ScanField
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `key` | `string` | **required** | Field name |
 * | `value` | `string` | **required** | Extracted value |
 * | `confidence` | `number` | **required** | 0–100 |
 *
 * ### FieldLink
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `linked` | `string \| null` | `null` | Box id linked while nothing is hovered or focused: a selection, or a static state for docs |
 * | `children` | `ReactNode` | **required** | The page (BoxOverlay) and the fields marked `data-source="<box id>"` |
 * | `className` | `string` |  | Lay the two out here, e.g. a grid |
 *
 * ### TableExtraction
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `cells` | `TableCell[]` | **required** | Detected cells, in any order |
 * | `page` | `ReactNode` | **required** | The page under the grid (`<img>`, `<canvas>`, `<SampleInvoice/>`) |
 * | `caption` | `string` |  | Table name, shown above the table |
 * | `thresholds` | `Thresholds` | `{ high: 95, low: 80 }` | Below high a cell is flagged in amber, below low in red |
 * | `linked` | `string \| null` | `null` | Cell id linked while nothing is hovered or focused: a selection, or a static state for docs |
 * | `className` | `string` |  | Extra classes |
 *
 * ### TableCell
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `row` | `number` | **required** | Row it starts in, 0-based |
 * | `col` | `number` | **required** | Column it starts in, 0-based |
 * | `rowSpan` | `number` | `1` | Rows it covers |
 * | `colSpan` | `number` | `1` | Columns it covers |
 * | `header` | `boolean` |  | A header cell (`<th>`) |
 * | `id` | `string` | `r<row>c<col>` | Stable key; links the cell to its box |
 *
 * ## Files
 *
 * - `document-scan.tsx`: DocumentScan, `ScanRow`, `ScanField`, `ScanPhase`
 * - `field-link.tsx`: FieldLink
 * - `connect.ts`: the curve between a field and its box (`connect.check.ts`)
 * - `table-extraction.tsx`: TableExtraction, `TableCell`
 * - `table-grid.ts`: detected cells → table rows, with spans and holes (`table-grid.check.ts`)
 * - `extraction.css`
 *
 
 */

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type SyntheticEvent } from 'react';
import { cx } from '../../cx';
import { connect, type Pt, type Rect } from './connect';

export type FieldLinkProps = {
  /** Box id linked while nothing is hovered or focused: a selected field, or a static state for docs and screenshots. */
  linked?: string | null;
  /** The page with its BoxOverlay, and the extracted fields marked `data-source="<box id>"`, laid out however you like. */
  children: ReactNode;
  className?: string;
};

type Geo = { d: string; from: Pt; to: Pt; rgb: string };

/**
 * Draws a line from an extracted field to the box it was read from, so a reviewer sees where a value came from without
 * searching the page. Hovering or focusing either end links the pair; the line takes the box's colour.
 */
export function FieldLink({ linked = null, children, className }: FieldLinkProps) {
  const root = useRef<HTMLDivElement>(null);
  const [over, setOver] = useState<string | null>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const id = over ?? linked;

  // one handler for both ends: a field (data-source) or a BoxOverlay box (data-box) under the pointer or focus
  const track = (e: SyntheticEvent) => {
    const end = (e.target as Element).closest?.('[data-source], [data-box]');
    setOver(end ? end.getAttribute('data-source') ?? end.getAttribute('data-box') : null);
  };

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !id) { setGeo(null); return; }
    const q = CSS.escape(id);
    let marked: Element[] = [];
    const measure = () => {
      const f = el.querySelector(`[data-source="${q}"]`), b = el.querySelector(`[data-box="${q}"]`);
      const ends = [f, b].filter((n): n is Element => !!n);
      if (ends.some((n, i) => n !== marked[i]) || ends.length !== marked.length) {
        marked.forEach(n => n.removeAttribute('data-linked'));
        (marked = ends).forEach(n => n.setAttribute('data-linked', ''));
      }
      if (!f || !b) { setGeo(null); return; }
      const o = el.getBoundingClientRect();
      const rel = (n: Element): Rect => { const r = n.getBoundingClientRect(); return { left: r.left - o.left, right: r.right - o.left, top: r.top - o.top, bottom: r.bottom - o.top }; };
      const g = connect(rel(f), rel(b));
      // BoxOverlay sets each box's colour as an "r g b" triple in --c
      const rgb = getComputedStyle(b).getPropertyValue('--c').trim() || '37 130 215';
      setGeo(prev => (g && prev?.d === g.d && prev.rgb === rgb ? prev : g && { ...g, rgb }));
    };
    let raf = 0;
    const place = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(measure); };
    measure();
    // follow layout: resizes, boxes that arrive late (a page measured after mount), scrolling, the boxes' draw-in
    const ro = new ResizeObserver(place);
    ro.observe(el);
    Array.from(el.children).forEach(n => ro.observe(n));
    const mo = new MutationObserver(place);
    mo.observe(el, { childList: true, subtree: true });
    addEventListener('scroll', place, true);
    el.addEventListener('animationend', place);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); mo.disconnect();
      removeEventListener('scroll', place, true); el.removeEventListener('animationend', place);
      marked.forEach(n => n.removeAttribute('data-linked'));
    };
  }, [id]);

  return (
    <div
      ref={root} className={cx('dtx-flink', className)} data-on={geo ? '' : undefined} style={geo ? { '--flink': geo.rgb } as CSSProperties : undefined}
      onPointerOver={track} onPointerLeave={() => setOver(null)} onFocus={track} onBlur={() => setOver(null)}
    >
      {children}
      {geo && (
        // keyed by the pair, so each new link fades in once and then only follows layout changes
        <svg key={id} className="dtx-flink__svg" aria-hidden>
          <path className="dtx-flink__line" d={geo.d} />
          <circle className="dtx-flink__end" cx={geo.from[0]} cy={geo.from[1]} r="3.5" />
          <circle className="dtx-flink__end dtx-flink__end--box" cx={geo.to[0]} cy={geo.to[1]} r="3.5" />
        </svg>
      )}
    </div>
  );
}
