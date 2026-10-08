# Steps

Where the user is in a sequence: a wizard, a checkout, the stages a batch goes through.

```tsx
import { Steps } from '@dtx/ui';

<Steps current={1} items={[
  { title: 'Tiếp nhận', description: '3.860 trang' },
  { title: 'Nhận dạng', subTitle: 'Còn 00:08', description: '2.140 / 3.860 trang' },
  { title: 'Kiểm tra chất lượng' },
]} />

// a failed step
<Steps current={2} status="error" items={…} />

// a wizard the user may go back and forth in
<Steps current={step} onChange={setStep} items={…} />
```

## Notes

- `current` sets every status: steps before it are finished (check), the current one is in progress (solid blue),
  the rest wait. `status` changes the current one (`'error'` shows a cross in red); an item's own `status` overrides.
- The line after a step turns blue once that step is finished.
- Horizontal (default) puts the title beside the marker and the line on the title's line. Titles never wrap there:
  when the steps do not fit the width, Steps lays itself out vertically, and back when there is room again. Measured,
  not a breakpoint, so it holds for three short steps on a phone and eight long ones on a laptop.
- `onChange` turns each step into a button (`disabled` items stay inert). Without it the steps are plain text.
- An `<ol>`; the current step has `aria-current="step"`, and every title is read with its status ("Đã xong: Tiếp
  nhận"), so the colour is never the only signal.
- `variant="outlined"` draws a hairline ring instead of a tint; `size="sm"` for toolbars and dialogs.
- For a log of past events with times, use Timeline instead.

## Props

### Steps

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `StepItem[]` | **required** |  |
| `current` | `number` | `0` | Index of the step in progress |
| `status` | `StepStatus` | `'process'` | Status of the current step: `'wait' \| 'process' \| 'finish' \| 'error'` |
| `onChange` | `(index: number) => void` |  | Makes the steps buttons |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Horizontal falls back to vertical when it does not fit |
| `size` | `'md' \| 'sm'` | `'md'` | 32px or 24px markers |
| `variant` | `'filled' \| 'outlined'` | `'filled'` | Tinted markers, or a hairline ring |
| `aria-label` | `string` |  | Names the list |
| `className` | `string` |  | Extra classes |

### StepItem

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | **required** |  |
| `subTitle` | `ReactNode` |  | Beside the title, smaller |
| `description` | `ReactNode` |  | Under the title |
| `icon` | `ReactNode` |  | Replaces the number in the marker |
| `status` | `StepStatus` |  | Overrides the status from `current` |
| `disabled` | `boolean` |  | Not clickable, even with `onChange` |

## Files

- `steps.tsx`: Steps, `StepItem`, `StepStatus`
- `steps.css`: `.dtx-steps*`

Catalog: `#/catalog/steps`
