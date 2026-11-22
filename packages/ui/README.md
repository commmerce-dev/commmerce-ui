# @commmerce/ui

Web components for building apps that feel native to the Commmerce admin: forms, lists, layout and feedback,
styled with Commmerce design tokens. They work in plain HTML, server-rendered pages, React and other frameworks.

Docs: https://commmerce.com/commmerceui/

## Install

```sh
npm install @commmerce/ui @commmerce/tokens
```

Using Bun? `bun add @commmerce/ui @commmerce/tokens` works the same, and so does bundling with `bun build`.

```js
import '@commmerce/tokens/fonts.css';  // the Poppins typeface (self-hosted, ships with @commmerce/tokens)
import '@commmerce/tokens/tokens.css';
import '@commmerce/ui'; // registers every <cm-*> element
```

Or without a build step, pinned to a version:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@commmerce/tokens@VERSION/dist/fonts.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@commmerce/tokens@VERSION/dist/tokens.css">
<script type="module" src="https://cdn.jsdelivr.net/npm/@commmerce/ui@VERSION/dist/cdn.js"></script>
<!-- The same files are also at https://commmerce.com/commmerceui/v/VERSION/ -->
```

## Use

```html
<form>
  <cm-text-field name="title" label="Title" required></cm-text-field>
  <cm-button type="submit" variant="primary">Save</cm-button>
</form>
```

Form controls take part in native forms: values appear in `FormData`, `required` blocks submission, and
`form.reset()` restores them. Set `data-cm-theme="light" | "dark" | "auto"` on `<html>` for themes.

Browsers: current Chrome and Edge, Firefox 98+ and Safari 16.4+ (the test suite runs in Chromium, Firefox and WebKit).

Support: support@commmerce.com
