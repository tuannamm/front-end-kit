/**
 * # Checkbox · CheckboxGroup · RadioGroup
 *
 * On/off choices with a clickable label.
 *
 * ```tsx
 * import { Checkbox, CheckboxGroup, RadioGroup } from '@dgtx/ui-frek';
 *
 * <Checkbox label="I agree to the terms" required error={errors.terms} />
 * <CheckboxGroup label="Notifications" options={channels} selectAll="All channels" defaultValue={['email']} />
 * <RadioGroup label="Mode" options={modes} row value={mode} onValueChange={setMode} />
 * ```
 *
 * | Use | When |
 * |---|---|
 * | `Checkbox` | One on/off choice |
 * | `CheckboxGroup` | Several independent choices under one legend |
 * | `RadioGroup` | Exactly one from a short visible list. For more than ~6 options, use Select |
 *
 * ## Notes
 *
 * - The whole row (box + label + description) is the click target. Arrow keys move between options in a RadioGroup.
 * - `selectAll` adds a parent checkbox. It ticks every enabled option and shows the mixed state when only some are ticked.
 * - Groups render a `<fieldset>` with a `<legend>`. Errors use Base UI Field, so screen readers announce them.
 * - The empty box border is `--dtx-fg-muted`, not `--dtx-border-strong`. An empty box is the only cue, so it needs 3:1 (WCAG 1.4.11).
 * - `row`: use only for short labels.
 *
 * ## Props
 *
 * ### Checkbox
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `label` | `ReactNode` | **required** | Clickable text next to the box |
 * | `description` | `ReactNode` |  | Second line under the label |
 * | `error` | `ReactNode` |  | Error message. Marks it invalid |
 * | `checked` | `boolean` |  | Controlled state |
 * | `defaultChecked` | `boolean` |  | Initial state when uncontrolled |
 * | `onCheckedChange` | `(checked: boolean) => void` |  |  |
 * | `indeterminate` | `boolean` |  | Mixed state: some, not all, of what it stands for is selected |
 * | `disabled` | `boolean` |  |  |
 * | `required` | `boolean` |  |  |
 * | `name` | `string` |  | Form field name |
 * | `className` | `string` |  | Extra classes |
 *
 * ### CheckboxGroup
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `label` | `ReactNode` | **required** | Legend |
 * | `options` | `ChoiceOption[]` | **required** |  |
 * | `value` | `string[]` |  | Controlled values |
 * | `defaultValue` | `string[]` |  | Initial values when uncontrolled |
 * | `onValueChange` | `(value: string[]) => void` |  |  |
 * | `selectAll` | `ReactNode` |  | Label of a parent checkbox that ticks every enabled option |
 * | `description` | `ReactNode` |  | Hint under the group. Hidden while `error` is set |
 * | `error` | `ReactNode` |  | Error message. Marks the group invalid |
 * | `row` | `boolean` |  | Options side by side (short labels only) |
 * | `disabled` | `boolean` |  | Whole group |
 * | `name` | `string` |  | Form field name |
 * | `className` | `string` |  | Extra classes |
 *
 * ### RadioGroup
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `label` | `ReactNode` | **required** | Legend |
 * | `options` | `ChoiceOption[]` | **required** |  |
 * | `value` | `string \| null` |  | Controlled value |
 * | `defaultValue` | `string` |  | Initial value when uncontrolled |
 * | `onValueChange` | `(value: string) => void` |  |  |
 * | `description` | `ReactNode` |  | Hint under the group. Hidden while `error` is set |
 * | `error` | `ReactNode` |  | Error message. Marks the group invalid |
 * | `row` | `boolean` |  | Options side by side (short labels only) |
 * | `disabled` | `boolean` |  | Whole group |
 * | `name` | `string` |  | Form field name |
 * | `className` | `string` |  | Extra classes |
 *
 * ### ChoiceOption
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `value` | `string` | **required** |  |
 * | `label` | `ReactNode` | **required** |  |
 * | `description` | `ReactNode` |  | Second line under the label |
 * | `disabled` | `boolean` |  |  |
 *
 * ## Files
 *
 * - `choice.tsx`: Checkbox, CheckboxGroup, RadioGroup, `ChoiceOption`
 * - `choice.css`: `.dtx-choices*`, `.dtx-choice*`, `.dtx-check*`, `.dtx-radio*`
 *
 * Catalog: `#/catalog/checkbox`
 *
 
 */

import { useState, type ReactNode } from 'react';
import { Checkbox as BCheckbox } from '@base-ui/react/checkbox';
import { CheckboxGroup as BCheckboxGroup } from '@base-ui/react/checkbox-group';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup as BRadioGroup } from '@base-ui/react/radio-group';
import { Field as BField } from '@base-ui/react/field';
import { Fieldset } from '@base-ui/react/fieldset';
import { Check, Minus } from 'lucide-react';
import { cx } from '../../cx';

export type ChoiceOption = { value: string; label: ReactNode; description?: ReactNode; disabled?: boolean };

type GroupProps = {
  label: ReactNode;
  options: ChoiceOption[];
  description?: ReactNode;
  error?: ReactNode;
  /** Options side by side (short labels only). */
  row?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
};

function ChoiceText({ label, description }: { label: ReactNode; description?: ReactNode }) {
  return <span className="dtx-choice__text"><span>{label}</span>{description && <small>{description}</small>}</span>;
}

function Box(props: BCheckbox.Root.Props) {
  return (
    <BCheckbox.Root className="dtx-check" {...props}>
      <BCheckbox.Indicator className="dtx-check__ind"><Check className="dtx-check__tick" /><Minus className="dtx-check__dash" /></BCheckbox.Indicator>
    </BCheckbox.Root>
  );
}

function Hint({ description, error }: { description?: ReactNode; error?: ReactNode }) {
  if (error) return <BField.Error className="dtx-field__error" match>{error}</BField.Error>;
  return description ? <BField.Description className="dtx-field__desc">{description}</BField.Description> : null;
}

export type CheckboxProps = {
  label: ReactNode;
  /** Second line under the label. */
  description?: ReactNode;
  error?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Mixed state: some, not all, of what it stands for is selected. */
  indeterminate?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
};

/** One on/off choice with a clickable label. For a list of choices use CheckboxGroup. */
export function Checkbox({ label, description, error, onCheckedChange, className, name, ...rest }: CheckboxProps) {
  return (
    <BField.Root className={cx('dtx-choice-field', className)} invalid={!!error} name={name}>
      <BField.Label className="dtx-choice__label"><Box {...rest} onCheckedChange={v => onCheckedChange?.(v)} /><ChoiceText label={label} description={description} /></BField.Label>
      <Hint error={error} />
    </BField.Root>
  );
}

export type CheckboxGroupProps = GroupProps & {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** Adds a parent checkbox that ticks every enabled option (mixed when some are ticked). Its label. */
  selectAll?: ReactNode;
};

/** Several independent choices under one legend. */
export function CheckboxGroup({ label, options, description, error, row, disabled, name, className, value, defaultValue, onValueChange, selectAll }: CheckboxGroupProps) {
  // Base UI needs a controlled group for the parent checkbox, so keep our own state when uncontrolled.
  const [inner, setInner] = useState(defaultValue ?? []);
  const current = value ?? inner;
  const set = (v: string[]) => { setInner(v); onValueChange?.(v); };
  return (
    <BField.Root className={cx('dtx-choices', className)} invalid={!!error} name={name} disabled={disabled}>
      <Fieldset.Root render={<BCheckboxGroup value={current} onValueChange={set} allValues={options.filter(o => !o.disabled).map(o => o.value)} />}>
        <Fieldset.Legend className="dtx-field__label">{label}</Fieldset.Legend>
        {selectAll && (
          <BField.Item className="dtx-choices__all">
            <BField.Label className="dtx-choice__label"><Box parent /><ChoiceText label={selectAll} /></BField.Label>
          </BField.Item>
        )}
        <div className={cx('dtx-choices__list', row && 'dtx-choices__list--row', !!selectAll && 'dtx-choices__list--nested')}>
          {options.map(o => (
            <BField.Item key={o.value} disabled={o.disabled}>
              <BField.Label className="dtx-choice__label"><Box value={o.value} disabled={o.disabled} /><ChoiceText label={o.label} description={o.description} /></BField.Label>
            </BField.Item>
          ))}
        </div>
      </Fieldset.Root>
      <Hint description={description} error={error} />
    </BField.Root>
  );
}

export type RadioGroupProps = GroupProps & {
  value?: string | null;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

/** Exactly one choice from a short, visible list. Arrow keys move between options. */
export function RadioGroup({ label, options, description, error, row, disabled, name, className, value, defaultValue, onValueChange }: RadioGroupProps) {
  return (
    <BField.Root className={cx('dtx-choices', className)} invalid={!!error} name={name} disabled={disabled}>
      <Fieldset.Root render={<BRadioGroup value={value} defaultValue={defaultValue} onValueChange={v => onValueChange?.(v as string)} />}>
        <Fieldset.Legend className="dtx-field__label">{label}</Fieldset.Legend>
        <div className={cx('dtx-choices__list', row && 'dtx-choices__list--row')}>
          {options.map(o => (
            <BField.Item key={o.value} disabled={o.disabled}>
              <BField.Label className="dtx-choice__label">
                <Radio.Root className="dtx-radio" value={o.value} disabled={o.disabled}><Radio.Indicator className="dtx-radio__dot" /></Radio.Root>
                <ChoiceText label={o.label} description={o.description} />
              </BField.Label>
            </BField.Item>
          ))}
        </div>
      </Fieldset.Root>
      <Hint description={description} error={error} />
    </BField.Root>
  );
}
