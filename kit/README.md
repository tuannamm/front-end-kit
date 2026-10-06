# DIGI-TEXX Frontend Kit

React kit for DIGI-TEXX products and POCs. Brand rules come from the 2024 Branding Guidelines PDF (`../docs/`).

```
packages/tokens   @dtx/tokens  theme.css (light/dark tokens), fonts.css (Roboto, vi subset), tailwind.css (utilities bridge)
packages/ui       @dtx/ui      React components (Base UI + plain CSS in @layer dtx)
  src/core  layout  data  motion  brand      generic UI
  src/ai/shared  preprocess  ocr  extraction   AI tasks (try-on, enhance, remove-bg later)
apps/playground   catalog (left index, status, live demos) + Website/App demos + POC page
```

## Run

```bash
npm install
npm run dev        # http://<host>:5173 on the LAN, hot reload
npm run check      # token contrast + theme lint + normalizeOcr check + typecheck + build
npm run test:a11y  # rendered contrast (axe) on every catalog entry + demo page, light and dark; needs `npm run dev` running (BASE=http://host:5173)
```

## Use in an app

```css
@layer theme, base, dtx, components, utilities;   /* kit under Tailwind utilities */
@import "tailwindcss";                              /* optional */
@import "@dtx/tokens/fonts.css";
@import "@dtx/ui/styles.css";
@import "@dtx/tokens/tailwind.css";                 /* optional: bg-surface, text-fg-muted… */
```

```tsx
import { ToastProvider, TooltipProvider, OcrShowcase } from '@dtx/ui';

<TooltipProvider><ToastProvider>
  <OcrShowcase data={engineJson} stages={['unwarp', 'binarize', 'detect', 'recognize', 'extract']} />
</ToastProvider></TooltipProvider>
```

`engineJson` is an `OcrDocument`: `{ image: { src, width, height }, lines: [{ text, confidence, box }], fields?, regions? }`.
Boxes accept `[x,y,w,h]`, `{x1,y1,x2,y2}` or 4-point polygons in pixels; confidence 0–1 or 0–100.

## Rules

- Roboto only (Arial fallback). DIGI-TEXX Blue `#2582D7` leads; lime/amber/violet only next to blue.
- White text on `#2582D7` only at ≥ 19px bold; small labels use `--dtx-blue-strong`.
- New generic component → `core|layout|data|motion|brand`. Belongs to one AI task → `ai/<task>/`. Used by 2+ tasks → `ai/shared/`.
- Every new component gets a catalog entry (status `ready` or `planned`).
- **Every component must work in light and dark.** Enforced three ways:
  1. Colours come from semantic `--dtx-*` tokens. `npm test` runs `packages/ui/theme.check.mjs` and fails on a hard-coded
     colour **or** a fixed brand constant (`--dtx-ink`, `--dtx-navy`, `--dtx-canvas-dark`…) used as text colour or a neutral
     surface. Allowed: black/white alpha, DIGI-TEXX Blue alpha tints, solid brand fills with white/ink text. Anything that
     must not follow the theme (paper, a photo backdrop) needs `/* theme-fixed: reason */` on the same line.
  4. `npm run test:a11y` measures what the browser actually paints (axe color-contrast) in both themes. It catches
     combinations no static check sees, e.g. a theme-aware badge inside a fixed-colour card. Elements that deliberately
     show a failing pair carry `data-a11y-demo`.
  5. Interactive states (hover, selected…) get a static catalog demo (e.g. BoxOverlay `pinnedId`) so they are reviewed
     and tested without a pointer.
  2. Text inside a themed subtree re-reads `--dtx-fg` (`[data-theme] { color: var(--dtx-fg) }`), so `data-theme="dark"`
     on any element flips that section, text included.
  3. The catalog renders every demo in light **and** dark side by side by default. A demo that is only valid on one
     background (a logo variant) declares `only: 'light' | 'dark'`; everything else must look right in both.
