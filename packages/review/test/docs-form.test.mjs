// The private feedback form on the docs page "Send feedback" (/apps/feedback, #apps--feedback), in Chromium, against a
// review service (real with COMMMERCE_REVIEW_SERVICE_DIR, otherwise the fake). The docs are served at /commmerceui/
// with the API proxied at /commmerceui/api/, as on commmerce.com. Needs `node scripts/build-docs.mjs` first.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { launchChromium } from '../lib/browser.mjs';
import { startService, startStatic, admin, ROOT, PNG } from './harness.mjs';

const built = existsSync(join(ROOT, 'docs', 'vendor', 'cdn.js'));
const skip = !built && 'docs not built';
let svc, site, browser, dir;

before(async () => {
  if (!built) return;
  svc = await startService();
  site = await startStatic({ dir: join(ROOT, 'docs'), mount: '/commmerceui/', apiBase: svc.base });
  browser = await launchChromium();
  dir = mkdtempSync(join(tmpdir(), 'review-form-'));
});
after(async () => { await browser?.close(); svc?.close(); site?.close(); });

async function openForm(hash = 'apps--feedback') {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${site.base}/commmerceui/dev.html#${hash}`);
  await page.waitForSelector('#fb-form cm-text-field[name="name"]');
  await page.waitForFunction(() => customElements.get('cm-file-upload') && customElements.get('cm-radio-group'));
  return { page, errors };
}
const field = (page, name) => page.locator(`#fb-form cm-text-field[name="${name}"]`);
const fill = (page, name, value) => field(page, name).locator('input, textarea').fill(value);
async function sender(page, kind = 'internal') {
  await fill(page, 'name', 'Asha'); await fill(page, 'email', 'asha@example.com'); await fill(page, 'app', 'Form test');
  await page.locator(`#fb-form cm-radio-group[name="submitter_kind"] cm-radio[value="${kind}"]`).click();
  await page.locator('#fb-form cm-checkbox[name="demo"]').click();
}
const pick = (page, type) => page.locator(`#fb-form cm-radio-group[name="type"] cm-radio[value="${type}"]`).click();
const linkParts = (href) => /#apps--feedback\?id=((?:rv|fb|cr)_\w+)&t=([\w-]+)$/.exec(href);

test('the page leads with privacy, names no email address, and the agent page links to it', { skip }, async () => {
  const { page, errors } = await openForm();
  assert.match(await page.textContent('.lead'), /^Everything you send is private/);
  assert.match(await page.textContent('.note'), /GitHub issues.*optional/s);
  assert.ok(!(await page.textContent('#main')).includes('ui@commmerce.com'));
  await page.goto(`${site.base}/commmerceui/dev.html#apps--review`);
  await page.waitForSelector('h1');
  assert.match(await page.textContent('.lead'), /^Everything you send is private/);
  assert.ok(await page.locator('#main a[href="#/apps/feedback"]').count() > 0);
  assert.ok(!(await page.textContent('#main')).includes('ui@commmerce.com'));
  assert.deepEqual(errors, []);
  await page.close();
});

test('the boxes adapt to the type', { skip }, async () => {
  const { page } = await openForm();
  const visible = async () => page.$$eval('#fb-form .fb-field:not([hidden]) > cm-text-field', (els) => els.map((e) => e.getAttribute('name')));
  assert.deepEqual(await visible(), ['url', 'questions']);
  await pick(page, 'bug');
  assert.deepEqual(await visible(), ['title', 'component', 'version', 'steps', 'expected', 'actual']);
  await pick(page, 'component-request');
  assert.deepEqual(await visible(), ['title', 'job', 'where', 'reference', 'workaround']);
  await pick(page, 'refinement');
  assert.deepEqual(await visible(), ['title', 'component', 'missing']);
  await pick(page, 'question');
  assert.deepEqual(await visible(), ['title', 'question']);
  assert.equal(await page.locator('#fb-form cm-file-upload').isVisible(), true, 'screenshots on every type');
  // Required follows the type: a bug without steps is not sent.
  await pick(page, 'bug');
  await sender(page);
  await fill(page, 'title', 'Select clips');
  await page.click('#fb-send');
  await page.waitForSelector('#fb-result cm-banner[tone="critical"]');
  await page.close();
});

test('build review: sends privately, shows the private link, which shows the findings', { skip }, async () => {
  const { page, errors } = await openForm();
  await sender(page, 'third-party');
  await page.click('#fb-send');
  await page.waitForFunction(() => /URL of your build or at least one screenshot/.test(document.querySelector('#fb-result')?.textContent ?? ''));
  await fill(page, 'url', 'https://app.example.com/orders');
  await fill(page, 'questions', 'Is the table right on phones?');
  const img = join(dir, 'orders.png'); writeFileSync(img, Buffer.from(PNG, 'base64'));
  await page.locator('#fb-form cm-file-upload input[type=file]').setInputFiles(img);
  const reqP = page.waitForRequest((r) => r.url().endsWith('/commmerceui/api/v1/public/reviews') && r.method() === 'POST');
  await page.click('#fb-send');
  const sent = JSON.parse((await reqP).postData());
  assert.equal(sent.website, undefined); assert.equal(sent.submitter_kind, 'third-party'); assert.equal(sent.screens[0].image, PNG);
  await page.waitForSelector('#fb-sent cm-banner[tone="success"]');
  const m = linkParts(await page.getAttribute('#fb-sent a', 'href'));
  assert.ok(m);
  const item = await admin(svc, 'GET', `/v1/admin/items/${m[1]}`);
  assert.equal(item.submitter_email, 'asha@example.com'); assert.equal(item.source, 'form');
  await admin(svc, 'POST', `/v1/admin/items/${m[1]}/claim`, {});
  await admin(svc, 'POST', `/v1/admin/items/${m[1]}/result`, { status: 'done', verdict: 'changes-needed', summary: 'Use the Commmerce UI table.', findings: [{ id: 'f1', screen: 'orders', width: 390, severity: 'major', element: 'table.orders', problem: 'A native table scrolls sideways on phones.', fix: 'Use <cm-data-table>.', component: 'cm-data-table', docs_url: 'https://commmerce.com/commmerceui/#components--data-table' }] });
  await page.goto(`${site.base}/commmerceui/dev.html#apps--feedback?id=${m[1]}&t=${m[2]}`);
  await page.waitForSelector('#fb-status .rv-findings');
  const text = await page.textContent('#fb-status');
  assert.match(text, /Done/); assert.match(text, /Changes needed/); assert.match(text, /A native table scrolls sideways/);
  assert.equal(await page.getAttribute('#fb-status .rv-findings a', 'href'), 'https://commmerce.com/commmerceui/#components--data-table');
  await page.goto(`${site.base}/commmerceui/dev.html#apps--feedback?id=${m[1]}&t=wrong`);
  await page.waitForSelector('#fb-status cm-banner[tone="critical"]');
  assert.deepEqual(errors, []);
  await page.close();
});

test('bug report and component request go to the feedback endpoint with their fields; the reply shows on the link', { skip }, async () => {
  const { page, errors } = await openForm();
  await pick(page, 'bug');
  await sender(page);
  await fill(page, 'title', 'Select clips at 320px');
  await fill(page, 'component', 'cm-select'); await fill(page, 'version', '1.20.2');
  await fill(page, 'steps', 'Open the filter on a phone'); await fill(page, 'actual', 'The menu is cut off');
  const reqP = page.waitForRequest((r) => r.url().endsWith('/commmerceui/api/v1/public/feedback'));
  await page.click('#fb-send');
  const sent = JSON.parse((await reqP).postData());
  assert.equal(sent.kind, 'bug'); assert.equal(sent.title, 'Select clips at 320px');
  assert.deepEqual(sent.fields, { component: 'cm-select', version: '1.20.2', steps: 'Open the filter on a phone', actual: 'The menu is cut off' });
  assert.match(sent.body, /Steps to reproduce:\nOpen the filter on a phone/);
  assert.equal(sent.url, undefined, 'review boxes are not sent');
  await page.waitForSelector('#fb-sent cm-banner[tone="success"]');
  const m = linkParts(await page.getAttribute('#fb-sent a', 'href'));
  assert.match(m[1], /^fb_/);
  const item = await admin(svc, 'GET', `/v1/admin/items/${m[1]}`);
  assert.equal(item.payload.fields.component, 'cm-select'); assert.equal(item.submitter_email, 'asha@example.com');
  await admin(svc, 'POST', `/v1/admin/items/${m[1]}/result`, { status: 'done', summary: 'Fixed in the next release.', reply: 'Thanks: the menu now flips inside the screen.', findings: [] });
  await page.goto(`${site.base}/commmerceui/dev.html#apps--feedback?id=${m[1]}&t=${m[2]}`);
  await page.waitForSelector('#fb-status .rv-reply');
  assert.match(await page.textContent('#fb-status'), /Bug report: Select clips at 320px/);
  // Component request
  const second = await openForm();
  await pick(second.page, 'component-request');
  await sender(second.page);
  await fill(second.page, 'title', 'Kanban swimlanes'); await fill(second.page, 'job', 'Group board columns by owner');
  const req2 = second.page.waitForRequest((r) => r.url().endsWith('/public/feedback'));
  await second.page.click('#fb-send');
  assert.equal(JSON.parse((await req2).postData()).kind, 'component-request');
  await second.page.waitForSelector('#fb-sent');
  assert.match(linkParts(await second.page.getAttribute('#fb-sent a', 'href'))[1], /^cr_/);
  assert.deepEqual([...errors, ...second.errors], []);
  await page.close(); await second.page.close();
});

test('service errors are shown, and the form stays filled in', { skip }, async () => {
  const { page } = await openForm();
  await page.route('**/public/reviews', (r) => r.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ error: { code: 'rate_limited', message: 'Too many submissions from here.' } }) }));
  await sender(page);
  await fill(page, 'url', 'https://app.example.com/');
  await page.click('#fb-send');
  await page.waitForFunction(() => /Too many submissions/.test(document.querySelector('#fb-result')?.textContent ?? ''));
  assert.equal(await page.locator('#fb-form').isVisible(), true);
  assert.equal(await page.locator('#fb-send').getAttribute('loading'), null, 'loading state cleared');
  await page.close();
});
