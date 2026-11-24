import { html, css, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { base, nextId } from './base.js';
import { CmLocalizedElement } from './localize.js';
import './components/icon.js';

let locks = 0;
let savedOverflow = '';
let savedGutter = '';
/**
 * Stops the page behind an open overlay from scrolling. Counted, so stacked overlays unlock once. When the page shows a
 * classic (always-on) scrollbar, its gutter is kept while locked so the page doesn't jump sideways as it disappears.
 */
export function lockScroll() {
  if (locks++ === 0) {
    const root = document.documentElement;
    savedOverflow = root.style.overflow;
    savedGutter = root.style.scrollbarGutter;
    if (window.innerWidth - root.clientWidth > 0) root.style.scrollbarGutter = 'stable';
    root.style.overflow = 'hidden';
  }
}
export function unlockScroll() {
  if (locks > 0 && --locks === 0) {
    const root = document.documentElement;
    root.style.overflow = savedOverflow;
    root.style.scrollbarGutter = savedGutter;
  }
}

/** The focused element, looking inside shadow roots. */
export function deepActiveElement(): HTMLElement | null {
  let a = document.activeElement as HTMLElement | null;
  while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement as HTMLElement;
  return a;
}

/** Why an overlay is closing: `escape`, `backdrop`, `close-button`, `action` (a choice inside it) or `method` (`close()`). */
export type CloseReason = 'escape' | 'backdrop' | 'close-button' | 'action' | 'method';

/**
 * Shared behaviour of the modal overlays (Modal, Side panel, Filter panel, Bottom sheet, Notification panel).
 * A native `<dialog>` opened with `showModal()`: the rest of the page is inert, so focus stays inside; Esc and
 * the backdrop close it through a cancelable `cm-close`; page scrolling is locked while open; focus goes back to
 * the element that had it when the overlay opened.
 */
export class CmOverlay extends CmLocalizedElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    heading: { string: 'heading' },
    label: {},
    closeLabel: { attribute: 'close-label', string: 'close' },
  };

  /** Shows the overlay. Set it, or call `show()` / `close()`. */
  open = false;
  /** Title in the header. Also the dialog's accessible name. */
  heading!: string;
  /** Accessible name when there is no visible heading. */
  label = '';
  /** Accessible name of the close button. Default: the built-in string `close` ("Close"). */
  closeLabel!: string;

  protected uid = nextId('cm-ovl');
  #opener: HTMLElement | null = null;
  #locked = false;
  #downOnBackdrop = false;

  static overlayStyles = [
    base,
    css`
      :host { display: contents; }
      dialog {
        padding: 0; border: 0; margin: 0; max-width: none; max-height: none; background: transparent; color: inherit;
        font: inherit; overflow: visible;
      }
      dialog::backdrop { background: var(--cm-overlay, rgba(0, 0, 0, 0.4)); }
      .panel {
        display: flex; flex-direction: column; background: var(--cm-bg-surface); color: var(--cm-text-default);
        overflow: hidden; outline: none;
      }
      .head {
        display: flex; align-items: center; gap: var(--cm-space-8); flex: none; min-height: 40px; padding-block: var(--cm-space-8); padding-inline: var(--cm-space-16) var(--cm-space-8);
        background: var(--cm-bg-panel-header); color: var(--cm-text-on-dark);
      }
      .head h2 { flex: 1; min-width: 0; margin: 0; font-size: 14px; line-height: 20px; font-weight: 500; overflow-wrap: anywhere; }
      .x {
        display: grid; place-items: center; flex: none; width: 28px; height: 28px; padding: 0; border: 0; border-radius: var(--cm-radius-sm);
        background: none; color: inherit; cursor: pointer;
      }
      .x:focus-visible { outline: 2px solid var(--cm-text-on-dark); outline-offset: 0; }
      .body { flex: 1 1 auto; min-height: 0; overflow: auto; padding: var(--cm-space-20); font-size: 14px; line-height: 20px; }
      .foot {
        display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--cm-space-8); flex: none; padding: var(--cm-space-12) var(--cm-space-20);
        border-top: var(--cm-border-1) solid var(--cm-border-subtle);
      }
      .foot[hidden] { display: none; }
      @media (prefers-reduced-motion: no-preference) {
        dialog[open] .panel { animation: cm-ovl-in var(--cm-duration-base) var(--cm-easing-standard); }

      }
      @keyframes cm-ovl-in { from { opacity: 0; } to { opacity: 1; } }
    `,
  ];

  /** Opens the overlay. */
  show() { this.open = true; }

  /** Closes the overlay without asking (no `cm-close`). */
  close() { this.open = false; }

  /**
   * Asks to close: fires a cancelable `cm-close` with `detail: { reason }` and closes unless it was cancelled.
   * Returns true when the overlay closed.
   */
  requestClose(reason: CloseReason = 'method'): boolean {
    const ok = this.dispatchEvent(new CustomEvent('cm-close', { detail: { reason }, bubbles: true, composed: true, cancelable: true }));
    if (ok) this.open = false;
    return ok;
  }

  /**
   * Closes at once, in this task (no `cm-close`): the dialog closes, scrolling unlocks and focus is back on the
   * opener before this returns, so whatever the caller does next (open another overlay) starts from there.
   */
  protected closeNow() {
    this.open = false;
    const d = this.dialog;
    if (d?.open) { d.close(); this.#teardown(); }
  }

  protected get dialog() { return this.renderRoot?.querySelector('dialog') as HTMLDialogElement | null; }

  protected updated(changed: PropertyValues) {
    super.updated(changed);
    if (!changed.has('open')) return;
    const d = this.dialog;
    if (!d) return;
    if (this.open && !d.open) {
      this.#opener = deepActiveElement();
      if (!this.isConnected) return;
      d.showModal();
      if (!this.#locked) { lockScroll(); this.#locked = true; }
      this.focusFirst();
      this.dispatchEvent(new CustomEvent('cm-open', { bubbles: true, composed: true }));
    } else if (!this.open && d.open) {
      d.close();
      this.#teardown();
    }
  }

  /** Focus on opening: a light-DOM child with `autofocus`, otherwise the panel itself (so its name is read). */
  protected focusFirst() {
    const auto = this.querySelector<HTMLElement>('[autofocus]');
    if (auto) { auto.focus(); return; }
    this.renderRoot.querySelector<HTMLElement>('.panel')?.focus();
  }

  #teardown() {
    if (this.#locked) { unlockScroll(); this.#locked = false; }
    const o = this.#opener;
    this.#opener = null;
    if (o?.isConnected) o.focus();
    this.dispatchEvent(new CustomEvent('cm-closed', { bubbles: true, composed: true }));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.#locked) { unlockScroll(); this.#locked = false; }
  }

  #keydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && !e.defaultPrevented) { e.preventDefault(); e.stopPropagation(); this.requestClose('escape'); }
  };
  #cancel = (e: Event) => { e.preventDefault(); this.requestClose('escape'); };
  /** The dialog closed by itself (e.g. the browser forced it): bring `open` in line. */
  #closed = () => { if (this.open && !this.dialog?.open) { this.open = false; this.#teardown(); } }; // a late close event after a quick reopen is ignored
  #down = (e: PointerEvent) => { this.#downOnBackdrop = e.target === e.currentTarget; };
  #click = (e: MouseEvent) => {
    if (e.target === e.currentTarget && this.#downOnBackdrop) {
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside || this.backdropFillsDialog) this.requestClose('backdrop');
    }
    this.#downOnBackdrop = false;
  };

  /** True when the dialog box itself is the backdrop area (the panel sits inside it). */
  protected backdropFillsDialog = false;

  protected renderHeader(extra: TemplateResult | typeof nothing = nothing) {
    return html`<header class="head" part="header">
      <h2 id="${this.uid}-h">${this.heading}</h2>${extra}
      <button type="button" class="x" part="close" aria-label=${this.closeLabel || this.t('close')} @click=${() => this.requestClose('close-button')}>
        <cm-icon name="close" size="18"></cm-icon></button>
    </header>`;
  }

  protected renderDialog(content: TemplateResult, cls = '') {
    return html`<dialog part="dialog" class=${cls}
        aria-labelledby=${this.heading ? `${this.uid}-h` : nothing}
        aria-label=${!this.heading && this.label ? this.label : nothing}
        @keydown=${this.#keydown} @cancel=${this.#cancel} @close=${this.#closed}
        @pointerdown=${this.#down} @click=${this.#click}>${content}</dialog>`;
  }
}
