// `check` against local pages in real Chromium: a page with problems, a page built with Commmerce UI.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkPage } from '../lib/check.mjs';
import { cli, UI_CDN, TOKENS_CSS } from './harness.mjs';

let site;
const BAD = `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width"><title>Bad</title></head><body>
  <div style="width:900px">Too wide</div>
  <p style="font-size:10px">Tiny print</p>
  <button style="width:16px;height:16px;padding:0">x</button>
  <select><option>One</option></select>
  <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==">
  <cm-not-a-thing></cm-not-a-thing>
</body></html>`;
const GOOD = `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width"><title>Orders</title>
  <link rel="stylesheet" href="/tokens.css"><script type="module" src="/commmerceui/v/1.0.0/cdn.js"></script></head>
  <body style="margin:0;font-family:sans-serif"><main style="padding:16px">
  <h1>Orders</h1>
  <cm-text-field label="Search orders"></cm-text-field>
  <cm-button variant="primary">Create order</cm-button>
  </main></body></html>`;

before(async () => {
  // The built cdn.js is served at a hosted-build address (/commmerceui/v/1.0.0/) so the version is detected.
  const { createServer } = await import('node:http');
  const assets = createServer((req, res) => {
    if (req.url.endsWith('cdn.js')) { res.writeHead(200, { 'content-type': 'text/javascript' }); return res.end(readFileSync(UI_CDN)); }
    if (req.url.endsWith('tokens.css')) { res.writeHead(200, { 'content-type': 'text/css' }); return res.end(readFileSync(TOKENS_CSS)); }
    if (req.url === '/bad') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(BAD); }
    if (req.url === '/good') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(GOOD); }
    res.writeHead(404); res.end();
  });
  await new Promise((r) => assets.listen(0, '127.0.0.1', r));
  site = { base: `http://127.0.0.1:${assets.address().port}`, close: () => assets.close() };
});
after(() => site.close());

test('finds the blockers and majors on a bad page', async () => {
  const r = await checkPage(`${site.base}/bad`);
  const checks = (sev) => r.findings.filter((f) => f.severity === sev).map((f) => f.check);
  assert.equal(r.ok, false);
  assert.ok(checks('blocker').includes('sideways-scroll'));
  assert.ok(checks('blocker').includes('commmerce-ui'), 'cm-not-a-thing is not defined');
  assert.ok(r.findings.some((f) => f.check === 'axe' && /image-alt/.test(f.problem)));
  assert.ok(checks('major').includes('small-text'));
  assert.ok(checks('major').includes('target-size'));
  const native = r.findings.filter((f) => f.check === 'native-control').map((f) => f.component).sort();
  assert.deepEqual(native, ['cm-button', 'cm-select']);
  assert.equal(r.findings.find((f) => f.component === 'cm-select').docs_url, 'https://commmerce.com/commmerceui/#components--select');
  assert.equal(r.ui.present, false);
  assert.deepEqual(r.widths, [320, 390, 768, 1280]);
  assert.ok(r.findings.filter((f) => f.check === 'sideways-scroll').length >= 3, 'reported per width');
});

test('a Commmerce UI page passes and its version is detected', async () => {
  const r = await checkPage(`${site.base}/good`);
  assert.equal(r.ui.present, true);
  assert.equal(r.ui.version, '1.0.0');
  assert.ok(r.ui.components_used.includes('cm-button'));
  assert.deepEqual(r.findings.filter((f) => f.severity === 'blocker'), [], JSON.stringify(r.findings, null, 1));
  assert.ok(r.findings.some((f) => f.check === 'commmerce-ui' && f.severity === 'minor' && /older than/.test(f.problem)));
});

test('CLI: exit 1 on blockers, 0 without; --json; --strict; unreachable page', async () => {
  const bad = await cli(['check', `${site.base}/bad`, '--widths', '390', '--json']);
  assert.equal(bad.code, 1);
  assert.equal(JSON.parse(bad.stdout).ok, false);
  const good = await cli(['check', `${site.base}/good`, '--widths', '1280']);
  assert.equal(good.code, 0, good.stdout + good.stderr);
  assert.match(good.stdout, /Commmerce UI: yes/);
  const text = await cli(['check', `${site.base}/bad`, '--widths', '390']);
  assert.match(text.stdout, /BLOCKER/); assert.match(text.stdout, /fix: /);
  const down = await cli(['check', 'http://127.0.0.1:9/', '--widths', '390', '--json']);
  assert.equal(down.code, 1);
  assert.equal(JSON.parse(down.stdout).findings[0].check, 'load');
});
