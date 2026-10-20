/**
 * # Slider
 *
 * Pick one value or a range on a track: a confidence threshold, a page range, a budget. For an exact number that people
 * type, use an `Input` instead.
 *
 * ```tsx
 * import { Field, Slider } from '@dgtx/ui-frek';
 *
 * <Field label="Minimum confidence threshold">
 *   <Slider value={threshold} onValueChange={setThreshold} onValueCommitted={save} max={100} format={{ style: 'unit', unit: 'percent' }} />
 * </Field>
 *
 * // a range: pass [from, to]
 * <Slider aria-label="Pages" defaultValue={[500, 3000]} max={5000} step={100} />
 * ```
 *
 * ## Notes
 *
 * - Built on the Base UI Slider. ←/→ (and ↑/↓) move one `step`, Page Up/Down and Shift+arrow move `largeStep`, Home/End
 *   jump to the ends. Pressing anywhere on the row moves the nearest thumb there.
 * - `onValueChange` runs on every move; `onValueCommitted` runs once on release or key press. Fetch or save there.
 * - `format` takes `Intl.NumberFormatOptions` and applies to the readout and to what screen readers hear
 *   (`aria-valuetext`). Numbers use Vietnamese grouping ("1.000.000 ₫").
 * - The readout on the right keeps a fixed width (the widest end value), so the track does not resize while dragging.
 * - Inside `<Field label>` the label names the slider. Without one, pass `aria-label`. A range's thumbs are named
 *   "From" and "To" (`thumbLabels`), prefixed with `aria-label` when there is one.
 * - The thumb is 18px with a 30px hit area; the whole 32px row takes a press.
 *
 * ## Props
 *
 * ### Slider
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `value` | `number \| number[]` |  | Controlled value; `[from, to]` for a range |
 * | `defaultValue` | `number \| number[]` |  | Initial value when uncontrolled |
 * | `onValueChange` | `(value) => void` |  | Every move |
 * | `onValueCommitted` | `(value) => void` |  | Once, on release or key press |
 * | `min` | `number` | `0` |  |
 * | `max` | `number` | `100` |  |
 * | `step` | `number` | `1` |  |
 * | `largeStep` | `number` | `10` | Page Up/Down and Shift+arrow |
 * | `format` | `Intl.NumberFormatOptions` |  | Readout and `aria-valuetext` format |
 * | `showValue` | `boolean` | `true` | The value readout on the right |
 * | `thumbLabels` | `[string, string]` | `['From', 'To']` | Names of a range's two thumbs |
 * | `disabled` | `boolean` |  |  |
 * | `name` | `string` |  | Form field name |
 * | `aria-label` | `string` |  | Accessible name when there is no visible `<Field label>` |
 * | `className` | `string` |  | Extra classes |
 *
 * ## Files
 *
 * - `slider.tsx`: Slider
 * - `slider.css`: `.dtx-slider*`
 *
 * Catalog: `#/catalog/slider`
 *
 
 */

import { Slider as BSlider } from '@base-ui/react/slider';
import { cx } from '../../cx';

export type SliderProps<V extends number | number[]> = {
  /** A number for one thumb, [from, to] for a range. */
  value?: V;
  defaultValue?: V;
  /** Runs on every move. */
  onValueChange?: (value: V) => void;
  /** Runs once the thumb is released or a key is pressed: the place to fetch or save. */
  onValueCommitted?: (value: V) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Step for Page Up/Down and Shift+arrow. */
  largeStep?: number;
  /** How values read on screen and to screen readers, e.g. `{ style: 'currency', currency: 'VND' }`. */
  format?: Intl.NumberFormatOptions;
  /** The value(s) to the right of the track. */
  showValue?: boolean;
  /** Names of a range's two thumbs. */
  thumbLabels?: [string, string];
  disabled?: boolean;
  /** Form field name; a range submits one entry per thumb. */
  name?: string;
  /** Accessible name when there is no visible <Field label>. */
  'aria-label'?: string;
  className?: string;
};

const LOCALE = 'en-US';

/**
 * One value or a range on a track. Arrow keys step, Page Up/Down and Shift+arrow take `largeStep`, Home/End jump
 * to the ends. Inside <Field> the label names it. The value readout keeps a fixed width so the track never resizes.
 */
export function Slider<V extends number | number[]>({ value, defaultValue, onValueChange, onValueCommitted, min = 0, max = 100, step = 1, largeStep, format, showValue = true, thumbLabels = ['From', 'To'], disabled, name, 'aria-label': label, className }: SliderProps<V>) {
  const current = value ?? defaultValue ?? min;
  const count = Array.isArray(current) ? current.length : 1;
  // widest formatted end, in ch: tabular digits are 1ch, so the readout never changes width
  const fmt = new Intl.NumberFormat(LOCALE, format);
  const w = Math.max(fmt.format(min).length, fmt.format(max).length);
  return (
    <BSlider.Root
      className={cx('dtx-slider', className)} value={value} defaultValue={defaultValue} min={min} max={max} step={step} largeStep={largeStep}
      format={format} locale={LOCALE} disabled={disabled} name={name} aria-label={label}
      onValueChange={v => onValueChange?.(v as V)} onValueCommitted={v => onValueCommitted?.(v as V)}
    >
      <BSlider.Control className="dtx-slider__control">
        <BSlider.Track className="dtx-slider__track">
          <BSlider.Indicator className="dtx-slider__range" />
          {Array.from({ length: count }, (_, i) => (
            // the formatted value only: Base UI appends an English "start range" / "end range" otherwise; the thumb's name says which end
            <BSlider.Thumb key={i} index={i} className="dtx-slider__thumb" getAriaValueText={formatted => formatted} aria-label={count > 1 ? (label ? `${label}: ${thumbLabels[i]}` : thumbLabels[i]) : label} />
          ))}
        </BSlider.Track>
      </BSlider.Control>
      {showValue && (
        <BSlider.Value className="dtx-slider__value dtx-num" style={{ minWidth: `${count * w + (count - 1) * 3}ch` }}>
          {formatted => formatted.join(' – ')}
        </BSlider.Value>
      )}
    </BSlider.Root>
  );
}
