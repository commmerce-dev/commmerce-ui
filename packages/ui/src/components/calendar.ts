import { LitElement, html, css, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { base, define, logicalKey, nextId } from '../base.js';
import { CmLocalizedElement, defineStrings, formatDate } from '../localize.js';
import { MoveModel, Announcer, type MovePlace } from '../move-model.js';
import {
  fromISO, toISO, addDays, addMonths, startOfMonth, endOfMonth, splitDateTime, fromISODateTime, todayISO,
  timeFormat, resolveLocale, localeFirstDay, dateFormat, type TimeFormat, type DateFormat,
} from '../calendar.js';
import './icon.js';
import './spinner.js';

const strings = defineStrings('calendar', {
  /** Accessible name of the calendar when it has no `label`. */
  label: 'Calendar',
  /** Header buttons. */
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousWeek: 'Previous week',
  nextWeek: 'Next week',
  /** The narrow week view shows three days at a time. */
  previousDays: 'Previous {count} days',
  nextDays: 'Next {count} days',
  previousDay: 'Previous day',
  nextDay: 'Next day',
  today: 'Today',
  /** The group of view buttons, and the buttons. */
  views: 'View',
  month: 'Month',
  week: 'Week',
  day: 'Day',
  /** Row heading of all-day events in the week and day views. */
  allDay: 'All day',
  /** Heading of the hour column in the week and day views (read by screen readers only). */
  time: 'Time',
  /** The visible text of the Add button above the day's list on narrow screens. */
  add: 'Add',
  /** The "+" button of a day in the month view, and the Add button of the day's list. `{date}` e.g. "Wednesday 18 November". */
  addOn: 'Add on {date}',
  /** The "+" button in the all-day row of the week and day views. */
  addAllDay: 'Add an all-day event on {date}',
  /** An empty hour in the week and day views. `{time}` e.g. "3:00 pm". */
  addAt: 'Add at {time}, {date}',
  /** The overflow button of a month day, visible text. */
  more: '+{count} more',
  /** The overflow button's accessible name. */
  moreLabel: '{count} more on {date}',
  /** A day button in the narrow month view. */
  dayEvents: { one: '{date}, {count} event', other: '{date}, {count} events' },
  /** The day's list with nothing in it. */
  noEvents: 'No events',
  /** Announced while `loading`. */
  loading: 'Loading events',
  /** A time range: "3:00 to 3:30 pm". `{start}` and `{end}` are formatted for the locale (a shared am/pm is written once). */
  timeRange: '{start} to {end}',
  /** When an event happens, in its accessible name. */
  timed: '{date}, {time}',
  allDayOn: '{date}, all day',
  allDayRange: '{start} to {end}, all day',
  /** An event's accessible name: "Call Ravi Stores, Wednesday 18 November, 3:00 to 3:30 pm, Follow-up". */
  eventName: '{title}, {when}',
  eventNameKind: '{title}, {when}, {kind}',
  /** What screen readers call a movable event, after its name. */
  roleDescription: 'movable event',
  /** Read after an event's name. */
  openHint: 'Press Enter to open.',
  instructions: 'Press Space to pick up, then the arrow keys to choose a day or time, Space or Enter to drop and Escape to cancel.',
  /** Read with the grid. */
  gridHelp: 'Use the arrow keys to move between days, times and events, and Page Up and Page Down for the previous or next period.',
  /** Added to an event's name while its move is saved (`pending`). */
  saving: 'Saving',
  /** Move announcements. `{event}` the event's title, `{place}` a day ("Thursday 19 November") or a day and time. */
  pickedUp: 'Picked up {event}. {place}.',
  over: '{place}.',
  moved: 'Moved {event} to {place}.',
  sameSpot: '{event} dropped where it started.',
  cancelled: 'Move cancelled. {event} is back on {place}.',
  refused: '{event} can\'t be moved to {place}.',
  reverted: 'Couldn\'t move {event}. It is back on {place}.',
});
declare module '../localize.js' {
  interface CmStrings { calendar: typeof strings }
}

export type CalendarView = 'month' | 'week' | 'day';
export type CalendarEventTone = 'neutral' | 'attention' | 'information' | 'success' | 'critical';
/** How an event was moved: dragged with a pointer, moved with the keyboard, or by calling `moveEvent()`. */
export type CalendarMoveSource = 'pointer' | 'keyboard' | 'api';

/** Start and end of an event, as local ISO strings: `yyyy-mm-dd` for all-day events (end = last day), else `yyyy-mm-ddThh:mm`. */
export interface CalendarTimes { start: string; end: string }

/** `detail` of `cm-move`. */
export interface CalendarMoveDetail {
  /** The event's `value`. */
  value: string;
  /** The `cm-calendar-event` element. */
  event: CmCalendarEvent;
  /** Where it was and where it goes. */
  from: CalendarTimes;
  to: CalendarTimes;
  /** An all-day event (times are dates then). */
  allDay: boolean;
  source: CalendarMoveSource;
  /**
   * Call with the promise that saves the move: the event shows as saving (`pending`) until it settles; if it
   * rejects, the calendar puts the event back (`revert()`) and announces it. Call it during the event.
   */
  waitUntil(promise: Promise<unknown>): void;
}

/** `detail` of `cm-range-change`: the view and the first and last day shown (ISO dates, both included). */
export interface CalendarRange { view: CalendarView; start: string; end: string }

/** `detail` of `cm-add`. */
export interface CalendarAddDetail {
  /** `yyyy-mm-dd` from a day in the month view or the all-day row; `yyyy-mm-ddThh:mm` from an hour in the week and day views. */
  start: string;
  /** True for a day (month view, all-day row). */
  allDay: boolean;
  view: CalendarView;
}

/**
 * One event on a `cm-calendar`: a call, a follow-up, a demo. It shows nothing itself: the calendar draws it as a
 * chip in every view. Set `start` (and `end`) as local ISO date-times, or dates with `all-day`.
 * @element cm-calendar-event
 * @slot - The title, when `heading` is not set.
 */
export class CmCalendarEvent extends LitElement {
  static properties = {
    value: { reflect: true },
    heading: {},
    label: {},
    start: {},
    end: {},
    allDay: { type: Boolean, attribute: 'all-day', reflect: true },
    kind: {},
    tone: { reflect: true },
    icon: {},
    href: {},
    locked: { type: Boolean, reflect: true },
    pending: { type: Boolean, reflect: true },
    moving: { type: Boolean, reflect: true },
  };

  /** Identifies the event in `cm-move` and `cm-open` (e.g. its id). Defaults to the title. */
  value = '';
  /** The title, e.g. "Call Ravi Stores". */
  heading = '';
  /** The title for screen readers and announcements, when it should differ from `heading`. */
  label = '';
  /** Local start, ISO `yyyy-mm-ddThh:mm`; for an all-day event `yyyy-mm-dd` (a date alone makes it all-day). */
  start = '';
  /** Local end, ISO `yyyy-mm-ddThh:mm` (default: 30 minutes after `start`); for an all-day event, its last day `yyyy-mm-dd` (default: the start day). */
  end = '';
  /** Lasts the whole day (or days): shown in the all-day row of the week and day views, and first in a month day. */
  allDay = false;
  /** What it is, in a word or two: "Follow-up", "Demo", "Call". Shown on the chip and read in its name, so colour is never the only signal. */
  kind = '';
  /** Colour of the chip, from the semantic tones. Pick one per kind and keep it. */
  tone: CalendarEventTone = 'neutral';
  /** A `cm-icon` name shown before the title (e.g. `phone` for calls). The month view shows the icon instead of `kind`. */
  icon = '';
  /** Makes the chip a link to the record. Without it, activating the chip fires `cm-open`. */
  href = '';
  /** The event can't be moved (e.g. no permission). It can still be opened. */
  locked = false;
  /** The move is being saved: the chip is greyed and can't be moved again until it is cleared. Set by `waitUntil()` in `cm-move`, or by you. */
  pending = false;
  /** Set by the calendar while the event is picked up or dragged. Read it for styling; don't set it. */
  moving = false;

  static styles = css`:host { display: none !important; }`;

  /** The event's name: `label`, `heading`, or its text. */
  get name(): string {
    return this.label || this.heading || (this.textContent ?? '').replace(/\s+/g, ' ').trim();
  }

  /** The value used in events: `value`, or the name. */
  get key(): string { return this.value || this.name; }

  protected updated() {
    const p = this.parentElement;
    if (p?.localName === 'cm-calendar') (p as CmCalendar).requestUpdate();
  }

  render() { return nothing; }
}
define('cm-calendar-event', CmCalendarEvent);

/** An event read from its element: dates resolved, the days it shows on. */
type Ev = {
  el: CmCalendarEvent; key: string; name: string; allDay: boolean;
  /** The title drawn on the chip: `heading`, or the text. The `label` is only read by screen readers. */
  text: string;
  /** Timed: start and end. All-day: the first and last day at midnight. */
  start: Date; end: Date;
  /** Minutes from midnight of the start day (timed). */
  min: number;
  /** Length in minutes (timed). */
  dur: number;
  /** ISO days it shows on: its start day, or every day of an all-day event. */
  days: string[];
};
type Held = { ev: Ev; origin: string; mode: 'day' | 'time'; from: MovePlace };
type Drag = Held & {
  pointerId: number; type: string; x0: number; y0: number; x: number; y: number; started: boolean;
  grab: number; to: MovePlace; timer?: ReturnType<typeof setTimeout>; raf?: number;
};

const pad = (n: number) => String(n).padStart(2, '0');
const isoTime = (d: Date) => `${toISO(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const dayDiff = (a: Date, b: Date) => Math.round((Date.UTC(b.getFullYear(), b.getMonth(), b.getDate()) - Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())) / 864e5);
const VIEWS: CalendarView[] = ['month', 'week', 'day'];
const NARROW = 600;
const rangeFormats = new Map<string, Intl.DateTimeFormat>();
const dtf = (locale: string, o: Intl.DateTimeFormatOptions) => {
  const k = `${locale}|${JSON.stringify(o)}`;
  let f = rangeFormats.get(k);
  if (!f) { f = new Intl.DateTimeFormat(locale, o); rangeFormats.set(k, f); }
  return f;
};
const spaces = (s: string) => s.replace(/[  ]/g, ' ').trim();

/**
 * A calendar of events in month, week and day views: an outreach planner of calls, follow-ups and demos. Events are
 * `cm-calendar-event` children; the calendar draws them as chips with a kind and a colour.
 *
 * The header has Previous, Today and Next, the range shown and a view switch. Each change of view or range fires
 * `cm-range-change` with the days shown, so the app loads their events. Events move between days (month, week) and
 * times (week, day) by dragging (on touch, press and hold first) or with the keyboard: focus an event, press Space,
 * choose a day or time with the arrow keys and press Enter. Each move fires a cancelable `cm-move`. A "+" on each
 * day (and each hour in the week and day views) fires `cm-add`.
 *
 * When the calendar is narrower than 600px the month view becomes a compact grid with the chosen day's events
 * listed under it, and the week view shows three days.
 * @element cm-calendar
 * @slot - `cm-calendar-event` elements, in any order.
 * @fires cm-range-change - When the days shown change (view, Previous/Next/Today, `date`, or the width crossing 600px), and once on first render. `detail: { view, start, end }` (ISO dates, both included). Load the events for those days.
 * @fires cm-move - Before an event moves. Cancelable: `preventDefault()` keeps it where it was. `detail: { value, event, from: { start, end }, to: { start, end }, allDay, source, waitUntil }` (see `CalendarMoveDetail`).
 * @fires cm-add - From a "+" button or an empty hour. `detail: { start, allDay, view }`: `start` is `yyyy-mm-dd` for a day, `yyyy-mm-ddThh:mm` for an hour.
 * @fires cm-open - When an event chip is activated (click or Enter). `detail: { value, event }`. Cancelable: on a chip with `href`, `preventDefault()` stops the link.
 * @csspart header - The row with the navigation, the range and the view switch.
 * @csspart title - The range shown ("November 2026").
 * @csspart grid - The month table, or the week and day time grid.
 * @csspart agenda - The chosen day's list under the narrow month view.
 * @cssprop --cm-calendar-hour-height - Height of an hour in the week and day views. Default 48px.
 * @cssprop --cm-calendar-time-height - Most height of the scrolling week and day views. Default 600px.
 * @cssprop --cm-calendar-day-height - Height of a day in the month view. Default 112px.
 */
export class CmCalendar extends CmLocalizedElement {
  static properties = {
    view: { reflect: true },
    date: { reflect: true },
    today: {},
    label: { string: 'label' },
    step: { type: Number },
    locale: { noAccessor: true },
    firstDayOfWeek: { type: Number, attribute: 'first-day-of-week' },
    hourCycle: { attribute: 'hour-cycle' },
    dayStart: { type: Number, attribute: 'day-start' },
    maxEvents: { type: Number, attribute: 'max-events' },
    headingLevel: { type: Number, attribute: 'heading-level' },
    loading: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    controlled: { type: Boolean, reflect: true },
    dragging: { type: Boolean, reflect: true },
    _narrow: { state: true },
    _more: { state: true },
    _target: { state: true },
  };

  /** `month`, `week` or `day`. */
  view: CalendarView = 'month';
  /** A day in the range shown, ISO `yyyy-mm-dd`. Previous, Next and Today change it. Empty: today. On narrow screens it is also the day listed under the month. */
  date = '';
  /** Today's date, ISO `yyyy-mm-dd`, for the Today button and the highlight. Empty: the device's date. Set it from your server, or to fix the date in tests. */
  today = '';
  /** Accessible name of the calendar, e.g. "Outreach planner". Default: the built-in string `label` ("Calendar"). */
  label!: string;
  /** Minutes events snap to when moved in the week and day views (1 to 240). Default 15. */
  step = 15;
  #localeProp = '';
  /** BCP 47 language for month and weekday names, times and the first day of the week. Empty: the same language as every other component. */
  get locale(): string { return this.#localeProp; }
  set locale(v: string) { const old = this.#localeProp; this.#localeProp = v ?? ''; this.requestUpdate('locale', old); }
  /** First day of the week: 0 = Sunday, 1 = Monday … 6 = Saturday. Defaults to the locale's custom where the browser knows it (as in `cm-date-picker`), else Sunday. */
  firstDayOfWeek?: number;
  /** `h12` or `h23` to force a 12- or 24-hour clock. Empty: the locale's clock. */
  hourCycle: '' | 'h12' | 'h23' = '';
  /** The hour the week and day views scroll to when they open (0 to 23). Default 8. */
  dayStart = 8;
  /** Most chips in a month day; with more, the last place shows "+N more", which lists the whole day. Default 3. */
  maxEvents = 3;
  /** Level of the range heading for screen readers (1 to 6). Default 2. */
  headingLevel = 2;
  /** Events are loading: the grid is busy and "Loading events" is announced. */
  loading = false;
  /** No "+" buttons and no moving: events can only be opened. */
  readonly = false;
  /**
   * You move the events: the calendar fires `cm-move` but never changes `start` and `end`. Change them (or re-render
   * the event) in your `cm-move` listener. Use it with React, Vue and other frameworks that render from data.
   */
  controlled = false;
  /** Set while an event is dragged with a pointer. Read it for styling; don't set it. */
  dragging = false;

  _narrow = false;
  /** The day whose "+N more" list is open. */
  _more = '';
  /** Where the moving event would land. */
  _target: { iso: string; min?: number } | null = null;

  #id = nextId('cm-cal');
  #announcer = new Announcer();
  #model: MoveModel;
  #held: Held | null = null;
  #drag: Drag | null = null;
  #history = new WeakMap<CmCalendarEvent, CalendarTimes>();
  #focusKey = '';
  #pendingFocus: { key: string; until: number } | null = null;
  #lastRange = '';
  #scrollToStart = true;
  #quietUntil = 0;
  #focusPop = false;
  #ro?: ResizeObserver;
  #roFrame = 0;
  #mo = new MutationObserver(() => this.requestUpdate());

  constructor() {
    super();
    this.#model = new MoveModel({
      groupCount: () => this.#days().length,
      slotCount: () => (!this.#held ? 0 : this.#held.mode === 'day' ? 1 : this.#slots(this.#held.ev.dur)),
      navigate: (key, at) => this.#moveKey(key, at),
      onTarget: (at) => this.#showTarget(at),
      onDrop: (from, to) => this.#keyboardDrop(from, to),
      onCancel: () => this.#release(),
      messages: {
        pickedUp: (at) => this.t('pickedUp', { event: this.#held?.ev.name ?? '', place: this.#placeText(this.#held!, at) }),
        over: (at) => this.t('over', { place: this.#placeText(this.#held!, at) }),
        cancelled: (from) => this.t('cancelled', { event: this.#held?.ev.name ?? '', place: this.#placeText(this.#held!, from) }),
      },
      announce: (text) => this.#announcer.announce(text),
    });
  }

  static styles = [
    base,
    css`
      :host { display: block; position: relative; min-width: 0; font-size: 14px; line-height: 20px; }
      :host([dragging]) { cursor: grabbing; user-select: none; -webkit-user-select: none; }
      .cal { display: flex; flex-direction: column; gap: var(--cm-space-12); min-width: 0; }
      button { font: inherit; color: inherit; margin: 0; }
      [hidden] { display: none !important; }
      .vh {
        position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden;
        clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; border: 0;
      }
      :focus-visible { outline: 2px solid var(--cm-border-strong); outline-offset: 2px; }

      /* Header */
      .head { display: flex; flex-wrap: wrap; align-items: center; gap: var(--cm-space-8) var(--cm-space-12); }
      .nav { display: flex; align-items: center; gap: 4px; }
      .title { flex: 1 1 10rem; min-width: 0; margin: 0; font-size: var(--cm-type-heading-sm-size); line-height: var(--cm-type-heading-sm-line-height); font-weight: 600; display: flex; align-items: center; gap: var(--cm-space-8); }
      .hb {
        display: inline-flex; align-items: center; justify-content: center; height: var(--cm-control-height-md); min-width: var(--cm-control-height-md); padding: 0 var(--cm-space-12);
        background: var(--cm-bg-surface); color: var(--cm-text-default); border: var(--cm-border-1) solid var(--cm-border-input);
        border-radius: var(--cm-radius-sm); cursor: pointer; white-space: nowrap;
      }
      .hb.icon { padding: 0; color: var(--cm-icon-selected); }
      .hb:hover { background: var(--cm-bg-hover); }
      .views { display: inline-flex; }
      .views .hb { border-radius: 0; }
      .views .hb:first-child { border-start-start-radius: var(--cm-radius-sm); border-end-start-radius: var(--cm-radius-sm); }
      .views .hb:last-child { border-start-end-radius: var(--cm-radius-sm); border-end-end-radius: var(--cm-radius-sm); }
      .views .hb + .hb { margin-inline-start: -1px; }
      .views .hb[aria-pressed='true'] { background: var(--cm-action-primary); color: var(--cm-action-primary-text); border-color: var(--cm-action-primary); position: relative; }

      /* Chips */
      .chip {
        position: relative; display: flex; align-items: center; gap: 4px; width: 100%; min-width: 0; min-height: 24px; padding: 2px var(--cm-space-4);
        border: 0; border-inline-start: 3px solid var(--bar); border-radius: var(--cm-radius-xs);
        background: linear-gradient(var(--fill), var(--fill)), var(--cm-bg-surface); color: var(--cm-text-default);
        font-size: 12px; line-height: 16px; text-align: start; text-decoration: none; white-space: nowrap; overflow: hidden;
        cursor: grab; touch-action: manipulation; -webkit-touch-callout: none;
      }
      :host([readonly]) .chip, .chip.locked { cursor: pointer; }
      .chip:focus-visible { outline: 2px solid var(--cm-border-strong); outline-offset: 1px; z-index: 2; }
      .chip > * { flex: none; }
      .chip .h { flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; font-weight: 500; }
      .chip .k { flex: 0 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
      .chip .tm { font-variant-numeric: tabular-nums; }
      .tone-neutral { --fill: var(--cm-bg-tag); --bar: var(--cm-text-tertiary); }
      .tone-attention { --fill: var(--cm-bg-attention); --bar: var(--cm-text-attention); }
      .tone-information { --fill: var(--cm-bg-information-soft); --bar: var(--cm-text-information); }
      .tone-success { --fill: var(--cm-bg-success-soft); --bar: var(--cm-text-success); }
      .tone-critical { --fill: var(--cm-bg-critical); --bar: var(--cm-text-critical); }
      .chip.moving { outline: 2px dashed var(--cm-border-strong); outline-offset: -2px; background: var(--cm-bg-page); }
      .chip.pending { background: var(--cm-bg-page); cursor: progress; }
      .spin {
        flex: none; width: 12px; height: 12px; border: 2px solid currentColor; border-inline-end-color: transparent; border-radius: 50%;
        animation: cm-cal-spin 0.8s linear infinite;
      }
      @keyframes cm-cal-spin { to { transform: rotate(360deg); } }
      @media (prefers-reduced-motion: reduce) { .spin { animation-duration: 2.4s; } }
      .ph {
        display: flex; align-items: center; min-height: 24px; padding: 2px var(--cm-space-4); border: 2px dashed var(--cm-border-strong);
        border-radius: var(--cm-radius-xs); background: var(--cm-bg-surface); color: var(--cm-text-tertiary);
        font-size: 12px; line-height: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; pointer-events: none;
      }

      /* Month */
      /* Separate borders: collapsed ones spill half a pixel outside the table (sideways scroll at 320px in WebKit). */
      .month { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; background: var(--cm-bg-surface); border: var(--cm-border-1) solid var(--cm-border-subtle); }
      .month th { padding: var(--cm-space-4) var(--cm-space-8); font-size: 12px; line-height: 16px; font-weight: 500; color: var(--cm-text-tertiary); text-align: start; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .month td {
        position: relative; vertical-align: top; height: var(--cm-calendar-day-height, 112px); padding: 4px;
        border: 0; border-block-start: var(--cm-border-1) solid var(--cm-border-subtle); border-inline-start: var(--cm-border-1) solid var(--cm-border-subtle);
        background: var(--cm-bg-surface);
      }
      .month td:first-child { border-inline-start: 0; }
      .month td.other { background: var(--cm-bg-page); }
      .month td.over { box-shadow: inset 0 0 0 2px var(--cm-border-strong); }
      .dh { display: flex; align-items: center; justify-content: space-between; gap: 4px; min-height: 28px; }
      .num {
        display: inline-grid; place-items: center; min-width: 24px; height: 24px; padding: 0 4px; border-radius: var(--cm-radius-full);
        font-size: 12px; line-height: 16px; font-weight: 500;
      }
      .other .num { color: var(--cm-text-tertiary); }
      .today .num, .colh.today .dn { background: var(--cm-action-primary); color: var(--cm-action-primary-text); }
      .add, .xb {
        display: grid; place-items: center; width: 28px; height: 28px; padding: 0; border: 0; border-radius: var(--cm-radius-sm);
        background: none; color: var(--cm-icon-selected); cursor: pointer;
      }
      .add:hover, .xb:hover { background: var(--cm-bg-hover); }
      @media (hover: hover) {
        .month td:not(:hover) .add:not(:focus-visible), .adcell:not(:hover) .add:not(:focus-visible) { opacity: 0; }
      }
      .evs { list-style: none; margin: 2px 0 0; padding: 0; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
      .evs li { display: block; min-width: 0; }
      .more {
        display: block; width: 100%; min-height: 24px; margin-block-start: 2px; padding: 2px var(--cm-space-4); border: 0; border-radius: var(--cm-radius-xs);
        background: none; color: var(--cm-text-default); font-size: 12px; line-height: 16px; font-weight: 500; text-align: start; cursor: pointer;
      }
      .more:hover { background: var(--cm-bg-hover); text-decoration: underline; }
      .pop {
        position: absolute; z-index: 5; inset-block-start: 0; inset-inline-start: 0; width: max(100%, 15rem); max-width: 80vw;
        padding: var(--cm-space-8); background: var(--cm-bg-surface); border: var(--cm-border-1) solid var(--cm-border-subtle);
        border-radius: var(--cm-radius-md); box-shadow: var(--cm-shadow-md);
      }
      .pop.end { inset-inline-start: auto; inset-inline-end: 0; }
      .pop-h { display: flex; align-items: center; justify-content: space-between; gap: var(--cm-space-8); margin-block-end: var(--cm-space-4); font-size: 14px; font-weight: 500; }
      .pop ul, .ag-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
      .chip.list { min-height: 40px; padding: var(--cm-space-4) var(--cm-space-8); flex-wrap: wrap; column-gap: var(--cm-space-8); row-gap: 0; white-space: normal; font-size: 14px; line-height: 20px; }
      .chip.list .h { flex: 1 1 8rem; overflow-wrap: anywhere; }
      .chip.list .k { font-size: 12px; }

      /* Narrow month: a compact grid and the day's list */
      .month.compact td { height: auto; padding: 2px; }
      .month.compact th { padding: 4px 2px; text-align: center; }
      .dayb {
        display: flex; flex-direction: column; align-items: center; gap: 2px; width: 100%; min-height: 44px; padding: 4px 0;
        border: 0; border-radius: var(--cm-radius-sm); background: none; cursor: pointer;
      }
      .dayb:hover { background: var(--cm-bg-hover); }
      td[aria-selected='true'] .num { box-shadow: 0 0 0 2px var(--cm-border-strong); }
      .dots { display: flex; gap: 2px; height: 6px; } /* scale-exempt: event dots are a mark, not a layout size */
      .dot { width: 6px; height: 6px; /* scale-exempt: event dot */ border-radius: var(--cm-radius-full); background: var(--bar); }
      .agenda { display: flex; flex-direction: column; gap: var(--cm-space-8); }
      .ag-h { display: flex; align-items: center; justify-content: space-between; gap: var(--cm-space-8); }
      .ag-t { margin: 0; font-size: 16px; line-height: 24px; font-weight: 600; }
      .empty { margin: 0; padding: var(--cm-space-12) 0; color: var(--cm-text-tertiary); font-size: 14px; }

      /* Week and day */
      .tg {
        --h: var(--cm-calendar-hour-height, 48px); --axis: 56px;
        position: relative; max-block-size: var(--cm-calendar-time-height, 600px); overflow-y: auto; overscroll-behavior: contain;
        border: var(--cm-border-1) solid var(--cm-border-subtle); border-radius: var(--cm-radius-md); background: var(--cm-bg-surface);
        scroll-padding-block-start: 104px;
      }
      .narrow .tg { --axis: 44px; }
      .row { display: grid; grid-template-columns: var(--axis) repeat(var(--cols), minmax(0, 1fr)); }
      .tg-top { position: sticky; inset-block-start: 0; z-index: 4; background: var(--cm-bg-surface); border-block-end: var(--cm-border-1) solid var(--cm-border-subtle); }
      .colh { padding: var(--cm-space-4) 2px; text-align: center; font-size: 12px; line-height: 16px; color: var(--cm-text-tertiary); border-inline-start: var(--cm-border-1) solid var(--cm-border-subtle); min-width: 0; overflow: hidden; }
      .colh .dn { display: inline-grid; place-items: center; min-width: 28px; height: 28px; margin-block-start: 2px; padding: 0 4px; border-radius: var(--cm-radius-full); font-size: 16px; line-height: 24px; font-weight: 500; color: var(--cm-text-default); }
      .colh .wd { display: block; }
      .axis { padding-inline-end: var(--cm-space-8); font-size: 12px; line-height: 16px; color: var(--cm-text-tertiary); text-align: end; }
      .adrow .axis { align-self: center; padding-block: 4px; overflow-wrap: anywhere; }
      .adcell { position: relative; display: flex; flex-direction: column; gap: 2px; min-width: 0; padding: 4px; min-height: 36px; border-inline-start: var(--cm-border-1) solid var(--cm-border-subtle); }
      .adcell.over { box-shadow: inset 0 0 0 2px var(--cm-border-strong); }
      .adcell .add { align-self: flex-end; width: 24px; height: 24px; }
      .hr .axis span { position: relative; inset-block-start: -8px; }
      .hr:first-child .axis span { inset-block-start: 0; }
      .tcell { position: relative; block-size: var(--h); min-width: 0; border-inline-start: var(--cm-border-1) solid var(--cm-border-subtle); border-block-start: var(--cm-border-1) solid var(--cm-border-subtle); }
      .hr:first-child .tcell { border-block-start: 0; }
      .slot { position: absolute; inset: 0; width: 100%; height: 100%; padding: 0; border: 0; background: none; cursor: pointer; color: var(--cm-icon-selected); font-size: 16px; line-height: 1; }

      .slot:hover { background: var(--cm-bg-hover); }
      .slot:hover::after, .slot:focus-visible::after { content: '+'; }
      .slot:focus-visible { outline-offset: -2px; }
      .chip.time {
        position: absolute; z-index: 1; flex-direction: column; align-items: stretch; gap: 0; padding: 2px 4px;
        inset-inline-start: calc(var(--lane) * 100% / var(--lanes)); width: calc(100% / var(--lanes) - 2px);
        inset-block-start: calc(var(--top) * var(--h)); height: calc(var(--len) * var(--h) - 1px); min-height: 24px;
        box-shadow: 0 0 0 1px var(--cm-bg-surface);
      }
      .chip.time > * { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .chip.time .lead { display: flex; align-items: center; gap: 4px; min-width: 0; }
      .ph.time { position: absolute; z-index: 3; inset-inline: 0 2px; inset-block-start: calc(var(--top) * var(--h)); height: calc(var(--len) * var(--h)); align-items: flex-start; }
    `,
  ];

  /* ---------- Reading ---------- */

  /** The `cm-calendar-event` children. */
  get events(): CmCalendarEvent[] {
    return [...this.children].filter((c) => c.localName === 'cm-calendar-event') as CmCalendarEvent[];
  }

  /** The event with this `value` (or title). */
  event(value: string): CmCalendarEvent | undefined {
    return this.events.find((e) => e.key === value);
  }

  /** The view and the first and last day shown, as in `cm-range-change`. */
  get range(): CalendarRange {
    const days = this.#days();
    return { view: this.#view, start: toISO(days[0]), end: toISO(days[days.length - 1]) };
  }

  /** The event picked up with the keyboard, if any. */
  get heldEvent(): CmCalendarEvent | null { return this.#held?.ev.el ?? null; }

  /** The last message announced (for tests and logging). */
  get announcement(): string { return this.#announcer.text; }

  /** Announces a message in the calendar's live region. */
  announce(text: string) { this.#announcer.announce(text); }

  // oxlint-disable-next-line unicorn/no-accessor-recursion -- reads the public `view` property, not this private `#view` getter
  get #view(): CalendarView { return VIEWS.includes(this.view) ? this.view : 'month'; }
  get #loc() { return resolveLocale(this, this.locale); }
  get #fmt(): DateFormat { return dateFormat(this.#loc); }
  get #tf(): TimeFormat { return timeFormat(this.#loc, this.hourCycle); }
  // oxlint-disable-next-line unicorn/no-accessor-recursion -- reads the public `step` property, not this private `#step` getter
  get #step() { const n = Math.trunc(Number(this.step)); return n >= 1 && n <= 240 ? n : 15; }
  get #firstDay() {
    const n = Number(this.firstDayOfWeek);
    return this.firstDayOfWeek == null || Number.isNaN(n) ? localeFirstDay(this.#loc) : ((Math.trunc(n) % 7) + 7) % 7;
  }
  get #todayISO() { return fromISO(this.today) ? this.today : todayISO(); }
  get #anchor(): Date { return fromISO(this.date) ?? fromISO(this.#todayISO)!; }
  get #compact() { return this.#view === 'month' && this._narrow; }
  get #timeView() { return this.#view !== 'month'; }

  /** The days shown, in order. */
  #days(): Date[] {
    const a = this.#anchor;
    const fd = this.#firstDay;
    if (this.#view === 'day') return [a];
    if (this.#view === 'week') {
      if (this._narrow) return [a, addDays(a, 1), addDays(a, 2)];
      const s = addDays(a, -((a.getDay() - fd + 7) % 7));
      return Array.from({ length: 7 }, (_, i) => addDays(s, i));
    }
    const first = startOfMonth(a);
    const s = addDays(first, -((first.getDay() - fd + 7) % 7));
    const n = Math.ceil((dayDiff(s, endOfMonth(a)) + 1) / 7) * 7;
    return Array.from({ length: n }, (_, i) => addDays(s, i));
  }

  #parse(el: CmCalendarEvent): Ev | null {
    const name = el.name;
    const text = el.heading || (el.textContent ?? '').replace(/\s+/g, ' ').trim() || name;
    const dateOnly = !!fromISO(el.start);
    const allDay = el.allDay || dateOnly;
    if (allDay) {
      const s = fromISO(splitDateTime(el.start).date || el.start);
      if (!s) return null;
      let e = fromISO(splitDateTime(el.end).date || el.end) ?? s;
      if (e < s) e = s;
      const n = Math.min(dayDiff(s, e), 366);
      return { el, key: el.key, name, text, allDay, start: s, end: e, min: 0, dur: 1440, days: Array.from({ length: n + 1 }, (_, i) => toISO(addDays(s, i))) };
    }
    const s = fromISODateTime(el.start);
    if (!s) return null;
    let e = fromISODateTime(el.end);
    if (!e || e <= s) e = new Date(s.getTime() + 30 * 60000);
    const dur = Math.max(1, Math.round((e.getTime() - s.getTime()) / 60000));
    return { el, key: el.key, name, text, allDay, start: s, end: e, min: s.getHours() * 60 + s.getMinutes(), dur, days: [toISO(s)] };
  }

  #parsed(): Ev[] {
    return this.events.map((e) => this.#parse(e)).filter((e): e is Ev => !!e);
  }

  /** Events by ISO day: all-day first, then by start time, then by name. */
  #byDay(evs: Ev[]): Map<string, Ev[]> {
    const m = new Map<string, Ev[]>();
    for (const ev of evs) for (const d of ev.days) (m.get(d) ?? m.set(d, []).get(d)!).push(ev);
    for (const list of m.values()) {
      list.sort((a, b) => (a.allDay === b.allDay ? 0 : a.allDay ? -1 : 1) || a.start.getTime() - b.start.getTime() || a.name.localeCompare(b.name));
    }
    return m;
  }

  /* ---------- Words ---------- */

  #dayText(d: Date) { return formatDate(d, { weekday: 'long', day: 'numeric', month: 'long' }, this.#loc); }

  #timeText(min: number) { return this.#tf.format(((min % 1440) + 1440) % 1440); }

  /** "3:00 to 3:30 pm": the locale's range, with a shared am/pm written once. */
  #timeRange(s: Date, e: Date): string {
    const hc = this.hourCycle === 'h12' || this.hourCycle === 'h23' ? { hourCycle: this.hourCycle } : {};
    const f = dtf(this.#loc, { hour: 'numeric', minute: '2-digit', ...hc } as Intl.DateTimeFormatOptions) as Intl.DateTimeFormat & {
      formatRangeToParts?: (a: Date, b: Date) => Array<{ type: string; value: string; source: string }>;
    };
    try {
      if (toISO(s) === toISO(e) && f.formatRangeToParts) {
        const parts = f.formatRangeToParts(s, e);
        const firstEnd = parts.findIndex((p) => p.source === 'endRange');
        let lastStart = -1;
        parts.forEach((p, i) => { if (p.source === 'startRange') lastStart = i; });
        if (lastStart >= 0 && firstEnd > lastStart) {
          const join = (ps: typeof parts) => spaces(ps.map((p) => p.value).join(''));
          return this.t('timeRange', { start: join(parts.slice(0, lastStart + 1)), end: join(parts.slice(firstEnd)) });
        }
      }
    } catch { /* fall back below */ }
    const sameDay = toISO(s) === toISO(e);
    const at = (d: Date) => (sameDay ? this.#timeText(d.getHours() * 60 + d.getMinutes()) : this.#tf.dateTime(d));
    return this.t('timeRange', { start: at(s), end: at(e) });
  }

  #when(ev: { allDay: boolean; start: Date; end: Date }): string {
    if (ev.allDay) {
      if (toISO(ev.start) === toISO(ev.end)) return this.t('allDayOn', { date: this.#dayText(ev.start) });
      return this.t('allDayRange', { start: this.#dayText(ev.start), end: this.#dayText(ev.end) });
    }
    if (toISO(ev.start) !== toISO(ev.end) && !(ev.end.getHours() === 0 && ev.end.getMinutes() === 0 && dayDiff(ev.start, ev.end) === 1)) {
      return this.#timeRange(ev.start, ev.end);
    }
    return this.t('timed', { date: this.#dayText(ev.start), time: this.#timeRange(ev.start, ev.end) });
  }

  #name(ev: Ev): string {
    const vars = { title: ev.name, when: this.#when(ev), kind: ev.el.kind };
    return this.t(ev.el.kind ? 'eventNameKind' : 'eventName', vars);
  }

  #rangeLabel(days: Date[]): string {
    const loc = this.#loc;
    if (this.#view === 'month') return this.#fmt.monthYear(this.#anchor);
    if (days.length === 1) return formatDate(days[0], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }, loc);
    const f = dtf(loc, { day: 'numeric', month: 'short', year: 'numeric' }) as Intl.DateTimeFormat & { formatRange?: (a: Date, b: Date) => string };
    try { if (f.formatRange) return spaces(f.formatRange(days[0], days[days.length - 1])); } catch { /* below */ }
    return `${f.format(days[0])} – ${f.format(days[days.length - 1])}`;
  }

  #hourLabel(h: number) {
    if (this.#tf.hour12) return spaces(formatDate(new Date(2000, 0, 1, h), { hour: 'numeric', hourCycle: 'h12' } as Intl.DateTimeFormatOptions, this.#loc));
    return this.#timeText(h * 60);
  }

  /** The place of a move in words: a day, or a day and a time range. */
  #placeText(h: Held, at: MovePlace): string {
    const { start, end } = this.#timesAt(h, at);
    if (h.mode === 'time') return this.t('timed', { date: this.#dayText(start), time: this.#timeRange(start, end) });
    return this.#dayText(addDays(fromISO(h.origin)!, at.group - h.from.group));
  }

  /* ---------- Lifecycle ---------- */

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.#onKey);
    this.addEventListener('focusin', this.#onFocusIn);
    this.addEventListener('focusout', this.#onFocusOut);
    this.addEventListener('pointerdown', this.#onPointerDown);
    this.addEventListener('dragstart', this.#onNativeDrag);
    this.#mo.observe(this, { childList: true });
    if (typeof ResizeObserver !== 'undefined') {
      // Measured on the next frame: switching layout inside the callback would resize the calendar again in the
      // same frame ("ResizeObserver loop completed with undelivered notifications" in WebKit).
      this.#ro = new ResizeObserver(() => {
        cancelAnimationFrame(this.#roFrame);
        this.#roFrame = requestAnimationFrame(() => this.#measure());
      });
      this.#ro.observe(this);
    }
    this.#measure();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.#onKey);
    this.removeEventListener('focusin', this.#onFocusIn);
    this.removeEventListener('focusout', this.#onFocusOut);
    this.removeEventListener('pointerdown', this.#onPointerDown);
    this.removeEventListener('dragstart', this.#onNativeDrag);
    this.#mo.disconnect();
    this.#ro?.disconnect();
    cancelAnimationFrame(this.#roFrame);
    this.#model.cancel(true);
    this.#endDrag(false);
  }

  #measure() {
    const w = this.getBoundingClientRect().width;
    if (!w) return;
    const narrow = w < NARROW;
    if (narrow !== this._narrow) this._narrow = narrow;
  }

  protected willUpdate(changed: PropertyValues) {
    if (changed.has('view')) {
      this.#scrollToStart = true;
      if (changed.get('view') !== undefined) { this._more = ''; this.#model.cancel(true); }
    }
    if (changed.has('date') || changed.has('_narrow')) this._more = this._more && this.range.start <= this._more && this._more <= this.range.end ? this._more : '';
  }

  protected firstUpdated() {
    this.renderRoot.appendChild(this.#announcer.element);
  }

  /**
   * Scrolls the week or day view so `hour` (0–23) is at the top. Useful after loading events, e.g. to open at the first one.
   * Does nothing in the month view.
   */
  scrollToHour(hour: number) {
    const tg = this.renderRoot.querySelector<HTMLElement>('.tg');
    const cell = tg?.querySelector<HTMLElement>('.tcell');
    if (!tg || !cell) return;
    tg.scrollTop = cell.offsetHeight * Math.max(0, Math.min(23, Math.trunc(Number(hour)) || 0));
  }

  protected updated(changed: Map<PropertyKey, unknown>) {
    // A day-start changed after the first render (e.g. set once events have loaded) scrolls again.
    if (changed.has('dayStart') && changed.get('dayStart') !== undefined) this.#scrollToStart = true;
    this.#syncTabStops();
    if (this.#pendingFocus) {
      const el = this.#find(this.#pendingFocus.key);
      if (el) { this.#pendingFocus = null; el.focus({ preventScroll: false }); }
      else if (Date.now() > this.#pendingFocus.until) this.#pendingFocus = null;
    }
    if (this.#focusPop) {
      this.#focusPop = false;
      (this.renderRoot.querySelector<HTMLElement>('.pop .chip') ?? this.renderRoot.querySelector<HTMLElement>('.pop button'))?.focus();
    }
    const tg = this.renderRoot.querySelector<HTMLElement>('.tg');
    if (tg && this.#scrollToStart) {
      const cell = tg.querySelector<HTMLElement>('.tcell');
      const h = Math.max(0, Math.min(23, Math.trunc(Number(this.dayStart)) || 0));
      if (cell) tg.scrollTop = cell.offsetHeight * h;
      this.#scrollToStart = false;
    }
    if (!tg) this.#scrollToStart = true;
    if (this.#held && this._target) {
      this.renderRoot.querySelector('.ph')?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    }
    const r = this.range;
    const sig = `${r.view}|${r.start}|${r.end}`;
    if (sig !== this.#lastRange) {
      this.#lastRange = sig;
      this.dispatchEvent(new CustomEvent<CalendarRange>('cm-range-change', { detail: r, bubbles: true, composed: true }));
    }
  }

  /* ---------- Navigation ---------- */

  #shift(d: Date, dir: number): Date {
    if (this.#view === 'month') return addMonths(d, dir);
    if (this.#view === 'week') return addDays(d, dir * (this._narrow ? 3 : 7));
    return addDays(d, dir);
  }

  /** Shows the previous month, week (three days when narrow) or day. */
  previous() { this.date = toISO(this.#shift(this.#anchor, -1)); }
  /** Shows the next month, week (three days when narrow) or day. */
  next() { this.date = toISO(this.#shift(this.#anchor, 1)); }
  /** Shows the range with today in it. */
  goToToday() { this.date = this.#todayISO; }

  #setView(v: CalendarView) { if (this.view !== v) this.view = v; }

  /* ---------- Keyboard: focus among days, times and events ---------- */

  #items(): HTMLElement[] { return [...this.renderRoot.querySelectorAll<HTMLElement>('.item')]; }

  #find(key: string): HTMLElement | null {
    const all = [...this.renderRoot.querySelectorAll<HTMLElement>('[data-k]')];
    const exact = all.find((e) => e.dataset.k === key && e.classList.contains('item')) ?? all.find((e) => e.dataset.k === key);
    if (exact) return exact;
    if (key.startsWith('ev:') && !this.controlled) {
      const iso = key.slice(key.lastIndexOf(':') + 1);
      return all.find((e) => e.dataset.k === `more:${iso}`) ?? null;
    }
    return null;
  }

  #defaultKey(): string {
    const iso = toISO(this.#anchor);
    if (this.#compact) return `day:${iso}`;
    if (this.#view === 'month') return this.readonly ? `cell:${iso}` : `add:${iso}`;
    const h = Math.max(0, Math.min(23, Math.trunc(Number(this.dayStart)) || 0));
    return `slot:${iso}:${h}`;
  }

  /** One Tab stop for the grid: the item last focused, else the chosen day's. */
  #syncTabStops() {
    const items = this.#items();
    if (!items.length) return;
    const active = items.find((i) => i.dataset.k === this.#focusKey) ?? items.find((i) => i.dataset.k === this.#defaultKey())
      ?? items.find((i) => i.dataset.day === toISO(this.#anchor)) ?? items[0];
    for (const i of items) i.tabIndex = i === active ? 0 : -1;
  }

  #focusItem(el: HTMLElement) {
    this.#focusKey = el.dataset.k ?? '';
    for (const i of this.#items()) i.tabIndex = i === el ? 0 : -1;
    el.focus();
  }

  #onFocusIn = (e: FocusEvent) => {
    const t = e.composedPath()[0] as HTMLElement;
    if (t instanceof HTMLElement && t.classList.contains('item') && t.dataset.k) {
      this.#focusKey = t.dataset.k;
      for (const i of this.#items()) i.tabIndex = i === t ? 0 : -1;
    }
  };

  #onFocusOut = (e: FocusEvent) => {
    const to = e.relatedTarget as Node | null;
    // The "+N more" list closes when focus leaves it.
    if (this._more && !this.#held) {
      const pop = this.renderRoot.querySelector('.pop');
      const t = e.composedPath()[0] as Node;
      if (pop && pop.contains(t) && !(to && pop.contains(to))) {
        queueMicrotask(() => { if (!pop.contains((this.renderRoot as ShadowRoot).activeElement)) this._more = ''; });
      }
    }
    if (!this.#model.active || !this.#held) return;
    if (!to && document.hasFocus() === false) return;
    // Wait for any re-render that moves focus to the held chip on purpose.
    this.updateComplete.then(() => setTimeout(() => {
      if (!this.#model.active || !this.#held) return;
      const a = (this.renderRoot as ShadowRoot).activeElement as HTMLElement | null;
      if (a?.dataset.ev !== this.#held.ev.key) this.#model.cancel();
    }));
  };

  /** The item an arrow key (or Home/End) moves focus to, or null. */
  #neighbour(cur: HTMLElement, key: string): HTMLElement | null {
    const byDay = new Map<number, HTMLElement[]>();
    for (const i of this.#items()) {
      const d = Number(i.dataset.i);
      (byDay.get(d) ?? byDay.set(d, []).get(d)!).push(i);
    }
    const d = Number(cur.dataset.i);
    const list = byDay.get(d) ?? [cur];
    const idx = Math.max(0, list.indexOf(cur));
    const n = this.#days().length;
    const month = this.#view === 'month';
    const row = cur.dataset.row;
    const inDay = (day: number, pick: (l: HTMLElement[]) => HTMLElement | undefined) => {
      const l = day >= 0 && day < n ? byDay.get(day) : undefined;
      return (l?.length ? pick(l) : undefined) ?? null;
    };
    const sameRow = (l: HTMLElement[]) => (month ? l[Math.min(idx, l.length - 1)] : l.find((x) => x.dataset.row === row) ?? l[0]);
    switch (key) {
      case 'ArrowRight': return inDay(d + 1, sameRow);
      case 'ArrowLeft': return inDay(d - 1, sameRow);
      case 'ArrowDown': return list[idx + 1] ?? (month ? inDay(d + 7, (l) => l[0]) : null);
      case 'ArrowUp': return idx > 0 ? list[idx - 1] : month ? inDay(d - 7, (l) => l[l.length - 1]) : null;
      case 'Home': return month ? inDay(d - (d % 7), (l) => l[0]) : inDay(0, sameRow);
      case 'End': return month ? inDay(Math.min(n - 1, d - (d % 7) + 6), (l) => l[0]) : inDay(n - 1, sameRow);
      default: return null;
    }
  }

  /** Page Up/Down: the previous or next period, with focus on the matching day. */
  #page(cur: HTMLElement, dir: number) {
    const iso = cur.dataset.day ?? toISO(this.#anchor);
    const day = this.#shift(fromISO(iso) ?? this.#anchor, dir);
    const next = toISO(day);
    const kind = (cur.dataset.k ?? '').split(':')[0];
    let key: string;
    if (this.#compact) key = `day:${next}`;
    else if (this.#view === 'month') key = this.readonly ? `cell:${next}` : `add:${next}`;
    else if (kind === 'adadd' || cur.dataset.row === 'a') key = `adadd:${next}`;
    else key = `slot:${next}:${cur.dataset.row ?? this.dayStart}`;
    this.date = toISO(this.#shift(this.#anchor, dir));
    this.#focusKey = key;
    this.#pendingFocus = { key, until: Date.now() + 1000 };
  }

  #onKey = (e: KeyboardEvent) => {
    if (this.#drag?.started && e.key === 'Escape') { e.preventDefault(); this.cancelMove(); return; }
    const key = logicalKey(e, this);
    if (this.#model.active) {
      if (this.#model.handleKey(e, key)) { e.preventDefault(); e.stopPropagation(); }
      return;
    }
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.composedPath()[0] as HTMLElement;
    if (!(t instanceof HTMLElement) || t.getRootNode() !== this.renderRoot) return;
    const pop = t.closest('.pop');
    if (pop && e.key === 'Escape') { e.preventDefault(); this.#closeMore(true); return; }
    if (t.dataset.ev && e.key === ' ') {
      e.preventDefault();
      this.#quietUntil = performance.now() + 400;
      this.pickUp(t.dataset.ev, t.dataset.day);
      return;
    }
    if (pop && (key === 'ArrowDown' || key === 'ArrowUp')) {
      const chips = [...pop.querySelectorAll<HTMLElement>('.chip')];
      const next = chips[chips.indexOf(t) + (key === 'ArrowDown' ? 1 : -1)];
      if (next) { e.preventDefault(); next.focus(); }
      return;
    }
    if (!t.classList.contains('item')) return;
    if (e.key === 'PageUp' || e.key === 'PageDown') { e.preventDefault(); this.#page(t, e.key === 'PageUp' ? -1 : 1); return; }
    const next = this.#neighbour(t, key);
    if (next) { e.preventDefault(); this.#focusItem(next); }
    else if (key.startsWith('Arrow') || key === 'Home' || key === 'End') e.preventDefault();
  };

  /* ---------- Moving with the keyboard ---------- */

  #slots(dur: number) { return Math.floor((1440 - Math.min(dur, 1440)) / this.#step) + 1; }

  #moveKey(key: string, at: MovePlace): MovePlace | null {
    const h = this.#held;
    if (!h) return null;
    const n = this.#days().length;
    const g = (x: number) => Math.max(0, Math.min(n - 1, x));
    if (h.mode === 'day') {
      const month = this.#view === 'month';
      switch (key) {
        case 'ArrowRight': return { group: g(at.group + 1), index: 0 };
        case 'ArrowLeft': return { group: g(at.group - 1), index: 0 };
        case 'ArrowDown': return month ? { group: at.group + 7 < n ? at.group + 7 : at.group, index: 0 } : { ...at };
        case 'ArrowUp': return month ? { group: at.group - 7 >= 0 ? at.group - 7 : at.group, index: 0 } : { ...at };
        case 'Home': return { group: month ? at.group - (at.group % 7) : 0, index: 0 };
        case 'End': return { group: month ? g(at.group - (at.group % 7) + 6) : n - 1, index: 0 };
        default: return null;
      }
    }
    const last = this.#slots(h.ev.dur) - 1;
    const hour = Math.max(1, Math.round(60 / this.#step));
    const i = (x: number) => Math.max(0, Math.min(last, x));
    switch (key) {
      case 'ArrowRight': return { group: g(at.group + 1), index: at.index };
      case 'ArrowLeft': return { group: g(at.group - 1), index: at.index };
      case 'ArrowDown': return { group: at.group, index: i(at.index + 1) };
      case 'ArrowUp': return { group: at.group, index: i(at.index - 1) };
      case 'PageDown': return { group: at.group, index: i(at.index + hour) };
      case 'PageUp': return { group: at.group, index: i(at.index - hour) };
      case 'Home': return { group: at.group, index: 0 };
      case 'End': return { group: at.group, index: last };
      default: return null;
    }
  }

  /** New start and end for a held event at a place. */
  #timesAt(h: Held, at: MovePlace): { start: Date; end: Date } {
    const { ev } = h;
    if (h.mode === 'time') {
      const day = this.#days()[at.group] ?? fromISO(h.origin)!;
      const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, at.index * this.#step);
      return { start, end: new Date(start.getTime() + ev.dur * 60000) };
    }
    const delta = at.group - h.from.group;
    const shift = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + delta, d.getHours(), d.getMinutes());
    return { start: shift(ev.start), end: shift(ev.end) };
  }

  #holdFor(ev: Ev, origin: string): Held | null {
    const days = this.#days().map(toISO);
    const group = days.indexOf(origin);
    if (group < 0) return null;
    const mode = this.#timeView && !ev.allDay ? 'time' : 'day';
    const index = mode === 'time' ? Math.min(Math.floor(ev.min / this.#step), this.#slots(ev.dur) - 1) : 0;
    return { ev, origin, mode, from: { group, index } };
  }

  /**
   * Picks up an event for moving with the arrow keys, as Space does: e.g. from a "Move" item in your own menu.
   * `day` (ISO) is the day it is picked up from, for an all-day event over several days. Returns false when the
   * event is not shown, `locked`, `pending` or the calendar is `readonly`.
   */
  pickUp(event: CmCalendarEvent | string, day?: string): boolean {
    const el = typeof event === 'string' ? this.event(event) : event;
    if (!el || el.locked || el.pending || this.readonly) return false;
    const ev = this.#parse(el);
    if (!ev) return false;
    const days = this.#days().map(toISO);
    const origin = day && ev.days.includes(day) && days.includes(day) ? day : ev.days.find((d) => days.includes(d));
    if (!origin) return false;
    const held = this.#holdFor(ev, origin);
    if (!held) return false;
    this.#endDrag(false);
    this.#model.cancel(true);
    this._more = '';
    this.#held = held;
    el.moving = true;
    const key = `ev:${ev.key}:${origin}`;
    this.#focusKey = key;
    this.#pendingFocus = { key, until: Date.now() + 1000 };
    this.requestUpdate();
    this.#model.pickUp(held.from);
    return true;
  }

  /** Cancels a keyboard move or a drag in progress: the event stays where it was. */
  cancelMove() {
    const d = this.#drag;
    if (d?.started) {
      this.#endDrag(false);
      this.#announcer.announce(this.t('cancelled', { event: d.ev.name, place: this.#placeText(d, d.from) }));
    }
    this.#model.cancel();
  }

  #release() {
    if (this.#held) this.#held.ev.el.moving = false;
    this.#held = null;
    this._target = null;
  }

  #showTarget(at: MovePlace | null) {
    const h = this.#held;
    if (!h || !at) { this._target = null; return; }
    const iso = toISO(this.#days()[at.group] ?? fromISO(h.origin)!);
    const same = at.group === h.from.group && at.index === h.from.index;
    this._target = same ? null : { iso, min: h.mode === 'time' ? at.index * this.#step : undefined };
  }

  #keyboardDrop(from: MovePlace, to: MovePlace) {
    const h = this.#held;
    this.#release();
    if (!h) return;
    this.#quietUntil = performance.now() + 400;
    this.#commitPlace(h, from, to, 'keyboard');
  }

  #commitPlace(h: Held, from: MovePlace, to: MovePlace, source: CalendarMoveSource) {
    const same = from.group === to.group && from.index === to.index;
    const { start, end } = this.#timesAt(h, to);
    const day = toISO(addDays(fromISO(h.origin)!, to.group - from.group));
    this.#commit(h.ev, start, end, source, same, h.mode === 'time' ? toISO(start) : day);
  }

  /* ---------- Committing ---------- */

  #times(allDay: boolean, start: Date, end: Date): CalendarTimes {
    return allDay ? { start: toISO(start), end: toISO(end) } : { start: isoTime(start), end: isoTime(end) };
  }

  /**
   * Moves an event to a new start (local ISO; `end` defaults to keeping its length), as a drop would: fires
   * `cm-move`, and unless it is cancelled (or the calendar is `controlled`) changes `start` and `end`. Returns false
   * when the move was cancelled or the event was not found.
   */
  moveEvent(event: CmCalendarEvent | string, start: string, end?: string): boolean {
    const el = typeof event === 'string' ? this.event(event) : event;
    const ev = el && this.#parse(el);
    if (!ev) return false;
    const s = ev.allDay ? fromISO(splitDateTime(start).date || start) : fromISODateTime(start);
    if (!s) return false;
    let e = end ? (ev.allDay ? fromISO(splitDateTime(end).date || end) : fromISODateTime(end)) : null;
    if (!e || e < s) e = ev.allDay ? addDays(s, dayDiff(ev.start, ev.end)) : new Date(s.getTime() + ev.dur * 60000);
    return this.#commit(ev, s, e, 'api', false, toISO(s));
  }

  /**
   * Puts an event back where it was before its last move by the calendar, clears `pending` and announces it. Call
   * it when saving the move failed (a rejected `waitUntil()` promise does this for you). Does nothing with
   * `controlled` (put it back in your data) or when the event has not moved. Returns whether it went back.
   */
  revert(event: CmCalendarEvent | string): boolean {
    const el = typeof event === 'string' ? this.event(event) : event;
    if (!el) return false;
    el.pending = false;
    const was = this.#history.get(el);
    if (this.controlled || !was) return false;
    this.#history.delete(el);
    const focused = ((this.renderRoot as ShadowRoot).activeElement as HTMLElement | null)?.dataset.ev === el.key;
    el.start = was.start;
    el.end = was.end;
    const ev = this.#parse(el);
    if (ev && focused) this.#pendingFocus = { key: `ev:${ev.key}:${ev.days[0]}`, until: Date.now() + 1000 };
    this.#announcer.announce(this.t('reverted', { event: el.name, place: ev ? this.#when(ev) : was.start }));
    return true;
  }

  #commit(ev: Ev, start: Date, end: Date, source: CalendarMoveSource, same: boolean, day: string): boolean {
    const el = ev.el;
    const name = ev.name;
    const from = this.#times(ev.allDay, ev.start, ev.end);
    const to = this.#times(ev.allDay, start, end);
    const refocus = (key: string) => { if (source === 'keyboard') this.#pendingFocus = { key, until: Date.now() + 1000 }; };
    if (same || (from.start === to.start && from.end === to.end)) {
      if (source !== 'api') this.#announcer.announce(this.t('sameSpot', { event: name }));
      this.requestUpdate();
      return false;
    }
    const moved = { ...ev, start, end };
    const place = ev.allDay ? this.#dayText(start) : this.t('timed', { date: this.#dayText(start), time: this.#timeRange(start, end) });
    const waits: Promise<unknown>[] = [];
    const detail: CalendarMoveDetail = {
      value: ev.key, event: el, from, to, allDay: ev.allDay, source,
      waitUntil: (p: Promise<unknown>) => { waits.push(Promise.resolve(p)); },
    };
    const ok = this.dispatchEvent(new CustomEvent<CalendarMoveDetail>('cm-move', { detail, bubbles: true, composed: true, cancelable: true }));
    if (!ok) {
      this.#announcer.announce(this.t('refused', { event: name, place }));
      this.requestUpdate();
      return false;
    }
    if (!this.controlled) {
      this.#history.set(el, from);
      el.start = to.start;
      el.end = to.end;
    }
    refocus(`ev:${ev.key}:${day}`);
    this.requestUpdate();
    this.#announcer.announce(this.t('moved', { event: name, place: moved.allDay ? this.#dayText(start) : place }));
    if (waits.length) {
      el.pending = true;
      Promise.all(waits).then(
        () => { el.pending = false; if (!this.controlled) this.#history.delete(el); },
        () => {
          el.pending = false;
          if (!this.controlled) this.revert(el);
          else this.#announcer.announce(this.t('reverted', { event: name, place: this.#when(ev) }));
        },
      );
    }
    return true;
  }

  /* ---------- Pointer drag ---------- */

  #onNativeDrag = (e: DragEvent) => {
    if (e.composedPath().some((n) => (n as HTMLElement).dataset?.ev)) e.preventDefault();
  };

  /** Minutes from midnight at a pointer height in the time grid, and the day column under it. */
  #timeAt(x: number, y: number): { group: number; min: number } | null {
    const firsts = [...this.renderRoot.querySelectorAll<HTMLElement>('.tcell[data-row="0"]')];
    if (!firsts.length) return null;
    let group = 0, best = Infinity;
    firsts.forEach((c, i) => {
      const r = c.getBoundingClientRect();
      const dist = x < r.left ? r.left - x : x > r.right ? x - r.right : 0;
      if (dist < best) { best = dist; group = Number(c.dataset.i ?? i); }
    });
    const r = firsts[0].getBoundingClientRect();
    return { group, min: ((y - r.top) / r.height) * 60 };
  }

  /** The day under the pointer (nearest): month days, narrow month days, or the all-day row. */
  #dayAt(x: number, y: number): number | null {
    const cells = [...this.renderRoot.querySelectorAll<HTMLElement>('[data-drop]')];
    if (!cells.length) return null;
    let best: HTMLElement | null = null, bestDist = Infinity;
    for (const c of cells) {
      const r = c.getBoundingClientRect();
      const dx = x < r.left ? r.left - x : x > r.right ? x - r.right : 0;
      const dy = y < r.top ? r.top - y : y > r.bottom ? y - r.bottom : 0;
      const dist = Math.hypot(dx, dy);
      if (dist < bestDist) { bestDist = dist; best = c; }
    }
    return best ? Number(best.dataset.i) : null;
  }

  #onPointerDown = (e: PointerEvent) => {
    if (this.#drag || this.readonly || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const chip = e.composedPath().find((n) => (n as HTMLElement).dataset?.ev) as HTMLElement | undefined;
    if (!chip) return;
    const el = this.event(chip.dataset.ev!);
    const ev = el && this.#parse(el);
    if (!ev || el.locked || el.pending) return;
    const held = this.#holdFor(ev, chip.dataset.day ?? ev.days[0]);
    if (!held) return;
    if (this.#model.active) this.#model.cancel();
    let grab = 0;
    if (held.mode === 'time') {
      const at = this.#timeAt(e.clientX, e.clientY);
      if (at && chip.classList.contains('time')) grab = Math.max(0, Math.min(ev.dur, at.min - ev.min));
    }
    this.#drag = {
      ...held, pointerId: e.pointerId, type: e.pointerType, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY,
      started: false, grab, to: { ...held.from },
    };
    if (e.pointerType !== 'mouse') {
      // Touch and pen: press and hold to pick up, so a swipe still scrolls.
      this.#drag.timer = setTimeout(() => { if (this.#drag && !this.#drag.started) this.#startDrag(); }, 300);
    }
    window.addEventListener('pointermove', this.#onPointerMove, true);
    window.addEventListener('pointerup', this.#onPointerUp, true);
    window.addEventListener('pointercancel', this.#onPointerCancel, true);
    window.addEventListener('touchmove', this.#onTouchMove, { capture: true, passive: false });
    window.addEventListener('contextmenu', this.#onContextMenu, true);
  };

  #onTouchMove = (e: TouchEvent) => { if (this.#drag?.started && e.cancelable) e.preventDefault(); };
  #onContextMenu = (e: Event) => { if (this.#drag) e.preventDefault(); };

  #onPointerMove = (e: PointerEvent) => {
    const d = this.#drag;
    if (!d || e.pointerId !== d.pointerId) return;
    d.x = e.clientX; d.y = e.clientY;
    if (!d.started) {
      const dist = Math.hypot(d.x - d.x0, d.y - d.y0);
      if (d.type === 'mouse' ? dist > 4 : dist > 8) {
        if (d.type === 'mouse') this.#startDrag();
        else this.#endDrag(false); // moved before the hold: it's a scroll
      }
      return;
    }
    e.preventDefault();
    this.#updateTarget();
  };

  #onPointerUp = (e: PointerEvent) => {
    const d = this.#drag;
    if (!d || e.pointerId !== d.pointerId) return;
    if (!d.started) { this.#endDrag(false); return; }
    // The click that follows a drag must not open the event.
    const swallow = (ev: Event) => { ev.stopPropagation(); ev.preventDefault(); };
    window.addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => window.removeEventListener('click', swallow, true), 0);
    this.#endDrag(true);
  };

  #onPointerCancel = (e: PointerEvent) => {
    if (this.#drag && e.pointerId === this.#drag.pointerId) this.#endDrag(false);
  };

  #startDrag() {
    const d = this.#drag!;
    d.started = true;
    clearTimeout(d.timer);
    getSelection()?.removeAllRanges();
    this._more = '';
    d.ev.el.moving = true;
    this.dragging = true;
    this.#announcer.announce(this.t('pickedUp', { event: d.ev.name, place: this.#placeText(d, d.from) }));
    this.#updateTarget();
    const tick = () => {
      if (!this.#drag?.started) return;
      this.#autoScroll();
      this.#drag.raf = requestAnimationFrame(tick);
    };
    d.raf = requestAnimationFrame(tick);
  }

  #updateTarget() {
    const d = this.#drag;
    if (!d) return;
    let to: MovePlace | null = null;
    if (d.mode === 'time') {
      const at = this.#timeAt(d.x, d.y);
      if (at) {
        const last = this.#slots(d.ev.dur) - 1;
        to = { group: at.group, index: Math.max(0, Math.min(last, Math.round((at.min - d.grab) / this.#step))) };
      }
    } else {
      const g = this.#dayAt(d.x, d.y);
      if (g !== null) to = { group: g, index: 0 };
    }
    if (!to || (to.group === d.to.group && to.index === d.to.index && this._target)) return;
    const changedDay = to.group !== d.to.group;
    d.to = to;
    const same = to.group === d.from.group && to.index === d.from.index;
    this._target = same ? null : { iso: toISO(this.#days()[to.group]), min: d.mode === 'time' ? to.index * this.#step : undefined };
    if (changedDay) this.#announcer.announce(this.t('over', { place: this.#placeText(d, to) }));
  }

  #autoScroll() {
    const d = this.#drag;
    const tg = this.renderRoot.querySelector<HTMLElement>('.tg');
    if (!d || !tg || d.mode !== 'time') return;
    const EDGE = 40, MAX = 14;
    const speed = (dist: number) => (dist < EDGE ? Math.ceil(((EDGE - Math.max(dist, 0)) / EDGE) * MAX) : 0);
    const r = tg.getBoundingClientRect();
    if (d.x < r.left || d.x > r.right) return;
    const top = (tg.querySelector('.tg-top') as HTMLElement | null)?.getBoundingClientRect().bottom ?? r.top;
    const up = speed(d.y - top), down = speed(r.bottom - d.y);
    const before = tg.scrollTop;
    if (up) tg.scrollTop -= up; else if (down) tg.scrollTop += down;
    if (tg.scrollTop !== before) this.#updateTarget();
  }

  #endDrag(drop: boolean) {
    const d = this.#drag;
    if (!d) return;
    this.#drag = null;
    clearTimeout(d.timer);
    if (d.raf) cancelAnimationFrame(d.raf);
    window.removeEventListener('pointermove', this.#onPointerMove, true);
    window.removeEventListener('pointerup', this.#onPointerUp, true);
    window.removeEventListener('pointercancel', this.#onPointerCancel, true);
    window.removeEventListener('touchmove', this.#onTouchMove, true);
    window.removeEventListener('contextmenu', this.#onContextMenu, true);
    if (!d.started) return;
    d.ev.el.moving = false;
    this.dragging = false;
    this._target = null;
    if (drop) this.#commitPlace(d, d.from, d.to, 'pointer');
  }

  /* ---------- Adding and opening ---------- */

  #add(start: string, allDay: boolean) {
    if (this.readonly) return;
    this.dispatchEvent(new CustomEvent<CalendarAddDetail>('cm-add', { detail: { start, allDay, view: this.#view }, bubbles: true, composed: true }));
  }

  #slotClick(e: MouseEvent, iso: string, hour: number) {
    let min = hour * 60;
    // A pointer click starts at the step under the pointer; a key press at the hour.
    if (e.detail > 0) {
      const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const within = Math.floor((((e.clientY - r.top) / r.height) * 60) / this.#step) * this.#step;
      min += Math.max(0, Math.min(59, within));
    }
    const h = Math.floor(min / 60), m = min % 60;
    this.#add(`${iso}T${pad(h)}:${pad(m)}`, false);
  }

  #open(e: Event, ev: Ev) {
    if (performance.now() < this.#quietUntil || this.#model.active) { e.preventDefault(); return; }
    const ok = this.dispatchEvent(new CustomEvent('cm-open', { detail: { value: ev.key, event: ev.el }, bubbles: true, composed: true, cancelable: true }));
    if (!ok) e.preventDefault();
  }

  #openMore(iso: string) { this._more = iso; this.#focusPop = true; }

  #closeMore(refocus: boolean) {
    const iso = this._more;
    this._more = '';
    if (refocus && iso) { this.#focusKey = `more:${iso}`; this.#pendingFocus = { key: `more:${iso}`, until: Date.now() + 1000 }; }
  }

  /* ---------- Rendering ---------- */

  #activeEv(): Ev | null { return this.#held?.ev ?? (this.#drag?.started ? this.#drag.ev : null); }

  #chip(ev: Ev, iso: string, i: number, where: 'month' | 'time' | 'allday' | 'list', item: boolean, extra: { row?: string; style?: string } = {}): TemplateResult {
    const el = ev.el;
    const busy = el.pending;
    const name = this.#name(ev);
    const movable = !this.readonly && !el.locked && !busy;
    const tone = ['attention', 'information', 'success', 'critical'].includes(el.tone) ? el.tone : 'neutral';
    const cls = `chip ${where} tone-${tone}${item ? ' item' : ''}${el.moving ? ' moving' : ''}${busy ? ' pending' : ''}${el.locked ? ' locked' : ''}`;
    const icon = el.icon ? html`<cm-icon name=${el.icon} size="14"></cm-icon>` : nothing;
    const time = ev.allDay ? nothing : html`<span class="tm">${this.#timeText(ev.min)}</span>`;
    const kind = el.kind && (where !== 'month' || !el.icon) ? html`<span class="k">${el.kind}</span>` : nothing;
    const spin = busy ? html`<span class="spin" aria-hidden="true"></span>` : nothing;
    const body = where === 'time'
      ? html`<span class="lead">${icon}${time}${spin}</span><span class="h">${ev.text}</span>${kind}`
      : html`${icon}${time}<span class="h">${ev.text}</span>${kind}${spin}`;
    const label = busy ? `${name}, ${this.t('saving')}` : name;
    const desc = movable ? `${this.#id}-mv` : `${this.#id}-op`;
    const k = `ev:${ev.key}:${iso}`;
    const role = movable ? this.t('roleDescription') : nothing;
    if (el.href) {
      return html`<a class=${cls} href=${el.href} style=${extra.style ?? nothing} data-k=${k} data-ev=${ev.key} data-day=${iso} data-i=${i}
        data-row=${extra.row ?? nothing} aria-label=${label} aria-describedby=${desc} aria-roledescription=${role}
        @click=${(e: Event) => this.#open(e, ev)}>${body}</a>`;
    }
    return html`<button type="button" class=${cls} style=${extra.style ?? nothing} data-k=${k} data-ev=${ev.key} data-day=${iso} data-i=${i}
      data-row=${extra.row ?? nothing} aria-label=${label} aria-describedby=${desc} aria-roledescription=${role}
      @click=${(e: Event) => this.#open(e, ev)}>${body}</button>`;
  }

  #placeholder(ev: Ev, cls = '', style?: string) {
    return html`<div class="ph ${cls}" style=${style ?? nothing} aria-hidden="true">${ev.text}</div>`;
  }

  #header(days: Date[]): TemplateResult {
    const v = this.#view;
    const narrowWeek = v === 'week' && this._narrow;
    const prev = v === 'month' ? this.t('previousMonth') : narrowWeek ? this.t('previousDays', { count: 3 }) : v === 'week' ? this.t('previousWeek') : this.t('previousDay');
    const next = v === 'month' ? this.t('nextMonth') : narrowWeek ? this.t('nextDays', { count: 3 }) : v === 'week' ? this.t('nextWeek') : this.t('nextDay');
    const level = Math.min(6, Math.max(1, Math.round(Number(this.headingLevel)) || 2));
    return html`<div class="head" part="header">
      <div class="nav">
        <button type="button" class="hb icon prev" aria-label=${prev} @click=${() => this.previous()}><cm-icon name="chevron-left" size="18"></cm-icon></button>
        <button type="button" class="hb today" @click=${() => this.goToToday()}>${this.t('today')}</button>
        <button type="button" class="hb icon next" aria-label=${next} @click=${() => this.next()}><cm-icon name="chevron-right" size="18"></cm-icon></button>
      </div>
      <div class="title" part="title" id="${this.#id}-t" role="heading" aria-level=${level} aria-live="polite">${this.#rangeLabel(days)}${this.loading
        ? html`<cm-spinner size="small" aria-hidden="true"></cm-spinner>` : nothing}</div>
      <div class="views" role="group" aria-label=${this.t('views')}>
        ${VIEWS.map((x) => html`<button type="button" class="hb" data-view=${x} aria-pressed=${x === v ? 'true' : 'false'} @click=${() => this.#setView(x)}>${this.t(x)}</button>`)}
      </div>
    </div>`;
  }

  #weekdayHeads(compact: boolean) {
    const fmt = this.#fmt;
    const order = Array.from({ length: 7 }, (_, i) => (i + this.#firstDay) % 7);
    return html`<thead><tr>${order.map((d) => html`<th scope="col" abbr=${fmt.weekdaysLong[d]}><span aria-hidden="true">${compact ? fmt.weekdaysShort[d].slice(0, 2) : fmt.weekdaysShort[d]}</span><span class="vh">${fmt.weekdaysLong[d]}</span></th>`)}</tr></thead>`;
  }

  #month(days: Date[], byDay: Map<string, Ev[]>): TemplateResult {
    const anchor = this.#anchor;
    const today = this.#todayISO;
    const max = Math.max(1, Math.trunc(Number(this.maxEvents)) || 3);
    const active = this.#activeEv();
    const target = this._target;
    const weeks = Array.from({ length: days.length / 7 }, (_, w) => days.slice(w * 7, w * 7 + 7));
    const compact = this._narrow;
    const cell = (d: Date, i: number, col: number) => {
      const iso = toISO(d);
      const list = byDay.get(iso) ?? [];
      const dayText = this.#dayText(d);
      const cls = `${d.getMonth() !== anchor.getMonth() ? 'other' : ''} ${iso === today ? 'today' : ''} ${target?.iso === iso ? 'over' : ''}`;
      const num = html`<span class="num" aria-hidden="true">${this.#fmt.day(d)}</span>`;
      if (compact) {
        const tones = list.slice(0, 3).map((ev) => (['attention', 'information', 'success', 'critical'].includes(ev.el.tone) ? ev.el.tone : 'neutral'));
        return html`<td class=${cls} data-drop data-i=${i} aria-selected=${iso === toISO(anchor) ? 'true' : 'false'} aria-current=${iso === today ? 'date' : nothing}>
          <button type="button" class="dayb item" data-k="day:${iso}" data-i=${i} data-day=${iso} aria-label=${this.t('dayEvents', { date: dayText, count: list.length })}
            @click=${() => { this.date = iso; this.#focusKey = `day:${iso}`; }}>${num}<span class="dots">${tones.map((t) => html`<span class="dot tone-${t}"></span>`)}</span></button>
        </td>`;
      }
      let shown = list, hidden = 0;
      if (list.length > max) {
        shown = list.slice(0, max - 1);
        const mine = active && list.find((e) => e.key === active.key);
        if (mine && !shown.includes(mine)) shown = [...list.slice(0, max - 2), mine];
        hidden = list.length - shown.length;
      }
      const ro = this.readonly;
      return html`<td class="${cls}${ro ? ' item' : ''}" data-drop data-i=${i} data-day=${iso} data-k=${ro ? `cell:${iso}` : nothing}
          aria-label=${ro ? this.t('dayEvents', { date: dayText, count: list.length }) : nothing} aria-current=${iso === today ? 'date' : nothing}>
        <div class="dh">${num}<span class="vh">${dayText}</span>
          ${ro ? nothing : html`<button type="button" class="add item" data-k="add:${iso}" data-i=${i} data-day=${iso} aria-label=${this.t('addOn', { date: dayText })}
            @click=${() => this.#add(iso, true)}><cm-icon name="plus" size="16"></cm-icon></button>`}
        </div>
        ${shown.length || (target?.iso === iso && active) ? html`<ul class="evs">
          ${shown.map((ev) => html`<li>${this.#chip(ev, iso, i, 'month', true)}</li>`)}
          ${target?.iso === iso && active ? html`<li aria-hidden="true">${this.#placeholder(active)}</li>` : nothing}
        </ul>` : nothing}
        ${hidden ? html`<button type="button" class="more item" data-k="more:${iso}" data-i=${i} data-day=${iso} aria-haspopup="dialog"
          aria-expanded=${this._more === iso ? 'true' : 'false'} aria-label=${this.t('moreLabel', { count: hidden, date: dayText })}
          @click=${() => (this._more === iso ? this.#closeMore(false) : this.#openMore(iso))}>${this.t('more', { count: hidden })}</button>` : nothing}
        ${this._more === iso ? html`<div class="pop ${col >= 4 ? 'end' : ''}" role="dialog" aria-label=${dayText}>
          <div class="pop-h"><span>${dayText}</span><button type="button" class="xb" aria-label=${this.t('close')} @click=${() => this.#closeMore(true)}><cm-icon name="close" size="16"></cm-icon></button></div>
          <ul>${list.map((ev) => html`<li>${this.#chip(ev, iso, i, 'list', false)}</li>`)}</ul>
        </div>` : nothing}
      </td>`;
    };
    const table = html`<table class="month ${compact ? 'compact' : ''}" part="grid" role="grid" aria-labelledby="${this.#id}-t" aria-describedby="${this.#id}-gh"
        aria-busy=${this.loading ? 'true' : 'false'}>
      ${this.#weekdayHeads(compact)}
      <tbody>${weeks.map((w, r) => html`<tr>${w.map((d, c) => cell(d, r * 7 + c, c))}</tr>`)}</tbody>
    </table>`;
    if (!compact) return table;
    const iso = toISO(anchor);
    const list = byDay.get(iso) ?? [];
    const i = days.findIndex((d) => toISO(d) === iso);
    const dayText = this.#dayText(anchor);
    const level = Math.min(6, Math.max(1, Math.round(Number(this.headingLevel)) || 2) + 1);
    return html`${table}
      <section class="agenda" part="agenda" aria-labelledby="${this.#id}-ag">
        <div class="ag-h">
          <div class="ag-t" id="${this.#id}-ag" role="heading" aria-level=${level}>${dayText}</div>
          ${this.readonly ? nothing : html`<button type="button" class="hb ag-add" aria-label=${this.t('addOn', { date: dayText })} @click=${() => this.#add(iso, true)}>
            <cm-icon name="plus" size="16"></cm-icon>${this.t('add')}</button>`}
        </div>
        ${list.length
          ? html`<ul class="ag-list">${list.map((ev) => html`<li>${this.#chip(ev, iso, i, 'list', false)}</li>`)}</ul>`
          : html`<p class="empty">${this.t('noEvents')}</p>`}
      </section>`;
  }

  /** Side-by-side lanes for overlapping timed events in a day. */
  #lanes(list: Ev[]): Map<Ev, { lane: number; lanes: number }> {
    const out = new Map<Ev, { lane: number; lanes: number }>();
    const timed = list.filter((e) => !e.allDay).sort((a, b) => a.min - b.min || b.dur - a.dur);
    let cluster: Ev[] = [], ends: number[] = [], clusterEnd = -1;
    const close = () => { for (const e of cluster) out.get(e)!.lanes = ends.length; cluster = []; ends = []; };
    for (const e of timed) {
      const end = Math.min(1440, e.min + Math.max(e.dur, 20));
      if (e.min >= clusterEnd) { close(); clusterEnd = -1; }
      let lane = ends.findIndex((x) => x <= e.min);
      if (lane < 0) { lane = ends.length; ends.push(end); } else ends[lane] = end;
      out.set(e, { lane, lanes: 1 });
      cluster.push(e);
      clusterEnd = Math.max(clusterEnd, end);
    }
    close();
    return out;
  }

  #timeGrid(days: Date[], byDay: Map<string, Ev[]>): TemplateResult {
    const today = this.#todayISO;
    const fmt = this.#fmt;
    const active = this.#activeEv();
    const target = this._target;
    const ro = this.readonly;
    const cols = days.map((d) => {
      const iso = toISO(d);
      const list = byDay.get(iso) ?? [];
      return { d, iso, text: this.#dayText(d), allDay: list.filter((e) => e.allDay), timed: list.filter((e) => !e.allDay), lanes: this.#lanes(list) };
    });
    const hours = Array.from({ length: 24 }, (_, h) => h);
    return html`<div class="tg" part="grid" role="grid" aria-labelledby="${this.#id}-t" aria-describedby="${this.#id}-gh" aria-busy=${this.loading ? 'true' : 'false'}
        style="--cols:${days.length}">
      <div class="tg-top" role="rowgroup">
        <div class="row" role="row">
          <div class="axis" role="columnheader"><span class="vh">${this.t('time')}</span></div>
          ${cols.map((c) => html`<div class="colh ${c.iso === today ? 'today' : ''}" role="columnheader" aria-current=${c.iso === today ? 'date' : nothing}>
            <span class="wd" aria-hidden="true">${fmt.weekdaysShort[c.d.getDay()]}</span><span class="dn" aria-hidden="true">${fmt.day(c.d)}</span><span class="vh">${c.text}</span>
          </div>`)}
        </div>
        <div class="row adrow" role="row">
          <div class="axis" role="rowheader">${this.t('allDay')}</div>
          ${cols.map((c, i) => html`<div class="adcell ${target?.iso === c.iso && active?.allDay ? 'over' : ''}" role="gridcell" data-drop data-i=${i}>
            ${ro ? nothing : html`<button type="button" class="add item" data-k="adadd:${c.iso}" data-i=${i} data-day=${c.iso} data-row="a"
              aria-label=${this.t('addAllDay', { date: c.text })} @click=${() => this.#add(c.iso, true)}><cm-icon name="plus" size="16"></cm-icon></button>`}
            ${c.allDay.map((ev) => this.#chip(ev, c.iso, i, 'allday', true, { row: 'a' }))}
            ${target?.iso === c.iso && active?.allDay ? this.#placeholder(active) : nothing}
          </div>`)}
        </div>
      </div>
      <div class="tg-body" role="rowgroup">
        ${hours.map((h) => html`<div class="row hr" role="row">
          <div class="axis" role="rowheader"><span>${this.#hourLabel(h)}</span></div>
          ${cols.map((c, i) => {
            const here = c.timed.filter((e) => Math.floor(e.min / 60) === h);
            const ph = active && !active.allDay && target?.iso === c.iso && target.min !== undefined && Math.floor(target.min / 60) === h;
            return html`<div class="tcell" role="gridcell" data-i=${i} data-row=${h} data-day=${c.iso}>
              ${ro ? nothing : html`<button type="button" class="slot item" data-k="slot:${c.iso}:${h}" data-i=${i} data-row=${h} data-day=${c.iso}
                aria-label=${this.t('addAt', { time: this.#timeText(h * 60), date: c.text })} @click=${(e: MouseEvent) => this.#slotClick(e, c.iso, h)}></button>`}
              ${here.map((ev) => {
                const l = c.lanes.get(ev) ?? { lane: 0, lanes: 1 };
                const len = Math.min(ev.dur, 1440 - ev.min) / 60;
                return this.#chip(ev, c.iso, i, 'time', true, { row: String(h), style: `--top:${(ev.min - h * 60) / 60};--len:${len};--lane:${l.lane};--lanes:${l.lanes}` });
              })}
              ${ph ? this.#placeholder(active!, 'time', `--top:${(target!.min! - h * 60) / 60};--len:${Math.min(active!.dur, 1440 - target!.min!) / 60}`) : nothing}
            </div>`;
          })}
        </div>`)}
      </div>
    </div>`;
  }

  render() {
    const days = this.#days();
    const byDay = this.#byDay(this.#parsed());
    return html`<div class="cal ${this._narrow ? 'narrow' : ''}" role="group" aria-label=${this.label}>
      ${this.#header(days)}
      ${this.#view === 'month' ? this.#month(days, byDay) : this.#timeGrid(days, byDay)}
      <span class="vh" role="status">${this.loading ? this.t('loading') : ''}</span>
      <span id="${this.#id}-gh" hidden>${this.t('gridHelp')}</span>
      <span id="${this.#id}-mv" hidden>${this.t('openHint')} ${this.t('instructions')}</span>
      <span id="${this.#id}-op" hidden>${this.t('openHint')}</span>
    </div>`;
  }
}
define('cm-calendar', CmCalendar);

declare global {
  interface HTMLElementTagNameMap { 'cm-calendar': CmCalendar; 'cm-calendar-event': CmCalendarEvent }
}
