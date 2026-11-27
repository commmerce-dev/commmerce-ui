import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import '@commmerce/tokens/tokens.css';
import '../src/index.js';
import type { CmAppFrame, CmSideNavigation, CmTooltip } from '../src/index.js';

const frames = (n = 2) => new Promise((r) => { const f = () => (--n ? requestAnimationFrame(f) : r(null)); requestAnimationFrame(f); });
const shadow = (el: Element, sel: string) => el.shadowRoot!.querySelector(sel) as HTMLElement;
const rect = (el: Element) => el.getBoundingClientRect();

const items = (n = 0) => Array.from({ length: n }, (_, i) => `<cm-nav-item label="Extra ${i + 1}" icon="box" href="#x${i}"></cm-nav-item>`).join('');
const markup = (attrs = '', navAttrs = '', extra = 0, pageHeight = 2400) => `
<cm-app-frame ${attrs}>
  <cm-header-bar slot="header" store="preprod.commmerce.com" user-name="Asha Rao"></cm-header-bar>
  <cm-side-navigation slot="navigation" ${navAttrs}>
    <cm-nav-item label="Dashboard" icon="home" href="#dashboard" current></cm-nav-item>
    <cm-nav-item label="Orders" icon="bag" href="#orders" badge="12"></cm-nav-item>
    <cm-nav-item label="Apps" icon="apps" href="#apps" badge="New"></cm-nav-item>
    <cm-nav-item label="Settings" icon="settings">
      <cm-nav-item label="Store details" href="#store"></cm-nav-item>
      <cm-nav-item label="Payments" href="#payments"></cm-nav-item>
    </cm-nav-item>
    ${items(extra)}
  </cm-side-navigation>
  <cm-page><div id="content" style="height:${pageHeight}px">Orders</div></cm-page>
  <cm-bottom-navigation slot="bottom-navigation">
    <cm-nav-item label="Home" icon="home" href="#home" current></cm-nav-item>
    <cm-nav-item label="Orders" icon="bag" href="#orders"></cm-nav-item>
    <cm-nav-item label="More" icon="more" value="more"></cm-nav-item>
  </cm-bottom-navigation>
  <cm-mobile-menu slot="mobile-menu" store="Obiroye Garments" user-name="Robinson Jain">
    <cm-nav-item label="Panels">
      <cm-nav-item label="Customers" icon="users" href="#customers"></cm-nav-item>
      <cm-nav-item label="Reports" icon="chart" href="#reports"></cm-nav-item>
    </cm-nav-item>
  </cm-mobile-menu>
</cm-app-frame>`;

const mount = async (html: string, dir = 'ltr') => {
  document.body.innerHTML = `<div dir="${dir}">${html}</div>`;
  const el = document.querySelector('cm-app-frame') as CmAppFrame;
  await el.updateComplete;
  await Promise.all([...el.querySelectorAll('*')].map((c) => (c as any).updateComplete));
  await frames();
  return el;
};
const sideNav = (el: CmAppFrame) => el.querySelector('cm-side-navigation') as CmSideNavigation;
const bottomNav = (el: CmAppFrame) => el.querySelector('cm-bottom-navigation') as HTMLElement;
const visible = (el: Element) => rect(el).width > 0 && rect(el).height > 0;

beforeAll(async () => {
  const end = Date.now() + 10_000;
  while (!getComputedStyle(document.documentElement).getPropertyValue('--cm-space-20') && Date.now() < end) {
    await new Promise((r) => setTimeout(r, 20));
  }
  document.body.style.margin = '0';
});
beforeEach(() => { document.body.innerHTML = ''; scrollTo(0, 0); });
afterAll(async () => { document.body.style.margin = ''; await page.viewport(414, 896); });

describe('cm-app-frame at 1440px', () => {
  beforeEach(async () => { await page.viewport(1440, 900); });

  it('shows the side navigation at the start under the header, hides the bottom navigation and the menu', async () => {
    const el = await mount(markup());
    expect(el.wide).toBe(true);
    const header = el.querySelector('cm-header-bar')!, nav = sideNav(el), main = shadow(el, 'main');
    expect(visible(nav)).toBe(true);
    expect(visible(bottomNav(el))).toBe(false);
    expect(visible(el.querySelector('cm-mobile-menu')!)).toBe(false);
    expect(Math.round(rect(header).top)).toBe(0);
    expect(Math.round(rect(header).width)).toBe(1440);
    expect(Math.round(rect(nav).top)).toBe(Math.round(rect(header).bottom) + 20);
    expect(Math.round(rect(nav).left)).toBe(20);
    expect(Math.round(rect(nav).width)).toBe(220); // owner standard (1.6): 220px
    expect(Math.round(rect(main).left)).toBe(240);
    expect(Math.round(rect(main).right)).toBe(1440);
    expect(getComputedStyle(main).paddingBottom).toBe('0px');
  });

  it('keeps the header and side navigation in place while the page scrolls with the window', async () => {
    const el = await mount(markup());
    const header = el.querySelector('cm-header-bar')!, nav = sideNav(el);
    const navTop = rect(nav).top, contentTop = rect(el.querySelector('#content')!).top;
    scrollTo(0, 800); await frames();
    expect(scrollY).toBe(800);
    expect(Math.round(rect(header).top)).toBe(0);
    // Sticky under the header: never under it, never scrolled away.
    expect(rect(nav).top).toBeGreaterThanOrEqual(rect(header).bottom - 1);
    expect(rect(nav).top).toBeLessThanOrEqual(navTop);
    expect(Math.round(rect(el.querySelector('#content')!).top)).toBe(Math.round(contentTop - 800));
  });

  it('lets a side navigation taller than the window scroll on its own', async () => {
    const el = await mount(markup('', '', 30));
    const box = shadow(el, '.nav'), header = el.querySelector('cm-header-bar')!;
    expect(Math.round(rect(box).height)).toBe(Math.round(900 - rect(header).height));
    expect(box.scrollHeight).toBeGreaterThan(box.clientHeight);
    expect(getComputedStyle(box).overflowY).toBe('auto');
    box.scrollTop = 200;
    expect(box.scrollTop).toBe(200);
    expect(scrollY).toBe(0);
  });

  it('adds one main landmark and leaves banner and navigation to the children', async () => {
    const el = await mount(markup());
    expect(el.shadowRoot!.querySelectorAll('main').length).toBe(1);
    expect(el.shadowRoot!.querySelectorAll('header, nav, [role]').length).toBe(0);
    expect(shadow(el.querySelector('cm-header-bar')!, '[role="banner"]')).toBeTruthy();
    expect(shadow(sideNav(el), 'nav')).toBeTruthy();
    // The page is inside main.
    const slot = shadow(el, 'main slot') as HTMLSlotElement;
    expect(slot.assignedElements()[0].localName).toBe('cm-page');
  });

  it('narrows its grid to the collapsed side navigation', async () => {
    const el = await mount(markup('', 'collapsed'));
    const nav = sideNav(el), main = shadow(el, 'main');
    expect(Math.round(rect(nav).width)).toBe(72);
    expect(Math.round(rect(main).left)).toBe(92);
    nav.collapsed = false; await nav.updateComplete; await frames();
    expect(Math.round(rect(main).left)).toBe(240);
  });

  it('puts the side navigation on the right in RTL', async () => {
    const el = await mount(markup(), 'rtl');
    const nav = sideNav(el), main = shadow(el, 'main');
    expect(Math.round(rect(nav).right)).toBe(1420);
    expect(Math.round(rect(main).left)).toBe(0);
    expect(Math.round(rect(main).right)).toBe(1200);
  });

  it('ignores menu-open on a wide frame', async () => {
    const el = await mount(markup('menu-open'));
    expect(document.documentElement.style.overflow).toBe(''); // no scroll lock either
    expect(visible(el.querySelector('cm-mobile-menu')!)).toBe(false);
    expect(shadow(el, 'main').inert).toBe(false);
  });
});

describe('cm-app-frame at 390px', () => {
  beforeEach(async () => { await page.viewport(390, 844); });

  it('shows the bottom navigation fixed to the bottom of the window and pads the page for it', async () => {
    const el = await mount(markup());
    expect(el.wide).toBe(false);
    const bar = bottomNav(el), main = shadow(el, 'main');
    expect(visible(sideNav(el))).toBe(false);
    expect(visible(bar)).toBe(true);
    expect(Math.round(rect(bar).bottom)).toBe(844);
    expect(Math.round(rect(bar).width)).toBe(390);
    expect(parseFloat(getComputedStyle(main).paddingBottom)).toBe(Math.round(rect(bar).height));
    scrollTo(0, 100000); await frames();
    // At the end of the page, the last content sits above the bar.
    expect(rect(el.querySelector('#content')!).bottom).toBeLessThanOrEqual(rect(bar).top + 1);
    expect(Math.round(rect(bar).bottom)).toBe(844);
    expect(Math.round(rect(el.querySelector('cm-header-bar')!).top)).toBe(0);
  });

  it('overrides the bottom navigation\'s own fixed attribute', async () => {
    const el = await mount(markup().replace('<cm-bottom-navigation slot="bottom-navigation"', '<cm-bottom-navigation slot="bottom-navigation" fixed'));
    expect(getComputedStyle(bottomNav(el)).position).toBe('static');
    expect(Math.round(rect(bottomNav(el)).bottom)).toBe(844);
  });

  it('shows the mobile menu as a full-screen layer above the page and below the bottom navigation', async () => {
    const el = await mount(markup());
    el.menuOpen = true; await el.updateComplete; await frames();
    const menu = el.querySelector('cm-mobile-menu')!, layer = shadow(el, '.menu'), bar = bottomNav(el);
    expect(visible(menu)).toBe(true);
    const r = rect(layer);
    expect([r.top, r.left, r.width, r.height].map(Math.round)).toEqual([0, 0, 390, 844]);
    // The bar is on top of the layer; the layer is on top of the header and the page.
    const atBar = document.elementFromPoint(195, rect(bar).top + 20)!;
    expect(atBar).toBe(bar);
    expect(document.elementFromPoint(195, 30)).toBe(menu);
    expect(shadow(el, 'main').inert).toBe(true);
    expect(shadow(el, '.header').inert).toBe(true);
    expect(parseFloat(getComputedStyle(layer).paddingBottom)).toBe(Math.round(rect(bar).height));
  });

  it('without menu-item, More only fires cm-navigate and the app opens the menu', async () => {
    const el = await mount(markup());
    let value = '';
    el.addEventListener('cm-navigate', (e) => { value = (e as CustomEvent).detail.value; });
    (bottomNav(el).shadowRoot!.querySelectorAll('.item')[2] as HTMLElement).click();
    await el.updateComplete;
    expect(value).toBe('more');
    expect(el.menuOpen).toBe(false);
  });

  it('with menu-item, More opens and closes the menu, moves focus in and back, and Escape closes it', async () => {
    const el = await mount(markup('menu-item="more"'));
    const toggles: boolean[] = [];
    el.addEventListener('cm-menu-toggle', (e) => toggles.push((e as CustomEvent).detail.open));
    const more = bottomNav(el).shadowRoot!.querySelectorAll('.item')[2] as HTMLElement;
    more.focus();
    more.click();
    await el.updateComplete; await el.updateComplete;
    expect(el.menuOpen).toBe(true);
    expect(el.hasAttribute('menu-open')).toBe(true);
    const menu = el.querySelector('cm-mobile-menu')!;
    expect(menu.shadowRoot!.activeElement).toBeTruthy();
    await userEvent.keyboard('{Escape}');
    await el.updateComplete; await el.updateComplete;
    expect(el.menuOpen).toBe(false);
    expect(bottomNav(el).shadowRoot!.activeElement).toBe(more);
    more.click(); await el.updateComplete;
    more.click(); await el.updateComplete;
    expect(toggles).toEqual([true, false, true, false]);
  });

  it('with menu-item, More shows as the current tab and expanded while the menu is open', async () => {
    const el = await mount(markup('menu-item="more"'));
    const nav = bottomNav(el);
    const tabs = () => [...nav.shadowRoot!.querySelectorAll('.item')] as HTMLElement[];
    await nav.updateComplete;
    const more = tabs()[2];
    const pageTab = tabs().find((i) => i.getAttribute('aria-current') === 'page')!;
    expect(more.getAttribute('aria-expanded')).toBe('false');
    expect(pageTab.classList.contains('on')).toBe(true);
    el.openMenu(); await el.updateComplete; await nav.updateComplete;
    expect(tabs()[2].classList.contains('on')).toBe(true);
    expect(tabs()[2].getAttribute('aria-expanded')).toBe('true');
    expect(getComputedStyle(tabs()[2]).fontWeight).toBe('600');
    expect(tabs().filter((i) => i.classList.contains('on'))).toHaveLength(1);
    expect(pageTab.getAttribute('aria-current')).toBe('page');
    el.closeMenu(); await el.updateComplete; await nav.updateComplete;
    expect(tabs()[2].classList.contains('on')).toBe(false);
    expect(tabs()[2].getAttribute('aria-expanded')).toBe('false');
    expect(pageTab.classList.contains('on')).toBe(true);
  });

  it('with menu-item, choosing a row in the menu or another tab closes the menu', async () => {
    const el = await mount(markup('menu-item="more"'));
    el.addEventListener('cm-navigate', (e) => e.preventDefault());
    el.openMenu(); await el.updateComplete;
    (el.querySelector('cm-mobile-menu')!.shadowRoot!.querySelector('a[href="#customers"]') as HTMLElement).click();
    await el.updateComplete;
    expect(el.menuOpen).toBe(false);
    el.openMenu(); await el.updateComplete;
    (bottomNav(el).shadowRoot!.querySelector('a[href="#orders"]') as HTMLElement).click();
    await el.updateComplete;
    expect(el.menuOpen).toBe(false);
  });

  it('stops the page behind the open mobile menu from scrolling, and lets it scroll again when the menu closes', async () => {
    const el = await mount(markup('menu-item="more"'));
    const root = document.documentElement;
    scrollTo(0, 300); await frames();
    expect(Math.round(scrollY)).toBe(300);
    el.openMenu(); await el.updateComplete; await frames();
    // Locked: wheel, touch and keys can't scroll the page (overflow: hidden; scripts still can, so don't test with scrollBy).
    expect(getComputedStyle(root).overflowY).toBe('hidden');
    expect(Math.round(scrollY)).toBe(300); // locking doesn't move the page
    el.closeMenu(); await el.updateComplete; await frames();
    expect(root.style.overflow).toBe('');
    expect(Math.round(scrollY)).toBe(300); // nothing jumps when it unlocks
    scrollBy(0, 200); await frames();
    expect(Math.round(scrollY)).toBe(500);
  });

  it('releases the scroll lock when the frame widens past 1024px or leaves the page, and relocks when it narrows', async () => {
    const el = await mount(markup('menu-open'));
    const root = document.documentElement;
    expect(root.style.overflow).toBe('hidden');
    await page.viewport(1024, 800); await frames(3); await el.updateComplete;
    expect(el.wide).toBe(true);
    expect(root.style.overflow).toBe(''); // the menu isn't shown on a wide frame, so the page scrolls
    await page.viewport(390, 844); await frames(3); await el.updateComplete;
    expect(root.style.overflow).toBe('hidden');
    el.remove();
    expect(root.style.overflow).toBe('');
  });

  it('does not lock the page without a mobile menu', async () => {
    await mount(markup('menu-open').replace(/<cm-mobile-menu[\s\S]*<\/cm-mobile-menu>/, ''));
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('switches layout when the window crosses 1024px', async () => {
    const el = await mount(markup());
    expect(el.wide).toBe(false);
    await page.viewport(1024, 800); await frames(3); await el.updateComplete;
    expect(el.wide).toBe(true);
    expect(visible(sideNav(el))).toBe(true);
    expect(visible(bottomNav(el))).toBe(false);
    await page.viewport(1023, 800); await frames(3); await el.updateComplete;
    expect(el.wide).toBe(false);
  });
});

describe('cm-side-navigation collapsed', () => {
  beforeEach(async () => { await page.viewport(1440, 900); });
  const mountNav = async (attrs = 'collapsed') => {
    document.body.innerHTML = `<cm-side-navigation ${attrs}>
      <cm-nav-item label="Dashboard" icon="home" href="#dashboard" current></cm-nav-item>
      <cm-nav-item label="Orders" icon="bag" href="#orders" badge="12"></cm-nav-item>
      <cm-nav-item label="Apps" icon="apps" href="#apps" badge="New"></cm-nav-item>
      <cm-nav-item label="Reports" href="#reports"></cm-nav-item>
      <cm-nav-item label="Settings" icon="settings">
        <cm-nav-item label="Store details" href="#store"></cm-nav-item>
      </cm-nav-item>
    </cm-side-navigation>`;
    const el = document.querySelector('cm-side-navigation') as CmSideNavigation;
    await el.updateComplete;
    await Promise.all([...el.shadowRoot!.querySelectorAll('cm-tooltip, cm-icon')].map((c) => (c as any).updateComplete));
    return el;
  };
  const links = (el: CmSideNavigation) => [...el.shadowRoot!.querySelectorAll<HTMLElement>('.item')].filter((x) => !x.closest('[hidden]'));

  it('is a 72px rail of icons whose labels are still the accessible names', async () => {
    const el = await mountNav();
    expect(Math.round(rect(el).width)).toBe(72);
    const [dash, orders, apps, reports, settings] = links(el);
    for (const l of [dash, orders, apps, reports, settings]) {
      expect(rect(l).width).toBeLessThanOrEqual(56);
      // 40px rows (control-height-lg); 44px on touch screens.
      expect(rect(l).height).toBeGreaterThanOrEqual(matchMedia('(pointer: coarse)').matches ? 44 : 40);
      // No visible label: only the visually hidden text.
      expect(l.querySelector('.label')).toBeNull();
      expect(l.getAttribute('aria-describedby')).toBeNull();
    }
    expect(dash.querySelector('.sr')!.textContent).toBe('Dashboard');
    expect(orders.querySelector('.sr')!.textContent).toBe('Orders (12)');
    expect(dash.getAttribute('aria-current')).toBe('page');
    // An item without an icon shows its first letter, hidden from screen readers.
    expect(reports.querySelector('.initial')!.textContent).toBe('R');
    expect(reports.querySelector('.initial')!.getAttribute('aria-hidden')).toBe('true');
    expect(settings.querySelector('.chev')).toBeNull();
    // Icons keep the menu's grey (the tooltip wrapper must not reset the colour to black).
    const nav = shadow(el, 'nav');
    expect(getComputedStyle(orders).color).toBe(getComputedStyle(nav).color);
    expect(getComputedStyle(orders.querySelector('cm-icon')!).color).toBe(getComputedStyle(nav).color);
    expect(el.shadowRoot!.querySelector('.sub')!.hasAttribute('hidden')).toBe(true);
  });

  it('shows badges as a small count or a dot', async () => {
    const el = await mountNav();
    const [, orders, apps] = links(el);
    const count = orders.querySelector('.dot')!, dot = apps.querySelector('.dot')!;
    expect(count.classList.contains('count')).toBe(true);
    expect(count.textContent).toBe('12');
    expect(dot.textContent).toBe('');
    expect(visible(dot)).toBe(true);
    expect(dot.getAttribute('aria-hidden')).toBe('true');
  });

  it('shows the label as a tooltip on focus, on the end side', async () => {
    const el = await mountNav();
    const [dash] = links(el);
    const tip = dash.closest('cm-tooltip') as CmTooltip;
    expect(tip.content).toBe('Dashboard');
    expect(tip.visualOnly).toBe(true);
    dash.focus();
    await tip.updateComplete; await frames();
    expect(tip.open).toBe(true);
    const bubble = shadow(tip, '.tip');
    expect(bubble.textContent).toBe('Dashboard');
    expect(rect(bubble).left).toBeGreaterThan(rect(dash).right);
    await userEvent.keyboard('{Escape}');
    expect(tip.open).toBe(false);
  });

  it('choosing a section in the rail expands the menu, opens the section and fires cm-collapse', async () => {
    const el = await mountNav();
    const events: boolean[] = [];
    el.addEventListener('cm-collapse', (e) => events.push((e as CustomEvent).detail.collapsed));
    links(el)[4].click();
    await el.updateComplete; await el.updateComplete;
    expect(el.collapsed).toBe(false);
    expect(events).toEqual([false]);
    const parent = el.shadowRoot!.querySelector('.parent') as HTMLElement;
    expect(parent.getAttribute('aria-expanded')).toBe('true');
    expect(el.shadowRoot!.activeElement).toBe(parent);
  });

  it('collapsible adds a toggle button that fires a cancelable cm-collapse', async () => {
    const el = await mountNav('collapsible');
    const btn = () => shadow(el, '[part="collapse-button"]');
    expect(btn().textContent!.trim()).toBe('Collapse menu');
    const events: boolean[] = [];
    el.addEventListener('cm-collapse', (e) => events.push((e as CustomEvent).detail.collapsed));
    btn().click(); await el.updateComplete;
    expect(el.collapsed).toBe(true);
    expect(el.hasAttribute('collapsed')).toBe(true);
    expect(btn().textContent!.trim()).toBe('Expand menu');
    expect(rect(btn()).height).toBeGreaterThanOrEqual(24);
    const cancel = (e: Event) => e.preventDefault();
    el.addEventListener('cm-collapse', cancel);
    btn().click(); await el.updateComplete;
    expect(el.collapsed).toBe(true);
    el.removeEventListener('cm-collapse', cancel);
    btn().click(); await el.updateComplete;
    expect(el.collapsed).toBe(false);
    expect(events).toEqual([true, false, false]);
    // Setting collapsed yourself fires nothing.
    el.collapsed = true; await el.updateComplete;
    expect(events.length).toBe(3);
  });

  it('keeps the default rendering when not collapsed (labels, badges, no tooltips, no toggle)', async () => {
    const el = await mountNav('');
    expect(Math.round(rect(el).width)).toBe(220);
    expect(el.shadowRoot!.querySelector('cm-tooltip')).toBeNull();
    expect(el.shadowRoot!.querySelector('[part="collapse-button"]')).toBeNull();
    const orders = links(el)[1];
    expect(orders.querySelector('.label')!.textContent).toBe('Orders');
    expect(orders.querySelector('.badge')!.textContent).toBe('12');
    expect(orders.querySelector('.sr, .dot')).toBeNull();
  });

  it('arrow keys still move through the rail; left and right do nothing on sections', async () => {
    const el = await mountNav();
    const all = links(el);
    all[3].focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(el.shadowRoot!.activeElement).toBe(all[4]);
    await userEvent.keyboard('{ArrowRight}');
    await el.updateComplete;
    expect(el.collapsed).toBe(true);
    expect(el.shadowRoot!.querySelector('.sub')!.hasAttribute('hidden')).toBe(true);
  });

  it('places the rail\'s tooltip on the left in RTL', async () => {
    document.body.innerHTML = '<div dir="rtl"><cm-side-navigation collapsed><cm-nav-item label="Orders" icon="bag" href="#o"></cm-nav-item></cm-side-navigation></div>';
    const el = document.querySelector('cm-side-navigation') as CmSideNavigation;
    el.style.marginInlineStart = '300px';
    await el.updateComplete;
    const a = shadow(el, '.item'), tip = a.closest('cm-tooltip') as CmTooltip;
    await tip.updateComplete;
    a.focus(); await tip.updateComplete; await frames();
    expect(rect(shadow(tip, '.tip')).right).toBeLessThan(rect(a).left);
  });
});

describe('cm-tooltip visual-only', () => {
  it('shows the bubble without describing the control', async () => {
    document.body.innerHTML = '<cm-tooltip content="Orders" visual-only><button aria-label="Orders">O</button></cm-tooltip><cm-tooltip content="Orders"><button aria-label="O">O</button></cm-tooltip>';
    const [quiet, normal] = [...document.querySelectorAll('cm-tooltip')] as CmTooltip[];
    await quiet.updateComplete; await normal.updateComplete;
    expect(quiet.querySelector('button')!.hasAttribute('aria-describedby')).toBe(false);
    expect(normal.querySelector('button')!.hasAttribute('aria-describedby')).toBe(true);
    quiet.querySelector('button')!.focus(); await quiet.updateComplete;
    expect(quiet.open).toBe(true);
    quiet.visualOnly = false; await quiet.updateComplete;
    expect(quiet.querySelector('button')!.hasAttribute('aria-describedby')).toBe(true);
  });
});

describe('cm-app-frame bottom offset (CRM field app)', () => {
  it('adds --cm-app-frame-bottom-offset to the page padding for a bar of the app\'s own', async () => {
    document.body.innerHTML = `<div style="width:390px"><cm-app-frame style="--cm-app-frame-bottom-offset: 64px"><cm-page>Page</cm-page></cm-app-frame></div>`;
    const el = document.querySelector('cm-app-frame') as any;
    await el.updateComplete;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
    const main = el.shadowRoot.querySelector('main') as HTMLElement;
    expect(parseFloat(getComputedStyle(main).paddingBlockEnd)).toBeGreaterThanOrEqual(64);
    el.style.removeProperty('--cm-app-frame-bottom-offset');
    expect(parseFloat(getComputedStyle(main).paddingBlockEnd)).toBeLessThan(64);
  });
});

describe('cm-app-frame panel with a wrapped page (issue #30)', () => {
  it('a cm-page inside a wrapper element is transparent, so the whole panel is white', async () => {
    document.body.innerHTML = `<div style="width:1440px"><cm-app-frame panel><div id="main"><cm-page>Content</cm-page></div></cm-app-frame></div>`;
    const frame = document.querySelector('cm-app-frame') as any;
    await frame.updateComplete;
    const cmPage = document.querySelector('cm-page') as any;
    await cmPage.updateComplete;
    expect(getComputedStyle(cmPage).backgroundColor).toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
    frame.removeAttribute('panel'); await frame.updateComplete;
    expect(getComputedStyle(cmPage).backgroundColor).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
  });
});
