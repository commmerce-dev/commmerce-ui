// Fails the build if any foreground/background pair the components use drops below WCAG AA,
// in any theme. Add a row whenever a component pairs two colour tokens.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = JSON.parse(readFileSync(join(root, 'src/tokens.source.json'), 'utf8'));
const themes = src.color.themes.map((t) => t.id);

const parse = (v) => {
  let m = v.match(/^#([0-9a-f]{6})$/i);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255).concat(1);
  m = v.match(/^rgba?\(([^)]+)\)$/);
  if (m) { const p = m[1].split(',').map(Number); return [p[0] / 255, p[1] / 255, p[2] / 255, p[3] ?? 1]; }
  throw new Error(`can't parse ${v}`);
};
const over = (fg, bg) => fg.slice(0, 3).map((c, i) => c * fg[3] + bg[i] * (1 - fg[3])).concat(1);
const lum = ([r, g, b]) => [r, g, b].map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  .reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// A look (since 1.11) overrides some tokens on top of a theme; `look` is null for the default look.
let look = null;
const value = (name, theme) => {
  const fromLook = look && (look.values[theme]?.[name] ?? look.values.any?.[name]);
  const tok = src.color.tokens.find((t) => t.name === name);
  if (!tok && !fromLook) throw new Error(`unknown token ${name}`);
  const raw = fromLook ?? (typeof tok.value === 'string' ? tok.value : tok.value[theme] ?? tok.value[themes[0]]);
  const alias = raw.match(/^\{([^}]+)\}$/);
  return alias ? value(alias[1], theme) : raw;
};
// Translucent backgrounds are composited over `base`.
const solid = (name, theme, base = 'bg-surface') => {
  const c = parse(value(name, theme));
  return c[3] < 1 ? over(c, parse(value(base, theme))) : c;
};

// [foreground, [backgrounds], minimum]. A background written `fill@ground` is the translucent fill laid over that
// ground (default bg-surface): soft fills also sit on the page, inset areas and hovered rows.
const TEXT = 4.5, UI = 3;
const PAIRS = [
  ['text-default', ['bg-page', 'bg-surface', 'bg-hover', 'bg-inset', 'bg-input-filled', 'bg-tag', 'bg-attention', 'bg-information', 'bg-success', 'bg-critical', 'bg-error-bar'], TEXT],
  ['text-tertiary', ['bg-page', 'bg-surface', 'bg-inset', 'bg-hover'], TEXT],
  ['text-information', ['bg-surface', 'bg-information-soft'], TEXT],
  ['text-success', ['bg-surface', 'bg-success-soft'], TEXT],
  ['text-critical', ['bg-surface', 'bg-critical', 'bg-error-bar'], TEXT],
  ['text-attention', ['bg-surface', 'bg-attention'], TEXT],
  ['text-speciality', ['bg-surface'], TEXT],
  ['text-speciality-on-dark', ['bg-flash-bar'], TEXT],
  ['text-counter', ['bg-surface'], TEXT],
  ['text-on-dark-secondary', ['bg-dashboard', 'nav-active', 'bg-flash-bar', 'bg-panel-header'], TEXT],
  ['text-on-dark', ['bg-dashboard', 'bg-flash-bar', 'bg-panel-header', 'nav-active', 'nav-badge'], TEXT],
  ['action-primary-text', ['action-primary', 'action-primary-hover'], TEXT],
  ['icon-default', ['bg-surface', 'bg-icon'], UI],
  ['icon-success', ['bg-surface'], UI],
  ['icon-responsive-menu', ['bg-surface'], UI],
  ['text-default', ['avatar-bg', 'bg-offer-card'], TEXT],
  ['icon-critical', ['bg-surface', 'bg-error-bar'], UI],
  ['border-input', ['bg-surface', 'bg-input-filled', 'bg-page'], UI],
  ['icon-selected', ['bg-surface', 'bg-page', 'bg-tag', 'bg-hover', 'bg-input-filled', 'bg-icon', 'thumb-bg'], UI],
  ['border-strong', ['bg-surface', 'bg-page', 'bg-tag'], UI],
  ['border-critical', ['bg-surface'], UI],
  ['border-strong', ['bg-error-bar'], UI],                       // focus ring on critical toast buttons
  ['action-primary', ['bg-inset', 'bg-surface', 'bg-page'], UI], // progress bar fill on its track and page
  // Button tones (1.2): secondary text on its fill and hover fill; outlines on the surfaces buttons sit on;
  // primary fills the button with the tone's text colour under action-primary-text.
  ['border-critical', ['bg-page'], UI],
  ['text-success', ['bg-page'], UI],                              // success outline (no border-success token)
  ['action-primary-text', ['text-critical', 'text-success'], TEXT],
  ['text-default', ['bg-information-soft', 'bg-success-soft'], TEXT],     // calendar event chips (1.4), tints laid over bg-surface
  // 1.11: counts, accent text, selected rows. (tab-indicator is not checked: the selected tab label is also bold.)
  ['count-text', ['count-bg'], TEXT],
  ['text-on-accent', ['accent'], TEXT],
  ['accent-text', ['bg-surface', 'bg-page', 'accent-soft'], TEXT],
  ['text-default', ['bg-selected', 'accent-soft'], TEXT],
  ['text-tertiary', ['bg-selected'], TEXT],
  // Soft status fills over every ground they sit on (badges, banners, calendar chips on grey pages and hovered rows).
  ...['bg-page', 'bg-inset', 'bg-hover'].flatMap((g) => [
    ['text-success', [`bg-success-soft@${g}`], TEXT],
    ['text-information', [`bg-information-soft@${g}`], TEXT],
    ['text-default', [`bg-success-soft@${g}`, `bg-information-soft@${g}`], TEXT],
  ]),
  ['text-attention', ['bg-attention-soft', 'bg-attention-soft@bg-page'], TEXT],
  ['text-critical', ['bg-critical@bg-page', 'bg-error-bar@bg-page'], TEXT],
  ['text-tertiary', ['bg-attention', 'bg-critical'], TEXT],         // secondary lines in tinted banners
];

let failed = 0;
const looks = [null, ...(src.looks ?? [])];
for (const l of looks) {
  look = l;
  for (const theme of themes) {
    for (const [fg, bgs, min] of PAIRS) {
      for (const bg of bgs) {
        const [fill, ground] = bg.split('@');
        const b = solid(fill, theme, ground);
        const r = ratio(over(parse(value(fg, theme)), b), b);
        if (r < min) { failed++; console.error(`FAIL ${l ? `${l.id} ` : ''}${theme}: ${fg} on ${bg} = ${r.toFixed(2)} (needs ${min})`); }
      }
    }
  }
}
const n = looks.length * themes.length * PAIRS.reduce((s, p) => s + p[1].length, 0);
if (failed) { console.error(`contrast: ${failed}/${n} pairs fail`); process.exit(1); }
console.log(`contrast: ${n} pairs pass AA in [${themes.join(', ')}] x looks [default${(src.looks ?? []).map((x) => ', ' + x.id).join('')}]`);
