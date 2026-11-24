import { html, css, nothing } from 'lit';
import { base, define, logicalKey } from '../base.js';
import { CmLocalizedElement, defineStrings } from '../localize.js';
import './icon.js';

/** One status tab. */
export interface StatusTab {
  value: string;
  label: string;
  /** Number shown in a small pill after the label, e.g. `All 233`. Screen readers hear "All, 233". */
  count?: number;
  disabled?: boolean;
}

const strings = defineStrings('statusTabs', {
  /** Accessible name of the tab list when the element has no `aria-label`. */
  label: 'Status',
  /** A choice in the `mobile="select"` dropdown that has a count. */
  option: '{label} ({count})',
});
declare module '../localize.js' { interface CmStrings { statusTabs: typeof strings } }

/**
 * A row of statuses that filters the list under it, such as All, Unprocessed, Processing, Fulfilled.
 * The chosen status is black, semibold and underlined; the others are grey. Each label can carry a count, shown as a
 * small neutral pill after it (read as "My tasks, 4").
 * Works as ARIA tabs: one tab stop, arrow keys move and select, Home/End jump to the ends.
 * Too many tabs for the width scroll sideways: the row fades at the edge that has more tabs past it and snaps to a tab
 * (since 1.6, owner standard). On phones `mobile="select"` shows the tabs as a dropdown instead (640px wide or less).
 *
 * Tabs come from `<option>` children (`count` attribute for the number) or the `tabs` property.
 * @element cm-status-tabs
 * @slot - `<option value="…" count="23">Label</option>` elements. `disabled` and `selected` are honoured.
 * @csspart select - The dropdown shown instead of the tabs with `mobile="select"` on narrow screens.
 * @fires change - When the merchant picks another status (a tab, or the dropdown). Read `value`.
 */
export class CmStatusTabs extends CmLocalizedElement {
  static properties = {
    value: { reflect: true },
    tabs: { type: Array },
    controls: {},
    size: { reflect: true },
    mobile: { reflect: true },
    _slotted: { state: true },
    _more: { state: true },
  };

  /** Value of the chosen tab. Defaults to the first tab. */
  value = '';
  /** Tabs as strings or `{ value, label, count, disabled }`. Used instead of `<option>` children when set. */
  tabs: Array<string | StatusTab> = [];
  /**
   * Id of the list or panel the tabs filter (in the same document or shadow root as the tabs). Each tab is linked to it
   * with ARIA element reflection (`ariaControlsElements`), since an `aria-controls` id cannot point out of a shadow root.
   * Browsers without element reflection skip the link.
   */
  controls = '';
  /** `large` (the default: 14px labels, page-level statuses) or `small` (13px, tighter, inside a card, e.g. review sorting). */
  size: 'large' | 'small' = 'large';
  /**
   * What the tabs become on screens 640px wide or less: `scroll` (default: the row scrolls sideways, with a fade at the
   * edge that has more tabs) or `select` (a dropdown of the same choices, with the counts; one control instead of a long
   * row). Since 1.6.
   */
  mobile: 'scroll' | 'select' = 'scroll';

  /** Which edges have more tabs past them: '' | 'start' | 'end' | 'both'. */
  _more = '';
  #resize = new ResizeObserver(() => this.#measure());

  _slotted: StatusTab[] = [];
  #observer = new MutationObserver(() => this.#readChildren());

  static styles = [
    base,
    css`
      :host { display: block; }
      /* A 40px row: 14px labels (medium; semibold when chosen) over a 2px underline on a hairline. */
      .tabs {
        display: flex; gap: var(--cm-space-24); overflow-x: auto; padding: 2px 2px 0;
        scroll-snap-type: x proximity; scroll-padding-inline: var(--cm-space-24);
        font-size: var(--cm-font-size-14); line-height: var(--cm-line-height-14); font-weight: 500; white-space: nowrap;
        box-shadow: inset 0 calc(-1 * var(--cm-border-1)) 0 var(--cm-border-subtle);
      }
      button {
        scroll-snap-align: start;
        position: relative; flex: none; display: inline-flex; align-items: center; gap: var(--cm-space-8);
        min-block-size: var(--cm-control-height-lg); padding: 0; font: inherit; color: var(--cm-text-tertiary);
        background: none; border: 0; cursor: pointer;
      }
      button::after {
        content: ''; position: absolute; inset-inline: 0; bottom: 0; height: 2px; border-radius: var(--cm-radius-full); background: transparent;
      }
      button:hover:not(:disabled) { color: var(--cm-text-default); }
      button[aria-selected='true'] { color: var(--cm-text-default); font-weight: 600; }
      button[aria-selected='true']::after { background: var(--cm-tab-indicator); }
      /* The chosen tab's bold label takes no extra room: each label reserves the width of its bold version. */
      .label { display: inline-grid; }
      .label::after { content: attr(data-text); content: attr(data-text) / ''; font-weight: 600; block-size: 0; overflow: hidden; visibility: hidden; }
      button:focus-visible { outline: 2px solid var(--cm-border-strong); outline-offset: 2px; border-radius: var(--cm-radius-xs); }
      button:disabled { color: var(--cm-text-secondary); cursor: not-allowed; }
      .count {
        display: inline-flex; align-items: center; justify-content: center; box-sizing: border-box;
        min-inline-size: var(--cm-space-20); block-size: var(--cm-space-20); padding: 0 var(--cm-space-4);
        border-radius: var(--cm-radius-full); background: var(--cm-bg-tag); color: var(--cm-text-default);
        font-size: var(--cm-font-size-12); line-height: var(--cm-line-height-12); font-weight: 500; font-variant-numeric: tabular-nums;
      }
      .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
      :host([size='small']) .tabs { gap: var(--cm-space-16); font-size: var(--cm-font-size-13); line-height: var(--cm-line-height-13); }
      :host([size='small']) button { min-block-size: var(--cm-control-height-sm); gap: var(--cm-space-4); }
      slot { display: none; }
      /* Scroll affordance (1.6): the edge with more tabs past it fades out over 32px, so a cut-off row reads as one that
         scrolls. The mask is a gradient of opacity, not a colour, so it works on any background and theme. */
      .tabs.more-end { mask-image: linear-gradient(to right, #000 calc(100% - var(--cm-space-32)), transparent); }
      .tabs.more-start { mask-image: linear-gradient(to left, #000 calc(100% - var(--cm-space-32)), transparent); }
      .tabs.more-both { mask-image: linear-gradient(to right, transparent, #000 var(--cm-space-32), #000 calc(100% - var(--cm-space-32)), transparent); }
      :host(:dir(rtl)) .tabs.more-end { mask-image: linear-gradient(to left, #000 calc(100% - var(--cm-space-32)), transparent); }
      :host(:dir(rtl)) .tabs.more-start { mask-image: linear-gradient(to right, #000 calc(100% - var(--cm-space-32)), transparent); }
      .pick { display: none; position: relative; }
      .pick select {
        appearance: none; box-sizing: border-box; width: 100%; height: var(--cm-control-height-lg); padding-block: 0;
        padding-inline: var(--cm-space-12) var(--cm-space-40); font: inherit; font-size: var(--cm-font-size-14); font-weight: 500;
        color: var(--cm-text-default); background: var(--cm-bg-surface); cursor: pointer;
        border: var(--cm-border-1) solid var(--cm-border-input); border-radius: var(--cm-radius-sm);
      }
      .pick select:hover { border-color: var(--cm-border-strong); }
      .pick select:focus-visible { outline: none; border-color: var(--cm-border-strong); box-shadow: 0 0 0 1px var(--cm-border-strong); }
      .pick cm-icon { position: absolute; inset-inline-end: var(--cm-space-12); inset-block-start: 50%; translate: 0 -50%; pointer-events: none; color: var(--cm-icon-selected); }
      @media (pointer: coarse) { .pick select { height: var(--cm-control-height-touch); font-size: var(--cm-font-size-16); } }
      @media (max-width: 640px) {
        .tabs { gap: var(--cm-space-16); }
        :host([mobile='select']) .tabs { display: none; }
        :host([mobile='select']) .pick { display: block; }
      }
    `,
  ];

  connectedCallback() {
    super.connectedCallback();
    this.#readChildren();
    this.#observer.observe(this, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['value', 'label', 'count', 'disabled', 'selected'] });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.#observer.disconnect();
    this.#resize.disconnect();
  }

  firstUpdated() {
    const row = this.renderRoot.querySelector('.tabs')!;
    this.#resize.observe(row);
    row.addEventListener('scroll', () => this.#measure(), { passive: true });
    document.fonts?.ready.then(() => this.#measure());
  }

  /** Works out which edges of the row have tabs past them (for the fade). */
  #measure() {
    const row = this.renderRoot.querySelector<HTMLElement>('.tabs');
    if (!row) return;
    const max = row.scrollWidth - row.clientWidth;
    const at = Math.abs(row.scrollLeft); // negative in right-to-left rows
    const start = max > 1 && at > 1;
    const end = max > 1 && at < max - 1;
    const more = start && end ? 'both' : start ? 'start' : end ? 'end' : '';
    if (more !== this._more) this._more = more;
  }

  /** The tabs in use, normalised. */
  get items(): StatusTab[] {
    if (!this.tabs.length) return this._slotted;
    return this.tabs.map((t) => (typeof t === 'string' ? { value: t, label: t } : t));
  }

  /** Focuses the selected tab (or the dropdown, when `mobile="select"` shows it). */
  override focus(options?: FocusOptions) {
    const select = this.renderRoot.querySelector<HTMLSelectElement>('.pick select');
    if (select && select.offsetParent !== null) select.focus(options);
    else this.renderRoot.querySelector<HTMLElement>('button[tabindex="0"]')?.focus(options);
  }

  #onPick(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    if (value === this.value) return;
    this.value = value;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  #readChildren() {
    const opts = [...this.querySelectorAll('option')];
    this._slotted = opts.map((o) => {
      const c = o.getAttribute('count');
      return { value: o.value, label: o.label || o.textContent!.trim(), count: c === null || c === '' ? undefined : Number(c), disabled: o.disabled };
    });
    if (!this.hasUpdated && !this.value) this.value = opts.find((o) => o.hasAttribute('selected'))?.value ?? '';
  }

  #current(items: StatusTab[]) {
    const i = items.findIndex((t) => t.value === this.value && !t.disabled);
    return i >= 0 ? i : items.findIndex((t) => !t.disabled);
  }

  #select(i: number) {
    const t = this.items[i];
    if (!t || t.disabled) return;
    this.updateComplete.then(() => {
      const b = this.renderRoot.querySelectorAll('button')[i];
      b?.focus();
      b?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    });
    if (t.value === this.value) return;
    this.value = t.value;
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  #onKeyDown(e: KeyboardEvent, i: number) {
    const key = logicalKey(e, this);
    const en = this.items.flatMap((t, j) => (t.disabled ? [] : [j]));
    const pos = en.indexOf(i);
    let next: number | undefined;
    if (key === 'ArrowRight') next = en[(pos + 1) % en.length];
    else if (key === 'ArrowLeft') next = en[(pos - 1 + en.length) % en.length];
    else if (e.key === 'Home') next = en[0];
    else if (e.key === 'End') next = en[en.length - 1];
    else return;
    e.preventDefault();
    if (next !== undefined) this.#select(next);
  }

  updated(changed: Map<string, unknown>) {
    // Measure after every render, and watch each tab: counts that arrive later, or the web font finishing loading,
    // widen the tabs without resizing the row, so the row's own resize alone would miss them (issue seen in CRM /v4).
    void changed;
    this.#measure();
    for (const b of this.renderRoot.querySelectorAll('.tabs > *')) this.#resize.observe(b);
    if (!('ariaControlsElements' in Element.prototype)) return;
    const root = this.getRootNode() as Document | ShadowRoot;
    const target = this.controls ? root.getElementById?.(this.controls) : null;
    for (const b of this.renderRoot.querySelectorAll('button, select')) (b as any).ariaControlsElements = target ? [target] : null;
  }

  render() {
    const items = this.items;
    const cur = this.#current(items);
    const label = this.getAttribute('aria-label') || this.t('label');
    return html`
      <div class=${`tabs${this._more ? ` more-${this._more}` : ''}`} part="tabs" role="tablist" aria-label=${label}>
        ${items.map((t, i) => html`<button type="button" role="tab" part="tab" aria-selected=${i === cur ? 'true' : 'false'}
            tabindex=${i === cur ? '0' : '-1'} ?disabled=${!!t.disabled}
            @click=${() => this.#select(i)} @keydown=${(e: KeyboardEvent) => this.#onKeyDown(e, i)}><span class="label" data-text=${t.label}>${t.label}</span>${t.count !== undefined && !Number.isNaN(t.count)
              ? html`<span class="sr">, </span><span class="count" part="count">${this.formatNumber(t.count)}</span>`
              : nothing}</button>`)}
      </div>
      ${this.mobile === 'select'
        ? html`<div class="pick"><select part="select" aria-label=${label} @change=${this.#onPick}>
            ${items.map((t, i) => html`<option value=${t.value} ?disabled=${!!t.disabled} ?selected=${i === cur} .selected=${i === cur}>${
              t.count !== undefined && !Number.isNaN(t.count) ? this.t('option', { label: t.label, count: t.count }) : t.label}</option>`)}
          </select><cm-icon name="chevron-down" size="16"></cm-icon></div>`
        : nothing}
      <slot></slot>
    `;
  }
}
define('cm-status-tabs', CmStatusTabs);

declare global { interface HTMLElementTagNameMap { 'cm-status-tabs': CmStatusTabs } }
