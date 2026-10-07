// Rendered-contrast check: opens every catalog entry in light and dark and runs axe-core's
// color-contrast rule on what the browser actually paints. Catches combinations the token test
// cannot see (a theme-aware badge on a fixed dark card, gradient text on a light page…).
// Elements that intentionally show a failing pair (the Contrast entry's swatches) carry data-a11y-demo and are skipped.
// Usage: npm run dev (in another shell), then: npm run test:a11y   [BASE=http://host:5173]
import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const BASE = process.env.BASE ?? 'http://localhost:5173';
// Use Playwright's own browser if installed, otherwise any cached headless shell.
const cache = join(homedir(), '.cache/ms-playwright');
const fallback = existsSync(cache) && readdirSync(cache).filter(d => d.startsWith('chromium_headless_shell')).sort().reverse()
  .map(d => [join(cache, d, 'chrome-linux/headless_shell'), join(cache, d, 'chrome-headless-shell-linux64/chrome-headless-shell')]).flat().find(existsSync);
const browser = await chromium.launch().catch(() => chromium.launch({ executablePath: fallback }));
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const page = await context.newPage();

await page.goto(`${BASE}/#/catalog`);
const ids = await page.$$eval('aside a[href^="#/catalog/"]', as => as.map(a => a.getAttribute('href').replace('#/', '')));
ids.push('website', 'app', 'poc'); // the demo pages too
let bothThemes = 0; // guards against the switcher's label changing and the dark copies silently going unchecked
const found = new Map(); // `${entry} | ${message}` → { themes, count, example }
for (const theme of ['light', 'dark']) {
  for (const id of ids) {
    await page.goto(`${BASE}/#/${id}`);
    await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
    // catalog demos default to light only: show both so the dark copy of every demo is checked too
    // (entries without demos, e.g. planned ones, have no switcher)
    const demoTheme = page.getByRole('group', { name: 'Giao diện của ví dụ' });
    if (await demoTheme.count()) { await demoTheme.getByText('Sáng + Tối').click(); bothThemes++; }
    await page.waitForTimeout(400); // fonts, measured boxes, reveal
    const { violations } = await new AxeBuilder({ page }).withRules(['color-contrast']).exclude('[data-a11y-demo]').analyze();
    for (const v of violations) for (const n of v.nodes) {
      const msg = (n.any[0]?.message ?? v.help).replace(/ \(font size.*$/, '').replace(/^Element has insufficient color contrast of /, '');
      const key = `${id} | ${msg}`;
      const f = found.get(key) ?? { themes: new Set(), count: 0, example: n.target.join(' ').split(' > ').slice(-2).join(' > ') };
      f.themes.add(theme); f.count++; found.set(key, f);
    }
  }
}
await browser.close();
if (!bothThemes) throw new Error('Demo theme switcher not found: dark copies of the demos were not checked');
for (const [key, f] of found) console.error(`✗ ${key}  [${[...f.themes].join('+')}, ${f.count}×]  e.g. ${f.example}`);
console.log(`${ids.length} entries × 2 themes checked, ${found.size} distinct contrast problem(s)`);
process.exit(found.size ? 1 : 0);
