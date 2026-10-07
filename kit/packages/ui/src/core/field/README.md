# Field · Input · Textarea

`Field` wraps any control with a label, a description and an error. Base UI Field connects them for screen readers.
`Input` is the styled text input; `Textarea` is its multi-line version.

```tsx
import { Field, Input } from '@dtx/ui';

<Field label="Họ và tên" description="Như trên CCCD" error={errors.name}>
  <Input name="name" required />
</Field>

<Field label="Lý do từ chối" description="Đội scan sẽ thấy ghi chú này.">
  <Textarea name="reason" maxLength={500} />
</Field>
```

## Notes

- When `error` is set, it replaces the description and marks the field invalid (red border on `Input`).
- Inputs are 40px tall. The focus state is a blue ring with a soft glow (`:focus-visible` only).
- `.dtx-field`, `.dtx-field__label`, `__desc` and `__error` are shared: Checkbox/Radio groups, DatePicker,
  DateRangePicker and FileDropzone use them for the same layout.
- `Textarea` starts at `rows` lines (3) and grows with its text up to `maxRows` (12), then scrolls. Growth uses CSS
  `field-sizing: content` (Chromium). Safari and Firefox keep the `rows` height with a resize handle.
- `maxLength` adds a "120 / 500" counter that turns darker in the last 10%. Screen readers hear "Còn N ký tự" only in
  the last 20 characters, and once at the limit; the browser itself stops input there.
- On touch devices `Input` and `Textarea` use 16px text, so iOS does not zoom in.
- The `:focus-visible` rule also styles `.dtx-select-trigger`, so Select and Input focus look the same.

## Props

### Field

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | **required** | Visible label, linked to the control |
| `children` | `ReactNode` | **required** | The control: Input, Select, DatePicker… |
| `description` | `ReactNode` |  | Hint under the control. Hidden while `error` is set |
| `error` | `ReactNode` |  | Error message. Marks the field invalid |
| `className` | `string` |  | Extra classes |

### Input

| Prop | Type | Default | Description |
|---|---|---|---|
| `placeholder` | `string` |  | Example of the expected text, e.g. "Nguyễn Văn A". Never instead of a label |
| `className` | `string` |  | Extra classes |

Plus every `<input>` prop (Base UI `Input`): `value`, `onChange`, `name`, `type`, `required`…

### Textarea

| Prop | Type | Default | Description |
|---|---|---|---|
| `rows` | `number` | `3` | Starting (and minimum) height in lines |
| `maxRows` | `number` | `12` | Grows up to this many lines, then scrolls |
| `maxLength` | `number` |  | Character limit; shows the counter |
| `placeholder` | `string` |  | Example of the expected text, e.g. "Ví dụ: trang 4 bị mờ". Never instead of a label |
| `value` | `string` |  | Controlled text |
| `defaultValue` | `string` |  | Initial text when uncontrolled |
| `onChange` | `(e: ChangeEvent<HTMLTextAreaElement>) => void` |  | Every edit |
| `className` | `string` |  | Extra classes on the `<textarea>` |
| `style` | `CSSProperties` |  | Inline styles on the `<textarea>` |

Plus every `<textarea>` prop (`name`, `required`, `disabled`…). Inside `<Field>` it gets the label,
description and error wiring like `Input`.

## Files

- `field.tsx`: Field, Input, Textarea
- `field.css`: `.dtx-field*`, `.dtx-input`, `.dtx-textarea*`

Catalog: `#/catalog/input`
