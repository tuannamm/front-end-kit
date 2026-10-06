import { useEffect, useState } from 'react';
import { Badge } from '../../core/badge';
import { useReducedMotion } from '../../motion/primitives';
import { ScanBeam } from '../shared/scan-beam';

export type ScanRow = { label: string; value: string; /** Links the row to an extracted field key. */ field?: string; strong?: boolean } | { rule: true };
export type ScanField = { key: string; value: string; /** 0–100 */ confidence: number };
export type ScanPhase = 'idle' | 'scanning' | 'done';

export type DocumentScanProps = {
  fileName: string;
  title: string;
  rows: ScanRow[];
  fields: ScanField[];
  engine?: string;
  /** Control the phase yourself, or leave undefined to auto-play. */
  phase?: ScanPhase;
  /** Restart after `done` (auto-play only). */
  loop?: boolean;
  scanMs?: number;
  /** Confidence below this shows in warning colour. */
  lowConfidence?: number;
  onPhaseChange?: (p: ScanPhase) => void;
};

/**
 * AI extraction visual: a beam sweeps the document, each linked row highlights as the beam
 * passes, and its field appears with a confidence score. Phases: idle → scanning → done.
 */
export function DocumentScan({ fileName, title, rows, fields, engine = 'DIGI-XTRACT', phase: controlled, loop = true, scanMs = 2400, lowConfidence = 95, onPhaseChange }: DocumentScanProps) {
  const reduced = useReducedMotion();
  const [auto, setAuto] = useState<ScanPhase>(reduced ? 'done' : 'scanning');
  const phase = controlled ?? auto;
  const [revealed, setRevealed] = useState(phase === 'done' ? fields.length : 0);
  const [run, setRun] = useState(0);
  useEffect(() => { onPhaseChange?.(phase); }, [phase, onPhaseChange]);

  useEffect(() => {
    if (phase === 'idle') { setRevealed(0); return; }
    if (phase === 'done' || reduced) { setRevealed(fields.length); return; }
    setRevealed(0);
    // reveal each field when the beam crosses its row
    const linked = rows.map((r, i) => ('field' in r && r.field ? i : -1)).filter(i => i >= 0);
    const timers = linked.map((rowIdx, n) => setTimeout(() => setRevealed(n + 1), ((rowIdx + 1) / rows.length) * scanMs));
    timers.push(setTimeout(() => { if (controlled === undefined) setAuto('done'); }, scanMs + 200));
    return () => timers.forEach(clearTimeout);
  }, [phase, run, reduced, rows, fields.length, scanMs, controlled]);

  useEffect(() => {
    if (controlled !== undefined || !loop || reduced || auto !== 'done') return;
    const t = setTimeout(() => { setAuto('scanning'); setRun(r => r + 1); }, 2600);
    return () => clearTimeout(t);
  }, [auto, controlled, loop, reduced]);

  const hitKeys = new Set(fields.slice(0, revealed).map(f => f.key));
  const status = phase === 'idle' ? <Badge tone="neutral" size="sm">Chờ xử lý</Badge>
    : phase === 'scanning' ? <Badge tone="brand" size="sm" live>Đang trích xuất</Badge>
    : <Badge tone="ok" size="sm" variant="surface">Hoàn tất · {fields.length} trường</Badge>;

  return (
    <div className="dtx-scan" data-phase={phase} role="img" aria-label={`${engine} trích xuất ${fields.length} trường từ ${fileName}`}>
      <div className="dtx-scan__head"><b>{engine}</b>{fileName}{status}</div>
      <div className="dtx-scan__body">
        <ScanBeam key={run} className="dtx-scan__doc" active={phase === 'scanning'} duration={scanMs} band={36}>
          <h4>{title}</h4>
          {rows.map((r, i) => 'rule' in r
            ? <hr key={i} className="dtx-scan__rule" />
            : <div key={i} className={r.strong ? 'dtx-scan__row dtx-scan__row--strong' : 'dtx-scan__row'} data-hit={r.field && hitKeys.has(r.field) ? '' : undefined}><span>{r.label}</span><span>{r.value}</span></div>)}
        </ScanBeam>
        <div className="dtx-scan__fields" aria-hidden>
          {fields.map((f, i) => i < revealed
            ? <div key={`${run}-${f.key}`} className="dtx-scan__field"><small>{f.key}<i data-low={f.confidence < lowConfidence ? '' : undefined}>{f.confidence.toFixed(1)}%</i></small><div>{f.value}</div></div>
            : <div key={`ph-${f.key}`} className="dtx-scan__placeholder" />)}
        </div>
      </div>
    </div>
  );
}
