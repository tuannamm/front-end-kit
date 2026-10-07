# AI · Shared

Pieces several AI tasks reuse: bounding boxes over a page, confidence, before/after comparison, the scan beam and a
synthetic sample page.

```tsx
import { BoxOverlay, ScanBeam, CompareSlider, ConfidenceBadge } from '@dtx/ui';

<ScanBeam><BoxOverlay boxes={lines}><img src={page} alt="Trang 1" /></BoxOverlay></ScanBeam>
<CompareSlider before={<img src={raw} alt="Bản gốc" />} after={<img src={clean} alt="Đã xử lý" />} />
```

## Props

### BoxOverlay

| Prop | Type | Default | Description |
|---|---|---|---|
| `boxes` | `OcrBox[]` | **required** | Boxes in 0–1 fractions of the page |
| `children` | `ReactNode` | **required** | The page underneath (`<img>`, `<canvas>`, `<SampleInvoice/>`); drawn again inside the lens |
| `colorBy` | `'confidence' \| 'kind' \| 'plain'` | `'confidence'` | Blue/amber/red by score, layout palette, or neutral (detection only) |
| `hover` | `'lens' \| 'blink'` | `'lens'` | How a hovered box compares the AI text with the original |
| `showLabels` | `boolean` |  | Region tags (with `colorBy="kind"`) |
| `thresholds` | `Thresholds` | `{ high: 95, low: 80 }` | Confidence levels |
| `selectedId` | `string \| null` |  | Box drawn as selected |
| `onSelect` | `(box: OcrBox) => void` |  | A box was clicked or pressed |
| `animate` | `boolean` | `true` | Staggered draw-in on mount; change `key` to replay |
| `hideText` | `boolean` |  | Detection stage: no recognised text yet, hover only highlights |
| `pinnedId` | `string \| null` |  | Show this box in its hover state without a pointer (docs, screenshots) |
| `textInset` | `number` | `2` | px between a box edge and its first glyph; lines the AI text up in the lens |
| `className` | `string` |  | Extra classes |

### OcrBox

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Stable key |
| `x` | `number` | **required** | Left, 0–1 of the page width |
| `y` | `number` | **required** | Top, 0–1 of the page height |
| `w` | `number` | **required** | Width, 0–1 |
| `h` | `number` | **required** | Height, 0–1 |
| `text` | `string` |  | Recognised text |
| `confidence` | `number` |  | 0–100 |
| `kind` | `'title' \| 'text' \| 'table' \| 'figure' \| 'stamp' \| 'signature' \| 'field'` |  | Layout region kind |
| `label` | `string` |  | Tag text; defaults to the kind's name |

### ConfidenceBadge

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | **required** | 0–100 |
| `thresholds` | `Thresholds` | `{ high: 95, low: 80 }` | ≥ high is high, < low is low |
| `showLabel` | `boolean` |  | Adds the review hint ("Cần kiểm tra") for QC screens |
| `size` | `'sm' \| 'md'` | `'sm'` | Badge size |

### ConfidenceBar

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | **required** | 0–100 |
| `thresholds` | `Thresholds` | `{ high: 95, low: 80 }` | Also drawn as ticks on the bar |

### ConfidenceDots

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | **required** | 0–100; 99 → 5 dots, 95 → 4, 90 → 3, 85 → 2, ≤ 80 → 1 |
| `thresholds` | `Thresholds` | `{ high: 95, low: 80 }` | Colour levels |

### CompareSlider

| Prop | Type | Default | Description |
|---|---|---|---|
| `before` | `ReactNode` | **required** | Raw page |
| `after` | `ReactNode` | **required** | Processed page, same size |
| `defaultValue` | `number` | `50` | Start position, % from the left |
| `beforeLabel` | `string` | `'Bản gốc'` | Tag on the left |
| `afterLabel` | `string` | `'Đã xử lý'` | Tag on the right |

### ScanBeam

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` |  | Content under the beam; with `before`, the page revealed behind it |
| `after` | `ReactNode` |  | Same as `children`, to pair with `before` |
| `before` | `ReactNode` |  | Page shown ahead of the beam: a wipe from `before` to `children` |
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | Top → bottom, or left → right |
| `duration` | `number` | `2400` | ms per pass |
| `repeat` | `number \| 'infinite'` | `1` | Passes; content reveals on the first |
| `active` | `boolean` | `true` | Show and play; change `key` to replay |
| `reveal` | `'progressive' \| 'whole' \| 'none'` | `'progressive'` | How content inside appears: drawn under the line, popped in when touched, or at once |
| `beam` | `boolean` | `true` | `false` hides the line and keeps the reveal (a pure wipe) |
| `band` | `number` | `48` | Glow thickness in px |
| `onEnd` | `() => void` |  | After the last pass |
| `className` | `string` |  | Extra classes |

### ScanReveal

| Prop | Type | Default | Description |
|---|---|---|---|
| `x` | `number` | **required** | Left, 0–1 of the beam area |
| `y` | `number` | **required** | Top, 0–1 |
| `w` | `number` | **required** | Width, 0–1 |
| `h` | `number` | **required** | Height, 0–1 |
| `children` | `ReactNode` | **required** | Revealed when the beam reaches it |
| `position` | `boolean` | `true` | Place it absolutely from x/y/w/h; `false` if you position it yourself |
| `className` | `string` |  | Extra classes |

### SampleInvoice

| Prop | Type | Default | Description |
|---|---|---|---|
| `onBoxes` | `(boxes: OcrBox[]) => void` |  | Measured line boxes (with text and confidence) once fonts are ready |
| `className` | `string` |  | Extra classes |

## Files

- `box-overlay.tsx`: BoxOverlay, `OcrBox`, `regionLabels`
- `confidence.tsx`: ConfidenceBadge, ConfidenceBar, ConfidenceDots, `confidenceLevel`, `defaultThresholds`
- `compare-slider.tsx`: CompareSlider
- `scan-beam.tsx`: ScanBeam, ScanReveal, `useScanBeam`, `scanRevealProps`
- `sample-invoice.tsx`: SampleInvoice, `sampleInvoiceRegions`, `sampleInvoiceInset`
- `geometry.ts`: `toBox` (any engine box shape → 0–1 box)
- `shared.css`
