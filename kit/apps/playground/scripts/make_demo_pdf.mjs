// Builds public/demo/hop-dong-mau.pdf: a synthetic 4-page contract (3 portrait A4 + 1 landscape) for the
// PdfViewer catalog entry. Invented names and numbers only, never real samples. Roboto is embedded.
// Usage (from kit/): node apps/playground/scripts/make_demo_pdf.mjs
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '../public/demo/hop-dong-mau.pdf');
// inlined: a page from setContent may not load file:// fonts
const font = sub => `data:font/woff2;base64,${readFileSync(join(here, `../../../node_modules/@fontsource-variable/roboto/files/roboto-${sub}-wght-normal.woff2`)).toString('base64')}`;
const cache = join(homedir(), '.cache/ms-playwright');
const fallback = existsSync(cache) && readdirSync(cache).filter(d => d.startsWith('chromium_headless_shell')).sort().reverse()
  .map(d => [join(cache, d, 'chrome-linux/headless_shell'), join(cache, d, 'chrome-headless-shell-linux64/chrome-headless-shell')]).flat().find(existsSync);

const clauses = [
  ['Điều 1. Phạm vi dịch vụ', 'Bên B số hoá 128.000 trang hồ sơ lưu trữ của Bên A: tiếp nhận, làm sạch, quét màu 300 dpi, nhận dạng ký tự (OCR) tiếng Việt và trích xuất 14 trường thông tin cho mỗi hồ sơ theo Phụ lục 01.'],
  ['Điều 2. Thời hạn thực hiện', 'Từ ngày 01/11/2026 đến hết ngày 30/04/2027. Bên B bàn giao theo từng lô 8.000 trang, mỗi lô trong tối đa 10 ngày làm việc kể từ khi nhận đủ hồ sơ gốc.'],
  ['Điều 3. Chất lượng', 'Độ chính xác trường thông tin sau kiểm tra (QC) đạt tối thiểu 99,5%. Lô không đạt được Bên B xử lý lại miễn phí trong 5 ngày làm việc.'],
  ['Điều 4. Bảo mật', 'Hồ sơ chỉ được xử lý tại cơ sở của Bên B, trên hệ thống không kết nối Internet. Bên B không sao chép, lưu giữ hay sử dụng dữ liệu cho bất kỳ mục đích nào khác.'],
  ['Điều 5. Giá trị hợp đồng', 'Tổng giá trị tạm tính 1.536.000.000 đồng (đã gồm thuế GTGT 8%), thanh toán theo từng lô được nghiệm thu, đơn giá chi tiết tại Phụ lục 02.'],
  ['Điều 6. Nghiệm thu', 'Bên A kiểm tra mẫu ngẫu nhiên 5% số trang của mỗi lô trong 5 ngày làm việc. Quá thời hạn trên mà không có phản hồi, lô được xem như đã nghiệm thu.'],
];
const rows = [
  ['Quét màu 300 dpi', 'trang', '128.000', '2.400'], ['Làm sạch, chỉnh nghiêng', 'trang', '128.000', '800'],
  ['OCR tiếng Việt', 'trang', '128.000', '1.900'], ['Trích xuất 14 trường', 'hồ sơ', '16.000', '58.000'],
  ['Kiểm tra chất lượng lần 2', 'hồ sơ', '16.000', '12.500'], ['Đóng gói, bàn giao', 'lô', '16', '1.500.000'],
];
const plan = ['Lô 01', 'Lô 02', 'Lô 03', 'Lô 04', 'Lô 05', 'Lô 06', 'Lô 07', 'Lô 08'];

const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><style>
@font-face { font-family: Roboto; src: url(${font('vietnamese')}) format('woff2'); font-weight: 100 900; unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB; }
@font-face { font-family: Roboto; src: url(${font('latin')}) format('woff2'); font-weight: 100 900; }
@page { size: A4; margin: 22mm 20mm; }
@page wide { size: A4 landscape; margin: 16mm 18mm; }
body { font: 11pt/1.55 Roboto, Arial, sans-serif; color: #1c2230; margin: 0; }
h1 { font-size: 17pt; text-align: center; margin: 6mm 0 2mm; } h2 { font-size: 12pt; margin: 6mm 0 1mm; }
.c { text-align: center; } .muted { color: #5a6070; font-size: 9.5pt; }
table { width: 100%; border-collapse: collapse; font-size: 10pt; } th, td { border: .6pt solid #9aa3b5; padding: 2mm 3mm; text-align: left; }
th { background: #eef2f8; } td.n { text-align: right; font-variant-numeric: tabular-nums; }
.break { break-before: page; } .wide { page: wide; break-before: page; }
.sign { display: flex; justify-content: space-around; margin-top: 18mm; text-align: center; font-weight: 600; }
.bar { height: 4mm; background: #2582d7; border-radius: 1mm; }
</style></head><body>
<p class="c"><b>CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM</b><br>Độc lập – Tự do – Hạnh phúc</p>
<h1>HỢP ĐỒNG DỊCH VỤ SỐ HOÁ TÀI LIỆU</h1>
<p class="c muted">Số: 27/2026/HĐDV · Tài liệu mẫu, dữ liệu giả lập</p>
<p><b>Bên A:</b> Công ty TNHH Lưu trữ Minh Phát, 12 Nguyễn Văn Linh, Q.7, TP. Hồ Chí Minh.<br>
<b>Bên B:</b> Công ty Dịch vụ Số hoá An Khang, 88 Trần Hưng Đạo, Q.1, TP. Hồ Chí Minh.</p>
${clauses.slice(0, 4).map(([h, p]) => `<h2>${h}</h2><p>${p}</p>`).join('')}
<div class="break"></div>
${clauses.slice(4).map(([h, p]) => `<h2>${h}</h2><p>${p}</p>`).join('')}
<h2>Điều 7. Điều khoản chung</h2><p>Hợp đồng lập thành 04 bản có giá trị như nhau, mỗi bên giữ 02 bản, có hiệu lực từ ngày ký.</p>
<div class="sign"><div>ĐẠI DIỆN BÊN A<br><span class="muted">(Ký, ghi rõ họ tên)</span></div><div>ĐẠI DIỆN BÊN B<br><span class="muted">(Ký, ghi rõ họ tên)</span></div></div>
<div class="break"></div>
<h1>PHỤ LỤC 02 · BẢNG ĐƠN GIÁ</h1>
<table><thead><tr><th>Hạng mục</th><th>Đơn vị</th><th>Khối lượng</th><th>Đơn giá (đồng)</th></tr></thead>
<tbody>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td class="n">${r[2]}</td><td class="n">${r[3]}</td></tr>`).join('')}</tbody></table>
<p class="muted">Đơn giá đã gồm thuế GTGT 8%.</p>
<section class="wide">
<h1>PHỤ LỤC 03 · TIẾN ĐỘ BÀN GIAO</h1>
<table><thead><tr><th style="width:18%">Lô</th>${['Th11', 'Th12', 'Th1', 'Th2', 'Th3', 'Th4'].map(m => `<th>${m}</th>`).join('')}</tr></thead>
<tbody>${plan.map((l, i) => `<tr><td>${l} · 8.000 trang</td>${[0, 1, 2, 3, 4, 5].map(m => `<td>${m === Math.floor(i * .75) ? '<div class="bar"></div>' : ''}</td>`).join('')}</tr>`).join('')}</tbody></table>
<p class="muted">Trang ngang: kiểm tra trình xem với khổ trang khác nhau trong cùng một file.</p>
</section></body></html>`;

const browser = await chromium.launch().catch(() => chromium.launch({ executablePath: fallback }));
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
mkdirSync(dirname(out), { recursive: true });
await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
await browser.close();
console.log('wrote', out);
