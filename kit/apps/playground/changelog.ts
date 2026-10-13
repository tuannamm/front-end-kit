// Vite plugin: the kit's change history, read from git at build time and served as `virtual:changelog`.
// Nothing is kept by hand: every commit that touched kit/packages/ shows up, grouped by the component it changed.
// Exported names are read from the files on disk now, so the page can link a unit to its catalog entries.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';

const ID = 'virtual:changelog';
const PACKAGES = join(import.meta.dirname, '../../packages');

// shape mirrored in src/changelog.d.ts, which the app compiles against
type Commit = { hash: string; date: string; subject: string; units: { label: string; names: string[] }[] };

/** PascalCase names a file exports: the components and types a catalog entry imports. */
const exportsOf = (file: string) => [...readFileSync(file, 'utf8').matchAll(/export (?:function|const|class|type) ([A-Z]\w*)/g)].map(m => m[1]);
const isDir = (p: string) => existsSync(p) && statSync(p).isDirectory();

/** npm name of a kit/packages/ folder, from its package.json (folder name for a package that no longer exists). */
const packageName = (pkg: string): string => {
  const file = join(PACKAGES, pkg, 'package.json');
  return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')).name : pkg;
};

/** A path under kit/packages/ → the unit it belongs to: a core folder, a file in a flat folder, or a folder's shared files. */
export function unitOf(path: string): string {
  const [pkg, src, ...rest] = path.split('/');
  // tokens were their own package before they moved into ui/tokens/
  if (pkg === 'tokens' || (pkg === 'ui' && src === 'tokens')) return 'tokens';
  if (pkg !== 'ui' || src !== 'src' || !rest.length) return packageName(pkg);
  // core components live in one folder each (history from before that split has core/<name>.tsx, handled below)
  if (rest[0] === 'core' && rest.length > 2) return `core/${rest[1]}`;
  const dir = rest.slice(0, -1).join('/');
  const file = rest.at(-1)!;
  const stem = file.replace(/(\.check)?\.\w+$/, '');
  // index, README, assets and the folder's own stylesheet belong to the folder as a whole
  const shared = !/\.(tsx?|css)$/.test(file) || ['index', dir.split('/').at(-1)].includes(stem);
  return !dir ? packageName('ui') : shared ? dir : `${dir}/${stem}`;
}

function namesOf(unit: string): string[] {
  const base = join(PACKAGES, 'ui/src', unit);
  // a core folder is one component; any other folder holds several, so its shared files name none of them
  const files = unit.startsWith('core/') && isDir(base) ? readdirSync(base).filter(f => /\.tsx?$/.test(f) && !f.includes('.check.')).map(f => join(base, f))
    : [`${base}.tsx`, `${base}.ts`].filter(existsSync);
  return [...new Set(files.flatMap(exportsOf))];
}

function readHistory(): Commit[] | null {
  let log: string;
  try {
    // ':(top)' keeps the pathspec repo-relative; safe.directory lets a container read a .git owned by another user
    log = execFileSync('git', ['-c', 'safe.directory=*', 'log', '--format=%x1e%h%x1f%aI%x1f%s', '--name-only', '--', ':(top)kit/packages'],
      { cwd: PACKAGES, encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore'] });
  } catch { return null; }
  const names = new Map<string, string[]>();
  return log.split('\x1e').filter(Boolean).map(rec => {
    const [head, ...files] = rec.split('\n');
    const [hash, date, subject] = head.split('\x1f');
    const labels = [...new Set(files.filter(Boolean).map(f => unitOf(f.replace(/^kit\/packages\//, ''))))].sort();
    const units = labels.map(label => {
      if (!names.has(label)) names.set(label, namesOf(label));
      return { label, names: names.get(label)! };
    });
    return { hash, date, subject, units };
  });
}

export function changelog(): Plugin {
  return {
    name: 'dtx-changelog',
    resolveId: id => (id === ID ? `\0${ID}` : undefined),
    // ponytail: read once per dev-server start; restart `npm run dev` to see new commits
    load: id => (id === `\0${ID}` ? `export const changelog = ${JSON.stringify(readHistory())};` : undefined),
  };
}
