# AI · Extraction

`DocumentScan`: a beam sweeps a document, each linked row highlights as the beam passes, and its extracted field
appears with a confidence score. Phases: idle → scanning → done.

```tsx
import { DocumentScan, type ScanRow, type ScanField } from '@dtx/ui';

<DocumentScan fileName="HD-0347.pdf" title="Hoá đơn GTGT" rows={rows} fields={fields} />
```

`FieldLink`: a line from an extracted field to the box it was read from. Hover or focus a field and the line runs to
its box, in that box's colour; hover a box and it runs back to its field. Mark each field `data-source="<box id>"`;
BoxOverlay boxes already carry `data-box`. It only draws the line: the page, the field list and the layout stay yours.
Side by side, the line leaves the facing edges; stacked (a phone), it runs from the field's top to the box's bottom.

```tsx
import { FieldLink, BoxOverlay } from '@dtx/ui';

<FieldLink linked={selected} className="grid gap-16 sm:grid-cols-[1fr_240px]">
  <BoxOverlay boxes={lines} selectedId={selected}>{page}</BoxOverlay>
  <ul>{fields.map(f => <li key={f.key}><button data-source={f.lineId}>{f.label} · {f.value}</button></li>)}</ul>
</FieldLink>
```

Any element can be an end: `data-box` is just an attribute, so a table cell or a region outside BoxOverlay works too.

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

### FieldLink

| Prop | Type | Default | Description |
|---|---|---|---|
| `linked` | `string \| null` | `null` | Box id linked while nothing is hovered or focused: a selection, or a static state for docs |
| `children` | `ReactNode` | **required** | The page (BoxOverlay) and the fields marked `data-source="<box id>"` |
| `className` | `string` |  | Lay the two out here, e.g. a grid |

## Files

- `document-scan.tsx`: DocumentScan, `ScanRow`, `ScanField`, `ScanPhase`
- `field-link.tsx`: FieldLink
- `connect.ts`: the curve between a field and its box (`connect.check.ts`)
- `extraction.css`
