/**
 * # Data
 *
 * KPIs, tables and small charts. Every chart takes a `label`, its accessible name; numbers use tabular figures.
 *
 * ```tsx
 * import { KpiCard, Sparkline, DataTable, type Column } from '@dgtx/ui-frek';
 *
 * <KpiCard label="Documents processed today" value="48,210" viz={<Sparkline data={trend} label="12-hour trend" />} />
 * <DataTable caption="Recent batches" columns={columns} rows={batches} rowKey={b => b.id} />
 * <LineChart label="Accuracy by day" labels={days} min={98} max={100} format={{ maximumFractionDigits: 1 }} series={[{ name: 'OCR', data: accuracy }]} />
 * <AreaChart label="Output by hour" labels={hours} stacked curve="smooth" series={[{ name: 'Automated by AI', data: ai }, { name: 'Manual', data: manual }]} />
 * ```
 *
 * ### LineChart and AreaChart
 *
 * - Drawn in SVG at the container's real width (a ResizeObserver), so 12px axis text stays 12px on a phone. Gridlines
 *   land on round numbers (1, 2, 2.5 or 5 × 10ⁿ); x labels thin out before they touch.
 * - Hover, touch or ←/→ (Home/End) on the focused chart shows a guide, a dot per series and a tooltip with every value
 *   at that label. Keyboard moves are announced. Screen readers also get the full data as a hidden table.
 * - Colour is never the only channel: each series after the first has a dash, repeated in the legend and the tooltip.
 * - `null` breaks a line; a lone value between two gaps gets a dot. Stacked areas count a gap as 0.
 * - Entrance: lines and fills are uncovered left to right (transform on a clip). Reduced motion shows the final chart.
 *
 * ## Props
 *
 * ### KpiCard
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `label` | `string` | **required** | What is measured |
 * | `value` | `ReactNode` | **required** | The number, e.g. `<CountUp value={48210} />` |
 * | `unit` | `ReactNode` |  | Smaller text after the value |
 * | `badge` | `ReactNode` |  | Top-right status: a Badge |
 * | `viz` | `ReactNode` |  | 28px visual row: Sparkline, TargetBar or CategoryBar. Fill it in every card of a row |
 * | `caption` | `ReactNode` |  | Line under the visual |
 * | `captionIcon` | `ReactNode` |  | Icon before the caption |
 * | `tone` | `Tone` | `'brand'` | Colours the caption icon only |
 *
 * ### DataTable
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `columns` | `Column<T>[]` | **required** | Column definitions |
 * | `rows` | `T[]` | **required** | Data, in display order |
 * | `rowKey` | `(row: T) => string` | **required** | Stable key per row |
 * | `caption` | `string` |  | Table name for screen readers |
 * | `empty` | `ReactNode` | `'No data yet'` | No rows: text becomes an EmptyState title; pass `<EmptyState size="sm" …>` for an icon or a way out |
 *
 * ### Column
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `key` | `string` | **required** | Stable column key |
 * | `header` | `ReactNode` | **required** | Header cell |
 * | `render` | `(row: T) => ReactNode` | **required** | Cell content |
 * | `align` | `'left' \| 'right'` | `'left'` | Right for numbers |
 *
 * ### Sparkline
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `data` | `number[]` | **required** | Scaled to its own min and max |
 * | `label` | `string` |  | Accessible name; without it the line is decorative |
 *
 * ### TargetBar
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `value` | `number` | **required** | Current value |
 * | `target` | `number` | **required** | Marker position |
 * | `min` | `number` | `0` | Start of the scale |
 * | `max` | `number` | `100` | End of the scale |
 * | `label` | `string` | **required** | Accessible name, e.g. "99.62% / target 99.5%" |
 *
 * ### CategoryBar
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `segments` | `Segment[]` | **required** | Proportional parts; tiny ones keep a 6px minimum |
 * | `legend` | `boolean` |  | Show the labels under the bar |
 *
 * ### Segment
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `value` | `number` | **required** | Size of the part |
 * | `color` | `string` | **required** | CSS colour, e.g. `var(--dtx-tone-ok)` |
 * | `label` | `string` | **required** | Legend text and part of the accessible name |
 *
 * ### Meter
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `value` | `number` | **required** | 0–100 |
 * | `label` | `string` | **required** | Accessible name |
 *
 * ### StackedBarChart
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `labels` | `string[]` | **required** | One per column (x axis) |
 * | `series` | `Series[]` | **required** | Stacked bottom to top |
 * | `max` | `number` | highest total, rounded up to 1,000 | Top of the scale |
 * | `step` | `number` | `max / 4` | Gridline step |
 * | `height` | `number` | `220` | Chart height in px (width follows the container) |
 * | `label` | `string` | **required** | Accessible name of the chart |
 *
 * ### LineChart
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `labels` | `string[]` | **required** | Ordered x values: days, hours, months. Thinned on the axis when they would touch |
 * | `series` | `ChartSeries[]` | **required** | One line each |
 * | `label` | `string` | **required** | Accessible name of the chart and caption of its screen-reader table |
 * | `height` | `number` | `240` | Plot height in px; the width follows the container |
 * | `min` | `number` | `0`, or below it for negative data | Bottom of the scale. Pass it for a tight scale, e.g. `98` for accuracy in % |
 * | `max` | `number` | highest value, rounded up to a gridline | Top of the scale; values past `min`/`max` are clipped |
 * | `format` | `Intl.NumberFormatOptions` |  | How values read in the tooltip, the axis (compact) and the table, e.g. `{ style: 'percent' }` |
 * | `curve` | `'linear' \| 'smooth'` | `'linear'` | `'smooth'` is monotone: it never draws past a peak or a dip |
 * | `legend` | `boolean` | more than one series | Names with their colour and dash under the plot |
 * | `defaultActive` | `number` |  | Label index whose readout shows at rest (e.g. the latest), and again when pointer or focus leaves |
 * | `empty` | `ReactNode` | `'No data yet'` | No labels or no values: text becomes an EmptyState title, or pass an `<EmptyState>` |
 * | `className` | `string` |  | Extra classes |
 *
 * ### AreaChart
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `labels` | `string[]` | **required** | Ordered x values |
 * | `series` | `ChartSeries[]` | **required** | One filled band each, first at the bottom when stacked |
 * | `label` | `string` | **required** | Accessible name of the chart |
 * | `stacked` | `boolean` | `false` | Pile the series up: the top edge is the total, shown in the tooltip. A gap counts as 0 |
 * | `height` | `number` | `240` | Plot height in px |
 * | `min` | `number` | `0`, or below it for negative data | Bottom of the scale; the fill runs to 0 when it is inside the scale |
 * | `max` | `number` | highest value (or total), rounded up | Top of the scale |
 * | `format` | `Intl.NumberFormatOptions` |  | Value formatting, as in LineChart |
 * | `curve` | `'linear' \| 'smooth'` | `'linear'` | Monotone smoothing |
 * | `legend` | `boolean` | more than one series | Names under the plot |
 * | `defaultActive` | `number` |  | Label index whose readout shows at rest |
 * | `empty` | `ReactNode` | `'No data yet'` | Shown when there is nothing to draw |
 * | `className` | `string` |  | Extra classes |
 *
 * ### ChartSeries
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `name` | `string` | **required** | Legend, tooltip and table text |
 * | `data` | `(number \| null)[]` | **required** | One value per label; `null` is a gap that breaks the line |
 * | `color` | `string` | next of blue, olive, violet, amber, red | CSS colour; keep it 3:1 against the page in both themes, e.g. a `--dtx-tone-*` token |
 *
 * ### Series
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `name` | `string` | **required** | Legend text |
 * | `color` | `string` | **required** | CSS colour |
 * | `data` | `number[]` | **required** | One value per label |
 *
 * ## Files
 *
 * - `kpi-card.tsx`: KpiCard
 * - `table.tsx`: DataTable, `Column`
 * - `charts.tsx`: Sparkline, TargetBar, CategoryBar, Meter, StackedBarChart, `Segment`, `Series`
 * - `xy-chart.tsx`: LineChart, AreaChart, `ChartSeries`; geometry (nice scale, monotone curve, paths with gaps) in `xy-scale.ts`, checked by `xy-scale.check.ts`
 * - Styles: `.dtx-kpi*`, `.dtx-table*`, `.dtx-spark`, `.dtx-target`, `.dtx-catbar`, `.dtx-meter`, `.dtx-chart`, `.dtx-xy*`, `.dtx-legend` in `styles.css`
 *
 * @generated from README.md in this folder. Edit the README, then run `npm run docs:sync`.
 */

import { isValidElement, type ReactNode } from 'react';
import { EmptyState } from '../core/empty-state/empty-state';

export type Column<T> = { key: string; header: ReactNode; align?: 'left' | 'right'; render: (row: T) => ReactNode };
/** Styled table: tabular numbers, hairline rows, hover. Scrolls horizontally inside its own box. */
/** `empty` shows when there are no rows: text becomes an EmptyState title; pass an <EmptyState> for an icon or a way out (e.g. a reset-filters button). */
export function DataTable<T>({ columns, rows, rowKey, caption, empty = 'No data yet' }: { columns: Column<T>[]; rows: T[]; rowKey: (r: T) => string; caption?: string; empty?: ReactNode }) {
  return (
    <>
      <div className="dtx-table-wrap">
        <table className="dtx-table">
          {caption && <caption className="dtx-sr">{caption}</caption>}
          <thead><tr>{columns.map(c => <th key={c.key} className={c.align === 'right' ? 'dtx-r' : undefined}>{c.header}</th>)}</tr></thead>
          <tbody>
            {rows.map(r => <tr key={rowKey(r)}>{columns.map(c => <td key={c.key} className={c.align === 'right' ? 'dtx-r' : undefined}>{c.render(r)}</td>)}</tr>)}
          </tbody>
        </table>
      </div>
      {/* outside the scroll box, so it stays in view when the columns are wider than the screen */}
      {!rows.length && (isValidElement(empty) ? empty : <EmptyState size="sm" title={empty} />)}
    </>
  );
}
