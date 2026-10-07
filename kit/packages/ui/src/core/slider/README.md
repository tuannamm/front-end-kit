# Slider

Pick one value or a range on a track: a confidence threshold, a page range, a budget. For an exact number that people
type, use an `Input` instead.

```tsx
import { Field, Slider } from '@dtx/ui';

<Field label="Ngưỡng tin cậy tối thiểu">
  <Slider value={threshold} onValueChange={setThreshold} onValueCommitted={save} max={100} format={{ style: 'unit', unit: 'percent' }} />
</Field>

// a range: pass [from, to]
<Slider aria-label="Số trang" defaultValue={[500, 3000]} max={5000} step={100} />
```

## Notes

- Built on the Base UI Slider. ←/→ (and ↑/↓) move one `step`, Page Up/Down and Shift+arrow move `largeStep`, Home/End
  jump to the ends. Pressing anywhere on the row moves the nearest thumb there.
- `onValueChange` runs on every move; `onValueCommitted` runs once on release or key press. Fetch or save there.
- `format` takes `Intl.NumberFormatOptions` and applies to the readout and to what screen readers hear
  (`aria-valuetext`). Numbers use Vietnamese grouping ("1.000.000 ₫").
- The readout on the right keeps a fixed width (the widest end value), so the track does not resize while dragging.
- Inside `<Field label>` the label names the slider. Without one, pass `aria-label`. A range's thumbs are named
  "Từ" and "Đến" (`thumbLabels`), prefixed with `aria-label` when there is one.
- The thumb is 18px with a 30px hit area; the whole 32px row takes a press.

## Props

### Slider

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number \| number[]` |  | Controlled value; `[from, to]` for a range |
| `defaultValue` | `number \| number[]` |  | Initial value when uncontrolled |
| `onValueChange` | `(value) => void` |  | Every move |
| `onValueCommitted` | `(value) => void` |  | Once, on release or key press |
| `min` | `number` | `0` |  |
| `max` | `number` | `100` |  |
| `step` | `number` | `1` |  |
| `largeStep` | `number` | `10` | Page Up/Down and Shift+arrow |
| `format` | `Intl.NumberFormatOptions` |  | Readout and `aria-valuetext` format |
| `showValue` | `boolean` | `true` | The value readout on the right |
| `thumbLabels` | `[string, string]` | `['Từ', 'Đến']` | Names of a range's two thumbs |
| `disabled` | `boolean` |  |  |
| `name` | `string` |  | Form field name |
| `aria-label` | `string` |  | Accessible name when there is no visible `<Field label>` |
| `className` | `string` |  | Extra classes |

## Files

- `slider.tsx`: Slider
- `slider.css`: `.dtx-slider*`

Catalog: `#/catalog/slider`
