import type { ComponentProps, ReactNode } from 'react';
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

export function Input({ className, ...rest }: ComponentProps<typeof BInput>) {
  return <BInput className={cx('dtx-input', className as string)} {...rest} />;
}
