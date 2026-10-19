/**
 * # DatePicker · DateRangePicker · Calendar
 *
 * Date input that you can type into or pick from a calendar. Values are always ISO strings (`'2026-10-05'`):
 * no time and no timezone, so they compare with `<` and `>`.
 *
 * ```tsx
 * import { DatePicker, DateRangePicker, Calendar, Field } from '@dgtx/ui-frek';
 *
 * <Field label="Date of birth">
 *   <DatePicker value={dob} onValueChange={setDob} max={todayIso()} name="dob" />
 * </Field>
 *
 * <DateRangePicker label="Period" value={range} onValueChange={setRange} name="period" />  // submits periodFrom / periodTo
 *
 * <Calendar value={day} onValueChange={setDay} />
 * ```
 *
 * ## Notes
 *
 * - **Typing:** use the `format` order (default `dd/MM/yyyy`) with any separator, or the digits run together
 *   (`05102026`). Year is 4 digits only. An invalid or out-of-range date reverts to the last valid value on blur.
 * - **Calendar keys:** arrows move by day or week, Home/End go to the week edges, PageUp/PageDown change the month (with Shift: the year).
 *   Alt+↓ opens the calendar from the input.
 * - **Range:** the first click sets the start and the second click sets the end, in either order. The band previews the
 *   range under the pointer or keyboard focus. A half-picked range is never emitted: closing keeps the old range.
 * - Weeks start on Monday. The grid is always 6 weeks, so its height never changes.
 * - `min`/`max` are inclusive ISO bounds. Disabled days are struck through as well as faded,
 *   because days outside the month are faded too.
 * - The popup reuses Select's positioner and popup styles, so it opens above Dialog and Drawer.
 *
 * ## Helpers (`date.ts`, pure, no DOM)
 *
 * `parseDate`, `formatDate`, `todayIso`, `addDays`, `addMonths` (clamps 31/01 + 1 month to 28/02) and `DEFAULT_DATE_FORMAT`
 * are exported. `clampDate`, `monthGrid`, `weekday` and `toIso` are internal.
 *
 * ## Props
 *
 * ### Calendar
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `value` | `string \| null` |  | Selected ISO date ('yyyy-MM-dd') |
 * | `range` | `DateRange` |  | Range mode instead of `value`. While only `from` is set, the band previews the end |
 * | `onValueChange` | `(value: string) => void` |  | Called with the clicked ISO date |
 * | `min` | `string` |  | ISO lower bound, inclusive |
 * | `max` | `string` |  | ISO upper bound, inclusive |
 * | `autoFocus` | `boolean` |  | Focuses the selected (or today's) day on mount |
 * | `className` | `string` |  | Extra classes |
 *
 * ### DatePicker
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `value` | `string \| null` |  | Controlled ISO date, or null when empty |
 * | `defaultValue` | `string \| null` | `null` | Initial value when uncontrolled |
 * | `onValueChange` | `(value: string \| null) => void` |  | Called with a valid, in-range date, or null when cleared |
 * | `min` | `string` |  | ISO lower bound, inclusive |
 * | `max` | `string` |  | ISO upper bound, inclusive |
 * | `format` | `string` | `'dd/MM/yyyy'` | How the date is shown and typed: `dd`/`d`, `MM`/`M`, `yyyy`, any separator |
 * | `placeholder` | `string` |  | Default: `format` in lower case (`dd/mm/yyyy`) |
 * | `size` | `'sm' \| 'md'` | `'md'` | 32 · 40px tall |
 * | `disabled` | `boolean` |  |  |
 * | `name` | `string` |  | Submits the ISO value in a hidden input |
 * | `aria-label` | `string` |  | Accessible name when there is no visible `<Field label>` |
 * | `className` | `string` |  | On the wrapper |
 *
 * ### DateRangePicker
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `value` | `DateRange` |  | Controlled range |
 * | `defaultValue` | `DateRange` | `{ from: null, to: null }` | Initial range when uncontrolled |
 * | `onValueChange` | `(value: DateRange) => void` |  | Called with a complete range, or an empty one when cleared |
 * | `min` | `string` |  | ISO lower bound for both ends, inclusive |
 * | `max` | `string` |  | ISO upper bound for both ends, inclusive |
 * | `format` | `string` | `'dd/MM/yyyy'` | Display pattern, as DatePicker |
 * | `placeholder` | `string` | `'Pick date range'` |  |
 * | `size` | `'sm' \| 'md'` | `'md'` | 32 · 40px tall |
 * | `disabled` | `boolean` |  |  |
 * | `label` | `ReactNode` |  | Visible label. Without it, pass `aria-label` |
 * | `aria-label` | `string` |  | Accessible name when there is no `label` |
 * | `description` | `ReactNode` |  | Hint under the bar. Hidden while `error` is set |
 * | `error` | `ReactNode` |  | Error message. Marks the bar invalid |
 * | `name` | `string` |  | Submits `${name}From` and `${name}To` (ISO) in hidden inputs |
 * | `className` | `string` |  | On the field wrapper |
 *
 * ### DateRange
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `from` | `string \| null` | **required** | Start, ISO |
 * | `to` | `string \| null` | **required** | End, ISO |
 *
 * ## Files
 *
 * - `date-picker.tsx`: DatePicker, DateRangePicker, Calendar
 * - `date-picker.css`: `.dtx-date*`, `.dtx-range__icon`, `.dtx-cal*`. Load it after `select.css`.
 * - `date.ts` + `date.check.ts`: ISO date helpers and their node check
 *
 * Catalog: `#/catalog/datepicker`, `#/catalog/daterange`
 *
 * @generated from README.md in this folder. Edit the README, then run `npm run docs:sync`.
 */

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Popover } from '@base-ui/react/popover';
import { Input as BInput } from '@base-ui/react/input';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../../cx';
import { Button } from '../button/button';
import { DEFAULT_DATE_FORMAT, addDays, addMonths, clampDate, formatDate, monthGrid, parseDate, todayIso, toIso, weekday } from './date';

const WEEKDAYS: [string, string][] = [['Mo', 'Monday'], ['Tu', 'Tuesday'], ['We', 'Wednesday'], ['Th', 'Thursday'], ['Fr', 'Friday'], ['Sa', 'Saturday'], ['Su', 'Sunday']];
const longDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const inRange = (iso: string | null, min?: string, max?: string): iso is string => !!iso && (!min || iso >= min) && (!max || iso <= max);

export type DateRange = { from: string | null; to: string | null };

export type CalendarProps = {
  /** ISO date, 'yyyy-MM-dd'. */
  value?: string | null;
  /** Range mode instead of `value`. While only `from` is set, the band follows pointer/focus to preview the end. */
  range?: DateRange;
  onValueChange?: (value: string) => void;
  /** ISO bounds, inclusive. */
  min?: string;
  max?: string;
  /** Move focus to the selected (or today's) day on mount. */
  autoFocus?: boolean;
  className?: string;
};

/** Month grid, Monday first. Arrows move by day/week, Home/End to week edges, PageUp/PageDown by month (+Shift: year). */
export function Calendar({ value, range, onValueChange, min, max, autoFocus, className }: CalendarProps) {
  const anchor = value ?? range?.from ?? null;
  const [focus, setFocus] = useState(() => clampDate(anchor ?? todayIso(), min, max));
  const [hover, setHover] = useState<string | null>(null);
  const preview = !!range?.from && !range.to;
  const end = range?.to ?? (preview ? hover : null);
  const [lo, hi] = anchor && end && range ? (anchor < end ? [anchor, end] : [end, anchor]) : [null, null];
  const bandOf = (iso: string) => (!lo || !hi || lo === hi || iso < lo || iso > hi ? undefined : iso === lo ? 'start' : iso === hi ? 'end' : 'mid');
  const isSelected = (iso: string) => (range ? iso === anchor || (!preview && !!bandOf(iso)) : iso === value);
  const moved = useRef(!!autoFocus);
  const gridRef = useRef<HTMLTableElement>(null);
  const titleId = useId();
  const [y, m] = [+focus.slice(0, 4), +focus.slice(5, 7) - 1];
  const days = useMemo(() => monthGrid(y, m), [y, m]);
  const today = todayIso();

  useEffect(() => { if (anchor) setFocus(clampDate(anchor, min, max)); }, [anchor, min, max]);
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    gridRef.current?.querySelector<HTMLElement>(`[data-date="${focus}"]`)?.focus();
  }, [focus]);

  const move = (iso: string) => { moved.current = true; setFocus(clampDate(iso, min, max)); };
  const onKeyDown = (e: KeyboardEvent) => {
    const wd = weekday(focus);
    const step: Record<string, string> = {
      ArrowLeft: addDays(focus, -1), ArrowRight: addDays(focus, 1), ArrowUp: addDays(focus, -7), ArrowDown: addDays(focus, 7),
      Home: addDays(focus, -wd), End: addDays(focus, 6 - wd),
      PageUp: addMonths(focus, e.shiftKey ? -12 : -1), PageDown: addMonths(focus, e.shiftKey ? 12 : 1),
    };
    if (!(e.key in step)) return;
    e.preventDefault();
    move(step[e.key]);
  };

  return (
    <div className={cx('dtx-cal', className)}>
      <div className="dtx-cal__head">
        <button type="button" className="dtx-cal__nav" aria-label="Previous month" disabled={!!min && toIso(y, m, 0) < min} onClick={() => setFocus(clampDate(addMonths(focus, -1), min, max))}><ChevronLeft aria-hidden /></button>
        <span className="dtx-cal__title" id={titleId} aria-live="polite">Month {m + 1}, {y}</span>
        <button type="button" className="dtx-cal__nav" aria-label="Next month" disabled={!!max && toIso(y, m + 1, 1) > max} onClick={() => setFocus(clampDate(addMonths(focus, 1), min, max))}><ChevronRight aria-hidden /></button>
      </div>
      <table role="grid" ref={gridRef} aria-labelledby={titleId} aria-multiselectable={range ? true : undefined} data-preview={preview || undefined} onKeyDown={onKeyDown}>
        <thead><tr>{WEEKDAYS.map(([s, full]) => <th key={s} scope="col" abbr={full}>{s}</th>)}</tr></thead>
        <tbody>
          {[0, 1, 2, 3, 4, 5].map(r => (
            <tr key={r}>
              {days.slice(r * 7, r * 7 + 7).map(iso => (
                <td key={iso} aria-selected={isSelected(iso)} data-range={bandOf(iso)}>
                  <button
                    type="button" className="dtx-cal__day" data-date={iso} data-outside={+iso.slice(5, 7) - 1 !== m || undefined}
                    tabIndex={iso === focus ? 0 : -1} aria-current={iso === today ? 'date' : undefined} aria-label={longDate.format(new Date(`${iso}T00:00:00Z`))}
                    disabled={!inRange(iso, min, max)} onClick={() => { setFocus(iso); onValueChange?.(iso); }}
                    onMouseEnter={() => setHover(iso)} onFocus={() => setHover(iso)}
                  >{+iso.slice(8)}</button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type DatePickerProps = {
  /** ISO date 'yyyy-MM-dd', or null when empty, whatever `format` shows. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  min?: string;
  max?: string;
  /** How the date is shown and typed: dd / d, MM / M, yyyy, any separator. Default 'dd/MM/yyyy'. */
  format?: string;
  /** Default: the format in lower case ('dd/mm/yyyy'). */
  placeholder?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  /** Submits the ISO value in a hidden input. */
  name?: string;
  /** Accessible name when there is no visible <Field label>. */
  'aria-label'?: string;
  className?: string;
};

/**
 * Type the date in `format` order (any separator, or digits run together) or pick from the calendar.
 * A typed date that is invalid or out of range reverts to the last valid value on blur.
 */
export function DatePicker({ value, defaultValue = null, onValueChange, min, max, format = DEFAULT_DATE_FORMAT, placeholder = format.toLowerCase(), size = 'md', disabled, name, className, 'aria-label': ariaLabel }: DatePickerProps) {
  const [inner, setInner] = useState(defaultValue);
  const current = value === undefined ? inner : value;
  const [text, setText] = useState(formatDate(current, format));
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const today = todayIso();
  useEffect(() => setText(formatDate(current, format)), [current, format]);

  const commit = (iso: string | null) => { setInner(iso); setText(formatDate(iso, format)); if (iso !== current) onValueChange?.(iso); };
  const settle = () => { const t = text.trim(); const iso = parseDate(t, format); commit(!t ? null : inRange(iso, min, max) ? iso : current); };
  const pick = (iso: string | null) => { commit(iso); setOpen(false); };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div ref={wrapRef} className={cx('dtx-date', size === 'sm' && 'dtx-date--sm', className)}>
        <BInput
          className="dtx-input" value={text} placeholder={placeholder} inputMode="numeric" autoComplete="off" disabled={disabled} aria-label={ariaLabel}
          onChange={e => { setText(e.target.value); const iso = parseDate(e.target.value, format); if (inRange(iso, min, max) && iso !== current) { setInner(iso); onValueChange?.(iso); } }}
          onBlur={settle}
          onKeyDown={e => { if (e.key === 'Enter') settle(); if (e.key === 'ArrowDown' && e.altKey) { e.preventDefault(); setOpen(true); } }}
        />
        <Popover.Trigger className="dtx-date__btn" disabled={disabled} aria-label="Open calendar"><CalendarDays aria-hidden /></Popover.Trigger>
        {name && <input type="hidden" name={name} value={current ?? ''} />}
      </div>
      <Popover.Portal>
        <Popover.Positioner anchor={wrapRef} sideOffset={6} align="start" collisionPadding={16} className="dtx-select-positioner">
          <Popover.Popup className="dtx-select-popup dtx-date__popup" initialFocus={false} aria-label="Pick date">
            <Calendar value={current} min={min} max={max} autoFocus onValueChange={pick} />
            <div className="dtx-cal__foot">
              <Button variant="ghost" size="sm" disabled={!current} onClick={() => pick(null)}>Clear</Button>
              <Button variant="ghost" size="sm" disabled={!inRange(today, min, max)} onClick={() => pick(today)}>Today</Button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

const EMPTY: DateRange = { from: null, to: null };

export type DateRangePickerProps = {
  /** ISO dates, either may be null. Both are set together: a half-picked range is never emitted. */
  value?: DateRange;
  defaultValue?: DateRange;
  onValueChange?: (value: DateRange) => void;
  /** Optional ISO bounds for both ends, inclusive. No bounds = any date. */
  min?: string;
  max?: string;
  /** Display pattern, as DatePicker. */
  format?: string;
  placeholder?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  /** Visible label. Without it, pass `aria-label`. */
  label?: ReactNode;
  'aria-label'?: string;
  description?: ReactNode;
  error?: ReactNode;
  /** Submit as `${name}From` / `${name}To` (ISO). */
  name?: string;
  className?: string;
};

/** One bar showing “from – to”. In the calendar, the first click sets the start, the second the end (either order). */
export function DateRangePicker({ value, defaultValue = EMPTY, onValueChange, min, max, format = DEFAULT_DATE_FORMAT, placeholder = 'Pick date range', size = 'md', disabled, label, 'aria-label': ariaLabel, description, error, name, className }: DateRangePickerProps) {
  const [inner, setInner] = useState(defaultValue);
  const range = value ?? inner;
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<string | null>(null);
  const id = useId();
  const hint = error ?? description;
  const from = formatDate(range.from, format), to = formatDate(range.to, format);

  const commit = (r: DateRange) => { setInner(r); onValueChange?.(r); };
  const onOpenChange = (o: boolean) => { setOpen(o); setAnchor(null); }; // closing mid-pick keeps the old range
  const pick = (iso: string) => {
    if (!anchor) return setAnchor(iso);
    commit(anchor <= iso ? { from: anchor, to: iso } : { from: iso, to: anchor });
    onOpenChange(false);
  };

  return (
    <div className={cx('dtx-field', className)}>
      <span id={`${id}l`} className="dtx-field__label" hidden={!label}>{label ?? ariaLabel}</span>
      <Popover.Root open={open} onOpenChange={onOpenChange}>
        <Popover.Trigger
          className={cx('dtx-select-trigger', size === 'sm' && 'dtx-select-trigger--sm')} disabled={disabled}
          aria-labelledby={`${id}l ${id}v`} aria-invalid={error ? true : undefined} aria-describedby={hint ? `${id}h` : undefined}
        >
          <CalendarDays className="dtx-range__icon" aria-hidden />
          <span id={`${id}v`} className="dtx-select-value dtx-num" data-placeholder={from ? undefined : ''}>{!from || !to ? placeholder : from === to ? from : `${from} – ${to}`}</span>
          <ChevronDown className="dtx-select-chev" aria-hidden />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={6} align="start" collisionPadding={16} className="dtx-select-positioner">
            <Popover.Popup className="dtx-select-popup dtx-date__popup" initialFocus={false} aria-label="Pick date range">
              <Calendar range={anchor ? { from: anchor, to: null } : range} min={min} max={max} autoFocus onValueChange={pick} />
              <div className="dtx-cal__foot">
                <Button variant="ghost" size="sm" disabled={!range.from && !anchor} onClick={() => { commit(EMPTY); onOpenChange(false); }}>Clear</Button>
                <span className="dtx-cal__hint" aria-live="polite">{anchor ? 'Pick end date' : 'Pick start date'}</span>
              </div>
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      {hint && <p id={`${id}h`} className={cx('m-0', error ? 'dtx-field__error' : 'dtx-field__desc')}>{hint}</p>}
      {name && <><input type="hidden" name={`${name}From`} value={range.from ?? ''} /><input type="hidden" name={`${name}To`} value={range.to ?? ''} /></>}
    </div>
  );
}
