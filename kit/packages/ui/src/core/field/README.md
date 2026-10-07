# Field · Input

`Field` wraps any control with a label, a description and an error. Base UI Field connects them for screen readers.
`Input` is the styled text input.

```tsx
import { Field, Input } from '@dtx/ui';

<Field label="Họ và tên" description="Như trên CCCD" error={errors.name}>
  <Input name="name" required />
</Field>
```

## Notes

- When `error` is set, it replaces the description and marks the field invalid (red border on `Input`).
- Inputs are 40px tall. The focus state is a blue ring with a soft glow (`:focus-visible` only).
- `.dtx-field`, `.dtx-field__label`, `__desc` and `__error` are shared: Checkbox/Radio groups, DatePicker,
  DateRangePicker and FileDropzone use them for the same layout.
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
| `className` | `string` |  | Extra classes |

Plus every `<input>` prop (Base UI `Input`): `value`, `onChange`, `name`, `type`, `required`…

## Files

- `field.tsx`: Field, Input
- `field.css`: `.dtx-field*`, `.dtx-input`

Catalog: `#/catalog/input`
