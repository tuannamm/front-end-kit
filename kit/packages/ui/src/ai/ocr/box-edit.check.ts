import assert from 'node:assert/strict';
import { test } from 'node:test';
import { editBox } from './box-edit.ts';

// rounded, so float noise (0.1 + 0.05) does not fail an exact comparison
const round = <T,>(v: T): T => JSON.parse(JSON.stringify(v, (_, n) => (typeof n === 'number' ? +n.toFixed(6) : n)));
const box = { id: 'a', x: .1, y: .1, w: .2, h: .1 };

test('a moved box keeps its size and stays on the page', () => {
  assert.deepEqual(round(editBox(box, 'move', .05, .05)), { id: 'a', x: .15, y: .15, w: .2, h: .1 });
  assert.deepEqual(round(editBox(box, 'move', 1, -1)), { id: 'a', x: .8, y: 0, w: .2, h: .1 });
});

test('a corner drag keeps the opposite corner and never turns the box inside out', () => {
  assert.deepEqual(round(editBox(box, 'nw', .05, -.05)), { id: 'a', x: .15, y: .05, w: .15, h: .15 });
  assert.deepEqual(round(editBox(box, 'se', -1, -1)), { id: 'a', x: .1, y: .1, w: .005, h: .005 });
  assert.deepEqual(round(editBox(box, 'ne', 2, 0)), { id: 'a', x: .1, y: .1, w: .9, h: .1 });
});

test('a polygon moves and scales with its bounding rectangle', () => {
  const quad = { id: 'q', x: 0, y: 0, w: 0, h: 0, points: [[.1, .12], [.3, .1], [.3, .18], [.1, .2]] as Array<[number, number]> };
  assert.deepEqual(round(editBox(quad, 'move', .1, 0)).points, [[.2, .12], [.4, .1], [.4, .18], [.2, .2]]);
  const wide = round(editBox(quad, 'se', .2, 0));
  assert.deepEqual(wide.points, [[.1, .12], [.5, .1], [.5, .18], [.1, .2]]);
  assert.deepEqual([wide.x, wide.y, wide.w, wide.h], [.1, .1, .4, .1]);
});
