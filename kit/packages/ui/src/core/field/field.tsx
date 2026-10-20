/**
 * # Field · Input · Textarea
 *
 * `Field` wraps any control with a label, a description and an error. Base UI Field connects them for screen readers.
 * `Input` is the styled text input; `Textarea` is its multi-line version.
 *
 * ```tsx
 * import { Field, Input } from '@dgtx/ui-frek';
 *
 * <Field label="Full name" description="As on your ID card" error={errors.name}>
 *   <Input name="name" required />
 * </Field>
 *
 * <Field label="Rejection reason" description="The scan team will see this note.">
 *   <Textarea name="reason" maxLength={500} />
 * </Field>
 * ```
 *
 * ## Notes
 *
 * - When `error` is set, it replaces the description and marks the field invalid (red border on `Input`).
 * - Inputs are 40px tall. The focus state is a blue ring with a soft glow (`:focus-visible` only).
 * - `.dtx-field`, `.dtx-field__label`, `__desc` and `__error` are shared: Checkbox/Radio groups, DatePicker,
 *   DateRangePicker and FileDropzone use them for the same layout.
 * - `Textarea` starts at `rows` lines (3) and grows with its text up to `maxRows` (12), then scrolls. Growth uses CSS
 *   `field-sizing: content` (Chromium). Safari and Firefox keep the `rows` height with a resize handle.
 * - `maxLength` adds a "120 / 500" counter that turns darker in the last 10%. Screen readers hear "N characters left" only in
 *   the last 20 characters, and once at the limit; the browser itself stops input there.
 * - On touch devices `Input` and `Textarea` use 16px text, so iOS does not zoom in.
 * - The `:focus-visible` rule also styles `.dtx-select-trigger`, so Select and Input focus look the same.
 *
 * ## Props
 *
 * ### Field
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `label` | `ReactNode` | **required** | Visible label, linked to the control |
 * | `children` | `ReactNode` | **required** | The control: Input, Select, DatePicker… |
 * | `description` | `ReactNode` |  | Hint under the control. Hidden while `error` is set |
 * | `error` | `ReactNode` |  | Error message. Marks the field invalid |
 * | `className` | `string` |  | Extra classes |
 *
 * ### Input
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `placeholder` | `string` |  | Example of the expected text, e.g. "John Smith". Never instead of a label |
 * | `className` | `string` |  | Extra classes |
 *
 * Plus every `<input>` prop (Base UI `Input`): `value`, `onChange`, `name`, `type`, `required`…
 *
 * ### Textarea
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `rows` | `number` | `3` | Starting (and minimum) height in lines |
 * | `maxRows` | `number` | `12` | Grows up to this many lines, then scrolls |
 * | `maxLength` | `number` |  | Character limit; shows the counter |
 * | `placeholder` | `string` |  | Example of the expected text, e.g. "Example: page 4 is blurry". Never instead of a label |
 * | `value` | `string` |  | Controlled text |
 * | `defaultValue` | `string` |  | Initial text when uncontrolled |
 * | `onChange` | `(e: ChangeEvent<HTMLTextAreaElement>) => void` |  | Every edit |
 * | `className` | `string` |  | Extra classes on the `<textarea>` |
 * | `style` | `CSSProperties` |  | Inline styles on the `<textarea>` |
 *
 * Plus every `<textarea>` prop (`name`, `required`, `disabled`…). Inside `<Field>` it gets the label,
 * description and error wiring like `Input`.
 *
 * ## Files
 *
 * - `field.tsx`: Field, Input, Textarea
 * - `field.css`: `.dtx-field*`, `.dtx-input`, `.dtx-textarea*`
 *
 * Catalog: `#/catalog/input`
 *
 
 */

import { useState, type ChangeEvent, type ComponentProps, type CSSProperties, type ReactNode } from 'react';
import { Field as BField } from '@base-ui/react/field';
import { Input as BInput } from '@base-ui/react/input';
import { cx } from '../../cx';

/** Label + control + description + error, wired for a11y by Base UI Field. */
export function Field({ label, description, error, children, className }: { label: ReactNode; description?: ReactNode; error?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <BField.Root className={cx('dtx-field', className)} invalid={!!error}>
      <BField.Label className="dtx-field__label">{label}</BField.Label>
      {children}
      {description && !error && <BField.Description className="dtx-field__desc">{description}</BField.Description>}
      {error && <BField.Error className="dtx-field__error" match>{error}</BField.Error>}
    </BField.Root>
  );
}

export function Input({ className, ...rest }: ComponentProps<typeof BInput> & {
  /** Example of the expected text, shown while empty. A hint only: the label still names the field. */
  placeholder?: string;
}) {
  return <BInput className={cx('dtx-input', className as string)} {...rest} />;
}

export type TextareaProps = ComponentProps<'textarea'> & {
  /** Example of the expected text, shown while empty. A hint only: the label still names the field. */
  placeholder?: string;
  /** Grows with its text up to this many lines, then scrolls. Never below `rows`. */
  maxRows?: number;
};

/** Multi-line Input: starts at `rows` lines and grows with its text. `maxLength` adds a counter. */
export function Textarea({ rows = 3, maxRows = 12, maxLength, value, defaultValue, onChange, className, style, ...rest }: TextareaProps) {
  const [typed, setTyped] = useState(String(defaultValue ?? '').length);
  const length = value === undefined ? typed : String(value).length;
  const left = maxLength === undefined ? 0 : maxLength - length;
  const lines = { '--rows': rows, '--max-rows': Math.max(rows, maxRows), ...style } as CSSProperties;
  const control = (
    <BField.Control
      render={<textarea rows={rows} maxLength={maxLength} />}
      className={cx('dtx-input', 'dtx-textarea', className)} style={lines}
      {...{ value, defaultValue } as ComponentProps<typeof BField.Control>}
      {...rest as ComponentProps<typeof BField.Control>}
      onChange={e => { setTyped(e.target.value.length); onChange?.(e as unknown as ChangeEvent<HTMLTextAreaElement>); }}
    />
  );
  if (maxLength === undefined) return control;
  return (
    <div className="dtx-textarea-wrap">
      {control}
      <span className="dtx-textarea__count dtx-num" data-near={left <= Math.max(10, maxLength * .1) ? '' : undefined} aria-hidden>{length} / {maxLength}</span>
      {/* announced only near the limit, not on every keystroke */}
      <span className="dtx-sr" aria-live="polite">{left <= 0 ? `Limit of ${maxLength} characters reached` : left <= 20 ? `${left} characters left` : ''}</span>
    </div>
  );
}
