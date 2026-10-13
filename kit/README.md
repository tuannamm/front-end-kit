# DIGI-TEXX Frontend Kit

React kit for DIGI-TEXX products and POCs. Brand rules come from the 2024 Branding Guidelines PDF (`../docs/`).

```
packages/ui       @dgtx/ui-frek  React components (Base UI + plain CSS in @layer dtx) + tokens; the one published package
  tokens/                                    theme.css (light/dark tokens), fonts.css (Roboto, vi subset), tailwind.css (utilities bridge)
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

The kit is published to the company Nexus as one package, `@dgtx/ui-frek`: the components, their CSS and the design tokens.

**Before the first install**, point npm at Nexus in the `.npmrc` in your home directory (`~/.npmrc` on Linux/macOS,
`%USERPROFILE%\.npmrc` on Windows). Create the file if it does not exist:

```ini
registry=https://nexus.digi-texx.vn/repository/npm/
```

Or run `npm config set registry https://nexus.digi-texx.vn/repository/npm/`, which writes the same line.
Check it with `npm config get registry`. Without this setting, `npm i @dgtx/ui-frek` fails with `404 Not Found`,
because the package exists only on Nexus, not on the public npm registry.

```bash
npm i @dgtx/ui-frek        # peer deps: react, react-dom 19
```

```css
@layer theme, base, dtx, components, utilities;   /* kit under Tailwind utilities */
@import "tailwindcss";                              /* optional */
@import "@dgtx/ui-frek/fonts.css";
@import "@dgtx/ui-frek/styles.css";
@import "@dgtx/ui-frek/tailwind.css";               /* optional: bg-surface, text-fg-muted… */
```

```tsx
import { ToastProvider, TooltipProvider, OcrShowcase } from '@dgtx/ui-frek';

<TooltipProvider><ToastProvider>
  <OcrShowcase data={engineJson} stages={['unwarp', 'binarize', 'detect', 'recognize', 'extract']} />
</ToastProvider></TooltipProvider>
```

`engineJson` is an `OcrDocument`: `{ image: { src, width, height }, lines: [{ text, confidence, box }], fields?, regions? }`.
Boxes accept `[x,y,w,h]`, `{x1,y1,x2,y2}` or 4-point polygons in pixels; confidence 0–1 or 0–100.

Works with any bundler that handles `new URL('…', import.meta.url)` (Vite, webpack 5, Rspack): the logos and the
pdf.js worker ship as files next to the JS.

## Publish to Nexus

The package ships compiled JS + `.d.ts` from `packages/ui/dist` (built by `npm run build -w @dgtx/ui-frek`, run
automatically on pack/publish) and the CSS straight from `src/` and `tokens/`. The playground and tests read the TypeScript source
through the `dtx-source` export condition, so day-to-day work needs no build.

GitLab CI publishes it (`.gitlab-ci.yml` at the repo root). Every push runs the checks; a version tag also publishes.

```bash
# 1. bump "version" in kit/packages/ui/package.json (e.g. 0.2.0), commit and push
# 2. tag that exact version
git tag v0.2.0 && git push origin v0.2.0
```

- The publish job stops when the tag differs from `version`, or when `publishConfig.registry` in
  `packages/ui/package.json` differs from the `NPM_REGISTRY` variable.
- A pre-release (`0.2.0-rc.1`, tag `v0.2.0-rc.1`) is published under the `next` dist-tag: `npm i @dgtx/ui-frek@next`.
  Plain `npm i @dgtx/ui-frek` keeps installing the last stable version.
- Nexus refuses to overwrite a published version: bump `version` for every release.
- CI/CD variables `NPM_REGISTRY` and `NPM_TOKEN` (masked). If they are *Protected*, protect the release tags as well
  (Settings → Repository → Protected tags, pattern `v*`), or the job runs without them.

`npm pack -w @dgtx/ui-frek` builds the tarball locally without publishing, to inspect what ships.

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
