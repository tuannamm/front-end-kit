/** Pure layout for TableExtraction: detected cells → table rows. */
export type GridCell = { row: number; col: number; rowSpan?: number; colSpan?: number };

/**
 * The rows of a table in reading order: each cell where it starts, `null` for a hole no cell covers, nothing where a
 * span already reaches. Cells may arrive in any order. A cell starting under another's span (overlapping engine output)
 * is still emitted, so no text is dropped.
 */
export function tableGrid<T extends GridCell>(cells: T[]): (T | null)[][] {
  const starts = new Map<string, T[]>();
  for (const c of cells) starts.set(`${c.row},${c.col}`, [...(starts.get(`${c.row},${c.col}`) ?? []), c]);
  const rows = Math.max(0, ...cells.map(c => c.row + (c.rowSpan ?? 1)));
  const cols = Math.max(0, ...cells.map(c => c.col + (c.colSpan ?? 1)));
  const covered = new Set<string>();
  return Array.from({ length: rows }, (_, r) => {
    const out: (T | null)[] = [];
    for (let c = 0; c < cols; c++) {
      const here = starts.get(`${r},${c}`);
      if (!here) { if (!covered.has(`${r},${c}`)) out.push(null); continue; }
      for (const x of here) {
        out.push(x);
        for (let i = 0; i < (x.rowSpan ?? 1); i++) for (let j = 0; j < (x.colSpan ?? 1); j++) covered.add(`${r + i},${c + j}`);
      }
    }
    return out;
  });
}
