import assert from 'node:assert/strict';
import { groupCommands, matchCommand } from './command.ts';

const batch = { label: 'Lô HD-5517', description: 'Chuỗi bán lẻ Phương Nam', group: 'Lô tài liệu', keywords: ['invoice'] };
assert.ok(matchCommand(batch, ''), 'an empty query matches everything');
assert.ok(matchCommand(batch, 'lo 5517'), 'accents ignored, words in any position');
assert.ok(matchCommand(batch, 'phuong   nam'), 'description, repeated spaces');
assert.ok(matchCommand(batch, 'INVOICE'), 'keywords, any case');
assert.ok(matchCommand({ label: 'Đổi ngôn ngữ' }, 'doi'), 'đ matches d');
assert.ok(matchCommand(batch, 'tài liệu'), 'group heading');
assert.ok(!matchCommand(batch, 'lo 5518'), 'every word must match');

const g = groupCommands([{ id: 1, group: 'B' }, { id: 2 }, { id: 3, group: 'B' }, { id: 4, group: 'A' }]);
assert.deepEqual(g.map(x => [x.label, x.items.map(i => i.id)]), [['B', [1, 3]], ['', [2]], ['A', [4]]], 'first-seen order');
console.log('command ok');
