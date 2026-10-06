# DIGI-TEXX Frontend Kit (dgtx-frek)

React frontend kit for DIGI-TEXX products and AI POCs: brand tokens, components, motion, and ready-made
visuals for document-AI tasks (preprocess, OCR, extraction). Built so FE teams reuse instead of re-implementing.

| | |
|---|---|
| Version | v0.1 |
| Stack | React 19 · Base UI · plain CSS on design tokens (`@layer dtx`) · Tailwind v4 optional in apps · TypeScript 7 · Vite 8 |
| Brand source | `docs/DIGI-TEXX_-Branding-Guidelines-for-content-and-images.pdf` |

## Repository

```
docs/            DIGI-TEXX Branding Guidelines (PDF = the rules) + reference assets (digi-texx-branding/, reference only)
research/        frontend-kit research report (design systems, style, typography, a11y, performance)
visual-proof/    the approved single-file style proof (start point of the kit)
kit/             the frontend kit (npm workspaces)
  packages/tokens   @dtx/tokens  colour/type/shape/motion tokens, light + dark, Roboto (vi subset), contrast test
  packages/ui       @dtx/ui      components
    src/core  layout  data  motion  brand          generic UI
    src/ai/shared  preprocess  ocr  extraction     AI tasks (try-on, enhance, remove-bg planned)
  apps/playground   catalog + Website / App / POC demo pages
```

## Quick start

```bash
cd kit
npm install
npm run dev          # http://<host>:5173 on the LAN, hot reload
```

Open the **Catalog** (left index by category, ready/planned status, every demo in light + dark), the **Website**
and **App** demo pages (built only from the kit), and **POC** (paste OCR engine JSON + an image, play the pipeline).

## Checks

```bash
cd kit
npm test             # token contrast (64 pairs, WCAG AA) + theme lint + normalizeOcr self-check
npm run typecheck
npm run check        # test + typecheck + production build
npm run test:a11y    # rendered contrast (axe) on every catalog entry + demo page, light and dark; needs `npm run dev`
```

## Using the kit in an app

```css
@layer theme, base, dtx, components, utilities;   /* kit sits under Tailwind utilities */
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

More: [`kit/README.md`](kit/README.md) · folder guide [`kit/packages/ui/src/README.md`](kit/packages/ui/src/README.md).

## AI building blocks (highlights)

| Need | Use |
|---|---|
| Boxes over a page, compare AI text vs original | `BoxOverlay` (`hover="lens"` magnified crop over AI text, or `"blink"`) |
| Scanning effect, reveal boxes or a cleaned page under the beam | `ScanBeam` (`reveal="progressive" \| "whole" \| "none"`, `before`/`after`, `beam={false}`) |
| Raw vs processed page by hand | `CompareSlider before after` (same props as `ScanBeam`) |
| Real unwarp result with the service lattice | `UnwarpView raw unwarped grid applied` |
| Whole pipeline from engine JSON | `OcrShowcase data={OcrDocument}` + `normalizeOcr()` |
| Confidence | `ConfidenceBadge`, `ConfidenceBar`, `ConfidenceDots` |

## Rules (short)

- **Brand** comes from the Guidelines PDF only: Roboto (Arial fallback), DIGI-TEXX Blue `#2582D7` leads, lime/amber/violet
  only next to blue, logo files never modified. `docs/digi-texx-branding/` is reference, not rules.
- **Light and dark**: every component works in both; colours only via `--dtx-*` tokens (enforced by `npm test`).
- **Accessibility**: WCAG 2.2 AA; enforced by the token contrast test and `test:a11y`.
- **One job per component**; compose them (e.g. `ScanBeam` around `BoxOverlay`). Pixel steps (binarize, denoise…) are a
  before/after pair of pages, not a component.
- Every component gets a **catalog entry** (`ready` or `planned`).

## Real sample data (internal, not in git)

The playground can show real customer pages (project 1266 civil records, stengg pages). They are **git-ignored**.
Regenerate locally:

```bash
cd kit
python3 apps/playground/scripts/import_1266.py             # needs /home/shared/projects/1266_full_pipeline
python3 apps/playground/scripts/import_stengg_unwarp.py    # needs pz-auto_preprocessing on :6005 (AUTOPRE_URL)
python3 apps/playground/scripts/import_stengg_enhance.py
```

Do not commit or publish them; demos without them fall back to the synthetic sample invoice.
