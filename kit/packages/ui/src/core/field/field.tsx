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
      <span className="dtx-sr" aria-live="polite">{left <= 0 ? `Đã đạt giới hạn ${maxLength} ký tự` : left <= 20 ? `Còn ${left} ký tự` : ''}</span>
    </div>
  );
}
