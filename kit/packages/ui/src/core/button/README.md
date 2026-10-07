# Button

The kit's only button. Renders a `<button type="button">`, or an `<a>` when `href` is set.

```tsx
import { Button } from '@dtx/ui';

<Button onClick={save}>Lưu</Button>
<Button variant="secondary" href="/reports">Xem báo cáo</Button>
<Button variant="ghost" size="sm" icon aria-label="Đóng"><X /></Button>
```

| Variant | Use |
|---|---|
| `primary` | The one main action on a screen |
| `secondary` | Other actions next to the primary |
| `ghost` | Low-weight actions: toolbars, dialog footers, rows |
| `danger` | Destructive action; name the object on the label ("Xoá hồ sơ") |

## Notes

- Brand blue `#2582D7` carries white text only at `size="lg"` (19px bold). Smaller primaries use `--dtx-primary-strong` (WCAG AA).
- `icon` makes a square icon-only button. It has no visible text, so always pass `aria-label`.
- When pressed, the button scales to .97. Disabled buttons fade to 50% and do not scale.
- Child `svg` icons are sized to 16px by the button; a bare lucide icon is enough.

## Files

- `button.tsx`: component
- `button.css`: `.dtx-btn*`

Catalog: `#/catalog/button`

Props are documented in TSDoc on the types in the `.tsx`; this file covers usage and decisions only.
