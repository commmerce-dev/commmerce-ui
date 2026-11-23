// The web form on the docs page "Review with your agent" (/apps/review), in Chromium, against a review service
// (real with COMMMERCE_REVIEW_SERVICE_DIR, otherwise the fake). The docs are served at /commmerceui/ with the API
// proxied at /commmerceui/api/, as on commmerce.com. Needs `node scripts/build-docs.mjs` first (docs/vendor).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { launchChromium } from '../lib/browser.mjs';
import { startService, startStatic, admin, ROOT, PNG } from './harness.mjs';

const built = existsSync(join(ROOT, 'docs', 'vendor', 'cdn.js'));
let svc, site, browser, dir;

before(async () => {
  if (!built) return;
  svc = await startService();
  site = await startStatic({ dir: join(ROOT, 'docs'), mount: '/commmerceui/', apiBase: svc.base });
  browser = await launchChromium();
  dir = mkdtempSync(join(tmpdir(), 'review-form-'));
});
after(async () => { await browser?.close(); svc?.close(); site?.close(); });

async function openForm() {
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${site.base}/commmerceui/dev.html#apps--review`);
  await page.waitForSelector('#rv-form cm-text-field');
  await page.waitForFunction(() => customElements.get('cm-file-upload'));
  return { page, errors };
}
const fill = (page, name, value) => page.locator(`#rv-form cm-text-field[name="${name}"]`).locator('input, textarea').fill(value);

test('the page leads with privacy and shows the form', { skip: !built && 'docs not built' }, async () => {
  const { page, errors } = await openForm();
  const lead = await page.textContent('.lead');
  assert.match(lead, /^Everything you send is private/);
  assert.match(await page.textContent('.note'), /GitHub issues.*optional/s);
  assert.equal(await page.locator('#rv-form').isVisible(), true);
  assert.deepEqual(errors, []);
  await page.close();
});

test('required fields and "URL or screenshots" are checked before sending', { skip: !built && 'docs not built' }, async () => {
  const { page } = await openForm();
  await page.click('#rv-send');
  await page.waitForSelector('#rv-result cm-banner[tone="critical"]');
  await fill(page, 'name', 'Asha'); await fill(page, 'email', 'asha@example.com'); await fill(page, 'app', 'Orders app');
  await page.locator('#rv-form cm-radio[value="internal"]').click();
  await page.locator('#rv-form cm-checkbox[name="demo"]').click();
  await page.click('#rv-send');
  await page.waitForFunction(() => /URL of your build or at least one screenshot/.test(document.querySelector('#rv-result')?.textContent ?? ''));
  await page.close();
});

test('sending shows the private link, which shows the review once it is done', { skip: !built && 'docs not built' }, async () => {
  const { page, errors } = await openForm();
  await fill(page, 'name', 'Asha'); await fill(page, 'email', 'asha@example.com'); await fill(page, 'app', 'Form test');
  await page.locator('#rv-form cm-radio[value="third-party"]').click();
  await fill(page, 'url', 'https://app.example.com/orders');
  await fill(page, 'questions', 'Is the table right on phones?');
  const img = join(dir, 'orders.png'); writeFileSync(img, Buffer.from(PNG, 'base64'));
  await page.locator('#rv-form cm-file-upload input[type=file]').setInputFiles(img);
  await page.locator('#rv-form cm-checkbox[name="demo"]').click();
  // Watch the request: the honeypot stays empty and the screenshot is sent as base64.
  const reqP = page.waitForRequest((r) => r.url().endsWith('/commmerceui/api/v1/public/reviews') && r.method() === 'POST');
  await page.click('#rv-send');
  const sent = JSON.parse((await reqP).postData());
  assert.equal(sent.website, undefined); assert.equal(sent.kind, 'third-party'); assert.equal(sent.screens.length, 1); assert.equal(sent.screens[0].image, PNG);
  await page.waitForSelector('#rv-sent cm-banner[tone="success"]');
  assert.equal(await page.locator('#rv-form').isVisible(), false);
  const link = await page.getAttribute('#rv-sent a', 'href');
  const m = /#apps--review\?id=(rv_\w+)&t=([\w-]+)$/.exec(link);
  assert.ok(m, link);
  if (svc.kind === 'real') {
    const item = await admin(svc, 'GET', `/v1/admin/items/${m[1]}`);
    assert.equal(item.submitter_email, 'asha@example.com'); assert.equal(item.source, 'form'); assert.equal(item.status_url, link);
  }
  // The runner finishes the review; the private link shows it.
  await admin(svc, 'POST', `/v1/admin/items/${m[1]}/claim`, {});
  await admin(svc, 'POST', `/v1/admin/items/${m[1]}/result`, { status: 'done', verdict: 'changes-needed', summary: 'Use the Commmerce UI table.', findings: [{ id: 'f1', screen: 'orders', width: 390, severity: 'major', element: 'table.orders', problem: 'A native table scrolls sideways on phones.', fix: 'Use <cm-data-table>.', component: 'cm-data-table', docs_url: 'https://commmerce.com/commmerceui/#components--data-table' }] });
  await page.goto(`${site.base}/commmerceui/dev.html#apps--review?id=${m[1]}&t=${m[2]}`);
  await page.waitForSelector('#rv-status .rv-findings');
  const text = await page.textContent('#rv-status');
  assert.match(text, /Done/); assert.match(text, /Changes needed/); assert.match(text, /Use the Commmerce UI table/); assert.match(text, /A native table scrolls sideways/);
  assert.equal(await page.getAttribute('#rv-status .rv-findings a', 'href'), 'https://commmerce.com/commmerceui/#components--data-table');
  // A wrong token shows an error, not the review.
  await page.goto(`${site.base}/commmerceui/dev.html#apps--review?id=${m[1]}&t=wrong`);
  await page.waitForSelector('#rv-status cm-banner[tone="critical"]');
  assert.deepEqual(errors, []);
  await page.close();
});

test('service errors are shown, and the form stays filled in', { skip: !built && 'docs not built' }, async () => {
  const { page } = await openForm();
  await page.route('**/public/reviews', (r) => r.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify({ error: { code: 'rate_limited', message: 'Too many submissions from here.' } }) }));
  await fill(page, 'name', 'Asha'); await fill(page, 'email', 'asha@example.com'); await fill(page, 'app', 'Form test');
  await page.locator('#rv-form cm-radio[value="internal"]').click();
  await fill(page, 'url', 'https://app.example.com/');
  await page.locator('#rv-form cm-checkbox[name="demo"]').click();
  await page.click('#rv-send');
  await page.waitForFunction(() => /Too many submissions/.test(document.querySelector('#rv-result')?.textContent ?? ''));
  assert.equal(await page.locator('#rv-form').isVisible(), true);
  assert.equal(await page.locator('#rv-send').getAttribute('loading'), null, 'loading state cleared');
  await page.close();
});
