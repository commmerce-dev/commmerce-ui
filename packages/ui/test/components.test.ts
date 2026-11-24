import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../src/index.js';
import type { CmButton, CmTextField, CmCheckbox, CmBanner, CmCard, CmRadio, CmRadioGroup, CmToggle, CmSelect, CmSearch, CmFileUpload, CmOptionGroup, CmTag, CmPageHeader, CmActionBar, CmSaveBar, CmInfoPanel, CmInfoItem, CmAccordion, CmEmptyState, CmSkeleton, CmSkeletonDisplay, CmComment, CmCommentBox, CmSmartTip, CmSmartTips, CmPagination, CmStatusTabs, CmTableHeader, CmResourceList, CmResourceItem, CmNestedList, CmNestedItem, CmReportTile, CmReportTiles, CmSideNavigation, CmHeaderBar, CmBottomNavigation, CmMobileMenu, CmFlashOfferBar, CmLinkTabs, CmAppCard } from '../src/index.js';

const mount = async <T extends HTMLElement>(markup: string): Promise<T> => {
  document.body.innerHTML = markup;
  const el = document.body.firstElementChild!.matches('form')
    ? (document.body.firstElementChild!.firstElementChild as T)
    : (document.body.firstElementChild as T);
  await (el as any).updateComplete;
  return el;
};
const shadow = (el: Element, sel: string) => el.shadowRoot!.querySelector(sel) as HTMLElement;

beforeEach(() => { document.body.innerHTML = ''; });

describe('cm-button', () => {
  it('renders a native button with defaults', async () => {
    const el = await mount<CmButton>('<cm-button>Save</cm-button>');
    expect(el.variant).toBe('secondary');
    expect(el.getAttribute('variant')).toBe('secondary');
    expect(shadow(el, 'button')).toBeTruthy();
  });
  it('renders a link when href is set', async () => {
    const el = await mount<CmButton>('<cm-button href="/orders" target="_blank">Orders</cm-button>');
    const a = shadow(el, 'a') as HTMLAnchorElement;
    expect(a.getAttribute('href')).toBe('/orders');
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
  });
  it('swallows clicks while disabled or loading', async () => {
    const el = await mount<CmButton>('<cm-button disabled>Save</cm-button>');
    let clicks = 0;
    el.addEventListener('click', () => clicks++);
    el.click();
    el.disabled = false; el.loading = true; await el.updateComplete;
    el.click();
    expect(clicks).toBe(0);
    expect(shadow(el, 'button').getAttribute('aria-busy')).toBe('true');
  });
});

describe('cm-button icon-only and count', () => {
  const inner = (el: Element) => (el.shadowRoot!.querySelector('button, a') as HTMLElement);
  it('icon-only: square, named by label, icon from the icon attribute', async () => {
    const el = await mount<CmButton>('<cm-button icon-only icon="refresh" label="Refresh"></cm-button>');
    const b = inner(el);
    expect(b.getAttribute('aria-label')).toBe('Refresh');
    expect(shadow(el, 'cm-icon')!.getAttribute('name')).toBe('refresh');
    const r = b.getBoundingClientRect();
    const touch = matchMedia('(pointer: coarse)').matches;
    expect(r.width).toBe(r.height);
    // 1.5 scale: medium 36, slim 32, large 40 (--cm-control-height-*), 44 on touch screens.
    expect(r.width).toBe(touch ? 44 : 36);
    el.size = 'slim'; await el.updateComplete;
    expect(inner(el).getBoundingClientRect().width).toBe(touch ? 44 : 32);
    el.size = 'large'; await el.updateComplete;
    expect(inner(el).getBoundingClientRect().width).toBe(touch ? 44 : 40);
  });
  it('on touch screens (pointer: coarse) every button is drawn at least 40px tall (icon-only 40 x 40) with a 44px hit area', async () => {
    const el = await mount<CmButton>('<cm-button icon-only size="slim" icon="search" label="Search"></cm-button>');
    const rules = [...el.shadowRoot!.adoptedStyleSheets].flatMap((s) => [...s.cssRules]);
    const coarse = rules.find((r) => r instanceof CSSMediaRule && r.conditionText.includes('pointer: coarse')) as CSSMediaRule;
    expect(coarse).toBeTruthy();
    const inside = [...coarse.cssRules].map((r) => r.cssText).join('\n');
    // Every size (no :host([size]) selector on the height rule) and icon-only width.
    expect(inside).toMatch(/(^|\n)\.btn \{ min-height: var\(--cm-control-height-lg, 40px\); \}/);
    expect(inside).toMatch(/:host\(\[icon-only\]\) \.btn \{ min-width: var\(--cm-control-height-lg, 40px\); \}/);
    // The invisible hit area reaches 2px past every edge: 44px from a 40px button.
    expect(inside).toMatch(/\.btn::after \{ content: ""; position: absolute; inset: -2px; \}/);
  });
  it('icon-only: slotted icon and slotted text still work; the text is visually hidden', async () => {
    const el = await mount<CmButton>('<cm-button icon-only><cm-icon slot="icon" name="bell"></cm-icon>Notifications</cm-button>');
    expect(inner(el).hasAttribute('aria-label')).toBe(false);
    const hidden = shadow(el, '.vh')!;
    expect(hidden.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    expect(inner(el).getBoundingClientRect().width).toBe(matchMedia('(pointer: coarse)').matches ? 40 : 36);
  });
  it('shows a visible focus ring on keyboard focus', async () => {
    // Tokens aren't loaded in the tests: without the variable the outline shorthand is invalid.
    document.body.innerHTML = '<cm-button icon-only icon="bell" label="Notifications" style="--cm-border-strong:#000"></cm-button>';
    const el = document.querySelector('cm-button') as CmButton; await el.updateComplete;
    await userEvent.tab();
    if (el.shadowRoot!.activeElement !== inner(el)) await userEvent.tab();
    expect(el.shadowRoot!.activeElement).toBe(inner(el));
    expect(inner(el).matches(':focus-visible')).toBe(true);
    const cs = getComputedStyle(inner(el));
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
  });
  it('count: shows the number, caps at 99+, hides at 0, and is in the accessible name', async () => {
    const el = await mount<CmButton>('<cm-button icon-only icon="bell" label="Notifications" count="3"></cm-button>');
    expect(shadow(el, '.count')!.textContent).toBe('3');
    expect(shadow(el, '.count')!.getAttribute('aria-hidden')).toBe('true');
    expect(inner(el).getAttribute('aria-label')).toBe('Notifications, 3 unread');
    el.count = 120; await el.updateComplete;
    expect(shadow(el, '.count')!.textContent).toBe('99+');
    expect(inner(el).getAttribute('aria-label')).toBe('Notifications, 120 unread');
    el.count = 0; await el.updateComplete;
    expect(shadow(el, '.count')).toBeNull();
    expect(inner(el).getAttribute('aria-label')).toBe('Notifications');
  });
  it('count on a text button: visible number, exact count read after the label', async () => {
    const el = await mount<CmButton>('<cm-button count="7">Inbox</cm-button>');
    expect(shadow(el, '.count')!.textContent).toBe('7');
    expect(inner(el).hasAttribute('aria-label')).toBe(false);
    expect(shadow(el, '.vh')!.textContent!.trim()).toBe('7 unread');
  });
  it('count wording is localisable per element and per app', async () => {
    const el = await mount<CmButton>(`<cm-button icon-only icon="tasks" label="Tasks" count="2" strings='{"labelWithCount":"{label}: {count} due"}'></cm-button>`);
    expect(inner(el).getAttribute('aria-label')).toBe('Tasks: 2 due');
  });
  it('label is ignored on a text button, so the visible text stays its name', async () => {
    const el = await mount<CmButton>('<cm-button label="Ignored">Save</cm-button>');
    expect(inner(el).hasAttribute('aria-label')).toBe(false);
  });
  it('default rendering is unchanged without the new attributes', async () => {
    const el = await mount<CmButton>('<cm-button>Save</cm-button>');
    expect(inner(el).innerHTML.replace(/<!--[^>]*-->/g, '').trim()).toBe('<slot name="icon"></slot><span class="text"><slot></slot></span>'); // 1.8.1: the label is wrapped so long text ends with an ellipsis
  });
  it('an icon-only link button keeps its name', async () => {
    const el = await mount<CmButton>('<cm-button icon-only icon="external" label="View store" href="/store"></cm-button>');
    expect(inner(el).tagName).toBe('A');
    expect(inner(el).getAttribute('aria-label')).toBe('View store');
  });
});

describe('@commmerce/icons 1.1 additions', () => {
  const added = ['mail', 'chat', 'tag', 'building', 'map', 'note', 'eye', 'inbox', 'handshake', 'log-out', 'refresh', 'tasks'];
  it('every new icon exists and draws inside the 24px grid with the standard stroke', async () => {
    const { icons } = await import('@commmerce/icons');
    document.body.innerHTML = added.map((n) => `<cm-icon name="${n}" size="24"></cm-icon>`).join('');
    const els = [...document.querySelectorAll('cm-icon')] as any[];
    await Promise.all(els.map((e) => e.updateComplete));
    for (const [i, el] of els.entries()) {
      expect((icons as Record<string, string>)[added[i]], added[i]).toBeTruthy();
      const svg = el.shadowRoot.querySelector('svg')!;
      expect(svg.getAttribute('stroke-width')).toBe('1.6');
      const box = (svg.querySelector('path') as SVGPathElement).getBBox();
      expect(box.x, added[i]).toBeGreaterThanOrEqual(2);
      expect(box.y, added[i]).toBeGreaterThanOrEqual(2);
      expect(box.x + box.width, added[i]).toBeLessThanOrEqual(22);
      expect(box.y + box.height, added[i]).toBeLessThanOrEqual(22);
      expect(box.width * box.height, added[i]).toBeGreaterThan(60);
    }
  });
});

describe('cm-text-field date and time types (issue #12)', () => {
  const input = (el: CmTextField) => shadow(el, 'input') as HTMLInputElement;
  const fmt = (o: Intl.DateTimeFormatOptions, d: Date) => new Intl.DateTimeFormat('en-IN', o).format(d);

  it('datetime-local and time pass min, max and step to the native input; the value is local ISO', async () => {
    const el = await mount<CmTextField>('<cm-text-field lang="en-IN" type="datetime-local" label="Follow up on" min="2026-11-16T10:00" max="2026-12-31T18:00" step="900" value="2026-11-20T15:30"></cm-text-field>');
    expect(input(el).type).toBe('datetime-local');
    expect(input(el).min).toBe('2026-11-16T10:00');
    expect(input(el).max).toBe('2026-12-31T18:00');
    expect(input(el).step).toBe('900');
    expect(input(el).value).toBe('2026-11-20T15:30');
    expect(el.checkValidity()).toBe(true);
    const t = await mount<CmTextField>('<cm-text-field type="time" label="Call at" value="09:30"></cm-text-field>');
    expect(input(t).type).toBe('time');
    expect(input(t).hasAttribute('min')).toBe(false);
  });

  it('min and max are validated with messages in the page language', async () => {
    const el = await mount<CmTextField>('<cm-text-field lang="en-IN" type="datetime-local" label="Follow up on" min="2026-11-16T10:00" value="2026-11-16T09:00"></cm-text-field>');
    expect(el.validity.rangeUnderflow).toBe(true);
    expect(el.validationMessage).toBe(`Enter ${fmt({ day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }, new Date(2026, 10, 16, 10, 0))} or later.`);
    expect(shadow(el, 'input').getAttribute('aria-invalid')).toBeNull(); // the error attribute is the app's to set
    const t = await mount<CmTextField>('<cm-text-field lang="en-IN" type="time" label="Call at" max="18:00" value="19:15"></cm-text-field>');
    expect(t.validity.rangeOverflow).toBe(true);
    expect(t.validationMessage).toBe(`Enter ${fmt({ hour: 'numeric', minute: '2-digit' }, new Date(2000, 0, 1, 18, 0))} or earlier.`);
    const d = await mount<CmTextField>('<cm-text-field lang="en-IN" type="date" label="Ship by" min="2026-11-16" value="2026-11-10"></cm-text-field>');
    expect(d.validationMessage).toBe(`Enter ${fmt({ day: 'numeric', month: 'short', year: 'numeric' }, new Date(2026, 10, 16))} or later.`);
    const n = await mount<CmTextField>('<cm-text-field lang="en-IN" type="number" label="Quantity" min="1" max="100000" value="250000"></cm-text-field>');
    expect(n.validationMessage).toBe('Enter 1,00,000 or less.');
  });

  it('step: the message names the two nearest allowed values; without step a decimal number stays valid', async () => {
    const el = await mount<CmTextField>('<cm-text-field lang="en-IN" type="time" label="Call at" step="900" value="10:07"></cm-text-field>');
    expect(el.validity.stepMismatch).toBe(true);
    const at = (h: number, m: number) => fmt({ hour: 'numeric', minute: '2-digit' }, new Date(2000, 0, 1, h, m));
    expect(el.validationMessage).toBe(`Enter a valid value. The two nearest are ${at(10, 0)} and ${at(10, 15)}.`);
    const n = await mount<CmTextField>('<cm-text-field type="number" label="Price" value="12.5"></cm-text-field>');
    expect(n.checkValidity()).toBe(true);
  });

  it('submits the datetime-local value with the form and blocks an out-of-range one', async () => {
    document.body.innerHTML = '<form><cm-text-field name="follow_up" type="datetime-local" label="Follow up on" min="2026-11-16T10:00" value="2026-11-20T15:30"></cm-text-field></form>';
    const el = document.querySelector('cm-text-field')!;
    await el.updateComplete;
    const form = document.querySelector('form')!;
    expect(new FormData(form).get('follow_up')).toBe('2026-11-20T15:30');
    el.value = '2026-11-01T08:00'; await el.updateComplete;
    expect(form.checkValidity()).toBe(false);
  });
});

describe('cm-text-field', () => {
  it('links the label and error to the input', async () => {
    const el = await mount<CmTextField>('<cm-text-field label="Name" error="Name is required"></cm-text-field>');
    const input = shadow(el, 'input');
    const label = shadow(el, 'label');
    expect(label.getAttribute('for')).toBe(input.id);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const err = shadow(el, '.error');
    expect(input.getAttribute('aria-describedby')).toContain(err.id);
    expect(err.getAttribute('role')).toBe('alert');
  });
  it('renders the bracketed hint', async () => {
    const el = await mount<CmTextField>('<cm-text-field label="Ordered" hint="points per rupee"></cm-text-field>');
    expect(shadow(el, '.hint').textContent).toBe('[points per rupee]');
  });
  it('updates value on input and re-dispatches change across the shadow boundary', async () => {
    const el = await mount<CmTextField>('<cm-text-field label="Name"></cm-text-field>');
    let changed = 0;
    el.addEventListener('change', () => changed++);
    const input = shadow(el, 'input') as HTMLInputElement;
    input.value = 'Anika';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('change'));
    expect(el.value).toBe('Anika');
    expect(changed).toBe(1);
  });
  it('resets to its initial value with the form', async () => {
    const el = await mount<CmTextField>('<form><cm-text-field name="n" value="start"></cm-text-field></form>');
    el.value = 'edited'; await el.updateComplete;
    el.formResetCallback();
    expect(el.value).toBe('start');
  });
  it('renders a textarea when multiline', async () => {
    const el = await mount<CmTextField>('<cm-text-field label="Description" multiline rows="6"></cm-text-field>');
    expect(shadow(el, 'textarea').getAttribute('rows')).toBe('6');
  });
});

describe('cm-checkbox', () => {
  it('toggles and fires change', async () => {
    const el = await mount<CmCheckbox>('<cm-checkbox label="Track quantity"></cm-checkbox>');
    let fired = 0;
    el.addEventListener('change', () => fired++);
    const input = shadow(el, 'input') as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    await el.updateComplete;
    expect(el.checked).toBe(true);
    expect(el.hasAttribute('checked')).toBe(true);
    expect(fired).toBe(1);
  });
  it('links the description', async () => {
    const el = await mount<CmCheckbox>('<cm-checkbox label="SMS" description="Phone otp is only for Indian numbers"></cm-checkbox>');
    const input = shadow(el, 'input');
    expect(shadow(el, `#${input.getAttribute('aria-describedby')}`).textContent).toContain('Indian numbers');
  });
});

describe('cm-banner', () => {
  it('uses alert for critical and status otherwise', async () => {
    const crit = await mount<CmBanner>('<cm-banner tone="critical" heading="Payment failed">x</cm-banner>');
    expect(shadow(crit, '.banner').getAttribute('role')).toBe('alert');
    const info = await mount<CmBanner>('<cm-banner tone="information">x</cm-banner>');
    expect(shadow(info, '.banner').getAttribute('role')).toBe('status');
  });
  it('hides on dismiss unless the event is cancelled', async () => {
    const el = await mount<CmBanner>('<cm-banner dismissible>x</cm-banner>');
    el.addEventListener('cm-dismiss', (e) => e.preventDefault(), { once: true });
    (shadow(el, '.close') as HTMLButtonElement).click();
    expect(el.hidden).toBe(false);
    (shadow(el, '.close') as HTMLButtonElement).click();
    expect(el.hidden).toBe(true);
  });
});

describe('cm-card', () => {
  it('exposes the title as a heading at the requested level', async () => {
    const el = await mount<CmCard>('<cm-card heading="Pricing" heading-level="3">x</cm-card>');
    const h = shadow(el, '[role=heading]');
    expect(h.getAttribute('aria-level')).toBe('3');
    expect(h.textContent).toContain('Pricing');
  });
});

describe('native forms', () => {
  it('submits text field and checkbox values, and blocks submit when required is empty', async () => {
    document.body.innerHTML = `<form>
      <cm-text-field name="title" label="Title" required></cm-text-field>
      <cm-checkbox name="track" value="yes" label="Track quantity" checked></cm-checkbox>
      <cm-button type="submit" variant="primary">Save</cm-button></form>`;
    const form = document.querySelector('form')!;
    const tf = document.querySelector('cm-text-field')!;
    await Promise.all([...form.children].map((c: any) => c.updateComplete));
    let submitted: FormData | null = null;
    form.addEventListener('submit', (e) => { e.preventDefault(); submitted = new FormData(form); });

    expect(form.checkValidity()).toBe(false);
    document.querySelector('cm-button')!.click();
    expect(submitted).toBeNull();

    tf.value = 'Blue Kurta'; await tf.updateComplete;
    document.querySelector('cm-button')!.click();
    expect(submitted!.get('title')).toBe('Blue Kurta');
    expect(submitted!.get('track')).toBe('yes');
  });
});

describe('registration', () => {
  it('tolerates the library being loaded twice', async () => {
    const { define } = await import('../src/base.js');
    expect(() => define('cm-button', class extends HTMLElement {})).not.toThrow();
  });
});

describe('cm-radio-group', () => {
  const markup = `<form><cm-radio-group name="status" label="Status of the product">
    <cm-radio value="active" label="Active"></cm-radio>
    <cm-radio value="draft" label="Draft" disabled></cm-radio>
    <cm-radio value="inactive" label="Inactive" description="Hidden from the store" checked></cm-radio>
  </cm-radio-group></form>`;
  const radios = (g: Element) => [...g.querySelectorAll('cm-radio')] as CmRadio[];
  const inner = (r: Element) => shadow(r, '[role=radio]');
  const key = (el: Element, k: string) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, composed: true, cancelable: true }));
  const settle = async (g: CmRadioGroup) => { await g.updateComplete; await Promise.all(radios(g).map((r) => r.updateComplete)); };

  it('exposes a labelled radiogroup with one tab stop on the checked option', async () => {
    const g = await mount<CmRadioGroup>(markup); await settle(g);
    const group = shadow(g, '[role=radiogroup]');
    expect(shadow(g, `#${group.getAttribute('aria-labelledby')}`).textContent).toContain('Status of the product');
    expect(g.value).toBe('inactive');
    expect(radios(g).map((r) => inner(r).getAttribute('tabindex'))).toEqual(['-1', '-1', '0']);
    expect(radios(g).map((r) => inner(r).getAttribute('aria-checked'))).toEqual(['false', 'false', 'true']);
    expect(inner(radios(g)[1]).getAttribute('aria-disabled')).toBe('true');
    const d = inner(radios(g)[2]).getAttribute('aria-describedby')!;
    expect(shadow(radios(g)[2], `#${d}`).textContent).toBe('Hidden from the store');
  });
  it('arrow keys move, select, skip disabled options and wrap', async () => {
    const g = await mount<CmRadioGroup>(markup); await settle(g);
    const changes: string[] = [];
    g.addEventListener('change', () => changes.push(g.value));
    key(radios(g)[2], 'ArrowDown'); await settle(g);
    expect(g.value).toBe('active');
    expect(radios(g)[0].matches(':focus')).toBe(true);
    key(radios(g)[0], 'ArrowRight'); await settle(g);
    expect(g.value).toBe('inactive');
    key(radios(g)[2], 'ArrowUp'); await settle(g);
    expect(g.value).toBe('active');
    expect(changes).toEqual(['active', 'inactive', 'active']);
    expect(radios(g).map((r) => inner(r).getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
  });
  it('selects on click and ignores disabled options', async () => {
    const g = await mount<CmRadioGroup>(markup); await settle(g);
    radios(g)[1].click(); await settle(g);
    expect(g.value).toBe('inactive');
    radios(g)[0].click(); await settle(g);
    expect(g.value).toBe('active');
    expect(radios(g)[0].checked).toBe(true);
    expect(radios(g)[2].checked).toBe(false);
  });
  it('submits the selected value, validates required and resets', async () => {
    const g = await mount<CmRadioGroup>(markup); await settle(g);
    const form = g.closest('form')!;
    expect(new FormData(form).get('status')).toBe('inactive');
    g.value = 'active'; await settle(g);
    expect(new FormData(form).get('status')).toBe('active');
    form.reset(); await settle(g);
    expect(g.value).toBe('inactive');
    g.value = ''; g.required = true; await settle(g);
    expect(g.checkValidity()).toBe(false);
    expect(new FormData(form).has('status')).toBe(false);
  });
  it('first enabled option is the tab stop when nothing is selected', async () => {
    const g = await mount<CmRadioGroup>('<cm-radio-group aria-label="Size"><cm-radio value="s" disabled label="S"></cm-radio><cm-radio value="m" label="M"></cm-radio></cm-radio-group>');
    await settle(g);
    expect(shadow(g, '[role=radiogroup]').getAttribute('aria-label')).toBe('Size');
    expect(radios(g).map((r) => inner(r).getAttribute('tabindex'))).toEqual(['-1', '0']);
    key(radios(g)[1], ' '); await settle(g);
    expect(g.value).toBe('m');
  });
});

describe('cm-toggle', () => {
  it('is a native switch, named by its label or aria-label', async () => {
    const el = await mount<CmToggle>('<cm-toggle label="Show on store" description="Visible in search"></cm-toggle>');
    const input = shadow(el, 'input') as HTMLInputElement;
    expect(input.type).toBe('checkbox');
    expect(input.getAttribute('role')).toBe('switch');
    expect(shadow(el, 'label').getAttribute('for')).toBe(input.id);
    expect(shadow(el, `#${input.getAttribute('aria-describedby')}`).textContent).toBe('Visible in search');
    const bare = await mount<CmToggle>('<cm-toggle aria-label="Visible"></cm-toggle>');
    expect(shadow(bare, 'input').getAttribute('aria-label')).toBe('Visible');
  });
  it('switches with Space and click, firing change', async () => {
    const el = await mount<CmToggle>('<cm-toggle label="Visible"></cm-toggle>');
    let fired = 0;
    el.addEventListener('change', () => fired++);
    el.focus();
    expect(el.matches(':focus')).toBe(true);
    (shadow(el, 'input') as HTMLInputElement).click(); await el.updateComplete;
    expect(el.checked).toBe(true);
    expect(el.hasAttribute('checked')).toBe(true);
    (shadow(el, 'label') as HTMLLabelElement).click(); await el.updateComplete;
    expect(el.checked).toBe(false);
    expect(fired).toBe(2);
  });
  it('submits its value when on and resets with the form', async () => {
    const el = await mount<CmToggle>('<form><cm-toggle name="visible" value="yes" checked></cm-toggle></form>');
    const form = el.closest('form')!;
    expect(new FormData(form).get('visible')).toBe('yes');
    el.checked = false; await el.updateComplete;
    expect(new FormData(form).has('visible')).toBe(false);
    form.reset(); await el.updateComplete;
    expect(el.checked).toBe(true);
  });
  it('does not switch while disabled', async () => {
    const el = await mount<CmToggle>('<cm-toggle label="Visible" disabled></cm-toggle>');
    (shadow(el, 'input') as HTMLInputElement).click(); await el.updateComplete;
    expect(el.checked).toBe(false);
  });
});

describe('cm-select', () => {
  const markup = `<form><cm-select name="customer" label="Customer" placeholder="Select customer">
    <option value="r">Robinson Mid Rao</option>
    <option value="r2">Robinson</option>
    <option value="x" disabled>Archived customer</option>
    <option value="m">Manjunath</option>
  </cm-select></form>`;
  const key = (el: CmSelect, k: string, extra: KeyboardEventInit = {}) =>
    shadow(el, '[role=combobox]').dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, composed: true, cancelable: true, ...extra }));
  const active = (el: CmSelect) => {
    const id = shadow(el, '[role=combobox]').getAttribute('aria-activedescendant');
    return id ? shadow(el, `#${id}`).textContent : null;
  };

  it('is a labelled combobox that controls a listbox', async () => {
    const el = await mount<CmSelect>(markup);
    const box = shadow(el, '[role=combobox]');
    expect(shadow(el, `#${box.getAttribute('aria-labelledby')}`).textContent).toContain('Customer');
    expect(box.getAttribute('aria-expanded')).toBe('false');
    expect(shadow(el, `#${box.getAttribute('aria-controls')}`).getAttribute('role')).toBe('listbox');
    expect(box.textContent).toContain('Select customer');
    expect(el.shadowRoot!.querySelectorAll('[role=option]').length).toBe(4);
  });
  it('opens with arrows, moves past disabled options, Home/End, Enter selects', async () => {
    const el = await mount<CmSelect>(markup);
    let changes = 0;
    el.addEventListener('change', () => changes++);
    key(el, 'ArrowDown'); await el.updateComplete;
    expect(el.open).toBe(true);
    expect(shadow(el, '[role=combobox]').getAttribute('aria-expanded')).toBe('true');
    expect(active(el)).toBe('Robinson Mid Rao');
    key(el, 'ArrowDown'); key(el, 'ArrowDown'); await el.updateComplete;
    expect(active(el)).toBe('Manjunath');
    key(el, 'Home'); await el.updateComplete;
    expect(active(el)).toBe('Robinson Mid Rao');
    key(el, 'End'); await el.updateComplete;
    key(el, 'Enter'); await el.updateComplete;
    expect(el.value).toBe('m');
    expect(el.open).toBe(false);
    expect(changes).toBe(1);
    expect(shadow(el, '[aria-selected=true]').textContent).toBe('Manjunath');
  });
  it('typeahead finds options by their first letters, and Escape closes without choosing', async () => {
    const el = await mount<CmSelect>(markup);
    key(el, 'm'); await el.updateComplete;
    expect(el.open).toBe(true);
    expect(active(el)).toBe('Manjunath');
    await new Promise((r) => setTimeout(r, 600));
    key(el, 'r'); await el.updateComplete;
    expect(active(el)).toBe('Robinson Mid Rao');
    key(el, 'r'); await el.updateComplete;
    expect(active(el)).toBe('Robinson');
    key(el, 'Escape'); await el.updateComplete;
    expect(el.open).toBe(false);
    expect(el.value).toBe('');
  });
  it('selects with the mouse and closes on outside click', async () => {
    const el = await mount<CmSelect>(markup);
    shadow(el, '[role=combobox]').click(); await el.updateComplete;
    expect(el.open).toBe(true);
    (el.shadowRoot!.querySelectorAll('[role=option]')[1] as HTMLElement).click(); await el.updateComplete;
    expect(el.value).toBe('r2');
    expect(el.open).toBe(false);
    (el.shadowRoot!.querySelectorAll('[role=option]')[2] as HTMLElement).click(); await el.updateComplete;
    expect(el.value).toBe('r2');
    shadow(el, '[role=combobox]').click(); await el.updateComplete;
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.open).toBe(false);
  });
  it('submits, validates required, honours <option selected> and resets', async () => {
    const el = await mount<CmSelect>('<form><cm-select name="s" label="Status" required><option value="a">Active</option><option value="i" selected>Inactive</option></cm-select></form>');
    const form = el.closest('form')!;
    expect(el.value).toBe('i');
    expect(new FormData(form).get('s')).toBe('i');
    el.value = ''; await el.updateComplete;
    expect(el.checkValidity()).toBe(false);
    form.reset(); await el.updateComplete;
    expect(el.value).toBe('i');
    expect(el.checkValidity()).toBe(true);
  });
  it('accepts an options property', async () => {
    const el = await mount<CmSelect>('<cm-select aria-label="Sort"></cm-select>');
    el.options = ['Newest', { value: 'old', label: 'Oldest' }]; await el.updateComplete;
    expect(shadow(el, '[role=combobox]').getAttribute('aria-label')).toBe('Sort');
    expect([...el.shadowRoot!.querySelectorAll('[role=option]')].map((o) => o.textContent)).toEqual(['Newest', 'Oldest']);
  });
});

describe('cm-search', () => {
  it('is a named search field; typing updates value and Enter fires cm-search', async () => {
    const el = await mount<CmSearch>('<cm-search label="Search orders" placeholder="Search something"></cm-search>');
    const input = shadow(el, 'input') as HTMLInputElement;
    expect(input.type).toBe('search');
    expect(input.getAttribute('aria-label')).toBe('Search orders');
    const queries: string[] = [];
    el.addEventListener('cm-search', (e) => queries.push((e as CustomEvent).detail.value));
    await userEvent.click(input);
    await userEvent.keyboard('kurta{Enter}');
    expect(el.value).toBe('kurta');
    expect(queries).toEqual(['kurta']);
  });
  it('clears with the button or Escape, firing input and change', async () => {
    const el = await mount<CmSearch>('<cm-search value="shirt"></cm-search>');
    const seen: string[] = [];
    el.addEventListener('input', () => seen.push('input'));
    el.addEventListener('change', () => seen.push('change'));
    (shadow(el, '.clear') as HTMLButtonElement).click(); await el.updateComplete;
    expect(el.value).toBe('');
    expect(seen).toEqual(['input', 'change']);
    expect(shadow(el, '.clear')).toBeNull();
    el.value = 'x'; await el.updateComplete;
    (shadow(el, 'input') as HTMLInputElement).focus();
    await userEvent.keyboard('{Escape}');
    expect(el.value).toBe('');
  });
  it('filter button fires cm-filter and announces the applied count', async () => {
    const el = await mount<CmSearch>('<cm-search filter filter-count="2"></cm-search>');
    let filters = 0;
    el.addEventListener('cm-filter', () => filters++);
    const btn = shadow(el, '.filter') as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('Filter (2 applied)');
    btn.click();
    expect(filters).toBe(1);
  });
  it('submits its value with the form', async () => {
    const el = await mount<CmSearch>('<form><cm-search name="q" value="saree"></cm-search></form>');
    expect(new FormData(el.closest('form')!).get('q')).toBe('saree');
  });
});

describe('cm-file-upload', () => {
  const file = (name: string, type: string, size = 10) => new File([new Uint8Array(size)], name, { type });
  const choose = (el: CmFileUpload, files: File[]) => {
    const input = shadow(el, 'input[type=file]') as HTMLInputElement;
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    input.files = dt.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  };

  it('wraps a native file input named by the label and prompt', async () => {
    const el = await mount<CmFileUpload>('<cm-file-upload label="Add product images" hint="max. file size 300 KB" accept="image/*"></cm-file-upload>');
    const input = shadow(el, 'input[type=file]') as HTMLInputElement;
    expect(input.accept).toBe('image/*');
    const name = input.getAttribute('aria-labelledby')!.split(' ').map((id) => shadow(el, `#${id}`).textContent).join(' ');
    expect(name).toBe('Add product images Drag files here or Browse');
    expect(shadow(el, `#${input.getAttribute('aria-describedby')}`).textContent).toContain('300 KB');
  });
  it('adds chosen files, shows thumbnails and fires change; multiple keeps adding', async () => {
    const el = await mount<CmFileUpload>('<cm-file-upload label="Images" multiple accept="image/*"></cm-file-upload>');
    let changes = 0;
    el.addEventListener('change', () => changes++);
    choose(el, [file('a.png', 'image/png')]); await el.updateComplete;
    choose(el, [file('b.jpg', 'image/jpeg')]); await el.updateComplete;
    expect(el.files.map((f) => f.name)).toEqual(['a.png', 'b.jpg']);
    expect(changes).toBe(2);
    expect([...el.shadowRoot!.querySelectorAll('img')].map((i) => i.alt)).toEqual(['a.png', 'b.jpg']);
    expect(shadow(el, '.zone.tile')).toBeTruthy();
  });
  it('refuses wrong types and oversize files with an announced message', async () => {
    const el = await mount<CmFileUpload>('<cm-file-upload accept="image/*,.pdf" max-size="100"></cm-file-upload>');
    const refused: string[] = [];
    el.addEventListener('cm-reject', (e) => refused.push(...(e as CustomEvent).detail.files.map((f: File) => f.name)));
    el.addFiles([file('notes.txt', 'text/plain'), file('big.png', 'image/png', 500), file('ok.pdf', 'application/pdf')]);
    await el.updateComplete;
    expect(refused).toEqual(['notes.txt', 'big.png']);
    expect(el.files.map((f) => f.name)).toEqual(['ok.pdf']);
    expect(shadow(el, '.msg').getAttribute('role')).toBe('alert');
    expect(shadow(el, '.msg').textContent).toContain('larger than');
  });
  it('remove buttons are named, remove the file and return focus to the input', async () => {
    const el = await mount<CmFileUpload>('<cm-file-upload label="Invoice"></cm-file-upload>');
    choose(el, [file('invoice.pdf', 'application/pdf')]); await el.updateComplete;
    expect(shadow(el, 'input[type=file]')).toBeNull();
    const btn = shadow(el, '.remove') as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('Remove invoice.pdf');
    btn.click(); await el.updateComplete; await el.updateComplete;
    expect(el.files).toEqual([]);
    expect(el.shadowRoot!.activeElement).toBe(shadow(el, 'input[type=file]'));
  });
  it('submits files with the form, validates required and resets', async () => {
    const el = await mount<CmFileUpload>('<form><cm-file-upload name="doc" required></cm-file-upload></form>');
    const form = el.closest('form')!;
    expect(el.checkValidity()).toBe(false);
    el.addFiles([file('gst.pdf', 'application/pdf')]); await el.updateComplete;
    expect(el.checkValidity()).toBe(true);
    expect((new FormData(form).get('doc') as File).name).toBe('gst.pdf');
    form.reset(); await el.updateComplete;
    expect(el.files).toEqual([]);
  });
});

describe('cm-option-group', () => {
  const markup = `<form><cm-option-group name="offer" label="Select offer type">
    <option value="orders">Orders over</option>
    <option value="categories" selected>Categories</option>
    <option value="product" disabled>Specific product</option>
    <option value="customers">Customer group</option>
  </cm-option-group></form>`;
  const radios = (el: CmOptionGroup) => [...el.shadowRoot!.querySelectorAll('[role=radio]')] as HTMLButtonElement[];

  it('is a labelled radiogroup with one tab stop on the selected option', async () => {
    const el = await mount<CmOptionGroup>(markup);
    const group = shadow(el, '[role=radiogroup]');
    expect(shadow(el, `#${group.getAttribute('aria-labelledby')}`).textContent).toBe('Select offer type');
    expect(el.value).toBe('categories');
    expect(radios(el).map((r) => r.tabIndex)).toEqual([-1, 0, -1, -1]);
    expect(radios(el).map((r) => r.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false', 'false']);
    expect(radios(el)[2].disabled).toBe(true);
  });
  it('arrow keys move and select, skipping disabled options and wrapping; Home/End jump', async () => {
    const el = await mount<CmOptionGroup>(markup);
    const seen: string[] = [];
    el.addEventListener('change', () => seen.push(el.value));
    el.focus();
    await userEvent.keyboard('{ArrowRight}'); await el.updateComplete;
    expect(el.value).toBe('customers');
    await userEvent.keyboard('{ArrowRight}'); await el.updateComplete;
    expect(el.value).toBe('orders');
    await userEvent.keyboard('{End}'); await el.updateComplete;
    expect(el.value).toBe('customers');
    expect(el.shadowRoot!.activeElement).toBe(radios(el)[3]);
    expect(seen).toEqual(['customers', 'orders', 'customers']);
    expect(radios(el).map((r) => r.tabIndex)).toEqual([-1, -1, -1, 0]);
  });
  it('selects on click, submits the value and resets', async () => {
    const el = await mount<CmOptionGroup>(markup);
    const form = el.closest('form')!;
    radios(el)[0].click(); await el.updateComplete;
    expect(new FormData(form).get('offer')).toBe('orders');
    form.reset(); await el.updateComplete;
    expect(el.value).toBe('categories');
  });
  it('validates required and accepts an options property', async () => {
    const el = await mount<CmOptionGroup>('<cm-option-group aria-label="Discount" required></cm-option-group>');
    el.options = ['Percentage', { value: 'flat', label: 'Flat amount' }]; await el.updateComplete;
    expect(shadow(el, '[role=radiogroup]').getAttribute('aria-label')).toBe('Discount');
    expect(el.checkValidity()).toBe(false);
    expect(radios(el).map((r) => r.tabIndex)).toEqual([0, -1]);
    await userEvent.click(radios(el)[1]); await el.updateComplete;
    expect(el.value).toBe('flat');
    expect(el.checkValidity()).toBe(true);
  });
});

describe('cm-tag', () => {
  it('shows text and no button unless removable', async () => {
    const el = await mount<CmTag>('<cm-tag>Cotton</cm-tag>');
    expect(el.textContent).toBe('Cotton');
    expect(shadow(el, 'button')).toBeNull();
  });
  it('remove button is named after the tag, reachable by keyboard, and fires cm-remove', async () => {
    const el = await mount<CmTag>('<cm-tag removable>Karnataka</cm-tag>');
    let removed = 0;
    el.addEventListener('cm-remove', () => removed++);
    const btn = shadow(el, 'button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('Remove Karnataka');
    // Keyboard-reachable: a native, enabled button in the tab order. (Safari's Tab key skips buttons unless the user
    // turns on "Press Tab to highlight each item", so the test focuses it rather than pressing Tab.)
    expect(btn.tabIndex).toBe(0);
    btn.focus();
    expect(el.shadowRoot!.activeElement).toBe(btn);
    await userEvent.keyboard('{Enter}');
    expect(removed).toBe(1);
  });
  it('uses remove-label and ignores presses while disabled', async () => {
    const el = await mount<CmTag>('<cm-tag removable remove-label="Remove filter: Paid" disabled>Paid</cm-tag>');
    let removed = 0;
    el.addEventListener('cm-remove', () => removed++);
    const btn = shadow(el, 'button') as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('Remove filter: Paid');
    btn.click();
    expect(removed).toBe(0);
  });
});

describe('cm-page-header', () => {
  it('renders breadcrumbs, the current page and an h1', async () => {
    const el = await mount<CmPageHeader>(`<cm-page-header heading="Add product" breadcrumbs='[{"label":"Dashboard","href":"/"},{"label":"Products","href":"/products"}]'></cm-page-header>`);
    const nav = shadow(el, 'nav');
    expect(nav.getAttribute('aria-label')).toBe('Breadcrumb');
    const links = [...nav.querySelectorAll('a')].map((a) => a.getAttribute('href'));
    expect(links).toEqual(['/', '/products']);
    expect(nav.querySelector('[aria-current="page"]')!.textContent).toBe('Add product');
    expect(shadow(el, 'h1').textContent!.trim()).toBe('Add product');
    expect(shadow(el, '.back').getAttribute('href')).toBe('/products');
    expect(shadow(el, '.back').getAttribute('aria-label')).toBe('Back to Products');
  });
  it('omits breadcrumbs when there are none', async () => {
    const el = await mount<CmPageHeader>('<cm-page-header heading="Orders"></cm-page-header>');
    expect(shadow(el, 'nav')).toBeNull();
    expect(shadow(el, '.back')).toBeNull();
  });
  it('fires cm-previous and cm-next from enabled arrows only', async () => {
    const el = await mount<CmPageHeader>('<cm-page-header heading="Order #1042" pagination has-next></cm-page-header>');
    const fired: string[] = [];
    el.addEventListener('cm-previous', () => fired.push('prev'));
    el.addEventListener('cm-next', () => fired.push('next'));
    const [prev, next] = el.shadowRoot!.querySelectorAll<HTMLButtonElement>('.arrow');
    expect(prev.disabled).toBe(true);
    expect(prev.getAttribute('aria-label')).toBe('Previous');
    prev.click(); next.click();
    expect(fired).toEqual(['next']);
  });
});

describe('cm-action-bar', () => {
  it('is a region named by its heading, with eyebrow and actions', async () => {
    const el = await mount<CmActionBar>('<cm-action-bar eyebrow="Add product" heading="Golden TR90 eyeglasses"><cm-button slot="actions">Save</cm-button></cm-action-bar>');
    const bar = shadow(el, '.bar');
    expect(bar.getAttribute('role')).toBe('region');
    expect(bar.getAttribute('aria-label')).toBe('Golden TR90 eyeglasses');
    expect(shadow(el, '.eyebrow').textContent!.trim()).toBe('Add product');
    expect(shadow(el, '.heading').hasAttribute('role')).toBe(false);
    expect(shadow(el, '.icon')).toBeNull();
  });
  it('announces critical messages as alerts with a warning icon', async () => {
    const el = await mount<CmActionBar>('<cm-action-bar tone="critical" heading="Choose a tax rate"></cm-action-bar>');
    expect(shadow(el, '.heading').getAttribute('role')).toBe('alert');
    expect(shadow(el, '.icon')).toBeTruthy();
    expect(shadow(el, '.eyebrow').hidden).toBe(true);
  });
  it('sticks to the bottom when sticky', async () => {
    const el = await mount<CmActionBar>('<cm-action-bar sticky heading="x"></cm-action-bar>');
    expect(getComputedStyle(el).position).toBe('sticky');
  });
});

describe('cm-save-bar', () => {
  it('is hidden until open, then shows the message in a status region', async () => {
    const el = await mount<CmSaveBar>('<cm-save-bar></cm-save-bar>');
    expect(getComputedStyle(el).display).toBe('none');
    el.open = true; await el.updateComplete;
    expect(getComputedStyle(el).display).toBe('block');
    expect(shadow(el, '.message').getAttribute('role')).toBe('status');
    expect(shadow(el, '.message').textContent).toBe('Unsaved changes');
  });
  it('fires cm-save and cm-discard, and blocks save while loading', async () => {
    const el = await mount<CmSaveBar>('<cm-save-bar open></cm-save-bar>');
    const fired: string[] = [];
    el.addEventListener('cm-save', () => fired.push('save'));
    el.addEventListener('cm-discard', () => fired.push('discard'));
    const [discard, save] = el.shadowRoot!.querySelectorAll('cm-button');
    (save as HTMLElement).click(); (discard as HTMLElement).click();
    el.loading = true; await el.updateComplete;
    (save as HTMLElement).click();
    expect(fired).toEqual(['save', 'discard']);
  });
  it('watches a form: opens on input, Discard resets, Save submits', async () => {
    document.body.innerHTML = '<form id="f"><input name="title" value="Mug"></form><cm-save-bar form="f"></cm-save-bar>';
    const form = document.querySelector('form')!;
    const el = document.querySelector('cm-save-bar') as CmSaveBar;
    await el.updateComplete; await new Promise((r) => setTimeout(r));
    const input = form.querySelector('input')!;
    await userEvent.type(input, 's');
    expect(el.open).toBe(true);
    let submitted = 0;
    form.addEventListener('submit', (e) => { e.preventDefault(); submitted++; });
    await el.updateComplete;
    const [discard, save] = el.shadowRoot!.querySelectorAll('cm-button');
    (save as HTMLElement).click();
    expect(submitted).toBe(1);
    (discard as HTMLElement).click();
    expect(input.value).toBe('Mug');
    expect(el.open).toBe(false);
  });
  it('leaves the form alone when cm-discard is cancelled', async () => {
    document.body.innerHTML = '<form id="g"><input name="t" value="A"></form><cm-save-bar form="g" open></cm-save-bar>';
    const el = document.querySelector('cm-save-bar') as CmSaveBar;
    await el.updateComplete; await new Promise((r) => setTimeout(r));
    const input = document.querySelector('input')!;
    input.value = 'B';
    el.addEventListener('cm-discard', (e) => e.preventDefault());
    (el.shadowRoot!.querySelector('cm-button') as HTMLElement).click();
    expect(input.value).toBe('B');
    expect(el.open).toBe(true);
  });
});

describe('cm-info-panel', () => {
  it('is a list only while it holds info items (not while loading)', async () => {
    const el = await mount<CmInfoPanel>('<cm-info-panel heading="Order"><div aria-busy="true">Loading</div></cm-info-panel>');
    await new Promise((r) => setTimeout(r));
    await el.updateComplete;
    expect(shadow(el, '.items').hasAttribute('role')).toBe(false);
    el.innerHTML = '<cm-info-item label="Order">#1001</cm-info-item>';
    await new Promise((r) => setTimeout(r));
    await el.updateComplete;
    expect(shadow(el, '.items').getAttribute('role')).toBe('list');
    expect(el.querySelector('cm-info-item')!.getAttribute('role')).toBe('listitem');
  });
  it('renders a heading, a list of items and half-width items', async () => {
    const el = await mount<CmInfoPanel>(`<cm-info-panel heading="Order details">
      <cm-info-item label="Ordered on">Mar 29, 2023</cm-info-item>
      <cm-info-item label="SKU" half>OD673892</cm-info-item>
      <cm-info-item label="Inventory" half>8202</cm-info-item>
    </cm-info-panel>`);
    expect(shadow(el, '[role="heading"]').textContent).toBe('Order details');
    expect(shadow(el, '.items').getAttribute('role')).toBe('list');
    const items = [...el.querySelectorAll<CmInfoItem>('cm-info-item')];
    await Promise.all(items.map((i) => i.updateComplete));
    expect(items.every((i) => i.getAttribute('role') === 'listitem')).toBe(true);
    expect(shadow(items[0], '.label').textContent).toBe('Ordered on');
    const w0 = items[0].getBoundingClientRect().width, w1 = items[1].getBoundingClientRect().width;
    expect(w1).toBeLessThan(w0 * 0.6);
    expect(items[1].getBoundingClientRect().top).toBe(items[2].getBoundingClientRect().top);
  });
  it('fires cm-action from the header action', async () => {
    const el = await mount<CmInfoPanel>('<cm-info-panel heading="Tags" action="Remove" action-label="Remove all tags"></cm-info-panel>');
    let n = 0;
    el.addEventListener('cm-action', () => n++);
    const btn = shadow(el, '.action');
    expect(btn.getAttribute('aria-label')).toBe('Remove all tags');
    btn.click();
    expect(n).toBe(1);
  });
});

describe('cm-accordion', () => {
  it('toggles with a button that controls a labelled region', async () => {
    const el = await mount<CmAccordion>('<cm-accordion heading="Found in 2 orders"><p>#NAYOD0736</p></cm-accordion>');
    const btn = shadow(el, 'button');
    const body = shadow(el, '.body');
    expect(shadow(el, '[role="heading"]').getAttribute('aria-level')).toBe('3');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(btn.getAttribute('aria-controls')).toBe(body.id);
    expect(body.getAttribute('aria-labelledby')).toBe(btn.id);
    expect(body.hidden).toBe(true);
    const states: boolean[] = [];
    el.addEventListener('cm-toggle', (e) => states.push((e as CustomEvent).detail.open));
    btn.click(); await el.updateComplete;
    expect(el.open).toBe(true);
    expect(el.hasAttribute('open')).toBe(true);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(body.hidden).toBe(false);
    btn.focus();
    await userEvent.keyboard('{Enter}'); await el.updateComplete;
    expect(states).toEqual([true, false]);
  });
  it('does not toggle when disabled', async () => {
    const el = await mount<CmAccordion>('<cm-accordion heading="x" disabled></cm-accordion>');
    el.toggle(); await el.updateComplete;
    expect(el.open).toBe(false);
    expect((shadow(el, 'button') as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('cm-empty-state', () => {
  it('renders a heading, a decorative circle and slotted actions', async () => {
    const el = await mount<CmEmptyState>('<cm-empty-state heading="No products found" heading-level="3"><cm-button slot="actions" variant="primary">Add product</cm-button></cm-empty-state>');
    const h = shadow(el, '[role="heading"]');
    expect(h.textContent).toBe('No products found');
    expect(h.getAttribute('aria-level')).toBe('3');
    expect(shadow(el, '.circle').getAttribute('aria-hidden')).toBe('true');
    expect(shadow(el, 'cm-icon')).toBeTruthy();
    expect(shadow(el, '.actions').hidden).toBe(false);
    expect(shadow(el, '.text').hidden).toBe(true);
  });
  it('uses an image URL with empty alt', async () => {
    const el = await mount<CmEmptyState>('<cm-empty-state heading="x" image="data:image/gif;base64,R0lGODlhAQABAAAAACw="></cm-empty-state>');
    expect(shadow(el, 'img').getAttribute('alt')).toBe('');
  });
});

describe('cm-skeleton', () => {
  it('is hidden from assistive technology and draws lines', async () => {
    const el = await mount<CmSkeleton>('<cm-skeleton lines="3"></cm-skeleton>');
    expect(el.getAttribute('aria-hidden')).toBe('true');
    const lines = el.shadowRoot!.querySelectorAll('.line');
    expect(lines.length).toBe(3);
    expect(lines[2].classList.contains('short')).toBe(true);
  });
  it('sizes thumbnails from Figma', async () => {
    const el = await mount<CmSkeleton>('<cm-skeleton variant="thumbnail" size="medium"></cm-skeleton>');
    expect(shadow(el, '.bone').getBoundingClientRect().width).toBe(40);
  });
});

describe('cm-skeleton-display', () => {
  it('announces loading once and hides the shapes', async () => {
    const el = await mount<CmSkeletonDisplay>('<cm-skeleton-display></cm-skeleton-display>');
    expect(shadow(el, '[role="status"]').textContent).toBe('Loading');
    expect(shadow(el, '.wrap').getAttribute('aria-busy')).toBe('true');
    expect(shadow(el, '.page').getAttribute('aria-hidden')).toBe('true');
    expect(el.shadowRoot!.querySelectorAll('.side .bone').length).toBe(5);
  });
  it('adds a navigation placeholder only when asked', async () => {
    const el = await mount<CmSkeletonDisplay>('<cm-skeleton-display layout="one-column"></cm-skeleton-display>');
    expect(shadow(el, '.nav')).toBeNull();
    el.navigation = true; await el.updateComplete;
    expect(shadow(el, '.nav')).toBeTruthy();
  });
});

describe('cm-comment', () => {
  it('shows time, text and author with a machine-readable date', async () => {
    const el = await mount<CmComment>('<cm-comment author="Robinson" datetime="2023-02-09T17:07" time="09-02-2023 05:07 PM">Order cancelled</cm-comment>');
    const t = shadow(el, 'time');
    expect(t.getAttribute('datetime')).toBe('2023-02-09T17:07');
    expect(t.textContent).toBe('09-02-2023 05:07 PM');
    expect(shadow(el, '[part="author"]').textContent).toContain('Robinson');
    expect(el.hasAttribute('role')).toBe(false);
  });
  it('formats datetime when no display time is given', async () => {
    const el = await mount<CmComment>('<cm-comment datetime="2023-02-09T17:07">x</cm-comment>');
    expect(shadow(el, 'time').textContent).toMatch(/2023/);
  });
});

describe('cm-comment-box', () => {
  it('posts trimmed text with cm-submit and clears the box', async () => {
    const el = await mount<CmCommentBox>('<cm-comment-box><cm-comment author="A">Hi</cm-comment></cm-comment-box>');
    const ta = shadow(el, 'textarea') as HTMLTextAreaElement;
    expect(ta.getAttribute('aria-label')).toBe('Add a comment');
    expect(el.querySelector('cm-comment')!.getAttribute('role')).toBe('listitem');
    let got = '';
    el.addEventListener('cm-submit', (e) => { got = (e as CustomEvent).detail.value; });
    await userEvent.click(ta);
    await userEvent.keyboard('  Called the customer  ');
    (shadow(el, 'cm-button') as HTMLElement).click();
    expect(got).toBe('Called the customer');
    await el.updateComplete;
    expect(ta.value).toBe('');
  });
  it('does not post empty text, and Ctrl+Enter posts', async () => {
    const el = await mount<CmCommentBox>('<cm-comment-box></cm-comment-box>');
    let n = 0;
    el.addEventListener('cm-submit', (e) => { n++; e.preventDefault(); });
    el.submit();
    expect(n).toBe(0);
    const ta = shadow(el, 'textarea') as HTMLTextAreaElement;
    await userEvent.click(ta);
    await userEvent.keyboard('Note{Control>}{Enter}{/Control}');
    expect(n).toBe(1);
    expect(ta.value).toBe('Note');
  });
});

describe('cm-smart-tips', () => {
  it('renders tips as links in a list and fires cm-tour', async () => {
    const el = await mount<CmSmartTips>(`<cm-smart-tips tour-heading="Take a tour">
      <cm-smart-tip heading="Shipping" href="/guides/shipping">Set up rates.</cm-smart-tip>
      <cm-smart-tip heading="Markets" href="https://example.com" target="_blank">Sell abroad.</cm-smart-tip>
    </cm-smart-tips>`);
    const tips = el.querySelectorAll<CmSmartTip>('cm-smart-tip');
    await tips[1].updateComplete;
    expect(tips[0].getAttribute('role')).toBe('listitem');
    expect(shadow(el, '[role="list"]')).toBeTruthy();
    const a = shadow(tips[1], 'a') as HTMLAnchorElement;
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    expect(a.textContent).toContain('opens in a new tab');
    let toured = false;
    el.addEventListener('cm-tour', () => { toured = true; });
    (shadow(el, 'cm-button') as HTMLElement).click();
    expect(toured).toBe(true);
  });
  it('has no tour banner by default', async () => {
    const el = await mount<CmSmartTips>('<cm-smart-tips></cm-smart-tips>');
    expect(shadow(el, '.tour')).toBeNull();
    expect(shadow(el, '[role="heading"]').textContent).toBe('Smart tips');
  });
});

describe('cm-pagination', () => {
  it('is a named navigation landmark with a live summary', async () => {
    const el = await mount<CmPagination>('<cm-pagination total="290" page="2" page-size="20" resource-name="products"></cm-pagination>');
    expect(shadow(el, 'nav').getAttribute('aria-label')).toBe('Pagination');
    expect(shadow(el, '[role="status"]').textContent).toBe('Showing 21–40 of 290 products');
    expect(el.pageCount).toBe(15);
    expect(shadow(el, '#' + shadow(el, 'input').getAttribute('aria-describedby')).textContent).toBe('of 15');
  });
  it('moves with the arrows, disables them at the ends and fires cm-page-change', async () => {
    const el = await mount<CmPagination>('<cm-pagination total="45" page-size="20"></cm-pagination>');
    const pages: number[] = [];
    el.addEventListener('cm-page-change', (e) => pages.push((e as CustomEvent).detail.page));
    const prev = shadow(el, '.prev') as HTMLButtonElement;
    const next = shadow(el, '.next') as HTMLButtonElement;
    expect(prev.disabled).toBe(true);
    next.click(); await el.updateComplete;
    next.click(); await el.updateComplete;
    expect(el.page).toBe(3);
    expect(next.disabled).toBe(true);
    expect(pages).toEqual([2, 3]);
  });
  it('jumps to a typed page on Enter, clamped to the page count', async () => {
    const el = await mount<CmPagination>('<cm-pagination total="100" page-size="10"></cm-pagination>');
    const input = shadow(el, 'input') as HTMLInputElement;
    input.focus();
    await userEvent.clear(input);
    await userEvent.keyboard('42{Enter}');
    await el.updateComplete;
    expect(el.page).toBe(10);
    expect(input.value).toBe('10');
  });
  it('changes rows per page and returns to page 1', async () => {
    const el = await mount<CmPagination>('<cm-pagination total="100" page="3" page-size="10" page-sizes="[10,25]"></cm-pagination>');
    let size = 0;
    el.addEventListener('cm-page-size-change', (e) => (size = (e as CustomEvent).detail.pageSize));
    const select = shadow(el, 'select') as HTMLSelectElement;
    expect([...select.options].map((o) => o.value)).toEqual(['10', '25']);
    select.value = '25';
    select.dispatchEvent(new Event('change'));
    await el.updateComplete;
    expect(size).toBe(25);
    expect(el.page).toBe(1);
    expect(el.pageCount).toBe(4);
  });
});

describe('cm-status-tabs', () => {
  it('renders option children as tabs with counts, first selected', async () => {
    const el = await mount<CmStatusTabs>(`<cm-status-tabs controls="orders">
      <option value="all" count="233">All</option><option value="open" count="23">Unprocessed</option><option value="x" disabled>Archived</option>
    </cm-status-tabs><div id="orders"></div>`);
    const tabs = [...el.shadowRoot!.querySelectorAll('[role="tab"]')] as HTMLButtonElement[];
    expect(shadow(el, '[role="tablist"]')).toBeTruthy();
    expect(tabs.map((t) => t.textContent!.replace(/\s+/g, ' ').trim())).toEqual(['All, 233', 'Unprocessed, 23', 'Archived']);
    // The count is a pill after the label (read after a hidden comma), not brackets.
    expect(tabs[0].querySelector('.count')!.textContent).toBe('233');
    expect(getComputedStyle(tabs[0].querySelector('.sr')!).position).toBe('absolute');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    // Linked by element reflection: an aria-controls id can't reach out of the shadow root.
    // Browsers without reflection (e.g. CI's Chromium) skip the link rather than break.
    if ('ariaControlsElements' in Element.prototype) expect((tabs[0] as any).ariaControlsElements).toEqual([document.getElementById('orders')]);
    expect(tabs.map((t) => t.tabIndex)).toEqual([0, -1, -1]);
  });
  it('arrow keys move and select, skipping disabled tabs, and fire change', async () => {
    const el = await mount<CmStatusTabs>('<cm-status-tabs><option value="a">A</option><option value="b" disabled>B</option><option value="c" selected>C</option></cm-status-tabs>');
    expect(el.value).toBe('c');
    let changes = 0;
    el.addEventListener('change', () => changes++);
    el.focus();
    await userEvent.keyboard('{ArrowRight}');
    await el.updateComplete;
    expect(el.value).toBe('a');
    await userEvent.keyboard('{End}');
    await el.updateComplete;
    expect(el.value).toBe('c');
    expect(changes).toBe(2);
    expect(el.shadowRoot!.activeElement?.textContent?.trim()).toBe('C');
  });
  it('accepts a tabs property', async () => {
    const el = await mount<CmStatusTabs>('<cm-status-tabs size="small"></cm-status-tabs>');
    el.tabs = [{ value: 'new', label: 'Newest', count: 1200 }, 'Highest rating'];
    await el.updateComplete;
    (el.shadowRoot!.querySelectorAll('button')[1] as HTMLButtonElement).click();
    await el.updateComplete;
    expect(el.value).toBe('Highest rating');
    expect(shadow(el, 'button').textContent).toContain('1,200');
  });
});

describe('cm-table-header', () => {
  it('renders a header row with column headers inside a table', async () => {
    document.body.innerHTML = `<div role="table" aria-label="Products"><cm-table-header sort="price" direction="descending">
      <option value="name">Product</option><option value="price" sortable align="end">Selling price</option><option hidden>Actions</option>
    </cm-table-header></div>`;
    const el = document.querySelector('cm-table-header') as CmTableHeader;
    await el.updateComplete;
    expect(shadow(el, '[role="row"]')).toBeTruthy();
    const cols = [...el.shadowRoot!.querySelectorAll('[role="columnheader"]')];
    expect(cols.length).toBe(3);
    expect(cols[1].getAttribute('aria-sort')).toBe('descending');
    expect(cols[0].hasAttribute('aria-sort')).toBe(false);
    expect(cols[2].querySelector('.sr')!.textContent).toBe('Actions');
  });
  it('is a plain bar outside a table, and sort buttons fire cm-sort with the next direction', async () => {
    const el = await mount<CmTableHeader>('<cm-table-header></cm-table-header>');
    el.columns = [{ key: 'stock', label: 'Stock', sortable: true }, 'Status'];
    await el.updateComplete;
    expect(shadow(el, '[role="row"]')).toBeNull();
    const dirs: string[] = [];
    el.addEventListener('cm-sort', (e) => dirs.push((e as CustomEvent).detail.direction));
    const btn = shadow(el, 'button');
    expect(btn.textContent).toContain('sortable');
    btn.click();
    el.sort = 'stock'; await el.updateComplete;
    expect(btn.textContent).toContain('sorted ascending');
    btn.click();
    expect(dirs).toEqual(['ascending', 'descending']);
  });
  it('select-all box fires cm-select-all and shows the mixed state', async () => {
    const el = await mount<CmTableHeader>('<cm-table-header selectable indeterminate><option>Product</option></cm-table-header>');
    const box = shadow(el, 'input') as HTMLInputElement;
    expect(box.getAttribute('aria-label')).toBe('Select all');
    expect(box.indeterminate).toBe(true);
    let checked: boolean | undefined;
    el.addEventListener('cm-select-all', (e) => (checked = (e as CustomEvent).detail.checked));
    box.click();
    await el.updateComplete;
    expect(checked).toBe(true);
    expect(el.indeterminate).toBe(false);
  });
});

describe('cm-resource-list', () => {
  it('keeps the loading spinner outside the list, and items carry a listitem role attribute', async () => {
    const el = await mount<CmResourceList>('<cm-resource-list loading><cm-resource-item value="a">A</cm-resource-item></cm-resource-list>');
    const list = shadow(el, '[role="list"]');
    expect(list.getAttribute('aria-busy')).toBe('true');
    expect(list.querySelector('[role="progressbar"]')).toBeNull();
    expect(shadow(el, '[role="progressbar"]').getAttribute('aria-label')).toBe('Loading items');
    expect(el.querySelector('cm-resource-item')!.getAttribute('role')).toBe('listitem');
  });
  const rows = `<cm-resource-item value="1">Black T-shirt</cm-resource-item>
    <cm-resource-item value="2" selected>White T-shirt</cm-resource-item>
    <cm-resource-item value="3">Green T-shirt</cm-resource-item>`;
  const items = (el: Element) => [...el.querySelectorAll('cm-resource-item')] as CmResourceItem[];
  it('is a named list of listitems; plain lists have no checkboxes', async () => {
    const el = await mount<CmResourceList>(`<cm-resource-list resource-name="product">${rows}</cm-resource-list>`);
    expect(shadow(el, '[role="list"]').getAttribute('aria-label')).toBe('Products');
    expect(shadow(el, '.toolbar')).toBeNull();
    await items(el)[0].updateComplete;
    expect(shadow(items(el)[0], 'input')).toBeNull();
  });
  it('offers this page, all matching and none from the select menu, without leaking its cm-select', async () => {
    const el = await mount<CmResourceList>(`<cm-resource-list selectable total="40" resource-name="product">${rows}</cm-resource-list>`);
    await el.updateComplete;
    const leaked: Event[] = [];
    document.addEventListener('cm-select', (e) => leaked.push(e));
    const menu = shadow(el, 'cm-action-menu') as HTMLElement & { items: { label: string; value: string }[]; updateComplete: Promise<unknown> };
    expect(menu.getAttribute('label')).toBe('Selection options');
    expect(menu.items.map((i) => i.label)).toEqual(['Select all 3 on this page', 'Select all 40 products', 'Select none']);
    const choose = (value: string) => menu.dispatchEvent(new CustomEvent('cm-select', { detail: { value }, bubbles: true, composed: true }));
    choose('all');
    await el.updateComplete;
    expect(el.allSelected).toBe(true);
    choose('none');
    await el.updateComplete;
    expect(el.selected).toEqual([]);
    expect(el.allSelected).toBe(false);
    choose('page');
    await el.updateComplete;
    expect(el.selected).toEqual(['1', '2', '3']);
    expect(leaked).toEqual([]);
    const plain = await mount<CmResourceList>(`<cm-resource-list selectable hide-select-menu>${rows}</cm-resource-list>`);
    expect(shadow(plain, 'cm-action-menu')).toBeNull();
  });
  it('sizes a cm-thumbnail in the media slot to the row (40px, 32px on phones)', async () => {
    const el = await mount<CmResourceList>(`<cm-resource-list><cm-resource-item value="1"><cm-thumbnail slot="media" alt=""></cm-thumbnail>Mug</cm-resource-item></cm-resource-list>`);
    const thumb = el.querySelector('cm-thumbnail') as HTMLElement & { updateComplete: Promise<unknown> };
    await thumb.updateComplete;
    const size = matchMedia('(max-width: 640px)').matches ? 32 : 40;
    expect(getComputedStyle(thumb).getPropertyValue('--cm-thumbnail-size').trim()).toBe(`${size}px`);
    expect(Math.round(thumb.getBoundingClientRect().width)).toBe(size);
  });
  it('ticks rows by checkbox or row click and reports the selection', async () => {
    const el = await mount<CmResourceList>(`<cm-resource-list selectable resource-name="product">${rows}</cm-resource-list>`);
    await el.updateComplete; await items(el)[0].updateComplete;
    const changes: string[][] = [];
    el.addEventListener('cm-selection-change', (e) => changes.push((e as CustomEvent).detail.selected));
    const box = shadow(items(el)[0], 'input') as HTMLInputElement;
    expect(box.getAttribute('aria-label')).toBe('Select Black T-shirt');
    box.click();
    shadow(items(el)[2], '.row').click();
    await el.updateComplete;
    expect(changes).toEqual([['1', '2'], ['1', '2', '3']]);
    expect(shadow(el, '[role="status"]').textContent!.trim()).toBe('3 products selected.');
  });
  it('select-all box selects the page, then offers every matching resource', async () => {
    const el = await mount<CmResourceList>(`<cm-resource-list selectable total="15000" resource-name="product">${rows}</cm-resource-list>`);
    await el.updateComplete;
    const all = shadow(el, '.select input') as HTMLInputElement;
    expect(all.indeterminate).toBe(true);
    expect(shadow(el, '.select label').textContent).toContain('all 3 products on this page');
    all.click();
    await el.updateComplete;
    expect(el.selected).toEqual(['1', '2', '3']);
    let detail: any;
    el.addEventListener('cm-selection-change', (e) => (detail = (e as CustomEvent).detail));
    const more = shadow(el, '.status button');
    expect(more.textContent).toBe('Select all 15,000 products');
    more.click();
    await el.updateComplete;
    expect(detail.all).toBe(true);
    expect(shadow(el, '.status').textContent).toContain('All 15,000 products selected.');
    shadow(el, '.status button').click();
    await el.updateComplete;
    expect(el.selected).toEqual([]);
    expect(el.allSelected).toBe(false);
  });
  it('shows bulk actions only with a selection, and marks loading as busy', async () => {
    const el = await mount<CmResourceList>(`<cm-resource-list selectable loading><cm-button slot="bulk-actions">Bulk orders</cm-button>${rows}</cm-resource-list>`);
    await el.updateComplete;
    expect((shadow(el, '.bulk') as HTMLElement).hidden).toBe(false);
    el.clearSelection(); await el.updateComplete;
    expect((shadow(el, '.bulk') as HTMLElement).hidden).toBe(true);
    expect(shadow(el, '[role="list"]').getAttribute('aria-busy')).toBe('true');
    expect(shadow(el, '[role="progressbar"]').getAttribute('aria-label')).toBe('Loading items');
  });
  it('linked rows are links and do not toggle on click', async () => {
    const el = await mount<CmResourceList>('<cm-resource-list selectable><cm-resource-item value="9" href="#p9" label="Mug">Mug, 12 in stock</cm-resource-item></cm-resource-list>');
    const item = items(el)[0];
    await item.updateComplete;
    const a = shadow(item, 'a') as HTMLAnchorElement;
    expect(a.getAttribute('href')).toBe('#p9');
    expect(a.textContent).toBe('Mug');
    shadow(item, '.row').click();
    expect(item.selected).toBe(false);
  });
});

describe('cm-nested-list', () => {
  const menu = `<cm-nested-list heading="Header" sortable>
    <cm-nested-item label="Home" value="home"></cm-nested-item>
    <cm-nested-item label="Shop" value="shop"><cm-nested-item label="Shoes" value="shoes"></cm-nested-item></cm-nested-item>
    <cm-nested-item label="About" value="about"></cm-nested-item>
  </cm-nested-list>`;
  const item = (el: Element, v: string) => el.querySelector(`[value="${v}"]`) as CmNestedItem;
  it('has a heading and nested lists; sortable adds named handles at every level', async () => {
    const el = await mount<CmNestedList>(menu);
    await item(el, 'shop').updateComplete; await item(el, 'shoes').updateComplete;
    expect(shadow(el, '[role="heading"]').getAttribute('aria-level')).toBe('2');
    expect(shadow(el, '[role="list"]').getAttribute('aria-labelledby')).toBe(shadow(el, '[role="heading"]').id);
    expect(shadow(item(el, 'shoes'), '.handle').getAttribute('aria-label')).toBe('Reorder Shoes');
    expect(shadow(item(el, 'shop'), '.children').classList.contains('has')).toBe(true);
    expect(shadow(item(el, 'home'), '.children').classList.contains('has')).toBe(false);
  });
  it('moves a row with the arrow keys and announces it', async () => {
    const el = await mount<CmNestedList>(menu);
    await item(el, 'home').updateComplete;
    const moves: number[][] = [];
    el.addEventListener('cm-reorder', (e) => moves.push([(e as CustomEvent).detail.from, (e as CustomEvent).detail.to]));
    shadow(item(el, 'home'), '.handle').focus();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{End}');
    expect([...el.children].map((c) => c.getAttribute('value'))).toEqual(['shop', 'about', 'home']);
    expect(moves).toEqual([[0, 1], [1, 2]]);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    await el.updateComplete;
    expect(shadow(el, '[role="status"]').textContent).toBe('Home moved to position 3 of 3.');
  });
  it('a cancelled cm-reorder keeps the order', async () => {
    const el = await mount<CmNestedList>(menu);
    el.addEventListener('cm-reorder', (e) => e.preventDefault());
    expect(item(el, 'about').moveTo(0)).toBe(false);
    expect(el.lastElementChild!.getAttribute('value')).toBe('about');
  });
  it('collapsible lists toggle with a named button', async () => {
    const el = await mount<CmNestedList>('<cm-nested-list heading="Footer" collapsible><cm-nested-item label="FAQ"></cm-nested-item></cm-nested-list>');
    const btn = shadow(el, '.toggle');
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(btn.getAttribute('aria-label')).toBe('Hide Footer');
    let open: boolean | undefined;
    el.addEventListener('cm-toggle', (e) => (open = (e as CustomEvent).detail.open));
    btn.click(); await el.updateComplete;
    expect(open).toBe(false);
    expect((shadow(el, '.rows') as HTMLElement).hidden).toBe(true);
    expect(shadow(item(el, 'x') ?? el.querySelector('cm-nested-item')!, '.handle')).toBeNull();
  });
});

describe('cm-report-tiles', () => {
  it('groups tiles in a named list; tiles are links or buttons', async () => {
    const el = await mount<CmReportTiles>(`<cm-report-tiles heading="Sales">
      <cm-report-tile label="Hourly sales" icon="clock" href="/reports/hourly" pinned></cm-report-tile>
      <cm-report-tile label="Sales by product"></cm-report-tile>
    </cm-report-tiles>`);
    const [a, b] = [...el.querySelectorAll('cm-report-tile')] as CmReportTile[];
    await a.updateComplete; await b.updateComplete;
    expect(shadow(el, '[role="heading"]').textContent).toBe('Sales');
    expect(shadow(el, '[role="list"]').getAttribute('aria-labelledby')).toBe('h');
    expect(a.getAttribute('role')).toBe('listitem');
    const link = shadow(a, 'a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/reports/hourly');
    expect(link.textContent!.replace(/\s+/g, ' ').trim()).toBe('Hourly sales , pinned');
    expect(shadow(b, 'button')).toBeTruthy();
    expect(shadow(b, '.pin')).toBeNull();
    let clicks = 0;
    b.addEventListener('click', () => clicks++);
    shadow(b, 'button').click();
    expect(clicks).toBe(1);
  });
});

describe('cm-side-navigation', () => {
  const markup = `<cm-side-navigation>
    <cm-nav-item label="Dashboard" icon="home" href="/" current></cm-nav-item>
    <cm-nav-item label="Catalog" icon="box">
      <cm-nav-item label="Products" href="/products"></cm-nav-item>
      <cm-nav-item label="Categories" href="/categories"></cm-nav-item>
    </cm-nav-item>
    <cm-nav-item label="Orders" icon="bag">
      <cm-nav-item label="All orders" href="/orders" current></cm-nav-item>
    </cm-nav-item>
    <cm-nav-item label="Apps" icon="apps" href="/apps" badge="New"></cm-nav-item>
  </cm-side-navigation>`;
  it('is a named nav landmark with links, the current page marked, and sections as disclosure buttons', async () => {
    const el = await mount<CmSideNavigation>(markup);
    expect(shadow(el, 'nav').getAttribute('aria-label')).toBe('Main');
    const links = [...el.shadowRoot!.querySelectorAll('a')];
    expect(links[0].getAttribute('href')).toBe('/');
    expect(links[0].getAttribute('aria-current')).toBe('page');
    const [catalog, orders] = [...el.shadowRoot!.querySelectorAll('button.parent')] as HTMLButtonElement[];
    expect(catalog.getAttribute('aria-expanded')).toBe('false');
    expect(el.shadowRoot!.getElementById(catalog.getAttribute('aria-controls')!)!.hidden).toBe(true);
    // A section holding the current page starts open.
    expect(orders.getAttribute('aria-expanded')).toBe('true');
    expect(shadow(el, '.badge').textContent).toBe('New');
  });
  it('Enter toggles a section, arrows move focus, Left returns to the parent, and cm-expand fires', async () => {
    const el = await mount<CmSideNavigation>(markup);
    const events: boolean[] = [];
    el.addEventListener('cm-expand', (e) => events.push((e as CustomEvent).detail.expanded));
    const catalog = shadow(el, 'button.parent');
    catalog.focus();
    await userEvent.keyboard('{Enter}');
    await el.updateComplete;
    expect(catalog.getAttribute('aria-expanded')).toBe('true');
    expect(events).toEqual([true]);
    await userEvent.keyboard('{ArrowDown}');
    expect(el.shadowRoot!.activeElement!.textContent!.trim()).toBe('Products');
    await userEvent.keyboard('{ArrowLeft}');
    expect(el.shadowRoot!.activeElement).toBe(catalog);
    await userEvent.keyboard('{ArrowLeft}');
    await el.updateComplete;
    expect(catalog.getAttribute('aria-expanded')).toBe('false');
    await userEvent.keyboard('{End}');
    expect(el.shadowRoot!.activeElement!.textContent!.trim()).toContain('Apps');
  });
  it('fires a cancelable cm-navigate and accepts an items property', async () => {
    const el = await mount<CmSideNavigation>('<cm-side-navigation label="Store"></cm-side-navigation>');
    el.items = [{ label: 'Reports', icon: 'chart', href: '#reports' }, { label: 'Settings', value: 'settings' }];
    await el.updateComplete;
    let got: any;
    el.addEventListener('cm-navigate', (e) => { got = (e as CustomEvent).detail; e.preventDefault(); });
    const before = location.hash;
    shadow(el, 'a').click();
    expect(got.value).toBe('#reports');
    expect(location.hash).toBe(before);
    (el.shadowRoot!.querySelectorAll('button')[0] as HTMLButtonElement).click();
    expect(got.value).toBe('settings');
    expect(shadow(el, 'nav').getAttribute('aria-label')).toBe('Store');
  });
});

describe('cm-header-bar', () => {
  it('names the store switcher, balance and user, and fires an event for each', async () => {
    const el = await mount<CmHeaderBar>(`<cm-header-bar store="preprod.commmerce.com" balance="₹ 2,312" user-name="Demo user">
      <img slot="logo" alt="Commmerce" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=">
      <cm-button slot="actions">Hire an Expert</cm-button>
    </cm-header-bar>`);
    const fired: string[] = [];
    ['cm-store-switch', 'cm-wallet', 'cm-account'].forEach((n) => el.addEventListener(n, () => fired.push(n)));
    const [store, wallet, user] = [...el.shadowRoot!.querySelectorAll('button')] as HTMLButtonElement[];
    expect(store.getAttribute('aria-label')).toBe('Store: preprod.commmerce.com. Switch store');
    expect(wallet.getAttribute('aria-label')).toBe('Wallet balance ₹ 2,312');
    expect(user.getAttribute('aria-label')).toBe('Account: Demo user');
    store.click(); wallet.click(); user.click();
    expect(fired).toEqual(['cm-store-switch', 'cm-wallet', 'cm-account']);
    expect(shadow(el, 'header').getAttribute('role')).toBe('banner');
  });
  it('hides parts that have no value and shows the avatar image', async () => {
    const el = await mount<CmHeaderBar>('<cm-header-bar user-name="Asha" avatar-src="data:image/gif;base64,R0lGODlhAQABAAAAACw="></cm-header-bar>');
    expect(el.shadowRoot!.querySelectorAll('button').length).toBe(1);
    const avatar = shadow(el, 'cm-avatar') as HTMLElement & { src: string; updateComplete: Promise<unknown> };
    await avatar.updateComplete;
    expect(avatar.src).toContain('data:image/gif');
    expect(avatar.shadowRoot!.querySelector('img')).toBeTruthy();
  });
});

describe('cm-bottom-navigation', () => {
  it('renders up to five links and buttons, marks the current one and the primary action', async () => {
    const el = await mount<CmBottomNavigation>(`<cm-bottom-navigation>
      <cm-nav-item label="Home" icon="home" href="/" current></cm-nav-item>
      <cm-nav-item label="Products" icon="box" href="/products"></cm-nav-item>
      <cm-nav-item label="Quick add" icon="plus" primary></cm-nav-item>
      <cm-nav-item label="Orders" icon="bag" href="/orders"></cm-nav-item>
      <cm-nav-item label="More" icon="more" value="more"></cm-nav-item>
      <cm-nav-item label="Sixth" href="/x"></cm-nav-item>
    </cm-bottom-navigation>`);
    expect(shadow(el, 'nav').getAttribute('aria-label')).toBe('Main');
    const items = [...el.shadowRoot!.querySelectorAll('.item')] as HTMLElement[];
    expect(items.length).toBe(5);
    expect(items[0].getAttribute('aria-current')).toBe('page');
    expect(items[2].classList.contains('primary')).toBe(true);
    expect(items[4].localName).toBe('button');
    let got = '';
    el.addEventListener('cm-navigate', (e) => { got = (e as CustomEvent).detail.value; });
    items[4].click();
    expect(got).toBe('more');
  });
});

describe('cm-mobile-menu', () => {
  const markup = `<cm-mobile-menu store="Obiroye Garments" user-name="Robinson Jain" user-email="r@example.com">
    <cm-nav-item label="Channels">
      <cm-nav-item label="Online store" icon="store" href="/store"></cm-nav-item>
      <cm-nav-item label="Add channel" primary value="add-channel"></cm-nav-item>
    </cm-nav-item>
    <cm-nav-item label="Panels">
      <cm-nav-item label="Application" icon="apps" href="/apps" badge="3 apps active"></cm-nav-item>
    </cm-nav-item>
    <cm-nav-item>
      <cm-nav-item label="Settings" icon="settings">
        <cm-nav-item label="Shipping" href="/settings/shipping"></cm-nav-item>
        <cm-nav-item label="Tax" href="/settings/tax"></cm-nav-item>
      </cm-nav-item>
    </cm-nav-item>
  </cm-mobile-menu>`;
  it('shows the profile and labelled sections; profile rows fire their events', async () => {
    const el = await mount<CmMobileMenu>(markup);
    const heads = [...el.shadowRoot!.querySelectorAll('h2')].map((h) => h.textContent);
    expect(heads).toEqual(['Profile', 'Channels', 'Panels']);
    expect(shadow(el, '.avatar').textContent!.trim()).toBe('R');
    const fired: string[] = [];
    el.addEventListener('cm-store-switch', () => fired.push('store'));
    el.addEventListener('cm-account', () => fired.push('account'));
    const rows = [...el.shadowRoot!.querySelectorAll('.row')] as HTMLElement[];
    rows[0].click(); rows[1].click();
    expect(fired).toEqual(['store', 'account']);
    expect(shadow(el, '.action').textContent).toBe('Add channel');
    expect(shadow(el, '.badge').textContent).toBe('3 apps active');
  });
  it('opens sub-items on a second screen, focuses Back, and Escape returns focus to the row', async () => {
    const el = await mount<CmMobileMenu>(markup);
    const settings = [...el.shadowRoot!.querySelectorAll('button.row')].find((b) => b.textContent!.includes('Settings')) as HTMLButtonElement;
    settings.click();
    await el.updateComplete; await el.updateComplete;
    const back = shadow(el, '.back');
    expect(back.textContent!.trim()).toBe('Settings');
    expect(el.shadowRoot!.activeElement).toBe(back);
    expect([...el.shadowRoot!.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual(['/settings/shipping', '/settings/tax']);
    await userEvent.keyboard('{Escape}');
    await el.updateComplete; await el.updateComplete;
    expect(el.shadowRoot!.activeElement!.textContent).toContain('Settings');
    expect(shadow(el, '.back')).toBeNull();
  });
});

describe('cm-flash-offer-bar', () => {
  it('is a named region with the message and its link', async () => {
    const el = await mount<CmFlashOfferBar>('<cm-flash-offer-bar>Publish your store - <a href="/plans">Click here</a> to pick a plan</cm-flash-offer-bar>');
    expect(shadow(el, '.bar').getAttribute('role')).toBe('region');
    expect(shadow(el, '.bar').getAttribute('aria-label')).toBe('Offer');
    expect(el.querySelector('a')!.getAttribute('href')).toBe('/plans');
    expect(shadow(el, '.close')).toBeNull();
  });
  it('dismisses itself unless cm-dismiss is cancelled', async () => {
    const el = await mount<CmFlashOfferBar>('<cm-flash-offer-bar dismissible>Sale</cm-flash-offer-bar>');
    let cancel = true;
    el.addEventListener('cm-dismiss', (e) => { if (cancel) e.preventDefault(); });
    const close = shadow(el, '.close');
    expect(close.getAttribute('aria-label')).toBe('Dismiss offer');
    close.click();
    expect(el.hidden).toBe(false);
    cancel = false;
    close.click();
    expect(el.hidden).toBe(true);
  });
});

describe('cm-link-tabs', () => {
  it('is a named nav of links with the current page marked; cm-navigate can take over routing', async () => {
    const el = await mount<CmLinkTabs>(`<cm-link-tabs label="Settings sections">
      <cm-nav-item label="General" href="#general" current></cm-nav-item>
      <cm-nav-item label="Payments" href="#payments"></cm-nav-item>
      <cm-nav-item label="Shipping" href="#shipping" badge="2"></cm-nav-item>
    </cm-link-tabs>`);
    expect(shadow(el, 'nav').getAttribute('aria-label')).toBe('Settings sections');
    const links = [...el.shadowRoot!.querySelectorAll('a')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['#general', '#payments', '#shipping']);
    expect(links[0].getAttribute('aria-current')).toBe('page');
    expect(links[1].hasAttribute('aria-current')).toBe(false);
    expect(links[2].textContent).toBe('Shipping(2)');
    let got = '';
    el.addEventListener('cm-navigate', (e) => { got = (e as CustomEvent).detail.href; e.preventDefault(); });
    const before = location.hash;
    links[1].click();
    expect(got).toBe('#payments');
    expect(location.hash).toBe(before);
  });
});

describe('cm-app-card', () => {
  it('is an article named by the app, with rating text, offer, actions and a named details link', async () => {
    const el = await mount<CmAppCard>(`<cm-app-card name="Cashfree Payments" developer="Appsell" rating="4.3" reviews="902" reviews-href="/apps/cashfree#reviews"
        pricing="Free plan available. 7-day free trial." offer="Bundle offer" href="/apps/cashfree">
      <img slot="logo" alt="Cashfree Payments" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=">
      <cm-button slot="actions" variant="primary">Sign Up</cm-button>
    </cm-app-card>`);
    expect(shadow(el, 'article').getAttribute('aria-labelledby')).toBe('name');
    const h = shadow(el, '[role="heading"]');
    expect(h.textContent).toBe('Cashfree Payments');
    expect(h.getAttribute('aria-level')).toBe('3');
    expect(shadow(el, '.by').textContent).toBe('By Appsell');
    expect(shadow(el, '.rating').textContent!.replace(/\s+/g, ' ')).toContain('Rated 4.3 out of 5');
    expect(shadow(el, '.rating a').textContent).toBe('902 Reviews');
    expect(shadow(el, '.offer').textContent).toContain('Offer: Bundle offer');
    const d = shadow(el, '.details') as HTMLAnchorElement;
    expect(d.getAttribute('href')).toBe('/apps/cashfree');
    expect(d.getAttribute('aria-label')).toBe('View details of Cashfree Payments');
  });
  it('leaves out what is not set', async () => {
    const el = await mount<CmAppCard>('<cm-app-card name="Fedex" heading-level="2"></cm-app-card>');
    expect(shadow(el, '.rating')).toBeNull();
    expect(shadow(el, '.offer')).toBeNull();
    expect(shadow(el, '.details')).toBeNull();
    expect(shadow(el, '[role="heading"]').getAttribute('aria-level')).toBe('2');
  });
});

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r(null)));
const deepActive = () => { let a = document.activeElement as Element | null; while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement; return a; };

describe('cm-modal', () => {
  it('opens as a modal dialog named by its heading, locks scrolling, and returns focus on close', async () => {
    document.body.innerHTML = `<button id="opener">Delete</button>
      <cm-modal heading="Delete product?" size="small"><p>This can't be undone.</p>
        <cm-button slot="footer">Cancel</cm-button><cm-button slot="footer" variant="primary">Delete</cm-button></cm-modal>`;
    const opener = document.getElementById('opener')!;
    const el = document.querySelector('cm-modal') as CmModal;
    opener.focus();
    let opened = 0; el.addEventListener('cm-open', () => opened++);
    el.show(); await el.updateComplete;
    const d = shadow(el, 'dialog') as HTMLDialogElement;
    expect(d.open).toBe(true);
    expect(d.matches(':modal')).toBe(true);
    expect(shadow(el, '#' + d.getAttribute('aria-labelledby')).textContent).toBe('Delete product?');
    expect(shadow(el, '.foot').hidden).toBe(false);
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(opened).toBe(1);
    expect(el.shadowRoot!.contains(deepActive())).toBe(true);
    el.close(); await el.updateComplete;
    expect(d.open).toBe(false);
    expect(document.documentElement.style.overflow).toBe('');
    expect(document.activeElement).toBe(opener);
  });
  it('Esc, the close button and the backdrop fire a cancelable cm-close with the reason', async () => {
    const el = await mount<CmModal>('<cm-modal heading="Edit" open><cm-text-field label="Name"></cm-text-field></cm-modal>');
    await nextFrame();
    const reasons: string[] = [];
    let keep = true;
    el.addEventListener('cm-close', (e) => { reasons.push((e as CustomEvent).detail.reason); if (keep) e.preventDefault(); });
    await userEvent.keyboard('{Escape}');
    await el.updateComplete;
    expect(el.open).toBe(true);
    shadow(el, '.x').click(); await el.updateComplete;
    expect(el.open).toBe(true);
    expect(shadow(el, '.x').getAttribute('aria-label')).toBe('Close');
    keep = false;
    const d = shadow(el, 'dialog');
    d.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    d.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 1, clientY: 1 }));
    await el.updateComplete;
    expect(reasons).toEqual(['escape', 'close-button', 'backdrop']);
    expect(el.open).toBe(false);
    expect((d as HTMLDialogElement).open).toBe(false);
  });
  it('keeps the rest of the page inert and focuses an autofocus child', async () => {
    document.body.innerHTML = `<button id="behind">Behind</button>
      <cm-modal heading="Rename" open><input id="name" autofocus></cm-modal>`;
    const el = document.querySelector('cm-modal') as CmModal;
    await el.updateComplete;
    expect(document.activeElement?.id).toBe('name');
    await userEvent.tab(); await userEvent.tab(); await userEvent.tab();
    expect(document.activeElement?.id).not.toBe('behind');
    expect(shadow(el, '.foot').hidden).toBe(true);
    el.close(); await el.updateComplete;
  });
});

describe('cm-side-panel', () => {
  it('opens at the right edge as a named modal dialog; Esc closes it and focus goes back', async () => {
    document.body.innerHTML = `<button id="opener">View</button>
      <cm-side-panel heading="Inquiry"><p>Robinson</p><cm-button slot="footer">Reply</cm-button></cm-side-panel>`;
    const opener = document.getElementById('opener')!;
    const el = document.querySelector('cm-side-panel') as CmSidePanel;
    opener.focus();
    el.open = true; await el.updateComplete; await nextFrame();
    const d = shadow(el, 'dialog') as HTMLDialogElement;
    expect(d.matches(':modal')).toBe(true);
    expect(d.getAttribute('aria-labelledby')).toBeTruthy();
    expect(shadow(el, 'h2').textContent).toBe('Inquiry');
    expect(shadow(el, '.foot').hidden).toBe(false);
    const r = d.getBoundingClientRect();
    expect(document.documentElement.clientWidth - Math.round(r.right)).toBeLessThanOrEqual(16); // flush right; 16px inset on phones
    let closed = 0; el.addEventListener('cm-closed', () => closed++);
    await userEvent.keyboard('{Escape}');
    await el.updateComplete;
    expect(el.open).toBe(false);
    expect(closed).toBe(1);
    expect(document.activeElement).toBe(opener);
    expect(document.documentElement.style.overflow).toBe('');
  });
});

describe('cm-filter-panel', () => {
  it('reads the form into cm-filter-apply, closes, and resets fields', async () => {
    const el = await mount<CmFilterPanel>(`<cm-filter-panel search open>
      <form>
        <cm-text-field label="Product name" name="name" value="Shirt"></cm-text-field>
        <cm-select label="Status" name="status" value="active"><option value="">Any</option><option value="active">Active</option></cm-select>
        <label><input type="checkbox" name="tag" value="new" checked> New</label>
        <label><input type="checkbox" name="tag" value="sale" checked> Sale</label>
      </form></cm-filter-panel>`);
    await nextFrame();
    expect(shadow(el, 'h2').textContent).toBe('Search and Filter');
    const search = shadow(el, 'cm-search') as any;
    expect(search).toBeTruthy();
    el.query = 'linen'; await el.updateComplete;
    let detail: any; let resets = 0;
    el.addEventListener('cm-filter-apply', (e) => { detail = (e as CustomEvent).detail; });
    el.addEventListener('cm-filter-reset', () => resets++);
    const [reset, apply] = Array.from(el.shadowRoot!.querySelectorAll('.foot cm-button')) as HTMLElement[];
    expect(apply.textContent).toBe('Search');
    expect(reset.textContent).toBe('Reset');
    apply.click(); await el.updateComplete;
    expect(detail).toEqual({ values: { name: 'Shirt', status: 'active', tag: ['new', 'sale'] }, query: 'linen' });
    expect(el.open).toBe(false);
    el.querySelectorAll('input').forEach((i) => { i.checked = false; });
    (el.querySelector('cm-text-field') as any).value = 'Jeans';
    reset.click(); await el.updateComplete;
    expect(resets).toBe(1);
    expect(el.values).toEqual({ name: 'Shirt', status: 'active', tag: ['new', 'sale'] });
    expect(el.query).toBe('');
  });
  it('stays open when cm-filter-apply is cancelled', async () => {
    const el = await mount<CmFilterPanel>('<cm-filter-panel open><form><input name="from" value="2026-11-01"></form></cm-filter-panel>');
    el.addEventListener('cm-filter-apply', (e) => e.preventDefault());
    (el.shadowRoot!.querySelectorAll('.foot cm-button')[1] as HTMLElement).click();
    await el.updateComplete;
    expect(el.open).toBe(true);
    expect(shadow(el, 'cm-search')).toBeNull();
    el.close(); await el.updateComplete;
  });
});

describe('cm-action-menu', () => {
  const markup = `<cm-action-menu label="Order actions">
      <cm-menu-item value="cancel">Cancel shipment</cm-menu-item>
      <cm-menu-item value="track">Change tracking info</cm-menu-item>
      <cm-menu-item disabled>Print label</cm-menu-item>
      <hr>
      <cm-menu-item value="delete" critical>Delete order</cm-menu-item>
    </cm-action-menu>`;
  it('is a menu button: ARIA state, arrow keys, Home/End, typeahead, skipped disabled items', async () => {
    const el = await mount<CmActionMenu>(markup);
    const trigger = shadow(el, '.trigger');
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(shadow(el, '.pop').hidden).toBe(true);
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    await el.updateComplete; await el.updateComplete;
    expect(el.open).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const menu = shadow(el, '[role=menu]');
    expect(menu.getAttribute('aria-label')).toBe('Order actions');
    expect(menu.querySelectorAll('[role=menuitem]').length).toBe(4);
    expect(menu.querySelector('[role=separator]')).toBeTruthy();
    const focused = () => el.shadowRoot!.activeElement?.textContent?.trim();
    expect(focused()).toBe('Cancel shipment');
    await userEvent.keyboard('{ArrowDown}'); await el.updateComplete;
    expect(focused()).toBe('Change tracking info');
    await userEvent.keyboard('{ArrowDown}'); await el.updateComplete;
    expect(focused()).toBe('Delete order');
    await userEvent.keyboard('{ArrowDown}'); await el.updateComplete;
    expect(focused()).toBe('Cancel shipment');
    await userEvent.keyboard('{End}'); await el.updateComplete;
    expect(focused()).toBe('Delete order');
    await userEvent.keyboard('c'); await el.updateComplete;
    expect(focused()).toBe('Cancel shipment');
    await userEvent.keyboard('{Escape}'); await el.updateComplete;
    expect(el.open).toBe(false);
    expect(el.shadowRoot!.activeElement).toBe(trigger);
  });
  it('fires cm-select with the value, closes and refocuses the trigger; disabled items do nothing', async () => {
    const el = await mount<CmActionMenu>(markup);
    const got: string[] = [];
    el.addEventListener('cm-select', (e) => got.push((e as CustomEvent).detail.value));
    el.show(); await el.updateComplete;
    (el.shadowRoot!.querySelector('[aria-disabled=true]') as HTMLElement).click();
    expect(got).toEqual([]);
    const items = el.shadowRoot!.querySelectorAll<HTMLElement>('[role=menuitem]');
    items[1].click(); await el.updateComplete;
    expect(got).toEqual(['track']);
    expect(el.open).toBe(false);
    expect(el.shadowRoot!.activeElement).toBe(shadow(el, '.trigger'));
  });
  it('closes on a click outside; supports a heading, icon-only and a custom trigger', async () => {
    document.body.innerHTML = `<p id="out">Outside</p>
      <cm-action-menu icon-only label="More actions" heading="Robinson Jain" subheading="robinson@example.com" align="end">
        <button slot="trigger" id="t">Account</button>
        <cm-menu-item>My profile</cm-menu-item><cm-menu-item href="#support">Support</cm-menu-item>
      </cm-action-menu>`;
    const el = document.querySelector('cm-action-menu') as CmActionMenu;
    await el.updateComplete;
    const t = document.getElementById('t')!;
    expect(t.getAttribute('aria-haspopup')).toBe('menu');
    t.click(); await el.updateComplete;
    expect(el.open).toBe(true);
    expect(t.getAttribute('aria-expanded')).toBe('true');
    expect(shadow(el, '.head').textContent).toContain('robinson@example.com');
    expect(shadow(el, '[role=menu]').getAttribute('aria-label')).toBe('Robinson Jain');
    expect((shadow(el, 'a[role=menuitem]') as HTMLAnchorElement).getAttribute('href')).toBe('#support');
    document.getElementById('out')!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.open).toBe(false);
    expect(t.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('cm-bottom-sheet', () => {
  it('is a named modal dialog with centred rows; choosing one fires cm-select and closes', async () => {
    document.body.innerHTML = `<button id="opener">More</button>
      <cm-bottom-sheet heading="Order actions">
        <cm-menu-item value="paid">Mark as paid order</cm-menu-item>
        <cm-menu-item value="invoice">Generate invoice</cm-menu-item>
        <cm-menu-item value="cancel" critical>Cancel order</cm-menu-item>
      </cm-bottom-sheet>`;
    const opener = document.getElementById('opener')!;
    const el = document.querySelector('cm-bottom-sheet') as CmBottomSheet;
    opener.focus();
    el.show(); await el.updateComplete;
    const d = shadow(el, 'dialog') as HTMLDialogElement;
    expect(d.matches(':modal')).toBe(true);
    expect(shadow(el, '#' + d.getAttribute('aria-labelledby')).textContent).toBe('Order actions');
    const rows = el.shadowRoot!.querySelectorAll<HTMLElement>('.row');
    expect(rows.length).toBe(3);
    expect(shadow(el, 'ul').classList.contains('icons')).toBe(false);
    expect(Math.round(d.getBoundingClientRect().bottom)).toBe(window.innerHeight);
    const got: string[] = []; const reasons: string[] = [];
    el.addEventListener('cm-select', (e) => got.push((e as CustomEvent).detail.value));
    el.addEventListener('cm-close', (e) => reasons.push((e as CustomEvent).detail.reason));
    rows[1].click(); await el.updateComplete;
    expect(got).toEqual(['invoice']);
    expect(reasons).toEqual(['action']);
    expect(el.open).toBe(false);
    expect(document.activeElement).toBe(opener);
  });
  it('lines up rows with icons and a chevron; the round close button closes it', async () => {
    const el = await mount<CmBottomSheet>(`<cm-bottom-sheet label="Shortcuts" open>
      <cm-menu-item icon="bag" href="#orders">Orders</cm-menu-item><cm-menu-item icon="plus">Add orders</cm-menu-item></cm-bottom-sheet>`);
    expect(shadow(el, 'dialog').getAttribute('aria-label')).toBe('Shortcuts');
    expect(shadow(el, 'ul').classList.contains('icons')).toBe(true);
    expect(shadow(el, 'a.row').getAttribute('href')).toBe('#orders');
    expect(el.shadowRoot!.querySelectorAll('cm-icon[name=chevron-right]').length).toBe(2);
    shadow(el, '.x').click(); await el.updateComplete;
    expect(el.open).toBe(false);
  });
});

describe('cm-notification-panel', () => {
  it('lists notifications with kind, time and unread state; choosing one fires cm-select and closes', async () => {
    document.body.innerHTML = `<button id="bell" aria-label="Notifications">bell</button>
      <cm-notification-panel more-href="/notifications">
        <cm-notification-item time="1 min ago" href="/orders/1042" unread>New order received</cm-notification-item>
        <cm-notification-item time="2 hrs ago" tone="attention">Product low stock</cm-notification-item>
        <cm-notification-item time="1 day ago" tone="critical" value="c1">Order cancelled</cm-notification-item>
      </cm-notification-panel>`;
    const bell = document.getElementById('bell')!;
    const el = document.querySelector('cm-notification-panel') as CmNotificationPanel;
    bell.focus();
    el.show(); await el.updateComplete;
    const d = shadow(el, 'dialog') as HTMLDialogElement;
    expect(d.matches(':modal')).toBe(true);
    expect(shadow(el, 'h2').textContent).toBe('Notifications');
    const rows = el.shadowRoot!.querySelectorAll<HTMLElement>('.row');
    expect(rows.length).toBe(3);
    expect(rows[0].localName).toBe('a');
    expect(rows[0].textContent).toContain('Unread: ');
    expect(rows[0].querySelector('time')!.textContent).toBe('1 min ago');
    expect(rows[1].querySelector('.ic')!.classList.contains('attention')).toBe(true);
    expect(shadow(el, '.more').getAttribute('href')).toBe('/notifications');
    const got: string[] = [];
    el.addEventListener('cm-select', (e) => { got.push((e as CustomEvent).detail.value); e.preventDefault(); });
    rows[0].click(); await el.updateComplete;
    expect(got).toEqual(['/orders/1042']);
    expect(el.open).toBe(true);
    await userEvent.keyboard('{Escape}'); await el.updateComplete;
    expect(el.open).toBe(false);
    expect(document.activeElement).toBe(bell);
  });
  it('says so when there are none', async () => {
    const el = await mount<CmNotificationPanel>('<cm-notification-panel open></cm-notification-panel>');
    expect(shadow(el, '.empty').textContent).toBe('No notifications yet.');
    expect(shadow(el, '.more')).toBeNull();
    el.close(); await el.updateComplete;
  });
});

describe('scrollbars', () => {
  it('scroll areas scroll without drawing a scrollbar', async () => {
    const el = await mount<CmLinkTabs>('<cm-link-tabs style="display:block;width:120px"><a href="#a">Overview</a><a href="#b">Orders</a><a href="#c">Customers</a></cm-link-tabs>');
    const list = el.shadowRoot!.querySelector('ul, [role], div') as HTMLElement;
    expect(getComputedStyle(list).scrollbarWidth).toBe('none');
    expect(getComputedStyle(el).scrollbarWidth).toBe('none');
  });
  it('keeps the page gutter while an overlay locks scrolling', async () => {
    const { lockScroll, unlockScroll } = await import('../src/overlay.js');
    const root = document.documentElement;
    lockScroll();
    expect(root.style.overflow).toBe('hidden');
    expect(root.style.scrollbarGutter).toBe(window.innerWidth - root.clientWidth > 0 ? 'stable' : '');
    unlockScroll();
    expect(root.style.overflow).toBe('');
    expect(root.style.scrollbarGutter).toBe('');
  });
});
