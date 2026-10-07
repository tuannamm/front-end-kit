# Alert

A message that stays in the page until its cause is gone: a form that failed as a whole, a locked batch, maintenance
tonight. It is never a field error (use `<Field error>`) and never news of a moment ago (use a toast).

```tsx
import { Alert, Button } from '@dtx/ui';

<Alert tone="err" title="Không lưu được hồ sơ HS-0142" action={<Button size="sm" onClick={save}>Lưu lại</Button>}>
  Mất kết nối máy chủ. Dữ liệu vẫn còn trên máy này.
</Alert>

<Alert tone="warn" title="Lô HD-5517 có thể trễ hạn SLA 16:15" onClose={() => setHidden(true)} />
```

## Notes

- Tones: `brand` (information, default), `ok`, `warn`, `err`. Each has its own icon and a tinted hairline, so the
  colour is never the only cue. The text stays in the body colour for contrast in both themes.
- `err` gets `role="alert"`, so a screen reader reads it at once when it appears. Other tones are `role="status"`.
  Pass `role` to override, e.g. a long-standing notice that should not be announced.
- Write the title as what happened and the description as why and what to do next. Keep one primary action.
- `onClose` adds a 32px close button; the app removes the alert. Do not make an error closable while it still applies.
- No entrance animation: an alert is page content, and it should be there in the first frame.

## Props

### Alert

| Prop | Type | Default | Description |
|---|---|---|---|
| `tone` | `'brand' \| 'ok' \| 'warn' \| 'err'` | `'brand'` | Icon, tint and role |
| `title` | `ReactNode` |  | What happened, in a few words |
| `children` | `ReactNode` |  | Why, and what to do next |
| `icon` | `ReactNode \| false` |  | Replaces the tone's icon; `false` hides it |
| `action` | `ReactNode` |  | Buttons under the text |
| `onClose` | `() => void` |  | Shows a close button |
| `closeLabel` | `string` | `'Đóng'` | Accessible name of the close button |
| `className` | `string` |  | Extra classes |

Plus every `<div>` prop (`role`, `id`, `aria-*`).

## Files

- `alert.tsx`: Alert. Uses Button and the shared tone icons from `badge.tsx` (the same ones Toast uses).
- `alert.css`: `.dtx-alert*`.
