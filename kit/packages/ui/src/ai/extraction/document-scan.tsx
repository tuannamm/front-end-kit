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

import { useEffect, useState } from 'react';
import { Badge } from '../../core/badge/badge';
import { useReducedMotion } from '../../motion/primitives';
import { ScanBeam } from '../shared/scan-beam';

export type ScanRow = { label: string; value: string; /** Links the row to an extracted field key. */ field?: string; strong?: boolean } | { rule: true };
export type ScanField = { key: string; value: string; /** 0–100 */ confidence: number };
export type ScanPhase = 'idle' | 'scanning' | 'done';

export type DocumentScanProps = {
  fileName: string;
  title: string;
  rows: ScanRow[];
  fields: ScanField[];
  engine?: string;
  /** Control the phase yourself, or leave undefined to auto-play. */
  phase?: ScanPhase;
  /** Restart after `done` (auto-play only). */
  loop?: boolean;
  scanMs?: number;
  /** Confidence below this shows in warning colour. */
  lowConfidence?: number;
  onPhaseChange?: (p: ScanPhase) => void;
};

/**
 * AI extraction visual: a beam sweeps the document, each linked row highlights as the beam
 * passes, and its field appears with a confidence score. Phases: idle → scanning → done.
 */
export function DocumentScan({ fileName, title, rows, fields, engine = 'DIGI-XTRACT', phase: controlled, loop = true, scanMs = 2400, lowConfidence = 95, onPhaseChange }: DocumentScanProps) {
  const reduced = useReducedMotion();
  const [auto, setAuto] = useState<ScanPhase>(reduced ? 'done' : 'scanning');
  const phase = controlled ?? auto;
  const [revealed, setRevealed] = useState(phase === 'done' ? fields.length : 0);
  const [run, setRun] = useState(0);
  useEffect(() => { onPhaseChange?.(phase); }, [phase, onPhaseChange]);

  useEffect(() => {
    if (phase === 'idle') { setRevealed(0); return; }
    if (phase === 'done' || reduced) { setRevealed(fields.length); return; }
    setRevealed(0);
    // reveal each field when the beam crosses its row
    const linked = rows.map((r, i) => ('field' in r && r.field ? i : -1)).filter(i => i >= 0);
    const timers = linked.map((rowIdx, n) => setTimeout(() => setRevealed(n + 1), ((rowIdx + 1) / rows.length) * scanMs));
    timers.push(setTimeout(() => { if (controlled === undefined) setAuto('done'); }, scanMs + 200));
    return () => timers.forEach(clearTimeout);
  }, [phase, run, reduced, rows, fields.length, scanMs, controlled]);

  useEffect(() => {
    if (controlled !== undefined || !loop || reduced || auto !== 'done') return;
    const t = setTimeout(() => { setAuto('scanning'); setRun(r => r + 1); }, 2600);
    return () => clearTimeout(t);
  }, [auto, controlled, loop, reduced]);

  const hitKeys = new Set(fields.slice(0, revealed).map(f => f.key));
  const status = phase === 'idle' ? <Badge tone="neutral" size="sm">Waiting</Badge>
    : phase === 'scanning' ? <Badge tone="brand" size="sm" live>Extracting</Badge>
    : <Badge tone="ok" size="sm" variant="surface">Done · {fields.length} fields</Badge>;

  return (
    <div className="dtx-scan" data-phase={phase} role="img" aria-label={`${engine} extracted ${fields.length} fields from ${fileName}`}>
      <div className="dtx-scan__head"><b>{engine}</b>{fileName}{status}</div>
      <div className="dtx-scan__body">
        <ScanBeam key={run} className="dtx-scan__doc" active={phase === 'scanning'} duration={scanMs} band={36}>
          <h4>{title}</h4>
          {rows.map((r, i) => 'rule' in r
            ? <hr key={i} className="dtx-scan__rule" />
            : <div key={i} className={r.strong ? 'dtx-scan__row dtx-scan__row--strong' : 'dtx-scan__row'} data-hit={r.field && hitKeys.has(r.field) ? '' : undefined}><span>{r.label}</span><span>{r.value}</span></div>)}
        </ScanBeam>
        <div className="dtx-scan__fields" aria-hidden>
          {fields.map((f, i) => i < revealed
            ? <div key={`${run}-${f.key}`} className="dtx-scan__field"><small>{f.key}<i data-low={f.confidence < lowConfidence ? '' : undefined}>{f.confidence.toFixed(1)}%</i></small><div>{f.value}</div></div>
            : <div key={`ph-${f.key}`} className="dtx-scan__placeholder" />)}
        </div>
      </div>
    </div>
  );
}
