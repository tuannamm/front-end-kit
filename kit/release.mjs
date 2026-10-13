// Release @dgtx/ui-frek: bump its version, commit, tag v<version> and push to origin. GitLab CI (.gitlab-ci.yml)
// then checks the kit and publishes the tag to Nexus. Usage: npm run release:alpha | release:patch | release:minor | release:major
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const BUMPS = ['alpha', 'patch', 'minor', 'major'];

/** Next version, same rules as `npm version`: alpha counts up 0.1.1-alpha.0 → .1; a stable bump finishes a pre-release. */
export function nextVersion(current, bump) {
  const m = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/.exec(current);
  if (!m) throw new Error(`not a version: ${current}`);
  const [x, y, z] = m.slice(1, 4).map(Number), pre = m[4];
  if (bump === 'alpha') {
    const n = /^alpha\.(\d+)$/.exec(pre ?? '');
    return n ? `${x}.${y}.${z}-alpha.${+n[1] + 1}` : `${pre ? `${x}.${y}.${z}` : `${x}.${y}.${z + 1}`}-alpha.0`;
  }
  if (bump === 'patch') return pre ? `${x}.${y}.${z}` : `${x}.${y}.${z + 1}`;
  if (bump === 'minor') return pre && z === 0 ? `${x}.${y}.0` : `${x}.${y + 1}.0`;
  if (bump === 'major') return pre && y === 0 && z === 0 ? `${x}.0.0` : `${x + 1}.0.0`;
  throw new Error(`usage: node release.mjs ${BUMPS.join('|')}`);
}

function release(bump) {
  const fail = msg => { console.error(msg); process.exit(1); };
  if (!BUMPS.includes(bump)) fail(`usage: node release.mjs ${BUMPS.join('|')}`);
  // any git failure stops with git's own error (stderr is inherited) instead of a Node stack trace
  const git = (...args) => {
    try { return execFileSync('git', args, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'inherit'] }).trim(); }
    catch { fail(`git ${args[0]} failed (see the error above).`); }
  };

  // only kit/ is released: changes elsewhere (docs/, research/…) may stay uncommitted, they never enter the release commit
  if (git('status', '--porcelain', '--', '.')) fail('kit/ has uncommitted changes. Commit or stash them first: the tag must point at code you pushed.');
  const branch = git('branch', '--show-current');
  if (!branch) fail('HEAD is detached. Check out the branch to release from.');
  git('fetch', '--quiet', 'origin', branch);
  if (git('rev-list', '--count', `HEAD..origin/${branch}`) !== '0') fail(`origin/${branch} has commits you do not have. Pull first.`);

  // edited directly rather than with `npm version`, which also re-resolves the whole lockfile against the registry
  const edit = (file, set) => { const json = JSON.parse(readFileSync(file, 'utf8')); set(json); writeFileSync(file, JSON.stringify(json, null, 2) + '\n'); };
  const version = nextVersion(JSON.parse(readFileSync('packages/ui/package.json', 'utf8')).version, bump);
  edit('packages/ui/package.json', pkg => { pkg.version = version; });
  edit('package-lock.json', lock => { lock.packages['packages/ui'].version = version; });

  const tag = `v${version}`;
  git('add', 'packages/ui/package.json', 'package-lock.json');
  git('commit', '--quiet', '-m', `release: @dgtx/ui-frek ${version}`);
  git('tag', '-a', tag, '-m', `@dgtx/ui-frek ${version}`);
  try {
    execFileSync('git', ['push', '--quiet', '--atomic', 'origin', branch, tag], { stdio: 'inherit' });
  } catch {
    fail(`Push failed; nothing reached origin. Undo locally with: git tag -d ${tag} && git reset --hard HEAD~1`);
  }
  console.log(`Pushed ${tag}. GitLab CI now checks it and publishes @dgtx/ui-frek@${version} to Nexus (CI/CD → Pipelines).`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) release(process.argv[2]);
