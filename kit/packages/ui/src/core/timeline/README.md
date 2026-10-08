# Timeline

Events in order down a rail: an activity log, an audit trail, the steps of a batch or an order.

```tsx
import { Timeline } from '@dtx/ui';

// activity log, newest first
<Timeline aria-label="Hoạt động của lô HD-5517" items={[
  { title: 'Bàn giao cho khách hàng', time: '2026-10-07T09:12:00+07:00', tone: 'ok' },
  { title: 'OCR lỗi 12 trang', description: 'Ảnh mờ, đã chuyển QC thủ công.', time: '2026-10-07T08:40:00+07:00', tone: 'err' },
]} />

// progress: what is done, what runs now, what is ahead
<Timeline timeStyle="absolute" items={[
  { title: 'Tiếp nhận hồ sơ', time: '2026-10-06T08:30:00+07:00' },
  { title: 'Nhận dạng (OCR)', status: 'current' },
  { title: 'Kiểm tra chất lượng', status: 'pending' },
]} />
```

## Notes

- An `<ol>`; the order is yours (newest first for a log, oldest first for steps). For a log grouped by day, put a
  heading and a Timeline per day.
- Markers are small squares (the logo motif) in the item's `tone`, default brand blue. `icon` swaps the square for an
  icon in a hairline frame; dots and icons can mix and stay on one rail.
- `status`: `current` rings the marker and sets `aria-current="step"`; `pending` hollows it, mutes the title and dashes
  the line leading to it. Screen readers hear "Đang thực hiện" / "Chưa thực hiện" before those titles.
- Colour is never the only signal: say "lỗi", "đã bàn giao" in the title too.
- `time` renders a `<time datetime>`, "5 phút trước" or "14:32 · 07/10/2026" (`timeStyle`); the full time is in the
  hover title. An invalid time is left out. Long titles wrap; the time drops below only when the row is too narrow.

## Props

### Timeline

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `TimelineItem[]` | **required** |  |
| `timeStyle` | `'relative' \| 'absolute'` | `'relative'` | "5 phút trước" or "14:32 · 07/10/2026" |
| `aria-label` | `string` |  | Names the list when no heading above does |
| `className` | `string` |  | Extra classes |

### TimelineItem

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | **required** | What happened |
| `description` | `ReactNode` |  | Below the title: a note, a quote, a file |
| `time` | `string \| Date` |  | When (ISO or Date) |
| `tone` | `Tone` | `'brand'` | Marker colour |
| `icon` | `ReactNode` |  | Icon instead of the square dot |
| `status` | `'done' \| 'current' \| 'pending'` | `'done'` | Progress state |

## Files

- `timeline.tsx`: Timeline, `TimelineItem`
- `timeline.css`: `.dtx-timeline*`
- Time formatting: `../notification/time.ts` (`relativeTime`, `shortTime`, `fullTime`, `isoTime`)

Catalog: `#/catalog/timeline`
