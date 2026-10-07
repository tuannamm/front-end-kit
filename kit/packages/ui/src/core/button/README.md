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

## Props

### Button

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Visual weight; see the variant table above |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 32 · 40 · 48px tall. `lg` is 19px bold, the only size where brand blue carries white text |
| `icon` | `boolean` |  | Square icon-only button. Always pass `aria-label` |
| `href` | `string` |  | Renders an `<a>` instead of a `<button>` |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button only. Set `submit` explicitly in forms |
| `children` | `ReactNode` |  | Label, optionally with a leading icon |
| `className` | `string` |  | Extra classes |

Plus every `<button>` prop, or every `<a>` prop when `href` is set.

## Files

- `button.tsx`: component
- `button.css`: `.dtx-btn*`

Catalog: `#/catalog/button`
