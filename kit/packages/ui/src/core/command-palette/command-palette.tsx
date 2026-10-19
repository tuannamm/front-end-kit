/**
 * # CommandPalette · CommandList
 *
 * Ctrl/⌘+K search over pages, records and actions. Typing filters, ↑/↓ move, Enter runs the item and closes the palette.
 *
 * ```tsx
 * import { CommandPalette, CommandButton, type CommandItem } from '@dgtx/ui-frek';
 *
 * const items: CommandItem[] = [
 *   { id: 'qc', group: 'Go to', label: 'QC queue', icon: <CircleCheck />, onSelect: () => navigate('/qc') },
 *   { id: 'BH-2210', group: 'Batches', label: 'BH-2210', description: 'Sao Viet Insurance · 1,240 pages', onSelect: () => openBatch('BH-2210') },
 *   { id: 'rail', group: 'Commands', label: 'Collapse sidebar', shortcut: 'Ctrl B', onSelect: toggleRail },
 * ];
 *
 * <CommandPalette items={items} trigger={<CommandButton placeholder="Search batches, customers, commands…" />} />
 * ```
 *
 * ## Notes
 *
 * - Search ignores accents (Vietnamese đ counts as d) and word order: "5517 batch" finds "Batch HD-5517". It searches the label,
 *   description, group and `keywords`, so add the English name or a code as keywords.
 * - Choosing an item closes the palette first, then calls `onSelect`, so a dialog or drawer the command opens takes focus.
 *   Focus otherwise returns to the trigger.
 * - Ctrl/⌘+K toggles it from anywhere. Pass `hotkey={false}` when a page holds two palettes (the catalog does).
 * - Empty states: "No results for “…”" with a hint when nothing matches; "No items yet" when `items` is empty.
 * - A disabled item stays visible but cannot be highlighted or run; say why in its `description`.
 * - The panel is top-anchored (12vh), 640px wide, and nearly full screen on phones. The key hints hide on touch screens.
 * - Items reuse the Select item style (`.dtx-select-item`), so every list in the kit looks the same.
 * - Results come from `items` in memory. For server search, refilter `items` yourself as data arrives.
 *
 * ## Props
 *
 * ### CommandPalette
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `items` | `CommandItem[]` | **required** | In display order; `group` makes headings |
 * | `trigger` | `ReactElement` |  | Opens it, e.g. `<CommandButton />`; focus returns here on close |
 * | `open` | `boolean` |  | Controlled state |
 * | `defaultOpen` | `boolean` | `false` | Initial state when uncontrolled |
 * | `onOpenChange` | `(open: boolean) => void` |  | Open state changed (hotkey, trigger, Esc, a choice) |
 * | `placeholder` | `string` | `'Search pages, records, commands…'` | Search box text; also its accessible name |
 * | `hotkey` | `boolean` | `true` | Ctrl/⌘+K opens and closes it |
 * | `className` | `string` |  | Extra classes on the panel |
 *
 * ### CommandList
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `items` | `CommandItem[]` | **required** | Same as CommandPalette |
 * | `placeholder` | `string` | `'Search pages, records, commands…'` | Search box text |
 * | `className` | `string` |  | Give it a height, e.g. `h-[420px]` |
 *
 * The palette's search and list without the dialog, for a quick-jump panel on a page.
 *
 * ### CommandItem
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `id` | `string` | **required** | Stable key |
 * | `label` | `string` | **required** | What it opens or does |
 * | `group` | `string` |  | Heading; groups keep the order they first appear in |
 * | `description` | `string` |  | Second line, e.g. the client of a batch. Searched too |
 * | `icon` | `ReactNode` |  | Lucide icon, 16px, muted |
 * | `shortcut` | `string` |  | Key hint on the right. Display only: the app binds the key |
 * | `keywords` | `string[]` |  | Extra words that find it |
 * | `disabled` | `boolean` |  | Shown but cannot be run |
 * | `onSelect` | `() => void` | **required** | Runs after the palette closes |
 *
 * ## Files
 *
 * - `command-palette.tsx`: CommandPalette, CommandList, `CommandItem`. Base UI Dialog + Autocomplete (inline list).
 * - `command.ts`: `matchCommand`, `groupCommands`; tested by `command.check.ts`.
 * - `command-palette.css`: `.dtx-cmdp*`.
 *
 * @generated from README.md in this folder. Edit the README, then run `npm run docs:sync`.
 */

import { useEffect, useId, useMemo, useState, type ReactElement, type ReactNode } from 'react';
import { Autocomplete } from '@base-ui/react/autocomplete';
import { Dialog } from '@base-ui/react/dialog';
import { Search, X } from 'lucide-react';
import { cx } from '../../cx';
import { Kbd } from '../badge/badge';
import { Button } from '../button/button';
import { EmptyState } from '../empty-state/empty-state';
import { groupCommands, matchCommand } from './command';

export type CommandItem = {
  id: string;
  label: string;
  /** Heading it is listed under; groups keep the order they first appear in. */
  group?: string;
  /** Second line, e.g. the client of a batch. Searched too. */
  description?: string;
  icon?: ReactNode;
  /** Key hint on the right. Display only: the app binds the key. */
  shortcut?: string;
  /** Extra words that find it: an English name, a code, a synonym. */
  keywords?: string[];
  disabled?: boolean;
  onSelect: () => void;
};

type Group = { label: string; items: CommandItem[] };

function Panel({ items, placeholder, onPick, close }: { items: CommandItem[]; placeholder: string; onPick?: () => void; close?: ReactNode }) {
  const [query, setQuery] = useState('');
  const groups = useMemo(() => groupCommands(items), [items]);
  const hint = useId();
  const q = query.trim();
  return (
    <Autocomplete.Root
      open inline items={groups} value={query} onValueChange={setQuery} autoHighlight="always" keepHighlight
      filter={(c: CommandItem, text) => matchCommand(c, text)} itemToStringValue={(c: CommandItem) => c.label}
    >
      <div className="dtx-cmdp__search">
        <Search aria-hidden />
        <Autocomplete.Input className="dtx-cmdp__input" placeholder={placeholder} aria-label={placeholder} aria-describedby={hint} />
        {close}
      </div>
      <Autocomplete.Empty className="dtx-cmdp__empty">
        {/* role: Autocomplete.Empty is the live region already */}
        {q ? <EmptyState size="sm" role={undefined} icon={<Search />} title={`No results for “${q}”`}>Try a different or shorter keyword.</EmptyState>
          : <EmptyState size="sm" role={undefined} title="No items yet" />}
      </Autocomplete.Empty>
      <Autocomplete.List className="dtx-cmdp__list">
        {(g: Group) => (
          <Autocomplete.Group key={g.label} items={g.items} className="dtx-cmdp__group">
            {g.label && <Autocomplete.GroupLabel className="dtx-select-group-label">{g.label}</Autocomplete.GroupLabel>}
            <Autocomplete.Collection>
              {(c: CommandItem) => (
                <Autocomplete.Item
                  key={c.id} value={c} disabled={c.disabled}
                  className={cx('dtx-select-item', c.description && 'dtx-select-item--rich')}
                  // close first, so a dialog or drawer the command opens gets the focus
                  onClick={() => { onPick?.(); c.onSelect(); }}
                >
                  {c.icon && <span className="dtx-cmdp__icon" aria-hidden>{c.icon}</span>}
                  <span className="dtx-select-text"><span>{c.label}</span>{c.description && <small>{c.description}</small>}</span>
                  {c.shortcut && <Kbd>{c.shortcut}</Kbd>}
                </Autocomplete.Item>
              )}
            </Autocomplete.Collection>
          </Autocomplete.Group>
        )}
      </Autocomplete.List>
      <div className="dtx-cmdp__foot" id={hint}>
        <span><Kbd>↑</Kbd><Kbd>↓</Kbd> select</span>
        <span><Kbd>Enter</Kbd> open</span>
        {close && <span><Kbd>Esc</Kbd> close</span>}
      </div>
    </Autocomplete.Root>
  );
}

export type CommandPaletteProps = {
  items: CommandItem[];
  /** Opens it; focus returns there on close. Usually <CommandButton />. */
  trigger?: ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  /** Ctrl/⌘+K opens and closes it from anywhere on the page. Turn off when a page has two palettes. */
  hotkey?: boolean;
  className?: string;
};

/**
 * Ctrl/⌘+K search over pages, records and actions. Typing filters (accent-insensitive, words in any order),
 * ↑/↓ move, Enter runs the item and closes the palette.
 */
export function CommandPalette({ items, trigger, open, defaultOpen = false, onOpenChange, placeholder = 'Search pages, records, commands…', hotkey = true, className }: CommandPaletteProps) {
  const [inner, setInner] = useState(defaultOpen);
  const isOpen = open ?? inner;
  const setOpen = (o: boolean) => { setInner(o); onOpenChange?.(o); };

  useEffect(() => {
    if (!hotkey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 'k' || !(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return;
      e.preventDefault();
      setOpen(!isOpen);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }); // re-subscribes each render so setOpen sees the current state and onOpenChange

  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      {trigger && <Dialog.Trigger render={trigger} />}
      <Dialog.Portal>
        <Dialog.Backdrop className="dtx-backdrop" />
        <Dialog.Popup className={cx('dtx-cmdp', 'dtx-cmdp--dialog', className)} aria-label="Command palette">
          <Panel items={items} placeholder={placeholder} onPick={() => setOpen(false)}
            close={<Dialog.Close render={<Button variant="ghost" size="sm" icon aria-label="Close" />}><X aria-hidden /></Dialog.Close>} />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export type CommandListProps = { items: CommandItem[]; placeholder?: string; className?: string };

/** The palette's search and list without the dialog: a quick-jump panel on a page, or docs. */
export function CommandList({ items, placeholder = 'Search pages, records, commands…', className }: CommandListProps) {
  return <div className={cx('dtx-cmdp', className)}><Panel items={items} placeholder={placeholder} /></div>;
}
