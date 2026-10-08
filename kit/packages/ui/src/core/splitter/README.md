# Splitter

Panels with draggable handles between them: list and detail, document and extracted fields, editor and log.

```tsx
import { Splitter } from '@dtx/ui';

<div style={{ height: 480 }}>
  <Splitter onResizeEnd={save} panels={[
    { label: 'Danh sách', defaultSize: 280, min: 200, max: '50%', collapsible: true, content: <BatchList /> },
    { label: 'Chi tiết', min: 320, content: <BatchDetail /> },
  ]} />
</div>

// stacked; nest a Splitter inside a panel for a grid of panes
<Splitter orientation="vertical" panels={[{ content: <Editor />, min: 120 }, { content: <Log />, defaultSize: '30%', min: 80 }]} />
```

## Notes

- Sizes: a number is px, a string like `'30%'` is a share of the space the panels split. Panels without a
  `defaultSize` share what is left; leave at least one without, or the sizes are scaled to fill.
- A handle moves only its two neighbours. `min`/`max` hold while dragging and when the container resizes (they
  are CSS min/max on the panel); proportions are kept on resize.
- `collapsible`: dragging under half its `min` folds the panel to 0. Enter or a double-click on the handle folds
  the collapsible neighbour (the one before first) and opens it again at its last size. A folded panel is `inert`.
- Handles are focusable separators (`aria-valuenow` = % of the panel before, `aria-controls` it, named from its
  `label`). ←/→ (↑/↓ when vertical) step 16px, Home/End go to the limits; mirrored in RTL.
- Each panel scrolls on its own. The Splitter fills its parent's height (give the parent one); without it a
  horizontal Splitter is as tall as its content. When the panels' mins add up to more than the width (a phone),
  the Splitter scrolls sideways instead of widening the page; consider stacking the panes there. A horizontal
  Splitter takes the width it is given and never sizes to its content: in a flex row give it `flex: 1`.
- Save a layout with `onResizeEnd` (once per drag or key press) and give it back as `defaultSize` (`'32%'`).
- Dragging needs a pointer or the keyboard; there is no single-click way to resize (WCAG 2.5.7), only to fold.

## Props

### Splitter

| Prop | Type | Default | Description |
|---|---|---|---|
| `panels` | `SplitterPanel[]` | **required** |  |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Side by side, or stacked |
| `onResize` | `(sizes: number[]) => void` |  | Every move, sizes in % |
| `onResizeEnd` | `(sizes: number[]) => void` |  | Once per drag or key press: save here |
| `className` | `string` |  | Extra classes |

### SplitterPanel

| Prop | Type | Default | Description |
|---|---|---|---|
| `content` | `ReactNode` | **required** | Panel body; scrolls on its own |
| `defaultSize` | `number \| '${number}%'` |  | Starting size, px or % |
| `min` | `number \| '${number}%'` |  | Smallest size |
| `max` | `number \| '${number}%'` |  | Largest size |
| `collapsible` | `boolean` |  | Can fold to 0 |
| `label` | `string` |  | Names the handle after this panel |

## Files

- `splitter.tsx`: Splitter, `SplitterPanel`
- `split.ts` + `split.check.ts`: size maths (initial sizes, limits, fold snap) and its node check
- `splitter.css`: `.dtx-splitter*`

Catalog: `#/catalog/splitter`
