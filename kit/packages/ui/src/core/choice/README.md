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

## Files

- `choice.tsx`: Checkbox, CheckboxGroup, RadioGroup, `ChoiceOption`
- `choice.css`: `.dtx-choices*`, `.dtx-choice*`, `.dtx-check*`, `.dtx-radio*`

Catalog: `#/catalog/checkbox`

Props are documented in TSDoc on the types in the `.tsx`; this file covers usage and decisions only.
