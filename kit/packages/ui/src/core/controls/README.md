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

## Files

- `controls.tsx`: Switch, Tabs, Segmented, Tooltip, TooltipProvider, `TabItem`
- `controls.css`: `.dtx-switch*`, `.dtx-tabs__*`, `.dtx-seg*`, `.dtx-tooltip`

Catalog: `#/catalog/switch`, `#/catalog/tabs`, `#/catalog/segmented`, `#/catalog/tooltip`

Props are documented in TSDoc on the types in the `.tsx`; this file covers usage and decisions only.
