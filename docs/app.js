import { components, planned, groupsOrder } from './content.js';
import { STATUS, PREVIEW, STABLE, SUPPORT_EMAIL, packages, patterns, statesHtml, orderListHtml, appFrameHtml, appFrameScript, appFrameReact } from './site.js';
// A pattern's `frames`: `true` for the admin frame example, or { html, script, react, label } for its own page.
const framesOf = (p) => (p.frames === true ? { html: appFrameHtml, script: appFrameScript, react: appFrameReact, label: 'admin frame' } : p.frames);
import { releaseNotes } from './releases.js';
import { FRAMEWORK_STARTERS } from './starters.js';
import { iconNames } from './vendor/icons/index.js';
import { getDefaultStrings } from './vendor/cdn.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Inline markdown: `code` and **bold** only.
const md = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\[\[([^|\]]+)\|(\/[^\]]*)\]\]/g, '<a href="#$2">$1</a>');
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Data files resolve next to this script, so a versioned release folder serves all of them together.
const asset = (p) => new URL(p, import.meta.url).href;
// Toast examples: a button with data-toast="<message>" calls showToast() (data-toast-tone, data-toast-action optional).
const wireToasts = (root) => root.querySelectorAll('[data-toast]').forEach((b) => b.addEventListener('click', async () => {
  const { showToast } = await import(asset('vendor/cdn.js'));
  const d = b.dataset;
  showToast(d.toast, { tone: d.toastTone || undefined,
    action: d.toastAction ? { label: d.toastAction, onAction: () => showToast('Change undone') } : undefined });
}));
// Density examples: a control with data-density-for="<id>" sets data-cm-density on that element (every table and list in it follows).
const wireDensity = (root) => root.querySelectorAll('[data-density-for]').forEach((c) => c.addEventListener('change', () => {
  const target = root.querySelector(`#${c.dataset.densityFor}`);
  if (target) target.dataset.cmDensity = c.value;
}));
// Board examples: Load more appends three made-up cards after a short wait, and a card's menu with data-board-move
// moves it (value "pick": pick up for the arrow keys; any other value: the column to move to). In an app, fetch the next page.
const MORE_NAMES = ['Mumbai Mart', 'Pune Paper Co.', 'Goa Gifts', 'Surat Silks', 'Indore Snacks', 'Nagpur Oranges', 'Agra Leather', 'Vizag Seafoods', 'Hubli Cottons'];
const wireBoards = (root) => {
  root.querySelectorAll('cm-board').forEach((board) => {
    board.addEventListener('cm-load-more', (e) => {
      const col = e.detail.column;
      col.loading = true;
      setTimeout(() => {
        const first = col.querySelector('cm-board-card');
        if (first) for (let i = 0; i < 3; i++) {
          const card = first.cloneNode(true);
          const name = MORE_NAMES[(col.querySelectorAll('cm-board-card').length + i) % MORE_NAMES.length];
          card.setAttribute('value', `${col.getAttribute('value')}-${Date.now()}-${i}`);
          card.setAttribute('heading', name);
          card.removeAttribute('pending');
          col.append(card);
        }
        col.loading = false;
        if (col.cards.length >= (col.total ?? 0)) col.hasMore = false;
      }, 700);
    });
    board.addEventListener('cm-select', (e) => {
      const menu = e.composedPath().find((n) => n.dataset?.boardMove !== undefined);
      const card = menu?.closest('cm-board-card');
      if (!card) return;
      if (e.detail.value === 'pick') board.pickUp(card); else board.moveCard(card, e.detail.value);
    });
  });
};
// Upload examples: [data-demo-files="front.png:45,notes.pdf:error"] starts with those files uploading (a percentage) or
// failed; [data-demo-upload] pretends to upload whatever is chosen, over about two seconds. In an app, upload the files
// yourself after `change` and report progress with setProgress(file, percent) and failures with setFileError(file, message).
const PNG = Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGM4ef4aAATTAm/eS0eYAAAAAElFTkSuQmCC'), (c) => c.charCodeAt(0));
const wireUploads = (root) => {
  root.querySelectorAll('cm-file-upload[data-demo-files]').forEach(async (up) => {
    await up.updateComplete;
    for (const spec of up.dataset.demoFiles.split(',')) {
      const [name, state] = spec.split(':');
      const f = /\.(png|jpe?g)$/.test(name) ? new File([PNG], name, { type: 'image/png' }) : new File([new Uint8Array(180000)], name, { type: 'application/pdf' });
      up.addFiles([f]);
      if (state === 'error') up.setFileError(f, 'Upload failed. Remove it and try again.');
      else if (state) up.setProgress(f, Number(state));
    }
  });
  root.querySelectorAll('cm-file-upload[data-demo-upload]').forEach((up) => {
    const seen = new WeakSet();
    up.addEventListener('change', () => {
      for (const f of up.files) {
        if (seen.has(f)) continue;
        seen.add(f);
        let p = 0;
        const tick = setInterval(() => {
          if (!up.files.includes(f)) return clearInterval(tick);
          p += 10;
          up.setProgress(f, p < 100 ? p : null);
          if (p >= 100) clearInterval(tick);
        }, 200);
      }
    });
  });
};
// Calendar examples: "+" adds a made-up follow-up (at 10 am for a day), an event opens a toast instead of a record, and
// [data-calendar-load] shows `loading` briefly on each new range. In an app, create the record, open it and fetch the range.
const wireCalendars = (root) => {
  root.querySelectorAll('cm-calendar').forEach((cal) => {
    cal.addEventListener('cm-add', (e) => {
      const { start, allDay } = e.detail;
      const at = allDay ? `${start}T10:00` : start;
      const [d, t] = at.split('T');
      const [h, m] = t.split(':').map(Number);
      const endMin = h * 60 + m + 30;
      const ev = document.createElement('cm-calendar-event');
      Object.assign(ev, { value: `new-${Date.now()}`, heading: 'New follow-up', start: at, kind: 'Follow-up', tone: 'attention', icon: 'phone',
        end: endMin < 1440 ? `${d}T${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}` : '' });
      cal.append(ev);
      cal.announce(`Added New follow-up`);
    });
    cal.addEventListener('cm-open', async (e) => {
      e.preventDefault();
      const { showToast } = await import(asset('vendor/cdn.js'));
      showToast(`Open ${e.detail.event.heading}`);
    });
    if (cal.hasAttribute('data-calendar-load')) {
      cal.addEventListener('cm-range-change', () => { cal.loading = true; setTimeout(() => { cal.loading = false; }, 700); });
    }
  });
};
// Command palette examples ([data-demo-crm]): records come back 400 ms after each query from a made-up CRM, choices show a
// toast instead of leaving the page, "Switch to dark theme" switches the preview and chosen records go to the top of
// Recent. In an app, fetch from your server in `cm-search` and let links navigate.
const CRM = [
  ['Leads', 'user', [['Ravi Stores', 'Lead · Mumbai'], ['Ravi Traders', 'Lead · Pune'], ['Sharma Textiles', 'Lead · Surat'], ['Goa Gifts', 'Lead · Panaji']]],
  ['Contacts', 'id-card', [['Ravi Kumar', 'Contact · Ravi Stores'], ['Anika Sharma', 'Contact · Sharma Textiles'], ['Priya Raman', 'Contact · Goa Gifts']]],
];
const wirePalettes = (root) => root.querySelectorAll('cm-command-palette[data-demo-crm]').forEach((pal) => {
  let timer;
  pal.addEventListener('cm-search', (e) => {
    clearTimeout(timer);
    const q = e.detail.query.trim().toLowerCase();
    if (!q) { pal.loading = false; pal.results = []; return; }
    pal.loading = true;
    timer = setTimeout(() => {
      pal.results = CRM.map(([label, icon, rows]) => {
        const hits = rows.filter(([t, d]) => `${t} ${d}`.toLowerCase().includes(q));
        return { label, total: hits.length, href: `#${slugify(label)}`, items: hits.slice(0, 3).map(([title, description]) => ({ title, description, icon, href: `#${slugify(title)}` })) };
      });
      pal.loading = false;
    }, 400);
  });
  pal.addEventListener('cm-select', async (e) => {
    e.preventDefault();
    const { item, group } = e.detail;
    if (item?.value === 'theme-dark') { const st = pal.closest('[data-cm-theme]'); if (st) st.dataset.cmTheme = 'dark'; return; }
    if (item?.description) pal.recent = [item, ...pal.recent.filter((r) => r.title !== item.title)].slice(0, 5);
    const { showToast } = await import(asset('vendor/cdn.js'));
    showToast(item ? (item.href ? `Open ${item.title}` : `Run “${item.title}”`) : `See all ${group.label.toLowerCase()}`);
  });
});
const [manifest, tokenData] = await Promise.all([
  fetch(asset('vendor/custom-elements.json')).then((r) => r.json()),
  fetch(asset('vendor/tokens.json')).then((r) => r.json()),
]);
const decl = (tag) => manifest.modules.flatMap((m) => m.declarations ?? []).find((d) => d.tagName === tag);
const tokens = tokenData.tokens;
const colorTokens = tokens.filter((t) => t.family === 'color');

/* ---------------- Facts shown on the site (computed, never typed in) ---------------- */
const FACTS = {
  ready: components.length,
  inProgress: planned.filter((p) => p.status === 'in-progress').length,
  planned: planned.filter((p) => p.status === 'planned').length,
  tokens: tokens.length,
  colors: colorTokens.length,
  icons: iconNames.length,
  // Heading ids are versions with dashes: v0-9-0 -> 0.9.0, v1-0-0-rc-1 -> 1.0.0-rc.1.
  release: (releaseNotes.match(/<h2 id="v(\d[\w-]*)"/) ?? [undefined, '0-1-0'])[1]
    .replace(/^(\d+)-(\d+)-(\d+)(?:-(.+))?$/, (_, a, b, c, pre) => `${a}.${b}.${c}${pre ? `-${pre.replace(/-/g, '.')}` : ''}`),
};
const namesBy = (st) => { const n = planned.filter((p) => p.status === st).map((p) => p.name); return n.length > 4 ? `${n.slice(0, 4).join(', ')} and more` : n.join(', ') || 'None'; };
const byGroup = (list) => { const g = {}; list.forEach((c) => (g[c.group] ??= []).push(c)); return g; };
const orderedComponents = [...components].sort((a, b) => groupsOrder.indexOf(a.group) - groupsOrder.indexOf(b.group));

/* ---------------- Site map ---------------- */
const SECTIONS = [
  { id: 'start', title: 'Get started', pages: [
    { path: '/start', title: 'Quickstart' },
    { path: '/start/install', title: 'Install and frameworks' },
    { path: '/start/frameworks', title: 'Vue, Angular, Svelte, Next.js' },
    { path: '/start/typescript', title: 'TypeScript' },
    { path: '/start/themes', title: 'Themes and tokens' },
    { path: '/start/flutter', title: 'Flutter' },
    { path: '/start/troubleshooting', title: 'Troubleshooting' },
  ] },
  { id: 'apps', title: 'Build an admin app', nav: 'Admin apps', pages: [
    { path: '/apps', title: 'How apps run in the admin' },
    { path: '/apps/native', title: 'What makes an app native' },
    { path: '/apps/guidelines', title: 'App design guidelines' },
    { path: '/apps/page-structure', title: 'Page structure' },
    { path: '/apps/app-bridge', title: 'App Bridge' },
    { path: '/apps/starter', title: 'Starter app' },
    { path: '/apps/review-checklist', title: 'Marketplace review checklist' },
  ] },
  { id: 'components', title: 'Components', pages: [{ path: '/components', title: 'All components' },
    ...orderedComponents.map((c) => ({ path: `/components/${c.slug}`, title: c.name, group: c.group })),
    ...planned.map((p) => ({ path: `/components/${p.slug}`, title: p.name, group: 'Not available yet', status: p.status }))] },
  { id: 'patterns', title: 'Patterns', pages: [{ path: '/patterns', title: 'All patterns' },
    ...patterns.map((p) => ({ path: `/patterns/${p.slug}`, title: p.name }))] },
  { id: 'foundations', title: 'Foundations', pages: [
    { path: '/foundations/accessibility', title: 'Accessibility', group: 'Principles' },
    { path: '/foundations/content', title: 'Content', group: 'Principles' },
    { path: '/foundations/localisation', title: 'Localisation and RTL', group: 'Principles' },
    { path: '/foundations/scale', title: 'Scale', group: 'Design' },
    { path: '/foundations/tokens', title: 'Tokens', group: 'Design' },
    { path: '/foundations/colors', title: 'Colour', group: 'Design' },
    { path: '/foundations/typography', title: 'Typography', group: 'Design' },
    { path: '/foundations/spacing', title: 'Spacing', group: 'Design' },
    { path: '/foundations/shape', title: 'Shape and depth', group: 'Design' },
    { path: '/foundations/logo', title: 'Logo', group: 'Design' },
  ] },
  { id: 'icons', title: 'Icons', pages: [{ path: '/icons', title: 'Icon gallery' }] },
  { id: 'releases', title: 'Releases and support', nav: 'Releases', pages: [
    { path: '/releases', title: 'Release notes' },
    { path: '/releases/stability', title: 'Versioning and stability' },
    { path: '/support', title: 'Support and compatibility' },
    { path: '/contributing', title: 'Contributing' },
  ] },
];
const allPages = SECTIONS.flatMap((s) => s.pages.map((p) => ({ ...p, section: s })));
// Addresses from the first version of the site keep working.
const REDIRECTS = {
  '/getting-started': '/start', '/getting-started/install': '/start/install', '/getting-started/themes': '/start/themes',
  '/getting-started/apps': '/apps', '/tokens': '/foundations/tokens', '/whats-new': '/releases',
};

/* ---------------- Code: highlight + HTML→React ---------------- */
function highlight(code, lang) {
  const re = lang === 'jsx'
    ? /(\/\/[^\n]*|\{\/\*[\s\S]*?\*\/\})|(<\/?[A-Za-z][\w.-]*)|("[^"]*"|'[^']*')|(\s[\w-:]+)(?==)|(\b(?:import|from|export|const|return|function)\b)/g
    : lang === 'sh'
      ? /(#[^\n]*)|(\b\B)|("[^"]*")|(\s--?[\w-]+)|(\b(?:npm|npx)\b)/g
      : /(<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/)|(<\/?[a-z][\w-]*)|("[^"]*")|(\s[\w-:@]+)(?==)|(\b\B)/g;
  let out = '', last = 0, m;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index));
    const [t] = m;
    out += m[1] ? `<span class="tk-com">${esc(t)}</span>` : m[2] ? `<span class="tk-tag">${esc(t)}</span>`
      : m[3] ? `<span class="tk-str">${esc(t)}</span>` : m[4] ? `<span class="tk-attr">${esc(t)}</span>` : `<span class="tk-tag">${esc(t)}</span>`;
    last = m.index + t.length;
  }
  return out + esc(code.slice(last));
}

// `parts` are child elements documented on their parent's page (e.g. cm-radio inside cm-radio-group).
const reactName = Object.fromEntries(components.flatMap((c) => [[c.tag, c.react], ...(c.parts ?? []).map((p) => [p.tag, p.react])]));
const camel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const reactEvent = (name) => 'on' + camel(name.replace(/^cm-/, '')).replace(/^./, (x) => x.toUpperCase());
const ATTR = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex' };
function toReact(html) {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  const used = new Set();
  const walk = (node, depth) => {
    const pad = '  '.repeat(depth);
    if (node.nodeType === 3) { const t = node.textContent.replace(/\s+/g, ' ').trim(); return t ? pad + t.replace(/[{}]/g, (c) => `{'${c}'}`) : ''; }
    if (node.nodeType !== 1) return '';
    const tag = node.localName, name = reactName[tag] ?? tag;
    if (reactName[tag]) used.add(name);
    const props = [...node.attributes].map(({ name: a, value: v }) => {
      if (a === 'style') {
        const obj = v.split(';').filter((d) => d.trim()).map((d) => { const i = d.indexOf(':'); const k = d.slice(0, i).trim(); return `${k.startsWith('--') ? `'${k}'` : camel(k)}: '${d.slice(i + 1).trim()}'`; });
        return `style={{ ${obj.join(', ')} }}`;
      }
      if (a.startsWith('on')) return `on${a[2].toUpperCase()}${a.slice(3)}={(event) => { /* … */ }}`;
      const p = ATTR[a] ?? (reactName[tag] ? camel(a) : a);
      // JSON attribute values (arrays and objects, e.g. a data table's columns) become JavaScript values.
      if (reactName[tag] && /^\s*[[{]/.test(v)) { try { return `${p}={${JSON.stringify(JSON.parse(v))}}`; } catch { /* plain text */ } }
      return v === '' ? p : `${p}=${v.includes('"') ? `{${JSON.stringify(v)}}` : `"${v}"`}`;
    });
    const open = `${pad}<${name}${props.length ? ' ' + props.join(' ') : ''}`;
    const kids = [...node.childNodes].map((c) => walk(c, depth + 1)).filter(Boolean);
    if (!kids.length) return `${open} />`;
    if (kids.length === 1 && node.childNodes.length === 1 && node.firstChild.nodeType === 3 && kids[0].length < 60) return `${open}>${kids[0].trim()}</${name}>`;
    return `${open}>\n${kids.join('\n')}\n${pad}</${name}>`;
  };
  const body = [...doc.body.childNodes].map((n) => walk(n, 0)).filter(Boolean);
  const root = body.length > 1 ? `<>\n${body.map((l) => l.replace(/^/gm, '  ')).join('\n')}\n</>` : body[0];
  return `import { ${[...used].join(', ')} } from '@commmerce/ui-react';\n\n${root}`;
}

// Layout helpers the examples use, written inline so copied code works anywhere.
const ROW = 'display:flex;flex-wrap:wrap;gap:20px;align-items:center';
const STACK = 'display:grid;grid-template-columns:minmax(0,1fr);gap:30px';
const mergeStyle = (a, b = '') => {
  const m = new Map();
  for (const d of `${a};${b}`.split(';')) { const i = d.indexOf(':'); if (i > 0) m.set(d.slice(0, i).trim(), d.slice(i + 1).trim()); }
  return [...m].map(([k, v]) => `${k}:${v}`).join(';');
};
const inlineLayout = (html) => html.replace(/class="(row|stack)"(?: style="([^"]*)")?/g,
  (_, k, extra) => `style="${mergeStyle(k === 'row' ? ROW : STACK, extra)}"`);

/* ---------------- UI helpers ---------------- */
function toast(msg) {
  const t = Object.assign(document.createElement('div'), { className: 'toast', role: 'status', textContent: msg });
  document.body.append(t); setTimeout(() => t.remove(), 1600);
}
async function copy(text, what = 'Text') {
  try { await navigator.clipboard.writeText(text); toast(`${what} copied`); } catch { toast('Copy failed: select the text and copy it'); }
}
const h2 = (title, id = slugify(title)) => `<h2 id="${id}">${esc(title)}<a class="anchor" href="#${currentPath}?s=${id}" aria-label="Link to section: ${esc(title)}">#</a></h2>`;
// Tables. On narrow screens (docs.css, max-width 600px) every row becomes a card: the first cell is its title and
// each other cell shows its column name from data-label. Explicit roles keep the table semantics that some
// browsers drop when table elements are display:block. cls 'scroll' keeps a wide table tabular: it scrolls in its
// own box with a sticky first column instead.
const attrText = (s) => String(s ?? '').replace(/<[^>]*>/g, '').trim().replace(/"/g, '&quot;');
const labelRow = (row, labels) => {
  let i = 0;
  return row.replace(/<tr(?=[\s>])/g, '<tr role="row"').replace(/<t([dh])((?:\s[^>]*)?)>/g, (_, k, attrs) => {
    const label = labels[i++];
    const role = k === 'd' ? 'cell' : /scope="row"/.test(attrs) ? 'rowheader' : 'columnheader';
    return `<t${k}${attrs} role="${role}"${label && i > 1 ? ` data-label="${label}"` : ''}>`;
  });
};
const table = (head, rows, cls = '') => {
  const labels = (head ?? []).map(attrText);
  return `<div class="tbl-wrap ${cls}"><table role="table">${head?.some(Boolean) ? `<thead role="rowgroup"><tr role="row">${head.map((x) => `<th scope="col" role="columnheader">${x}</th>`).join('')}</tr></thead>` : ''}<tbody role="rowgroup">${rows.map((r) => labelRow(r, labels)).join('')}</tbody></table></div>`;
};
const tokenValue = (t, theme = 'light') => typeof t.value === 'object' && !('fontSize' in t.value) ? (t.value[theme] ?? t.value.light) : t.value;
const badge = (status) => { const s = STATUS[status]; return `<cm-badge tone="${s.tone}">${s.label}</cm-badge>`; };
function linkifyText(s) { return md(s).replace(/\[\[([^|]+)\|([^\]]+)\]\]/g, '<a href="#$2">$1</a>'); }
const note = (html, cls = '') => `<div class="note ${cls}">${html}</div>`;
const doDont = (dos, donts) => `<div class="dd"><div class="do"><h3><cm-icon name="check" size="18"></cm-icon>Do</h3><ul>${dos.map((x) => `<li>${md(x)}</li>`).join('')}</ul></div>
  <div class="dont"><h3><cm-icon name="close" size="18"></cm-icon>Don't</h3><ul>${donts.map((x) => `<li>${md(x)}</li>`).join('')}</ul></div></div>`;
const mail = (subject = '') => `<a href="mailto:${SUPPORT_EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}">${SUPPORT_EMAIL}</a>`;
const statusKey = () => `<dl class="status-key">${Object.entries(STATUS).map(([k, s]) => `<div><dt>${badge(k)}</dt><dd>${s.text}</dd></div>`).join('')}</dl>`;

// Code blocks remember the reader's framework (HTML or React) across the whole site.
let langPref = 'HTML';
try { langPref = localStorage.getItem('cm-docs-lang') || 'HTML'; } catch {}
function codeBlock(sources, opts = {}) { // sources: [{label, lang, code}]
  const pick = Math.max(0, sources.findIndex((s) => s.label === langPref));
  return `<div class="code${opts.flush ? ' code--flush' : ''}">
    <div class="code-bar">${sources.length > 1
      ? `<div class="tabs" role="tablist" aria-label="Code language">${sources.map((s, i) => `<button role="tab" aria-selected="${i === pick}" data-i="${i}" data-label="${s.label}">${s.label}</button>`).join('')}</div>`
      : `<span class="code-label">${sources[0].label}</span>`}
      <button class="copy" type="button" aria-label="Copy code">Copy</button></div>
    ${sources.map((s, i) => `<pre ${i === pick ? '' : 'hidden'} data-i="${i}" tabindex="0"><code>${highlight(s.code, s.lang)}</code></pre>`).join('')}
  </div>`;
}
function selectLang(el, label) {
  const b = el.querySelector(`.tabs button[data-label="${label}"]`);
  if (!b) return;
  el.querySelectorAll('.tabs button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
  el.querySelectorAll('pre').forEach((p) => (p.hidden = p.dataset.i !== b.dataset.i));
}
function wireCode(root) {
  root.querySelectorAll('.code:not([data-wired])').forEach((el) => {
    el.dataset.wired = '';
    el.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => {
      langPref = b.dataset.label;
      try { localStorage.setItem('cm-docs-lang', langPref); } catch {}
      document.querySelectorAll('.code').forEach((c) => selectLang(c, langPref));
    }));
    el.querySelector('.copy').addEventListener('click', () => copy(el.querySelector('pre:not([hidden])').textContent, 'Code'));
  });
}
const setupCode = (body) => [
  { label: 'HTML', lang: 'html', code: `<link rel="stylesheet" href="${PREVIEW.font}">\n<link rel="stylesheet" href="${PREVIEW.css}">\n<script type="module" src="${PREVIEW.js}"></script>\n\n${body}` },
];

/* ---------------- Pages ---------------- */
const pages = {};

// What App Bridge covers, in one line (home page paths and the Build an admin app overview).
const BRIDGE_LINE = 'connects an app in its frame to the admin around it: admin navigation, toasts, modals, the save bar, the resource picker, the loading bar, session tokens, frame sizing and admin origin patterns.';
// The four ways in. Each links to a complete example that works today.
const PATHS = [
  { title: 'Try it now', what: 'The hosted build: one HTML file, no install and no build step.', time: '2 minutes',
    needs: 'A current browser and a text editor', href: '/start', go: 'Quickstart' },
  { title: 'React or a build step', what: 'The npm packages: web components, typed React wrappers and tokens, with a complete example app to download (Vite and React 19: an orders list and a product form), and smaller tested starters for Vue, Angular, Svelte and Next.js.', time: '5 minutes, to run the example app',
    needs: 'Node 18+; for your own project, one that installs from npm and bundles its code, and React 18 or 19 for the wrappers', href: '/apps/starter?s=react', go: 'React example app' },
  { title: 'Build an app inside the admin', what: 'App Bridge plus a starter app to download, in Node or PHP, with a stand-in admin to run it in.', time: '15 minutes, to run the starter locally',
    needs: 'Node 18+ or PHP 8.0+; a Commmerce store admin to test in (email support to set your app up)', href: '/apps/starter', go: 'Starter app',
    also: [['App design guidelines', '/apps/guidelines'], ['Marketplace review checklist', '/apps/review-checklist']] },
  { title: 'Flutter', what: 'The commmerce_ui package: the same tokens, theme, icons and widgets for web, desktop, phones and tablets.', time: '15 minutes',
    needs: 'Flutter 3.32 (the tested version) and access to the commmerce-ui repository: the package is not on pub.dev yet', href: '/start/flutter', go: 'Flutter guide' },
];
pages['/'] = () => ({ wide: true, side: false, title: 'Commmerce UI', html: `
  <section class="hero">
    <p class="eyebrow">Commmerce UI · ${STABLE ? '' : 'Preview '}${FACTS.release}</p>
    <h1>Build apps that feel native to Commmerce.</h1>
    <p class="lead">Commmerce UI is the shared design system and component framework behind the Commmerce admin and its app ecosystem: reusable components, design tokens, patterns and developer tools for Commmerce's product teams and for developers building apps merchants use inside the admin.</p>
    <p class="what-is">Commmerce is the retail operating system that connects a merchant's stores, website, POS, marketplaces, inventory and fulfilment.</p>
    <dl class="facts">
      <div><dt>Who it's for</dt><dd>Commmerce product teams and third-party app developers</dd></div>
      <div><dt>Where you use it</dt><dd>Screens inside the Commmerce admin: orders, products, inventory, settings</dd></div>
      <div><dt>What you build</dt><dd>Lists, forms, detail pages and the states around them</dd></div>
      <div><dt>What works today</dt><dd>${FACTS.ready} components, light and dark tokens and ${FACTS.icons} icons (v${PREVIEW.version}), on npm and as a hosted build, plus a Flutter package. <a href="#/apps">Apps run inside the admin</a> today.</dd></div>
    </dl>
  </section>

  <section class="paths" aria-labelledby="paths-title">
    <h2 id="paths-title">Choose your path</h2>
    <p class="muted">Each path links to working code you can copy. Times are estimates for getting it running.</p>
    <div class="path-grid">${PATHS.map((p) => `<div class="path-card path-card--stretch">
      <strong><a class="path-link" href="#${p.href}">${p.title}</a></strong>
      <span class="path-what">${p.what}</span>
      <dl><div><dt>Time</dt><dd>${p.time}</dd></div><div><dt>You need</dt><dd>${p.needs}</dd></div></dl>
      ${p.also ? `<p class="path-also">Before you ship: ${p.also.map(([t, h]) => `<a href="#${h}">${t}</a>`).join(' and ')}</p>` : ''}
      <span class="path-go" aria-hidden="true">${p.go} →</span></div>`).join('')}</div>
    <p class="bridge-line"><a href="#/apps/app-bridge"><strong>App Bridge</strong></a> ${BRIDGE_LINE}</p>
    <p><a class="more" href="#/components">Explore components →</a></p>
  </section>

  <section class="showcase" aria-labelledby="showcase-title">
    <div class="section-head">
      <div><h2 id="showcase-title">An orders screen, built only with Commmerce UI</h2>
      <p class="muted">Live components, not a picture. Switch the status tabs, search, or tick a few orders to see bulk actions.</p></div>
      <a class="more" href="#/patterns/order-list">See the pattern and code →</a>
    </div>
    <div class="home-frame"><iframe title="Example: orders screen in the Commmerce admin frame" loading="lazy"></iframe></div>
    <p class="caption">The orders screen runs inside the real admin frame: <a href="#/components/app-frame">app frame</a> with <code>panel</code>, <a href="#/components/header-bar">header bar</a> and <a href="#/components/side-navigation">side navigation</a>; in a narrow window, <a href="#/components/bottom-navigation">bottom navigation</a> and the More menu. The frame is for Commmerce products; apps get it from the admin.</p>
  </section>

  <section class="why" aria-labelledby="why-title">
    <h2 id="why-title">Why build with it</h2>
    <div class="why-grid">
      <div><h3>One admin, not a collection of apps</h3><p>First-party screens and third-party apps share the same layout, controls and words, so merchants don't relearn your app. <a href="#/apps/native">What makes an app native</a></p></div>
      <div><h3>The same behaviour everywhere</h3><p>Keyboard use, focus, error messages and screen-reader names are built into each component and checked by browser tests before every release. <a href="#/foundations/accessibility">How accessibility is checked</a></p></div>
      <div><h3>Works with your stack</h3><p>Web components for plain HTML, server-rendered pages and React, and a Flutter package for web, desktop, mobile and tablet. <a href="#/start/install">Framework support</a></p></div>
      <div><h3>Built from real merchant work</h3><p>Patterns for order lists, product editing, fulfilment states and empty or failed screens, with the reasoning behind each. <a href="#/patterns">Browse patterns</a></p></div>
    </div>
  </section>

  <section class="today" aria-labelledby="today-title">
    <h2 id="today-title">What you can use today</h2>
    ${FACTS.inProgress || FACTS.planned ? statusKey() : ''}
    <div class="avail">
      <a href="#/components" class="avail-item"><span>${badge('ready')}</span><strong>${FACTS.ready} components</strong><span class="muted">Forms, layout, lists and feedback</span></a>
      <a href="#/foundations/tokens" class="avail-item"><span>${badge('ready')}</span><strong>${FACTS.tokens} tokens</strong><span class="muted">Light and dark themes</span></a>
      <a href="#/icons" class="avail-item"><span>${badge('ready')}</span><strong>${FACTS.icons} icons</strong><span class="muted">24px line set</span></a>
      <a href="#/apps/app-bridge" class="avail-item"><span>${badge('ready')}</span><strong>App Bridge</strong><span class="muted">Admin toasts, modals, navigation and session tokens</span></a>
      <a href="#/start/install" class="avail-item"><span>${badge('ready')}</span><strong>npm packages</strong><span class="muted">Web components, React wrappers, tokens, icons, App Bridge</span></a>
      <a href="#/start/flutter" class="avail-item"><span>${badge('ready')}</span><strong>Flutter package</strong><span class="muted">Web, desktop, phones and tablets</span></a>
      ${FACTS.inProgress ? `<a href="#/components?status=in-progress" class="avail-item"><span>${badge('in-progress')}</span><strong>${FACTS.inProgress} components in progress</strong><span class="muted">${esc(namesBy('in-progress'))}</span></a>` : ''}
      ${FACTS.planned ? `<a href="#/components?status=planned" class="avail-item"><span>${badge('planned')}</span><strong>${FACTS.planned} components planned</strong><span class="muted">${esc(namesBy('planned'))}</span></a>` : ''}
    </div>
    <p class="muted small">${STABLE ? 'Breaking changes come only in major versions (<a href="#/releases/stability">compatibility policy</a>).' : 'APIs can change between preview releases.'} Pin a version to stay on one, and read the <a href="#/releases">release notes</a> before moving to the next.</p>
  </section>
  <footer class="footer">Commmerce UI is made and maintained by Commmerce. Design source: the Commmerce Design System Figma file. Questions and requests: ${mail()} · <a href="#/support">Support and compatibility</a> · <a href="#/releases">Release notes</a> · <a href="vendor/LICENSE.txt">Licence</a> · <a href="vendor/THIRD_PARTY_NOTICES.txt">Third-party notices</a></footer>`,
  after(main) { runHomeFrame(main); } });

/* ---- Get started ---- */
const QUICKSTART = `<!doctype html>
<html lang="en" data-cm-theme="auto">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My Commmerce app</title>
  <link rel="stylesheet" href="${PREVIEW.font}">
  <link rel="stylesheet" href="${PREVIEW.css}">
  <script type="module" src="${PREVIEW.js}"></script>
  <style>
    body { margin: 0; padding: 24px; background: var(--cm-bg-page); font-family: var(--cm-font-sans); }
  </style>
</head>
<body>
  <cm-card heading="Store settings">
    <form id="settings" style="display:grid;gap:20px">
      <cm-text-field name="store" label="Store name" value="Anika's Boutique" required></cm-text-field>
      <cm-button type="submit" variant="primary">Save</cm-button>
    </form>
  </cm-card>
  <script type="module">
    document.getElementById('settings').addEventListener('submit', (event) => {
      event.preventDefault();
      console.log(Object.fromEntries(new FormData(event.target)));
    });
  </script>
</body>
</html>`;

pages['/start'] = () => ({ title: 'Quickstart', html: `
  <h1>Quickstart</h1>
  <p class="lead">Get a Commmerce UI form on screen in about two minutes, with no build tools.</p>
  <ol class="steps">
    <li><h3>Create an HTML file</h3>
      <p>Save this as <code>index.html</code>. It loads the tokens and the components from the hosted build.</p>
      ${codeBlock([{ label: 'index.html', lang: 'html', code: QUICKSTART }])}</li>
    <li><h3>Open it in a browser</h3>
      <p>Double-click the file, or serve the folder (<code>npx serve</code>). You should see this card. Press Save and the form data appears in the browser console.</p>
      <div class="ex-stage ex-stage--inline" id="qs-preview">
        <cm-card heading="Store settings" style="width:100%;max-width:520px">
          <form style="display:grid;gap:20px" onsubmit="event.preventDefault()">
            <cm-text-field name="store" label="Store name" value="Anika's Boutique" required></cm-text-field>
            <cm-button type="submit" variant="primary">Save</cm-button>
          </form>
        </cm-card>
      </div></li>
    <li><h3>Build your first screen</h3>
      <p>Pick a pattern close to what you're making and copy its markup: <a href="#/patterns/order-list">an order or product list</a>, <a href="#/patterns/product-editor">a product editor</a>, or <a href="#/patterns/states">empty and error states</a>. Then read <a href="#/apps/native">what makes an app native</a>.</p></li>
  </ol>
  ${note(`<strong>This pins version ${PREVIEW.version}.</strong> Files under <code>/v/${PREVIEW.version}/</code> never change, so your app only changes when you change the number. See <a href="#/start/install">choosing a version</a>.`)}
  ${h2('Requirements')}
  <ul>
    <li>A current browser: Chrome or Edge, or Safari 16.4 or later (both tested), or Firefox 98 or later (tested). See <a href="#/support">support</a>.</li>
    <li>Pages must be served over <code>https://</code>, <code>http://localhost</code> or opened as a file. Scripts load as ES modules.</li>
  </ul>` });

const FLUTTER_WIDGETS = [
  ['Actions and forms', 'CmButton, CmTextField, CmCheckbox, CmRadioGroup, CmToggle, CmSelect, CmCombobox, CmSearch, CmDatePicker, CmDateRangePicker, CmTimePicker, CmOptionGroup, CmFileUpload'],
  ['Feedback and status', 'CmBadge, CmTag, CmBanner, CmEmptyState, CmSkeleton, CmSkeletonDisplay, CmComment, CmCommentBox, CmSmartTip, CmSmartTips, CmToast, CmSpinner, CmProgressBar'],
  ['Layout', 'CmPage, CmLayout, CmLayoutSection, CmGrid, CmStack, CmCard, CmInfoPanel, CmPageHeader, CmSaveBar, CmAccordion, CmActionBar'],
  ['Lists and tables', 'CmDataTable, CmStatusTabs, CmResourceList, CmPagination, CmTableHeader, CmNestedList, CmReportTile, CmReportTiles'],
  ['Images', 'CmAvatar, CmThumbnail'],
  ['Navigation', 'CmLinkTabs, CmFlashOfferBar'],
  ['Overlays', 'CmModal, CmSidePanel, CmFilterPanel, CmActionMenu, CmBottomSheet, CmTooltip'],
  ['Marketplace', 'CmAppCard'],
  ['Admin navigation (Commmerce products only)', 'CmSideNav, CmHeaderBar, CmAdminScaffold, CmBottomNavigation, CmMobileMenu, CmNotificationPanel'],
  ['Foundations', 'CmTheme.light() / dark(), CmColors, CmSpace, CmRadius, CmType, CmShadow, CmIcon + CmIcons, CmBreakpoints'],
];
/** Widgets in the table above, counted (Foundations are tokens and helpers, not widgets). */
const FLUTTER_WIDGET_COUNT = FLUTTER_WIDGETS.filter(([g]) => g !== 'Foundations').reduce((n, [, w]) => n + w.split(', ').length, 0);

const FRAMEWORKS = [
  ['Plain HTML and server-rendered pages (EJS, PHP)', 'ready', 'Use the elements directly. These docs and their tests run this way.'],
  ['React 18 and 19', 'ready', 'Use the `@commmerce/ui-react` wrappers (`npm install @commmerce/ui-react`). They are generated from the components, and the same wrapper test suite runs with React 18.3.1 and with React 19.3.1, in Chromium, Firefox and WebKit, on every change: every wrapper\'s props and events, children, refs, controlled values, attributes versus properties, and adding and removing props and handlers. React 17 is allowed by the package but not tested.'],
  ['Vue 3', 'ready', 'Use the elements in templates: set `isCustomElement` for `cm-` tags and import `@commmerce/ui` before mounting. `v-model` works on `cm-text-field`; bind `:checked` and `@change` on `cm-checkbox`; listen with `@cm-close` on overlays. Tested with Vue 3.5.44: the [[Vue starter|/start/frameworks?s=vue]]\'s browser tests run in Chromium on every change.'],
  ['Angular', 'ready', 'Standalone components with `CUSTOM_ELEMENTS_SCHEMA`; `[prop]` and `(event)` bindings. `ngModel` works on `cm-text-field` and `cm-select` with `ngDefaultControl`. Importing `FormsModule` adds `novalidate` to forms, so use `<form ngNoForm>` to keep `required`. Bindings on cm-* elements are not type-checked. Tested with Angular 22.2.4: the [[Angular starter|/start/frameworks?s=angular]]\'s browser tests run in Chromium on every change.'],
  ['Svelte 5', 'ready', 'Use the elements in markup and import `@commmerce/ui` before `mount()`. `value` with `oninput` (`bind:value` is for native inputs only), `oncm-close` for overlays. Svelte\'s a11y check warns about click handlers on `cm-button`; filter those warnings. Tested with Svelte 5.57.3: the [[Svelte starter|/start/frameworks?s=svelte]]\'s browser tests run in Chromium on every change.'],
  ['Next.js (App Router)', 'ready', 'Use `@commmerce/ui-react` in client components (`\'use client\'`); a wrapper imported into a server component fails the build. No `next/dynamic` or `ssr: false` needed; elements get their properties at hydration. Tested with Next.js 16.4.3 and React 19.3.1: the [[Next.js starter|/start/frameworks?s=next]]\'s browser tests run in Chromium on every change, against `next start`.'],
  ['Vue 2, Angular before 22, Svelte 4, Nuxt, SvelteKit, the Next.js Pages Router', 'planned', 'Not tested. They should work the same way.'],
  ['Flutter (web, desktop, mobile, tablet)', 'ready', (STABLE ? '' : 'Preview. ') + 'The `commmerce_ui` Flutter package: the same tokens, a Material theme, the icons and ' + FLUTTER_WIDGET_COUNT + ' widgets, including the admin side navigation, header and an adaptive admin shell. [[Flutter guide|/start/flutter]]'],
];
pages['/start/install'] = () => ({ title: 'Install and frameworks', html: `
  <h1>Install and frameworks</h1>
  <p class="lead">Two ways to install Commmerce UI: the hosted, versioned build (one link and one script, any website), or the npm packages for apps with a build step.</p>
  ${h2('Framework support')}
  ${table(['Setup', 'Status', 'Notes'], FRAMEWORKS.map(([a, s, n]) => `<tr><td>${a}</td><td>${s === 'ready' ? badge('ready') : `<cm-badge>Not tested</cm-badge>`}</td><td>${linkifyText(n)}</td></tr>`))}
  ${h2('Plain HTML and server-rendered pages')}
  <p>Add the three lines to your page's <code>&lt;head&gt;</code>, then use any <code>&lt;cm-*&gt;</code> element in your markup.</p>
  ${codeBlock(setupCode('<cm-button variant="primary">Save</cm-button>'))}
  ${h2('Choosing a version')}
  ${table(['Address', 'Changes when', 'Use it for'], [
    `<tr><td><code>…/ui@${PREVIEW.version}/dist/cdn.js</code><br><code>…/tokens@${PREVIEW.version}/dist/tokens.css</code></td><td>Never. Each release gets a new number.</td><td>Apps merchants use. Upgrade by changing the number after reading the <a href="#/releases">release notes</a>.</td></tr>`,
    `<tr><td><code>${PREVIEW.hostedJs}</code><br><code>${PREVIEW.hostedCss}</code></td><td>Never.</td><td>The same files on commmerce.com, if your site may only load scripts from Commmerce (a strict Content-Security-Policy).</td></tr>`,
    `<tr><td><code>…/commmerceui/vendor/cdn.js</code><br><code>…/commmerceui/vendor/tokens.css</code></td><td>Every release.</td><td>Prototypes, and checking an upcoming release.</td></tr>`,
  ])}
  ${h2('React')}
  <p>The React wrappers (<code>@commmerce/ui-react</code>) give you typed props and <code>on…</code> event props. Install them from npm (below), or load the hosted build as above and use the elements in JSX:</p>
  ${codeBlock([{ label: 'React 19', lang: 'jsx', code: `// React 19 passes properties and listens to events on custom elements directly.
export function StoreName({ value, onChange }) {
  return <cm-text-field label="Store name" value={value} onchange={(e) => onChange(e.target.value)} />;
}` }, { label: 'React 18', lang: 'jsx', code: `// React 18 sets attributes only: use a ref for properties and custom events.
export function StoreName({ value, onChange }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const handler = () => onChange(el.value);
    el.addEventListener('change', handler);
    return () => el.removeEventListener('change', handler);
  }, [onChange]);
  return <cm-text-field ref={ref} label="Store name" value={value} />;
}` }])}
  <p>Or install the React wrappers from npm (version ${PREVIEW.version}):</p>
  ${codeBlock([{ label: 'Terminal', lang: 'sh', code: 'npm install @commmerce/tokens @commmerce/ui-react' }, { label: 'main.jsx', lang: 'jsx', code: "import '@commmerce/tokens/fonts.css';\nimport '@commmerce/tokens/tokens.css';\nimport { Button, TextField } from '@commmerce/ui-react';" }])}
  <p>For a complete example app, download the <a href="#/apps/starter?s=react">React starter</a>: Vite and React 19 with the npm packages, an orders list with tabs, search, selection, a bulk action and pagination, and a product form with validation and the save bar, with browser tests.</p>
  ${h2('Vue, Angular, Svelte and Next.js')}
  <p>Setup code, the binding rules for each framework, and a tested starter app to download: <a href="#/start/frameworks">Vue, Angular, Svelte and Next.js</a>. For types, see <a href="#/start/typescript">TypeScript</a>.</p>
  ${h2('Packages')}
  ${table(['Package', 'Status', 'What it is'], packages.map((p) => `<tr><td><code>${esc(p.name)}</code></td><td>${badge(p.status)}</td><td>${md(p.what)}</td></tr>`))}
  ${h2('Bun, pnpm and Yarn', 'bun')}
  <p>The commands on these pages use npm; any package manager works the same. With Bun: <code>bun add @commmerce/tokens @commmerce/ui</code> (or <code>@commmerce/ui-react</code>), and <code>bun build</code> bundles them without warnings, keeping only the components you import. pnpm (<code>pnpm add</code>) and Yarn (<code>yarn add</code>) need nothing extra.</p>` });

/* ---- Frameworks: Vue, Angular, Svelte, Next.js (examples/*-starter; docs/starters.js lists their files) ---- */
const starterFiles = (s) => table(['File', 'What it does'], s.files.map(([f, d]) => `<tr><td><a href="vendor/${s.dir}/${f}" download="${f.split('/').pop()}"><code>${f}</code></a></td><td>${md(d)}</td></tr>`));
const starterRun = (s, dev, port) => codeBlock([{ label: 'Terminal', lang: 'sh', code: `# download the files below into one folder (keep the folders), then:
npm install
npm run ${dev}     # http://localhost:${port}
npx playwright install chromium && npm test   # builds it and runs the browser tests in Chromium` }]);
const bindRows = (rows) => table(['To', 'Write'], rows.map(([a, b]) => `<tr><td>${md(a)}</td><td>${md(b)}</td></tr>`));
const STARTER = Object.fromEntries(FRAMEWORK_STARTERS.map((s) => [s.id, s]));
pages['/start/frameworks'] = () => ({ title: 'Vue, Angular, Svelte, Next.js', html: `
  <h1>Vue, Angular, Svelte and Next.js</h1>
  <p class="lead">Commmerce UI components are standard custom elements, so they work in any framework that renders HTML. Each framework below has a small starter app, installed from npm, whose browser tests run on every change: an orders table rendered from an array, a modal opened and closed from framework state, and a form with a text field, a select and a checkbox bound both ways and submitted with <code>FormData</code>.</p>
  <p>The rules are the same everywhere: load <code>@commmerce/tokens/fonts.css</code> and <code>tokens.css</code> once; import <code>@commmerce/ui</code> before the app mounts, so the elements are registered and the framework sets <em>properties</em> (arrays and objects arrive as arrays and objects); read values from the element in <code>input</code> and <code>change</code> handlers; and listen for <code>cm-close</code> on overlays, because Esc, the backdrop and the close button close them without asking your state. For React, see <a href="#/start/install?s=react">React</a>; for types in every framework, see <a href="#/start/typescript">TypeScript</a>.</p>
  ${table(['Framework', 'Tested with', 'Starter'], FRAMEWORK_STARTERS.map((s) => `<tr><td><a href="#/start/frameworks?s=${s.id}">${s.name}</a></td><td>${md(s.stack)}</td><td><a href="vendor/${s.dir}/README.md" download="README.md">${s.dir}</a></td></tr>`))}
  ${note('The submit button sits in the modal\'s <code>footer</code> slot, outside the <code>&lt;form&gt;</code>, so every starter gives it <code>type="submit" form="new-order"</code>. Commmerce UI fields and buttons are form-associated, so <code>form="…"</code>, <code>required</code> and <code>new FormData(form)</code> work as they do for native fields.')}

  ${h2('Vue 3', 'vue')}
  <p>Use the elements in templates. Tell Vue's compiler that <code>cm-</code> tags are custom elements, and register them before mounting.</p>
  ${codeBlock([{ label: 'Terminal', lang: 'sh', code: `npm install @commmerce/tokens@${PREVIEW.version} @commmerce/ui@${PREVIEW.version}` },
    { label: 'vite.config.mjs', lang: 'jsx', code: `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue({
    template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('cm-') } },
  })],
});` },
    { label: 'main.js', lang: 'jsx', code: `import { createApp } from 'vue';
import '@commmerce/tokens/fonts.css';
import '@commmerce/tokens/tokens.css';
import '@commmerce/ui';          // before mount: Vue then sets properties, not attributes
import App from './App.vue';

createApp(App).mount('#app');` },
    { label: 'App.vue', lang: 'html', code: `<cm-button variant="primary" @click="modalOpen = true">New order</cm-button>
<cm-data-table caption="Orders" :columns="COLUMNS" :rows="orders"></cm-data-table>

<cm-modal heading="New order" :open="modalOpen" @cm-close="modalOpen = false">
  <form id="new-order" @submit.prevent="submit">
    <cm-text-field label="Customer" name="customer" required v-model="draft.customer"></cm-text-field>
    <cm-select label="Status" name="status" :options="STATUSES" :value="draft.status"
      @change="draft.status = $event.target.value"></cm-select>
    <cm-checkbox label="Paid" name="paid" value="yes" :checked="draft.paid"
      @change="draft.paid = $event.target.checked"></cm-checkbox>
  </form>
  <cm-button slot="footer" @click="modalOpen = false">Cancel</cm-button>
  <cm-button slot="footer" variant="primary" type="submit" form="new-order">Create order</cm-button>
</cm-modal>

<!-- in <script setup>:
function submit(e) {
  const data = new FormData(e.target);   // customer, status, paid
  ...
} -->` }])}
  ${bindRows([
    ['Pass an array or object', '`:rows="orders"`. Vue sets the property because the element has one (it is registered before mount). `.prop` forces it: `:rows.prop="orders"`.'],
    ['Bind a text field', '`v-model="name"` works on `cm-text-field`: Vue listens to `input` and reads and writes `value`.'],
    ['Bind a select', '`:value="status"` and `@change="status = $event.target.value"`.'],
    ['Bind a checkbox or toggle', '`:checked="paid"` and `@change="paid = $event.target.checked"`. `v-model` would bind `value`, not `checked`.'],
    ['Open and close an overlay', '`:open="modalOpen"` and `@cm-close="modalOpen = false"`.'],
    ['Listen to a cm-* event', '`@cm-page-change="page = $event.detail.page"`.'],
  ])}
  ${h2('Vue starter', 'vue-starter')}
  <p>${md(STARTER.vue.stack)}.</p>
  ${starterRun(STARTER.vue, 'dev', 5173)}
  ${starterFiles(STARTER.vue)}

  ${h2('Angular', 'angular')}
  <p>Use the elements in templates of standalone components with <code>CUSTOM_ELEMENTS_SCHEMA</code>. Square brackets bind properties, round brackets listen to events.</p>
  ${codeBlock([{ label: 'Terminal', lang: 'sh', code: `npm install @commmerce/tokens@${PREVIEW.version} @commmerce/ui@${PREVIEW.version}` },
    { label: 'angular.json', lang: 'jsx', code: `"styles": [
  "node_modules/@commmerce/tokens/dist/fonts.css",
  "node_modules/@commmerce/tokens/dist/tokens.css",
  "src/styles.css"
]` },
    { label: 'main.ts', lang: 'jsx', code: `import { bootstrapApplication } from '@angular/platform-browser';
import '@commmerce/ui';          // registers every cm-* element
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent);` },
    { label: 'app.component.ts', lang: 'jsx', code: `import { CUSTOM_ELEMENTS_SCHEMA, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { CmCheckbox, CmSelect } from '@commmerce/ui';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.component.html',
})
export class AppComponent {
  readonly modalOpen = signal(false);
  readonly customer = signal('');
  readonly status = signal('unprocessed');
  readonly paid = signal(false);
  onStatus(e: Event) { this.status.set((e.target as CmSelect).value); }
  onPaid(e: Event) { this.paid.set((e.target as CmCheckbox).checked); }
  submit(e: SubmitEvent) {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    // ...
  }
}` },
    { label: 'app.component.html', lang: 'html', code: `<cm-button variant="primary" (click)="modalOpen.set(true)">New order</cm-button>
<cm-data-table caption="Orders" [columns]="columns" [rows]="orders()"></cm-data-table>

<cm-modal heading="New order" [open]="modalOpen()" (cm-close)="modalOpen.set(false)">
  <form id="new-order" ngNoForm (submit)="submit($event)">
    <cm-text-field label="Customer" name="customer" required ngDefaultControl [(ngModel)]="customer"></cm-text-field>
    <cm-select label="Status" name="status" [options]="statuses" [value]="status()" (change)="onStatus($event)"></cm-select>
    <cm-checkbox label="Paid" name="paid" value="yes" [checked]="paid()" (change)="onPaid($event)"></cm-checkbox>
  </form>
  <cm-button slot="footer" (click)="modalOpen.set(false)">Cancel</cm-button>
  <cm-button slot="footer" variant="primary" type="submit" form="new-order">Create order</cm-button>
</cm-modal>` }])}
  ${bindRows([
    ['Allow cm-* tags', '`schemas: [CUSTOM_ELEMENTS_SCHEMA]` on each component that uses them. Angular then does not type-check bindings on those elements: `[size]="12345"` compiles.'],
    ['Pass an array or object', '`[rows]="orders()"` binds the DOM property.'],
    ['Bind with ngModel', '`ngDefaultControl [(ngModel)]="customer"` on `cm-text-field` or `cm-select`: Angular\'s default value accessor listens to `input` and sets `value`. It does not work for `cm-checkbox` (`checked`): bind `[checked]` and `(change)`.'],
    ['Keep native validation', '`<form ngNoForm>`. When `FormsModule` is imported, Angular adds `novalidate` to every `<form>`, and `required` no longer stops submission.'],
    ['Open and close an overlay', '`[open]="modalOpen()"` and `(cm-close)="modalOpen.set(false)"`.'],
    ['Read event details', 'With `strictTemplates`, `$event` for a cm-* event is `Event`, so `$event.detail` is an error. Declare the events once (see [[TypeScript|/start/typescript]]) or cast in a component method.'],
  ])}
  ${h2('Angular starter', 'angular-starter')}
  <p>${md(STARTER.angular.stack)}. Angular 22 needs Node <code>^22.22.3</code>, <code>^24.15.0</code> or 26 and later.</p>
  ${starterRun(STARTER.angular, 'dev', 4200)}
  ${starterFiles(STARTER.angular)}

  ${h2('Svelte 5', 'svelte')}
  <p>Use the elements in markup. Svelte sets a property when the element has one, so register the elements before <code>mount()</code>.</p>
  ${codeBlock([{ label: 'Terminal', lang: 'sh', code: `npm install @commmerce/tokens@${PREVIEW.version} @commmerce/ui@${PREVIEW.version}` },
    { label: 'main.js', lang: 'jsx', code: `import { mount } from 'svelte';
import '@commmerce/tokens/fonts.css';
import '@commmerce/tokens/tokens.css';
import '@commmerce/ui';          // before mount: Svelte then sets properties, not attributes
import App from './App.svelte';

mount(App, { target: document.getElementById('app') });` },
    { label: 'App.svelte', lang: 'html', code: `<cm-button variant="primary" onclick={() => (modalOpen = true)}>New order</cm-button>
<cm-data-table caption="Orders" columns={COLUMNS} rows={orders}></cm-data-table>

<cm-modal heading="New order" open={modalOpen} oncm-close={() => (modalOpen = false)}>
  <form id="new-order" onsubmit={submit}>
    <cm-text-field label="Customer" name="customer" required value={draft.customer}
      oninput={(e) => (draft.customer = e.currentTarget.value)}></cm-text-field>
    <cm-select label="Status" name="status" options={STATUSES} value={draft.status}
      onchange={(e) => (draft.status = e.currentTarget.value)}></cm-select>
    <cm-checkbox label="Paid" name="paid" value="yes" checked={draft.paid}
      onchange={(e) => (draft.paid = e.currentTarget.checked)}></cm-checkbox>
  </form>
  <cm-button slot="footer" onclick={() => (modalOpen = false)}>Cancel</cm-button>
  <cm-button slot="footer" variant="primary" type="submit" form="new-order">Create order</cm-button>
</cm-modal>` },
    { label: 'vite.config.mjs', lang: 'jsx', code: `import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({
    // cm-button renders a real <button>; Svelte can't see inside it, so it warns about click handlers.
    onwarn(warning, handler) {
      const a11y = ['a11y_no_static_element_interactions', 'a11y_click_events_have_key_events'];
      if (a11y.includes(warning.code) && warning.frame?.includes('<cm-button')) return;
      handler(warning);
    },
  })],
});` }])}
  ${bindRows([
    ['Pass an array or object', '`rows={orders}`.'],
    ['Bind a text field or select', '`value={name}` and `oninput={(e) => (name = e.currentTarget.value)}` (use `onchange` for `cm-select`). `bind:value` is only for native inputs.'],
    ['Bind a checkbox or toggle', '`checked={paid}` and `onchange={(e) => (paid = e.currentTarget.checked)}`.'],
    ['Open and close an overlay', '`open={modalOpen}` and `oncm-close={() => (modalOpen = false)}`: Svelte 5 listens to the event named after `on`.'],
    ['Quiet the a11y warnings', 'Svelte warns about click handlers on `cm-button` (it can\'t see the `<button>` inside). Filter those two warnings for `cm-button` only, as in `vite.config.mjs` above.'],
  ])}
  ${h2('Svelte starter', 'svelte-starter')}
  <p>${md(STARTER.svelte.stack)}.</p>
  ${starterRun(STARTER.svelte, 'dev', 5173)}
  ${starterFiles(STARTER.svelte)}

  ${h2('Next.js', 'next')}
  <p>Use the React wrappers (<code>@commmerce/ui-react</code>) in client components. With the App Router:</p>
  <ul>
    <li><strong>Put Commmerce UI behind a <code>'use client'</code> boundary.</strong> A wrapper imported straight into a server component fails the build (<code>TypeError: useRef is not a function</code> while prerendering): the wrappers use React hooks.</li>
    <li><strong>Nothing else is needed.</strong> No <code>next/dynamic</code>, no <code>ssr: false</code>, no Next.js config. The package loads on the server (Lit ships the shims it needs), the server HTML contains the bare <code>&lt;cm-…&gt;</code> tags, and the wrappers set properties once the page hydrates, with no hydration warnings.</li>
    <li>Until hydration the elements are unstyled tags, and content passed as properties (button variants, field labels, headings) appears a moment after the HTML.</li>
    <li>Import the token and font CSS in <code>app/layout</code>: it is plain CSS, so it is in the server HTML.</li>
  </ul>
  ${codeBlock([{ label: 'Terminal', lang: 'sh', code: `npm install @commmerce/tokens@${PREVIEW.version} @commmerce/ui-react@${PREVIEW.version}` },
    { label: 'app/layout.jsx', lang: 'jsx', code: `import '@commmerce/tokens/fonts.css';
import '@commmerce/tokens/tokens.css';

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}` },
    { label: 'app/page.jsx', lang: 'jsx', code: `// A server component: it renders the client component and nothing from Commmerce UI itself.
import { Orders } from './Orders.jsx';

export default function Page() {
  return <Orders />;
}` },
    { label: 'app/Orders.jsx', lang: 'jsx', code: `'use client';
import { useState } from 'react';
import { Button, Checkbox, DataTable, Modal, Select, TextField } from '@commmerce/ui-react';

export function Orders() {
  const [modalOpen, setModalOpen] = useState(false);
  const [customer, setCustomer] = useState('');
  const [status, setStatus] = useState('unprocessed');
  const [paid, setPaid] = useState(false);
  // ...
  return (
    <>
      <Button variant="primary" onClick={() => setModalOpen(true)}>New order</Button>
      <DataTable caption="Orders" columns={COLUMNS} rows={orders} />
      <Modal heading="New order" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form id="new-order" onSubmit={submit}>
          <TextField label="Customer" name="customer" required value={customer}
            onInput={(e) => setCustomer(e.target.value)} />
          <Select label="Status" name="status" options={STATUSES} value={status}
            onChange={(e) => setStatus(e.target.value)} />
          <Checkbox label="Paid" name="paid" value="yes" checked={paid}
            onChange={(e) => setPaid(e.target.checked)} />
        </form>
        <Button slot="footer" onClick={() => setModalOpen(false)}>Cancel</Button>
        <Button slot="footer" variant="primary" type="submit" form="new-order">Create order</Button>
      </Modal>
    </>
  );
}` }])}
  ${h2('Next.js starter', 'next-starter')}
  <p>${md(STARTER.next.stack)}. Its tests run against <code>next build</code> and <code>next start</code>; the same tests also passed against <code>next dev</code>.</p>
  ${starterRun(STARTER.next, 'dev', 3000)}
  ${starterFiles(STARTER.next)}

  ${h2('Not tested')}
  <p>Vue 2, AngularJS and Angular before 22, Svelte 4, the Next.js Pages Router, Nuxt and SvelteKit. They should work the same way, but no tests run against them. Email ${mail('Commmerce UI with my framework')} if you need one.</p>` });

/* ---- TypeScript. Every claim here was checked with tsc 5.9, vue-tsc 3.3, svelte-check 4.7 and Angular 22's compiler against 1.0.0-rc.4. ---- */
pages['/start/typescript'] = () => ({ title: 'TypeScript', html: `
  <h1>TypeScript</h1>
  <p class="lead">Both packages ship their own type declarations; there is no separate <code>@types</code> package. This page shows what is typed out of the box, and two short snippets for what is not: cm-* event details, and element properties in Vue and Svelte templates.</p>
  ${h2('What ships')}
  ${table(['Package', 'Types'], [
    ['<code>@commmerce/ui</code>', 'A class per element (<code>CmButton</code>, <code>CmTextField</code>, <code>CmModal</code>…) with every public property typed, including unions such as <code>size: \'small\' | \'medium\' | \'large\'</code>. Each element is added to <code>HTMLElementTagNameMap</code>, so <code>document.querySelector(\'cm-modal\')</code> and <code>document.createElement(\'cm-modal\')</code> return <code>CmModal</code>. Data types for properties: <code>SelectOption</code>, <code>DataTableColumn</code>, <code>DataTableRow</code>, <code>SortDirection</code>, <code>StatusTab</code>, <code>TableColumn</code>, <code>Breadcrumb</code>, <code>NavItem</code>, <code>MenuItem</code>, <code>NotificationItem</code>, <code>FilterValues</code>, <code>CloseReason</code>, <code>ToastTone</code>, <code>ShowToastOptions</code>, <code>IconName</code>, <code>Tone</code>, <code>SpaceStep</code>.'],
    ['<code>@commmerce/ui-react</code>', 'Props typed from the element classes, and typed event props: <code>onClose</code> gives <code>CustomEvent&lt;{ reason: CloseReason }&gt;</code>, <code>onSort</code> <code>{ key, direction }</code>, <code>onPageChange</code> <code>{ page }</code>, <code>onSelectionChange</code> <code>{ selected, all }</code>, and so on. <code>onInput</code> and <code>onChange</code> are plain DOM events.'],
  ].map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`))}
  ${codeBlock([{ label: 'TypeScript', lang: 'jsx', code: `import '@commmerce/ui';   // registers the elements and brings in their types
import type { DataTableColumn, SelectOption } from '@commmerce/ui';

const modal = document.querySelector('cm-modal')!;   // CmModal
modal.size = 'small';                                 // 'huge' is a type error
modal.show();

const columns: DataTableColumn[] = [{ key: 'total', label: 'Total', type: 'money', sortable: true }];
document.querySelector('cm-data-table')!.columns = columns;

const options: SelectOption[] = [{ value: 'paid', label: 'Paid' }];
document.querySelector('cm-select')!.options = options;` }])}
  ${h2('Reading values in input and change handlers')}
  <p><code>input</code>, <code>change</code> and <code>click</code> are ordinary DOM events, typed <code>Event</code>, so <code>e.target</code> is an <code>EventTarget</code>. Cast it to the element class to read <code>value</code> or <code>checked</code>. This is the same in React, Angular and plain TypeScript.</p>
  ${codeBlock([{ label: 'React', lang: 'jsx', code: `import { TextField, Checkbox } from '@commmerce/ui-react';
import type { CmTextField, CmCheckbox } from '@commmerce/ui';

<TextField label="Customer" value={name} onInput={(e) => setName((e.target as CmTextField).value)} />
<Checkbox label="Paid" checked={paid} onChange={(e) => setPaid((e.target as CmCheckbox).checked)} />` },
    { label: 'Angular', lang: 'jsx', code: `onStatus(e: Event) { this.status.set((e.target as CmSelect).value); }` }])}
  ${h2('Typed cm-* events')}
  <p><code>@commmerce/ui</code> does not declare its custom events, so <code>addEventListener('cm-close', (e) => e.detail)</code> is a type error: <code>e</code> is a plain <code>Event</code>. (The React wrappers' event props are typed; this is for everything else.) Add a declaration file to your project with the events you use. It types <code>addEventListener</code> everywhere, and Angular's <code>$event</code> in templates too.</p>
  ${codeBlock([{ label: 'cm-events.d.ts', lang: 'jsx', code: `// Types for the cm-* events your app listens to. Add the ones you use.
import type { CloseReason, SortDirection } from '@commmerce/ui';

declare global {
  interface HTMLElementEventMap {
    'cm-close': CustomEvent<{ reason: CloseReason }>;
    'cm-sort': CustomEvent<{ key: string; direction: SortDirection }>;
    'cm-page-change': CustomEvent<{ page: number }>;
    'cm-page-size-change': CustomEvent<{ pageSize: number }>;
    'cm-selection-change': CustomEvent<{ selected: string[]; all: boolean }>;
    'cm-search': CustomEvent<{ value: string }>;
  }
}` }, { label: 'Usage', lang: 'jsx', code: `document.querySelector('cm-modal')!.addEventListener('cm-close', (e) => {
  if (e.detail.reason === 'backdrop') e.preventDefault();   // e.detail.reason is a CloseReason
});` }])}
  <p>Every event and its <code>detail</code> is listed under Events on each component's page. In Angular, include the file in <code>tsconfig.json</code> (for example <code>"include": ["src/**/*.d.ts"]</code>).</p>
  ${h2('Element properties in templates')}
  ${table(['Framework', 'Out of the box', 'To type-check cm-* properties'], [
    ['React', 'Typed through <code>@commmerce/ui-react</code>.', 'Nothing to add.'],
    ['Vue (vue-tsc)', 'cm-* tags accept anything.', 'Declare them as global components (below). vue-tsc then reports <code>size="huge"</code> on <code>cm-modal</code>, a string for <code>:rows</code> on <code>cm-text-field</code>, and a column without a <code>key</code>.'],
    ['Svelte (svelte-check)', 'cm-* tags accept anything, and event handler parameters are implicitly <code>any</code> (an error under <code>strict</code>).', 'Add them to <code>SvelteHTMLElements</code> (below). svelte-check then reports the same mistakes, and <code>e.currentTarget</code> is the element class.'],
    ['Angular', '<code>CUSTOM_ELEMENTS_SCHEMA</code> turns off checking of bindings on cm-* elements, even with <code>strictTemplates</code>.', 'Not available for property bindings. Type your component fields with the package\'s types (<code>DataTableColumn[]</code>…) and declare events as above.'],
  ].map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`))}
  <p>Both snippets use one helper that picks an element class's public properties. Add a line for each element you use.</p>
  ${codeBlock([{ label: 'Vue: cm-elements.d.ts', lang: 'jsx', code: `import type { DefineComponent } from 'vue';
import type { CmButton, CmCheckbox, CmDataTable, CmModal, CmSelect, CmTextField } from '@commmerce/ui';

/** The public properties of a Commmerce UI element class, all optional. */
type CmProps<C extends { properties: object; prototype: HTMLElement }> =
  Partial<Pick<C['prototype'], Extract<keyof C['properties'], keyof C['prototype']>>>;

declare module 'vue' {
  interface GlobalComponents {
    'cm-button': DefineComponent<CmProps<typeof CmButton>>;
    'cm-text-field': DefineComponent<CmProps<typeof CmTextField>>;
    'cm-select': DefineComponent<CmProps<typeof CmSelect>>;
    'cm-checkbox': DefineComponent<CmProps<typeof CmCheckbox>>;
    'cm-modal': DefineComponent<CmProps<typeof CmModal>>;
    'cm-data-table': DefineComponent<CmProps<typeof CmDataTable>>;
  }
}` }, { label: 'Svelte: cm-elements.d.ts', lang: 'jsx', code: `import type { HTMLAttributes } from 'svelte/elements';
import type { CloseReason, CmButton, CmCheckbox, CmDataTable, CmModal, CmSelect, CmTextField } from '@commmerce/ui';

/** The public properties of a Commmerce UI element class, all optional. */
type CmProps<C extends { properties: object; prototype: HTMLElement }> =
  Partial<Pick<C['prototype'], Extract<keyof C['properties'], keyof C['prototype']>>>;

declare module 'svelte/elements' {
  interface SvelteHTMLElements {
    'cm-button': HTMLAttributes<CmButton> & CmProps<typeof CmButton> & { form?: string };
    'cm-text-field': HTMLAttributes<CmTextField> & CmProps<typeof CmTextField>;
    'cm-select': HTMLAttributes<CmSelect> & CmProps<typeof CmSelect>;
    'cm-checkbox': HTMLAttributes<CmCheckbox> & CmProps<typeof CmCheckbox>;
    'cm-modal': HTMLAttributes<CmModal> & CmProps<typeof CmModal> & {
      'oncm-close'?: (e: CustomEvent<{ reason: CloseReason }>) => void;
    };
    'cm-data-table': HTMLAttributes<CmDataTable> & CmProps<typeof CmDataTable> & { 'caption-hidden'?: boolean };
  }
}` }])}
  ${note('Types only: the Vue declaration does not register anything at runtime. Keep <code>isCustomElement</code> in your Vite config so Vue still renders the real elements. Properties whose attribute name differs (<code>caption-hidden</code> for <code>captionHidden</code>) need their own line in Svelte, as above.')}` });

pages['/start/themes'] = () => ({ title: 'Themes and tokens', html: `
  <h1>Themes and tokens</h1>
  <p class="lead">One stylesheet holds every token as a CSS variable, with a light and a dark value. Components read them, and so should your own CSS.</p>
  ${h2('Load the tokens')}
  ${codeBlock([{ label: 'HTML', lang: 'html', code: `<link rel="stylesheet" href="${PREVIEW.font}">\n<link rel="stylesheet" href="${PREVIEW.css}">` }])}
  <p>The first link loads Poppins, which ships with <code>@commmerce/tokens</code> (<code>fonts.css</code> and the <code>fonts/</code> folder next to it; from npm, <code>import '@commmerce/tokens/fonts.css'</code>). It is self-hosted, so pages never contact Google Fonts. Set the font on your page so text outside components matches:</p>
  ${codeBlock([{ label: 'CSS', lang: 'html', code: `body {
  background: var(--cm-bg-page);
  color: var(--cm-text-default);
  font-family: var(--cm-font-sans);
}` }])}
  ${h2('Pick a theme')}
  ${codeBlock([{ label: 'HTML', lang: 'html', code: `<html data-cm-theme="light">  <!-- default -->
<html data-cm-theme="dark">
<html data-cm-theme="auto">   <!-- follows the operating system -->` }])}
  <p>The attribute works on any element, so one area can be dark. The switch in this site's header uses it.</p>
  ${note('When your app is embedded, follow the admin\'s theme: <a href="#/apps/app-bridge">App Bridge</a> gives it in <code>app.ready</code> and the <code>theme.change</code> event. Outside the admin, use <code>auto</code>.')}
  ${h2('Pick a look', 'looks')}
  <p>Next to the theme, <code>data-cm-look</code> picks the look. Commmerce products use <code>refined</code>, and so does this site:</p>
  ${codeBlock([{ label: 'HTML', lang: 'html', code: `<html data-cm-theme="light" data-cm-look="refined">` }])}
  ${table(['', 'Default (no attribute)', 'Refined'], [
    '<tr><th scope="row">Text</th><td>Poppins</td><td>Poppins</td></tr>',
    '<tr><th scope="row">Greys</th><td>The original Commmerce greys</td><td>Neutral greys with darker supporting text</td></tr>',
    '<tr><th scope="row">Counts, selected tab, selected rows</th><td>Blue counts, black tab line, grey selected rows</td><td>Commmerce blue (<code>--cm-nav-badge</code>) counts and tab line, light blue selected rows and initials avatar (<code>--cm-nav-badge-soft</code>)</td></tr>',
    '<tr><th scope="row">Toned badges</th><td>No dot</td><td>A dot before the label</td></tr>',
  ])}
  <p>Both looks work in light, dark and auto themes and use the same tokens, so your CSS needs no changes. Status colours (success, critical, attention) are the same in both. Apps shown inside the admin should follow the admin and not set a look of their own.</p>
  ${h2('Use tokens in your CSS')}
  <p>Use semantic tokens (<code>--cm-bg-surface</code>, <code>--cm-text-default</code>, <code>--cm-border-input</code>) so your styles follow the theme and future changes. The <code>gray-*</code> scale is raw palette and does not change between themes. Browse every token in <a href="#/foundations/tokens">Tokens</a>.</p>` });

pages['/start/troubleshooting'] = () => ({ title: 'Troubleshooting', html: `
  <h1>Troubleshooting</h1>
  <p class="lead">The problems people hit first, and how to fix them.</p>
  ${table(['What you see', 'Why', 'Fix'], [
    ['Elements show as plain text, unstyled', 'The component script did not load or ran as a classic script.', 'Load it with <code>type="module"</code>. Check the browser console and network tab for the script URL.'],
    ['Components look right but the page font is a default serif', 'Only components use the tokens on their own.', 'Set <code>font-family: var(--cm-font-sans)</code> on <code>body</code>.'],
    ['Colours are missing or everything is black', 'The tokens stylesheet is not loaded.', 'Add the <code>tokens.css</code> link before the script.'],
    ['Text is in the system font, not Poppins', 'The font stylesheet is not loaded. Since 1.0.0-rc.3, <code>tokens.css</code> no longer loads it.', 'Add the <code>fonts.css</code> link (or <code>import \'@commmerce/tokens/fonts.css\'</code>) before <code>tokens.css</code>. If you copy the files to your own server, keep the <code>fonts/</code> folder next to <code>fonts.css</code>.'],
    ['Dark theme does nothing', 'No theme attribute is set.', 'Set <code>data-cm-theme="dark"</code> or <code>"auto"</code> on <code>&lt;html&gt;</code>.'],
    ['Form values are missing on submit', 'The control has no <code>name</code>, or is outside the form.', 'Give each control a <code>name</code> and put it inside the <code>&lt;form&gt;</code>.'],
    ['Nothing happens in older Safari', 'Safari before 16.4 lacks form-associated custom elements.', 'Use a current browser; see <a href="#/support">supported browsers</a>.'],
    ['React event handler never fires', 'React 18 does not attach listeners for custom element events.', 'Use the <code>@commmerce/ui-react</code> wrappers, or attach the listener with a ref (see <a href="#/start/install">Install</a>).'],
    ['<code>npm install @commmerce/ui</code> installs an old version', 'Your lockfile pins an earlier release.', 'Run <code>npm install @commmerce/ui@latest</code> after reading the <a href="#/releases">release notes</a>.'],
  ].map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`))}
  <p>Still stuck? Email ${mail('Commmerce UI: setup problem')} with your browser, the page markup and what you see.</p>` });


pages['/start/flutter'] = () => ({ title: 'Flutter', html: `
  <h1>Flutter ${badge('ready')}</h1>
  <p class="lead">The <code>commmerce_ui</code> Flutter package brings the same tokens, theme, icons and widgets to Flutter apps on the web, desktop, phones and tablets.</p>
  <p class="status-line"><span class="muted">${STABLE ? 'Version' : 'Preview, version'} ${PREVIEW.version}. Built and tested with Flutter 3.32. ${STABLE ? 'Widget constructors follow the compatibility policy.' : 'Widget APIs can change between releases.'}</span></p>
  <p><a class="more" href="flutter/" target="_blank" rel="noopener">Open the live Flutter demo →</a> <span class="muted small">(the Commmerce admin dashboard, orders and product editor, rebuilt with the package, plus a Components page with every newer widget; resize the window to see the phone and tablet layouts)</span></p>
  ${h2('Install')}
  <p>The package is not on pub.dev yet. Add it from the public repository:</p>
  ${codeBlock([{ label: 'pubspec.yaml', lang: 'html', code: `dependencies:
  commmerce_ui:
    git:
      url: https://github.com/commmerce-dev/commmerce-ui.git
      path: flutter/commmerce_ui
      ref: v${PREVIEW.version}   # a release tag; change it to upgrade` }])}
  ${note(`The package will be published on pub.dev later. Until then, install it from the repository as above. Questions: ${mail('Flutter package')}.`)}
  ${h2('Set up the theme')}
  ${codeBlock([{ label: 'main.dart', lang: 'jsx', code: `import 'package:commmerce_ui/commmerce_ui.dart';

MaterialApp(
  theme: CmTheme.light(),
  darkTheme: CmTheme.dark(),
  themeMode: ThemeMode.system,
  home: const OrdersPage(),
);

// Tokens anywhere: CmTheme.colorsOf(context).textTertiary, CmSpace.s20, CmRadius.md` }])}
  <p>Poppins is bundled, so text matches the admin offline on every platform.</p>
  ${h2('The admin shell')}
  <p><code>CmAdminScaffold</code> lays out the header, the side navigation and a content panel, and adapts to the screen:</p>
  ${table(['Screen', 'Width', 'Navigation'], [
    ['<tr><td>Desktop</td><td>1100px and wider</td><td>Black side navigation, always open, with expandable groups</td></tr>'],
    ['<tr><td>Tablet</td><td>600–1099px</td><td>Icon rail with tooltips</td></tr>'],
    ['<tr><td>Phone</td><td>Below 600px</td><td>Drawer, opened from the header’s menu button</td></tr>'],
  ].map((r) => r[0]))}
  ${codeBlock([{ label: 'Dart', lang: 'jsx', code: `CmAdminScaffold(
  navItems: const [
    CmNavItem(id: 'dashboard', label: 'Dashboard', icon: CmIcons.home),
    CmNavItem(id: 'catalog', label: 'Catalog', icon: CmIcons.box, children: [
      CmNavItem(id: 'products', label: 'Products'),
    ]),
    CmNavItem(id: 'orders', label: 'Orders', icon: CmIcons.bag, count: 3),
  ],
  selectedId: page,
  onNavSelected: (item) => setState(() => page = item.id),
  header: (context, openMenu) => CmHeaderBar(
    logo: Image.asset('assets/logo.png'),
    storeName: 'preprod.commmerce.com',
    walletBalance: '₹ 2,312',
    userName: 'Demo user',
    onMenuTap: openMenu, // set on phones only
  ),
  body: const DashboardPage(),
)` }])}
  ${h2('Widgets')}
  ${table(['Group', 'Widgets'], FLUTTER_WIDGETS.map(([g, w]) => `<tr><td>${g}</td><td><code>${w.split(', ').join('</code>, <code>')}</code></td></tr>`))}
  <p>Each widget follows its web component: the same sizes, states, words and accessibility (semantic labels, keyboard focus, announced errors). Overlays open as routes with <code>showCmModal</code>, <code>showCmSidePanel</code>, <code>showCmFilterPanel</code>, <code>showCmBottomSheet</code> and <code>showCmNotificationPanel</code>, which complete with the value the overlay closed with: the page behind is dimmed and hidden from screen readers, focus moves in and stays inside, Esc closes, and focus returns to the opener. <code>CmActionMenu</code> is anchored to its trigger and follows the web menu keyboard model. <code>showCmToast</code> shows a toast at the bottom of the screen and announces each one to screen readers on its own. <code>CmLayout</code> and <code>CmGrid</code> measure their own width, not the window, so they stack correctly inside narrow columns.</p>
  ${h2('Other languages')}
  <p>Text the widgets write themselves (button labels such as Save and Discard, screen-reader names such as "Previous page", "2 products selected") comes from <code>CmStrings</code>. English is the default; wrap your app once to translate it. Text you pass in, and constructor parameters that already name a piece of text (<code>closeLabel</code>, <code>CmSaveBar.message</code>…), stay as you set them.</p>
  ${codeBlock([{ label: 'Dart', lang: 'jsx', code: `MaterialApp(
  theme: CmTheme.light(),
  builder: (context, child) => CmLocalizations(
    strings: CmStrings(
      saveBarSave: 'Enregistrer',
      saveBarDiscard: 'Annuler',
      previousPage: 'Page précédente',
      nextPage: 'Page suivante',
    ),
    child: child!,
  ),
  home: const OrdersPage(),
)` }])}
  <p>Text with values in it is a function, so plural rules stay yours. Right-to-left layout of the Flutter widgets has not been checked yet. The web components' equivalent is on <a href="#/foundations/localisation">Localisation and RTL</a>.</p>
  ${h2('Tokens stay in step')}
  <p>Colours, type, spacing, radii, shadows and icons are generated from the same source as the web packages (<code>npm run flutter:generate</code>), so a token change reaches web and Flutter together.</p>` });

/* ---- Build an admin app ---- */
pages['/apps'] = () => ({ title: 'How apps run in the admin', html: `
  <h1>How apps run in the admin</h1>
  <p class="lead">Apps add screens to the Commmerce admin. Commmerce UI is how those screens match the rest of it.</p>
  <div class="feature-links">
    <a class="path-card" href="#/apps/app-bridge"><strong>App Bridge ${badge('ready')}</strong><span class="path-what">App Bridge ${BRIDGE_LINE}</span><span class="path-go">App Bridge reference and live demo →</span></a>
    <a class="path-card" href="#/apps/starter"><strong>Starter app</strong><span class="path-what">A complete app to download, in Node (18+) or PHP (8.0+): a Commmerce UI page connected with App Bridge, a backend that verifies session tokens, and a stand-in admin to run it in. Also a React example app built from the npm packages.</span><span class="path-go">Download the starter →</span></a>
    <a class="path-card" href="#/apps/guidelines"><strong>App design guidelines</strong><span class="path-what">What an app needs to feel native in the admin: components and tokens, page structure, navigation, states, errors, the frame, performance, words, accessibility, branding, data and security.</span><span class="path-go">Read the guidelines →</span></a>
    <a class="path-card" href="#/apps/review-checklist"><strong>Marketplace review checklist</strong><span class="path-what">Every check an app should pass before it is listed in the marketplace, each with how to test it. Tick them off as you go.</span><span class="path-go">Open the checklist →</span></a>
  </div>
  ${statusKey()}
  ${table(['Capability', 'Status', 'Notes'], [
    ['Build app screens with Commmerce UI', badge('ready'), 'Components, tokens, icons and patterns in the hosted build.'],
    ['Run your app inside the admin', badge('ready'), `Live. To set up your app in a store, email ${mail('App in the Commmerce admin')}.`],
    ['App Bridge (admin navigation, toasts, modals, session tokens)', badge('ready'), `In the hosted build. Confirm your store's admin is connected first: <a href="#/apps/app-bridge">App Bridge</a>.`],
    ['Installable npm packages', badge('ready'), 'All five packages are on npm. <a href="#/start/install">Install</a>'],
  ].map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`))}
  ${h2('How it works')}
  <p>Your app is served from your own domain and shown inside the admin, in the page area. The admin keeps its header and navigation; your app draws everything below them, using Commmerce UI. With <a href="#/apps/app-bridge">App Bridge</a>, your app can also update the admin's address, open admin-level toasts and modals, and confirm who the merchant is.</p>
  ${h2('Steps')}
  <ol>
    <li>Build your screens with the <a href="#/start">hosted build</a>, pinned to a version.</li>
    <li>Follow the <a href="#/apps/guidelines">app design guidelines</a>, the <a href="#/apps/page-structure">page structure</a> and the <a href="#/patterns">patterns</a>.</li>
    <li>Keep navigation inside your app shallow: the admin provides the top level.</li>
    <li>Email ${mail('App in the Commmerce admin')} to set your app up in a store.</li>
    <li>Before you ask for a listing, test your app against the <a href="#/apps/review-checklist">marketplace review checklist</a>.</li>
  </ol>
  ${note(`Listing an app and getting it reviewed will happen in the Commmerce developer portal, not in these docs. Until the portal is available, email ${mail('App listing')}.`)}` });

const NATIVE = [
  ['Layout and navigation', 'ready', 'Page header, cards on `bg-page`, two-column detail pages, save and action bars. See [[page structure|/apps/page-structure]].', 'ready', 'The admin draws its header and side navigation around your app. Don\'t add your own.'],
  ['Merchant terminology and content', 'ready', 'Labels, buttons, errors, money and dates follow the [[content guidelines|/foundations/content]].', null, ''],
  ['Interaction and feedback', 'ready', 'Banners, save bar, empty states, skeletons, form errors, modals, side panels and menus behave the same way in every app.', 'ready', 'Admin-level toasts, modals, the save bar and the loading bar come from [[App Bridge|/apps/app-bridge]]; inside your app\'s page, use Modal and Side panel.'],
  ['Theme', 'ready', 'Light and dark themes through tokens; `data-cm-theme="auto"` follows the device. Apps use Commmerce\'s palette: merchant or app brand colours are not supported inside the admin, by design.', 'ready', 'Follow the admin\'s theme with [[App Bridge|/apps/app-bridge]] (`app.ready` and `theme.change`).'],
  ['Accessibility', 'ready', 'Keyboard behaviour, focus, labels and contrast are built in. See [[how it is checked|/foundations/accessibility]].', null, ''],
  ['Responsive and embedded constraints', 'ready', 'Components adapt from desktop to 414px phones.', 'ready', 'Call `app.autoResize()` so the admin sizes your frame to your page and the merchant scrolls the admin, not a box inside it.'],
];
const linkify = (s) => md(s).replace(/\[\[([^|]+)\|([^\]]+)\]\]/g, '<a href="#$2">$1</a>');
pages['/apps/native'] = () => ({ title: 'What makes an app native', html: `
  <h1>What makes an app native</h1>
  <p class="lead">A merchant should not notice when they move from a Commmerce screen into your app. That comes from six things, and Commmerce UI handles part of each one.</p>
  ${statusKey()}
  ${NATIVE.map(([area, s1, t1, s2, t2]) => `<section class="native-row"><h3>${area}</h3>
    <div class="native-cells"><div>${badge(s1)}<p>${linkify(t1)}</p></div>${s2 ? `<div>${badge(s2)}<p>${linkify(t2)}</p></div>` : ''}</div></section>`).join('')}
  ${h2('Checklist before you ship a screen')}
  <ul class="checklist">
    <li>Every control is a Commmerce UI component; no restyled native controls.</li>
    <li>The page starts with a page header; content sits in cards.</li>
    <li>Buttons start with a verb; errors say how to fix the problem.</li>
    <li>The screen works with only a keyboard, and in both themes.</li>
    <li>Loading, empty and error states are designed, not left blank.</li>
    <li>Colours come from Commmerce tokens, not your own brand palette.</li>
    <li>Your app does not use the Commmerce logo or imply Commmerce made it.</li>
  </ul>
  <p>The full guidance is in the <a href="#/apps/guidelines">app design guidelines</a>, and every check, with how to test it, is in the <a href="#/apps/review-checklist">marketplace review checklist</a>.</p>` });

pages['/apps/page-structure'] = () => ({ title: 'Page structure', html: `
  <h1>Page structure</h1>
  <p class="lead">Every admin screen has the same skeleton. Use it for every page in your app.</p>
  <div class="anatomy" aria-hidden="true">
    <div class="a-head">1 · Page header: breadcrumbs, title, up to three actions</div>
    <div class="a-body"><div class="a-main">2 · Main column: cards for what customers see</div><div class="a-side">3 · Side column: settings, status, summaries</div></div>
    <div class="a-foot">4 · Save bar or action bar, when there is something to commit</div>
  </div>
  <ol>
    <li><strong>Page header</strong> (<a href="#/components/page-header">component</a>): breadcrumbs back to the parent list, the page title as the only <code>h1</code>, and actions on the right. One primary action.</li>
    <li><strong>Main column</strong>: <a href="#/components/card">cards</a> on <code>bg-page</code>, <code>space-20</code> apart, each with a heading.</li>
    <li><strong>Side column</strong> on detail pages: about a third of the width, with <a href="#/components/info-panel">info panels</a> and settings cards. It moves under the main column on narrow screens. Records (a lead, a contact, an order, a product) use the <a href="#/patterns/record-page">record page</a> layout instead: a 320px aside beside the main column.</li>
    <li><strong>Save bar</strong> (<a href="#/components/save-bar">component</a>) when the page edits a record, or <strong>action bar</strong> (<a href="#/components/action-bar">component</a>) for the next step on a record.</li>
  </ol>
  ${h2('Widths and spacing')}
  <ul>
    <li>The admin is designed at 1440–1600px wide and at 414px for phones. Let your layout fill the page area; don't fix a width.</li>
    <li>Gaps: <code>space-20</code> to <code>space-30</code> on desktop, <code>space-10</code> to <code>space-22</code> on phones. See <a href="#/foundations/spacing">Spacing</a>.</li>
  </ul>
  <p>See the full layout working in the <a href="#/patterns/product-editor">product editor</a> and <a href="#/patterns/order-list">order list</a> patterns.</p>` });

// Marks something the owner has not decided yet (a process detail, a requirement, a number). Kept visible so
// developers know it is open, and listed in BUILD-LOG.md so it gets decided.
const tbd = (text) => `<span class="tbd"><cm-badge tone="information">To be decided</cm-badge> ${text}</span>`;

/* ---- App design guidelines ---- */
const GUIDE_HEADER = `<cm-page-header heading="Reviews" breadcrumbs='[{"label":"Product reviews","href":"#"}]'>
  <cm-button slot="actions" size="large" variant="primary">Request Reviews</cm-button>
</cm-page-header>`;
const GUIDE_STATES = `<div class="stack" style="gap:var(--cm-space-20)">
  <cm-card heading="Reviews">
    <div aria-busy="true" style="display:flex;gap:var(--cm-space-15);align-items:center">
      <cm-skeleton variant="thumbnail" size="large"></cm-skeleton>
      <cm-skeleton lines="2" style="flex:1"></cm-skeleton>
    </div>
  </cm-card>
  <cm-banner tone="critical" heading="Reviews could not be loaded">
    Nothing was changed. Check your connection and try again.
    <cm-button slot="actions" size="slim">Try Again</cm-button>
  </cm-banner>
  <cm-card heading="Reviews">
    <cm-empty-state size="small" icon="star" heading="No reviews yet">
      Reviews appear here when customers rate a product they bought.
      <cm-button slot="actions" variant="primary">Request Reviews</cm-button>
    </cm-empty-state>
  </cm-card>
</div>`;
// Which piece of UI to use for each job, inside the admin.
const BRIDGE_OR_PAGE = [
  ['Confirm that something worked', '`app.toast.show()`', 'Nothing: no toast inside your frame. Outside the admin, `showToast()`.'],
  ['Unsaved changes', '`app.saveBar.show()`, then `saveBar.save` and `saveBar.discard`', 'No Save or Cancel buttons that copy the save bar, no bar fixed to the bottom of your frame.'],
  ['Confirm a destructive action', '`app.modal.open()` (title, message and two actions)', '[[Modal|/components/modal]], when the dialog needs anything beyond a title, a message and two buttons.'],
  ['A form in an overlay (edit, add, filter)', 'Not in App Bridge: its modal takes text and actions only.', '[[Modal|/components/modal]] or [[Side panel|/components/side-panel]] inside your frame.'],
  ['Choose products, customers or collections', '`app.resourcePicker()`', 'Your own picker only for things App Bridge doesn\'t offer.'],
  ['Work that takes more than a second', '`app.loading.start()` / `stop()`', '[[Skeletons|/components/skeleton]] in the place the content will appear.'],
  ['Move to another screen of your app', '`app.navigate(path)`', 'Your own router draws the screen; App Bridge keeps the admin\'s address in step.'],
];
const PERF = [
  ['Largest contentful paint (the first screen is readable)', '2.5 s or less', 'Google\'s "good" threshold for Core Web Vitals, at the 75th percentile of page loads. Inside the admin, the merchant has already waited for the admin itself.'],
  ['Interaction to next paint (a tap or key gets a response)', '200 ms or less', 'Core Web Vitals "good" threshold. Merchants work through lists quickly; a slow tick or tab switch feels broken.'],
  ['Cumulative layout shift', '0.1 or less', 'Core Web Vitals "good" threshold. With `autoResize()`, every jump in your page also resizes the admin\'s frame, so it is felt twice. Skeletons the size of the real content keep it still.'],
  ['Your own JavaScript for the first screen', '150 KB or less, compressed', 'The whole Commmerce UI component library (`cdn.js`) is about 56 KB compressed, and App Bridge about 7 KB (measured on 1.0.0-rc.4). JavaScript costs the most to load on phones, because it is parsed and run as well as downloaded. Load the rest when a screen needs it.'],
  ['Feedback for slow work', 'Within 1 second', 'Show the admin\'s loading bar (`app.loading.start()`) or skeletons for anything that takes longer, as App Bridge recommends.'],
];

pages['/apps/guidelines'] = () => ({ title: 'App design guidelines', html: `
  <h1>App design guidelines</h1>
  <p class="lead">How to build an app that merchants can't tell apart from the rest of the Commmerce admin: the components, page structure, App Bridge features, states, words, accessibility, branding and security it needs.</p>
  <p>These guidelines expand <a href="#/apps/native">what makes an app native</a>. Before you submit an app, test it against the <a href="#/apps/review-checklist">marketplace review checklist</a>, which turns each guideline into a pass or fail check.</p>

  ${h2('Use Commmerce UI components and tokens', 'components')}
  <p>Build every control from <a href="#/components">Commmerce UI components</a>, and style everything else with <a href="#/foundations/tokens"><code>--cm-*</code> tokens</a>. Then your app gets the admin's keyboard behaviour, focus, error messages and dark theme, and keeps them when Commmerce UI changes.</p>
  ${doDont([
    'Use `cm-button`, `cm-text-field`, `cm-select` and the other components for every control.',
    'Use semantic tokens (`--cm-bg-surface`, `--cm-text-default`, `--cm-space-20`) in your own CSS.',
    'Pin one version of Commmerce UI (`/v/<version>/` or an exact npm version) and upgrade after reading the [[release notes|/releases]].',
    'Start from a [[pattern|/patterns]] that is close to your screen.',
  ], [
    'Don\'t restyle native inputs or buttons to look like Commmerce UI, or mix in another UI kit.',
    'Don\'t use your brand colours, the raw `gray-*` scale or hex values: the admin uses Commmerce\'s palette only.',
    'Don\'t load `/vendor/` (always the latest release) in an app merchants use.',
    'Don\'t draw admin navigation: [[Side navigation|/components/side-navigation]] and the [[header bar|/components/header-bar]] are for Commmerce\'s own products.',
  ])}

  ${h2('Page structure', 'page-structure')}
  <p>Every screen follows the admin's <a href="#/apps/page-structure">page structure</a>: a page header, then cards on <code>bg-page</code>, with a side column on detail pages.</p>
  <ul>
    <li><strong>One page header per screen</strong>, with the screen title as its only <code>h1</code> and breadcrumbs back to the parent screen of your app.</li>
    <li><strong>One primary action</strong>, the thing most merchants come to the screen to do, at the right of the header. Up to two secondary actions next to it; put the rest in an <a href="#/components/action-menu">action menu</a>.</li>
    <li><strong>The admin's save bar, toasts and modals</strong>, through App Bridge, so they cover the whole admin like the admin's own (table below).</li>
  </ul>
  <div class="ex-stage ex-stage--inline"><div style="width:100%;min-width:0">${GUIDE_HEADER}</div></div>
  ${codeBlock([{ label: 'HTML', lang: 'html', code: GUIDE_HEADER }, { label: 'React', lang: 'jsx', code: toReact(GUIDE_HEADER) }])}
  <h3 id="bridge-or-page">App Bridge or a component in your page?</h3>
  ${table(['Job', 'Inside the admin, use', 'In your page'], BRIDGE_OR_PAGE.map((r) => `<tr>${r.map((c) => `<td>${md(c)}</td>`).join('')}</tr>`))}
  <p>Keep the in-page versions as a fallback: until your store's admin answers App Bridge, <code>app.ready</code> rejects (see <a href="#/apps/app-bridge">App Bridge</a>).</p>

  ${h2('Navigation', 'navigation')}
  <p>The admin draws the header and the side navigation, and your app has one entry in it. Inside your app, keep the structure shallow: a first screen that lists things, a screen for each thing, and settings.</p>
  ${doDont([
    'Route inside your frame and call `app.navigate(path)` on every screen change, so the admin\'s address matches the screen.',
    'Link back up with the page header\'s breadcrumbs.',
    'Move focus to the top of the new screen after each change (see [[Accessibility|/apps/guidelines?s=accessibility]]).',
    'Open links to other websites in a new tab (`target="_blank" rel="noopener"`).',
  ], [
    'Don\'t draw your own header, side navigation or top-level tabs that copy the admin\'s.',
    'Don\'t change the admin window\'s address yourself (`window.top.location`), or open your app in a new window to escape the frame.',
    'Don\'t put a "Home" or "Back to Commmerce" link in your app: the admin already has them.',
  ])}
  ${codeBlock([{ label: 'JavaScript', lang: 'jsx', code: `// <main id="screen" tabindex="-1"> wraps the screen your router draws.
async function show(path) {
  render(path);                                // draw the screen
  document.getElementById('screen').focus();   // keyboard and screen-reader users start at the top
  await app.navigate(path);                    // the admin's address follows: /reviews/42
}` }])}
  <p>When the app opens after a reload or from a shared link, <code>app.ready</code> gives the screen to show in <code>path</code> (<code>/</code> when there is none; admins older than 1.0.0-rc.5 leave it out). When the merchant presses Back or Forward, the admin sends <code>path.change</code>: show that screen without calling <code>navigate</code> again.</p>
  ${codeBlock([{ label: 'JavaScript', lang: 'jsx', code: `const { path = '/' } = await app.ready;   // reload or shared link: open the same screen
render(path);
app.on('path.change', ({ path }) => {      // Back or Forward in the admin
  render(path);
  document.getElementById('screen').focus();
});` }])}
  <p>See it working in the <a href="#/patterns/app-layout">embedded app layout pattern</a>.</p>

  ${h2('Loading and empty states', 'states')}
  <p>Never leave a blank frame. Draw the page header straight away, then:</p>
  <ul>
    <li><strong>Loading</strong>: skeletons in the place the content will appear, and <code>app.loading.start()</code> for work that takes more than a second. Not a spinner over an empty page.</li>
    <li><strong>Empty</strong>: an <a href="#/components/empty-state">empty state</a> that says what will appear here and offers the one action that fills it. A search with no results is different: suggest changing the search or filters.</li>
    <li><strong>First run</strong>: if the app needs setting up, the first screen is the set-up, with the steps in order.</li>
  </ul>
  <div class="ex-stage ex-stage--inline"><div style="width:100%;max-width:560px">${inlineLayout(GUIDE_STATES)}</div></div>
  ${codeBlock([{ label: 'HTML', lang: 'html', code: inlineLayout(GUIDE_STATES) }, { label: 'React', lang: 'jsx', code: toReact(inlineLayout(GUIDE_STATES)) }])}
  <p>All four states, live: <a href="#/patterns/states">empty, loading, error and success states</a>.</p>

  ${h2('Errors', 'errors')}
  <ul>
    <li><strong>Your backend fails</strong>: a critical <a href="#/components/banner">banner</a> at the top of the area that failed, saying what failed, that nothing was lost (if so), and a Try Again action.</li>
    <li><strong>A field is wrong</strong>: the field's <code>error</code>, saying how to fix it ("Enter a price above 0"). Check when the merchant saves, and move focus to the first field with an error. See the <a href="#/patterns/product-editor">product editor</a> and Validation below.</li>
    <li><strong>App Bridge refuses a request</strong>: every call rejects with an <code>AppBridgeError</code> and a <code>code</code> (<a href="#/apps/app-bridge?s=requests">codes</a>). Catch it, and fall back to the in-page component where there is one.</li>
    <li><strong>App Bridge doesn't connect</strong>: <code>app.ready</code> rejects with <code>timeout</code> after 10 seconds, or <code>createApp</code> throws when the page is not inside a matching admin. Show a banner that says the app must be opened from the Commmerce admin, not a broken page.</li>
    <li><strong>The session is refused</strong> (your backend answers 401 or 403): say the merchant needs to reload the app, or that the app is not installed in this store. Never show a sign-in form of your own inside the admin.</li>
  </ul>

  ${h2('Validation', 'validation')}
  <p>Since 1.14 every form field checks itself and shows its own message under the box, the same way as <code>error</code>.</p>
  <ul>
    <li><strong>When the merchant leaves a field they changed</strong>, a problem with the format, range or length shows straight away: "Enter an email address like name@example.com.", "Enter 10 or less.", "Enter at least 8 characters.". An empty required field doesn't complain just because someone tabbed past it.</li>
    <li><strong>When a save fails</strong> (a submit button, Enter, or the <a href="#/components/save-bar">save bar</a>), every invalid field shows its message, required ones too, and focus moves to the first one. The browser's own bubble isn't used. Set rules with <code>required</code>, <code>min</code>, <code>max</code>, <code>step</code>, <code>type</code> and, on the <a href="#/components/text-field">text field</a>, <code>pattern</code>, <code>minlength</code> and <code>maxlength</code>.</li>
    <li><strong>The message follows the value</strong>: it changes while the merchant types and goes once the value is right.</li>
    <li><strong>Answers from your server</strong> ("This SKU is already used") go in <code>error</code>, which always wins over the field's own message. Clear it when the merchant changes the value.</li>
    <li><strong>Silent checks</strong> such as <code>form.checkValidity()</code> to enable a button show nothing. A form with <code>novalidate</code> leaves all checking to you.</li>
    <li><strong>Check every value again on your server.</strong> Checks in the browser help people fill in the form, but anyone can get round them with the browser's developer tools or by calling your API directly.</li>
  </ul>

  ${h2('Responsive behaviour in the frame', 'responsive')}
  <p>Your app runs in a frame in the admin's page area. The merchant should scroll the admin, never a box inside it.</p>
  <ul>
    <li>Call <code>app.autoResize()</code> once after your first screen renders. The admin then keeps the frame as tall as your page.</li>
    <li>Don't size content with <code>vh</code> units or fix the height of the page; <code>autoResize()</code> measures your content, not the window.</li>
    <li>Don't fix bars to the bottom of your frame: fixed-position elements are left out of the measured height, and the admin's save bar already covers that job.</li>
    <li>Let your layout fill the width you are given. The admin is designed at 1440–1600px and at 414px for phones; test at 375px too. Every ready component adapts, and component pages list exactly how under "Responsive behaviour". "The window" there means your frame.</li>
  </ul>

  ${h2('Performance', 'performance')}
  <p>Recommended budgets for every screen, measured inside the admin on a mid-range phone:</p>
  ${table(['Measure', 'Budget', 'Why'], PERF.map((r) => `<tr>${r.map((c) => `<td>${md(c)}</td>`).join('')}</tr>`))}
  <ul>
    <li>Call <code>createApp()</code> as soon as the page loads, and fetch your data at the same time, not after <code>app.ready</code>.</li>
    <li>Load Commmerce UI from a pinned <code>/v/&lt;version&gt;/</code> address: those files never change, so browsers keep them.</li>
    <li>Don't call your backend once per row: send one request per screen and page long lists with <a href="#/components/pagination">Pagination</a>.</li>
  </ul>
  <p>${tbd('Whether the marketplace review measures these budgets, and with which tool and device, is not decided yet.')}</p>

  ${h2('Content and voice', 'content')}
  <p>Follow the <a href="#/foundations/content">content guidelines</a>: plain, direct and calm, written for a busy merchant.</p>
  <ul>
    <li>Use the admin's words for the admin's things: orders, products, customers, collections, and the <a href="#/patterns/inventory-fulfilment">fulfilment and stock status words</a>.</li>
    <li>Buttons start with a verb and name what happens ("Delete review", never "OK" or "Yes").</li>
    <li>Errors say what happened and how to fix it. No exclamation marks and no blame.</li>
    <li>Money is "Rs." with Indian digit grouping (Rs. 1,24,999). Format dates for the staff member's locale, which App Bridge gives in <code>app.ready</code> (<code>locale</code>, for example <code>en-IN</code>).</li>
    <li>Call your app by the same name everywhere: the listing, the admin's navigation and your page titles.</li>
  </ul>

  ${h2('Accessibility', 'accessibility')}
  <p>Apps must meet <strong>WCAG 2.2 level AA</strong>. Commmerce UI components handle much of it (see <a href="#/foundations/accessibility">what they do and how they are checked</a>); the rest depends on how you put them together.</p>
  <ul>
    <li><strong>Keyboard</strong>: every action works with Tab, Shift+Tab, Enter, Space, Esc and the arrow keys in menus and tabs. No keyboard traps.</li>
    <li><strong>Focus</strong>: always visible, in reading order, moved to the top of a new screen after navigation and to the first error after a failed save. Overlays return focus to what opened them (the components do this).</li>
    <li><strong>Names</strong>: every field has a visible <code>label</code>, every icon-only button a <code>label</code>, every screen one <code>h1</code> and every card a heading.</li>
    <li><strong>Colour</strong>: never the only way to show meaning. Your own colours, images with text and charts reach 4.5:1 for text and 3:1 for graphics.</li>
    <li><strong>Reflow and zoom</strong>: at 320px wide and at 200% zoom, nothing is cut off and nothing scrolls sideways.</li>
    <li><strong>Targets</strong>: controls of your own are at least 24 × 24px.</li>
    <li><strong>Motion</strong>: your own animations stop with <code>prefers-reduced-motion</code>.</li>
  </ul>
  <p>Test with an automated checker (axe-core with the WCAG 2.2 A and AA rules) on every screen in both themes, then by hand with only a keyboard. Automated tools find only part of the problems people meet.</p>

  ${h2('Branding', 'branding')}
  <p>Your app has its own name and icon. It runs inside Commmerce, but Commmerce didn't make it, and merchants must be able to tell.</p>
  ${doDont([
    'Use your own app name and your own icon or logo, in the listing and the admin navigation.',
    'Say who made the app (your company) in the listing and on the app\'s settings or help screen.',
    'Describe what the app works with in plain words: "Sends review requests for your Commmerce orders".',
  ], [
    'Don\'t use the Commmerce logo, wordmark or M mark anywhere: in the app, the icon, the listing or screenshots. They are for Commmerce\'s own products only ([[Logo|/foundations/logo]]).',
    'Don\'t imply Commmerce made, endorses, certifies or partners with your app ("Official Commmerce app", "Commmerce approved").',
    'Don\'t add your brand colours to the admin: apps use Commmerce\'s palette.',
  ])}
  <p>${tbd('Whether app names may contain the word "Commmerce" (for example "Reviews for Commmerce"), and the size and file format of the app icon, are not decided yet.')} In the marketplace, the <a href="#/components/app-card">app card</a> shows your logo in a 130 × 54px tile (100 × 40px in narrow columns).</p>

  ${h2('Data and privacy', 'data')}
  <ul>
    <li><strong>Never trust the frame.</strong> Anything that comes from the browser, including query strings, form fields, headers and messages, can be changed by whoever is using it. Only the session token, verified on your server, tells you which store and staff member is asking.</li>
    <li><strong>Verify every request on your server</strong> with <code>verifySessionToken</code> from <code>@commmerce/app-bridge/session-token</code> (or <code>SessionToken::verify()</code> in the PHP starter): signature, expiry, your API key as <code>aud</code>, and the admin as <code>issuer</code>. See <a href="#/apps/app-bridge?s=session-tokens">Session tokens</a>.</li>
    <li><strong>Take the store from the token</strong> (<code>dest</code>), and answer 403 for stores that didn't install your app.</li>
    <li><strong>Keep the app secret on your server</strong>: not in the page, your JavaScript, git or logs.</li>
    <li><strong>Collect only what the app needs</strong>, and tell merchants what you store and why.</li>
  </ul>
  <p>${tbd('Privacy policy requirements for listed apps, and what happens to a store\'s data when it uninstalls an app, are not decided yet.')}</p>

  ${h2('Security', 'security')}
  <ul>
    <li><strong>App Bridge checks origins for you.</strong> It finds the admin's origin, checks it against your <code>hostOrigin</code>, and then posts only to that one origin and ignores messages from any other. Give it <code>hostOrigin</code> from your settings (<code>https://*.commmerce.com</code>), never hard-coded. See <a href="#/apps/app-bridge?s=admin-origin">Admin origin</a>.</li>
    <li><strong>Only the admin may frame your app.</strong> Send <code>Content-Security-Policy: frame-ancestors https://*.commmerce.com</code> on every page. Don't use <code>frame-ancestors *</code>, and don't send <code>X-Frame-Options: DENY</code> or <code>SAMEORIGIN</code>: they stop the admin showing your app.</li>
    <li><strong>Don't rely on cookies for sign-in.</strong> Inside the admin your app is a third-party frame, where many browsers block or partition cookies (Safari does by default). Use the session token on every request instead.</li>
    <li><strong>Show text as text.</strong> Product names, reviews and customer details can contain markup. Set <code>textContent</code> or component properties; never insert them as HTML.</li>
    <li><strong>Serve everything over HTTPS.</strong></li>
  </ul>
  ${codeBlock([{ label: 'nginx', lang: 'sh', code: `add_header Content-Security-Policy "frame-ancestors https://*.commmerce.com" always;` },
    { label: 'Node.js', lang: 'jsx', code: `res.setHeader('Content-Security-Policy', \`frame-ancestors \${process.env.COMMMERCE_ADMIN_ORIGIN}\`);` },
    { label: 'PHP', lang: 'html', code: `header('Content-Security-Policy: frame-ancestors ' . getenv('COMMMERCE_ADMIN_ORIGIN'));` }])}
  <p>The <a href="#/apps/starter">starter apps</a> do all of this, with tests. Use the same setting (<code>COMMMERCE_ADMIN_ORIGIN</code>) for <code>hostOrigin</code>, the token's issuer and <code>frame-ancestors</code>.</p>

  ${h2('Before you submit', 'submit')}
  <p>Go through the <a href="#/apps/review-checklist">marketplace review checklist</a>. Each check says how to test it.</p>` });

/* ---- Marketplace review checklist ---- */
// [id, check (pass/fail), how to test, owner placeholder (optional)]. Ids are stored in the viewer's browser, so
// don't rename them.
const REVIEW = [
  { id: 'functionality', title: 'Functionality', items: [
    ['f-opens', 'The app opens inside the admin with no errors in the browser console.', 'Open the app from the admin in a test store with the browser\'s developer tools open. The Console shows no errors.'],
    ['f-features', 'Every feature the listing describes works.', 'Follow the listing\'s feature list step by step in a test store.'],
    ['f-saved', 'Saved changes are still there after a reload.', 'Change a setting, save, reload the admin, and check it.'],
    ['f-theme', 'The app follows the admin\'s theme when it opens and when it changes.', 'Open it with the admin in light, then dark. Change the theme while it is open: the app follows without a reload (`theme.change`).'],
    ['f-backend', 'When the backend fails, the app shows a critical banner with a way to try again, not a blank or frozen screen.', 'In developer tools, block your API\'s address (Network: Block request URL) and reload.'],
    ['f-outside', 'Opened outside the admin, the app says it must be opened from the Commmerce admin.', 'Open the app\'s address in a browser tab of its own.'],
    ['f-reload', 'Reloading the admin on any screen of the app opens the same screen.', 'Go two screens deep, reload, and compare. The app reads `path` from `app.ready`.'],
    ['f-back', 'Back and Forward in the admin move between the app\'s screens.', 'Go two screens deep, press Back twice, then Forward. The app listens for `path.change`.'],
  ] },
  { id: 'embedded', title: 'Embedded experience', items: [
    ['e-nav', 'The app draws no header, side navigation or top-level tabs that copy the admin\'s.', 'Look at every screen at 1440px and 375px wide.'],
    ['e-navigate', 'Every screen change updates the admin\'s address (`app.navigate`).', 'Move between screens and watch the admin\'s address bar. Back and Forward move between the same screens.'],
    ['e-savebar', 'Unsaved changes show the admin\'s save bar, and both Save and Discard work.', 'Change a field: the admin save bar appears. Press Save, check the change stuck; change it again and press Discard.'],
    ['e-leave', 'Leaving with unsaved changes asks first.', 'Change a field, then select another item in the admin\'s navigation.'],
    ['e-toast', 'Confirmations use the admin\'s toast (`app.toast.show`); there is no toast inside the frame.', 'Complete an action (save, delete) and look where the confirmation appears.'],
    ['e-modal', 'Destructive actions ask first, in the admin\'s modal or a Modal in the frame, and the button names the action.', 'Delete something. The confirm button says "Delete …", not "OK" or "Yes"; Cancel works.'],
    ['e-resize', 'The frame has no scroll bar of its own: only the admin page scrolls.', 'At 1440px and 375px, scroll a long screen, and open and close something that changes its height. The frame grows and shrinks with it.'],
    ['e-loading', 'Work that takes more than a second shows the admin\'s loading bar or skeletons.', 'In developer tools, throttle the network to "Slow 4G" and use each screen.'],
    ['e-links', 'Links to other websites open in a new tab; the app never changes the admin window\'s address.', 'Select every external link.'],
  ] },
  { id: 'design', title: 'Design', items: [
    ['d-components', 'Every control is a Commmerce UI component: no restyled native controls and no other UI kit.', 'Inspect the controls in developer tools: buttons are `cm-button`, fields `cm-text-field`, `cm-select` and so on.'],
    ['d-tokens', 'Colours, type and spacing come from `--cm-*` tokens; no brand colours.', 'Search your CSS for hex, `rgb()` and `hsl()` values and `gray-*` tokens.'],
    ['d-themes', 'Every screen is readable in both the light and the dark theme.', 'Use each screen in both themes.'],
    ['d-header', 'Every screen starts with a page header that has the screen\'s title and at most one primary action.', 'Count the primary (filled) buttons on each screen.'],
    ['d-cards', 'Content sits in cards on the page background, each with a heading.', 'Look at every screen.'],
    ['d-states', 'Loading, empty and error states are designed.', 'Use an empty test store, a slow network and a blocked API (as above).'],
    ['d-375', 'Every screen works at 375px wide with no sideways scrolling.', 'Use developer tools\' device mode at 375px.'],
    ['d-pinned', 'The app loads a pinned version of Commmerce UI.', 'In the Network panel, the files come from `/v/<version>/` or your own bundle, not `/vendor/`.'],
  ] },
  { id: 'accessibility', title: 'Accessibility', items: [
    ['a-axe', 'An automated audit finds no WCAG 2.2 A or AA violations on any screen, in light and dark.', 'Run axe-core (the axe DevTools extension, or `@axe-core/playwright` with the tags wcag2a, wcag2aa, wcag21a, wcag21aa and wcag22aa) on every screen and overlay.'],
    ['a-keyboard', 'Everything works with the keyboard alone, with no keyboard traps.', 'Put the mouse away. Use Tab, Shift+Tab, Enter, Space, Esc and the arrow keys to finish every task.'],
    ['a-focus', 'Focus is always visible and moves in reading order.', 'Tab through each screen and watch the focus ring.'],
    ['a-focus-move', 'After a screen change, focus starts at the top of the new screen; after a failed save, at the first error.', 'Change screens and save a form with an empty required field, using the keyboard.'],
    ['a-names', 'Every field has a visible label and every icon-only button a label.', 'The audit above, then read the accessible names in developer tools\' Accessibility panel.'],
    ['a-errors', 'Form errors appear next to the field, say how to fix it, and are announced.', 'Submit with mistakes, with a screen reader on (VoiceOver: Cmd+F5 on a Mac).'],
    ['a-colour', 'Colour is never the only way to show meaning, and your own colours reach 4.5:1 for text and 3:1 for graphics.', 'View each screen in greyscale (developer tools: Rendering, Emulate vision deficiencies) and check colours of your own with a contrast checker.'],
    ['a-reflow', 'At 320px wide and at 200% zoom nothing is cut off and nothing scrolls sideways.', 'Zoom the browser to 200%, then set device mode to 320px.'],
    ['a-motion', 'Your own animations stop when the device asks for reduced motion.', 'Turn on "Reduce motion" in the operating system (or emulate `prefers-reduced-motion` in developer tools).'],
  ] },
  { id: 'content', title: 'Content', items: [
    ['c-voice', 'Text follows the content guidelines: plain, direct and calm, with no exclamation marks.', 'Read every screen, message and email the app sends.'],
    ['c-buttons', 'Buttons and menu items start with a verb and name the action.', 'List every button label.'],
    ['c-errors', 'Every error says what happened and how to fix it.', 'Cause each error you can: empty fields, wrong values, a blocked API.'],
    ['c-format', 'Money is shown as Rs. with Indian digit grouping; dates follow the staff member\'s locale.', 'Look at prices over Rs. 1,00,000 and at dates.'],
    ['c-words', 'Status words match the admin\'s.', 'Compare with the fulfilment and stock words in the patterns.'],
    ['c-finished', 'No placeholder text, test data or "coming soon" features.', 'Use every screen in a new, empty store.'],
    ['c-name', 'The app\'s name is the same in the listing, the admin\'s navigation and the app.', 'Compare all three.'],
  ] },
  { id: 'security', title: 'Security and data', items: [
    ['s-verify', 'Every backend request verifies the session token: signature, expiry, your API key (`aud`) and the admin (`iss`).', 'Call each API route with no token, an expired token and a token signed with another secret: each answer is 401. The starter apps\' tests show how.'],
    ['s-store', 'The store comes from the verified token (`dest`), never from the request; stores that didn\'t install the app get 403.', 'Send a valid token for store A with store B in the query string or body: you still get store A\'s data. A token for a store without the app gets 403.'],
    ['s-secret', 'The app secret is only on the server.', 'Search the page source, your built JavaScript, the repository and your logs for it.'],
    ['s-frame', 'Every page sends `Content-Security-Policy: frame-ancestors` with the admin origin, and no `X-Frame-Options` that blocks it.', 'Run `curl -sI https://your-app.example/ | grep -i -E "content-security-policy|x-frame-options"`. You see `frame-ancestors https://*.commmerce.com` and no `X-Frame-Options`.'],
    ['s-https', 'Every page and API route is served over HTTPS, and plain HTTP redirects to it.', 'Run `curl -sI http://your-app.example/`: the answer is a redirect to `https://`.'],
    ['s-origin', 'The page\'s `hostOrigin` comes from settings, not a test address written into the code.', 'Search the code for `hostOrigin`.'],
    ['s-cookies', 'Sign-in doesn\'t depend on cookies inside the frame.', 'Use the app in Safari, which blocks third-party cookies by default.'],
    ['s-html', 'Text from merchants and customers is shown as text, never run as HTML.', 'Name a product `<img src=x onerror=alert(1)>` and open every screen that shows it. No alert appears.'],
    ['s-data', 'The app stores only the data it needs, and says what it stores.', 'Compare what your database keeps with what the app uses.', 'Privacy policy requirements, and what happens to a store\'s data when it uninstalls the app, are not decided yet.'],
  ] },
  { id: 'listing', title: 'Listing', items: [
    ['l-logo', 'The icon and logo are your own, not the Commmerce logo, wordmark or M mark, and stay clear at 130 × 54px and 100 × 40px.', 'Look at them in the app card\'s logo tile at both sizes.', 'The icon\'s size and file format for upload are not decided yet.'],
    ['l-name', 'The app\'s name is your own and doesn\'t suggest Commmerce made it.', 'Read the name and tagline.', 'Whether names may contain the word "Commmerce" is not decided yet.'],
    ['l-endorse', 'Nothing in the listing claims Commmerce made, endorses, certifies or partners with the app.', 'Read the description and every screenshot.'],
    ['l-screens', 'Screenshots show the real app running inside the admin.', 'Compare each screenshot with the app in a test store.', 'How many screenshots, at what size, is not decided yet.'],
    ['l-pricing', 'The pricing in the listing matches what the app charges.', 'Install it on each plan and compare.', 'How apps charge merchants is not decided yet.'],
    ['l-support', 'The listing and the app give a support contact that answers.', 'Write to it.', 'The required response time is not decided yet.'],
    ['l-access', 'Reviewers get everything they need to test the app, such as test accounts for services it connects to.', 'Follow your own review notes in a new test store.', 'How to give reviewers access is not decided yet.'],
  ] },
];
const REVIEW_KEY = 'cm-docs-review-checklist';
const REVIEW_TOTAL = REVIEW.reduce((n, g) => n + g.items.length, 0);
pages['/apps/review-checklist'] = () => ({ title: 'Marketplace review checklist', html: `
  <h1>Marketplace review checklist</h1>
  <p class="lead">Every check an app should pass before it is listed in the Commmerce marketplace, and how to test each one yourself. Tick them off as you go.</p>
  <p>Each check comes from the <a href="#/apps/guidelines">app design guidelines</a>. Your ticks are kept in this browser only.</p>
  ${note(`<strong>How submission works.</strong> Listing an app and getting it reviewed will happen in the Commmerce developer portal, not in these docs. Until the portal is available, email ${mail('App listing')}. ${tbd('Review times, and whether reviewers use exactly this checklist, are not decided yet.')}`)}
  <div class="rc-bar"><p id="rc-progress" role="status" class="rc-progress">0 of ${REVIEW_TOTAL} checked</p><cm-button id="rc-clear" size="slim">Clear All Ticks</cm-button></div>
  ${REVIEW.map((g) => `${h2(g.title, g.id)}
  <p class="muted small rc-count" data-group="${g.id}">0 of ${g.items.length} checked</p>
  <ul class="rc-list">${g.items.map(([id, check, test, open]) => `<li class="rc-item">
    <cm-checkbox data-rc="${id}" label="${esc(check.replace(/`/g, ''))}" description="${esc('Test: ' + test.replace(/`/g, ''))}"></cm-checkbox>
    ${open ? `<p class="rc-open">${tbd(esc(open))}</p>` : ''}</li>`).join('')}</ul>`).join('')}`,
  after(main) {
    let ticked = new Set();
    try { ticked = new Set(JSON.parse(localStorage.getItem(REVIEW_KEY) || '[]')); } catch {}
    const boxes = [...main.querySelectorAll('cm-checkbox[data-rc]')];
    const count = () => {
      $('#rc-progress', main).textContent = `${boxes.filter((b) => b.checked).length} of ${REVIEW_TOTAL} checked`;
      main.querySelectorAll('[data-group]').forEach((p) => {
        const g = REVIEW.find((x) => x.id === p.dataset.group);
        p.textContent = `${g.items.filter(([id]) => ticked.has(id)).length} of ${g.items.length} checked`;
      });
    };
    const save = () => { try { localStorage.setItem(REVIEW_KEY, JSON.stringify([...ticked])); } catch {} };
    boxes.forEach((b) => {
      b.checked = ticked.has(b.dataset.rc);
      b.addEventListener('change', () => { if (b.checked) ticked.add(b.dataset.rc); else ticked.delete(b.dataset.rc); save(); count(); });
    });
    $('#rc-clear', main).addEventListener('click', () => { ticked.clear(); boxes.forEach((b) => (b.checked = false)); save(); count(); });
    count();
  } });

// The live example: a small "Product reviews" app in an iframe, connected to this page (the "admin") through
// createReferenceHost. The demo signs session tokens in the browser with a made-up secret; the real admin
// gets them from Commmerce's servers, which hold your app secret.
const DEMO_APP = (bridge, font, css, ui, hostOrigin) => `<!doctype html><html lang="en" data-cm-theme="light"><head><meta charset="utf-8">
<link rel="stylesheet" href="${font}"><link rel="stylesheet" href="${css}"><script type="module" src="${ui}"></script>
<style>body{margin:0;background:var(--cm-bg-page);font-family:var(--cm-font-sans);color:var(--cm-text-default)}
.row{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 16px}#log{margin:16px 0 0;font-size:14px;word-break:break-word}</style></head><body>
<cm-page><cm-page-header slot="header" heading="Product reviews"></cm-page-header>
<cm-card heading="Try each App Bridge request">
  <div class="row">
    <cm-button id="toast">Show toast</cm-button>
    <cm-button id="modal">Delete review…</cm-button>
    <cm-button id="pick">Choose products…</cm-button>
    <cm-button id="nav">Open review 42</cm-button>
    <cm-button id="load">Load for 1 second</cm-button>
    <cm-button id="token">Get session token</cm-button>
  </div>
  <cm-text-field id="reply" label="Reply to the newest review" help-text="Type to show the admin save bar."></cm-text-field>
  <p id="log" role="status">Connecting…</p>
</cm-card></cm-page>
<script type="module">
import { createApp, decodeClaims } from '${bridge}';
const app = createApp({ hostOrigin: '${hostOrigin}', apiKey: 'demo-reviews-app' });
app.autoResize(); // the admin keeps the frame as tall as the page
const log = (t) => { document.getElementById('log').textContent = t; };
const on = (id, fn) => document.getElementById(id).addEventListener('click', () => fn().catch((e) => log('Error: ' + e.code + ', ' + e.message)));
app.ready.then((info) => log('Connected. Admin theme: ' + info.theme + ', locale: ' + info.locale + '.'), (e) => log('Not connected: ' + e.message));
on('toast', () => app.toast.show('Reply published', { tone: 'success' }).then(() => log('Toast shown by the admin.')));
on('modal', async () => log('Modal closed with: ' + await app.modal.open({ title: 'Delete review?', message: 'The customer\\'s review will be removed from your store. This can\\'t be undone.', primaryAction: { label: 'Delete review', destructive: true }, secondaryAction: { label: 'Cancel' } })));
on('pick', async () => { const r = await app.resourcePicker({ type: 'product', multiple: true }); log(r ? 'Picked: ' + (r.map((p) => p.title).join(', ') || 'nothing') : 'Picker cancelled.'); });
on('nav', () => app.navigate('/reviews/42').then(() => log('Admin address updated.')));
on('load', async () => { await app.loading.start(); await new Promise((r) => setTimeout(r, 1000)); await app.loading.stop(); log('Loading bar shown for 1 second.'); });
on('token', async () => { const c = decodeClaims(await app.getSessionToken()); log('Token for store ' + c.dest + ', staff ' + c.sub + ', expires in ' + (c.exp - Math.floor(Date.now() / 1000)) + ' s.'); });
const reply = document.getElementById('reply');
reply.addEventListener('input', () => app.saveBar.show({ message: 'Unsaved reply' }));
app.on('saveBar.save', async () => { await app.saveBar.hide(); await app.toast.show('Reply saved'); log('Saved: ' + reply.value); });
app.on('saveBar.discard', async () => { reply.value = ''; await app.saveBar.hide(); log('Reply discarded.'); });
</script></body></html>`;

const BRIDGE_REQUESTS = [
  ['`toast.show(message, { tone, duration })`', 'A short confirmation at the bottom of the admin. `tone`: `default`, `success`, `critical`. Up to 200 characters.', '—'],
  ['`modal.open({ title, message, primaryAction, secondaryAction })`', 'A confirmation over the whole admin. Waits for the merchant (no time limit).', '`primary`, `secondary` or `close`'],
  ['`navigate(path, { replace })`', 'Updates the admin\'s address to `path` inside your app, so reloads, links and Back work. `path` starts with one `/` and stays inside your app (no `\\`, no control characters).', '—'],
  ['`saveBar.show({ message, saveLabel, discardLabel, loading })` / `saveBar.hide()`', 'The admin save bar. Listen for `saveBar.save` and `saveBar.discard`.', '—'],
  ['`resourcePicker({ type, multiple })`', 'The admin picker for `product`, `customer` or `collection`. Waits for the merchant.', '`[{ id, title }]`, or `null` if cancelled'],
  ['`loading.start()` / `loading.stop()`', 'The admin loading bar, for work that takes more than a second.', '—'],
  ['`getSessionToken()`', 'A signed token for your backend. Cached until 10 seconds before it expires.', 'JWT string'],
  ['`autoResize()`', 'Keeps the admin\'s frame as tall as your page: sends the height now and whenever it changes. Call it once after your page renders.', 'A function that stops it'],
  ['`on(event, listener)`', 'Admin events: `saveBar.save`, `saveBar.discard`, `theme.change` (`{ theme }`), `path.change` (`{ path }`: Back or Forward moved the admin to another screen of your app).', 'A function that stops listening'],
];
const TOKEN_CLAIMS = [
  ['`iss`', 'Issuer: the admin\'s origin.'],
  ['`dest`', 'The store\'s address (origin). Look it up among the stores that installed your app, and refuse the request if it is not one of them.'],
  ['`aud`', 'Your app\'s API key. Reject tokens for any other app.'],
  ['`sub`', 'The staff member\'s id in that store.'],
  ['`sid`', 'The admin session; the same while the staff member stays signed in.'],
  ['`iat`, `nbf`, `exp`', 'Issued at, not before, expires: seconds since 1970. Tokens live 60 seconds.'],
  ['`jti`', 'A unique id per token, for replay protection if you need it.'],
];
const ERROR_CODES = [
  ['`timeout`', 'The admin did not answer within `timeout` (10 s). Usually: wrong `hostOrigin`, or the page is not inside the admin.'],
  ['`invalid-payload`', 'A value is missing, too long or the wrong type. The message says which.'],
  ['`not-supported`', 'This admin does not offer that request.'],
  ['`not-ready`', 'A request arrived before `ready`. `createApp` handles this for you.'],
  ['`unsupported-version`', 'The admin speaks a different protocol version.'],
  ['`unknown-type`', 'Not an App Bridge request.'],
  ['`failed`', 'The admin could not complete the request (for example a wrong API key).'],
];
const rowsMd = (rows) => rows.map((r) => `<tr>${r.map((c) => `<td>${md(c)}</td>`).join('')}</tr>`);

const STARTER_FILES = [
  ['README.md', 'How to run it, the settings, and what to change first.'],
  ['package.json', 'Scripts: `vendor`, `start`, `test`. No dependencies.'],
  ['server.mjs', 'Serves the page; verifies the session token (API key and issuer) on every `/api/*` request; serves only installed stores; `frame-ancestors` limited to the admin.'],
  ['public/index.html', 'The app page: Commmerce UI components and App Bridge (theme, `autoResize`, save bar, toast, modal, resource picker).'],
  ['dev-admin.html', 'Development only: a stand-in admin on another origin, running the reference host.'],
  ['fetch-vendor.mjs', 'Downloads one pinned version of the hosted build into `vendor/`.'],
  ['test/server.test.mjs', 'Backend tests: 401 for bad tokens, 403 for stores that did not install the app, the CSP header.'],
  ['test/pattern.test.mjs', 'Backend tests with `COMMMERCE_ADMIN_ORIGIN=https://*.commmerce.com`: any admin subdomain accepted, look-alikes refused. Skipped with an App Bridge build that has no patterns.'],
  ['.gitignore', 'Keeps `vendor/` out of git.'],
];
const STARTER_PHP_FILES = [
  ['README.md', 'How to run it, the settings, and nginx and Apache set-up.'],
  ['index.php', 'Front controller: serves the page; verifies the session token (API key and issuer) on every `/api/*` request; serves only installed stores; `frame-ancestors` limited to the admin.'],
  ['lib/SessionToken.php', '`SessionToken::verify()`: the same checks as `verifySessionToken`. Copy it into any PHP app.'],
  ['public/index.html', 'The app page (the same as the Node starter\'s).'],
  ['public/dev-admin.html', 'Development only: a stand-in admin on another origin.'],
  ['fetch-vendor.php', 'Downloads one pinned version of the hosted build into `vendor/`.'],
  ['tests/run.php', 'Session-token tests: wrong secret, app, issuer (exact and `https://*.commmerce.com` patterns, look-alikes included), expired, `alg: none`, malformed.'],
  ['.htaccess', 'Apache: routes every request to `index.php` and passes the `Authorization` header to PHP.'],
];
const REACT_STARTER_FILES = [
  ['README.md', 'How to run, build and test it, what the screen shows, and where to change things.'],
  ['package.json', 'Scripts: `dev`, `build`, `preview`, `test`. The Commmerce packages pinned to one version, React 19.3.1, Vite 6.'],
  ['package-lock.json', 'Exact versions of every dependency, for `npm ci`.'],
  ['index.html', 'The page Vite serves.'],
  ['vite.config.mjs', 'Vite with the React plugin.'],
  ['src/main.jsx', 'Loads `@commmerce/tokens/fonts.css` and `tokens.css`, then renders the app.'],
  ['src/App.jsx', 'The orders screen: status tabs, search, a selectable resource list with a bulk action and an empty state, pagination.'],
  ['src/ProductPanel.jsx', 'A product form in a side panel: controlled fields, validation, the save bar.'],
  ['src/notify.js', 'Toasts: through App Bridge (`app.toast.show`) when the admin opens the app with `?host=`, otherwise an in-page toast.'],
  ['src/data.js', 'Sample orders and products. Replace with calls to your backend.'],
  ['src/app.css', 'Page background and the order row columns.'],
  ['playwright.config.js', 'Runs the tests in Chromium against the built app.'],
  ['tests/app.spec.js', 'Browser tests: renders, tabs filter, search empty state, bulk action toast, form validation.'],
  ['.gitignore', 'Keeps `node_modules/` and `dist/` out of git.'],
];
pages['/apps/starter'] = () => ({ title: 'Starter app', html: `
  <h1>Starter app</h1>
  <p class="lead">A complete app to copy: a plain HTML page built with Commmerce UI, connected to the admin with App Bridge, and a backend that verifies session tokens. Pick <a href="#/apps/starter?s=node">Node</a> (Node 18 or later) or <a href="#/apps/starter?s=php">PHP</a> (PHP 8.0 or later); neither needs packages installed. Building with React? The <a href="#/apps/starter?s=react">React example app</a> uses the npm packages. Smaller starters for <a href="#/start/frameworks">Vue, Angular, Svelte and Next.js</a> show the bindings in each framework.</p>
  ${h2('Node', 'node')}
  ${codeBlock([{ label: 'Terminal', lang: 'sh', code: `# download the files below into one folder (keep public/ and test/), then:
npm run vendor   # downloads one pinned version of the hosted build into vendor/
npm run dev      # http://localhost:4700/dev-admin shows your app inside a stand-in admin
npm test         # checks the backend's token rules` }])}
  ${table(['File', 'What it does'], STARTER_FILES.map(([f, d]) => `<tr><td><a href="vendor/app-starter/${f}" download="${f.split('/').pop()}"><code>${f}</code></a></td><td>${md(d)}</td></tr>`))}
  ${h2('PHP', 'php')}
  ${codeBlock([{ label: 'Terminal', lang: 'sh', code: `# download the files below into one folder (keep lib/, public/ and tests/), then:
php fetch-vendor.php                 # downloads one pinned version of the hosted build into vendor/
COMMMERCE_DEV=1 php -S 127.0.0.1:4800 index.php   # http://localhost:4800/dev-admin: your app in a stand-in admin
php tests/run.php                    # checks the session-token rules` }])}
  ${table(['File', 'What it does'], STARTER_PHP_FILES.map(([f, d]) => `<tr><td><a href="vendor/app-starter-php/${f}" download="${f.split('/').pop()}"><code>${f}</code></a></td><td>${md(d)}</td></tr>`))}
  <p>Both starters sign and verify the same tokens: a token from the JavaScript library verifies in PHP and the other way round.</p>
  ${h2('React', 'react')}
  <p>A complete example app with Vite and React 19, built from the npm packages (<code>@commmerce/ui-react</code>, <code>@commmerce/ui</code>, <code>@commmerce/tokens</code>, pinned to one version in <code>package.json</code>). One orders screen made only from ready components through the React wrappers: status tabs, search with an empty state, a selectable list with a bulk action and a toast, pagination, and a product form in a side panel with validation and the save bar. Every input is controlled through the wrappers' <code>onInput</code> and <code>onChange</code> props. It has no backend: inside the admin it uses App Bridge only for toasts; for session tokens, use the Node or PHP starter's backend.</p>
  ${codeBlock([{ label: 'Terminal', lang: 'sh', code: `# download the files below into one folder (keep src/ and tests/), then (Node 18 or later):
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npx playwright install chromium && npm test   # builds it and checks it in Chromium` }])}
  ${table(['File', 'What it does'], REACT_STARTER_FILES.map(([f, d]) => `<tr><td><a href="vendor/react-starter/${f}" download="${f.split('/').pop()}"><code>${f}</code></a></td><td>${md(d)}</td></tr>`))}
  ${h2('What it shows')}
  <ul>
    <li>The page has no header or navigation of its own: the admin draws those around it (see [[page structure|/apps/page-structure]]).</li>
    <li>It follows the admin's theme, sizes its frame with <code>autoResize()</code>, and uses the admin's save bar, toasts, modal and resource picker through [[App Bridge|/apps/app-bridge]].</li>
    <li>Every backend route verifies the session token first, takes the store from the token, never from the request, and refuses stores that did not install the app.</li>
    <li>Only the admin may frame the app (<code>Content-Security-Policy: frame-ancestors</code>), and the app secret never leaves the server.</li>
  </ul>
  ${note('The dev admin signs tokens with a throwaway secret on your machine. In production the Commmerce admin signs them with your real app secret; run without development mode (<code>--dev</code> / <code>COMMMERCE_DEV=1</code>) and set the three <code>COMMMERCE_*</code> settings described in the README. Set <code>COMMMERCE_ADMIN_ORIGIN</code> to <code>https://*.commmerce.com</code> so the app works in every Commmerce admin (see <a href="#/apps/app-bridge?s=admin-origin">Admin origin</a>); patterns need an App Bridge build newer than 1.0.0-rc.2.')}`.replace(/\[\[([^|]+)\|([^\]]+)\]\]/g, '<a href="#$2">$1</a>') });
pages['/apps/app-bridge'] = () => ({ title: 'App Bridge', html: `
  <h1>App Bridge ${badge('ready')}</h1>
  <p class="lead">App Bridge connects your app, running in a frame inside the admin, to the admin around it: toasts and modals over the whole admin, the save bar, a loading bar, the resource picker, the admin's address, and a session token that tells your backend which store and staff member is using your app.</p>
  ${note(`App Bridge is in the hosted build (protocol version 1). The Commmerce admin answers App Bridge requests as it rolls out to stores: before you rely on it, email ${mail('App Bridge in my store')} to confirm your store's admin is connected. Until the admin answers, <code>app.ready</code> rejects with <code>timeout</code>, so keep in-page fallbacks (<a href="#/components/banner">Banner</a>, <a href="#/components/save-bar">Save bar</a>, <a href="#/components/modal">Modal</a>).`)}
  ${h2('Try it')}
  <p>This page plays the admin; the frame below is an app. Each button sends one App Bridge request, and this page answers it with Commmerce UI components.</p>
  <div class="example ab-demo">
    <div class="ex-bar"><span class="muted small">Admin address</span> <code id="ab-address">/apps/product-reviews</code></div>
    <div id="ab-host" class="ab-host"><iframe id="ab-frame" title="Example app: Product reviews" loading="lazy"></iframe></div>
  </div>
  ${h2('Add it to your app')}
  ${codeBlock([{ label: 'JavaScript', lang: 'jsx', code: `import { createApp } from '${PREVIEW.bridge}';
// or, with npm when it is published: import { createApp } from '@commmerce/app-bridge';

const app = createApp({
  hostOrigin: ADMIN_ORIGIN, // from your app settings: 'https://*.commmerce.com' (any Commmerce admin) or one exact origin
  apiKey: 'YOUR_API_KEY',
});
const { theme } = await app.ready;           // follow it: <html data-cm-theme="dark">

await app.toast.show('Review published', { tone: 'success' });

const choice = await app.modal.open({
  title: 'Delete review?',
  message: "This can't be undone.",
  primaryAction: { label: 'Delete review', destructive: true },
  secondaryAction: { label: 'Cancel' },
});
if (choice === 'primary') await deleteReview();

form.addEventListener('input', () => app.saveBar.show({ message: 'Unsaved changes' }));
app.on('saveBar.save', save);
app.on('saveBar.discard', discard);

const token = await app.getSessionToken();
await fetch('/api/reviews', { headers: { Authorization: \`Bearer \${token}\` } });` }])}
  ${h2('Admin origin', 'admin-origin')}
  <p>Each Commmerce product has its admin on a subdomain of commmerce.com, and your app can run inside any of them. Set <code>hostOrigin</code> (and <code>issuer</code> on your backend) to the pattern <code>https://*.commmerce.com</code> so it works in all of them. Use one exact origin, such as <code>https://admin.example.com</code>, only if your app must run in one admin alone.</p>
  ${table(['<code>https://*.commmerce.com</code>', 'Matches?'], rowsMd([
    ['`https://admin.commmerce.com`, `https://preprod.commmerce.com`', 'Yes: any subdomain'],
    ['`https://a.b.commmerce.com`', 'Yes: any depth'],
    ['`https://commmerce.com`', 'No: the bare domain is not a subdomain'],
    ['`https://evilcommmerce.com`, `https://commmerce.com.evil.com`', 'No: look-alikes'],
    ['`http://admin.commmerce.com`, `https://admin.commmerce.com:8443`', 'No: another scheme or port'],
    ['`https://127.0.0.1`', 'No: IP addresses never match'],
  ]))}
  <ul>
    <li>Exactly what matches: the same scheme and port as the pattern (no port means the scheme's default), and a host name that ends with <code>.</code> plus the domain, with at least one label before it. Letter case does not matter.</li>
    <li>Allowed patterns: <code>https://*.domain</code> or <code>http://*.domain</code>, optionally with <code>:port</code>. One leading <code>*.</code> only; the domain needs at least one dot (<code>https://*.com</code> is refused); no path, no other wildcards. <code>*</code> on its own is refused. For local development only, <code>http://*.localhost:&lt;port&gt;</code> is allowed too, because <code>*.localhost</code> only ever reaches your own computer.</li>
    <li>Messages still go to one exact origin. The app finds the admin's actual origin (<code>location.ancestorOrigins[0]</code>; in browsers without it, such as Firefox, the origin of <code>document.referrer</code>), checks it against the pattern, and then talks only to that origin for the whole session: <code>app.hostOrigin</code>. It never posts to <code>*</code>. If the admin's origin does not match, or cannot be found, <code>createApp</code> throws.</li>
    <li>Even if a page managed to pass itself off as the admin's origin, the browser delivers your messages only to the window that really has that origin, so nothing reaches anyone else: requests just time out.</li>
    <li><code>exactHostOrigin</code> gives the admin's origin yourself (for tests, or an admin that hides its referrer in a browser without <code>ancestorOrigins</code>). It must still match the pattern.</li>
    <li>The admin side (<code>createHost</code>) takes your app's one exact origin as <code>appOrigin</code>: an app has one origin, so patterns are refused there.</li>
    <li>On your server, the same pattern works in <code>Content-Security-Policy: frame-ancestors https://*.commmerce.com</code>, where it means the same thing.</li>
  </ul>
  ${note('Patterns need App Bridge 1.0.0-rc.3 or later. Earlier pinned files (<code>/v/1.0.0-rc.2/</code> and before) compare an exact origin only: with them, use one exact origin.')}
  ${h2('Requests')}
  ${table(['Call', 'What the admin does', 'Resolves with'], rowsMd(BRIDGE_REQUESTS))}
  <p>Every call returns a promise. It rejects with an <code>AppBridgeError</code> whose <code>code</code> is one of:</p>
  ${table(['Code', 'Meaning'], rowsMd(ERROR_CODES))}
  ${h2('Session tokens')}
  <p>Send the token with every request to your backend, and verify it there: never trust a store or staff id sent from the browser. Tokens are JWTs signed with HS256 using your app secret, and live 60 seconds.</p>
  ${table(['Claim', 'Meaning'], rowsMd(TOKEN_CLAIMS))}
  ${codeBlock([{ label: 'Node.js', lang: 'jsx', code: `import { verifySessionToken } from '@commmerce/app-bridge/session-token';

app.use('/api', async (req, res, next) => {
  try {
    const token = req.get('authorization')?.replace(/^Bearer /, '');
    req.claims = await verifySessionToken(token, process.env.COMMMERCE_APP_SECRET, {
      audience: process.env.COMMMERCE_API_KEY,
      issuer: process.env.COMMMERCE_ADMIN_ORIGIN, // from your app settings, e.g. 'https://*.commmerce.com'
    });
    req.store = await db.installs.find(req.claims.dest); // only stores that installed your app
    if (!req.store) return res.sendStatus(403);
    next(); // req.claims.sub is the staff member
  } catch {
    res.sendStatus(401);
  }
});` }])}
  <p><code>verifySessionToken</code> refuses every algorithm except HS256 (including <code>none</code>), a wrong signature, an expired or not-yet-valid token (5 seconds of clock tolerance), a token for another app and, when you pass <code>issuer</code> (always do), a token from anyone but the admin. <code>issuer</code> takes an exact origin (compared exactly) or a pattern such as <code>https://*.commmerce.com</code>, with the rules in <a href="#/apps/app-bridge?s=admin-origin">Admin origin</a>; an invalid pattern throws a <code>TypeError</code> rather than refusing tokens. It uses Web Crypto, so it runs in Node 18+, Deno, Bun and edge runtimes. In other languages, use any JWT library with the same checks.</p>
  ${h2('Security')}
  <ul>
    <li>Your app gives <code>hostOrigin</code> (an exact origin, or a pattern that is resolved to one exact origin when the app starts), and the admin knows your app's exact origin. Each side posts only to that one origin and ignores messages from any other origin, and from any window other than the one it expects; <code>*</code> is refused.</li>
    <li>The admin checks every request before acting on it (types, lengths, paths that stay inside your app) and shows your text as text, never as HTML.</li>
    <li>Keep your app secret on your server. The token in the browser is short-lived and only proves who is using your app.</li>
    <li>On your backend, take the store from the verified token (<code>dest</code>), never from the request, and serve only stores that installed your app. Pass <code>issuer</code> to <code>verifySessionToken</code>.</li>
  </ul>
  ${h2('Protocol')}
  <p>For other languages and for the admin side. Plain objects over <code>postMessage</code>, each with <code>protocol: 'commmerce-app-bridge'</code> and <code>version: 1</code>:</p>
  <ul>
    <li>Request, app to admin: <code>{ kind: 'request', id, type, payload }</code>. The first is always <code>ready</code> (<code>{ apiKey }</code>), answered with <code>{ version, theme, locale, path }</code> (<code>path</code> since 1.0.0-rc.5; older admins leave it out).</li>
    <li>Response, admin to app: <code>{ kind: 'response', id, ok, result }</code> or <code>{ …, ok: false, error: { code, message } }</code>.</li>
    <li>Event, admin to app: <code>{ kind: 'event', type, payload }</code>.</li>
  </ul>
  <p>Request types: <code>ready</code>, <code>toast.show</code>, <code>modal.open</code>, <code>navigate</code>, <code>saveBar.show</code>, <code>saveBar.hide</code>, <code>resourcePicker.open</code>, <code>loading.start</code>, <code>loading.stop</code>, <code>sessionToken.get</code>, <code>frame.resize</code> (<code>{ height }</code>, from <code>autoResize</code>; the admin sets the frame's height unless it passes a <code>resize</code> handler). The admin side is <code>createHost({ iframe, appOrigin, handlers })</code>; <code>createReferenceHost</code> is the reference implementation this page runs.</p>
  ${h2('How it is tested')}
  <p>125 browser tests with real frames: same-origin and cross-origin, refused origins and senders, invalid payloads, versions, time-outs, the reference host's components, frame auto-resize, session token signing and verification, and admin origin patterns (a stand-in admin on <code>admin.localhost</code> and <code>a.b.localhost</code> against <code>http://*.localhost:&lt;port&gt;</code>, the bare domain, other ports and schemes, IP addresses, and look-alike origins). The same 125 tests run in Chromium, Firefox and WebKit 18.2 (Playwright's builds, on Linux) on every change, none skipped. Firefox has no <code>location.ancestorOrigins</code>, so there the origin-pattern tests go through the <code>document.referrer</code> fallback with real frames.</p>`,
  after(main) { runDemoApp(main, 'demo-reviews-app', (a) => DEMO_APP(a.bridge, a.font, a.css, a.ui, a.hostOrigin)); } });

// Plays the admin for a demo app in #ab-frame: App Bridge's reference host answers its requests with Commmerce UI
// components inside #ab-host, and #ab-address shows the admin address the app asks for.
async function runDemoApp(main, apiKey, doc, ownUrl = false) {
  const f = $('#ab-frame', main);
  if (!f) return;
  try {
    const bridge = await import(asset('vendor/app-bridge.js'));
    const secret = 'demo-secret-not-for-real-use';
    const host = bridge.createReferenceHost({
      iframe: f, appOrigin: location.origin, root: $('#ab-host', main), apiKey,
      info: { theme: document.documentElement.dataset.cmTheme === 'dark' ? 'dark' : 'light', locale: 'en-IN' },
      navigate: (path) => { $('#ab-address', main).textContent = `/apps/product-reviews${path}`; },
      resources: () => [{ id: 'p1', title: 'Blue linen kurta' }, { id: 'p2', title: 'Hand-block printed scarf' }, { id: 'p3', title: 'Brass diya, set of 4' }],
      sessionToken: () => bridge.signSessionToken({ iss: location.origin, dest: 'https://preprod.commmerce.com', aud: apiKey, sub: 'staff-7', sid: 'demo-session' }, secret),
    });
    // Disconnect once the reader leaves this page (the router replaces the page content).
    const stop = () => setTimeout(() => { if (!f.isConnected) { host.destroy(); window.removeEventListener('hashchange', stop); } });
    window.addEventListener('hashchange', stop);
    const html = doc({ bridge: asset('vendor/app-bridge.js'), font: asset('vendor/fonts.css'), css: asset('vendor/tokens.css'), ui: asset('vendor/cdn.js'), hostOrigin: location.origin });
    // An app with its own routes needs its own document address (a srcdoc frame shares this page's), so it gets a blob: URL.
    if (ownUrl) { const url = URL.createObjectURL(new Blob([html], { type: 'text/html' })); f.src = url; window.addEventListener('hashchange', () => { if (!f.isConnected) URL.revokeObjectURL(url); }, { once: true }); } else f.srcdoc = html;
  } catch (e) {
    $('#ab-host', main).innerHTML = `<p class="muted" style="padding:16px">The live example can't run on this page (${esc(e.message)}). Use the code below.</p>`;
  }
}

/* ---- Components ---- */
pages['/components'] = (params) => {
  const all = [
    ...orderedComponents.map((c) => ({ ...c, status: 'ready' })),
    ...planned.map((p) => ({ ...p, summary: STATUS[p.status].text })),
  ];
  const groups = groupsOrder.filter((g) => all.some((c) => c.group === g));
  const want = params.get('status');
  return { wide: true, title: 'Components', html: `
  <h1>Components</h1>
  <p class="lead">${FACTS.ready} components ready to use, ${FACTS.inProgress} in progress and ${FACTS.planned} planned. Each ready component is a web component with a React wrapper.</p>
  ${statusKey()}
  <div class="toolbar catalog-tools">
    <div class="search" style="position:relative"><cm-icon name="search" size="16"></cm-icon><input id="cq" type="search" placeholder="Search components" aria-label="Search components" autocomplete="off"></div>
    <label class="sel"><span>Category</span><select id="cgroup"><option value="">All categories</option>${groups.map((g) => `<option>${g}</option>`).join('')}</select></label>
    <div class="seg" role="group" aria-label="Status">${[['', 'All'], ['ready', 'Ready'], ['in-progress', 'In progress'], ['planned', 'Planned']].map(([v, l]) => `<button data-st="${v}" aria-pressed="${(want ?? '') === v}">${l}</button>`).join('')}</div>
    <span class="muted" id="ccount" role="status"></span>
  </div>
  <div id="catalog"></div>`,
  after(main) {
    let st = want ?? '';
    const q = $('#cq', main), grp = $('#cgroup', main), out = $('#catalog', main);
    const card = (c) => c.status === 'ready'
      // The name is the link and stretches over the card, so previews may contain links of their own
      // (nested <a> elements would split the card apart).
      ? `<div class="ccard"><div class="thumb" inert>${inlineLayout(c.examples[0].html)}</div><div class="meta"><a class="ccard-link" href="#/components/${c.slug}"><strong>${c.name}</strong></a><span>${c.adminOnly ? 'Admin only. ' : ''}${esc(c.summary)}</span></div></div>`
      : `<div class="ccard soon"><div class="thumb">${badge(c.status)}</div><div class="meta"><a class="ccard-link" href="#/components/${c.slug}"><strong>${c.name}</strong></a><span>Not usable yet${c.adminOnly ? ' · admin only' : ''}</span></div></div>`;
    const draw = () => {
      const s = q.value.trim().toLowerCase();
      const list = all.filter((c) => (!st || c.status === st) && (!grp.value || c.group === grp.value)
        && (!s || `${c.name} ${c.summary ?? ''} ${c.tag ?? ''} ${c.group}`.toLowerCase().includes(s)));
      const g = byGroup(list);
      out.innerHTML = groups.filter((x) => g[x]).map((x) => `<section class="cgroup"><h2>${x}</h2><div class="cgrid">${g[x].map(card).join('')}</div></section>`).join('')
        || `<p class="muted">No components match. Request one at ${mail('Component request')}.</p>`;
      $('#ccount', main).textContent = `${list.length} of ${all.length}`;
    };
    q.addEventListener('input', draw); grp.addEventListener('change', draw);
    main.querySelectorAll('[data-st]').forEach((b) => b.addEventListener('click', () => {
      st = b.dataset.st; main.querySelectorAll('[data-st]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw();
    }));
    draw();
  } };
};

/* ---------------- Built-in text (localisation) ---------------- */
// Every component's English strings, by namespace (the tag without cm-, in camelCase), from the components themselves.
const STRINGS = getDefaultStrings();
const nsOf = (tag) => tag.replace(/^cm-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const tagOf = (ns) => 'cm-' + ns.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
// Shared strings and the components that read them (see packages/ui/src/localize.ts).
const COMMON_USERS = { close: 'Modal, Side panel, Filter panel, Bottom sheet, Notification panel', dismiss: 'Banner, Toast', loading: 'Spinner, Skeleton display, Combobox', ascending: 'Data table, Table header', descending: 'Data table, Table header' };
const showMessage = (m) => typeof m === 'string' ? m : Object.entries(m).map(([k, v]) => `${k}: ${v}`).join(' · ');
// A property whose default is a built-in string has no literal default in the manifest; its description names it.
const builtInDefault = (p) => { const m = /Default: the built-in string `\w+` \("([^"]*)"\)/.exec(p.description ?? ''); return p.default ?? (m ? `'${m[1]}'` : ''); };
const commonKeysFor = (ns) => ({ modal: ['close'], sidePanel: ['close'], filterPanel: ['close'], bottomSheet: ['close'], notificationPanel: ['close'], banner: ['dismiss'], toast: ['dismiss'], spinner: ['loading'], skeletonDisplay: ['loading'], combobox: ['loading'], dataTable: ['ascending', 'descending'], tableHeader: ['ascending', 'descending'] }[ns] ?? []);
function builtInText(tag, sfx = '') {
  const ns = nsOf(tag);
  const own = Object.entries(STRINGS[ns] ?? {});
  const shared = commonKeysFor(ns).filter((k) => !(k in (STRINGS[ns] ?? {}))).map((k) => [k, STRINGS.common[k], true]);
  if (!own.length && !shared.length) return '';
  return `<h3 id="strings-${tag}">Built-in text${sfx}</h3>
  <p class="muted">Translate with the <code>strings</code> property (JSON in HTML: <code>strings='{"${(own[0] ?? shared[0])[0]}":"…"}'</code>), or for every component at once with <code>setStrings({ ${ns}: { … } })</code>. See <a href="#/foundations/localisation">Localisation and RTL</a>.</p>
  ${table(['Key', 'English'], [...own.map(([k, v]) => [k, v, false]), ...shared].map(([k, v, c]) => `<tr><td><code>${esc(k)}</code>${c ? '<br><small class="muted">common</small>' : ''}</td><td>${esc(showMessage(v))}</td></tr>`), 'api')}`;
}

const patternsUsing = (slug) => patterns.filter((p) => p.uses.includes(slug));
function componentPage(c) {
  const api = (tag, many) => {
    const d = decl(tag);
    if (!d) return '';
    const props = d.members.filter((m) => m.kind === 'field' && m.privacy !== 'private' && m.attribute && !m.static);
    const sfx = many ? ` of ${tag}` : '';
    return `<h3 id="props-${tag}">Properties${sfx}</h3>
  ${table(['Attribute', 'Type', 'Default', 'Description'], props.map((p) => `<tr><td><code>${p.attribute}</code>${p.attribute !== p.name ? `<br><small class="muted">${p.name}</small>` : ''}</td><td class="type"><code>${esc(p.type?.text ?? '')}</code></td><td>${builtInDefault(p) ? `<code>${esc(builtInDefault(p))}</code>` : '—'}</td><td>${md(p.description ?? '')}</td></tr>`), 'api')}
  ${d.events?.filter((e) => e.name !== 'name').length ? `<h3>Events${sfx}</h3>` + table(['Event', 'React prop', 'Description'], d.events.filter((e) => e.name !== 'name').map((e) => `<tr><td><code>${e.name}</code></td><td><code>${reactEvent(e.name)}</code></td><td>${md(e.description ?? '')}</td></tr>`), 'api') : ''}
  ${d.slots?.length ? `<h3>Slots${sfx}</h3>` + table(['Name', 'Description'], d.slots.map((s) => `<tr><td><code>${s.name || '(default)'}</code></td><td>${md(s.description ?? '')}</td></tr>`), 'api') : ''}
  ${builtInText(tag, sfx)}
  ${d.cssProperties?.length ? `<h3>CSS custom properties${sfx}</h3>` + table(['Property', 'Description'], d.cssProperties.map((p) => `<tr><td><code>${esc(p.name)}</code></td><td>${md(p.description ?? '')}</td></tr>`), 'api') : ''}`;
  };
  const tags = [c.tag, ...(c.parts ?? []).map((p) => p.tag)];
  const reacts = [c.react, ...(c.parts ?? []).map((p) => p.react)];
  const ex = c.examples.map((e) => ({ ...e, html: inlineLayout(e.html) }));
  const uses = patternsUsing(c.slug);
  // Examples that show a state (loading, disabled, error, empty…), listed again under States.
  const stateEx = ex.map((e, i) => ({ e, i })).filter(({ e }) => /\b(loading|disabled|error|errors|empty|read-only|invalid|required|no results|busy|indeterminate)\b/i.test(e.title));
  return { title: c.name, html: `
  <h1>${c.name}</h1>
  <p class="status-line">${badge('ready')} <span class="muted">${STABLE ? 'Stable API: follows the compatibility policy.' : 'Preview API: may change before 1.0.'} <a href="#/releases/stability">Stability</a></span></p>
  <p class="lead">${md(c.lead)}</p>
  ${c.adminOnly ? note('<strong>For Commmerce products only, not for apps.</strong> This is part of the admin itself. Apps run inside the admin, which already shows this navigation; an app never draws its own.') : ''}
  <div class="example" id="viewer">
    <div class="ex-bar">
      <label for="exsel">Example</label>
      <select id="exsel">${ex.map((e, i) => `<option value="${i}">${esc(e.title)}</option>`).join('')}</select>
      <span class="grow"></span>
      <div class="seg" role="group" aria-label="Preview theme"><button data-theme="light" aria-pressed="true"><cm-icon name="sun" size="14"></cm-icon>Light</button><button data-theme="dark" aria-pressed="false"><cm-icon name="moon" size="14"></cm-icon>Dark</button></div>
      <div class="seg" role="group" aria-label="Preview width"><button data-w="wide" aria-pressed="true">Desktop</button><button data-w="narrow" aria-pressed="false">Phone</button></div>
    </div>
    <p class="ex-desc" id="exdesc"></p>
    <div class="ex-stage" id="stage" data-cm-theme="light"><div class="ex-frame" id="frame"></div></div>
    <div id="excode"></div>
  </div>
  ${c.specs?.length ? `${h2('Specs', 'specs')}
  ${table(null, c.specs.map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${md(v)}</td></tr>`), 'kv')}` : ''}
  ${h2('Use it')}
  ${table(null, [
    `<tr><th scope="row">HTML element</th><td>${tags.map((t) => `<code>&lt;${t}&gt;</code>`).join(' ')}</td></tr>`,
    `<tr><th scope="row">React</th><td>${reacts.map((r) => `<code>${r}</code>`).join(' ')} from <code>@commmerce/ui-react</code> (<code>npm install @commmerce/ui-react</code>)</td></tr>`,
    `<tr><th scope="row">Load it</th><td>Included in the <a href="#/start">hosted build</a> and <code>@commmerce/ui</code>; no separate import.</td></tr>`,
    `<tr><th scope="row">Frameworks</th><td>Plain HTML and server-rendered pages; React. Others not tested. <a href="#/start/install">Details</a></td></tr>`,
  ], 'kv')}
  ${h2('API')}
  <p class="muted">Set attributes in HTML (kebab-case, <code>help-text</code>) or properties in JavaScript and React (camelCase, <code>helpText</code>). Generated from the component source.</p>
  ${tags.map((t) => api(t, tags.length > 1)).join('')}
  ${c.states || stateEx.length || c.stateTable ? `${h2('States')}
  ${c.stateTable ? `<p class="muted">How each state looks (owner standard, 1.6: every interactive component defines them all).</p>
  ${table(['State', 'How it looks and behaves'], c.stateTable.map(([st, how]) => `<tr><th scope="row">${esc(st)}</th><td>${md(how)}</td></tr>`))}` : ''}
  ${stateEx.length ? `<p>In the example picker above: ${stateEx.map(({ e, i }) => `<a href="#/components/${c.slug}?s=viewer" data-ex="${i}">${esc(e.title)}</a>`).join(', ')}.</p>` : ''}
  ${c.states ? `<p class="muted">${stateEx.length ? 'More' : 'Beyond the examples above'}: ${c.states.map((st) => esc(st.title.toLowerCase())).join(', ')}.</p>` : ''}
  ${c.states ? `<div class="states">${c.states.map((st, i) => `<section class="state" aria-labelledby="state-${i}">
    <h3 id="state-${i}">${esc(st.title)}</h3>
    ${st.description ? `<p>${md(st.description)}</p>` : ''}
    <div class="ex-stage state-stage" data-cm-theme="light"><div class="ex-frame">${inlineLayout(st.html)}</div></div>
    <details><summary>Code</summary>${codeBlock([{ label: 'HTML', lang: 'html', code: inlineLayout(st.html) }, { label: 'React', lang: 'jsx', code: toReact(inlineLayout(st.html)) }], { flush: true })}</details>
  </section>`).join('')}</div>` : ''}` : ''}
  ${c.responsive?.length ? `${h2('Responsive behaviour', 'responsive')}
  <p class="muted">From the component's styles. "The window" is the browser window, or the app's frame when it runs inside the admin.</p>
  <ul>${c.responsive.map((x) => `<li>${md(x)}</li>`).join('')}</ul>` : ''}
  ${h2('Keyboard and accessibility', 'accessibility')}
  ${c.keyboard?.length ? table(['Keys', 'What it does'], c.keyboard.map(([k, what]) => `<tr><th scope="row">${md(k)}</th><td>${md(what)}</td></tr>`)) : ''}<ul>${c.a11y.map((x) => `<li>${md(x)}</li>`).join('')}</ul>
  ${h2('Best practices')}
  ${doDont(c.do, c.dont)}
  ${c.content?.length ? `${h2('Content guidelines')}<ul>${c.content.map((x) => `<li>${md(x)}</li>`).join('')}</ul>` : ''}
  ${h2('Related components and patterns', 'related')}
  <div class="related">${c.related.map((s) => components.find((x) => x.slug === s)).filter(Boolean).map((r) => `<a href="#/components/${r.slug}">${r.name}</a>`).join('')}
  ${uses.map((p) => `<a class="pat" href="#/patterns/${p.slug}">Pattern: ${p.name}</a>`).join('')}</div>`,
  after(main) {
    const sel = $('#exsel', main), frame = $('#frame', main), desc = $('#exdesc', main), codeEl = $('#excode', main);
    const show = (i) => {
      const e = ex[i];
      frame.innerHTML = e.html;
      // Overlay examples: a button with data-opens="<id>" opens that overlay (in an app, call show() or set open).
      frame.querySelectorAll('[data-opens]').forEach((b) => b.addEventListener(b.localName === 'cm-search' ? 'cm-filter' : 'click', () => frame.querySelector(`#${b.dataset.opens}`)?.show?.()));
      wireToasts(frame);
      wireDensity(frame);
      wireBoards(frame);
      wireCalendars(frame);
      wireUploads(frame);
      wirePalettes(frame);
      desc.innerHTML = md(e.description ?? '');
      desc.hidden = !e.description;
      codeEl.innerHTML = codeBlock([{ label: 'HTML', lang: 'html', code: e.html }, { label: 'React', lang: 'jsx', code: toReact(e.html) }], { flush: true });
      wireCode(codeEl);
    };
    sel.addEventListener('change', () => show(+sel.value));
    show(0);
    main.querySelectorAll('[data-ex]').forEach((a) => a.addEventListener('click', () => { sel.value = a.dataset.ex; show(+a.dataset.ex); }));
    main.querySelectorAll('.state-stage').forEach((st) => {
      st.dataset.cmTheme = effectiveTheme();
      st.querySelectorAll('[data-opens]').forEach((b) => b.addEventListener('click', () => st.querySelector(`#${b.dataset.opens}`)?.show?.()));
      wireToasts(st);
      wireDensity(st);
      wireBoards(st);
      wireCalendars(st);
      wireUploads(st);
      wirePalettes(st);
    });
    // Links in a preview (nav items, breadcrumbs, cards) point at made-up addresses such as #orders: following one
    // would leave this page for "Page not found". Keep them inert; components still fire their own events.
    main.querySelectorAll('.ex-stage').forEach((st) => st.addEventListener('click', (ev) => {
      if (ev.composedPath().some((n) => n.localName === 'a' && n.hasAttribute?.('href'))) ev.preventDefault();
    }));
    const siteTheme = effectiveTheme();
    $('#stage', main).dataset.cmTheme = siteTheme;
    main.querySelectorAll('[data-theme]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.theme === siteTheme)));
    main.querySelectorAll('[data-theme]').forEach((b) => b.addEventListener('click', () => {
      $('#stage', main).dataset.cmTheme = b.dataset.theme;
      main.querySelectorAll('[data-theme]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }));
    main.querySelectorAll('[data-w]').forEach((b) => b.addEventListener('click', () => {
      frame.classList.toggle('narrow', b.dataset.w === 'narrow');
      main.querySelectorAll('[data-w]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }));
  } };
}
components.forEach((c) => (pages[`/components/${c.slug}`] = () => componentPage(c)));

planned.forEach((p) => (pages[`/components/${p.slug}`] = () => ({ title: p.name, html: `
  <h1>${p.name}</h1>
  <p class="status-line">${badge(p.status)} <span class="muted">${STATUS[p.status].text}</span></p>
  <p class="lead">${p.name} is designed in the Commmerce Design System (Figma page "${esc(p.figma)}") and ${p.status === 'in-progress' ? 'is in the next build batch' : 'is scheduled in a later build batch'}. There is no element or API to use yet.</p>
  ${p.adminOnly ? note('This is part of the admin itself. When built, it is for Commmerce\'s own products only. Apps don\'t draw their own admin navigation.') : ''}
  ${h2('What to use meanwhile')}
  <p>${md(p.use ?? 'Nothing equivalent yet. Design the screen without it, or keep it out of your first release.')}</p>
  ${h2('Follow progress')}
  <p>When it ships, it appears in the <a href="#/components">component list</a> as Ready and in the <a href="#/releases">release notes</a>. To ask for it sooner, email ${mail(`Component request: ${p.name}`)}.</p>` })));

/* ---- Patterns ---- */
// A whole page around the admin frame: what the merchant's window loads.
const frameDoc = (body, a, theme) => `<!doctype html>
<html lang="en" data-cm-look="refined"${theme ? ` data-cm-theme="${theme}"` : ''}>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <link rel="stylesheet" href="${a.font}">
  <link rel="stylesheet" href="${a.css}">
  <script type="module" src="${a.js}"></script>
  <style>body { margin: 0; }</style>
</head>
<body>
${body}
</body>
</html>`;
// Runs the admin frame example in real windows (iframes) of a given size, scaled down to fit the column.
function runFrames(main, f = framesOf({ frames: true })) {
  const doc = frameDoc(f.html + '\n' + (f.script ?? ''), { font: asset('vendor/fonts.css'), css: asset('vendor/tokens.css'), js: asset('vendor/cdn.js') }, effectiveTheme());
  // A srcdoc page resolves relative addresses against this page, so the logo path works as written.
  main.querySelectorAll('.frame-fit').forEach((fit) => {
    const w = +fit.dataset.w, h = +fit.dataset.h, iframe = fit.querySelector('iframe');
    iframe.style.width = `${w}px`; iframe.style.height = `${h}px`;
    const size = () => { const k = Math.min(1, fit.clientWidth / w); iframe.style.transform = `scale(${k})`; fit.style.height = `${Math.round(h * k)}px`; };
    new ResizeObserver(size).observe(fit);
    size();
    iframe.srcdoc = doc;
  });
}
// Home page: the orders screen in the real admin frame, in a window as wide as the column (wide: side navigation
// card and panel; narrow: bottom navigation and More menu), still interactive (wireOrderList runs inside it).
const HOME_FRAME = (siteJs) => `<cm-app-frame panel menu-item="more">
  <cm-header-bar slot="header" store="Anika's Boutique">
    <img slot="logo" src="assets/logo-placeholder.svg" alt="Store logo" width="190" height="14">
  </cm-header-bar>
  <cm-side-navigation slot="navigation" label="Admin">
    <cm-nav-item label="Home" icon="home" href="#home"></cm-nav-item>
    <cm-nav-item label="Orders" icon="bag" href="#orders" current badge="3"></cm-nav-item>
    <cm-nav-item label="Products" icon="box" href="#products"></cm-nav-item>
    <cm-nav-item label="Customers" icon="users" href="#customers"></cm-nav-item>
    <cm-nav-item label="Reports" icon="chart" href="#reports"></cm-nav-item>
    <cm-nav-item label="Apps" icon="apps" href="#apps"></cm-nav-item>
  </cm-side-navigation>
  <div id="home-orders">${orderListHtml}</div>
  <cm-bottom-navigation slot="bottom-navigation" label="Admin">
    <cm-nav-item label="Home" icon="home" href="#home"></cm-nav-item>
    <cm-nav-item label="Orders" icon="bag" href="#orders" current></cm-nav-item>
    <cm-nav-item label="Products" icon="box" href="#products"></cm-nav-item>
    <cm-nav-item label="Customers" icon="users" href="#customers"></cm-nav-item>
    <cm-nav-item label="More" icon="menu" value="more"></cm-nav-item>
  </cm-bottom-navigation>
  <cm-mobile-menu slot="mobile-menu" label="Admin" store="Anika's Boutique">
    <cm-nav-item label="">
      <cm-nav-item label="Reports" icon="chart" href="#reports"></cm-nav-item>
      <cm-nav-item label="Apps" icon="apps" href="#apps"></cm-nav-item>
    </cm-nav-item>
  </cm-mobile-menu>
</cm-app-frame>
<script type="module">
  import { wireOrderList } from '${siteJs}';
  wireOrderList(document.getElementById('home-orders'));
  // Menu links stay on this preview.
  document.addEventListener('cm-navigate', (e) => { if (e.detail?.value !== 'more') e.preventDefault(); });
</script>`;
function runHomeFrame(main) {
  const iframe = main.querySelector('.home-frame iframe');
  if (!iframe) return;
  iframe.srcdoc = frameDoc(HOME_FRAME(asset('site.js')), { font: asset('vendor/fonts.css'), css: asset('vendor/tokens.css'), js: asset('vendor/cdn.js') }, effectiveTheme());
}
const KIND = { example: ['Working implementation', 'success'], guidance: ['Guidance', 'neutral'] };
// One sentence per pattern saying what it is. "Only Ready components" is checked against the component list.
const kindLine = (p) => {
  const allReady = p.uses.every((s) => components.some((c) => c.slug === s));
  if (p.kind === 'example') return `It runs live on this page${allReady ? ', built only from Ready components (plus plain HTML for layout)' : ''}, with its code below the preview.`;
  return `The recommended approach and wording, not a complete screen to copy.${p.html ? ' The preview shows the parts that exist today.' : ''}`;
};
pages['/patterns'] = () => ({ wide: true, title: 'Patterns', html: `
  <h1>Patterns</h1>
  <p class="lead">Complete merchant workflows, built from the components. A <strong>working implementation</strong> runs live on its page, built from Ready components, with the code to copy. <strong>Guidance</strong> describes the recommended approach and wording; it is not a complete screen to copy.</p>
  <div class="pgrid">${patterns.map((p) => `<a class="pcard" href="#/patterns/${p.slug}"><cm-badge tone="${KIND[p.kind][1]}">${KIND[p.kind][0]}</cm-badge><strong>${p.name}</strong><span>${esc(p.task)}</span>${p.status ? `<small class="muted">${esc(p.status)}</small>` : ''}</a>`).join('')}</div>` });

patterns.forEach((p) => (pages[`/patterns/${p.slug}`] = () => ({ wide: true, title: p.name, html: `
  <h1>${p.name}</h1>
  <div class="kind-line kind-line--${p.kind}"><cm-badge tone="${KIND[p.kind][1]}">${KIND[p.kind][0]}</cm-badge><p>${kindLine(p)}${p.status ? ` ${esc(p.status)}` : ''}</p></div>
  <div class="task"><span>Merchant task</span><p>${esc(p.task)}</p></div>
  ${p.states ? `<div class="example"><div class="ex-bar"><cm-option-group id="state-pick" aria-label="State to show">${Object.keys(statesHtml).map((k, i) => `<option value="${k}" ${i ? '' : 'selected'}>${k[0].toUpperCase() + k.slice(1)}</option>`).join('')}</cm-option-group></div>
      <div class="ex-stage"><div class="ex-frame" id="state-frame"></div></div><div id="state-code"></div></div>`
    : p.app ? `<div class="example ab-demo">
      <div class="ex-bar"><span class="muted small">Admin address</span> <code id="ab-address">/apps/product-reviews</code></div>
      <div id="ab-host" class="ab-host"><iframe id="ab-frame" title="Example app: Product reviews" loading="lazy"></iframe></div>
      ${codeBlock([{ label: 'HTML', lang: 'html', code: p.app({ bridge: PREVIEW.bridge, font: PREVIEW.font, css: PREVIEW.css, ui: PREVIEW.js, hostOrigin: 'YOUR_ADMIN_ORIGIN' }) }], { flush: true })}</div>`
    : p.frames ? `<div class="example">
      <div class="ex-stage frame-pair">
        <figure class="frame-shot"><figcaption>Desktop: 1440px window, scaled to fit</figcaption><div class="frame-fit" data-w="1440" data-h="900"><iframe title="Example: ${framesOf(p).label} in a 1440px window" loading="lazy"></iframe></div></figure>
        <figure class="frame-shot frame-shot--phone"><figcaption>Phone: 390px window</figcaption><div class="frame-fit" data-w="390" data-h="780"><iframe title="Example: ${framesOf(p).label} in a 390px phone window" loading="lazy"></iframe></div></figure>
      </div>
      ${codeBlock([{ label: 'HTML', lang: 'html', code: frameDoc(framesOf(p).html + (framesOf(p).script ? '\n' + framesOf(p).script : ''), { font: PREVIEW.font, css: PREVIEW.css, js: PREVIEW.js }) }, { label: 'React', lang: 'jsx', code: framesOf(p).react }], { flush: true })}</div>`
    : p.html ? `<div class="example">${p.banner ? '<div class="ex-msg"><cm-banner data-pattern-status hidden></cm-banner></div>' : ''}<div class="ex-stage ex-stage--app"><div class="ex-app" id="pattern-live">${p.html}</div></div>
      ${codeBlock([{ label: 'HTML', lang: 'html', code: p.html }, { label: 'React', lang: 'jsx', code: toReact(p.html) }], { flush: true })}</div>` : ''}
  ${h2('Recommended layout and behaviour')}
  <ul>${p.layout.map((x) => `<li>${md(x)}</li>`).join('')}</ul>
  ${p.notes.length ? p.notes.map((n) => note(md(n))).join('') : ''}
  ${h2('Components used')}
  <div class="related">${p.uses.map((s) => components.find((c) => c.slug === s)).filter(Boolean).map((c) => `<a href="#/components/${c.slug}">${c.name}</a>`).join('')}</div>`,
  after(main) {
    if (p.wire) p.wire(main);
    if (p.frames) runFrames(main, framesOf(p));
    if (p.app) runDemoApp(main, 'product-reviews', p.app, true);
    if (p.states) {
      const pick = $('#state-pick', main), frame = $('#state-frame', main), code = $('#state-code', main);
      const show = () => { const h = statesHtml[pick.value || 'empty']; frame.innerHTML = h; code.innerHTML = codeBlock([{ label: 'HTML', lang: 'html', code: h }, { label: 'React', lang: 'jsx', code: toReact(h) }], { flush: true }); wireCode(code); };
      pick.addEventListener('change', show); show();
    }
  } })));

/* ---- Foundations ---- */
pages['/foundations/accessibility'] = () => ({ title: 'Accessibility', html: `
  <h1>Accessibility</h1>
  <p class="lead">Merchants run their stores with screen readers, keyboards, zoom and phones in bright sunlight. Commmerce UI targets WCAG 2.2 level AA. This page says exactly what has been checked and what has not.</p>
  ${h2('How it is evaluated')}
  ${table(['Check', 'Status', 'What it covers'], [
    ['Automated colour contrast', badge('ready'), 'Every foreground and background token pair the components use, in light and dark. The token build fails if one drops below AA.'],
    ['Automated browser tests', badge('ready'), 'Every ready component has tests for keyboard use, ARIA roles and names, events and form behaviour. They run in Chromium, Firefox and WebKit on every change.'],
    ['Automated accessibility audit', badge('ready'), 'axe-core 4.10.2 with the WCAG 2.0, 2.1 and 2.2 A and AA rules, run on every example of every component page, the overlays the examples open and the States sections, in light and dark (338 checks), plus a keyboard sweep of every example (254 tab stops) for a visible focus indicator and no keyboard traps. Last run on 1.0.0-rc.2: no violations. Automated tools find only part of the problems people meet.'],
    ['Safari (WebKit)', badge('ready'), 'The full component, React wrapper (React 18 and 19) and App Bridge test suites run in WebKit 18.2, the engine behind Safari, on every change; every docs page and its live components were also checked in WebKit.'],
    ['Firefox', badge('ready'), 'The full component, React wrapper (React 18 and 19) and App Bridge test suites run in Firefox on every change (Playwright\'s Firefox build, on Linux).'],
    ['Screen reader testing (VoiceOver, NVDA, TalkBack)', `<cm-badge>Not done yet</cm-badge>`, 'Accessible names and roles are tested in code, not yet with real screen readers.'],
    ['Full WCAG 2.2 AA audit', `<cm-badge>Not done yet</cm-badge>`, 'A review by people (screen readers, zoom and reflow, speech input) is planned before 1.0.0. Commmerce UI does not claim conformance until it is done.'],
  ].map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`))}
  ${h2('What the "AA contrast" check means')}
  <ul>
    <li>Text colours reach <strong>4.5:1</strong> against every background they are paired with; icons, input borders and focus rings reach <strong>3:1</strong>.</li>
    <li>It covers the pairs used inside Commmerce UI components, in both themes. It does not cover your own colours, images or text over photos.</li>
    <li>Contrast is one part of AA. Keyboard access, names, focus order and timing are covered by the tests above.</li>
  </ul>
  <p>Where a Figma colour was too light, it keeps its hue and is darkened only as far as needed:</p>
  ${table(['Token', 'Figma', 'Now', 'Contrast'], [
    ['text-information', '#F18402', '#AD5500', '2.3 → 4.6:1'], ['text-success', '#61AD14', '#3C7C00', '2.5 → 4.7:1'],
    ['text-speciality', '#1EC81A', '#008800', '2.3 → 4.6:1'], ['text-critical', '#E50000', '#DE0000', '4.4 → 4.6:1'],
    ['text-attention', '#3274B6', '#2E6FAF', '4.3 → 4.6:1'], ['text-counter', '#3E6CFF', '#3B68F9', '4.4 → 4.6:1'],
    ['icon-default', '#9E9E9E', '#8B8B8B', '2.5 → 3.4:1'], ['border-input', '#D6D6D6', '#8B8B8B', '1.5 → 3.4:1'],
  ].map(([t, a, b, c]) => `<tr><td><code>${t}</code></td><td><span class="swatch" style="background:${a}"></span>${a}</td><td><span class="swatch" style="background:${b}"></span>${b}</td><td>${c}</td></tr>`), 'scroll')}
  ${h2('What the components do for you')}
  <ul>
    <li>Native elements inside each component, so roles and keyboard behaviour come from the browser.</li>
    <li>A visible 2px focus ring in both themes.</li>
    <li>Labels, help text and errors tied to their controls; errors are announced.</li>
    <li>Critical banners interrupt the screen reader; others wait their turn.</li>
    <li>Icons are hidden from screen readers unless you give them a label.</li>
  </ul>
  ${h2('What you still need to do')}
  <ul>
    <li>Give every field a <code>label</code>, every page one <code>h1</code>, and every card a heading at the right level.</li>
    <li>Write errors that say how to fix the problem.</li>
    <li>Don't use colour alone to carry meaning: pair it with words, or an icon with a label.</li>
    <li>Try your flow with only a keyboard: Tab, Shift+Tab, Enter, Space and Esc.</li>
  </ul>` });

pages['/foundations/content'] = () => ({ title: 'Content', html: `
  <h1>Content</h1>
  <p class="lead">Words are part of the interface. Write for a busy merchant who wants to finish the task and get back to their store.</p>
  ${h2('Voice')}
  <ul><li><strong>Plain.</strong> Everyday words. "Delete", not "Purge".</li><li><strong>Direct.</strong> Lead with what matters. One idea per sentence.</li><li><strong>Calm.</strong> No exclamation marks, no blame. "The card was declined", not "You entered a bad card!"</li></ul>
  ${h2('Conventions')}
  ${table(['Element', 'Rule', 'Example'], [
    ['Field labels', 'Nouns, sentence case', '<code>Name</code>, <code>Subject</code>, <code>Redeemed</code>'],
    ['Hints', 'Lowercase, in brackets after the label', '<code>Ordered [points earned per rupee (rs. 1) spent]</code>'],
    ['Help text', 'One sentence under the control, no full stop needed', '<code>Phone otp is only for Indian numbers</code>'],
    ['Buttons', 'Title case, verb first, short', '<code>Save</code>, <code>Send Preview</code>, <code>Add Product</code>'],
    ['Breadcrumbs', 'Above the page title', '<code>Dashboard / Products / Add Product</code>'],
    ['Text actions', 'Uppercase with wide tracking', '<code>ADD</code>, <code>REMOVE</code>, <code>UPGRADE</code>'],
    ['Money', 'Rupees as "Rs." with Indian digit grouping', '<code>Rs. 1,24,999</code>'],
    ['Errors', 'What happened and how to fix it', '<code>Enter a price above 0</code>'],
    ['Statuses', 'One word for one state, everywhere', '<code>Paid</code>, <code>Processing</code>, <code>Delivered</code>'],
  ].map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`))}` });

pages['/foundations/localisation'] = () => {
  const componentFor = (tag) => components.find((c) => c.tag === tag || (c.parts ?? []).some((x) => x.tag === tag));
  const rows = Object.entries(STRINGS).flatMap(([ns, keys]) => Object.entries(keys).map(([k, v]) => {
    const c = ns === 'common' ? null : componentFor(tagOf(ns));
    const where = ns === 'common' ? `<span class="muted">${COMMON_USERS[k] ?? 'Several'}</span>` : c ? `<a href="#/components/${c.slug}">${esc(c.name)}</a> <small class="muted">${tagOf(ns)}</small>` : `<code>${tagOf(ns)}</code>`;
    return `<tr><td><code>${ns}.${esc(k)}</code></td><td>${esc(showMessage(v))}</td><td>${where}</td></tr>`;
  }));
  const ar = (o) => JSON.stringify(o); // no quotes or apostrophes in the Arabic, so it sits in a single-quoted attribute
  const rtlExample = `<div dir="rtl" lang="ar">
  <cm-search label="بحث في الطلبات" placeholder="ابحث عن طلب" value="قميص" filter filter-count="2"
    strings='${ar({ clear: 'مسح البحث', filter: 'تصفية', filterApplied: '{label} ({count} مطبّقة)' })}'></cm-search>
  <cm-status-tabs aria-label="الحالة">
    <option value="all" count="233">الكل</option>
    <option value="open" count="23">قيد التنفيذ</option>
    <option value="done">مكتمل</option>
  </cm-status-tabs>
  <cm-toggle checked label="عرض في المتجر"></cm-toggle>
  <cm-pagination total="290" page="2" page-sizes="[]" resource-name="طلبًا"
    strings='${ar({ label: 'ترقيم الصفحات', summary: 'عرض {from}–{to} من {total} {resource}', page: 'صفحة', of: 'من {count}', previous: 'الصفحة السابقة', next: 'الصفحة التالية' })}'></cm-pagination>
</div>`;
  return { title: 'Localisation and RTL', html: `
  <h1>Localisation and RTL</h1>
  <p class="lead">Every word a component writes by itself (button labels, accessible names, status messages, validation messages) can be translated, numbers and dates follow the page's language, and every component works right to left.</p>
  <p>The text you pass in (labels, headings, options) is yours to translate. This page is about the text the components add themselves: the <strong>Save</strong> and <strong>Discard</strong> of the save bar, the <strong>Previous page</strong> arrow's name, <strong>2 products selected.</strong> in a resource list. In English nothing changes: the defaults are the same words as before.</p>
  ${h2('Set the text once, for the whole app')}
  <p>Call <code>configure()</code> once, before or after the components render. Components already on the page update.</p>
  ${codeBlock([{ label: 'JavaScript', lang: 'jsx', code: `import { configure } from '@commmerce/ui';   // or '@commmerce/ui-react'

configure({
  locale: 'fr',                       // numbers, dates and plural rules
  strings: {
    common: { close: 'Fermer', dismiss: 'Ignorer', loading: 'Chargement' },
    saveBar: { message: 'Modifications non enregistrées', save: 'Enregistrer', discard: 'Annuler' },
    pagination: { previous: 'Page précédente', next: 'Page suivante', summary: '{from}–{to} sur {total} {resource}' },
  },
});` }])}
  <p>Keys are grouped by component: the tag name without <code>cm-</code>, in camelCase (<code>cm-resource-list</code> is <code>resourceList</code>). Keys in <code>common</code> apply to every component that uses them. Leave out any key to keep its English text. With the hosted build, import the same functions from <code>cdn.js</code>:</p>
  ${codeBlock([{ label: 'HTML', lang: 'html', code: `<script type="module">
  import { configure } from '${PREVIEW.js}';
  configure({ strings: { saveBar: { save: 'Enregistrer' } } });
</script>` }])}
  ${table(['Function', 'What it does'], [
    ['<code>configure({ locale, strings, translations })</code>', 'Sets the locale for every component, merges <code>strings</code> for every language, and <code>translations</code> per language: <code>{ fr: {…}, ar: {…} }</code>.'],
    ['<code>setStrings(strings, locale?)</code>', 'Merges strings. With a locale they apply only to components in that language; strings for <code>fr</code> also apply to <code>fr-CA</code>.'],
    ['<code>resetStrings()</code>', 'Back to English, and to the locale from <code>lang</code>.'],
    ['<code>getDefaultStrings()</code>', 'Every key with its English text, to hand to translators.'],
    ['<code>formatNumber(n, options, locale)</code>, <code>formatDate(d, options, locale)</code>', '<code>Intl.NumberFormat</code> and <code>Intl.DateTimeFormat</code>, cached.'],
  ].map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`))}
  ${h2('Change the text of one component')}
  <p>Properties that already named a piece of text (<code>save-label</code>, <code>close-label</code>, <code>placeholder</code>…) still work and win over everything else. Reading them gives the text in use, so <code>saveBar.saveLabel</code> is "Save" in English and your translation after <code>configure()</code>.</p>
  <p>Every component with built-in text also has a <code>strings</code> property for any of its keys. In HTML it is JSON; in JavaScript and React it is an object, and its values can be functions:</p>
  ${codeBlock([{ label: 'HTML', lang: 'html', code: `<cm-pagination total="290" strings='{"previous":"Page précédente","next":"Page suivante"}'></cm-pagination>` }, { label: 'React', lang: 'jsx', code: `<Pagination total={290} strings={{ previous: 'Page précédente', next: 'Page suivante' }} />` }])}
  <p>Each component's page lists its keys under <strong>Built-in text</strong>, below its properties. First match wins: the component's own property or <code>strings</code>, then strings set for its language, then strings set for every language, then English.</p>
  ${h2('Text with values in it')}
  <p>Some strings carry values: <code>Showing {from}–{to} of {total} {resource}</code>, <code>{count} {resource} selected.</code> Write the placeholders where your language needs them. A string can take three forms:</p>
  ${table(['Form', 'Example', 'Notes'], [
    ['Text with placeholders', '<code>\'Page {page} sur {count}\'</code>', 'Numbers are formatted for the locale: 1,234,567 in English, 1.234.567 in German, 12,34,567 in Indian English (<code>en-IN</code>).'],
    ['Plural forms', '<code>{ one: \'{count} avis\', other: \'{count} avis\' }</code>', 'Picked from <code>count</code> with <code>Intl.PluralRules</code>: <code>zero</code>, <code>one</code>, <code>two</code>, <code>few</code>, <code>many</code>, <code>other</code> (required).'],
    ['A function', '<code>({ count, resource }) => …</code>', 'Gets the raw values (numbers stay numbers) and returns the text. Format numbers yourself, with <code>formatNumber</code>.'],
  ].map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`))}
  <p>Resource list and pagination nouns come from <code>resource-name</code> (and <code>resource-name-plural</code>); the list picks the singular or plural with the locale's plural rules.</p>
  ${h2('Numbers and dates')}
  <p>Counts in pagination, status tabs, resource lists, app cards and progress bars, dates in comments and data tables, and the sort order of text columns use the browser's <code>Intl</code> APIs with one locale, chosen in this order:</p>
  <ol><li>the <code>locale</code> passed to <code>configure()</code>;</li><li>the <code>lang</code> attribute of the nearest ancestor (usually <code>&lt;html lang&gt;</code>), so a section in another language formats its own way;</li><li>the browser's language.</li></ol>
  <p>Changing <code>lang</code> on the page updates the components. Money you format yourself: pass it as text, already formatted (<code>Rs. 1,24,999</code>, see <a href="#/foundations/content">Content</a>).</p>
  ${h2('Right to left')}
  <p>Set <code>dir="rtl"</code> on <code>&lt;html&gt;</code> (or any container) and the components lay themselves out right to left: padding, alignment and positions are written with logical CSS properties, so start and end swap.</p>
  <ul>
    <li><strong>Icons that point</strong> (chevron-left and chevron-right, arrow-left, arrow-up-right, send, log-out) are mirrored: the previous-page arrow points right. Other icons are never mirrored. Set <code>mirror="never"</code> on a <code>cm-icon</code> to keep one as drawn, or <code>mirror="always"</code> to mirror any icon.</li>
    <li><strong>Panels</strong>: the side panel and filter panel slide in from the left; the notification panel sits under the top-left corner; action menus aligned to the end line up with the trigger's left edge.</li>
    <li><strong>Arrow keys</strong> follow the reading direction in status tabs, option groups, radio groups and side navigation: in right-to-left text, left moves forward.</li>
    <li><strong>Switches</strong> turn on towards the left.</li>
  </ul>
  <p>A live example, in Arabic, with <code>dir="rtl"</code> and <code>lang="ar"</code>:</p>
  <div class="ex-stage" data-cm-theme="light"><div class="ex-frame">${rtlExample.replace('<div dir="rtl" lang="ar">', '<div dir="rtl" lang="ar" style="display:grid;grid-template-columns:minmax(0,1fr);gap:var(--cm-space-20)">')}</div></div>
  ${codeBlock([{ label: 'HTML', lang: 'html', code: rtlExample }])}
  ${note('English text inside a right-to-left container can look out of order around punctuation: that is the browser\'s bidirectional text algorithm, and it reads correctly with right-to-left text. Translate the text as well as setting <code>dir</code>.')}
  ${h2('Every translatable string', 'all-strings')}
  <p class="muted">${rows.length} strings, generated from the components. Pass them to <code>configure({ strings: { namespace: { key: … } } })</code>.</p>
  ${table(['Key', 'English', 'Used by'], rows)}
  ${h2('For component authors', 'authors')}
  <p>New components follow the same pattern: extend <code>CmLocalizedElement</code>, register English text with <code>defineStrings('datePicker', {…})</code>, and write <code>this.t('key', { count })</code> instead of English in templates. The full rule is in the repository's <code>CLAUDE.md</code>.</p>` };
};

const colorGroups = [
  ['Surfaces', (n) => n.startsWith('bg-') && !/(attention|information|success|critical|error)/.test(n)],
  ['Status', (n) => /(attention|information|success|critical|error)/.test(n) && !n.startsWith('border')],
  ['Text', (n) => n.startsWith('text-')], ['Icons', (n) => n.startsWith('icon-')],
  ['Borders', (n) => n.startsWith('border-')], ['Actions', (n) => n.startsWith('action-')],
  ['Navigation and controls', (n) => /^(nav-|toggle-|avatar|thumb|overlay)/.test(n)], ['Grey scale (not themed)', (n) => n.startsWith('gray-')],
];
pages['/foundations/colors'] = () => {
  const used = new Set();
  // An alias ("{bg-hover}") shows the colour it points to, in each theme.
  const resolve = (v, theme, depth = 0) => {
    const m = /^\{([\w-]+)\}$/.exec(v ?? '');
    const to = m && depth < 5 && colorTokens.find((x) => x.name === m[1]);
    return to ? resolve(to.value[theme] ?? to.value.light, theme, depth + 1) : v;
  };
  const chip = (t) => `<button class="chip copyable" data-copy="var(${t.cssVar})" aria-label="Copy var(${t.cssVar})">
    <span class="fill"><i style="background:${resolve(t.value.light, 'light')}"></i><i style="background:${resolve(t.value.dark ?? t.value.light, 'dark')}"></i></span>
    <span class="info"><b>${t.name}</b><small>${t.value.light}${t.value.dark && t.value.dark !== t.value.light ? ' · ' + t.value.dark : ''}</small></span></button>`;
  return { wide: true, title: 'Colour', html: `
  <h1>Colour</h1>
  <p class="lead">Black and white first; colour only for meaning. Each swatch shows light on the left and dark on the right. Select one to copy its variable.</p>
  ${note('Information is <strong>orange</strong> and attention is <strong>blue</strong> in this system, the reverse of many others. Always pick tokens by name.')}
  ${colorGroups.map(([title, test]) => {
    const list = colorTokens.filter((t) => !used.has(t.name) && test(t.name));
    list.forEach((t) => used.add(t.name));
    return list.length ? `${h2(title)}<div class="palette">${list.map(chip).join('')}</div>` : '';
  }).join('')}` };
};

pages['/foundations/typography'] = () => {
  const styles = tokens.filter((t) => t.family === 'type' && t.group);
  const ramp = (g) => `<div class="ramp">${styles.filter((s) => s.group === g).map((s) => `<div>
    <small>${s.name.replace('type-', '')}</small>
    <span data-specimen style="font-size:${s.value.fontSize};font-weight:${s.value.fontWeight};line-height:${s.value.lineHeight}">Rs. 2,340 · 12 orders today</span>
    <small>${s.value.fontSize} / ${s.value.fontWeight}</small></div>`).join('')}</div>`;
  return { title: 'Typography', html: `
  <h1>Typography</h1>
  <p class="lead">Poppins on a fixed scale (12, 13, 14, 16, 18, 20, 24, 30, plus 40 for marketing/hero headings only). UI text is 14/20; headings are semibold (600), labels medium (500), everything else regular. Two ramps: Desktop and Responsive (phones). See <a href="#/foundations/scale">Scale</a>.</p>
  ${h2('Desktop')}${ramp('Desktop')}
  ${h2('Responsive')}${ramp('Responsive')}
  ${h2('Sentence case')}
  <p>Since 1.5 nothing is upper-cased: badges, labels, table headers, navigation and text actions are written and shown in sentence case ("5 open", "Order placed"). <code>--cm-tracking-caps</code> is kept for existing apps and deprecated.</p>
  ${h2('Numbers')}
  <p>Counts, prices, metrics, pagination and table cells use tabular figures (<code>font-variant-numeric: tabular-nums</code>), so digits line up in columns and don't shift as they change. Right-align numeric columns: in <a href="#/components/data-table">Data table</a> give the column <code>type="numeric"</code> or <code>"money"</code> (or <code>align="end"</code>).</p>
  ${h2('Using type tokens')}
  ${codeBlock([{ label: 'CSS', lang: 'html', code: `.title {
  font-family: var(--cm-font-sans);
  font-size: var(--cm-type-heading-lg-size);
  font-weight: var(--cm-type-heading-lg-weight);
  line-height: var(--cm-type-heading-lg-line-height);
}` }])}` };
};

// Scale (1.5.0): every size a component uses, in one place. Values come from tokens.json, never typed here.
pages['/foundations/scale'] = () => {
  const fam = (f) => tokens.filter((t) => t.family === f);
  const tv = (n) => tokens.find((t) => t.name === n);
  const copyCell = (t) => `<button class="copyable" data-copy="var(${t.cssVar})" aria-label="Copy var(${t.cssVar})"><code>${t.cssVar}</code></button>`;
  const rows = (list, extra = () => '') => list.map((t) => `<tr><td>${copyCell(t)}${t.deprecated ? ' <cm-badge>Deprecated</cm-badge>' : ''}</td><td><code>${esc(tokenValue(t))}</code></td><td>${md(t.usage ?? '')}${extra(t)}</td></tr>`);
  const HEAD = ['Token', 'Value', 'Use'];
  const styles = tokens.filter((t) => t.family === 'type' && t.group === 'Desktop');
  const sizes = fam('fontSize');
  return { title: 'Scale', html: `
  <h1>Scale</h1>
  <p class="lead">One standard system for sizes (since 1.5): a 4px spacing grid, eight type sizes (plus one marketing/hero size), three control heights, four corner radii, three icon sizes, three overlay shadows and two motion speeds. Components use only these; <code>npm run check:scale</code> fails the build when component CSS strays from them.</p>
  ${note('The scale is decided by judgement, not taken from the Figma file: its sizes were a designer mistake (owner decision, 16 Nov 2026). Since 1.6 the component sizes follow the owner standard below (the owner\'s UI/UX standardisation brief, issue #33), which overrides 1.5 where the numbers differ.')}
  ${h2('Owner standard (1.6)')}
  <p>The numbers every Commmerce app follows, written by the owner after reviewing all CRM screens (credit: the owner's brief, commmerce-ui issue #33). The components draw them by default; use the same numbers in your own markup. "Phones" means two things: <strong>sizes of controls</strong> follow the pointer (<code>pointer: coarse</code>, every touch screen, so a tablet gets touch sizes too), and <strong>layout</strong> (paddings, page title, tabs) follows the width (640px or less).</p>
  ${table(['Part', 'Desktop', 'Touch / phone', 'Where'], [
    ['Buttons (primary, secondary)', '36px (slim 32, large 40)', '40px drawn, 44px hit area', '<code>cm-button</code>, <code>cm-action-menu</code>'],
    ['Icon buttons', '36 x 36', '40 x 40 (44px hit area)', '<code>cm-button icon-only</code>, page-header arrows'],
    ['Text input, select, combobox, search, date pickers', '40px (<code>size="small"</code> 32px for filter rows)', '44px, 16px text', 'every field'],
    ['Checkbox', '16px', '18px', '<code>cm-checkbox</code>, centred in rows'],
    ['Badge', '24px tall, 12px medium text, sentence case', 'same', '<code>cm-badge</code>'],
    ['Card', '24px padding, 16px gaps, radius 8 (<code>variant="compact"</code> 16px)', '16px padding', '<code>cm-card</code>'],
    ['Modal', 'radius 12', 'same', '<code>cm-modal</code>'],
    ['Page title', '24/32 semibold', '20/28', '<code>cm-page-header</code>'],
    ['Section heading', '18/26 semibold (<code>--cm-type-heading-section-*</code>)', 'same', 'your headings between groups of cards'],
    ['Card heading', '16/24 semibold', 'same', '<code>cm-card</code>'],
    ['Body', '14/20', 'same', 'all UI text'],
    ['Form labels', '13/18 medium (<code>--cm-type-label-*</code>)', 'same', 'fields, option groups, radio and checkbox groups'],
    ['Supporting text', '12/16 (<code>--cm-type-body-xs-*</code>)', 'same', 'help text, hints, errors, descriptions, meta'],
    ['Page description', '13/18', 'same', '<code>cm-page-header description</code>'],
    ['Empty state', '48px icon tile, 16px heading, 13px text, 36px action, 8-12px apart', 'same', '<code>cm-empty-state</code> (<code>size="large"</code>: the 160px illustration)'],
    ['Side navigation', '220px, 36px rows, 12px side padding', 'rows 44px on touch', '<code>cm-side-navigation</code>'],
    ['Header bar', '56px', 'same', '<code>cm-header-bar</code>'],
    ['Page', '24px padding, content up to 1600px', '16px padding', '<code>cm-page</code>'],
    ['Between sections', '24px', 'same', '<code>cm-layout</code>, <code>cm-layout-section</code>'],
    ['Multi-select tags', '24px tags, 12px text, removable ("Remove …"); the box grows 28px per row from 40px; 3 tags then "+N more" while not focused', 'box 44px', '<code>cm-combobox multiple</code> (<code>max-tags</code>)'],
    ['Menu items and options', '36px rows (compact or small 32), 12px side padding, 14px text, 16px icons, 12px shortcut hints and section headings', '44px rows', '<code>cm-action-menu</code>, <code>cm-select</code>, <code>cm-combobox</code>'],
    ['Upload', 'Empty: one 72px row (icon, "Drag files here or Browse", 12px hint); hover, drag-over, uploading (bar, Cancel) and per-file error states; photo tile at most 120px tall', 'same', '<code>cm-file-upload</code>'],
    ['Tooltip', '12px on the dark surface, 8 x 12 padding, radius 6, up to 240px wide; shows after 400ms, hides at once, on keyboard focus too, Esc hides', 'not shown (touch)', '<code>cm-tooltip</code>'],
  ].map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`))}
  <p>Every interactive component shows default, hover, focus-visible (a 2px <code>border-strong</code> ring), pressed, selected, disabled and, where it runs an action, loading states; component pages list them in a "States" table (select, combobox, tag, file upload, action menu, tooltip so far). One deviation from the brief: badge text stays 12px (the scale has no 11px text, for readability).</p>
  ${h2('Controls')}
  <p>Buttons, fields, selects, pickers, segmented controls and menus share three heights. Buttons are 36px; fields (text field, select, combobox, search, date pickers) are 40px since 1.6; <code>size="small"</code> fields and <code>size="slim"</code> buttons are 32px for toolbars and filter rows; large buttons are 40px. On touch screens (<code>pointer: coarse</code>) fields are 44px and buttons are drawn 40px (icon buttons 40 by 40) with a hit area that reaches 44px.</p>
  <div class="ramp">${fam('size').filter((t) => t.name.startsWith('control-')).map((t) => `<div><span>${copyCell(t)}</span><span><span class="bar" style="display:block;height:${t.value};width:${t.value};border-radius:var(--cm-radius-sm)"></span></span><small>${t.value}</small></div>
    <div class="ramp-note"><span class="muted">${esc(t.usage)}</span></div>`).join('')}</div>
  <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-block:16px">
    <cm-search size="small" placeholder="Search" style="flex:1 1 160px;min-width:0"></cm-search>
    <cm-select size="small" aria-label="Status" placeholder="Status"><option>Open</option><option>Done</option></cm-select>
    <cm-button size="slim">Clear</cm-button>
    <cm-segmented-control size="small" aria-label="View" value="board"><option value="board">Board</option><option value="list">List</option></cm-segmented-control>
  </div>
  <p class="muted">A toolbar row: small search, small select, slim button and small segmented control, all 32px and 8px apart.</p>
  ${h2('Type')}
  <p>Eight sizes, each with its line height. UI text is 14/20. A ninth, 40/48 (<code>display-lg</code>), is for marketing/hero headings only, such as the docs home page; product UI and components never use it. Nothing is smaller than 12px; supporting text (help, hints, errors) is 12/16 and form labels 13/18 medium since 1.6. Use the semantic styles (<code>--cm-type-*</code>) for roles and the raw sizes only where no role fits.</p>
  ${table(['Size', 'Line height', 'Specimen'], sizes.map((t) => { const n = t.name.replace('font-size-', ''); const lh = tv('line-height-' + n); const hero = n === '40'; return `<tr><td>${copyCell(t)}${hero ? ' <cm-badge>Marketing/hero only</cm-badge>' : ''}</td><td>${lh ? copyCell(lh) + ' <small class="muted">' + lh.value + '</small>' : ''}</td><td><span data-specimen style="font-size:${t.value};line-height:${lh?.value ?? 1.4}">${hero ? 'Rs. 2,340' : 'Rs. 2,340 · 12 orders'}</span></td></tr>`; }))}
  ${table(['Style', 'Size / line / weight', 'Use'], styles.map((s) => `<tr><td><code>--cm-type-${s.name.replace('type-', '')}-*</code></td><td><code>${s.value.fontSize} / ${s.value.lineHeight} / ${s.value.fontWeight}</code></td><td>${md(s.usage ?? '')}</td></tr>`))}
  ${h2('Spacing')}
  <p>Padding, margins and gaps sit on the 4px grid. The <code>gap</code> attribute of <code>cm-stack</code>, <code>cm-grid</code> and <code>cm-layout</code> takes the same steps.</p>
  ${table(HEAD, rows(fam('spacing')))}
  ${h2('Radius')}
  ${table(HEAD, rows(fam('radius')))}
  ${h2('Icons')}
  <p>16px inside controls, 20px in navigation, 24px for feature icons (empty states, tiles).</p>
  ${table(HEAD, rows(fam('size').filter((t) => t.name.startsWith('icon-size'))))}
  ${h2('Borders and neutrals')}
  <p>Two border levels: <code>border-subtle</code> for structure, <code>border-input</code> for controls. Grey text uses <code>text-tertiary</code> (help, hints, secondary lines; 4.5:1 or more); <code>text-secondary</code> is for disabled text only. Every other text is <code>text-default</code>.</p>
  ${h2('Elevation')}
  <p>Only overlays have shadows: <code>shadow-sm</code> for tooltips and menus, <code>shadow-md</code> for dropdowns and popovers, <code>shadow-lg</code> for modals, side panels, sheets, toasts and save bars. Cards and panels are flat with a <code>border-subtle</code> line.</p>
  ${table(HEAD, rows(fam('shadow')))}
  ${h2('Motion')}
  <p>Hover and press take <code>duration-fast</code>; opening and closing take <code>duration-base</code>; both ease with <code>easing-standard</code>. With <code>prefers-reduced-motion: reduce</code> components don't animate.</p>
  ${table(HEAD, rows(fam('motion')))}
  ${h2('Numbers and case')}
  <p>Counts, prices, metrics and table cells use tabular figures; numeric table columns are right-aligned. Text is in sentence case everywhere: no upper-cased labels or badges.</p>
  ${h2('In your own CSS')}
  ${codeBlock([{ label: 'CSS', lang: 'html', code: `.toolbar { display: flex; gap: var(--cm-space-8); padding: var(--cm-space-12) var(--cm-space-16); }
.toolbar .count { font-size: var(--cm-font-size-12); font-variant-numeric: tabular-nums; }
.panel { border: var(--cm-border-1) solid var(--cm-border-subtle); border-radius: var(--cm-radius-md); }
.chip { height: var(--cm-control-height-sm); transition: background-color var(--cm-duration-fast) var(--cm-easing-standard); }
@media (prefers-reduced-motion: reduce) { .chip { transition: none; } }` }])}` };
};

pages['/foundations/spacing'] = () => ({ title: 'Spacing', html: `
  <h1>Spacing</h1>
  <p class="lead">A 4px grid: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. 8 between related items, 12 to 16 inside cards and forms, 20 to 24 around cards and pages. The pre-1.5 steps (10, 15, 22, 30) are deprecated and listed last.</p>
  <div class="ramp">${tokens.filter((t) => t.family === 'spacing').map((t) => `<div><button class="copyable" data-copy="var(${t.cssVar})" aria-label="Copy var(${t.cssVar})"><code>${t.name}</code></button><span><span class="bar" style="display:block;width:${t.value}"></span></span><small>${t.value}</small></div>
    <div class="ramp-note"><span class="muted">${esc(t.usage)}</span></div>`).join('')}</div>` });

pages['/foundations/shape'] = () => ({ title: 'Shape and depth', html: `
  <h1>Shape and depth</h1>
  <p class="lead">Flat surfaces with 1px borders. Radius 6px on controls, 8px on cards and popovers, 12px on panels and modals. Shadow only for things that float over the page.</p>
  ${h2('Corner radius')}
  <div class="cols">${tokens.filter((t) => t.family === 'radius').map((t) => `<div style="display:flex;gap:16px;align-items:center"><span class="radius-demo" style="border-radius:${t.value}"></span><span><button class="copyable" data-copy="var(${t.cssVar})" aria-label="Copy var(${t.cssVar})"><code>${t.name}</code></button><br><small class="muted">${t.value} · ${esc(t.usage)}</small></span></div>`).join('')}</div>
  ${h2('Borders')}
  <p>Always 1px (<code>--cm-border-1</code>), in two levels: <code>border-subtle</code> for structure (cards, panels, dividers, table rules, popover edges) and <code>border-input</code> around controls (fields, secondary buttons, selected segments; 3:1 or more on every surface). <code>border-strong</code> marks focus and selection, <code>border-critical</code> errors. <code>border-default</code> and <code>border-card</code> are deprecated (same value as <code>border-subtle</code>).</p>
  ${h2('Shadow')}
  <div class="cols">${tokens.filter((t) => t.family === 'shadow').map((t) => `<div style="padding:28px;border-radius:var(--cm-radius-md);background:var(--cm-bg-surface);box-shadow:${t.value};border:1px solid var(--cm-border-subtle)"><button class="copyable" data-copy="var(${t.cssVar})" aria-label="Copy var(${t.cssVar})"><code>${t.name}</code></button><p class="muted" style="font-size:13px;margin:6px 0 0">${esc(t.usage)}</p></div>`).join('')}</div>` });

const TOKEN_HEAD = ['Token', 'Light', 'Dark', 'Usage'];
pages['/foundations/tokens'] = (params) => {
  const fams = ['all', ...new Set(tokens.map((t) => t.family))];
  return { wide: true, title: 'Tokens', html: `
  <h1>Tokens</h1>
  <p class="lead">${FACTS.tokens} named design decisions. Use the variable, never the raw value, so your UI follows the theme and future updates. Select a name to copy it.</p>
  <div class="toolbar">
    <div class="search" style="position:relative"><cm-icon name="search" size="16"></cm-icon><input id="tq" type="search" placeholder="Filter tokens" aria-label="Filter tokens" value="${esc(params.get('q') ?? '')}"></div>
    <div class="seg" role="group" aria-label="Token family">${fams.map((f, i) => `<button data-fam="${f}" aria-pressed="${i === 0}">${f === 'all' ? 'All' : f[0].toUpperCase() + f.slice(1)}</button>`).join('')}</div>
    <span class="muted" id="tcount" role="status"></span>
  </div>
  ${table(TOKEN_HEAD, []).replace('<tbody role="rowgroup">', '<tbody role="rowgroup" id="tbody">')}
  ${h2('Formats')}
  <p>The hosted build ships the CSS. The JavaScript and JSON forms come with the <code>@commmerce/tokens</code> npm package.</p>
  ${codeBlock([
    { label: 'CSS', lang: 'html', code: `.panel { background: var(--cm-bg-surface); color: var(--cm-text-default); }` },
    { label: 'JavaScript', lang: 'jsx', code: `import { tokens } from '@commmerce/tokens'; // planned\nstyle.background = tokens.bgSurface; // 'var(--cm-bg-surface)'` },
    { label: 'JSON', lang: 'html', code: `// @commmerce/tokens/tokens.json (planned)\n{ "themes": ["light", "dark"], "tokens": [{ "name", "family", "cssVar", "value", "usage" }] }` },
  ])}`,
  after(main) {
    let fam = 'all';
    const q = $('#tq', main), body = $('#tbody', main);
    const val = (t, th) => {
      if (t.family === 'type' && t.group) return `<code>${t.value.fontSize} / ${t.value.fontWeight}</code>`;
      const v = tokenValue(t, th);
      const sw = t.family === 'color' ? `<span class="swatch" style="background:${v}"></span>` : '';
      return `${sw}<code>${esc(v)}</code>`;
    };
    const draw = () => {
      const s = q.value.trim().toLowerCase();
      const list = tokens.filter((t) => (fam === 'all' || t.family === fam) && (!s || `${t.name} ${t.usage ?? ''} ${JSON.stringify(t.value)}`.toLowerCase().includes(s)));
      body.innerHTML = list.map((t) => labelRow(`<tr><td>${t.cssVar ? `<button class="copyable" data-copy="var(${t.cssVar})" aria-label="Copy var(${t.cssVar})"><code>${t.cssVar}</code></button>` : `<code>${t.name}</code><br><small class="muted">--cm-${t.name}-size, -weight, -line-height</small>`}</td>
        <td>${val(t, 'light')}</td><td>${t.family === 'color' ? val(t, 'dark') : '<span class="muted">same</span>'}</td><td>${md(t.usage ?? '')}</td></tr>`, TOKEN_HEAD)).join('') || `<tr role="row"><td colspan="4" class="muted" role="cell">No tokens match.</td></tr>`;
      $('#tcount', main).textContent = `${list.length} of ${tokens.length}`;
    };
    q.addEventListener('input', draw);
    main.querySelectorAll('[data-fam]').forEach((b) => b.addEventListener('click', () => {
      fam = b.dataset.fam; main.querySelectorAll('[data-fam]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw();
    }));
    draw();
  } };
};

pages['/foundations/logo'] = () => ({ title: 'Logo', html: `
  <h1>Logo</h1>
  <p class="lead">The Commmerce logo is not part of Commmerce UI. Components that show a logo take your product's or app's own.</p>
  ${note('Apps built by other developers must not use the Commmerce logo, wordmark or M mark, or suggest that Commmerce made them.', 'warn')}
  <h2 id="logo-slot">Your logo in components</h2>
  <p>The <code>logo</code> slot of the <a href="#/components/header-bar">Header bar</a> (and so of the <a href="#/components/app-frame">App frame</a>) takes the logo of the product or app it belongs to: the merchant's or your own. Give the image alt text that names it, such as the store or app name. The examples on this site use a placeholder that says "Your logo": replace it with your own file.</p>
  <h2 id="commmerce-teams">Commmerce teams</h2>
  <p>Commmerce's own products get the logo files from Commmerce Brand Assets (internal), not from this site or the packages. Black on light grounds, white on black and dark grey, at least 16px high in product UI.</p>
  <p>Versions 1.1.0 to 1.7.x of the hosted build included a <code>brand/</code> folder. Those files stay where they are, because published versions never change, but newer versions don't include them.</p>` });

/* ---- Icons ---- */
pages['/icons'] = (params) => ({ wide: true, title: 'Icons', html: `
  <h1>Icons</h1>
  <p class="lead">${FACTS.icons} line icons on a 24px grid with a 1.6px round stroke. They take the colour of the text around them. Use them through <a href="#/components/icon"><code>cm-icon</code></a>.</p>
  <p>Brand logos (WhatsApp, Google and the like) are not part of the set: use the brand owner's official artwork, as their brand guidelines allow.</p>
  <div class="toolbar"><div class="search" style="position:relative"><cm-icon name="search" size="16"></cm-icon><input id="iq" type="search" placeholder="Search icons" aria-label="Search icons" value="${esc(params.get('q') ?? '')}"></div><span class="muted" id="icount" role="status"></span></div>
  <div class="icon-grid" id="igrid"></div>
  <div class="icon-detail" id="idetail" hidden></div>`,
  after(main) {
    const q = $('#iq', main), grid = $('#igrid', main), det = $('#idetail', main);
    let current = null;
    const select = (n) => {
      current = n;
      grid.querySelectorAll('.icon-cell').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.n === n)));
      det.hidden = false;
      det.innerHTML = `<span class="big"><cm-icon name="${n}" size="40"></cm-icon></span>
        <div class="grow"><strong>${n}</strong>
          <code>&lt;cm-icon name="${n}"&gt;&lt;/cm-icon&gt;</code></div>
        <cm-button size="medium" data-c="html"><cm-icon slot="icon" name="copy" size="16"></cm-icon>Copy HTML</cm-button>
        <cm-button size="medium" data-c="react"><cm-icon slot="icon" name="code" size="16"></cm-icon>Copy React</cm-button>
        <cm-button size="medium" data-c="svg"><cm-icon slot="icon" name="download" size="16"></cm-icon>Copy SVG</cm-button>`;
      det.querySelector('[data-c=html]').addEventListener('click', () => copy(`<cm-icon name="${n}"></cm-icon>`, 'HTML'));
      det.querySelector('[data-c=react]').addEventListener('click', () => copy(`<Icon name="${n}" />`, 'React'));
      const svgReady = fetch(asset(`vendor/icons/svg/${n}.svg`)).then((r) => r.text());
      det.querySelector('[data-c=svg]').addEventListener('click', async () => copy(await svgReady, 'SVG'));
    };
    const draw = () => {
      const s = q.value.trim().toLowerCase();
      const list = iconNames.filter((n) => n.includes(s));
      grid.innerHTML = list.map((n) => `<button class="icon-cell" data-n="${n}" aria-pressed="${n === current}"><cm-icon name="${n}" size="24"></cm-icon>${n}</button>`).join('') || '<p class="muted">No icons match.</p>';
      $('#icount', main).textContent = `${list.length} of ${iconNames.length}`;
    };
    grid.addEventListener('click', (e) => { const b = e.target.closest('.icon-cell'); if (b) select(b.dataset.n); });
    q.addEventListener('input', draw);
    draw();
    if (params.get('q') && iconNames.includes(params.get('q'))) select(params.get('q'));
  } });

/* ---- Releases and support ---- */
pages['/releases'] = () => ({ title: 'Release notes', html: `
  <h1>Release notes</h1>
  <p class="lead">What changed in each release, newest first. Each release stays available at <code>/v/&lt;version&gt;/</code>; <code>/vendor/</code> serves the latest.</p>
  ${note(STABLE ? 'Breaking changes come only in major versions. Read the notes before upgrading. <a href="#/releases/stability">Compatibility policy</a>' : 'Until 1.0, read every release before upgrading: APIs can change. <a href="#/releases/stability">Stability</a>')}
  <div class="releases">${releaseNotes}</div>` });

pages['/releases/stability'] = () => ({ title: 'Versioning and stability', html: `
  <h1>Versioning and stability</h1>
  ${STABLE ? `<p class="lead">Commmerce UI follows semantic versioning and the compatibility policy below.</p>` : `
  <p class="lead">Commmerce UI is in preview. Here is what that means for code you write against it today.</p>
  ${table(null, [
    `<tr><th scope="row">Breaking changes</th><td>Can happen in any release. Each one is listed in the <a href="#/releases">release notes</a>.</td></tr>`,
    `<tr><th scope="row">Least likely to change</th><td>Element names (<code>cm-*</code>), token names (<code>--cm-*</code>) and native events (<code>input</code>, <code>change</code>, <code>click</code>).</td></tr>`,
    `<tr><th scope="row">Most likely to change</th><td>Custom event details, slot names, and properties of recently added components.</td></tr>`,
    `<tr><th scope="row">Pinning a version</th><td>Load <code>/v/${PREVIEW.version}/</code> (or any earlier number). Those files never change. <a href="#/start/install">Choosing a version</a></td></tr>`,
    `<tr><th scope="row">Version numbers</th><td>Every release raises the number: the minor number for new components or changes, the last number for fixes. All packages share it.</td></tr>`,
  ], 'kv')}
`}
  ${h2(STABLE ? 'Compatibility policy' : 'From 1.0: compatibility policy')}
  <p>From 1.0.0, Commmerce UI follows semantic versioning: <code>major.minor.patch</code>. Every package shares the number: components, React wrappers, tokens, icons and App Bridge. The Flutter package uses the same number.</p>
  ${table(null, [
    `<tr><th scope="row">Public API</th><td>Element names, attributes, properties, events, slots and documented CSS parts; the <code>--cm-*</code> tokens; React props; the App Bridge message protocol; Flutter widget constructors. None of these break within a major version.</td></tr>`,
    `<tr><th scope="row">Not public</th><td>The markup and styles inside components, and anything undocumented. These can change in any release, so do not depend on them.</td></tr>`,
    `<tr><th scope="row">Breaking changes</th><td>Only in a new major version (2.0, 3.0 and so on). Anything to be removed is first marked deprecated in a minor release, with a console warning and a note in the docs, and keeps working for at least <strong>6 months</strong> before a major version can remove it.</td></tr>`,
    `<tr><th scope="row">Fixes</th><td>The latest major version gets every fix. The previous major version gets security and critical fixes for <strong>6 months</strong> after the next one is released.</td></tr>`,
    `<tr><th scope="row">Hosted files</th><td>Pinned files (<code>/v/&lt;version&gt;/</code>) stay online and never change. <code>/vendor/</code> always serves the latest, so pin a version in production.</td></tr>`,
    `<tr><th scope="row">App Bridge</th><td>When a new protocol version ships, the admin keeps supporting the previous one for at least <strong>6 months</strong>, so embedded apps keep working while they upgrade.</td></tr>`,
    `<tr><th scope="row">Visual updates</th><td>Small colour and spacing adjustments to match the design system are not breaking changes, as long as layouts keep working. They are listed in the release notes.</td></tr>`,
    `<tr><th scope="row">Browsers</th><td>The last two versions of Chrome, Edge, Firefox and Safari (macOS and iOS). See <a href="#/support">Support and compatibility</a>.</td></tr>`,
  ], 'kv')}` });

pages['/support'] = () => ({ title: 'Support and compatibility', html: `
  <h1>Support and compatibility</h1>
  <p class="lead">What Commmerce UI runs on, how it is maintained, and where to get help.</p>
  ${h2('Browsers')}
  ${table(['Browser', 'Status'], [
    ['Chrome and Edge (current)', `${badge('ready')} Full test suites on every change (Chromium): components, React wrappers with React 18 and 19, App Bridge.`],
    ['Firefox 98 or later', `${badge('ready')} The same suites on every change (Playwright's Firefox build, on Linux).`],
    ['Safari 16.4 or later (macOS, iOS)', `${badge('ready')} The same suites in WebKit 18.2, the engine behind Safari, on every change. The component suite also ran in real Safari 27 on macOS (181 of 182 pass; the other fails only because Safari's automation driver cannot type into a field inside a component, and the same keystrokes work when sent directly). The Commmerce team also uses it day to day in Safari.`],
    ['Older browsers, Internet Explorer', 'Not supported. They lack form-associated custom elements.'],
  ].map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`))}
  ${h2('Frameworks')}
  ${table(['Setup', 'Status', 'Notes'], FRAMEWORKS.map(([a, s, n]) => `<tr><td>${a}</td><td>${s === 'ready' ? badge('ready') : `<cm-badge>Not tested</cm-badge>`}</td><td>${linkifyText(n)}</td></tr>`))}
  ${h2('Get help, report a problem, request a component')}
  ${table(['Who', 'Where'], [
    ['Third-party app developers', `Email ${mail('Commmerce UI')} for questions, bug reports, component requests and setting up your app in the admin.`],
    ['Commmerce product teams', `Open an issue in the <code>commmerce-ui</code> GitHub repository, or email ${mail('Commmerce UI')}.`],
  ].map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`))}
  <p>When you report a problem, include the component, the browser and its version, what you expected, what happened, and the smallest markup that shows it.</p>
  ${h2('Ownership and maintenance')}
  <p>Commmerce UI is made and maintained by Commmerce. The design source is the Commmerce Design System file in Figma; the code lives in the private <code>commmerce-ui</code> repository. Components are being added in batches, with each batch tested, documented and announced in the <a href="#/releases">release notes</a>. Use of the packages is covered by the <a href="vendor/LICENSE.txt">Commmerce UI Licence</a>: they may be used in software built for the Commmerce platform, including apps for the Commmerce app marketplace. The licence and the <a href="vendor/THIRD_PARTY_NOTICES.txt">third-party notices</a> also ship inside every package.</p>` });

pages['/contributing'] = () => ({ title: 'Contributing', html: `
  <h1>Contributing</h1>
  <p class="lead">How a component goes from the Figma file to this site, and how to take part.</p>
  ${h2('Commmerce product teams')}
  <ol class="steps">
    <li><h3>Design</h3><p>The component exists in the Commmerce Design System Figma file, with guidance in the design system.</p></li>
    <li><h3>Build</h3><p>Add <code>packages/ui/src/components/&lt;name&gt;.ts</code>. Style only with <code>--cm-*</code> tokens, render native elements inside, and document every property with a JSDoc comment: the API tables on this site are generated from them.</p></li>
    <li><h3>Test</h3><p>Add browser tests for keyboard use, ARIA, events and form behaviour. Run <code>npm test</code>. New colour pairs go in the token contrast check.</p></li>
    <li><h3>Document</h3><p>Add examples, best practices, content and accessibility notes to <code>docs/content.js</code>, and a release note to <code>docs/releases.js</code>.</p></li>
    <li><h3>Release</h3><p>Raise the version in every package and add a release note (the docs build fails otherwise). Pushing to the main branch publishes the docs and <code>/v/&lt;version&gt;/</code> within five minutes.</p></li>
  </ol>
  ${h2('Third-party developers')}
  <p>The source is private, so outside code contributions are not possible yet. Feedback, bug reports and component requests are welcome at ${mail('Commmerce UI feedback')}.</p>
  ${h2('Rules for every component')}
  <ul><li>No raw colour values in components.</li><li>Native events keep working; custom events are prefixed <code>cm-</code>.</li><li>Every colour pair goes in the token contrast check.</li><li>Elements register with <code>define()</code>, so loading the library twice is harmless.</li></ul>` });

/* ---------------- Shell: the Commmerce frame, breadcrumbs, router ---------------- */
// Since 1.19 the site runs in cm-app-frame like every Commmerce product: cm-side-navigation (one item per section,
// its pages as sub-items) on wide screens; cm-bottom-navigation and cm-mobile-menu (More) below 1024px.
const frame = $('#docs-frame'), sideNav = $('#sidenav'), bottomNav = $('#bottomnav'), mobileMenu = $('#mobilemenu'), main = $('#main');
const SECTION_ICONS = { start: 'rocket', apps: 'apps', components: 'box', patterns: 'book', foundations: 'eyedropper', icons: 'image', releases: 'tag' };
const NAV_PREF = 'cm-docs-nav-collapsed';
try { sideNav.collapsed = localStorage.getItem(NAV_PREF) === '1'; } catch {}
// Menu labels: the side navigation is 220px wide, so a page whose title is longer than about 18 characters gets a
// short label here. The page itself, breadcrumbs and search keep the full title. scripts/check-responsive.mjs fails
// on a menu label over 20 characters.
const MENU_LABEL = {
  '/start/install': 'Install', '/start/frameworks': 'Other frameworks',
  '/apps': 'How apps run', '/apps/native': 'Native apps', '/apps/guidelines': 'Design guidelines', '/apps/review-checklist': 'Review checklist',
  '/patterns/admin-frame': 'Admin frame', '/patterns/admin-dashboard': 'Dashboard', '/patterns/order-list': 'Lists',
  '/patterns/product-editor': 'Product editor', '/patterns/states': 'States', '/patterns/pipeline-board': 'Board or list',
  '/patterns/pick-record': 'Pick a record', '/patterns/inventory-fulfilment': 'Inventory states', '/patterns/search-filter-sort': 'Search and filter',
  '/patterns/undo-instead-of-confirm': 'Undo', '/patterns/confirm-delete': 'Confirm delete', '/patterns/unsaved-changes': 'Unsaved changes',
  '/patterns/app-layout': 'App layout', '/foundations/localisation': 'Localisation', '/releases/stability': 'Versioning', '/support': 'Support',
};
const pageItem = (p, path) => ({ label: MENU_LABEL[p.path] ?? p.title, href: `#${p.path}`, value: p.path, current: p.path === path || undefined, badge: p.status ? STATUS[p.status].label : undefined });
function renderNav(section, path) {
  sideNav.items = [
    { label: 'Home', icon: 'home', href: '#/', value: '/', current: path === '/' || undefined },
    ...SECTIONS.map((s) => s.pages.length === 1
      ? { ...pageItem(s.pages[0], path), label: s.title, icon: SECTION_ICONS[s.id] }
      : { label: s.nav ?? s.title, icon: SECTION_ICONS[s.id], value: `section:${s.id}`, expanded: s === section || undefined, items: s.pages.map((p) => pageItem(p, path)) }),
  ];
  // Phones: the four places people go most, then More for everything (components open on a second screen, by group).
  const tab = (id, label) => { const s = SECTIONS.find((x) => x.id === id); return { label: label ?? s.title, icon: SECTION_ICONS[id], href: `#${s.pages[0].path}`, value: s.pages[0].path, current: s === section || undefined }; };
  const inMore = !!section && !['start', 'components', 'patterns'].includes(section.id);
  bottomNav.items = [
    { label: 'Home', icon: 'home', href: '#/', value: '/', current: path === '/' || undefined },
    tab('start'), tab('components'), tab('patterns'),
    { label: 'More', icon: 'menu', value: 'more', current: inMore || undefined },
  ];
  mobileMenu.items = SECTIONS.map((s) => {
    if (s.id !== 'components') return { label: s.title, items: s.pages.map((p) => ({ ...pageItem(p, path), icon: undefined })) };
    const groups = [];
    for (const p of s.pages.slice(1)) {
      const g = p.group ?? 'Other';
      let entry = groups.find((x) => x.label === g);
      if (!entry) groups.push(entry = { label: g, value: `group:${g}`, items: [] });
      entry.items.push(pageItem(p, path));
    }
    return { label: s.title, items: [pageItem(s.pages[0], path), ...groups] };
  });
}
// Every navigation routes inside the page (hosted pages only allow plain #name hashes; go() translates).
const onNavigate = (e) => {
  const { href, value } = e.detail || {};
  if (value === 'more' || !href) return;
  e.preventDefault();
  frame.menuOpen = false;
  go(href.slice(1));
};
[sideNav, bottomNav, mobileMenu].forEach((n) => n.addEventListener('cm-navigate', onNavigate));
sideNav.addEventListener('cm-collapse', (e) => { try { localStorage.setItem(NAV_PREF, e.detail.collapsed ? '1' : '0'); } catch {} });
function crumbs(section, meta) {
  if (!section) return '';
  const items = [['Home', '/'], [section.title, section.pages[0].path]];
  if (meta.group && meta.group !== 'Not available yet' && section.id !== 'foundations') items.push([meta.group, null]);
  if (meta.path !== section.pages[0].path) items.push([meta.title, null]);
  return `<nav class="crumb" aria-label="Breadcrumb"><ol>${items.map(([t, h], i) => `<li>${h && i < items.length - 1 ? `<a href="#${h}">${t}</a>` : `<span ${i === items.length - 1 ? 'aria-current="page"' : ''}>${t}</span>`}</li>`).join('')}</ol></nav>`;
}

// Hosted pages only allow plain #name hashes, so '/foundations/colors' lives at #foundations--colors
// and query parameters (?q=, ?s=, ?status=) are passed in memory, not in the URL.
const toHash = (path) => (path === '/' ? '' : path.slice(1).replace(/\//g, '--'));
const fromHash = (hash) => (hash ? '/' + hash.replace(/--/g, '/') : '/');
let pending = new URLSearchParams();
function go(href) {
  const [path, qs] = href.replace(/^#/, '').split('?');
  const params = new URLSearchParams(qs);
  if (path === currentPath && params.get('s')) { jumpTo(params.get('s')); return; }
  pending = params;
  const h = toHash(path || '/');
  if (location.hash.slice(1) === h) route(); else location.hash = h;
}
// Internal links are written as href="#/path?x=y"; translate them on click (also inside cm-button's shadow root).
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
  const a = e.composedPath().find((n) => n.getAttribute?.('href')?.startsWith('#'));
  if (!a) return;
  const href = a.getAttribute('href');
  if (href === '#main') { e.preventDefault(); main.focus(); return; }
  if (href === '#' || href.startsWith('#/')) { e.preventDefault(); go(href === '#' ? '/' : href.slice(1)); }
});

let first = true, currentPath = null;
function route() {
  let path = fromHash(location.hash.slice(1));
  if (REDIRECTS[path]) { history.replaceState(null, '', '#' + toHash(REDIRECTS[path])); path = REDIRECTS[path]; }
  const params = pending; pending = new URLSearchParams();
  currentPath = path;
  const page = (pages[path] ?? (() => ({ title: 'Page not found', html: `<h1>Page not found</h1><p class="lead">There is no page at this address. It may have moved when the site was reorganised.</p><p><a href="#/">Home</a> · <a href="#/start">Get started</a> · <a href="#/components">Components</a></p>` })))(params);
  const meta = allPages.find((p) => p.path === path);
  const section = meta?.section;
  renderNav(section, path);
  let pager = '';
  if (section) {
    const i = section.pages.findIndex((p) => p.path === path);
    const prev = section.pages[i - 1], next = section.pages[i + 1];
    pager = `<nav class="pager" aria-label="Previous and next page">${prev ? `<a href="#${prev.path}"><small>Previous</small>${prev.title}</a>` : ''}${next ? `<a class="next" href="#${next.path}"><small>Next</small>${next.title}</a>` : ''}</nav>`;
  }
  main.innerHTML = `<div class="page ${page.wide ? 'page--wide' : ''}"><div class="page-body">${meta ? crumbs(section, meta) : ''}${page.html}${page.side === false ? '' : pager}</div></div>`;
  page.after?.(main);
  wireCode(main);
  buildToc(main.firstElementChild, page);
  markWideTables();
  document.title = path === '/' ? 'Commmerce UI' : `${page.title} · Commmerce UI`;
  frame.menuOpen = false;
  const s = params.get('s');
  if (s) jumpTo(s, false);
  else window.scrollTo(0, 0);
  onScroll();
  if (!first) main.focus({ preventScroll: true });
  first = false;
}
window.addEventListener('hashchange', route);

/* ---------------- On this page, back to top, wide tables ---------------- */
// Section links are written #/path?s=<h2 id>: the router scrolls to the heading without changing the hash, so
// they work on hosts that only allow plain #name hashes.
function jumpTo(id, focus = true) {
  const t = document.getElementById(id);
  if (!t) return;
  t.scrollIntoView();
  if (focus && /^H[1-6]$/.test(t.tagName)) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
}
const headingText = (h) => { const c = h.cloneNode(true); c.querySelectorAll('.anchor').forEach((a) => a.remove()); return c.textContent.trim(); };
let tocLinks = [], tocHeads = [];
// Long pages (three or more sections) get an "On this page" list: a sticky column on wide screens, a collapsed
// list under the lead on narrow ones (docs.css shows one or the other).
function buildToc(pageEl, page) {
  tocLinks = []; tocHeads = [];
  const body = pageEl.querySelector('.page-body');
  const heads = [...body.querySelectorAll(':scope > h2[id]')];
  pageEl.classList.toggle('is-long', heads.length >= 3 || document.documentElement.scrollHeight > innerHeight * 3);
  if (page.toc === false || heads.length < 3) return;
  const list = `<ul>${heads.map((h) => `<li><a href="#${currentPath}?s=${h.id}" data-toc="${h.id}">${esc(headingText(h))}</a></li>`).join('')}</ul>`;
  pageEl.classList.add('has-toc');
  pageEl.insertAdjacentHTML('beforeend', `<nav class="toc toc--side" aria-label="On this page"><p class="toc-title">On this page</p>${list}</nav>`);
  const top = `<details class="toc toc--top"><summary>On this page <span class="muted">(${heads.length} sections)</span></summary><nav aria-label="On this page">${list}</nav></details>`;
  const after = body.querySelector(':scope > .lead') ?? body.querySelector(':scope > .status-line') ?? body.querySelector(':scope > h1');
  if (after) after.insertAdjacentHTML('afterend', top); else body.insertAdjacentHTML('afterbegin', top);
  pageEl.querySelectorAll('.toc--top a').forEach((a) => a.addEventListener('click', () => { a.closest('details').open = false; }));
  tocLinks = [...pageEl.querySelectorAll('.toc--side a')];
  tocHeads = heads;
}
const toTop = Object.assign(document.createElement('button'), { className: 'to-top', type: 'button', hidden: true, innerHTML: '<cm-icon name="chevron-up" size="18"></cm-icon><span>Top</span>' });
toTop.setAttribute('aria-label', 'Back to top');
toTop.addEventListener('click', () => { window.scrollTo(0, 0); main.focus({ preventScroll: true }); });
document.body.append(toTop);
let scrollQueued = false;
function onScroll() {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    scrollQueued = false;
    toTop.hidden = !(main.querySelector('.page.is-long') && scrollY > innerHeight);
    if (!tocHeads.length) return;
    let current = tocHeads[0].id;
    for (const h of tocHeads) if (h.getBoundingClientRect().top < 120) current = h.id;
    tocLinks.forEach((a) => (a.dataset.toc === current ? a.setAttribute('aria-current', 'location') : a.removeAttribute('aria-current')));
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
// A table wider than its box scrolls inside it: mark it so it shows the scroll hint and can be scrolled with the keyboard.
function markWideTables() {
  // Code blocks that scroll sideways say so under the code, like wide tables.
  main.querySelectorAll('.code').forEach((c) => {
    const pre = [...c.querySelectorAll('pre')].find((p) => p.offsetParent);
    c.classList.toggle('overflows', !!pre && pre.scrollWidth > pre.clientWidth + 1);
  });
  // Short inline code keeps its shape on narrow screens (space-24 never becomes "space-" and "24").
  main.querySelectorAll(':not(pre) > code:not(.nobr)').forEach((c) => { if (c.textContent.length <= 20 && !c.closest('.ex-stage')) c.classList.add('nobr'); });
  main.querySelectorAll('.tbl-wrap').forEach((w) => {
    const wide = w.scrollWidth > w.clientWidth + 1;
    w.classList.toggle('overflows', wide);
    if (wide) { w.tabIndex = 0; w.setAttribute('role', 'region'); w.setAttribute('aria-label', 'Table, scrolls sideways'); }
    else { w.removeAttribute('tabindex'); w.removeAttribute('role'); w.removeAttribute('aria-label'); }
  });
}
let resizeQueued = null;
window.addEventListener('resize', () => { clearTimeout(resizeQueued); resizeQueued = setTimeout(() => { markWideTables(); onScroll(); }, 150); });

// Copy buttons anywhere in the page
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-copy]');
  if (b) copy(b.dataset.copy, b.dataset.copy);
});
// Code tabs and example pickers swap the code shown: check again which blocks scroll sideways.
let markQueued = 0;
const remark = () => { cancelAnimationFrame(markQueued); markQueued = requestAnimationFrame(markWideTables); };
document.addEventListener('click', (e) => { if (e.target.closest?.('#main .code, #main .ex-bar')) remark(); });
document.addEventListener('change', (e) => { if (e.target.closest?.('#main')) remark(); });

/* ---------------- Theme ---------------- */
const themeBtn = $('#theme');
const mq = matchMedia('(prefers-color-scheme: dark)');
const effectiveTheme = () => {
  const t = document.documentElement.dataset.cmTheme;
  return t === 'dark' || (t === 'auto' && mq.matches) ? 'dark' : 'light';
};
const setThemeUI = () => {
  const dark = effectiveTheme() === 'dark';
  document.documentElement.classList.toggle('is-dark', dark);
  themeBtn.icon = dark ? 'sun' : 'moon';
  themeBtn.label = dark ? 'Switch to light theme' : 'Switch to dark theme';
};
themeBtn.addEventListener('click', () => {
  const t = effectiveTheme() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.cmTheme = t;
  try { localStorage.setItem('cm-docs-theme', t); } catch {}
  setThemeUI();
  // An open example preview follows the site theme; its own Light/Dark switch can still override it.
  const stage = $('#stage');
  if (stage) {
    stage.dataset.cmTheme = t;
    document.querySelectorAll('[data-theme]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.theme === t)));
  }
});
setThemeUI();
mq.addEventListener('change', setThemeUI);
// Follow the host's light/dark setting when the viewer hasn't picked one on this site.
new MutationObserver(() => {
  let saved = null; try { saved = localStorage.getItem('cm-docs-theme'); } catch {}
  const host = document.documentElement.getAttribute('data-theme');
  if (!saved && host && host !== document.documentElement.dataset.cmTheme) { document.documentElement.dataset.cmTheme = host; setThemeUI(); }
}).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

/* ---------------- Search (cm-global-search in the header bar) ---------------- */
const index = [
  ...allPages.map((p) => ({ label: p.title, kind: p.status ? `${p.section.title} · ${STATUS[p.status].label}` : p.section.title, href: p.path, group: 'Pages' })),
  ...components.flatMap((c) => [c.tag, ...(c.parts ?? []).map((p) => p.tag)].map((t) => ({ label: t, kind: c.name, href: `/components/${c.slug}`, group: 'Elements' }))),
  ...tokens.filter((t) => t.cssVar).map((t) => ({ label: t.name, kind: 'Token', href: `/foundations/tokens?q=${t.name}`, group: 'Tokens' })),
  ...iconNames.map((n) => ({ label: n, kind: 'Icon', href: `/icons?q=${n}`, group: 'Icons' })),
];
const GROUP_ICONS = { Pages: 'book', Elements: 'code', Tokens: 'eyedropper', Icons: 'image' };
const q = $('#q');
q.addEventListener('cm-search', (e) => {
  const s = e.detail.query.trim().toLowerCase();
  if (!s) { q.results = []; return; }
  const groups = [];
  for (const g of ['Pages', 'Elements', 'Tokens', 'Icons']) {
    const all = index.filter((x) => x.group === g && x.label.toLowerCase().includes(s))
      .sort((a, b) => (a.label.toLowerCase().startsWith(s) ? 0 : 1) - (b.label.toLowerCase().startsWith(s) ? 0 : 1));
    if (all.length) groups.push({ label: g, total: all.length, items: all.slice(0, 5).map((x) => ({ title: x.label, description: x.kind, href: `#${x.href}`, icon: GROUP_ICONS[g] })) });
  }
  q.results = groups;
});
q.addEventListener('cm-select', (e) => {
  if (!e.detail.href) return;
  e.preventDefault();
  q.value = ''; q.results = [];
  go(e.detail.href.slice(1));
});

route();
