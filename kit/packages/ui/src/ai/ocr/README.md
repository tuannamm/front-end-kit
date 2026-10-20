# AI · OCR

`OcrShowcase` plays an OCR pipeline from engine JSON: raw page → preprocessing → detection → recognition → layout →
extraction. `normalizeOcr` turns an `OcrDocument` into 0–1 boxes and 0–100 confidence. `BoxEditor` is the
human-in-the-loop step: a reviewer moves and resizes boxes and corrects their text. `ConfidenceHeatmap` comes before
it, for triage: the page tinted where confidence is low, so QC sees at a glance where to look.

```tsx
import { OcrShowcase, BoxEditor, ConfidenceHeatmap, type OcrDocument } from '@dgtx/ui-frek';

<OcrShowcase data={engineJson} stages={['unwarp', 'binarize', 'detect', 'recognize', 'extract']} />
<BoxEditor boxes={lines} onChange={setLines} page={<img src={page} alt="Trang 1" />} />
<ConfidenceHeatmap boxes={lines}><img src={page} alt="Trang 1" /></ConfidenceHeatmap>
```

### BoxEditor

- Click a box on the page (or Tab to it and press Enter) to select it. The selected box gets a frame: drag the frame to
  move it, drag a corner to resize it. Keyboard: arrow keys move it 1 px, Shift + arrow keys resize it from the
  bottom-right corner.
- While a box is selected its lens stays open (BoxOverlay `pinnedId`): the page crop inside the current frame above the
  current text, so the reviewer sees at once whether the box covers the whole word and whether the text matches.
- The side panel edits the text and steps through the boxes (Previous / Next).
- Controlled: every change calls `onChange` with the whole list, the edited box replaced by id. A polygon box moves and
  scales with its bounding rectangle. Confidence is left as the engine gave it.

### ConfidenceHeatmap

- Each spot of the page takes the lowest score of the boxes within `spread` of it: amber where it needs review, red
  where confidence is low, untouched where it is high or there is no text. The tint multiplies with the page, so the
  ink stays readable.
- The legend names both colours with their ranges and counts the boxes in each, so colour is never the only cue.
- Wrap a BoxOverlay to get the boxes on top: `<ConfidenceHeatmap boxes={lines}><BoxOverlay boxes={lines}>{page}</BoxOverlay></ConfidenceHeatmap>`.
  The heat steps back while a box is hovered or pinned, so the lens and the spotlight read clean.

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

### BoxEditor

| Prop | Type | Default | Description |
|---|---|---|---|
| `boxes` | `OcrBox[]` | **required** | Boxes in 0–1 fractions of the page |
| `onChange` | `(boxes: OcrBox[]) => void` | **required** | A box was moved, resized or its text corrected |
| `page` | `ReactNode` | **required** | The page underneath (`<img>`, `<SampleInvoice/>`) |
| `selectedId` | `string \| null` |  | Controlled selection. Leave out to let the editor keep it |
| `onSelect` | `(id: string \| null) => void` |  | Selection changed |
| `thresholds` | `Thresholds` | `{ high: 95, low: 80 }` | Confidence levels |
| `textInset` | `number` | `2` | Passed to BoxOverlay; lines the text up in the lens |
| `className` | `string` |  | Extra classes |

### ConfidenceHeatmap

| Prop | Type | Default | Description |
|---|---|---|---|
| `boxes` | `OcrBox[]` | **required** | Scored boxes, 0–1 of the page; boxes without `confidence` add no heat |
| `children` | `ReactNode` | **required** | The page, or a BoxOverlay around it |
| `thresholds` | `Thresholds` | `{ high: 95, low: 80 }` | Confidence levels |
| `spread` | `number` | `0.03` | How far a box's score reaches around it, 0–1 of the page width |
| `legend` | `boolean` | `true` | Colour key with box counts under the page |
| `className` | `string` |  | Extra classes |

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

A `box` is any shape engines emit: `[x, y, w, h]`, `{ x, y, w, h }`, `{ x1, y1, x2, y2 }` or a polygon (kept as
`points`, so BoxOverlay draws rotated and curved text as-is).

## Files

- `showcase.tsx`: OcrShowcase, `ocrStageLabels`
- `box-editor.tsx`: BoxEditor
- `box-edit.ts` + `box-edit.check.ts`: `editBox` (move or corner-resize a box in 0–1 units, kept on the page) and its node check
- `confidence-heatmap.tsx`: ConfidenceHeatmap
- `heat-grid.ts` + `heat-grid.check.ts`: `heatGrid` (lowest nearby score per grid cell) and its node check
- `types.ts` + `types.check.ts`: `OcrDocument`, `NormalizedOcr`, `normalizeOcr` and its node check
- `ocr.css`
