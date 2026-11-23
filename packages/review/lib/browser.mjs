// Playwright is an optional peer dependency: found next to this package, or in the project the command runs in.
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export const PLAYWRIGHT_HELP = 'This needs Playwright and Chromium. In your project run:\n  npm install --save-dev playwright\n  npx playwright install chromium';

export class SetupError extends Error {}

export async function loadPlaywright() {
  try { return await import('playwright'); } catch { /* not next to this package */ }
  try {
    const path = createRequire(join(process.cwd(), 'package.json')).resolve('playwright');
    return await import(pathToFileURL(path).href);
  } catch { /* not in the project either */ }
  throw new SetupError(`Playwright is not installed. ${PLAYWRIGHT_HELP}`);
}

/** @returns {Promise<import('playwright').Browser>} */
export async function launchChromium() {
  const pw = await loadPlaywright();
  try {
    return await pw.chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/Executable doesn't exist|playwright install/i.test(msg)) throw new SetupError(`Chromium for Playwright is not installed. Run: npx playwright install chromium`);
    throw e;
  }
}

/** Load a page and let it settle (network quiet, custom elements upgraded, two frames). @param {import('playwright').Page} page @param {string} url */
export async function open(page, url) {
  const res = await page.goto(url, { waitUntil: 'load', timeout: 30_000 });
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 150)))));
  return res;
}
