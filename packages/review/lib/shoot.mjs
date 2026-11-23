// Screenshots for `submit`, taken locally (so localhost works), and the personal-data scan of the visible text.
import { readFileSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { launchChromium, open } from './browser.mjs';

export const SHOT_WIDTHS = [390, 768, 1280];
const MAX_IMAGE = 4 * 1024 * 1024;
const MAX_HEIGHT = 6000;

// RFC 2606/6761 names are demo data by definition.
const DEMO_DOMAIN = /(^|\.)(example\.(com|org|net)|[a-z0-9-]+\.(example|test|invalid|localhost))$/i;

/**
 * Emails and phone numbers in visible text. Demo addresses (example.com, *.test) are not reported.
 * @param {string} text @returns {{ emails: string[], phones: string[] }}
 */
export function findPersonalData(text) {
  const emails = [...new Set((text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []).filter((e) => !DEMO_DOMAIN.test(e.split('@')[1])))];
  const phones = [...new Set((text.match(/(?:\+\d{1,3}[\s.-]?)?(?:\(\d{2,5}\)[\s.-]?)?\d[\d\s.-]{7,14}\d/g) ?? [])
    .map((p) => p.trim())
    .filter((p) => { const d = p.replace(/\D/g, ''); return d.length >= 10 && d.length <= 13 && !/^(19|20)\d{2}[.-]\d{2}[.-]\d{2}/.test(p) && !/^\d{1,3}(,\d{3})+$/.test(p); }))];
  return { emails, phones };
}

/** Mask all but the last 2 characters for display. @param {string} s */
export const mask = (s) => s.replace(/[^@\s+.-](?=.{2})/g, '•');

/**
 * @param {{ name: string, url: string }[]} screens
 * @param {{ widths?: number[], browser?: import('playwright').Browser }} [opts]
 */
export async function shoot(screens, opts = {}) {
  const widths = opts.widths ?? SHOT_WIDTHS;
  const browser = opts.browser ?? await launchChromium();
  /** @type {{ name: string, width: number, image: string, bytes: number }[]} */
  const images = [];
  let text = '';
  /** @type {string | null} */
  let uiVersion = null;
  try {
    for (const s of screens) {
      for (const width of widths) {
        const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
        const page = await ctx.newPage();
        const res = await open(page, s.url);
        if (res && res.status() >= 400) throw new Error(`${s.url} answered HTTP ${res.status()}`);
        const info = await page.evaluate(() => {
          const u = [...document.querySelectorAll('script[src], link[href]')].map((e) => e.getAttribute('src') || e.getAttribute('href') || '');
          let v = null;
          for (const x of u) { const m = /commmerceui\/v\/(\d+\.\d+\.\d+[\w.-]*)\//.exec(x) || /@commmerce\/(?:ui|tokens)@(\d+\.\d+\.\d+[\w.-]*)/.exec(x); if (m) { v = m[1]; break; } }
          return { text: document.body?.innerText ?? '', height: document.scrollingElement?.scrollHeight ?? 900, version: v };
        });
        text += `\n${info.text}`;
        uiVersion ??= info.version;
        const clip = info.height > MAX_HEIGHT ? { x: 0, y: 0, width, height: MAX_HEIGHT } : undefined;
        let buf = await page.screenshot({ fullPage: true, clip, type: 'png' });
        if (buf.length > MAX_IMAGE) buf = await page.screenshot({ fullPage: true, clip, type: 'jpeg', quality: 80 });
        if (buf.length > MAX_IMAGE) buf = await page.screenshot({ fullPage: true, clip: { x: 0, y: 0, width, height: Math.min(info.height, 3000) }, type: 'jpeg', quality: 70 });
        images.push({ name: s.name, width, image: buf.toString('base64'), bytes: buf.length });
        await ctx.close();
      }
    }
  } finally {
    if (!opts.browser) await browser.close();
  }
  return { images, text, uiVersion };
}

/**
 * Images given by path: `name@width=path`, `name=path` or just a path (name from the file, width read from the PNG,
 * or 1280).
 * @param {string[]} specs
 */
export function readImages(specs) {
  return specs.map((spec) => {
    const m = /^([^=@]+)(?:@(\d+))?=(.+)$/.exec(spec);
    const path = m ? m[3] : spec;
    const ext = extname(path).toLowerCase();
    if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) throw new Error(`${path}: images must be PNG, JPEG or WebP`);
    const buf = readFileSync(path);
    if (buf.length > MAX_IMAGE) throw new Error(`${path} is over 4 MB`);
    const pngWidth = ext === '.png' && buf.length > 24 ? buf.readUInt32BE(16) : 0;
    const width = m?.[2] ? Number(m[2]) : (pngWidth >= 200 && pngWidth <= 5000 ? pngWidth : 1280);
    return { name: m ? m[1] : basename(path, ext), width, image: buf.toString('base64'), bytes: buf.length };
  });
}
