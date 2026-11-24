import { css } from 'lit';

/** Shared host reset. Tokens are CSS custom properties, so they cross the shadow boundary. */
export const base = css`
  :host {
    font-family: var(--cm-font-sans, 'Poppins', system-ui, sans-serif);
    color: var(--cm-text-default, #000);
    box-sizing: border-box;
  }
  :host([hidden]) { display: none !important; }
  *, *::before, *::after { box-sizing: inherit; }
  /* Scroll areas scroll, but never draw a scrollbar: a classic (always-on) scrollbar takes width as it appears and
     shifts the layout. Overflow is shown instead by the component (fades, "more" hints, sticky edges). */
  :host, * { scrollbar-width: none; }
  ::-webkit-scrollbar { display: none; }
`;

export const focusRing = css`
  outline: 2px solid var(--cm-border-strong);
  outline-offset: 2px;
`;

let uid = 0;
export const nextId = (p: string) => `${p}-${++uid}`;

/** Registers a custom element once, so two copies of the library on one page don't throw. */
export function define(tag: string, ctor: CustomElementConstructor) {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
}

export type Tone = 'attention' | 'information' | 'success' | 'critical';

/**
 * The arrow key as it reads in the element's direction: in right-to-left text ArrowLeft moves forward, so it is
 * reported as ArrowRight (and the other way round). Up, down and every other key are unchanged.
 */
export function logicalKey(e: KeyboardEvent, el: Element): string {
  const k = e.key;
  if ((k === 'ArrowLeft' || k === 'ArrowRight') && getComputedStyle(el).direction === 'rtl') return k === 'ArrowLeft' ? 'ArrowRight' : 'ArrowLeft';
  return k;
}
