import { describe, it, expect, beforeEach, beforeAll, afterAll, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import '@commmerce/tokens/tokens.css';
import '../src/index.js';
import { resetStrings, setStrings } from '../src/index.js';
import { localeFirstDay } from '../src/calendar.js';
import type { CmCalendar, CalendarMoveDetail, CalendarRange, CalendarAddDetail } from '../src/index.js';
// Firefox writes 'Wednesday, 18 November'; Chromium and WebKit 'Wednesday 18 November'. Compare without that comma.
const nc = (v: string | null | undefined) => (v ?? '').replace(/((?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day),\s/g, '$1 ');

// Fixed dates: 18 November 2026 is a Wednesday; "today" is pinned to Monday 16 November.
const ev = (value: string, heading: string, start: string, end: string, extra = '') =>
  `<cm-calendar-event value="${value}" heading="${heading}" start="${start}" end="${end}" ${extra}></cm-calendar-event>`;
const EVENTS = [
  ev('e1', 'Call Ravi Stores', '2026-11-18T15:00', '2026-11-18T15:30', 'kind="Follow-up" tone="attention" icon="phone"'),
  ev('e2', 'Demo for Kiran Foods', '2026-11-19T11:00', '2026-11-19T12:00', 'kind="Demo" tone="success"'),
  ev('e3', 'GST filing', '2026-11-20', '', 'all-day kind="Deadline" tone="critical"'),
  ev('e4', 'Call Asha Textiles', '2026-11-24T09:00', '2026-11-24T09:15', 'kind="Call"'),
  ev('e5', 'Call Blue Pottery', '2026-11-24T10:00', '2026-11-24T10:30', 'kind="Call"'),
  ev('e6', 'Meet Delhi Spices', '2026-11-24T12:00', '2026-11-24T13:00', 'kind="Meeting"'),
  ev('e7', 'Call Goa Gifts', '2026-11-24T16:00', '2026-11-24T16:30', 'kind="Call"'),
].join('');
const cal = (attrs = '', events = EVENTS) =>
  `<cm-calendar label="Outreach planner" locale="en-GB" hour-cycle="h12" first-day-of-week="1" date="2026-11-18" today="2026-11-16" style="width:1100px" ${attrs}>${events}</cm-calendar>`;

const shadow = (el: Element, sel: string) => el.shadowRoot!.querySelector(sel) as HTMLElement;
const all = (el: Element, sel: string) => [...el.shadowRoot!.querySelectorAll<HTMLElement>(sel)];
const frames = (n = 2) => new Promise<void>((r) => { const s = (k: number) => (k <= 0 ? r() : requestAnimationFrame(() => s(k - 1))); s(n); });
const settle = async (c: CmCalendar) => {
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r));
    await c.updateComplete;
    await Promise.all(c.events.map((e) => e.updateComplete));
  }
};
async function mount(markup = cal()): Promise<CmCalendar> {
  document.body.innerHTML = markup;
  const c = document.querySelector('cm-calendar') as CmCalendar;
  await settle(c);
  await frames();
  await settle(c);
  return c;
}
const chip = (c: CmCalendar, value: string, day?: string) =>
  all(c, `.chip[data-ev="${value}"]`).find((x) => !day || x.dataset.day === day)!;
const active = (c: CmCalendar) => c.shadowRoot!.activeElement as HTMLElement | null;
async function announced(c: CmCalendar, re: RegExp) {
  await vi.waitFor(() => expect(nc(c.announcement)).toMatch(re), { timeout: 1000, interval: 20 });
}
const pointer = (type: string, target: EventTarget, x: number, y: number, pointerType = 'mouse', pointerId = 1) => {
  target.dispatchEvent(new PointerEvent(type, {
    bubbles: true, composed: true, cancelable: true, clientX: x, clientY: y, pointerId, pointerType, isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1,
  }));
};
const centre = (el: Element) => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
const td = (c: CmCalendar, iso: string) => shadow(c, `td[data-day="${iso}"]`) ?? (shadow(c, `[data-k="day:${iso}"]`)?.parentElement as HTMLElement);

beforeAll(async () => {
  const end = Date.now() + 10_000; // tokens.css waits for its font import in Firefox and WebKit
  while (!getComputedStyle(document.documentElement).getPropertyValue('--cm-space-20') && Date.now() < end) {
    await new Promise((r) => setTimeout(r, 20));
  }
});
beforeEach(async () => { document.body.innerHTML = ''; resetStrings(); await page.viewport(1280, 900); });
afterAll(async () => { resetStrings(); await page.viewport(414, 896); });

describe('cm-calendar: month view', () => {
  it('a named grid of weeks with weekday column headers, starting on the first day of the week; the range label and today', async () => {
    const c = await mount();
    expect(shadow(c, '.cal').getAttribute('role')).toBe('group');
    expect(shadow(c, '.cal').getAttribute('aria-label')).toBe('Outreach planner');
    const grid = shadow(c, 'table');
    expect(grid.getAttribute('role')).toBe('grid');
    const title = shadow(c, '.title');
    expect(grid.getAttribute('aria-labelledby')).toBe(title.id);
    expect(title.getAttribute('role')).toBe('heading');
    expect(title.textContent!.trim()).toBe('November 2026');
    const heads = all(c, 'thead th');
    expect(heads).toHaveLength(7);
    expect(heads[0].getAttribute('abbr')).toBe('Monday');
    // November 2026 starts on a Sunday: with Monday first the grid needs six weeks, 26 Oct to 6 Dec.
    expect(all(c, 'tbody tr')).toHaveLength(6);
    expect(c.range).toEqual({ view: 'month', start: '2026-10-26', end: '2026-12-06' });
    expect(td(c, '2026-10-26').classList.contains('other')).toBe(true);
    expect(td(c, '2026-11-16').getAttribute('aria-current')).toBe('date');
    expect(td(c, '2026-11-16').classList.contains('today')).toBe(true);
    // Sunday first: five weeks.
    c.firstDayOfWeek = 0;
    await settle(c);
    expect(all(c, 'tbody tr')).toHaveLength(5);
    expect(c.range).toEqual({ view: 'month', start: '2026-11-01', end: '2026-12-05' });
  });

  it('without first-day-of-week it follows the locale, as cm-date-picker does', async () => {
    const c = await mount(cal().replace('first-day-of-week="1" ', ''));
    const fd = localeFirstDay('en-GB');
    const first = new Date(2026, 10, 1);
    const lead = (first.getDay() - fd + 7) % 7;
    const start = new Date(2026, 10, 1 - lead);
    expect(c.range.start).toBe(`${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`);
  });

  it('events are chips with a full accessible name, the kind as text or icon, and the tone as colour', async () => {
    const c = await mount();
    const e1 = chip(c, 'e1');
    expect(e1.localName).toBe('button');
    expect(nc(e1.getAttribute('aria-label'))).toMatch(/^Call Ravi Stores, Wednesday 18 November, 3:00 to 3:30\s?pm, Follow-up$/i);
    expect(e1.getAttribute('aria-roledescription')).toBe('movable event');
    const help = c.shadowRoot!.getElementById(e1.getAttribute('aria-describedby')!)!;
    expect(help.textContent).toMatch(/^Press Enter to open\. Press Space to pick up/);
    expect(e1.classList.contains('tone-attention')).toBe(true);
    expect(e1.querySelector('cm-icon')!.getAttribute('name')).toBe('phone'); // the month chip shows the icon
    expect(e1.textContent).toMatch(/3:00\s?pm/i);
    // No icon: the kind is written on the chip.
    expect(chip(c, 'e2').querySelector('.k')!.textContent).toBe('Demo');
    // All-day: no time, named "all day".
    const e3 = chip(c, 'e3');
    expect(nc(e3.getAttribute('aria-label'))).toBe('GST filing, Friday 20 November, all day, Deadline');
    expect(e3.querySelector('.tm')).toBeNull();
    // An all-day event over several days shows on each day.
    c.event('e3')!.end = '2026-11-21';
    await settle(c);
    expect(all(c, '.chip[data-ev="e3"]').map((x) => x.dataset.day)).toEqual(['2026-11-20', '2026-11-21']);
    expect(nc(chip(c, 'e3').getAttribute('aria-label'))).toBe('GST filing, Friday 20 November to Saturday 21 November, all day, Deadline');
  });

  it('a day with more events than max-events shows "+N more", which opens a list of the whole day; Escape closes it', async () => {
    const c = await mount();
    const cell = td(c, '2026-11-24');
    expect(cell.querySelectorAll('.chip')).toHaveLength(2);
    const more = cell.querySelector('.more') as HTMLButtonElement;
    expect(more.textContent!.trim()).toBe('+2 more');
    expect(nc(more.getAttribute('aria-label'))).toBe('2 more on Tuesday 24 November');
    expect(more.getAttribute('aria-expanded')).toBe('false');
    more.focus();
    await userEvent.keyboard('{Enter}');
    await settle(c);
    const pop = shadow(c, '.pop');
    expect(pop.getAttribute('role')).toBe('dialog');
    expect(nc(pop.getAttribute('aria-label'))).toBe('Tuesday 24 November');
    expect([...pop.querySelectorAll('.chip')].map((x) => (x as HTMLElement).dataset.ev)).toEqual(['e4', 'e5', 'e6', 'e7']);
    expect(active(c)?.dataset.ev).toBe('e4');
    await userEvent.keyboard('{ArrowDown}');
    expect(active(c)?.dataset.ev).toBe('e5');
    await userEvent.keyboard('{Escape}');
    await settle(c);
    expect(shadow(c, '.pop')).toBeNull();
    expect(active(c)?.dataset.k).toBe('more:2026-11-24');
    c.maxEvents = 5;
    await settle(c);
    expect(td(c, '2026-11-24').querySelectorAll('.chip')).toHaveLength(4);
    expect(td(c, '2026-11-24').querySelector('.more')).toBeNull();
  });

  it('one Tab stop; arrow keys move between days and events (Down past the last item goes a week on)', async () => {
    const c = await mount(cal() + '<input id="after" aria-label="After">');
    const stops = all(c, '.item').filter((x) => x.tabIndex === 0);
    expect(stops).toHaveLength(1);
    expect(stops[0].dataset.k).toBe('add:2026-11-18'); // the chosen day's "+"
    stops[0].focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(active(c)?.dataset.ev).toBe('e1');
    await userEvent.keyboard('{ArrowRight}');
    expect(active(c)?.dataset.ev).toBe('e2'); // same position in the next day
    await userEvent.keyboard('{ArrowDown}');
    expect(active(c)?.dataset.k).toBe('add:2026-11-26'); // a week on
    await userEvent.keyboard('{Home}');
    expect(active(c)?.dataset.k).toBe('add:2026-11-23');
    await userEvent.keyboard('{End}');
    expect(active(c)?.dataset.k).toBe('add:2026-11-29');
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement?.id).toBe('after');
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    expect(active(c)?.dataset.k).toBe('add:2026-11-29'); // back to the item last focused
  });
});

describe('cm-calendar: header and range', () => {
  it('Previous, Today and Next change the date; each new range fires cm-range-change once with { view, start, end }', async () => {
    document.body.innerHTML = '';
    const ranges: CalendarRange[] = [];
    document.addEventListener('cm-range-change', (e) => ranges.push((e as CustomEvent<CalendarRange>).detail));
    const c = await mount();
    expect(ranges).toEqual([{ view: 'month', start: '2026-10-26', end: '2026-12-06' }]);
    expect(shadow(c, '.prev').getAttribute('aria-label')).toBe('Previous month');
    shadow(c, '.next').click();
    await settle(c);
    expect(c.date).toBe('2026-12-18');
    expect(shadow(c, '.title').textContent!.trim()).toBe('December 2026');
    expect(ranges.at(-1)).toEqual({ view: 'month', start: '2026-11-30', end: '2027-01-03' });
    shadow(c, '.hb.today').click();
    await settle(c);
    expect(c.date).toBe('2026-11-16');
    expect(ranges).toHaveLength(3);
    // The view switch: pressed buttons, and the range follows.
    const views = all(c, '.views .hb');
    expect(views.map((b) => b.getAttribute('aria-pressed'))).toEqual(['true', 'false', 'false']);
    expect(shadow(c, '.views').getAttribute('role')).toBe('group');
    views[1].click();
    await settle(c);
    expect(c.view).toBe('week');
    expect(ranges.at(-1)).toEqual({ view: 'week', start: '2026-11-16', end: '2026-11-22' });
    expect(shadow(c, '.title').textContent!.replace(/\s+/g, ' ').trim()).toMatch(/^16\s?[–-]\s?22 Nov 2026$/);
    expect(shadow(c, '.prev').getAttribute('aria-label')).toBe('Previous week');
    shadow(c, '.prev').click();
    await settle(c);
    expect(ranges.at(-1)).toEqual({ view: 'week', start: '2026-11-09', end: '2026-11-15' });
    all(c, '.views .hb')[2].click();
    await settle(c);
    expect(ranges.at(-1)).toEqual({ view: 'day', start: '2026-11-09', end: '2026-11-09' });
    expect(shadow(c, '.title').textContent!.trim()).toMatch(/^Monday,? 9 November 2026$/);
    const n = ranges.length;
    c.requestUpdate();
    await settle(c);
    expect(ranges).toHaveLength(n); // no repeat for the same range
  });

  it('loading: the grid is busy and "Loading events" is announced', async () => {
    const c = await mount(cal('loading', ''));
    expect(shadow(c, 'table').getAttribute('aria-busy')).toBe('true');
    expect(shadow(c, '[role="status"]').textContent).toBe('Loading events');
    expect(shadow(c, '.title cm-spinner')).toBeTruthy();
    c.loading = false;
    await settle(c);
    expect(shadow(c, '[role="status"]').textContent).toBe('');
  });
});

describe('cm-calendar: week and day views', () => {
  it('week: seven day columns, an all-day row and 24 hours; timed chips sit at their time with their length', async () => {
    const c = await mount(cal('view="week"'));
    const grid = shadow(c, '.tg');
    expect(grid.getAttribute('role')).toBe('grid');
    const heads = all(c, '.tg-top [role="columnheader"]');
    expect(heads).toHaveLength(8); // the time axis and seven days
    expect(nc(heads[1].textContent!.replace(/\s+/g, ' '))).toMatch(/Monday 16 November/);
    expect(heads[1].getAttribute('aria-current')).toBe('date');
    expect(all(c, '.adrow [role="gridcell"]')).toHaveLength(7);
    expect(shadow(c, '.adrow [role="rowheader"]').textContent!.trim()).toBe('All day');
    expect(all(c, '.hr')).toHaveLength(24);
    expect(all(c, '.tcell')).toHaveLength(24 * 7);
    // All-day events in the all-day row; timed ones in the cell of their start hour.
    expect(chip(c, 'e3').closest('.adcell')).toBeTruthy();
    const e1 = chip(c, 'e1');
    expect(e1.closest('.tcell')!.getAttribute('data-row')).toBe('15');
    expect(e1.closest('.tcell')!.getAttribute('data-day')).toBe('2026-11-18');
    expect(e1.querySelector('.k')!.textContent).toBe('Follow-up'); // the kind is written in week view
    const hour = (e1.closest('.tcell') as HTMLElement).getBoundingClientRect().height;
    const e2 = chip(c, 'e2');
    expect(Math.abs(e2.getBoundingClientRect().height - hour)).toBeLessThan(3); // one hour long
    expect(Math.abs(e1.getBoundingClientRect().top - e1.closest('.tcell')!.getBoundingClientRect().top)).toBeLessThan(2);
    // Scrolled to day-start (8 am).
    expect(Math.round(grid.scrollTop / hour)).toBe(8);
  });

  it('overlapping events share the hour side by side', async () => {
    const c = await mount(cal('view="day"', ev('a', 'Call A', '2026-11-18T10:00', '2026-11-18T11:00') + ev('b', 'Call B', '2026-11-18T10:30', '2026-11-18T11:00')));
    const a = chip(c, 'a').getBoundingClientRect(), b = chip(c, 'b').getBoundingClientRect();
    expect(b.left).toBeGreaterThanOrEqual(a.right - 1);
    expect(Math.abs(a.width - b.width)).toBeLessThan(2);
  });

  it('day: one column, Previous/Next move a day', async () => {
    const c = await mount(cal('view="day"'));
    expect(all(c, '.tg-top [role="columnheader"]')).toHaveLength(2);
    expect(all(c, '.tcell')).toHaveLength(24);
    expect(shadow(c, '.prev').getAttribute('aria-label')).toBe('Previous day');
    shadow(c, '.next').click();
    await settle(c);
    expect(c.range).toEqual({ view: 'day', start: '2026-11-19', end: '2026-11-19' });
    expect(chip(c, 'e2')).toBeTruthy();
  });

  it('keyboard in the time grid: Down and Up through the hours of a day, Left and Right to the same hour in the next day', async () => {
    const c = await mount(cal('view="week"'));
    const stop = all(c, '.item').find((x) => x.tabIndex === 0)!;
    expect(stop.dataset.k).toBe('slot:2026-11-18:8');
    stop.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(active(c)?.dataset.k).toBe('slot:2026-11-19:8');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(active(c)?.dataset.k).toBe('slot:2026-11-19:11');
    await userEvent.keyboard('{ArrowDown}');
    expect(active(c)?.dataset.ev).toBe('e2'); // the event that starts at 11
    await userEvent.keyboard('{ArrowLeft}');
    expect(active(c)?.dataset.k).toBe('slot:2026-11-18:11');
    await userEvent.keyboard('{PageDown}');
    await settle(c);
    expect(c.range.start).toBe('2026-11-23');
    expect(active(c)?.dataset.k).toBe('slot:2026-11-25:11');
  });
});

describe('cm-calendar: adding', () => {
  it('"+" on a day and an hour fire cm-add { start, allDay, view }, by pointer and by keyboard', async () => {
    const c = await mount();
    const adds: CalendarAddDetail[] = [];
    c.addEventListener('cm-add', (e) => adds.push((e as CustomEvent<CalendarAddDetail>).detail));
    const plus = shadow(c, '[data-k="add:2026-11-18"]');
    expect(nc(plus.getAttribute('aria-label'))).toBe('Add on Wednesday 18 November');
    plus.click();
    expect(adds.at(-1)).toEqual({ start: '2026-11-18', allDay: true, view: 'month' });
    plus.focus();
    await userEvent.keyboard('{ArrowRight}{Enter}');
    expect(adds.at(-1)).toEqual({ start: '2026-11-19', allDay: true, view: 'month' });
    c.view = 'week';
    await settle(c);
    const slot = shadow(c, '[data-k="slot:2026-11-18:9"]');
    expect(nc(slot.getAttribute('aria-label'))).toMatch(/^Add at 9:00\s?am, Wednesday 18 November$/i);
    slot.focus();
    await userEvent.keyboard('{Enter}');
    expect(adds.at(-1)).toEqual({ start: '2026-11-18T09:00', allDay: false, view: 'week' });
    // A click lower in the hour starts at the step under the pointer.
    const r = slot.getBoundingClientRect();
    slot.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, detail: 1, clientX: r.left + 5, clientY: r.top + r.height * 0.8 }));
    expect(adds.at(-1)).toEqual({ start: '2026-11-18T09:45', allDay: false, view: 'week' });
    shadow(c, '[data-k="adadd:2026-11-20"]').click();
    expect(adds.at(-1)).toEqual({ start: '2026-11-20', allDay: true, view: 'week' });
  });

  it('readonly: no "+" buttons and no moving; events still open', async () => {
    const c = await mount(cal('readonly'));
    expect(all(c, '.add')).toHaveLength(0);
    expect(c.pickUp('e1')).toBe(false);
    expect(chip(c, 'e1').getAttribute('aria-roledescription')).toBeNull();
    const opens: string[] = [];
    c.addEventListener('cm-open', (e) => opens.push((e as CustomEvent).detail.value));
    chip(c, 'e1').click();
    expect(opens).toEqual(['e1']);
    // Days are still reachable: the cells are the stops.
    expect(all(c, 'td.item').filter((x) => x.tabIndex === 0)[0].dataset.k).toBe('cell:2026-11-18');
  });
});

describe('cm-calendar: moving with the keyboard', () => {
  it('month: Space picks up, arrows choose a day (Down = a week on), Enter drops; cm-move, start and end follow, focus stays, every step announced', async () => {
    const c = await mount();
    const moves: CalendarMoveDetail[] = [];
    c.addEventListener('cm-move', (e) => moves.push((e as CustomEvent<CalendarMoveDetail>).detail));
    chip(c, 'e1').focus();
    await userEvent.keyboard(' ');
    await announced(c, /^Picked up Call Ravi Stores\. Wednesday 18 November\.$/);
    expect(c.heldEvent).toBe(c.event('e1'));
    expect(c.event('e1')!.moving).toBe(true);
    await userEvent.keyboard('{ArrowRight}');
    await announced(c, /^Thursday 19 November\.$/);
    await userEvent.keyboard('{ArrowDown}');
    await announced(c, /^Thursday 26 November\.$/);
    await settle(c);
    const target = td(c, '2026-11-26');
    expect(target.classList.contains('over')).toBe(true);
    expect(target.querySelector('.ph')!.textContent).toBe('Call Ravi Stores');
    expect(target.querySelector('.ph')!.closest('[aria-hidden="true"]')).toBeTruthy();
    await userEvent.keyboard('{Enter}');
    await settle(c);
    expect(moves).toHaveLength(1);
    expect(moves[0]).toMatchObject({
      value: 'e1', allDay: false, source: 'keyboard',
      from: { start: '2026-11-18T15:00', end: '2026-11-18T15:30' }, to: { start: '2026-11-26T15:00', end: '2026-11-26T15:30' },
    });
    expect(moves[0].event).toBe(c.event('e1'));
    expect(c.event('e1')!.start).toBe('2026-11-26T15:00');
    await announced(c, /^Moved Call Ravi Stores to Thursday 26 November, 3:00 to 3:30\s?pm\.$/i);
    expect(c.event('e1')!.moving).toBe(false);
    await vi.waitFor(() => expect(active(c)?.dataset.k).toBe('ev:e1:2026-11-26'));
    expect(shadow(c, '.ph')).toBeNull();
  });

  it('week: Up and Down move by the step (15 minutes), Left and Right by a day; the announcement says the new time', async () => {
    const c = await mount(cal('view="week"'));
    const moves: CalendarMoveDetail[] = [];
    c.addEventListener('cm-move', (e) => moves.push((e as CustomEvent<CalendarMoveDetail>).detail));
    chip(c, 'e1').focus();
    await userEvent.keyboard(' ');
    await announced(c, /^Picked up Call Ravi Stores\. Wednesday 18 November, 3:00 to 3:30\s?pm\.$/i);
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await announced(c, /^Wednesday 18 November, 3:30 to 4:00\s?pm\.$/i);
    await userEvent.keyboard('{ArrowRight}');
    await announced(c, /^Thursday 19 November, 3:30 to 4:00\s?pm\.$/i);
    await settle(c);
    const ph = shadow(c, '.ph.time');
    expect(ph.closest('.tcell')!.getAttribute('data-day')).toBe('2026-11-19');
    expect(ph.closest('.tcell')!.getAttribute('data-row')).toBe('15');
    await userEvent.keyboard('{PageUp}');
    await announced(c, /^Thursday 19 November, 2:30 to 3:00\s?pm\.$/i);
    await userEvent.keyboard(' ');
    await settle(c);
    expect(moves[0]).toMatchObject({ source: 'keyboard', to: { start: '2026-11-19T14:30', end: '2026-11-19T15:00' } });
    expect(chip(c, 'e1').closest('.tcell')!.getAttribute('data-row')).toBe('14');
    await vi.waitFor(() => expect(active(c)?.dataset.k).toBe('ev:e1:2026-11-19'));
    // step="30": Down moves half an hour.
    c.step = 30;
    await settle(c);
    chip(c, 'e1').focus();
    await userEvent.keyboard(' {ArrowDown}');
    await announced(c, /3:00 to 3:30\s?pm\.$/i);
    await userEvent.keyboard('{Escape}');
  });

  it('an all-day event in the week view moves between days in the all-day row', async () => {
    const c = await mount(cal('view="week"'));
    chip(c, 'e3').focus();
    await userEvent.keyboard(' {ArrowLeft}{ArrowLeft}{Enter}');
    await settle(c);
    expect(c.event('e3')!.start).toBe('2026-11-18');
    expect(c.event('e3')!.end).toBe('2026-11-18');
    expect(chip(c, 'e3').closest('.adcell')).toBeTruthy();
  });

  it('Escape cancels (no event, announced, focus stays); dropping where it started fires nothing', async () => {
    const c = await mount();
    const moves = vi.fn();
    c.addEventListener('cm-move', moves);
    chip(c, 'e1').focus();
    await userEvent.keyboard(' {ArrowRight}{Escape}');
    await settle(c);
    expect(moves).not.toHaveBeenCalled();
    await announced(c, /^Move cancelled\. Call Ravi Stores is back on Wednesday 18 November\.$/);
    expect(c.heldEvent).toBeNull();
    expect(c.event('e1')!.moving).toBe(false);
    expect(active(c)?.dataset.ev).toBe('e1');
    await userEvent.keyboard(' {Enter}');
    await announced(c, /^Call Ravi Stores dropped where it started\.$/);
    expect(moves).not.toHaveBeenCalled();
  });

  it('focus leaving the held event cancels the move', async () => {
    const c = await mount(cal() + '<button id="out">Out</button>');
    chip(c, 'e1').focus();
    await userEvent.keyboard(' ');
    expect(c.heldEvent).toBeTruthy();
    (document.getElementById('out') as HTMLButtonElement).focus();
    await vi.waitFor(() => expect(c.heldEvent).toBeNull());
    await announced(c, /^Move cancelled/);
  });

  it('an event in the "+N more" list can be picked up: the list closes and the event shows in its day while it moves', async () => {
    const c = await mount();
    shadow(c, '[data-k="more:2026-11-24"]').click();
    await settle(c);
    const e7 = [...shadow(c, '.pop').querySelectorAll<HTMLElement>('.chip')].find((x) => x.dataset.ev === 'e7')!;
    e7.focus();
    await userEvent.keyboard(' ');
    await settle(c);
    expect(shadow(c, '.pop')).toBeNull();
    await vi.waitFor(() => expect(active(c)?.dataset.k).toBe('ev:e7:2026-11-24'));
    expect(c.heldEvent).toBe(c.event('e7'));
    await userEvent.keyboard('{ArrowRight}{Enter}');
    await settle(c);
    expect(c.event('e7')!.start).toBe('2026-11-25T16:00');
  });
});

describe('cm-calendar: the app decides', () => {
  it('preventDefault() on cm-move keeps the event where it was and says so', async () => {
    const c = await mount();
    c.addEventListener('cm-move', (e) => e.preventDefault());
    chip(c, 'e1').focus();
    await userEvent.keyboard(' {ArrowRight}{Enter}');
    await settle(c);
    expect(c.event('e1')!.start).toBe('2026-11-18T15:00');
    await announced(c, /^Call Ravi Stores can't be moved to Thursday 19 November, 3:00 to 3:30\s?pm\.$/i);
    expect(active(c)?.dataset.ev).toBe('e1');
  });

  it('waitUntil(): pending while saving (named "Saving", can\'t move again); a rejected save reverts and announces it', async () => {
    const c = await mount();
    let fail!: (e: Error) => void;
    c.addEventListener('cm-move', (e) => (e as CustomEvent<CalendarMoveDetail>).detail.waitUntil(new Promise((_, rej) => { fail = rej; })));
    expect(c.moveEvent('e1', '2026-11-20T10:00')).toBe(true);
    await settle(c);
    const el = c.event('e1')!;
    expect(el.start).toBe('2026-11-20T10:00');
    expect(el.end).toBe('2026-11-20T10:30'); // keeps its length
    expect(el.pending).toBe(true);
    expect(chip(c, 'e1').getAttribute('aria-label')).toMatch(/, Saving$/);
    expect(chip(c, 'e1').classList.contains('pending')).toBe(true);
    expect(c.pickUp(el)).toBe(false);
    fail(new Error('Network'));
    await vi.waitFor(() => expect(el.pending).toBe(false));
    await settle(c);
    expect(el.start).toBe('2026-11-18T15:00');
    await announced(c, /^Couldn't move Call Ravi Stores\. It is back on Wednesday 18 November, 3:00 to 3:30\s?pm\.$/i);
    expect(chip(c, 'e1').dataset.day).toBe('2026-11-18');
  });

  it('a resolved save keeps the move; revert() after that does nothing; revert() before puts it back', async () => {
    const c = await mount();
    c.addEventListener('cm-move', (e) => (e as CustomEvent<CalendarMoveDetail>).detail.waitUntil(Promise.resolve()), { once: true });
    c.moveEvent('e2', '2026-11-20T11:00');
    await vi.waitFor(() => expect(c.event('e2')!.pending).toBe(false));
    expect(c.revert('e2')).toBe(false);
    expect(c.event('e2')!.start).toBe('2026-11-20T11:00');
    c.moveEvent('e3', '2026-11-27');
    expect(c.event('e3')!.start).toBe('2026-11-27');
    expect(c.revert('e3')).toBe(true);
    expect(c.event('e3')!.start).toBe('2026-11-20');
  });

  it('controlled: cm-move fires but the app changes the times; focus follows the event to its new day', async () => {
    const c = await mount(cal('controlled'));
    // The app applies the move later, when the test says so. (A 20ms timer here flaked under load: the keyboard
    // input could take longer than that, so the event had already moved by the "untouched" check.)
    let apply = () => {};
    c.addEventListener('cm-move', (e) => {
      const d = (e as CustomEvent<CalendarMoveDetail>).detail;
      apply = () => { d.event.start = d.to.start; d.event.end = d.to.end; };
    });
    chip(c, 'e1').focus();
    await userEvent.keyboard(' {ArrowRight}{Enter}');
    expect(c.event('e1')!.start).toBe('2026-11-18T15:00'); // untouched until the app moves it
    apply();
    await vi.waitFor(() => expect(c.event('e1')!.start).toBe('2026-11-19T15:00'));
    await vi.waitFor(() => expect(active(c)?.dataset.k).toBe('ev:e1:2026-11-19'));
    expect(c.revert('e1')).toBe(false);
  });
});

describe('cm-calendar: pointer drag', () => {
  it('month: a mouse drag past a small threshold shows the target day and drops there; the click after it doesn\'t open the event', async () => {
    const c = await mount();
    const moves: CalendarMoveDetail[] = [];
    const opens = vi.fn();
    c.addEventListener('cm-move', (e) => moves.push((e as CustomEvent<CalendarMoveDetail>).detail));
    c.addEventListener('cm-open', opens);
    const k = chip(c, 'e1');
    const p = centre(k);
    pointer('pointerdown', k, p.x, p.y);
    pointer('pointermove', document, p.x + 2, p.y + 1);
    expect(c.dragging).toBe(false);
    const t = centre(td(c, '2026-11-20'));
    pointer('pointermove', document, t.x, t.y);
    expect(c.dragging).toBe(true);
    expect(c.event('e1')!.moving).toBe(true);
    await settle(c);
    expect(td(c, '2026-11-20').classList.contains('over')).toBe(true);
    await announced(c, /^Friday 20 November\.$/);
    pointer('pointerup', document, t.x, t.y);
    k.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
    await settle(c);
    expect(opens).not.toHaveBeenCalled();
    expect(c.dragging).toBe(false);
    expect(moves).toHaveLength(1);
    expect(moves[0]).toMatchObject({ value: 'e1', source: 'pointer', to: { start: '2026-11-20T15:00', end: '2026-11-20T15:30' } });
    expect(chip(c, 'e1').dataset.day).toBe('2026-11-20');
  });

  it('week: drops at the time under the pointer, snapped to the step', async () => {
    const c = await mount(cal('view="week"'));
    const k = chip(c, 'e1');
    const r = k.getBoundingClientRect();
    pointer('pointerdown', k, r.left + 10, r.top + 2);
    const cell = shadow(c, '.tcell[data-day="2026-11-17"][data-row="15"]');
    const cr = cell.getBoundingClientRect();
    // Half way down the 3 pm hour of Tuesday, grabbed near the event's top: 3:30, give or take the grab.
    pointer('pointermove', document, cr.left + cr.width / 2, cr.top + 2 + cr.height * 0.5);
    await settle(c);
    expect(shadow(c, '.ph.time').closest('.tcell')!.getAttribute('data-day')).toBe('2026-11-17');
    pointer('pointerup', document, cr.left + cr.width / 2, cr.top + 2 + cr.height * 0.5);
    await settle(c);
    expect(c.event('e1')!.start).toBe('2026-11-17T15:30');
    expect(c.event('e1')!.end).toBe('2026-11-17T16:00');
  });

  it('a plain click opens the event (cm-open; a link chip follows its href unless cancelled); Escape during a drag cancels', async () => {
    const c = await mount(cal('', EVENTS.replace('value="e2"', 'value="e2" href="#demo"')));
    const opens: string[] = [];
    c.addEventListener('cm-open', (e) => { opens.push((e as CustomEvent).detail.value); e.preventDefault(); });
    const k = chip(c, 'e1');
    const p = centre(k);
    pointer('pointerdown', k, p.x, p.y);
    pointer('pointerup', document, p.x, p.y);
    k.click();
    expect(opens).toEqual(['e1']);
    const link = chip(c, 'e2');
    expect(link.localName).toBe('a');
    expect(link.getAttribute('href')).toBe('#demo');
    link.click();
    expect(opens).toEqual(['e1', 'e2']);
    expect(location.hash).not.toBe('#demo');
    const moves = vi.fn();
    c.addEventListener('cm-move', moves);
    const t = centre(td(c, '2026-11-27'));
    pointer('pointerdown', k, p.x, p.y);
    pointer('pointermove', document, t.x, t.y);
    expect(c.dragging).toBe(true);
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
    expect(c.dragging).toBe(false);
    pointer('pointerup', document, t.x, t.y);
    expect(moves).not.toHaveBeenCalled();
    await announced(c, /^Move cancelled/);
  });

  it('touch: press and hold picks up; a quick swipe is left to scrolling', async () => {
    const c = await mount();
    const moves = vi.fn();
    c.addEventListener('cm-move', moves);
    const k = chip(c, 'e1');
    const p = centre(k), t = centre(td(c, '2026-11-19'));
    pointer('pointerdown', k, p.x, p.y, 'touch', 7);
    pointer('pointermove', document, p.x + 30, p.y, 'touch', 7);
    await new Promise((r) => setTimeout(r, 380));
    expect(c.dragging).toBe(false);
    pointer('pointerup', document, p.x + 30, p.y, 'touch', 7);
    pointer('pointerdown', k, p.x, p.y, 'touch', 8);
    await new Promise((r) => setTimeout(r, 380));
    expect(c.dragging).toBe(true);
    pointer('pointermove', document, t.x, t.y, 'touch', 8);
    pointer('pointerup', document, t.x, t.y, 'touch', 8);
    await settle(c);
    expect(moves).toHaveBeenCalledTimes(1);
    expect(c.event('e1')!.start).toBe('2026-11-19T15:00');
  });

  it('locked events can\'t be picked up or dragged', async () => {
    const c = await mount(cal('', EVENTS.replace('value="e1"', 'value="e1" locked')));
    expect(c.pickUp('e1')).toBe(false);
    expect(chip(c, 'e1').getAttribute('aria-roledescription')).toBeNull();
    const k = chip(c, 'e1');
    const p = centre(k), t = centre(td(c, '2026-11-19'));
    pointer('pointerdown', k, p.x, p.y);
    pointer('pointermove', document, t.x, t.y);
    expect(c.dragging).toBe(false);
    pointer('pointerup', document, t.x, t.y);
  });
});

describe('cm-calendar: narrow and RTL', () => {
  it('narrow month: a compact grid of day buttons with dots, and the chosen day\'s events listed under it; fits 320px', async () => {
    await page.viewport(320, 700);
    const c = await mount(cal().replace('style="width:1100px"', ''));
    await vi.waitFor(() => expect(shadow(c, 'table').classList.contains('compact')).toBe(true));
    await settle(c);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    expect(c.getBoundingClientRect().right).toBeLessThanOrEqual(window.innerWidth);
    const day = shadow(c, '[data-k="day:2026-11-24"]');
    expect(nc(day.getAttribute('aria-label'))).toBe('Tuesday 24 November, 4 events');
    expect(day.querySelectorAll('.dot')).toHaveLength(3);
    expect(td(c, '2026-11-18').getAttribute('aria-selected')).toBe('true');
    const agenda = shadow(c, '.agenda');
    expect(nc(agenda.querySelector('[role="heading"]')!.textContent)).toBe('Wednesday 18 November');
    expect([...agenda.querySelectorAll<HTMLElement>('.chip')].map((x) => x.dataset.ev)).toEqual(['e1']);
    day.click();
    await settle(c);
    expect(c.date).toBe('2026-11-24');
    expect([...shadow(c, '.agenda').querySelectorAll<HTMLElement>('.chip')].map((x) => x.dataset.ev)).toEqual(['e4', 'e5', 'e6', 'e7']);
    // Moving from the list with the keyboard: the grid shows the target day.
    const e4 = [...shadow(c, '.agenda').querySelectorAll<HTMLElement>('.chip')][0];
    e4.focus();
    await userEvent.keyboard(' {ArrowRight}');
    await settle(c);
    expect(td(c, '2026-11-25').classList.contains('over')).toBe(true);
    await userEvent.keyboard('{Enter}');
    await settle(c);
    expect(c.event('e4')!.start).toBe('2026-11-25T09:00');
    // An empty day says so, with an Add button.
    shadow(c, '[data-k="day:2026-11-02"]').click();
    await settle(c);
    expect(shadow(c, '.agenda .empty').textContent).toBe('No events');
    expect(nc(shadow(c, '.ag-add').getAttribute('aria-label'))).toBe('Add on Monday 2 November');
  });

  it('narrow week: three days from the date; Previous/Next move three days; fits 320px', async () => {
    await page.viewport(320, 700);
    const ranges: CalendarRange[] = [];
    document.addEventListener('cm-range-change', (e) => ranges.push((e as CustomEvent<CalendarRange>).detail));
    const c = await mount(cal('view="week"').replace('style="width:1100px"', ''));
    await vi.waitFor(() => expect(c.range).toEqual({ view: 'week', start: '2026-11-18', end: '2026-11-20' }));
    await settle(c);
    expect(ranges.at(-1)).toEqual({ view: 'week', start: '2026-11-18', end: '2026-11-20' });
    expect(all(c, '.tg-top [role="columnheader"]')).toHaveLength(4);
    expect(shadow(c, '.next').getAttribute('aria-label')).toBe('Next 3 days');
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    shadow(c, '.next').click();
    await settle(c);
    expect(c.range).toEqual({ view: 'week', start: '2026-11-21', end: '2026-11-23' });
  });

  it('RTL: days run right to left, and Left and Right follow the reading direction when navigating and moving', async () => {
    const c = await mount(`<div dir="rtl">${cal()}</div>`);
    const a = td(c, '2026-11-18').getBoundingClientRect(), b = td(c, '2026-11-19').getBoundingClientRect();
    expect(b.right).toBeLessThanOrEqual(a.left + 1); // the next day is to the left
    shadow(c, '[data-k="add:2026-11-18"]').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(active(c)?.dataset.k).toBe('add:2026-11-19');
    chip(c, 'e1').focus();
    await userEvent.keyboard(' {ArrowLeft}');
    await announced(c, /^Thursday 19 November\.$/);
    await userEvent.keyboard('{Enter}');
    await settle(c);
    expect(c.event('e1')!.start).toBe('2026-11-19T15:00');
    // The week view's chips and lanes use logical sides.
    c.view = 'week';
    await settle(c);
    const tg = shadow(c, '.tg').getBoundingClientRect();
    const axis = shadow(c, '.hr .axis').getBoundingClientRect();
    expect(axis.right).toBeGreaterThan(tg.right - 80); // the hour axis is on the right
  });
});

describe('cm-calendar: built-in text', () => {
  it('every string comes from the calendar namespace and can be replaced', async () => {
    setStrings({ calendar: { today: 'Aujourd\'hui', month: 'Mois', addOn: 'Ajouter le {date}', more: '+{count} de plus', label: 'Agenda' } });
    const c = await mount(cal().replace('label="Outreach planner" ', ''));
    expect(shadow(c, '.hb.today').textContent!.trim()).toBe('Aujourd\'hui');
    expect(all(c, '.views .hb')[0].textContent!.trim()).toBe('Mois');
    expect(shadow(c, '.cal').getAttribute('aria-label')).toBe('Agenda');
    expect(nc(shadow(c, '[data-k="add:2026-11-18"]').getAttribute('aria-label'))).toBe('Ajouter le Wednesday 18 November');
    expect(shadow(c, '[data-k="more:2026-11-24"]').textContent!.trim()).toBe('+2 de plus');
    c.strings = { today: 'Heute' };
    await settle(c);
    expect(shadow(c, '.hb.today').textContent!.trim()).toBe('Heute');
  });

  it('12- or 24-hour clock from the locale, or hour-cycle', async () => {
    const c = await mount(cal('view="week"').replace('hour-cycle="h12" ', ''));
    expect(chip(c, 'e1').getAttribute('aria-label')).toMatch(/15:00 to 15:30/);
    expect(shadow(c, '.hr:nth-child(16) .axis').textContent!.trim()).toBe('15:00');
    c.hourCycle = 'h12';
    await settle(c);
    expect(chip(c, 'e1').getAttribute('aria-label')).toMatch(/3:00 to 3:30\s?pm/i);
  });
});

describe('cm-calendar day start after loading (issue #34)', () => {
  it('changing day-start after render scrolls the week view again, and scrollToHour scrolls on demand', async () => {
    document.body.innerHTML = `<div style="width:1200px"><cm-calendar view="week" date="2026-11-18" today="2026-11-16" day-start="8" style="--cm-calendar-hour-height:48px;height:500px"></cm-calendar></div>`;
    const c = document.querySelector('cm-calendar') as any;
    await c.updateComplete; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
    const tg = c.shadowRoot.querySelector('.tg') as HTMLElement;
    const cell = tg.querySelector('.tcell') as HTMLElement;
    expect(Math.round(tg.scrollTop / cell.offsetHeight)).toBe(8);
    c.dayStart = 11; await c.updateComplete; // within what a 500px-tall grid can scroll to
    expect(Math.round(tg.scrollTop / cell.offsetHeight)).toBe(11);
    c.scrollToHour(6);
    expect(Math.round(tg.scrollTop / cell.offsetHeight)).toBe(6);
  });
});

describe('cm-calendar: chip text with a label', () => {
  const labelled = ev('s1', 'Summer sale reel', '2026-11-18T10:00', '2026-11-18T10:30', 'label="Summer sale reel, scheduled, 10:00"');
  for (const view of ['week', 'month', 'day']) {
    it(`draws the heading, not the label, in the ${view} view`, async () => {
      const c = await mount(cal(`view="${view}"`, labelled));
      const x = chip(c, 's1');
      expect(x).toBeTruthy();
      expect(x.querySelector('.h')!.textContent).toBe('Summer sale reel');
      expect(x.getAttribute('aria-label')).toContain('scheduled');
    });
  }
});
