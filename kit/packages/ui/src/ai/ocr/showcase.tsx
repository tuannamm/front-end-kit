/**
 * # AI · OCR
 *
 * `OcrShowcase` plays an OCR pipeline from engine JSON: raw page → preprocessing → detection → recognition → layout →
 * extraction. `normalizeOcr` turns an `OcrDocument` into 0–1 boxes and 0–100 confidence. `BoxEditor` is the
 * human-in-the-loop step: a reviewer moves and resizes boxes and corrects their text. `ConfidenceHeatmap` comes before
 * it, for triage: the page tinted where confidence is low, so QC sees at a glance where to look.
 *
 * ```tsx
 * import { OcrShowcase, BoxEditor, ConfidenceHeatmap, type OcrDocument } from '@dgtx/ui-frek';
 *
 * <OcrShowcase data={engineJson} stages={['unwarp', 'binarize', 'detect', 'recognize', 'extract']} />
 * <BoxEditor boxes={lines} onChange={setLines} page={<img src={page} alt="Trang 1" />} />
 * <ConfidenceHeatmap boxes={lines}><img src={page} alt="Trang 1" /></ConfidenceHeatmap>
 * ```
 *
 * ### BoxEditor
 *
 * - Click a box on the page (or Tab to it and press Enter) to select it. The selected box gets a frame: drag the frame to
 *   move it, drag a corner to resize it. Keyboard: arrow keys move it 1 px, Shift + arrow keys resize it from the
 *   bottom-right corner.
 * - While a box is selected its lens stays open (BoxOverlay `pinnedId`): the page crop inside the current frame above the
 *   current text, so the reviewer sees at once whether the box covers the whole word and whether the text matches.
 * - The side panel edits the text and steps through the boxes (Previous / Next).
 * - Controlled: every change calls `onChange` with the whole list, the edited box replaced by id. A polygon box moves and
 *   scales with its bounding rectangle. Confidence is left as the engine gave it.
 *
 * ### ConfidenceHeatmap
 *
 * - Each spot of the page takes the lowest score of the boxes within `spread` of it: amber where it needs review, red
 *   where confidence is low, untouched where it is high or there is no text. The tint multiplies with the page, so the
 *   ink stays readable.
 * - The legend names both colours with their ranges and counts the boxes in each, so colour is never the only cue.
 * - Wrap a BoxOverlay to get the boxes on top: `<ConfidenceHeatmap boxes={lines}><BoxOverlay boxes={lines}>{page}</BoxOverlay></ConfidenceHeatmap>`.
 *   The heat steps back while a box is hovered or pinned, so the lens and the spotlight read clean.
 *
 * ## Props
 *
 * ### OcrShowcase
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `data` | `OcrDocument \| NormalizedOcr` | **required** | Engine output, or already normalised |
 * | `page` | `ReactNode` |  | Page to render when `data.image` is absent, e.g. `<SampleInvoice/>` |
 * | `stages` | `OcrStage[]` | `['unwarp', 'binarize', 'detect', 'recognize', 'extract']` | Any of crop, unwarp, deskew, denoise, binarize, grayscale, detect, recognize, layout, extract |
 * | `stage` | `number` |  | Controlled stage index (0 = raw input). Leave out for the built-in player |
 * | `onStageChange` | `(i: number) => void` |  | Stage changed |
 * | `autoPlay` | `boolean` | `true` | Built-in player starts on mount |
 * | `loop` | `boolean` | `true` | Start over after the last stage |
 * | `interval` | `number` | `1800` | ms per stage |
 * | `scan` | `boolean` | `true` | Scan beam over the page during detection |
 * | `thresholds` | `Thresholds` | `{ high: 95, low: 80 }` | Confidence levels |
 * | `title` | `string` |  | Heading of the player |
 *
 * ### BoxEditor
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `boxes` | `OcrBox[]` | **required** | Boxes in 0–1 fractions of the page |
 * | `onChange` | `(boxes: OcrBox[]) => void` | **required** | A box was moved, resized or its text corrected |
 * | `page` | `ReactNode` | **required** | The page underneath (`<img>`, `<SampleInvoice/>`) |
 * | `selectedId` | `string \| null` |  | Controlled selection. Leave out to let the editor keep it |
 * | `onSelect` | `(id: string \| null) => void` |  | Selection changed |
 * | `thresholds` | `Thresholds` | `{ high: 95, low: 80 }` | Confidence levels |
 * | `textInset` | `number` | `2` | Passed to BoxOverlay; lines the text up in the lens |
 * | `className` | `string` |  | Extra classes |
 *
 * ### ConfidenceHeatmap
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `boxes` | `OcrBox[]` | **required** | Scored boxes, 0–1 of the page; boxes without `confidence` add no heat |
 * | `children` | `ReactNode` | **required** | The page, or a BoxOverlay around it |
 * | `thresholds` | `Thresholds` | `{ high: 95, low: 80 }` | Confidence levels |
 * | `spread` | `number` | `0.03` | How far a box's score reaches around it, 0–1 of the page width |
 * | `legend` | `boolean` | `true` | Colour key with box counts under the page |
 * | `className` | `string` |  | Extra classes |
 *
 * ### OcrDocument
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `lines` | `{ id?, text, confidence, box, kind? }[]` | **required** | OCR_det + OCR_rec, one per line or word; confidence 0–1 or 0–100 |
 * | `image` | `{ src: string; width: number; height: number }` |  | The page image |
 * | `units` | `'px' \| 'normalized'` | `'px'` | Unit of every `box` |
 * | `regions` | `{ id?, kind, box, label? }[]` |  | Layout analysis |
 * | `fields` | `{ key, label?, value, confidence, lineId? }[]` |  | Extraction; `lineId` links a field to its line |
 * | `fileName` | `string` |  | Shown in the player |
 * | `engine` | `string` |  | Engine name |
 *
 * A `box` is any shape engines emit: `[x, y, w, h]`, `{ x, y, w, h }`, `{ x1, y1, x2, y2 }` or a polygon (kept as
 * `points`, so BoxOverlay draws rotated and curved text as-is).
 *
 * ## Files
 *
 * - `showcase.tsx`: OcrShowcase, `ocrStageLabels`
 * - `box-editor.tsx`: BoxEditor
 * - `box-edit.ts` + `box-edit.check.ts`: `editBox` (move or corner-resize a box in 0–1 units, kept on the page) and its node check
 * - `confidence-heatmap.tsx`: ConfidenceHeatmap
 * - `heat-grid.ts` + `heat-grid.check.ts`: `heatGrid` (lowest nearby score per grid cell) and its node check
 * - `types.ts` + `types.check.ts`: `OcrDocument`, `NormalizedOcr`, `normalizeOcr` and its node check
 * - `ocr.css`
 *
 
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Check, ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { Badge } from '../../core/badge/badge';
import { Button } from '../../core/button/button';
import { Reveal, useReducedMotion } from '../../motion/primitives';
import { BoxOverlay } from '../shared/box-overlay';
import { ScanBeam } from '../shared/scan-beam';
import { ConfidenceBadge, defaultThresholds, type Thresholds } from '../shared/confidence';
import { PreprocessStack, preprocessLabels, type PreprocessEffect } from '../preprocess/preprocess';
import { normalizeOcr, type NormalizedOcr, type OcrDocument } from './types';

export type OcrStage = PreprocessEffect | 'detect' | 'recognize' | 'layout' | 'extract';
export const ocrStageLabels: Record<OcrStage, string> = {
  ...preprocessLabels, detect: 'Detect text (OCR_det)', recognize: 'Recognize text (OCR_rec)', layout: 'Layout analysis', extract: 'Extract fields',
};
const PRE: PreprocessEffect[] = ['crop', 'unwarp', 'deskew', 'denoise', 'binarize', 'grayscale'];
const isPre = (s: OcrStage): s is PreprocessEffect => (PRE as string[]).includes(s);

export type OcrShowcaseProps = {
  /** Engine output, or already-normalised data. */
  data: OcrDocument | NormalizedOcr;
  /** Page to render when data.image is absent (e.g. <SampleInvoice/>). */
  page?: ReactNode;
  stages?: OcrStage[];
  /** Controlled stage index (0 = raw input). Leave undefined for the built-in player. */
  stage?: number;
  onStageChange?: (i: number) => void;
  autoPlay?: boolean;
  loop?: boolean;
  /** ms per stage */
  interval?: number;
  /** Scan beam over the page during detection. */
  scan?: boolean;
  thresholds?: Thresholds;
  title?: string;
};

/**
 * POC player for an OCR pipeline: raw → preprocessing steps → detection → recognition → layout → extraction.
 * Feed it engine JSON (OcrDocument) and an image; every stage is derived from the data.
 */
export function OcrShowcase({ data, page, stages = ['unwarp', 'binarize', 'detect', 'recognize', 'extract'], stage: controlled, onStageChange, autoPlay = true, loop = true, interval = 1800, scan = true, thresholds = defaultThresholds, title }: OcrShowcaseProps) {
  const reduced = useReducedMotion();
  const norm = useMemo<NormalizedOcr>(() => ('regions' in data && Array.isArray(data.lines) && data.lines.every(l => 'x' in l) ? data as NormalizedOcr : normalizeOcr(data as OcrDocument)), [data]);
  const doc = 'image' in data ? (data as OcrDocument) : undefined;
  const [own, setOwn] = useState(reduced ? stages.length : 0);
  const [playing, setPlaying] = useState(autoPlay && !reduced);
  const [hover, setHover] = useState<string | null>(null);
  const i = controlled ?? own;
  const set = (n: number) => { const v = Math.max(0, Math.min(stages.length, n)); if (controlled === undefined) setOwn(v); onStageChange?.(v); };

  useEffect(() => {
    if (!playing || controlled !== undefined) return;
    if (i >= stages.length && !loop) { setPlaying(false); return; }
    const t = setTimeout(() => setOwn(s => (s >= stages.length ? 0 : s + 1)), i >= stages.length ? interval * 1.8 : interval);
    return () => clearTimeout(t);
  }, [i, playing, controlled, loop, interval, stages.length]);

  const done = (s: OcrStage) => stages.indexOf(s) > -1 && stages.indexOf(s) < i;
  const current = i > 0 ? stages[i - 1] : null;
  const detected = done('detect') || (!stages.includes('detect') && done('recognize'));
  const recognized = done('recognize');
  const layoutOn = current === 'layout';
  const extracted = done('extract');
  const linked = new Set(norm.fields.map(f => f.lineId).filter(Boolean) as string[]);
  const selected = hover ?? null;

  const pageEl = doc?.image ? <img src={doc.image.src} alt={doc.fileName ?? 'Document page'} width={doc.image.width} height={doc.image.height} style={{ display: 'block', width: '100%', height: 'auto' }} /> : page;
  const boxes = layoutOn ? norm.regions : extracted ? norm.lines.filter(l => linked.has(l.id) || !linked.size) : norm.lines;
  const overlay = detected || layoutOn
    ? <BoxOverlay key={`${current}-${i}`} boxes={boxes} colorBy={layoutOn ? 'kind' : recognized ? 'confidence' : 'plain'} showLabels={layoutOn} hideText={!recognized} thresholds={thresholds} selectedId={selected} animate={!reduced}>{pageEl}</BoxOverlay>
    : <div style={{ lineHeight: 0 }}>{pageEl}</div>;
  const pre = stages.filter(isPre);
  const pagePipeline = <PreprocessStack steps={pre} isDone={done} current={current && isPre(current) ? current : null} scan={scan && !reduced} scanMs={interval * .8}>{overlay}</PreprocessStack>;
  const scanning = scan && current === 'detect' && !reduced;
  const status = i === 0 ? <Badge tone="neutral" size="sm">Original</Badge>
    : i >= stages.length ? <Badge tone="ok" size="sm" variant="surface">Done</Badge>
    : <Badge size="sm" live>{ocrStageLabels[stages[i]]}</Badge>;

  return (
    <div className="dtx-showcase">
      <div className="dtx-showcase__head">
        <div className="dtx-showcase__title"><b>{title ?? doc?.engine ?? 'DIGI-XTRACT'}</b><span>{doc?.fileName}</span></div>
        {status}
        <div className="dtx-showcase__ctrl">
          <Button variant="ghost" size="sm" icon aria-label="Previous step" onClick={() => { setPlaying(false); set(i - 1); }} disabled={i === 0}><ChevronLeft /></Button>
          <Button variant="secondary" size="sm" icon aria-label={playing ? 'Pause' : 'Play'} onClick={() => { if (i >= stages.length) set(0); setPlaying(p => !p); }} disabled={controlled !== undefined}>{playing ? <Pause /> : <Play />}</Button>
          <Button variant="ghost" size="sm" icon aria-label="Next step" onClick={() => { setPlaying(false); set(i + 1); }} disabled={i >= stages.length}><ChevronRight /></Button>
          <Button variant="ghost" size="sm" icon aria-label="Back to original" onClick={() => { setPlaying(false); set(0); }}><RotateCcw /></Button>
        </div>
      </div>
      <ol className="dtx-showcase__steps" aria-label="Processing steps">
        <li data-state={i === 0 ? 'current' : 'done'}><button type="button" onClick={() => { setPlaying(false); set(0); }}>Original</button></li>
        {stages.map((s, n) => (
          <li key={s} data-state={n < i ? 'done' : n === i ? 'next' : 'todo'} aria-current={n === i - 1 ? 'step' : undefined}>
            <button type="button" onClick={() => { setPlaying(false); set(n + 1); }}>{n < i && <Check size={11} strokeWidth={3} />}{ocrStageLabels[s]}</button>
          </li>
        ))}
      </ol>
      <div className="dtx-showcase__body">
        <div className="dtx-showcase__page">
          <ScanBeam key={i} active={scanning} duration={interval}>{pagePipeline}</ScanBeam>
        </div>
        <aside className="dtx-showcase__panel" aria-live="polite">
          {i === 0 && <p className="dtx-showcase__hint">Input image. Press Play or choose a step.</p>}
          {current && isPre(current) && <p className="dtx-showcase__hint">{ocrStageLabels[current]}: normalize the image before recognition.</p>}
          {current === 'detect' && <p className="dtx-showcase__hint"><b>{norm.lines.length}</b> text regions detected.</p>}
          {current === 'layout' && <p className="dtx-showcase__hint"><b>{norm.regions.length}</b> layout regions.</p>}
          {(current === 'recognize' || current === 'layout') && (
            <ul className="dtx-showcase__list">
              {norm.lines.map((l, n) => (
                <Reveal key={l.id} index={n} stagger={40} effect="fade">
                  <li onMouseEnter={() => setHover(l.id)} onMouseLeave={() => setHover(null)} data-active={hover === l.id ? '' : undefined}>
                    <span>{l.text}</span><ConfidenceBadge value={l.confidence ?? 0} thresholds={thresholds} />
                  </li>
                </Reveal>
              ))}
            </ul>
          )}
          {extracted && (
            <ul className="dtx-showcase__list">
              {norm.fields.map((f, n) => (
                <Reveal key={f.key} index={n} stagger={60}>
                  <li className="dtx-showcase__field" onMouseEnter={() => setHover(f.lineId ?? null)} onMouseLeave={() => setHover(null)} data-active={f.lineId && hover === f.lineId ? '' : undefined}>
                    <small>{f.label}</small><b>{f.value}</b><ConfidenceBadge value={f.confidence} thresholds={thresholds} />
                  </li>
                </Reveal>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
