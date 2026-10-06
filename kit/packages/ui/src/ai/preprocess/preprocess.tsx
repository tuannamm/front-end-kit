import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cx } from '../../cx';
import { useReducedMotion } from '../../motion/primitives';
import { ScanBeam } from '../shared/scan-beam';
import { UnwarpMesh, type UnwarpGrid } from './unwarp-mesh';
import { PageLook, pixelStepLooks, type PixelStep } from './page-look';

export type PreprocessEffect = 'crop' | 'unwarp' | 'deskew' | 'denoise' | 'binarize' | 'grayscale';
export const preprocessLabels: Record<PreprocessEffect, string> = {
  crop: 'Cắt viền', unwarp: 'Làm phẳng', deskew: 'Chống nghiêng', denoise: 'Khử nhiễu', binarize: 'Nhị phân hoá', grayscale: 'Thang xám',
};

export type GeometryStep = 'crop' | 'unwarp' | 'deskew';

/**
 * One geometry step on one page (crop, unwarp, deskew): `applied=false` shows the raw shape (tilted, warped, on a desk),
 * `applied=true` animates the page into place. Pixel steps are not here: they are a before/after pair of pages
 * (see PageLook), shown with CompareSlider or ScanBeam.
 */
export function Preprocess({ effect, applied, duration = 900, grid, children }: {
  effect: GeometryStep; applied: boolean; duration?: number;
  /** unwarp only: the service's lattice on the raw image (defaults to a synthetic curl for demos) */
  grid?: UnwarpGrid; children: ReactNode;
}) {
  return (
    <div className={cx('dtx-pp', `dtx-pp--${effect}`)} data-applied={applied ? '' : undefined} style={{ '--pp-ms': `${duration}ms` } as CSSProperties}>
      <div className="dtx-pp__page">
        {children}
        {effect === 'unwarp' && <><i className="dtx-pp__curl" aria-hidden /><UnwarpMesh applied={applied} duration={duration} grid={grid} /></>}
        {effect === 'crop' && <span className="dtx-pp__corners" aria-hidden><i /><i /><i /><i /></span>}
        {effect === 'deskew' && <i className="dtx-pp__guides" aria-hidden />}
      </div>
    </div>
  );
}

/** Pixel steps change colour/noise, not geometry: a before/after pair of looks, revealed under a scan. */
export const pixelEffects: PixelStep[] = ['binarize', 'denoise', 'grayscale'];
const isPixel = (e: PreprocessEffect): e is PixelStep => (pixelEffects as string[]).includes(e);

/**
 * Applies a list of steps to a page. `isDone(step)` says which are applied; `current` is the step being applied now.
 * Geometry steps (crop, unwarp, deskew) animate their transform. Pixel steps (binarize, denoise, grayscale) are
 * revealed 0 → 100 % behind a scan line (ScanBeam before=…), so the page is fully clean exactly when the scan ends.
 * The tree stays stable between steps, so geometry transitions are never restarted by a wipe.
 */
export function PreprocessStack({ steps, isDone, current, scan = true, scanMs = 1000, children }: {
  steps: PreprocessEffect[]; isDone: (e: PreprocessEffect) => boolean; current: PreprocessEffect | null; scan?: boolean; scanMs?: number; children: ReactNode;
}) {
  const geom = steps.filter((e): e is GeometryStep => !isPixel(e)), pix = steps.filter(isPixel);
  const geomNode = geom.reduceRight<ReactNode>((inner, eff) => <Preprocess effect={eff} applied={isDone(eff)}>{inner}</Preprocess>, children);
  if (!pix.length) return <>{geomNode}</>;
  const wiping = scan && current !== null && isPixel(current);
  const pixLayer = (applied: (e: PixelStep) => boolean) =>
    pix.reduceRight<ReactNode>((inner, eff) => <PageLook look={applied(eff) ? pixelStepLooks[eff].after : pixelStepLooks[eff].before}>{inner}</PageLook>, geomNode);
  // key changes only when a new pixel step starts, never on a geometry step
  const wipeKey = pix.filter(e => isDone(e)).length;
  if (!scan) return <>{pixLayer(isDone)}</>;
  return (
    <ScanBeam key={wipeKey} active={wiping} duration={scanMs} before={pixLayer(e => isDone(e) && !(wiping && e === current))}>
      {pixLayer(isDone)}
    </ScanBeam>
  );
}

/**
 * Chains steps in order (default: crop → unwarp → deskew → denoise → binarize) with a stepper.
 * Controlled with `step` (number of steps applied), or auto-plays and loops.
 */
export function PreprocessPipeline({ steps = ['crop', 'unwarp', 'deskew', 'denoise', 'binarize'], step: controlled, autoPlay = true, interval = 1300, onStepChange, children }: {
  steps?: PreprocessEffect[]; step?: number; autoPlay?: boolean; interval?: number; onStepChange?: (n: number) => void; children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const [auto, setAuto] = useState(0);
  const step = controlled ?? (reduced ? steps.length : auto);
  useEffect(() => {
    if (controlled !== undefined || !autoPlay || reduced) return;
    const t = setTimeout(() => setAuto(s => (s >= steps.length ? 0 : s + 1)), step >= steps.length ? interval * 2 : interval);
    return () => clearTimeout(t);
  }, [step, controlled, autoPlay, reduced, interval, steps.length]);
  useEffect(() => { onStepChange?.(step); }, [step, onStepChange]);

  const page = <PreprocessStack steps={steps} isDone={e => steps.indexOf(e) < step} current={step > 0 ? steps[step - 1] : null} scanMs={interval * .75}>{children}</PreprocessStack>;
  return (
    <div className="dtx-pipeline">
      <ol className="dtx-pipeline__steps" aria-label="Các bước tiền xử lý">
        {steps.map((s, i) => (
          <li key={s} data-state={step > i ? 'done' : step === i ? 'current' : 'todo'}>
            <span className="dtx-pipeline__num">{step > i ? <Check size={11} strokeWidth={3} /> : i + 1}</span>{preprocessLabels[s]}
          </li>
        ))}
      </ol>
      <div className="dtx-pipeline__stage">{page}</div>
    </div>
  );
}
