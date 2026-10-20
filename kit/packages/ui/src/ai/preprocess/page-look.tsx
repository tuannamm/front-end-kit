/**
 * # AI · Preprocess
 *
 * Geometry steps (crop, unwarp, deskew) as two-phase animations, chained in a pipeline. Pixel steps (binarize, denoise,
 * grayscale) are a before/after pair of pages: show them with CompareSlider or ScanBeam.
 *
 * ```tsx
 * import { Preprocess, PreprocessPipeline, UnwarpView } from '@dgtx/ui-frek';
 *
 * <Preprocess effect="deskew" applied={done}><img src={page} alt="Page 1" /></Preprocess>
 * <UnwarpView raw={raw} unwarped={flat} grid={lattice} applied={done} />
 * ```
 *
 * ## Props
 *
 * ### Preprocess
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `effect` | `'crop' \| 'unwarp' \| 'deskew'` | **required** | Geometry step |
 * | `applied` | `boolean` | **required** | `false` shows the raw shape; `true` animates the page into place |
 * | `duration` | `number` | `900` | ms |
 * | `grid` | `UnwarpGrid` | synthetic curl | Unwarp only: the service's lattice on the raw image |
 * | `children` | `ReactNode` | **required** | The page |
 *
 * ### PreprocessPipeline
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `steps` | `PreprocessEffect[]` | `['crop', 'unwarp', 'deskew', 'denoise', 'binarize']` | In order |
 * | `step` | `number` |  | Controlled: number of steps applied. Leave out to auto-play |
 * | `autoPlay` | `boolean` | `true` | Play and loop when uncontrolled |
 * | `interval` | `number` | `1300` | ms per step |
 * | `onStepChange` | `(n: number) => void` |  | Steps applied changed |
 * | `children` | `ReactNode` | **required** | The page |
 *
 * ### PreprocessStack
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `steps` | `PreprocessEffect[]` | **required** | Steps to stack on the page |
 * | `isDone` | `(step: PreprocessEffect) => boolean` | **required** | Which are applied |
 * | `current` | `PreprocessEffect \| null` | **required** | The step being applied now; a pixel step wipes in under a scan |
 * | `scan` | `boolean` | `true` | Scan wipe for pixel steps |
 * | `scanMs` | `number` | `1000` | ms per wipe |
 * | `children` | `ReactNode` | **required** | The page |
 *
 * ### UnwarpView
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `raw` | `{ src: string; width: number; height: number }` | **required** | Raw image |
 * | `unwarped` | `{ src: string; width: number; height: number }` | **required** | The service's unwarped image |
 * | `grid` | `UnwarpGrid` | **required** | The /unwarp lattice on the raw image |
 * | `applied` | `boolean` | **required** | Stretch the raw page flat along the lattice |
 * | `duration` | `number` | `1800` | ms of the stretch |
 * | `hold` | `number` | `500` | ms the lattice shows on the raw page before the stretch |
 * | `alt` | `string` | `'Document page'` | Image description |
 *
 * ### UnwarpMesh
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `applied` | `boolean` | **required** | Points travel to a regular grid |
 * | `duration` | `number` | **required** | ms, in step with the page |
 * | `grid` | `UnwarpGrid` | synthetic curl | Lattice to draw |
 * | `pop` | `boolean` | `true` | Points pop in diagonally on mount |
 *
 * ### UnwarpGrid
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `cols` | `number` | **required** | Points per row |
 * | `rows` | `number` | **required** | Rows |
 * | `points` | `number[] \| [number, number][][]` | **required** | 0–1 of the raw image, row-major: flat `[x, y, …]` or `points[row][col]` |
 *
 * ### PageLook
 *
 * Internal: one simulated pixel look of the sample page, used by PreprocessStack.
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `look` | `'raw-color' \| 'raw-noisy' \| 'grayscale' \| 'binarized' \| 'denoised'` | **required** | Look to apply |
 * | `children` | `ReactNode` | **required** | The page |
 *
 * ## Files
 *
 * - `preprocess.tsx`: Preprocess, PreprocessStack, PreprocessPipeline, `preprocessLabels`, `pixelEffects`
 * - `unwarp-mesh.tsx`: UnwarpView, UnwarpMesh, `syntheticUnwarpGrid`, `UnwarpGrid`
 * - `page-look.tsx`: PageLook (internal)
 * - `preprocess.css`
 *
 
 */

import type { ReactNode } from 'react';

/*
 * A pixel step (binarize, denoise, grayscale) is a pair of pages, `before` and `after`; real pipelines pass the
 * service's two images, so the kit's only API for them is before/after (CompareSlider, ScanBeam). The looks below are
 * internal: PreprocessStack uses them to animate a single sample page through pixel steps.
 */
type PageLookName = 'raw-color' | 'raw-noisy' | 'grayscale' | 'binarized' | 'denoised';

export type PixelStep = 'binarize' | 'denoise' | 'grayscale';
/** internal: simulated before/after of each pixel step */
export const pixelStepLooks: Record<PixelStep, { before: PageLookName; after: PageLookName }> = {
  binarize: { before: 'raw-color', after: 'binarized' },
  denoise: { before: 'raw-noisy', after: 'denoised' },
  grayscale: { before: 'raw-color', after: 'grayscale' },
};

/** internal: one simulated look (PreprocessStack) */
export function PageLook({ look, children }: { look: PageLookName; children: ReactNode }) {
  return (
    <div className={`dtx-look dtx-look--${look}`}>
      {children}
      {look === 'raw-noisy' && <i className="dtx-look__noise" aria-hidden />}
    </div>
  );
}
