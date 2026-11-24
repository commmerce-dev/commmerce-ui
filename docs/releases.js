// Release notes, newest first. Cloud build sessions add an entry here when a batch ships
// (an <h2 id="vX-Y-Z"> heading and a list). Plain HTML; internal links use href="#/path".
export const releaseNotes = `
  <h2 id="v1-20-4">v1.20.4</h2>
  <ul>
    <li><strong>No scrollbars.</strong> Every component's scroll area (data table, menus, dropdowns, date range picker, calendar, command palette, panels, link tabs and status tabs) still scrolls with the wheel, trackpad, touch and keyboard, but no longer draws a scrollbar. On Windows and on Macs set to always show scrollbars, the bar took width as it appeared and moved the layout. Overflow is shown the way it already was: fades at the edges and "more" hints.</li>
    <li><a href="#/components/modal">Modal</a>, side panel, filter panel, bottom sheet, notification panel and command palette: when they open on a page that shows a scrollbar, the page keeps the scrollbar's space, so it no longer jumps sideways.</li>
    <li><a href="#/components/app-frame">App frame</a>: the <a href="#/components/mobile-menu">mobile menu</a> also scrolls without a visible scrollbar now, like the side navigation in 1.20.3. Where scrollbars are always shown (a narrow desktop window on Windows, or a Mac set to always show them), the bar no longer takes width from the menu.</li>
    <li>Flutter: <code>CmTheme</code> hides scrollbars, and <code>CmDataTable</code> no longer adds its own.</li>
  </ul>
  <h2 id="v1-20-3">v1.20.3</h2>
  <ul>
    <li><a href="#/components/app-frame">App frame</a>: the side navigation column still scrolls when it is taller than the window, but no longer shows a scrollbar. On Windows and on Macs set to always show scrollbars, the bar took width from the column and moved the layout when the menu grew or shrank.</li>
  </ul>
  <h2 id="v1-20-2">v1.20.2</h2>
  <ul>
    <li>No changes to the components. Tests: the command palette, photo upload and combobox focus and hover checks run in Firefox again (they were skipped in 1.20.1 after the test tools upgrade), so every component is tested in Chromium, Firefox and WebKit.</li>
  </ul>
  <h2 id="v1-20-1">v1.20.1</h2>
  <ul>
    <li><a href="#/components/link-tabs">Link tabs</a>: when the tabs don't fit (usually on phones), the row now fades at the edge that has more tabs past it, as <a href="#/components/status-tabs">status tabs</a> do, so the last tab no longer looks cut off. The current tab is scrolled into view when the page opens. Nothing changes when the tabs fit.</li>
  </ul>
  <h2 id="v1-20-0">v1.20.0</h2>
  <ul>
    <li><strong>Refined look in Commmerce blue</strong> (<code>data-cm-look="refined"</code>): count badges, the selected tab line, selected rows (a light blue tint, new token <code>--cm-nav-badge-soft</code>) and the initials avatar now use the Commmerce blue (<code>--cm-nav-badge</code>, <code>#446BEB</code>) instead of the neon green. Interface text is Poppins, like the default look (was Inter), and the greys are neutral at the same lightness (were slightly green-tinted), so contrast is unchanged. The default look does not change. Status colours (success green, critical red) stay as they are.</li>
  </ul>
  <h2 id="v1-19-0">v1.19.0</h2>
  <ul>
    <li><strong>One menu everywhere.</strong> These docs now run in the Commmerce frame, the same one the CRM uses: <a href="#/components/app-frame">app frame</a> with <code>panel</code>, <a href="#/components/header-bar">header bar</a> with <a href="#/components/global-search">global search</a>, and the black <a href="#/components/side-navigation">side navigation</a> card (collapsible); <a href="#/components/bottom-navigation">bottom navigation</a> and the <a href="#/components/mobile-menu">mobile menu</a> on phones.</li>
    <li><a href="#/components/bottom-navigation">Bottom navigation</a>: the current tab has a bold label and a tinted pill behind its icon. <a href="#/components/mobile-menu">Mobile menu</a>: the current row is tinted and bold. Before, only the icon colour changed in the bottom navigation and the mobile menu did not mark the current row; products had to patch both.</li>
    <li><a href="#/components/button">Button</a>: <code>variant="tertiary"</code> (new): no fill and no outline until hovered, for icon buttons in a header bar or a board column heading.</li>
    <li><a href="#/components/account-menu">Account menu</a>: the avatar ring takes <code>--cm-account-ring</code> (new token, default <code>--cm-border-strong</code>, so nothing changes). The refined look uses the light border.</li>
  </ul>
  <h2 id="v1-18-0">v1.18.0</h2>
  <ul>
    <li><a href="#/components/date-range-picker">Date range picker</a>: <code>variant="report"</code> for report and dashboard pages. The field is one button that names the preset and the range ("Last 28 days · 23 Oct – 19 Nov 2026"). The popup lists the presets on the left with their dates under each (Custom first), has typed start and end date boxes, months to scroll through under one weekday row, and Cancel and Apply with the range's length ("28 days"). Without <code>presets</code> it lists a report set. Flutter: <code>CmDateRangePicker(variant: CmDateRangeVariant.report)</code>.</li>
    <li>New presets <code>quarter-to-date</code> and <code>last-quarter</code> (Flutter <code>CmDateRangePreset.quarterToDate</code>, <code>lastQuarter</code>).</li>
    <li>Bun: the packages install with <code>bun add</code> and bundle with <code>bun build</code> without warnings, and Bun keeps only the components you import, as other bundlers already did. The repository can also be developed with Bun (<code>bun install</code>, <code>bun run build</code>, <code>bun run test</code>).</li>
  </ul>
  <h2 id="v1-17-1">v1.17.1</h2>
  <ul>
    <li><a href="#/components/resource-list">Resource list</a>: a hovered or selected row is now highlighted across the full width of the list, edge to edge like the bulk-action bar above it, and the lines between rows run edge to edge too. Row content, checkboxes and a <code>cm-table-header</code> stay exactly where they were. Flutter <code>CmResourceList</code> matches.</li>
    <li>Fix: the <a href="#/components/color-picker">colour picker</a> no longer throws when a drag starts from a pointer the browser can't capture (seen in Firefox with scripted pointer events).</li>
  </ul>
  <h2 id="v1-17-0">v1.17.0</h2>
  <ul>
    <li><strong><a href="#/components/color-picker">Colour picker</a></strong> (new, <code>cm-color-picker</code>): a saturation and brightness square, hue and opacity (<code>alpha</code>) sliders, the value as hex, RGB or HSL (<code>formats</code>), the browser's eyedropper where it has one, linear and radial gradients (<code>gradient</code>), and swatches for the store's <strong>brand colours</strong>, the merchant's <strong>recent colours</strong> and the palette. Every colour they commit that isn't a brand or palette colour goes first in Recent (<code>cm-recent-change</code>).</li>
    <li>Brand and recent colours come from <code>brand-colors</code> / <code>recent-colors</code>, or a <code>source</code>: <code>app.colors</code> from App Bridge, <code>httpColorSource({ baseUrl })</code> for your server, or <code>localColorSource(key)</code> (also <code>recent-key</code>) for this browser only. New helpers: <code>parseColor</code>, <code>formatColor</code>, <code>parseGradient</code>, <code>formatGradient</code>, <code>sameColor</code>, <code>isColorValue</code> and the RGB/HSV/HSL conversions.</li>
    <li><a href="#/components/color-field">Colour field</a>: <code>picker</code> now opens the colour picker in the top layer, instead of the browser's own picker; <code>picker="native"</code> keeps the browser's. The value and events are unchanged, and the value stays <code>#rrggbb</code> unless you add <code>alpha</code>, <code>gradient</code> or <code>formats="hex rgb hsl"</code>, which let the box take those values too. <code>brand-colors</code>, <code>recent-colors</code>, <code>source</code> and <code>recent-key</code> pass through to the panel.</li>
    <li>App Bridge: <code>app.colors.brandColors()</code>, <code>recentColors()</code> and <code>addRecentColor(color)</code> (requests <code>colors.brand</code>, <code>colors.recent</code>, <code>colors.addRecent</code>; still protocol v1). The admin answers from the store's brand settings and keeps recents per staff member; <code>createHost</code> takes the handlers <code>brandColors</code>, <code>recentColors</code> and <code>addRecentColor</code>, and the reference host a <code>brandColors</code> option. Admins without them refuse the request, and the picker then shows no list.</li>
    <li>Colour API: a reference server for your own backend (Node, no dependencies) is in the repository at <code>examples/color-api</code>: <code>GET</code>/<code>PUT /brand-colors</code>, <code>GET</code>/<code>POST /recent-colors</code>, a colour validator, file and memory stores.</li>
    <li>Icon: <code>eyedropper</code>.</li>
  </ul>
  <h2 id="v1-16-0">v1.16.0</h2>
  <ul>
    <li>New <a href="#/components/time-picker">time picker</a> (<code>cm-time-picker</code>, React <code>TimePicker</code>): type a time (3:30 pm, 15:30, 1530, 9pm) or choose one from a list. 12-hour with am/pm or 24-hour, from the page language or <code>hour-cycle="h12"</code> / <code>"h23"</code>; the value is always 24-hour <code>hh:mm</code>. <code>min</code>, <code>max</code>, <code>step</code> (allowed minutes) and <code>interval</code> (list spacing), form-associated, with the same messages as every field.</li>
    <li><a href="#/components/date-range-picker">Date range picker</a> for reports, like an analytics date picker: new presets <code>this-week</code>, <code>last-week</code>, <code>last-28-days</code>, <code>last-12-months</code>, <code>this-year</code>, <code>last-year</code> and <code>custom</code> (a "Custom" button for dates from the calendar); <code>preset</code> holds the chosen preset key and can open a report on, say, "Last 28 days"; <code>months="2"</code> shows two months side by side (one on phones); <code>confirm</code> makes presets and dates a draft until Apply, with Cancel. Without the new attributes nothing changes.</li>
    <li><code>resolvePreset()</code> takes the first day of the week as a fourth argument (for the week presets).</li>
    <li>Fix: a time on a forced 24-hour clock (<code>hour-cycle="h23"</code>, also in the <a href="#/components/date-picker">date picker</a> time box) shows two-digit hours: 00:00 and 09:05, not 0:00 and 9:05.</li>
  </ul>
  <h2 id="v1-15-0">v1.15.0</h2>
  <ul>
    <li><a href="#/components/text-field">Text field</a>: <code>inputmode</code> (<code>email</code>, <code>url</code>, <code>tel</code>, <code>numeric</code>, <code>decimal</code>, <code>search</code>, <code>text</code>) sets which keyboard phones open, on the input and on <code>multiline</code>. Use it with <code>type="text"</code> when your own check replaces the browser's, for example an email rule that matches your server: the browser's <code>type="email"</code> rule accepts <code>a@b</code> and refuses some international addresses.</li>
  </ul>
  <h2 id="v1-14-0">v1.14.0</h2>
  <ul>
    <li><strong>Every form field shows its own message</strong> under the box, the way <code>error</code> does: <a href="#/components/text-field">text field</a>, <a href="#/components/select">select</a>, <a href="#/components/combobox">combobox</a>, <a href="#/components/checkbox">checkbox</a>, <a href="#/components/radio">radio buttons</a>, option group, <a href="#/components/date-picker">date picker</a>, <a href="#/components/date-range-picker">date range picker</a>, <a href="#/components/color-field">colour field</a>, <a href="#/components/signature-field">signature field</a> and <a href="#/components/file-upload">file upload</a>. Leaving a field the merchant changed shows a format, range or length problem; tabbing past an empty required field shows nothing. A failed save (a submit button, Enter, or the save bar) shows the message on every invalid field, required ones too, instead of the browser's bubble, and moves focus to the first. The message changes while the merchant types and goes once the value is right. Your <code>error</code> always wins. Silent checks such as <code>form.checkValidity()</code> show nothing, and <code>novalidate</code> forms are unchanged. While a message shows, the field has the <code>data-cm-invalid</code> attribute.</li>
    <li><a href="#/components/text-field">Text field</a>: <code>pattern</code> (with <code>pattern-message</code>), <code>minlength</code> and <code>maxlength</code>, as on a native input. Messages: your <code>pattern-message</code> or "Enter a value in the requested format.", "Enter at least {min} characters.", "Enter {max} characters or fewer.".</li>
    <li>Checkbox and option group: the required message now shows under them after a failed save. Checkbox gains <code>validity</code>, <code>validationMessage</code> and <code>reportValidity()</code>.</li>
    <li>Checks in the browser help people; anyone can get round them. Check every value again on your server. See <a href="#/apps/guidelines?s=validation">Validation</a>.</li>
  </ul>
  <h2 id="v1-13-1">v1.13.1</h2>
  <ul>
    <li>Fix: <a href="#/components/text-field">text field</a> <code>type="email"</code> and <code>type="url"</code> accepted any text ("not-an-email" counted as valid), so forms could submit it. They now use the browser's own checks: "Enter an email address like name@example.com." and "Enter a web address like https://example.com.". An empty optional field stays valid.</li>
    <li>Fix: <code>type="number"</code> treated text that isn't a number as an empty value, so an optional field passed. It now says "Enter a number."</li>
    <li>Checks in the browser help people fill in forms; anyone can get round them. Check every value again on your server.</li>
  </ul>
  <h2 id="v1-13-0">v1.13.0</h2>
  <ul>
    <li><a href="#/components/resource-list">Resource list</a>: <code>mobile="stack"</code> (new, opt-in) for rows with <code>columns</code>. At 640px or narrower each row's first cell gets its own line and the other cells follow on the next line, wrapping as needed, instead of squeezing every column into fragments. A <code>cm-table-header</code> in the list's <code>header</code> slot wraps its column names the same way, so sorting still works. Without the attribute nothing changes.</li>
    <li><a href="#/components/date-picker">Date picker</a>: when you leave the date or time box with text that isn't a date or time ("kjhkn", "ii:30"), the box turns red and the field shows "Enter a date like dd/mm/yyyy." or "Enter a time like hh:mm am." under it. Each box gets its own message. They clear once the text is fixed, a day is picked in the calendar, or the app sets a new <code>value</code>. An <code>error</code> set by the app still wins. The form validity is unchanged.</li>
    <li>Fix: <a href="#/components/action-bar">action bar</a> buttons wrap inside the bar on phones instead of running off its edge.</li>
    <li>Fix: <a href="#/components/mobile-menu">mobile menu</a> labels no longer break mid-word ("Applicatio / n") beside a badge. When both don't fit, the badge moves under the label.</li>
    <li>Docs: the header uses the vector Commmerce logo; example links stay on the page; the example picker has one width; form-field previews are shown at 400px; code blocks show a scroll hint on phones; pattern previews (order list, search and filter, admin dashboard) fit phones.</li>
  </ul>
  <h2 id="v1-12-0">v1.12.0</h2>
  <ul>
    <li><a href="#/components/spinner">Spinner</a>: put a decorative graphic inside <code>cm-spinner</code> to show it instead of the arc, such as a product's own loader. The spinner keeps the status role, the label and the height (12px <code>small</code>, 20px <code>large</code>) and passes <code>--cm-spinner-duration</code> (0.8s) and <code>--cm-spinner-play-state</code> (<code>paused</code> under reduced motion) to the graphic. Without a graphic nothing changes, and the spinners inside buttons, selects and other components keep the arc. Commmerce UI ships no logo or brand loader. Web only for now.</li>
  </ul>
  <h2 id="v1-11-0">v1.11.0</h2>
  <ul>
    <li><strong>Refined look</strong> (new, opt-in): add <code>data-cm-look="refined"</code> to <code>&lt;html&gt;</code>, next to <code>data-cm-theme</code>. Interface text in Inter and page titles in Poppins; slightly green-tinted greys with darker supporting text; the Commmerce neon green (<code>#1EC81A</code>) on count badges, the selected tab line and selected rows; a dot before the label of toned <a href="#/components/badge">badges</a>. Light, dark and auto themes. Without the attribute nothing changes. Load <code>fonts.css</code> for Inter (self-hosted, latin and latin-ext; Devanagari and ₹ fall back to Poppins).</li>
    <li>New tokens: <code>--cm-accent</code>, <code>--cm-accent-soft</code>, <code>--cm-accent-text</code>, <code>--cm-text-on-accent</code> (the brand neon green: a highlight beside black, never text on white), <code>--cm-count-bg</code> / <code>--cm-count-text</code> (count pills on buttons, side navigation and the mobile menu), <code>--cm-tab-indicator</code> (status and link tabs), <code>--cm-bg-selected</code> (selected resource list rows), <code>--cm-badge-dot</code> and <code>--cm-font-display</code> (the page header title). Their defaults are today's values.</li>
    <li>Licences: Inter (SIL OFL 1.1) is in THIRD_PARTY_NOTICES.txt and <code>fonts/OFL-Inter.txt</code>.</li>
  </ul>
  <h2 id="v1-10-1">v1.10.1</h2>
  <ul>
    <li>Fix (#35): dropdown lists open in the top layer, beside their field, so rows below can't cover them and scrolling cards, tables and board columns can't cut them off. This covers <a href="#/components/select">select</a>, <a href="#/components/combobox">combobox</a>, <a href="#/components/global-search">global search</a> results, the <a href="#/components/date-picker">date</a> and <a href="#/components/date-range-picker">date range</a> calendars and the <a href="#/components/data-table">data table</a> column panel, like the action menu since 1.9.2. A list near the bottom of the window opens above its field. Keyboard use is unchanged.</li>
  </ul>
  <h2 id="v1-10-0">v1.10.0</h2>
  <ul>
    <li><a href="#/components/sparkline">Sparkline</a> (new, <code>cm-sparkline</code>): a word-sized chart of one series over time for summary cards, such as visits in the last 14 days on a record. Bars or a line, three tones, one spoken summary (total, peak and when, latest), time left to right in every language. Flutter: <code>CmSparkline</code>.</li>
  </ul>
  <h2 id="v1-9-3">v1.9.3</h2>
  <ul>
    <li>Fix: <a href="#/components/button">button</a> labels cut off the tails of g, p and y (since 1.8.1, when long labels started ending with "…").</li>
  </ul>
  <h2 id="v1-9-2">v1.9.2</h2>
  <ul>
    <li><a href="#/components/account-menu">Account menu</a> (new, <code>cm-account-menu</code>): a round avatar button, last in the header bar, that opens the person, the business and its plan, then Settings, Lock screen and Log out. <a href="#/components/header-bar">Header bar</a>: the new <code>account</code> slot comes last, and the <code>user-name</code> pill now sits after the <code>end</code> controls, so the order is refresh, notifications, then the person.</li>
    <li><a href="#/components/action-menu">Action menu</a>: the open menu is a popover in the top layer, placed beside its trigger (above it when there's no room below), so a scrolling board column, table or card can no longer cut it off.</li>
  </ul>
  <h2 id="v1-9-1">v1.9.1</h2>
  <ul>
    <li><a href="#/components/info-panel">Info item</a>: <code>editable</code> shows a light 28px pencil button after the value, centred on its first line (also when the value wraps), named "Edit {label}" (or <code>edit-label</code>), firing <code>cm-edit</code>. Use it on record pages to edit one field in place, instead of an outlined button beside each value. Web only for now.</li>
  </ul>
  <h2 id="v1-9-0">v1.9.0</h2>
  <ul>
    <li><strong>Pin this version, not 1.8.1, on the hosted files.</strong> The hosted <code>/v/1.8.1/</code> files were published from an earlier build and miss most of 1.8.1 (npm 1.8.1 is complete). 1.9.0 has everything.</li>
    <li><a href="#/components/layout">Layout</a>: <code>variant="sidebar"</code> with a <code>cm-layout-section variant="sidebar"</code>: a 240px column of views, folders or filters beside the list it filters (a ticket inbox, a mailbox), from 768px of the layout's width; stacked above the list when narrower.</li>
    <li>Fix: in <code>cm-app-frame panel</code> the page header is transparent, so it no longer squares off the panel's rounded top corners (new <code>--cm-page-header-background</code>).</li>
    <li>Flutter: <code>CmCalendar</code> (port of <code>cm-calendar</code>): month, week and day views; events move by mouse drag, press and hold on touch, or the keyboard, every step announced; <code>onMove</code> can refuse or save a move with a future; "+N more", <code>onAdd</code>, <code>onOpen</code>, <code>dayStart</code> and <code>scrollToHour</code>; a compact month and three-day week under 600px. Not ported: <code>href</code> and <code>locale</code> (names and formats come from <code>CmStrings</code>).</li>
    <li>Flutter: <code>CmSignatureField</code> (port of <code>cm-signature-field</code>): draw (mouse, finger or pen with pressure) or type a name in Dancing Script (bundled, SIL OFL 1.1); Undo and Clear; <code>CmSignatureController</code> exports a PNG cropped to the ink as bytes or a data URL; required, error, disabled and <code>Form</code> validation; drawing never scrolls the page.</li>
  </ul>
  <h2 id="v1-8-1">v1.8.1</h2>
  <ul>
    <li><a href="#/components/timeline">Timeline</a>: a long heading wraps in its own column, so the time stays at the end of the first line instead of dropping onto a line of its own. On phones the time sits under the heading, left-aligned.</li>
    <li><a href="#/components/resource-list">Resource list</a>: a <code>cm-icon</code> in the <code>media</code> slot is centred in its square, in the icon colour, for settings and navigation lists.</li>
    <li>Select, text field, combobox and date pickers: <code>size="medium"</code>, 36px, the height of a standard button. Use it for a field in a row of buttons, such as page header actions, so the row is one height (with a default-size segmented control and medium buttons).</li>
    <li><a href="#/components/button">Button</a>: never wider than its container; a label longer than the room ends with "…" instead of spilling out of a narrow card.</li>
    <li><a href="#/components/board">Board</a>: a sideways trackpad or wheel scroll over the cards now scrolls the board (it was held by the column, so after a drag you had to click before you could scroll, and the swipe could turn into the browser's Back gesture).</li>
    <li><a href="#/components/action-menu">Action menu</a>: opens toward the other side when it would run off the screen, so a More menu at the end of a page header stays visible.</li>
  </ul>
  <h2 id="v1-8-0">v1.8.0</h2>
  <ul>
    <li><strong>Commmerce UI Licence 1.1</strong> (<a href="LICENSE.txt">full text</a>). Downloading, installing or using the packages means accepting the licence. The packages are free, so Commmerce's total liability is capped at the amount you paid, which is zero. The licence is governed by the laws of India, and the courts at Bengaluru, Karnataka decide disputes. Versions up to 1.7.2 stay under Licence 1.0.</li>
    <li>The Commmerce logo is no longer part of Commmerce UI. Hosted versions from 1.8.0 have no <code>brand/</code> folder, and the examples show a placeholder logo; the logo slot takes your app's or the merchant's own logo. Third-party apps must not use the Commmerce logo. Commmerce teams get it from Commmerce Brand Assets (internal). Files already hosted under <code>/v/1.1.0/</code> to <code>/v/1.7.2/</code> stay where they are. See <a href="#/foundations/logo">Logo</a>.</li>
    <li>Fix: in a <a href="#/components/data-table">data table</a> with <code>mobile="cards"</code>, padding on the value side of a card row now counts inside the row's width, so padded lists can't run past the card's edge.</li>
  </ul>
  <h2 id="v1-7-2">v1.7.2</h2>
  <ul>
    <li>Fix: in a <a href="#/components/data-table">data table</a> with <code>mobile="cards"</code>, a one-line <code>data-lines="1"</code> item could grow wider than its card and be cut off without "…". The value side of a card row may now shrink, and one-line items are capped at the cell's width.</li>
  </ul>
  <h2 id="v1-7-1">v1.7.1</h2>
  <ul>
    <li><a href="#/components/info-panel">Info panel</a>: 24px padding by default (16px on phones), the same as a standard card under the owner's standard; it was 20px.</li>
    <li>Flutter: <code>CmButtonGroup</code> (wrap, or <code>overflow: menu</code> with a "More" menu, same order as the web), <code>CmInfoPanel</code> on the standard sizes, and a sweep that puts the remaining paddings, gaps, heights and font sizes on the scale.</li>
  </ul>
  <h2 id="v1-7-0">v1.7.0</h2>
  <ul>
    <li>Faster work for people who live in Commmerce all day. Nothing that worked in 1.6 changes. Pin <code>/v/1.7.0/</code> or <code>npm install @commmerce/ui@1.7.0</code>.</li>
    <li><a href="#/components/command-palette">Command palette</a> (new, <code>cm-command-palette</code>): Ctrl+K (Cmd+K on a Mac) with the opt-in <code>shortcut="mod+k"</code>; search records, run actions and jump to pages, with recent items, shortcut hints and full keyboard use. On phones it fills the screen.</li>
    <li>Undo instead of confirm: toasts carry an action (<code>showToast(msg, { action: { label: 'Undo', onAction } })</code>), wait while hovered or focused, and are reached with F6; <code>toast.closed</code> tells you how a toast ended, and <code>undoable(doIt, undoIt, { message })</code> does the whole thing. See <a href="#/patterns/undo-instead-of-confirm">Undo instead of confirm</a>.</li>
    <li><a href="#/patterns/record-page">Record page</a>: <code>cm-layout variant="record"</code> puts a 320px aside beside the main column from 880px of its own width (so a laptop with the side navigation keeps it), stacking on phones with the key facts first; <code>sticky-aside</code>; page header <code>back-href</code> and <code>back-label</code>; info panel <code>variant="compact"</code> and <code>layout="rows"</code> for Details cards.</li>
    <li><a href="#/components/button-group">Button group</a> (new, <code>cm-button-group</code>): <code>overflow="menu"</code> keeps one line and moves buttons that don't fit into a "More" menu, lowest priority first; choosing one clicks the original button.</li>
    <li><a href="#/components/data-table">Data table</a>: <code>lines</code> on a column wraps long text onto up to that many lines, then "…"; in a server-rendered table, <code>data-lines="1"</code> to <code>"4"</code> on any element inside a cell (for example one per list item). The full text shows on hover.</li>
    <li>Fix: status tabs show their scroll fade when counts or the web font arrive after the first render.</li>
    <li>Flutter: <code>showCmCommandPalette</code> and <code>CmCommandPaletteShortcut</code>, undo toasts (<code>CmToastAction</code>, <code>closed</code>, <code>cmUndoable</code>, F6), and the rest of the 1.6 standard: table row actions, resize, column picker and priority mode, status tab dropdown and small size, menus, tooltip, combobox chips, and the compact upload with progress; the record page as <code>CmRecordLayout</code> with the page header back link, info panel rows and table <code>lines</code>. The button group is web only for now.</li>
  </ul>
  <h2 id="v1-6-0">v1.6.0</h2>
  <ul>
    <li><strong>The owner's standard</strong> (issue #33): the sizes and rules every Commmerce app follows, set once in Commmerce UI. No attribute or event was removed or renamed; default sizes change, so check your screens. The full table is on <a href="#/foundations/scale">Scale</a>.</li>
    <li>Sizes: buttons 36px (40 on touch screens, with a 44px hit area); text fields, selects, comboboxes, search and date pickers 40px (44 on touch; <code>size="small"</code> stays 32 for filter rows); checkboxes 16 (18 on touch); badges 24px tall; form labels 13px medium; help and supporting text 12px; a new section heading style (18/26); side navigation 220px wide.</li>
    <li><a href="#/components/card">Card</a>: <code>variant="compact"</code> (16px padding) and <code>variant="interactive"</code> (the whole card is a link or button, with hover, focus, pressed and <code>selected</code>); the standard card has 24px padding. <a href="#/components/empty-state">Empty state</a>: a compact 48px tile by default; <code>size="large"</code> keeps the big illustration.</li>
    <li><a href="#/components/data-table">Data table</a>: 40px header in 12px semibold, 48px rows (40px with <code>density="compact"</code> or <code>data-cm-density="compact"</code> on any ancestor), 13px cells, numbers and actions right-aligned, long text cut off with the full value available; <code>sticky-header</code>, row actions shown on hover (<code>type: 'actions'</code>, <code>cm-row-action</code>), <code>resizable</code> columns and a <code>column-picker</code> (columns use <code>visible: false</code> to hide; <code>hidden</code> keeps its 1.x meaning). Phones: <code>mobile="cards|scroll|priority"</code>; see <a href="#/patterns/tables-on-phones">Tables on phones</a>.</li>
    <li>Multi-select <a href="#/components/combobox">combobox</a> chips are the standard 24px tags, with <code>max-tags</code> (default 3, then "+N more" until you focus the box; <code>0</code> shows all) and keyboard moves between chips. <a href="#/components/file-upload">File upload</a>: a compact 72px empty row ("Drag files here or Browse"), hover and drop states, <code>setProgress()</code>, <code>setFileError()</code> and a cancelable <code>cm-cancel</code>. Menus and option lists: 36px rows, section headings, shortcut hints, <code>loading</code>. <a href="#/components/tooltip">Tooltip</a>: 12px on dark, 240px wide, 400ms delay.</li>
    <li>Fixes: a page header's badge stays beside the title (#32); resource item buttons wrap under the content on phones (<code>actions="auto|wrap|inline"</code>, #31). <a href="#/components/status-tabs">Status tabs</a> fade at the scrolling edge on phones, with <code>mobile="select"</code> for a dropdown.</li>
    <li>Flutter catches up with 1.5 and this standard: the new tokens (control heights, motion, label and section type), the same sizes, card variants, the compact empty state, <code>CmSegmentedControl</code>, <code>CmAppFrame(panel: true)</code>, page widths, resource list density, and the data table standard with a cards layout on phones. Not yet in Flutter: table row actions, resize, column picker and the priority strategy; status tab dropdown; menu, tooltip, multi-select and upload sizes.</li>
  </ul>
  <h2 id="v1-5-2">v1.5.2</h2>
  <ul>
    <li><a href="#/components/calendar">Calendar</a>: changing <code>day-start</code> after the first render now scrolls the week and day views again, and the new <code>scrollToHour(h)</code> method scrolls on demand, so a planner can open at the first event once its events have loaded (#34).</li>
  </ul>
  <h2 id="v1-5-1">v1.5.1</h2>
  <ul>
    <li>Fix: in <code>cm-app-frame panel</code>, a <code>cm-page</code> inside a wrapper element (not placed in the frame directly) kept the grey page background, so only its header looked white (#30). The page is now transparent at any depth, through the new <code>--cm-page-background</code> property, so the whole panel is white.</li>
  </ul>
  <h2 id="v1-5-0">v1.5.0</h2>
  <ul>
    <li><strong>A standard scale and a calmer, more compact look.</strong> No attribute or event was removed or renamed, but the default look changes: check your screens after upgrading. Pin <code>/v/1.4.0/</code> if you need the old look for a while.</li>
    <li><a href="#/foundations/scale">Scale</a> (new page): spacing on a 4px grid (<code>--cm-space-4</code> to <code>-64</code>), type sizes 12, 13, <strong>14</strong> (default), 16, 18, 20, 24 and 30 with matching line heights, control heights 32, 36 (default) and 40, radius 4, 6, 8 and 12, icon sizes 16, 20 and 24, shadows for overlays only, and motion tokens. <code>--cm-space-10</code>, <code>-15</code>, <code>-22</code> and <code>-30</code>, <code>border-default</code>, <code>border-card</code>, <code>shadow-100</code> and <code>tracking-caps</code> still work but are deprecated. A check in the test suite keeps every component on the scale.</li>
    <li>Controls: buttons 40, <strong>36</strong> and 32px with 14px text (secondary is now white with a grey outline); fields 36px with <code>size="small"</code> at 32px on text field, select, combobox, search and the date pickers; checkboxes and radios 16px; badges in sentence case at 12px; no uppercase text anywhere. Touch screens keep 44px controls.</li>
    <li><a href="#/components/segmented-control">Segmented control</a> (new, <code>cm-segmented-control</code>) for 2 to 4 way switches such as Open / Done and Board / List.</li>
    <li><a href="#/components/app-frame">App frame</a>: <code>panel</code> puts the page in a white rounded panel beside the menu card, on the grey page. <a href="#/components/page">Page</a>: <code>width="form|detail|wide|full"</code> and 24px padding that lines up with the page header.</li>
    <li>Compact layout pieces: <a href="#/components/header-bar">header bar</a> 56px with a 36px user pill; <a href="#/components/status-tabs">status tabs</a> at 14px with the count in a small pill; <a href="#/components/card">card</a> headings 16px with less space above the content; <a href="#/components/resource-list">resource list</a> rows 56px, and the select-all box, its menu and the selection status in one slim header row lined up with the row checkboxes.</li>
    <li>Numbers use tabular figures in tables, metrics, counts and pagination. Cards and panels are flat with a subtle border; shadows only on menus, popovers, dialogs and toasts.</li>
    <li>The documentation site is redesigned on the same scale.</li>
    <li>Flutter: tokens regenerated on the new scale; buttons, fields, badges, navigation and the header bar resized to match. The card, status tab and resource list layout changes and the new touch-size rules for fields are not in Flutter yet.</li>
  </ul>
  <h2 id="v1-4-0">v1.4.0</h2>
  <ul>
    <li>The last of the Commmerce CRM's requests, and Flutter catching up. Nothing that worked in 1.3 changes. Pin it with <code>/v/1.4.0/</code> or <code>npm install @commmerce/ui@1.4.0</code>.</li>
    <li><a href="#/components/calendar">Calendar</a> (new, <code>cm-calendar</code>, <code>cm-calendar-event</code>): month, week and day views, Previous / Today / Next, "+N more" for busy days, and an Add button per day and hour. Events move by dragging (touch: press and hold) or with the keyboard, using the same pick-up, move and drop keys as the Board, with announcements and a cancelable <code>cm-move</code> that can wait for your save. <code>cm-range-change</code> tells you which dates to load. On narrow screens the month view becomes a day list and the week view shows 3 days.</li>
    <li><a href="#/components/signature-field">Signature field</a> (new, <code>cm-signature-field</code>): draw with a finger, pen or mouse, or type a name shown in a handwriting font; Undo and Clear; the value is a PNG cropped to the ink, always dark ink on transparent. Typing is the keyboard and screen reader route. The handwriting font, Dancing Script (SIL OFL 1.1), ships in <code>@commmerce/tokens</code> and downloads only when used.</li>
    <li><a href="#/components/app-frame">App frame</a>: <code>--cm-app-frame-bottom-offset</code> adds space at the end of the page for a bar of your own fixed to the bottom. <a href="#/components/board">Board</a>: how to confirm a move before it happens.</li>
    <li>Flutter catches up with 1.1 to 1.3: <code>CmAppFrame</code>, <code>CmGlobalSearch</code>, the collapsible side navigation rail, notification panel options, icon-only buttons with a count and tones, <code>CmTimeline</code>, <code>CmMetric</code>, the inline empty state, time in <code>CmDatePicker</code>, <code>CmBoard</code>, <code>CmColorField</code>, the photo tile, option groups, moves between nested lists and option tones. The calendar and signature field are web only for now. See the Flutter changelog for what isn't ported and why.</li>
  </ul>
  <h2 id="v1-3-0">v1.3.0</h2>
  <ul>
    <li>The third round of additions from the Commmerce CRM. Nothing that worked in 1.2 changes. Pin it with <code>/v/1.3.0/</code> or <code>npm install @commmerce/ui@1.3.0</code>.</li>
    <li><a href="#/components/board">Board</a> (new, <code>cm-board</code>, <code>cm-board-column</code>, <code>cm-board-card</code>): records in columns by status, with counts, Load more per column and <code>hide-empty</code> rails. Cards move by dragging (mouse, or a press and hold on touch) or with the keyboard: Space picks a card up, the arrow keys choose the column and position, Space drops, Escape cancels, and every step is announced. <code>cm-move</code> is cancelable and can wait for your save (<code>waitUntil</code>), putting the card back if it fails.</li>
    <li><a href="#/components/color-field">Colour field</a> (new, <code>cm-color-field</code>): a swatch palette, a hex box and an optional browser picker; value <code>#rrggbb</code>.</li>
    <li><a href="#/components/file-upload">File upload</a>: <code>capture</code> opens the phone camera, and <code>variant="photo"</code> shows one photo tile with Retake and Remove.</li>
    <li><a href="#/components/select">Select</a> and <a href="#/components/combobox">Combobox</a>: option groups, from <code>&lt;optgroup&gt;</code> or a <code>group</code> field, with an opt-in <code>show-group</code> to show "Lead: Company".</li>
    <li><a href="#/components/nested-list">Nested list</a>: lists with the same <code>group</code> accept each other's rows, by drag, touch or the arrow keys, with a cancelable <code>cm-move</code>.</li>
    <li><a href="#/components/option-group">Option group</a>: <code>tone</code> (success, critical) on options, matching the button tones. <a href="#/components/card">Card</a>: actions show without a heading.</li>
    <li>5 new <a href="#/icons">icons</a>: camera, image, id-card, navigation, wifi-off.</li>
    <li>New pattern: <a href="#/patterns/pipeline-board">Board or list</a>.</li>
    <li>Flutter: the new icons are in <code>CmIcons</code>; the other additions are web only for now.</li>
  </ul>
  <h2 id="v1-2-0">v1.2.0</h2>
  <ul>
    <li>The second round of additions from the Commmerce CRM. Nothing that worked in 1.1 changes. Pin it with <code>/v/1.2.0/</code> or <code>npm install @commmerce/ui@1.2.0</code>.</li>
    <li><a href="#/components/timeline">Timeline</a> (new, <code>cm-timeline</code>, <code>cm-timeline-item</code>): record activity as an ordered list, with a kind icon, relative time (full time on hover and for screen readers), a meta line, a badge, a clamped body with "Show all", actions, and "Show more" paging.</li>
    <li><a href="#/components/metric">Metric</a> (new, <code>cm-metric</code>): a number tile for report totals, with a locale-formatted figure (12,40,000 in en-IN), a hint, a change with a trend arrow and meaning, an optional link, and a loading state.</li>
    <li><a href="#/components/date-picker">Date picker</a>: <code>time</code> adds a time box (value <code>yyyy-mm-ddThh:mm</code> in local time, the locale's clock, <code>step</code> in minutes, <code>min="now"</code>). <a href="#/components/text-field">Text field</a>: <code>type="time"</code> and <code>type="datetime-local"</code> with <code>min</code>, <code>max</code> and <code>step</code>.</li>
    <li><a href="#/components/button">Button</a>: <code>tone="critical"</code> and <code>tone="success"</code>, for a row of outcome choices. <a href="#/components/empty-state">Empty state</a>: <code>size="inline"</code>, one or two lines inside a card or list, with an optional <code>action</code>.</li>
    <li><a href="#/components/resource-list">Resource list</a>: a <code>cm-table-header</code> in the <code>header</code> slot now lines up with the rows, including the checkbox column; set <code>columns</code> on <code>cm-resource-item</code> to lay a row out on the same columns.</li>
    <li>Fixes on narrow screens: <a href="#/components/card">Card</a> and <a href="#/components/page-header">Page header</a> titles are no longer squeezed by their badges; the badges wrap below the title.</li>
    <li>New <code>phone</code> <a href="#/icons">icon</a>. Brand logos (WhatsApp and the like) are not part of the set.</li>
    <li>New pattern: <a href="#/patterns/pick-record">Pick a record from a search</a>. Select: guidance on the empty value when no option is selected.</li>
    <li>Flutter: the <code>phone</code> icon is in <code>CmIcons</code>; the other additions are web only for now.</li>
  </ul>
  <h2 id="v1-1-1">v1.1.1</h2>
  <ul>
    <li>Fix: on phones, the <a href="#/components/header-bar">Header bar</a> could push the last control past the right edge when it had a logo, search, the user and two buttons in <code>end</code> (#9). Under 640px the controls on the right now sit without gaps (each keeps its 44px touch area) and a wide logo shrinks to make room.</li>
  </ul>
  <h2 id="v1-1-0">v1.1.0</h2>
  <ul>
    <li>Additions from the first product built on Commmerce UI (the Commmerce CRM). Nothing that worked in 1.0.0 changes. Pin it with <code>/v/1.1.0/</code> or <code>npm install @commmerce/ui@1.1.0</code>.</li>
    <li><a href="#/components/app-frame">App frame</a> (new, <code>cm-app-frame</code>): places the header bar, side navigation, page, bottom navigation and mobile menu, with the side navigation at 1024px and wider and the bottom navigation below. See the <a href="#/patterns/admin-frame">Admin frame</a> pattern.</li>
    <li><a href="#/components/side-navigation">Side navigation</a>: <code>collapsed</code> shows an icon rail with tooltips and badges; <code>collapsible</code> adds a toggle button that fires <code>cm-collapse</code>.</li>
    <li><a href="#/components/global-search">Global search</a> (new, <code>cm-global-search</code>): one box that searches everything, with grouped results (heading and total, title and second line, "See all"), keyboard navigation, and loading and empty states.</li>
    <li><a href="#/components/header-bar">Header bar</a>: a <code>search</code> slot, inline on wide bars and behind a search button that opens a full-screen layer at 900px and narrower.</li>
    <li><a href="#/components/notification-panel">Notification panel</a>: "Mark all read" (<code>mark-all-read</code>, <code>cm-mark-all-read</code>), a <code>footer</code> slot, a second line and an icon per item, and a <code>loading</code> state.</li>
    <li><a href="#/components/button">Button</a>: <code>icon-only</code> with <code>label</code> as its accessible name, <code>icon</code> by name, and <code>count</code> (a small counter, "99+" above 99, read out with the name).</li>
    <li><a href="#/components/tooltip">Tooltip</a>: <code>visual-only</code>, for a bubble that repeats a name the control already has.</li>
    <li>12 new <a href="#/icons">icons</a>: mail, chat, tag, building, map, note, eye, inbox, handshake, log-out (mirrored right to left), refresh and tasks.</li>
    <li>Commmerce's own products can pin the logo files at <code>/v/1.1.0/brand/</code> (<a href="#/foundations/logo">Logo</a>). Third-party apps still must not use the Commmerce logo.</li>
    <li>Flutter: the new icons are in <code>CmIcons</code>. The app frame, global search, collapsed navigation and the new button and panel options are web only for now.</li>
  </ul>
  <h2 id="v1-0-0">v1.0.0</h2>
  <ul>
    <li>First stable release. From now on, breaking changes come only in major versions, with 6 months' notice for
      anything deprecated (<a href="#/releases/stability">compatibility policy</a>).</li>
    <li>Install from npm: <code>npm install @commmerce/ui @commmerce/tokens</code> (React:
      <code>@commmerce/ui-react</code>; embedded apps: <code>@commmerce/app-bridge</code>), or pin the hosted files
      at <code>/v/1.0.0/</code>.</li>
    <li>No API changes since 1.0.0-rc.5. If you are upgrading from rc.2 or earlier, add the font link
      (<code>fonts.css</code>) before <code>tokens.css</code>; see the rc.3 notes.</li>
    <li>Poppins is now self-hosted: <code>fonts.css</code> loads the font from <code>fonts/*.woff2</code> next to it
      (shipped in <code>@commmerce/tokens</code> and the hosted build, SIL OFL 1.1) instead of Google Fonts, so pages
      no longer contact Google. If you copy the hosted files to your own server, copy the <code>fonts/</code> folder too.</li>
    <li>Licence: the Commmerce UI Licence 1.0 replaces the draft. The packages may be used in software built for the
      Commmerce platform, including marketplace apps. Every package now also ships <code>THIRD_PARTY_NOTICES.txt</code>
      where it includes third-party code, and the hosted build carries <code>LICENSE.txt</code>.</li>
  </ul>
  <h2 id="v1-0-0-rc-5">v1.0.0-rc.5</h2>
  <ul>
    <li>Fifth release candidate. Pin it with <code>/v/1.0.0-rc.5/cdn.js</code>, <code>/v/1.0.0-rc.5/tokens.css</code>, <code>/v/1.0.0-rc.5/fonts.css</code> and <code>/v/1.0.0-rc.5/app-bridge.js</code>, or <code>npm install @commmerce/ui@next</code>. Nothing that worked in rc.4 changes; everything below is added.</li>
    <li>New components: <a href="#/components/date-picker">Date picker</a>, <a href="#/components/date-range-picker">Date range picker</a> (with presets such as Last 7 days, for order and report filters) and <a href="#/components/combobox">Combobox</a> (type to filter, multi-select tags, results from your server, adding new values). All three submit with forms, follow the WAI-ARIA keyboard patterns and have React wrappers and Flutter widgets.</li>
    <li>Other languages: every built-in string (such as Previous, Next, Close and "3 selected") can be translated once for the whole app with <code>configure()</code> or per element with <code>strings</code>; numbers, dates and plurals follow the locale. Components work right to left: logical CSS, mirrored arrows and arrow keys, side panels open from the correct side. <a href="#/foundations/localisation">Localisation</a></li>
    <li>Tested with more frameworks: starter apps for <a href="#/start/frameworks">Vue 3, Angular, Svelte 5 and Next.js</a>, each on the published packages with browser tests in CI, plus a <a href="#/start/typescript">TypeScript</a> page.</li>
    <li>For app developers: <a href="#/apps/guidelines">App design guidelines</a> and a <a href="#/apps/review-checklist">marketplace review checklist</a>. App Bridge: <code>app.ready</code> now gives the <code>path</code> to open after a reload or from a shared link, and the admin sends <code>path.change</code> on Back and Forward.</li>
    <li>Fixes: Page header actions wrap below the title on narrow phones instead of overflowing; an overlay closed and reopened quickly no longer stays closed.</li>
  </ul>
  <h2 id="v1-0-0-rc-4">v1.0.0-rc.4</h2>
  <ul>
    <li>Fourth release candidate, the same code as 1.0.0-rc.3. Pin it with <code>/v/1.0.0-rc.4/cdn.js</code>, <code>/v/1.0.0-rc.4/tokens.css</code>, <code>/v/1.0.0-rc.4/fonts.css</code> and <code>/v/1.0.0-rc.4/app-bridge.js</code>.</li>
    <li>On npm: <code>npm install @commmerce/ui @commmerce/tokens</code> (React: <code>@commmerce/ui-react</code>; embedded apps: <code>@commmerce/app-bridge</code>). Published from GitHub with npm trusted publishing (no long-lived token). Release candidates go to the <code>next</code> tag: <code>npm install @commmerce/ui@next</code> gets this one.</li>
  </ul>
  <h2 id="v1-0-0-rc-3">v1.0.0-rc.3</h2>
  <ul>
    <li>Third release candidate. Pin it with <code>/v/1.0.0-rc.3/cdn.js</code>, <code>/v/1.0.0-rc.3/tokens.css</code> and <code>/v/1.0.0-rc.3/app-bridge.js</code>. Not yet on npm.</li>
    <li><strong>Change to check when upgrading:</strong> <code>tokens.css</code> no longer loads the Poppins font. Add <code>&lt;link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&amp;display=swap"&gt;</code> before it (or <code>import '@commmerce/tokens/fonts.css'</code>, also hosted at <code>/v/1.0.0-rc.3/fonts.css</code>). Firefox and Safari held back every token until the font stylesheet had loaded; now the colours and spacing apply at once. Without the font link, text falls back to the system font.</li>
    <li>App Bridge: the admin origin can be a pattern such as <code>https://*.commmerce.com</code>, so one app works inside every Commmerce product admin on a subdomain. It matches subdomains only, never the bare domain, look-alike domains, other schemes or ports, and messages still go to the one admin the app runs in. Session tokens and both starter apps accept the same pattern. <a href="#/apps/app-bridge">App Bridge</a></li>
    <li>1.0 <a href="#/releases/stability">compatibility policy</a> published: breaking changes only in major versions, 6 months' notice for deprecations.</li>
    <li>Tested in more browsers: the component suite now runs in Firefox and WebKit on every change, and was run in real Safari 27 on macOS.</li>
  </ul>
  <h2 id="v1-0-0-rc-2">v1.0.0-rc.2</h2>
  <ul>
    <li>Second release candidate. Pin it with <code>/v/1.0.0-rc.2/cdn.js</code>, <code>/v/1.0.0-rc.2/tokens.css</code> and <code>/v/1.0.0-rc.2/app-bridge.js</code>. Not yet on npm.</li>
    <li>Page layout without your own CSS: <a href="#/components/page">Page</a>, <a href="#/components/layout">Layout</a> (two-thirds and one-third columns that stack on narrow screens), <a href="#/components/stack">Stack</a> and <a href="#/components/grid">Grid</a>. The product editor pattern now uses them.</li>
    <li><a href="#/components/data-table">Data table</a>: a real table for reports and stock or order lists, with sortable columns, totals, a sticky header and first column, loading and empty states. It also styles a server-rendered <code>&lt;table&gt;</code>, and sorts it in the browser when a heading has <code>data-sort</code>. Every sort is announced to screen readers.</li>
    <li>Feedback: <a href="#/components/toast">Toast</a> (with <code>showToast()</code>), <a href="#/components/spinner">Spinner</a> and <a href="#/components/progress-bar">Progress bar</a>.</li>
    <li><a href="#/components/tooltip">Tooltip</a>, <a href="#/components/avatar">Avatar</a> and <a href="#/components/thumbnail">Thumbnail</a> (a Resource list row sizes a thumbnail in its <code>media</code> slot). The header bar's user pill now shows the user's initials when there is no photo.</li>
    <li>Resource list: the Select box has a menu (this page, all matching, none). Action menu takes an <code>icon</code> for its icon-only trigger.</li>
    <li>App Bridge: <code>app.autoResize()</code> keeps the admin's frame as tall as your page (new request <code>frame.resize</code>, still protocol version 1). <code>navigate</code> now refuses paths with <code>\\</code> or control characters, which some browsers read as another site. The backend example passes <code>issuer</code> and serves only stores that installed the app. The reference host shows real toasts and the loading bar with Progress bar.</li>
    <li>New: a <a href="#/apps/starter">starter app</a> to copy, in Node or PHP: a plain HTML page, a backend that verifies session tokens and serves only stores that installed the app, and a stand-in admin for local development. The PHP <code>SessionToken::verify()</code> works in any PHP app.</li>
    <li>389 automated tests (182 component, 180 React wrapper, 27 App Bridge) and 128 colour pairs checked. Not done yet: tests in Firefox and WebKit, and with real screen readers.</li>
  </ul>
  <h2 id="v1-0-0-rc-1">v1.0.0-rc.1</h2>
  <ul>
    <li>First release candidate for 1.0. Every package shares the version <code>1.0.0-rc.1</code>; pin it with <code>/v/1.0.0-rc.1/cdn.js</code> and <code>/v/1.0.0-rc.1/tokens.css</code>. Not yet on npm. The API can still change before 1.0.0, and no compatibility policy for 1.0 has been decided yet (<a href="#/releases/stability">Stability</a>).</li>
    <li>React wrappers are now tested: 151 tests with React 18 in Chromium check that every wrapper reaches its element, passes every property, and calls its <code>on…</code> prop for every documented event, plus children, refs, controlled values and handler swaps.</li>
    <li>Accessibility review: an automated audit (axe-core, WCAG 2.0 to 2.2 A and AA) of every component example in light and dark, and a keyboard sweep for visible focus and keyboard traps. Results and what is still to do are on the <a href="#/foundations/accessibility">Accessibility</a> page.</li>
    <li>Fixes from the review: Status tabs now link each tab to the list it filters in a way screen readers can follow (the old <code>aria-controls</code> could not reach out of the component); the Resource list loading spinner is no longer announced as part of the list; Info panel is a list only while it holds info items; resource and nested list rows also carry <code>role="listitem"</code> as an attribute; tinted Badges (information, success, critical, attention) keep AA contrast on grey page backgrounds.</li>
    <li>Not done yet: tests in Firefox (the test browser could not be installed in the build environment) and with real screen readers, and a manual WCAG audit.</li>
  </ul>
  <h2 id="v0-9-0">v0.9.0</h2>
  <ul>
    <li>Two patterns are now working examples: <a href="#/patterns/search-filter-sort">Search, filtering, sorting and bulk actions</a> (status tabs, search, the Filter panel with removable filter tags, sortable columns and a confirmed bulk delete) and <a href="#/patterns/app-layout">Embedded app layout and navigation</a> (a three-screen app in a frame that keeps the admin's address, save bar, modal and toasts in step through App Bridge).</li>
    <li>Two new patterns: <a href="#/patterns/confirm-delete">Confirm before deleting</a> and <a href="#/patterns/unsaved-changes">Unsaved changes when leaving</a>, both built on Modal.</li>
    <li>A States section on 15 component pages, with live examples of the loading, empty, disabled, error, saving and no-results states their examples lacked.</li>
    <li>No component code changed in this release: the hosted build is the same as v0.8.0 apart from its version number.</li>
  </ul>
  <h2 id="v0-8-0">v0.8.0</h2>
  <ul>
    <li>New package: <a href="#/apps/app-bridge">App Bridge</a> (<code>@commmerce/app-bridge</code>, protocol version 1). An app in the admin can show toasts and modals over the whole admin, drive the save bar and a loading bar, open the resource picker, update the admin's address, and get a session token for its backend.</li>
    <li>Load it from the hosted build, pinned: <code>/v/0.8.0/app-bridge.js</code>. Not yet on npm.</li>
    <li>Session tokens are 60-second HS256 JWTs; <code>verifySessionToken</code> checks the algorithm, signature, expiry and audience on your server. The claims are documented on the App Bridge page.</li>
    <li>Every message is checked on both sides: exact origins (never <code>*</code>), the expected window, the protocol version, and the request's contents.</li>
    <li>The App Bridge page has a working example. Before relying on App Bridge in a store, confirm with <a href="mailto:support@commmerce.com">support@commmerce.com</a> that your store's admin is connected.</li>
    <li>25 new browser tests with real same-origin and cross-origin frames (143 in total).</li>
  </ul>
  <h2 id="v0-7-0">v0.7.0</h2>
  <ul>
    <li>Six overlay components: <a href="#/components/modal">Modal</a>, <a href="#/components/side-panel">Side panel</a>, <a href="#/components/filter-panel">Filter panel</a>, <a href="#/components/action-menu">Action menu</a>, <a href="#/components/bottom-sheet">Bottom sheet</a> and <a href="#/components/notification-panel">Notification panel</a>, each with a React wrapper.</li>
    <li>Modal, Side panel, Filter panel, Bottom sheet and Notification panel are native modal dialogs: the page behind is inert, Esc and the backdrop fire a cancelable <code>cm-close</code> with the reason, page scrolling is locked, and focus returns to the button that opened them. Open them with <code>show()</code> or the <code>open</code> attribute.</li>
    <li>Action menu follows the WAI-ARIA menu button pattern: arrow keys, Home/End, typing a letter, Esc to close; its choices are <code>&lt;cm-menu-item&gt;</code>s, which Bottom sheet uses too.</li>
    <li>Filter panel reads and resets a <code>&lt;form&gt;</code> of your fields and fires <code>cm-filter-apply</code> with the values; it is now linked from the search and filtering pattern.</li>
    <li>Notification panel is admin chrome: for Commmerce products only, not for apps.</li>
  </ul>
  <h2 id="v0-6-0">v0.6.0</h2>
  <ul>
    <li>Seven navigation and marketplace components: <a href="#/components/side-navigation">Side navigation</a>, <a href="#/components/header-bar">Header bar</a>, <a href="#/components/bottom-navigation">Bottom navigation</a>, <a href="#/components/mobile-menu">Mobile menu</a>, <a href="#/components/flash-offer-bar">Flash offer bar</a>, <a href="#/components/link-tabs">Link tabs</a> and <a href="#/components/app-card">App card</a>, each with a React wrapper.</li>
    <li>Side navigation, Header bar, Bottom navigation and Mobile menu are the admin's own chrome, built from the live admin: for Commmerce products only, not for apps.</li>
    <li>Navigation takes its items from <code>&lt;cm-nav-item&gt;</code> children or a JSON <code>items</code> property, and fires a cancelable <code>cm-navigate</code> so single-page apps can route themselves.</li>
    <li>Side navigation sections open with Enter, Space or →, and ↑/↓ move between items; the Mobile menu opens sub-items on a second screen and returns focus on Back or Escape.</li>
    <li>New pattern: <a href="#/patterns/admin-dashboard">Admin dashboard and onboarding</a>.</li>
    <li>16 new line icons (57 in total), including <code>pos</code>, <code>website</code>, <code>apps</code>, <code>megaphone</code>, <code>staff</code>, <code>wallet</code> and <code>star</code>.</li>
    <li>New colour token <code>text-on-dark-secondary</code> for unselected items on black; the contrast check now covers 118 colour pairs.</li>
  </ul>
  <h2 id="v0-5-1">v0.5.1</h2>
  <ul>
    <li>The preview build is now versioned. Load <code>/v/0.5.1/tokens.css</code> and <code>/v/0.5.1/cdn.js</code> to pin this release: files under a version never change. <a href="#/start/install">Install</a></li>
    <li>All packages share one version number, and every release raises it.</li>
    <li>The docs are reorganised around building apps for the Commmerce admin: a quickstart that runs, a guide to building an admin app, six patterns, and Ready / In progress / Planned status on everything.</li>
    <li>Embedding apps in the Commmerce admin is live. App Bridge is still planned.</li>
    <li>Support for developers: <a href="mailto:support@commmerce.com">support@commmerce.com</a>.</li>
    <li>Tested in WebKit 18.2, the engine behind Safari, in addition to Chromium.</li>
    <li>Fix: Nested list keeps keyboard focus on the row's handle after a move, so a quick second key press works.</li>
  </ul>
  <h2 id="v0-5-0">v0.5.0 </h2>
  <ul>
    <li>Six list components: <a href="#/components/resource-list">Resource list</a>, <a href="#/components/table-header">Table header</a>, <a href="#/components/pagination">Pagination</a>, <a href="#/components/status-tabs">Status tabs</a>, <a href="#/components/nested-list">Nested list</a> and <a href="#/components/report-tile">Report tile</a>, each with a React wrapper.</li>
    <li>Resource list has bulk selection: select the page, then every match ("Select all 15,000 products"), with bulk actions and a spoken selection count.</li>
    <li>Table header becomes a real header row inside <code>role="table"</code>, with sortable columns (<code>aria-sort</code>) and a select-all box; rows share its grid through <code>--cm-table-columns</code>.</li>
    <li>Nested list rows reorder with drag and drop or the keyboard (↑/↓ on the handle), and moves are announced.</li>
    <li>Status tabs are ARIA tabs with counts; Pagination is a named landmark with a live "Showing 21–40 of 290" summary.</li>
  </ul>
  <h2 id="v0-4-0">v0.4.0</h2>
  <ul>
    <li>Five feedback components: <a href="#/components/empty-state">Empty state</a>, <a href="#/components/skeleton">Skeleton</a>, <a href="#/components/skeleton-display">Skeleton display</a>, <a href="#/components/comment">Comment</a> and <a href="#/components/smart-tip">Smart tip</a>, each with a React wrapper.</li>
    <li>Skeletons are hidden from screen readers and stop pulsing under reduced motion; Skeleton display announces "Loading" once.</li>
    <li>Comment box posts with a button or Ctrl/⌘ + Enter and fires a cancelable <code>cm-submit</code>, so you can keep the text if saving fails.</li>
    <li>Smart tips are whole-card links in a list, with an optional dark tour banner.</li>
    <li>The contrast check now covers 104 colour pairs.</li>
  </ul>
  <h2 id="v0-3-0">v0.3.0</h2>
  <ul>
    <li>Five layout components: <a href="#/components/page-header">Page header</a>, <a href="#/components/save-bar">Save bar</a>, <a href="#/components/action-bar">Action bar</a>, <a href="#/components/info-panel">Info panel</a> and <a href="#/components/accordion">Accordion</a>, each with a React wrapper.</li>
    <li>Page header puts breadcrumbs, the page <code>&lt;h1&gt;</code> and actions in one bar, with optional previous/next record arrows; on phones the breadcrumbs become a back arrow.</li>
    <li>Save bar can watch a form: it opens when a field changes, Save submits the form and Discard resets it. Both events are cancelable.</li>
    <li>Action bar has a critical tone for blocking errors, announced as an alert.</li>
    <li>The contrast check now covers 100 colour pairs (text and the red icon on the error bar).</li>
    <li>The docs build now fails if the component content has a syntax error.</li>
  </ul>
  <h2 id="v0-2-0">v0.2.0</h2>
  <ul>
    <li>Seven form components: <a href="#/components/radio">Radio button</a>, <a href="#/components/toggle">Toggle</a>, <a href="#/components/select">Select</a>, <a href="#/components/search">Search</a>, <a href="#/components/file-upload">File upload</a>, <a href="#/components/option-group">Option group</a> and <a href="#/components/tag">Tag</a>, each with a React wrapper.</li>
    <li>Radio button and Option group behave like native radio groups: one tab stop, arrow keys move and select, and the form gets the selected value.</li>
    <li>Select is a custom listbox, so its open list matches Figma, with native-select keyboard support (arrows, Home/End, typeahead, Enter, Escape).</li>
    <li>Contrast fixes where Figma falls short: outlined toggle track and thumb, <code>border-input</code> edges on Select and Search, <code>text-tertiary</code> placeholders. Each component page lists its differences from Figma.</li>
    <li>The build-time contrast check now covers 96 colour pairs.</li>
    <li>Docs: component pages document child elements (such as <code>cm-radio</code>) and list React props for custom events.</li>
  </ul>
  <h2 id="v0-1-0">v0.1.0</h2>
  <ul>
    <li>First release: Button, Text field, Checkbox, Badge, Card, Banner and Icon.</li>
    <li>Light and dark themes, built from the Figma file's neutrals.</li>
    <li>WCAG AA contrast across 66 colour tokens, checked on every build.</li>
    <li>New tokens: <code>border-input</code>, <code>action-*</code>, <code>text-speciality-on-dark</code>, <code>tracking-caps</code>.</li>
    <li>41 icons in <code>@commmerce/icons</code>.</li>
    <li>React wrappers in <code>@commmerce/ui-react</code>.</li>
  </ul>
`;
