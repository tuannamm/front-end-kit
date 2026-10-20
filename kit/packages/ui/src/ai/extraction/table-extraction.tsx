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

import type { ReactNode } from 'react';
import { cx } from '../../cx';
import { BoxOverlay, type OcrBox } from '../shared/box-overlay';
import { confidenceLevel, confidenceWord, defaultThresholds, type Thresholds } from '../shared/confidence';
import { FieldLink } from './field-link';
import { tableGrid } from './table-grid';

/** One detected cell: its place in the grid (0-based, spans default 1) and its box on the page. `id` defaults to `r<row>c<col>`. */
export type TableCell = Omit<OcrBox, 'id'> & { id?: string; row: number; col: number; rowSpan?: number; colSpan?: number; header?: boolean };

export type TableExtractionProps = {
  cells: TableCell[];
  /** The page underneath the grid: <img>, <canvas>, <SampleInvoice/>… */
  page: ReactNode;
  caption?: string;
  thresholds?: Thresholds;
  /** Cell id linked while nothing is hovered or focused: a selection, or a static state for docs. */
  linked?: string | null;
  className?: string;
};

const tone = { medium: 'warn', low: 'err' } as const;

/**
 * A detected table, checked cell by cell: the cell grid over the page, coloured by confidence, beside the table rebuilt
 * from the cells. A cell below the high threshold shows its score; hovering a cell on either side links it to its twin.
 */
export function TableExtraction({ cells, page, caption, thresholds = defaultThresholds, linked = null, className }: TableExtractionProps) {
  const boxes = cells.map(c => ({ ...c, id: c.id ?? `r${c.row}c${c.col}` }));
  const level = (c: TableCell) => confidenceLevel(c.confidence ?? 100, thresholds);
  const review = boxes.filter(c => level(c) !== 'high').length;
  return (
    <FieldLink linked={linked} className={cx('dtx-tablex', className)}>
      <BoxOverlay boxes={boxes} thresholds={thresholds}>{page}</BoxOverlay>
      <div className="dtx-tablex__side">
        <div className="dtx-table-wrap">
          <table className="dtx-tablex__table">
            {caption && <caption>{caption}</caption>}
            <tbody>
              {tableGrid(boxes).map((row, r) => (
                <tr key={r}>
                  {row.map((c, i) => {
                    if (!c) return <td key={`hole-${i}`} />;
                    const lv = level(c), Cell = c.header ? 'th' : 'td';
                    return (
                      <Cell key={c.id} data-source={c.id} rowSpan={c.rowSpan} colSpan={c.colSpan} data-review={lv === 'high' ? undefined : ''} className={lv === 'high' ? undefined : `dtx-tone-${tone[lv]}`}>
                        {c.text}
                        {lv !== 'high' && <span className="dtx-tablex__conf dtx-num">{c.confidence!.toFixed(1)}%<span className="dtx-sr"> · {confidenceWord[lv]}</span></span>}
                      </Cell>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="dtx-tablex__sum">Cells <b className="dtx-num">{boxes.length}</b> · Needs review <b className="dtx-num">{review}</b></p>
      </div>
    </FieldLink>
  );
}
