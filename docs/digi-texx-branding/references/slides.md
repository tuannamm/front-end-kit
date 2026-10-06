# Slides (HTML, PPTX, Google Slides, Canva)

The guideline document itself is the master template. Copy its system. See `assets/reference/guideline-sheet-*.jpg`.

## Canvas

- 16:9, design at **1920 × 1080** (PPTX: 13.333 in × 7.5 in).
- Default background: **canvas-dark `#1E1D23`**. Content-heavy slides use a **light panel `#F0F0F0`** below a dark header band.
- Safe margin: 96 px left/right, 64 px top/bottom (≈ 5% of width).

## Fixed chrome (every content slide)

| Element | Spec (at 1920×1080) |
|---|---|
| Header band | Dark `#1E1D23`, full width, 0–185 px high |
| Section title | Top-left at x 96, baseline ≈ y 125. Format `NN. SECTION NAME` — uppercase, italic display face (SVN-HemiHead → fallback Chakra Petch 700 italic), 44–52 px, white |
| Gradient accent bar | Top-right, flush to right edge, x 1530→1920, y 87→157 (≈ 390 × 70 px), linear gradient `#00ACEB → #004EBE` left→right |
| Content area | y 185→1080. Light panel `#F0F0F0` for diagrams/tables; stay dark for imagery and statements |
| Corner logo | Square logo, bottom-left, x 96, ~70 px tall. Light variant on light panels, white/full-color tile on dark |
| Page number | Bottom-right, x ≈ 1824 right-aligned, `01`-style two digits, italic display face, 36 px, ink on light / white on dark |
| Decoration (optional) | `assets/patterns/pattern-wave-mesh.png` along the bottom edge on dark slides, 40–60% opacity; soft blue radial glow (`#2582D7` → transparent) behind the title |

## Slide types

1. **Cover** — left half dark: square/horizontal logo top-left, huge 2-line title in italic display face with blue gradient text (`#00ACEB → #1A6FD8`), short underline accent (24 px blue segment + 72 px white segment, 6 px tall), website `www.digi-texx.com` bottom in italic. Right half: full-bleed tech/architecture photo with strong blue tone.
2. **Intro / statement** — full-bleed photo (nature or tech), translucent blue panel (`rgba(37,130,215,.75)`) holding mascot + 2–4 lines of light Roboto text.
3. **Table of contents** — dark slide; title with mascot icon; dotted leader lines `01. Item ........ 03` in Roboto 22–26 px; giant faded square-logo watermark (8% opacity) bottom-left.
4. **Section divider** — full-bleed dark tech image (glowing brain/chip/network), section title huge italic gradient text left, gradient bar top-right.
5. **Content: diagram/table** — dark header + light `#F0F0F0` panel; Roboto text centered or in columns; hexagon swatches/icons in blue.
6. **Content: image grid** — dark slide, 3–5 images edge-to-edge in a strip, one-line caption above in Roboto Light.
7. **Do / Don't or comparison** — left half blue gradient (`#00ACEB → #0047BB` diagonal) with "DO'S", right half dark with "DON'T"; rows on a translucent band; large faded thumbs icons.
8. **Three-option / process** — three columns separated by dotted vertical lines; center (recommended) item in blue; hexagon nodes connected by dotted line, center hex filled blue with white icon.
9. **Quote / key message** — pill-shaped gradient banner (CTA gradient `#1A6FBF → #004EBE` so white text passes contrast), white Roboto Bold Italic 28–32 px, centered.
10. **Closing** — full-bleed bright photo (wind farm, sky, landscape; without a photo use a blue-only gradient `#0B4FA8 → #2582D7`), "Thank You" in huge white italic display face top-right, mascot + short italic note.

## Typography scale (1920×1080)

| Role | Font | Size | Color |
|---|---|---|---|
| Cover title | Display italic | 140–180 px | Blue gradient |
| Section title (header) | Display italic, uppercase | 44–52 px | White |
| Slide headline | Roboto Bold | 40–48 px | Ink on light / white on dark |
| Subhead | Roboto Medium/Bold | 28–32 px | `#2582D7` on light, `#30AAE0` on dark |
| Body | Roboto Regular/Light | 24–32 px | Ink / white |
| Caption / note | Roboto Italic | 18–20 px | Gray `#6E6F72` / `#B8BAC0` |

PPTX conversion: the slide is 960 pt wide, so **1 px of the 1920 grid = 0.5 pt** (48 px header = 24 pt). `scripts/pptx_brand.py` sizes everything in px and converts.

Max ~40 words of body per slide. One message per slide.

## Charts and data

- Series order: `#2582D7`, `#26385D`, `#30AAE0`, `#7BD2F2`, then accents `#A5CB1F`, `#F6B71E`, `#9127D6`.
- Highlight one bar/line in blue; others in navy/light tints.
- Big-number KPI: number in display italic, blue; label in Roboto Regular.

## Build options

- **HTML deck:** start from `templates/slide-deck.html` (all chrome built in; uses `assets/tokens.css`).
- **PPTX:** `python scripts/pptx_brand.py --demo out.pptx` creates a sample deck; import its helpers (`new_deck`, `add_cover`, `add_content`, `add_section`, `add_closing`) for real decks. Arial is the fallback in PPTX if Roboto is not installed on the viewer machine; set `--font Arial` for Vietnamese decks shared widely.
- **Google Slides / Canva:** set theme colors to the token table; title font Chakra Petch Bold Italic (Google Fonts) as the display fallback, body Roboto.
