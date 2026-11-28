# Changelog

The Flutter package shares its version number with the Commmerce UI web packages. Full release notes:
https://commmerce.com/blog/commmerceui/#releases

## 1.21.3

* No Flutter changes.

## 1.21.2

* No Flutter changes (web: the app frame locks page scrolling while the mobile menu is open).

## 1.21.1

* `CmColors` (light): `textSuccess`, `textInformation`, `textAttention` and `textTertiary` are slightly darker, so status text meets 4.5:1 on soft fills over grey backgrounds. No API changes.

## 1.21.0

* No Flutter API changes. `CmAppFrame` docs: pass `selectedId: open ? 'more' : page` to `CmBottomNavigation` so "More" shows as the current tab while the mobile menu is open (web: `cm-bottom-navigation` gains `menu-item` and `menu-open`; calendar chip text fix).

## 1.20.4

* No scrollbars: `CmTheme` hides scrollbars (areas still scroll), and `CmDataTable` no longer adds its own.

## 1.20.3

* No Flutter changes (web: the app frame side navigation scrolls without a visible scrollbar).

## 1.20.2

* No Flutter changes (web: Firefox tests for three focus and hover checks run again).

## 1.20.1

* No Flutter changes (web fix: link tabs fade the edge when they scroll on phones).

## 1.20.0

* Token `navBadgeSoft` (light tint of the Commmerce blue, generated from the web tokens). The web refined look now uses blue and Poppins; Flutter has no looks, so widgets don't change.

## 1.19.0

* Token `accountRing` and the `eyedropper` icon (generated from the web packages). No widget changes: the web release changes the docs frame, phone navigation marking and adds a tertiary button.

## 1.18.0

* `CmDateRangePicker(variant: CmDateRangeVariant.report)`: a summary field (preset chip and range) and a report popup with the presets and their dates (Custom first), typed start and end boxes, months listed one under another, and Cancel and Apply with the day count. `CmDateRangePreset.reportVariant` is its default list.
* New presets `CmDateRangePreset.quarterToDate` and `lastQuarter`; strings `presetQuarterToDate`, `presetLastQuarter`, `dateRangeDayCount`, `dateRangeStart`, `dateRangeEnd`.

## 1.17.1

* `CmResourceList`: a selected or hovered row is highlighted across the full width of the list (edge to edge, like
  the select-all bar), and the lines between rows run edge to edge. The checkboxes and content don't move.

## 1.17.0

* No Flutter changes yet: the colour picker panel (`cm-color-picker`, brand and recent colours, opacity, formats, gradients) is web only for now.

## 1.16.0

* New `CmTimePicker` (web `cm-time-picker`): type a time (`3:30 pm`, `1530`, `9pm`; `cmParseTime`) or choose one from a
  dropdown list; `min`, `max`, `step`, `interval`, `hourCycle` (`CmHourCycle.h12` / `h23`; a forced 24-hour clock shows
  `09:05`), `size` (`CmFieldSize`: 40 / 36 / 32, 44 on touch), the web's validation messages. Value is a `TimeOfDay`.
* `CmDateRangePicker` for reports: new presets (`thisWeek`, `lastWeek`, `last28Days`, `last90Days`, `last12Months`,
  `thisYear`, `lastYear`, `custom`; `CmDateRangePreset.report`, `byKey`, `resolve`), `preset` + `onPresetChanged`, `months`
  (two months side by side, one on phones), `confirm` (Apply/Cancel) and `firstDayOfWeek`. With `months: 2`, `confirm` or
  the Custom preset the field opens the Commmerce range panel (presets beside the calendar) instead of the Material picker.
* New `CmStrings`: the new preset labels, `presetCustom`, `dateRangeApply`, `dateRangeCancel`, `dateRangeNoDates`,
  `dateRangeChooseStart`, `dateRangeChooseEnd`, `dateRangeStartNote`, `dateRangeEndNote` and the `timePicker*` strings.

## 1.15.0

* No Flutter changes: `inputmode` is a web text field option (Flutter sets the keyboard with `keyboardType`).

## 1.14.0

* No Flutter changes: messages under every field on leave and submit, and the text field pattern and length checks, are web only for now.

## 1.13.1

* No Flutter changes: the text field email, web address and number checks are a web fix.

## 1.13.0

* No Flutter changes: the date picker message, phone wrapping fixes and the resource list `mobile="stack"` option are web only for now.

## 1.12.0

* No Flutter changes: the spinner's own-graphic slot is web only for now.

## 1.11.0

* Tokens only: the generated tokens gain the new 1.11 colour and size tokens (accent, counts, tab line, selected rows, badge dot). The opt-in refined look is web only.

## 1.10.1

* No Flutter changes (web dropdowns in the top layer, #35).

## 1.10.0

* `CmSparkline`, a word-sized chart of one series over time for summary cards (mirrors `cm-sparkline`). Bars by default or a line, `neutral`/`information`/`success` tones, no axes, time left to right in RTL; screen readers hear one sentence ("Visits: 1,240 in all, peak 96 on 12 Nov, latest 40"); hover or long-press text per bar when `labels` are given. New `CmStrings`: `sparklineSummary`, `sparklineSummaryAt`, `sparklineEmpty`.

## 1.9.3

* No Flutter changes (web button label fix).

## 1.9.2

* No Flutter changes (web `cm-account-menu` and action menu placement).

## 1.9.1

* No Flutter changes (web `cm-info-item editable`).

## 1.9.0

* CmCalendar, the port of `cm-calendar`. Month, week and day views of `CmCalendarEvent`s with Previous/Today/Next and a view switch. Events move between days and times by mouse drag, press-and-hold on touch, or the keyboard (Space, arrows, Enter; every step announced). `onMove` can refuse a move or save it with a future (shown as saving, put back if the save fails), and there is a `controlled` mode. Also: "+N more", `onAdd` from days, the all-day row and hours, `onOpen`, `onRangeChange`, `dayStart` and `scrollToHour`, a compact month and three-day week under 600 wide, right-to-left, light and dark. Built-in text in `CmStrings` (`calendar*`), including month and weekday names. Not ported: `href` and `locale` (no Intl), and dragging from the "+N more" list (keyboard only).
* CmSignatureField (mirrors `cm-signature-field`, CRM issue #26): sign by drawing (mouse, finger or pen, with pressure) or typing a name in Dancing Script (bundled, SIL OFL 1.1); Undo and Clear; CmSignatureController exports a PNG cropped to the ink (black on transparent, 2x) as bytes or a data URL (asynchronously), with loadImage for a saved signature; required, error, disabled and Form validate/save/reset; Draw/Type tabs with arrow keys, Home and End and tab semantics; drawing doesn't scroll the page. Strings in CmStrings.signatureField*.

## 1.8.1

* No Flutter changes (web timeline and resource list fixes).

## 1.8.0

* Licence: the Commmerce UI Licence 1.1 (`LICENSE`): acceptance on download, install or use; liability capped at the amount paid (zero, the package is free); laws of India, courts at Bengaluru, Karnataka.
* No widget changes.

## 1.7.2

* No Flutter changes (a web data table fix).

## 1.7.1

* Button group (web 1.7 `cm-button-group`): `CmButtonGroup` with `overflow: CmButtonGroupOverflow.wrap` (the default: a Wrap 8 apart) or `.menu` (one line; the buttons that don't fit move into a trailing "More" `CmActionMenu`, measured from the group's own width in the same layout pass). Buttons leave in the web's order: `CmButtonPriority.low` (via `CmButtonGroupItem`), then normal from the last backwards, then `high`, a primary button last; they come back when there is room. Menu items show the button's label and icon, are disabled while it is disabled or loading and destructive for `CmButtonTone.critical`; choosing one calls the button's `onPressed`. More matches the buttons (36, slim 32, large 40; 40 drawn with a 44 hit area on touch), `moreIcon` makes it a square icon button, `moreLabel` (default `CmStrings.buttonGroupMore`, "More"). `align` (start/end), RTL, a `label` for screen readers (hidden buttons are not read or focusable), focus moves to More when a focused button moves into it and to the last button when More goes away, `onOverflowChange` (indexes in the menu). `CmButton` gains `focusNode`. The example's 1.7 page has a CRM call-outcome demo.
* `CmInfoPanel` stacked layout (the default) on the owner standard: 13/18 text-tertiary labels, 4 above 14/20 medium values, facts 12 apart, two half items 20 apart; padding from the card standard (24, compact 16).
* On the 1.5/1.6 scale (the web check-scale rules): every padding and gap on the 4px grid, heights in multiples of 4, no type off 12/13/14/16/18/20/24/30. Visible changes: toggle 36x20 with a 16 knob, timeline dot 8, flash bar 48 inline when dismissible, CmTableHeader at least 40 tall, app card logo 128x56 (96x40 narrow), nested list indent and rows 48 and its desktop title 24, drag handle 24x32, bottom navigation, global search, select and menu paddings 4/8.

## 1.7.0

* Command palette (web 1.7): `showCmCommandPalette` (grouped records from an async `search`, actions filtered by title and keywords with every word matching, any case or accent, recent items, keycap shortcut hints, loading and empty states, ↑/↓/Home/End/Enter/Esc, results announced; full screen with a close button at 640 or less; 40 box, 44 and 16px text on touch), `CmCommandPaletteShortcut` (mod+K through Shortcuts/Actions, toggles), `cmCommandMatches`, `CmShortcut` and `CmKeys`.
* Undo toasts (web 1.7): `showCmToast(action: CmToastAction(...))`, `closed` completes with `CmToastCloseReason` (`action`, `timeout`, `close`, `removed`; `CmToastDismissReason` stays as an alias), F6 moves focus to the newest toast's action and back (`cmFocusToast`), Esc closes a focused toast, the action's toast is announced with "Press F6 to reach it.", `cmUndoable(context, doIt, undoIt, message:)`.
* The rest of the 1.6 standard: CmDataTable actions columns (`CmDataTableAction`, `onRowAction`, `rowActions`), `resizable` (drag, ←/→ 16px, announced, `onColumnResize`), `columnPicker` and `visible` (`onColumnsChange`), `CmDataTableMobile.priority` with "View all fields", a "Scroll for more" hint, `primary` and `width` on columns; CmStatusTabs `size` (small) and `mobile: select`; CmActionMenu rows 36/32 (`density`)/44 touch with `CmMenuItem.heading` and `shortcut`; CmTooltip 12px, 8x12, max 240, 400ms; CmTag 24/12; CmCombobox `maxTags` with "+N more" and ←/→/Home/End/Backspace/Delete between tags; CmFileUpload 72px empty row ("Drag files here or Browse"), `setDragOver`, `setProgress`/`onCancel`, `setFileError`, 112–140 tiles, empty photo tile up to 120 tall; field text 16px on touch (`cmFieldText`).
* Record page (web 1.7): `CmRecordLayout` (`main` + `aside`; the aside is a 320 column on the end side from 880 of the layout's own width, on the left in RTL; narrower it stacks above, or below with `asidePosition: CmAsidePosition.below`; gap 24, 16 at 640 or less; `stickyAside` keeps it in view while the main column scrolls when it fits the scroll view, `stickyTop`); `CmPageHeader` `onBack` and `backLabel` (a "Back to {label}" arrow at every width) and, on phones, actions under the `description` line; `CmInfoPanel` `variant` (compact) and `layout: CmInfoLayout.rows` (13/18 labels on two fifths, 14/20 medium values); `CmDataTableColumn.lines` (text wraps onto up to N lines, then "…", full value in a tooltip and for screen readers). The example app has a Record page (a CRM lead).
* Changes for existing apps: CmFileUpload's default prompt is now "Drag files here or Browse" (`prompt` is nullable); a toast that is pushed out by newer ones completes `closed` with `removed` (was `close`); the hint of an empty CmFileUpload moved into the zone.

## 1.6.0

* The 1.5 scale and the owner standard (#33): CmControlHeight/CmIconSize/CmMotion tokens, label 13/500 and headingSection type, buttons 36 (40 touch), fields 40 (44 touch, small 32), checkbox 16/18, badge 24, card variants (compact, interactive), compact CmEmptyState (large keeps the old look), CmStatusTabs count pills and scroll fade, CmPage widths and 24/16 padding, CmAppFrame panel, CmSegmentedControl, CmPageHeader description, CmResourceList density and select-all row, CmDataTable standard sizes and cards on narrow widths. Deprecated tokens are annotated and unused.
* Changes for existing apps: side navigation 220 wide (rail 72), card padding 24, page padding 24/16, empty state default is the compact tile.
* Not yet (done in the next version): table row actions, resize, column picker, priority mode; status tab dropdown; menu, tooltip, multi-select and upload sizes.

## 1.5.2

* No Flutter changes (a web calendar fix).

## 1.5.1

* No Flutter changes (a web app frame fix).

## 1.5.0

* Tokens regenerated on the 1.5 scale (4px spacing, radius 4/6/8/12, type 12–30, overlay shadows `CmShadow.sm/md/lg`, border-subtle).
* `CmButton` 40/36/32 with 14px labels and a white secondary; fields 36px (32 small); badges, bottom navigation and menus in sentence case; side navigation and header bar resized. Nothing under 12px.
* Not yet: card, status tab and resource list layout changes; 44px touch fields; control-height and motion tokens.

## 1.4.0

* Catches up with the web 1.1–1.3 additions: `CmAppFrame`, `CmGlobalSearch` (+ `CmHeaderBar.search`, full-screen layer
  on narrow bars), collapsible `CmSideNav` rail, notification panel (mark all read, description, icon, loading, footer),
  `CmButton` icon-only, count and tone, `CmTimeline`, `CmMetric`, inline `CmEmptyState`, `CmDatePicker` time mode,
  card and page header titles wrapping on narrow widths, `CmBoard` with keyboard and drag moves (`CmMoveModel`),
  `CmColorField`, photo mode on `CmFileUpload`, option groups in `CmSelect`/`CmCombobox`, moves between grouped
  `CmNestedList`s, tones on `CmOptionGroup` options, card actions without a heading.
* Not ported: tooltip `visual-only`, text field time types (use the date picker's time mode), table header alignment,
  board `controlled`, the colour field's browser picker, file upload `capture` (the app chooses the camera in `onPick`).
* Web 1.4.0's calendar and signature field have no Flutter widgets yet.

## 1.3.0

* New icons in `CmIcons`: camera, image, idCard, navigation, wifiOff.
* The web-only additions of 1.3.0 (board, colour field, photo tile, option groups, nested list moves) have no Flutter widgets yet.

## 1.2.0

* New icon in `CmIcons`: phone.
* The web-only additions of 1.2.0 (timeline, metric, date and time, button tones, inline empty state) have no Flutter widgets yet.

## 1.1.1

* No Flutter changes (a web Header bar fix).

## 1.1.0

* New icons in `CmIcons`: mail, chat, tag, building, map, note, eye, inbox, handshake, logOut, refresh, tasks.
* The web-only additions of 1.1.0 (app frame, global search, collapsed side navigation, icon-only button with count,
  notification panel options) have no Flutter widgets yet.

## 1.0.0

* First stable release. No API changes since 1.0.0-rc.5.
* Licence: the Commmerce UI Licence 1.0 replaces the draft (`LICENSE`); third-party notices in `THIRD_PARTY_NOTICES.txt`.

## 1.0.0-rc.5

* New: `CmDatePicker`, `CmDateRangePicker` (with presets) and `CmCombobox` (filtering, multi-select chips, server results).
* `CmStrings` and `CmLocalizations`: translate every built-in string once for the app. Right-to-left layout is not checked yet.

## 1.0.0-rc.4

* Version aligned with the web packages (previously 0.5.1), as the 1.0 compatibility policy requires.
* 59 widget classes matching the web components, including the admin shell (`CmAdminScaffold`, `CmSideNav`,
  `CmHeaderBar`), forms, overlays, lists, `CmDataTable`, page layout (`CmPage`, `CmLayout`, `CmGrid`, `CmStack`),
  toasts, tooltips, spinners and progress bars.
* Every announced control can be activated by screen readers; an audit test walks the example app to keep it so.
