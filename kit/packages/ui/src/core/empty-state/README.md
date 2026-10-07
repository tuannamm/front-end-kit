# EmptyState

What a list, table, panel or page shows when it has nothing to show. It says what happened and offers one way forward.
Every empty or failed-load view in the kit renders it (DataTable, NotificationList, PdfViewer, CommandPalette),
so they all look and read the same.

```tsx
import { EmptyState, Button } from '@dtx/ui';

<EmptyState mascot title="Chưa có lô tài liệu nào" action={<Button onClick={create}>Tạo lô đầu tiên</Button>}>
  Tải hồ sơ lên để bắt đầu số hoá. Hệ thống nhận PDF, TIFF và ảnh chụp.
</EmptyState>

<DataTable rows={rows} columns={columns} rowKey={r => r.id}
  empty={<EmptyState size="sm" icon={<ListFilter />} title="Không có lô nào khớp bộ lọc" action={<Button variant="secondary" size="sm" onClick={reset}>Xoá bộ lọc</Button>} />} />
```

## Notes

- Five cases, five messages. Each says what happened and what to do next:
  - first use: the mascot, what this place is for, the primary action ("Tạo lô đầu tiên");
  - no results: echo the query, suggest a shorter or different one;
  - filtered to nothing: name the filters as the cause, offer "Xoá bộ lọc";
  - no permission: who can grant it, offer to ask;
  - load failure: `tone="err"`, what failed and "Thử lại".
- The mascot is for first use, onboarding and 404 only (brand), at 120px (`md`) or 64px (`sm`). Never next to an error.
- `tone="err"` gets `role="alert"` and the error icon in red. The others are `role="status"`; pass `role` to override
  (e.g. `role={undefined}` inside a container that already is a live region).
- `size="sm"` fits panels, popovers and tables (24px icon, 32px padding); `md` fits a page or a card section.
- Keep one primary action. A second, quieter one (ghost button or link) is fine.

## Props

### EmptyState

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `ReactNode` | **required** | What the user is looking at, e.g. "Chưa có lô nào" |
| `children` | `ReactNode` |  | What to do next |
| `icon` | `ReactNode` |  | Lucide icon above the title; `'err'` defaults to the error icon |
| `mascot` | `boolean` |  | The robot instead of the icon: first use, onboarding, 404 only |
| `action` | `ReactNode` |  | One way forward, e.g. a button |
| `tone` | `'neutral' \| 'err'` | `'neutral'` | `'err'`: red icon, `role="alert"` |
| `size` | `'sm' \| 'md'` | `'md'` | `sm` for panels, popovers and tables |
| `className` | `string` |  | Extra classes |

Plus every `<div>` prop (`role`, `id`, `aria-*`).

## Files

- `empty-state.tsx`: EmptyState. Uses `mascotUrl` from `brand/logo.tsx` and the error icon from `badge.tsx`.
- `empty-state.css`: `.dtx-empty*`.
