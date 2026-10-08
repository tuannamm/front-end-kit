# AI · OCR

`OcrShowcase` plays an OCR pipeline from engine JSON: raw page → preprocessing → detection → recognition → layout →
extraction. `normalizeOcr` turns an `OcrDocument` into 0–1 boxes and 0–100 confidence.

```tsx
import { OcrShowcase, type OcrDocument } from '@dtx/ui';

<OcrShowcase data={engineJson} stages={['unwarp', 'binarize', 'detect', 'recognize', 'extract']} />
```

## Props

### OcrShowcase

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `OcrDocument \| NormalizedOcr` | **required** | Engine output, or already normalised |
| `page` | `ReactNode` |  | Page to render when `data.image` is absent, e.g. `<SampleInvoice/>` |
| `stages` | `OcrStage[]` | `['unwarp', 'binarize', 'detect', 'recognize', 'extract']` | Any of crop, unwarp, deskew, denoise, binarize, grayscale, detect, recognize, layout, extract |
| `stage` | `number` |  | Controlled stage index (0 = raw input). Leave out for the built-in player |
| `onStageChange` | `(i: number) => void` |  | Stage changed |
| `autoPlay` | `boolean` | `true` | Built-in player starts on mount |
| `loop` | `boolean` | `true` | Start over after the last stage |
| `interval` | `number` | `1800` | ms per stage |
| `scan` | `boolean` | `true` | Scan beam over the page during detection |
| `thresholds` | `Thresholds` | `{ high: 95, low: 80 }` | Confidence levels |
| `title` | `string` |  | Heading of the player |

### OcrDocument

| Prop | Type | Default | Description |
|---|---|---|---|
| `lines` | `{ id?, text, confidence, box, kind? }[]` | **required** | OCR_det + OCR_rec, one per line or word; confidence 0–1 or 0–100 |
| `image` | `{ src: string; width: number; height: number }` |  | The page image |
| `units` | `'px' \| 'normalized'` | `'px'` | Unit of every `box` |
| `regions` | `{ id?, kind, box, label? }[]` |  | Layout analysis |
| `fields` | `{ key, label?, value, confidence, lineId? }[]` |  | Extraction; `lineId` links a field to its line |
| `fileName` | `string` |  | Shown in the player |
| `engine` | `string` |  | Engine name |

A `box` is any shape engines emit: `[x, y, w, h]`, `{ x, y, w, h }`, `{ x1, y1, x2, y2 }` or a polygon.

## Files

- `showcase.tsx`: OcrShowcase, `ocrStageLabels`
- `types.ts` + `types.check.ts`: `OcrDocument`, `NormalizedOcr`, `normalizeOcr` and its node check
- `ocr.css`
