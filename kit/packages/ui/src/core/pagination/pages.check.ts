import assert from 'node:assert/strict';
import { pageForResize, pageItems } from './pages.ts';

assert.deepEqual(pageItems(1, 0), [], 'no pages');
assert.deepEqual(pageItems(3, 7), [1, 2, 3, 4, 5, 6, 7], 'fits: all shown');
assert.deepEqual(pageItems(1, 20), [1, 2, 3, 4, 5, null, 20], 'start');
assert.deepEqual(pageItems(4, 20), [1, 2, 3, 4, 5, null, 20], 'near start: no gap hiding one page');
assert.deepEqual(pageItems(5, 20), [1, null, 4, 5, 6, null, 20], 'middle');
assert.deepEqual(pageItems(16, 20), [1, null, 15, 16, 17, null, 20], 'middle, late');
assert.deepEqual(pageItems(17, 20), [1, null, 16, 17, 18, 19, 20], 'near end');
assert.deepEqual(pageItems(99, 20), [1, null, 16, 17, 18, 19, 20], 'out of range clamps');
assert.deepEqual(pageItems(10, 20, 2), [1, null, 8, 9, 10, 11, 12, null, 20], 'two siblings');
for (let c = 8; c <= 30; c++) for (let p = 1; p <= c; p++) {
  const items = pageItems(p, c);
  assert.equal(items.length, 7, `constant width ${p}/${c}`);
  assert.ok(items.includes(p), `current shown ${p}/${c}`);
  items.forEach((x, i) => { if (x === null) assert.ok((items[i + 1] as number) - (items[i - 1] as number) >= 3, `gap hides ≥ 2 pages ${p}/${c}`); });
}
assert.equal(pageForResize(3, 20, 50), 1, 'rows 41–60 at 50/page start on page 1');
assert.equal(pageForResize(7, 20, 10), 13, 'row 121 at 10/page is on page 13');
assert.equal(pageForResize(1, 20, 100), 1);
console.log('pages ok');
