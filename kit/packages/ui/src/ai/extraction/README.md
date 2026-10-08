# AI · Extraction

`DocumentScan`: a beam sweeps a document, each linked row highlights as the beam passes, and its extracted field
appears with a confidence score. Phases: idle → scanning → done.

```tsx
import { DocumentScan, type ScanRow, type ScanField } from '@dtx/ui';

<DocumentScan fileName="HD-0347.pdf" title="Hoá đơn GTGT" rows={rows} fields={fields} />
```

## Props

### DocumentScan

| Prop | Type | Default | Description |
|---|---|---|---|
| `fileName` | `string` | **required** | Shown above the document |
| `title` | `string` | **required** | Document title |
| `rows` | `ScanRow[]` | **required** | Lines of the document |
| `fields` | `ScanField[]` | **required** | Extracted fields, in reveal order |
| `engine` | `string` | `'DIGI-XTRACT'` | Engine name in the results panel |
| `phase` | `'idle' \| 'scanning' \| 'done'` |  | Controlled phase. Leave out to auto-play |
| `loop` | `boolean` | `true` | Restart after done (auto-play only) |
| `scanMs` | `number` | `2400` | ms per sweep |
| `lowConfidence` | `number` | `95` | Below this a field shows in the warning colour |
| `onPhaseChange` | `(phase: ScanPhase) => void` |  | Phase changed |

### ScanRow

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** | Left text |
| `value` | `string` | **required** | Right text |
| `field` | `string` |  | Key of the ScanField this row produces; it highlights under the beam |
| `strong` | `boolean` |  | Bold row, e.g. the total |
| `rule` | `true` |  | A divider instead of a row: `{ rule: true }` |

### ScanField

| Prop | Type | Default | Description |
|---|---|---|---|
| `key` | `string` | **required** | Field name |
| `value` | `string` | **required** | Extracted value |
| `confidence` | `number` | **required** | 0–100 |

## Files

- `document-scan.tsx`: DocumentScan, `ScanRow`, `ScanField`, `ScanPhase`
- `extraction.css`
