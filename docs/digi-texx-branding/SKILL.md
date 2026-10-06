---
name: digi-texx-branding
description: Apply the official DIGI-TEXX brand identity (2024 Branding Guidelines) to anything visual or written for DIGI-TEXX — slide decks (HTML, PPTX, Google Slides), web/app UI, dashboards, social posts, banners, event materials, documents, letterheads, generated or edited images, and marketing copy. Use whenever the user mentions DIGI-TEXX, Digi-texx, DGT, DIGI-XTRACT, DIGI-SCAN, DIGI-DMS, ONE DIGI-SOFT, or asks for "company branding", "brand colors", "on-brand", "our logo", or "our template" in a DIGI-TEXX context — even if they don't say "brand guideline".
---

# DIGI-TEXX Branding

Source: *DIGI-TEXX Branding Guidelines for content and images 2024* (29 pages, 16:9).
URL: https://digi-texx.com/wp-content/uploads/2024/10/DIGI-TEXX_-Branding-Guidelines-for-content-and-images-2024.pdf
Thumbnails of every guideline page: `assets/reference/guideline-sheet-1..5.jpg` — open these when you need to see the original look.

## Core rules (apply to every output)

1. **DIGI-TEXX Blue `#2582D7` leads every design.** Other colors support it; never let a secondary color dominate.
2. **Fonts:** Roboto for all body/UI text. Arial (and Arial Narrow) only in Office/Vietnamese documents where Roboto is not installed. Display headings use the italic, squared tech face **SVN-HemiHead** (web fallback: *Chakra Petch* Bold Italic, uppercase).
3. **Logo is never modified** — no recolor (except approved white/black mono), no rotation, no stretch, no shadow/glow, no outline version, no re-typed wordmark, no busy patterned background. Clear space ≥ ½ logo-symbol height; minimum width 10 mm (≈ 120 px on screen).
4. **Look & feel:** dark charcoal canvas (`#1E1D23`) or clean light panels (`#F0F0F0` / white), blue gradients (`#00ACEB → #004EBE`), circuit / wire-mesh / network-globe tech motifs, bright blue glow. Professional, modern, trustworthy — never playful clip-art.
5. **Voice:** trustworthy & data-driven, informative & efficient, innovative & direct. Professional, confident, thought-leadership tone; clear, concise, action-oriented language. Back claims with real numbers. Not too complicated, not too "salesy".

## Quick tokens

| Token | Hex | Use |
|---|---|---|
| `blue` (DIGI-TEXX Blue) | `#2582D7` | Primary: CTAs, highlights, key shapes, links |
| `navy` | `#26385D` | Deep blue surfaces, cards, footers |
| `ocean` | `#137BB6` | Secondary blue |
| `sky` | `#30AAE0` | Accents, gradient start, icons |
| `light` | `#7BD2F2` | Tints, chart series, hover |
| `ice` | `#A8E5F5` | Pale backgrounds, subtle fills |
| `lime` | `#A5CB1F` | Accent — always paired with blue |
| `amber` | `#F6B71E` | Accent — always paired with blue |
| `violet` | `#9127D6` | Accent — always paired with blue |
| `ink` | `#231F20` | Logo wordmark black, body text on light |
| `gray` | `#6E6F72` | Tagline gray, secondary text |
| `canvas-dark` | `#1E1D23` | Dark slide/page background |
| `canvas-light` | `#F0F0F0` | Light content panel |
| gradient bar | `#00ACEB → #004EBE` (left→right) | Header accent bar, pills, buttons |
| logo-box gradient | `#1A489E → #0D1120` (radial) | Square logo tile only |

Ready-made files: `assets/tokens.css` (CSS vars + utility classes), `assets/tokens.json` (design tokens), `assets/tailwind.preset.js`.

## Assets

- `assets/logos/logo-horizontal.svg|.png` — full-color wordmark + tagline (light backgrounds; preferred).
- `assets/logos/logo-horizontal-white.png` — white wordmark, blue dots (dark/navy backgrounds).
- `assets/logos/logo-horizontal-mono-white.png` / `-mono-black.png` — single-color (blue backgrounds, photos, engraving, B/W print).
- `assets/logos/logo-square.png` — stacked "DIGI / TEXX" navy tile with 5 blue dots (avatars, favicons, slide corner mark, small spaces).
- `assets/logos/logo-square-on-blue.png` — white tile, blue letters, white dots (for DIGI-TEXX Blue backgrounds).
- `assets/logos/logo-square-mono-black.png` — black tile and dots (B/W print, light backgrounds where color is not possible).
- `assets/logos/sub-brands/logo-digi-xtract.png`, `logo-digi-scan.png`, `logo-digi-dms.png`, `logo-one-digi-soft.png` — official solution logos.
- `assets/mascot-robot.png` — friendly white/blue robot mascot (cover, TOC, tips, closing slides; small, never dominant).
- `assets/patterns/pattern-wave-mesh.png` — blue wireframe wave (transparent PNG, for dark backgrounds; bottom-edge decoration).
- `assets/patterns/pattern-circuit-left.jpg`, `pattern-circuit-right.jpg`, `pattern-network-globe.jpg`, `pattern-security-shield.jpg`, `pattern-service-gears.jpg` — the guideline's characteristic tech motifs (backgrounds/decoration only, never the dominant element).

Logo sources: the square logos are the official SVGs published on digi-texx.com (`Logo_DIGI-TEXX_2021.svg`, `-WHITE.svg`; dot color set to the guideline's `#2582D7`). The horizontal logos are lossless vector paths exported from the official guideline PDF. Every logo ships as `.svg` (use for web, print, scaling) plus a trimmed transparent `.png` (1600 px / 1000 px wide). Sub-brand logos are 600 dpi PNGs from the PDF (no public vector source); ask Marketing for AI/SVG if you need print quality.

## Choose your path

| Task | Read |
|---|---|
| Slide deck (HTML, PPTX, Google Slides, Canva) | `references/slides.md`, then `templates/slide-deck.html` or `scripts/pptx_brand.py` |
| Web / app UI, dashboard, landing page, email | `references/ui.md` + `assets/tokens.css` |
| Image generation, photo selection, banners, social posts | `references/imagery.md` |
| Logo placement and background choice | `references/logo.md` |
| Writing copy, headlines, CTAs, posts | `references/voice.md` |
| Business card, letterhead, folder, invoice, merchandise, events | `references/applications.md` |

## Final brand check (run before delivering)

- [ ] Blue `#2582D7` is the clearly dominant brand color; secondaries only as accents next to blue.
- [ ] Only Roboto (or Arial fallback) + italic display heading face. No other fonts.
- [ ] Logo is an untouched asset file, correct variant for the background, has clear space, ≥ 10 mm / 120 px wide.
- [ ] Text contrast ≥ 4.5:1 (white on `#2582D7` passes only at ≥ 18.66 px bold / 24 px regular — use navy or canvas-dark behind small white text).
- [ ] Imagery is tech/blue-toned, professional, real people at work or abstract tech — no off-brand stock clichés.
- [ ] Copy: one message per headline, real data, creative but clear CTA, no hype or desperation.
