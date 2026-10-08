# Masonry

Columns of tiles of different heights: notes, document thumbnails, image galleries, dashboard widgets of uneven size.

```tsx
import { Masonry } from '@dtx/ui';

<Masonry aria-label="Ghi chú QC">
  {notes.map(n => <NoteCard key={n.id} note={n} />)}
</Masonry>

// fixed columns, tighter
<Masonry columns={2} gap={8}>{thumbnails}</Masonry>
```

## Notes

- Each tile goes to the shortest column, so the columns end at nearly the same height. Ties go to the first column.
  Tab order is the children's order, which reads left to right, roughly top to bottom.
- The column count follows the container width (`minColumnWidth`), not the viewport: the same grid works in a
  sidebar and full width. `columns` fixes it.
- Tiles keep their own height and are re-placed whenever one changes size (an image loads, a Collapse opens, text
  wraps after a resize). Give images an `aspect-ratio` or `width`/`height` so the grid does not shift when they load.
- Pass one element per tile; Masonry positions its direct children and sets their width. The container's height is
  set from the tallest column.
- No animation when tiles move: on a resize they would trail the pointer.

## Props

### Masonry

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | **required** | One element per tile |
| `minColumnWidth` | `number` | `240` | Narrowest column (px); the count follows the container width |
| `columns` | `number` |  | Fixed column count |
| `gap` | `number` | `16` | Space between tiles, both ways (px) |
| `aria-label` | `string` |  | Names the grid (it becomes a `group`) |
| `className` | `string` |  | Extra classes |

## Files

- `masonry.tsx`: Masonry
- `masonry.css`: `.dtx-masonry`

Catalog: `#/catalog/masonry`
