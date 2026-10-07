// Run: node --experimental-strip-types core/notification/time.check.ts. Local-time dates, so any TZ gives the same result.
import assert from 'node:assert/strict';
import { fullTime, relativeTime } from './time.ts';

const now = new Date(2026, 9, 7, 9, 0).getTime();
const at = (d: number, h: number, m = 0, s = 0) => new Date(2026, 9, d, h, m, s);

assert.equal(relativeTime(at(7, 8, 59, 30), now), 'Vừa xong');
assert.equal(relativeTime(at(7, 9, 5), now), 'Vừa xong', 'future (clock skew)');
assert.equal(relativeTime(at(7, 8, 55), now), '5 phút trước');
assert.equal(relativeTime(at(7, 6), now), '3 giờ trước');
assert.equal(relativeTime(at(6, 10), now), '23 giờ trước');
assert.equal(relativeTime(at(6, 9), now), 'Hôm qua');
assert.equal(relativeTime(at(5, 3), now), 'Hôm kia', '30 hours, but two calendar days back');
assert.equal(relativeTime(at(1, 8), now), '6 ngày trước');
assert.equal(relativeTime(new Date(2026, 8, 3, 17, 5), now), '03/09/2026');
assert.equal(relativeTime(at(7, 8, 55).toISOString(), now), '5 phút trước', 'ISO string input');
assert.equal(relativeTime('not a date', now), '');

assert.equal(fullTime(new Date(2026, 8, 3, 17, 5)), '17:05 · Thứ Năm, 03/09/2026');
assert.equal(fullTime('not a date'), '');
console.log('time ok');
