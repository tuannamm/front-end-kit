import assert from 'node:assert/strict';
import { test } from 'node:test';
import { tableGrid } from './table-grid.ts';

const ids = (cells: Array<{ id: string; row: number; col: number; rowSpan?: number; colSpan?: number }>) => tableGrid(cells).map(r => r.map(c => c?.id ?? null));

test('tableGrid places cells by position, skips span-covered slots and keeps holes', () => {
  const cells = [                                          // shuffled, as engines may emit them
    { id: 'e', row: 2, col: 1 },
    { id: 'a', row: 0, col: 0, colSpan: 2 },
    { id: 'd', row: 1, col: 2 },
    { id: 'c', row: 1, col: 0, rowSpan: 2 },
    { id: 'b', row: 0, col: 2 },
  ];
  assert.deepEqual(ids(cells), [['a', 'b'], ['c', null, 'd'], ['e', null]]);
});

test('tableGrid keeps a cell that starts under another span', () => {
  assert.deepEqual(ids([{ id: 'a', row: 0, col: 0, colSpan: 2 }, { id: 'b', row: 0, col: 1 }]), [['a', 'b']]);
});

test('tableGrid of no cells is no rows', () => {
  assert.deepEqual(tableGrid([]), []);
});
