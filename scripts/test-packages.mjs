// Packs every published package exactly as `npm publish` would, installs the tarballs into an empty
// project, bundles a plain page and a React page from them, and checks both in real browsers.
// Run after `npm run build`:  node scripts/test-packages.mjs [chromium,webkit]
import { execSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createServer } from 'node:http';

const root = resolve(import.meta.dirname, '..');
const browsers = (process.argv[2] ?? 'chromium,webkit').split(',');
const sh = (cmd, cwd) => execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'inherit'] }).toString().trim();
const work = mkdtempSync(join(tmpdir(), 'commmerce-pkg-'));
const tars = join(work, 'tarballs'); mkdirSync(tars);
const names = ['tokens', 'icons', 'ui', 'ui-react', 'app-bridge', 'review'];

// 1. Pack, and check each tarball has what the package promises.
const packed = {};
for (const n of names) {
  const info = JSON.parse(sh(`npm pack --json --pack-destination ${tars}`, join(root, 'packages', n)))[0];
  const files = info.files.map((f) => f.path);
  for (const must of ['package.json', 'README.md', 'LICENSE.md']) if (!files.includes(must)) throw new Error(`${info.name}: ${must} missing from the package`);
  if (files.some((f) => f.startsWith('src/') || f.startsWith('test/'))) throw new Error(`${info.name}: source or tests leaked into the package`);
  packed[n] = join(tars, info.filename);
  console.log(`packed ${info.name}@${info.version}: ${files.length} files, ${(info.size / 1024).toFixed(1)} kB`);
}

// 2. A fresh app that depends only on the tarballs (plus React for the wrapper test).
const app = join(work, 'app'); mkdirSync(app);
writeFileSync(join(app, 'package.json'), JSON.stringify({
  name: 'consumer-app', private: true, type: 'module',
  dependencies: { ...Object.fromEntries(names.map((n) => [`@commmerce/${n}`, `file:${packed[n]}`])), react: '18.3.1', 'react-dom': '18.3.1' },
}, null, 2));
sh('npm install --no-audit --no-fund --loglevel=error', app);

writeFileSync(join(app, 'plain.js'), `
import '@commmerce/ui';
import { tokens } from '@commmerce/tokens';
import { iconNames } from '@commmerce/icons';
import { createApp, createHost, verifySessionToken } from '@commmerce/app-bridge';
const form = document.querySelector('form');
form.addEventListener('submit', (e) => { e.preventDefault(); window.result = Object.fromEntries(new FormData(form)); });
window.checks = { token: tokens.bgSurface, icons: iconNames.length, bridge: [createApp, createHost, verifySessionToken].every((f) => typeof f === 'function') };
`);
writeFileSync(join(app, 'react.jsx'), `
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, TextField, Checkbox } from '@commmerce/ui-react';
function App() {
  const [title, setTitle] = useState('');
  const [track, setTrack] = useState(false);
  const [saved, setSaved] = useState('');
  return (
    <div>
      <TextField id="t" label="Title" value={title} onInput={(e) => setTitle(e.currentTarget.value)} />
      <Checkbox id="c" label="Track quantity" checked={track} onChange={(e) => setTrack(e.currentTarget.checked)} />
      <Button id="b" variant="primary" onClick={() => setSaved(title + '|' + track)}>Save</Button>
      <output id="out">{saved}</output>
    </div>
  );
}
createRoot(document.getElementById('root')).render(<App />);
`);
// @commmerce/review: its bin runs from the installed tarball and has the bundled component data.
const reviewBin = join(app, 'node_modules', '.bin', 'commmerce-review');
if (sh(`${reviewBin} --version`, app) !== JSON.parse(readFileSync(join(root, 'packages/review/package.json'), 'utf8')).version) throw new Error('@commmerce/review: --version differs from its package.json');
if (!existsSync(join(app, 'node_modules/@commmerce/review/dist/components.json'))) throw new Error('@commmerce/review: dist/components.json missing from the package');
console.log('@commmerce/review: bin runs, component data bundled');

const esbuild = join(root, 'node_modules', '.bin', 'esbuild');
sh(`${esbuild} plain.js --bundle --format=esm --outfile=dist/plain.js --log-level=error`, app);
sh(`${esbuild} react.jsx --bundle --format=esm --jsx=automatic --outfile=dist/react.js --log-level=error --define:process.env.NODE_ENV='"production"'`, app);
copyFileSync(join(app, 'node_modules/@commmerce/tokens/dist/tokens.css'), join(app, 'dist/tokens.css'));
const page = (script, body) => `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="tokens.css"></head><body>${body}<script type="module" src="${script}"></script></body></html>`;
writeFileSync(join(app, 'dist/plain.html'), page('plain.js', `<form><cm-text-field name="title" label="Title" value="Blue kurta" required></cm-text-field><cm-checkbox name="track" value="yes" checked label="Track"></cm-checkbox><cm-button type="submit" variant="primary">Save</cm-button></form>`));
writeFileSync(join(app, 'dist/react.html'), page('react.js', '<div id="root"></div>'));

// 3. Serve and test in each browser.
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const srv = createServer((q, r) => { const f = join(app, 'dist', q.url.split('?')[0]); if (!existsSync(f)) { r.statusCode = 404; return r.end(); } r.setHeader('content-type', types[f.slice(f.lastIndexOf('.'))] ?? 'text/plain'); r.end(readFileSync(f)); }).listen(0);
const port = srv.address().port;
const pw = await import(join(root, 'node_modules/playwright/index.mjs'));
let failed = 0;
for (const name of browsers) {
  const b = await pw[name].launch(name === 'chromium' && process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const p = await b.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(`http://localhost:${port}/plain.html`); await p.waitForFunction(() => window.checks && customElements.get('cm-button'));
  await p.click('cm-button'); await p.waitForFunction(() => window.result);
  const plain = await p.evaluate(() => ({ ...window.checks, result: window.result }));
  await p.goto(`http://localhost:${port}/react.html`); await p.waitForSelector('#t');
  await p.locator('#t').locator('input').fill('Linen shirt');
  await p.locator('#c').locator('input').check();
  await p.click('#b');
  await p.waitForFunction(() => document.getElementById('out').textContent !== '');
  const react = await p.textContent('#out');
  const ok = plain.result.title === 'Blue kurta' && plain.result.track === 'yes' && plain.token === 'var(--cm-bg-surface)' && plain.icons > 30 && plain.bridge === true && react === 'Linen shirt|true' && !errs.length;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name} ${b.version()} | plain: ${JSON.stringify(plain)} | react: ${react}${errs.length ? ' | errors: ' + errs.join('; ') : ''}`);
  await b.close();
}
srv.close();
if (failed) { console.error(`packages: ${failed} browser(s) failed`); process.exit(1); }
console.log(`packages: installable and working from tarballs (${work})`);
