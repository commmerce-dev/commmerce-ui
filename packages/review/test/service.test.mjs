// CLI and stdio MCP server against a review service: the real one when COMMMERCE_REVIEW_SERVICE_DIR is set (end to
// end), otherwise the in-memory fake (CI).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startService, startStatic, admin, cli, PNG } from './harness.mjs';

let svc, site, env, dir;
const PAGE = (body) => `<!doctype html><html lang="en"><head><title>p</title></head><body><main><h1>Orders</h1>${body}</main></body></html>`;

before(async () => {
  svc = await startService();
  site = await startStatic({ pages: { '/orders': PAGE('<p>Asha Rao, demo@example.com</p>'), '/customers': PAGE('<p>Ravi, ravi.k@gmail.com, +91 98765 43210</p>') } });
  env = { COMMMERCE_REVIEW_KEY: svc.teamKey, COMMMERCE_REVIEW_URL: `${svc.base}/v1` };
  dir = mkdtempSync(join(tmpdir(), 'review-cli-'));
  console.log(`# review service: ${svc.kind}`);
});
after(() => { svc.close(); site.close(); });

test('no key: clear message, exit 2', async () => {
  const r = await cli(['status', 'rv_x'], { COMMMERCE_REVIEW_KEY: '', COMMMERCE_REVIEW_URL: `${svc.base}/v1` });
  assert.equal(r.code, 2); assert.match(r.stderr, /COMMMERCE_REVIEW_KEY.*ui@commmerce\.com/s);
  const bad = await cli(['status', 'rv_x'], { ...env, COMMMERCE_REVIEW_KEY: 'cmr_wrong' });
  assert.equal(bad.code, 2); assert.match(bad.stderr, /not valid/);
});

test('help and version; unknown command exits 2', async () => {
  const h = await cli(['help']);
  assert.equal(h.code, 0);
  assert.match(h.stdout, /PRIVATE BY DEFAULT/); assert.match(h.stdout, /ui@commmerce\.com/); assert.match(h.stdout, /GitHub issues are optional/);
  assert.match((await cli(['--version'])).stdout, /^\d+\.\d+\.\d+/);
  assert.equal((await cli(['frobnicate'])).code, 2);
});

test('submit takes screenshots at 390/768/1280, then status and wait follow the review', async () => {
  const sub = await cli(['submit', site.base, '--screen', 'orders=/orders', '--app', 'CLI test', '--question', 'Table ok?', '--json'], env);
  assert.equal(sub.code, 0, sub.stderr);
  const { id } = JSON.parse(sub.stdout);
  assert.match(id, /^rv_/);
  assert.match(sub.stderr, /orders @390px[\s\S]*orders @768px[\s\S]*orders @1280px/);
  const st = await cli(['status', id, '--json'], env);
  assert.equal(JSON.parse(st.stdout).status, 'queued');
  if (svc.kind === 'real') {
    const item = await admin(svc, 'GET', `/v1/admin/items/${id}`);
    assert.deepEqual(item.screens.map((s) => s.width), [390, 768, 1280]);
    assert.ok(item.screens.every((s) => s.image && Buffer.from(s.image, 'base64').subarray(1, 4).toString() === 'PNG'));
    assert.deepEqual(item.payload.questions, ['Table ok?']);
  }
  await admin(svc, 'POST', `/v1/admin/items/${id}/claim`, {});
  await admin(svc, 'POST', `/v1/admin/items/${id}/result`, { status: 'done', verdict: 'changes-needed', summary: 'One fix.', findings: [{ id: 'f1', screen: 'orders', width: 390, severity: 'major', element: 'button.save', problem: 'Native button', fix: 'Use <cm-button variant="primary">', component: 'cm-button', docs_url: 'https://commmerce.com/commmerceui/#components--button' }] });
  const w = await cli(['wait', id, '--timeout', '5'], env);
  assert.equal(w.code, 1, 'changes needed exits 1');
  assert.match(w.stdout, /\[major\] f1 orders @390px/); assert.match(w.stdout, /docs: https:\/\/commmerce\.com\/commmerceui\/#components--button/);
});

test('submit refuses visible emails/phones without --yes', async () => {
  const r = await cli(['submit', `${site.base}/customers`, '--app', 'CLI test'], env);
  assert.equal(r.code, 2);
  assert.match(r.stderr, /demo data only/); assert.match(r.stderr, /Not sent/);
  assert.ok(!r.stderr.includes('ravi.k@gmail.com'), 'the warning masks what it found');
  const yes = await cli(['submit', `${site.base}/customers`, '--app', 'CLI test', '--yes', '--json'], env);
  assert.equal(yes.code, 0, yes.stderr);
});

test('submit --images, request-component, feedback', async () => {
  const a = join(dir, 'a.png'), b = join(dir, 'b.png');
  writeFileSync(a, Buffer.from(PNG, 'base64')); writeFileSync(b, Buffer.from(PNG, 'base64'));
  const r = await cli(['submit', '--images', `orders@390=${a}`, b, '--app', 'CLI test', '--json'], env);
  assert.equal(r.code, 0, r.stderr); assert.match(JSON.parse(r.stdout).id, /^rv_/);
  assert.match(r.stderr, /orders @390px[\s\S]*b @1280px/);
  assert.match(r.stderr, /demo data only/);
  const cr = await cli(['request-component', '--name', 'Swimlanes', '--need', 'Group columns', '--app', 'CRM'], env);
  assert.equal(cr.code, 0); assert.match(cr.stdout, /Requested privately: cr_/);
  const fb = await cli(['feedback', '--kind', 'bug', '--title', 'Select clips', '--body', 'At 320px'], env);
  assert.equal(fb.code, 0); assert.match(fb.stdout, /Sent privately: fb_/);
  assert.equal((await cli(['feedback', '--kind', 'bug'], env)).code, 2);
});

test('stdio MCP server: tools work through the protocol', async () => {
  const child = spawn(process.execPath, [join(import.meta.dirname, '..', 'bin', 'commmerce-review.mjs'), 'mcp'], { env: { ...process.env, ...env } });
  let buf = ''; const waiting = new Map();
  child.stdout.on('data', (d) => { buf += d; let i; while ((i = buf.indexOf('\n')) >= 0) { const m = JSON.parse(buf.slice(0, i)); buf = buf.slice(i + 1); waiting.get(m.id)?.(m); } });
  let n = 0;
  const rpc = (method, params) => new Promise((r) => { const id = ++n; waiting.set(id, r); child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n'); });
  const call = async (name, args) => (await rpc('tools/call', { name, arguments: args })).result;
  try {
    const init = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '1' } });
    assert.equal(init.result.serverInfo.name, 'commmerce-review');
    assert.match(init.result.instructions, /BEFORE building/); assert.match(init.result.instructions, /PRIVATE/);
    child.stdin.write('{"jsonrpc":"2.0","method":"notifications/initialized"}\n');
    const tools = (await rpc('tools/list')).result.tools;
    assert.deepEqual(tools.map((t) => t.name), ['search_components', 'get_component', 'check_page', 'submit_review', 'get_review', 'request_component', 'send_feedback']);
    assert.match(tools.find((t) => t.name === 'search_components').description, /look components up before building/);
    assert.match(tools.find((t) => t.name === 'submit_review').description, /PRIVATE/);
    assert.equal(JSON.parse((await call('search_components', { query: 'save bar' })).content[0].text).components[0].tag, 'cm-save-bar');
    assert.equal(JSON.parse((await call('get_component', { name: 'cm-modal' })).content[0].text).tag, 'cm-modal');
    const chk = JSON.parse((await call('check_page', { url: `${site.base}/orders`, widths: [390] })).content[0].text);
    assert.equal(chk.ui.present, false);
    const refused = await call('submit_review', { app: 'MCP test', url: `${site.base}/customers` });
    assert.equal(refused.isError, true); assert.match(refused.content[0].text, /Not sent/);
    const sub = JSON.parse((await call('submit_review', { app: 'MCP test', url: site.base, screens: [{ name: 'orders', path: '/orders' }] })).content[0].text);
    assert.match(sub.id, /^rv_/); assert.equal(sub.images.length, 3);
    assert.equal(JSON.parse((await call('get_review', { id: sub.id })).content[0].text).status, 'queued');
    assert.match(JSON.parse((await call('request_component', { name: 'X', need: 'Y', app: 'Z' })).content[0].text).id, /^cr_/);
    assert.match(JSON.parse((await call('send_feedback', { kind: 'question', title: 'Q', body: 'B' })).content[0].text).id, /^fb_/);
  } finally { child.kill(); }
});
