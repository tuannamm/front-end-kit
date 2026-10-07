# Data

KPIs, tables and small charts. Every chart takes a `label`, its accessible name; numbers use tabular figures.

```tsx
import { KpiCard, Sparkline, DataTable, type Column } from '@dtx/ui';

<KpiCard label="Tài liệu xử lý hôm nay" value="48,210" viz={<Sparkline data={trend} label="Xu hướng 12 giờ" />} />
<DataTable caption="Lô gần đây" columns={columns} rows={batches} rowKey={b => b.id} />
```

## Props

### KpiCard

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** | What is measured |
| `value` | `ReactNode` | **required** | The number, e.g. `<CountUp value={48210} />` |
| `unit` | `ReactNode` |  | Smaller text after the value |
| `badge` | `ReactNode` |  | Top-right status: a Badge |
| `viz` | `ReactNode` |  | 28px visual row: Sparkline, TargetBar or CategoryBar. Fill it in every card of a row |
| `caption` | `ReactNode` |  | Line under the visual |
| `captionIcon` | `ReactNode` |  | Icon before the caption |
| `tone` | `Tone` | `'brand'` | Colours the caption icon only |

### DataTable

| Prop | Type | Default | Description |
|---|---|---|---|
| `columns` | `Column<T>[]` | **required** | Column definitions |
| `rows` | `T[]` | **required** | Data, in display order |
| `rowKey` | `(row: T) => string` | **required** | Stable key per row |
| `caption` | `string` |  | Table name for screen readers |
| `empty` | `ReactNode` | `'Chưa có dữ liệu'` | No rows: text becomes an EmptyState title; pass `<EmptyState size="sm" …>` for an icon or a way out |

### Column

| Prop | Type | Default | Description |
|---|---|---|---|
| `key` | `string` | **required** | Stable column key |
| `header` | `ReactNode` | **required** | Header cell |
| `render` | `(row: T) => ReactNode` | **required** | Cell content |
| `align` | `'left' \| 'right'` | `'left'` | Right for numbers |

### Sparkline

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `number[]` | **required** | Scaled to its own min and max |
| `label` | `string` |  | Accessible name; without it the line is decorative |

### TargetBar

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | **required** | Current value |
| `target` | `number` | **required** | Marker position |
| `min` | `number` | `0` | Start of the scale |
| `max` | `number` | `100` | End of the scale |
| `label` | `string` | **required** | Accessible name, e.g. "99,62% / mục tiêu 99,5%" |

### CategoryBar

| Prop | Type | Default | Description |
|---|---|---|---|
| `segments` | `Segment[]` | **required** | Proportional parts; tiny ones keep a 6px minimum |
| `legend` | `boolean` |  | Show the labels under the bar |

### Segment

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | **required** | Size of the part |
| `color` | `string` | **required** | CSS colour, e.g. `var(--dtx-tone-ok)` |
| `label` | `string` | **required** | Legend text and part of the accessible name |

### Meter

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | **required** | 0–100 |
| `label` | `string` | **required** | Accessible name |

### StackedBarChart

| Prop | Type | Default | Description |
|---|---|---|---|
| `labels` | `string[]` | **required** | One per column (x axis) |
| `series` | `Series[]` | **required** | Stacked bottom to top |
| `max` | `number` | highest total, rounded up to 1,000 | Top of the scale |
| `step` | `number` | `max / 4` | Gridline step |
| `height` | `number` | `220` | Chart height in px (width follows the container) |
| `label` | `string` | **required** | Accessible name of the chart |

### Series

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | **required** | Legend text |
| `color` | `string` | **required** | CSS colour |
| `data` | `number[]` | **required** | One value per label |

## Files

- `kpi-card.tsx`: KpiCard
- `table.tsx`: DataTable, `Column`
- `charts.tsx`: Sparkline, TargetBar, CategoryBar, Meter, StackedBarChart, `Segment`, `Series`
- Styles: `.dtx-kpi*`, `.dtx-table*`, `.dtx-spark`, `.dtx-target`, `.dtx-catbar`, `.dtx-meter`, `.dtx-chart`, `.dtx-legend` in `styles.css`
