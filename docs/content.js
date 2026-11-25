// Written content for the docs. Props, slots and events are NOT here: they come from
// packages/ui/dist/custom-elements.json, generated from the component source.

// Timeline examples show times relative to when the page is opened.
const isoAgo = (minutes) => new Date(Date.now() - minutes * 60_000).toISOString().replace(/:\d\d\.\d+Z$/, 'Z');

// Calendar examples: an outreach planner for November 2026 (calls, follow-ups, demos, meetings, a deadline).
const calEvent = (id, title, start, end, kind, tone, icon) => `  <cm-calendar-event value="${id}" heading="${title}" start="${start}"${end ? ` end="${end}"` : ''}${start.includes('T') ? '' : ' all-day'} kind="${kind}" tone="${tone}" icon="${icon}"></cm-calendar-event>`;
const outreachEvents = [
  calEvent('f101', 'Call Ravi Stores', '2026-11-16T10:00', '2026-11-16T10:30', 'Follow-up', 'attention', 'phone'),
  calEvent('f102', 'Demo for Kiran Foods', '2026-11-17T11:00', '2026-11-17T12:00', 'Demo', 'success', 'users'),
  calEvent('f103', 'Email Lakshmi Textiles', '2026-11-18T09:30', '2026-11-18T09:45', 'Email', 'information', 'mail'),
  calEvent('f104', 'Meet Blue Pottery House', '2026-11-18T12:00', '2026-11-18T13:00', 'Meeting', 'neutral', 'handshake'),
  calEvent('f105', 'Call Ravi Stores', '2026-11-18T15:00', '2026-11-18T15:30', 'Follow-up', 'attention', 'phone'),
  calEvent('f106', 'Call Green Basket Organics', '2026-11-18T16:00', '2026-11-18T16:30', 'Follow-up', 'attention', 'phone'),
  calEvent('f107', 'Demo for Delhi Spice Co.', '2026-11-19T14:00', '2026-11-19T15:00', 'Demo', 'success', 'users'),
  calEvent('f108', 'GST filing due', '2026-11-20', '', 'Deadline', 'critical', 'alert'),
  calEvent('f109', 'Call Coastal Crafts', '2026-11-23T11:30', '2026-11-23T12:00', 'Follow-up', 'attention', 'phone'),
  calEvent('f110', 'Visit Sharma Logistics', '2026-11-25T10:00', '2026-11-25T12:00', 'Meeting', 'neutral', 'handshake'),
  calEvent('f111', 'Seller meet, Bengaluru', '2026-11-27', '2026-11-28', 'Event', 'information', 'megaphone'),
].join('\n');

// Board examples: one CRM card (name linking to the record, owner, phone and city, grade, last change, owner's avatar).
const crmCard = (id, name, owner, phone, city, grade, modified) => `    <cm-board-card value="${id}" heading="${name}" href="#/components/board">
      <span>${owner}</span><span>${phone} · ${city}</span><span>Modified ${modified.toLowerCase()}</span>
      <cm-badge slot="badges">${/^[A-C]$/.test(grade) ? `Grade ${grade}` : grade}</cm-badge>
      <cm-avatar slot="avatar" size="small" name="${owner}" decorative></cm-avatar>
    </cm-board-card>`;

export const components = [
  {
    slug: 'button', tag: 'cm-button', react: 'Button', name: 'Button', group: 'Actions',
    summary: 'Triggers an action or moves the merchant to the next step.',
    lead: 'Buttons make the main action on a screen obvious. Black is the primary action; everything else is secondary: white with a grey outline, like a field.',
    examples: [
      { title: 'Primary and secondary', description: 'The save bar pattern: secondary on the left, primary on the right. One primary button per group.',
        html: `<div class="row">
  <cm-button size="large">Cancel</cm-button>
  <cm-button variant="primary" size="large">Save</cm-button>
</div>` },
      { title: 'Sizes', description: '`large` (40px) for save bars, empty states and page actions, `medium` (36px, the default) for card and form actions, `slim` (32px) for toolbars, filter rows, dense rows and table cells. Text is 14px (13px on slim) and icons 16px at every size. On touch screens every size is drawn at least 40px tall, with a hit area that reaches 44px (owner standard, 1.6; 1.5 drew 44px). Since 1.5 (the sizes were 46, 32 and 24px).',
        html: `<div class="row">
  <cm-button variant="primary" size="large">Large</cm-button>
  <cm-button variant="primary" size="medium">Medium</cm-button>
  <cm-button variant="primary" size="slim">Slim</cm-button>
</div>` },
      { title: 'With icon', description: 'Put an icon in the `icon` slot when it makes the action faster to recognise. Keep the label.',
        html: `<div class="row">
  <cm-button><cm-icon slot="icon" name="plus" size="16"></cm-icon>Add product</cm-button>
  <cm-button><cm-icon slot="icon" name="upload" size="16"></cm-icon>Import</cm-button>
  <cm-button><cm-icon slot="icon" name="external" size="16"></cm-icon>View store</cm-button>
</div>` },
      { title: 'Icon only', description: 'For well-known actions where space is tight: the header bar (notifications, refresh, search) and table rows. `icon-only` makes a square of the size\'s height (40, 36 or 32px; 40 × 40 on touch screens, with a 44px hit area). `label` is required: it is the name screen readers announce. Set `icon` to an icon name, or put a `cm-icon` in the `icon` slot.',
        html: `<div class="row">
  <cm-button icon-only icon="refresh" label="Refresh"></cm-button>
  <cm-button icon-only icon="search" label="Search"></cm-button>
  <cm-button icon-only icon="edit" label="Edit product" size="slim"></cm-button>
  <cm-button icon-only icon="bell" label="Notifications" size="large"></cm-button>
</div>` },
      { title: 'Tertiary', description: '`variant="tertiary"` (since 1.19) has no fill and no outline until hovered. Use it for icon buttons in the header bar (refresh, notifications) and in a board column heading, where a row of outlined boxes looks heavy, above all on phones. Not for the main action of a page or a form.',
        html: `<div class="row">
  <cm-button variant="tertiary" icon-only icon="refresh" label="Refresh this page"></cm-button>
  <cm-button variant="tertiary" icon-only icon="bell" label="Notifications" count="3"></cm-button>
  <cm-button variant="tertiary" icon-only icon="plus" label="Add lead" size="slim"></cm-button>
</div>` },
      { title: 'Count', description: '`count` adds a small counter, e.g. unread notifications. It is hidden at 0 and shows "99+" above 99. Screen readers hear the exact number as part of the name: "Notifications, 3 unread". When the count is not "unread" (tasks due, items waiting), change the wording with `strings` (keys `labelWithCount` for icon-only, `count` for text buttons) or `setStrings()`.',
        html: `<div class="row">
  <cm-button icon-only icon="bell" label="Notifications" count="3" size="large"></cm-button>
  <cm-button icon-only icon="mail" label="Mail" count="120" size="large"></cm-button>
  <cm-button icon="inbox" count="7">Inbox</cm-button>
  <cm-button icon="tasks" count="2" strings='{"count":"{count} due today"}'>Tasks</cm-button>
</div>` },
      { title: 'Tones', description: '`tone="critical"` or `tone="success"` colours a button by the outcome it records, so a row of choices scans quickly. Secondary buttons take the tone in their text, icon and outline; primary buttons are filled in it. Leave `tone` off for everything else: most buttons are black and white. Hover, focus, disabled and loading work as on the other buttons. Since 1.2.',
        html: `<div class="stack">
  <div class="row">
    <cm-button size="slim" icon="phone">Spoke to them</cm-button>
    <cm-button size="slim" icon="repeat">No answer, reschedule</cm-button>
    <cm-button size="slim" tone="critical" icon="x-circle">Not interested</cm-button>
    <cm-button size="slim" tone="success" icon="check-circle">Sale closed</cm-button>
  </div>
  <div class="row">
    <cm-button>Cancel</cm-button>
    <cm-button variant="primary" tone="critical" icon="trash">Delete customer</cm-button>
  </div>
  <div class="row">
    <cm-button variant="primary" tone="success" icon="check">Mark as won</cm-button>
  </div>
</div>` },
      { title: 'A row of outcome choices', description: 'When closing a task asks "what happened?" and there are 3 to 5 answers that each finish the task at once, show them as a row of slim secondary buttons, the most common first, and tone only the answers that are clearly good (`success`) or clearly bad (`critical`); neutral ones such as "Reschedule" stay untoned. Use an [[option group|/components/option-group]] instead when the choice is a setting the merchant picks and then confirms with a separate Save, and an [[action menu|/components/action-menu]] when there are more than 5 answers or they are rarely used. Colour is never the only signal: the label says the outcome ("Not interested", not "No"), an icon may support it, and the row still reads correctly in greyscale.',
        html: `<div class="row" role="group" aria-label="Call outcome">
  <cm-button size="slim">Spoke to them</cm-button>
  <cm-button size="slim">No answer, reschedule</cm-button>
  <cm-button size="slim" tone="critical">Not interested</cm-button>
  <cm-button size="slim" tone="success">Sale closed</cm-button>
</div>` },
      { title: 'Loading', description: 'Shows a spinner and blocks repeat clicks while a request runs. Screen readers hear that the button is busy.',
        html: `<cm-button variant="primary" loading>Saving</cm-button>` },
      { title: 'Disabled', description: 'Use sparingly. If an action is unavailable, say why nearby, or let the merchant press it and explain what is missing.',
        html: `<div class="row">
  <cm-button disabled>Duplicate</cm-button>
  <cm-button variant="primary" disabled>Publish</cm-button>
</div>` },
      { title: 'Link', description: 'With `href` the button renders a real link, so it opens in a new tab, can be bookmarked and is announced as a link.',
        html: `<cm-button href="#/components" >Browse components</cm-button>` },
      { title: 'Inside a form', description: '`type="submit"` and `type="reset"` work with a native form, exactly like `<button>`.',
        html: `<form class="stack" onsubmit="event.preventDefault(); this.querySelector('output').textContent = 'Submitted: ' + new FormData(this).get('code')">
  <cm-text-field name="code" label="Discount code" value="DIWALI25"></cm-text-field>
  <div class="row">
    <cm-button type="reset">Reset</cm-button>
    <cm-button type="submit" variant="primary">Create discount</cm-button>
  </div>
  <output></output>
</form>` },
    ],
    do: ['Write labels as a verb plus a noun: "Save", "Add product", "Send preview".', 'Use one primary button per section or save bar.', 'Put the primary button on the right of a group, secondary on its left, `space-8` apart.'],
    dont: ['Don\'t use two primary buttons side by side.', 'Don\'t use `tone` for decoration or emphasis, and don\'t let the colour carry meaning the label doesn\'t: "Not interested", not a red "No".', 'Don\'t use a button to navigate when a text link would do inside a sentence.', 'Don\'t write "Click here", "OK" or "Submit": say what happens.'],
    content: ['Title case for button labels, short and specific.', 'Keep the same verb across the flow: if the button says "Archive", the confirmation says "Archive", not "Remove".'],
    a11y: ['Renders a native `<button>` (or `<a>` with `href`) inside the shadow root, so it is focusable and announced correctly.', 'Focus ring: 2px `border-strong` outline with 2px offset.', 'While `loading`, the inner button has `aria-busy="true"` and ignores clicks.', 'An icon-only button must have a name: set `label` (it becomes the button\'s `aria-label`). Buttons made before 1.1 with a labelled `cm-icon` in the `icon` slot still work. Without either, the button warns in the console.', 'On touch screens (`pointer: coarse`) every button is drawn at least 40px tall (icon-only 40 × 40) whatever its `size`, and an invisible margin makes the hit area 44px (WCAG 2.5.5). States: hover, pressed, focus ring, disabled and loading.', 'Tones meet WCAG AA in light and dark themes: label 4.5:1 or more on the button\'s fill (secondary: text-critical / text-success on bg-surface, and on the soft hover fills; primary: action-primary-text on text-critical / text-success), outline 3:1 or more on bg-surface and bg-page. The pairs are checked on every token build. Colour is not announced, so the label must carry the meaning.', 'The visible count is hidden from screen readers; the exact number is read instead, in the name of an icon-only button ("Notifications, 3 unread") or after the text of a text button ("Inbox 7 unread"). The count is not announced when it changes: if a new notification needs announcing, use a Toast.'],
    related: ['banner', 'card', 'icon'],
  },
  {
    slug: 'button-group', tag: 'cm-button-group', react: 'ButtonGroup', name: 'Button group', group: 'Actions',
    summary: 'A row of buttons that wraps, or keeps one line and moves the buttons that don\'t fit into a More menu.',
    lead: 'Buttons 8px apart, in reading order. By default the row wraps onto more lines. With `overflow="menu"` it stays on one line: the buttons that don\'t fit move into a trailing **More** menu, measured from the group\'s own width (so it works in cards and side panels as well as on phones), and come back when there is room. Choosing a menu item clicks the original button, so your click handlers keep working. Since 1.7.',
    responsive: [
      'With `overflow="menu"`, the group measures its own width whenever it, a button or the More trigger changes size: the buttons that don\'t fit move into More, the least important first, and come back when there is room. At 390px the CRM outcomes below show two buttons and More; at 320px, one button and More.',
      'The More trigger is the size of the buttons (36px, slim 32, large 40; 40px drawn with a 44px hit area on touch screens) and sits at the end of the row: on the right, on the left in right-to-left pages. Its menu lines up with its end edge and is at most 320px wide (the window less 32px on phones).',
      'With the default `overflow="wrap"`, buttons wrap onto more lines 8px apart. Use it when every choice must stay visible.',
    ],
    examples: [
      { title: 'Task outcomes on a desktop', description: 'The CRM\'s "what happened?" buttons on a task. With room, every outcome is a button in one line. `data-priority="high"` keeps "Spoke to them" visible longest; the primary button stays visible if it fits at all.',
        html: `<cm-button-group overflow="menu" label="Call outcome">
  <cm-button icon="phone" data-priority="high">Spoke to them</cm-button>
  <cm-button>No answer, reschedule</cm-button>
  <cm-button tone="critical">Not interested</cm-button>
  <cm-button variant="primary">Done</cm-button>
  <cm-button tone="success">Renewed</cm-button>
  <cm-button>Will renew: call back</cm-button>
</cm-button-group>` },
      { title: 'The same outcomes on a 390px phone', description: 'The same markup in a 390px box: "Spoke to them" and "Done" stay, the other four move into More, in their reading order. "Not interested" is red in the menu (`tone="critical"`), and a disabled or loading button is a disabled item. Choosing an item clicks the hidden button, and focus goes back to More.',
        html: `<div style="max-width:390px;min-height:240px">
<cm-button-group overflow="menu" label="Call outcome">
  <cm-button icon="phone" data-priority="high">Spoke to them</cm-button>
  <cm-button>No answer, reschedule</cm-button>
  <cm-button tone="critical">Not interested</cm-button>
  <cm-button variant="primary">Done</cm-button>
  <cm-button tone="success">Renewed</cm-button>
  <cm-button>Will renew: call back</cm-button>
</cm-button-group>
</div>` },
      { title: 'Icon-only More', description: '`more-icon` makes the trigger a square ⋮ button, named by `more-label` ("More" by default). Use it where even the word "More" is too wide, such as table rows and narrow cards. Slim buttons get a slim (32px) trigger.',
        html: `<div style="max-width:300px;min-height:200px">
<cm-button-group overflow="menu" more-icon more-label="More actions">
  <cm-button size="slim" icon="edit">Edit</cm-button>
  <cm-button size="slim" icon="copy">Duplicate</cm-button>
  <cm-button size="slim" icon="download">Download</cm-button>
  <cm-button size="slim" tone="critical" icon="trash">Delete</cm-button>
</cm-button-group>
</div>` },
      { title: 'Wrap (default)', description: 'Without `overflow`, the buttons wrap onto more lines, 8px apart. `align="end"` lines them up at the end edge, for card and dialog footers.',
        html: `<div style="max-width:390px">
<cm-button-group align="end">
  <cm-button>Cancel</cm-button>
  <cm-button>Save as draft</cm-button>
  <cm-button variant="primary">Send quote</cm-button>
</cm-button-group>
</div>` },
      { title: 'Click handlers keep working', description: 'Listen on the buttons as usual. When a button is in the More menu, choosing its item fires the button\'s own `click` (and follows its `href`, or submits its form with `type="submit"`).',
        html: `<div class="stack" style="max-width:300px;min-height:200px">
<cm-button-group overflow="menu" label="Call outcome">
  <cm-button onclick="this.closest('.stack').querySelector('output').textContent = 'Recorded: ' + this.textContent">Spoke to them</cm-button>
  <cm-button onclick="this.closest('.stack').querySelector('output').textContent = 'Recorded: ' + this.textContent">No answer</cm-button>
  <cm-button onclick="this.closest('.stack').querySelector('output').textContent = 'Recorded: ' + this.textContent">Not interested</cm-button>
</cm-button-group>
<output>Choose an outcome</output>
</div>` },
    ],
    stateTable: [
      ['Default', 'Buttons in one row, 8px apart. With `overflow="menu"` and enough room, no More trigger.'],
      ['Overflowing', 'With `overflow="menu"` and too little room, the buttons that don\'t fit are `hidden` and listed in a More menu at the end of the row: `data-priority="low"` first, then the last in reading order, then `data-priority="high"`, the primary button last.'],
      ['Hover', 'Each button and the More trigger turn `bg-hover` (primary: `action-primary-hover`); the menu row under the pointer is black with white text.'],
      ['Focus-visible', 'A 2px `border-strong` ring with 2px offset on the focused button or the More trigger.'],
      ['Pressed', 'Buttons and the More trigger darken a step while pressed; an open More trigger stays `bg-hover`.'],
      ['Selected', 'Not used: a button group records actions, not a choice. For a choice the merchant confirms, use [[Option group|/components/option-group]] or [[Segmented control|/components/segmented-control]].'],
      ['Disabled', 'A disabled button stays disabled in its place, or becomes a disabled (grey) menu item that can\'t be chosen and is skipped by the arrow keys.'],
      ['Loading', 'A loading button shows its spinner in the row; in the menu it is a disabled item until it finishes.'],
    ],
    do: ['Use `overflow="menu"` for rows of outcomes or actions that must stay on one line, such as a task\'s outcomes on a phone.', 'Put the most used choice first and give it `data-priority="high"`; mark rarely used ones `data-priority="low"`.', 'Give the group a `label` that names the choice ("Call outcome") when the buttons are answers to a question.', 'Give every button the same `size`.'],
    dont: ['Don\'t put the single main action of a page in a group with `overflow="menu"` if it could end up in the menu: give it room, or use `variant="primary"` so it stays visible.', 'Don\'t put menus, fields or links that aren\'t `cm-button`s in a group with `overflow="menu"`: they never move into More.', 'Don\'t hide buttons with CSS: use `hidden`, which the group respects.'],
    content: ['Write each label so it still makes sense as a menu item: "Not interested", not "No".', 'Keep labels short: shorter labels mean more of them stay visible.'],
    a11y: ['The row is a `role="group"`, named by `label`.', 'Buttons that move into More get `hidden`: they leave the layout, the tab order and the accessibility tree, and come back when there is room. Tab goes through the visible buttons, then More.', 'More is a WAI-ARIA menu button ([[Action menu|/components/action-menu]]): `aria-haspopup="menu"`, `aria-expanded`, ↓/↑, Home/End and first letters move, Enter/Space choose, Esc closes and returns focus to More. With `more-icon` it is named by `more-label`.', 'Each menu item mirrors its button: the same text (an icon-only button\'s `label`), icon and disabled state; `tone="critical"` makes it a destructive item. Choosing it clicks the original button; focus returns to More, or to the last visible button if More went away.', 'The More trigger is the size of the buttons; on touch screens it is drawn 40px with a 44px hit area, like the buttons.'],
    related: ['button', 'action-menu', 'action-bar'],
  },
  {
    slug: 'text-field', tag: 'cm-text-field', react: 'TextField', name: 'Text field', group: 'Forms',
    summary: 'Lets merchants enter or edit text, numbers, dates and times.',
    lead: 'The base of every form. A 13px medium label above, a 40px box (44px on touch screens; owner standard, 1.6), and room underneath for 12px help text or an error. The outline darkens on hover and gets a 2px ring on focus.',
    examples: [
      { title: 'Default', html: `<cm-text-field label="Store name" placeholder="Anika's Boutique"></cm-text-field>` },
      { title: 'With hint', description: 'A bracketed, lowercase note after the label explains a unit or rule without adding a line.',
        html: `<cm-text-field label="Ordered" hint="points earned per rupee (rs. 1) spent" type="number" value="1"></cm-text-field>` },
      { title: 'Help text', html: `<cm-text-field label="Phone" type="tel" autocomplete="tel" help-text="Phone otp is only for Indian numbers"></cm-text-field>` },
      { title: 'Error', description: 'Say what is wrong and how to fix it. The border turns critical and the message is announced.',
        html: `<cm-text-field label="SKU" value="TS-0042" error="This SKU is already used by another product"></cm-text-field>` },
      { title: 'Multiline', html: `<cm-text-field label="Description" multiline rows="4" help-text="Plain text, up to 500 characters"></cm-text-field>` },
      { title: 'Date and time (browser picker)', description: '`type="datetime-local"` and `type="time"` (since 1.2) use the browser\'s own picker. The value is local time with no time zone: `2026-11-20T16:00` and `16:00`. `min`, `max` and `step` (seconds: `900` is 15 minutes) work as on a native input, and a value outside them is invalid with a message in the page language. The box shows the date and time in the browser\'s language, not the page\'s, so an `en-IN` page may show a 24-hour clock in an English (UK) browser. For a picker that follows the page language and matches the date picker, use [[Date picker|/components/date-picker]] with `time`. For "no past times", set `min` from JavaScript: `field.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)`.',
        html: `<div class="stack">
  <cm-text-field label="Follow up on" type="datetime-local" name="follow_up" min="2026-11-16T09:00" step="900"></cm-text-field>
  <cm-text-field label="Call at" type="time" name="call_at" min="09:00" max="18:00" help-text="Between 9 am and 6 pm"></cm-text-field>
</div>` },
      { title: 'Required', description: 'Marked with a red asterisk. The form will not submit while it is empty: a failed save shows "Please fill in this field." under it and moves focus to it (since 1.14). Tabbing past it shows nothing.',
        html: `<cm-text-field label="Product title" required></cm-text-field>` },
      { title: 'Pattern', description: '`pattern` (since 1.14) is a regular expression the whole value must match, as on a native input. Say what is expected in `pattern-message`; without it the field says "Enter a value in the requested format.". Type something else and leave the field to see it. An empty value is left to `required`.',
        html: `<cm-text-field label="PIN code" pattern="[0-9]{6}" pattern-message="Enter the 6-digit PIN code." help-text="6 digits, like 560001"></cm-text-field>` },
      { title: 'Length', description: '`minlength` and `maxlength` (since 1.14). Too short shows "Enter at least 8 characters." when the merchant leaves the field. Typing stops at `maxlength`; a longer value set by code is invalid and says "Enter 20 characters or fewer.". Works with `multiline` too.',
        html: `<div class="stack">
  <cm-text-field label="Password" type="password" minlength="8" autocomplete="new-password"></cm-text-field>
  <cm-text-field label="SKU" maxlength="20"></cm-text-field>
</div>` },
      { title: 'Format checks', description: '`type="email"`, `"url"` and `"number"` check what is typed (since 1.13.1): "Enter an email address like name@example.com.", "Enter a web address like https://example.com.", "Enter a number.". The message shows when the merchant leaves the field (since 1.14).',
        html: `<cm-text-field label="Email" type="email" autocomplete="email"></cm-text-field>` },
      { title: 'Read-only', description: 'For values the merchant can see and copy but not change here.',
        html: `<cm-text-field label="Order ID" value="#1042" readonly></cm-text-field>` },
      { title: 'Small', description: '`size="small"` makes the box 32px (default: 40px since 1.6, owner standard; was 36px), the height of slim buttons, for toolbars, filter rows and filter panels. Labels are 13px at both sizes. On touch screens both sizes are 44px. The value text is 14px, and 16px on touch screens so phones don\'t zoom in.',
        html: `<div class="row">
  <cm-text-field size="small" label="Min price" type="number" placeholder="0"></cm-text-field>
  <cm-text-field size="small" label="Max price" type="number" placeholder="5000"></cm-text-field>
</div>` },
    ],
    states: [
      { title: 'Disabled', description: 'Can\'t be changed now, and isn\'t sent with the form. Say nearby why, if it isn\'t obvious.',
        html: `<cm-text-field label="Store address" value="preprod.commmerce.com" disabled help-text="Change your address in Domains"></cm-text-field>` },
    ],
    do: ['Always show a visible label.', 'Use `hint` for units and rules, `help-text` for one sentence of guidance.', 'Space fields `space-16` apart in a form, `space-24` between groups of fields.', 'Set `type` and `autocomplete` so phones show the right keyboard and browsers can fill it in.', '`type="email"` uses the browser\'s email rule: it accepts `a@b` and refuses some international addresses such as `x@пример.рф`. If your server\'s rule differs, use `type="text"` with `inputmode="email"` (the email keyboard on phones) and show your own check with `error` (since 1.15).'],
    dont: ['Don\'t use the placeholder as the label: it disappears as soon as the merchant types.', 'Don\'t show an error before the merchant has finished with the field. The field\'s own messages wait until they leave it or save (since 1.14).', 'Don\'t disable a field to show a value: use `readonly`.', 'Don\'t rely on these checks alone: anyone can get round checks in the browser, so check every value again on your server.'],
    content: ['Labels are nouns: "Name", "Subject", "Redeemed".', 'Errors say what to do: "Enter a price above 0", not "Invalid input".', 'Help text is one sentence; no full stop needed.'],
    a11y: ['The label is a real `<label>` tied to the input.', 'Errors and help text are linked with `aria-describedby`; errors use `role="alert"` and set `aria-invalid`.', 'Form-associated: the value is submitted with the form, `required` blocks submission, and `form.reset()` restores the initial value.', 'Validation (since 1.14): the field\'s own message shows under it when the merchant leaves a changed field with a format, range or length problem, and on every invalid field when a save fails, with focus moved to the first. It uses the same `role="alert"`, `aria-invalid` and `aria-describedby` as `error`; the app\'s `error` always wins. See [[Validation|/apps/guidelines?s=validation]].', 'With `min`, `max` or `step`, a value outside them blocks submission (`validity.rangeUnderflow`, `rangeOverflow`, `stepMismatch`) with a message in the page language that names the limit; a half-typed time or date-and-time is `badInput` ("Enter a complete time.").', '`date`, `time` and `datetime-local` are native inputs: each part (day, month, hour, minute, am/pm) is edited with the number keys and Up/Down, and the browser names the parts for screen readers. How the box and picker look is up to the browser: Chromium\'s picker shows a calendar and time columns, while Safari and Firefox edit the time in the box. Not tested with screen readers yet.', 'Input borders are `border-input` (3.4:1), meeting the 3:1 contrast required for form controls.'],
    related: ['checkbox', 'button'],
  },
  {
    slug: 'checkbox', tag: 'cm-checkbox', react: 'Checkbox', name: 'Checkbox', group: 'Forms',
    summary: 'Turns a setting on or off, or picks several items from a list.',
    lead: 'A 16px box (18px on touch screens; owner standard, 1.6) with a 14px label and optional 12px help text, for settings and multi-select lists. Without a label it is 24px tall with the box centred, so it lines up in rows. Hover tints the box; focus draws a 2px ring.',
    examples: [
      { title: 'Default', html: `<cm-checkbox label="Track quantity" checked></cm-checkbox>` },
      { title: 'With description', html: `<cm-checkbox label="Charge tax on this product" description="Uses the GST rate in your tax settings"></cm-checkbox>` },
      { title: 'Group', description: 'Rows are `space-12` apart. Wrap related options in a fieldset with a legend.',
        html: `<fieldset class="stack" style="border:0;margin:0;padding:0;gap:var(--cm-space-12)">
  <legend style="font-size:14px;font-weight:500;margin-bottom:var(--cm-space-8)">Notify customers by</legend>
  <cm-checkbox name="notify" value="email" label="Email" checked></cm-checkbox>
  <cm-checkbox name="notify" value="sms" label="SMS" description="Phone otp is only for Indian numbers"></cm-checkbox>
  <cm-checkbox name="notify" value="whatsapp" label="WhatsApp"></cm-checkbox>
</fieldset>` },
      { title: 'Indeterminate', description: 'For a "select all" box when only some rows are selected.',
        html: `<cm-checkbox label="Select all products" indeterminate></cm-checkbox>` },
      { title: 'Disabled', html: `<cm-checkbox label="Allow cash on delivery" description="Set up a payment provider first" disabled></cm-checkbox>` },
    ],
    do: ['Write labels so that ticked means "yes": "Track quantity", not "Don\'t track quantity".', 'Use a checkbox for settings that save with the form; use a toggle for settings that apply straight away.'],
    dont: ['Don\'t use checkboxes for choices that exclude each other: use radio buttons.', 'Don\'t write long labels: move detail into `description`.'],
    content: ['Sentence case labels, no full stop.', 'Descriptions explain the consequence, in one line.'],
    a11y: ['A native checkbox inside a `<label>`; the whole row is clickable.', 'The description is linked with `aria-describedby`.', 'Space toggles it; focus shows a 2px ring around the box.', 'Form-associated: submits `value` when checked.'],
    related: ['text-field', 'card'],
  },
  {
    slug: 'radio', tag: 'cm-radio-group', react: 'RadioGroup', name: 'Radio button', group: 'Forms',
    parts: [{ tag: 'cm-radio', react: 'Radio' }],
    summary: 'Picks exactly one option from a short list.',
    lead: 'A group of 16px round buttons with 14px labels and optional help text. The group holds the value, the keyboard behaviour and the form submission.',
    examples: [
      { title: 'Default', html: `<cm-radio-group name="inventory" label="Inventory" help-text="Inventory tracking condition">
  <cm-radio value="track" label="Track quantity" checked></cm-radio>
  <cm-radio value="untracked" label="Don't track quantity"></cm-radio>
</cm-radio-group>` },
      { title: 'Horizontal', description: 'For two or three short options, such as a status. Options sit `space-24` apart.',
        html: `<cm-radio-group name="status" label="Status of the product" orientation="horizontal">
  <cm-radio value="active" label="Active"></cm-radio>
  <cm-radio value="inactive" label="Inactive" checked></cm-radio>
</cm-radio-group>` },
      { title: 'With descriptions', html: `<cm-radio-group name="checkout" label="Customer accounts">
  <cm-radio value="optional" label="Accounts are optional" description="Customers can check out as a guest" checked></cm-radio>
  <cm-radio value="required" label="Accounts are required" description="User has to create an account to checkout"></cm-radio>
</cm-radio-group>` },
      { title: 'Required with error', description: 'The form will not submit until an option is chosen.',
        html: `<cm-radio-group name="ship" label="Shipping method" required error="Choose a shipping method">
  <cm-radio value="standard" label="Standard"></cm-radio>
  <cm-radio value="express" label="Express"></cm-radio>
</cm-radio-group>` },
      { title: 'Disabled option', html: `<cm-radio-group name="pay" label="Payment">
  <cm-radio value="prepaid" label="Prepaid" checked></cm-radio>
  <cm-radio value="cod" label="Cash on delivery" description="Set up a payment provider first" disabled></cm-radio>
</cm-radio-group>` },
    ],
    do: ['Use radios when the options exclude each other and the merchant should see them all at once.', 'Pre-select the safest or most common option when there is one.', 'Keep to about five options; use a select for longer lists.'],
    dont: ['Don\'t use a single radio on its own: use a checkbox.', 'Don\'t use radios for settings that apply straight away: use a toggle.', 'Don\'t put `<cm-radio>` outside a `<cm-radio-group>`: the group owns the value.'],
    content: ['The group label asks the question: "Status of the product".', 'Option labels are short and parallel: "Active", "Inactive".', 'Descriptions explain the consequence in one line.'],
    a11y: ['The group is a `radiogroup` named by its label; each option is a `radio` with `aria-checked`.', 'One tab stop: Tab reaches the selected option (or the first one), arrow keys move and select, skipping disabled options and wrapping at the ends, and Space selects.', 'Form-associated: submits the selected `value` under `name`, `required` blocks submission, and `form.reset()` restores the initial choice.', 'Errors use `role="alert"` and are linked with `aria-describedby`.'],
    related: ['checkbox', 'option-group', 'select'],
  },
  {
    slug: 'toggle', tag: 'cm-toggle', react: 'Toggle', name: 'Toggle', group: 'Forms',
    summary: 'Turns a setting on or off straight away.',
    lead: 'A 36×20 switch for settings that take effect immediately, such as showing a product on the store. Lists often show it without a visible label.',
    examples: [
      { title: 'In a list row', description: 'With no visible label, name it with `aria-label`.',
        html: `<div class="row">
  <cm-toggle aria-label="Show Cotton kurta on store" checked></cm-toggle>
  <cm-toggle aria-label="Show Linen shirt on store"></cm-toggle>
</div>` },
      { title: 'With label', html: `<cm-toggle label="Show on store" checked></cm-toggle>` },
      { title: 'With description', html: `<cm-toggle label="Accept orders" description="Turn off to pause checkout for maintenance"></cm-toggle>` },
      { title: 'Disabled', html: `<cm-toggle label="Cash on delivery" description="Set up a payment provider first" disabled></cm-toggle>` },
    ],
    do: ['Use a toggle when the change applies at once, with no Save button.', 'Write the label as the thing that is on: "Show on store".', 'Confirm the change, for example with a toast, when it affects customers.'],
    dont: ['Don\'t use a toggle inside a form that needs saving: use a checkbox.', 'Don\'t change the label when the state changes; the switch shows the state.', 'Don\'t leave it unnamed: set `label` or `aria-label`.'],
    content: ['Labels are short noun or verb phrases in sentence case.', 'Don\'t add "On" or "Off" text next to the switch.'],
    a11y: ['A native checkbox with `role="switch"`, so screen readers say "switch, on/off". Space toggles it.', 'The track colours (`toggle-on`, `toggle-off`) are only 1.9:1 and 1.5:1 against white, so the track and thumb get a 1px `border-input` outline (3.4:1) to meet the 3:1 needed for controls. The thumb position also shows the state.', 'Form-associated: submits `value` when on, and `form.reset()` restores the initial state.', 'Respects reduced motion.'],
    related: ['checkbox', 'radio'],
  },
  {
    slug: 'select', tag: 'cm-select', react: 'Select', name: 'Select', group: 'Forms',
    responsive: ["Options in the open list are 36px rows of 14px text with 12px side padding (32px with `size=\"small\"`; since 1.6, the same rows as Action menu and Combobox); on touch screens the box and the rows are 44px tall and the value is 16px."],
    summary: 'Picks one option from a list that opens below the field.',
    lead: 'A 40px field (32px with `size="small"`; 40px since 1.6, owner standard) with a chevron that opens a list of options. The chosen option is shown in black in the list and as the field\'s value.',
    examples: [
      { title: 'Default', description: 'Write options as `<option>` children, as you would for a native select.',
        html: `<cm-select name="customer" label="Customer" placeholder="Select customer">
  <option value="robinson-rao">Robinson Mid Rao - robiroa09102@gmail.com</option>
  <option value="robinson">Robinson - robinson9900@gmail.com</option>
  <option value="manjunath">Manjunath - manju8393@gmail.com</option>
</cm-select>` },
      { title: 'Next to a button', description: 'The field fills the row and a large primary button of the same height (40px) sits on the right.',
        html: `<div class="row" style="align-items:flex-end;flex-wrap:nowrap;gap:8px">
  <cm-select name="customer" label="Customer" placeholder="Select customer" style="flex:1">
    <option value="robinson">Robinson - robinson9900@gmail.com</option>
    <option value="manjunath">Manjunath - manju8393@gmail.com</option>
  </cm-select>
  <cm-button variant="primary">Add new customer</cm-button>
</div>` },
      { title: 'Small, in a filter row', description: 'Since 1.5. `size="small"` makes the box 32px, the height of slim buttons and small search, so a toolbar or filter row lines up. Name fields without a visible label with `aria-label`.',
        html: `<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
  <cm-search size="small" label="Search orders" placeholder="Search orders" style="flex:1 1 200px;min-width:0"></cm-search>
  <cm-select size="small" aria-label="Status" placeholder="Status">
    <option value="open">Open</option>
    <option value="done">Done</option>
  </cm-select>
  <cm-select size="small" aria-label="Owner" placeholder="Owner">
    <option value="me">Me</option>
    <option value="anyone">Anyone</option>
  </cm-select>
  <cm-button size="slim">Clear filters</cm-button>
</div>` },
      { title: 'Preselected', html: `<cm-select name="status" label="Status">
  <option value="active">Active</option>
  <option value="inactive" selected>Inactive</option>
  <option value="draft">Draft</option>
</cm-select>` },
      { title: 'Help text and disabled option', html: `<cm-select name="courier" label="Courier" placeholder="Choose a courier" help-text="Used for new orders only">
  <option value="delhivery">Delhivery</option>
  <option value="bluedart">Blue Dart</option>
  <option value="ekart" disabled>Ekart (not available in your area)</option>
</cm-select>` },
      { title: 'Error', html: `<cm-select name="state" label="State" placeholder="Select state" required error="Choose the state for GST">
  <option value="ka">Karnataka</option>
  <option value="mh">Maharashtra</option>
  <option value="tn">Tamil Nadu</option>
</cm-select>` },
      { title: 'Disabled', html: `<cm-select label="Currency" disabled><option value="inr" selected>Indian rupee (INR)</option></cm-select>` },
      { title: 'Option groups', description: 'Since 1.3. Put options under headings with `<optgroup label="…">`, or give each option in `options` a `group` (`{ value, label, group }`): options of a group are shown together, in the order the groups first appear. Headings can\'t be chosen and the arrow keys skip them. When labels repeat across groups, `show-group` shows the chosen option as "Lead: Email" in the box.',
        html: `<div style="min-height:340px"><cm-select name="field" label="Take the value from a CRM field" placeholder="Choose a field" show-group>
  <option value="owner">Record owner</option>
  <optgroup label="Lead">
    <option value="lead.company">Company</option>
    <option value="lead.email">Email</option>
  </optgroup>
  <optgroup label="Contact">
    <option value="contact.name">Full name</option>
    <option value="contact.email">Email</option>
  </optgroup>
  <optgroup label="Deal">
    <option value="deal.amount">Amount</option>
  </optgroup>
</cm-select></div>` },
    ],
    stateTable: [
      ['Default', 'White 40px box, `border-input` outline, chevron at the end; placeholder in `text-tertiary`.'],
      ['Hover', 'The outline darkens to `border-strong`. In the open list, the row under the pointer is `bg-hover`.'],
      ['Focus-visible', '`border-strong` outline plus a 1px ring (2px in all); the highlighted option is shown with `aria-activedescendant`.'],
      ['Pressed', 'Pressing an option darkens its row a little before the list closes.'],
      ['Selected', 'The chosen option is black with white text in the list, and is the box\'s value.'],
      ['Disabled', 'Grey fill (`bg-input-filled`), light outline, grey text, `not-allowed` cursor; it doesn\'t open and isn\'t submitted.'],
      ['Loading', 'Since 1.6: `loading` swaps the chevron for a small spinner and sets `aria-busy`; the list doesn\'t open until you clear it.'],
      ['Error', '`border-critical` outline and the message under the box (`role="alert"`, `aria-invalid`).'],
    ],
    do: ['Use a select for five or more options, or when space is tight; use radios for fewer.', 'Write a placeholder that says what to pick: "Select customer".', 'Order options in a way the merchant expects: alphabetical, by frequency, or by size.', 'When no option is marked `selected`, `value` is `\'\'`. For a required single choice, either pre-select the sensible default or keep the confirming button (Apply, Save) disabled until `value` is set, so pressing it never silently does nothing.'],
    dont: ['Don\'t use a select for actions: use an action menu.', 'Don\'t use it for yes/no: use a checkbox or toggle.', 'Don\'t put very long lists in it (hundreds of items): use a [[Combobox|/components/combobox]], which filters as the merchant types.'],
    content: ['The label is a noun: "Customer", "Status".', 'Options are short and start with the word that tells them apart, so typeahead works.'],
    a11y: ['**Why a custom list, not a native `<select>`:** the open list is a styled panel with a black fill on the chosen option, and native select popups can\'t be styled that way (and look different on every OS). So it follows the WAI-ARIA "select-only combobox" pattern, with native-select keyboard support.', 'Option groups are `group`s inside the listbox, each named by its heading (`aria-labelledby`), so screen readers say which group an option is in; the headings are not options.', 'Keyboard: Down, Up, Enter or Space opens; arrows move (skipping disabled options and group headings); Home and End jump; Page Up/Down move by ten; typing letters jumps to a match (repeat a letter to cycle); Enter or Space chooses; Escape closes without choosing; Tab chooses the highlighted option and moves on.', 'The field is a `combobox` labelled by the visible label, with `aria-expanded` and `aria-activedescendant`; options are `option`s with `aria-selected`.', 'Form-associated: submits `value` under `name`, `required` blocks submission, and `form.reset()` restores the initial choice. `<option selected>` sets the initial value.', 'Contrast: the border is `border-input` (3:1 or more, as form controls need) and the placeholder is `text-tertiary` (4.5:1 or more).'],
    related: ['radio', 'option-group', 'text-field'],
  },
  {
    slug: 'search', tag: 'cm-search', react: 'Search', name: 'Search', group: 'Forms',
    summary: 'Filters a list or table by what the merchant types.',
    lead: 'A box with a search icon, placed at the top of lists, in the same white box and grey outline as the other fields. It can carry a filter button that opens a filter panel. Sizes: `small` 32px for toolbars, filter rows and table headers, `default` 40px (since 1.6, owner standard; was 36px), `large` 40px; all 44px on touch screens.',
    examples: [
      { title: 'Default', html: `<cm-search label="Search products" placeholder="Search something"></cm-search>` },
      { title: 'With filter', description: 'Listen for `cm-filter` and open your filter panel. `filter-count` shows how many filters are applied.',
        html: `<cm-search label="Search orders" placeholder="Search by order ID or customer" filter filter-count="2"></cm-search>` },
      { title: 'Small', description: 'Since 1.5. 32px, for toolbars and filter rows next to small selects and slim buttons.',
        html: `<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
  <cm-search size="small" label="Search tasks" placeholder="Search tasks" style="flex:1 1 200px;min-width:0"></cm-search>
  <cm-select size="small" aria-label="Owner" placeholder="Owner"><option value="me">Me</option><option value="anyone">Anyone</option></cm-select>
  <cm-button size="slim">Clear</cm-button>
</div>` },
      { title: 'Large', description: '40px, for a search that leads the page.',
        html: `<cm-search size="large" label="Search customers" placeholder="Search something" filter></cm-search>` },
      { title: 'In a table header', description: 'A small (32px) box with a slim (32px) button next to it, so their edges line up.',
        html: `<div class="row" style="flex-wrap:nowrap;gap:8px">
  <cm-search label="Search orders" placeholder="Search something" style="flex:1"></cm-search>
  <cm-button>Bulk orders</cm-button>
</div>` },
    ],
    states: [
      { title: 'Loading', description: 'Since 1.6. While you load the options, `loading` shows a spinner in place of the chevron; the list opens once it is cleared.',
        html: `<cm-select label="Warehouse" placeholder="Loading warehouses" loading></cm-select>` },
      { title: 'No results', description: 'Say what found nothing, and how to widen the search.',
        html: `<div class="stack" style="max-width:520px">
  <cm-search label="Search orders" value="Ramesh"></cm-search>
  <cm-empty-state size="small" icon="search" heading="No orders match “Ramesh”">Check the spelling, or search by order number or phone.</cm-empty-state>
</div>` },
      { title: 'Disabled', description: 'While the list can\'t be searched, for example while it is first loading.',
        html: `<cm-search label="Search orders" placeholder="Search orders" disabled style="max-width:520px"></cm-search>` },
    ],
    do: ['Say what is searched in `label`, and give an example in `placeholder`.', 'Filter as the merchant types for short lists; wait for Enter (`cm-search`) when results come from the server.', 'Show an empty state when nothing matches, with a way to clear the search.'],
    dont: ['Don\'t use the placeholder as the only label: set `label` (it is read out, not shown).', 'Don\'t put more than one search box above a list.'],
    content: ['Placeholders give an example or the fields searched: "Search by order ID or customer".', 'No full stop.'],
    a11y: ['A native `type="search"` input named by `label`. Enter fires `cm-search`; Escape clears.', 'The clear button (shown once there is a query) and the filter button are real buttons with names; the filter count is part of the filter button\'s name.', 'The edge is `border-input` (3:1 or more, as form controls need) and the placeholder is `text-tertiary` (4.5:1 or more). The clear and filter buttons are 24px (32px on touch screens).', 'Form-associated: submits the query under `name`.'],
    related: ['text-field', 'select', 'tag'],
  },
  {
    slug: 'global-search', tag: 'cm-global-search', react: 'GlobalSearch', name: 'Global search', group: 'Navigation',
    responsive: ['Results open under the box at its full width and scroll once they are taller than 480px (or the window less 140px).', 'In the Header bar\'s `search` slot, at 900px or narrower the bar shows a search button instead, and the search opens full screen with the results filling the screen under it.'],
    summary: 'One box that searches everything and lists matches grouped by kind, each a link to its page.',
    lead: 'A search box like [[Search|/components/search]] with a panel of results under it, grouped by kind ("Leads", "Deals", "Tickets"): each group has a heading with its total, up to a few results with a title and a grey second line, and an optional "See all" link. Your app does the searching: listen for `cm-search` (it carries the query), fetch, and set `results`, with `loading` while the request runs. Choosing a result follows its link; `cm-combobox` is the one to use when the merchant picks a value for a form.',
    examples: [
      { title: 'Grouped results', description: 'Opens with results for "ravi"; type in the box to search again (this demo shows the same results for any query). Arrow keys move through every result across groups, Enter opens one, Escape closes.',
        html: `<div style="min-height:420px;max-width:560px">
  <cm-global-search label="Search the CRM" placeholder="Search leads, deals, tickets" value="ravi" open
    results='[{"label": "Leads", "total": 12, "href": "#leads", "items": [{"title": "Ravi Stores", "description": "Lead · Mumbai · +91 98200 12345", "href": "#lead-ravi-stores", "icon": "user"}, {"title": "Ravi Traders", "description": "Lead · Pune", "href": "#lead-ravi-traders", "icon": "user"}]}, {"label": "Deals", "total": 3, "href": "#deals", "items": [{"title": "Ravi Stores annual plan", "description": "Deal · ₹ 48,000 · Negotiation", "href": "#deal-1042", "icon": "wallet"}]}, {"label": "Tickets", "items": [{"title": "Ravi Stores cannot print invoices", "description": "Ticket #5531 · Open", "href": "#ticket-5531", "icon": "help"}]}]'></cm-global-search>
</div>` },
      { title: 'With a shortcut key', description: '`shortcut="/"` lets the merchant press / anywhere on the page to jump to the box (not while typing in a field). It is off by default: turn it on for one search per page, usually the one in the header.',
        html: `<div style="max-width:560px"><cm-global-search label="Search the CRM" placeholder="Search everything" shortcut="/"></cm-global-search></div>` },
      { title: 'In the header bar', description: 'Put it in the Header bar\'s `search` slot. Wider than 900px the box sits inline after the store switcher; this preview is narrower, so the bar shows a search button that opens the search full screen.',
        html: `<cm-header-bar store="preprod.commmerce.com" user-name="Demo user">
  <img slot="logo" src="assets/logo-placeholder-mark.svg" alt="Store logo" width="24" height="24">
  <cm-global-search slot="search" label="Search the CRM" placeholder="Search leads, deals, tickets"></cm-global-search>
</cm-header-bar>` },
    ],
    states: [
      { title: 'Loading', description: 'Set `loading` while your request runs: a spinner and "Loading" (announced) replace the results.',
        html: `<div style="min-height:140px;max-width:560px"><cm-global-search label="Search the CRM" value="ravi" loading open></cm-global-search></div>` },
      { title: 'No results', description: 'With a query and no results, the panel says so (`empty-text`). Name what was searched.',
        html: `<div style="min-height:140px;max-width:560px"><cm-global-search label="Search the CRM" value="zzq" open empty-text="No leads, deals or tickets match"></cm-global-search></div>` },
    ],
    do: ['Debounce `cm-search` requests (about 250 ms), cancel stale ones, and set `loading` while they run.', 'Show the best three to five results per kind and link the rest with the group\'s `href` ("See all").', 'Pass each group\'s full `total`, not only the number shown.', 'Make every result a real link (`href`); cancel `cm-select` with `preventDefault()` only to route inside a single-page app.'],
    dont: ['Don\'t use it to pick a value in a form: use a [[Combobox|/components/combobox]].', 'Don\'t use it to filter the list on the current page: use [[Search|/components/search]].', 'Don\'t turn on `shortcut` for more than one search on a page.'],
    content: ['The placeholder names what can be found: "Search leads, deals, tickets".', 'Group headings are the plural kind: "Leads", "Deals". The second line says what the result is and how to tell it apart: "Lead · Mumbai".'],
    a11y: ['Follows the WAI-ARIA combobox pattern with a grouped listbox: the text box has `role="combobox"`, `aria-expanded` and `aria-controls`; results are `option`s inside `group`s named by their heading and total ("Leads, 12 results"). Focus stays in the box and the highlighted result is shown with `aria-activedescendant`.', 'Keyboard: typing searches and opens the results; Down and Up move through every result across groups (wrapping); Enter opens the highlighted result; Escape closes the results, and a second Escape clears the box; Tab moves on and closes them.', 'The number of results, "Loading" and "No results" are announced through a polite live region.', 'The `shortcut` key is opt-in and exposed as `aria-keyshortcuts`; it never fires while the merchant types in a field or holds Ctrl, Alt or Cmd.', 'Why not `cm-search` with a popover: the combobox and its listbox have to share one shadow root for `aria-activedescendant` and `aria-controls` to work, so the box is built in.'],
    related: ['search', 'combobox', 'header-bar'],
  },
  {
    slug: 'command-palette', tag: 'cm-command-palette', react: 'CommandPalette', name: 'Command palette', group: 'Navigation',
    responsive: ['A dialog 640px wide (never wider than the window less 32px), centred and 12% of the window height from the top; the list scrolls inside it.', 'At 640px wide or narrower it fills the screen with square corners, and shows a close button instead of the Esc keycap.', 'The search box is 40px tall (44px on touch screens, with 16px typed text so phones don\'t zoom). Rows are 36px with 14px text, 16px icons and 12px side padding, like other menus (1.6); 44px on touch screens.'],
    summary: 'A search box in a dialog (Cmd/Ctrl+K) to jump to any record or run an action from the keyboard.',
    lead: 'For people who work from the keyboard: press a shortcut, type a few letters, press Enter. The dialog lists records your app finds ("Records": leads, contacts), the actions it can run ("New lead") and places it can go ("Go to Tasks"), in groups, each row with an icon, a title, a grey second line and an optional key hint. Records come from your server, as in [[Global search|/components/global-search]]: listen for `cm-search`, fetch, set `results`. Actions are registered once in `actions`, with `keywords`, and the palette filters them itself as the merchant types. While the box is empty it shows `recent` items, then every action. Choosing a row fires a cancelable `cm-select` and follows its link, or calls its `run` function.',
    examples: [
      { title: 'CRM: leads, contacts and actions', description: 'Press the button, or Ctrl+K (⌘K on a Mac) anywhere on this page, even while typing in a field. Type "ravi" for records (the demo answers after 400 ms), "add" or "night" to find actions by keyword, or "zzz" for no results. Choosing a record or a place shows a toast here instead of leaving the page; "Switch to dark theme" switches this preview.',
        html: `<div style="min-height:120px">
  <cm-button data-opens="palette" icon="search">Search or run a command</cm-button>
  <cm-command-palette id="palette" shortcut="mod+k" data-demo-crm placeholder="Search leads and contacts, or run a command"
    recent='[{"title": "Ravi Stores", "description": "Lead · Mumbai", "href": "#lead-ravi-stores", "icon": "user"}, {"title": "Anika Sharma", "description": "Contact · Sharma Textiles", "href": "#contact-anika", "icon": "id-card"}]'
    actions='[{"label": "Actions", "items": [{"title": "New lead", "description": "Create a lead", "icon": "plus", "keywords": ["create", "add"], "shortcut": "mod+shift+l", "value": "new-lead"}, {"title": "Switch to dark theme", "icon": "moon", "keywords": ["appearance", "night", "mode"], "value": "theme-dark"}]}, {"label": "Navigate", "items": [{"title": "Go to Tasks", "icon": "tasks", "href": "#tasks", "shortcut": "g t", "keywords": ["todo", "to-do"]}, {"title": "Go to Leads", "icon": "users", "href": "#leads"}, {"title": "Go to Contacts", "icon": "id-card", "href": "#contacts"}]}]'></cm-command-palette>
</div>` },
    ],
    stateTable: [
      ['Closed', 'Nothing on the page. Opens with `show()`, the `open` attribute or the `shortcut` (opt-in).'],
      ['Empty box', 'The `recent` items under "Recent", then every action group. The first row is highlighted, so Enter runs it.'],
      ['Typing', '`cm-search` fires with the query; matching actions show at once (every word must appear in the title or a keyword, any case); your records appear when you set `results`.'],
      ['Loading', '`loading`: a small spinner and "Loading" (announced) above the matching actions, in place of the records.'],
      ['No results', 'Nothing matches: the list is replaced by "No results" (`empty-text`), announced politely.'],
      ['Hover', 'The row under the pointer is highlighted (`bg-hover`).'],
      ['Focus-visible', 'Focus stays in the search box (`border-strong` outline and a 1px ring); the highlighted row has `bg-hover` and a 2px `border-strong` bar on its start edge, and is announced through `aria-activedescendant`.'],
      ['Pressed / selected', 'Enter or a click chooses the highlighted row: the palette closes, focus goes back to the opener, then `cm-select` fires (cancelable) and the link is followed or `run` is called.'],
      ['Disabled', 'Not applicable: leave an action out of `actions` while it can\'t run.'],
    ],
    keyboard: [
      ['Cmd+K (macOS) / Ctrl+K', 'Opens the palette from anywhere on the page, also while typing in a field; closes it when open. Only with `shortcut="mod+k"`.'],
      ['Type', 'Searches: fires `cm-search` and filters the actions.'],
      ['↓ / ↑', 'Moves the highlight through every row across groups, wrapping at the ends.'],
      ['Home / End', 'Highlights the first or last row (Shift+Home/End still select text in the box).'],
      ['Enter', 'Chooses the highlighted row.'],
      ['Esc', 'Closes the palette (a cancelable `cm-close`); focus goes back to where it was.'],
      ['Tab', 'Stays inside the dialog (the page behind is inert): on phones it reaches the close button.'],
    ],
    do: ['Turn the shortcut on for one palette per app, in the admin shell, with `shortcut="mod+k"`.', 'Register every action in `actions` with a few `keywords` merchants might type ("create", "add" for "New lead").', 'Keep `recent` up to date from `cm-select`, five to eight items.', 'Debounce `cm-search` (about 250 ms), cancel stale requests, set `loading` while they run, and show at most five records per kind with a "See all" link (`href` on the group).', 'Give actions that have their own shortcut a `shortcut` hint (`mod+shift+l`, or `g t` for keys pressed one after the other), and listen for that shortcut yourself.'],
    dont: ['Don\'t make it the only way to reach something: everything in it must also be on a page or a menu.', 'Don\'t use it to search the list on the current page: use [[Search|/components/search]]; for a search box in the header use [[Global search|/components/global-search]].', 'Don\'t pick a shortcut the browser keeps for itself (Ctrl+T, Ctrl+W, Ctrl+N, Ctrl+L): pages can\'t override those.', 'Don\'t put destructive actions in it without a confirmation step.'],
    content: ['Actions start with a verb in sentence case: "New lead", "Switch to dark theme". Places start with "Go to": "Go to Tasks".', 'The second line says what a record is and how to tell it apart: "Lead · Mumbai".', 'Group headings are short plurals or kinds: "Leads", "Contacts", "Actions", "Navigate".'],
    a11y: ['A native modal `<dialog>` named "Command palette" (`label`), opened with `showModal()` through the same overlay helper as [[Modal|/components/modal]]: the page behind is inert, Esc closes through a cancelable `cm-close`, page scrolling is locked and focus returns to the element that had it.', 'Inside, the search box is a `combobox` with `aria-expanded`, `aria-controls` and `aria-activedescendant` over a grouped `listbox`, as in Global search: each group is a `group` labelled by its heading; focus never leaves the box.', 'Result counts, "Loading" and "No results" are announced through a polite live region; nothing is announced for the empty box.', 'Key hints are drawn as `<kbd>` keycaps (12px), hidden from screen readers, and exposed on the row as `aria-keyshortcuts` (single shortcuts only, not sequences).', '**Shortcut caveat:** `mod+k` is Cmd+K on macOS and iPadOS and Ctrl+K elsewhere. It works while the merchant types in a field because it holds a modifier. The page only gets the key while it has focus: not while focus is in the browser\'s address bar, and inside an embedded app only while focus is in the app\'s frame. Chrome, Edge, Firefox and Safari let pages take Ctrl+K / Cmd+K (their own "search the web" shortcut then doesn\'t run while the page has focus); shortcuts browsers reserve (Ctrl+T, Ctrl+W, Ctrl+N) can never be taken. Keep a visible way to open the palette (a button) as well.'],
    related: ['global-search', 'modal', 'action-menu', 'header-bar'],
  },
  {
    slug: 'combobox', tag: 'cm-combobox', react: 'Combobox', name: 'Combobox', group: 'Forms',
    responsive: ['Suggestions in the open list are 36px rows of 14px text with 12px side padding (32px with `size="small"`; since 1.6); on touch screens the box and the rows are 44px tall and the typed text is 16px.', 'With `multiple`, 24px tags wrap onto new rows inside the box, so it grows 28px per row from its 40px minimum instead of getting wider; the chevron stays at the end. While the box isn\'t focused only `max-tags` (3) tags show, then "+N more".'],
    summary: 'Suggests matching options as the merchant types; picks one, or several shown as tags.',
    lead: 'A 40px text box (32px with `size="small"`, for toolbars and filter rows; 40px since 1.6) that opens a list of matching options as the merchant types. Use it when the list is too long to scroll (customers, products, tags), when results come from the server, or when the merchant may add a value of their own. With `multiple`, chosen options show as removable 24px [[Tags|/components/tag]] (12px text, the same tags as everywhere) inside the box; while it isn\'t focused, the first three show and the rest become "+N more" (since 1.6).',
    examples: [
      { title: 'Default', description: 'Write options as `<option>` children, as for Select. Typing narrows the list to options that contain the text.',
        html: `<cm-combobox name="customer" label="Customer" placeholder="Search customers">
  <option value="c-101">Robinson Mid Rao</option>
  <option value="c-102">Manjunath K</option>
  <option value="c-103">Anika Sharma</option>
  <option value="c-104">Priya Raman</option>
  <option value="c-105">Rahul Verma</option>
</cm-combobox>` },
      { title: 'Product tags (multi-select)', description: '`multiple` shows each chosen tag as a removable [[Tag|/components/tag]]; Backspace in the empty box removes the last one, and ← moves to the tags (←/→ between them, Backspace or Delete removes one). `allow-custom` offers "Add …" for a tag that doesn\'t exist yet. The form submits each tag as its own `tags` entry.',
        html: `<cm-combobox name="tags" label="Tags" multiple allow-custom placeholder="Find or create tags" help-text="Customers can filter your store by tag">
  <option value="cotton" selected>Cotton</option>
  <option value="summer" selected>Summer</option>
  <option value="handmade">Handmade</option>
  <option value="festive">Festive</option>
  <option value="sale">Sale</option>
  <option value="organic">Organic</option>
</cm-combobox>` },
      { title: 'Many choices ("What they sell")', description: 'Since 1.6. With many options chosen, the box shows three tags and "+4 more" until the merchant clicks or tabs into it; then every tag shows, wrapping onto more rows. Set `max-tags` to show more (or `0` for all). The list scrolls after seven 36px rows.',
        html: `<div style="max-width:420px;min-height:360px"><cm-combobox name="sells" label="What they sell" multiple placeholder="Search categories" help-text="Choose every category the shop sells">
  <option selected>Groceries</option><option selected>Dairy</option><option selected>Bakery</option><option selected>Snacks</option>
  <option selected>Beverages</option><option selected>Personal care</option><option selected>Household</option>
  <option>Frozen foods</option><option>Fruits and vegetables</option><option>Stationery</option><option>Electronics</option><option>Pet supplies</option>
</cm-combobox></div>` },
      { title: 'Results from the server', description: 'With `filter="none"` the component doesn\'t filter. Listen for `cm-search` (its `detail.query` is the text), set `loading` while you fetch, then set `options` and clear `loading`. Debounce the request in your code. In this preview the list is already loaded.',
        html: `<cm-combobox name="product" label="Product" filter="none" placeholder="Search products" empty-text="No products match">
  <option value="p-1">Cotton kurta, indigo</option>
  <option value="p-2">Cotton kurta, white</option>
  <option value="p-3">Silk dupatta</option>
</cm-combobox>` },
      { title: 'Loading', description: 'While `loading`, the open list shows a spinner and "Loading" is announced.',
        html: `<cm-combobox label="Product" filter="none" loading placeholder="Search products"></cm-combobox>` },
      { title: 'Error', html: `<cm-combobox name="courier" label="Courier" required error="Choose a courier for this order" placeholder="Search couriers">
  <option value="delhivery">Delhivery</option>
  <option value="bluedart">Blue Dart</option>
  <option value="ekart" disabled>Ekart (not available in your area)</option>
</cm-combobox>` },
      { title: 'Small', description: 'Since 1.5. `size="small"` makes the box 32px with a 13px label, to sit in a filter row with small selects and slim buttons.',
        html: `<cm-combobox size="small" label="Customer" placeholder="Search customers">
  <option value="c-101">Robinson Mid Rao</option>
  <option value="c-102">Manjunath K</option>
</cm-combobox>` },
      { title: 'Disabled', html: `<cm-combobox label="Tags" multiple disabled><option value="cotton" selected>Cotton</option></cm-combobox>` },
      { title: 'Option groups', description: 'Since 1.3. `<optgroup label="…">` children or a `group` on each option in `options`, as for Select. Typing keeps the heading of every group that still has a match (try "em"). `show-group` shows the chosen option as "Contact: Email" in the box (and in tags with `multiple`).',
        html: `<div style="min-height:340px"><cm-combobox name="field" label="Take the value from a CRM field" placeholder="Search fields" show-group>
  <optgroup label="Lead">
    <option value="lead.company">Company</option>
    <option value="lead.email">Email</option>
    <option value="lead.phone">Phone</option>
  </optgroup>
  <optgroup label="Contact">
    <option value="contact.name">Full name</option>
    <option value="contact.email">Email</option>
  </optgroup>
  <optgroup label="Account">
    <option value="account.name">Account name</option>
    <option value="account.gstin">GSTIN</option>
  </optgroup>
</cm-combobox></div>` },
    ],
    states: [
      { title: 'No results', description: 'Shown in the open list when nothing matches. Set `empty-text` to name what was searched.',
        html: `<cm-combobox label="Customer" empty-text="No customers match" placeholder="Search customers"></cm-combobox>` },
    ],
    stateTable: [
      ['Default', 'White 40px box with a `border-input` outline; with `multiple`, 24px tags (12px text) wrap in rows inside it.'],
      ['Hover', 'The outline darkens to `border-strong`; the option under the pointer is `bg-hover`; a tag\'s remove button turns `bg-hover`.'],
      ['Focus-visible', '`border-strong` outline plus a 1px ring while the text box has focus; a focused tag shows a 2px ring on its remove button. Every tag shows while focus is inside.'],
      ['Pressed', 'Pressing an option or a tag\'s remove button darkens it a little.'],
      ['Selected', 'Single: the chosen option is black with white text. `multiple`: chosen options have a check mark (`aria-selected`), not only colour, and show as tags.'],
      ['Disabled', 'Grey fill, light outline, grey text and tags, `not-allowed` cursor; tags can\'t be removed.'],
      ['Loading', '`loading` shows a spinner and "Loading" in the open list and announces it.'],
      ['Error', '`border-critical` outline and the message under the box (`role="alert"`, `aria-invalid`).'],
    ],
    do: ['Use a combobox for long lists (more than about 15 options) and for anything loaded from the server; use [[Select|/components/select]] for short fixed lists.', 'Use `multiple` for tags, collections and filters that accept several values.', 'Debounce `cm-search` requests (about 250 ms) and show `loading` while they run.', 'Use `allow-custom` only where a new value makes sense, such as tags; listen for `cm-create` to check or refuse it.'],
    dont: ['Don\'t use it for fewer than about 7 options: a select or radio buttons show every choice at once.', 'Don\'t put actions in the list: use an action menu.', 'Don\'t clear what the merchant typed when results arrive.'],
    content: ['The label is a noun: "Customer", "Tags".', 'The placeholder says what can be searched: "Search by name or phone".', '`empty-text` names what wasn\'t found: "No customers match".'],
    a11y: ['Follows the WAI-ARIA APG "combobox with list autocomplete" pattern: a native text input with `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded` and `aria-controls` pointing at a `listbox`. Focus stays in the text box; the highlighted option is shown with `aria-activedescendant`.', 'Option groups are `group`s inside the listbox named by their heading (`aria-labelledby`); headings are not options, and the announced count is of options only.', 'Keyboard: typing filters and opens the list; Down and Up open it and move through options (skipping disabled ones and group headings, wrapping at the ends); Alt+Down opens it without highlighting; Enter chooses the highlighted option, or adds the typed value with `allow-custom`; Escape closes the list, and a second Escape clears the box; Backspace in an empty box removes the last tag (`multiple`); Tab moves on.', 'Tags (`multiple`, since 1.6): ← (→ in right-to-left text) at the start of the box moves focus to the last tag; ←/→ move between tags, Home/End to the first and last; Backspace removes the focused tag and moves to the one before, Delete to the one after; → past the last tag or Esc goes back to the text box. Tags are not Tab stops, so Tab leaves the field in one step.', 'The number of matches ("3 results", "No results", "Loading") is announced through a polite live region as the merchant types.', 'With `multiple` the listbox is `aria-multiselectable` and chosen options have `aria-selected="true"` and a check mark, not only colour. Each tag\'s remove button is named "Remove <tag>" and focus returns to the text box after removing.', 'Form-associated: submits `value` under `name`, or with `multiple` one entry per value (`formData.getAll(name)`); `required` blocks submission; `form.reset()` restores the initial choice. `<option selected>` sets it.'],
    related: ['select', 'tag', 'search', 'text-field'],
  },
  {
    slug: 'date-picker', tag: 'cm-date-picker', react: 'DatePicker', name: 'Date picker', group: 'Forms',
    responsive: ['The calendar is never wider than the window less 32px; when the window is 640px wide or less, day cells are 36px tall instead of 40px.', 'With `time`, the date and time boxes sit side by side (date about two thirds) and the time box moves under the date box when the field is narrower than about 300px.'],
    summary: 'Lets merchants type a date or pick one from a calendar, optionally with a time.',
    lead: 'A 40px text box (32px with `size="small"`; 40px since 1.6) with a calendar button. Merchants can type the date in their own format (15/11/2026, 2026-11-15 or 15 Nov 2026) or open a month calendar to pick it. The value is always ISO `yyyy-mm-dd`, and month and weekday names follow the page language. Add `time` for a date and a time (since 1.2): a time box joins it and the value becomes local `yyyy-mm-ddThh:mm`.',
    examples: [
      { title: 'Default', description: 'Typed dates are read in the order of the page language: day first for `en-IN`, month first for `en-US`. The placeholder shows the order.',
        html: `<cm-date-picker name="ship_by" label="Ship by" locale="en-IN" help-text="The date the courier collects the parcel"></cm-date-picker>` },
      { title: 'With a value, min and max', description: '`min` and `max` take ISO dates. Dates outside them can\'t be picked, and a typed date outside them makes the field invalid.',
        html: `<cm-date-picker name="publish" label="Publish on" value="2026-11-20" min="2026-11-15" max="2026-12-31"></cm-date-picker>` },
      { title: 'Date and time', description: '`time` adds a time box: merchants type `4pm`, `16:00` or `4:15 pm`, or press Up and Down to move by `step` minutes. The time is shown in the locale\'s clock (12-hour with am/pm for `en-IN`). `min="now"` refuses past days and earlier times today, checked again whenever the field is validated. The value is the merchant\'s local date and time with no time zone, e.g. `2026-11-20T16:00`: the browser\'s time zone is the merchant\'s, so convert it with `new Date(value)` before sending it to a server that stores UTC.',
        html: `<cm-date-picker name="follow_up" label="Follow up on" locale="en-IN" time min="now" step="15" required help-text="In your time zone. Times are on the quarter hour."></cm-date-picker>` },
      { title: 'Date and time with limits', description: 'With `time`, `min` and `max` take a date and time (`2026-11-20T10:00`) or a date: a date-only `max` allows the whole of that day. A time outside them, or off the `step`, makes the field invalid with a message that names the limit.',
        html: `<cm-date-picker name="demo_at" label="Demo at" locale="en-IN" time min="2026-11-20T10:00" max="2026-11-27T18:00" step="30" value="2026-11-20T09:30"></cm-date-picker>` },
      { title: 'Unavailable dates', description: '`disabled-dates` lists dates that can\'t be picked (holidays, full slots). For a rule, such as no Sundays, set the `isDateDisabled` property to a function in JavaScript.',
        html: `<cm-date-picker name="pickup" label="Pickup date" value="2026-11-16" disabled-dates="2026-11-17 2026-11-18" help-text="Courier holidays are not available"></cm-date-picker>` },
      { title: 'Another language', description: '`locale` sets the language of month and weekday names and the typed order; without it the picker uses the same language as every other component (`configure({ locale })`, else the nearest `lang` attribute). Translate its built-in text (button names, validation messages, the dd/mm/yyyy letters) with `strings` or `setStrings({ datePicker: {…} })`. `first-day-of-week` sets the first column (0 Sunday, 1 Monday).',
        html: `<cm-date-picker label="तारीख" locale="hi-IN" first-day-of-week="0" value="2026-11-15"></cm-date-picker>` },
      { title: 'Required', html: `<cm-date-picker name="dob" label="Date of birth" required max="2026-11-15"></cm-date-picker>` },
      { title: 'Error', html: `<cm-date-picker name="expiry" label="Offer ends" value="2026-11-01" error="Choose a date after the offer starts (5 Nov 2026)"></cm-date-picker>` },
      { title: 'Small', description: '`size="small"` makes the box 32px with a 13px label, the height of slim buttons, for toolbars, filter rows and filter panels. Both sizes are 44px on touch screens.',
        html: `<cm-date-picker size="small" label="Placed after"></cm-date-picker>` },
    ],
    states: [
      { title: 'Disabled', description: 'Can\'t be changed now, and isn\'t sent with the form.',
        html: `<cm-date-picker label="Order date" value="2026-11-15" disabled></cm-date-picker>` },
    ],
    do: ['Let merchants type: it is quicker than the calendar for dates far away, such as a date of birth.', 'Set `min` and `max` when only some dates make sense, and say why in `help-text`.', 'Send and store the ISO `value`; format dates for display with `Intl.DateTimeFormat`.', 'For a start and end date, use [[Date range picker|/components/date-range-picker]].', 'For a follow-up, a booking or a reminder, add `time` and `min="now"`; set `step` (15 or 30) when only round times make sense.'],
    dont: ['Don\'t add `time` when only the day matters (ship-by dates, dates of birth).', 'Don\'t use three separate day, month and year selects.', 'Don\'t hide unavailable dates; they stay in the calendar, crossed out and not choosable.'],
    content: ['The label names the date: "Ship by", "Offer ends", not "Date".', 'Errors say which dates are allowed: "Choose a date after 5 Nov 2026".'],
    a11y: ['Follows the WAI-ARIA APG "date picker dialog" pattern. The text box is a real `<input>` with a `<label>`; the calendar button is named "Choose date for <label>" (or "Change date…, <date>" once set) and has `aria-haspopup="dialog"` and `aria-expanded`.', 'The calendar is a `dialog` with a `grid` labelled by the month heading. The month heading is a polite live region, so changing month is announced. Each day is named with the full date ("Sunday 15 November 2026"); the chosen day has `aria-selected`, today has `aria-current="date"` and unavailable days `aria-disabled`.', 'Keyboard in the calendar: arrows move by day and week (in right-to-left languages the grid runs right to left and Left goes to the next day); Home and End go to the start and end of the week; Page Up/Down change month and Shift+Page Up/Down change year; Enter or Space picks the date and closes; Escape closes without picking. Focus returns to the calendar button either way. Tab moves between the month buttons and the grid and stays inside the calendar while it is open. Alt+Down in the text box opens it.', 'Form-associated: submits the ISO date under `name`; `required` blocks submission while empty; text that is not a date, a date outside `min`/`max` and an unavailable date make the field invalid (`validity.badInput`, `rangeUnderflow`, `rangeOverflow`, `customError`); `form.reset()` restores the initial date.', 'Dates are local calendar dates with no time zone, so a date never shifts by a day for merchants east or west of UTC.', 'With `time`: the time box is a text box named "Time for <label>", sharing the field\'s help text and error. Its placeholder shows the format (hh:mm am). Up and Down move the time by `step` minutes (from an empty box they start at `min` or the current time); Enter or leaving the box reads what was typed. Picking a day in the calendar moves focus to the time box while it is empty. A date without a time, or a time that can\'t be read, makes the field invalid (`validity.badInput`, "Enter a time."); an earlier or later time `rangeUnderflow`/`rangeOverflow`; a time off the step `stepMismatch`. Times are local, like the date: the browser\'s time zone.'],
    related: ['date-range-picker', 'text-field', 'select'],
  },
  {
    slug: 'date-range-picker', tag: 'cm-date-range-picker', react: 'DateRangePicker', name: 'Date range picker', group: 'Forms',
    responsive: ['When the window is 640px wide or less, preset ranges move above the calendar as a row of pills, and day cells are 36px tall.', 'With `months="2"`, phones (640px or narrower) show one month with both arrows.', 'With `variant="report"`, phones show the presets as one row of pills that scrolls sideways, above the date boxes and months; the months list is at most 40% of the screen tall.', 'The calendar is never wider than the window less 32px.'],
    summary: 'Picks a start (from) and end (to) date, typed or from a calendar, with preset ranges for reports.',
    lead: 'Two date boxes in one field, from and to, with a calendar button. In the calendar, the first date picked is the start and the second the end; preset ranges such as "Last 7 days" sit beside it. For reports (since 1.16) it works like an analytics date picker: a "Custom" preset, two months side by side and Apply/Cancel. Use it to filter orders and reports by date.',
    examples: [
      { title: 'Report date range', description: '`variant="report"` (since 1.18) for report and dashboard pages: the field shows the preset and the dates; the popup has the presets on the left with their dates under each, typed start and end boxes, months to scroll through, and Cancel and Apply. Without `presets` it lists the report set (custom, today, yesterday, this week, last 7 days, last week, last 28 days, last 30 days, this month, last month, last 90 days, quarter to date, this year). `preset="last-28-days"` opens on the last 28 days counted from today, and the picker keeps `preset` up to date, so save the preset rather than the dates. Set `max` to today when future days have no data.',
        html: `<cm-date-range-picker name="report" label="Report period" variant="report" preset="last-28-days"></cm-date-range-picker>` },
      { title: 'Two months with Apply', description: 'For a period that isn\'t a report filter, `months="2"` shows two months side by side and `confirm` makes presets and dates a draft until Apply. End the presets with `custom` for a "Custom" button.',
        html: `<cm-date-range-picker name="sale" label="Sale period" presets="this-week last-week this-month last-month custom" months="2" confirm></cm-date-range-picker>` },
      { title: 'Orders date filter', description: 'Presets come from a list of keys: `today`, `yesterday`, `this-week`, `last-week`, `last-7-days`, `last-28-days`, `last-30-days`, `last-90-days`, `last-12-months`, `this-month`, `last-month`, `quarter-to-date`, `last-quarter`, `this-year` (1 January to today), `last-year`, and `custom`, a button that leaves the dates to the calendar. Weeks start on the picker\'s first day of the week. Set `max` to the current date when you render the page, so future days can\'t be chosen.',
        html: `<cm-date-range-picker name="placed" label="Order date" presets="today last-7-days last-30-days this-month" start="2026-11-01" end="2026-11-15" help-text="Shows orders placed between these dates"></cm-date-range-picker>` },
      { title: 'In a filter bar', description: 'Next to a payment select, both in the small size (32px), so the boxes line up. The form submits `placed-start` and `placed-end`.',
        html: `<div class="row" style="align-items:flex-end;gap:8px">
  <cm-date-range-picker size="small" name="placed" label="Placed" presets="today last-7-days last-30-days this-month" style="flex:1;min-width:260px"></cm-date-range-picker>
  <cm-select size="small" label="Payment" style="min-width:160px"><option value="">Any</option><option value="paid">Paid</option><option value="pending">Pending</option></cm-select>
</div>` },
      { title: 'Custom form names', description: 'For a server that expects other field names, set `start-name` and `end-name` (`name` must still be set).',
        html: `<cm-date-range-picker name="range" start-name="from" end-name="to" label="Sale period" min="2026-11-01"></cm-date-range-picker>` },
      { title: 'Required', html: `<cm-date-range-picker name="report" label="Report period" required></cm-date-range-picker>` },
      { title: 'Error', html: `<cm-date-range-picker name="report" label="Report period" start="2026-10-01" end="2026-11-15" error="Choose 31 days or fewer"></cm-date-range-picker>` },
    ],
    states: [
      { title: 'Disabled', description: 'Can\'t be changed now, and isn\'t sent with the form.',
        html: `<cm-date-range-picker label="Report period" start="2026-11-01" end="2026-11-15" disabled></cm-date-range-picker>` },
    ],
    do: ['Offer presets that match what merchants report on; "Last 7 days" and "This month" cover most order and sales filters.', 'For report and dashboard pages, use `variant="report"`.', 'Save `preset` with a report when it is set, so "Last 28 days" still means the last 28 days next week.', 'Set `max` to today for reports, so empty future days can\'t be chosen.', 'Show the chosen range in the report heading too, so a printed or shared page says which dates it covers.', 'Set custom presets as objects in JavaScript: `picker.presets = [{ label: \'Diwali sale\', start: \'2026-11-01\', end: \'2026-11-08\' }]`.'],
    dont: ['Don\'t use two separate date pickers for a range: the range picker keeps the two dates in order and shows the range.', 'Don\'t offer more than about six presets in a filter row; a report period can list up to about twelve.', 'Don\'t use `confirm` in a small filter row where each change should show at once.', 'Don\'t allow very long ranges your reports can\'t load: check them and set `error`.'],
    content: ['The label names what is filtered: "Order date", "Report period".', 'Preset labels are short and relative: "Last 7 days", "This month".'],
    a11y: ['The field is a `group` named by the label, with two text inputs named "Start date" and "End date" (change with `start-label` and `end-label`). The calendar button is named "Choose dates for <label>", or with the current range once set.', 'The calendar is the same APG date picker grid as [[Date picker|/components/date-picker]], with the same keys. Picking is two steps: a line under the grid says "Choose the start date", then "Start date 4 Nov 2026. Choose the end date." (a polite live region). Dates in the range have `aria-selected`; the start and end days are named "…, start date" and "…, end date".', 'Preset ranges are buttons in a list named "Preset ranges"; the preset that matches the current range has `aria-pressed="true"` ("Custom" when the dates match no preset). Tab moves between presets, month buttons and the grid, staying inside the open calendar; Escape closes without changing the range and returns focus to the calendar button.', 'With `variant="report"` the field is one button named by the preset and the range ("Last 28 days, Change dates for Report period, …"). In the popup, the start and end boxes are labelled text boxes that change the draft (Enter or leaving the box); each listed month is a grid labelled by its month heading, under one weekday row that screen readers skip (each grid has its own hidden weekday headers); only one day is a Tab stop and arrow keys move across months, scrolling the list. The footer says the draft range and its length ("23 Oct – 19 Nov 2026 · 28 days").', 'With `months="2"` the two months are two grids, each labelled by its month heading; only one day in either is a Tab stop, and arrow keys move across both (the months move when focus leaves them). With `confirm`, picking the end date keeps the calendar open; the footer shows the draft range and Cancel and Apply buttons (Apply is disabled until both dates are picked). Escape, Cancel or a click outside drop the draft.', 'Form-associated: submits `<name>-start` and `<name>-end` (or `start-name` / `end-name`) as ISO dates; `required` needs both; an end before the start, text that isn\'t a date and dates outside `min`/`max` make it invalid; `form.reset()` restores the initial range.'],
    related: ['date-picker', 'time-picker', 'filter-panel', 'data-table', 'select'],
  },
  {
    slug: 'time-picker', tag: 'cm-time-picker', react: 'TimePicker', name: 'Time picker', group: 'Forms',
    responsive: ['The list of times is at least as wide as the box and scrolls after about seven times.', 'On touch screens the box and each time in the list are 44px tall.'],
    summary: 'Lets merchants type a time or choose one from a list, on a 12-hour (am/pm) or 24-hour clock.',
    lead: 'A 40px text box with a clock button and a list of times (since 1.16). Merchants type a time the way they say it (3:30 pm, 15:30, 1530, 9pm) or choose one from the list. The clock follows the page language: 12-hour with am/pm for `en-IN` and `en-US`, 24-hour for `en-GB` and most of Europe. Set `hour-cycle="h12"` or `"h23"` to choose one. The value is always 24-hour `hh:mm`, whichever clock is shown.',
    examples: [
      { title: '12-hour clock (am/pm)', description: '`hour-cycle="h12"` shows am/pm whatever the language. The value of this field is `15:30`.',
        html: `<cm-time-picker name="pickup" label="Pickup time" hour-cycle="h12" value="15:30" help-text="In your time zone"></cm-time-picker>` },
      { title: '24-hour clock', description: '`hour-cycle="h23"` shows 00:00 to 23:59.',
        html: `<cm-time-picker name="cutoff" label="Order cut-off" hour-cycle="h23" value="18:00"></cm-time-picker>` },
      { title: 'Opening hours', description: '`min` and `max` limit the list and typed times; `step` sets the allowed minutes (15 allows :00, :15, :30, :45) and the list follows it. `interval` changes only the list (default: `step` when it is 5 or more, else every 30 minutes).',
        html: `<div class="row" style="gap:8px;align-items:flex-end">
  <cm-time-picker name="opens" label="Opens" min="06:00" max="23:00" step="15" value="09:00" style="flex:1;min-width:140px"></cm-time-picker>
  <cm-time-picker name="closes" label="Closes" min="06:00" max="23:00" step="15" value="21:00" style="flex:1;min-width:140px"></cm-time-picker>
</div>` },
      { title: 'With a date', description: 'For one moment (a follow-up, a delivery slot), use [[Date picker|/components/date-picker]] with `time`; it keeps the date and time in one value. Use the time picker when only the time matters, or for a daily time.',
        html: `<cm-date-picker name="follow_up" label="Follow up on" time step="15"></cm-date-picker>` },
      { title: 'Required', html: `<cm-time-picker name="slot" label="Delivery slot" required></cm-time-picker>` },
      { title: 'Error', html: `<cm-time-picker name="slot" label="Delivery slot" value="23:30" error="The last slot starts at 9 pm"></cm-time-picker>` },
      { title: 'Small', description: '`size="small"` is 32px for filter rows; `size="medium"` 36px. All sizes are 44px on touch screens.',
        html: `<cm-time-picker size="small" label="From"></cm-time-picker>` },
    ],
    states: [
      { title: 'Disabled', description: 'Can\'t be changed now, and isn\'t sent with the form.',
        html: `<cm-time-picker label="Pickup time" value="10:00" disabled></cm-time-picker>` },
    ],
    do: ['Let the page language choose the clock unless your product has one rule; set `hour-cycle` for that.', 'Store and send the 24-hour `value`; show times to people with `Intl.DateTimeFormat`.', 'Set `step` when only some times make sense (slots every 15 or 30 minutes), and say so in `help-text`.'],
    dont: ['Don\'t use two selects for hours and minutes.', 'Don\'t use a time picker for a date and time: use the date picker with `time`.', 'Don\'t use it for durations (2 hours 30 minutes): use a number field with a unit.'],
    content: ['The label names the time: "Pickup time", "Opens", not "Time".', 'Say the time zone in `help-text` when people in other zones use the page.'],
    a11y: ['Follows the WAI-ARIA APG combobox pattern: the text box has `role="combobox"`, `aria-expanded` and `aria-controls` pointing to a `listbox` named "Times for <label>"; the keyboard-active time is `aria-activedescendant` and the chosen time has `aria-selected`. Focus stays in the text box.', 'Keyboard: Down or Up opens the list at the chosen time (or the next time from now); Up and Down move by one time, Page Up and Page Down by six; Enter chooses; Escape closes without changing the time. Typing while the list is open makes the next listed time active. Enter or leaving the box reads what was typed.', 'The clock button is not a Tab stop (the text box opens the list) and is named "Show times".', 'Form-associated: submits `hh:mm` under `name`; `required` blocks submission while empty; text that is not a time, a time outside `min`/`max` and a time off the `step` make it invalid (`badInput`, `rangeUnderflow`, `rangeOverflow`, `stepMismatch`), with messages under the field as for every field (1.14); `form.reset()` restores the first value.'],
    related: ['date-picker', 'date-range-picker', 'select'],
  },
  {
    slug: 'file-upload', tag: 'cm-file-upload', react: 'FileUpload', name: 'File upload', group: 'Forms',
    responsive: ["Empty, the zone is one 72px row at every width (since 1.6; it was a 160px box): the icon tile, the prompt and the hint; long hints wrap inside it.", "Chosen files are shown as tiles: each row holds as many 112–140px tiles as fit, 16px apart.", "The empty photo tile (`variant=\"photo\"`) is 4:3 and at most 120px tall, so 160 x 120px in a wide column.", "When the window is 640px wide or less, the label is smaller."],
    summary: 'Lets the merchant choose or drop files, such as product images or documents.',
    lead: 'A compact dashed drop zone under a heading (owner standard, 1.6): one 72px row with an upload icon, "Drag files here or **Browse**" and the accepted types and size in 12px grey. Its outline darkens on hover, turns solid while files are dragged over it, and gets a focus ring from the keyboard. Chosen images show as thumbnails with a remove button; with `multiple`, a dashed tile at the end adds more. Upload the files yourself and report progress with `setProgress(file, percent)` (a bar and a Cancel button on the tile) and failures with `setFileError(file, message)`.',
    examples: [
      { title: 'Product images', description: 'The compact empty state (1.6). Choose or drop a file to see it pretend to upload.',
        html: `<cm-file-upload name="images" label="Add product images" hint="PNG or JPG, up to 300 KB each" accept="image/*" multiple max-size="307200" data-demo-upload></cm-file-upload>` },
      { title: 'Uploading and failed files', description: 'Since 1.6. After `change`, upload each new file and call `setProgress(file, percent)` as it goes and `setProgress(file, null)` when it is done: the tile shows a progress bar and its × becomes "Cancel uploading …", which fires `cm-cancel` (stop the request; the file is then removed). A failed file: `setFileError(file, message)` turns its tile red with the message under it. In this preview the files are made up.',
        html: `<cm-file-upload name="feedback" label="Feedback attachments" hint="PNG, JPG or PDF, up to 5 MB" accept="image/*,.pdf" multiple data-demo-files="screen.png:45,receipt.pdf:80,photo.png:error"></cm-file-upload>` },
      { title: 'Single document', description: 'Without `multiple`, a chosen file replaces the zone; remove it to choose another.',
        html: `<cm-file-upload name="gst" label="GST certificate" hint="PDF, up to 2 MB" accept=".pdf" max-size="2097152" prompt="Drag a PDF here or {browse}"></cm-file-upload>` },
      { title: 'Without a heading', description: 'Inside a popup, where the popup title already says what to upload. Give the zone a prompt that names the file; `{browse}` in it becomes the link-like "Browse".',
        html: `<cm-file-upload name="banner" prompt="Drop the banner image here or {browse}" hint="1200 x 400px" accept="image/*"></cm-file-upload>` },
      { title: 'Required with error', html: `<cm-file-upload name="kyc" label="Address proof" hint="PDF or photo, up to 5 MB" required error="Upload an address proof to continue"></cm-file-upload>` },
      { title: 'Photo from the camera', description: 'Since 1.3. `variant="photo"` is one tile for one photo, the usual pattern on phones; `capture="environment"` opens the back camera directly (desktop browsers show the file chooser). Empty, the tile is 4:3 and at most 120px tall (since 1.6; it grew to 300px in wide columns). After a photo is taken it fills the width, with Retake and Remove under it. Images only unless you set `accept`.',
        html: `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;max-width:420px">
  <cm-file-upload name="shop_photo" variant="photo" capture="environment" label="Shop front photo" required max-size="5242880"></cm-file-upload>
  <cm-file-upload name="card_photo" variant="photo" capture="environment" label="Visiting card" hint="max. 5 MB" max-size="5242880"></cm-file-upload>
</div>` },
      { title: 'Camera on a multi-file zone', description: 'Since 1.3. `capture` works on the default zone too, for example for several shelf photos.',
        html: `<cm-file-upload name="shelf" label="Shelf photos" accept="image/*" capture="environment" multiple max-files="4"></cm-file-upload>` },
    ],
    states: [
      { title: 'Disabled', description: 'When uploads aren\'t possible yet, for example before the product is saved.',
        html: `<cm-file-upload label="Product images" hint="max. file size 300 KB" disabled></cm-file-upload>` },
    ],
    stateTable: [
      ['Default', 'One 72px row: dashed `border-input` outline, 8px corners, a 40px icon tile, the prompt with an underlined **Browse**, and the hint in 12px `text-tertiary`.'],
      ['Hover', 'The outline darkens to `border-strong` and the zone fills with `bg-hover`.'],
      ['Drag-over', 'Files dragged over the zone: a solid 2px `border-strong` outline on `bg-hover`, and the prompt reads "Drop files to upload".'],
      ['Focus-visible', 'A 2px `border-strong` ring outside the zone (the native file input inside has focus).'],
      ['Pressed', 'The fill darkens a little while pressed.'],
      ['Selected (files chosen)', 'Tiles of 112–140px: thumbnails or name and size, each with a named × (Remove).'],
      ['Uploading', '`setProgress(file, percent)`: an image dims, a 4px progress bar runs along its foot (`role="progressbar"`, `aria-valuenow`), and the × becomes "Cancel uploading …" (`cm-cancel`).'],
      ['Error', '`error` or a refused file: `border-critical` outline and the message under the zone (`role="alert"`). One failed file (`setFileError`): its tile outline turns red with the 12px message under it.'],
      ['Disabled', 'Grey fill and text, light outline, `not-allowed` cursor; no remove buttons.'],
    ],
    do: ['State the allowed types and size in `hint`, and enforce them with `accept` and `max-size`.', 'Use `multiple` with `max-files` for galleries.', 'On phones, use `variant="photo"` with `capture="environment"` for a photo the merchant takes on the spot (shop front, visiting card, delivery proof). Give each tile a label that names the photo; the buttons are named after it ("Retake Shop front photo").', 'Change the photo tile\'s shape with `::part(photo)` (the empty tile and the photo both have it), e.g. `aspect-ratio: 16 / 10` for a card; it is 4:3 by default.', 'Upload in the background after `change`; report progress on the file\'s own tile with `setProgress(file, percent)` and a failure with `setFileError(file, message)`, and stop the request on `cm-cancel`.'],
    dont: ['Don\'t hide the rules until after an upload fails.', 'Don\'t make the empty zone tall to draw attention: the 72px row is the standard (owner standard, 1.6).', 'Don\'t use it for a single image that can be picked from existing media: use a resource picker (planned).'],
    content: ['Heading says what to add: "Add product images".', 'Hints are lowercase rules: "max. file size 300 KB".', 'Refusals name the file and the rule: "banner.png is larger than 300 KB".'],
    a11y: ['A native file input fills the zone, so it is reachable with Tab, opens with Enter or Space, and accepts dropped files. It is named by the heading and the prompt.', 'Photo tile (`variant="photo"`): the input is named by the label alone ("Shop front photo", or "Take a photo" without a label) and described by the hint. The taken photo\'s `alt` is the label. Retake and Remove are buttons named "Retake <label>" and "Remove <label>"; Retake opens the same input again, and after Remove focus returns to the empty tile. A refused photo keeps the previous one and its message is linked to Retake.', 'Each thumbnail\'s remove button is named "Remove <file name>"; after removing, focus returns to the zone.', 'Uploading (1.6): each file\'s bar is a `progressbar` named "Uploading <file name>" with its percentage; its button is named "Cancel uploading <file name>". A failed file\'s message is announced (`role="alert"`) and describes its Remove button.', 'Refused files and errors are announced (`role="alert"`) and linked with `aria-describedby`; `cm-reject` lists the refused files.', 'Form-associated: submits the files under `name` (use `enctype="multipart/form-data"`), `required` blocks submission, and `form.reset()` clears them.', 'The zone is the full width you give it; thumbnails are 112–140px; the drag handle and the star/download/edit hover actions from the product-image screen are left for a future media manager.'],
    related: ['text-field', 'button'],
  },
  {
    slug: 'color-field', tag: 'cm-color-field', react: 'ColorField', name: 'Colour field', group: 'Forms',
    responsive: ['Swatches wrap onto more rows when they don\'t fit; each is 32px with 8px between.', 'The hex box is wide enough for "#rrggbb" and does not stretch.'],
    summary: 'Lets the merchant choose a colour that means something, such as the colour of each lead status.',
    lead: 'A label, a row of round swatches and a hex box. The default palette is 12 colours taken from the Commmerce tokens; pass your own with `swatches`. `picker` adds the [[colour picker|/components/color-picker]] for any other colour, with the store\'s brand colours and the merchant\'s recent ones. The value is lowercase `#rrggbb` unless you allow opacity, RGB/HSL or gradients. Since 1.3; picker panel since 1.17.',
    examples: [
      { title: 'Status colour', html: `<cm-color-field name="status_color" label="Status colour" value="#2e6faf" help-text="Shown on the status tag in lists."></cm-color-field>` },
      { title: 'With the colour picker', description: '`picker` turns the preview square into a button that opens the colour picker: a saturation square, hue, the hex box, the eyedropper (Chrome and Edge), brand colours, recent colours and the palette. Without `formats`, `alpha` or `gradient` the value stays `#rrggbb`. Since 1.17; before, `picker` opened the browser\'s own picker, which `picker="native"` still does.',
        html: `<cm-color-field name="highlight" label="Highlight" hint="optional" value="#ffc107" picker recent-key="docs-highlight" brand-colors='[{"value":"#0a7cff","name":"Primary"},{"value":"#111827","name":"Ink"},{"value":"#ff5a1f","name":"Accent"}]'></cm-color-field>` },
      { title: 'Opacity, formats and gradients', description: '`alpha` adds opacity (`#rrggbbaa`, `rgba()`, `hsla()`), `formats="hex rgb hsl"` lets the merchant choose how the value is written, and `gradient` adds linear and radial gradients. The box then takes any of those. Check the value again on your server.',
        html: `<cm-color-field name="banner_bg" label="Banner background" picker alpha gradient formats="hex rgb hsl" value="linear-gradient(90deg, #2e6faf 0%, #81bb47 100%)"></cm-color-field>` },
      { title: 'Brand and recent colours from the admin', description: 'In an embedded app, pass App Bridge\'s `app.colors` as `source`: the admin answers with the brand colours set in the store settings and remembers recents per staff member. Outside the admin, use `httpColorSource({ baseUrl })` with your server (see [[Colour picker|/components/color-picker]]). In JavaScript: `field.source = app.colors`.',
        html: `<cm-color-field name="label_color" label="Label colour" picker value="#2e6faf"></cm-color-field>` },
      { title: 'Your own palette', description: 'Strings or `{ value, name }`. Names are read out with the hex code and shown as a tooltip. In JavaScript: `field.swatches = [{ value: \'#3c7c00\', name: \'Won\' }]`.',
        html: `<cm-color-field name="pipeline_color" label="Stage colour" swatches='[{"value":"#3c7c00","name":"Won"},{"value":"#de0000","name":"Lost"},{"value":"#ad5500","name":"On hold"},{"value":"#2e6faf","name":"Open"}]' value="#de0000"></cm-color-field>` },
      { title: 'Required with error', html: `<cm-color-field name="tag_color" label="Tag colour" required error="Choose a colour that isn't used by another status"></cm-color-field>` },
    ],
    states: [
      { title: 'Disabled', html: `<cm-color-field label="Status colour" value="#81bb47" disabled></cm-color-field>` },
    ],
    do: ['Use it where a colour helps merchants tell things apart at a glance (pick-list values, tags, calendar types), and always show the name next to the colour where it is used.', 'Keep the palette small: the default 12, or fewer of your own.', 'Pair a chosen colour with text by luminance where you use it (as the swatch check mark does), so labels on it stay readable.'],
    dont: ['Don\'t use a picked colour to theme your app\'s own interface: embedded apps use Commmerce\'s palette. Picked colours are the merchant\'s data (a label, a banner, a status).', 'Don\'t let colour be the only way a status is shown: keep its name visible.', 'Don\'t turn on `alpha`, `gradient` or more `formats` unless the place the colour is used can show them.'],
    content: ['Label names what the colour is for: "Status colour", not "Colour".', 'Name your own swatches after what they mean ("Won", "Lost") or plainly ("Blue"); the hex code is added for you.'],
    a11y: ['The swatches are a `radiogroup` named by the label (or the element\'s `aria-label`): one tab stop, arrow keys move and select (wrapping; ArrowLeft moves forward in right-to-left text), Home and End jump, Space and Enter select. Each swatch is a `radio` named "<name>, <hex>" ("Blue, #2e6faf"), or by its hex code alone.', 'The selected swatch shows a check mark and a ring, so the choice doesn\'t rely on colour. The check is black or white, whichever contrasts more with the swatch (4.5:1 or more for any colour); every swatch has a `border-input` outline so light colours stand out on white and black on dark.', 'The hex box is named "<label>, hex code". A complete code updates the value as you type; leaving the box or pressing Enter commits it. Text that isn\'t a colour shows "Enter a colour as #RRGGBB, for example #2e6faf." (announced, `aria-invalid`, linked with `aria-describedby`) and makes the field invalid. `#abc` and codes without `#` are accepted and normalised.', 'With `picker`, the button is named "Choose a custom colour for <label>", says it opens a dialog (`aria-haspopup`, `aria-expanded`) and opens the picker in the top layer with focus on its square; Escape or a click outside closes it and Escape returns focus to the button. See [[Colour picker|/components/color-picker]] for the panel. With `picker="native"`, the browser\'s colour input has the same name.', 'With `alpha`, `gradient` or more `formats`, the box is named "<label>, colour value" and text that isn\'t a colour shows "Enter a colour such as #2e6faf or rgb(46, 111, 175)."', 'Form-associated like Text field: submits `value` under `name`, `required` blocks submission, `error` sets a custom error, a disabled `<fieldset>` disables it, `form.reset()` restores the first value.'],
    related: ['text-field', 'option-group', 'tag'],
  },
  {
    slug: 'color-picker', tag: 'cm-color-picker', react: 'ColorPicker', name: 'Colour picker', group: 'Forms',
    responsive: ['272px wide, or narrower when its container is. The square is 160px tall.', 'Swatches are 24px with 8px between and wrap onto more rows.', 'On touch screens the square and the stop handles follow the finger; the page does not scroll while dragging on them.'],
    summary: 'Picks any colour: a saturation square, hue and opacity, hex/RGB/HSL, the eyedropper, gradients, and the store\'s brand colours and recent colours.',
    lead: 'The panel that [[colour field|/components/color-field]] opens with `picker`; use it on its own in a side panel or popover of yours. From the top: Solid / Gradient tabs (`gradient`), the gradient bar with its stops, the saturation and brightness square, hue and opacity (`alpha`) sliders with a preview, the format menu (`formats`) with a box per channel and the eyedropper, then three swatch groups: **Brand colours**, **Recent** and **Palette**. Since 1.17.',
    examples: [
      { title: 'Brand and recent colours', description: 'Brand colours are the ones the merchant set for the store. Each colour they commit that isn\'t a brand or palette colour goes first in Recent. Here `recent-key` keeps recents in this browser; try a few colours.',
        html: `<cm-color-picker value="#0a7cff" recent-key="docs-picker" brand-colors='[{"value":"#0a7cff","name":"Primary"},{"value":"#111827","name":"Ink"},{"value":"#ff5a1f","name":"Accent"},{"value":"#f4f1ea","name":"Paper"}]'></cm-color-picker>` },
      { title: 'Opacity and formats', description: '`alpha` adds the opacity slider and box. The format menu writes the value as hex (`#rrggbbaa` when see-through), `rgb()`/`rgba()` or `hsl()`/`hsla()`; limit it with `formats` (one format hides the menu).',
        html: `<cm-color-picker alpha value="rgba(46, 111, 175, 0.6)"></cm-color-picker>` },
      { title: 'Gradients', description: '`gradient` adds Solid / Gradient tabs. Click the bar to add a stop, drag a stop or use the arrow keys to move it, Delete to remove it (two stay). The square, sliders and boxes edit the selected stop. Linear (with an angle) or radial.',
        html: `<cm-color-picker gradient alpha value="linear-gradient(135deg, #0a7cff 0%, #81bb47 100%)"></cm-color-picker>` },
      { title: 'From App Bridge or your server', description: '`source` is any object with `brandColors()`, `recentColors()` and `addRecentColor(color)`. In an embedded app, `app.colors` (App Bridge 1.17) asks the admin. Elsewhere, `httpColorSource()` calls the Colour API on your server: `GET /brand-colors`, `GET /recent-colors`, `POST /recent-colors` with `{ "color": … }`, each answering `{ "colors": […] }`. A reference server (Node, no dependencies) is in the repository at examples/color-api. Lists that fail to load are left out. In JavaScript: `picker.source = httpColorSource({ baseUrl: \'/api/colors\', headers: () => ({ Authorization: \'Bearer \' + token }) })`, or `picker.source = app.colors` inside the admin, and save `picker.value` on `change`.',
        html: `<cm-color-picker value="#2e6faf"></cm-color-picker>` },
    ],
    states: [
      { title: 'Without the palette', html: `<cm-color-picker swatches="[]" formats="hex" value="#de0000"></cm-color-picker>` },
      { title: 'Disabled', html: `<cm-color-picker value="#81bb47" disabled></cm-color-picker>` },
    ],
    do: ['Pass the store\'s brand colours wherever merchants style something customers see (labels, banners, emails), so they stay on brand.', 'Save `value` on `change`, not `input`: `input` fires on every step of a drag.', 'Check the value again on your server (the reference Colour API has a validator).'],
    dont: ['Don\'t theme your app\'s own interface with picked colours.', 'Don\'t turn on `alpha` or `gradient` for places that can only show a solid colour.', 'Don\'t keep recents only in the browser when the merchant works on several devices: use App Bridge or your server.'],
    content: ['Name brand colours by role ("Primary", "Accent"), not by hex.'],
    a11y: ['The panel is a group named "Colour picker" (or its `aria-label`).', 'The square is a `slider` named "Saturation and brightness" with a value like "Saturation 74%, brightness 69%". Left and Right change saturation (reversed in right-to-left text), Up and Down brightness, Shift for steps of 10, Home/End for no or full saturation, PageUp/PageDown for full or no brightness. Each key press commits.', 'Hue and opacity are native range inputs ("Hue", "Opacity"), so arrow keys, Home and End work and screen readers read them as sliders. Each box is named after its channel (Hex, Red, Green, Blue, Hue, Saturation, Lightness, Opacity); text that isn\'t a value turns the box red (`aria-invalid`) and changes nothing.', 'Gradient stops are `slider`s named "Stop 2, #0000ff at 100%": arrows move them (Shift for 10), Home/End to the ends, Delete or Backspace removes one. Solid / Gradient is a `radiogroup`.', 'Swatches are buttons named "<name>, <value>" (or the value) with `aria-pressed` for the current colour, in groups named by their headings. See-through swatches sit on a checkerboard.', 'The eyedropper shows only where the browser has one (Chrome and Edge on desktop) and is named "Pick a colour from the screen".', 'All built-in text is translatable (`colorPicker` strings).'],
    related: ['color-field', 'modal', 'side-panel'],
  },
  {
    slug: 'signature-field', tag: 'cm-signature-field', react: 'SignatureField', name: 'Signature field', group: 'Forms',
    responsive: ['Fills the width of its container; the pad keeps a 3:1 shape (about 96px tall in a 288px column, 200px at 600px).', 'When the pad is resized (rotating a phone, a panel opening) the signature is drawn again from its strokes at the new size, so it stays sharp and in place.', 'Draw / Type and Undo / Clear share one row and wrap onto two when they don\'t fit.'],
    summary: 'Collects a signature: drawn with a mouse, finger or pen, or typed and shown in a handwriting font.',
    lead: 'A label, Draw and Type tabs with Undo and Clear, and a 3:1 pad with a dashed line and "Sign here". Draw takes mouse, touch and pen (with pen pressure), smoothing the strokes; Type shows the name in Dancing Script, self-hosted in `@commmerce/tokens/fonts.css` (falls back to a cursive system font). The value is a PNG data URL, cropped to the ink with 8px around it, at 2x, black ink on transparent in either theme, so it looks right in documents. `toDataURL()` and `toBlob()` give the same image; `empty` says whether anything is signed; `clear()` and `undo()` do what the buttons do. Set `value` to a saved PNG to show it again. There is no upload mode. Since 1.4.',
    examples: [
      { title: 'Sign now dialog', description: 'The CRM\'s e-sign step. The main button stays disabled until something is signed: listen for `change` (or `cm-change`) and read `empty`. Send `toBlob()` to your server, or submit `value`.',
        html: `<cm-button variant="primary" data-opens="sign-now">Sign now</cm-button>
<cm-modal id="sign-now" heading="Sign quote Q-1042">
  <div style="display:grid;gap:var(--cm-space-16)">
    <p style="margin:0">By signing, you accept quote Q-1042 for ₹48,500.</p>
    <cm-signature-field name="signature" label="Your signature" required onchange="this.closest('cm-modal').querySelector('[data-sign]').disabled = this.empty"></cm-signature-field>
  </div>
  <cm-button slot="footer">Cancel</cm-button>
  <cm-button slot="footer" variant="primary" data-sign disabled>Sign and accept</cm-button>
</cm-modal>` },
      { title: 'Required in a form', description: 'Form-associated: submits the PNG data URL under `name`, and `required` blocks submission until something is signed (drawn or typed). Reset clears it.',
        html: `<form class="stack" style="max-width:560px" onsubmit="event.preventDefault(); const d = new FormData(this); this.querySelector('output').textContent = 'Submitted: ' + d.get('signer') + ', signature PNG of ' + Math.ceil(d.get('signature').length * 0.75 / 1024) + ' KB'">
  <cm-text-field name="signer" label="Full name" value="Asha Rao" required></cm-text-field>
  <cm-signature-field name="signature" label="Signature" required help-text="Draw your signature, or choose Type to type your name."></cm-signature-field>
  <div class="row">
    <cm-button type="reset">Reset</cm-button>
    <cm-button type="submit" variant="primary">Submit</cm-button>
  </div>
  <output></output>
</form>` },
      { title: 'Typed signature', description: '`mode="type"` opens on Type; `typed-name` prefills the box, for example with the signer\'s name from the record. Typing is the way to sign with a keyboard or a screen reader. The font is Dancing Script (Latin letters); other scripts use the system\'s cursive font.',
        html: `<cm-signature-field name="signature" label="Signature" mode="type" typed-name="Asha Rao"></cm-signature-field>` },
      { title: 'The exported image', description: 'What `value` holds after each change: a PNG cropped to the ink, black on transparent in the light and dark theme. It is shown here on white, as it would be on a document.',
        html: `<div class="stack" style="gap:var(--cm-space-16)">
  <cm-signature-field label="Signature" onchange="const img = this.nextElementSibling; img.hidden = this.empty; img.src = this.value || ''"></cm-signature-field>
  <img alt="Exported signature" hidden style="justify-self:start;max-width:100%;height:80px;background:white;border:1px dashed var(--cm-border-input)">
</div>` },
    ],
    states: [
      { title: 'Error', html: `<cm-signature-field label="Signature" required error="Sign with the name on the quote"></cm-signature-field>` },
      { title: 'Disabled', description: 'For example after the document has been signed and sent.', html: `<cm-signature-field label="Signature" disabled></cm-signature-field>` },
    ],
    do: ['Say what the signer agrees to right above the field (the quote, the amount, the terms), and name the main button after it: "Sign and accept".', 'Keep both Draw and Type: typing is the accessible way to sign, and many signers prefer it on a laptop.', 'Store the PNG with who signed, when, and what they signed; the image alone is not proof.', 'Load `fonts.css` on signing pages, so typed signatures use the handwriting font.'],
    dont: ['Don\'t prefill `typed-name` and submit without the signer acting: prefill only to save typing, and make them press the sign button.', 'Don\'t put the pad in a scrolling area that is too small to draw in: on phones, give it the full width.', 'Don\'t recolour or invert the exported image for the dark theme: it is meant for light documents.'],
    content: ['Label it "Signature" or "Your signature".', 'Help text says what signing means in one sentence: "By signing, you accept the quote."'],
    a11y: ['Draw and Type are a real `tablist`: one tab stop, ArrowLeft/ArrowRight (mirrored in right-to-left text), Home and End move and select; each tab controls its `tabpanel`. The tab list is named by the label (or the element\'s `aria-label`, else "How to sign").', 'The drawing area is a canvas with `role="img"`, named "Signature drawing area" ("…, signed" once drawn) and described by the instructions: "Draw your signature with a mouse, finger or pen. To sign with the keyboard, choose Type." Its panel takes focus so screen reader users hear this.', 'Type is the keyboard and screen reader path: a text box named "<label>: Type your full name", with `autocomplete="name"`.', 'Undo ("Undo last stroke") and Clear ("Clear signature") are native buttons, disabled while there is nothing to undo or clear; when the one with focus becomes disabled, focus moves to the selected tab (or the text box). "Last stroke removed" and "Signature cleared" are announced in a polite status region.', 'Ink is `text-default` on `bg-surface` (AA in both themes); the pad outline is `border-input`, critical with an `error`. The exported image is always black on transparent.', 'Form-associated like Text field: `required` gives "Please sign here.", `error` sets a custom error (announced, `aria-invalid` on the text box), a disabled `<fieldset>` disables it, `form.reset()` clears it.', '`touch-action: none` on the canvas, so drawing on a phone doesn\'t scroll the page. Only the first finger draws; right-clicks are ignored.', 'No Figma design exists for this component; it follows the Text field and Status tabs styles.'],
    related: ['text-field', 'modal', 'file-upload'],
  },
  {
    slug: 'option-group', tag: 'cm-option-group', react: 'OptionGroup', name: 'Option group', group: 'Forms',
    responsive: ["Options wrap onto more lines when they don't fit.", "Options are 36px tall with 14px text and 8px apart at every width; on touch screens they are 44px tall."],
    summary: 'Switches a form between a few types, with one always selected.',
    lead: 'A row of 36px outlined buttons under a field-style label. The selected one is black. It works like a radio group, so it suits choices that change which fields follow, such as the offer type.',
    examples: [
      { title: 'Offer type', html: `<cm-option-group name="offer" label="Select offer type">
  <option value="orders" selected>Orders over</option>
  <option value="categories">Categories</option>
  <option value="product">Specific product</option>
  <option value="product-group">Product group</option>
  <option value="customer-group">Customer group</option>
</cm-option-group>` },
      { title: 'Without a heading', description: 'When the card title already asks the question, name the group with `aria-label`.',
        html: `<cm-option-group name="discount" aria-label="Discount type">
  <option value="percent" selected>Percentage</option>
  <option value="flat">Flat amount</option>
</cm-option-group>` },
      { title: 'Visit outcome (tones)', description: 'Since 1.3. `tone="success"` or `tone="critical"` on an option (or `tone` in `options`) colours it by the outcome it records, with the same colours as [[Button|/components/button]] tones: outlined in the tone, filled in it once selected. The label still says what it means; use tones only for clearly good or bad outcomes and leave the rest plain.',
        html: `<cm-option-group name="outcome" label="Visit outcome">
  <option value="pitched">Pitched</option>
  <option value="demo">Demo done</option>
  <option value="signed_up" tone="success">Signed up</option>
  <option value="not_interested" tone="critical">Not interested</option>
  <option value="later">Visit again later</option>
</cm-option-group>` },
      { title: 'Disabled option', html: `<cm-option-group name="delivery" label="Delivery">
  <option value="ship" selected>Ship to customer</option>
  <option value="pickup">Store pickup</option>
  <option value="local" disabled>Local delivery</option>
</cm-option-group>` },
    ],
    states: [
      { title: 'Disabled', description: 'The whole choice is fixed, for example after an offer has started.',
        html: `<cm-option-group label="Offer type" value="percent" disabled>
  <option value="percent">Percentage</option>
  <option value="amount">Fixed amount</option>
  <option value="free">Free shipping</option>
</cm-option-group>` },
    ],
    do: ['Use it for two to six short options that switch what the rest of the form asks.', 'Pre-select the most common option, so one is always selected.', 'Keep labels to one to three words so the row fits.'],
    dont: ['Don\'t use it for actions: use buttons.', 'Don\'t use it to filter a list or switch a view: use a [[Segmented control|/components/segmented-control]] or Status tabs.', 'Don\'t use it for long or many options: use a select.'],
    content: ['The heading asks the question: "Select offer type".', 'Option labels are short nouns in sentence case.'],
    a11y: ['A `radiogroup` of `radio` buttons named by the heading.', 'Tones (since 1.3) never carry meaning on their own: the label says what the outcome is, and selected options are filled while the others are outlined, in every tone. They use the same token pairs as Button tones (4.5:1 or more for text, 3:1 for outlines, in light and dark); disabled options look the same with or without a tone.', 'One tab stop on the selected option; arrow keys move and select (skipping disabled options, wrapping at the ends), Home and End jump, Space or Enter selects.', 'Form-associated: submits the selected `value` under `name`, `required` blocks submission, and `form.reset()` restores the initial choice.', 'Unselected options are white with a `border-input` outline (3:1 or more), like fields. On phones the buttons wrap; use a `cm-select` yourself if a phone layout needs one row.'],
    related: ['radio', 'select', 'segmented-control'],
  },
  {
    slug: 'segmented-control', tag: 'cm-segmented-control', react: 'SegmentedControl', name: 'Segmented control', group: 'Forms',
    responsive: ['The track is as wide as its options and never wider than its container; a long label is cut short with an ellipsis rather than pushing the page wider.', 'On touch screens the track is 44px tall at either size.'],
    summary: 'Switches between two to four views or filters of the same content, right away.',
    lead: 'Two to four options side by side in one grey track; the selected one is white with an outline. Use it for view switches such as Open / Done or Board / List, where picking an option changes what is shown at once. It is an [[Option group|/components/option-group]] with a compact look, so it has the same keyboard, events and form behaviour. Two sizes: `default` 36px, the height of buttons beside it, and `small` 32px for toolbars, filter rows and card headers. Since 1.5.',
    examples: [
      { title: 'Open / Done', description: 'A filter at the top of a task list. Name the control with `aria-label` when nothing visible labels it.',
        html: `<cm-segmented-control name="state" aria-label="Tasks" size="small" value="open">
  <option value="open">Open</option>
  <option value="done">Done</option>
</cm-segmented-control>` },
      { title: 'Board / List', description: 'A view switch. Listen for `change` and swap the view; `value` is the selected option.',
        html: `<div class="stack">
  <cm-segmented-control aria-label="View" value="board" onchange="this.nextElementSibling.textContent = this.value === 'board' ? 'Showing the board' : 'Showing the list'">
    <option value="board">Board</option>
    <option value="list">List</option>
  </cm-segmented-control>
  <p style="margin:0">Showing the board</p>
</div>` },
      { title: 'In a toolbar', description: 'With `size="small"` it lines up with a small search, small selects and slim buttons (all 32px).',
        html: `<div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center">
  <cm-search size="small" label="Search deals" placeholder="Search deals" style="flex:1 1 200px;min-width:0"></cm-search>
  <cm-select size="small" aria-label="Owner" placeholder="Owner"><option value="me">Me</option><option value="team">My team</option></cm-select>
  <cm-segmented-control size="small" aria-label="View" value="board">
    <option value="board">Board</option>
    <option value="list">List</option>
  </cm-segmented-control>
</div>` },
      { title: 'With a label', description: '`label` shows a field-style label above the track and names the group.',
        html: `<cm-segmented-control name="period" label="Show" value="week">
  <option value="day">Day</option>
  <option value="week">Week</option>
  <option value="month">Month</option>
</cm-segmented-control>` },
    ],
    states: [
      { title: 'Disabled option', html: `<cm-segmented-control aria-label="View" value="board">
  <option value="board">Board</option>
  <option value="list">List</option>
  <option value="calendar" disabled>Calendar</option>
</cm-segmented-control>` },
      { title: 'Disabled', html: `<cm-segmented-control aria-label="View" value="list" disabled>
  <option value="board">Board</option>
  <option value="list">List</option>
</cm-segmented-control>` },
    ],
    do: ['Use it for two to four short options that change what is shown right away, with no Save button.', 'Always have one option selected: set `value` or mark an `<option selected>`.', 'Keep the same order everywhere the same switch appears.'],
    dont: ['Don\'t use it for a setting that is saved with a form: use an [[Option group|/components/option-group]].', 'Don\'t use it for five or more choices: use a [[Select|/components/select]].', 'Don\'t use it to move between pages or sections with their own address: use [[Link tabs|/components/link-tabs]] or [[Status tabs|/components/status-tabs]].', 'Don\'t mix it with actions: every option is a view, not a command.'],
    content: ['One or two words per option, in sentence case: "Open", "Done", "Board", "List".', 'Write a text label on every option; don\'t use icons alone.', 'Options are parallel: all nouns or all states.'],
    a11y: ['A `radiogroup` of `radio` buttons named by `label` or the element\'s `aria-label`.', 'One tab stop on the selected option; arrow keys move and select (skipping disabled options and wrapping; mirrored in right-to-left text), Home and End jump, Space or Enter selects. Each new choice fires `input` and `change`.', 'The selected option is shown by a white fill, a `border-input` outline (3:1 or more) and dark text, not by colour alone; unselected options are `text-tertiary` (4.5:1 or more).', 'At least 44px tall on touch screens (`pointer: coarse`).', 'Form-associated: submits the selected `value` under `name`, `required` blocks submission, and `form.reset()` restores the initial choice. Built-in text is in its own `segmentedControl` namespace.', 'Disabled options use `text-secondary`, the disabled text colour, which is below 4.5:1 by design (about 3.2:1 in dark). WCAG 1.4.3 exempts disabled controls, and screen readers announce the option as unavailable (it is a disabled native button). Don\'t use `text-secondary` for anything a merchant needs to read.'],
    related: ['option-group', 'status-tabs', 'link-tabs', 'select'],
  },
  {
    slug: 'tag', tag: 'cm-tag', react: 'Tag', name: 'Tag', group: 'Forms',
    responsive: ["Tags are 24px tall with a 20px remove button at every width."],
    summary: 'Shows a product tag or an applied filter, with an optional remove button.',
    lead: 'A 24px pill with 12px text and an outline. Removable tags have a small circled × that fires `cm-remove`; your code takes the tag out of the list, for example `tag.addEventListener(\'cm-remove\', () => tag.remove())`, and moves focus to the next tag.',
    examples: [
      { title: 'Product tags', description: 'Tags sit `space-8` apart in both directions.',
        html: `<div class="row" style="gap:var(--cm-space-8)">
  <cm-tag removable>Karnataka</cm-tag>
  <cm-tag removable>Orange</cm-tag>
  <cm-tag removable>Cotton</cm-tag>
  <cm-tag removable>Summer sale</cm-tag>
</div>` },
      { title: 'Applied filters', description: 'Name the remove button with what it removes.',
        html: `<div class="row" style="gap:var(--cm-space-8)">
  <cm-tag removable remove-label="Remove filter: Payment status is Paid">Paid</cm-tag>
  <cm-tag removable remove-label="Remove filter: Order type is Store pickup">Store pickup</cm-tag>
</div>` },
      { title: 'Read-only', html: `<div class="row" style="gap:var(--cm-space-8)">
  <cm-tag>Cotton</cm-tag>
  <cm-tag>Handmade</cm-tag>
</div>` },
    ],
    states: [
      { title: 'Disabled', description: 'Shown but can\'t be removed now.',
        html: `<div class="row" style="gap:var(--cm-space-8)"><cm-tag removable disabled>Cotton</cm-tag><cm-tag removable disabled>Summer</cm-tag></div>` },
    ],
    stateTable: [
      ['Default', '24px pill, 12px text, `bg-tag` fill and a `border-strong` outline; removable tags end in a 20px circled ×.'],
      ['Hover', 'The remove button gets a `bg-hover` circle and the × darkens.'],
      ['Focus-visible', 'A 2px `border-strong` ring around the remove button.'],
      ['Pressed', 'The remove button\'s circle darkens a little.'],
      ['Selected', 'Not used: a tag is a value. For a choice that can be on or off, use a [[Segmented control|/components/segmented-control]] or checkboxes.'],
      ['Disabled', 'Grey text and a light outline; the remove button does nothing and shows `not-allowed`.'],
      ['Loading', 'Not used: tags show values already chosen.'],
    ],
    do: ['Keep tag text to one or two words.', 'After removing a tag, move focus to the next tag or to the field that adds tags, so keyboard users are not lost.', 'Use `remove-label` when the tag text alone doesn\'t say what is removed.'],
    dont: ['Don\'t use tags for status: use a badge.', 'Don\'t make tags clickable links; use buttons or links.'],
    content: ['Write tags as the merchant typed them; don\'t change their case.'],
    a11y: ['The remove button is a real button, named "Remove <tag text>" by default, and reachable with Tab.', 'Its 20px target, with tags 8px apart, meets the 24px target-spacing rule.', 'The outline is `border-strong`, which meets 3:1 against the tag fill in both themes.'],
    related: ['badge', 'search'],
  },
  {
    slug: 'badge', tag: 'cm-badge', react: 'Badge', name: 'Badge', group: 'Feedback',
    summary: 'Shows the status of an order, payment or other object.',
    lead: 'A 24px pill (owner standard, 1.6; 20px in 1.5) with one or two words in sentence case, 12px medium text with tabular numbers. Colour says the kind of status; the words say the status. Since 1.5 the text is shown as written (it used to be upper-cased and letter-spaced).',
    examples: [
      { title: 'Tones', html: `<div class="row">
  <cm-badge tone="information">Order placed</cm-badge>
  <cm-badge tone="success">Accepted</cm-badge>
  <cm-badge tone="critical">Cancelled</cm-badge>
  <cm-badge tone="attention">New</cm-badge>
  <cm-badge>Draft</cm-badge>
</div>` },
      { title: 'Next to a title', description: 'Use the card\'s `title-adornment` slot.',
        html: `<cm-card heading="Order #1042">
  <cm-badge slot="title-adornment" tone="success">Paid</cm-badge>
  <p style="margin:0">2 items · Rs. 2,340</p>
</cm-card>` },
    ],
    do: ['Keep it to one or two words.', 'Use the same word for the same status everywhere in the admin.', 'Information is orange and attention is blue in this system: pick the tone by meaning, not by colour.'],
    dont: ['Don\'t use a badge as a button: it is not interactive.', 'Don\'t rely on colour alone: the words must say the status.'],
    content: ['Write in sentence case: "Order placed", "2 h late". The badge shows the text exactly as written.', 'Use the state, not an action: "Paid", not "Pay now".'],
    a11y: ['Text colours meet 4.5:1 on their badge fills in both themes.', 'Not focusable. If the status changes while the page is open, announce it elsewhere (for example with a banner).'],
    related: ['banner', 'card'],
  },
  {
    slug: 'card', tag: 'cm-card', react: 'Card', name: 'Card', group: 'Layout',
    responsive: ['Follows the card\'s own width, not the window. When the heading and its `title-adornment` don\'t fit on one line, the adornment moves under the heading instead of squeezing it (since 1.2).', 'The header actions stay beside the title while the heading keeps about 12 characters of room (or its whole text, if shorter); below that they move under the title. Wide cards keep everything on one row.'],
    summary: 'Groups related content and actions into a section of the page.',
    lead: 'The white section container every admin page is built from: flat, with a 1px `border-subtle` edge, 8px corners and no shadow. The heading is 16px semibold, the description 13px grey. Three variants (owner standard, 1.6): `standard` (default) is padded 24px with 16px between header and body, `compact` 16px and 12px (dashboards, task summaries, metrics), and `interactive` makes the whole card a link (`href`) or a button (`cm-action`) with hover, pressed, focus and `selected` states. On phones every card is padded 16px. With `flush` the body starts 8px under the heading, so a list sits right under it.',
    examples: [
      { title: 'Basic', html: `<cm-card heading="Pricing">
  <div class="stack">
    <cm-text-field label="Price" hint="rs." type="number" value="1299"></cm-text-field>
    <cm-text-field label="Compare-at price" hint="rs." type="number"></cm-text-field>
  </div>
</cm-card>` },
      { title: 'Description and actions', html: `<cm-card heading="Shipping" description="How this product is weighed and shipped.">
  <cm-button slot="actions" size="slim">Edit</cm-button>
  <p style="margin:0">0.4 kg · Ships from Bengaluru warehouse</p>
</cm-card>` },
      { title: 'Badges next to the heading', description: 'Put counts or a status in the `title-adornment` slot. On a narrow card (try a phone) the badges move under the heading so it is never squeezed, and the actions move under the title only if the heading would have less than about 12 characters of room.',
        html: `<cm-card heading="Partner tasks" heading-level="3" style="max-width:390px">
  <cm-badge slot="title-adornment" tone="critical">1 overdue</cm-badge>
  <cm-badge slot="title-adornment" tone="attention">2 today</cm-badge>
  <cm-badge slot="title-adornment">4 later</cm-badge>
  <cm-button slot="actions" size="slim">View all</cm-button>
  <p style="margin:0">Call back Priya S. about the bulk order</p>
</cm-card>` },
      { title: 'Compact', description: '`variant="compact"`: 16px padding, for dashboards, task summaries and metrics. Since 1.6.',
        html: `<div class="row" style="align-items:stretch">
  <cm-card variant="compact" heading="Due today" style="flex:1 1 160px"><cm-metric label="Open" value="12"></cm-metric></cm-card>
  <cm-card variant="compact" heading="Overdue" style="flex:1 1 160px"><cm-metric label="Open" value="3"></cm-metric></cm-card>
</div>` },
      { title: 'Interactive', description: '`variant="interactive"`: the whole card opens something. With `href` the heading is a link stretched over the card; without it the card is a button that fires `cm-action` (Enter and Space work too). `selected` draws a 2px outline and is announced (pressed for a button card, current for a link card). Header actions stay separately clickable; keep other controls out of the body. Combine with compact: `variant="interactive compact"`. Since 1.6.',
        html: `<div class="row" style="align-items:stretch">
  <cm-card variant="interactive compact" heading="Monthly plan" selected style="flex:1 1 180px">Rs. 499 a month</cm-card>
  <cm-card variant="interactive compact" heading="Yearly plan" style="flex:1 1 180px">Rs. 4,990 a year</cm-card>
  <cm-card variant="interactive compact" heading="Renewals" href="#/components/card" style="flex:1 1 180px">8 renewals this month</cm-card>
</div>` },
      { title: 'Flush', description: '`flush` removes the body padding for lists and tables that run edge to edge.',
        html: `<cm-card heading="Recent orders" flush>
  <ul style="list-style:none;margin:0;padding:0">
    <li style="display:flex;justify-content:space-between;padding:12px 20px;border-top:1px solid var(--cm-border-subtle)">#1042 · Priya S. <cm-badge tone="success">Paid</cm-badge></li>
    <li style="display:flex;justify-content:space-between;padding:12px 20px;border-top:1px solid var(--cm-border-subtle)">#1041 · Rahul M. <cm-badge tone="information">Order placed</cm-badge></li>
  </ul>
</cm-card>` },
      { title: 'Actions without a heading', description: 'Since 1.3, the `actions` slot also shows on a card with no `heading` or `description`: the actions sit in a row of their own at the top, at the end. (Before 1.3 they were not shown at all.) With a heading, the header is unchanged.',
        html: `<cm-card style="max-width:480px">
  <cm-button slot="actions" size="slim">Edit shipping</cm-button>
  <p style="margin:0">0.4 kg · Ships from Bengaluru warehouse</p>
</cm-card>` },
    ],
    states: [
      { title: 'Loading', description: 'Keep the card and its heading; fill the body with skeletons.',
        html: `<cm-card heading="Recent orders" style="max-width:480px">
  <div aria-busy="true" class="stack"><cm-skeleton lines="3"></cm-skeleton></div>
</cm-card>` },
      { title: 'Empty', description: 'Say what will appear here and give the action that fills it.',
        html: `<cm-card heading="Recent orders" flush style="max-width:480px">
  <cm-empty-state size="small" icon="cart" heading="No orders yet">Orders appear here when customers check out.</cm-empty-state>
</cm-card>` },
      { title: 'Error', description: 'Say what couldn\'t load and offer to try again; keep the rest of the page working.',
        html: `<cm-card heading="Recent orders" style="max-width:480px">
  <cm-banner tone="critical" heading="Orders couldn't load">Check your connection and try again.<cm-button slot="actions" size="slim">Try again</cm-button></cm-banner>
</cm-card>` },
    ],
    do: ['Give every card a heading unless it is the only thing on the page.', 'Set `heading-level` so the page outline makes sense (2 under the page title, 3 inside a section).', 'Stack cards `space-24` apart (the `cm-layout-section` default since 1.6).', 'Use `variant="compact"` for dashboard tiles and summaries, the standard card for forms and details.'],
    dont: ['Don\'t nest cards inside cards: use `bg-inset` panels instead.', 'Don\'t put more than two actions in the header.'],
    content: ['Headings are short nouns: "Pricing", "Shipping", "Variants".', 'The description is one sentence in plain language.'],
    a11y: ['The heading is exposed with `role="heading"` and `aria-level`, so screen-reader users can jump between cards.', 'The card is a labelled region named by its heading. An interactive card is not a region: it is one link or button, named by its heading (or `label` when it has none), with a 2px focus ring around the whole card.', 'A card without a heading is not a named region: if its actions need context ("Edit" what?), name them, e.g. `aria-label="Edit shipping"` on the button.'],
    related: ['badge', 'button'],
  },
  {
    slug: 'page', tag: 'cm-page', react: 'Page', name: 'Page', group: 'Layout',
    responsive: ["Content is centred, at most as wide as `width` says: `form` 640px, `detail` 1040px, `wide` (the default) 1600px, `full` no limit. `narrow` (800px) and `full-width` from 1.0 still work.", "Follows the page's own width, not the window: at 640px or narrower the padding around the content drops from `space-24` (24px) to `space-16` (16px)."],
    summary: 'Wraps a whole admin page: the page header, then the content on the page background.',
    lead: 'The outermost element of a screen. The page header runs edge to edge across the top; the content sits on `bg-page` with `space-24` padding (`space-16` when the page is 640px wide or less), so it lines up with the page header\'s title, centred at the width you choose with `width`. Inside `cm-app-frame panel` the background is transparent, so the page sits on the white panel.',
    examples: [
      { title: 'Page anatomy', description: 'Every page has the same order: the header (the title, with the primary action at the end), then a filter or toolbar row, then the content. Pick the width by what the page holds: `width="form"` (640px) for settings and single-column forms, `width="detail"` (1040px) for one record such as an order or a customer, the default `wide` (1600px) for lists and dashboards, and `width="full"` for wide tables and reports.',
        html: `<cm-page width="detail">
  <cm-page-header slot="header" heading="Orders">
    <cm-button slot="actions" variant="primary">Create order</cm-button>
  </cm-page-header>
  <cm-status-tabs aria-label="Order status" style="margin-bottom:var(--cm-space-16)">
    <option value="all" count="233">All</option>
    <option value="open" count="23" selected>Open</option>
    <option value="done" count="210">Done</option>
  </cm-status-tabs>
  <cm-card heading="Open orders" flush>
    <cm-resource-list selectable resource-name="order">
      <cm-resource-item value="o1">#1042 · Priya S.</cm-resource-item>
      <cm-resource-item value="o2">#1041 · Rahul M.</cm-resource-item>
    </cm-resource-list>
  </cm-card>
</cm-page>` },
      { title: 'Detail page', description: 'Page header, then a layout with a main and a side column. This is the shape of every detail page. The columns stack here because the example frame is narrower than 768px.',
        html: `<cm-page>
  <cm-page-header slot="header" heading="Order #1042" breadcrumbs='[{"label":"Orders","href":"#/components/page"}]'>
    <cm-button slot="actions" variant="primary">Fulfil items</cm-button>
  </cm-page-header>
  <cm-layout>
    <cm-layout-section variant="two-thirds">
      <cm-card heading="Items">2 items · Rs. 2,340</cm-card>
      <cm-card heading="Payment">Paid by UPI</cm-card>
    </cm-layout-section>
    <cm-layout-section variant="one-third">
      <cm-card heading="Customer">Priya S.</cm-card>
    </cm-layout-section>
  </cm-layout>
</cm-page>` },
      { title: 'Form width', description: '`width="form"` keeps settings and single-column forms at a readable 640px.',
        html: `<cm-page width="form">
  <cm-page-header slot="header" heading="Store details"></cm-page-header>
  <cm-card heading="Contact">
    <cm-stack>
      <cm-text-field label="Store name" value="Ananya Handlooms"></cm-text-field>
      <cm-text-field label="Support email" type="email"></cm-text-field>
    </cm-stack>
  </cm-card>
</cm-page>` },
    ],
    do: ['Use one `cm-page` per screen, with one page header.', 'Set `width`: `form` for settings forms, `detail` for one record, `full` for wide tables and reports; leave it empty for lists and dashboards.', 'Put a save bar or action bar in the `footer` slot, or anywhere on the page: both stick to the bottom.'],
    dont: ['Don\'t add your own page padding or background around it.', 'Inside the admin, don\'t add a header bar or side navigation: the admin draws them around your app.'],
    content: ['The page title in the header names the record or list: "Order #1042", "Products".'],
    a11y: ['Put the page header first so the page title is the first heading.', 'The content keeps its source order on every width.'],
    related: ['page-header', 'layout', 'card'],
  },
  {
    slug: 'layout', tag: 'cm-layout', react: 'Layout', name: 'Layout', group: 'Layout',
    responsive: ["Follows the layout's own width, not the window: below 768px every section takes the full width and they stack in source order. From 768px, `one-half`, `one-third` and `two-thirds` sections sit side by side.", "`variant=\"record\"`: from 880px of the layout's own width the aside is a 320px column on the end side; narrower, the sections stack with the aside above the main content (or below it with `aside-position=\"below\"`), 24px apart, 16px once the layout is 640px wide or less. Inside a `cm-page` the layout is 48px narrower than the window (32px on phones), so an 880px window stacks; a 1024px window (976px of layout) keeps the aside beside the content."],
    parts: [{ tag: 'cm-layout-section', react: 'LayoutSection' }],
    summary: 'Arranges a page into columns: a main column and a side column, halves, or full-width rows.',
    lead: 'A six-track grid of `cm-layout-section`s: `two-thirds` and `one-third` for detail pages, `one-half` for two equal columns, `full` (default) across the page. Sections are 24px apart and each stacks its cards `space-24` apart (owner standard, 1.6; was `space-20`). When the layout itself is narrower than 768px, every section goes full width, in source order. `variant="record"` (since 1.7) is the standard record page: a main column and a 320px `aside` section, see [[Record page|/patterns/record-page]].',
    examples: [
      { title: 'Main and side columns', html: `<cm-layout>
  <cm-layout-section variant="two-thirds">
    <cm-card heading="Details">Title, description</cm-card>
    <cm-card heading="Pricing">Price, compare-at price</cm-card>
  </cm-layout-section>
  <cm-layout-section variant="one-third">
    <cm-card heading="Status">Active</cm-card>
  </cm-layout-section>
</cm-layout>` },
      { title: 'Halves, then a full row', html: `<cm-layout>
  <cm-layout-section variant="one-half"><cm-card heading="Online store">Rs. 48,200 this week</cm-card></cm-layout-section>
  <cm-layout-section variant="one-half"><cm-card heading="Stores">Rs. 1,12,900 this week</cm-card></cm-layout-section>
  <cm-layout-section><cm-card heading="Recent orders">12 orders today</cm-card></cm-layout-section>
</cm-layout>` },
      { title: 'Record page: main column and 320px aside', description: '`variant="record"` with one main section and one `variant="aside"` section. From 880px of the layout\'s own width the aside is a 320px column on the end side; narrower, it stacks above the main content (`aside-position="below"` puts it under). `sticky-aside` keeps a short aside in view while the main column scrolls. Since 1.7.',
        html: `<cm-layout variant="record" sticky-aside>
  <cm-layout-section variant="aside">
    <cm-info-panel heading="Details" variant="compact" layout="rows">
      <cm-info-item label="Email"><a href="mailto:asha@example.com">asha@example.com</a></cm-info-item>
      <cm-info-item label="Phone">+91 98450 12345</cm-info-item>
      <cm-info-item label="Company">Rao Textiles</cm-info-item>
    </cm-info-panel>
  </cm-layout-section>
  <cm-layout-section>
    <cm-card heading="Activity">Called on 14 Nov: interested in the Growth plan.</cm-card>
    <cm-card heading="Deals" variant="compact">
      <cm-empty-state size="inline" heading="No deals yet" action="Add deal"></cm-empty-state>
    </cm-card>
  </cm-layout-section>
</cm-layout>` },
    ],
    do: ['Put what customers see (details, media, pricing) in the main column and settings and summaries in the side column.', 'Put the main section first in the source: it comes first when the columns stack.', 'Fill a row: `two-thirds` + `one-third`, two `one-half`, or one `full`.', 'Record layout: put the sections in the source in their stacked order: the aside first with the default `aside-position="above"`, the main section first with `below`. On wide layouts the aside moves to the end column wherever it is in the source.', 'Use `variant="record"` for every record (lead, contact, deal, account, ticket, order, product) so they all look and behave the same.'],
    dont: ['Don\'t nest layouts: use a grid inside a card for fields side by side.', 'Don\'t reorder sections with CSS: keyboard and screen-reader order would no longer match what is seen.', 'Don\'t put more than one main and one aside section in a record layout: the aside sits beside the first row only.'],
    content: [],
    a11y: ['Default layouts never change order, so reading and Tab order follow the page on every width.', 'A record layout moves only the aside, as one block: on wide layouts to the end column, stacked to wherever `aside-position` says. Matching the source order to the stacked order keeps phones (where order matters most) exactly in reading order.', 'A sticky aside sticks only while it fits in the window, so every part of it can still be scrolled to and nothing is covered at 200% zoom.', 'The layout adds no landmarks or headings: your cards carry the headings.'],
    related: ['page', 'grid', 'card'],
  },
  {
    slug: 'stack', tag: 'cm-stack', react: 'Stack', name: 'Stack', group: 'Layout',
    summary: 'Spaces items evenly in a column or a row, using the spacing scale.',
    lead: 'A column (default) or a row (`direction="inline"`) of items `gap` apart. `gap` takes a spacing step: `0`, `10`, `12`, `15`, `20` (default), `22` or `30`. Rows can wrap, align and spread their items. The items stay in your page, so your styles and forms work as usual.',
    examples: [
      { title: 'Fields in a card', description: '`space-16` between fields, as in the product editor.', html: `<cm-card heading="Details" style="max-width:520px">
  <cm-stack gap="32">
    <cm-text-field label="Title" placeholder="Short sleeve t-shirt"></cm-text-field>
    <cm-text-field label="Description" multiline rows="3"></cm-text-field>
  </cm-stack>
</cm-card>` },
      { title: 'Buttons in a row', html: `<cm-stack direction="inline" gap="8" wrap>
  <cm-button>Export</cm-button>
  <cm-button>Import</cm-button>
  <cm-button variant="primary">Add product</cm-button>
</cm-stack>` },
      { title: 'Spread across a row', html: `<cm-stack direction="inline" justify="space-between">
  <span>Subtotal</span>
  <strong>Rs. 2,340</strong>
</cm-stack>` },
    ],
    do: ['Use the default `20` between cards, `30` between fields in a card, `10` between buttons.', 'Use `wrap` on rows of buttons or tags so they never overflow on phones.'],
    dont: ['Don\'t add margins to the items: the gap does the spacing.', 'Don\'t use a stack for a table-like layout: use a grid.'],
    content: [],
    a11y: ['Order on screen is the order in the source.'],
    related: ['grid', 'layout'],
  },
  {
    slug: 'grid', tag: 'cm-grid', react: 'Grid', name: 'Grid', group: 'Layout',
    responsive: ["Follows the grid's own width, not the window: with `columns`, a grid 640px wide or narrower shows one column.", "With `min-column-width`, it fits as many columns of at least that width as there is room for (never wider than the grid itself), at any width."],
    summary: 'Puts items in equal columns, for fields side by side, tiles and summary cards.',
    lead: '`columns` equal columns (default 2) that become one column when the grid is 640px wide or less, or with `min-column-width`, as many columns as fit, each at least that wide. `gap` takes a spacing step (default `20`).',
    examples: [
      { title: 'Fields side by side', description: 'Two columns while the grid is wider than 640px; one column below that (try Phone).', html: `<cm-card heading="Pricing" style="max-width:760px">
  <cm-grid columns="2">
    <cm-text-field label="Price" hint="rs." type="number"></cm-text-field>
    <cm-text-field label="Compare-at price" hint="rs." type="number"></cm-text-field>
  </cm-grid>
</cm-card>` },
      { title: 'As many as fit', description: '`min-column-width="200px"`: resize the example to see columns come and go. A row of totals is a grid of [[Metric|/components/metric]] tiles.', html: `<cm-grid min-column-width="200px">
  <cm-metric label="Orders" value="128"></cm-metric>
  <cm-metric label="Sales" value="Rs. 2,41,000"></cm-metric>
  <cm-metric label="Visitors" value="3420"></cm-metric>
  <cm-metric label="Returns" value="4"></cm-metric>
</cm-grid>` },
    ],
    do: ['Use two columns for pairs of short fields (price and compare-at price, city and PIN code).', 'Use `min-column-width` for tiles, so the count follows the space.'],
    dont: ['Don\'t put long text fields side by side: give them the full width.', 'Don\'t place a grid inside a horizontal stack: it needs a width to work out its columns.'],
    content: [],
    a11y: ['Items read left to right, then down, the same as the source order.'],
    related: ['stack', 'layout', 'metric'],
  },
  {
    slug: 'banner', tag: 'cm-banner', react: 'Banner', name: 'Banner', group: 'Feedback',
    summary: 'Tells merchants about something important on the page or in their store.',
    lead: 'A full-width message with a tone, an optional heading and actions. Critical banners are announced immediately.',
    examples: [
      { title: 'Tones', html: `<div class="stack" style="gap:var(--cm-space-12)">
  <cm-banner tone="attention" heading="Your store is in test mode">Orders placed now won't be charged.</cm-banner>
  <cm-banner tone="information">GST rates changed on 1 Nov. Check your tax settings.</cm-banner>
  <cm-banner tone="success">Product saved.</cm-banner>
  <cm-banner tone="critical" heading="Payment failed">The card was declined. Ask the customer for another payment method.</cm-banner>
</div>` },
      { title: 'With actions', html: `<cm-banner tone="attention" heading="Connect a payment provider">
  You need one before customers can check out.
  <cm-button slot="actions" variant="primary" size="slim">Set up payments</cm-button>
  <cm-button slot="actions" size="slim">Learn more</cm-button>
</cm-banner>` },
      { title: 'Dismissible', description: 'Fires `cm-dismiss`. Call `preventDefault()` on it to keep the banner open, for example to confirm first.',
        html: `<cm-banner tone="information" dismissible>Your plan renews on 1 Dec.</cm-banner>` },
    ],
    do: ['Put page-level banners at the top of the page, under the title.', 'Lead with what happened, then what to do.', 'Use `critical` only when something has failed or needs action now.'],
    dont: ['Don\'t stack more than two banners: prioritise.', 'Don\'t use a banner for a passing confirmation that needs no action; use an App Bridge toast (`app.toast.show`) when your app runs in the admin.'],
    content: ['Headings are a short statement: "Payment failed", not "Error!".', 'Body copy is one or two sentences.', 'Action labels follow the button rules.'],
    a11y: ['`critical` uses `role="alert"` and interrupts the screen reader; other tones use `role="status"`.', 'The dismiss button has an accessible name ("Dismiss") and a focus ring.', 'Text on every banner fill meets 4.5:1 in both themes.'],
    related: ['badge', 'button'],
  },
  {
    slug: 'icon', tag: 'cm-icon', react: 'Icon', name: 'Icon', group: 'Images and icons',
    summary: 'Draws one of the Commmerce line icons.',
    lead: 'Icons inherit the text colour and are decorative unless you give them a label.',
    examples: [
      { title: 'Basic', html: `<div class="row">
  <cm-icon name="home"></cm-icon><cm-icon name="cart"></cm-icon><cm-icon name="box"></cm-icon><cm-icon name="users"></cm-icon><cm-icon name="chart"></cm-icon><cm-icon name="settings"></cm-icon>
</div>` },
      { title: 'Sizes', description: 'Three sizes: 16px inside controls (buttons, fields, menu items), 20px in navigation, 24px for feature icons on their own (empty states, tiles). The tokens are `--cm-icon-size-sm`, `-md` and `-lg`.',
        html: `<div class="row"><cm-icon name="bell" size="16"></cm-icon><cm-icon name="bell" size="18"></cm-icon><cm-icon name="bell" size="24"></cm-icon><cm-icon name="bell" size="32"></cm-icon></div>` },
      { title: 'Colour', description: 'Set `color` on the icon or its parent. Use the icon tokens.',
        html: `<div class="row">
  <cm-icon name="check-circle" size="24" style="color:var(--cm-icon-success)"></cm-icon>
  <cm-icon name="x-circle" size="24" style="color:var(--cm-icon-critical)"></cm-icon>
  <cm-icon name="clock" size="24" style="color:var(--cm-icon-default)"></cm-icon>
</div>` },
      { title: 'Meaningful icon', description: 'When the icon is the only thing that carries the meaning, give it a `label`.',
        html: `<span style="display:inline-flex;align-items:center;gap:8px">Stock <cm-icon name="alert" label="Low stock" style="color:var(--cm-icon-critical)"></cm-icon></span>` },
    ],
    do: ['Pair icons with text in navigation and buttons.', 'Use the same icon for the same thing everywhere.'],
    dont: ['Don\'t use icons from other sets next to these: stroke weights won\'t match.', 'Don\'t resize below 16px.'],
    content: ['A `label` describes meaning, not the picture: "Low stock", not "Warning triangle".'],
    a11y: ['Hidden from screen readers by default (`aria-hidden`).', 'With `label`, exposed as an image with that name.', 'Meaningful icons use colours with at least 3:1 contrast (`icon-default` is 3.4:1).'],
    related: ['button', 'avatar', 'thumbnail'],
  },
  {
    slug: 'avatar', tag: 'cm-avatar', react: 'Avatar', name: 'Avatar', group: 'Images and icons',
    summary: 'Shows a person or a store as a photo or their initials.',
    lead: 'Round for people, square for stores. Without a photo it shows the initials of `name` on the avatar green, and without a name a person or store icon.',
    examples: [
      { title: 'People', html: `<div class="row">
  <cm-avatar name="Asha Rao" size="small"></cm-avatar>
  <cm-avatar name="Asha Rao"></cm-avatar>
  <cm-avatar name="Asha Rao" size="large"></cm-avatar>
  <cm-avatar></cm-avatar>
</div>` },
      { title: 'Stores', description: '`shape="square"` for stores and businesses.',
        html: `<div class="row">
  <cm-avatar shape="square" name="Indiranagar store"></cm-avatar>
  <cm-avatar shape="square"></cm-avatar>
</div>` },
      { title: 'Next to the name', description: 'When the name is written beside it, mark the avatar `decorative` so screen readers don\'t hear the name twice.',
        html: `<div class="row" style="gap:var(--cm-space-8)">
  <cm-avatar name="Rahul Mehta" decorative></cm-avatar>
  <span>Rahul Mehta · Store manager</span>
</div>` },
    ],
    states: [
      { title: 'Photo failed to load', description: 'A broken or missing photo falls back to the initials. The example\'s `src` is a deliberately broken image.',
        html: `<cm-avatar name="Priya Shah" src="data:image/png;base64,AAAA"></cm-avatar>` },
    ],
    do: ['Use the person\'s full name, so the initials and the accessible name are right.', 'Use square avatars for stores, round ones for people.'],
    dont: ['Don\'t use an avatar for products: use a thumbnail.', 'Don\'t make the avatar the only way to tell people apart in a list: show the name too.'],
    content: ['Pass the name as the merchant entered it; the avatar takes the first letters of the first and last word.'],
    a11y: ['An image named after `name`, unless `decorative` (then hidden).', 'Initials are dark text on `avatar-bg` (AA in both themes).', 'Without a name it is hidden from screen readers: give it a name if it carries meaning.'],
    related: ['thumbnail', 'header-bar'],
  },
  {
    slug: 'thumbnail', tag: 'cm-thumbnail', react: 'Thumbnail', name: 'Thumbnail', group: 'Images and icons',
    summary: 'Shows a small product or file image in a fixed square.',
    lead: 'The whole image fits the box (never cropped) on a grey backdrop, so product photos of any shape line up in lists. Without an image, or when it fails to load, it shows a placeholder.',
    examples: [
      { title: 'Sizes', description: '40px in dense lists, 60px in resource lists, 80px on detail pages.',
        html: `<div class="row">
  <cm-thumbnail size="small" alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 60'%3E%3Crect width='40' height='60' rx='6' fill='%23327EC2'/%3E%3C/svg%3E"></cm-thumbnail>
  <cm-thumbnail alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 60'%3E%3Crect width='40' height='60' rx='6' fill='%23327EC2'/%3E%3C/svg%3E"></cm-thumbnail>
  <cm-thumbnail size="large" alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 60'%3E%3Crect width='40' height='60' rx='6' fill='%23327EC2'/%3E%3C/svg%3E"></cm-thumbnail>
</div>` },
      { title: 'In a list', description: 'Next to the product name, the image is decorative: leave `alt` empty. Use `loading="lazy"` in long lists.',
        html: `<div class="row" style="gap:var(--cm-space-8)">
  <cm-thumbnail size="small" loading="lazy"></cm-thumbnail>
  <span>Blue cotton kurta · 12 in stock</span>
</div>` },
    ],
    states: [
      { title: 'No image', description: 'A placeholder box; with `alt`, screen readers hear "<alt> (no image)".',
        html: `<cm-thumbnail alt="Blue cotton kurta"></cm-thumbnail>` },
    ],
    do: ['Describe what the image shows in `alt` when nothing next to it does: "Blue cotton kurta, front".', 'Keep every thumbnail in one list the same size.'],
    dont: ['Don\'t use a thumbnail for people or stores: use an avatar.', 'Don\'t write "image of" in `alt`.'],
    content: ['Write `alt` as a short phrase in sentence case, without a full stop.'],
    a11y: ['An empty `alt` makes the image decorative.', 'The placeholder icon is decorative; the box is named from `alt` when it has one.'],
    related: ['avatar', 'resource-list'],
  },
  {
    slug: 'tooltip', tag: 'cm-tooltip', react: 'Tooltip', name: 'Tooltip', group: 'Overlays',
    responsive: ["At most 240px wide (280px before 1.6), and never wider than the window minus 16px.", "Positioned against the window: if the bubble doesn't fit on its `placement` side but fits on the opposite one, it flips, and it always stays 8px inside the window. It is placed again when the page scrolls or the window is resized."],
    summary: 'Explains a control in a few words when it is hovered or focused.',
    lead: 'A small dark label next to one control: 12px white text on `bg-panel-header`, 8 x 12px padding, 6px corners, at most 240px wide (owner standard, 1.6). It appears on hover after 400ms and at once on keyboard focus, hides as soon as the pointer leaves (it stays while the pointer moves onto the bubble), and Esc closes it. The text is also the control\'s accessible description. Never the only way to get information: touch screens don\'t show it.',
    examples: [
      { title: 'Icon button', description: 'An icon-only button still needs its own name: here, its `label`. The tooltip adds a description.',
        html: `<cm-tooltip content="Download this report as a CSV file">
  <cm-button icon-only icon="download" label="Download"></cm-button>
</cm-tooltip>` },
      { title: 'Placement', description: 'It flips to the other side when there is no room.',
        html: `<div class="row" style="gap:var(--cm-space-24);padding:40px 0">
  <cm-tooltip content="Above" placement="top"><cm-button>Top</cm-button></cm-tooltip>
  <cm-tooltip content="Below" placement="bottom"><cm-button>Bottom</cm-button></cm-tooltip>
  <cm-tooltip content="Before" placement="start"><cm-button>Start</cm-button></cm-tooltip>
  <cm-tooltip content="After" placement="end"><cm-button>End</cm-button></cm-tooltip>
</div>` },
      { title: 'Longer text', description: 'Since 1.6 the bubble wraps at 240px. Keep it to one sentence; anything longer belongs in help text on the page.',
        html: `<div style="padding:24px 0 96px"><cm-tooltip placement="bottom" content="Orders paid more than 30 days ago are archived automatically, with their invoices.">
  <cm-button>Archive rules</cm-button>
</cm-tooltip></div>` },
      { title: 'Explaining a field', html: `<cm-tooltip content="Shown to customers at checkout">
  <cm-text-field label="Display name"></cm-text-field>
</cm-tooltip>` },
    ],
    stateTable: [
      ['Hidden', 'Nothing shown; the text is still the control\'s accessible description.'],
      ['Hover', 'Shows after `delay` (400ms) while the pointer rests on the control; leaving hides it at once (no hide delay). Moving onto the bubble keeps it open.'],
      ['Focus-visible', 'Keyboard focus on the control shows it at once; moving focus away hides it.'],
      ['Dismissed', 'Esc hides it while the control keeps focus (WCAG 1.4.13).'],
      ['Pressed, selected, disabled, loading', 'Belong to the control it wraps. Don\'t wrap a disabled control: it can\'t be focused, so keyboard users never see the tooltip.'],
    ],
    do: ['Keep it under about 80 characters, one sentence or less.', 'Use it to explain icons and abbreviations.', 'Make sure what it says is also somewhere else (a label, help text, the page): a tooltip is never the only way to get information.'],
    dont: ['Don\'t put links, buttons or other controls in a tooltip: it can\'t be reached.', 'Don\'t hide information a merchant needs to finish a task: put it in help text.', 'Don\'t add a tooltip that repeats the button text.', 'Don\'t wrap a disabled control: it can\'t be focused, so keyboard users never see the tooltip.'],
    content: ['Write in sentence case without a full stop for fragments.', 'Say what the control does, not what it looks like.'],
    a11y: ['The text becomes the control\'s accessible description: `aria-describedby` on native controls, an element reference on the control inside a component.', 'It describes, it doesn\'t name: icon-only buttons need their own name.', 'With `visual-only`, the text is shown but not added as a description: use it only when it repeats the control\'s accessible name, as the collapsed Side navigation does with its item labels, so screen readers don\'t hear it twice.', 'Hover over it, keep it open while needed and dismiss it with Esc (WCAG 1.4.13).', 'White on near-black (`text-on-dark` on `bg-panel-header`), AA in both themes.'],
    related: ['button', 'icon'],
  },
  {
    slug: 'page-header', tag: 'cm-page-header', react: 'PageHeader', name: 'Page header', group: 'Layout',
    responsive: ["When the window is 640px wide or less, the breadcrumbs are replaced by a back link to the parent page, the title is 20px, the sides are padded 16px instead of 24px, and the header is at least 48px tall and stays on one line."],
    summary: 'Tops every admin page with breadcrumbs, the page title and the page\'s main actions.',
    lead: 'A white bar at least 64px tall: 13px breadcrumbs over a 24/32 semibold title on the left (with an optional 13px `description` under it, since 1.6), buttons 8px apart on the right. A badge in `title-adornment` sits beside the title and wraps under it only when the title runs out of room (fixed in 1.6, issue #32). Its sides are padded 24px (16px on phones), the same as Page content, so the title lines up with the cards below. Pass the parent pages as `breadcrumbs`; the title is added as the current page. On phones it is at least 48px with a 20px title, and the breadcrumbs become a back arrow to the parent page. `back-href` (since 1.7) shows that back arrow at every width, before the title: use it on record pages opened from a list.',
    examples: [
      { title: 'Record header', description: 'The standard record header: `back-href` back to the list, the status in `title-adornment`, the record\'s owner, created date and source in `description`, secondary actions then the primary one. Since 1.7.',
        html: `<cm-page-header heading="Asha Rao" back-href="#leads" back-label="Leads" description="Owner Ravi Kumar · Created 12 Nov 2026 · Source Website form">
  <cm-badge slot="title-adornment" tone="attention">Qualified</cm-badge>
  <cm-button slot="actions">Log call</cm-button>
  <cm-button slot="actions" variant="primary">Convert</cm-button>
</cm-page-header>` },
      { title: 'Title badge and description', description: 'A count or status in `title-adornment` sits beside the title (it wraps under it only when the title runs out of room), and `description` adds one 13px line under the title. Since 1.6.',
        html: `<cm-page-header heading="Tasks" description="Calls, visits and follow-ups for your accounts.">
  <cm-badge slot="title-adornment" tone="attention">5 open</cm-badge>
  <cm-button slot="actions">Export</cm-button>
  <cm-button slot="actions" variant="primary">Add task</cm-button>
</cm-page-header>` },
      { title: 'Edit page', description: 'Secondary actions first, the primary action last, `space-20` apart.',
        html: `<cm-page-header heading="Add product" breadcrumbs='[{"label":"Dashboard","href":"#"},{"label":"Products","href":"#"}]'>
  <cm-button slot="actions" size="large">Duplicate</cm-button>
  <cm-button slot="actions" size="large">Cancel</cm-button>
  <cm-button slot="actions" size="large" variant="primary">Save</cm-button>
</cm-page-header>` },
      { title: 'Record with previous/next', description: '`pagination` adds arrows that fire `cm-previous` and `cm-next`; enable them with `has-previous` and `has-next`.',
        html: `<cm-page-header heading="Order #ODYOD0744" breadcrumbs='[{"label":"Orders","href":"#"}]' pagination has-previous has-next>
  <cm-badge slot="title-adornment" tone="information">Order placed</cm-badge>
  <cm-button slot="actions" size="large" variant="primary">Fulfil</cm-button>
</cm-page-header>` },
      { title: 'List page', description: 'A count next to the title and import/export actions.',
        html: `<cm-page-header heading="Products">
  <cm-badge slot="title-adornment">39</cm-badge>
  <cm-button slot="actions" size="large">Import</cm-button>
  <cm-button slot="actions" size="large">Export</cm-button>
  <cm-button slot="actions" size="large" variant="primary">Add product</cm-button>
</cm-page-header>` },
    ],
    do: ['Use one page header per page, at the top.', 'Keep it to three actions; put the rest in an action menu.', 'Make the title the same words as the link that led here.'],
    dont: ['Don\'t include the current page in `breadcrumbs`: it is added from `heading`.', 'Don\'t use it inside cards or panels.', 'Don\'t use it to ask about unsaved changes: use the save bar.'],
    content: ['Titles are nouns or short verb phrases: "Products", "Add product", "Order #1042".', 'Breadcrumbs use the page names from navigation.'],
    a11y: ['The title is the page\'s `<h1>`.', 'Breadcrumbs are a `nav` named "Breadcrumb" with an ordered list; the current page has `aria-current="page"`.', 'The back arrow (on phones, or always with `back-href`) is a link named "Back to <parent>" (`back-label`; just "Back" without one). Previous/next arrows are buttons named "Previous" and "Next", disabled at the ends.', 'The previous/next arrows are 36px icon buttons (40px on touch screens, with a 44px hit area) with a `border-input` edge, so they meet 3:1.'],
    related: ['action-bar', 'save-bar', 'button'],
  },
  {
    slug: 'action-bar', tag: 'cm-action-bar', react: 'ActionBar', name: 'Action bar', group: 'Layout',
    responsive: ["When the window is 640px wide or less, the bar is at least 56px tall instead of 64px, with 8px by 12px padding, a 14px heading, a 12px eyebrow and a 32px icon.", "The actions move under the text when there is no room for both side by side (the text keeps at least 280px)."],
    summary: 'Keeps a record\'s name and its main actions in reach at the bottom of long pages.',
    lead: 'A bar at least 64px tall: a 13px eyebrow and optional badge over a 16px semibold record name, buttons 8px apart on the right. Add `sticky` to pin it to the bottom of the scrolling area. With `tone="critical"` it explains a blocking error and offers the fix.',
    examples: [
      { title: 'Order actions', description: 'Badge in the `adornment` slot, extra content (an amount) in the default slot.',
        html: `<cm-action-bar eyebrow="#ODYOD0744">
  <cm-badge slot="adornment" tone="information">Order placed</cm-badge>
  <p style="margin:0;font-size:16px;font-weight:600">Amount payable: ₹2,234.00</p>
  <cm-button slot="actions" size="large">Cancel order</cm-button>
  <cm-button slot="actions" size="large">Mark as processing</cm-button>
  <cm-button slot="actions" size="large" variant="primary">Mark as paid</cm-button>
</cm-action-bar>` },
      { title: 'Record name', html: `<cm-action-bar eyebrow="Add product" heading="Brocato Mobster Golden TR90 Rimless Square Eyeglasses">
  <cm-button slot="actions" size="large">Cancel</cm-button>
  <cm-button slot="actions" size="large" variant="primary">Save</cm-button>
</cm-action-bar>` },
      { title: 'Blocking error', description: 'Says what is wrong and offers one button that fixes it.',
        html: `<cm-action-bar tone="critical" heading="Tax could not be calculated. Choose a tax rate for this order.">
  <cm-button slot="actions" size="large" variant="primary">Change tax rate</cm-button>
</cm-action-bar>` },
    ],
    do: ['Use it on long forms and order pages where the page header scrolls away.', 'Repeat the same actions as the page header, in the same order.', 'Give critical bars one action that fixes the problem.'],
    dont: ['Don\'t show more than three buttons; on phones keep one and move the rest into a menu.', 'Don\'t use it for unsaved changes: use the save bar.', 'Don\'t stack two action bars.'],
    content: ['Critical messages say what happened and what to do: "Tax could not be calculated. Choose a tax rate."', 'Button labels are verbs: "Mark as paid", not "Paid".'],
    a11y: ['A `region` named by the heading (or `label`), so screen-reader users can jump to it.', 'Critical headings have `role="alert"`, so they are announced when the bar appears or the text changes.', 'Text on the critical fill (`bg-error-bar`) meets 4.5:1 and the red icon meets 3:1, both themes (checked on every build).', 'The warning icon is the vector `alert` icon on a 36px white circle; on phones the extra buttons stay visible and wrap instead of moving into a "more" menu — compose that with an action menu when it ships.'],
    related: ['page-header', 'save-bar', 'banner'],
  },
  {
    slug: 'save-bar', tag: 'cm-save-bar', react: 'SaveBar', name: 'Save bar', group: 'Layout',
    responsive: ["The buttons move under the message when there is no room for both side by side (the message keeps at least 200px).", "When the window is 640px wide or less, the bar is at least 56px tall instead of 64px, with 8px by 12px padding and a 14px message."],
    summary: 'Asks the merchant to save or discard unsaved changes.',
    lead: 'A bar with a message, Discard and Save, hidden until there are unsaved changes. Set `open` yourself, or point `form` at a form\'s ID: the bar opens when a field changes, Save submits the form and Discard resets it. Both events are cancelable, so you can confirm or save with your own code instead. It sticks to the bottom of the scrolling area.',
    examples: [
      { title: 'Watching a form', description: 'Type in the field to open the bar. Discard puts the old value back.',
        html: `<form id="product-form" class="stack" onsubmit="event.preventDefault(); this.nextElementSibling.open = false">
  <cm-text-field label="Title" name="title" value="Ceramic mug"></cm-text-field>
</form>
<cm-save-bar form="product-form"></cm-save-bar>` },
      { title: 'Open, with your own handlers', description: 'Set `loading` while saving; `save-disabled` while the form has errors.',
        html: `<cm-save-bar open message="Do you want to save changes before closing?" discard-label="Cancel"></cm-save-bar>` },
    ],
    states: [
      { title: 'Saving', description: '`loading` while the request runs: Save shows a spinner and both buttons are blocked.',
        html: `<cm-save-bar open loading message="Unsaved changes"></cm-save-bar>` },
      { title: 'Save failed', description: 'Keep the bar open and everything typed; say what went wrong above the form.',
        html: `<div class="stack">
  <cm-banner tone="critical" heading="Changes couldn't be saved">The price must be more than 0. Fix it and save again.</cm-banner>
  <cm-save-bar open message="Unsaved changes"></cm-save-bar>
</div>` },
    ],
    do: ['Show it as soon as anything changes, and hide it after saving or discarding.', 'Keep the merchant on the page if they try to leave with unsaved changes.', 'Set `loading` while the save request runs.'],
    dont: ['Don\'t use it on pages that save straight away (toggles, for example).', 'Don\'t add other actions to it: use the action bar.', 'Don\'t show it alongside an action bar with its own Save button.'],
    content: ['The message is short: "Unsaved changes" or a question such as "Save changes before closing?".', 'Keep the labels "Save" and "Discard" unless the context needs "Cancel".'],
    a11y: ['The message is a `status` live region, so it is announced when the bar opens.', 'The bar is a `region` named by the message; buttons are real buttons in a sensible tab order (Discard, then Save).', 'While `loading`, Save shows a spinner with `aria-busy` and both buttons are blocked.', 'The bar is at least 64px tall with a 16px semibold message and large (40px) Discard and Save buttons 8px apart.'],
    related: ['page-header', 'action-bar', 'button'],
  },
  {
    slug: 'info-panel', tag: 'cm-info-panel', react: 'InfoPanel', name: 'Info panel', group: 'Layout',
    parts: [{ tag: 'cm-info-item', react: 'InfoItem' }],
    summary: 'Lists the facts about a record as label/value pairs, in the side column of detail pages.',
    lead: 'A card (about 380px in the side column) with a 16px semibold title, an optional underlined text action, and `cm-info-item`s: a 13px grey label over a 14px medium value. Values can be text, badges or tags. `half` puts two short facts on one line. For record pages (since 1.7), `variant="compact"` gives it a compact card\'s 16px padding and `layout="rows"` puts each label beside its value.',
    examples: [
      { title: 'Record details: compact rows', description: 'The Details card of a record page\'s 320px aside: `variant="compact"` (16px padding) and `layout="rows"` (13px label on the start side, 14px value beside it, 12px between rows). Since 1.7.',
        html: `<div style="max-width:320px">
<cm-info-panel heading="Details" action="Edit" action-label="Edit details" variant="compact" layout="rows">
  <cm-info-item label="Email"><a href="mailto:asha@example.com">asha@example.com</a></cm-info-item>
  <cm-info-item label="Phone">+91 98450 12345</cm-info-item>
  <cm-info-item label="Company">Rao Textiles</cm-info-item>
  <cm-info-item label="Lead source">Website form</cm-info-item>
  <cm-info-item label="Status"><cm-badge tone="attention">Qualified</cm-badge></cm-info-item>
</cm-info-panel>
</div>` },
      { title: 'Order details', html: `<div style="max-width:380px">
<cm-info-panel heading="Order details" action="Remove" action-label="Remove order details">
  <cm-info-item label="Ordered on">Mar 29, 2023 3:45 AM</cm-info-item>
  <cm-info-item label="Order status"><cm-badge tone="information">Order placed</cm-badge></cm-info-item>
  <cm-info-item label="Order type">Store pickup</cm-info-item>
  <cm-info-item label="Payment status"><cm-badge tone="success">Accepted</cm-badge></cm-info-item>
  <cm-info-item label="Transaction ID">098765432108976</cm-info-item>
  <cm-info-item label="SKU" half>OD673892</cm-info-item>
  <cm-info-item label="Inventory available" half>8202</cm-info-item>
  <cm-info-item label="Product tags">
    <cm-tag removable>Yellow</cm-tag><cm-tag removable>Cotton</cm-tag><cm-tag removable>Summer</cm-tag>
  </cm-info-item>
</cm-info-panel>
</div>` },
    ],
    states: [
      { title: 'Loading', description: 'Keep the heading; show skeleton lines for the values.',
        html: `<div style="max-width:380px"><cm-info-panel heading="Order details">
  <div aria-busy="true"><cm-skeleton lines="4"></cm-skeleton></div>
</cm-info-panel></div>` },
    ],
    do: ['Put it in the side column of detail pages, next to the main cards.', 'On record pages use `variant="compact" layout="rows"` in the aside.', 'Use `half` only for short values that fit side by side.', 'Name the header action with `action-label` when "Remove" alone is unclear.'],
    dont: ['Don\'t put form fields in it: use a card.', 'Don\'t use it for long text: values should be one line or a few tags.'],
    content: ['Labels are sentence-case nouns: "Ordered on", "Payment status".', 'Write values the way the merchant sees them elsewhere (same date format, same status words).'],
    a11y: ['The panel is a region named by its heading; the items are a list, each a list item, so screen readers announce "list, 8 items" and read each label before its value.', 'The header action is a real button; it fires `cm-action`.', 'The action is written in sentence case and underlined, and the panel takes the width you give it.'],
    related: ['card', 'badge', 'tag'],
  },
  {
    slug: 'accordion', tag: 'cm-accordion', react: 'Accordion', name: 'Accordion', group: 'Layout',
    responsive: ["The header row is at least 48px tall with 14px text and a 28px chevron circle at every width."],
    summary: 'Shows or hides extra detail under a row, inside side panels and cards.',
    lead: 'A 48px bordered row with 14px medium text and a 28px round chevron; the detail opens below a divider. Each accordion opens on its own; stack them `space-8` apart.',
    examples: [
      { title: 'Customer matches', html: `<div class="stack" style="gap:var(--cm-space-8);max-width:480px">
  <cm-accordion heading="Email and phone found in an abandoned cart">
    <p style="margin:0">Cart from 18-12-2022 · 3 items · Rs. 1,240</p>
  </cm-accordion>
  <cm-accordion heading="Email and phone found in 2 orders" open>
    <p style="margin:0">#NAYOD0736 · 20-12-2022<br>#NAYOD0741 · 02-01-2023</p>
  </cm-accordion>
</div>` },
    ],
    states: [
      { title: 'Disabled', description: 'Shown but can\'t be opened, for example while its contents load.',
        html: `<div style="max-width:480px"><cm-accordion heading="Email and phone found in 2 orders" disabled><p style="margin:0">#NAYOD0736</p></cm-accordion></div>` },
    ],
    do: ['Use it to tuck away detail that most merchants don\'t need.', 'Write the row so it says what is inside: "Found in 2 orders".', 'Set `heading-level` to fit the page outline.'],
    dont: ['Don\'t hide information needed to finish the task.', 'Don\'t nest accordions.', 'Don\'t use it for navigation: use tabs or links.'],
    content: ['Row text is a short statement in sentence case, no full stop.'],
    a11y: ['The row is a button inside a heading, with `aria-expanded` and `aria-controls`; the detail is a region labelled by the row.', 'Enter or Space opens and closes it; `cm-toggle` reports the new state.', 'The chevron rotation respects reduced motion.', 'Built from the written guidance in the design-system artifact; sizes follow the 1.5 scale.'],
    related: ['card', 'info-panel'],
  },
  {
    slug: 'empty-state', tag: 'cm-empty-state', react: 'EmptyState', name: 'Empty state', group: 'Feedback',
    responsive: ["The default tile is the same at every width. With `size=\"large\"`, when the window is 640px wide or less, the circle is 120px, as in the small size."],
    summary: 'Fills a list or page that has nothing in it yet, and offers the next step.',
    lead: 'Owner standard (1.6): a 48px icon tile with a 24px icon, a 16px semibold line saying what is missing, 13px supporting text and one 36px action, 8 to 12px apart, so an empty card stays compact. `size="large"` keeps the 160px illustration circle (120px on phones) for a first-run page with a real illustration; it was the default before 1.6. `size="small"` is a 120px circle and `size="inline"` one line of text.',
    examples: [
      { title: 'Default', description: 'A 48px icon tile, 16px heading, 13px text and a 36px action. Since 1.6.', html: `<cm-empty-state heading="No visits planned" icon="calendar">
  Plan a visit to see it here.
  <cm-button slot="actions" variant="primary">Plan a visit</cm-button>
</cm-empty-state>` },
      { title: 'Large illustration', description: '`size="large"`: the 160px circle (120px on phones), for a first-run page.', html: `<cm-empty-state size="large" heading="No products found">
  <cm-button slot="actions" variant="primary" size="large">Add product</cm-button>
</cm-empty-state>` },
      { title: 'Inside a card, with supporting text', html: `<cm-card heading="Orders" style="max-width:420px">
  <cm-empty-state size="small" icon="cart" heading="No orders yet">
    Orders appear here when customers check out.
    <cm-button slot="actions" variant="primary">Share your store</cm-button>
  </cm-empty-state>
</cm-card>` },
      { title: 'Inline, for an empty list inside a card', description: '`size="inline"` says "nothing here" in one or two left-aligned lines, with no circle and no extra height, so an empty card is no taller than a full one. The heading is bold, the supporting text follows it on the same line, an optional 20px `icon` sits in front (set `icon=""` for text only), and `action` adds one text action that fires `cm-action` (or is a link with `action-href`). Since 1.2.',
        html: `<div class="row" style="align-items:flex-start">
  <cm-card heading="Customer tasks" style="flex:1 1 260px;max-width:360px">
    <cm-empty-state size="inline" icon="tasks" heading="Nothing due today." heading-level="3" action="Add task">4 later.</cm-empty-state>
  </cm-card>
  <cm-card heading="Chats" style="flex:1 1 260px;max-width:360px">
    <cm-empty-state size="inline" icon="" heading="No chats waiting." heading-level="3"></cm-empty-state>
  </cm-card>
</div>` },
    ],
    do: ['Say what is missing and what to do next.', 'Inside a card, panel, table or list that sits next to full ones, use `size="inline"`: one line, at most one text action.', 'Offer one primary action; add a link only if there is a real second path.', 'Use your own illustration in the `image` slot or `image` attribute when you have one.'],
    dont: ['Don\'t use it for errors: use a critical banner.', 'Don\'t use it for search with no results without saying how to widen the search.', 'Don\'t show it while data is loading: use a skeleton.'],
    content: ['Heading in sentence case, no exclamation mark: "No products found".', 'Supporting text is one sentence about what will appear and when.'],
    a11y: ['The heading is a real heading (`heading-level`, default 2) so screen-reader users find it in the outline.', 'The illustration is decorative and hidden from assistive technology.', 'The circle shows a system icon (`icon`, default `box`); pass your own artwork in the `image` slot.'],
    related: ['skeleton', 'banner', 'button'],
  },
  {
    slug: 'toast', tag: 'cm-toast', react: 'Toast', name: 'Toast', group: 'Feedback',
    responsive: ["At most 480px wide, and never wider than the window minus 32px."],
    parts: [{ tag: 'cm-toast-region', react: 'ToastRegion' }],
    summary: 'A short confirmation at the bottom of the screen that goes away on its own.',
    lead: 'One sentence on a dark bar, bottom centre, 48px tall with an 8px radius: "Product saved". Show it with `showToast()`, which keeps one polite live region on the page so every toast is announced. It stays 5 seconds (10 with an action), and pauses while the pointer or focus is on it. For reversible actions, act at once and offer Undo in a toast instead of asking first: see [[Undo instead of confirm|/patterns/undo-instead-of-confirm]].',
    specs: [
      ['showToast(message, options)', '`options`: `tone`, `duration` (ms, 2000–10000), `action: { label, onAction }`, `root`. Returns the `cm-toast`, which is the handle: `dismiss()` closes it and `closed` is a promise of how it closed.'],
      ['toast.closed', 'Resolves once, when the toast closes: `action` (its action was pressed; `onAction` has run), `timeout`, `close` (Dismiss, Esc, `dismiss()` or `open = false`) or `removed` (taken off the page while showing, e.g. pushed out by a fourth toast or a page change).'],
      ['undoable(doIt, undoIt, options)', 'Runs `doIt` at once, then shows `options.message` with Undo (`undoLabel` to rename it); runs `undoIt` if Undo is pressed. Resolves with how the toast closed, after `undoIt` has finished. If `doIt` throws, no toast is shown and the promise rejects. Takes `tone`, `duration` and `root` too.'],
      ['Element', '`action-label` attribute (`actionLabel`) adds the action button; pressing it fires `cm-action` (cancelable) and then closes the toast with reason `action`. React: `<Toast actionLabel="Undo" onAction={…} onDismiss={…}>`; `showToast` and `undoable` are exported from `@commmerce/ui-react` too.'],
      ['Keyboard', 'In a toast region, F6 moves focus to the newest toast with an action (else the newest toast) and, pressed again, back to where it was. Esc closes the focused toast. When a focused toast closes, focus goes back to where it was. `region.focusToast()` does the same as F6, for another shortcut.'],
      ['Sizes', 'Bar at least 48px tall, up to 480px wide. Action and Dismiss are slim 32px buttons inside it; on touch screens they are drawn 40px with a 44px hit area.'],
    ],
    examples: [
      { title: 'Show a toast', description: 'Call `showToast(message, { tone, duration, action })`. Each button here calls it.',
        html: `<div class="row">
  <cm-button data-toast="Product saved">Save product</cm-button>
  <cm-button data-toast="Order archived" data-toast-action="Undo">Archive order</cm-button>
  <cm-button data-toast="Couldn't save product. Check your connection." data-toast-tone="critical">Fail to save</cm-button>
</div>` },
      { title: 'Default', description: 'A toast element on its own carries its own live region; set `open` to show it again.',
        html: `<cm-toast message="Product saved" duration="10000"></cm-toast>` },
      { title: 'With an action', html: `<cm-toast message="3 orders archived" action-label="Undo" duration="10000"></cm-toast>` },
      { title: 'Critical', description: 'Also show the error where it happened: a toast disappears, so it must never be the only place.',
        html: `<cm-toast tone="critical" message="Couldn't save product" duration="10000"></cm-toast>` },
    ],
    stateTable: [
      ['Default', 'Dark bar (`bg-dashboard`, `text-on-dark`), message, then the action (underlined, 600 weight) and Dismiss; critical tone uses the error tint with an alert icon.'],
      ['Hover', 'A button under the pointer gets a light wash; hovering anywhere on the toast pauses its timer.'],
      ['Focus-visible', '2px ring around the focused button, in `text-on-dark` (`border-strong` on critical toasts). Focus anywhere in the toast pauses its timer; F6 brings focus here from the page.'],
      ['Pressed', 'Pressing the action fires `cm-action`, runs `onAction` and closes the toast (`closed` resolves `action`); focus goes back to where it was.'],
      ['Selected', 'Not applicable: a toast has no selected state.'],
      ['Disabled', 'Not applicable: if the action can\'t run any more, close the toast (`dismiss()`) rather than disable its button.'],
      ['Loading', 'Not applicable: run the work first and show the toast when it is done; for long work use a progress bar.'],
      ['Timed out', 'Closes after `duration` of time not hovered or focused (5 s, 10 s with an action); `closed` resolves `timeout`.'],
    ],
    do: ['Confirm something the merchant just did: "Product saved", "Order archived".', 'Offer Undo for actions that are easy to reverse (archive, mark done, move, remove from a list), and don\'t ask first: [[Undo instead of confirm|/patterns/undo-instead-of-confirm]].', 'Use `showToast()` so toasts stack in one place and are announced.'],
    dont: ['Don\'t use a toast as the only sign of an error: show the error next to what failed (a banner or field error) too.', 'Don\'t put essential information or links the merchant must follow in a toast.', 'Don\'t show more than one toast for one action.', 'Don\'t offer Undo for something that can\'t be undone (a sent email, a real delete): ask first with a modal instead.'],
    content: ['Noun and past-tense verb: "Product saved", not "Your product has been saved successfully!".', 'About 50 characters at most, one sentence, no full stop for confirmations.', 'Action labels are one verb: "Undo", "View".', 'With Undo, say what happened in the past tense: "Lead archived", "3 tasks marked done".'],
    a11y: ['`showToast()` adds toasts to `cm-toast-region`, a polite `role="status"` region, so screen readers announce them without moving focus.', 'Hovering or focusing a toast pauses its timer; it never closes in under 2 seconds, and stays 10 seconds when it has an action.', 'Keyboard: F6 moves focus to the newest toast\'s action (`aria-keyshortcuts="F6"`) and F6 again goes back; Esc closes the focused toast; focus returns to where it was when the toast closes, so it is never lost. A toast with an action ends with visually hidden text, "Press F6 to reach it." (built-in string `toast.shortcut`; set it to an empty string to leave it out).', 'The Dismiss and action buttons are real buttons with visible focus rings; text is white on black (or black on the error tint) and meets 4.5:1 in both themes.'],
    related: ['banner', 'spinner', 'progress-bar'],
  },
  {
    slug: 'spinner', tag: 'cm-spinner', react: 'Spinner', name: 'Spinner', group: 'Feedback',
    summary: 'Shows that something is loading when the wait is short or of unknown length.',
    lead: 'A turning arc: 20px (`small`) inside buttons, rows and fields, 44px (`large`) for a section. The arc is `border-strong` on a `border-subtle` track. A product can show its own graphic in place of the arc (since 1.12).',
    examples: [
      { title: 'Sizes', html: `<div class="row" style="align-items:center;gap:var(--cm-space-32)">
  <cm-spinner size="large"></cm-spinner>
  <cm-spinner size="small"></cm-spinner>
</div>` },
      { title: 'Loading a section', description: 'Mark the region busy and name what is loading.',
        html: `<cm-card heading="Recent orders">
  <div aria-busy="true" style="display:flex;justify-content:center;padding:var(--cm-space-32)">
    <cm-spinner accessible-label="Loading recent orders"></cm-spinner>
  </div>
</cm-card>` },
      { title: 'Your own graphic', description: 'Since 1.12. Put a decorative graphic inside to show it instead of the arc: the spinner keeps the status, the label and the height (12px small, 20px large). The graphic animates itself with `--cm-spinner-duration` and `--cm-spinner-play-state`, which pauses it under reduced motion. Commmerce products use this for the Commmerce loader from Commmerce Brand Assets; the loader itself is not part of Commmerce UI.',
        html: `<style>
  .demo-bars rect { fill: currentColor; animation: demo-pulse var(--cm-spinner-duration) ease-in-out infinite; animation-play-state: var(--cm-spinner-play-state); }
  .demo-bars rect:nth-child(2) { animation-delay: calc(var(--cm-spinner-duration) / 6); }
  .demo-bars rect:nth-child(3) { animation-delay: calc(var(--cm-spinner-duration) / 3); }
  @keyframes demo-pulse { 0%, 60%, 100% { opacity: 1; } 30% { opacity: .3; } }
</style>
<div class="row" style="align-items:center;gap:var(--cm-space-32)">
  <cm-spinner size="large" accessible-label="Loading orders">
    <svg class="demo-bars" viewBox="0 0 44 20" aria-hidden="true"><rect width="12" height="20" rx="2"/><rect x="16" width="12" height="20" rx="2"/><rect x="32" width="12" height="20" rx="2"/></svg>
  </cm-spinner>
  <cm-spinner size="small">
    <svg class="demo-bars" viewBox="0 0 44 20" aria-hidden="true"><rect width="12" height="20" rx="2"/><rect x="16" width="12" height="20" rx="2"/><rect x="32" width="12" height="20" rx="2"/></svg>
  </cm-spinner>
</div>` },
    ],
    do: ['Use it for waits of about 1 to 10 seconds where the length is unknown.', 'Name what is loading with `accessible-label` when there is more than one on the page.', 'Use a button\'s own `loading` state for button actions.', 'With your own graphic, mark it `aria-hidden="true"`, draw it in `currentColor` and run its animation on `--cm-spinner-duration` and `--cm-spinner-play-state`.'],
    dont: ['Don\'t use it for a whole page\'s first load: use a skeleton display.', 'Don\'t use it when you know how far along the task is: use a progress bar.', 'Don\'t show several spinners for one task.', 'Don\'t put the Commmerce logo or loader in an app you build for the admin: apps embedded in the admin keep the arc.'],
    content: ['The label is "Loading" or "Loading <thing>": no ellipsis, no "please wait".'],
    a11y: ['A `role="status"` with hidden text, so the label is announced; the graphic is hidden from screen readers.', 'The arc meets 3:1 against the page and card backgrounds in both themes.', 'Under reduced motion it turns three times slower; a slotted graphic gets `--cm-spinner-play-state: paused`.', 'A slotted graphic is coloured by the spinner\'s `color` (`border-strong` by default, which meets 3:1); if you change it, keep 3:1 against the background.'],
    related: ['progress-bar', 'skeleton', 'button'],
  },
  {
    slug: 'progress-bar', tag: 'cm-progress-bar', react: 'ProgressBar', name: 'Progress bar', group: 'Feedback',
    summary: 'Shows how far a longer task has got, such as an import or a bulk update.',
    lead: 'A label above an 8px (`medium`) or 4px (`small`) rounded track in `bg-inset`, filled with `action-primary`. Without a `value` it is indeterminate: a segment slides along the track.',
    examples: [
      { title: 'Determinate', html: `<cm-progress-bar label="Importing 1,240 products" value="62" show-value style="max-width:520px"></cm-progress-bar>` },
      { title: 'Indeterminate', description: 'Leave out `value` when you can\'t tell how far along it is.',
        html: `<cm-progress-bar label="Syncing inventory with your stores" style="max-width:520px"></cm-progress-bar>` },
      { title: 'Small, in a card', html: `<cm-card heading="Bulk price update">
  <div class="stack">
    <p style="margin:0">Updating 350 products. You can leave this page.</p>
    <cm-progress-bar label="Bulk price update" label-hidden size="small" value="30"></cm-progress-bar>
  </div>
</cm-card>` },
    ],
    states: [
      { title: 'Finished', description: 'At 100%, replace the bar with the result (a banner or toast) rather than leaving it full.',
        html: `<cm-progress-bar label="Importing 1,240 products" value="100" show-value style="max-width:520px"></cm-progress-bar>` },
    ],
    do: ['Use it for tasks over about 10 seconds, and say what is happening in the label.', 'Update `value` at least every few seconds, so it never looks stuck.', 'Tell the merchant whether they can leave the page.'],
    dont: ['Don\'t use it for short waits: use a spinner.', 'Don\'t let a determinate bar go backwards.'],
    content: ['Label in the present continuous with the amount: "Importing 1,240 products".'],
    a11y: ['A WAI-ARIA `progressbar` named by its label, with `aria-valuenow` (0–100) when determinate and no value when indeterminate.', '`label-hidden` keeps the name for screen readers when the text around it already says what is running.', 'The fill meets 3:1 against the track and page in both themes; under reduced motion the indeterminate segment moves three times slower.'],
    related: ['spinner', 'toast', 'banner'],
  },
  {
    slug: 'skeleton', tag: 'cm-skeleton', react: 'Skeleton', name: 'Skeleton', group: 'Feedback',
    summary: 'Grey placeholder shapes shown where content is loading.',
    lead: 'Lines, square thumbnails (34, 40, 50 or 186px) and blocks in `bg-input-filled`, pulsing gently to `thumb-bg`.',
    examples: [
      { title: 'Product row loading', html: `<div aria-busy="true" style="display:flex;gap:var(--cm-space-12);align-items:center;max-width:520px">
  <cm-skeleton variant="thumbnail" size="large"></cm-skeleton>
  <cm-skeleton lines="2" style="flex:1"></cm-skeleton>
</div>` },
      { title: 'Thumbnail sizes', html: `<div style="display:flex;gap:var(--cm-space-20);align-items:flex-end;flex-wrap:wrap">
  <cm-skeleton variant="thumbnail" size="xlarge"></cm-skeleton>
  <cm-skeleton variant="thumbnail" size="large"></cm-skeleton>
  <cm-skeleton variant="thumbnail" size="medium"></cm-skeleton>
  <cm-skeleton variant="thumbnail" size="small"></cm-skeleton>
</div>` },
      { title: 'Block', html: `<cm-skeleton variant="block" style="--cm-skeleton-height:90px;max-width:520px"></cm-skeleton>` },
    ],
    do: ['Match the shape of the content that will replace it.', 'Mark the loading region with `aria-busy="true"` and remove it when content arrives.', 'Use `cm-skeleton-display` for a whole page.'],
    dont: ['Don\'t use skeletons for actions that take under a second.', 'Don\'t mix skeletons and spinners for the same content.'],
    content: ['Skeletons carry no text.'],
    a11y: ['Each skeleton is `aria-hidden`; announce loading on the region (`aria-busy`) or with `cm-skeleton-display`.', 'The pulse stops under reduced motion; in forced-colours mode the shapes get an outline.', 'Shapes are decorative, so they are not part of the contrast checks.'],
    related: ['skeleton-display', 'empty-state'],
  },
  {
    slug: 'skeleton-display', tag: 'cm-skeleton-display', react: 'SkeletonDisplay', name: 'Skeleton display', group: 'Feedback',
    responsive: ["When the window is 768px wide or less, the navigation column is hidden, the body is one column and the header placeholder is 60px tall instead of 80px."],
    summary: 'A whole-page loading placeholder laid out like a detail page.',
    lead: 'An 80px page-header bar, then a main column (472, 90, 90 and 251px cards) and a 30% side column (five cards), 8px apart. On mobile the columns stack.',
    examples: [
      { title: 'Detail page', html: `<cm-skeleton-display style="max-width:760px"></cm-skeleton-display>` },
      { title: 'One column', html: `<cm-skeleton-display layout="one-column" style="max-width:760px"></cm-skeleton-display>` },
    ],
    do: ['Show it only for the first load of a page; later updates should keep the old content visible.', 'Pick the layout closest to the page that will load.'],
    dont: ['Don\'t use `navigation` in apps: the side navigation is admin chrome, for Commmerce products only.', 'Don\'t leave it up if loading fails: replace it with an error banner.'],
    content: ['Change `label` if "Loading" is too vague, e.g. "Loading order".'],
    a11y: ['Announces its `label` once through a status region and sets `aria-busy`; the shapes are hidden.', 'Pulse stops under reduced motion.', 'Card widths are 70/30 of the space, and the 250px navigation placeholder is opt-in.'],
    related: ['skeleton', 'page-header'],
  },
  {
    slug: 'comment', tag: 'cm-comment-box', react: 'CommentBox', name: 'Comment', group: 'Feedback',
    responsive: ["When the window is 640px wide or less, the text area starts 96px tall instead of 128px, and the post button moves to the end of the row."],
    parts: [{ tag: 'cm-comment', react: 'Comment' }],
    summary: 'Staff notes on an order or customer: a box to write one and the timeline of earlier ones.',
    lead: 'A 16px semibold "Comments" heading, a 128px text box and a primary "Post comment" button, 12px apart. Each comment is a bordered 6px-radius box with the time, the text and the author, 12px padding and 8px between comments.',
    examples: [
      { title: 'Order comments', html: `<cm-comment-box style="max-width:720px">
  <cm-comment author="Robinson Painatillo" datetime="2023-02-09T17:07" time="09-02-2023 05:07 PM">Order status changed from processing to partially fulfilled.</cm-comment>
  <cm-comment author="System" datetime="2023-02-09T16:40" time="09-02-2023 04:40 PM">Order cancelled: the payment confirmation period is over.</cm-comment>
</cm-comment-box>` },
      { title: 'A single comment', html: `<cm-comment author="Robinson Painatillo" datetime="2023-02-09T17:07" style="max-width:400px">Called the customer about the delivery address.</cm-comment>` },
    ],
    states: [
      { title: 'Posting', description: 'Set `disabled` while a comment saves, so it isn\'t posted twice.',
        html: `<cm-comment-box disabled value="Called the customer about the delivery address." style="max-width:720px"></cm-comment-box>` },
      { title: 'No comments yet', description: 'An empty box with only the text field is enough; no empty-state message needed.',
        html: `<cm-comment-box style="max-width:720px"></cm-comment-box>` },
    ],
    do: ['Listen for `cm-submit`, save the text, then add a `cm-comment` for it. Call `preventDefault()` to keep the text if saving fails.', 'Set `disabled` while a comment saves.', 'Give `datetime` in ISO format so screen readers and browsers get the exact time.'],
    dont: ['Don\'t use comments for system errors: use a banner.', 'Don\'t edit a posted comment in place without saying so.'],
    content: ['Button: "Post comment".', 'Author is a person\'s name, "System" or the app\'s name.'],
    a11y: ['The box is a section named by its heading; the text box has its own label ("Add a comment").', 'Ctrl/⌘ + Enter posts; an empty box does not post and keeps focus in the box.', 'Comments inside the box form a list; each time is a `<time datetime>`.', 'Time and author are 12px `text-tertiary` (4.5:1 or more); the text box uses the `border-input` edge for contrast.'],
    related: ['text-field', 'card', 'info-panel', 'timeline'],
  },
  {
    slug: 'smart-tip', tag: 'cm-smart-tips', react: 'SmartTips', name: 'Smart tip', group: 'Feedback',
    parts: [{ tag: 'cm-smart-tip', react: 'SmartTip' }],
    summary: 'Short linked tips that lead merchants to guides, with an optional tour banner.',
    lead: 'A dark tour banner at least 56px tall, then a white card titled "Smart tips" with tip cards at least 88px tall: a 14px semibold title, a 13px grey description and a 32px round arrow that turns black on hover and focus.',
    examples: [
      { title: 'Home page tips', html: `<cm-smart-tips tour-heading="Take a tour of Commmerce" style="max-width:340px">
  <cm-smart-tip heading="Manage your own online store" href="#/components/smart-tip">Handle shipping, taxes, payments and more in one place.</cm-smart-tip>
  <cm-smart-tip heading="Shipping and delivery" href="#/components/smart-tip">Set rates and delivery areas.</cm-smart-tip>
  <cm-smart-tip heading="Importing and exporting products" href="#/components/smart-tip">Move products in and out with a CSV file.</cm-smart-tip>
</cm-smart-tips>` },
    ],
    do: ['Keep three to six tips, most useful first.', 'Write the title as the outcome: "Shipping and delivery".', 'Use `target="_blank"` only for help-centre pages outside the admin.'],
    dont: ['Don\'t put actions that change data in a tip: link to the page that does it.', 'Don\'t show the tour banner after the merchant has taken the tour.'],
    content: ['Titles at most two short lines; descriptions one or two lines.', 'The section title is "Smart tips", in sentence case.'],
    a11y: ['Each tip is one link, so it is one tab stop and its name is the title plus description.', 'Tips form a list inside a section named by its heading.', 'Links opening a new tab say so to screen readers.', 'The tour icon is the system `rocket` icon; the tour banner uses `bg-panel-header`.'],
    related: ['card', 'banner'],
  },
  {
    slug: 'pagination', tag: 'cm-pagination', react: 'Pagination', name: 'Pagination', group: 'Lists',
    responsive: ["When the window is 640px wide or less, rows per page and the \"Showing…\" summary are hidden: only the page field and the previous and next arrows remain, the arrows at either end, 36px tall instead of 32px.", "On touch screens (any width) the fields and arrows are 44px."],
    summary: 'Moves through a long list or table one page at a time.',
    lead: 'A 48px bar under a list or table, in 13px text and tabular numbers: "Number of rows" on the left, what is showing in the middle, and "Page [n] of N" with compact 32px previous and next arrows on the right. On phones (640px or less) only the page field and arrows remain, 36px tall; on touch screens the fields and arrows are 44px. Since 1.6 (before: 14px text in a 52px bar).',
    examples: [
      { title: 'Under a product list', html: `<cm-pagination total="290" page="2" page-size="20" resource-name="products"></cm-pagination>` },
      { title: 'Without rows per page', description: 'Set `page-sizes="[]"` when the page size is fixed.', html: `<cm-pagination total="58" page-size="20" page-sizes="[]" style="max-width:480px"></cm-pagination>` },
    ],
    do: ['Listen for `cm-page-change` and `cm-page-size-change`, load that page, then set `page` and `total`.', 'Keep the merchant\'s page and rows per page in the URL so Back works.', 'Put it directly under the list it controls.'],
    dont: ['Don\'t use it for fewer than one page of items: hide it.', 'Don\'t use it inside a modal or picker with a few items: let the list scroll.'],
    content: ['Summary reads "Showing 21–40 of 290 products"; set `resource-name` to the plural noun.', 'Labels are "Number of rows" and "Page … of …".'],
    a11y: ['It is a navigation landmark named "Pagination"; give each one a different `label` if a page has two.', 'The summary is a polite live region, so screen readers hear the new range after a page change.', 'The page field takes a number and commits on Enter or when it loses focus; out-of-range numbers are clamped. Escape restores the current page.', 'Arrows are real buttons named "Previous page" and "Next page", disabled at the ends.', 'The rows and page fields use the `border-input` edge (3:1 or more); the bar has no shadow of its own (put it in a card).'],
    related: ['resource-list', 'table-header', 'status-tabs'],
  },
  {
    slug: 'status-tabs', tag: 'cm-status-tabs', react: 'StatusTabs', name: 'Status tabs', group: 'Lists',
    responsive: ["Tabs stay on one line; when they don't fit the component's width, the row scrolls sideways, snaps to a tab and fades out at the edge that has more tabs past it (since 1.6), so it reads as a row that scrolls.", "When the window is 640px wide or less, tabs are `space-16` apart instead of `space-24`. With `mobile=\"select\"` they become a dropdown of the same choices (with counts) instead (since 1.6)."],
    summary: 'Filters a list by status, with a count for each status.',
    lead: 'Statuses in a 40px row of 14px medium labels, `space-24` apart, over a hairline. The chosen one is black and semibold with a 2px underline (black, or Commmerce blue in the [[refined look|/start/themes?s=looks]]); the others are grey. A count sits after the label in a small neutral pill. `size="small"` (13px, 32px row) is for view switches inside a card. Since 1.5 (before: 18px labels with counts in brackets).',
    examples: [
      { title: 'Order statuses', html: `<cm-status-tabs controls="order-list">
  <option value="all" count="233">All</option>
  <option value="unprocessed" count="23" selected>Unprocessed</option>
  <option value="processing" count="23">Processing</option>
  <option value="fulfilled" count="23">Fulfilled</option>
  <option value="delivered" count="23">Delivered</option>
  <option value="returned" count="23">Returned</option>
  <option value="cancelled" count="23">Cancelled</option>
</cm-status-tabs>` },
      { title: 'On phones: a dropdown', description: '`mobile="select"` shows the statuses as a dropdown when the window is 640px wide or less (try a phone width); wider, it is the usual row. It fires the same `change` event. Use it when there are more than four or five statuses. Since 1.6.',
        html: `<cm-status-tabs mobile="select" aria-label="Task status">
  <option value="date" count="4" selected>Needs a date</option>
  <option value="week" count="12">This week</option>
  <option value="later" count="40">Later</option>
  <option value="lost" count="2">Not interested</option>
  <option value="archived">Archived</option>
</cm-status-tabs>` },
      { title: 'Small, inside a card', html: `<cm-card heading="Reviews" style="max-width:420px">
  <cm-status-tabs size="small">
    <option value="newest" count="233">Newest</option>
    <option value="highest" count="33">Highest rating</option>
    <option value="lowest">Lowest rating</option>
  </cm-status-tabs>
</cm-card>` },
    ],
    do: ['Put it directly above the list it filters and set `controls` to the list\'s id.', 'Start with "All".', 'Update counts when the list changes.'],
    dont: ['Don\'t use it to move between pages: use links or a page header.', 'Don\'t use it for more than about eight statuses; use a filter instead.', 'Don\'t hide a status with zero items; show a count of 0.'],
    content: ['One or two words per status, in sentence case.', 'Counts are whole numbers; they are formatted for the merchant\'s locale.'],
    a11y: ['It is an ARIA tab list: one tab stop, ←/→ move and select, Home/End jump to the ends. Disabled tabs are skipped.', 'Each tab\'s name includes its count, so screen readers hear "Unprocessed, 23, tab, 2 of 7".', 'The chosen tab is marked with `aria-selected`, not only colour and underline.', 'Differs from Figma: unselected tabs are `text-tertiary` (#707070) because Figma\'s #9E9E9E is 2.7:1 on white; Figma\'s mobile row is fixed width, ours scrolls sideways.'],
    related: ['resource-list', 'pagination', 'option-group'],
  },
  {
    slug: 'table-header', tag: 'cm-table-header', react: 'TableHeader', name: 'Table header', group: 'Lists',
    summary: 'The grey label bar at the top of a table or list, with sorting and select all.',
    lead: 'A 40px `bg-hover` bar with a `border-subtle` edge and rounded top corners, the heading row of the table standard. Column names are 12px semibold `text-tertiary`, in sentence case; with `selectable` a 20px select-all box leads the row. In a resource list the bar runs edge to edge with hairlines above and below, as tall as the list\'s selection row. Rows below share its grid through `--cm-table-columns`. Since 1.6 (before: 32px, 12px medium).',
    examples: [
      { title: 'Products table', html: `<div role="table" aria-label="Products" style="--cm-table-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1fr 80px">
  <cm-table-header sort="price">
    <option value="product" sortable>Product</option>
    <option value="sku">SKU</option>
    <option value="code">Code</option>
    <option value="price" sortable>Selling price</option>
    <option value="stock" sortable>Stock</option>
    <option value="category">Category</option>
    <option value="status">Status</option>
    <option value="action" align="end">Action</option>
  </cm-table-header>
</div>` },
      { title: 'With select all, on a phone', html: `<div role="table" aria-label="Products" style="max-width:384px;--cm-table-columns: 2fr 1fr 1fr 1fr">
  <cm-table-header selectable indeterminate>
    <option>Product name</option><option>SKU</option><option>Code</option><option align="end">Price</option>
  </cm-table-header>
</div>` },
      { title: 'In a resource list', description: 'Put it in the `header` slot of a `cm-resource-list` and give each row `columns`, with one element per column. The list lines the headings up with the cells, leaving room for the rows\' checkboxes when it is `selectable`. Don\'t set `selectable` on the header here: the list puts its own select-all box in the header\'s checkbox column. The headings form a plain bar (the rows are a list, not a table), and sort buttons say their state.',
        html: `<cm-resource-list selectable resource-name="lead" style="--cm-table-columns: 1.4fr 1.2fr 1fr 110px">
  <cm-table-header slot="header" sort="name">
    <option value="name" sortable>Name</option><option value="company">Company</option><option value="owner">Owner</option><option value="status">Status</option>
  </cm-table-header>
  <cm-resource-item value="l1" label="Asha Rao" columns><strong>Asha Rao</strong><span>Rao Textiles</span><span>Rahul Kumar</span><span><cm-badge tone="information">New</cm-badge></span></cm-resource-item>
  <cm-resource-item value="l2" label="Ben Cole" columns><strong>Ben Cole</strong><span>Cole &amp; Sons</span><span>Meera Iyer</span><span><cm-badge tone="success">Contacted</cm-badge></span></cm-resource-item>
</cm-resource-list>` },
    ],
    do: ['Put it inside an element with `role="table"` (or a `<table>` wrapper) so it becomes a real header row.', 'Set `--cm-table-columns` once on the table and use the same grid for the rows, with `column-gap: var(--cm-space-20)` and `min-width: 0` on the cells (or `fr` columns written `minmax(0, 1fr)`).', 'Above a `cm-resource-list`, put it in the list\'s `header` slot and set `columns` on the rows: the list lines everything up, checkbox column included.', 'Listen for `cm-sort`, sort the data, then set `sort` and `direction`.'],
    dont: ['Don\'t make every column sortable: only those merchants scan by (name, price, stock, date).', 'Don\'t leave an icon-only column unnamed: add an option with `hidden` so screen readers hear "Actions".', 'Don\'t set `selectable` on a header inside a selectable `cm-resource-list`: there would be two select-all boxes. The list already puts one in the header\'s checkbox column.', 'Don\'t use the rows\' `actions` or `media` slots with column headings: put buttons and thumbnails in a column instead, so the grid stays the same width as the header.'],
    content: ['Column names in sentence case, one or two words: "Selling price", not "Selling Price".'],
    a11y: ['Inside a table it renders `row` and `columnheader` roles; sorted columns carry `aria-sort`.', 'Outside a table it is a plain bar and sort buttons say "sortable" or "sorted ascending/descending".', 'The select-all box is named "Select all" and shows a mixed state when some rows are selected.', 'In a `cm-resource-list` it stays a plain bar: the rows are a list of resources, not table rows, so the headings are a visual guide and each row\'s checkbox and link carry its name.', 'The fill is `bg-hover`; sort arrows appear on hover and on the sorted column.'],
    related: ['resource-list', 'pagination', 'checkbox', 'data-table'],
  },
  {
    slug: 'data-table', tag: 'cm-data-table', react: 'DataTable', name: 'Data table', group: 'Lists',
    responsive: ["Judged by the table's own width, not the window's: at 640px or less the table follows its `mobile` strategy. `scroll` (default): it keeps every column and scrolls sideways, with a faded edge and \"Scroll for more\" under it while there is more to see. `cards`: each row becomes a card. `priority`: `priority: 'low'` columns are hidden and each row gets \"View all fields\". See [[Tables on phones|/patterns/tables-on-phones]].", "With `sticky-first-column`, the first column stays visible while the table scrolls sideways.", "On touch screens rows are at least 44px tall and row actions are always shown."],
    summary: 'Shows numbers and facts in rows and columns, for reports and lists of records.',
    lead: 'A real table built to the Commmerce table standard (since 1.6): a 40px heading row in 12px semibold `text-tertiary` on `bg-hover`; 48px body rows (40px compact) divided by `border-subtle` lines; cells padded 12px across and 10px down in 13px text and tabular figures. `numeric`, `money` and `actions` columns are right-aligned, numbers and dates never wrap, and text ends in "…" with the full value on hover. Columns can sort, resize and be shown or hidden; rows can carry actions; the heading row can stick while the page scrolls; and on phones each table picks cards, sideways scroll or priority columns.',
    specs: [
      ['Heading row', '40px tall; 12px / 600, `text-tertiary`, on `bg-hover` with `border-subtle` above and below and `radius-md` top corners. Labels never wrap.'],
      ['Body rows', '48px (`density="compact"`: 40px). At least 44px on touch screens at either density. `border-subtle` between rows; `bg-hover` on hover.'],
      ['Cells', '12px padding across, 10px down; 13px / 18px text in tabular figures. The first (or `primary`) column is the row header.'],
      ['Alignment', 'Text and dates start-aligned; `numeric`, `money` and `actions` end-aligned (right in left-to-right languages). Override with `align`.'],
      ['Wrapping', '`numeric`, `money` and `date` never wrap. Text stays on one line and ends in "…" past `--cm-data-table-cell-max-width` (320px, and at most 45% of the table\'s width) or the column\'s `width`; the full value shows on hover (`title`) and is always read by screen readers.'],
      ['Density', '`density` on the table, or `data-cm-density="compact"` on any ancestor for a whole screen. Custom property: `--cm-table-row-height`.'],
    ],
    examples: [
      { title: 'Sales report with totals', description: 'Give it `columns`, `rows` and `totals`. `numeric` and `money` columns align right; sortable columns sort themselves.',
        html: `<cm-data-table caption="Sales by day, 1 to 5 November" sort="day"
  columns='[{"key":"day","label":"Day","type":"date","sortable":true},{"key":"orders","label":"Orders","type":"numeric","sortable":true},{"key":"items","label":"Items sold","type":"numeric"},{"key":"sales","label":"Net sales","type":"money","sortable":true}]'
  rows='[{"day":"2026-11-01","orders":38,"items":61,"sales":"Rs. 48,210"},{"day":"2026-11-02","orders":45,"items":70,"sales":"Rs. 56,980"},{"day":"2026-11-03","orders":29,"items":41,"sales":"Rs. 33,150"},{"day":"2026-11-04","orders":52,"items":88,"sales":"Rs. 71,400"},{"day":"2026-11-05","orders":41,"items":66,"sales":"Rs. 52,075"}]'
  totals='{"day":"Total","orders":205,"items":326,"sales":"Rs. 2,61,815"}'></cm-data-table>` },
      { title: 'Accounts with row actions', description: 'An `actions` column (`type: "actions"`) lists buttons for every row; they appear when the row is hovered or has keyboard focus, and are always shown on touch screens (`row-actions="always"` shows them everywhere). Each button is named with its row for screen readers ("Open, Ravi Stores") and fires `cm-row-action` with the action, the row and its index. The long account name ends in "…": hover it to read it all.',
        html: `<cm-data-table caption="Accounts up for renewal"
  columns='[{"key":"name","label":"Account","sortable":true,"width":220},{"key":"owner","label":"Owner"},{"key":"value","label":"Value","type":"money","sortable":true},{"key":"actions","label":"Actions","type":"actions","actions":[{"label":"Open","value":"open"},{"label":"Snooze","value":"snooze","icon":"clock","iconOnly":true}]}]'
  rows='[{"name":"Ravi Stores","owner":"Asha Rao","stage":"Renewal call booked","renewal":"2026-12-01","value":"Rs. 48,000"},{"name":"Blue Pottery House, Jaipur and Udaipur showrooms","owner":"Meera Iyer","stage":"Waiting for the owner","renewal":"2026-12-09","value":"Rs. 1,20,000"},{"name":"Delhi Spice Co.","owner":"Rahul Kumar","stage":"Asked for a discount","renewal":"2027-01-15","value":"Rs. 9,500"}]'></cm-data-table>` },
      { title: 'Comfortable and compact density', description: 'Rows are 48px (comfortable) or 40px (compact); the heading row stays 40px. Set `density` on one table, or `data-cm-density` on any ancestor to switch every table and resource list on a screen. Try the switch.',
        html: `<div style="display:grid;gap:var(--cm-space-16)">
  <cm-segmented-control size="small" label="Density" data-density-for="density-demo">
    <option value="comfortable" selected>Comfortable</option>
    <option value="compact">Compact</option>
  </cm-segmented-control>
  <div id="density-demo" data-cm-density="comfortable" style="display:grid;gap:var(--cm-space-16)">
    <cm-data-table caption="Accounts" caption-hidden
      columns='[{"key":"name","label":"Account","sortable":true},{"key":"owner","label":"Owner"},{"key":"renewal","label":"Renewal","type":"date"},{"key":"value","label":"Value","type":"money"}]'
      rows='[{"name":"Ravi Stores","owner":"Asha Rao","stage":"Renewal call booked","renewal":"2026-12-01","value":"Rs. 48,000"},{"name":"Blue Pottery House, Jaipur and Udaipur showrooms","owner":"Meera Iyer","stage":"Waiting for the owner","renewal":"2026-12-09","value":"Rs. 1,20,000"},{"name":"Delhi Spice Co.","owner":"Rahul Kumar","stage":"Asked for a discount","renewal":"2027-01-15","value":"Rs. 9,500"}]'></cm-data-table>
    <cm-resource-list resource-name="account">
      <cm-resource-item value="a1"><cm-thumbnail slot="media" alt=""></cm-thumbnail>Ravi Stores</cm-resource-item>
      <cm-resource-item value="a2"><cm-thumbnail slot="media" alt=""></cm-thumbnail>Delhi Spice Co.</cm-resource-item>
    </cm-resource-list>
  </div>
</div>` },
      { title: 'Sticky heading row in a 400px box', description: '`sticky-header` keeps the headings in view under the top of the nearest scrolling box, or of the page when nothing else scrolls (add `--cm-data-table-sticky-top` to stick under an app header). Scroll the box. To scroll inside the table itself, set `--cm-data-table-max-height`.',
        html: `<div tabindex="0" role="region" aria-label="Renewals, scrolling" style="height:400px;overflow:auto;border:var(--cm-border-1) solid var(--cm-border-subtle);border-radius:var(--cm-radius-md);padding-inline:var(--cm-space-8)">
  <cm-data-table caption="All renewals" sticky-header
    columns='[{"key":"name","label":"Account","sortable":true},{"key":"owner","label":"Owner"},{"key":"renewal","label":"Renewal","type":"date"},{"key":"value","label":"Value","type":"money"}]'
    rows='[{"name":"Ravi Stores","owner":"Asha Rao","renewal":"2026-12-01","value":"Rs. 12,750"},{"name":"Blue Pottery House","owner":"Meera Iyer","renewal":"2026-12-02","value":"Rs. 17,000"},{"name":"Delhi Spice Co.","owner":"Rahul Kumar","renewal":"2026-12-03","value":"Rs. 21,250"},{"name":"Mumbai Mart","owner":"Ben Cole","renewal":"2026-12-04","value":"Rs. 25,500"},{"name":"Pune Paper Co.","owner":"Asha Rao","renewal":"2026-12-05","value":"Rs. 29,750"},{"name":"Goa Gifts","owner":"Meera Iyer","renewal":"2026-12-06","value":"Rs. 34,000"},{"name":"Surat Silks","owner":"Rahul Kumar","renewal":"2026-12-07","value":"Rs. 38,250"},{"name":"Indore Snacks","owner":"Ben Cole","renewal":"2026-12-08","value":"Rs. 42,500"},{"name":"Nagpur Oranges","owner":"Asha Rao","renewal":"2026-12-09","value":"Rs. 46,750"},{"name":"Agra Leather","owner":"Meera Iyer","renewal":"2026-12-10","value":"Rs. 51,000"},{"name":"Vizag Seafoods","owner":"Rahul Kumar","renewal":"2026-12-11","value":"Rs. 55,250"},{"name":"Hubli Cottons","owner":"Ben Cole","renewal":"2026-12-12","value":"Rs. 59,500"},{"name":"Kochi Coir Works","owner":"Asha Rao","renewal":"2026-12-13","value":"Rs. 63,750"},{"name":"Mysuru Silk House","owner":"Meera Iyer","renewal":"2026-12-14","value":"Rs. 68,000"},{"name":"Patna Pickles","owner":"Rahul Kumar","renewal":"2026-12-15","value":"Rs. 72,250"},{"name":"Ranchi Crafts","owner":"Ben Cole","renewal":"2026-12-16","value":"Rs. 76,500"}]'></cm-data-table>
</div>` },
      { title: 'Resize and choose columns', description: '`resizable` adds a handle to each heading: drag it, or focus it (Tab) and press ← and → to change the width 16px at a time; each change is announced and fires `cm-column-resize`. `column-picker` adds a Columns button that shows and hides columns (`visible: false` starts one hidden) and fires `cm-columns-change` with the new `columns`; store both to keep the merchant\'s layout.',
        html: `<cm-data-table caption="Accounts" resizable column-picker
  columns='[{"key":"name","label":"Account","width":200},{"key":"owner","label":"Owner"},{"key":"stage","label":"Stage","visible":false},{"key":"renewal","label":"Renewal","type":"date"},{"key":"value","label":"Value","type":"money"}]'
  rows='[{"name":"Ravi Stores","owner":"Asha Rao","stage":"Renewal call booked","renewal":"2026-12-01","value":"Rs. 48,000"},{"name":"Blue Pottery House, Jaipur and Udaipur showrooms","owner":"Meera Iyer","stage":"Waiting for the owner","renewal":"2026-12-09","value":"Rs. 1,20,000"},{"name":"Delhi Spice Co.","owner":"Rahul Kumar","stage":"Asked for a discount","renewal":"2027-01-15","value":"Rs. 9,500"}]'></cm-data-table>` },
      { title: 'On a phone: cards', description: '`mobile="cards"`: at 640px or less (the table\'s own width; here a 390px box) each row becomes a card: the primary column is its title, the other columns label and value pairs, and the actions sit at the bottom, always visible. Use it for short lists people act on, one record at a time.',
        html: `<div style="max-width:390px">
  <cm-data-table caption="At risk" mobile="cards"
    columns='[{"key":"name","label":"Account","sortable":true},{"key":"owner","label":"Owner"},{"key":"stage","label":"Stage","priority":"low"},{"key":"renewal","label":"Renewal","type":"date","sortable":true},{"key":"value","label":"Value","type":"money","sortable":true},{"key":"actions","label":"Actions","type":"actions","actions":[{"label":"Open","value":"open"},{"label":"Snooze","value":"snooze"}]}]'
    rows='[{"name":"Ravi Stores","owner":"Asha Rao","stage":"Renewal call booked","renewal":"2026-12-01","value":"Rs. 48,000"},{"name":"Blue Pottery House, Jaipur and Udaipur showrooms","owner":"Meera Iyer","stage":"Waiting for the owner","renewal":"2026-12-09","value":"Rs. 1,20,000"},{"name":"Delhi Spice Co.","owner":"Rahul Kumar","stage":"Asked for a discount","renewal":"2027-01-15","value":"Rs. 9,500"}]'></cm-data-table>
</div>` },
      { title: 'On a phone: scroll', description: '`mobile="scroll"` (the default) keeps every column and scrolls sideways, and says so: the far edge fades and "Scroll for more" shows under the table until the end is reached. `sticky-first-column` keeps each row\'s name in view. Use it when people compare across columns.',
        html: `<div style="max-width:390px">
  <cm-data-table caption="Team" mobile="scroll" sticky-first-column
    columns='[{"key":"name","label":"Name"},{"key":"role","label":"Role"},{"key":"region","label":"Region"},{"key":"accounts","label":"Accounts","type":"numeric"},{"key":"visits","label":"Visits this month","type":"numeric"},{"key":"last","label":"Last active","type":"date"}]'
    rows='[{"name":"Asha Rao","role":"Field sales","region":"Bengaluru","accounts":42,"visits":18,"last":"2026-11-16"},{"name":"Meera Iyer","role":"Account manager","region":"Chennai","accounts":35,"visits":11,"last":"2026-11-15"},{"name":"Rahul Kumar","role":"Field sales","region":"Delhi","accounts":51,"visits":22,"last":"2026-11-17"}]'></cm-data-table>
</div>` },
      { title: 'On a phone: priority columns', description: '`mobile="priority"` hides columns marked `priority: "low"` at 640px or less, and gives each row a "View all fields" button that shows them under the row. Use it when two or three columns tell most of the story.',
        html: `<div style="max-width:390px">
  <cm-data-table caption="Renewals" mobile="priority"
    columns='[{"key":"name","label":"Account"},{"key":"owner","label":"Owner","priority":"low"},{"key":"stage","label":"Stage","priority":"low"},{"key":"value","label":"Value","type":"money"}]'
    rows='[{"name":"Ravi Stores","owner":"Asha Rao","stage":"Renewal call booked","renewal":"2026-12-01","value":"Rs. 48,000"},{"name":"Blue Pottery House, Jaipur and Udaipur showrooms","owner":"Meera Iyer","stage":"Waiting for the owner","renewal":"2026-12-09","value":"Rs. 1,20,000"},{"name":"Delhi Spice Co.","owner":"Rahul Kumar","stage":"Asked for a discount","renewal":"2027-01-15","value":"Rs. 9,500"}]'></cm-data-table>
</div>` },
      { title: 'Inside a card, wide on a phone', description: 'The card heading names the table, so the caption is kept for screen readers only. `sticky-first-column` keeps the location in view while the merchant scrolls sideways.',
        html: `<cm-card heading="Stock by location" flush style="max-width:384px">
  <cm-data-table caption="Stock by location" caption-hidden sticky-first-column
    columns='[{"key":"location","label":"Location","sortable":true},{"key":"on_hand","label":"On hand","type":"numeric","sortable":true},{"key":"committed","label":"Committed","type":"numeric"},{"key":"available","label":"Available","type":"numeric"},{"key":"incoming","label":"Incoming","type":"numeric"}]'
    rows='[{"location":"Bengaluru warehouse","on_hand":240,"committed":32,"available":208,"incoming":100},{"location":"Indiranagar store","on_hand":18,"committed":2,"available":16,"incoming":0},{"location":"Koramangala store","on_hand":7,"committed":0,"available":7,"incoming":24}]'></cm-data-table>
</cm-card>` },
      { title: 'Server-rendered table', description: 'In PHP or EJS, write a native `<table>` inside it and it is styled to match. Mark number cells with `data-type="numeric"`. Add `data-sort="text|numeric|money|date"` to a heading to let the merchant sort that column in the browser; give cells a `data-value` when their text is formatted (money, dates). Use `sort-mode="manual"` to sort on the server instead. The phone strategies work here too: cells get their heading as a label for `mobile="cards"`, and headings marked `data-priority="low"` hide with `mobile="priority"` (link each row to its record instead of View all fields). Mark an actions column `data-type="actions"`.',
        html: `<cm-data-table mobile="cards">
  <table>
    <caption>Order lines</caption>
    <thead><tr><th scope="col" data-sort="text">Product</th><th scope="col" data-sort="numeric">Quantity</th><th scope="col" data-sort="money">Amount</th></tr></thead>
    <tbody>
      <tr><td>Ceramic mug</td><td data-type="numeric">2</td><td data-type="money" data-value="798">Rs. 798</td></tr>
      <tr><td>Linen apron</td><td data-type="numeric">1</td><td data-type="money" data-value="1250">Rs. 1,250</td></tr>
    </tbody>
    <tfoot><tr><td>Total</td><td data-type="numeric">3</td><td data-type="money">Rs. 2,048</td></tr></tfoot>
  </table>
</cm-data-table>` },
    ],
    states: [
      { title: 'Loading', description: '`loading` shows placeholder rows and marks the table busy; the headings stay.',
        html: `<cm-data-table caption="Sales by day" loading loading-rows="3"
  columns='[{"key":"day","label":"Day"},{"key":"orders","label":"Orders","type":"numeric"},{"key":"sales","label":"Net sales","type":"money"}]'></cm-data-table>` },
      { title: 'Empty', description: 'Put an empty state in the `empty` slot. The totals row is hidden when there are no rows.',
        html: `<cm-data-table caption="Sales by day" rows='[]'
  columns='[{"key":"day","label":"Day"},{"key":"orders","label":"Orders","type":"numeric"},{"key":"sales","label":"Net sales","type":"money"}]'>
  <cm-empty-state slot="empty" size="small" icon="search" heading="No sales in this period">Try a longer date range.</cm-empty-state>
</cm-data-table>` },
    ],
    do: ['Use it for reports and lists of records: sales by day, stock by location, accounts, tasks, renewals.', 'Give every table a `caption`; hide it with `caption-hidden` when a heading above already says it.', 'Use `numeric` or `money` for numbers so they line up, and `date` for dates so they sort and never wrap.', 'Pick a phone strategy for every table (`mobile`) and say why in the review: see [[Tables on phones|/patterns/tables-on-phones]].', 'Put row buttons in an `actions` column (one or two short verbs) so they line up at the end and appear on hover and focus.', 'Store `cm-column-resize` and `cm-columns-change` (for example per user) and pass the widths and `visible` flags back in `columns`.', 'With thousands of rows, sort on the server: `sort-mode="manual"`, listen for `cm-sort`, then set `rows`.', 'For long text such as notes or a list of signals, set `lines: 2` (or 3) on the column so rows stay compact: the text wraps onto up to that many lines and ends in "…", with the full value on hover. In a server-rendered table, put `data-lines="1"` to `"4"` on any element inside a cell (for a list of signals, one per item: `<li><div data-lines="1">…</div></li>`); one-line items are capped at `--cm-data-table-cell-max-width` (320px).'],
    dont: ['Don\'t use it for lists merchants select and act on in bulk (products, orders, customers): use [[Resource list|/components/resource-list]], which has selection and bulk actions.', 'Don\'t put more than two buttons in a row: link the row to its record for everything else.', 'Don\'t make every column sortable: only those merchants scan by.', 'Don\'t mix densities on one screen: set `data-cm-density` once on the page.', 'Don\'t hide the column that names the rows: the column picker keeps the primary column.'],
    content: ['Column headings in sentence case, one or two words: "Net sales", not "NET SALES".', 'Write money the same way in every row and in the totals ("Rs. 1,250").', 'Label the totals row "Total".'],
    a11y: ['A native `<table>`: a caption, column headers with `scope="col"` and the first cell of each row as a row header, so screen readers read "Bengaluru warehouse, Available, 208".', 'Text cut off with "…" is cut off visually only: screen readers read the whole value, and the mouse shows it on hover.', 'Row actions are hidden with opacity only: they stay in the tab order and the accessibility tree, show as soon as the row has focus, and are always visible on touch screens and in forced colours. Each is named with its row ("Open, Ravi Stores").', 'Resize handles are focusable separators named "Resize Owner column" with the width as their value; ← and → change it by 16px (mirrored in right-to-left) and the new width is announced.', 'The column picker is a button with `aria-expanded` that opens a group of checkboxes ("Show columns"); Esc closes it and returns focus to the button.', 'Cards (`mobile="cards"`) are a list named by the caption, with each field as a term and value. "View all fields" is a button with `aria-expanded` that controls the row of extra fields.', '"Scroll for more" and the faded edges are visual only; a table that scrolls sideways is a focusable region named by its caption, so keyboard users can scroll it.', 'Sortable headings are buttons inside the column header, which carries `aria-sort`. Every sort is also announced politely ("Sorted by Orders, descending"), because screen readers don\'t reliably read `aria-sort` changes; in `manual` mode the announcement waits until you set `sort` and `direction`.', 'Cell values are always shown as text, never as HTML.', 'A table with a sticky header or first column scrolls in a focusable region named by its caption, so keyboard users can scroll it.', 'While `loading`, the table is `aria-busy` and the placeholders are hidden from screen readers.'],
    related: ['resource-list', 'table-header', 'pagination', 'empty-state'],
  },
  {
    slug: 'resource-list', tag: 'cm-resource-list', react: 'ResourceList', name: 'Resource list', group: 'Lists',
    responsive: ["When the window is 640px wide or less, rows have no side padding, a 20px checkbox (easier to tap) and 32px thumbnails; bulk actions wrap under the \"2 orders selected\" status when they don't fit.", "Row buttons (`slot=\"actions\"`) wrap onto their own line under the content, at the start, when the content would get narrower than 12rem: on phones by default, at any width with `actions=\"wrap\"` on the `cm-resource-item`, never with `actions=\"inline\"` (since 1.6, issue #31).", "On touch screens rows are at least 44px tall at either density."],
    parts: [{ tag: 'cm-resource-item', react: 'ResourceItem' }],
    specs: [
      ['Rows', 'Comfortable 56px: a 40px thumbnail with 8px above and below. Compact 40px: a 32px thumbnail with 4px above and below. At least 44px on touch screens.'],
      ['Header row', '40px, the same height as a Table header and a Data table\'s heading row; it lines up with the rows\' columns and checkboxes.'],
      ['Text', '14px rows; 13px in the selection row.'],
      ['Density', '`density` on the list, or `data-cm-density` on any ancestor. Custom properties: `--cm-resource-row-height`, `--cm-resource-row-padding`, `--cm-resource-media-size`.'],
    ],
    summary: 'Lists products, orders or customers, with bulk selection and actions.',
    lead: '56px rows with a 16px checkbox, an optional 40px thumbnail and 14px text, divided by `border-subtle` lines; `density="compact"` (or `data-cm-density="compact"` on any ancestor) makes them 40px with a 32px thumbnail. Hovered and selected rows turn `bg-hover`. A selectable list starts with a 40px header row (32px before 1.6), as tall as a table\'s heading row: the select-all box, lined up with the rows\' checkboxes, and a small chevron menu (this page, all matching, none). Once rows are ticked the same row shows "2 products selected", a link to select every match and the bulk actions; nothing is added above the list. With a `cm-table-header` in the `header` slot, the header is that row: the box sits in its checkbox column and the selection covers the column names while rows are ticked. Since 1.5 (before: a 40px bordered Select button on a row of its own).',
    examples: [
      { title: 'Selectable, with bulk actions', html: `<cm-resource-list selectable total="15000" resource-name="product">
  <cm-button slot="bulk-actions" size="slim">Bulk orders</cm-button>
  <cm-button slot="actions" size="slim">Customise columns</cm-button>
  <cm-resource-item value="p1" selected>New normal modern classic darkness T-shirt</cm-resource-item>
  <cm-resource-item value="p2" selected>Linen overshirt, sand</cm-resource-item>
  <cm-resource-item value="p3">Canvas tote bag</cm-resource-item>
  <cm-resource-item value="p4">Cotton socks, 3 pairs</cm-resource-item>
</cm-resource-list>` },
      { title: 'With thumbnails and links', html: `<cm-resource-list resource-name="product" style="max-width:520px">
  <cm-resource-item value="p1" href="#/components/resource-list" label="Ceramic mug">
    <cm-thumbnail slot="media" alt=""></cm-thumbnail>
    Ceramic mug<br><small style="color:var(--cm-text-tertiary)">24 in stock</small>
  </cm-resource-item>
  <cm-resource-item value="p2" href="#/components/resource-list" label="Linen napkins">
    <cm-thumbnail slot="media" alt=""></cm-thumbnail>
    Linen napkins<br><small style="color:var(--cm-text-tertiary)">Out of stock</small>
  </cm-resource-item>
</cm-resource-list>` },
      { title: 'Row buttons on phones', description: 'Buttons in a row\'s `actions` slot wrap onto their own line under the content when the content would get narrower than 12rem: on phones (640px or less) by default, at any width with `actions="wrap"` (as here), never with `actions="inline"`. Since 1.6 (issue #31).',
        html: `<cm-resource-list resource-name="task" style="max-width:420px">
  <cm-resource-item value="t1" actions="wrap"><strong>Ravi Stores</strong><div>Called 12 Nov, no answer</div>
    <cm-button slot="actions" size="slim">Call</cm-button>
    <cm-button slot="actions" size="slim">Details</cm-button>
    <cm-button slot="actions" size="slim">Set date</cm-button>
    <cm-button slot="actions" size="slim" tone="critical">Not interested</cm-button>
  </cm-resource-item>
  <cm-resource-item value="t2" actions="wrap"><strong>Asha Textiles</strong><div>Visited 10 Nov</div>
    <cm-button slot="actions" size="slim">Call</cm-button>
  </cm-resource-item>
</cm-resource-list>` },
      { title: 'With column headings', description: 'A `cm-table-header` in the `header` slot, `--cm-table-columns` on the list and `columns` on each row, one element per column. The list lines the headings up with the cells and puts its select-all box in the header\'s checkbox column. Tick a row: the selection status and bulk actions cover the column names until the selection is cleared.',
        html: `<cm-resource-list selectable total="128" resource-name="lead" style="--cm-table-columns: 1.6fr 1.4fr 1.8fr 1.2fr 1.1fr 1fr 110px">
  <cm-button slot="bulk-actions" size="slim">Assign owner</cm-button>
  <cm-table-header slot="header" sort="created" direction="descending">
    <option value="name" sortable>Name</option>
    <option value="company">Company</option>
    <option value="email">Email</option>
    <option value="phone">Phone</option>
    <option value="owner">Owner</option>
    <option value="created" sortable>Created</option>
    <option value="status">Status</option>
  </cm-table-header>
  <cm-resource-item value="l1" label="Asha Rao" columns>
    <strong>Asha Rao</strong><span>Rao Textiles</span><span>asha@raotextiles.in</span><span>98450 12345</span><span>Rahul Kumar</span><span>16 Nov</span><span><cm-badge tone="information">New</cm-badge></span>
  </cm-resource-item>
  <cm-resource-item value="l2" label="Ben Cole" columns>
    <strong>Ben Cole</strong><span>Cole &amp; Sons</span><span>ben@coleandsons.com</span><span>99001 55432</span><span>Meera Iyer</span><span>15 Nov</span><span><cm-badge tone="success">Contacted</cm-badge></span>
  </cm-resource-item>
  <cm-resource-item value="l3" label="Divya Menon" columns>
    <strong>Divya Menon</strong><span>Menon Foods</span><span>divya@menonfoods.in</span><span>90080 77881</span><span>Rahul Kumar</span><span>14 Nov</span><span><cm-badge>Qualified</cm-badge></span>
  </cm-resource-item>
</cm-resource-list>` },
      { title: 'Compact rows', description: '`density="compact"`: 40px rows and 32px thumbnails, for long lists people scan. Set `data-cm-density="compact"` on the page instead to make every list and table on it compact. On touch screens rows stay at least 44px tall.',
        html: `<cm-resource-list resource-name="product" density="compact" style="max-width:520px">
  <cm-resource-item value="p1" href="#/components/resource-list" label="Ceramic mug"><cm-thumbnail slot="media" alt=""></cm-thumbnail>Ceramic mug</cm-resource-item>
  <cm-resource-item value="p2" href="#/components/resource-list" label="Linen napkins"><cm-thumbnail slot="media" alt=""></cm-thumbnail>Linen napkins</cm-resource-item>
  <cm-resource-item value="p3" href="#/components/resource-list" label="Canvas tote bag"><cm-thumbnail slot="media" alt=""></cm-thumbnail>Canvas tote bag</cm-resource-item>
</cm-resource-list>` },
      { title: 'Loading', html: `<cm-resource-list loading resource-name="order" style="max-width:520px">
  <cm-resource-item value="o1">#1001 · Asha Rao</cm-resource-item>
  <cm-resource-item value="o2">#1002 · Ben Cole</cm-resource-item>
</cm-resource-list>` },
    ],
    states: [
      { title: 'Empty', description: 'Nothing matches: the `empty` slot replaces the rows. Suggest another search or filter.',
        html: `<cm-resource-list label="Orders" resource-name="order" total="0">
  <cm-empty-state slot="empty" size="small" icon="search" heading="No orders match">Try another status or search.</cm-empty-state>
</cm-resource-list>` },
      { title: 'Error', description: 'The list couldn\'t load: a critical banner in its place, with Try again.',
        html: `<cm-banner tone="critical" heading="Orders couldn't load">
  Check your connection and try again. Your orders are safe.
  <cm-button slot="actions" size="slim">Try again</cm-button>
</cm-banner>` },
    ],
    do: ['Set `resource-name` (and `resource-name-plural` for irregular nouns) so the toolbar reads "2 orders selected".', 'Set `total` to the number of matches so merchants can select all of them, and act on `detail.all` in `cm-selection-change`.', 'Pair it with `cm-status-tabs` above and `cm-pagination` below; put a `cm-table-header` in the `header` slot for columns.', 'With column headings, set `--cm-table-columns` on the list and `columns` on every row, with one element per column (wrap a badge or button in a `<span>`). The list lines the header up with the cells, checkbox column included. Laying a row out yourself works too: a grid on `var(--cm-table-columns)` with `column-gap: var(--cm-space-20)` and `min-width: 0` on the cells.', 'Give each row a `label` when its text is long, so the checkbox and link names stay short.'],
    dont: ['Don\'t put more than one link or many buttons in a row: use the `actions` slot for one or two.', 'Don\'t squeeze many columns onto a phone: at 640px or less, show the row as text (no `columns`, no header), or set a shorter `--cm-table-columns` and leave out the cells and options that don\'t fit.', 'Don\'t set `selectable` on a `cm-table-header` inside a selectable list: the list already puts its select-all box in the header. With column headings, put row buttons and thumbnails in a column rather than the `actions` and `media` slots, so the cells stay under their headings.', 'Don\'t use it for settings or navigation: use cards or a nested list.', 'Don\'t show bulk actions that can\'t apply to every selected row.'],
    content: ['Header row text: "2 products selected. Select all 15,000 products" and "All 15,000 products selected. Clear selection".', 'Bulk actions are verbs: "Bulk orders", "Archive", "Add tags".'],
    a11y: ['The rows form a list named after the resource ("Products"); each checkbox is named "Select {row name}".', 'The Select box is named "Select all 4 products on this page" and shows a mixed state when some rows are ticked. Its menu button is named "Selection options" and is a standard menu button (↓ opens, arrows move, Esc closes). Over a column header it appears once rows are ticked (until then the box selects the page). Hide it with `hide-select-menu`.', 'Selection changes are announced through a polite status message.', 'Linked rows are one link each; the checkbox and actions stay separate tab stops. Clicking a plain row ticks it, but never when clicking a button or link inside.', 'While `loading`, the list is `aria-busy` and the spinner is named "Loading products".', 'Differs from Figma: the selection lives in the list\'s header row instead of a separate toolbar; rows, thumbnails (40px desktop / 32px phone and compact) and text follow the 1.5 scale and the 1.6 table standard. Any image works as a thumbnail.'],
    related: ['table-header', 'pagination', 'status-tabs', 'checkbox', 'data-table'],
  },
  {
    slug: 'timeline', tag: 'cm-timeline', react: 'Timeline', name: 'Timeline', group: 'Lists',
    responsive: ['The time moves under the title when the row is too narrow for both; the Show more button lines up with the text on wide screens and with the icons on phones (640px or less).'],
    parts: [{ tag: 'cm-timeline-item', react: 'TimelineItem' }],
    summary: 'The activity on a record: emails, calls, notes, field changes and system events, newest first.',
    lead: 'One row per event: a 32px round icon for its kind, a 14px title with an optional badge, the time at the end of the line ("2 hours ago"; the full date and time on hover and focus), a 12px `text-tertiary` meta line, an optional body clamped to 3 lines with Show all, and optional actions. A 2px `border-subtle` line joins the icons. "Show more" at the end asks for older events.',
    examples: [
      { title: 'Record activity', description: 'Emails, calls and WhatsApp messages on a lead. The badge names the kind; the action opens the full message. `has-more` adds Show more, which fires `cm-load-more`.',
        html: `<cm-timeline label="Activity for Asha Rao" has-more style="max-width:720px">
  <cm-timeline-item icon="mail" tone="information" heading="Quote for 200 cotton tote bags" datetime="${isoAgo(125)}" meta="by Rahul Kumar · sent">
    <cm-badge slot="badge" tone="information">Email</cm-badge>
    Hi Asha, thanks for your time on the call. As discussed, here is the quote for 200 printed cotton tote bags with your logo on one side. Prices include GST and delivery to Bengaluru. The quote is valid for 30 days; let me know if you would like samples first.
    <cm-button slot="actions" size="slim" href="#/components/timeline">Read email</cm-button>
  </cm-timeline-item>
  <cm-timeline-item icon="mail" heading="Email opened" datetime="${isoAgo(95)}" meta="by Asha Rao · 2 times"></cm-timeline-item>
  <cm-timeline-item icon="chat" tone="success" heading="Call: discussed bulk pricing" datetime="${isoAgo(60 * 26)}" meta="by Rahul Kumar · outgoing · 12 min">
    <cm-badge slot="badge" tone="success">Call</cm-badge>
    Asha needs 200 bags by 5 December for a store opening. Wants a quote with printing on one side.
  </cm-timeline-item>
  <cm-timeline-item icon="send" heading="WhatsApp message delivered" datetime="${isoAgo(60 * 50)}" meta="by Rahul Kumar · template: Introduction">
    <cm-badge slot="badge">WhatsApp</cm-badge>
  </cm-timeline-item>
</cm-timeline>` },
      { title: 'Notes', description: 'Long notes are clamped to `lines` lines (3 by default) with Show all. Put the author in the meta line.',
        html: `<cm-timeline label="Notes" style="max-width:560px">
  <cm-timeline-item icon="note" heading="Note" datetime="${isoAgo(40)}" meta="by Meera Iyer" lines="2">
    Visited the Indiranagar store. They stock our mugs on the front shelf and sold out of the blue glaze last week. The owner wants to try the linen napkins next month and asked for a display stand. Follow up after Diwali with a sample set and the wholesale price list.
  </cm-timeline-item>
  <cm-timeline-item icon="note" heading="Note" datetime="${isoAgo(60 * 24 * 3)}" meta="by Rahul Kumar">Prefers calls after 4 pm.</cm-timeline-item>
</cm-timeline>` },
      { title: 'System events and field changes', description: 'Changes made by people, automations and imports. Write a field change as "Field: old → new" in the title; no body is needed.',
        html: `<cm-timeline label="History" style="max-width:560px">
  <cm-timeline-item icon="edit" heading="Status: New → Contacted" datetime="${isoAgo(15)}" meta="by Rahul Kumar"></cm-timeline-item>
  <cm-timeline-item icon="user" heading="Owner: Meera Iyer → Rahul Kumar" datetime="${isoAgo(60 * 5)}" meta="by assignment rule · Round robin, Bengaluru"></cm-timeline-item>
  <cm-timeline-item icon="tag" heading="Tag added: Wholesale" datetime="${isoAgo(60 * 5 + 2)}" meta="by Meera Iyer"></cm-timeline-item>
  <cm-timeline-item icon="plus" heading="Lead created" datetime="2026-11-02T09:30:00+05:30" meta="by Website form · Contact us">
    <cm-badge slot="badge">System</cm-badge>
  </cm-timeline-item>
</cm-timeline>` },
    ],
    states: [
      { title: 'Loading', description: '`loading` with no items yet shows placeholder rows and announces "Loading activity".',
        html: `<cm-timeline loading style="max-width:560px"></cm-timeline>` },
      { title: 'Loading more', description: 'After `cm-load-more`, set `loading` while the next page loads: Show more shows a spinner and can\'t be pressed twice. Append the items, then clear `loading`, and `has-more` on the last page.',
        html: `<cm-timeline has-more loading style="max-width:560px">
  <cm-timeline-item icon="edit" heading="Status: Contacted → Qualified" datetime="${isoAgo(60 * 24 * 2)}" meta="by Rahul Kumar"></cm-timeline-item>
</cm-timeline>` },
      { title: 'Empty', description: 'Put a `cm-empty-state` in the `empty` slot. It shows when there are no items and nothing is loading.',
        html: `<cm-timeline style="max-width:560px">
  <cm-empty-state slot="empty" size="small" icon="clock" heading="No activity yet">Emails, calls and notes for this lead will show here.</cm-empty-state>
</cm-timeline>` },
    ],
    do: ['Show the newest event first, and page older ones with `has-more` and `cm-load-more`.', 'Give `datetime` as an ISO date-time with its offset, so the relative time, the full time and `<time datetime>` are right.', 'Pick one icon per kind and keep it: `mail` for emails, `chat` for calls, `note` for notes, `edit` for field changes, `user` for owner changes.', 'Name the kind in the title or a badge too: the icon is decoration and is not read out.', 'Filter by kind with `cm-status-tabs` above the timeline, with a count on each tab.', 'Set `label` when there is more than one timeline on the page, e.g. "Notes" and "History".'],
    dont: ['Don\'t put long forms or several buttons in an item: one or two actions, such as "Read email" or "Open task".', 'Don\'t use it for comments people write together on an order: use [[Comment|/components/comment]].', 'Don\'t show the whole body of every email: let it clamp, and link to the full message.'],
    content: ['Titles say what happened, briefly: "Email sent", "Call: discussed bulk pricing", "Status: New → Contacted".', 'Meta line: who, then details, joined with " · ": "by Rahul Kumar · sent".', 'Badges are one word for the kind: Email, Call, WhatsApp, Note, System.'],
    a11y: ['An ordered list (`<ol>`, named "Activity" or `label`) with one `<li>` per event; the line between icons is decoration.', 'Each time is a `<time datetime>`. Screen readers hear the relative time and then the full date and time ("2 hours ago, Monday, 16 November 2026 at 10:30"). The time is a Tab stop so keyboard users can see the full date in its tooltip.', 'Show all / Show less is a button with `aria-expanded`, controlling the body. The clamped text is still read in full by screen readers.', 'Show more is a button; while `loading` it is busy and "Loading activity" is announced. When the last page arrives and the button goes away, focus moves to the list.', 'Screen readers read "→" as "right arrow" or "to", depending on the reader.'],
    related: ['comment', 'status-tabs', 'badge', 'empty-state'],
  },
  {
    slug: 'board', tag: 'cm-board', react: 'Board', name: 'Board', group: 'Lists',
    parts: [{ tag: 'cm-board-column', react: 'BoardColumn' }, { tag: 'cm-board-card', react: 'BoardCard' }],
    responsive: [
      'Columns are 272px wide (`--cm-board-column-width`) side by side, 12px apart, and the board scrolls sideways.',
      'When the board itself is 480px wide or less (a phone, or a narrow panel), each column takes the board\'s width less 40px, so the next column peeks in, and the board snaps from column to column. Rails stay 48px. It works down to 320px.',
      'Give the board a height (`style="height: 70vh"` or `block-size`) and each column scrolls on its own; without one the columns grow with their cards and the page scrolls.',
      'While a card is dragged near the board\'s start or end edge the board scrolls sideways; near the top or bottom of a column, the column scrolls; near the top or bottom of the window, the window scrolls.',
    ],
    summary: 'Records in columns by status (Kanban), moved between columns by dragging or with the keyboard.',
    lead: 'One column per status, with its heading and count, and one card per record: the name (a link to the record), a few 12px `text-tertiary` lines, badges and the owner\'s avatar. Columns are `bg-page` with a `border-subtle` line and 8px corners; cards are `bg-surface` with a `border-subtle` line. A card is moved by dragging it (press and hold on touch) or by focusing it and pressing Space, then the arrow keys. Each move fires a cancelable `cm-move` for your app to save.',
    examples: [
      { title: 'CRM pipeline by status', description: 'Merchants by status. Drag a card to another column, or Tab to a card, press Space, use the arrow keys and press Enter. Each move fires `cm-move` with `{ value, from, to, fromIndex, toIndex }`; save it there, and pass the request to `detail.waitUntil(promise)` so the card shows as saving and goes back if it fails. `total` is the column\'s full count; with more than are loaded, Load more appears.',
        html: `<cm-board label="Merchants by status" style="height:560px">
  <cm-board-column value="new" heading="New" total="24">
${crmCard('m101', 'Ravi Stores', 'Asha Rao', '+91 98450 12345', 'Bengaluru', 'A', '2 hours ago')}
${crmCard('m102', 'Lakshmi Textiles', 'Rahul Kumar', '+91 99000 23456', 'Chennai', 'B', 'Yesterday')}
${crmCard('m103', 'Green Basket Organics', 'Meera Iyer', '+91 90080 34567', 'Mysuru', 'B', '3 days ago')}
  </cm-board-column>
  <cm-board-column value="contacted" heading="Contacted">
${crmCard('m104', 'Blue Pottery House', 'Asha Rao', '+91 98860 45678', 'Jaipur', 'A', 'Today')}
${crmCard('m105', 'Kiran Foods', 'Rahul Kumar', '+91 97400 56789', 'Pune', 'C', '5 days ago')}
  </cm-board-column>
  <cm-board-column value="demo" heading="Demo booked">
${crmCard('m106', 'Delhi Spice Co.', 'Meera Iyer', '+91 98110 67890', 'New Delhi', 'A', 'Today')}
  </cm-board-column>
  <cm-board-column value="won" heading="Won">
${crmCard('m107', 'Coastal Crafts', 'Asha Rao', '+91 94470 78901', 'Kochi', 'B', 'Last week')}
  </cm-board-column>
  <cm-board-column value="lost" heading="Lost"></cm-board-column>
</cm-board>` },
      { title: 'Load more', description: 'Show the first page of each column and set `total`. Load more (also shown with `has-more`) fires `cm-load-more` with `{ column, value }`: set `loading` on the column, append the next cards, then clear `loading`. This example adds three cards after a short wait.',
        html: `<cm-board label="Tickets by status" style="height:480px">
  <cm-board-column value="open" heading="Open" total="8">
${crmCard('t201', 'Refund not received', 'Priya Nair', 'Order #10482', 'Payments', 'High', '1 hour ago')}
${crmCard('t202', 'Wrong size delivered', 'Arjun Mehta', 'Order #10477', 'Returns', 'Medium', 'Today')}
  </cm-board-column>
  <cm-board-column value="waiting" heading="Waiting on customer" total="3">
${crmCard('t203', 'GST invoice needed', 'Priya Nair', 'Order #10391', 'Billing', 'Low', 'Yesterday')}
  </cm-board-column>
  <cm-board-column value="closed" heading="Closed" loading></cm-board-column>
</cm-board>` },
      { title: 'Hide empty columns', description: '`hide-empty` shrinks empty columns to a 48px rail with the heading on its side and the count. Rails still take cards: drop a card on one, or move to it with the arrow keys, and it opens up again. A column with a `total` above 0 is never treated as empty.',
        html: `<cm-board label="Partners by status" hide-empty style="height:420px">
  <cm-board-column value="new" heading="New">
${crmCard('p301', 'Sharma Logistics', 'Rahul Kumar', '+91 98200 11122', 'Mumbai', 'B', 'Today')}
  </cm-board-column>
  <cm-board-column value="contacted" heading="Contacted"></cm-board-column>
  <cm-board-column value="onboarding" heading="Onboarding">
${crmCard('p302', 'Nair Packaging', 'Meera Iyer', '+91 94460 33344', 'Thiruvananthapuram', 'A', '2 days ago')}
  </cm-board-column>
  <cm-board-column value="live" heading="Live"></cm-board-column>
  <cm-board-column value="paused" heading="Paused"></cm-board-column>
</cm-board>` },
      { title: 'Keyboard instructions and a Move menu', description: 'Where many people use the keyboard (a sales floor), say how moving works on the page as well; screen readers already hear it with each card. A "Move to" menu in the `actions` slot gives a way that needs no arrow keys: on `cm-select`, call `board.moveCard(card, value)`, or `board.pickUp(card)` for "Move…" (then the arrow keys). This example does both.',
        html: `<p id="board-keys" style="margin:0 0 12px;font-size:14px">To move a card: Tab to it, press Space, choose a column and position with the arrow keys, then press Enter. Escape cancels. Enter on a card opens it.</p>
<cm-board label="Follow-ups by stage" style="height:380px">
  <cm-board-column value="today" heading="Today">
    <cm-board-card value="f401" heading="Call Ravi Stores" href="#/components/board">
      <span>Asha Rao · 11:30 am</span>
      <cm-action-menu slot="actions" icon-only align="end" label="Move Call Ravi Stores" data-board-move>
        <cm-menu-item value="pick">Move…</cm-menu-item><hr>
        <cm-menu-item value="week">Move to This week</cm-menu-item>
        <cm-menu-item value="later">Move to Later</cm-menu-item>
      </cm-action-menu>
    </cm-board-card>
  </cm-board-column>
  <cm-board-column value="week" heading="This week">
    <cm-board-card value="f402" heading="Demo for Kiran Foods" href="#/components/board"><span>Rahul Kumar · Thursday</span></cm-board-card>
  </cm-board-column>
  <cm-board-column value="later" heading="Later"></cm-board-column>
</cm-board>` },
    ],
    states: [
      { title: 'Saving and failed moves', description: 'During `detail.waitUntil(promise)` the card is `pending`: greyed (`bg-page`), with a spinner, and it can\'t be moved again. If the promise rejects, the board puts the card back, restores both counts and announces "Couldn\'t move Ravi Stores. It is back in New." Call `board.revert(card)` yourself when a save fails some other way.',
        html: `<cm-board label="Saving" style="height:220px">
  <cm-board-column value="contacted" heading="Contacted">
    <cm-board-card value="m101" heading="Ravi Stores" href="#/components/board" pending><span>Asha Rao</span></cm-board-card>
  </cm-board-column>
  <cm-board-column value="demo" heading="Demo booked"></cm-board-column>
</cm-board>` },
      { title: 'Locked cards', description: '`locked` cards (no permission to change the status) have no move handle and are skipped by Tab; their link still works.',
        html: `<cm-board label="Locked" style="height:200px">
  <cm-board-column value="won" heading="Won">
    <cm-board-card value="m107" heading="Coastal Crafts" href="#/components/board" locked><span>Closed by finance</span></cm-board-card>
  </cm-board-column>
</cm-board>` },
    ],
    do: [
      'Use one column per status, in the order records move through them, and keep the same order everywhere the statuses appear.',
      'Give every card a `value` (the record id) and every column a `value` (the status id): `cm-move` reports those.',
      'Save the move in `cm-move` and pass the request to `detail.waitUntil()`. Cancel the event (`preventDefault()`) for moves that are never allowed, and say why nearby.',
      'Set `total` from your API and page each column with Load more; don\'t load every record into a board.',
      'Use `href` for the record link, so each card is one Tab stop and Enter opens it.',
      'In React, Vue and other frameworks that render from data, set `controlled` and move the record in your state in the `cm-move` listener.',
      'Offer a list view of the same records for searching, sorting and bulk actions: see [[Board or list|/patterns/pipeline-board]].',
    'To confirm a move first (for example into a closing stage), call `preventDefault()` in `cm-move`, ask with a Modal, and on confirm call `board.moveCard(detail.value, detail.to, detail.toIndex)`. The second move fires `cm-move` again, so let it through with a flag of your own (set `confirmed = true` just before `moveCard`, reset it after); don\'t rely on `source: \'api\'`, which a "Move to" menu that calls `moveCard()` also produces.'],
    dont: [
      'Don\'t use a board for more than about eight statuses, or for records with no status: use a [[Resource list|/components/resource-list]] or [[Data table|/components/data-table]].',
      'Don\'t make dragging the only way to change a status: the record page should have a status field too.',
      'Don\'t put more than four lines, a few badges and one small menu on a card.',
      'Don\'t put form fields on cards: they can\'t start a drag and make the card hard to move.',
    ],
    content: [
      'Column headings are the status names merchants know ("Demo booked"), in sentence case, without the count (the board adds it).',
      'Card title: the record\'s name. Lines: owner, then phone and city, then when it last changed ("Modified 2 hours ago").',
      'Badges: one word or a grade ("Grade A", "High").',
    ],
    a11y: [
      'The board is a group named by `label`; each column is a region named by its heading and count ("Contacted, 12 cards"), with a heading (`heading-level`, 3 by default) and a list of cards. Cards are list items.',
      'Each card has one Tab stop: a handle covering the card, a button with the role description "movable card", named after the card, and described by the instructions ("Press Space to pick up. Then use the arrow keys…"; "Press Enter to open." first when the card has a link). The `aria-grabbed` and `aria-dropeffect` attributes are deprecated and not used.',
      'Keyboard: Space picks the card up; Left and Right choose the previous or next column (in right-to-left languages they swap, so Left goes to the next column); Up and Down, Home and End choose the position; Space or Enter drops; Escape cancels, and so does Tab or moving focus away. Without a card picked up, the arrow keys move focus between cards and Enter opens the card.',
      'Every step is announced through an assertive live region: "Picked up Ravi Stores. Column New, position 1 of 3.", "Column Contacted, position 2 of 3.", "Moved Ravi Stores to Contacted, position 2 of 3.", "Move cancelled. Ravi Stores is back in New." Refused and failed moves are announced too. Focus stays on the card after it moves.',
      'Screen readers in browse mode keep the arrow keys for reading, so a "Move to" menu (see the example) or the status field on the record page is the way for many screen-reader users. Dragging is never the only way.',
      'Pointer: drag with a mouse after moving 4px; on touch, press and hold for 0.3 seconds, so swiping still scrolls. A copy of the card follows the pointer, a dashed outline marks where the card came from, and a dashed placeholder shows where it will land. Escape cancels a drag.',
      'Load more is a button; while a column is `loading` its list is busy and "Loading Contacted" is announced. Placeholder cards are hidden from screen readers.',
      'Not yet tested with screen readers by people (automated checks only).',
    ],
    related: ['resource-list', 'data-table', 'status-tabs', 'badge', 'avatar', 'action-menu'],
  },
  {
    slug: 'calendar', tag: 'cm-calendar', react: 'Calendar', name: 'Calendar', group: 'Lists',
    parts: [{ tag: 'cm-calendar-event', react: 'CalendarEvent' }],
    responsive: [
      'Follows the calendar\'s own width, not the window. From 600px wide: a month grid with chips in each day, a week of seven day columns, or one day.',
      'Narrower than 600px (phones, side panels), the month view becomes a compact grid of day buttons with a dot per event (up to three, in the events\' colours), and the chosen day\'s events are listed under it with an Add button. Tapping a day chooses it. The week view shows three days from `date` instead of seven, and Previous and Next move three days; `cm-range-change` reports those three days. Three days keep the hours readable at 320px, where seven columns would be under 40px wide.',
      'The week and day views scroll inside the calendar (at most 600px tall, `--cm-calendar-time-height`) with the day headings and the all-day row kept in view, and open scrolled to `day-start` (8 am). An hour is 48px (`--cm-calendar-hour-height`).',
      'The header wraps: the navigation, then the range, then the view switch, on as many lines as it needs. It works down to 320px.',
    ],
    summary: 'Events by month, week or day: calls, follow-ups and demos that move between days and times by dragging or with the keyboard.',
    lead: 'A month grid, a week of day columns with an all-day row and an hour axis, or one day\'s hours, with Previous, Today and Next, the range shown and a view switch. Events are `cm-calendar-event` children, drawn as chips with a time, a title, the kind (as text, or as the icon in the month view) and a tone colour on a 3px bar. Drag a chip to another day or time, or focus it, press Space and use the arrow keys. Each move fires a cancelable `cm-move` for your app to save; each new range fires `cm-range-change` so you can load its events.',
    examples: [
      { title: 'Outreach planner: month', description: 'Everyone\'s calls, follow-ups, demos and meetings for November. A day with more than three events shows "+N more", which lists the whole day. Drag a chip to another day (the time stays), or Tab to it, press Space, use the arrow keys (Down is a week later) and press Enter. "+" on a day fires `cm-add` with the date; this example adds a follow-up at 10 am.',
        html: `<cm-calendar label="Outreach planner" date="2026-11-18">
${outreachEvents}
</cm-calendar>` },
      { title: 'Week', description: 'Seven day columns with an all-day row and the hours. Events sit at their time and are as tall as they last; events at the same time share the hour side by side. Drag a chip to another day or time (it snaps to `step`, 15 minutes), or press Space and use Up and Down (15 minutes), Page Up and Page Down (an hour), Left and Right (a day). Click an empty hour to add at that time.',
        html: `<cm-calendar label="Outreach planner" view="week" date="2026-11-18">
${outreachEvents}
</cm-calendar>` },
      { title: 'Day', description: 'One day\'s hours, for a sales rep\'s own plan. `step="30"` moves events in half hours.',
        html: `<cm-calendar label="My day" view="day" date="2026-11-18" step="30">
${outreachEvents}
</cm-calendar>` },
      { title: 'Loading the range from your API', description: 'Listen for `cm-range-change`: it fires on the first render and whenever the days shown change, with `{ view, start, end }` (ISO dates, both included). Set `loading` while you fetch, replace the `cm-calendar-event` children, then clear `loading`. Save moves in `cm-move` and pass the request to `detail.waitUntil(promise)`: the event shows as saving and goes back if it fails. This example shows `loading` for a moment on each new range.',
        html: `<cm-calendar label="Outreach planner" date="2026-11-18" data-calendar-load>
${outreachEvents}
</cm-calendar>` },
      { title: 'Keyboard instructions', description: 'Where many people use the keyboard, say how moving works on the page too; screen readers already hear it with each event.',
        html: `<p style="margin:0 0 12px;font-size:14px">Tab into the calendar and use the arrow keys to move between days, hours and events; Page Up and Page Down show the previous or next period. To move an event: press Space, choose a day or time with the arrow keys, then press Enter. Escape cancels. Enter on an event opens it; Enter on "+" adds one.</p>
<cm-calendar label="Follow-ups" view="week" date="2026-11-18">
${outreachEvents}
</cm-calendar>` },
    ],
    states: [
      { title: 'Loading', description: '`loading` marks the grid busy, shows a spinner by the range and announces "Loading events".',
        html: `<cm-calendar label="Outreach planner" date="2026-11-18" loading></cm-calendar>` },
      { title: 'Empty', description: 'With no events the days stay, each with its "+", so the first event can be added. Say why it is empty nearby when that helps ("No follow-ups this week").',
        html: `<cm-calendar label="Outreach planner" view="week" date="2026-11-18"></cm-calendar>` },
      { title: 'Saving, locked and read-only', description: 'During `detail.waitUntil(promise)` an event is `pending`: greyed with a small spinner, read as "…, Saving", and it can\'t be moved again. `locked` events (no permission) can be opened but not moved. `readonly` hides the "+" buttons and turns moving off for the whole calendar.',
        html: `<cm-calendar label="Outreach planner" view="day" date="2026-11-18" day-start="9">
  <cm-calendar-event value="s1" heading="Call Ravi Stores" start="2026-11-18T10:00" end="2026-11-18T10:30" kind="Follow-up" tone="attention" icon="phone" pending></cm-calendar-event>
  <cm-calendar-event value="s2" heading="Board review" start="2026-11-18T11:00" end="2026-11-18T12:00" kind="Meeting" icon="handshake" locked></cm-calendar-event>
</cm-calendar>` },
    ],
    do: [
      'Give every event a `value` (the record id), a `kind` and a `tone`, and keep one tone per kind everywhere. Add an `icon` per kind as well: the month view shows the icon instead of the kind\'s name.',
      'Load events in `cm-range-change`, for the days it reports, and set `loading` while you fetch.',
      'Save each move in `cm-move` and pass the request to `detail.waitUntil()`. Cancel the event (`preventDefault()`) for moves that are never allowed (a past day, a holiday), and say why nearby.',
      'Set `today` from your server when the device\'s clock or time zone may be wrong, and `first-day-of-week` when your users expect a different start than their language\'s.',
      'In React, Vue and other frameworks that render from data, set `controlled` and change the event\'s `start` and `end` in your state in the `cm-move` listener.',
      'Offer a list of the same events (a [[Resource list|/components/resource-list]] or [[Data table|/components/data-table]]) for searching and bulk changes.',
    'To open the week or day view at the first event after loading, set `day-start` to its hour (the view scrolls again when it changes), or call `scrollToHour(h)`.'],
    dont: [
      'Don\'t make dragging the only way to reschedule: the record\'s own page should have a date and time field too ([[Date picker|/components/date-picker]] with `time`).',
      'Don\'t rely on colour alone: every event needs a `kind` (or an `icon`).',
      'Don\'t put long text in titles: chips are one line in the month view. Put the record\'s name first ("Call Ravi Stores").',
      'Don\'t use it to pick a date: use [[Date picker|/components/date-picker]] or [[Date range picker|/components/date-range-picker]].',
    ],
    content: [
      'Titles start with the action and the record: "Call Ravi Stores", "Demo for Kiran Foods".',
      'Kinds are one or two words, in sentence case: "Follow-up", "Demo", "Meeting", "Deadline".',
    ],
    a11y: [
      '**Structure:** the calendar is a group named by `label`. The range ("November 2026") is a heading (`heading-level`, 2 by default) and a polite live region, so Previous and Next are announced. The view switch is a group of toggle buttons (`aria-pressed`).',
      '**Month view** is a `grid` (a table) with the weekday names as column headers and one row per week. Each day cell holds its "+" button ("Add on Wednesday 18 November"), its event chips and "+N more" ("2 more on Wednesday 18 November", a button that opens a non-modal dialog listing the whole day). Today has `aria-current="date"`. **Why a grid, and why focus goes to the things inside the cells:** grid semantics give screen readers the weekday and week as you move, and the arrow keys are free for moving focus, which the move model needs once an event is picked up. Focus lands on the buttons inside each cell, not on the cell, so every action is one key away.',
      '**Week and day views** are a `grid` too: a row of day headings, an all-day row and one row per hour (the hour is the row header), with a cell per day. An empty hour is a button ("Add at 3:00 pm, Wednesday 18 November"); events sit in the cell of the hour they start in.',
      '**Events** are buttons (links with `href`) named in full: "Call Ravi Stores, Wednesday 18 November, 3:00 to 3:30 pm, Follow-up", with the role description "movable event" and a description of the keys. The kind is also written on the chip (or shown as its icon), so colour is never the only signal.',
      '**Keyboard, moving focus:** the grid is one Tab stop. In the month view, Left and Right go to the previous or next day (keeping the position in the day), Up and Down through a day\'s "+", events and "+N more" and on to the week above or below, Home and End to the start or end of the week. In the week and day views, Up and Down go through a day\'s all-day row and hours, Left and Right to the same hour in the next day, Home and End to the first or last day. Page Up and Page Down show the previous or next period everywhere. In right-to-left languages Left and Right swap.',
      '**Keyboard, moving an event** (the shared move model of [[Board|/components/board]]): Space picks it up. In the month view Left and Right choose the previous or next day and Up and Down the same day a week before or after; in the week and day views Up and Down move it by `step` (15 minutes), Page Up and Page Down by an hour, Home and End to the start or end of the day, and Left and Right to another day. Space or Enter drops, Escape cancels, and so does Tab or moving focus away. Moves stay inside the days shown. Focus stays on the event after it moves.',
      'Every step is announced through an assertive live region: "Picked up Call Ravi Stores. Wednesday 18 November, 3:00 to 3:30 pm.", "Thursday 19 November, 3:00 to 3:30 pm.", "Moved Call Ravi Stores to Thursday 19 November, 3:00 to 3:30 pm.", "Move cancelled. Call Ravi Stores is back on Wednesday 18 November." Refused and failed moves are announced too.',
      'Pointer: drag with a mouse after moving 4px; on touch, press and hold for 0.3 seconds, so swiping still scrolls. The event stays where it was with a dashed outline and a dashed placeholder shows where it will land; in the week and day views the time grid scrolls when you drag near its top or bottom. Escape cancels a drag.',
      'Narrow month view: the days are buttons named with their date and count ("Tuesday 24 November, 4 events"); the chosen day has `aria-selected`, and its list follows the grid under a heading.',
      'Screen readers in browse mode keep the arrow keys for reading, so the record page\'s date field (or your own "Move to" menu calling `moveEvent()` or `pickUp()`) is the way for many screen-reader users. Dragging is never the only way.',
      'Not yet tested with screen readers by people (automated checks only).',
    ],
    related: ['board', 'date-picker', 'date-range-picker', 'resource-list', 'badge'],
  },
  {
    slug: 'nested-list', tag: 'cm-nested-list', react: 'NestedList', name: 'Nested list', group: 'Lists',
    responsive: ["When the window is 640px wide or less, rows keep their 48px height with 8px side padding; child rows are indented 20px instead of 48px, and the list header is at least 56px tall with a 16px title."],
    parts: [{ tag: 'cm-nested-item', react: 'NestedItem' }],
    summary: 'Rows that nest inside each other, such as menu links or sub-categories, with reordering.',
    lead: 'A grey bar at least 64px tall with a 20px semibold title and actions, then 48px bordered rows of 14px text indented 48px per level. With `sortable`, each row starts with a drag handle; with `collapsible`, a round black button shows and hides the rows.',
    examples: [
      { title: 'Categories, sortable', html: `<cm-nested-list heading="Clothing & accessories" sortable>
  <cm-toggle slot="actions" checked aria-label="Show Clothing & accessories"></cm-toggle>
  <cm-nested-item label="Footwear and shoes"><cm-toggle slot="actions" aria-label="Show Footwear and shoes"></cm-toggle></cm-nested-item>
  <cm-nested-item label="Games & toys"><cm-toggle slot="actions" aria-label="Show Games & toys"></cm-toggle></cm-nested-item>
  <cm-nested-item label="Pet items">
    <cm-toggle slot="actions" checked aria-label="Show Pet items"></cm-toggle>
    <cm-nested-item label="Accessories"><cm-toggle slot="actions" checked aria-label="Show Accessories"></cm-toggle></cm-nested-item>
    <cm-nested-item label="Exclusive items">
      <cm-toggle slot="actions" checked aria-label="Show Exclusive items"></cm-toggle>
      <cm-nested-item label="Limited editions"><cm-toggle slot="actions" checked aria-label="Show Limited editions"></cm-toggle></cm-nested-item>
    </cm-nested-item>
  </cm-nested-item>
</cm-nested-list>` },
      { title: 'Navigation menu, collapsible', html: `<cm-nested-list heading="Header" collapsible sortable>
  <cm-button slot="actions" variant="primary" size="large">Add links</cm-button>
  <cm-nested-item label="Home">
    <cm-badge slot="actions" tone="success">Accepted</cm-badge>
    <cm-button slot="actions" size="slim">Edit</cm-button>
    <cm-button slot="actions" size="slim">Delete</cm-button>
  </cm-nested-item>
</cm-nested-list>` },
      { title: 'Move rows between lists', description: 'Since 1.3. Give sortable lists the same `group` and their top-level rows move between them: drag a handle onto another list (mouse or touch), or focus a handle and press ↓ on the last row (↑ on the first) to move it into the next (previous) list. The component moves the element and fires a cancelable `cm-move` on the row, with `detail: { item, from, to, fromList, toList }`; it bubbles through the list the row leaves, so listen on a common container or `document`. Moves inside one list still fire `cm-reorder`. For a "Move to…" menu, call `item.moveToList(list, index)`. An empty list in a group shows a drop area.',
        html: `<div class="stack">
<cm-nested-list heading="Lead details" group="layout" sortable heading-level="3">
  <cm-nested-item label="Lead name" value="name"></cm-nested-item>
  <cm-nested-item label="Company" value="company"></cm-nested-item>
  <cm-nested-item label="Phone" value="phone"></cm-nested-item>
</cm-nested-list>
<cm-nested-list heading="Contact details" group="layout" sortable heading-level="3">
  <cm-nested-item label="Email" value="email"></cm-nested-item>
  <cm-nested-item label="City" value="city"></cm-nested-item>
</cm-nested-list>
<cm-nested-list heading="Hidden fields" group="layout" sortable heading-level="3"></cm-nested-list>
</div>` },
    ],
    do: ['Listen for `cm-reorder` to save the new order; call `preventDefault()` to refuse a move.', 'Between lists with a `group`, listen for `cm-move` (on `document` or a container of all the lists) to save which list each row is in; `preventDefault()` refuses the move, and the row stays where it was.', 'Give icon-only controls in a row a name that includes the row: "Edit Home", "Delete Home".', 'Keep nesting to three levels or fewer.'],
    dont: ['Don\'t use it for long lists of products or orders: use a resource list.', 'Don\'t rely on drag and drop alone to explain reordering: the handles also move with ↑/↓.'],
    content: ['Row labels are the names merchants gave the links or categories.', 'Heading is the menu or parent category name.'],
    a11y: ['The rows are nested lists (`list`/`listitem`), so screen readers announce the level and position.', 'Drag handles are buttons named "Reorder {label}": ↑/↓ move the row among its siblings, Home/End to the ends. The new position is announced.', 'In lists with a `group` (since 1.3), ↓ on the last row moves it to the top of the next list in the group and ↑ on the first row to the end of the previous one (lists that are collapsed, not sortable or in another group are skipped). Focus stays on the handle, and the target list announces "Phone moved to Contact details, position 1 of 3."; the handle\'s hint says the arrows cross lists.', 'Touch: the handle drags with pointer events (and doesn\'t scroll the page); the row moves when the finger lifts. Mouse drags use HTML drag and drop.', 'Only top-level rows move between lists; nested rows move among their siblings. To change a row\'s parent item, edit it.', 'The collapse button has `aria-expanded` and is named "Hide {heading}" / "Show {heading}".', 'The heading is 20px semibold (16px on phones); drag handles use the `drag` icon; row actions come from your own components (toggle, buttons, badge).'],
    related: ['accordion', 'toggle', 'resource-list'],
  },
  {
    slug: 'report-tile', tag: 'cm-report-tiles', react: 'ReportTiles', name: 'Report tile', group: 'Lists',
    responsive: ["When the window is wider than 640px, tiles are 146px wide and each row holds as many as fit.", "At 640px or less, each row holds exactly three tiles, which share the width; tiles are 104px tall with 32px icons and 13px names."],
    parts: [{ tag: 'cm-report-tile', react: 'ReportTile' }],
    summary: 'Square tiles that open reports, grouped under a title such as "Sales".',
    lead: '146 × 120px tiles with a `border-subtle` edge, a 40px icon and a 14px medium name, 12px apart. Pinned tiles show a pin in the corner. On phones tiles are 104px high, three to a row, with a 32px icon.',
    examples: [
      { title: 'Sales reports', html: `<cm-report-tiles heading="Sales">
  <cm-report-tile label="Hourly sales" icon="clock" href="#/components/report-tile"></cm-report-tile>
  <cm-report-tile label="Daily sales" icon="calendar" href="#/components/report-tile"></cm-report-tile>
  <cm-report-tile label="Monthly sales" icon="chart" href="#/components/report-tile" pinned></cm-report-tile>
  <cm-report-tile label="Sales by product" icon="box" href="#/components/report-tile"></cm-report-tile>
  <cm-report-tile label="Sales by payment" icon="cart" href="#/components/report-tile"></cm-report-tile>
  <cm-report-tile label="Customers" icon="users" href="#/components/report-tile"></cm-report-tile>
</cm-report-tiles>` },
    ],
    do: ['Group tiles by subject ("Sales", "Customers", "Inventory") with one `cm-report-tiles` each.', 'Use `href` so tiles open in a new tab with a middle click.', 'Pin the reports merchants use most; pinned tiles also appear on the dashboard.'],
    dont: ['Don\'t put numbers or charts in a tile: tiles only open reports. To show a total, use a [[Metric|/components/metric]].', 'Don\'t use long names that wrap to three lines.'],
    content: ['Names are two or three words in sentence case: "Hourly sales", "Sales by payment".', 'Group titles are one word where possible: "Sales".'],
    a11y: ['Tiles form a list named by the group heading; each tile is one link (or button) named by its label.', 'A pinned tile adds ", pinned" to its name; the pin icon itself is hidden.', 'Icons are decorative and hidden from screen readers.', 'Tiles use the line icons (`clock`, `calendar`, `chart`, …); pass your own artwork in the `icon` slot. Tiles stretch to fill the row on phones.'],
    related: ['card', 'smart-tip', 'nested-list'],
  },
  {
    slug: 'sparkline', tag: 'cm-sparkline', react: 'Sparkline', name: 'Sparkline', group: 'Lists',
    responsive: ['32px tall by default (`--cm-sparkline-height`); as wide as its container, at most `--cm-sparkline-width`.'],
    summary: 'A word-sized chart of one series over time, beside the figure it explains: visits in the last 30 days, orders this week.',
    lead: 'Since 1.10.0. Bars (the default) for counts per day or week, a line (`type="line"`) for a level that moves. No axes or numbers of its own: put the figure next to it. Neutral bars are grey with the latest one in the text colour; `tone="information"` or `"success"` colours them. Time runs left to right in every language. Screen readers hear one sentence: the total, the peak (and when, with `labels`) and the latest value.',
    examples: [
      { title: 'Visits on a record', description: 'With `labels`, pointing at a bar shows its day and count.',
        html: `<cm-info-panel heading="Website visit summary" style="max-width:360px">
  <cm-info-item half label="Visits">14</cm-info-item>
  <cm-info-item half label="Last visit">Today, 10:42</cm-info-item>
  <cm-info-item label="Visits, last 14 days">
    <cm-sparkline label="Visits, last 14 days" values="[0,1,0,0,2,1,0,3,0,1,2,0,1,3]"
      labels='["4 Nov","5 Nov","6 Nov","7 Nov","8 Nov","9 Nov","10 Nov","11 Nov","12 Nov","13 Nov","14 Nov","15 Nov","16 Nov","17 Nov"]'></cm-sparkline>
  </cm-info-item>
</cm-info-panel>` },
      { title: 'Line and tones', html: `<div style="display:grid;gap:16px;max-width:240px">
  <cm-sparkline type="line" label="Visitor score, last 8 weeks" values="[12,18,15,22,30,28,35,41]"></cm-sparkline>
  <cm-sparkline tone="information" label="Leads per day" values="4,6,3,8,5,9,7"></cm-sparkline>
  <cm-sparkline tone="success" label="Orders per day" values="2,3,5,4,6,8,9"></cm-sparkline>
</div>` },
    ],
    do: ['Say what it covers in the label next to it ("Visits, last 14 days") and give the same words to `label`.', 'Use bars for counts and a line for levels.'],
    dont: ['Don\'t use it where people need exact values or comparisons between series: use a table or a full chart.', 'Don\'t put more than about 60 points in it.'],
    content: ['The label names the series and the period: "Visits, last 14 days".'],
    a11y: ['One `role="img"` with a sentence: "Visits, last 14 days: 14 in all, peak 3 on 11 Nov, latest 3". The words are built-in strings (`sparkline.*`), numbers follow the locale.', 'The hover text per bar is for mouse users only; everything in it is also in the sentence or the figure beside the chart.'],
    related: ['metric', 'info-panel', 'report-tile'],
  },
  {
    slug: 'metric', tag: 'cm-metric', react: 'Metric', name: 'Metric', group: 'Lists',
    responsive: ['Fills the width it is given; put a row of metrics in a `cm-grid` with `min-column-width`, which drops to fewer columns, and to one on phones, as the space shrinks.', 'When the window is 640px wide or less, the tile padding is 12px instead of 20px and the figure is 20px instead of 24px. Long figures and labels wrap instead of overflowing.', 'In a grid row, every metric stretches to the height of the tallest, so tiles with and without a hint line up.'],
    summary: 'One number with its name, such as a report total or KPI, optionally linking to the list behind it.',
    lead: 'A card-like tile: a 14px medium label, a 24px semibold figure in tabular numerals (`type-heading-lg`), then an optional change ("+12%" with an arrow) and a quieter hint line. A number in `value` is formatted for the page language ("1,240"; lakh grouping "12,40,000" in `en-IN`); any other text is shown as given. With `href` the whole tile is one link. For a row of totals use [[Grid|/components/grid]]: there is no separate container.',
    examples: [
      { title: 'Report totals with hints', description: 'The CRM Reports row: each total opens its list. `cm-grid min-column-width` fits as many tiles as there is room for; resize the example to see the row wrap.',
        html: `<cm-grid min-column-width="260px" gap="16" lang="en-IN">
  <cm-metric label="SMB leads" value="1240" href="#/components/metric"></cm-metric>
  <cm-metric label="Enterprise leads" value="86" href="#/components/metric"></cm-metric>
  <cm-metric label="Demos in the next 7 days" value="3" hint="2 past demos need a result" href="#/components/metric"></cm-metric>
  <cm-metric label="Pipeline value" value="Rs. 12,40,000" hint="Open deals only" href="#/components/metric"></cm-metric>
</cm-grid>` },
      { title: 'With a change', description: '`change` is the text to show, `trend` its direction. Up is good news and down bad by default; set `trend-sentiment="negative"` when a rise is bad (more overdue tasks, more refunds) or `positive` when a fall is good. The arrow and the words read to screen readers carry the meaning, not only the colour.',
        html: `<cm-grid min-column-width="200px" gap="16" lang="en-IN">
  <cm-metric label="Won deals" value="48" change="+12%" trend="up" hint="vs last month"></cm-metric>
  <cm-metric label="New leads" value="1240" change="-5%" trend="down" hint="vs last month"></cm-metric>
  <cm-metric label="Overdue tasks" value="9" change="+3" trend="up" trend-sentiment="negative" hint="since yesterday"></cm-metric>
  <cm-metric label="Average reply time" value="2 h" change="0%" trend="flat" hint="vs last week"></cm-metric>
</cm-grid>` },
      { title: 'Loading', description: 'While the totals are fetched, set `loading`: a placeholder takes the figure\'s place, the tile is `aria-busy` and "Loading <label>" is announced politely. Keep the label visible so the row doesn\'t jump.',
        html: `<cm-grid min-column-width="200px" gap="16">
  <cm-metric label="SMB leads" loading href="#/components/metric"></cm-metric>
  <cm-metric label="Demos in the next 7 days" loading href="#/components/metric"></cm-metric>
  <cm-metric label="Pipeline value" loading href="#/components/metric"></cm-metric>
</cm-grid>` },
      { title: 'A single metric', description: 'A hint with markup goes in the `hint` slot. Without `href` the tile is plain text: nothing to focus.',
        html: `<cm-metric label="Tickets waiting" value="17" style="max-width:260px">
  <span slot="hint"><strong>4</strong> older than a day</span>
</cm-metric>` },
    ],
    do: ['Pass numbers as numbers (`value="1240"`, or `value={1240}` in React) so they are grouped for the page language; pass text only when it is already formatted, such as money with a currency ("Rs. 12,40,000").', 'Link each total to the list behind it with `href`, filtered to the same records the number counts.', 'Put a row of metrics in `cm-grid` with `min-column-width` (about 200px) so it wraps on narrow screens.', 'Say what the change compares with in the hint: "vs last month".', 'Set `trend-sentiment` whenever up is not good news.'],
    dont: ['Don\'t use it to open a report that has no single number: use a [[Report tile|/components/report-tile]].', 'Don\'t rely on colour for good or bad: always set `trend`, so there is an arrow and the direction is read out.', 'Don\'t put buttons or other links inside a linked metric: the whole tile is one link.', 'Don\'t show more than one figure in a tile: split it into two metrics.'],
    content: ['Labels name what is counted, in two to four words and sentence case: "SMB leads", "Demos in the next 7 days".', 'Hints are one short line, no full stop: "2 past demos need a result".', 'Write the change as it should read, with its sign: "+12%", "-3".'],
    a11y: ['With `href` the tile is a single link whose accessible name is the label and the figure ("SMB leads 1,240"); the change and hint are its description. Without `href` nothing in it takes focus.', 'The change arrow is decorative; screen readers hear the direction and whether it is good news in words ("Up +12%, good"). Wording is in the `metric` strings (`up`, `down`, `flat`, `good`, `bad`).', 'While `loading`, the figure is replaced by a hidden placeholder, the tile has `aria-busy="true"` and "Loading <label>" is announced through a polite status region (key `loadingValue`).', 'Colours meet WCAG AA on `bg-surface` in light and dark: label and figure `text-default`, hint and flat change `text-tertiary`, good `text-success`, bad `text-critical`. These pairs are in the token contrast check.', 'Arrows follow the reading direction: in right-to-left text up points up-left and down points down-left.', 'The figure uses the `type-heading-lg` token: 24px semibold (20px on phones).'],
    related: ['grid', 'report-tile', 'card'],
  },
  {
    slug: 'app-frame', tag: 'cm-app-frame', react: 'AppFrame', name: 'App frame', group: 'Navigation', adminOnly: true,
    responsive: ['Follows the frame\'s own width (normally the window\'s): at 1024px and wider the side navigation sits on the start side under the header; narrower, the side navigation is hidden and the bottom navigation is fixed to the bottom of the window, with the page padded so nothing hides behind it.', 'With `panel`, at 1024px and wider the page sits in a white rounded panel with a `space-20` gutter; narrower, the panel is edge to edge without corners.', 'The header sticks to the top, below the device\'s notch or status bar (`env(safe-area-inset-top)`). The side navigation sticks under the header and scrolls on its own when it is taller than the window. The page scrolls with the window.', 'The mobile menu, while `menu-open` is set and the frame is narrower than 1024px, covers the window above the page and header and below the bottom navigation.'],
    summary: 'The admin\'s frame: header bar, side or bottom navigation, mobile menu and the page, in their places.',
    lead: 'One element that puts the parts of the admin together: the Header bar across the top, the Side navigation down the start side, the page next to it, and on phones and small tablets the Bottom navigation with the Mobile menu instead. Every Commmerce product gets the same grid without writing its own CSS. See [[Admin frame|/patterns/admin-frame]] for the whole thing at desktop and phone widths. Add `panel` for the merchant dashboard look: a white header on the grey page, the side navigation as an inset card, and the page in a white panel with 12px corners and a 1px `border-subtle` edge, `space-20` from the navigation and the window edges (`--cm-app-frame-gutter` changes it). A `cm-page` inside drops its grey background. On phones the panel runs edge to edge.',
    examples: [
      { title: 'Desktop, with panel', description: '`panel`: the page in a white rounded panel beside the side navigation card, on the grey page under the white header. The frame is 1100px wide here (scroll sideways in a narrow preview), so it shows the desktop layout.',
        html: `<div style="height:520px;overflow:auto;border-radius:12px;--cm-app-frame-height:520px">
<div style="width:1100px;transform:translateZ(0)">
<cm-app-frame panel>
  <cm-header-bar slot="header" user-name="Demo user">
    <img slot="logo" src="assets/logo-placeholder.svg" alt="Store logo" width="152" height="11">
  </cm-header-bar>
  <cm-side-navigation slot="navigation">
    <cm-nav-item label="Dashboard" icon="home" href="#/components/app-frame"></cm-nav-item>
    <cm-nav-item label="Orders" icon="bag" href="#/components/app-frame" current badge="12"></cm-nav-item>
    <cm-nav-item label="Products" icon="box" href="#/components/app-frame"></cm-nav-item>
  </cm-side-navigation>
  <cm-page>
    <cm-page-header slot="header" heading="Orders"><cm-button slot="actions" variant="primary">Create order</cm-button></cm-page-header>
    <cm-card heading="Today">12 orders · Rs. 18,400</cm-card>
  </cm-page>
</cm-app-frame>
</div>
</div>` },
      { title: 'Phone: bottom navigation and menu', description: 'The preview is narrower than 1024px, so it shows the phone layout. Press More to open the Mobile menu, and again (or Esc) to close it. The two outer divs only keep the example in its box: in your app, `cm-app-frame` is the top element of the page. The desktop layout is on the [[Admin frame|/patterns/admin-frame]] page.',
        html: `<div style="height:560px;transform:translateZ(0);overflow:hidden;border-radius:12px;--cm-app-frame-height:560px">
<div style="height:100%;overflow:auto">
<cm-app-frame panel menu-item="more">
  <cm-header-bar slot="header" store="preprod.commmerce.com" user-name="Demo user">
    <img slot="logo" src="assets/logo-placeholder.svg" alt="Store logo" width="190" height="14">
  </cm-header-bar>
  <cm-side-navigation slot="navigation" collapsible>
    <cm-nav-item label="Dashboard" icon="home" href="#/components/app-frame"></cm-nav-item>
    <cm-nav-item label="Orders" icon="bag" href="#/components/app-frame" current badge="12"></cm-nav-item>
    <cm-nav-item label="Products" icon="box" href="#/components/app-frame"></cm-nav-item>
  </cm-side-navigation>
  <cm-page>
    <cm-page-header slot="header" heading="Orders"></cm-page-header>
    <cm-card heading="Today">12 orders · Rs. 18,400</cm-card>
  </cm-page>
  <cm-bottom-navigation slot="bottom-navigation">
    <cm-nav-item label="Home" icon="home" href="#/components/app-frame"></cm-nav-item>
    <cm-nav-item label="Orders" icon="bag" href="#/components/app-frame" current></cm-nav-item>
    <cm-nav-item label="Quick add" icon="plus" primary></cm-nav-item>
    <cm-nav-item label="Products" icon="box" href="#/components/app-frame"></cm-nav-item>
    <cm-nav-item label="More" icon="more" value="more"></cm-nav-item>
  </cm-bottom-navigation>
  <cm-mobile-menu slot="mobile-menu" store="preprod.commmerce.com" user-name="Demo user">
    <cm-nav-item label="Panels">
      <cm-nav-item label="Customers" icon="users" href="#/components/app-frame"></cm-nav-item>
      <cm-nav-item label="Reports" icon="chart" href="#/components/app-frame"></cm-nav-item>
      <cm-nav-item label="Settings" icon="settings" href="#/components/app-frame"></cm-nav-item>
    </cm-nav-item>
  </cm-mobile-menu>
</cm-app-frame>
</div>
</div>` },
    ],
    do: ['Make it the top element of every page of a Commmerce product, with the same navigation items on every page.', 'Use `panel` for products built on the merchant dashboard frame (the admin, CRM). It replaces hand-written margins and corners around the page: delete those when you add it.', 'Set `menu-item="more"` and give the bottom navigation\'s More item `value="more"`, unless you need to open the menu yourself.', 'Remember the merchant\'s collapsed side navigation: listen for `cm-collapse` and set `collapsed` from what you stored.'],
    dont: ['Don\'t use it inside an app: the admin already draws this frame around apps.', 'Don\'t put another `main`, `header` or `nav` around its parts: the frame and the parts bring their own landmarks.', 'Don\'t set `fixed` on the bottom navigation or position the parts yourself: the frame does it.'],
    content: ['The frame has no text of its own. Words come from the parts.'],
    a11y: ['Adds one landmark, `main`, around the page. The header bar is the `banner` and each navigation is a `nav`; only the one that fits the width is shown, so screen readers find a single main menu.', 'While the mobile menu is open, the header and page behind it are inert, so Tab and screen readers stay in the menu and the bottom navigation.', 'With `menu-item`, opening the menu moves focus to its first row; Esc or More closes it and focus goes back to More. Choosing a row closes it.', 'Logical CSS: in right-to-left languages the side navigation is on the right.', 'The bottom navigation\'s More button does not say whether the menu is open (no `aria-expanded`): it is a navigation item, like the other tabs.'],
    related: ['side-navigation', 'header-bar', 'bottom-navigation', 'mobile-menu', 'page'],
  },
  {
    slug: 'side-navigation', tag: 'cm-side-navigation', react: 'SideNavigation', name: 'Side navigation', group: 'Navigation', adminOnly: true,
    parts: [{ tag: 'cm-nav-item', react: 'NavItemElement' }],
    summary: 'The admin\'s main menu down the left of the page, with sections that open.',
    lead: 'A 220px black panel (owner standard, 1.6; was 250px) with 12px corners, inset 20px from the page edges. Each 36px row (44px on touch screens), padded 12px at the sides, has a 20px line icon and a 14px label (sub-items 32px); badges are small sentence-case pills; sections end in a chevron and open to show their sub-items. The current page is white and bold, the rest light grey. Items come from `cm-nav-item` children or a JSON `items` property, so every Commmerce product can fill it with its own destinations.',
    examples: [
      { title: 'Commmerce admin', description: 'The items of the live admin. A section that holds the current page opens on its own.',
        html: `<cm-side-navigation>
  <cm-nav-item label="Dashboard" icon="home" href="#dashboard" current></cm-nav-item>
  <cm-nav-item label="Catalog" icon="box">
    <cm-nav-item label="Products" href="#products"></cm-nav-item>
    <cm-nav-item label="Categories" href="#categories"></cm-nav-item>
    <cm-nav-item label="Inventory" href="#inventory"></cm-nav-item>
  </cm-nav-item>
  <cm-nav-item label="Orders" icon="bag">
    <cm-nav-item label="All orders" href="#orders"></cm-nav-item>
    <cm-nav-item label="Abandoned carts" href="#abandoned"></cm-nav-item>
  </cm-nav-item>
  <cm-nav-item label="WebPOS" icon="pos" href="#webpos"></cm-nav-item>
  <cm-nav-item label="Customers" icon="users">
    <cm-nav-item label="All customers" href="#customers"></cm-nav-item>
    <cm-nav-item label="Customer groups" href="#customer-groups"></cm-nav-item>
  </cm-nav-item>
  <cm-nav-item label="Subscriptions" icon="repeat" href="#subscriptions"></cm-nav-item>
  <cm-nav-item label="Website" icon="website">
    <cm-nav-item label="Themes" href="#themes"></cm-nav-item>
    <cm-nav-item label="Pages" href="#pages"></cm-nav-item>
    <cm-nav-item label="Menus" href="#menus"></cm-nav-item>
  </cm-nav-item>
  <cm-nav-item label="Apps" icon="apps" href="#apps"></cm-nav-item>
  <cm-nav-item label="Reports" icon="chart" href="#reports"></cm-nav-item>
  <cm-nav-item label="Marketing" icon="megaphone">
    <cm-nav-item label="Discounts" href="#discounts"></cm-nav-item>
    <cm-nav-item label="Campaigns" href="#campaigns"></cm-nav-item>
  </cm-nav-item>
  <cm-nav-item label="Staff" icon="staff">
    <cm-nav-item label="Team members" href="#staff"></cm-nav-item>
    <cm-nav-item label="Roles" href="#roles"></cm-nav-item>
  </cm-nav-item>
  <cm-nav-item label="Settings" icon="settings">
    <cm-nav-item label="Store details" href="#store"></cm-nav-item>
    <cm-nav-item label="Payments" href="#payments"></cm-nav-item>
    <cm-nav-item label="Shipping" href="#shipping"></cm-nav-item>
  </cm-nav-item>
</cm-side-navigation>` },
      { title: 'Inside a sub-section', description: 'Mark the sub-item as `current`; its section opens and its label turns white.',
        html: `<cm-side-navigation>
  <cm-nav-item label="Dashboard" icon="home" href="#dashboard"></cm-nav-item>
  <cm-nav-item label="Orders" icon="bag">
    <cm-nav-item label="All orders" href="#orders" current></cm-nav-item>
    <cm-nav-item label="Abandoned carts" href="#abandoned"></cm-nav-item>
  </cm-nav-item>
  <cm-nav-item label="Apps" icon="apps" href="#apps" badge="New"></cm-nav-item>
</cm-side-navigation>` },
      { title: 'Collapsed to icons', description: '`collapsed` shows a 72px rail. Hover or focus an item to see its label; a numeric badge stays as a small count, any other badge as a dot. `collapsible` adds the button at the bottom, which fires `cm-collapse` so your app can remember the choice. Choosing a section in the rail expands the menu and opens the section.',
        html: `<cm-side-navigation collapsed collapsible>
  <cm-nav-item label="Dashboard" icon="home" href="#dashboard"></cm-nav-item>
  <cm-nav-item label="Orders" icon="bag" href="#orders" current badge="12"></cm-nav-item>
  <cm-nav-item label="Customers" icon="users" href="#customers"></cm-nav-item>
  <cm-nav-item label="Apps" icon="apps" href="#apps" badge="New"></cm-nav-item>
  <cm-nav-item label="Settings" icon="settings">
    <cm-nav-item label="Store details" href="#store"></cm-nav-item>
    <cm-nav-item label="Payments" href="#payments"></cm-nav-item>
  </cm-nav-item>
</cm-side-navigation>` },
    ],
    do: ['Use one side navigation per product, on every page, with the same items in the same order.', 'Mark exactly one item `current`.', 'Use the `cm-navigate` event (and `preventDefault()`) when your app routes on the client.', 'Below 1024px, hide it and show a Bottom navigation with a Mobile menu instead. The [[App frame|/components/app-frame]] does this for you.', 'To let merchants collapse it, add `collapsible` (or your own button that sets `collapsed`), listen for `cm-collapse` and store the choice, so the menu stays collapsed on the next page.', 'Give every item an icon if the menu can be collapsed: without one, the rail shows the label\'s first letter.'],
    dont: ['Don\'t use it inside an app: apps run inside the admin, which already has this menu.', 'Don\'t nest more than one level: deeper items are listed under their section, indented.', 'Don\'t put actions ("Add product") in the menu: it only goes to places.'],
    content: ['One or two words per item, naming a place: "Orders", "Staff". Keep each label to about 18 characters so it fits the 220px menu on one line; a longer label wraps and crowds its row.', 'Keep the order merchants know: Dashboard first, Settings last.'],
    a11y: ['A `nav` landmark named "Main" (set `label` to change it). Items are links; the current one has `aria-current="page"`.', 'Sections are buttons with `aria-expanded` and `aria-controls`. Enter or Space opens and closes them; → opens, ← closes or goes back to the section from a sub-item.', '↑/↓ move between visible items, Home/End jump to the first and last. Tab still moves through every item.', 'Collapsed: each item keeps its label as its accessible name (visually hidden, with the badge in brackets) and shows it in a tooltip on hover and keyboard focus. The tooltip only repeats the name, so it is not added as a description. Sub-items are hidden; a section is a button that expands the menu and opens it. ← and → do nothing in the rail. The built-in button is named "Collapse menu" or "Expand menu" (translatable: `collapse`, `expand`).', 'Unselected items use the new `text-on-dark-secondary` token (#B5B5B5, 10:1 on black, AA on the hover fill); icons are decorative.', 'Differs from the live admin screenshot: icons are our line icons (the admin uses filled glyphs); new icons drawn for this: `pos`, `repeat`, `website`, `apps`, `megaphone`, `staff`. The source of truth is the admin screenshot, not the older Figma "Dashboard" page.'],
    related: ['app-frame', 'header-bar', 'bottom-navigation', 'mobile-menu', 'tooltip'],
  },
  {
    slug: 'header-bar', tag: 'cm-header-bar', react: 'HeaderBar', name: 'Header bar', group: 'Navigation', adminOnly: true,
    responsive: ["Follows the bar's own width, not the window: at 900px or narrower the `actions` slot is hidden and the `search` slot moves behind a search button that opens it full screen; at 640px or narrower the wallet balance is hidden too and the user pill shrinks to the avatar (the name is still read by screen readers). On touch screens every control in the bar is at least 44 × 44px."],
    summary: 'The white bar across the top of the admin: logo, store switcher, account actions and the user.',
    lead: 'A 56px white bar with 14px text. The logo sits on the left, then the store switcher (with a chevron). On the right: your action buttons, the wallet balance in an outlined 36px pill and the user in a 36px rounded pill with the name and a 28px avatar. It fits its own width: under 900px the action buttons hide, and under 640px only the logo, the store and the avatar remain (put the rest in the Mobile menu). A product-wide search goes in the `search` slot: inline after the store switcher on wide bars, and behind a search button that opens it full screen at 900px or narrower.',
    examples: [
      { title: 'Commmerce admin', html: `<cm-header-bar store="preprod.commmerce.com" balance="₹ 2,312" user-name="Demo user">
  <img slot="logo" src="assets/logo-placeholder.svg" alt="Store logo" width="190" height="14">
  <cm-button slot="actions" size="large">Hire an Expert</cm-button>
  <cm-button slot="actions" variant="primary" size="large">My Subscription</cm-button>
</cm-header-bar>` },
      { title: 'With global search', description: 'Put a [[Global search|/components/global-search]] in the `search` slot. This preview is narrower than 900px, so the bar shows the search button: press it to open the search full screen (Escape, the close button or choosing a result closes it). In a full-width admin the box sits inline after the store switcher.',
        html: `<cm-header-bar store="preprod.commmerce.com" user-name="Demo user">
  <img slot="logo" src="assets/logo-placeholder-mark.svg" alt="Store logo" width="24" height="24">
  <cm-global-search slot="search" label="Search the CRM" placeholder="Search leads, deals, contacts" shortcut="/"
    results='[{"label": "Leads", "items": [{"title": "Ravi Stores", "description": "Lead · Mumbai", "href": "#lead-ravi-stores"}]}]'></cm-global-search>
</cm-header-bar>` },
      { title: 'Logo and user only', description: 'Products without stores or a wallet leave those attributes out.',
        html: `<cm-header-bar user-name="Asha Rao">
  <img slot="logo" src="assets/logo-placeholder.svg" alt="Store logo" width="190" height="14">
</cm-header-bar>` },
      { title: 'Notifications bell', description: 'Put an icon-only Button in the `end` slot with the unread count, and open the Notification panel when it is pressed (here with `data-opens`; in your product, call the panel\'s `show()` in a click listener). Keep `count` in step with the unread items. The bar has no notifications API of its own: the button and the panel are yours to wire.',
        html: `<cm-header-bar user-name="Asha Rao">
  <img slot="logo" src="assets/logo-placeholder.svg" alt="Store logo" width="190" height="14">
  <cm-button slot="end" icon-only icon="bell" label="Notifications" count="2" size="large" data-opens="header-notes"></cm-button>
</cm-header-bar>
<cm-notification-panel id="header-notes" more-href="#notifications">
  <cm-notification-item time="1 min ago" href="#order-1042" unread>New order received</cm-notification-item>
  <cm-notification-item time="12 mins ago" tone="attention" href="#stock" unread>Product low stock</cm-notification-item>
  <cm-notification-item time="1 hr ago" tone="success" href="#order-1041">Payment received</cm-notification-item>
</cm-notification-panel>` },
    ],
    do: ['Show it on every admin page, above the Side navigation.', 'Put one product-wide search in the `search` slot, not in `actions` (actions hide on narrow bars; the search slot collapses to a button instead).', 'Keep to two action buttons, with at most one primary.', 'Open a store list on `cm-store-switch` and an account menu on `cm-account` (menus arrive with batch 4).'],
    dont: ['Don\'t use it inside an app: the admin already shows it above the app.', 'Don\'t put page actions ("Save", "Add product") here; they belong in the Page header.', 'Don\'t format the balance in the component: pass the text the merchant should see.'],
    content: ['Show the store\'s address or name exactly as the merchant set it.', 'Buttons are short and in title case as in the live admin: "Hire an Expert", "My Subscription".'],
    a11y: ['A `banner` landmark. The store switcher, balance and user pill are buttons named "Store: … Switch store", "Wallet balance …" and "Account: …", which include their visible text.', 'On narrow bars the search button is named "Search" (`search-label`) with `aria-haspopup="dialog"` and `aria-expanded`. It opens a full-screen modal `<dialog>` with the same name: focus moves into the search box, the page behind is inert and does not scroll, Escape (once the results are closed) or the close button closes it, and focus returns to the button.', 'The store and user buttons say they open a menu (`aria-haspopup`).', 'The logo needs its own `alt` text that names it: the store, product or app.', 'Differs from the live admin screenshot: the avatar is a person line icon on `bg-input-filled` when there is no photo; the examples show a placeholder logo, since the `logo` slot takes your product\'s or app\'s own logo; the 18px store text shrinks to 16px when the bar is under 1100px wide.'],
    related: ['side-navigation', 'mobile-menu', 'button'],
  },
  {
    slug: 'bottom-navigation', tag: 'cm-bottom-navigation', react: 'BottomNavigation', name: 'Bottom navigation', group: 'Navigation', adminOnly: true,
    summary: 'The admin\'s tab bar on phones: five destinations along the bottom of the screen.',
    lead: 'A white bar with 12px top corners and a hairline along its top. Each item is a 20px line icon over a 12px label in sentence case. The current item is black, the others grey; the main action (`primary`, Quick add) is a black square with a white plus. The last item, "More", opens the Mobile menu.',
    examples: [
      { title: 'Commmerce admin on a phone', html: `<div style="max-width:414px">
<cm-bottom-navigation>
  <cm-nav-item label="Home" icon="home" href="#home" current></cm-nav-item>
  <cm-nav-item label="Products" icon="box" href="#products"></cm-nav-item>
  <cm-nav-item label="Quick add" icon="plus" primary></cm-nav-item>
  <cm-nav-item label="Orders" icon="bag" href="#orders"></cm-nav-item>
  <cm-nav-item label="More" icon="more" value="more"></cm-nav-item>
</cm-bottom-navigation>
</div>` },
    ],
    do: ['Show it below 1024px instead of the Side navigation, pinned with `fixed`, or put it in the [[App frame|/components/app-frame]]\'s `bottom-navigation` slot, which pins it and pads the page for you.', 'Keep to five items; the fifth is "More" and opens the Mobile menu (listen for `cm-navigate` with `value` "more").', 'While the Mobile menu is open, "More" is the current tab: set `menu-item="more"` and toggle `menu-open` with the menu, so More is highlighted and reports `aria-expanded`. The page\'s own tab keeps `aria-current`. In the [[App frame|/components/app-frame]] with `menu-item`, the frame does this for you.', 'Leave space at the bottom of the page so the bar never covers content.', '`fixed` pins the bar with `position: fixed` on the element itself, so a `position` you set on `cm-bottom-navigation` in your own CSS (for example `position: relative` from a reset or a utility class) wins and the bar stops being pinned. Don\'t set `position` on a fixed bar, or wrap it in your own fixed container. The [[App frame|/components/app-frame]] handles this for you: in its `bottom-navigation` slot the bar is pinned by the frame\'s own container, whatever position the element has.'],
    dont: ['Don\'t use it inside an app.', 'Don\'t mark more than one item `primary`.', 'Don\'t use labels longer than one word: they are truncated.'],
    content: ['One word per item: "Home", "Products", "Orders", "More". Write them in sentence case; they are shown as written.'],
    a11y: ['A `nav` landmark named "Main". Items are links (current one with `aria-current="page"`) or buttons for actions such as Quick add and More.', 'Targets are at least 48px tall and a fifth of the width.', 'Labels are 12px, the smallest text in the system; unselected items are `text-tertiary` grey. With `fixed`, the bar pads for the device\'s home indicator.'],
    related: ['app-frame', 'mobile-menu', 'side-navigation'],
  },
  {
    slug: 'mobile-menu', tag: 'cm-mobile-menu', react: 'MobileMenu', name: 'Mobile menu', group: 'Navigation', adminOnly: true,
    summary: 'The admin\'s full menu on phones, opened from "More": store, user and every section.',
    lead: 'A grey page of white cards with 12px corners. The Profile card shows the store ("Logged in to store") and the signed-in user. Then come labelled sections (13px grey headings in sentence case) of 48px rows with 16px text, a grey 20px icon and a chevron. Rows with sub-items open them on a second screen with a back arrow. A section can end with a centred action such as "Add channel".',
    examples: [
      { title: 'Commmerce admin', html: `<div style="max-width:414px">
<cm-mobile-menu store="Obiroye Garments Zix" user-name="Robinson Jain" user-email="robinson@example.com">
  <cm-nav-item label="Channels">
    <cm-nav-item label="Online Store" icon="store" href="#online-store"></cm-nav-item>
    <cm-nav-item label="Point of sale" icon="pos" href="#pos"></cm-nav-item>
    <cm-nav-item label="ONDC" icon="globe" href="#ondc"></cm-nav-item>
    <cm-nav-item label="Add channel" primary value="add-channel"></cm-nav-item>
  </cm-nav-item>
  <cm-nav-item label="Panels">
    <cm-nav-item label="Customers" icon="users" href="#customers"></cm-nav-item>
    <cm-nav-item label="Reports" icon="chart" href="#reports"></cm-nav-item>
    <cm-nav-item label="Marketing" icon="megaphone" href="#marketing"></cm-nav-item>
    <cm-nav-item label="Application" icon="apps" href="#apps" badge="3 apps active"></cm-nav-item>
  </cm-nav-item>
  <cm-nav-item label="Support">
    <cm-nav-item label="Hire an Expert" icon="user" href="#expert" badge="New"></cm-nav-item>
    <cm-nav-item label="Help Centre" icon="help" href="#help"></cm-nav-item>
  </cm-nav-item>
  <cm-nav-item label="Subscription">
    <cm-nav-item label="Subscription" icon="repeat" href="#subscription"></cm-nav-item>
    <cm-nav-item label="Refer and Earn" icon="gift" href="#refer"></cm-nav-item>
  </cm-nav-item>
  <cm-nav-item>
    <cm-nav-item label="Settings" icon="settings">
      <cm-nav-item label="Shipping" href="#shipping"></cm-nav-item>
      <cm-nav-item label="Packaging Material" href="#packaging"></cm-nav-item>
      <cm-nav-item label="Tax" href="#tax"></cm-nav-item>
      <cm-nav-item label="Domain Setup" href="#domain"></cm-nav-item>
      <cm-nav-item label="Password Protection" href="#password"></cm-nav-item>
      <cm-nav-item label="Staff Management" href="#staff"></cm-nav-item>
      <cm-nav-item label="Configuration" href="#configuration"></cm-nav-item>
    </cm-nav-item>
  </cm-nav-item>
</cm-mobile-menu>
</div>` },
    ],
    do: ['Open it from "More" in the Bottom navigation and keep the Bottom navigation visible under it.', 'Group rows the way merchants think: channels, panels, support, subscription, settings.', 'Put what the Header bar hides on phones (store, account, Hire an Expert, subscription) in here.'],
    dont: ['Don\'t use it inside an app.', 'Don\'t nest deeper than one sub-screen.', 'Don\'t put more than one action per section.'],
    content: ['Section headings are one word: "Channels", "Support".', 'Badges are two or three words: "3 apps active", "New".'],
    a11y: ['A `nav` landmark named "Menu"; each section is a region named by its heading, and rows are links or buttons.', 'Opening a row with sub-items shows a second screen and moves focus to its back button (named after the section); Back or Escape returns focus to the row.', 'Icons are decorative; the avatar letter is hidden and the row is named by the user\'s name.', 'Icons are line icons in `icon-responsive-menu` grey; badges use `nav-badge` blue with white 12px text (AA).'],
    related: ['app-frame', 'bottom-navigation', 'side-navigation', 'header-bar'],
  },
  {
    slug: 'flash-offer-bar', tag: 'cm-flash-offer-bar', react: 'FlashOfferBar', name: 'Flash offer bar', group: 'Navigation',
    responsive: ["When the window is 640px wide or less, the text starts at the left instead of the centre, and the bar is at least 44px tall."],
    summary: 'A dark strip across the top of the page with one short offer and a green link.',
    lead: 'A 48px `bg-flash-bar` strip with a green send icon and one centred 14px line of white text. The link inside it is green and medium weight. On phones the text starts at the left.',
    examples: [
      { title: 'Plan offer', html: `<cm-flash-offer-bar>
  Publish your store with a Commmerce plan - <a href="#plans">Click here</a> to pick a plan
</cm-flash-offer-bar>` },
      { title: 'Dismissible', description: 'The bar hides itself on close; remember the choice so it doesn\'t come back on every page.',
        html: `<cm-flash-offer-bar dismissible icon="percent">
  Festive sale: 20% off annual plans until 30 November. <a href="#plans">See plans</a>
</cm-flash-offer-bar>` },
    ],
    do: ['Use it for one time-limited offer or a setup step that blocks selling (publishing the store).', 'Keep it to one line on desktop.', 'Let merchants dismiss offers that are not required.'],
    dont: ['Don\'t use it for errors or warnings: use a Banner.', 'Don\'t stack two bars.', 'Don\'t put more than one link in it.'],
    content: ['Lead with the benefit, then the action: "Publish your store with a Commmerce plan - Click here to pick a plan".', 'The link text says what happens: "See plans", not just "Click here", where you can.'],
    a11y: ['A region named "Offer" (set `label` to change it), so screen-reader users can find or skip it.', 'The link is a normal link inside the text; the green (`text-speciality-on-dark`) is 6.3:1 on the bar.', 'The close button is named "Dismiss offer".', 'The icon is the line `send` icon; the bar fills its container.'],
    related: ['banner', 'header-bar'],
  },
  {
    slug: 'link-tabs', tag: 'cm-link-tabs', react: 'LinkTabs', name: 'Link tabs', group: 'Navigation',
    responsive: ["Tabs stay on one line; when they don't fit the component's width, the row scrolls sideways.", "When the window is 640px wide or less, tabs are 16px apart instead of 24px."],
    summary: 'Links between sibling pages, such as the sections of Settings.',
    lead: 'A row of 14px medium links over a thin rule, 24px apart. The page you are on is black with a underline (black, or Commmerce blue in the [[refined look|/start/themes?s=looks]]); the others are grey. Each tab is its own page with its own address, so it can be bookmarked and opened in a new tab. To filter one list in place, use Status tabs.',
    examples: [
      { title: 'Settings sections', html: `<cm-link-tabs label="Settings sections">
  <cm-nav-item label="General" href="#general" current></cm-nav-item>
  <cm-nav-item label="Payments" href="#payments"></cm-nav-item>
  <cm-nav-item label="Shipping" href="#shipping"></cm-nav-item>
  <cm-nav-item label="Tax" href="#tax"></cm-nav-item>
  <cm-nav-item label="Domains" href="#domains"></cm-nav-item>
  <cm-nav-item label="Notifications" href="#notifications"></cm-nav-item>
</cm-link-tabs>` },
      { title: 'Parts of a product, with counts', html: `<cm-link-tabs label="Product sections">
  <cm-nav-item label="Details" href="#details"></cm-nav-item>
  <cm-nav-item label="Variants" href="#variants" badge="12" current></cm-nav-item>
  <cm-nav-item label="Inventory" href="#inventory"></cm-nav-item>
  <cm-nav-item label="Reviews" href="#reviews" badge="233"></cm-nav-item>
</cm-link-tabs>` },
    ],
    do: ['Put it under the Page header, above the page content.', 'Give each tab its own URL and mark the page you are on `current`.', 'Name it with `label` ("Settings sections").'],
    dont: ['Don\'t use it to filter a list: use Status tabs.', 'Don\'t use it for steps in a sequence.', 'Don\'t use more than about seven tabs.'],
    content: ['One or two words per tab, in sentence case.', 'Counts (`badge`) are whole numbers.'],
    a11y: ['A `nav` landmark of links, not ARIA tabs: each tab loads a page, so links and `aria-current="page"` are the right semantics. Tab moves between them.', 'The current page is marked with `aria-current`, not only colour and underline.', 'Link tabs share the Status tabs styling, with 14px labels.'],
    related: ['status-tabs', 'page-header', 'side-navigation'],
  },
  {
    slug: 'app-card', tag: 'cm-app-card', react: 'AppCard', name: 'App card', group: 'Marketplace',
    responsive: ["Follows the card's own width, not the window: at 380px or narrower, the padding drops from 20px to 8px, the logo box shrinks from 128 × 56px to 100 × 40px, and the details link moves to the end of the actions row."],
    summary: 'One app in the Commmerce app marketplace: logo, name, rating, pricing, offer and actions.',
    lead: 'A white card with a `border-subtle` edge and 8px corners. A 128×56 logo tile leads, then the 16px semibold app name, "By" and the developer, a gold star with the rating and an underlined reviews link, the pricing line, an optional offer on a pale blue line, and the actions: Sign Up (primary), Contact (secondary) and an underlined View Details link. In narrow columns the padding and logo tile shrink.',
    examples: [
      { title: 'Marketplace grid', html: `<div style="display:grid;gap:var(--cm-space-24);grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">
  <cm-app-card name="Paywise Payments" developer="Appsell" rating="4.3" reviews="902" reviews-href="#reviews"
      pricing="Free plan available. 7-day free trial." offer="Bundle products and kits with Bundle Manager: 20% off" href="#paywise">
    <cm-icon slot="logo" name="wallet" size="32" label="Paywise Payments"></cm-icon>
    <cm-button slot="actions" variant="primary">Sign Up</cm-button>
    <cm-button slot="actions">Contact</cm-button>
  </cm-app-card>
  <cm-app-card name="ShipQuick" developer="Lumen Labs" rating="4.1" reviews="318" reviews-href="#reviews"
      pricing="From ₹ 499 a month." href="#shipquick">
    <cm-icon slot="logo" name="send" size="32" label="ShipQuick"></cm-icon>
    <cm-button slot="actions" variant="primary">Sign Up</cm-button>
    <cm-button slot="actions">Contact</cm-button>
  </cm-app-card>
</div>` },
      { title: 'Installed, with an on/off switch', description: 'The `status` slot sits in the top-right corner.',
        html: `<div style="max-width:410px">
<cm-app-card name="Paywise Payments" developer="Appsell" rating="4.3" reviews="902" pricing="Free plan available. 7-day free trial." href="#paywise">
  <cm-icon slot="logo" name="wallet" size="32" label="Paywise Payments"></cm-icon>
  <cm-toggle slot="status" checked aria-label="Paywise Payments on"></cm-toggle>
  <cm-button slot="actions">Settings</cm-button>
</cm-app-card>
</div>` },
    ],
    do: ['Show cards in a grid of equal columns (about 300–410px each); they stretch to the same height.', 'Use the app\'s real logo image with `alt` set to the app name.', 'Set `heading-level` to fit the page: 2 under the page title, 3 under a section heading.'],
    dont: ['Don\'t tint the logo tile with the app\'s brand colour: the admin uses Commmerce\'s palette only.', 'Don\'t put more than two buttons in `actions`.', 'Don\'t round ratings to whole stars; show one decimal.'],
    content: ['Pricing is one sentence: "Free plan available. 7-day free trial."', 'Offers are short and specific: what, how much, until when.', 'Keep the standard button words: "Sign Up", "Contact", "View Details".'],
    a11y: ['An `article` named by the app name, which is a heading (level 3 by default).', 'The rating is read as "Rated 4.3 out of 5"; the star is decorative. The reviews count is a link when `reviews-href` is set.', 'View Details is named "View details of <app>", so a page of cards doesn\'t have ten identical links.', 'The logo tile is neutral `bg-inset`, not a brand tint (owner decision: Commmerce palette only); the offer text is 12px; the star and discount icons are the `star` and `percent` line icons; cards fill their grid column.'],
    related: ['card', 'button', 'toggle'],
  },
  {
    slug: 'modal', tag: 'cm-modal', react: 'Modal', name: 'Modal', group: 'Overlays',
    responsive: ["Never wider than the window minus 32px (`small` 400px, `medium` 620px, `large` 900px otherwise)."],
    summary: 'A dialog over the page for a short task or a decision that has to be made before going on.',
    lead: 'A white panel with 12px corners over a dimmed page: a black header with the 14px title and a close button, the content with 20px padding, and the actions in a footer, right-aligned. Three widths: `small` (400px) for confirmations, `medium` (620px) and `large` (900px) for lists. It is a native modal `<dialog>`: the page behind is inert, Esc and the backdrop ask to close, the page stops scrolling, and focus returns to the button that opened it. Open it with `show()` or the `open` attribute.',
    examples: [
      { title: 'Confirm before deleting', description: 'Press the button to open it. In your app, call `show()` or set `open`.',
        html: `<cm-button data-opens="del">Delete product</cm-button>
<cm-modal id="del" heading="Delete “Linen shirt”?" size="small">
  <p style="margin:0">The product and its 4 variants will be deleted. This can't be undone.</p>
  <cm-button slot="footer">Cancel</cm-button>
  <cm-button slot="footer" variant="primary">Delete product</cm-button>
</cm-modal>` },
      { title: 'A short form', description: 'Put `autofocus` on the field the merchant will fill first.',
        html: `<cm-button data-opens="track">Change tracking info</cm-button>
<cm-modal id="track" heading="Change tracking info">
  <div style="display:grid;gap:var(--cm-space-16)">
    <cm-text-field label="Tracking number" autofocus></cm-text-field>
    <cm-select label="Carrier"><option>Delhivery</option><option>Blue Dart</option><option>Other</option></cm-select>
  </div>
  <cm-button slot="footer">Cancel</cm-button>
  <cm-button slot="footer" variant="primary">Save</cm-button>
</cm-modal>` },
    ],
    states: [
      { title: 'Error and saving', description: 'Validation errors show on the field, inside the modal; while saving, the main button shows `loading`. Press the button to open it.',
        html: `<cm-button data-opens="track-err">Change tracking info</cm-button>
<cm-modal id="track-err" heading="Change tracking info">
  <div style="display:grid;gap:var(--cm-space-16)">
    <cm-text-field label="Tracking number" value="DL12" error="Tracking numbers from Delhivery have 13 digits"></cm-text-field>
    <cm-select label="Carrier" value="Delhivery"><option>Delhivery</option><option>Blue Dart</option></cm-select>
  </div>
  <cm-button slot="footer">Cancel</cm-button>
  <cm-button slot="footer" variant="primary" loading>Save</cm-button>
</cm-modal>` },
    ],
    do: ['Use it for one short task the merchant must finish or cancel before going on.', 'Name the main action with a verb that says what happens: "Delete product", not "OK".', 'Cancel `cm-close` when closing would lose typed changes, and ask first.', 'Close it yourself (`close()`) after the main action succeeds.'],
    dont: ['Don\'t open a modal from a modal.', 'Don\'t use it for long forms or pages of content: use a page or a Side panel.', 'Don\'t use it for messages that don\'t need an answer: use a Banner.'],
    content: ['The title is a question or a task: "Delete “Linen shirt”?", "Change tracking info".', 'Say what will happen and whether it can be undone, in one or two sentences.', 'Put the main action last; Cancel first.'],
    a11y: ['A native modal `<dialog>` named by its heading; the rest of the page is inert, so Tab stays inside (it can still reach the browser\'s own controls, as with every native dialog).', 'Opening focuses the child with `autofocus`, otherwise the panel itself so its title is read. Closing returns focus to the element that opened it.', 'Esc, the close button ("Close", `close-label`) and a click on the backdrop fire a cancelable `cm-close` with `detail.reason`.', 'Page scrolling is locked while it is open.', 'Corners are 12px (`radius-lg`), with a large shadow (`shadow-lg`); widths are three fixed sizes.'],
    related: ['side-panel', 'banner', 'button'],
  },
  {
    slug: 'side-panel', tag: 'cm-side-panel', react: 'SidePanel', name: 'Side panel', group: 'Overlays',
    responsive: ["Never wider than the window (`small` 380px, `medium` 450px, `large` 720px otherwise).", "When the window is narrower than 600px, the panel becomes a card inset 16px from every edge of the screen."],
    summary: 'A panel over the right edge of the page with the details of one item, without leaving the list.',
    lead: 'A full-height white panel on the right (450px; `small` 380px, `large` 720px) over a dimmed page: a black header with the 14px title and a close button, the content with 20px padding, and an optional footer. On phones it becomes a card inset 16px from the screen edges. Like Modal it is a native modal `<dialog>`: Esc and the backdrop ask to close, the page stops scrolling, and focus returns to the opener.',
    examples: [
      { title: 'Enquiry details', description: 'Press the button to open it. In your app, call `show()` or set `open`.',
        html: `<cm-button data-opens="inq">View enquiry</cm-button>
<cm-side-panel id="inq" heading="Inquiry">
  <cm-info-panel>
    <cm-info-item label="Date added">Mar 29, 2026 3:45 AM</cm-info-item>
    <cm-info-item label="Name">Robinson Painatillo</cm-info-item>
    <cm-info-item label="Email"><a href="mailto:robinson@example.com">robinson@example.com</a></cm-info-item>
    <cm-info-item label="Message">Do you ship to Pune? I'd like 20 shirts for a team event.</cm-info-item>
  </cm-info-panel>
  <cm-accordion heading="Email and phone were found in 2 orders" style="margin-top:var(--cm-space-20)">
    <p style="margin:0"><a href="#order">#NAY0D0736</a>, 20-12-2025</p>
  </cm-accordion>
  <cm-button slot="footer" variant="primary">Reply</cm-button>
</cm-side-panel>` },
    ],
    states: [
      { title: 'Loading', description: 'Open the panel at once and fill it with skeletons while the details load. Press the button to open it.',
        html: `<cm-button data-opens="inq-load">View enquiry</cm-button>
<cm-side-panel id="inq-load" heading="Inquiry">
  <div aria-busy="true" class="stack"><cm-skeleton lines="6"></cm-skeleton></div>
</cm-side-panel>` },
    ],
    do: ['Use it to look at or lightly edit one item from a list, keeping the list in place behind.', 'Keep the title to what the item is: "Inquiry", "Order #1042".'],
    dont: ['Don\'t use it for a task that needs the whole page: open the item\'s page instead.', 'Don\'t stack a Modal on top of it.'],
    content: ['Show the most useful facts first; group the rest in Accordions.'],
    a11y: ['A native modal `<dialog>` named by its heading; the page behind is inert.', 'Opening focuses an `autofocus` child, otherwise the panel. Esc, the close button and the backdrop fire a cancelable `cm-close`; focus returns to the opener.', 'Square corners on desktop, with three widths; on phones a card inset 16px with 12px corners.'],
    related: ['modal', 'filter-panel', 'info-panel', 'accordion'],
  },
  {
    slug: 'filter-panel', tag: 'cm-filter-panel', react: 'FilterPanel', name: 'Filter panel', group: 'Overlays',
    responsive: ["The same as Side panel: never wider than the window, and below 600px of window width it becomes a card inset 16px from every edge of the screen."],
    summary: '"Search and Filter": a Side panel with a search field, the fields that narrow a list, and Reset and Search.',
    lead: 'A Side panel titled "Search and Filter". With `search` it starts with a search field ("Search anything"); then your fields in a `<form>`, 12px apart; then Reset and Search, centred at the bottom. Search fires `cm-filter-apply` with the form\'s values and the query, then closes. Reset puts the form back to its first values. Open it from the filter button of a Search field (`cm-filter`).',
    examples: [
      { title: 'Filter products', description: 'Press the filter button in the search field. In your app, listen for `cm-filter` and call `show()`.',
        html: `<cm-search label="Search products" filter data-opens="filters"></cm-search>
<cm-filter-panel id="filters" search>
  <form>
    <cm-text-field label="Product name" name="name"></cm-text-field>
    <cm-select label="Product status" name="status"><option value="">Any</option><option value="active">Active</option><option value="inactive">Inactive</option></cm-select>
    <cm-select label="Product type" name="type"><option value="">Any</option><option>Clothing</option><option>Accessories</option></cm-select>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--cm-space-12)">
      <cm-text-field label="From" name="from" type="date"></cm-text-field>
      <cm-text-field label="To" name="to" type="date"></cm-text-field>
    </div>
    <cm-text-field label="Tags" name="tags"></cm-text-field>
  </form>
</cm-filter-panel>` },
    ],
    do: ['Give every field a `name`: it becomes the key in `detail.values`.', 'Start every field empty or at "Any", so Reset means "no filters".', 'Show the number of active filters on the search field (`filter-count`).'],
    dont: ['Don\'t apply filters while the merchant is still choosing: apply on Search.', 'Don\'t put more than about eight fields here; offer the rarely used ones as a saved view instead.'],
    content: ['Field labels name what is filtered: "Product status", not "Choose status".', 'Keep the button words "Reset" and "Search" unless the list is not searched.'],
    a11y: ['A Side panel: a native modal `<dialog>` named "Search and Filter", inert page behind, Esc closes, focus returns to the filter button.', 'Enter in the search field applies, like Search. Pressing Search with the form invalid can be stopped by cancelling `cm-filter-apply`.', 'Empty values are left out of `detail.values`; a name used by several checked boxes gives an array.'],
    related: ['side-panel', 'search', 'select', 'resource-list'],
  },
  {
    slug: 'account-menu', tag: 'cm-account-menu', react: 'AccountMenu', name: 'Account menu', group: 'Navigation',
    responsive: ['The avatar is 36px (40px with a 44px hit area on touch screens). The panel is 320px wide, never wider than the window minus 32px.'],
    parts: [{ tag: 'cm-menu-item', react: 'MenuItemElement' }],
    summary: 'The signed-in person\'s menu, last in a Commmerce product\'s header bar: who is signed in, the business they work in, then Settings, Lock screen and Log out.',
    lead: 'Since 1.9.2. A round 36px avatar with a ring, always the last control in `cm-header-bar` (its `account` slot, after refresh and notifications). It opens a 320px panel aligned to its end edge: the person (40px avatar with a ring, name 16px, role and place 13px grey), a line, the business (40px round logo, name, kind) with its plan beside a green check, a line, then the `cm-menu-item` choices. With `profile-href` or `org-href` a row is a link with a chevron. Keyboard, outside click and Escape behave like the Action menu. For Commmerce products only, not for apps.',
    examples: [
      { title: 'In the header bar', description: 'Refresh, notifications, then the person, left to right. Select the avatar to open the panel.',
        html: `<div style="min-height:420px"><cm-header-bar>
  <cm-button slot="end" icon-only icon="refresh" label="Refresh"></cm-button>
  <cm-button slot="end" icon-only icon="bell" label="Notifications" count="4"></cm-button>
  <cm-account-menu slot="account" name="Asha Rao" meta="Owner · Bangalore" profile-href="#profile"
    org-name="Bangalore" org-meta="POS store" org-href="#store" plan="POS Standard">
    <cm-menu-item icon="settings" href="#settings">Settings</cm-menu-item>
    <cm-menu-item value="lock">Lock screen</cm-menu-item>
    <cm-menu-item icon="log-out" value="log-out">Log out</cm-menu-item>
  </cm-account-menu>
</cm-header-bar></div>` },
    ],
    do: ['Put it in the header bar\'s `account` slot so it is always last.', 'Show the business the person is working in, and its plan, so switching stores is one click away (`org-href`).'],
    dont: ['Don\'t use it in apps built by other developers: the account belongs to the Commmerce product.', 'Don\'t put more than about five choices in it; settings pages hold the rest.'],
    content: ['Choices in sentence case: "Lock screen", "Log out".', 'The meta line is the role and the place: "Owner · Bangalore".'],
    a11y: ['The avatar button is named "Account: {name}" and says it opens a menu; the panel is the Action menu\'s, with the arrow keys, Home, End, Escape and type-ahead.', 'The person and business rows are links when they have an href, reached with Tab.'],
    related: ['header-bar', 'action-menu', 'avatar'],
  },
  {
    slug: 'action-menu', tag: 'cm-action-menu', react: 'ActionMenu', name: 'Action menu', group: 'Overlays',
    responsive: ["The menu is at most 320px wide, and never wider than the window minus 32px."],
    parts: [{ tag: 'cm-menu-item', react: 'MenuItemElement' }],
    summary: 'A button that opens a short list of actions: row actions, "Add…" menus, or the account menu.',
    lead: 'A white list with 8px corners and a soft shadow (`shadow-md`), 4px under its trigger. Each choice is a 36px row (owner standard, 1.6; `density="compact"` 32px, 44px on touch screens) with 12px side padding, 14px text, an optional 16px icon and an optional `shortcut` hint in 12px grey at the end; the highlighted one is black with white text, a destructive (`critical`) one red on light red. `<cm-menu-item heading>` starts a section with a 12px grey heading (since 1.6). The same rows as the options of Select and Combobox. `<hr>` between `cm-menu-item`s draws a line between groups, and `heading` / `subheading` put a name and email on top (the account menu). The built-in trigger is a button with the label and a chevron, or a ⋮ icon button with `icon-only`; or bring your own with `slot="trigger"`.',
    examples: [
      { title: 'Row actions', html: `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;width:min(100%,440px);padding:8px 8px 8px 16px;background:var(--cm-bg-surface);border:1px solid var(--cm-border-subtle);border-radius:8px">
  <span><strong>#1042</strong> · Priya Sharma · Rs. 2,340</span>
  <cm-action-menu icon-only label="Order #1042 actions">
    <cm-menu-item value="cancel">Cancel shipment</cm-menu-item>
    <cm-menu-item value="tracking">Change tracking info</cm-menu-item>
  </cm-action-menu>
</div>` },
      { title: 'Add menu', html: `<cm-action-menu trigger-label="Add">
  <cm-menu-item icon="box" value="product">Add product</cm-menu-item>
  <cm-menu-item icon="menu" value="category">Add category</cm-menu-item>
  <cm-menu-item icon="users" value="customer">Add customer</cm-menu-item>
  <cm-menu-item icon="cart" value="order">Add order</cm-menu-item>
</cm-action-menu>` },
      { title: 'Sections and shortcuts', description: 'Since 1.6. `<cm-menu-item heading>` names the choices after it (up to the next heading or `<hr>`); `shortcut` shows a key hint at the end of the row and sets `aria-keyshortcuts`. Wire the shortcut itself in your app. The destructive choice is `critical`.',
        html: `<div style="min-height:300px"><cm-action-menu trigger-label="Order">
  <cm-menu-item heading>Order</cm-menu-item>
  <cm-menu-item icon="edit" value="edit" shortcut="E">Edit order</cm-menu-item>
  <cm-menu-item icon="copy" value="duplicate" shortcut="Ctrl+D">Duplicate</cm-menu-item>
  <cm-menu-item icon="download" value="invoice" disabled>Download invoice</cm-menu-item>
  <hr>
  <cm-menu-item heading>Danger zone</cm-menu-item>
  <cm-menu-item icon="trash" value="delete" critical shortcut="Del">Delete order</cm-menu-item>
</cm-action-menu></div>` },
      { title: 'Compact', description: 'Since 1.6. `density="compact"` makes the rows 32px, for menus in dense tables and toolbars. Rows stay 44px on touch screens.',
        html: `<div style="min-height:160px"><cm-action-menu icon-only density="compact" label="Product actions">
  <cm-menu-item value="duplicate">Duplicate</cm-menu-item>
  <cm-menu-item value="archive">Archive</cm-menu-item>
  <cm-menu-item value="delete" critical>Delete</cm-menu-item>
</cm-action-menu></div>` },
      { title: 'Account menu', description: 'Groups split by `<hr>`; the destructive choice is `critical`. `align="end"` lines the menu up with the right edge of a trigger at the right of the page.',
        html: `<div style="display:flex;justify-content:flex-end">
<cm-action-menu trigger-label="Robinson" heading="Robinson Jain" subheading="robinson@example.com" align="end">
  <cm-menu-item href="#profile">My profile</cm-menu-item>
  <cm-menu-item href="#subscription">Subscription</cm-menu-item>
  <cm-menu-item href="#support">Support</cm-menu-item>
  <cm-menu-item href="#refer">Refer and earn</cm-menu-item>
  <hr>
  <cm-menu-item value="switch">Switch store</cm-menu-item>
  <cm-menu-item value="new-store">Create new store</cm-menu-item>
  <hr>
  <cm-menu-item value="sign-out">Sign out</cm-menu-item>
</cm-action-menu>
</div>` },
    ],
    states: [
      { title: 'Loading', description: 'Since 1.6. While you fetch the choices, `loading` shows a spinner row instead (the menu is `aria-busy`); clear it and focus moves to the first choice.',
        html: `<cm-action-menu trigger-label="Move to" loading></cm-action-menu>` },
      { title: 'Disabled', description: 'Since 1.6. `disabled` disables the built-in trigger. Say nearby why, if it isn\'t obvious.',
        html: `<cm-action-menu trigger-label="Bulk actions" disabled></cm-action-menu>` },
      { title: 'Disabled item', description: 'Keep an action that can\'t be used now in its place, disabled, so the menu doesn\'t change shape.',
        html: `<cm-action-menu icon-only label="Order #1042 actions">
  <cm-menu-item value="tracking">Change tracking info</cm-menu-item>
  <cm-menu-item value="cancel" disabled>Cancel shipment</cm-menu-item>
</cm-action-menu>` },
    ],
    stateTable: [
      ['Default', 'Trigger: 36px outlined button (40px drawn on touch). Rows: 36px, 14px text, 12px side padding.'],
      ['Hover', 'The trigger turns `bg-hover`; the row under the pointer is highlighted like the keyboard one.'],
      ['Focus-visible', 'A 2px `border-strong` ring on the trigger; in the menu, the active row is black with white text and the ring.'],
      ['Pressed', 'The highlighted row lightens a little while pressed; the trigger darkens.'],
      ['Selected (highlighted)', 'Black (`bg-panel-header`) with white text, the shortcut in `text-on-dark-secondary`; a `critical` choice is `text-critical` on `bg-critical`.'],
      ['Disabled', 'A disabled choice is grey with a `not-allowed` cursor, stays in place and is skipped by the arrow keys. A disabled menu greys its trigger and doesn\'t open.'],
      ['Loading', 'A spinner row with "Loading" instead of the choices; the menu is `aria-busy`.'],
    ],
    do: ['Use it for actions, not for choosing a value in a form: that is Select.', 'Keep it to about eight choices, grouped with `<hr>`.', 'Give icon-only menus a `label` that names the thing acted on: "Order #1042 actions".'],
    dont: ['Don\'t hide the one main action of a page in a menu: show it as a Button.', 'Don\'t put a menu inside a menu.'],
    content: ['Start each choice with a verb: "Cancel shipment", "Add product".', 'Use sentence case.'],
    a11y: ['The WAI-ARIA menu button pattern: the trigger has `aria-haspopup="menu"` and `aria-expanded`; the list is `role="menu"` with `menuitem`s and `separator`s.', '↓/↑ on the trigger open the menu on the first/last choice. In the menu: ↓/↑ (wrapping), Home/End and typing the first letters move; Enter/Space choose; Esc closes and returns focus to the trigger; Tab closes. Disabled choices and section headings are skipped.', 'A section heading (`heading`) names a `role="group"` of the choices after it (`aria-labelledby`); it is not a menu item. A `shortcut` is shown visually (hidden from screen readers) and exposed as `aria-keyshortcuts` on the item.', 'A custom trigger gets the ARIA attributes set on it, so make it a native `<button>`.', 'The highlight follows the keyboard and the pointer; the list has 4px inner padding and 8px corners, and rows 6px corners.'],
    related: ['button', 'bottom-sheet', 'select'],
  },
  {
    slug: 'bottom-sheet', tag: 'cm-bottom-sheet', react: 'BottomSheet', name: 'Bottom sheet', group: 'Overlays',
    responsive: ["Full width up to 600px, then 600px wide and centred at the bottom of the window."],
    parts: [{ tag: 'cm-menu-item', react: 'MenuItemElement' }],
    summary: 'A sheet that rises from the bottom of a phone screen with a few actions or shortcuts.',
    lead: 'White, with 12px top corners and a round 36px black close button on its top edge, over a dimmed page; at most 600px wide on larger screens. Rows are 44px, split by thin lines. Rows without icons are centred (actions, "Mark as paid order"); rows with icons line up left and end in a chevron (shortcuts, "Orders"). It is the phone version of Action menu and uses the same `cm-menu-item`s. A native modal `<dialog>`, like Modal.',
    examples: [
      { title: 'Order actions', description: 'Press the button to open it. In your app, call `show()` or set `open`.',
        html: `<cm-button data-opens="acts">More actions</cm-button>
<cm-bottom-sheet id="acts" heading="Order actions">
  <cm-menu-item value="paid">Mark as paid order</cm-menu-item>
  <cm-menu-item value="invoice">Generate invoice</cm-menu-item>
  <cm-menu-item value="cancel" critical>Cancel order</cm-menu-item>
</cm-bottom-sheet>` },
      { title: 'Shortcuts with icons', html: `<cm-button data-opens="quick">Quick add</cm-button>
<cm-bottom-sheet id="quick" heading="Shortcuts">
  <cm-menu-item icon="bag" href="#orders">Orders</cm-menu-item>
  <cm-menu-item icon="box" href="#add-order">Add orders</cm-menu-item>
  <cm-menu-item icon="cart" href="#abandoned">Abandoned cart</cm-menu-item>
  <cm-menu-item icon="help" href="#enquiries">Contact enquiries</cm-menu-item>
</cm-bottom-sheet>` },
    ],
    do: ['Use it on phones in place of an Action menu or a small Modal.', 'Keep it to five rows or fewer.', 'Set `heading` (it is not shown) so screen readers announce what the sheet is for.'],
    dont: ['Don\'t mix rows with and without icons in one sheet.', 'Don\'t put a long form in a sheet: open a page.'],
    content: ['Start actions with a verb: "Generate invoice". Shortcuts are the page name: "Orders".'],
    a11y: ['A native modal `<dialog>` named by the hidden `heading` (or `label`); the page behind is inert.', 'The close button is named "Close" (`close-label`). Esc and the backdrop fire a cancelable `cm-close`; focus returns to the opener.', 'Choosing a row fires a cancelable `cm-select`, then closes with reason `action`.', 'The close button is 36px and rows are 44px tall, so both are easy touch targets.'],
    related: ['action-menu', 'modal', 'bottom-navigation'],
  },
  {
    slug: 'notification-panel', tag: 'cm-notification-panel', react: 'NotificationPanel', name: 'Notification panel', group: 'Overlays', adminOnly: true,
    responsive: ["At most 380px wide, and never wider than the window minus 32px.", "When the window is narrower than 600px, the panel spans the screen with 8px on each side."],
    parts: [{ tag: 'cm-notification-item', react: 'NotificationItemElement' }],
    summary: 'Recent notifications, opened from the bell in the header bar. For Commmerce products only, not for apps.',
    lead: 'A 380px panel under the top-right corner of the page (on phones, the screen width less 8px each side) over a dimmed page. A black "Notifications" header with a close button, then one 40px row per notification, alternately white and light grey: a small coloured icon for its kind (`information`, `attention`, `success`, `critical`), what happened, and when. Unread ones are bold. "See more notifications" links to the full list. Move it with `--cm-notification-panel-top` and `--cm-notification-panel-end`. It belongs to the admin: apps can\'t add to it (App Bridge has toasts, not notifications).',
    examples: [
      { title: 'From the header bell', description: 'Press the button to open it. In your app, open it from the header bar\'s bell.',
        html: `<cm-button data-opens="notes">Notifications</cm-button>
<cm-notification-panel id="notes" more-href="#notifications">
  <cm-notification-item time="1 min ago" href="#order-1042" unread>New order received</cm-notification-item>
  <cm-notification-item time="12 mins ago" tone="attention" href="#stock" unread>Product low stock</cm-notification-item>
  <cm-notification-item time="1 hr ago" tone="success" href="#order-1041">Payment received</cm-notification-item>
  <cm-notification-item time="3 hrs ago" tone="attention" href="#variants">Product variant out of stock</cm-notification-item>
  <cm-notification-item time="1 day ago" tone="critical" href="#order-1037">Order cancelled</cm-notification-item>
</cm-notification-panel>` },
      { title: 'Mark all read, second lines, icons and a footer control', description: '`mark-all-read` shows "Mark all read" in the header while any notification is unread; it fires `cm-mark-all-read` and you clear `unread`. `description` adds a second line, `icon` picks an icon for the kind (in the tone\'s colours), and the `footer` slot holds a control such as a push-notifications toggle.',
        html: `<cm-button data-opens="notes-crm">Notifications</cm-button>
<cm-notification-panel id="notes-crm" mark-all-read more-href="#notifications">
  <cm-notification-item time="2 mins ago" icon="clock" tone="attention" description="Follow-up due at 4 pm" href="#task-81" unread>Call Ravi Stores</cm-notification-item>
  <cm-notification-item time="20 mins ago" icon="user" description="From the website form" href="#lead-311" unread>New lead: Asha Textiles</cm-notification-item>
  <cm-notification-item time="1 hr ago" icon="send" tone="success" description="Quote #Q-1043" href="#email-17">Email opened by Kiran Rao</cm-notification-item>
  <cm-notification-item time="3 hrs ago" icon="help" description="Ticket #5531" href="#ticket-5531">Customer replied</cm-notification-item>
  <cm-toggle slot="footer" label="Push notifications on this device"></cm-toggle>
</cm-notification-panel>` },
    ],
    states: [
      { title: 'Empty', description: 'With no items the panel says so (`empty-text`). Press the button to open it.',
        html: `<cm-button data-opens="notes-empty">Notifications</cm-button>
<cm-notification-panel id="notes-empty" empty-text="No notifications yet. New orders and stock alerts appear here."></cm-notification-panel>` },
      { title: 'Loading', description: 'Set `loading` while you fetch: grey placeholder rows show and "Loading" is announced politely. Press the button to open it.',
        html: `<cm-button data-opens="notes-loading">Notifications</cm-button>
<cm-notification-panel id="notes-loading" loading></cm-notification-panel>` },
    ],
    do: ['Show the newest first, and at most about ten; link the rest with `more-href`.', 'Link every notification to the thing it is about.', 'Mark notifications read when the merchant opens them; offer `mark-all-read` and clear `unread` on `cm-mark-all-read`.', 'Set `loading` while the list is fetched instead of a fake "Loading" item.', 'Keep the second line short (`description`): who or when, "Follow-up due at 4 pm".'],
    dont: ['Don\'t use it for messages that need an answer now: show a Banner on the page.', 'Don\'t use it in apps: it is admin chrome.'],
    content: ['Say what happened in a few words: "New order received", "Product low stock".', 'Times are relative and short: "1 min ago", "3 hrs ago", "1 day ago".'],
    a11y: ['A native modal `<dialog>` named "Notifications"; the page behind is inert. Esc, the close button and the backdrop fire a cancelable `cm-close`; focus returns to the bell.', 'Unread notifications start with "Unread:" for screen readers, not only bold text. The kind icon is decorative; the words say what happened. A second line is read after the label, separated by a comma.', '"Mark all read" is a real button in the header. When it disappears (nothing unread any more), focus moves to the panel instead of being lost.', 'While `loading`, the placeholder rows are hidden from screen readers and "Loading" is announced through a polite status region.', 'Choosing a notification fires a cancelable `cm-select` (cancel it to route in a single-page app), then closes.', 'Kind icons are line icons in the tone colours on 24px tiles; rows are at least 40px tall with 13px text and 12px times in tabular numbers.'],
    related: ['header-bar', 'banner', 'badge'],
  },
];

// Components that are not usable yet. Every entry gets a status page at #components--<slug>, so no
// link is a dead end. status: 'in-progress' = the next batch in BUILD-QUEUE.md; 'planned' = later.
// When a batch starts, set its entries to 'in-progress'; when a component ships, delete its entry here
// and add it to `components` above.
export const planned = [
];

export const groupsOrder = ['Actions', 'Forms', 'Layout', 'Lists', 'Feedback', 'Overlays', 'Navigation', 'Marketplace', 'Images and icons'];
