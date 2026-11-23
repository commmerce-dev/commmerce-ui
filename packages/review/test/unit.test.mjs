// Component data, search, personal-data scan, MCP protocol core: no browser, no network.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import { components, UI_VERSION } from '../lib/components.mjs';
import { search, find, docsUrl } from '../lib/components-index.mjs';
import { findPersonalData, mask } from '../lib/shoot.mjs';
import { createMcp, serveStdio } from '../lib/mcp-protocol.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './harness.mjs';

test('the bundle has every documented component with its API and the shared version', async () => {
  const { components: docs } = await import(`data:text/javascript,${encodeURIComponent(readFileSync(join(ROOT, 'docs', 'content.js'), 'utf8'))}`);
  const idx = components();
  assert.equal(idx.length, docs.length);
  assert.equal(UI_VERSION(), JSON.parse(readFileSync(join(ROOT, 'packages', 'ui', 'package.json'), 'utf8')).version);
  const b = find(idx, 'cm-button');
  assert.ok(b.properties.some((p) => p.attribute === 'variant'));
  assert.ok(b.events.some((e) => e.name === 'click'));
  assert.ok(b.examples.length > 0 && b.examples[0].html.includes('<cm-button'));
  assert.equal(b.docs_url, 'https://commmerce.com/commmerceui/#components--button');
  for (const c of idx) assert.match(c.tag, /^cm-/);
});

test('docs links use the docs router\'s hash form', () => {
  // docs/app.js: toHash('/components/x') === 'components--x'
  const app = readFileSync(join(ROOT, 'docs', 'app.js'), 'utf8');
  assert.match(app, /const toHash = \(path\) => \(path === '\/' \? '' : path\.slice\(1\)\.replace\(\/\\\/\/g, '--'\)\)/);
  assert.equal(docsUrl('data-table'), 'https://commmerce.com/commmerceui/#components--data-table');
  assert.match(app, /pages\['\/apps\/review'\]/, 'the docs page the tools link to exists');
});

test('search and find', () => {
  const idx = components();
  assert.equal(search(idx, 'save bar')[0].tag, 'cm-save-bar');
  assert.equal(search(idx, 'modal dialog')[0].tag, 'cm-modal');
  assert.equal(search(idx, 'dropdown')[0].tag, 'cm-select');
  assert.ok(search(idx, 'date range filter').slice(0, 3).some((c) => c.tag === 'cm-date-range-picker'));
  assert.equal(find(idx, 'Text field').tag, 'cm-text-field');
  assert.equal(find(idx, 'text-field').tag, 'cm-text-field');
  assert.equal(find(idx, 'TextField').tag, 'cm-text-field');
  assert.equal(find(idx, '<cm-radio>').tag, 'cm-radio-group', 'parts find their parent');
  assert.equal(find(idx, 'nothing-like-this'), undefined);
});

test('personal data: emails and phone numbers, demo domains and dates ignored', () => {
  const r = findPersonalData('Ravi ravi.k@gmail.com, demo@example.com, x@shop.test, +91 98765 43210, (080) 4123-4567, 2026-11-23, Order #1001, ₹12,34,567');
  assert.deepEqual(r.emails, ['ravi.k@gmail.com']);
  assert.equal(r.phones.length, 2);
  assert.equal(mask('ravi.k@gmail.com').endsWith('om'), true);
  assert.ok(!mask('ravi.k@gmail.com').includes('ravi'));
});

test('MCP core: initialize negotiates the version, lists tools, reports tool errors, ignores notifications', async () => {
  const handle = createMcp({ name: 't', version: '1', instructions: 'i', tools: [
    { name: 'ok', description: 'd', inputSchema: { type: 'object', properties: { a: { type: 'string' } }, required: ['a'] }, handler: async ({ a }) => ({ a }) },
    { name: 'boom', description: 'd', inputSchema: { type: 'object' }, handler: async () => { throw new Error('nope'); } },
  ] });
  assert.equal((await handle({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-03-26' } })).result.protocolVersion, '2025-03-26');
  assert.equal((await handle({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '1999-01-01' } })).result.protocolVersion, '2025-11-25');
  assert.equal(await handle({ jsonrpc: '2.0', method: 'notifications/initialized' }), null);
  assert.deepEqual((await handle({ jsonrpc: '2.0', id: 2, method: 'tools/list' })).result.tools.map((t) => t.name), ['ok', 'boom']);
  assert.equal((await handle({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'ok', arguments: { a: 'x' } } })).result.content[0].text, '{\n  "a": "x"\n}');
  assert.equal((await handle({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'ok', arguments: {} } })).result.isError, true);
  assert.equal((await handle({ jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'boom' } })).result.content[0].text, 'nope');
  assert.equal((await handle({ jsonrpc: '2.0', id: 6, method: 'tools/call', params: { name: 'nope' } })).error.code, -32602);
  assert.equal((await handle({ jsonrpc: '2.0', id: 7, method: 'x' })).error.code, -32601);
  assert.equal((await handle([{ jsonrpc: '2.0', id: 8, method: 'ping' }, { jsonrpc: '2.0', method: 'notifications/x' }])).length, 1);
  // stdio: line-delimited JSON, parse errors answered
  const input = new PassThrough(), output = new PassThrough();
  let text = ''; output.on('data', (d) => { text += d; });
  const done = serveStdio(handle, { input, output });
  input.write('{"jsonrpc":"2.0","id":1,"method":"ping"}\nnot json\n'); input.end();
  await done;
  const lines = text.trim().split('\n').map((l) => JSON.parse(l));
  assert.deepEqual(lines.find((l) => l.id === 1).result, {});
  assert.equal(lines.find((l) => l.error).error.code, -32700);
});
