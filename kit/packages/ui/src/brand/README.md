# Brand

DIGI-TEXX identity pieces from the Branding Guidelines PDF: logo, headline type, the tech backdrop and the theme switch.

```tsx
import { Logo, Display, Lede, TechBackdrop } from '@dtx/ui';

<TechBackdrop><Logo variant="horizontal-white" /><Display>Số hoá <em>thông minh</em></Display><Lede>…</Lede></TechBackdrop>
```

## Props

### Logo

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'horizontal' \| 'horizontal-white' \| 'square' \| 'square-on-blue'` | `'horizontal'` | Pick by background: light, dark, avatar/favicon, on brand blue. Never recoloured |
| `width` | `number` | `150` (square `38`) | px; never below 120 (square 38) |

### ThemeToggle

No props. Cycles system → light → dark and stores the choice in the browser (`useTheme()`).

### TechBackdrop

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | **required** | Content of the band; always on the dark theme |
| `circuit` | `boolean` | `true` | Circuit traces that draw in on load |
| `className` | `string` |  | Extra classes |

### Display

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | **required** | Hero headline, Roboto Bold Italic uppercase; wrap accent words in `<em>` |
| `as` | `'h1' \| 'h2' \| 'p'` | `'h1'` | Element |

### Lede

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | **required** | Intro paragraph under a Display |

### SectionHeader

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | **required** | Rendered as an `<h2>` with the brand bar |
| `description` | `ReactNode` |  | Paragraph under the title |
| `id` | `string` |  | Id of the heading |

### Eyebrow

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | **required** | Small tracked label |

### HexIcon

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | **required** | Icon inside the hexagon; decorative |

## Files

- `logo.tsx`: Logo, `mascotUrl`
- `type.tsx`: Display, Lede, SectionHeader, Eyebrow, HexIcon
- `tech-backdrop.tsx`: TechBackdrop
- `theme.tsx`: ThemeToggle, useTheme
- Logo files: `../assets/`
