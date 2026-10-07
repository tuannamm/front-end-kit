# Collapse

Sections that open and close under their headings: FAQ, settings groups, long details on a record page.

```tsx
import { Collapse } from '@dtx/ui';

<Collapse multiple={false} defaultValue={['sla']} items={[
  { value: 'sla', title: 'SLA được tính từ lúc nào?', content: 'Từ khi lô được nhận đủ hồ sơ gốc…' },
  { value: 'format', title: 'Hệ thống nhận những định dạng nào?', content: <FormatList /> },
]} />

// settings groups: a second line, a status on the right, in a hairline box
<Collapse bordered headingLevel={2} items={[
  { value: 'ocr', title: 'Nhận dạng (OCR)', description: 'Ngôn ngữ, ngưỡng tin cậy', extra: <Badge tone="ok">Đang bật</Badge>, content: <OcrSettings /> },
]} />
```

## Notes

- Built on the Base UI Accordion. Each header is a heading (`headingLevel`, default h3) holding a button with
  `aria-expanded`. Tab moves between headers, Enter/Space toggles (no arrow-key roving, per the current APG pattern).
- `multiple` (default) lets several panels stay open; `multiple={false}` closes the others when one opens.
- Closed panels stay in the DOM with `hidden="until-found"`: Ctrl/⌘+F finds their text and opens the panel.
- `extra` sits outside the toggle button, so it may hold a Switch or a Menu. Keep it short; it never wraps.
- The chevron points along the reading direction while closed (mirrored in RTL) and down when open. The panel height
  and opacity animate; under reduced motion it opens at once.
- The body lines up with the title text, past the chevron. `bordered` adds a hairline box and more inline room;
  inside a `Card` leave it off.

## Props

### Collapse

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `CollapseItem[]` | **required** |  |
| `multiple` | `boolean` | `true` | Several panels open at once; `false` = accordion |
| `value` | `string[]` |  | Open panels (controlled) |
| `defaultValue` | `string[]` |  | Initially open panels |
| `onValueChange` | `(value: string[]) => void` |  |  |
| `bordered` | `boolean` |  | Hairline box around the list |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| 6` | `3` | Level of the header headings |
| `className` | `string` |  | Extra classes |

### CollapseItem

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `string` | **required** | Identifies the panel in `value` |
| `title` | `ReactNode` | **required** | Header text |
| `description` | `ReactNode` |  | Second line under the title |
| `content` | `ReactNode` | **required** | Panel body |
| `extra` | `ReactNode` |  | Right side of the header, outside the button |
| `disabled` | `boolean` |  |  |

## Files

- `collapse.tsx`: Collapse, `CollapseItem`
- `collapse.css`: `.dtx-collapse*`

Catalog: `#/catalog/collapse`
