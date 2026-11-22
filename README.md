# Commmerce UI

The design system for Commmerce platforms, used by Commmerce's own products and by
developers building apps that run inside the Commmerce admin.

| Package | What it is |
| --- | --- |
| `@commmerce/tokens` | Colours, type, spacing, radii and shadows as CSS custom properties (`--cm-*`), JSON and typed JS. |
| `@commmerce/icons` | Line icons (24px grid, 1.6px stroke) as SVG files and path data; the [Icons page](https://commmerce.com/commmerceui/#icons) lists every name. |
| `@commmerce/ui` | Web components (`<cm-button>`, `<cm-text-field>`, …). Work in any framework, server-rendered pages and plain HTML. |
| `@commmerce/ui-react` | React wrappers generated from the web components (`<Button>`, `<TextField>`, …). |
| `@commmerce/app-bridge` | Connects an app embedded in the admin to the admin: toasts, modals, save bar, loading bar, resource picker, navigation, and session tokens (sign/verify) for the app's backend. |

Docs: https://commmerce.com/commmerceui/

`packages/tokens/src/tokens.source.json` is a copy of the `tokens.json` in Commmerce's design system; refresh it from
there, never edit generated output.

## Use it

### Plain HTML, PHP, EJS, Vue, anything

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@commmerce/tokens@VERSION/dist/fonts.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@commmerce/tokens@VERSION/dist/tokens.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/@commmerce/ui@VERSION/dist/cdn.js"></script>

<form>
  <cm-text-field name="title" label="Title" required></cm-text-field>
  <cm-checkbox name="track" label="Track quantity" checked></cm-checkbox>
  <cm-button type="submit" variant="primary">Save</cm-button>
</form>
```

Form controls are form-associated: their values appear in `FormData`, `required` blocks submit,
and `form.reset()` restores them.

### React

```tsx
import '@commmerce/tokens/fonts.css';  // the Poppins typeface (self-hosted, ships with @commmerce/tokens)
import '@commmerce/tokens/tokens.css';
import { Button, TextField } from '@commmerce/ui-react';

<TextField label="Title" value={title} onInput={(e) => setTitle(e.currentTarget.value)} />
<Button variant="primary" onClick={save}>Save</Button>
```

### Themes

Set `data-cm-theme` on `<html>` (or any container): `light` (default), `dark`, or `auto` to follow the OS.
Every colour pairing passes WCAG AA in both themes; `npm run build` fails if one stops passing.

### Tokens in your own CSS

```css
.my-panel { background: var(--cm-bg-surface); border: 1px solid var(--cm-border-default); border-radius: var(--cm-radius-md); }
```

## Components (v0.4)

| Element | Notes |
| --- | --- |
| `cm-button` | `variant` primary/secondary, `size` large/medium/slim, `type` submit/reset, `loading`, `href` |
| `cm-text-field` | `label`, `hint` (bracketed), `help-text`, `error`, `multiline`, `required`, `size="small"` |
| `cm-checkbox` | `label`, `description`, `checked`, `indeterminate`, `value` |
| `cm-radio-group` + `cm-radio` | Group: `name`, `value`, `label`, `help-text`, `error`, `orientation`, `required`. Option: `value`, `label`, `description`, `checked`, `disabled`. Arrow keys, one tab stop |
| `cm-toggle` | `label` or `aria-label`, `description`, `checked`, `value`; native `role="switch"` |
| `cm-select` | `<option>` children or `options`; `label`, `placeholder`, `help-text`, `error`, `required`. Listbox popup with full keyboard support |
| `cm-search` | `label` (spoken), `placeholder`, `filter`, `filter-count`, `size="large"`; fires `cm-search`, `cm-filter` |
| `cm-file-upload` | `label`, `hint`, `accept`, `multiple`, `max-size`, `max-files`, `required`; fires `change`, `cm-reject` |
| `cm-option-group` | `<option>` children or `options`; `label`, `name`, `value`, `required`. Behaves as a radio group |
| `cm-tag` | Slot text; `removable` (fires `cm-remove`), `remove-label` |
| `cm-badge` | `tone` information/success/critical/attention/neutral |
| `cm-card` | `heading`, `heading-level`, `description`, `flush`; slots `actions`, `title-adornment` |
| `cm-icon` | `name`, `size`, `label` (decorative unless labelled) |
| `cm-page-header` | `heading` (the page `<h1>`), `breadcrumbs` (JSON `[{label, href}]`), `pagination` + `has-previous`/`has-next` (fires `cm-previous`, `cm-next`); slots `actions`, `title-adornment`. Back arrow on phones |
| `cm-action-bar` | `eyebrow`, `heading`, `tone="critical"` (alert), `sticky`; slots `actions`, `adornment`, default |
| `cm-save-bar` | `open`, `message`, `form` (watch a form: opens on input, Save submits, Discard resets), `loading`, `save-disabled`; fires cancelable `cm-save`, `cm-discard` |
| `cm-info-panel` + `cm-info-item` | Panel: `heading`, `action` (fires `cm-action`), `action-label`. Item: `label`, `half`; value in the slot |
| `cm-accordion` | `heading`, `open`, `disabled`, `heading-level`; fires `cm-toggle` |
| `cm-empty-state` | `heading`, `icon` or `image` (or slot `image`), `size` large/small, `heading-level`; slots default (text), `actions` |
| `cm-skeleton` | `variant` text/thumbnail/block, `lines`, `size` small/medium/large/xlarge (34/40/50/186px); hidden from screen readers |
| `cm-skeleton-display` | Whole-page loading placeholder: `layout` two-column/one-column, `navigation` (admin only), `label` (announced) |
| `cm-comment-box` + `cm-comment` | Box: `heading`, `label`, `placeholder`, `action`, `value`, `disabled`; fires cancelable `cm-submit`. Comment: `author`, `datetime`, `time` |
| `cm-smart-tips` + `cm-smart-tip` | Tips: `heading`, `tour-heading`, `tour-action` (fires `cm-tour`). Tip: `heading`, `href`, `target`; whole card is one link |
| `cm-resource-list` + `cm-resource-item` | List: `selectable`, `total`, `resource-name`, `resource-name-plural`, `loading`, `all-selected`; slots `bulk-actions`, `actions`, `header`, `empty`; fires `cm-selection-change`. Item: `value`, `selected`, `disabled`, `href`, `label`; slots `media`, `actions` |
| `cm-table-header` | `<option>` children or `columns`; `sortable` columns fire `cm-sort`; `selectable` select-all (fires `cm-select-all`); grid from `--cm-table-columns` |
| `cm-pagination` | `page`, `total`, `page-size`, `page-sizes`, `resource-name`; fires `cm-page-change`, `cm-page-size-change` |
| `cm-status-tabs` | `<option count>` children or `tabs`; `value`, `controls`, `size` large/small; ARIA tabs, fires `change` |
| `cm-nested-list` + `cm-nested-item` | List: `heading`, `sortable` (keyboard and drag reorder, fires cancelable `cm-reorder`), `collapsible`, `open`; slot `actions`. Item: `label`, `value`; nest items inside items |
| `cm-report-tiles` + `cm-report-tile` | Tiles: `heading`. Tile: `label`, `icon` (or slot `icon`), `href`, `pinned` |
| `cm-side-navigation` + `cm-nav-item` | Admin only. `cm-nav-item` children (nest for sub-items) or `items`; item `label`, `icon`, `href`, `current`, `badge`, `expanded`; `label`, `collapsed` (icon rail), `collapsible` (built-in toggle); fires cancelable `cm-navigate`, `cm-expand`, cancelable `cm-collapse` |
| `cm-app-frame` | Admin only. Places slots `header`, `navigation`, the page, `bottom-navigation`, `mobile-menu`: side navigation at 1024px and wider, bottom navigation below; sticky header and side navigation; `menu-open`, `menu-item` (wires More to the menu); adds the `main` landmark; fires `cm-menu-toggle` |
| `cm-header-bar` | Admin only. `store`, `balance`, `user-name`, `avatar-src`; slots `logo`, `actions`, `end`; fires `cm-store-switch`, `cm-wallet`, `cm-account` |
| `cm-bottom-navigation` | Admin only, phones. Up to five `cm-nav-item`s (one `primary`), `fixed`; fires cancelable `cm-navigate` |
| `cm-mobile-menu` | Admin only, phones. `cm-nav-item` sections of rows (sub-items open a second screen), `store`, `user-name`, `user-email`, `avatar-src`; fires `cm-navigate`, `cm-store-switch`, `cm-account` |
| `cm-flash-offer-bar` | Message with one `<a>`; `icon`, `dismissible` (fires cancelable `cm-dismiss`) |
| `cm-link-tabs` | `cm-nav-item` children with `href`/`current`, `label`; links between sibling pages, fires cancelable `cm-navigate` |
| `cm-app-card` | `name`, `developer`, `rating`, `reviews`, `reviews-href`, `pricing`, `offer`, `href`, `heading-level`; slots `logo`, `actions`, `status` |
| `cm-modal` | `open` (or `show()`/`close()`), `heading`, `size` small/medium/large, `close-label`; slot `footer`; fires `cm-open`, cancelable `cm-close` (`detail.reason`), `cm-closed` |
| `cm-side-panel` | Same as `cm-modal`, anchored right (`size` small/medium/large); inset card on phones |
| `cm-filter-panel` | Side panel with `search`, `query`, `apply-label`, `reset-label`; reads a slotted `<form>`; fires cancelable `cm-filter-apply` (`values`, `query`), `cm-filter-reset` |
| `cm-action-menu` + `cm-menu-item` | Menu: `cm-menu-item` children (`<hr>` between groups) or `items`, `label`, `trigger-label`, `icon-only`, `align`, `heading`, `subheading`; slot `trigger`; fires cancelable `cm-select`, `cm-toggle`. Item: `value`, `icon`, `href`, `disabled`, `critical` |
| `cm-bottom-sheet` | Phones. `cm-menu-item` rows or own content, `heading` (hidden name); fires cancelable `cm-select` and the overlay events |
| `cm-notification-panel` + `cm-notification-item` | Admin only. Panel: `more-href`, `more-label`, `empty-text`, `items`; fires cancelable `cm-select`. Item: `time`, `tone`, `href`, `unread` |
| `cm-banner` | `tone`, `heading`, `dismissible` (fires cancelable `cm-dismiss`); slot `actions` |
| `cm-page`, `cm-layout` + `cm-layout-section`, `cm-stack`, `cm-grid` | Page layout: page width and padding with a `header` slot; sections `full`/`one-half`/`one-third`/`two-thirds` that stack below 768px; stacks and grids with `gap` in spacing steps |
| `cm-data-table` | `columns` (`key`, `label`, `type` text/numeric/money/date, `sortable`), `rows`, `totals`, `caption`, `sort-mode` auto/manual, `sticky-header`, `sticky-first-column`, `loading`; slot `empty`; fires cancelable `cm-sort`. Also styles a slotted native `<table>` |
| `cm-toast` + `showToast()` | `message`, `tone` default/critical, `duration`, `action-label`; fires `cm-action`, cancelable `cm-dismiss`. `showToast(message, options)` adds one to a polite `cm-toast-region` |
| `cm-spinner`, `cm-progress-bar` | Spinner: `size`, `accessible-label`. Progress bar: `value` 0–100 (none = indeterminate), `label`, `label-hidden`, `show-value`, `size` |
| `cm-tooltip` | Wraps one focusable trigger: `content`, `placement`, `delay`, `visual-only`; Esc closes; fires `cm-show`, `cm-hide` |
| `cm-avatar`, `cm-thumbnail` | Avatar: `name` (initials), `src`, `size`, `shape` round/square, `decorative`. Thumbnail: `src`, `alt`, `size`, `loading`; placeholder when missing |

The current version is **1.0.0**, the first stable release, published on npm under the Commmerce UI Licence (LICENSE.md). `examples/app-starter` is a complete app to copy (also downloadable from the docs). The React wrappers have their own tests, run with React 18 and React 19, and an automated accessibility audit covers every component example. The component, React wrapper and App Bridge tests run in Chromium, Firefox and WebKit on every change. What comes next (a manual screen-reader pass, legal review of the licence) is in [ROADMAP.md](ROADMAP.md).

## Develop

```sh
npm install
npm run build        # tokens -> ui -> ui-react
npm test             # component, React wrapper and App Bridge tests in headless Chromium (CHROMIUM_PATH=… to reuse an installed one)
npm run test:react19 # the React wrapper tests again with React 19 (installs it into packages/ui-react/react19)
npm run a11y         # after docs:build: axe-core + keyboard audit of every component example, light and dark
npm run playground   # builds and opens playground/index.html
npm run docs         # builds and opens the docs site (docs/) on port 4600
```

Bun works too: `bun install`, then `bun run build`, `bun run test` and so on. Use `bun run test`, not `bun test`: the tests need Vitest, and `bun test` starts Bun's own test runner.

Rules for components:
- Style only with `--cm-*` tokens. No raw hex values in components.
- Every interactive part is keyboard reachable, has a visible focus ring and a correct ARIA role.
- Native events (`input`, `change`, `click`) keep working; custom events are prefixed `cm-`.
- Register with `define()` from `src/base.ts` so loading the library twice is harmless.
