# @commmerce/app-bridge

Connects an app embedded in the Commmerce admin (in an iframe) to the admin around it: admin-level toasts and
modals, the save bar, a loading bar, the resource picker, the admin's address, brand and recent colours, and session tokens for your backend.

Docs: https://commmerce.com/commmerceui/#apps--app-bridge

## In your app (inside the iframe)

```js
import { createApp } from '@commmerce/app-bridge';
// or, without a build step, pinned to a version:
// import { createApp } from 'https://cdn.commmerce.com/commmerceui/v/<version>/app-bridge.js';

// ADMIN_ORIGIN, from your app settings (render it into the page from your server): 'https://*.commmerce.com'
// (any Commmerce admin on a subdomain; recommended) or one exact origin.
const app = createApp({ hostOrigin: ADMIN_ORIGIN, apiKey: 'YOUR_API_KEY' });
const { theme } = await app.ready;                  // 'light' | 'dark'

await app.toast.show('Product saved', { tone: 'success' });
const choice = await app.modal.open({
  title: 'Delete review?', message: 'This can\'t be undone.',
  primaryAction: { label: 'Delete review', destructive: true }, secondaryAction: { label: 'Cancel' },
});                                                  // 'primary' | 'secondary' | 'close'
await app.navigate('/reviews/42');                   // updates the admin's address
await app.saveBar.show({ message: 'Unsaved changes' });
app.on('saveBar.save', save); app.on('saveBar.discard', discard);
const products = await app.resourcePicker({ type: 'product', multiple: true }); // [{ id, title }] or null
await app.loading.start(); /* … */ await app.loading.stop();
app.autoResize();                                    // the admin sizes your frame to your page
const brand = await app.colors.brandColors();        // [{ value: '#2e6faf', name: 'Primary' }] from the brand settings
await app.colors.addRecentColor('#2e6faf');          // recents per staff member, newest first, max 16
// app.colors has the shape of ColorSource in @commmerce/ui: pass it as cm-color-picker's `source`.

const token = await app.getSessionToken();
await fetch('/api/reviews', { headers: { Authorization: `Bearer ${token}` } });
```

`hostOrigin` is required: an exact origin, or a pattern such as `https://*.commmerce.com`. A pattern matches the
same scheme and port, and any host name ending in `.commmerce.com` with at least one label before it
(`admin.commmerce.com`, `a.b.commmerce.com`); never the bare domain, look-alikes (`evilcommmerce.com`,
`commmerce.com.evil.com`), other schemes or ports, or IP addresses. Only one leading `*.` is allowed, the domain
needs a dot, and there is no path (`*` and `https://*.com` are refused).

With a pattern, the app finds the admin's actual origin (`location.ancestorOrigins[0]`, or the origin of
`document.referrer` in browsers without it), checks it against the pattern, and throws if it doesn't match or
can't be found. Either way the app talks to one exact origin for the session (`app.hostOrigin`): requests are only
posted to it, never to `*`, and messages from any other origin, or from any window except the admin's, are ignored.
`exactHostOrigin` passes the admin's origin yourself (still checked against the pattern).

## On your backend: verify the session token

```js
import { verifySessionToken } from '@commmerce/app-bridge/session-token';

const claims = await verifySessionToken(token, process.env.COMMMERCE_APP_SECRET, {
  audience: process.env.COMMMERCE_API_KEY,
  issuer: process.env.COMMMERCE_ADMIN_ORIGIN,        // exact origin or pattern (https://*.commmerce.com); always pass it
});
// claims.dest: the store; claims.sub: the staff member. Throws SessionTokenError (answer 401) otherwise.
// Serve only stores that installed your app: look claims.dest up, and answer 403 if it is not there.
// Never take the store from the request itself.
```

Tokens are HS256 JWTs signed with your app secret and live 60 seconds. Claims: `iss` (admin origin), `dest` (store
origin), `aud` (your API key), `sub` (staff member id), `sid` (admin session), `iat`, `nbf`, `exp`, `jti`.
Only HS256 is accepted (`none` and every other algorithm are refused). Uses Web Crypto: Node 18+, Deno, Bun, edge runtimes.

## In the admin (host)

`createHost({ iframe, appOrigin, handlers })` answers requests from one app frame. Payloads are validated before
a handler runs; a missing handler answers `not-supported`. `createReferenceHost(...)` is a reference
implementation built from Commmerce UI components (`cm-modal`, `cm-save-bar`, …).

Colours (added in 1.17.0, still protocol v1): `colors.brand` → `[{ value, name? }]`, `colors.recent` → `string[]`
(newest first) and `colors.addRecent` `{ color }` → the new list. Host handlers `brandColors`, `recentColors` and
`addRecentColor(color)`; `color` is checked to be 1–200 characters, not to be a valid CSS colour, so treat it as
text. The reference host takes `brandColors` (default `[]`) and keeps recents in memory for that host only.
Admins older than 1.17.0 answer `unknown-type`.

## Protocol

Plain objects over `postMessage`, each with `protocol: 'commmerce-app-bridge'` and `version: 1`:
requests `{ kind: 'request', id, type, payload }`, responses `{ kind: 'response', id, ok, result | error }`,
events `{ kind: 'event', type, payload }`. The app sends `ready` first. Error codes: `unsupported-version`,
`unknown-type`, `invalid-payload`, `not-supported`, `not-ready`, `failed`, `timeout`.

Made and maintained by Commmerce. Support: support@commmerce.com
