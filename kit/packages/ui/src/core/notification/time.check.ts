// Run: node --experimental-strip-types core/notification/time.check.ts. Local-time dates, so any TZ gives the same result.
import assert from 'node:assert/strict';
import { fullTime, isoTime, relativeTime, shortTime } from './time.ts';

const now = new Date(2026, 9, 7, 9, 0).getTime();
const at = (d: number, h: number, m = 0, s = 0) => new Date(2026, 9, d, h, m, s);

assert.equal(relativeTime(at(7, 8, 59, 30), now), 'Just now');
assert.equal(relativeTime(at(7, 9, 5), now), 'Just now', 'future (clock skew)');
assert.equal(relativeTime(at(7, 8, 55), now), '5 minutes ago');
assert.equal(relativeTime(at(7, 6), now), '3 hours ago');
assert.equal(relativeTime(at(6, 10), now), '23 hours ago');
assert.equal(relativeTime(at(6, 9), now), 'yesterday');
assert.equal(relativeTime(at(5, 3), now), '2 days ago', '30 hours, but two calendar days back');
assert.equal(relativeTime(at(1, 8), now), '6 days ago');
assert.equal(relativeTime(new Date(2026, 8, 3, 17, 5), now), '09/03/2026');
assert.equal(relativeTime(at(7, 8, 55).toISOString(), now), '5 minutes ago', 'ISO string input');
assert.equal(relativeTime('not a date', now), '');

assert.equal(fullTime(new Date(2026, 8, 3, 17, 5)), '17:05 · Thursday, 09/03/2026');
assert.equal(fullTime('not a date'), '');
assert.equal(shortTime(new Date(2026, 9, 7, 14, 32)), '14:32 · 10/07/2026');
assert.equal(shortTime('not a date'), '');
assert.equal(isoTime('2026-10-07T07:32:00Z'), '2026-10-07T07:32:00.000Z');
assert.equal(isoTime('not a date'), '', 'no RangeError');
console.log('time ok');
