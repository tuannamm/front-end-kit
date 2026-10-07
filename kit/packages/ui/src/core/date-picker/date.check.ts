// Self-check for the date helpers behind DatePicker. Run: npm test -w @dtx/ui
import assert from 'node:assert/strict';
import { addDays, addMonths, clampDate, formatDate, monthGrid, parseDate, weekday } from './date.ts';

assert.equal(parseDate('05/10/2026'), '2026-10-05');
assert.equal(parseDate(' 5-10-2026 '), '2026-10-05');
assert.equal(parseDate('5.10.2026'), '2026-10-05');
assert.equal(parseDate('05102026'), '2026-10-05');
assert.equal(parseDate('29/02/2024'), '2024-02-29');
for (const bad of ['31/02/2026', '29/02/2026', '00/10/2026', '12/13/2026', '05/10/26', '', 'hôm nay']) assert.equal(parseDate(bad), null, bad);
assert.equal(formatDate('2026-10-05'), '05/10/2026');
assert.equal(formatDate(null), '');
// custom formats: display follows the pattern, typing follows its part order
assert.equal(formatDate('2026-10-05', 'yyyy-MM-dd'), '2026-10-05');
assert.equal(formatDate('2026-10-05', 'MM/dd/yyyy'), '10/05/2026');
assert.equal(formatDate('2026-10-05', 'd.M.yyyy'), '5.10.2026');
assert.equal(parseDate('2026-10-05', 'yyyy-MM-dd'), '2026-10-05');
assert.equal(parseDate('2026/10/5', 'yyyy-MM-dd'), '2026-10-05');
assert.equal(parseDate('20261005', 'yyyy-MM-dd'), '2026-10-05');
assert.equal(parseDate('10/05/2026', 'MM/dd/yyyy'), '2026-10-05');
assert.equal(parseDate('02/31/2026', 'MM/dd/yyyy'), null);
assert.equal(parseDate('5.10.2026', 'd.M.yyyy'), '2026-10-05');
assert.equal(parseDate('05/10/2026', 'yyyy-MM-dd'), null);
for (const bad of ['dd/MM/yy', 'dd/dd/yyyy', 'MM/yyyy', '']) assert.throws(() => formatDate('2026-10-05', bad), /Date format/, bad);
assert.equal(addDays('2026-12-31', 1), '2027-01-01');
assert.equal(addMonths('2026-01-31', 1), '2026-02-28');
assert.equal(addMonths('2026-03-15', -3), '2025-12-15');
assert.equal(clampDate('2026-01-01', '2026-02-01'), '2026-02-01');
assert.equal(weekday('2026-10-05'), 0); // Monday
const g = monthGrid(2026, 9); // October 2026 starts on a Thursday
assert.equal(g.length, 42);
assert.equal(g[0], '2026-09-28');
assert.equal(g[3], '2026-10-01');
console.log('date helpers ok');
