// Pure geometry behind Watermark; no DOM, so tile.check.ts can run it in node.

/**
 * One cell of the pattern: the mark's box after rotation plus the gap. The repeating tile is 2 × 2 cells with a mark
 * in the first and the last, so every other row is offset by half a cell. Marks sit at cell centres and never clip.
 */
export function cellSize(textW: number, textH: number, rotateDeg: number, gap: [number, number]) {
  const r = (rotateDeg * Math.PI) / 180, cos = Math.abs(Math.cos(r)), sin = Math.abs(Math.sin(r));
  return { w: textW * cos + textH * sin + gap[0], h: textW * sin + textH * cos + gap[1] };
}
