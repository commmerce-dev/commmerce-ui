import { html, css, nothing } from 'lit';
import { base, define } from '../base.js';
import { CmLocalizedElement, defineStrings } from '../localize.js';
import { type NavItem, readNavItems, watchNavItems, fireNavigate } from './nav-item.js';

const strings = defineStrings('linkTabs', {
  /** Accessible name of the navigation landmark. */
  label: 'Sections',
});
declare module '../localize.js' { interface CmStrings { linkTabs: typeof strings } }

/**
 * A row of links between sibling pages, such as the sections of Settings or the parts of a product
 * (Details, Variants, Inventory). It looks like Status tabs but each tab is a link to its own page:
 * the current page is black and underlined. Too many tabs for the width scroll sideways: the row fades at the edge that
 * has more tabs past it (1.20.1), and the current tab is scrolled into view.
 *
 * To filter one list without leaving the page, use Status tabs instead.
 * @element cm-link-tabs
 * @slot - `cm-nav-item` elements with `href`; mark the page you are on `current`.
 * @fires cm-navigate - When a tab is chosen. `detail: { item, value, href }`. Cancelable: call `preventDefault()` to route in your app.
 */
export class CmLinkTabs extends CmLocalizedElement {
  static properties = {
    items: { type: Array },
    label: { string: 'label' },
    _slotted: { state: true },
    _more: { state: true },
  };

  /** Tabs as data (`{ label, href, current }`). Used instead of `cm-nav-item` children when set. */
  items: NavItem[] = [];
  /** Accessible name of the navigation, e.g. "Settings sections". Default: the built-in string `label` ("Sections"). */
  label!: string;

  _slotted: NavItem[] = [];
  _more = '';
  #observer?: MutationObserver;
  #resize = new ResizeObserver(() => this.#measure());
  #shown = '';

  static styles = [
    base,
    css`
      :host { display: block; }
      ul {
        display: flex; gap: var(--cm-space-24); margin: 0; padding: 2px 2px 0; list-style: none; overflow-x: auto;
        border-bottom: var(--cm-border-1) solid var(--cm-border-subtle); white-space: nowrap;
      }
      li { flex: none; display: flex; }
      a {
        position: relative; display: inline-flex; align-items: center; gap: var(--cm-space-8); padding: var(--cm-space-4) 0 var(--cm-space-12);
        font-size: var(--cm-font-size-14); line-height: var(--cm-line-height-14); font-weight: 500; color: var(--cm-text-tertiary); text-decoration: none;
      }
      a::after { content: ''; position: absolute; inset-inline: 0; bottom: -1px; height: 2px; border-radius: var(--cm-radius-full); background: transparent; }
      a:hover { color: var(--cm-text-default); }
      a[aria-current='page'] { color: var(--cm-text-default); }
      a[aria-current='page']::after { background: var(--cm-tab-indicator); }
      a:focus-visible { outline: 2px solid var(--cm-border-strong); outline-offset: 2px; border-radius: var(--cm-radius-xs); }
      .badge { font-size: var(--cm-font-size-12); color: var(--cm-text-tertiary); font-variant-numeric: tabular-nums; }
      /* Scroll affordance, as in Status tabs: the edge with more tabs past it fades out over 32px, so a cut-off row reads
         as one that scrolls. The mask is a gradient of opacity, so it works on any background and theme. */
      ul.more-end { mask-image: linear-gradient(to right, #000 calc(100% - var(--cm-space-32)), transparent); }
      ul.more-start { mask-image: linear-gradient(to left, #000 calc(100% - var(--cm-space-32)), transparent); }
      ul.more-both { mask-image: linear-gradient(to right, transparent, #000 var(--cm-space-32), #000 calc(100% - var(--cm-space-32)), transparent); }
      :host(:dir(rtl)) ul.more-end { mask-image: linear-gradient(to left, #000 calc(100% - var(--cm-space-32)), transparent); }
      :host(:dir(rtl)) ul.more-start { mask-image: linear-gradient(to right, #000 calc(100% - var(--cm-space-32)), transparent); }
      @media (max-width: 640px) { ul { gap: var(--cm-space-16); } }

    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this.#read();
    this.#observer = watchNavItems(this, () => this.#read());
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#observer?.disconnect();
    this.#resize.disconnect();
  }

  firstUpdated() {
    const row = this.renderRoot.querySelector('ul')!;
    this.#resize.observe(row);
    row.addEventListener('scroll', () => this.#measure(), { passive: true });
    document.fonts?.ready.then(() => this.#measure());
  }

  updated() {
    // Measure after every render and watch each tab: badges or the web font can widen tabs without resizing the row.
    for (const li of this.renderRoot.querySelectorAll('li')) this.#resize.observe(li);
    this.#reveal();
    this.#measure();
  }

  /** Scrolls the row (never the page) so the current tab is fully visible, once per current tab. */
  #reveal() {
    const row = this.renderRoot.querySelector<HTMLElement>('ul');
    const a = this.renderRoot.querySelector<HTMLElement>('a[aria-current="page"]');
    const key = a?.getAttribute('href') ?? '';
    if (!row || !a || key === this.#shown || row.scrollWidth <= row.clientWidth) return;
    this.#shown = key;
    const r = row.getBoundingClientRect();
    const t = a.getBoundingClientRect();
    const pad = 32;
    if (t.right > r.right - pad) row.scrollLeft += t.right - r.right + pad;
    else if (t.left < r.left + pad) row.scrollLeft -= r.left + pad - t.left;
  }

  /** Works out which edges of the row have tabs past them (for the fade). */
  #measure() {
    const row = this.renderRoot.querySelector<HTMLElement>('ul');
    if (!row) return;
    const max = row.scrollWidth - row.clientWidth;
    const at = Math.abs(row.scrollLeft); // negative in right-to-left rows
    const start = max > 1 && at > 1;
    const end = max > 1 && at < max - 1;
    const more = start && end ? 'both' : start ? 'start' : end ? 'end' : '';
    if (more !== this._more) this._more = more;
  }

  /** The tabs in use. */
  get tabs(): NavItem[] { return this.items.length ? this.items : this._slotted; }

  #read() { this._slotted = readNavItems(this); }

  render() {
    return html`<nav part="nav" aria-label=${this.label || this.t('label')}>
      <ul part="tabs" class=${this._more ? `more-${this._more}` : ''}>${this.tabs.map((t) => html`<li><a part="tab" href=${t.href || '#'} aria-current=${t.current ? 'page' : nothing}
          @click=${(e: Event) => { if (!fireNavigate(this, t)) e.preventDefault(); }}>${t.label}${t.badge ? html`<span class="badge">(${t.badge})</span>` : nothing}</a></li>`)}</ul>
      <slot hidden></slot>
    </nav>`;
  }
}
define('cm-link-tabs', CmLinkTabs);

declare global { interface HTMLElementTagNameMap { 'cm-link-tabs': CmLinkTabs } }
