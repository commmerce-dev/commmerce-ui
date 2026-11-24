import { html, css, nothing } from 'lit';
import { base, define } from '../base.js';
import { CmLocalizedElement, defineStrings } from '../localize.js';
import { type NavItem, readNavItems, watchNavItems, fireNavigate } from './nav-item.js';
import './icon.js';

const strings = defineStrings('bottomNavigation', {
  /** Accessible name of the navigation landmark. */
  label: 'Main',
});
declare module '../localize.js' { interface CmStrings { bottomNavigation: typeof strings } }

/**
 * The admin's tab bar on phones and small tablets: up to five destinations with an icon over a short
 * label, in a white bar with rounded top corners. The last item ("More") usually opens the Mobile menu.
 * For Commmerce products only, not for apps.
 *
 * Items come from `cm-nav-item` children or the `items` property. Mark the main action `primary`
 * (Quick add) to draw its icon as a black square.
 *
 * Set `menu-item` to the value of the item that opens the Mobile menu, and `menu-open` while it is open: that item
 * then shows as the current tab and reports `aria-expanded`. Inside `cm-app-frame` with its own `menu-item`, the
 * frame sets both for you.
 * @element cm-bottom-navigation
 * @slot - `cm-nav-item` elements (no nesting).
 * @fires cm-navigate - When an item is chosen. `detail: { item, value, href }`. Cancelable: call `preventDefault()` to route in your app. Items without `href` only fire this event (e.g. "More" opens the Mobile menu).
 */
export class CmBottomNavigation extends CmLocalizedElement {
  static properties = {
    items: { type: Array },
    label: { string: 'label' },
    fixed: { type: Boolean, reflect: true },
    menuItem: { attribute: 'menu-item' },
    menuOpen: { type: Boolean, attribute: 'menu-open', reflect: true },
    _slotted: { state: true },
  };

  /** Items as data. Used instead of `cm-nav-item` children when set. */
  items: NavItem[] = [];
  /** Accessible name of the navigation landmark. Default: the built-in string `label` ("Main"). */
  label!: string;
  /** Pins the bar to the bottom of the viewport, above the device's home indicator. */
  fixed = false;
  /** Value of the item that opens the Mobile menu (usually `more`). It gets `aria-expanded`. */
  menuItem = '';
  /** The Mobile menu is open: the `menu-item` shows as the current tab instead of the page's own tab. */
  menuOpen = false;

  _slotted: NavItem[] = [];
  #observer?: MutationObserver;

  static styles = [
    base,
    css`
      :host { display: block; }
      :host([fixed]) { position: fixed; inset-inline: 0; bottom: 0; z-index: 20; }
      nav {
        background: var(--cm-bg-surface); border-radius: var(--cm-radius-lg) var(--cm-radius-lg) 0 0;
        border-block-start: var(--cm-border-1) solid var(--cm-border-subtle);
        padding: var(--cm-space-8) var(--cm-space-4) calc(var(--cm-space-8) + env(safe-area-inset-bottom, 0px));
      }
      ul { display: flex; list-style: none; margin: 0; padding: 0; }
      li { flex: 1; min-width: 0; display: flex; }
      .item {
        flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: var(--cm-space-4);
        min-height: var(--cm-space-48); padding: var(--cm-space-4) var(--cm-space-4) 0;
        font: inherit; font-size: var(--cm-font-size-12); line-height: var(--cm-line-height-12); font-weight: 500;
        color: var(--cm-text-tertiary); text-decoration: none; background: none; border: 0; border-radius: var(--cm-radius-sm); cursor: pointer;
      }
      .item:hover, .item.on { color: var(--cm-text-default); }
      /* The current tab (1.19, from the CRM): bold label and a tinted pill behind the icon, so it shows in every look. */
      .item.on { font-weight: 600; }
      .item.on:not(.primary) .icon { background: var(--cm-bg-selected); color: var(--cm-icon-selected); }
      .item:focus-visible { outline: 2px solid var(--cm-border-strong); outline-offset: 0; }
      .icon { display: grid; place-items: center; width: calc(var(--cm-space-48) + var(--cm-space-8)); height: calc(var(--cm-space-24) + var(--cm-space-4)); border-radius: var(--cm-radius-full); }
      .primary .icon { width: var(--cm-icon-size-lg); height: var(--cm-icon-size-lg); }
      .primary .icon { color: var(--cm-action-primary-text); background: var(--cm-action-primary); border-radius: var(--cm-radius-xs); }
      .label { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
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
  }

  /** The items in use. */
  get navItems(): NavItem[] { return this.items.length ? this.items : this._slotted; }

  #read() { this._slotted = readNavItems(this); }

  #item(it: NavItem) {
    const isMenu = !!this.menuItem && it.value === this.menuItem;
    // While the menu is open it covers the page, so its tab is the one shown as current (aria-current stays on the page).
    const on = this.menuOpen && this.menuItem ? isMenu : !!it.current;
    const cls = `item ${it.primary ? 'primary' : ''} ${on ? 'on' : ''}`;
    const inner = html`<span class="icon">${it.icon ? html`<cm-icon name=${it.icon} size=${it.primary ? 16 : 20}></cm-icon>` : nothing}</span><span class="label">${it.label}</span>`;
    const go = (e: Event) => { if (!fireNavigate(this, it)) e.preventDefault(); };
    return it.href
      ? html`<a class=${cls} part="item" href=${it.href} aria-current=${it.current ? 'page' : nothing} @click=${go}>${inner}</a>`
      : html`<button type="button" class=${cls} part="item" aria-current=${it.current ? 'page' : nothing}
          aria-expanded=${isMenu ? String(this.menuOpen) : nothing} @click=${go}>${inner}</button>`;
  }

  render() {
    return html`<nav part="nav" aria-label=${this.label || this.t('label')}>
      <ul>${this.navItems.slice(0, 5).map((it) => html`<li>${this.#item(it)}</li>`)}</ul>
      <slot hidden></slot>
    </nav>`;
  }
}
define('cm-bottom-navigation', CmBottomNavigation);

declare global { interface HTMLElementTagNameMap { 'cm-bottom-navigation': CmBottomNavigation } }
