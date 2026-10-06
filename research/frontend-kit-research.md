# DIGI-TEXX Frontend Kit — Research Report

Date: 2026-10-05 · Scope: what a frontend kit is, how others build it, how to build ours (React), and style direction (typography, hierarchy, accessibility, performance, design system).

Legend: **[V]** verified against a fetched source or computed here · **[I]** inferred / industry practice — confirm before committing.

---

## 0. Source authority (read first)

**The guideline PDF (`docs/DIGI-TEXX_-Branding-Guidelines-for-content-and-images.pdf`) is the only rule source. `docs/digi-texx-branding/` is reference only** — where it adds things the PDF doesn't state, they are proposals, not brand rules.

| Item | Status | Evidence |
|---|---|---|
| Font: **Roboto** (Thin/Light/Regular/Bold + italics) | **Rule** | PDF p.12 "07. FONT" |
| Arial / Arial Narrow | Fallback (embedded in PDF, used for Office) | `pdffonts` |
| SVN-HemiHead (italic section titles) | **Not a rule** — only the PDF's own layout typeface; not in its font section | `pdffonts`; 0 text mentions |
| `#2582D7` DIGI-TEXX Blue, always leading | **Rule** | PDF p.5, p.11 |
| Secondary `#A5CB1F`, `#F6B71E`, `#9127D6` — always paired with blue, for shapes/decorative motifs | **Rule** | PDF p.11 |
| Logo colours `#2582D7`, `#6E6F72` (tagline), `#231F20` (wordmark), tile gradient `#1A489E → #0D1120` | **Rule** (logo only) | PDF p.5 |
| Logo: clear space ≥ ½ symbol height, min 10 mm, no recolour/rotate/stretch/shadow/glow/outline/busy bg | **Rule** | PDF p.6–10 |
| Main-palette tints `#26385D`, `#137BB6`, `#30AAE0`, `#7BD2F2`, `#A8E5F5` | **Shown, but mislabelled** — all 6 swatches on p.11 are captioned `#2582d7`; values pixel-sampled here [V] | Ask Marketing to confirm hex |
| Dark `#1E1D23`, light panel `#F0F0F0`, bar gradient `#00ACEB → #004EBE` | **PDF layout colours, not stated rules** — pixel-sampled from its pages [V] | Usable as "look & feel", flag as derived |
| `#1A6FBF`, status colours, `#E2E4E8` borders, 6px radius, 8px grid, type scale, button specs | **Not in PDF** — skill-folder / our proposals | Treat as kit decisions, not brand |

Consequence: every token beyond the "Rule" rows lives in the kit's *semantic* layer and is documented as a DIGI-TEXX Frontend Kit decision, so Marketing can override it without touching brand rules.

## 1. What a "frontend kit" actually is

There is no formal definition; the terms overlap. Working taxonomy:

| Term | What it is | Example |
|---|---|---|
| **Design system** | The whole thing: principles, tokens, components, patterns, a11y + content rules, governance, tooling | IBM Carbon, Atlassian |
| **Component library** | Code only — reusable React components | `@carbon/react`, `@primer/react` |
| **UI kit** | Design-side artifact (Figma library) or app templates | Bosch UI Kit (Figma), thefrontkit.com |
| **Frontend kit** | Coded implementation of the UI kit: tokens + components + patterns + templates + docs + tooling | Bosch FROK |

Layer model the case studies converge on [I]:

```
1. Primitive tokens     raw scales: blue-50..950, space-1..24
2. Semantic tokens      --color-bg-surface, --color-fg-danger, --color-primary
3. Component tokens     --button-primary-bg
4. Headless behaviour   ARIA, keyboard, focus (Radix / Base UI / React Aria)
5. Styled components    Button, Input, Dialog, DataTable
6. Patterns/templates   login, dashboard shell, upload + OCR review screen
7. Docs + tooling       Storybook, lint rules, codemods, Figma sync, MCP
```

- Atomic design (atoms → molecules → organisms → templates → pages) — Brad Frost [V] https://bradfrost.com/blog/post/atomic-web-design/
- **Design tokens spec (DTCG) reached first stable version 2025.10** on 28 Oct 2025 — Community Group spec, not a W3C Standard. Adds theming/multi-brand, OKLCH/P3 colours, aliases. Implemented by Style Dictionary, Tokens Studio, Terrazzo, Figma, Penpot [V] https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/

## 2. How other companies do it

| System | What ships | Distribution | Takeaway for us |
|---|---|---|---|
| **Bosch FROK** | HTML/CSS/JS pattern library, atomic structure, multi-brand + light/dark, icon font | Versioned artifact in internal registry; copy markup from docs [V partly] | Framework-agnostic, not React. Square (radius 0 ×35 in atoms CSS [V]), icon font, normalize.css, per-layer CSS bundles → feels 2015. Keep its **multi-brand + dark mode** idea, drop the rest. |
| **shadcn/ui** | Component *source* copied into your repo, Tailwind v4, OKLCH tokens, Radix or Base UI | `shadcn` CLI + **registry**; supports company namespaces (`@dtx/button`) and private/authenticated registries [V] https://ui.shadcn.com/docs/registry | The modern default. You own the code; registry distributes it. |
| **GitHub Primer** | `@primer/primitives` (tokens) + `@primer/react`; migrated CSS-in-JS → CSS Modules [V] | npm | Tokens as separate package; moved off runtime CSS-in-JS for perf. |
| **IBM Carbon** | Monorepo: React + web components, Sass, tokens, icons [V] | npm | Gold-standard docs/governance; heavy. |
| **Atlassian** | `@atlaskit/*` packages, tokens, stylelint plugin, **official MCP server** [V] | npm | Enforcement tooling (lint + AI) drives adoption. |
| **Shopify Polaris** | Deprecated Polaris React → web components from CDN [V, secondary] | CDN | Platform owner forcing evergreen versions; not our situation. |
| **Vercel Geist** | Colour system, Geist Sans/Mono, icons, visible-grid aesthetic [V] | Fonts/icons public | Style reference. |
| **thefrontkit.com** | *Commercial templates*: 23 Next.js business apps; Next 16, React 19, Tailwind v4, shadcn/Radix; Solo/Team/**Agency** licences [V] | Paid download | Shows the "templates on top of shadcn" layer — exactly what an outsourcing company reuses across client projects. |
| **frontend-kit.com** | Not a component kit — an AI design-critique service. Philosophy worth stealing: "Ornament is a tax", "Motion as information", "tokens, not one-offs" [V] | — | Principles only. |

## 3. Distribution model — recommendation for DIGI-TEXX

| | npm package | Copy-in registry (shadcn) | **Hybrid (recommended)** |
|---|---|---|---|
| Upgrades | semver, central fixes | manual re-pull, drift | core via npm, blocks via registry |
| Customisation | props/tokens only | total | both |
| Client handover | client depends on our package | client gets plain code ✔ | ✔ |

**Recommendation [I]:**
- `@dtx/tokens` + `@dtx/ui` (primitives: Button, Input, Select, Dialog, Table, Toast…) → **private npm** (consistency, central a11y fixes).
- Templates/blocks (login, app shell, dashboard, document-upload + OCR-review, data-entry forms) → **private shadcn-compatible registry** (`npx shadcn add @dtx/ocr-review`). Client projects receive plain source with no runtime dependency on us.
- **Multi-brand theming from day one**: client projects will need the client's colours; the token layer must allow re-theming (DTCG 2025.10 supports this).

## 4. Recommended stack & repo layout

| Concern | Choice | Notes |
|---|---|---|
| Monorepo | pnpm workspaces + Turborepo | [I] |
| Tokens source | DTCG JSON → **Style Dictionary v5** → `theme.css` (`@theme {}`) | SD v5 uses DTCG 2025.10 natively [V] |
| Styling | **Tailwind v4** (CSS-first `@theme`, CSS variables, zero runtime) + `tailwind-variants` or CVA | Tailwind v4 [V] https://tailwindcss.com/docs/theme |
| Headless | **Base UI** (`@base-ui/react`, v1 stable Dec 2025) or Radix; React Aria for hard widgets (date picker, i18n calendars) | shadcn supports both [V]; choice [I] |
| Icons | lucide-react (per-icon imports) | not an icon font |
| Docs | **Storybook 10** (ESM-only, lighter) + a11y addon | [V] |
| Testing | Vitest (Storybook integration), Playwright + `@axe-core/playwright`, Chromatic visual regression | [V] |
| Release | Changesets, `size-limit`, `publint`, `attw` | [I] |
| Figma sync | Figma Variables ↔ tokens via GitHub Action / Tokens Studio | [V] https://github.com/figma/variables-github-action-example |
| Frameworks supported | Vite SPA **and** Next.js App Router (RSC fixture app in CI) | [I] |

```
dtx-frontend-kit/
├─ apps/docs/            Storybook (+ later a marketing/docs site)
├─ apps/playground-next/ RSC/App Router fixture used in CI
├─ packages/tokens/      DTCG JSON → theme.css, tokens.ts, tailwind preset
├─ packages/ui/          primitives + styled components
├─ packages/registry/    blocks & templates (registry.json)
├─ packages/icons/       brand motifs (hex, dots, circuit SVGs)
├─ packages/config/      eslint (jsx-a11y, react-compiler), tsconfig
└─ .changeset/
```

Starting point: primitive tokens are built from the PDF (section 0 "Rule" rows + sampled palette). `docs/digi-texx-branding/assets/*` is reference only — its display-font token and derived values are not copied as-is.

## 5. Style direction — "DIGI-TEXX Futuristic"

### Why FROK looks old vs why shadcn looks modern

| FROK (anti-reference) [V from its CSS] | Modern references (shadcn, Linear, Geist, Vercel) |
|---|---|
| `border-radius: 0` everywhere, solid flat fills | Small consistent radius scale, neutral surfaces, one accent |
| Icon font, normalize.css, 5 global CSS bundles | SVG icons, CSS variables, utility CSS, OKLCH tokens |
| Fixed rem type, no fluid scale | Fluid `clamp()` type, tight heading tracking |
| Docs browsed by atomic taxonomy, default Prism code theme | Task-oriented docs, live previews, copy button, ⌘K search |
| Colour as large fills | Neutral-first, colour ≈ 10%, hairline borders > shadows |
| Light-first, institutional | Dark mode as first-class, subtle glow/grid texture |

### Principle
A quiet, navy-tinted dark canvas where **DIGI-TEXX Blue is the only chromatic voice**. Tech character comes from *structure* — grid lines, circuit traces, hairlines, squared corners, hex/dot motifs from the logo — not from extra colours. Light theme is equally supported (default for internal apps/forms; brand guideline says the same).

### Colour tokens (brand hex [V], OKLCH approx. [I] — recompute with culori)

| Semantic token | Dark | Light | Notes |
|---|---|---|---|
| `--bg` canvas | `#1E1D23` (brand) | `#F7F9FC` | |
| `--surface-1` | ≈`#262530` | `#FFFFFF` | cards |
| `--surface-2` | ≈`#2D2E3B` | ≈`#F1F4F8` | hover, raised |
| `--surface-3` | ≈`#353A4C` | — | popovers |
| `--border` | `rgb(255 255 255 / .09)` | `rgb(38 56 93 / .12)` | hairline |
| `--fg` | `#F5F7FA` | `#26385D` navy / `#231F20` ink | |
| `--fg-muted` | `#B8BAC0` | `#6E6F72` | |
| `--primary` (fill) | `#2582D7` | `#2582D7` | white label only ≥ 18.66px bold / 24px |
| `--primary-strong` (fill w/ small text) | `#1A6FBF` | `#1A6FBF` | |
| `--link` / small blue text | `#30AAE0` or `#4DAEF2` | `#137BB6` | |
| `--focus` | `#30AAE0` | `#7BD2F2` + offset | |
| gradient | `#00ACEB → #004EBE` | same | decoration/hero only, ≤ 5% of screen |

**Contrast — computed here [V]:**

| Pair | Ratio | Verdict |
|---|---|---|
| white on `#2582D7` | 4.00 | ❌ small text — large/bold only |
| white on `#1A6FBF` | 5.16 | ✅ use for small-label buttons |
| `#137BB6` on white | 4.63 | ✅ link colour on light |
| `#2582D7` on `#1E1D23` | 4.18 | ❌ **brand blue text fails on dark too** — not in the guideline |
| `#30AAE0` on `#1E1D23` | 6.34 | ✅ blue text on dark |
| `#4DAEF2` on `#1E1D23` | 6.89 | ✅ |
| `#B8BAC0` on `#1E1D23` | 8.62 | ✅ muted text dark |
| `#6E6F72` on white | 5.02 | ✅ muted text light |
| navy `#26385D` on `#F7F9FC` | 11.02 | ✅ |

Status colours: success / warning / danger kept low-chroma and distinct from blue; chips use 12–16% tinted fill + solid dot. Lime/amber/violet are accents next to blue only (brand rule), e.g. chart series.

### Shape, elevation, texture

- **Radius:** `2 / 4 / 6 / 10 / 14 / full`. Controls 4–6px (squared tech feel), cards 10px. Optional **chamfered corner** (`clip-path`) on hero tiles/CTAs as a circuit/hex echo — sparingly.
- **Elevation:** e0 border only · e1 card = hairline + `inset 0 1px 0 rgb(255 255 255/.04)` · e2 hover = `0 4px 16px rgb(0 0 0/.3)` · e3 popover = `0 12px 40px rgb(0 0 0/.45)` + optional `backdrop-filter: blur(16px)`. Light theme: same structure with navy-tinted shadows.
- **Glow:** blue glow only on focus ring, primary hover, hero. Never on the logo (brand rule).
- **Texture:** 1px grid at 4–6% opacity, radial-masked (fades to edges); circuit SVG traces at 6–10% in hero/empty states; 2–3% grain on gradients (kills banding). Never behind tables/forms.
- **Motifs:** hex + square dots (from the logo's 6 dots) for bullets, step markers, loaders, icon containers.

### Motion
`--dur-fast 140ms` (hover/press) · `--dur-base 220ms` (enter) · `--dur-slow 360ms` (page) · `--ease-out cubic-bezier(.16,1,.3,1)` · `--ease-in-out cubic-bezier(.4,0,.2,1)`. Animate transform/opacity only. Under `prefers-reduced-motion`: opacity fades only, no drift/shimmer/parallax. "Motion as information" — no decorative loops in app UI.

## 6. Typography

| Role | Face | Rules |
|---|---|---|
| UI + body | **Roboto** (variable; weights 100–700 + italics, as in the guideline) | Only brand font. Vietnamese subset available [V] |
| Display (H1, hero, section titles) | **Roboto Bold Italic** (700i), optionally uppercase | Guideline p.12 "07. FONT" lists only Roboto Thin/Light/Regular/Bold + italics [V]. Bold Italic gives the brand's slanted tech feel without a second family. |
| Fallback (Office / Roboto unavailable) | **Arial** (Arial Narrow for tight layouts) | Embedded in the guideline PDF [V]. CSS stack: `"Roboto", Arial, sans-serif` |
| Numbers, IDs, OCR output | Roboto + `font-variant-numeric: tabular-nums` | No mono family. Only exception needing a decision: code blocks in docs (see open questions) |

> **Rule (from guideline PDF):** only Roboto and Arial. SVN-HemiHead / Chakra Petch from the earlier draft are **dropped** — SVN-HemiHead appears in the PDF only as artwork inside slide images, not as a font rule.

Scale (fluid, ratio ≈1.2 app / 1.25 marketing):

```css
--text-xs: .75rem;   --text-sm: .875rem;  --text-base: 1rem;  /* 15px option for dense apps */
--text-lg: 1.25rem;  --text-xl: 1.5rem;
--text-h2: clamp(1.5rem, 1.2rem + 1.2vw, 2rem);
--text-h1: clamp(1.875rem, 1.4rem + 1.6vw, 2.5rem);
--text-display: clamp(2.25rem, 1.5rem + 3vw, 4.5rem);   /* brand: hero 48–72px */
```

- Line-height: display 1.15 (not lower — **Vietnamese stacked diacritics** "Ệ, Ầ, Ữ" clip), headings 1.25, body 1.5–1.6, dense UI 1.4.
- Tracking: display −0.02em (Roboto Bold Italic; +0.02em if uppercase), body 0, small-caps labels +0.06em.
- Max 2 weights (400/600, 700 for display) and 3 text colours per screen.
- `font-variant-numeric: tabular-nums` on tables, KPIs, timers — critical for BPO/OCR dashboards.
- Test strings in Storybook: "Nguyễn Thị Thuận", "Ứng dụng nhập liệu tự động", "TRÍCH XUẤT DỮ LIỆU".

## 7. Hierarchy (apps & dashboards)

- **Lever order:** size → weight → colour → spacing. Don't use all four at once.
- **60-30-10:** 60% neutral canvas · 30% surfaces · 10% blue.
- **One primary action per view** (filled blue); secondary = outline; tertiary = ghost.
- **Spacing:** 4px base, scale 4/8/12/16/24/32/48/64/96 (brand says 8px grid — 4px is a superset, keep 8 for layout). Gap inside group ≤ half the gap between groups.
- Group by proximity and surface first, borders second — don't box everything.
- **Squint test** in review: primary action, page title, key metric must survive the blur.
- Density is a **mode** (`data-density="compact|comfortable"`), not a global choice — dense tables for ops staff, roomy marketing pages.
- Key numbers top-left, large, tabular; labels small and muted.

## 8. Accessibility — target WCAG 2.2 AA

Drivers: **European Accessibility Act** enforceable since 28 Jun 2025 (via EN 301 549 → WCAG 2.1 AA) for clients selling to EU consumers [S — secondary sources, confirm on EUR-Lex]; client procurement flows it down. Vietnam: Law 51/2010/QH12 is aspirational; no enforceable private-sector web standard found [S]. WCAG 3 is still a Working Draft; APCA non-normative → informational only.

Component-library-critical criteria [V] https://www.w3.org/TR/WCAG22/:
- **2.4.7 / 2.4.11** focus always visible and never hidden under sticky header/toasts (`scroll-padding`); aim for 2.4.13 anyway: ≥2px ring, 3:1.
- **2.5.8** target size ≥ 24×24px (44px for touch-first) — icon buttons are the usual failure.
- **2.5.7** draggables (kanban, sortable, slider, resizable panes) need a non-drag alternative.
- **1.4.3 / 1.4.11** 4.5:1 text, 3:1 UI + focus rings — see the contrast table above.
- **3.3.8** never block paste into password/OTP.

Enforcement pipeline:
1. ESLint `jsx-a11y`.
2. Storybook a11y addon with `parameters.a11y.test: 'error'` in CI (axe catches ≤ ~57% of issues [V] — so manual testing stays).
3. `@axe-core/playwright` on key flows in light, dark, forced-colors, 320px width, 200% zoom.
4. **Token contrast test**: script asserts every fg/bg semantic pair in both themes; build fails below threshold.
5. Manual matrix per release: NVDA+Chrome, VoiceOver+Safari (macOS/iOS), TalkBack+Chrome; keyboard-only pass.
6. Definition of done per component: keyboard map linked to WAI-ARIA APG, focus-order story, passing axe.
7. Modes: dark (re-verify contrast, don't invert), `prefers-reduced-motion`, `forced-colors: active` (outline not box-shadow), logical CSS properties, `lang="vi"` + `Intl.*`, allow 20–30% text expansion EN↔VI.
8. Publish a VPAT/ACR for EU-bound client work.

Rule: never hand-roll combobox, dialog, menu, tabs, date picker — wrap a headless primitive.

## 9. Performance

Targets — Core Web Vitals at p75 [V] https://web.dev/articles/vitals: **LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1**.

- **Zero-runtime styling**: Tailwind v4 + CSS variables; theme switch = attribute change, no JS re-render. No styled-components/Emotion (RSC-hostile, main-thread cost — Primer migrated away [V]).
- **RSC-safe**: `'use client'` only on interactive modules; presentational components (Card, Badge, Stack, Text) stay server-safe; per-component files so one client boundary doesn't infect the barrel [V] https://react.dev/reference/rsc/use-client. Next.js fixture app in CI.
- **React Compiler-friendly**: pure render, compiler lint rules on [V partial].
- **Packaging**: ESM, `exports` map, `"sideEffects": ["*.css"]`, preserved modules for tree-shaking; `size-limit` budget per entry; `publint` + `attw` in CI.
- **Icons**: per-icon imports; no icon fonts (FROK's approach).
- **Fonts**: self-host WOFF2 variable Roboto with `latin` + `vietnamese` subsets via `unicode-range`; preload only above-the-fold subset; `font-display: swap`; metric-adjusted fallback (`next/font` does it automatically [V]; `fontaine`/Capsize elsewhere) → removes font-swap CLS. One family (Roboto) + Arial fallback only.
- **Images/skeletons**: required width/height or aspect-ratio; skeletons match final size (CLS).
- **Motion**: CSS transitions + `@starting-style` first; `motion` library only lazily (`LazyMotion`) in client components.
- **Measure**: Lighthouse CI assertions, `web-vitals` field data, bundle visualizer, React Profiler.

## 10. Recommended next steps

1. **Decide** (needs you): distribution model (hybrid recommended), headless base (Base UI vs Radix), whether to support Next.js App Router from v1.
2. **Fonts settled**: Roboto only (Arial fallback) — no licensing step needed.
3. **Phase 0 — foundations (1–2 wks)**: monorepo, token pipeline (DTCG → Style Dictionary → Tailwind `@theme`), light/dark semantic tokens, contrast test, fonts, Storybook.
4. **Phase 1 — core 15 components**: Button, IconButton, Input, Textarea, Select/Combobox, Checkbox, Radio, Switch, Dialog, Popover, Tooltip, Tabs, Toast, Table, Badge — each with a11y DoD.
5. **Phase 2 — blocks/templates in registry**: app shell (sidebar + ⌘K), login, dashboard (bento KPI), data table w/ filters, document upload + OCR review split view, empty/404 states with mascot.
6. **Visual proof first**: before Phase 1, build one hero page + one dashboard screen in the proposed style to validate the "futuristic" direction with stakeholders.

## Open questions / unverified

- **Ask Marketing for official hex of the 5 main-palette tints** (PDF p.11 labels all six swatches `#2582d7`); until then use pixel-sampled values.

- Code blocks in kit docs: strictly Roboto, or allow the browser's `ui-monospace` for code only? (Docs site only, not product UI.)
- Radix vs Base UI default in shadcn (secondary source says Base UI since Jul 2026) — check shadcn docs at scaffold time.
- EAA/EN 301 549 and WCAG 3 dates from secondary sources only.
- Visual specifics of Linear/Raycast/Stripe/Resend not rendered — no screenshot pass done.
- Exact current versions of pnpm, Turborepo, Changesets, CVA — pin at scaffold time.
- Brand OKLCH conversions approximate.

## Sources

Local: `docs/digi-texx-branding/SKILL.md`, `references/ui.md`, `assets/tokens.css`, `assets/tailwind.preset.js`.
External: bradfrost.com/blog/post/atomic-web-design · w3.org/community/design-tokens (2025.10) · designtokens.org · ui.shadcn.com/docs/registry · ui.shadcn.com/docs/theming · ui.shadcn.com/docs/changelog · primer.style · github.com/carbon-design-system/carbon · npmjs.com/package/@atlaskit/ads-mcp · vercel.com/geist · linear.app · thefrontkit.com · frontend-kit.com · frok-bg.ui.bosch.tech (+ its CSS) · github.com/google/fonts (Roboto METADATA) · DIGI-TEXX Branding Guidelines PDF p.12 "07. FONT" · styledictionary.com/info/dtcg · tailwindcss.com/docs/theme · tailwindcss.com/blog/tailwindcss-v4 · storybook.js.org/docs/writing-tests/accessibility-testing · chromatic.com/docs/accessibility · w3.org/TR/WCAG22 · w3.org/WAI/WCAG22/Understanding/target-size-minimum · web.dev/articles/vitals · react.dev/reference/rsc/use-client · react.dev/learn/react-compiler · nextjs.org/docs/app/api-reference/components/font · react-aria.adobe.com · github.com/figma/variables-github-action-example.

## Decisions (2026-10-05)

- **Distribution: Hybrid** — `@dtx/tokens` + `@dtx/ui` as private npm; templates/blocks via private shadcn-compatible registry.
- **First step: Visual proof** — one hero/landing page + one dashboard screen in the "DIGI-TEXX Futuristic" style, reviewed with stakeholders before building the kit.
