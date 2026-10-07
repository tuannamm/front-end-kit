# DatePicker · DateRangePicker · Calendar

Date input that you can type into or pick from a calendar. Values are always ISO strings (`'2026-10-05'`):
no time and no timezone, so they compare with `<` and `>`.

```tsx
import { DatePicker, DateRangePicker, Calendar, Field } from '@dtx/ui';

<Field label="Ngày sinh">
  <DatePicker value={dob} onValueChange={setDob} max={todayIso()} name="dob" />
</Field>

<DateRangePicker label="Khoảng thời gian" value={range} onValueChange={setRange} name="period" />  // submits periodFrom / periodTo

<Calendar value={day} onValueChange={setDay} />
```

## Notes

- **Typing:** use the `format` order (default `dd/MM/yyyy`) with any separator, or the digits run together
  (`05102026`). Year is 4 digits only. An invalid or out-of-range date reverts to the last valid value on blur.
- **Calendar keys:** arrows move by day or week, Home/End go to the week edges, PageUp/PageDown change the month (with Shift: the year).
  Alt+↓ opens the calendar from the input.
- **Range:** the first click sets the start and the second click sets the end, in either order. The band previews the
  range under the pointer or keyboard focus. A half-picked range is never emitted: closing keeps the old range.
- Weeks start on Monday. The grid is always 6 weeks, so its height never changes.
- `min`/`max` are inclusive ISO bounds. Disabled days are struck through as well as faded,
  because days outside the month are faded too.
- The popup reuses Select's positioner and popup styles, so it opens above Dialog and Drawer.

## Helpers (`date.ts`, pure, no DOM)

`parseDate`, `formatDate`, `todayIso`, `addDays`, `addMonths` (clamps 31/01 + 1 month to 28/02) and `DEFAULT_DATE_FORMAT`
are exported. `clampDate`, `monthGrid`, `weekday` and `toIso` are internal.

## Props

### Calendar

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string \| null` |  | Selected ISO date ('yyyy-MM-dd') |
| `range` | `DateRange` |  | Range mode instead of `value`. While only `from` is set, the band previews the end |
| `onValueChange` | `(value: string) => void` |  | Called with the clicked ISO date |
| `min` | `string` |  | ISO lower bound, inclusive |
| `max` | `string` |  | ISO upper bound, inclusive |
| `autoFocus` | `boolean` |  | Focuses the selected (or today's) day on mount |
| `className` | `string` |  | Extra classes |

### DatePicker

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string \| null` |  | Controlled ISO date, or null when empty |
| `defaultValue` | `string \| null` | `null` | Initial value when uncontrolled |
| `onValueChange` | `(value: string \| null) => void` |  | Called with a valid, in-range date, or null when cleared |
| `min` | `string` |  | ISO lower bound, inclusive |
| `max` | `string` |  | ISO upper bound, inclusive |
| `format` | `string` | `'dd/MM/yyyy'` | How the date is shown and typed: `dd`/`d`, `MM`/`M`, `yyyy`, any separator |
| `placeholder` | `string` |  | Default: `format` in lower case (`dd/mm/yyyy`) |
| `size` | `'sm' \| 'md'` | `'md'` | 32 · 40px tall |
| `disabled` | `boolean` |  |  |
| `name` | `string` |  | Submits the ISO value in a hidden input |
| `aria-label` | `string` |  | Accessible name when there is no visible `<Field label>` |
| `className` | `string` |  | On the wrapper |

### DateRangePicker

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `DateRange` |  | Controlled range |
| `defaultValue` | `DateRange` | `{ from: null, to: null }` | Initial range when uncontrolled |
| `onValueChange` | `(value: DateRange) => void` |  | Called with a complete range, or an empty one when cleared |
| `min` | `string` |  | ISO lower bound for both ends, inclusive |
| `max` | `string` |  | ISO upper bound for both ends, inclusive |
| `format` | `string` | `'dd/MM/yyyy'` | Display pattern, as DatePicker |
| `placeholder` | `string` | `'Chọn khoảng ngày'` |  |
| `size` | `'sm' \| 'md'` | `'md'` | 32 · 40px tall |
| `disabled` | `boolean` |  |  |
| `label` | `ReactNode` |  | Visible label. Without it, pass `aria-label` |
| `aria-label` | `string` |  | Accessible name when there is no `label` |
| `description` | `ReactNode` |  | Hint under the bar. Hidden while `error` is set |
| `error` | `ReactNode` |  | Error message. Marks the bar invalid |
| `name` | `string` |  | Submits `${name}From` and `${name}To` (ISO) in hidden inputs |
| `className` | `string` |  | On the field wrapper |

### DateRange

| Prop | Type | Default | Description |
|---|---|---|---|
| `from` | `string \| null` | **required** | Start, ISO |
| `to` | `string \| null` | **required** | End, ISO |

## Files

- `date-picker.tsx`: DatePicker, DateRangePicker, Calendar
- `date-picker.css`: `.dtx-date*`, `.dtx-range__icon`, `.dtx-cal*`. Load it after `select.css`.
- `date.ts` + `date.check.ts`: ISO date helpers and their node check

Catalog: `#/catalog/datepicker`, `#/catalog/daterange`
