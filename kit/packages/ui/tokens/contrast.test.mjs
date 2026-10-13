// Fails the build if any semantic text/background pair in theme.css drops below WCAG 2.2 AA.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const css = readFileSync(new URL('./theme.css', import.meta.url), 'utf8');
const block = sel => {
  const i = css.indexOf(sel); assert.ok(i >= 0, `missing block ${sel}`);
  const body = css.slice(css.indexOf('{', i) + 1, css.indexOf('}', i));
  return Object.fromEntries([...body.matchAll(/(--dtx-[\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));
};
const light = block(':root, [data-theme="light"] {');
const darkMedia = block(':root:not([data-theme="light"]) {');
const dark = block('\n[data-theme="dark"] {');
assert.deepEqual(darkMedia, dark, 'the two dark blocks in theme.css have drifted apart');

const parse = v => {
  let m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) return [...[0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16)), 1];
  m = v.match(/^rgb\((\d+) (\d+) (\d+) \/ ([\d.]+)\)$/);
  if (m) return [+m[1], +m[2], +m[3], +m[4]];
  throw new Error(`unparsed colour ${v}`);
};
const over = (fg, bg) => fg.slice(0, 3).map((c, i) => c * fg[3] + bg[i] * (1 - fg[3])); // alpha-blend
const lum = rgb => { const l = rgb.map(c => { c /= 255; return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }); return .2126 * l[0] + .7152 * l[1] + .0722 * l[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };

const TONES = { brand: [37, 130, 215], ok: [165, 203, 31], warn: [246, 183, 30], err: [217, 58, 58], neutral: [110, 111, 114], violet: [145, 39, 214] };
let failures = 0, checked = 0;
for (const [name, t] of [['light', light], ['dark', dark]]) {
  const c = k => parse(t[k] ?? light[k]);
  const surfaces = ['--dtx-bg', '--dtx-surface', '--dtx-surface-2'].map(k => [k, c(k).slice(0, 3)]);
  const pairs = [];
  for (const [sk, s] of surfaces) {
    pairs.push(['--dtx-fg', sk, c('--dtx-fg').slice(0, 3), s, 4.5]);
    pairs.push(['--dtx-fg-muted', sk, c('--dtx-fg-muted').slice(0, 3), s, 4.5]);
    pairs.push(['--dtx-link', sk, c('--dtx-link').slice(0, 3), s, 4.5]);
    pairs.push(['--dtx-focus', sk, c('--dtx-focus').slice(0, 3), s, 3]);     // 1.4.11 non-text
    for (const [tone, rgb] of Object.entries(TONES)) {                       // soft badge: 13% tint over surface
      const tint = over([...rgb, .13], s);
      pairs.push([`--dtx-tone-${tone}`, `${tone} tint on ${sk}`, c(`--dtx-tone-${tone}`).slice(0, 3), tint, 4.5]);
    }
  }
  pairs.push(['--dtx-on-primary', '--dtx-primary-strong', c('--dtx-on-primary').slice(0, 3), c('--dtx-primary-strong').slice(0, 3), 4.5]);
  pairs.push(['--dtx-on-primary', '--dtx-primary (large text only)', c('--dtx-on-primary').slice(0, 3), c('--dtx-primary').slice(0, 3), 3]);
  for (const [f, b, fg, bg, min] of pairs) {
    checked++;
    const r = ratio(fg, bg);
    if (r < min) { failures++; console.error(`✗ ${name}: ${f} on ${b} = ${r.toFixed(2)} (needs ${min})`); }
  }
}
console.log(`${checked} pairs checked, ${failures} below AA`);
process.exit(failures ? 1 : 0);
