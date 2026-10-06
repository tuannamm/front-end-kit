# Web / app UI

Use `assets/tokens.css` (CSS custom properties) or `assets/tailwind.preset.js`. Load fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,400;1,700&family=Chakra+Petch:ital,wght@1,600;1,700&display=swap" rel="stylesheet">
```

Display face: if the official SVN-HemiHead font file is available, `@font-face` it as `"SVN-HemiHead"`; tokens already list it first with Chakra Petch as fallback.

## Themes

| | Light (default for apps, forms, dashboards) | Dark (marketing, hero, presentation-like pages) |
|---|---|---|
| Background | `#FFFFFF` / page `#F0F0F0` | `#1E1D23` |
| Surface / card | `#FFFFFF`, border `#E2E4E8` | `#26252C`, border `#34333B`; or navy `#26385D` |
| Text primary | `#231F20` | `#FFFFFF` |
| Text secondary | `#6E6F72` (on white only) | `#B8BAC0` |
| Primary action | `#2582D7` with ≥ 19 px bold label, or `#1A6FBF` for smaller labels; text white | Same, or CTA gradient `#1A6FBF → #004EBE` |
| Link / small blue text | `#137BB6` (AA on white) | `#30AAE0` |
| Focus ring | 3 px `#7BD2F2` | 3 px `#30AAE0` |

Contrast facts (WCAG): white on `#2582D7` = 4.0:1 — passes only as large text (≥ 18.66 px / 14 pt **bold** or ≥ 24 px regular); for smaller text use `#1A6FBF` (5.2:1) or navy. `#2582D7` text on white = 4.0:1 — use only for large text; for small links use `#137BB6`. White on `#00ACEB` = 2.6:1 — the `#00ACEB → #004EBE` bar gradient is decoration only; buttons and pills with text use the CTA gradient `#1A6FBF → #004EBE` (5.2–7.4:1).

Status colors (derived, keep muted): success `#A5CB1F` (pair with dark text), warning `#F6B71E` (dark text), error `#D93A3A`, info `#2582D7`.

## Components

- **Buttons:** radius 6 px (rectangular, tech feel) or full pill for marketing CTAs. Primary `.dtx-btn` = `#2582D7` fill, white Roboto Bold 19 px (large text, AA). Compact `.dtx-btn--sm` = `#1A6FBF` fill, white Roboto Medium 14–16 px. Pill `.dtx-btn--pill` = CTA gradient. Uppercase not required. Secondary = 1.5 px blue outline. Use on-brand CTA wording from `voice.md` ("Discover our Demo", "Let's get in touch").
- **Header/nav:** horizontal logo left (≥ 120 px wide), white or `#1E1D23` bar; active item blue underline 3 px.
- **Section headers:** small gradient bar (48 × 6 px, `#00ACEB → #004EBE`) above an H2, or the slide-style `NN. TITLE` italic display label for marketing pages.
- **Cards:** 8 px radius, subtle shadow `0 2px 8px rgba(13,17,32,.08)`; icon in a blue square or hexagon.
- **Hexagons and square dots** are brand motifs (from the logo's 6 square dots and the guideline's hex swatches) — use them for icon containers, bullets, step markers, loaders.
- **Tables:** header row navy `#26385D` white text or light `#F0F0F0` bold ink; zebra `#F7F8FA`; numbers right-aligned, tabular figures.
- **Charts:** follow the series order in `slides.md`. Gridlines `#E2E4E8` (light) / `#34333B` (dark).
- **Footer:** `#1E1D23` with white logo, Roboto 14 px links in `#B8BAC0`, www.digi-texx.com.
- **Mascot:** use `assets/mascot-robot.png` for empty states, onboarding, chatbot avatar, 404 — small (64–160 px), never as decoration on every screen.

## Spacing & type

- 8 px grid. Container max 1200–1280 px.
- Type scale (Roboto): 12 / 14 / 16 (body) / 20 / 24 / 32 / 40 / 56. Line height 1.5 body, 1.2 headings.
- Hero headline may use the italic display face, uppercase, 48–72 px, white or blue gradient text on dark.

## Don'ts

- No other font families (no Inter, Montserrat, Poppins…).
- No purple/lime/amber as a page's primary color; accents only next to blue.
- No gradients other than the blue brand gradients.
- No logo recolor/glow; no logo smaller than 120 px wide in headers.
