# CommandPalette · CommandList

Ctrl/⌘+K search over pages, records and actions. Typing filters, ↑/↓ move, Enter runs the item and closes the palette.

```tsx
import { CommandPalette, CommandButton, type CommandItem } from '@dgtx/ui-frek';

const items: CommandItem[] = [
  { id: 'qc', group: 'Go to', label: 'QC queue', icon: <CircleCheck />, onSelect: () => navigate('/qc') },
  { id: 'BH-2210', group: 'Batches', label: 'BH-2210', description: 'Sao Viet Insurance · 1,240 pages', onSelect: () => openBatch('BH-2210') },
  { id: 'rail', group: 'Commands', label: 'Collapse sidebar', shortcut: 'Ctrl B', onSelect: toggleRail },
];

<CommandPalette items={items} trigger={<CommandButton placeholder="Search batches, customers, commands…" />} />
```

## Notes

- Search ignores accents (Vietnamese đ counts as d) and word order: "5517 batch" finds "Batch HD-5517". It searches the label,
  description, group and `keywords`, so add the English name or a code as keywords.
- Choosing an item closes the palette first, then calls `onSelect`, so a dialog or drawer the command opens takes focus.
  Focus otherwise returns to the trigger.
- Ctrl/⌘+K toggles it from anywhere. Pass `hotkey={false}` when a page holds two palettes (the catalog does).
- Empty states: "No results for “…”" with a hint when nothing matches; "No items yet" when `items` is empty.
- A disabled item stays visible but cannot be highlighted or run; say why in its `description`.
- The panel is top-anchored (12vh), 640px wide, and nearly full screen on phones. The key hints hide on touch screens.
- Items reuse the Select item style (`.dtx-select-item`), so every list in the kit looks the same.
- Results come from `items` in memory. For server search, refilter `items` yourself as data arrives.

## Props

### CommandPalette

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `CommandItem[]` | **required** | In display order; `group` makes headings |
| `trigger` | `ReactElement` |  | Opens it, e.g. `<CommandButton />`; focus returns here on close |
| `open` | `boolean` |  | Controlled state |
| `defaultOpen` | `boolean` | `false` | Initial state when uncontrolled |
| `onOpenChange` | `(open: boolean) => void` |  | Open state changed (hotkey, trigger, Esc, a choice) |
| `placeholder` | `string` | `'Search pages, records, commands…'` | Search box text; also its accessible name |
| `hotkey` | `boolean` | `true` | Ctrl/⌘+K opens and closes it |
| `className` | `string` |  | Extra classes on the panel |

### CommandList

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `CommandItem[]` | **required** | Same as CommandPalette |
| `placeholder` | `string` | `'Search pages, records, commands…'` | Search box text |
| `className` | `string` |  | Give it a height, e.g. `h-[420px]` |

The palette's search and list without the dialog, for a quick-jump panel on a page.

### CommandItem

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | **required** | Stable key |
| `label` | `string` | **required** | What it opens or does |
| `group` | `string` |  | Heading; groups keep the order they first appear in |
| `description` | `string` |  | Second line, e.g. the client of a batch. Searched too |
| `icon` | `ReactNode` |  | Lucide icon, 16px, muted |
| `shortcut` | `string` |  | Key hint on the right. Display only: the app binds the key |
| `keywords` | `string[]` |  | Extra words that find it |
| `disabled` | `boolean` |  | Shown but cannot be run |
| `onSelect` | `() => void` | **required** | Runs after the palette closes |

## Files

- `command-palette.tsx`: CommandPalette, CommandList, `CommandItem`. Base UI Dialog + Autocomplete (inline list).
- `command.ts`: `matchCommand`, `groupCommands`; tested by `command.check.ts`.
- `command-palette.css`: `.dtx-cmdp*`.
