import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import '@commmerce/tokens/tokens.css';
import '../src/index.js';
import { userEvent } from 'vitest/browser';

// 1.11: the opt-in refined look (data-cm-look="refined"). The default look must not change.
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
const root = document.documentElement;
const rgb = (hex: string) => { const n = parseInt(hex.slice(1), 16); return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`; };

async function mount(markup: string) {
  document.body.innerHTML = markup;
  const els = [...document.body.querySelectorAll('*')].filter((e) => e.localName.startsWith('cm-')) as (HTMLElement & { updateComplete?: Promise<unknown> })[];
  for (const e of els) await e.updateComplete;
  await nextFrame();
}
const shadow = (sel: string, inner: string) => document.querySelector(sel)!.shadowRoot!.querySelector(inner) as HTMLElement;

beforeAll(async () => {
  const end = Date.now() + 10_000;
  while (!getComputedStyle(root).getPropertyValue('--cm-space-20') && Date.now() < end) await new Promise((r) => setTimeout(r, 20));
});
afterEach(() => { root.removeAttribute('data-cm-look'); root.removeAttribute('data-cm-theme'); });

const MARKUP = `
  <cm-page-header heading="Merchants"></cm-page-header>
  <cm-badge tone="success">Open</cm-badge><cm-badge>Customer</cm-badge>
  <cm-button icon="bell" icon-only label="Notifications" count="12"></cm-button>
  <cm-status-tabs><option value="a" selected>Tickets</option><option value="b">Inbox</option></cm-status-tabs>
  <cm-resource-list label="Views"><cm-resource-item value="a" label="Open" selected>Open</cm-resource-item></cm-resource-list>`;

describe('refined look (1.11)', () => {
  it('default look is unchanged: Poppins, blue counts, black tab line, no badge dot', async () => {
    await mount(MARKUP);
    expect(getComputedStyle(shadow('cm-page-header', 'h1')).fontFamily).toMatch(/^"?Poppins/);
    expect(getComputedStyle(shadow('cm-button', '.count')).backgroundColor).toBe(rgb('#446beb'));
    expect(getComputedStyle(shadow('cm-status-tabs', "button[aria-selected='true']"), '::after').backgroundColor).toBe(rgb('#000000'));
    expect(getComputedStyle(shadow('cm-badge', 'span'), '::before').width).toMatch(/^(0px|auto)$/);
    expect(getComputedStyle(root).getPropertyValue('--cm-bg-page').trim()).toBe('#f6f6f6');
  });

  it('refined (1.20): Poppins throughout, blue counts with white text, blue tab line, blue-tinted selected row, badge dot', async () => {
    root.setAttribute('data-cm-look', 'refined');
    await mount(MARKUP);
    expect(getComputedStyle(document.querySelector('cm-badge')!).fontFamily).toMatch(/^"?Poppins/);
    expect(getComputedStyle(shadow('cm-page-header', 'h1')).fontFamily).toMatch(/^"?Poppins/);
    const count = getComputedStyle(shadow('cm-button', '.count'));
    expect(count.backgroundColor).toBe(rgb('#446beb'));
    expect(count.color).toBe(rgb('#ffffff'));
    expect(getComputedStyle(shadow('cm-status-tabs', "button[aria-selected='true']"), '::after').backgroundColor).toBe(rgb('#446beb'));
    const item = document.querySelector('cm-resource-item')!;
    expect(getComputedStyle(item.shadowRoot!.querySelector('.row')!).backgroundColor).toBe(rgb('#ecf0fd'));
    const toned = getComputedStyle(shadow("cm-badge[tone='success']", 'span'), '::before');
    expect(toned.width).toBe('6px');
    expect(getComputedStyle(shadow("cm-badge[tone='neutral']", 'span'), '::before').content).toMatch(/^(none|normal)$/);
    expect(getComputedStyle(root).getPropertyValue('--cm-bg-page').trim()).toBe('#f5f5f5');
  });

  it('refined + dark theme uses the dark values, not the light look values', async () => {
    root.setAttribute('data-cm-look', 'refined');
    root.setAttribute('data-cm-theme', 'dark');
    await mount(MARKUP);
    const cs = getComputedStyle(root);
    expect(cs.getPropertyValue('--cm-bg-page').trim()).toBe('#0c0c0c');
    expect(cs.getPropertyValue('--cm-text-default').trim()).toBe('#eeeeee');
    expect(getComputedStyle(shadow('cm-button', '.count')).backgroundColor).toBe(rgb('#446beb'));
  });
});

describe('1.19 additions', () => {
  it('tertiary button: no fill and no outline until hovered', async () => {
    await mount('<cm-button variant="tertiary" icon="bell" icon-only label="Notifications"></cm-button><cm-button>Plain</cm-button><p id="away" style="margin-top: 200px">away</p>');
    // Earlier test files leave the real pointer wherever they last moved it; park it off the buttons so :hover can't apply.
    await userEvent.hover(document.getElementById('away')!);
    await nextFrame();
    const [t, s] = [...document.querySelectorAll('cm-button')].map((b) => getComputedStyle(b.shadowRoot!.querySelector('.btn')!));
    expect(t.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(t.borderTopColor).toBe('rgba(0, 0, 0, 0)');
    expect(s.borderTopColor).not.toBe('rgba(0, 0, 0, 0)');
  });
  it('account ring: black by default, the light border in the refined look', async () => {
    await mount('<cm-account-menu label="Account" name="Asha K"></cm-account-menu>');
    const ring = () => getComputedStyle(document.querySelector('cm-account-menu')!.shadowRoot!.querySelector('.trigger.account')!).borderTopColor;
    expect(ring()).toBe(rgb('#000000'));
    root.setAttribute('data-cm-look', 'refined');
    await nextFrame();
    expect(ring()).toBe(rgb('#e3e3e3'));
  });
});

describe('1.19: phone navigation marks the current page (was a CRM-only patch)', () => {
  it('bottom navigation: bold label and a tinted pill behind the current icon', async () => {
    await mount(`<cm-bottom-navigation label="Main">
      <cm-nav-item label="Home" icon="home" href="#home" current></cm-nav-item>
      <cm-nav-item label="Orders" icon="bag" href="#orders"></cm-nav-item></cm-bottom-navigation>`);
    const [cur, other] = [...document.querySelector('cm-bottom-navigation')!.shadowRoot!.querySelectorAll('.item')] as HTMLElement[];
    expect(getComputedStyle(cur).fontWeight).toBe('600');
    expect(getComputedStyle(other).fontWeight).toBe('500');
    expect(getComputedStyle(cur.querySelector('.icon')!).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(other.querySelector('.icon')!).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    root.setAttribute('data-cm-look', 'refined');
    await nextFrame();
    expect(getComputedStyle(cur.querySelector('.icon')!).backgroundColor).not.toBe(getComputedStyle(other.querySelector('.icon')!).backgroundColor);
  });
  it('mobile menu: the current row is tinted and bold', async () => {
    await mount(`<cm-mobile-menu label="Menu"><cm-nav-item label="Panels">
      <cm-nav-item label="Orders" icon="bag" href="#orders" current></cm-nav-item>
      <cm-nav-item label="Products" icon="box" href="#products"></cm-nav-item></cm-nav-item></cm-mobile-menu>`);
    const [cur, other] = [...document.querySelector('cm-mobile-menu')!.shadowRoot!.querySelectorAll('.card .row')] as HTMLElement[];
    expect(cur.getAttribute('aria-current')).toBe('page');
    expect(getComputedStyle(cur).fontWeight).toBe('600');
    expect(getComputedStyle(cur).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(other).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });
});

describe('1.20: refined look in Commmerce blue', () => {
  it('initials avatar uses the light blue, not green', async () => {
    root.setAttribute('data-cm-look', 'refined');
    await mount('<cm-avatar name="Asha K"></cm-avatar>');
    expect(getComputedStyle(root).getPropertyValue('--cm-avatar-bg').trim()).toBe('#ecf0fd');
  });
});
