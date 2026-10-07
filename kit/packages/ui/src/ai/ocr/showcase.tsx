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
  ...preprocessLabels, detect: 'Phát hiện chữ (OCR_det)', recognize: 'Nhận dạng (OCR_rec)', layout: 'Phân tích bố cục', extract: 'Trích xuất trường',
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

  const pageEl = doc?.image ? <img src={doc.image.src} alt={doc.fileName ?? 'Trang tài liệu'} width={doc.image.width} height={doc.image.height} style={{ display: 'block', width: '100%', height: 'auto' }} /> : page;
  const boxes = layoutOn ? norm.regions : extracted ? norm.lines.filter(l => linked.has(l.id) || !linked.size) : norm.lines;
  const overlay = detected || layoutOn
    ? <BoxOverlay key={`${current}-${i}`} boxes={boxes} colorBy={layoutOn ? 'kind' : recognized ? 'confidence' : 'plain'} showLabels={layoutOn} hideText={!recognized} thresholds={thresholds} selectedId={selected} animate={!reduced}>{pageEl}</BoxOverlay>
    : <div style={{ lineHeight: 0 }}>{pageEl}</div>;
  const pre = stages.filter(isPre);
  const pagePipeline = <PreprocessStack steps={pre} isDone={done} current={current && isPre(current) ? current : null} scan={scan && !reduced} scanMs={interval * .8}>{overlay}</PreprocessStack>;
  const scanning = scan && current === 'detect' && !reduced;
  const status = i === 0 ? <Badge tone="neutral" size="sm">Ảnh gốc</Badge>
    : i >= stages.length ? <Badge tone="ok" size="sm" variant="surface">Hoàn tất</Badge>
    : <Badge size="sm" live>{ocrStageLabels[stages[i]]}</Badge>;

  return (
    <div className="dtx-showcase">
      <div className="dtx-showcase__head">
        <div className="dtx-showcase__title"><b>{title ?? doc?.engine ?? 'DIGI-XTRACT'}</b><span>{doc?.fileName}</span></div>
        {status}
        <div className="dtx-showcase__ctrl">
          <Button variant="ghost" size="sm" icon aria-label="Bước trước" onClick={() => { setPlaying(false); set(i - 1); }} disabled={i === 0}><ChevronLeft /></Button>
          <Button variant="secondary" size="sm" icon aria-label={playing ? 'Tạm dừng' : 'Phát'} onClick={() => { if (i >= stages.length) set(0); setPlaying(p => !p); }} disabled={controlled !== undefined}>{playing ? <Pause /> : <Play />}</Button>
          <Button variant="ghost" size="sm" icon aria-label="Bước sau" onClick={() => { setPlaying(false); set(i + 1); }} disabled={i >= stages.length}><ChevronRight /></Button>
          <Button variant="ghost" size="sm" icon aria-label="Về ảnh gốc" onClick={() => { setPlaying(false); set(0); }}><RotateCcw /></Button>
        </div>
      </div>
      <ol className="dtx-showcase__steps" aria-label="Các bước xử lý">
        <li data-state={i === 0 ? 'current' : 'done'}><button type="button" onClick={() => { setPlaying(false); set(0); }}>Ảnh gốc</button></li>
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
          {i === 0 && <p className="dtx-showcase__hint">Ảnh đầu vào. Nhấn Phát hoặc chọn một bước.</p>}
          {current && isPre(current) && <p className="dtx-showcase__hint">{ocrStageLabels[current]}: chuẩn hoá ảnh trước khi nhận dạng.</p>}
          {current === 'detect' && <p className="dtx-showcase__hint"><b>{norm.lines.length}</b> vùng chữ được phát hiện.</p>}
          {current === 'layout' && <p className="dtx-showcase__hint"><b>{norm.regions.length}</b> vùng bố cục.</p>}
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
