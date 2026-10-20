/**
 * # AI · OCR
 *
 * `OcrShowcase` plays an OCR pipeline from engine JSON: raw page → preprocessing → detection → recognition → layout →
 * extraction. `normalizeOcr` turns an `OcrDocument` into 0–1 boxes and 0–100 confidence. `BoxEditor` is the
 * human-in-the-loop step: a reviewer moves and resizes boxes and corrects their text.
 *
 * ```tsx
 * import { OcrShowcase, BoxEditor, type OcrDocument } from '@dgtx/ui-frek';
 *
 * <OcrShowcase data={engineJson} stages={['unwarp', 'binarize', 'detect', 'recognize', 'extract']} />
 * <BoxEditor boxes={lines} onChange={setLines} page={<img src={page} alt="Trang 1" />} />
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
 * - `types.ts` + `types.check.ts`: `OcrDocument`, `NormalizedOcr`, `normalizeOcr` and its node check
 * - `ocr.css`
 *

 */

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../../cx';
import { Button } from '../../core/button/button';
import { Field, Input } from '../../core/field/field';
import { BoxOverlay, type OcrBox } from '../shared/box-overlay';
import { ConfidenceBadge, defaultThresholds, type Thresholds } from '../shared/confidence';
import { editBox, type BoxHandle } from './box-edit';

export type BoxEditorProps = {
  boxes: OcrBox[];
  /** The whole list, the edited box replaced by id. */
  onChange: (boxes: OcrBox[]) => void;
  /** The page underneath: <img>, <SampleInvoice/>… */
  page: ReactNode;
  /** Controlled selection; leave undefined to let the editor keep it. */
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  thresholds?: Thresholds;
  textInset?: number;
  className?: string;
};

const CORNERS = ['nw', 'ne', 'se', 'sw'] as const;
const ARROWS: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };

/**
 * Human-in-the-loop QC: select a box, drag it or its corners to fit the text (or use the arrow keys), correct its text
 * beside the page. The selected box keeps its lens open, so the crop and the text are compared as they change.
 */
export function BoxEditor({ boxes, onChange, page, selectedId, onSelect, thresholds = defaultThresholds, textInset = 2, className }: BoxEditorProps) {
  const [own, setOwn] = useState<string | null>(null);
  const selId = selectedId !== undefined ? selectedId : own;
  const i = boxes.findIndex(b => b.id === selId);
  const sel = i < 0 ? undefined : boxes[i];
  const n = boxes.length;
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const focusFrame = useRef(false);
  const drag = useRef<{ handle: BoxHandle; x: number; y: number; box: OcrBox } | null>(null);
  const hint = useId();

  // picked on the page: focus moves to the frame, so the arrow keys work at once
  const select = (id: string | null, focus = false) => { focusFrame.current = focus; setOwn(id); onSelect?.(id); };
  useEffect(() => { if (focusFrame.current) frame.current?.focus(); focusFrame.current = false; }, [selId]);
  const update = (b: OcrBox) => onChange(boxes.map(x => (x.id === b.id ? b : x)));
  /** Screen px → 0–1 page units. */
  const toPage = (dx: number, dy: number) => { const r = stage.current!.getBoundingClientRect(); return [dx / r.width, dy / r.height] as const; };

  const grab = (handle: BoxHandle) => (e: PointerEvent<HTMLElement>) => {
    if (!sel || e.button !== 0) return;
    e.stopPropagation(); e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { handle, x: e.clientX, y: e.clientY, box: sel };
  };
  const onMove = (e: PointerEvent) => {
    const d = drag.current;
    if (d) update(editBox(d.box, d.handle, ...toPage(e.clientX - d.x, e.clientY - d.y)));
  };
  const drop = () => { drag.current = null; };
  const onKey = (e: KeyboardEvent) => {
    const k = ARROWS[e.key];
    if (!sel || !k) return;
    e.preventDefault();
    update(editBox(sel, e.shiftKey ? 'se' : 'move', ...toPage(k[0], k[1])));
  };

  return (
    <div className={cx('dtx-boxedit', className)}>
      <div className="dtx-boxedit__stage" ref={stage}>
        <BoxOverlay boxes={boxes} thresholds={thresholds} textInset={textInset} selectedId={selId} pinnedId={selId} onSelect={b => select(b.id, true)}>{page}</BoxOverlay>
        {sel && (
          <div ref={frame} className="dtx-boxedit__frame" tabIndex={0} role="group" aria-label={`Khung đang sửa: ${sel.text || sel.id}`} aria-describedby={hint}
            style={{ left: `${sel.x * 100}%`, top: `${sel.y * 100}%`, width: `${sel.w * 100}%`, height: `${sel.h * 100}%` }}
            onPointerDown={grab('move')} onPointerMove={onMove} onPointerUp={drop} onPointerCancel={drop} onKeyDown={onKey}>
            {CORNERS.map(c => <i key={c} className="dtx-boxedit__handle" data-corner={c} onPointerDown={grab(c)} aria-hidden />)}
          </div>
        )}
      </div>
      <div className="dtx-boxedit__side">
        {sel ? (
          <>
            <div className="dtx-boxedit__nav">
              <Button variant="secondary" size="sm" icon aria-label="Khung trước" onClick={() => select(boxes[(i - 1 + n) % n].id)}><ChevronLeft aria-hidden /></Button>
              <span className="dtx-num" aria-label={`Khung ${i + 1} trên ${n}`}>{i + 1} / {n}</span>
              <Button variant="secondary" size="sm" icon aria-label="Khung sau" onClick={() => select(boxes[(i + 1) % n].id)}><ChevronRight aria-hidden /></Button>
              {sel.confidence !== undefined && <ConfidenceBadge value={sel.confidence} thresholds={thresholds} showLabel />}
            </div>
            <Field label="Nội dung" description="Sửa cho đúng từng chữ trên trang.">
              <Input value={sel.text ?? ''} onChange={e => update({ ...sel, text: e.target.value })} />
            </Field>
          </>
        ) : (
          <p className="dtx-boxedit__empty">{n ? 'Chọn một khung trên trang để sửa vị trí và nội dung.' : 'Trang chưa có khung nào.'}</p>
        )}
        <p id={hint} className="dtx-boxedit__hint">Kéo khung để di chuyển, kéo góc để đổi kích thước. Bàn phím: phím mũi tên di chuyển, Shift + mũi tên đổi kích thước.</p>
      </div>
    </div>
  );
}
