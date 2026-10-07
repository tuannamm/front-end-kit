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
  /** Destructive action, in red. Name the object in the label ("Xoá lô HD-5517"). */
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
