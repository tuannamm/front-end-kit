# Switch · Tabs · Segmented · Tooltip

Small Base UI controls.

```tsx
import { Switch, Tabs, Segmented, Tooltip, TooltipProvider } from '@dtx/ui';

<Switch label="Tự động duyệt" checked={auto} onCheckedChange={setAuto} />

<Tabs items={[{ value: 'info', label: 'Thông tin', content: <Info /> }, { value: 'log', label: 'Nhật ký', content: <Log /> }]} />

<Segmented aria-label="Khoảng thời gian" options={[{ value: '7d', label: '7 ngày' }, { value: '30d', label: '30 ngày' }]} onValueChange={setRange} />

<TooltipProvider>                                  {/* once, at the app root */}
  <Tooltip content="Tìm kiếm" shortcut="⌘K"><Button icon aria-label="Tìm kiếm"><Search /></Button></Tooltip>
</TooltipProvider>
```

## Notes

- **Switch:** the label wraps the control, so the text is clickable. The thumb moves with emphasis easing.
- **Tabs:** the underline indicator glides between tabs, and the panel content fades up. The first tab is selected by default.
- **Segmented:** a single choice for filters and ranges. `onValueChange` fires only with a value, never with an empty choice.
  `aria-label` is required. `solid` fills the active item with blue.
- **Tooltip:** needs `<TooltipProvider>` once at the app root. The trigger must be one element that can hold a ref.
  It uses Select's positioner (z-index 65), so it shows above dialogs.

## Props

### Switch

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | **required** | Clickable text next to the switch |
| `checked` | `boolean` |  | Controlled state |
| `defaultChecked` | `boolean` |  | Initial state when uncontrolled |
| `onCheckedChange` | `(checked: boolean) => void` |  |  |
| `disabled` | `boolean` |  |  |

### Tabs

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `TabItem[]` | **required** |  |
| `value` | `string` |  | Controlled active tab |
| `defaultValue` | `string` | first item | Initial tab when uncontrolled |
| `onValueChange` | `(value: string) => void` |  |  |
| `className` | `string` |  | On the root |

### TabItem

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | **required** |  |
| `label` | `ReactNode` | **required** | Tab text |
| `content` | `ReactNode` | **required** | Panel content |

### Segmented

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `{ value: string; label: ReactNode }[]` | **required** |  |
| `aria-label` | `string` | **required** | Accessible name of the group |
| `value` | `string` |  | Controlled value |
| `defaultValue` | `string` | first option | Initial value when uncontrolled |
| `onValueChange` | `(value: string) => void` |  | Never called with an empty value |
| `solid` | `boolean` |  | Fills the active item with blue |

### Tooltip

| Prop | Type | Default | Description |
|---|---|---|---|
| `content` | `ReactNode` | **required** | Tooltip text |
| `children` | `ReactElement` | **required** | The trigger: one element that can hold a ref |
| `shortcut` | `string` |  | Key hint, shown as `<Kbd>` |

### TooltipProvider

Base UI `Tooltip.Provider`: wrap the app once. Its props (e.g. `delay`) pass through.

## Files

- `controls.tsx`: Switch, Tabs, Segmented, Tooltip, TooltipProvider, `TabItem`
- `controls.css`: `.dtx-switch*`, `.dtx-tabs__*`, `.dtx-seg*`, `.dtx-tooltip`

Catalog: `#/catalog/switch`, `#/catalog/tabs`, `#/catalog/segmented`, `#/catalog/tooltip`
