# Badge · Counter · ProgressRing · Kbd · IconTile

Small status labels and the helpers that sit inside them. Also owns `Tone`, the colour vocabulary that
Icon, Select and KpiCard reuse.

```tsx
import { Badge, Counter, ProgressRing, Kbd, IconTile } from '@dtx/ui';

<Badge tone="ok" dot>Hoàn tất</Badge>
<Badge tone="brand" live>Đang xử lý</Badge>
<Badge tone="neutral" onRemove={() => drop(tag)}>{tag}</Badge>
<Counter>12</Counter>
<Badge icon={<ProgressRing value={60} />}>60%</Badge>
<Kbd>⌘K</Kbd>
```

## Tones

`brand · ok · warn · err · neutral · violet`. Each tone sets `--c` (an RGB triple) and `--t` (a text token).
Every variant (`soft`, `surface`, `outline`, `solid`) mixes from these two, so one rule works in both themes.
Violet is for AI only and always sits next to blue.

## Notes

- `live`: a pulsing dot. Use it only while a process really runs.
- `pill`: use only for trend deltas. Other badges stay square, like the logo.
- `solid` on lime/amber uses ink text in both themes (`theme-fixed` in the CSS).
- The remove button is 16px with a 24px hit area (WCAG 2.5.8). Its label defaults to "Xoá".
- `ProgressRing` is decorative unless you pass `label`.

## Props

### Badge

| Prop | Type | Default | Description |
|---|---|---|---|
| `tone` | `Tone` | `'brand'` | `brand · ok · warn · err · neutral · violet` |
| `variant` | `'soft' \| 'surface' \| 'outline' \| 'solid'` | `'soft'` | Fill strength |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 18 · 22 · 26px tall |
| `pill` | `boolean` |  | Pill shape: reserve for trend deltas |
| `dot` | `boolean` |  | Leading square dot (logo motif) |
| `live` | `boolean` |  | Pulsing dot: only while a process is running. Implies `dot` |
| `icon` | `ReactNode` |  | Leading icon, sized to 12px |
| `onRemove` | `() => void` |  | Shows a remove button (24px hit area) |
| `removeLabel` | `string` | `'Xoá'` | Accessible name of the remove button |
| `children` | `ReactNode` |  | Text |
| `className` | `string` |  | Extra classes |

Plus every `<span>` prop.

### Counter

| Prop | Type | Default | Description |
|---|---|---|---|
| `tone` | `Tone` | `'neutral'` | Colour |
| `solid` | `boolean` |  | Solid fill, for counts that need attention |
| `children` | `ReactNode` | **required** | The number |
| `className` | `string` |  | Extra classes |

### ProgressRing

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | **required** | 0–100, clamped |
| `size` | `number` | `12` | Pixels |
| `label` | `string` |  | Accessible name. Without it the ring is decorative |

### Kbd

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | **required** | Key or shortcut, e.g. `⌘K` |

### IconTile

| Prop | Type | Default | Description |
|---|---|---|---|
| `tone` | `Tone` | `'brand'` | Tint of the tile and colour of the icon |
| `children` | `ReactNode` | **required** | The icon, sized to 13px |

## Files

- `badge.tsx`: Badge, Counter, ProgressRing, Kbd, IconTile, `Tone`
- `badge.css`: `.dtx-badge*`, `.dtx-tone-*`, `.dtx-dot`, `.dtx-ring`, `.dtx-kbd`, `.dtx-icon-tile`

Catalog: `#/catalog/badge`, `#/catalog/counter`
