# @dtx/ui

| Folder | What lives there |
|---|---|
| `core/` | Generic controls: Icon, Button, Badge, Field/Input/Textarea, Select, MultiSelect, Checkbox/CheckboxGroup/RadioGroup, DatePicker/DateRangePicker/Calendar, FileDropzone/FileList/FileItem, Switch, Tabs, Segmented, Tooltip, Dialog, Drawer, Toast, Avatar/AvatarPicker, Notification/NotificationList, PdfViewer, CommandPalette, Alert, EmptyState, Breadcrumb, Menu, Pagination, Slider, Carousel, Collapse, Timeline, Masonry |
| `layout/` | Page structure: Card, AppShell, Sidebar, Topbar, CommandButton |
| `data/` | Data display: KpiCard, DataTable, Sparkline, TargetBar, CategoryBar, Meter, StackedBarChart |
| `motion/` | Generic motion: Reveal, Skeleton, Loadable, CountUp, useReducedMotion |
| `brand/` | DIGI-TEXX identity: Logo, TechBackdrop, Display/Lede/Eyebrow, SectionHeader, HexIcon, theme |
| `ai/shared/` | Reused by several AI tasks: BoxOverlay, Confidence*, CompareSlider and ScanBeam (both take `before`/`after`), ScanReveal, toBox, SampleInvoice |
| `ai/preprocess/` | Geometry steps on one page: Preprocess (crop, deskew, unwarp), UnwarpView (real lattice stretch). Pixel steps are before/after pairs of pages (no component). PreprocessPipeline, PreprocessStack |
| `ai/ocr/` | OcrDocument + normalizeOcr (engine JSON → boxes), OcrShowcase pipeline player |
| `ai/extraction/` | DocumentScan (field extraction visual) |
| `ai/try-on/`, `ai/enhance/`, `ai/remove-bg/` | Planned. Same shape: one folder per task, components + their animations + css |

Rule of thumb: generic UI → `core/ layout/ data/ motion/ brand/`. Belongs to one AI task → `ai/<task>/`. Used by two or more tasks → `ai/shared/`.
Each task folder owns its `.css`; `styles.css` imports them all into `@layer dtx`.
Same for core: one folder per component, `core/<component>/` holding its `.tsx`, `.css`, `README.md`, helpers and `*.check.ts`
(e.g. `core/date-picker/`: `date-picker.tsx`, `date-picker.css`, `date.ts`, `date.check.ts`). Shared base rules live in `base.css`.
Import order in `styles.css` is cascade order: base, then components in dependency order (select before date-picker, which restyles its popup).
`npm test` runs every `src/**/*.check.ts`, so a new check needs no registration.
Every folder that exports a component has a `README.md` whose `## Props` tables are the single source for props: the
catalog renders them, and `docs.check.ts` fails when one is missing or no longer matches the source (parser: `props-doc.ts`).

Before/after rule: a pixel step (binarize, denoise, grayscale, enhance) is a pair of pages (the service's two images),
never a component or a step name. Pick the presentation: `<CompareSlider before after>` (by hand) or
`<ScanBeam before after>` (by scan).
