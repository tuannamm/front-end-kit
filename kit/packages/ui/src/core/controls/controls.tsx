import type { ReactNode } from 'react';
import { Switch as BSwitch } from '@base-ui/react/switch';
import { Tabs as BTabs } from '@base-ui/react/tabs';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { Toggle } from '@base-ui/react/toggle';
import { Tooltip as BTooltip } from '@base-ui/react/tooltip';
import { cx } from '../../cx';
import { Kbd } from '../badge/badge';

export function Switch({ label, checked, defaultChecked, onCheckedChange, disabled }: { label: ReactNode; checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className="dtx-switch-label">
      <BSwitch.Root className="dtx-switch" checked={checked} defaultChecked={defaultChecked} onCheckedChange={v => onCheckedChange?.(v)} disabled={disabled}>
        <BSwitch.Thumb className="dtx-switch__thumb" />
      </BSwitch.Root>
      {label}
    </label>
  );
}

export type TabItem = { value: string; label: ReactNode; content: ReactNode };
/** Underline tabs; the indicator glides between tabs (emphasis easing). */
export function Tabs({ items, defaultValue, value, onValueChange, className }: { items: TabItem[]; defaultValue?: string; value?: string; onValueChange?: (v: string) => void; className?: string }) {
  return (
    <BTabs.Root className={className} defaultValue={defaultValue ?? items[0]?.value} value={value} onValueChange={v => onValueChange?.(v as string)}>
      <BTabs.List className="dtx-tabs__list">
        {items.map(t => <BTabs.Tab key={t.value} value={t.value} className="dtx-tabs__tab">{t.label}</BTabs.Tab>)}
        <BTabs.Indicator className="dtx-tabs__indicator" />
      </BTabs.List>
      {items.map(t => <BTabs.Panel key={t.value} value={t.value} className="dtx-tabs__panel">{t.content}</BTabs.Panel>)}
    </BTabs.Root>
  );
}

/** Single-choice segmented control (filters, ranges). */
export function Segmented({ options, value, defaultValue, onValueChange, solid, 'aria-label': ariaLabel }: { options: { value: string; label: ReactNode }[]; value?: string; defaultValue?: string; onValueChange?: (v: string) => void; solid?: boolean; 'aria-label': string }) {
  return (
    <ToggleGroup
      className={cx('dtx-seg', solid && 'dtx-seg--solid')}
      aria-label={ariaLabel}
      value={value !== undefined ? [value] : undefined}
      defaultValue={defaultValue !== undefined ? [defaultValue] : [options[0]?.value]}
      onValueChange={(v: string[]) => { if (v[0]) onValueChange?.(v[0]); }}
    >
      {options.map(o => <Toggle key={o.value} value={o.value} className="dtx-seg__item">{o.label}</Toggle>)}
    </ToggleGroup>
  );
}

/** Tooltip with optional shortcut hint. Wrap the app once in <TooltipProvider>. */
export function Tooltip({ content, shortcut, children }: { content: ReactNode; shortcut?: string; children: React.ReactElement }) {
  return (
    <BTooltip.Root>
      <BTooltip.Trigger render={children} />
      <BTooltip.Portal>
        <BTooltip.Positioner sideOffset={8} className="dtx-select-positioner">
          <BTooltip.Popup className="dtx-tooltip">{content}{shortcut && <Kbd>{shortcut}</Kbd>}</BTooltip.Popup>
        </BTooltip.Positioner>
      </BTooltip.Portal>
    </BTooltip.Root>
  );
}
export const TooltipProvider = BTooltip.Provider;
