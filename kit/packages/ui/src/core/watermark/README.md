# Watermark

Repeated, rotated text over a document, a record or a whole page: marks it confidential and names who viewed it and
when, so a screenshot or a photo of the screen can be traced.

```tsx
import { Watermark } from '@dtx/ui';

<Watermark content={['DIGI-TEXX · Tài liệu mật', `${user.name} · ${shortTime(new Date())}`]}>
  <RecordDetail />
</Watermark>

// a draft: one big word, wider apart
<Watermark content="BẢN NHÁP" fontSize={28} rotate={-30} gap={[160, 120]}>…</Watermark>
```

## Notes

- Drawn once to a canvas (Roboto 500, redrawn when the web font has loaded) and tiled over the children as a CSS
  mask. One element, no per-mark DOM; it does not catch the pointer, so everything under it stays usable.
- Every other row is offset by half a mark, as in a printed security pattern. Marks never clip, whatever `rotate`.
- The colour follows the theme: `--dtx-fg` at 13%. Over a theme-fixed surface (a white paper page in the dark theme)
  set `--dtx-watermark-color` on the Watermark, e.g. `rgb(0 0 0 / .12)`.
- It sits above the content (sticky headers included) and is kept in print and in forced-colours mode.
- Hidden from screen readers. If the confidentiality matters to the reader, say it in text on the page too.
- A deterrent, not protection: anyone with devtools can remove it. For files that leave the system, burn the
  watermark into the file on the server.

## Props

### Watermark

| Prop | Type | Default | Description |
|---|---|---|---|
| `content` | `string \| string[]` | **required** | One line, or several stacked |
| `children` | `ReactNode` |  | What it covers |
| `rotate` | `number` | `-22` | Degrees; negative climbs to the right |
| `gap` | `[number, number]` | `[100, 80]` | Space between marks, across and down (px) |
| `fontSize` | `number` | `14` | Text size (px) |
| `className` | `string` |  | Extra classes |

## Files

- `watermark.tsx`: Watermark
- `tile.ts` + `tile.check.ts`: cell geometry (rotated box plus gap) and its node check
- `watermark.css`: `.dtx-watermark*`

Catalog: `#/catalog/watermark`
