import type { OcrBox } from '../shared/box-overlay';

/**
 * Local confidence on a cols × rows grid over the page: per cell, the lowest score of any box within `spread`
 * (0–1 of the page width) of the cell centre, or null where no scored box is near. Cells are square on the page when
 * rows = cols × height / width.
 */
export function heatGrid(boxes: OcrBox[], cols: number, rows: number, spread: number): Array<number | null> {
  const ky = rows / cols; // a page-height fraction in page-width units
  const out: Array<number | null> = new Array(cols * rows).fill(null);
  for (const b of boxes) {
    if (b.confidence === undefined) continue;
    // only the cells within reach of this box
    const c0 = Math.max(0, Math.floor((b.x - spread) * cols)), c1 = Math.min(cols - 1, Math.floor((b.x + b.w + spread) * cols));
    const r0 = Math.max(0, Math.floor((b.y - spread / ky) * rows)), r1 = Math.min(rows - 1, Math.floor((b.y + b.h + spread / ky) * rows));
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const cx = (c + .5) / cols, cy = (r + .5) / rows;
      const dx = Math.max(b.x - cx, 0, cx - b.x - b.w), dy = Math.max(b.y - cy, 0, cy - b.y - b.h) * ky;
      if (Math.hypot(dx, dy) > spread) continue;
      const i = r * cols + c, v = out[i];
      if (v === null || b.confidence < v) out[i] = b.confidence;
    }
  }
  return out;
}
