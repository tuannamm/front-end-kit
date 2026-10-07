# CLAUDE.md — DIGI-TEXX Frontend Kit

Guidance for AI coding agents working in this repo. Read `README.md` first for structure and commands.

## Non-negotiables

1. **Brand authority is the PDF** `docs/DIGI-TEXX_-Branding-Guidelines-for-content-and-images.pdf`. Cite its page for
   brand claims. `docs/digi-texx-branding/` is reference only (it over-reaches, e.g. a display font) — never treat it
   as rules and do not edit it.
2. **Fonts: Roboto only**, Arial fallback. No display/mono families (no SVN-HemiHead, Chakra Petch, Inter…).
   Headlines use Roboto Bold Italic. Docs code blocks may use the system monospace; product UI may not.
3. **DIGI-TEXX Blue `#2582D7` leads**; lime/amber/violet only as accents next to blue. Logos are the original files,
   never recoloured, rotated or given effects.
4. **Light + dark for everything.** Colours only via semantic `--dtx-*` tokens. A colour that must not follow the theme
   (paper, photo backdrop) gets `/* theme-fixed: reason */` on the same line. `[data-theme] { color: var(--dtx-fg) }`
   must stay so nested themed sections re-read text colour.
5. **WCAG 2.2 AA.** White text on `#2582D7` only at ≥ 19px bold; small labels use `--dtx-blue-strong`.
6. **No card-with-shadow "AI slop".** Prefer hairlines, tokens, purposeful motion; ask before adding decoration.

## Architecture rules

- `kit/packages/ui/src`: generic UI in `core/ layout/ data/ motion/ brand/`; AI work in `ai/<task>/`
  (`shared, preprocess, ocr, extraction`; later `try-on, enhance, remove-bg`). Used by ≥ 2 tasks → `ai/shared/`.
  Never flatten new files into `src/`. Each task folder owns its CSS; `styles.css` imports it into `@layer dtx`.
- Core components: one folder each, `core/<component>/<component>.tsx` + `<component>.css` + `README.md` (+ helpers,
  `*.check.ts`). `core/structure.check.ts` fails `npm test` when one is missing. Update the README with the component.
  Import its CSS in `styles.css` after `base.css` and after any component it overrides (import order = cascade order).
- **One job per component; compose.** Examples already in the kit:
  - `ScanBeam` is the only scan/wipe effect. It owns the reveal (`reveal="progressive" | "whole" | "none"`); anything
    inside reveals with it (BoxOverlay boxes, `before`/`after` wipe, `<ScanReveal>`). `beam={false}` = wipe without line.
  - Pixel steps (binarize, denoise, grayscale, enhance) are a **before/after pair of pages**, shown with
    `CompareSlider` or `ScanBeam` (same `before`/`after` props). No step-type component, no `applied` flag.
  - `Preprocess` is geometry only (crop, deskew, unwarp). Real unwarp: `UnwarpView` (service lattice → stretch).
- The kit has **no Tailwind dependency** (components use plain CSS + tokens); Tailwind is only for apps/playground.
- Animations: transform/opacity; reduced motion must still show the final state. Use longhand `animation-*` when an
  inline `animation-delay` must survive (a shorthand resets it).
- Every new component gets a catalog entry in `kit/apps/playground/src/catalog/entries.tsx` (status `ready`/`planned`),
  rendered in both themes; show interactive states statically too (e.g. `pinnedId`).

## Before you say done

```bash
cd kit && npm test && npm run typecheck      # contrast, theme lint, normalizeOcr, types
npm run build                                # when touching the playground
npm run test:a11y                            # after visual changes (needs `npm run dev` running)
```

Verify UI changes in the browser (Playwright/headless screenshots); animations need captures mid-motion, not only
the end state. Report what was not verified.

## Data and privacy

- Real samples (1266 civil records, stengg customer pages) live in `kit/apps/playground/public/samples/` and are
  **git-ignored**. Never commit, publish, or put them in `@dtx/ui`. Regenerate with `kit/apps/playground/scripts/import_*.py`.
- The stengg autopreprocessing service (`127.0.0.1:6005`) is shared; call it only for sample imports.

## Conventions

- UI copy in Vietnamese (with English where it is a technical term); test diacritics (line-height ≥ 1.15).
- Match surrounding code style; keep comments sparse and explanatory; no TODO stubs or skipped tests.
- Commits end with the co-author line from the session; don't push without being asked.
