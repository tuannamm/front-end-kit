# Motion

Reusable motion, one phase per component: enter (`Reveal`), wait (`Skeleton`), both (`Loadable`), numbers (`CountUp`).
Under reduced motion everything shows its final state. `useReducedMotion()` returns the OS setting for JS-driven animation.

```tsx
import { Loadable, Reveal, CountUp } from '@dtx/ui';

<Loadable loading={isLoading}><BatchList /></Loadable>
{items.map((it, i) => <Reveal key={it.id} index={i}>{…}</Reveal>)}
```

## Props

### Reveal

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | **required** | Content that enters |
| `effect` | `'fade' \| 'fade-up' \| 'scale' \| 'slide-in'` | `'fade-up'` | Enter animation; change `key` to replay |
| `delay` | `number` | `0` | ms before it starts |
| `index` | `number` | `0` | Position in a list; adds `index × stagger` to the delay |
| `stagger` | `number` | `60` | ms between list items |
| `className` | `string` |  | Extra classes |
| `style` | `CSSProperties` |  | Extra styles |

### Skeleton

| Prop | Type | Default | Description |
|---|---|---|---|
| `width` | `number \| string` | `'100%'` | Match the final content so nothing shifts |
| `height` | `number \| string` | `10` | px or any CSS length |
| `radius` | `number` |  | Corner radius in px |
| `className` | `string` |  | Extra classes |

### SkeletonText

| Prop | Type | Default | Description |
|---|---|---|---|
| `lines` | `number` | `3` | Number of lines; the first is taller, like a title |
| `label` | `string` | `'Đang tải'` | Accessible name of the loading status |

### Loadable

| Prop | Type | Default | Description |
|---|---|---|---|
| `loading` | `boolean` | **required** | Skeleton while true, then the content enters |
| `children` | `ReactNode` | **required** | The loaded content |
| `skeleton` | `ReactNode` | `<SkeletonText />` | Placeholder shaped like the content |
| `effect` | `RevealEffect` | `'fade-up'` | How the content enters |

### CountUp

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | **required** | Final number; counts from 0 on mount and when it changes |
| `decimals` | `number` | `0` | Fraction digits |
| `duration` | `number` | `900` | ms, ease-out |
| `locale` | `string` | `'en-US'` | Number format |

## Files

- `primitives.tsx`: Reveal, Skeleton, SkeletonText, Loadable, CountUp, useReducedMotion
- Styles: `.dtx-enter-*`, `.dtx-skeleton*` and the keyframes in `styles.css`
