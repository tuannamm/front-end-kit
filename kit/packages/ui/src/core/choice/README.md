# Checkbox · CheckboxGroup · RadioGroup

On/off choices with a clickable label.

```tsx
import { Checkbox, CheckboxGroup, RadioGroup } from '@dtx/ui';

<Checkbox label="Tôi đồng ý với điều khoản" required error={errors.terms} />
<CheckboxGroup label="Thông báo" options={channels} selectAll="Tất cả kênh" defaultValue={['email']} />
<RadioGroup label="Hình thức" options={modes} row value={mode} onValueChange={setMode} />
```

| Use | When |
|---|---|
| `Checkbox` | One on/off choice |
| `CheckboxGroup` | Several independent choices under one legend |
| `RadioGroup` | Exactly one from a short visible list. For more than ~6 options, use Select |

## Notes

- The whole row (box + label + description) is the click target. Arrow keys move between options in a RadioGroup.
- `selectAll` adds a parent checkbox. It ticks every enabled option and shows the mixed state when only some are ticked.
- Groups render a `<fieldset>` with a `<legend>`. Errors use Base UI Field, so screen readers announce them.
- The empty box border is `--dtx-fg-muted`, not `--dtx-border-strong`. An empty box is the only cue, so it needs 3:1 (WCAG 1.4.11).
- `row`: use only for short labels.

## Props

### Checkbox

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | **required** | Clickable text next to the box |
| `description` | `ReactNode` |  | Second line under the label |
| `error` | `ReactNode` |  | Error message. Marks it invalid |
| `checked` | `boolean` |  | Controlled state |
| `defaultChecked` | `boolean` |  | Initial state when uncontrolled |
| `onCheckedChange` | `(checked: boolean) => void` |  |  |
| `indeterminate` | `boolean` |  | Mixed state: some, not all, of what it stands for is selected |
| `disabled` | `boolean` |  |  |
| `required` | `boolean` |  |  |
| `name` | `string` |  | Form field name |
| `className` | `string` |  | Extra classes |

### CheckboxGroup

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | **required** | Legend |
| `options` | `ChoiceOption[]` | **required** |  |
| `value` | `string[]` |  | Controlled values |
| `defaultValue` | `string[]` |  | Initial values when uncontrolled |
| `onValueChange` | `(value: string[]) => void` |  |  |
| `selectAll` | `ReactNode` |  | Label of a parent checkbox that ticks every enabled option |
| `description` | `ReactNode` |  | Hint under the group. Hidden while `error` is set |
| `error` | `ReactNode` |  | Error message. Marks the group invalid |
| `row` | `boolean` |  | Options side by side (short labels only) |
| `disabled` | `boolean` |  | Whole group |
| `name` | `string` |  | Form field name |
| `className` | `string` |  | Extra classes |

### RadioGroup

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | **required** | Legend |
| `options` | `ChoiceOption[]` | **required** |  |
| `value` | `string \| null` |  | Controlled value |
| `defaultValue` | `string` |  | Initial value when uncontrolled |
| `onValueChange` | `(value: string) => void` |  |  |
| `description` | `ReactNode` |  | Hint under the group. Hidden while `error` is set |
| `error` | `ReactNode` |  | Error message. Marks the group invalid |
| `row` | `boolean` |  | Options side by side (short labels only) |
| `disabled` | `boolean` |  | Whole group |
| `name` | `string` |  | Form field name |
| `className` | `string` |  | Extra classes |

### ChoiceOption

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | **required** |  |
| `label` | `ReactNode` | **required** |  |
| `description` | `ReactNode` |  | Second line under the label |
| `disabled` | `boolean` |  |  |

## Files

- `choice.tsx`: Checkbox, CheckboxGroup, RadioGroup, `ChoiceOption`
- `choice.css`: `.dtx-choices*`, `.dtx-choice*`, `.dtx-check*`, `.dtx-radio*`

Catalog: `#/catalog/checkbox`
