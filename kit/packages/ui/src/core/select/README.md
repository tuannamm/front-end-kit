# Select · MultiSelect

One API for every dropdown. A flat list, groups, icons, descriptions and search can be mixed freely.

```tsx
import { Select, MultiSelect, Field } from '@dtx/ui';

<Field label="Loại hồ sơ">
  <Select items={types} value={type} onValueChange={setType} />
</Field>

<Select searchable items={[{ label: 'Bảo hiểm', items: insurance }, { label: 'Ngân hàng', items: banks }]} aria-label="Đối tác" />

<MultiSelect items={tags} value={selected} onValueChange={setSelected} aria-label="Nhãn" />
```

## Notes

- Without search it is a Base UI Select (typeahead works). With `searchable` it is a Base UI Combobox,
  with the search input inside the popup.
- Search ignores accents: "bao hiem" matches "Bảo hiểm" (and đ matches d). It searches the label and the description.
- MultiSelect shows chips in the trigger. Typing filters the list, Backspace removes the last chip, and ←/→ move between chips.
- Without a visible `<Field label>`, pass `aria-label`.
- The popup sits at z-index 65, above Dialog and Drawer (60–61), so a Select inside them opens on top.
  DatePicker, DateRangePicker and Tooltip reuse `.dtx-select-positioner` and `.dtx-select-popup`.
- On touch devices the MultiSelect input is 16px, so iOS does not zoom in.

## Files

- `select.tsx`: Select, MultiSelect, `SelectOption`, `SelectGroup`
- `select.css`: `.dtx-select-*`, `.dtx-chips`, `.dtx-ms*`. Load it after `badge.css` (chips are badges)
  and before `date-picker.css` (which resizes the popup).

Catalog: `#/catalog/select`, `#/catalog/multiselect`

Props are documented in TSDoc on the types in the `.tsx`; this file covers usage and decisions only.
