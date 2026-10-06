// Self-check for the file helpers behind FileDropzone. Run: npm test -w @dtx/ui
import assert from 'node:assert/strict';
import { acceptLabel, acceptsFile, checkFiles, formatBytes } from './file.ts';

assert.equal(formatBytes(0), '0 B');
assert.equal(formatBytes(1023), '1.023 B'); // vi-VN groups thousands with a dot
assert.equal(formatBytes(1536), '1,5 KB');
assert.equal(formatBytes(20 * 1024 * 1024), '20 MB');

const pdf = { name: 'Hoa-don.PDF', type: 'application/pdf', size: 2048 };
const png = { name: 'scan.png', type: 'image/png', size: 4096 };
const unknown = { name: 'scan.tif', type: '', size: 10 }; // some OSes give no MIME type
assert.ok(acceptsFile(pdf, ''));
assert.ok(acceptsFile(pdf, '.pdf'), 'extension is case-insensitive');
assert.ok(acceptsFile(pdf, 'application/pdf'));
assert.ok(acceptsFile(png, '.pdf, image/*'));
assert.ok(!acceptsFile(pdf, 'image/*'));
assert.ok(acceptsFile(unknown, '.tif,.tiff'));
assert.ok(!acceptsFile(unknown, 'image/*'));

assert.equal(acceptLabel('.pdf,image/*,image/png,.PNG'), 'PDF, ảnh, PNG');
assert.ok(acceptsFile({ name: 'lo-01.ZIP', type: 'application/x-zip-compressed' }, '.pdf,.zip'), 'zip MIME differs per OS; the extension decides');
assert.equal(acceptLabel('.pdf,.zip'), 'PDF, ZIP');

const r = checkFiles([pdf, png, unknown], { accept: '.pdf,image/*', maxSize: 3000 });
assert.deepEqual(r.accepted, [pdf]);
assert.deepEqual(r.rejected.map(x => x.file), [png, unknown]);
assert.match(r.rejected[0].reason, /vượt giới hạn/);
assert.match(r.rejected[1].reason, /Chỉ nhận PDF, ảnh/);
const single = checkFiles([pdf, pdf], { multiple: false });
assert.equal(single.accepted.length, 1);
assert.equal(single.rejected[0].reason, 'Chỉ chọn được 1 tệp.');

console.log('file helpers ok');
