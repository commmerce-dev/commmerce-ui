// Component data for agents: built from the docs' written content (docs/content.js `components`) and the generated API
// (packages/ui custom-elements.json). The same file is in the public repo (packages/review/lib/components-index.mjs):
// keep both copies identical.

export const DOCS_BASE = 'https://commmerce.com/commmerceui/';
// The docs router turns /components/button into the hash #components--button (docs/app.js toHash).
export const docsUrl = (slug) => `${DOCS_BASE}#components--${slug}`;

const text = (v) => (v == null ? undefined : String(v).replace(/\[\[([^|\]]+)\|[^\]]+\]\]/g, '$1'));
const list = (v) => (Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? text(x) : x)) : undefined);

function api(cem, tag) {
  const decl = cem.modules.flatMap((m) => m.declarations ?? []).find((d) => d.tagName === tag);
  if (!decl) return null;
  const pub = (m) => !m.privacy || m.privacy === 'public';
  return {
    properties: (decl.attributes ?? []).map((a) => ({ attribute: a.name, property: a.fieldName, type: a.type?.text, default: a.default, description: a.description })),
    // Properties without an attribute (set from script), e.g. `items` or `options`.
    script_properties: (decl.members ?? []).filter((m) => m.kind === 'field' && !m.static && pub(m) && !(decl.attributes ?? []).some((a) => a.fieldName === m.name) && m.description)
      .map((m) => ({ property: m.name, type: m.type?.text, description: m.description })),
    methods: (decl.members ?? []).filter((m) => m.kind === 'method' && !m.static && pub(m) && m.description).map((m) => ({ name: m.name, description: m.description })),
    slots: (decl.slots ?? []).map((s) => ({ name: s.name || '(default)', description: s.description })),
    events: (decl.events ?? []).filter((e) => e.name).map((e) => ({ name: e.name, description: e.description })),
  };
}

export function buildIndex(components, cem) {
  return components.map((c) => ({
    tag: c.tag, slug: c.slug, name: c.name, react: c.react, group: c.group,
    summary: text(c.summary), lead: text(c.lead),
    docs_url: docsUrl(c.slug),
    ...api(cem, c.tag),
    parts: (c.parts ?? []).map((p) => ({ tag: p.tag, react: p.react, ...api(cem, p.tag) })),
    examples: (c.examples ?? []).filter((e) => e.html).map((e) => ({ title: e.title, description: text(e.description), html: e.html })),
    do: list(c.do), dont: list(c.dont), content: list(c.content), accessibility: list(c.a11y), responsive: list(c.responsive),
    related: c.related,
  }));
}

// Words developers use for things the docs name differently.
const SYNONYMS = { dropdown: ['select', 'menu'], popup: ['modal'], dialog: ['modal'], popover: ['menu'], grid: ['table'], datagrid: ['table'],
  list: ['resource'], toast: ['toast'], snackbar: ['toast'], notification: ['toast', 'banner'], alert: ['banner'], switch: ['toggle'],
  textarea: ['text', 'field'], input: ['text', 'field'], autocomplete: ['combobox'], typeahead: ['combobox'], drawer: ['side', 'panel'],
  sidebar: ['side', 'navigation'], kanban: ['board'], loader: ['spinner', 'skeleton'], upload: ['file'], datepicker: ['date', 'picker'] };
const words = (s) => String(s ?? '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1);

// Ranks components for a free-text need ("a table of orders with bulk actions").
export function search(index, query, limit = 8) {
  const q = words(query).filter((w) => !['cm', 'the', 'an', 'and', 'with', 'for', 'of', 'to', 'in', 'on', 'my', 'need', 'want', 'component'].includes(w));
  if (!q.length) return index.slice(0, limit).map(brief);
  const extra = q.flatMap((w) => SYNONYMS[w] ?? []);
  const scored = index.map((c) => {
    const name = words(`${c.name} ${c.tag} ${c.slug} ${c.react}`);
    const head = words(`${c.summary} ${c.group}`);
    const body = words(`${c.lead} ${(c.examples ?? []).map((e) => e.title).join(' ')} ${(c.do ?? []).join(' ')}`);
    let score = 0;
    for (const w of q) {
      const stem = w.replace(/(es|s)$/, '');
      const hit = (arr) => arr.some((x) => x === w || x.replace(/(es|s)$/, '') === stem || (stem.length > 3 && x.startsWith(stem)));
      if (hit(name)) score += 10;
      if (hit(head)) score += 4;
      if (hit(body)) score += 1;
    }
    for (const w of extra) if (name.includes(w)) score += 6;
    return { c, score };
  }).filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => brief(s.c));
}

export const brief = (c) => ({ tag: c.tag, name: c.name, group: c.group, summary: c.summary, docs_url: c.docs_url });

export function find(index, name) {
  const n = String(name ?? '').trim().toLowerCase().replace(/^<|>$/g, '');
  return index.find((c) => c.tag === n || c.slug === n || c.name.toLowerCase() === n || c.react?.toLowerCase() === n || c.tag === `cm-${n}`
    || c.parts.some((p) => p.tag === n));
}
