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
