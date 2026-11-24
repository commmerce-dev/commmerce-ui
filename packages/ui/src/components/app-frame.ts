import { LitElement, html, css } from 'lit';
import { base, define } from '../base.js';

/** Frames at least this wide show the side navigation; narrower ones show the bottom navigation. */
const WIDE = 1024;

/** The element that has focus, looking inside shadow roots. */
const deepActive = (): HTMLElement | null => {
  let a = document.activeElement as HTMLElement | null;
  while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement as HTMLElement;
  return a;
};

/**
 * The admin's frame: puts the Header bar, the Side navigation, the page, the Bottom navigation and the Mobile
 * menu in their places, so every Commmerce product gets the same grid. For Commmerce products only, not for apps:
 * apps run inside the admin, which already has this frame.
 *
 * When the frame is 1024px wide or more, the side navigation sits on the start side under the header; narrower,
 * it is hidden and the bottom navigation is fixed to the bottom of the window. The frame follows its own width
 * (normally the window's). The header sticks to the top (below the device's notch or status bar), the side
 * navigation sticks under it and scrolls on its own when it is taller than the window, and the page scrolls with
 * the window. The page gets bottom padding as tall as the bottom navigation, so nothing hides behind it.
 *
 * The mobile menu is a full-screen layer above the page and below the bottom navigation, shown while
 * `menu-open` is set. Set `menu-item` to the value of the bottom navigation item that opens it (usually `more`)
 * and the frame opens and closes it for you; otherwise listen for `cm-navigate` and set `menu-open` yourself.
 *
 * The frame adds one landmark, `main`, around the page. The header bar (`banner`) and the navigations (`nav`)
 * bring their own, so don't wrap them, and don't put another `main` in the page.
 * @element cm-app-frame
 * @slot header - A `cm-header-bar`.
 * @slot navigation - A `cm-side-navigation`. Shown when the frame is 1024px wide or more. Collapse it with its `collapsed` attribute; the frame follows its width.
 * @slot - The page, usually a `cm-page`. Wrapped in the frame's `main` landmark.
 * @slot bottom-navigation - A `cm-bottom-navigation`. Shown, fixed to the bottom of the window, when the frame is narrower than 1024px. No need to set its `fixed` attribute.
 * @slot mobile-menu - A `cm-mobile-menu`. Shown over the page while `menu-open` is set and the frame is narrower than 1024px.
 * @fires cm-menu-toggle - When the frame opens or closes the mobile menu itself: from the `menu-item` in the bottom navigation, Escape, or a choice in the menu. `detail: { open }`. Not fired when you set `menu-open` yourself.
 * With `panel` the frame takes the merchant dashboard's look: the page sits in a white rounded panel (`bg-surface`,
 * `radius-lg`, a 1px `border-subtle`) with a `space-20` gutter beside and below the side navigation card, on the grey
 * `bg-page` under the white header. A `cm-page` inside drops its own grey background. Narrower than 1024px (bottom
 * navigation) the panel runs edge to edge, white, without a gutter or corners, so phones keep every pixel of width.
 * @cssprop --cm-app-frame-gutter - Gap around the panel (`panel`) and around the side navigation. Default `var(--cm-space-20)`.
 * @cssprop --cm-app-frame-bottom-offset - Extra space at the end of the page, for a bar of your own fixed to the bottom of the window (e.g. a field app's own bottom navigation). Added to the frame's padding for its bottom navigation. Default `0px`.
 * @cssprop --cm-app-frame-height - Height the side navigation fits in (it scrolls when taller). Default `100dvh`, the window. Set it when the frame is inside a box of its own.
 */
export class CmAppFrame extends LitElement {
  static properties = {
    menuOpen: { type: Boolean, attribute: 'menu-open', reflect: true },
    menuItem: { attribute: 'menu-item' },
    panel: { type: Boolean, reflect: true },
    _wide: { state: true },
  };

  /** Shows the mobile menu (on narrow frames). Set it yourself, or let `menu-item` do it. */
  menuOpen = false;
  /**
   * Value of the bottom navigation item that opens and closes the mobile menu, e.g. `more` for
   * `<cm-nav-item label="More" value="more">`. When set, choosing it toggles `menu-open`, Escape closes the
   * menu, and choosing a row in the menu closes it. Empty: you wire the menu yourself.
   */
  menuItem = '';
  /**
   * Shows the page in a white rounded panel beside the side navigation, with a gutter around it, on the grey page:
   * the merchant dashboard frame. A `cm-page` inside gets a transparent background. Phones: the panel is edge to edge.
   */
  panel = false;

  _wide = false;
  #ro?: ResizeObserver;
  #returnFocus: HTMLElement | null = null;

  static styles = [
    base,
    css`
      :host { display: block; min-block-size: var(--cm-app-frame-height, 100dvh); background: var(--cm-bg-page); --_header: 0px; --_bottom: 0px; }
      .header { position: sticky; inset-block-start: 0; z-index: 30; padding-block-start: env(safe-area-inset-top, 0px); background: var(--cm-bg-surface); }
      .body { display: grid; grid-template-columns: minmax(0, 1fr); align-items: start; }
      .wide .body { grid-template-columns: auto minmax(0, 1fr); }
      .nav {
        position: sticky; inset-block-start: var(--_header); box-sizing: border-box;
        max-block-size: calc(var(--cm-app-frame-height, 100dvh) - var(--_header));
        overflow-y: auto; overscroll-behavior: contain;
        padding: var(--_gutter); padding-inline-end: 0;
      }
      .frame { --_gutter: var(--cm-app-frame-gutter, var(--cm-space-20)); }
      main { display: block; min-inline-size: 0; padding-block-end: calc(var(--_bottom) + var(--cm-app-frame-bottom-offset, 0px)); }
      /* Panel: the page in a white rounded card with a gutter on the grey page (the merchant dashboard frame). */
      :host([panel]) main { background: var(--cm-bg-surface); }
      :host([panel]) .wide main {
        box-sizing: border-box; margin: var(--_gutter); min-block-size: calc(var(--cm-app-frame-height, 100dvh) - var(--_header) - 2 * var(--_gutter));
        border: var(--cm-border-1) solid var(--cm-border-subtle); border-radius: var(--cm-radius-lg);
      }
      /* Inherited, so a cm-page inside a wrapper element (not slotted directly) is transparent too. */
      :host([panel]) { --cm-page-background: transparent; --cm-page-header-background: transparent; } /* the white panel shows through, rounded corners intact (1.8.2) */
      :host([panel]) ::slotted(cm-page) { background: transparent; }
      main:focus { outline: none; }
      .bottom { position: fixed; inset-inline: 0; inset-block-end: 0; z-index: 40; }
      ::slotted([slot='bottom-navigation']) { position: static; }
      .menu {
        position: fixed; inset: 0; z-index: 35; overflow-y: auto; overscroll-behavior: contain;
        scrollbar-width: none; /* scrolls without a scrollbar, like .nav */
        padding-block: env(safe-area-inset-top, 0px) var(--_bottom); background: var(--cm-bg-page);
      }
      .menu::-webkit-scrollbar { display: none; }
      .probe { block-size: 0; }
      [hidden] { display: none !important; }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('cm-navigate', this.#onNavigate);
    this.addEventListener('keydown', this.#onKey);
    // Pick the layout before the first render, so a wide frame never flashes the narrow one.
    const w = this.getBoundingClientRect().width;
    if (w > 0) this._wide = w >= WIDE;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('cm-navigate', this.#onNavigate);
    this.removeEventListener('keydown', this.#onKey);
    this.#ro?.disconnect();
    this.#ro = undefined;
  }

  /** True while the frame is 1024px wide or more and shows the side navigation instead of the bottom navigation. */
  get wide() { return this._wide; }

  firstUpdated() {
    // Watches the frame's width (through a zero-height probe, so the frame's own height changes don't count) and the
    // heights of the header and the bottom bar. Heights are applied at once, before paint: they only change padding
    // and offsets, nothing watched. Crossing 1024px shows and hides watched parts, so that is applied in the next
    // frame instead (inside the callback it would be a resize loop error).
    let raf = 0;
    this.#ro = new ResizeObserver(() => {
      this.#heights();
      const w = this.renderRoot.querySelector('.probe')!.getBoundingClientRect().width;
      if (w > 0 && w >= WIDE !== this._wide) {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => { this._wide = w >= WIDE; });
      }
    });
    this.renderRoot.querySelectorAll('.probe, .header, .bottom').forEach((el) => this.#ro!.observe(el));
  }

  #heights() {
    const frame = this.renderRoot.querySelector<HTMLElement>('.frame');
    if (!frame) return;
    const h = (sel: string) => Math.round(this.renderRoot.querySelector<HTMLElement>(sel)?.getBoundingClientRect().height ?? 0);
    frame.style.setProperty('--_header', `${h('.header')}px`);
    frame.style.setProperty('--_bottom', `${this._wide ? 0 : h('.bottom')}px`);
  }

  updated(changed: Map<string, unknown>) {
    if (changed.has('_wide')) this.#heights();
  }

  /** Opens the mobile menu and moves focus into it. */
  openMenu() { this.#set(true); }
  /** Closes the mobile menu and returns focus to where it was before the menu opened. */
  closeMenu() { this.#set(false); }
  /** Opens the mobile menu if it is closed, closes it if it is open. */
  toggleMenu() { this.#set(!this.menuOpen); }

  #set(open: boolean, restore = true) {
    if (open === this.menuOpen) return;
    if (open) this.#returnFocus = deepActive();
    this.menuOpen = open;
    this.dispatchEvent(new CustomEvent('cm-menu-toggle', { bubbles: true, composed: true, detail: { open } }));
    this.updateComplete.then(() => {
      if (open) {
        const menu = this.querySelector<HTMLElement>(':scope > [slot="mobile-menu"]');
        const first = (menu?.shadowRoot ?? menu)?.querySelector<HTMLElement>('a[href], button');
        first?.focus();
      } else if (restore) {
        this.#returnFocus?.focus();
        this.#returnFocus = null;
      }
    });
  }

  #slotOf(e: Event) {
    const own = e.composedPath().find((n) => (n as Element).parentElement === this) as Element | undefined;
    return own?.getAttribute('slot') ?? '';
  }

  #onNavigate = (e: Event) => {
    if (!this.menuItem) return;
    const slot = this.#slotOf(e);
    const value = (e as CustomEvent<{ value: string }>).detail?.value;
    if (slot === 'bottom-navigation' && value === this.menuItem) this.#set(!this.menuOpen);
    else if (slot === 'mobile-menu' || slot === 'bottom-navigation') this.#set(false, false);
  };

  #onKey = (e: KeyboardEvent) => {
    // The mobile menu uses Escape itself to leave a sub-screen.
    if (e.key !== 'Escape' || e.defaultPrevented || !this.menuItem || !this.menuOpen || this._wide) return;
    e.preventDefault();
    this.#set(false);
  };

  render() {
    const wide = this._wide;
    // While the menu covers the page, the page and header can't be reached behind it; the bottom bar can.
    const covered = this.menuOpen && !wide && !!this.querySelector(':scope > [slot="mobile-menu"]');
    return html`<div class="frame ${wide ? 'wide' : ''}" part="frame">
      <div class="probe"></div>
      <div class="header" part="header" ?inert=${covered}><slot name="header"></slot></div>
      <div class="body">
        <div class="nav" part="navigation" ?hidden=${!wide}><slot name="navigation"></slot></div>
        <main part="main" ?inert=${covered}><slot></slot></main>
      </div>
      <div class="menu" part="mobile-menu" ?hidden=${!covered}><slot name="mobile-menu" @slotchange=${() => this.requestUpdate()}></slot></div>
      <div class="bottom" part="bottom-navigation" ?hidden=${wide}><slot name="bottom-navigation"></slot></div>
    </div>`;
  }
}
define('cm-app-frame', CmAppFrame);

declare global { interface HTMLElementTagNameMap { 'cm-app-frame': CmAppFrame } }
