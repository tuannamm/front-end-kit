import assert from 'node:assert/strict';
import { test } from 'node:test';
import { areaPath, linePath, monotone, niceScale, runs, type Pt } from './xy-scale.ts';

test('niceScale lands gridlines on round numbers', () => {
  assert.deepEqual(niceScale(0, 6300).ticks, [0, 2000, 4000, 6000, 8000]);
  assert.deepEqual(niceScale(0, 87.3).ticks, [0, 25, 50, 75, 100]);
  assert.deepEqual(niceScale(-12, 30).ticks, [-20, 0, 20, 40]);
  assert.deepEqual(niceScale(0, .9).ticks, [0, .25, .5, .75, 1]);
  assert.deepEqual(niceScale(0, 0).ticks, [0, .25, .5, .75, 1]);           // all zero: still a scale
  const tight = niceScale(0, 99.9, { min: 98, max: 100 });               // a given end is kept
  assert.equal(tight.min, 98); assert.equal(tight.max, 100);
  assert.deepEqual(tight.ticks, [98, 98.5, 99, 99.5, 100]);
});

test('runs split on null', () => {
  assert.deepEqual(runs([3, null, 4, 5, null, null, 1]), [[0], [2, 3], [6]]);
  assert.deepEqual(runs([null, null]), []);
});

test('monotone never passes a peak or a dip', () => {
  const p: Pt[] = [[0, 10], [10, 80], [20, 75], [30, 0], [40, 0], [50, 40]];
  for (const [from, a, b, to] of monotone(p)) {
    const lo = Math.min(from[1], to[1]), hi = Math.max(from[1], to[1]);
    for (const c of [a, b]) assert.ok(c[1] >= lo - 1e-9 && c[1] <= hi + 1e-9, `control ${c} outside ${lo}–${hi}`);
  }
  assert.equal(monotone([[0, 1]]).length, 0);
});

test('paths break at gaps and areas close', () => {
  const pts = [[0, 0], [1, 1], null, [3, 3], [4, 4]] as (Pt | null)[];
  assert.equal(linePath(pts).match(/M/g)!.length, 2);
  assert.equal(linePath(pts), 'M0,0L1,1M3,3L4,4');
  const area = areaPath(pts, pts.map((p, i) => [i, 10] as Pt));
  assert.equal(area.match(/Z/g)!.length, 2);
  assert.equal(area.split('M')[1], '0,0L1,1L1,10L0,10Z');
  assert.match(linePath(pts, true), /^M0,0C/);
});
