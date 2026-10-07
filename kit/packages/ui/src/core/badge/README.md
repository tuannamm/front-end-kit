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

## Files

- `badge.tsx`: Badge, Counter, ProgressRing, Kbd, IconTile, `Tone`
- `badge.css`: `.dtx-badge*`, `.dtx-tone-*`, `.dtx-dot`, `.dtx-ring`, `.dtx-kbd`, `.dtx-icon-tile`

Catalog: `#/catalog/badge`, `#/catalog/counter`

Props are documented in TSDoc on the types in the `.tsx`; this file covers usage and decisions only.
