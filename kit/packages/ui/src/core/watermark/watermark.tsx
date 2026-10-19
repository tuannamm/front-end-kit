/**
 * # Watermark
 *
 * Repeated, rotated text over a document, a record or a whole page: marks it confidential and names who viewed it and
 * when, so a screenshot or a photo of the screen can be traced.
 *
 * ```tsx
 * import { Watermark } from '@dgtx/ui-frek';
 *
 * <Watermark content={['DIGI-TEXX · Confidential', `${user.name} · ${shortTime(new Date())}`]}>
 *   <RecordDetail />
 * </Watermark>
 *
 * // a draft: one big word, wider apart
 * <Watermark content="DRAFT" fontSize={28} rotate={-30} gap={[160, 120]}>…</Watermark>
 * ```
 *
 * ## Notes
 *
 * - Drawn once to a canvas (Roboto 500, redrawn when the web font has loaded) and tiled over the children as a CSS
 *   mask. One element, no per-mark DOM; it does not catch the pointer, so everything under it stays usable.
 * - Every other row is offset by half a mark, as in a printed security pattern. Marks never clip, whatever `rotate`.
 * - The colour follows the theme: `--dtx-fg` at 13%. Over a theme-fixed surface (a white paper page in the dark theme)
 *   set `--dtx-watermark-color` on the Watermark, e.g. `rgb(0 0 0 / .12)`.
 * - It sits above the content (sticky headers included) and is kept in print and in forced-colours mode.
 * - Hidden from screen readers. If the confidentiality matters to the reader, say it in text on the page too.
 * - A deterrent, not protection: anyone with devtools can remove it. For files that leave the system, burn the
 *   watermark into the file on the server.
 *
 * ## Props
 *
 * ### Watermark
 *
 * | Prop | Type | Default | Description |
 * |---|---|---|---|
 * | `content` | `string \| string[]` | **required** | One line, or several stacked |
 * | `children` | `ReactNode` |  | What it covers |
 * | `rotate` | `number` | `-22` | Degrees; negative climbs to the right |
 * | `gap` | `[number, number]` | `[100, 80]` | Space between marks, across and down (px) |
 * | `fontSize` | `number` | `14` | Text size (px) |
 * | `className` | `string` |  | Extra classes |
 *
 * ## Files
 *
 * - `watermark.tsx`: Watermark
 * - `tile.ts` + `tile.check.ts`: cell geometry (rotated box plus gap) and its node check
 * - `watermark.css`: `.dtx-watermark*`
 *
 * Catalog: `#/catalog/watermark`
 *
 * @generated from README.md in this folder. Edit the README, then run `npm run docs:sync`.
 */

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '../../cx';
import { cellSize } from './tile';

export type WatermarkProps = {
  /** One line, or several stacked: a label, then who and when ("Nguyễn Minh Anh · 07/10/2026 14:32"). */
  content: string | string[];
  children?: ReactNode;
  /** Degrees; negative climbs to the right. */
  rotate?: number;
  /** Space between marks, [across, down] (px). */
  gap?: [number, number];
  fontSize?: number;
  className?: string;
};

type Tile = { url: string; w: number; h: number };

/** Text in black on a transparent canvas: used as a mask, so the colour comes from CSS and follows the theme. */
function drawTile(lines: string[], fontSize: number, rotate: number, gap: [number, number], family: string): Tile | null {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const font = `500 ${fontSize}px ${family}`;
  const lh = fontSize * 1.4;
  ctx.font = font;
  const cell = cellSize(Math.max(...lines.map(l => ctx.measureText(l).width)), lh * lines.length, rotate, gap);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.ceil(2 * cell.w * dpr);
  canvas.height = Math.ceil(2 * cell.h * dpr);
  ctx.scale(dpr, dpr);
  ctx.font = font; // resizing the canvas reset it
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const [x, y] of [[cell.w / 2, cell.h / 2], [cell.w * 1.5, cell.h * 1.5]]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotate * Math.PI) / 180);
    lines.forEach((l, i) => ctx.fillText(l, 0, (i - (lines.length - 1) / 2) * lh));
    ctx.restore();
  }
  return { url: canvas.toDataURL(), w: 2 * cell.w, h: 2 * cell.h };
}

/**
 * Repeated, rotated text over its children: who is looking and when, on screen and in screenshots. Drawn once to a
 * canvas and tiled as a CSS mask, so it costs one element and recolours with the theme. A deterrent, not protection.
 */
export function Watermark({ content, children, rotate = -22, gap = [100, 80], fontSize = 14, className }: WatermarkProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tile, setTile] = useState<Tile | null>(null);
  const lines = (Array.isArray(content) ? content : [content]).filter(Boolean);
  const text = lines.join('\n');

  useLayoutEffect(() => {
    let alive = true;
    const draw = () => { if (alive && ref.current) setTile(lines.length ? drawTile(lines, fontSize, rotate, gap, getComputedStyle(ref.current).fontFamily) : null); };
    draw();
    // drawn again once the web font is in: a canvas does not wait for it, and the first pass may use Arial
    document.fonts?.ready.then(draw);
    return () => { alive = false; };
  }, [text, fontSize, rotate, gap[0], gap[1]]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div ref={ref} className={cx('dtx-watermark', className)}>
      {children}
      {tile && <div className="dtx-watermark__layer" aria-hidden style={{ maskImage: `url(${tile.url})`, maskSize: `${tile.w}px ${tile.h}px` }} />}
    </div>
  );
}
