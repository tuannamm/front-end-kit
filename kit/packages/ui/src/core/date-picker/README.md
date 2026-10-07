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

## Files

- `date-picker.tsx`: DatePicker, DateRangePicker, Calendar
- `date-picker.css`: `.dtx-date*`, `.dtx-range__icon`, `.dtx-cal*`. Load it after `select.css`.
- `date.ts` + `date.check.ts`: ISO date helpers and their node check

Catalog: `#/catalog/datepicker`, `#/catalog/daterange`

Props are documented in TSDoc on the types in the `.tsx`; this file covers usage and decisions only.
