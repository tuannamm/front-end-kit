import assert from 'node:assert/strict';
import { test } from 'node:test';
import { heatGrid } from './heat-grid.ts';

/** The grid as rows of cells: '.' empty, else the score. */
const rowsOf = (g: Array<number | null>, cols: number) =>
  Array.from({ length: g.length / cols }, (_, r) => g.slice(r * cols, (r + 1) * cols).map(v => v ?? '.').join(' '));

test('a cell takes the lowest score of the boxes that cover it; unscored boxes leave no heat', () => {
  const g = heatGrid([
    { id: 'a', x: .4, y: .4, w: .2, h: .2, confidence: 70 },
    { id: 'b', x: .5, y: .4, w: .2, h: .2, confidence: 90 },
    { id: 'c', x: 0, y: 0, w: .2, h: .2 },
  ], 10, 10, 0);
  assert.deepEqual(rowsOf(g, 10).slice(3, 7), [
    '. . . . . . . . . .',
    '. . . . 70 70 90 . . .',
    '. . . . 70 70 90 . . .',
    '. . . . . . . . . .',
  ]);
  assert.equal(g.filter(v => v !== null).length, 6);
});

test('spread reaches round a box, the same distance across and down on a tall page', () => {
  const box = { id: 'a', x: .4, y: .4, w: .2, h: .2, confidence: 70 };
  const square = rowsOf(heatGrid([box], 10, 10, .1), 10);
  assert.equal(square[3], '. . . 70 70 70 70 . . .'); // the corner cell (3, 3) is 0.07 away, (2, 3) 0.15
  assert.equal(square[2], '. . . . . . . . . .');
  // 10 × 20: a page twice as tall, so 0.1 of its width is 0.05 of its height
  const tall = heatGrid([box], 10, 20, .1);
  const hit = (r: number) => tall[r * 10 + 5] !== null;
  assert.deepEqual([hit(6), hit(7), hit(12), hit(13)], [false, true, true, false]);
});
