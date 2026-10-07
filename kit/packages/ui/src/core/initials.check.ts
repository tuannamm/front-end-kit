// Self-check for Avatar initials. Run: npm test -w @dtx/ui
import assert from 'node:assert/strict';
import { initials } from './initials.ts';

assert.equal(initials('Nguyễn Thị Thuận'), 'NT');
assert.equal(initials('  trần   minh '), 'TM');
assert.equal(initials('Đặng'), 'Đ');
assert.equal(initials('Ẩn Ước'.normalize('NFD')), 'ẨƯ', 'decomposed input gives composed letters');
assert.equal(initials('(Khách) Lê Văn An'), 'KA');
assert.equal(initials('Lê 🙂'), 'L', 'a word without a letter is skipped');
assert.equal(initials('   '), '');
assert.equal(initials('123'), '');

console.log('initials ok');
