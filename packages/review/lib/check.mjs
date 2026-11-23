// `commmerce-review check <url>`: deterministic checks of a running page, no AI, nothing leaves the machine.
// The same rules as the docs site's own checks (scripts/check-responsive.mjs, scripts/a11y-audit.mjs):
//   - Commmerce UI present, which version, cm-* tags used but never defined
//   - axe-core, WCAG 2.0/2.1/2.2 A and AA (at 390 and 1280px)
//   - sideways scroll at 320, 390, 768 and 1280px
//   - text under 12px, targets under 24x24px (inline links in sentences exempt, WCAG 2.5.8)
//   - native buttons, inputs, selects... where a cm-* component exists
// Severity: blocker (fails CI) | major | minor.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { launchChromium, open } from './browser.mjs';
import { components, UI_VERSION } from './components.mjs';
import { docsUrl } from './components-index.mjs';

export const WIDTHS = [320, 390, 768, 1280];
const AXE_WIDTHS = [390, 1280];
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const IMPACT = { critical: 'blocker', serious: 'blocker', moderate: 'major', minor: 'minor' };
// Native element -> the Commmerce UI component to use instead (only suggested when that component exists).
const NATIVE = [
  ['button, input[type=button], input[type=submit], input[type=reset]', 'cm-button'],
  ['input[type=checkbox]', 'cm-checkbox'],
  ['input[type=radio]', 'cm-radio-group'],
  ['input[type=search]', 'cm-search'],
  ['input[type=date]', 'cm-date-picker'],
  ['input[type=time]', 'cm-time-picker'],
  ['input[type=color]', 'cm-color-field'],
  ['input[type=file]', 'cm-file-upload'],
  ['input:not([type]), input[type=text], input[type=email], input[type=number], input[type=tel], input[type=url], input[type=password], textarea', 'cm-text-field'],
  ['select', 'cm-select'],
  ['dialog', 'cm-modal'],
  ['progress', 'cm-progress-bar'],
];

let axeSource = '';
const axe = () => (axeSource ||= readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8'));

/**
 * Runs in the page. Returns raw observations for one width.
 * @param {{ tags: string[], native: [string, string][] }} arg
 */
function inspect({ tags, native }) {
  const describe = (/** @type {Element} */ el) => {
    const part = (/** @type {Element} */ e) => `${e.localName}${e.id ? '#' + e.id : ''}${typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`;
    const parts = []; let e = el;
    for (let i = 0; e && e !== document.body && i < 3; i++, e = e.parentElement) { parts.unshift(part(e)); if (e.id) break; }
    return parts.join(' > ');
  };
  const label = (/** @type {Element} */ el) => (el.getAttribute('aria-label') || el.textContent || /** @type {any} */ (el).value || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  const visible = (/** @type {Element} */ el) => {
    if (el.closest('[hidden], [inert]')) return false;
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const inCm = (/** @type {Element} */ el) => { for (let a = el.parentElement; a; a = a.parentElement) if (a.localName.startsWith('cm-')) return true; return false; };

  // Commmerce UI: which components are defined, which cm-* tags are used, the version from the hosted build's URL.
  const defined = tags.filter((t) => customElements.get(t));
  const used = [...new Set([...document.querySelectorAll('*')].map((e) => e.localName).filter((n) => n.startsWith('cm-')))];
  const urls = [...document.querySelectorAll('script[src], link[href]')].map((e) => e.getAttribute('src') || e.getAttribute('href') || '');
  let version = null;
  for (const u of urls) {
    const m = /commmerceui\/v\/(\d+\.\d+\.\d+[\w.-]*)\//.exec(u) || /@commmerce\/(?:ui|tokens)@(\d+\.\d+\.\d+[\w.-]*)/.exec(u);
    if (m) { version = m[1]; break; }
  }

  const se = /** @type {Element} */ (document.scrollingElement);
  let overflow = null;
  if (se.scrollWidth > innerWidth + 1) {
    const clipped = (/** @type {Element} */ el) => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) if (getComputedStyle(a).overflowX !== 'visible') return true; return false; };
    const sticks = (/** @type {Element} */ el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > innerWidth + 1 && getComputedStyle(el).position !== 'fixed' && !clipped(el); };
    const wide = [...document.querySelectorAll('body *')].filter(sticks).filter((el) => !el.parentElement || !sticks(el.parentElement)).slice(0, 3);
    overflow = { scrollWidth: se.scrollWidth, elements: wide.map((el) => ({ element: describe(el), right: Math.round(el.getBoundingClientRect().right) })) };
  }

  // Text under 12px (the app's own text; components inside their shadow roots are tested by Commmerce UI).
  const small = new Map();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement;
    if (!n.textContent?.trim() || !el || /^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT|OPTION)$/.test(el.tagName)) continue;
    const size = parseFloat(getComputedStyle(el).fontSize);
    if (size < 12 && visible(el)) { const d = describe(el); if (!small.has(d)) small.set(d, { element: d, size, text: n.textContent.trim().slice(0, 40) }); }
  }

  // Targets under 24x24 (WCAG 2.5.8). Inline links inside sentences are exempt.
  const tiny = new Map();
  for (const el of document.querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=tab], [role=checkbox], [role=switch], [tabindex]:not([tabindex="-1"])')) {
    if (!visible(el)) continue;
    if (el.localName === 'a' && el.closest('p, li, td, dd, small, figcaption, label') && !el.closest('nav')) continue;
    if (el.localName === 'input' && /** @type {HTMLInputElement} */ (el).labels?.length && /^(checkbox|radio)$/.test(/** @type {HTMLInputElement} */ (el).type)) {
      // A checkbox's label is part of its target.
      const lr = /** @type {HTMLInputElement} */ (el).labels?.[0]?.getBoundingClientRect();
      if (lr && lr.height >= 24) continue;
    }
    const r = el.getBoundingClientRect();
    if (r.width < 23.5 || r.height < 23.5) { const d = describe(el); if (!tiny.has(d)) tiny.set(d, { element: d, label: label(el), w: Math.round(r.width), h: Math.round(r.height) }); }
  }

  // Native controls where a cm-* component exists (not ones placed inside a cm-* element, which may be intended).
  const natives = [];
  for (const [sel, tag] of native) {
    const els = [...document.querySelectorAll(sel)].filter((el) => !inCm(el) && !el.closest('[data-cm-allow-native]') && (el.localName === 'dialog' || visible(el)));
    if (els.length) natives.push({ tag, count: els.length, examples: els.slice(0, 3).map((el) => ({ element: describe(el), label: label(el) })) });
  }

  return { defined, used, version, overflow, small: [...small.values()].slice(0, 10), tiny: [...tiny.values()].slice(0, 10), natives, title: document.title };
}

/**
 * @param {string} url
 * @param {{ widths?: number[], axe?: boolean, browser?: import('playwright').Browser }} [opts]
 */
export async function checkPage(url, opts = {}) {
  const index = components();
  const byTag = new Map(index.map((c) => [c.tag, c]));
  const tags = [...index.map((c) => c.tag), ...index.flatMap((c) => c.parts.map((/** @type {any} */ p) => p.tag))];
  const native = NATIVE.filter(([, tag]) => byTag.has(tag));
  const widths = opts.widths ?? WIDTHS;
  const browser = opts.browser ?? await launchChromium();
  /** @type {any[]} */
  const findings = [];
  let n = 0;
  const add = (/** @type {any} */ f) => findings.push({ id: `c${++n}`, ...f, ...(f.component && byTag.has(f.component) ? { docs_url: docsUrl(byTag.get(f.component).slug) } : {}) });
  /** @type {any} */
  let ui = null;
  const seen = new Set();
  try {
    for (const width of widths) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      /** @type {string[]} */
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      try {
        const res = await open(page, url);
        if (res && res.status() >= 400) { add({ check: 'load', severity: 'blocker', width, element: 'page', problem: `The page answered HTTP ${res.status()}.`, fix: 'Check the URL and that the app is running.' }); continue; }
      } catch (e) {
        add({ check: 'load', severity: 'blocker', width, element: 'page', problem: `The page did not load: ${e instanceof Error ? e.message.split('\n')[0] : e}`, fix: 'Check the URL and that the app is running.' });
        await ctx.close();
        break;
      }
      const r = await page.evaluate(inspect, { tags, native });
      if (!ui) {
        ui = { present: r.defined.length > 0, version: r.version, latest: UI_VERSION(), components_defined: r.defined.length, components_used: r.used.filter((t) => byTag.has(t) || tags.includes(t)), title: r.title };
        const undef = r.used.filter((t) => !r.defined.includes(t));
        for (const t of undef) add({ check: 'commmerce-ui', severity: 'blocker', width, element: t, problem: `<${t}> is used but not defined${tags.includes(t) ? ': Commmerce UI is not loaded, or loaded after the page rendered' : ': no Commmerce UI component has this name'}.`, fix: tags.includes(t) ? 'Load Commmerce UI (cdn.js from the hosted build, or import \'@commmerce/ui\').' : 'Use a component from the docs (search_components).', ...(byTag.has(t) ? { component: t } : {}) });
        if (!ui.present) add({ check: 'commmerce-ui', severity: 'major', width, element: 'page', problem: 'Commmerce UI is not on this page: no cm-* component is defined.', fix: 'Build the screen with Commmerce UI components. Install: https://commmerce.com/commmerceui/#start--install' });
        else if (ui.version && cmp(ui.version, ui.latest) < 0) add({ check: 'commmerce-ui', severity: 'minor', width, element: 'page', problem: `Commmerce UI ${ui.version} is older than ${ui.latest}.`, fix: `Update to ${ui.latest} (release notes: https://commmerce.com/commmerceui/#releases).` });
      }
      for (const e of errors.slice(0, 3)) add({ check: 'errors', severity: 'major', width, element: 'page', problem: `JavaScript error: ${e.slice(0, 200)}`, fix: 'Fix the error (see the browser console).' });
      if (r.overflow) add({ check: 'sideways-scroll', severity: 'blocker', width, element: r.overflow.elements.map((x) => x.element).join(', ') || 'page', problem: `The page scrolls sideways at ${width}px (content is ${r.overflow.scrollWidth}px wide).`, fix: 'Let the content wrap or stack: use cm-layout / cm-stack / cm-grid, which reflow on narrow screens; let wide tables scroll inside their card.', component: 'cm-layout' });
      for (const s of r.small) if (!seen.has(`s${s.element}`)) { seen.add(`s${s.element}`); add({ check: 'small-text', severity: 'major', width, element: s.element, problem: `Text is ${s.size}px ("${s.text}"); nothing in the admin is under 12px.`, fix: 'Use the type scale: body 14px (--cm-font-size-*), supporting text 12px; or a component that sets its own text.' }); }
      for (const t of r.tiny) if (!seen.has(`t${t.element}`)) { seen.add(`t${t.element}`); add({ check: 'target-size', severity: 'major', width, element: t.element, problem: `Target "${t.label}" is ${t.w}x${t.h}px, under 24x24 (WCAG 2.5.8).`, fix: 'Use cm-button (36px; icon-only buttons are square) or give the control at least 24x24px.', component: 'cm-button' }); }
      for (const nat of r.natives) if (!seen.has(`n${nat.tag}`)) { seen.add(`n${nat.tag}`); add({ check: 'native-control', severity: 'major', width, element: nat.examples.map((x) => x.element + (x.label ? ` "${x.label}"` : '')).join(', '), problem: `${nat.count} native control(s) where Commmerce UI has <${nat.tag}>.`, fix: `Use <${nat.tag}> (see its docs for attributes and slots). If the native element is intended, mark it data-cm-allow-native.`, component: nat.tag }); }
      if (opts.axe !== false && AXE_WIDTHS.includes(width)) {
        await page.addScriptTag({ content: axe() });
        const violations = await page.evaluate(async (tagList) => {
          // @ts-ignore axe is injected above
          const res = await window.axe.run(document, { runOnly: { type: 'tag', values: tagList }, resultTypes: ['violations'] });
          return res.violations.map((/** @type {any} */ v) => ({ rule: v.id, impact: v.impact, help: v.help, url: v.helpUrl, nodes: v.nodes.slice(0, 3).map((/** @type {any} */ x) => x.target.flat().join(' >>> ')), count: v.nodes.length }));
        }, AXE_TAGS);
        for (const v of violations) {
          if (seen.has(`a${v.rule}`)) continue;
          seen.add(`a${v.rule}`);
          add({ check: 'axe', severity: IMPACT[/** @type {keyof IMPACT} */ (v.impact)] ?? 'major', width, element: v.nodes.join(', '), problem: `${v.help} (axe ${v.rule}, ${v.count} element${v.count === 1 ? '' : 's'}).`, fix: 'Use the cm-* component for this control (they are accessible as shipped) or fix the markup; see the Accessibility foundations: https://commmerce.com/commmerceui/#foundations--accessibility' });
        }
      }
      await ctx.close();
    }
  } finally {
    if (!opts.browser) await browser.close();
  }
  const counts = { blocker: 0, major: 0, minor: 0 };
  for (const f of findings) counts[/** @type {'blocker'|'major'|'minor'} */ (f.severity)]++;
  return { url, ok: counts.blocker === 0, ui, widths, counts, findings, tool: `@commmerce/review ${UI_VERSION()}` };
}

/** @param {string} a @param {string} b */
function cmp(a, b) {
  const pa = a.split(/[.-]/).map((x) => (/^\d+$/.test(x) ? Number(x) : x));
  const pb = b.split(/[.-]/).map((x) => (/^\d+$/.test(x) ? Number(x) : x));
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return Number(pa[i]) - Number(pb[i]);
  return 0;
}

/** Readable text report. @param {Awaited<ReturnType<typeof checkPage>>} r */
export function formatCheck(r) {
  const lines = [`Commmerce UI check: ${r.url}`];
  lines.push(r.ui ? `Commmerce UI: ${r.ui.present ? `yes, ${r.ui.components_defined} components defined, version ${r.ui.version ?? 'unknown (bundled)'}` : 'not found'}; ${r.ui.components_used.length} used on the page` : 'Page did not load.');
  lines.push(`Widths: ${r.widths.join(', ')}px`);
  for (const sev of ['blocker', 'major', 'minor']) {
    const fs = r.findings.filter((f) => f.severity === sev);
    if (!fs.length) continue;
    lines.push('', `${sev.toUpperCase()} (${fs.length})`);
    for (const f of fs) {
      lines.push(`- [${f.check} @${f.width}px] ${f.problem}`, `    where: ${f.element}`, `    fix: ${f.fix}`);
      if (f.docs_url) lines.push(`    docs: ${f.docs_url}`);
    }
  }
  lines.push('', `${r.counts.blocker} blocker(s), ${r.counts.major} major, ${r.counts.minor} minor. ${r.ok ? 'No blockers.' : 'Blockers found.'}`);
  return lines.join('\n');
}
