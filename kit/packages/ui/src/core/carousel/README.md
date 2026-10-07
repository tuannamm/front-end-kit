# Carousel

A row of slides that scrolls sideways: announcements, a strip of cards, a set of images. Built on native scroll
snapping, so swipe, trackpad and mouse wheel work without extra code.

```tsx
import { Carousel } from '@dtx/ui';

// one slide at a time
<Carousel aria-label="Tin mới">
  {news.map(n => <NewsSlide key={n.id} {...n} />)}
</Carousel>

// a row of cards, the next one peeking
<Carousel aria-label="Lô gần đây" slideWidth="min(260px, 80%)">
  {batches.map(b => <BatchCard key={b.id} batch={b} />)}
</Carousel>
```

## Notes

- The slides sit in a scroll box with `scroll-snap`. The arrow buttons move a page: "Slide tiếp" brings the first
  hidden slide to the start, "Slide trước" brings the previous one to the end. The row itself takes focus, and then
  ←/→ scroll it.
- With 10 slides or fewer the dots show which slides are in view (longer blue pills) and jump to a slide. With more,
  a "3–5 / 20" count replaces them. `indicators={false}` leaves only the arrows.
- At either end the arrow is `aria-disabled`, not `disabled`, so keyboard focus stays on it. When every slide fits,
  the controls are hidden.
- A slide counts as shown when 60% of it is in view.
- Follows the WAI-ARIA carousel pattern: a `<section aria-roledescription="carousel">` named by `aria-label`, each
  slide a group named "3 / 8". A move made with the buttons or dots is announced ("Đang xem 3–5 / 20"); a swipe is not.
- No autoplay: moving content needs a pause button (WCAG 2.2.2) and is rarely read. Under reduced motion the row
  jumps instead of scrolling smoothly.
- Slide content keeps its focus ring: the scroll box has 4px of room around it. Equal slide heights come from the grid;
  give slide content `height: 100%` to fill them.

## Props

### Carousel

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | **required** | One child per slide |
| `aria-label` | `string` | **required** | Names the carousel |
| `slideWidth` | `string` | `'100%'` | Any CSS width, e.g. `'min(260px, 80%)'` for a card row |
| `gap` | `number` | `16` | Space between slides, in px |
| `indicators` | `boolean` | `true` | Dots (≤ 10 slides) or a count beside the arrows |
| `className` | `string` |  | Extra classes |

## Files

- `carousel.tsx`: Carousel
- `carousel.css`: `.dtx-carousel*`

Catalog: `#/catalog/carousel`
