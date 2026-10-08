# Menu

Actions behind a button: row actions ("⋯"), export, view options such as visible columns or sort order.

```tsx
import { Menu, Button } from '@dtx/ui';
import { MoreHorizontal, Eye, Trash2 } from 'lucide-react';

<Menu align="end"
  trigger={<Button variant="ghost" size="sm" icon aria-label="Thao tác cho HD-5517"><MoreHorizontal aria-hidden /></Button>}
  items={[
    { label: 'Xem chi tiết', icon: <Eye />, onSelect: open },
    { label: 'Tải xuống', href: '/files/hd-5517.pdf' },
    'separator',
    { label: 'Xoá lô HD-5517', icon: <Trash2 />, danger: true, onSelect: confirmDelete },
  ]} />

// view options: toggles and one-of-many keep the menu open
items={[
  { type: 'group', label: 'Cột', items: columns.map(c => ({ type: 'checkbox', label: c.label, checked: shown.has(c.id), onCheckedChange: on => toggle(c.id, on) })) },
  'separator',
  { type: 'group', label: 'Sắp xếp theo', items: [{ type: 'radio', value: sort, onValueChange: setSort, options: sortOptions }] },
]}
```

## Notes

- Built on the Base UI Menu. ↑/↓ move, Home/End jump, typing a letter jumps to a label, Enter or Space runs the item,
  and Esc closes and returns focus to the trigger.
- Actions close the menu when picked. Checkbox and radio entries keep it open, so several can be changed in a row.
- An item with `href` is a link; a disabled one becomes a disabled item, because a link cannot be disabled.
- `danger` items are red. Name the object in the label ("Xoá lô HD-5517"), and confirm or offer undo in `onSelect`.
- `shortcut` only shows the key hint. Bind the keys in the app.
- The popup is at least 200px wide (or as wide as the trigger) and at most 320px. It reuses the Select popup styles,
  so it sits above Dialog and Drawer, and it flips or shifts to stay on screen.
- Icon-only triggers need an `aria-label` that names the object ("Thao tác cho HD-5517"), not only "Thao tác".

## Props

### Menu

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `MenuEntry[]` | **required** | `MenuAction`, `MenuCheckbox`, `MenuRadio`, `MenuGroup` or `'separator'` |
| `trigger` | `ReactElement` | **required** | The element that opens it, usually a `Button` |
| `align` | `'start' \| 'center' \| 'end'` | `'start'` | Which popup edge lines up with the trigger |
| `className` | `string` |  | On the popup |

### MenuAction

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | **required** | Text; typing its first letters jumps to it |
| `onSelect` | `() => void` |  | Runs on click, Enter or Space; the menu then closes |
| `href` | `string` |  | Makes it a link |
| `icon` | `ReactNode` |  | 16px icon before the label |
| `description` | `string` |  | Second line under the label |
| `shortcut` | `string` |  | Key hint on the right (display only) |
| `danger` | `boolean` |  | Destructive action, in red |
| `disabled` | `boolean` |  |  |

### MenuCheckbox

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `'checkbox'` | **required** |  |
| `label` | `string` | **required** |  |
| `checked` | `boolean` | **required** |  |
| `onCheckedChange` | `(checked: boolean) => void` | **required** |  |
| `disabled` | `boolean` |  |  |

### MenuRadio

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `'radio'` | **required** |  |
| `value` | `string` | **required** | The chosen option |
| `onValueChange` | `(value: string) => void` | **required** |  |
| `options` | `{ value: string; label: string; disabled?: boolean }[]` | **required** |  |

### MenuGroup

| Prop | Type | Default | Description |
|---|---|---|---|
| `type` | `'group'` | **required** |  |
| `label` | `string` | **required** | Heading above the entries |
| `items` | `MenuEntry[]` | **required** |  |

## Files

- `menu.tsx`: Menu and the entry types
- `menu.css`: `.dtx-menu*`. Load it after `select.css` (it widens the select popup).

Catalog: `#/catalog/menu`
