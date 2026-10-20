/**
 * # Menu
 *
 * Actions behind a button: row actions ("⋯"), export, view options such as visible columns or sort order.
 *
 * ```tsx
 * import { Menu, Button } from '@dgtx/ui-frek';
 * import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';
 *
 * <Menu align="end"
 *   trigger={<Button variant="ghost" size="sm" icon aria-label="Actions for HD-5517"><MoreHorizontal aria-hidden /></Button>}
 *   items={[
 *     { label: 'View details', icon: <Eye />, onSelect: open },
 *     { label: 'Download', href: '/files/hd-5517.pdf' },
 *     'separator',
 *     { label: 'Delete batch HD-5517', icon: <Trash2 />, danger: true, onSelect: confirmDelete },
 *   ]} />
 *
 * // view options: toggles and one-of-many keep the menu open
 * items={[
 *   { type: 'group', label: 'Columns', items: columns.map(c => ({ type: 'checkbox', label: c.label, checked: shown.has(c.id), onCheckedChange: on => toggle(c.id, on) })) },
 *   'separator',
 *   { type: 'group', label: 'Sort by', items: [{ type: 'radio', value: sort, onValueChange: setSort, options: sortOptions }] },
 * ]}
 * ```
 *
 * ## Notes
 *
 * - Built on the Base UI Menu. ↑/↓ move, Home/End jump, typing a letter jumps to a label, Enter or Space runs the item,
 *   and Esc closes and returns focus to the trigger.
 * - Actions close the menu when picked. Checkbox and radio entries keep it open, so several can be changed in a row.
 * - An item with `href` is a link; a disabled one becomes a disabled item, because a link cannot be disabled.
 * - `danger` items are red. Name the object in the label ("Delete batch HD-5517"), and confirm or offer undo in `onSelect`.
 * - `shortcut` only shows the key hint. Bind the keys in the app.
 * - The popup is at least 200px wide (or as wide as the trigger) and at most 320px. It reuses the Select popup styles,
 *   so it sits above Dialog and Drawer, and it flips or shifts to stay on screen.
 * - Icon-only triggers need an `aria-label` that names the object ("Actions for HD-5517"), not only "Actions".
 *
 * ## Props
 *
 * ### Menu
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `items` | `MenuEntry[]` | **required** | `MenuAction`, `MenuCheckbox`, `MenuRadio`, `MenuGroup` or `'separator'` |
 * | `trigger` | `ReactElement` | **required** | The element that opens it, usually a `Button` |
 * | `align` | `'start' \| 'center' \| 'end'` | `'start'` | Which popup edge lines up with the trigger |
 * | `className` | `string` |  | On the popup |
 *
 * ### MenuAction
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `label` | `string` | **required** | Text; typing its first letters jumps to it |
 * | `onSelect` | `() => void` |  | Runs on click, Enter or Space; the menu then closes |
 * | `href` | `string` |  | Makes it a link |
 * | `icon` | `ReactNode` |  | 16px icon before the label |
 * | `description` | `string` |  | Second line under the label |
 * | `shortcut` | `string` |  | Key hint on the right (display only) |
 * | `danger` | `boolean` |  | Destructive action, in red |
 * | `disabled` | `boolean` |  |  |
 *
 * ### MenuCheckbox
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `type` | `'checkbox'` | **required** |  |
 * | `label` | `string` | **required** |  |
 * | `checked` | `boolean` | **required** |  |
 * | `onCheckedChange` | `(checked: boolean) => void` | **required** |  |
 * | `disabled` | `boolean` |  |  |
 *
 * ### MenuRadio
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `type` | `'radio'` | **required** |  |
 * | `value` | `string` | **required** | The chosen option |
 * | `onValueChange` | `(value: string) => void` | **required** |  |
 * | `options` | `{ value: string; label: string; disabled?: boolean }[]` | **required** |  |
 *
 * ### MenuGroup
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `type` | `'group'` | **required** |  |
 * | `label` | `string` | **required** | Heading above the entries |
 * | `items` | `MenuEntry[]` | **required** |  |
 *
 * ## Files
 *
 * - `menu.tsx`: Menu and the entry types
 * - `menu.css`: `.dtx-menu*`. Load it after `select.css` (it widens the select popup).
 *
 * Catalog: `#/catalog/menu`
 *
 
 */

import type { ReactElement, ReactNode } from 'react';
import { Menu as BMenu } from '@base-ui/react/menu';
import { Check, Circle } from 'lucide-react';
import { cx } from '../../cx';
import { Kbd } from '../badge/badge';

export type MenuAction = {
  label: string;
  onSelect?: () => void;
  /** Makes it a link. Ctrl/⌘+click still opens a new tab. */
  href?: string;
  icon?: ReactNode;
  /** Second line under the label. */
  description?: string;
  /** Key hint on the right. Display only: the menu does not bind the keys. */
  shortcut?: string;
  /** Destructive action, in red. Name the object in the label ("Delete batch HD-5517"). */
  danger?: boolean;
  disabled?: boolean;
};
/** A toggle that keeps the menu open, e.g. a column's visibility. */
export type MenuCheckbox = { type: 'checkbox'; label: string; checked: boolean; onCheckedChange: (checked: boolean) => void; disabled?: boolean };
/** One choice out of `options` that keeps the menu open, e.g. sort order. Put it in a group to give it a heading. */
export type MenuRadio = { type: 'radio'; value: string; onValueChange: (value: string) => void; options: { value: string; label: string; disabled?: boolean }[] };
export type MenuGroup = { type: 'group'; label: string; items: MenuEntry[] };
export type MenuEntry = MenuAction | MenuCheckbox | MenuRadio | MenuGroup | 'separator';

export type MenuProps = {
  items: MenuEntry[];
  /** The element that opens the menu, usually a Button. An icon-only one needs an aria-label. */
  trigger: ReactElement;
  /** Which popup edge lines up with the trigger. 'end' suits triggers at the right edge, e.g. row actions. */
  align?: 'start' | 'center' | 'end';
  className?: string;
};

function Action({ a }: { a: MenuAction }) {
  const cls = cx('dtx-select-item', a.description && 'dtx-select-item--rich', a.danger && 'dtx-menu__danger');
  const body = <>
    {a.icon && <span className="dtx-menu__icon" aria-hidden>{a.icon}</span>}
    <span className="dtx-select-text">{a.label}{a.description && <small>{a.description}</small>}</span>
    {a.shortcut && <Kbd>{a.shortcut}</Kbd>}
  </>;
  // a disabled link becomes a disabled item: links cannot be disabled
  return a.href !== undefined && !a.disabled
    ? <BMenu.LinkItem className={cls} href={a.href} label={a.label} onClick={a.onSelect}>{body}</BMenu.LinkItem>
    : <BMenu.Item className={cls} label={a.label} disabled={a.disabled} onClick={a.onSelect}>{body}</BMenu.Item>;
}

function Entries({ items }: { items: MenuEntry[] }) {
  return items.map((e, i) => {
    if (e === 'separator') return <BMenu.Separator key={i} className="dtx-select-sep" />;
    if (!('type' in e)) return <Action key={i} a={e} />;
    if (e.type === 'group') return (
      <BMenu.Group key={i}>
        <BMenu.GroupLabel className="dtx-select-group-label">{e.label}</BMenu.GroupLabel>
        <Entries items={e.items} />
      </BMenu.Group>
    );
    if (e.type === 'checkbox') return (
      <BMenu.CheckboxItem key={i} className="dtx-select-item" label={e.label} checked={e.checked} onCheckedChange={c => e.onCheckedChange(c)} disabled={e.disabled}>
        <span className="dtx-menu__mark"><BMenu.CheckboxItemIndicator render={<Check aria-hidden />} /></span>
        <span className="dtx-select-text">{e.label}</span>
      </BMenu.CheckboxItem>
    );
    return (
      <BMenu.RadioGroup key={i} value={e.value} onValueChange={v => e.onValueChange(v as string)}>
        {e.options.map(o => (
          <BMenu.RadioItem key={o.value} value={o.value} label={o.label} disabled={o.disabled} className="dtx-select-item">
            <span className="dtx-menu__mark"><BMenu.RadioItemIndicator render={<Circle className="dtx-menu__dot" aria-hidden />} /></span>
            <span className="dtx-select-text">{o.label}</span>
          </BMenu.RadioItem>
        ))}
      </BMenu.RadioGroup>
    );
  });
}

/**
 * Actions behind a button: row actions ("⋯"), export, view options. Arrow keys move, typing jumps to a label,
 * Esc closes and returns focus to the trigger. Checkbox and radio entries keep the menu open; actions close it.
 */
export function Menu({ items, trigger, align = 'start', className }: MenuProps) {
  return (
    <BMenu.Root>
      <BMenu.Trigger render={trigger} />
      <BMenu.Portal>
        <BMenu.Positioner className="dtx-select-positioner" sideOffset={6} align={align}>
          <BMenu.Popup className={cx('dtx-select-popup', 'dtx-menu', className)}><Entries items={items} /></BMenu.Popup>
        </BMenu.Positioner>
      </BMenu.Portal>
    </BMenu.Root>
  );
}
