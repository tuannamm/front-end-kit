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

const LOCALE = 'vi-VN';

/**
 * One value or a range on a track. Arrow keys step, Page Up/Down and Shift+arrow take `largeStep`, Home/End jump
 * to the ends. Inside <Field> the label names it. The value readout keeps a fixed width so the track never resizes.
 */
export function Slider<V extends number | number[]>({ value, defaultValue, onValueChange, onValueCommitted, min = 0, max = 100, step = 1, largeStep, format, showValue = true, thumbLabels = ['Từ', 'Đến'], disabled, name, 'aria-label': label, className }: SliderProps<V>) {
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
