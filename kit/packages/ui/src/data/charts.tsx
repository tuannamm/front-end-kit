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
 
 */

import type { CSSProperties } from 'react';

/** Area sparkline scaled to its own min/max. */
export function Sparkline({ data, label }: { data: number[]; label?: string }) {
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pts = data.map((v, i) => `${(i * 100) / (data.length - 1)},${(26 - ((v - min) / span) * 24).toFixed(1)}`).join(' ');
  return (
    <svg className="dtx-spark" viewBox="0 0 100 28" preserveAspectRatio="none" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <polyline points={`0,28 ${pts} 100,28`} fill="rgb(37 130 215 / .12)" stroke="none" />
      <polyline points={pts} fill="none" stroke="var(--dtx-primary)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Linear bar against a target marker. min/max set the visible scale. */
export function TargetBar({ value, target, min = 0, max = 100, label }: { value: number; target: number; min?: number; max?: number; label: string }) {
  const pct = (v: number) => `${Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100))}%`;
  return <div className="dtx-target" role="img" aria-label={label}><i style={{ width: pct(value) }} /><u style={{ left: pct(target) }} /></div>;
}

export type Segment = { value: number; color: string; label: string };
/** Proportional split (Tremor category bar). Tiny segments keep a visible minimum width. */
export function CategoryBar({ segments, legend }: { segments: Segment[]; legend?: boolean }) {
  const label = segments.map(s => `${s.value} ${s.label}`).join(', ');
  return (
    <div>
      <div className="dtx-catbar" role="img" aria-label={label}>
        {segments.map(s => <i key={s.label} style={{ flex: s.value, minWidth: 6, background: s.color }} />)}
      </div>
      {legend && <div className="dtx-legend" style={{ marginTop: 8 }}>{segments.map(s => <span key={s.label} style={{ '--k': s.color } as CSSProperties}>{s.label}</span>)}</div>}
    </div>
  );
}

/** Thin progress meter (queues, uploads). value: 0–100. */
export function Meter({ value, label }: { value: number; label: string }) {
  return <div className="dtx-meter" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}><i style={{ width: `${value}%` }} /></div>;
}

export type Series = { name: string; color: string; data: number[] };
/** Stacked column chart; one scale drives bars, gridlines and labels. */
export function StackedBarChart({ labels, series, max, step, height = 220, label }: { labels: string[]; series: Series[]; max?: number; step?: number; height?: number; label: string }) {
  const totals = labels.map((_, i) => series.reduce((s, x) => s + x.data[i], 0));
  const top = max ?? Math.ceil(Math.max(...totals) / 1000) * 1000;
  const tick = step ?? top / 4;
  const W = 640, H = height, L = 44, R = 8, T = 10, B = 26;
  const y = (v: number) => T + (H - T - B) * (1 - v / top);
  const bw = (W - L - R) / labels.length;
  const ticks = Array.from({ length: Math.floor(top / tick) + 1 }, (_, i) => i * tick);
  return (
    <div>
      <svg className="dtx-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        {ticks.map(v => (
          <g key={v}>
            <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="var(--dtx-border)" />
            <text x={L - 8} y={y(v) + 4} textAnchor="end">{v >= 1000 ? `${v / 1000}k` : v}</text>
          </g>
        ))}
        {labels.map((lab, i) => {
          const x = L + i * bw + bw * .2, w = bw * .6;
          let acc = 0;
          return (
            <g key={lab}>
              {series.map(s => {
                const y0 = y(acc), y1 = y(acc + s.data[i]); acc += s.data[i];
                return <rect key={s.name} x={x} y={y1} width={w} height={Math.max(0, y0 - y1 - 1)} rx="2" fill={s.color} style={{ animationDelay: `${i * 40}ms` }}><title>{`${lab}: ${s.data[i]} ${s.name}`}</title></rect>;
              })}
              <text x={x + w / 2} y={H - 8} textAnchor="middle">{lab}</text>
            </g>
          );
        })}
      </svg>
      <div className="dtx-legend">{series.map(s => <span key={s.name} style={{ '--k': s.color } as CSSProperties}>{s.name}</span>)}</div>
    </div>
  );
}
