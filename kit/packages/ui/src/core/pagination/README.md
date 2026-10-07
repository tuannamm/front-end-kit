# Pagination

Page controls for a table or a list of cards: a "21–40 trên 1.234 dòng" summary, an optional rows-per-page picker,
and the page buttons.

```tsx
import { Pagination } from '@dtx/ui';

const [page, setPage] = useState(1);
const [size, setSize] = useState(20);

<Pagination page={page} total={1234} pageSize={size} onPageChange={setPage} onPageSizeChange={setSize} itemLabel="hồ sơ" />
```

## Notes

- A `<nav aria-label="Phân trang">`. The current page has `aria-current="page"` and is tinted and bold. Page buttons
  are named "Trang 5"; "…" gaps are hidden from screen readers.
- The page list always has 7 slots once there are more than 7 pages (first, last, the current page and one on each
  side), so the buttons do not jump as the page changes. A gap always hides at least two pages.
- At the first or last page the arrow is `aria-disabled`, not `disabled`, so keyboard focus stays on it.
- The summary is a polite live region: a screen reader hears the new range after a page change.
- `onPageSizeChange` adds the picker. Changing the size also calls `onPageChange` with the page that still holds the
  first row on screen. The current `pageSize` is added to `pageSizeOptions` if missing.
- Below 360px of container width (a card, a phone) the page list collapses to "Trang 3 / 62" between the arrows.
- `page` out of range shows the nearest page; resetting it after a filter is the app's job.
- Numbers use Vietnamese grouping ("1.234"). Buttons are 32px tall (WCAG 2.5.8).

## Props

### Pagination

| Prop | Type | Default | Description |
|---|---|---|---|
| `page` | `number` | **required** | Current page, from 1 |
| `total` | `number` | **required** | Rows across all pages |
| `pageSize` | `number` | **required** | Rows per page |
| `onPageChange` | `(page: number) => void` | **required** |  |
| `onPageSizeChange` | `(pageSize: number) => void` |  | Adds the rows-per-page picker |
| `pageSizeOptions` | `number[]` | `[10, 20, 50, 100]` | Choices in the picker |
| `itemLabel` | `string` | `'dòng'` | What a row is, in the summary and the picker's name |
| `aria-label` | `string` | `'Phân trang'` | Name of the navigation landmark |
| `className` | `string` |  | Extra classes |

## Files

- `pagination.tsx`: Pagination
- `pages.ts`: `pageItems` (which page buttons to show), `pageForResize`; tested by `pages.check.ts`
- `pagination.css`: `.dtx-pager*`

Catalog: `#/catalog/pagination`
