# Icon

Puts a lucide-react icon on the kit's size scale and tones.

```tsx
import { Icon } from '@dtx/ui';
import { Upload, CircleAlert } from 'lucide-react';

<Icon icon={Upload} />                                     // decorative, 16px, text colour
<Icon icon={CircleAlert} tone="err" label="Có lỗi" />      // stands alone: give it a name
```

Sizes: `xs 12 · sm 14 · md 16 · lg 20 · xl 24` px. Tones: any `Tone` from `badge/`, or `muted`.

## Notes

- Decorative by default: the icon is hidden from assistive tech. Give it a `label` only when no text next to it
  says what it means. Add a Tooltip with the same words for sighted users.
- Inside Button, Badge and other kit parts, the part sets the size. A bare lucide icon works there too.
- `vertical-align: -.125em` keeps an inline icon on the x-height. Tailwind preflight would otherwise make it a block.

## Props

### Icon

| Prop | Type | Default | Description |
|---|---|---|---|
| `icon` | `LucideIcon` | **required** | A lucide-react icon, e.g. `Upload` |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 12 · 14 · 16 · 20 · 24px |
| `tone` | `Tone \| 'muted'` |  | Default: the colour of the surrounding text |
| `label` | `string` |  | Accessible name. Without it the icon is decorative |
| `className` | `string` |  | Extra classes |

## Files

- `icon.tsx`: component
- `icon.css`: `.dtx-icon*`

Catalog: `#/catalog/icon`
