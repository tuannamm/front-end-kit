/**
 * # Switch · Tabs · Segmented · Tooltip
 *
 * Small Base UI controls.
 *
 * ```tsx
 * import { Switch, Tabs, Segmented, Tooltip, TooltipProvider } from '@dgtx/ui-frek';
 *
 * <Switch label="Auto-approve" checked={auto} onCheckedChange={setAuto} />
 *
 * <Tabs items={[{ value: 'info', label: 'Details', content: <Info /> }, { value: 'log', label: 'Log', content: <Log /> }]} />
 *
 * <Segmented aria-label="Time range" options={[{ value: '7d', label: '7 days' }, { value: '30d', label: '30 days' }]} onValueChange={setRange} />
 *
 * <TooltipProvider>                                  {/* once, at the app root *\/}
 *   <Tooltip content="Search" shortcut="⌘K"><Button icon aria-label="Search"><Search /></Button></Tooltip>
 * </TooltipProvider>
 * ```
 *
 * ## Notes
 *
 * - **Switch:** the label wraps the control, so the text is clickable. The thumb moves with emphasis easing.
 * - **Tabs:** the underline indicator glides between tabs, and the panel content fades up. The first tab is selected by default.
 * - **Segmented:** a single choice for filters and ranges. `onValueChange` fires only with a value, never with an empty choice.
 *   `aria-label` is required. `solid` fills the active item with blue.
 * - **Tooltip:** needs `<TooltipProvider>` once at the app root. The trigger must be one element that can hold a ref.
 *   It uses Select's positioner (z-index 65), so it shows above dialogs.
 *
 * ## Props
 *
 * ### Switch
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `label` | `ReactNode` | **required** | Clickable text next to the switch |
 * | `checked` | `boolean` |  | Controlled state |
 * | `defaultChecked` | `boolean` |  | Initial state when uncontrolled |
 * | `onCheckedChange` | `(checked: boolean) => void` |  |  |
 * | `disabled` | `boolean` |  |  |
 *
 * ### Tabs
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `items` | `TabItem[]` | **required** |  |
 * | `value` | `string` |  | Controlled active tab |
 * | `defaultValue` | `string` | first item | Initial tab when uncontrolled |
 * | `onValueChange` | `(value: string) => void` |  |  |
 * | `className` | `string` |  | On the root |
 *
 * ### TabItem
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `value` | `string` | **required** |  |
 * | `label` | `ReactNode` | **required** | Tab text |
 * | `content` | `ReactNode` | **required** | Panel content |
 *
 * ### Segmented
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `options` | `{ value: string; label: ReactNode }[]` | **required** |  |
 * | `aria-label` | `string` | **required** | Accessible name of the group |
 * | `value` | `string` |  | Controlled value |
 * | `defaultValue` | `string` | first option | Initial value when uncontrolled |
 * | `onValueChange` | `(value: string) => void` |  | Never called with an empty value |
 * | `solid` | `boolean` |  | Fills the active item with blue |
 *
 * ### Tooltip
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `content` | `ReactNode` | **required** | Tooltip text |
 * | `children` | `ReactElement` | **required** | The trigger: one element that can hold a ref |
 * | `shortcut` | `string` |  | Key hint, shown as `<Kbd>` |
 *
 * ### TooltipProvider
 *
 * Base UI `Tooltip.Provider`: wrap the app once. Its props (e.g. `delay`) pass through.
 *
 * ## Files
 *
 * - `controls.tsx`: Switch, Tabs, Segmented, Tooltip, TooltipProvider, `TabItem`
 * - `controls.css`: `.dtx-switch*`, `.dtx-tabs__*`, `.dtx-seg*`, `.dtx-tooltip`
 *
 * Catalog: `#/catalog/switch`, `#/catalog/tabs`, `#/catalog/segmented`, `#/catalog/tooltip`
 *
 * @generated from README.md in this folder. Edit the README, then run `npm run docs:sync`.
 */

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
