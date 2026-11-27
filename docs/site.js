// Site-level content: status definitions, packages, and patterns (complete merchant workflows).
// Component docs live in content.js; release notes in releases.js.
import { VERSION } from './vendor/version.js';
import { undoable } from './vendor/cdn.js';

export const STATUS = {
  ready: { label: 'Ready', tone: 'success', text: 'Documented and usable, in the hosted build and the npm packages.' },
  'in-progress': { label: 'In progress', tone: 'attention', text: 'Next in the build queue. Not usable yet.' },
  planned: { label: 'Planned', tone: 'neutral', text: 'Scheduled, not started. Not usable yet.' },
};

export const SUPPORT_EMAIL = 'support@commmerce.com';

// Hosted build. /v/<version>/ files never change once published; /vendor/ is always the latest release.
const HOST = 'https://commmerce.com/commmerceui';
// 1.0.0 and later are stable; a pre-release suffix (1.0.0-rc.4) means preview. The docs' preview wording follows this,
// so releasing 1.0.0 needs only the version bump and its release note.
export const STABLE = !VERSION.includes('-');
// Snippets load the hosted build from cdn.commmerce.com (Cloudflare Worker commmerceui-proxy, route
// cdn.commmerce.com/commmerceui/*; same files as HOST). /v/<version>/ never changes once published.
// jsDelivr serves the npm packages as a mirror (jsdelivr*).
const CDN = `https://cdn.commmerce.com/commmerceui/v/${VERSION}`;
const NPM_CDN = 'https://cdn.jsdelivr.net/npm/@commmerce';
export const PREVIEW = {
  version: VERSION,
  css: `${CDN}/tokens.css`,
  js: `${CDN}/cdn.js`,
  font: `${CDN}/fonts.css`,
  bridge: `${CDN}/app-bridge.js`,
  jsdelivrCss: `${NPM_CDN}/tokens@${VERSION}/dist/tokens.css`,
  jsdelivrJs: `${NPM_CDN}/ui@${VERSION}/dist/cdn.js`,
  latestCss: `${HOST}/vendor/tokens.css`,
  latestJs: `${HOST}/vendor/cdn.js`,
};

export const packages = [
  { name: `Hosted build v${VERSION}`, status: 'ready', what: 'One stylesheet (tokens), one ES module that registers every ready component, and `app-bridge.js` for apps embedded in the admin. Loads from any website, from cdn.commmerce.com (or jsDelivr as a mirror). A pinned version never changes; `/vendor/` always serves the latest release.' },
  { name: '@commmerce/tokens', status: 'ready', what: 'Colours, type, spacing, radii and shadows as CSS variables (`--cm-*`), JSON and typed JS, plus `fonts.css` for the Poppins typeface. On npm: `npm install @commmerce/tokens`.' },
  { name: '@commmerce/ui', status: 'ready', what: 'The web components as an npm package. On npm: `npm install @commmerce/ui`.' },
  { name: '@commmerce/ui-react', status: 'ready', what: 'React components generated from the web components, with typed props and events. Tested with React 18 and React 19 (every wrapper\'s props and events) in Chromium, Firefox and WebKit. On npm: `npm install @commmerce/ui-react`.' },
  { name: '@commmerce/icons', status: 'ready', what: 'The line icons as SVG files and path data. On npm: `npm install @commmerce/icons` (installed with `@commmerce/ui`).' },
  { name: '@commmerce/app-bridge', status: 'ready', what: 'Lets an app embedded in the admin open toasts and modals, navigate, show the save bar, pick resources and get a session token. Also in the hosted build as `app-bridge.js`. On npm: `npm install @commmerce/app-bridge`.' },
];

/* ---------------- Patterns ---------------- */
// kind: 'example' = a working layout you can copy; 'guidance' = recommended approach, parts not built yet.
// uses: component slugs, so component pages can link back to the patterns that use them.

const ORDERS = [
  ['1042', 'Priya Sharma', '13 Nov, 4:20 pm', 'Rs. 2,340', ['success', 'Paid'], 'unprocessed'],
  ['1041', 'Rahul Mehta', '13 Nov, 1:05 pm', 'Rs. 899', ['information', 'Pending'], 'unprocessed'],
  ['1040', 'Ananya Iyer', '12 Nov, 6:48 pm', 'Rs. 12,499', ['success', 'Paid'], 'processing'],
  ['1039', 'Farhan Ali', '12 Nov, 11:30 am', 'Rs. 1,150', ['critical', 'Failed'], 'unprocessed'],
  ['1038', 'Kavya Reddy', '11 Nov, 9:12 pm', 'Rs. 3,780', ['success', 'Paid'], 'fulfilled'],
  ['1037', 'Arjun Nair', '11 Nov, 3:44 pm', 'Rs. 640', ['success', 'Paid'], 'fulfilled'],
];
const orderRow = ([id, name, date, total, [tone, pay], status]) => `    <cm-resource-item value="${id}" data-status="${status}" href="#/patterns/order-list" label="Order #${id}" columns>
      <strong>#${id}</strong><span>${name}</span><span>${date}</span><span>${total}</span><span><cm-badge tone="${tone}">${pay}</cm-badge></span>
    </cm-resource-item>`;

export const orderListHtml = `<cm-page-header heading="Orders" breadcrumbs='[{"label":"Dashboard","href":"#/patterns"}]'>
  <cm-button slot="actions" size="large" variant="primary">Create order</cm-button>
</cm-page-header>
<div style="display:grid;grid-template-columns:minmax(0,1fr);gap:20px;padding:20px">
  <cm-status-tabs controls="orders">
    <option value="all" count="6">All</option>
    <option value="unprocessed" count="3" selected>Unprocessed</option>
    <option value="processing" count="1">Processing</option>
    <option value="fulfilled" count="2">Fulfilled</option>
  </cm-status-tabs>
  <cm-search label="Search orders" placeholder="Search by order number or customer"></cm-search>
  <cm-resource-list id="orders" selectable total="3" resource-name="order" mobile="stack" style="--cm-table-columns: 0.7fr 1.3fr 1.2fr 0.9fr 0.8fr">
    <cm-button slot="bulk-actions" size="medium">Mark as processing</cm-button>
    <cm-button slot="bulk-actions" size="medium">Print invoices</cm-button>
    <cm-button slot="actions" size="medium">Export</cm-button>
    <cm-empty-state slot="empty" size="small" icon="cart" heading="No orders match">Try another status or search.</cm-empty-state>
${ORDERS.map(orderRow).join('\n')}
  </cm-resource-list>
  <cm-pagination total="3" page-size="20" resource-name="orders"></cm-pagination>
</div>`;

// Live behaviour for the order list (tabs and search filter the rows). Not part of the copied markup.
export function wireOrderList(root) {
  const tabs = root.querySelector('cm-status-tabs'), search = root.querySelector('cm-search');
  const list = root.querySelector('cm-resource-list'), pager = root.querySelector('cm-pagination');
  if (!tabs || !list) return;
  const apply = () => {
    const status = tabs.value || 'all', q = (search?.value || '').trim().toLowerCase();
    let n = 0;
    list.querySelectorAll('cm-resource-item').forEach((row) => {
      const show = (status === 'all' || row.dataset.status === status) && (!q || row.textContent.toLowerCase().includes(q));
      row.hidden = !show; if (show) n++;
    });
    list.setAttribute('total', String(n)); pager?.setAttribute('total', String(n));
  };
  tabs.addEventListener('change', apply);
  search?.addEventListener('input', apply);
  apply();
}

export const productEditorHtml = `<cm-page>
<cm-page-header slot="header" heading="Add product" breadcrumbs='[{"label":"Products","href":"#/patterns"}]'>
  <cm-button slot="actions" size="large">Cancel</cm-button>
</cm-page-header>
<form id="product-form" novalidate>
  <cm-layout>
    <cm-layout-section variant="two-thirds">
      <cm-card heading="Details">
        <cm-stack gap="30">
          <cm-text-field name="title" label="Title" placeholder="Short sleeve t-shirt" required></cm-text-field>
          <cm-text-field name="description" label="Description" multiline rows="4" help-text="Plain text, up to 500 characters"></cm-text-field>
        </cm-stack>
      </cm-card>
      <cm-card heading="Media">
        <cm-file-upload name="images" label="Product images" hint="max. file size 300 KB" accept="image/*" multiple max-size="307200"></cm-file-upload>
      </cm-card>
      <cm-card heading="Pricing">
        <cm-grid columns="2" gap="30">
          <cm-text-field name="price" label="Price" hint="rs." type="number" required></cm-text-field>
          <cm-text-field name="compare" label="Compare-at price" hint="rs." type="number" help-text="Shown struck through when it is higher than the price"></cm-text-field>
        </cm-grid>
      </cm-card>
    </cm-layout-section>
    <cm-layout-section variant="one-third">
      <cm-card heading="Status">
        <cm-stack>
          <cm-select name="status" label="Product status" value="draft">
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </cm-select>
          <cm-toggle name="online" label="Show on online store" checked></cm-toggle>
        </cm-stack>
      </cm-card>
      <cm-card heading="Inventory">
        <cm-stack>
          <cm-text-field name="sku" label="SKU" placeholder="TS-0042"></cm-text-field>
          <cm-checkbox name="track" value="yes" label="Track quantity" checked></cm-checkbox>
        </cm-stack>
      </cm-card>
    </cm-layout-section>
  </cm-layout>
</form>
<cm-save-bar slot="footer" form="product-form" message="Unsaved product"></cm-save-bar>
</cm-page>`;

// Validation on save: required fields get an error message and the first invalid field gets focus.
export function wireProductEditor(root) {
  const form = root.querySelector('#product-form');
  if (!form) return;
  const status = root.querySelector('[data-pattern-status]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = [...form.querySelectorAll('cm-text-field[required]')];
    let firstInvalid = null;
    for (const f of fields) {
      f.error = f.value.trim() ? '' : `Enter a ${f.label.toLowerCase()}`;
      if (f.error && !firstInvalid) firstInvalid = f;
    }
    if (firstInvalid) {
      firstInvalid.focus();
      if (status) { status.tone = 'critical'; status.heading = 'Product not saved'; status.textContent = 'Fix the highlighted fields and save again.'; status.hidden = false; }
      return;
    }
    root.querySelector('cm-save-bar').open = false;
    if (status) { status.tone = 'success'; status.heading = ''; status.textContent = 'Product saved.'; status.hidden = false; }
  });
  form.addEventListener('input', (e) => { const f = e.target.closest?.('cm-text-field'); if (f?.error && f.value.trim()) f.error = ''; });
}

export const statesHtml = {
  empty: `<cm-card heading="Orders" flush>
  <cm-empty-state size="small" icon="cart" heading="No orders yet">
    Orders appear here when customers check out.
    <cm-button slot="actions" variant="primary">Share your store</cm-button>
  </cm-empty-state>
</cm-card>`,
  loading: `<cm-resource-list loading resource-name="order" label="Orders">
  <cm-resource-item value="o1">#1042 · Priya Sharma</cm-resource-item>
  <cm-resource-item value="o2">#1041 · Rahul Mehta</cm-resource-item>
  <cm-resource-item value="o3">#1040 · Ananya Iyer</cm-resource-item>
</cm-resource-list>`,
  error: `<cm-banner tone="critical" heading="Orders couldn't load">
  Check your connection and try again. Your orders are safe.
  <cm-button slot="actions" size="slim" variant="primary">Try again</cm-button>
</cm-banner>`,
  success: `<cm-banner tone="success" dismissible>3 orders marked as processing.</cm-banner>`,
};

// Tables on phones: the same CRM tables at a phone's width, one per strategy.
export const tablesOnPhonesHtml = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),390px));gap:var(--cm-space-24);align-items:start">
  <cm-data-table caption="At risk (cards)" mobile="cards"
    columns='[{"key":"name","label":"Account"},{"key":"owner","label":"Owner"},{"key":"reason","label":"Why"},{"key":"value","label":"Value","type":"money"},{"key":"actions","label":"Actions","type":"actions","actions":[{"label":"Call","value":"call"},{"label":"Open","value":"open"}]}]'
    rows='[{"name":"Ravi Stores","owner":"Asha Rao","reason":"No orders in 30 days","value":"Rs. 48,000"},{"name":"Delhi Spice Co.","owner":"Rahul Kumar","reason":"Asked for a discount","value":"Rs. 9,500"}]'></cm-data-table>
  <cm-data-table caption="Team (scroll)" mobile="scroll" sticky-first-column
    columns='[{"key":"name","label":"Name"},{"key":"role","label":"Role"},{"key":"region","label":"Region"},{"key":"accounts","label":"Accounts","type":"numeric"},{"key":"visits","label":"Visits this month","type":"numeric"},{"key":"last","label":"Last active","type":"date"}]'
    rows='[{"name":"Asha Rao","role":"Field sales","region":"Bengaluru","accounts":42,"visits":18,"last":"2026-11-16"},{"name":"Meera Iyer","role":"Account manager","region":"Chennai","accounts":35,"visits":11,"last":"2026-11-15"},{"name":"Rahul Kumar","role":"Field sales","region":"Delhi","accounts":51,"visits":22,"last":"2026-11-17"}]'></cm-data-table>
  <cm-data-table caption="Renewals (priority)" mobile="priority"
    columns='[{"key":"name","label":"Account"},{"key":"owner","label":"Owner","priority":"low"},{"key":"plan","label":"Plan","priority":"low"},{"key":"renewal","label":"Renewal","type":"date"},{"key":"value","label":"Value","type":"money"}]'
    rows='[{"name":"Ravi Stores","owner":"Asha Rao","plan":"Growth","renewal":"2026-12-01","value":"Rs. 48,000"},{"name":"Blue Pottery House","owner":"Meera Iyer","plan":"Pro","renewal":"2026-12-09","value":"Rs. 1,20,000"}]'></cm-data-table>
</div>`;

export const pickRecordHtml = `<cm-card heading="Link a lead" flush>
  <div style="display:grid;gap:12px;padding:16px 20px 20px">
    <cm-search label="Search leads" placeholder="Name, phone or store" value="ravi"></cm-search>
    <cm-resource-list resource-name="lead" aria-label="Matching leads">
      <cm-resource-item value="L-1042" label="Ravi Stores"><div><strong>Ravi Stores</strong><div style="color:var(--cm-text-secondary);font-size:14px">Ravi Kumar · 98450 12345 · Bengaluru</div></div></cm-resource-item>
      <cm-resource-item value="L-1187" label="Ravi Mobiles"><div><strong>Ravi Mobiles</strong><div style="color:var(--cm-text-secondary);font-size:14px">Ravi Shankar · 99001 22334 · Mysuru</div></div></cm-resource-item>
      <cm-resource-item value="L-1203" label="Sri Ravi Traders"><div><strong>Sri Ravi Traders</strong><div style="color:var(--cm-text-secondary);font-size:14px">No phone · Hubballi</div></div></cm-resource-item>
    </cm-resource-list>
    <div style="display:flex;justify-content:flex-end;gap:10px">
      <cm-button>Cancel</cm-button><cm-button variant="primary" disabled>Link lead</cm-button>
    </div>
  </div>
</cm-card>`;

export const fulfilmentHtml = `<cm-card heading="Order statuses" flush>
  <div style="display:grid;grid-template-columns:auto 1fr;gap:14px 20px;padding:20px;align-items:center">
    <cm-badge tone="information">Order placed</cm-badge><span>Paid, not yet picked or packed.</span>
    <cm-badge tone="attention">Processing</cm-badge><span>Being picked, packed or handed to a courier.</span>
    <cm-badge tone="success">Delivered</cm-badge><span>Confirmed delivered by the courier.</span>
    <cm-badge tone="critical">Cancelled</cm-badge><span>Cancelled and refunded; no further action.</span>
    <cm-badge>Draft</cm-badge><span>Created by staff, not yet sent to the customer.</span>
  </div>
</cm-card>
<cm-card heading="Stock">
  <div style="display:grid;grid-template-columns:auto 1fr;gap:14px 20px;align-items:center">
    <cm-badge tone="success">In stock</cm-badge><span>Above the low-stock level you set.</span>
    <cm-badge tone="information">Low stock</cm-badge><span>At or below the low-stock level.</span>
    <cm-badge tone="critical">Out of stock</cm-badge><span>Zero available; hidden or marked sold out on the store.</span>
  </div>
</cm-card>`;

const QUICK = [['Add Category', '#/components/side-navigation'], ['Add Product', '#/patterns/product-editor'], ['Add Domain', '#/patterns/admin-dashboard'], ['Add Payment Gateway', '#/components/app-card'], ['Add Store Address & GST (Optional)', '#/patterns/admin-dashboard']];
const DARK_BTN = 'display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 15px;border-radius:var(--cm-radius-sm);font:inherit;font-size:14px;font-weight:500;text-decoration:none';
const SHARE_BTN = 'display:inline-flex;align-items:center;justify-content:center;gap:6px;min-width:44px;min-height:44px;padding:0 14px;border:1px solid var(--cm-text-on-dark);border-radius:var(--cm-radius-full);color:var(--cm-text-on-dark);background:none;font:inherit;font-size:13px;cursor:pointer';

export const dashboardHtml = `<cm-header-bar store="preprod.commmerce.com" balance="₹ 2,312" user-name="Demo user">
  <img slot="logo" src="assets/logo-placeholder.svg" alt="Store logo" width="190" height="14">
  <cm-button slot="actions" size="large">Hire an Expert</cm-button>
  <cm-button slot="actions" variant="primary" size="large">My Subscription</cm-button>
</cm-header-bar>
<div style="display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start;padding:20px">
  <cm-side-navigation style="flex:1 1 220px">
    <cm-nav-item label="Dashboard" icon="home" href="#/patterns/admin-dashboard" current></cm-nav-item>
    <cm-nav-item label="Catalog" icon="box"><cm-nav-item label="Products" href="#/patterns/order-list"></cm-nav-item><cm-nav-item label="Categories" href="#/patterns/order-list"></cm-nav-item></cm-nav-item>
    <cm-nav-item label="Orders" icon="bag"><cm-nav-item label="All orders" href="#/patterns/order-list"></cm-nav-item></cm-nav-item>
    <cm-nav-item label="WebPOS" icon="pos" href="#/patterns/admin-dashboard"></cm-nav-item>
    <cm-nav-item label="Customers" icon="users"><cm-nav-item label="All customers" href="#/patterns/order-list"></cm-nav-item></cm-nav-item>
    <cm-nav-item label="Subscriptions" icon="repeat" href="#/patterns/admin-dashboard"></cm-nav-item>
    <cm-nav-item label="Website" icon="website"><cm-nav-item label="Themes" href="#/patterns/admin-dashboard"></cm-nav-item></cm-nav-item>
    <cm-nav-item label="Apps" icon="apps" href="#/components/app-card"></cm-nav-item>
    <cm-nav-item label="Reports" icon="chart" href="#/components/report-tile"></cm-nav-item>
    <cm-nav-item label="Marketing" icon="megaphone"><cm-nav-item label="Discounts" href="#/patterns/admin-dashboard"></cm-nav-item></cm-nav-item>
    <cm-nav-item label="Staff" icon="staff"><cm-nav-item label="Team members" href="#/patterns/admin-dashboard"></cm-nav-item></cm-nav-item>
    <cm-nav-item label="Settings" icon="settings"><cm-nav-item label="Store details" href="#/patterns/admin-dashboard"></cm-nav-item></cm-nav-item>
  </cm-side-navigation>
  <main style="flex:999 1 420px;min-width:0;display:grid;grid-template-columns:minmax(0,1fr);gap:40px;justify-items:center;padding:40px 20px;background:var(--cm-bg-surface);border-radius:16px">
    <h1 style="margin:0;font-size:32px;font-weight:500;text-align:center">Welcome to your Dashboard</h1>
    <section aria-labelledby="share-store" style="width:100%;max-width:860px;display:grid;gap:24px;justify-items:center;padding:36px 24px;background:var(--cm-bg-dashboard);color:var(--cm-text-on-dark);border-radius:var(--cm-radius-sm);text-align:center">
      <h2 id="share-store" style="margin:0;font-size:24px;font-weight:400">Create and Share Your Online Store</h2>
      <div style="width:100%;max-width:690px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;padding:10px 10px 10px 20px;background:var(--cm-bg-panel-header);border-radius:var(--cm-radius-sm)">
        <span style="flex:1 1 200px;text-align:start;overflow-wrap:anywhere">https://preprod.commmerce.com</span>
        <a href="#/patterns/admin-dashboard" style="${DARK_BTN};color:var(--cm-text-on-dark);border:1px solid var(--cm-text-on-dark)">Edit Website <cm-icon name="external" size="16"></cm-icon></a>
        <a href="#/patterns/admin-dashboard" style="${DARK_BTN};color:var(--cm-text-default);background:var(--cm-bg-surface)">Go To Website</a>
      </div>
      <p style="margin:0">Want to Hire an Expert to design your website? <a href="#/patterns/admin-dashboard" style="color:var(--cm-text-on-dark);font-weight:500">Click Here</a></p>
      <div role="group" aria-labelledby="share-label" style="display:grid;gap:16px;justify-items:center">
        <span id="share-label" style="font-size:14px;letter-spacing:var(--cm-tracking-caps);text-transform:uppercase">Share</span>
        <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center">
          <button type="button" style="${SHARE_BTN}">Facebook</button>
          <button type="button" style="${SHARE_BTN}">X</button>
          <button type="button" style="${SHARE_BTN}">LinkedIn</button>
          <button type="button" style="${SHARE_BTN}" aria-label="Copy store link"><cm-icon name="link" size="18"></cm-icon></button>
        </div>
      </div>
    </section>
    <ul aria-label="Set up your store" style="width:100%;max-width:860px;display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:20px;margin:0;padding:0;list-style:none">
${QUICK.map(([l, h]) => `      <li><a href="${h}" style="display:grid;gap:16px;justify-items:center;align-content:center;min-height:150px;height:100%;padding:16px;border:1px solid var(--cm-border-input);border-radius:var(--cm-radius-xs);color:var(--cm-text-default);text-decoration:none;text-align:center;font-weight:500"><span aria-hidden="true" style="display:grid;place-items:center;width:52px;height:52px;border:1px dashed var(--cm-border-input);border-radius:50%;color:var(--cm-icon-default)"><cm-icon name="plus" size="18"></cm-icon></span>${l}</a></li>`).join('\n')}
    </ul>
  </main>
</div>`;

/* Search, filtering, sorting and bulk actions: a product list with status tabs, search, the Filter panel,
   applied-filter tags, sortable columns and a confirmed bulk delete. */
const PRODUCTS = [
  ['p1', 'Blue linen kurta', 'Clothing', 'active', 1499, 24],
  ['p2', 'Hand-block printed scarf', 'Accessories', 'active', 650, 3],
  ['p3', 'Brass diya, set of 4', 'Home', 'draft', 899, 0],
  ['p4', 'Cotton bedsheet, king', 'Home', 'active', 2199, 12],
  ['p5', 'Leather sling bag', 'Accessories', 'archived', 3450, 0],
  ['p6', 'Khadi shirt', 'Clothing', 'draft', 1199, 8],
  ['p7', 'Terracotta planter', 'Home', 'active', 540, 2],
];
const stockOf = (n) => (n === 0 ? 'out' : n <= 5 ? 'low' : 'in');
const STOCK = { in: ['success', 'In stock'], low: ['information', 'Low stock'], out: ['critical', 'Out of stock'] };
const productRow = ([id, name, type, status, price, qty]) => { const [tone, word] = STOCK[stockOf(qty)]; return `    <cm-resource-item value="${id}" label="${name}" data-status="${status}" data-type="${type}" data-stock="${stockOf(qty)}" data-price="${price}" data-qty="${qty}" columns>
      <strong>${name}</strong><span>${type}</span><span>Rs. ${price.toLocaleString('en-IN')}</span><span>${qty}</span><span><cm-badge tone="${tone}">${word}</cm-badge></span>
    </cm-resource-item>`; };

export const searchFilterHtml = `<cm-page-header heading="Products">
  <cm-button slot="actions" size="large" variant="primary">Add product</cm-button>
</cm-page-header>
<div style="display:grid;grid-template-columns:minmax(0,1fr);gap:20px;padding:20px">
  <cm-status-tabs controls="products">
    <option value="all" selected>All</option>
    <option value="active">Active</option>
    <option value="draft">Draft</option>
    <option value="archived">Archived</option>
  </cm-status-tabs>
  <cm-search label="Search products" placeholder="Search by product name" filter></cm-search>
  <div id="applied-filters" role="group" aria-label="Applied filters" hidden style="display:flex;flex-wrap:wrap;gap:var(--cm-space-10)"></div>
  <cm-resource-list id="products" selectable total="${PRODUCTS.length}" resource-name="product" mobile="stack" style="--cm-table-columns: 2fr 1fr 1fr 0.6fr 1fr">
    <cm-table-header slot="header" sort="name" direction="ascending">
      <option value="name" sortable>Product</option>
      <option value="type">Type</option>
      <option value="price" sortable>Price</option>
      <option value="qty" sortable>Stock</option>
      <option value="stock">Availability</option>
    </cm-table-header>
    <cm-button slot="bulk-actions" size="medium">Set as active</cm-button>
    <cm-button slot="bulk-actions" size="medium">Delete products</cm-button>
    <cm-empty-state slot="empty" size="small" icon="search" heading="No products match">Try another status, search or filter.</cm-empty-state>
${PRODUCTS.map(productRow).join('\n')}
  </cm-resource-list>
</div>
<cm-filter-panel id="product-filters">
  <form>
    <cm-select label="Product type" name="type"><option value="">Any</option><option>Clothing</option><option>Accessories</option><option>Home</option></cm-select>
    <fieldset style="display:grid;gap:var(--cm-space-10);margin:0;padding:0;border:0">
      <legend style="padding:0;margin-bottom:var(--cm-space-10);font-weight:500">Availability</legend>
      <cm-checkbox name="stock" value="in" label="In stock"></cm-checkbox>
      <cm-checkbox name="stock" value="low" label="Low stock"></cm-checkbox>
      <cm-checkbox name="stock" value="out" label="Out of stock"></cm-checkbox>
    </fieldset>
  </form>
</cm-filter-panel>
<cm-modal id="confirm-bulk-delete" heading="Delete products?" size="small">
  <p style="margin:0" data-message>The selected products will be deleted. This can't be undone.</p>
  <cm-button slot="footer" data-cancel>Cancel</cm-button>
  <cm-button slot="footer" variant="primary" data-confirm>Delete products</cm-button>
</cm-modal>`;

const FILTER_WORDS = { type: 'Type', stock: 'Availability', in: 'In stock', low: 'Low stock', out: 'Out of stock' };
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Live behaviour: in a real app, send status, query, filters and sort to your API instead of filtering rows here.
export function wireSearchFilter(root) {
  const list = root.querySelector('#products');
  if (!list) return;
  const tabs = root.querySelector('cm-status-tabs'), search = root.querySelector('cm-search');
  const head = root.querySelector('cm-table-header'), panel = root.querySelector('#product-filters');
  const applied = root.querySelector('#applied-filters'), modal = root.querySelector('#confirm-bulk-delete');
  const status = root.querySelector('[data-pattern-status]');
  let filters = {};
  const say = (text, tone = 'success') => { if (status) { status.tone = tone; status.textContent = text; status.hidden = false; } };
  const rows = () => [...list.querySelectorAll('cm-resource-item')];
  const apply = () => {
    const st = tabs.value || 'all', q = (search.value || '').trim().toLowerCase();
    const stock = [].concat(filters.stock ?? []);
    let n = 0;
    rows().forEach((r) => {
      const show = (st === 'all' || r.dataset.status === st) && (!q || r.label.toLowerCase().includes(q))
        && (!filters.type || r.dataset.type === filters.type) && (!stock.length || stock.includes(r.dataset.stock));
      r.hidden = !show; if (show) n++; else r.selected = false;
    });
    list.total = n;
    const tags = Object.entries(filters).flatMap(([k, v]) => [].concat(v).map((x) => [k, x]));
    search.filterCount = tags.length;
    applied.hidden = !tags.length;
    applied.replaceChildren(...tags.map(([k, v]) => {
      const t = document.createElement('cm-tag');
      t.removable = true; t.textContent = FILTER_WORDS[v] ?? v; t.removeLabel = `Remove filter: ${FILTER_WORDS[k]} is ${t.textContent}`;
      t.addEventListener('cm-remove', () => {
        const left = [].concat(filters[k]).filter((x) => x !== v);
        if (left.length) filters[k] = left; else delete filters[k];
        apply(); search.focus?.();
      });
      return t;
    }));
  };
  tabs.addEventListener('change', apply);
  search.addEventListener('input', apply);
  search.addEventListener('cm-filter', () => panel.show());
  panel.addEventListener('cm-filter-apply', (e) => { filters = { ...e.detail.values }; apply(); });
  panel.addEventListener('cm-filter-reset', () => { filters = {}; apply(); });
  head.addEventListener('cm-sort', (e) => {
    const { key, direction } = e.detail, dir = direction === 'descending' ? -1 : 1;
    const val = (r) => (key === 'name' ? r.label.toLowerCase() : Number(r.dataset[key]));
    rows().sort((a, b) => (val(a) > val(b) ? dir : val(a) < val(b) ? -dir : 0)).forEach((r) => list.append(r));
    head.sort = key; head.direction = direction;
  });
  const [, del] = list.querySelectorAll('[slot="bulk-actions"]');
  let doomed = [];
  del.addEventListener('click', () => {
    doomed = rows().filter((r) => r.selected && !r.hidden);
    if (!doomed.length) return;
    modal.heading = `Delete ${plural(doomed.length, 'product', 'products')}?`;
    modal.querySelector('[data-message]').textContent = `${doomed.length === 1 ? `“${doomed[0].label}” will be deleted` : `${plural(doomed.length, 'product', 'products')} will be deleted`}, with their images and variants. This can't be undone.`;
    modal.querySelector('[data-confirm]').textContent = doomed.length === 1 ? 'Delete product' : `Delete ${doomed.length} products`;
    modal.show();
  });
  modal.querySelector('[data-cancel]').addEventListener('click', () => modal.close());
  modal.querySelector('[data-confirm]').addEventListener('click', () => {
    const n = doomed.length;
    doomed.forEach((r) => r.remove()); doomed = [];
    modal.close(); list.clearSelection?.(); apply();
    say(`${plural(n, 'product', 'products')} deleted.`);
  });
  apply();
}

/* Undo instead of confirm: archive at once, offer Undo in a toast. */
const leadRow = (id, name, detail) => `    <cm-resource-item value="${id}" href="#/patterns/undo-instead-of-confirm"><strong>${name}</strong> · ${detail}
      <cm-button slot="actions" size="slim" data-archive aria-label="Archive ${name}">Archive</cm-button>
    </cm-resource-item>`;
export const undoArchiveHtml = `<cm-page-header heading="Leads"></cm-page-header>
<div style="display:grid;gap:20px;padding:20px">
  <cm-resource-list id="leads" resource-name="lead" label="Leads" tabindex="-1">
${leadRow('l201', 'Ravi Stores', 'New · Asha Rao')}
${leadRow('l202', 'Blue Pottery House', 'Contacted · Asha Rao')}
${leadRow('l203', 'Kiran Foods', 'Demo booked · Rahul Kumar')}
    <cm-empty-state slot="empty" heading="No open leads" size="inline">All leads are archived. Press Undo in the toast to bring one back.</cm-empty-state>
  </cm-resource-list>
</div>`;

export function wireUndoArchive(root) {
  const list = root.querySelector('#leads');
  if (!list) return;
  list.addEventListener('click', (e) => {
    const button = e.target.closest?.('[data-archive]');
    if (!button) return;
    e.preventDefault(); // the button's click, not the row link's
    const row = button.closest('cm-resource-item'), after = row.nextElementSibling;
    const rows = [...list.querySelectorAll('cm-resource-item')], i = rows.indexOf(row);
    const next = (rows[i + 1] ?? rows[i - 1])?.querySelector('[data-archive]');
    // cm-button keeps its <button> in its shadow root: focus that.
    const focus = (el) => (el?.shadowRoot?.querySelector('button') ?? el).focus();
    // Your API calls go here: archive at once (a flag, not a delete), un-archive on Undo.
    undoable(
      () => { row.remove(); focus(next ?? list); },
      () => { list.insertBefore(row, after?.isConnected ? after : list.querySelector('[slot=empty]')); focus(row.querySelector('[data-archive]')); },
      { message: 'Lead archived' },
    );
  });
}

/* Confirm before deleting: one destructive action, one modal that names what goes. */
export const confirmDeleteHtml = `<cm-page-header heading="Linen shirt" breadcrumbs='[{"label":"Products","href":"#/patterns/confirm-delete"}]'>
  <cm-button slot="actions" size="large" data-delete>Delete product</cm-button>
</cm-page-header>
<div style="display:grid;gap:20px;padding:20px">
  <cm-card heading="Details">
    <cm-info-panel>
      <cm-info-item label="Price">Rs. 1,299</cm-info-item>
      <cm-info-item label="Variants">4 (S, M, L, XL)</cm-info-item>
      <cm-info-item label="Status">Active</cm-info-item>
    </cm-info-panel>
  </cm-card>
</div>
<cm-modal id="confirm-delete" heading="Delete “Linen shirt”?" size="small">
  <p style="margin:0">The product, its 4 variants and its images will be deleted. Orders that include it keep their details. This can't be undone.</p>
  <cm-button slot="footer" data-cancel>Cancel</cm-button>
  <cm-button slot="footer" variant="primary" data-confirm>Delete product</cm-button>
</cm-modal>`;

export function wireConfirmDelete(root) {
  const modal = root.querySelector('#confirm-delete');
  if (!modal) return;
  const confirm = modal.querySelector('[data-confirm]'), status = root.querySelector('[data-pattern-status]');
  root.querySelector('[data-delete]').addEventListener('click', () => modal.show());
  modal.querySelector('[data-cancel]').addEventListener('click', () => modal.close());
  confirm.addEventListener('click', () => {
    // While the request runs: keep the modal open, show the button as busy, and don't let it close half-way.
    confirm.loading = true;
    const hold = (e) => e.preventDefault();
    modal.addEventListener('cm-close', hold);
    setTimeout(() => {
      confirm.loading = false; modal.removeEventListener('cm-close', hold); modal.close();
      if (status) { status.tone = 'success'; status.textContent = '“Linen shirt” deleted. (Nothing was really deleted in this example.)'; status.hidden = false; }
    }, 800);
  });
}

/* Unsaved changes when leaving: the save bar tracks changes; leaving through a link asks first. */
export const unsavedChangesHtml = `<cm-page-header heading="Edit customer" breadcrumbs='[{"label":"Customers","href":"#/patterns/unsaved-changes"}]'></cm-page-header>
<form id="customer-form" style="display:grid;gap:20px;padding:20px">
  <cm-card heading="Contact">
    <div style="display:grid;gap:30px">
      <cm-text-field name="name" label="Name" value="Priya Sharma"></cm-text-field>
      <cm-text-field name="phone" label="Phone" type="tel" value="+91 98200 12345"></cm-text-field>
      <cm-checkbox name="marketing" value="yes" label="Customer agreed to receive marketing"></cm-checkbox>
    </div>
  </cm-card>
</form>
<cm-save-bar form="customer-form" message="Unsaved changes"></cm-save-bar>
<cm-modal id="confirm-leave" heading="Leave page with unsaved changes?" size="small">
  <p style="margin:0">If you leave, the changes you made to this customer will be lost.</p>
  <cm-button slot="footer" data-stay>Keep editing</cm-button>
  <cm-button slot="footer" variant="primary" data-leave>Leave page</cm-button>
</cm-modal>`;

export function wireUnsavedChanges(root) {
  const form = root.querySelector('#customer-form');
  if (!form) return;
  const bar = root.querySelector('cm-save-bar'), modal = root.querySelector('#confirm-leave');
  const status = root.querySelector('[data-pattern-status]');
  const say = (t) => { if (status) { status.tone = 'success'; status.textContent = t; status.hidden = false; } };
  const dirty = () => bar.open;
  // Closing the tab or reloading: the browser asks with its own prompt (the text can't be changed).
  const onUnload = (e) => { if (form.isConnected && dirty()) { e.preventDefault(); e.returnValue = ''; } };
  window.addEventListener('beforeunload', onUnload);
  window.addEventListener('hashchange', function off() { if (!form.isConnected) { window.removeEventListener('beforeunload', onUnload); window.removeEventListener('hashchange', off); } });
  // Leaving inside the app (breadcrumbs, links, your router): ask with a modal.
  let leave = null;
  root.querySelector('cm-page-header').addEventListener('click', (e) => {
    const a = e.composedPath().find((n) => n.localName === 'a' && n.href);
    if (!a || !dirty()) return;
    e.preventDefault();
    leave = () => say('You left the page; the changes were discarded. (This example stays on the page.)');
    modal.show();
  });
  modal.querySelector('[data-stay]').addEventListener('click', () => modal.close());
  modal.querySelector('[data-leave]').addEventListener('click', () => { modal.close(); form.reset(); leave?.(); leave = null; });
  form.addEventListener('submit', (e) => { e.preventDefault(); bar.open = false; say('Customer saved.'); });
}

/* Embedded app layout: a small "Product reviews" app as it runs in the admin's frame. Three screens (list, detail,
   settings), each starting with a page header; App Bridge keeps the admin's address, save bar, toasts and modals in step. */
export const appLayoutApp = ({ bridge, font, css, ui, hostOrigin }) => `<!doctype html>
<html lang="en" data-cm-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="${font}">
<link rel="stylesheet" href="${css}">
<script type="module" src="${ui}"></script>
<style>
  body { margin: 0; background: var(--cm-bg-page); color: var(--cm-text-default); font-family: var(--cm-font-sans); }
  main { display: grid; gap: 20px; padding: 20px; }
  .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap: 20px; align-items: start; }
  p { margin: 0; }
</style>
</head>
<body>
<div id="view"></div>
<script type="module">
import { createApp } from '${bridge}';
const app = createApp({ hostOrigin: '${hostOrigin}', apiKey: 'product-reviews' });
app.autoResize(); // the admin keeps the frame as tall as the page
const REVIEWS = [
  { id: '1', who: 'Priya Sharma', product: 'Blue linen kurta', stars: 5, text: 'Soft fabric and the fit is perfect.' },
  { id: '2', who: 'Rahul Mehta', product: 'Brass diya, set of 4', stars: 3, text: 'Nice, but one diya arrived dented.' },
  { id: '3', who: 'Kavya Reddy', product: 'Khadi shirt', stars: 4, text: 'Good shirt. Runs a little large.' },
];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';');
const crumbs = JSON.stringify([{ label: 'Product reviews', href: '#/' }]).replace(/'/g, '&#39;');

// One render function per screen. Every screen starts with a page header, then cards.
const screens = {
  list: () => \`<cm-page-header heading="Product reviews">
    <cm-button slot="actions" size="large" href="#/settings">Settings</cm-button>
  </cm-page-header>
  <main>
    <cm-resource-list label="Reviews" resource-name="review" total="\${REVIEWS.length}">
      \${REVIEWS.map((r) => \`<cm-resource-item href="#/reviews/\${r.id}" label="Review from \${esc(r.who)}">
        <strong>\${esc(r.who)}</strong> · \${esc(r.product)} · \${r.stars} of 5
      </cm-resource-item>\`).join('')}
    </cm-resource-list>
  </main>\`,
  review: (r) => \`<cm-page-header heading="Review from \${esc(r.who)}" breadcrumbs='\${crumbs}'>
    <cm-button slot="actions" size="large" id="delete">Delete review</cm-button>
  </cm-page-header>
  <main class="cols">
    <cm-card heading="Review"><p>\${esc(r.text)}</p></cm-card>
    <cm-card heading="Your reply">
      <form id="reply-form"><cm-text-field name="reply" label="Reply" multiline rows="3" help-text="Shown under the review on your store"></cm-text-field></form>
    </cm-card>
  </main>\`,
  settings: () => \`<cm-page-header heading="Settings" breadcrumbs='\${crumbs}'></cm-page-header>
  <main>
    <cm-card heading="Publishing">
      <form id="settings-form"><cm-toggle name="auto" label="Publish new reviews without checking them first"></cm-toggle></form>
    </cm-card>
  </main>\`,
};

// Routing inside the app: the frame's own hash. Each screen change tells the admin its address,
// so reloading the admin page or sharing its link opens the same screen.
let dirty = false;
function render() {
  const path = location.hash.slice(1) || '/';
  const review = REVIEWS.find((r) => path === '/reviews/' + r.id);
  document.getElementById('view').innerHTML = review ? screens.review(review) : path === '/settings' ? screens.settings() : screens.list();
  document.title = review ? 'Review from ' + review.who : path === '/settings' ? 'Settings' : 'Product reviews';
  app.navigate(path, { replace: true }).catch(() => {});
  const form = document.querySelector('form');
  form?.addEventListener('input', () => { dirty = true; app.saveBar.show({ message: 'Unsaved changes' }).catch(() => {}); });
  form?.addEventListener('change', () => { dirty = true; app.saveBar.show({ message: 'Unsaved changes' }).catch(() => {}); });
  document.getElementById('delete')?.addEventListener('click', async () => {
    const choice = await app.modal.open({ title: 'Delete review?', message: 'The review from ' + review.who + ' will be removed from your store. This can\\'t be undone.', primaryAction: { label: 'Delete review', destructive: true }, secondaryAction: { label: 'Cancel' } });
    if (choice !== 'primary') return;
    REVIEWS.splice(REVIEWS.indexOf(review), 1);
    await app.toast.show('Review deleted', { tone: 'success' });
    location.hash = '#/';
  });
}
app.on('saveBar.save', async () => { dirty = false; await app.saveBar.hide(); await app.toast.show('Saved', { tone: 'success' }); });
app.on('saveBar.discard', async () => { dirty = false; document.querySelector('form')?.reset(); await app.saveBar.hide(); });
app.on('theme.change', ({ theme }) => { document.documentElement.dataset.cmTheme = theme; });
// Back or Forward in the admin: show that screen (render() tells the admin again with replace, which is harmless).
app.on('path.change', ({ path }) => { location.hash = '#' + path; });
window.addEventListener('hashchange', () => {
  if (dirty) { dirty = false; app.saveBar.hide().catch(() => {}); }
  render();
});
app.ready.then((info) => {
  document.documentElement.dataset.cmTheme = info.theme;
  // A reload or a shared admin link: open the screen the admin's address points to.
  if (info.path && info.path !== (location.hash.slice(1) || '/')) location.hash = '#' + info.path;
}, () => {});
render();
</script>
</body>
</html>`;

/* Admin frame: cm-app-frame with every part, shown in two real windows (desktop and phone) on its pattern page. */
export const appFrameHtml = `<cm-app-frame panel menu-item="more">
  <cm-header-bar slot="header" store="preprod.commmerce.com" balance="₹ 2,312" user-name="Demo user">
    <img slot="logo" src="assets/logo-placeholder.svg" alt="Store logo" width="190" height="14">
    <cm-button slot="actions" size="large">Hire an Expert</cm-button>
  </cm-header-bar>

  <cm-side-navigation slot="navigation" collapsible>
    <cm-nav-item label="Dashboard" icon="home" href="#dashboard"></cm-nav-item>
    <cm-nav-item label="Orders" icon="bag" href="#orders" current badge="12"></cm-nav-item>
    <cm-nav-item label="Catalog" icon="box">
      <cm-nav-item label="Products" href="#products"></cm-nav-item>
      <cm-nav-item label="Categories" href="#categories"></cm-nav-item>
    </cm-nav-item>
    <cm-nav-item label="Customers" icon="users" href="#customers"></cm-nav-item>
    <cm-nav-item label="Reports" icon="chart" href="#reports"></cm-nav-item>
    <cm-nav-item label="Marketing" icon="megaphone" href="#marketing"></cm-nav-item>
    <cm-nav-item label="Apps" icon="apps" href="#apps" badge="New"></cm-nav-item>
    <cm-nav-item label="Settings" icon="settings" href="#settings"></cm-nav-item>
  </cm-side-navigation>

  <cm-page>
    <cm-page-header slot="header" heading="Orders">
      <cm-button slot="actions" variant="primary">Create order</cm-button>
    </cm-page-header>
    <cm-layout>
      <cm-layout-section variant="two-thirds">
        <cm-card heading="Today">12 orders · Rs. 18,400</cm-card>
        <cm-card heading="To fulfil">5 orders are waiting to be packed.</cm-card>
        <cm-card heading="Returns">1 return to approve.</cm-card>
      </cm-layout-section>
      <cm-layout-section variant="one-third">
        <cm-card heading="Payments">Rs. 9,200 to be settled on Friday.</cm-card>
      </cm-layout-section>
    </cm-layout>
  </cm-page>

  <cm-bottom-navigation slot="bottom-navigation">
    <cm-nav-item label="Home" icon="home" href="#dashboard"></cm-nav-item>
    <cm-nav-item label="Orders" icon="bag" href="#orders" current></cm-nav-item>
    <cm-nav-item label="Quick add" icon="plus" primary></cm-nav-item>
    <cm-nav-item label="Products" icon="box" href="#products"></cm-nav-item>
    <cm-nav-item label="More" icon="more" value="more"></cm-nav-item>
  </cm-bottom-navigation>

  <cm-mobile-menu slot="mobile-menu" store="preprod.commmerce.com" user-name="Demo user" user-email="demo@example.com">
    <cm-nav-item label="Panels">
      <cm-nav-item label="Customers" icon="users" href="#customers"></cm-nav-item>
      <cm-nav-item label="Reports" icon="chart" href="#reports"></cm-nav-item>
      <cm-nav-item label="Marketing" icon="megaphone" href="#marketing"></cm-nav-item>
      <cm-nav-item label="Apps" icon="apps" href="#apps" badge="New"></cm-nav-item>
    </cm-nav-item>
    <cm-nav-item>
      <cm-nav-item label="Settings" icon="settings" href="#settings"></cm-nav-item>
    </cm-nav-item>
  </cm-mobile-menu>
</cm-app-frame>`;

// Keeps the merchant's collapsed or expanded side navigation from page to page.
export const appFrameScript = `<script type="module">
  const nav = document.querySelector('cm-side-navigation');
  try { nav.collapsed = localStorage.getItem('nav-collapsed') === '1'; } catch {}
  nav.addEventListener('cm-collapse', (e) => {
    try { localStorage.setItem('nav-collapsed', e.detail.collapsed ? '1' : '0'); } catch {}
  });
</script>`;

export const appFrameReact = `import { useState } from 'react';
import { AppFrame, HeaderBar, SideNavigation, NavItemElement as NavItem, Page, PageHeader, BottomNavigation, MobileMenu } from '@commmerce/ui-react';

export function Shell({ children }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('nav-collapsed') === '1');
  return (
    <AppFrame menuItem="more" panel>
      <HeaderBar slot="header" store="preprod.commmerce.com" userName="Demo user" />
      <SideNavigation slot="navigation" collapsible collapsed={collapsed}
        onCollapse={(e) => { setCollapsed(e.detail.collapsed); localStorage.setItem('nav-collapsed', e.detail.collapsed ? '1' : '0'); }}>
        <NavItem label="Dashboard" icon="home" href="/dashboard" />
        <NavItem label="Orders" icon="bag" href="/orders" current />
      </SideNavigation>
      <Page>
        <PageHeader slot="header" heading="Orders" />
        {children}
      </Page>
      <BottomNavigation slot="bottom-navigation">
        <NavItem label="Home" icon="home" href="/dashboard" />
        <NavItem label="Orders" icon="bag" href="/orders" current />
        <NavItem label="More" icon="more" value="more" />
      </BottomNavigation>
      <MobileMenu slot="mobile-menu" store="preprod.commmerce.com" userName="Demo user">
        <NavItem label="Panels">
          <NavItem label="Reports" icon="chart" href="/reports" />
        </NavItem>
      </MobileMenu>
    </AppFrame>
  );
}`;

// Board or list: a CRM pipeline with a Board / List switch over the same records.
const pipeCard = (id, name, owner, place, grade) => `      <cm-board-card value="${id}" heading="${name}" href="#/patterns/pipeline-board">
        <span>${owner}</span><span>${place}</span>
        <cm-badge slot="badges">Grade ${grade}</cm-badge>
      </cm-board-card>`;
export const pipelineHtml = `<div style="display:grid;gap:16px;min-width:0">
  <cm-status-tabs controls="pipeline-view">
    <option value="board" selected>Board</option>
    <option value="list">List</option>
  </cm-status-tabs>
  <div id="pipeline-view" style="min-width:0">
  <cm-board label="Merchants by status" style="height:480px" data-view="board">
    <cm-board-column value="new" heading="New" total="12">
${pipeCard('m101', 'Ravi Stores', 'Asha Rao', 'Bengaluru', 'A')}
${pipeCard('m102', 'Lakshmi Textiles', 'Rahul Kumar', 'Chennai', 'B')}
    </cm-board-column>
    <cm-board-column value="contacted" heading="Contacted" total="5">
${pipeCard('m104', 'Blue Pottery House', 'Asha Rao', 'Jaipur', 'A')}
${pipeCard('m105', 'Kiran Foods', 'Rahul Kumar', 'Pune', 'C')}
    </cm-board-column>
    <cm-board-column value="demo" heading="Demo booked" total="1">
${pipeCard('m106', 'Delhi Spice Co.', 'Meera Iyer', 'New Delhi', 'A')}
    </cm-board-column>
    <cm-board-column value="lost" heading="Lost" total="0"></cm-board-column>
  </cm-board>
  <cm-resource-list resource-name="merchant" label="Merchants" data-view="list" hidden>
    <cm-resource-item value="m101" href="#/patterns/pipeline-board"><strong>Ravi Stores</strong> · New · Asha Rao</cm-resource-item>
    <cm-resource-item value="m104" href="#/patterns/pipeline-board"><strong>Blue Pottery House</strong> · Contacted · Asha Rao</cm-resource-item>
    <cm-resource-item value="m106" href="#/patterns/pipeline-board"><strong>Delhi Spice Co.</strong> · Demo booked · Meera Iyer</cm-resource-item>
  </cm-resource-list>
  </div>
</div>`;

export function wirePipelineBoard(root) {
  const board = root.querySelector('cm-board'), list = root.querySelector('cm-resource-list'), tabs = root.querySelector('cm-status-tabs');
  const status = root.querySelector('[data-pattern-status]');
  if (!board) return;
  const say = (text, tone = 'success') => { if (status) { status.tone = tone; status.textContent = text; status.hidden = false; } };
  tabs?.addEventListener('change', () => { board.hidden = tabs.value !== 'board'; list.hidden = tabs.value !== 'list'; });
  board.addEventListener('cm-move', (e) => {
    const { card, to, toColumn } = e.detail;
    // Your API call goes here. In this example a move to Lost fails, to show the card going back.
    const save = new Promise((resolve, reject) => setTimeout(() => (to === 'lost' ? reject(new Error('A reason is required')) : resolve()), 700));
    e.detail.waitUntil(save);
    save.then(() => say(`Saved: ${card.heading} is now in ${toColumn.heading}.`),
      () => say(`Couldn't move ${card.heading} to Lost: choose a reason on the merchant's page first. The card went back.`, 'critical'));
  });
  board.addEventListener('cm-load-more', (e) => {
    const col = e.detail.column;
    col.loading = true;
    setTimeout(() => { col.loading = false; col.hasMore = false; col.total = col.cards.length; say(`No more merchants in ${col.heading} in this example.`, 'information'); }, 600);
  });
}

// Record page (1.7): the standard layout of every CRM record (lead, contact, deal, account, ticket) and of order and
// product detail pages, shown in a real admin frame at desktop and phone width.
export const recordPageHtml = `<cm-app-frame panel>
  <cm-header-bar slot="header" store="preprod.commmerce.com" user-name="Ravi Kumar">
    <img slot="logo" src="assets/logo-placeholder.svg" alt="Store logo" width="190" height="14">
  </cm-header-bar>

  <cm-side-navigation slot="navigation">
    <cm-nav-item label="Dashboard" icon="home" href="#dashboard"></cm-nav-item>
    <cm-nav-item label="Leads" icon="users" href="#leads" current badge="24"></cm-nav-item>
    <cm-nav-item label="Deals" icon="handshake" href="#deals"></cm-nav-item>
    <cm-nav-item label="Accounts" icon="building" href="#accounts"></cm-nav-item>
    <cm-nav-item label="Tickets" icon="inbox" href="#tickets"></cm-nav-item>
    <cm-nav-item label="Tasks" icon="tasks" href="#tasks"></cm-nav-item>
  </cm-side-navigation>

  <cm-page>
    <cm-page-header slot="header" heading="Asha Rao" back-href="#leads" back-label="Leads"
      description="Owner Ravi Kumar · Created 12 Nov 2026 · Source Website form">
      <cm-badge slot="title-adornment" tone="attention">Qualified</cm-badge>
      <cm-button slot="actions">Log call</cm-button>
      <cm-button slot="actions" variant="primary">Convert</cm-button>
    </cm-page-header>

    <cm-layout variant="record" sticky-aside>
      <!-- Key facts: first in the source, so phones show them first (aside-position="above", the default). -->
      <cm-layout-section variant="aside">
        <cm-info-panel heading="Details" action="Edit" action-label="Edit details" variant="compact" layout="rows">
          <cm-info-item label="Email"><a href="mailto:asha@raotextiles.in">asha@raotextiles.in</a></cm-info-item>
          <cm-info-item label="Phone"><a href="tel:+919845012345">+91 98450 12345</a></cm-info-item>
          <cm-info-item label="Company">Rao Textiles</cm-info-item>
          <cm-info-item label="City">Bengaluru</cm-info-item>
          <cm-info-item label="Lead source">Website form</cm-info-item>
          <cm-info-item label="Deal value">Rs. 1,80,000</cm-info-item>
        </cm-info-panel>
        <cm-card heading="Owner" variant="compact">
          <cm-button slot="actions" size="slim">Change</cm-button>
          <div style="display:flex;align-items:center;gap:var(--cm-space-8)">
            <cm-avatar name="Ravi Kumar" size="small" decorative></cm-avatar>
            <span>Ravi Kumar</span>
          </div>
        </cm-card>
        <cm-card heading="Tags" variant="compact">
          <cm-button slot="actions" size="slim">Add</cm-button>
          <div style="display:flex;flex-wrap:wrap;gap:var(--cm-space-8)">
            <cm-tag>Wholesale</cm-tag><cm-tag>Bengaluru</cm-tag><cm-tag>Diwali 2026</cm-tag>
          </div>
        </cm-card>
      </cm-layout-section>

      <cm-layout-section>
        <cm-card variant="compact">
          <cm-status-tabs controls="record-tab-panel" value="overview">
            <option value="overview">Overview</option>
            <option value="activity" count="4">Activity</option>
            <option value="emails" count="2">Emails</option>
          </cm-status-tabs>
          <div id="record-tab-panel" role="tabpanel" style="padding-block-start:var(--cm-space-16)">
            <cm-timeline label="Activity for Asha Rao" data-show="overview activity">
              <cm-timeline-item icon="mail" tone="information" heading="Quote for 200 cotton tote bags" datetime="2026-11-16T11:20" meta="by Ravi Kumar · sent" data-kind="emails">
                <cm-badge slot="badge" tone="information">Email</cm-badge>
                Hi Asha, here is the quote for 200 printed cotton tote bags. Prices include GST and delivery to Bengaluru.
              </cm-timeline-item>
              <cm-timeline-item icon="phone" tone="success" heading="Call: discussed bulk pricing" datetime="2026-11-15T16:05" meta="by Ravi Kumar · outgoing · 12 min">
                <cm-badge slot="badge" tone="success">Call</cm-badge>
                Needs 200 bags by 5 December for a store opening.
              </cm-timeline-item>
              <cm-timeline-item icon="mail" heading="Welcome email opened" datetime="2026-11-13T09:40" meta="by Asha Rao · 2 times" data-kind="emails"></cm-timeline-item>
              <cm-timeline-item icon="note" heading="Lead created from the website form" datetime="2026-11-12T18:02" meta="System"></cm-timeline-item>
            </cm-timeline>
          </div>
        </cm-card>
        <cm-card heading="Deals" variant="compact">
          <cm-button slot="actions" size="slim">Add deal</cm-button>
          <cm-empty-state size="inline" heading="No deals yet" icon="handshake">Convert the lead or add a deal to track the order value.</cm-empty-state>
        </cm-card>
        <cm-card heading="Tasks" variant="compact">
          <cm-button slot="actions" size="slim">Add task</cm-button>
          <cm-empty-state size="inline" heading="No open tasks" icon="tasks">Follow-ups you schedule appear here.</cm-empty-state>
        </cm-card>
      </cm-layout-section>
    </cm-layout>
  </cm-page>

  <cm-bottom-navigation slot="bottom-navigation">
    <cm-nav-item label="Home" icon="home" href="#dashboard"></cm-nav-item>
    <cm-nav-item label="Leads" icon="users" href="#leads" current></cm-nav-item>
    <cm-nav-item label="Deals" icon="handshake" href="#deals"></cm-nav-item>
    <cm-nav-item label="Tasks" icon="tasks" href="#tasks"></cm-nav-item>
  </cm-bottom-navigation>
</cm-app-frame>`;

// Status tabs over the activity: Overview and Activity show everything, Emails only the emails.
export const recordPageScript = `<script type="module">
  const tabs = document.querySelector('cm-status-tabs');
  const show = () => document.querySelectorAll('#record-tab-panel cm-timeline-item').forEach((item) => {
    item.hidden = tabs.value === 'emails' && item.dataset.kind !== 'emails';
  });
  tabs.addEventListener('change', show);
</script>`;

export const recordPageReact = `import { useState } from 'react';
import { Page, PageHeader, Badge, Button, Layout, LayoutSection, InfoPanel, InfoItem, Card, Avatar, Tag,
  StatusTabs, Timeline, TimelineItem, EmptyState } from '@commmerce/ui-react';

export function LeadPage({ lead, activity }) {
  const [tab, setTab] = useState('overview');
  const shown = tab === 'emails' ? activity.filter((a) => a.kind === 'email') : activity;
  return (
    <Page>
      <PageHeader slot="header" heading={lead.name} backHref="/leads" backLabel="Leads"
        description={\`Owner \${lead.owner} · Created \${lead.created} · Source \${lead.source}\`}>
        <Badge slot="title-adornment" tone="attention">{lead.status}</Badge>
        <Button slot="actions">Log call</Button>
        <Button slot="actions" variant="primary">Convert</Button>
      </PageHeader>
      <Layout variant="record" stickyAside>
        <LayoutSection variant="aside">
          <InfoPanel heading="Details" action="Edit" actionLabel="Edit details" variant="compact" layout="rows">
            <InfoItem label="Email"><a href={\`mailto:\${lead.email}\`}>{lead.email}</a></InfoItem>
            <InfoItem label="Phone">{lead.phone}</InfoItem>
            <InfoItem label="Company">{lead.company}</InfoItem>
          </InfoPanel>
          <Card heading="Owner" variant="compact"><Avatar name={lead.owner} size="small" decorative /> {lead.owner}</Card>
          <Card heading="Tags" variant="compact">{lead.tags.map((t) => <Tag key={t}>{t}</Tag>)}</Card>
        </LayoutSection>
        <LayoutSection>
          <Card variant="compact">
            <StatusTabs controls="record-tab-panel" value={tab} onChange={(e) => setTab(e.target.value)}
              tabs={[{ value: 'overview', label: 'Overview' }, { value: 'activity', label: 'Activity', count: activity.length }, { value: 'emails', label: 'Emails' }]} />
            <div id="record-tab-panel" role="tabpanel" style={{ paddingBlockStart: 16 }}>
              <Timeline label={\`Activity for \${lead.name}\`}>
                {shown.map((a) => <TimelineItem key={a.id} icon={a.icon} heading={a.title} datetime={a.at} meta={a.meta} />)}
              </Timeline>
            </div>
          </Card>
          <Card heading="Deals" variant="compact">
            <EmptyState size="inline" heading="No deals yet" icon="handshake">Convert the lead or add a deal.</EmptyState>
          </Card>
        </LayoutSection>
      </Layout>
    </Page>
  );
}`;

export const patterns = [
  {
    slug: 'admin-frame', name: 'Admin frame: header, navigation and page', kind: 'example',
    task: 'Find the same menu, header and page layout on every screen of a Commmerce product, on a desktop and on a phone.',
    uses: ['app-frame', 'header-bar', 'side-navigation', 'bottom-navigation', 'mobile-menu', 'page', 'page-header', 'layout', 'card', 'button'],
    frames: true,
    layout: [
      '`cm-app-frame` is the top element of the page. Put each part in its slot: `header` (Header bar), `navigation` (Side navigation), the page itself (no slot, usually a `cm-page`), `bottom-navigation` and `mobile-menu`.',
      'At 1024px and wider: the header bar across the top, sticking as the page scrolls; the side navigation on the start side, inset `space-20`, sticking under the header and scrolling on its own when it is taller than the window; the page beside it, scrolling with the window.',
      'Below 1024px: the side navigation is hidden and the bottom navigation is fixed to the bottom of the window. The page gets bottom padding as tall as the bar, so its last line is never hidden. The header bar keeps sticking to the top and drops to logo, store and avatar on its own.',
      'More (`value="more"`, with `menu-item="more"` on the frame) opens the mobile menu as a full-screen layer above the page and header and below the bottom bar; the page behind it doesn\'t scroll while it is open. Esc, More again or a choice in the menu closes it. Without `menu-item`, listen for `cm-navigate` and set `menu-open` yourself.',
      'Collapsing: `collapsible` on the side navigation adds a button that shrinks it to a 72px rail of icons; the page grows into the space. Store the choice from `cm-collapse` (the example keeps it in `localStorage`) and set `collapsed` on the next page.',
      'Notches and home indicators: the header sits below `env(safe-area-inset-top)` and the bottom bar pads for `env(safe-area-inset-bottom)`. Add `viewport-fit=cover` to your viewport meta tag to use the whole screen.',
      'Landmarks: the frame adds `main` around the page; the header bar is the `banner` and the navigations are `nav`s. Don\'t add your own around them.',
    ],
    notes: ['Both previews are real windows running the code below: the desktop one is 1440px wide, scaled to fit this page. Collapse the side navigation in the desktop one, and press More in the phone one.', 'For Commmerce products only: apps never draw the admin frame. In right-to-left languages the side navigation moves to the right.'],
  },
  {
    slug: 'record-page', name: 'Record page', kind: 'example',
    task: 'Open a lead, contact, deal, account, ticket, order or product and see its status, key facts and history in the same place on every record.',
    uses: ['app-frame', 'page', 'page-header', 'badge', 'button', 'layout', 'info-panel', 'card', 'avatar', 'tag', 'status-tabs', 'timeline', 'empty-state'],
    frames: { html: recordPageHtml, script: recordPageScript, react: recordPageReact, label: 'record page' },
    layout: [
      'One layout for every record: `cm-page` (default width) with a `cm-page-header`, then `cm-layout variant="record"`: a main section and a `cm-layout-section variant="aside"`.',
      'Header: the record\'s name as the title, its status as a badge in `title-adornment` (it stays beside the title), the owner, created date and source in `description` ("Owner Ravi Kumar · Created 12 Nov 2026 · Source Website form"), secondary actions then the one primary action. `back-href` and `back-label` add a back arrow to the list the record was opened from, at every width.',
      'From 880px of the layout\'s own width (a 1280px laptop with the side navigation) the aside is a 320px column on the end side (on the left in right-to-left languages) and the main column takes the rest, 24px apart. Narrower (a 1024px window with the side navigation, tablets, phones) the aside stacks above the main content, so the key facts come first; `aside-position="below"` puts it under instead. On phones (640px or less) the gap is 16px.',
      'Put the sections in the source in their stacked order: the aside first with the default, the main section first with `aside-position="below"`. On wide layouts the aside moves to the end column wherever it is in the source.',
      '`sticky-aside` keeps the aside in view under the header while the main column scrolls, but only while the whole aside fits in the window; a taller aside scrolls with the page so nothing in it is out of reach. Set `--cm-layout-sticky-top` if your page has its own sticky bar.',
      'Aside: a Details `cm-info-panel variant="compact" layout="rows"` (13px labels beside 14px values, Edit as its action), then compact cards for the owner (avatar and name, Change) and tags (Add). Keep the aside to facts and short lists; anything long goes in the main column.',
      'Main: `cm-status-tabs` (Overview, Activity, Emails) over a `cm-timeline` of the record\'s history, newest first, then related lists (deals, tasks, orders) as compact cards with an Add action in the header and an inline empty state (`cm-empty-state size="inline"`) when there is nothing yet.',
      'Orders and products use the same layout: the order\'s items and timeline in the main column, customer, payment and shipping facts in the aside.',
    ],
    notes: ['Both previews are real windows running the code below: the desktop one is 1440px wide, scaled to fit this page. Scroll the desktop one to see the aside stay in view, and pick Emails to filter the activity.', 'Learned from the Commmerce CRM, whose record pages had a main column and a 310px "On this record" column; the standard is 320px.'],
  },
  {
    slug: 'admin-dashboard', name: 'Admin dashboard and onboarding', kind: 'example',
    task: 'Land in the admin, see where everything is, and finish setting up the store.',
    uses: ['header-bar', 'side-navigation', 'bottom-navigation', 'mobile-menu', 'button'],
    html: dashboardHtml,
    layout: [
      'Header bar across the top: logo, store switcher, Hire an Expert and My Subscription, wallet balance and the user.',
      'Side navigation on the left, inset 20px on `bg-page`; the page content sits in one large white panel with 16px corners.',
      'A welcome heading, then one black card for the most important setup step: the store address, Edit Website and Go To Website, and ways to share the store.',
      'Quick-action tiles under it for the remaining setup steps (category, product, domain, payment gateway, store address and GST). Each tile is one link.',
    ],
    notes: [
      'For Commmerce products only: apps never draw the header bar or side navigation.',
      'On phones, replace the side navigation with a Bottom navigation whose "More" opens the Mobile menu; the header bar already drops to logo, store and avatar. [[Admin frame|/patterns/admin-frame]] shows how `cm-app-frame` puts these parts together for you.',
      'The share buttons are text, not brand logos: Facebook, X and LinkedIn marks are not part of the Commmerce icon set. Copy link uses the `link` icon.',
      'Hide a tile once its step is done, and the whole row once setup is complete.',
    ],
  },
  {
    slug: 'order-list', name: 'Order and product lists', kind: 'example',
    task: 'Find the orders that need attention, check their state at a glance, and act on several at once.',
    uses: ['page-header', 'status-tabs', 'search', 'resource-list', 'table-header', 'badge', 'pagination', 'empty-state', 'button'],
    html: orderListHtml, wire: wireOrderList,
    layout: [
      'Page header with the list name and one primary action (Create order). Actions on the list itself, such as Export, go in the list toolbar.',
      'Status tabs directly under the header, with counts, so the default view is the work to do ("Unprocessed"), not everything.',
      'Search above the list. Results update as the merchant types; Enter commits the query.',
      'A selectable resource list. Bulk actions appear only once rows are selected; "Select all" offers every matching order, not just the page.',
      'One badge per row for the state the merchant acts on (payment here). Don\'t stack several badges in one row.',
      'Pagination under the list, with rows per page.',
    ],
    notes: ['On phones, give each row two columns (the example does this under 600px wide) instead of squeezing every field into one line.', 'Products use the same layout: swap the columns for image, title, stock and price, and the tabs for Active, Draft and Archived.', 'Tabs and search in this example filter rows in the browser. In a real app, send the status and query to your API and set `total` from its response.'],
  },
  {
    slug: 'product-editor', name: 'Product creation and editing', kind: 'example',
    task: 'Create or change a product without losing work, and fix any mistakes before it goes live.',
    uses: ['page', 'layout', 'page-header', 'card', 'stack', 'grid', 'text-field', 'file-upload', 'select', 'toggle', 'checkbox', 'save-bar', 'banner'],
    html: productEditorHtml, wire: wireProductEditor, banner: true,
    layout: [
      '`cm-page` and `cm-layout`: a two-thirds main column for what customers see (details, media, pricing) and a one-third side column for settings (status, inventory). The columns stack below 768px.',
      'Save bar appears as soon as anything changes and stays until the merchant saves or discards. Discard resets the form.',
      'Validate when the merchant saves, not while they type. Each invalid field says what to enter, and focus moves to the first one. Since 1.14 the fields do this themselves when the form is submitted; this example uses `novalidate` and sets `error` itself, which you need for checks the fields can\'t make ("Enter a product title" instead of the general message). See [[Validation|/apps/guidelines?s=validation]].',
      'Clear an error as soon as the field is fixed.',
      'After saving, confirm with a short success banner; after a failed save, keep everything the merchant typed.',
    ],
    notes: ['Try it: change any field to see the save bar, then press Save with the title empty.', 'Warn before leaving a page with unsaved changes with the browser\'s `beforeunload` prompt. Inside the admin, ask with a Modal: see [[Unsaved changes when leaving|/patterns/unsaved-changes]].'],
  },
  {
    slug: 'states', name: 'Empty, loading, error and success states', kind: 'example',
    task: 'Always know what is happening: nothing here yet, still loading, something went wrong, or it worked.',
    uses: ['empty-state', 'resource-list', 'skeleton', 'skeleton-display', 'banner', 'button'],
    states: true,
    layout: [
      'Empty: say what will appear and give the one action that fills it. Different from "no results", which should suggest changing the search or filters.',
      'Loading: keep the layout in place with skeletons or the list\'s `loading` state; don\'t show a spinner over a blank page.',
      'Error: say what failed, that nothing was lost, and offer to try again. Use a critical banner at the top of the affected area.',
      'Success: confirm briefly and specifically ("3 orders marked as processing"). Let the merchant dismiss it.',
    ],
    notes: [],
  },
  {
    slug: 'pipeline-board', name: 'Board or list: records by status', kind: 'example',
    task: 'See where every record stands in a process and move it to the next status, or switch to a list to search and act on many.',
    uses: ['board', 'status-tabs', 'resource-list', 'badge', 'banner'],
    html: pipelineHtml, wire: wirePipelineBoard, banner: true,
    layout: [
      'Use a board when the status is the main thing people change, there are three to eight statuses, and people move one record at a time (a sales pipeline, support tickets, onboarding steps). Use a list or table to search, sort, filter, compare fields, or act on many records at once.',
      'Offer both views of the same records with a Board / List switch above them, and remember the choice. Filters and search apply to both.',
      'One column per status, in process order. Each column shows its full count (`total`) and its first page of cards; Load more fetches the next page of that column only.',
      'A card shows the name (a link to the record), then two or three short lines and a badge. Everything else belongs on the record page.',
      'Save each move as it happens in `cm-move` and pass the request to `waitUntil()`: the card shows as saving and goes back with an announcement if the save fails. Say what went wrong in a banner or toast.',
      'Statuses that need more information (a reason for Lost, a value for Won) can\'t be completed by a drop: cancel the move and open the record or a modal to ask.',
      'On phones the board shows one column at a time and snaps between them; the list view is often easier there, so make it the default on small screens if most work happens on phones.',
    ],
    notes: ['Try it: drag a card or move one with the keyboard (Space, arrow keys, Enter); moves to Lost fail on purpose. Switch to List to see the same merchants as a list.', 'Learned from the Commmerce CRM, where every module with a status (merchants, partners, deals, tickets) has a board view.'],
  },
  {
    slug: 'pick-record', name: 'Pick a record from a search', kind: 'guidance',
    task: 'Choose one existing record (a lead, a customer, a product) without leaving the page you are on.',
    uses: ['modal', 'search', 'resource-list', 'button', 'empty-state'],
    html: pickRecordHtml,
    layout: [
      'A Modal titled with the action ("Link a lead"), holding a Search at the top and a Resource list of matches under it. The preview shows the contents; in your app they sit inside `cm-modal`.',
      'Search as the merchant types (wait about 250 ms between requests) and show the first matches at once, so the list is never empty on open when there are recent or likely records.',
      'Each row shows enough to tell similar records apart: name, then a second line with phone and city. Choosing a row selects it; the confirming button names the action ("Link lead") and stays disabled until a row is chosen.',
      'No matches: a compact Empty state in the list ("No leads match “ravi”"), with an action to create one only if that makes sense here.',
      'Confirm closes the modal and shows the result where it belongs (the linked lead on the page) with a toast; Cancel and Esc close it without changes.',
    ],
    notes: ['Learned from the Commmerce CRM, which uses this for linking leads, contacts and partners.', 'Focus starts in the search box. Arrow keys move through the list; the chosen row is announced. Keep the modal\'s height steady while results load, so the buttons don\'t jump.'],
  },
  {
    slug: 'inventory-fulfilment', name: 'Inventory and fulfilment states', kind: 'guidance',
    task: 'Tell, in one glance, where an order is in fulfilment and whether a product can be sold.',
    uses: ['badge', 'status-tabs', 'info-panel', 'action-bar'],
    html: fulfilmentHtml,
    layout: [
      'Use one badge per state and the same word everywhere: list rows, the detail page and notifications.',
      'Pick the tone by meaning: success when nothing is left to do, critical when something failed or stopped, information when the merchant should look, attention for new items.',
      'On the order page, show the next step as the primary action in the action bar ("Mark as processing").',
    ],
    notes: ['These words and tones are the proposed standard for every Commmerce platform. Platforms use different words today; they will move to these as they adopt Commmerce UI. Map your backend\'s states onto them rather than inventing new ones.'],
  },
  {
    slug: 'search-filter-sort', name: 'Search, filtering, sorting and bulk actions', kind: 'example',
    task: 'Narrow a long list down to the records to act on, then act on them together.',
    uses: ['page-header', 'status-tabs', 'search', 'filter-panel', 'tag', 'table-header', 'resource-list', 'select', 'checkbox', 'badge', 'modal', 'empty-state'],
    html: searchFilterHtml, wire: wireSearchFilter, banner: true,
    layout: [
      'Order of controls: status tabs, then search, then the applied filters, then the list. Sorting lives in the table header.',
      'Search matches the fields merchants know (product name, order number, customer name, phone), not internal IDs. Results update as the merchant types.',
      'The search\'s filter button opens the Filter panel. Filters apply when the merchant presses Search, not field by field.',
      'Show each applied filter as a removable tag under the search, and the number of filters on the filter button (`filter-count`). Removing a tag updates the list at once.',
      'Sort by clicking a sortable column; clicking it again reverses the order. Only make a column sortable if your API can sort by it.',
      'Bulk actions act on the selected rows. A destructive bulk action asks first and says how many records it affects ("Delete 3 products?").',
      'When nothing matches, say so and suggest changing the status, search or filters (the list\'s `empty` slot).',
    ],
    notes: ['Try it: search "shirt", open the filters and tick "Low stock", sort by Price, then select rows and delete them.', 'Tabs, search, filters and sorting run in the browser in this example. In a real app, send them to your API, set the list\'s `total` from the response, and keep them in the page address so the view survives a reload.'],
  },
  {
    slug: 'tables-on-phones', name: 'Tables on phones', kind: 'guidance',
    task: 'Read and act on a table on a phone without zooming, losing columns by surprise or missing that it scrolls.',
    uses: ['data-table', 'resource-list', 'pagination'],
    html: tablesOnPhonesHtml,
    layout: [
      'Every table picks one strategy for narrow screens with `mobile` on `cm-data-table`, and the choice is part of the design review. The table switches by its own width (640px or less), so a table in a narrow card or side panel switches on a desktop too.',
      '**Cards** (`mobile="cards"`): each row becomes a card with the primary column as its title, the other columns as label and value pairs, and the row\'s actions at the bottom, always visible. Use it for short lists people act on one record at a time, where each record matters more than comparing columns: a to-do list, accounts at risk, renewals due. Keep it to about five fields; hide the rest with the column picker or `visible: false`.',
      '**Scroll** (`mobile="scroll"`, the default): every column stays and the table scrolls sideways, and shows that it does: the far edge fades and "Scroll for more" sits under the table until the end is reached. Add `sticky-first-column` so each row keeps its name. Use it when people compare values across rows and columns (a team\'s numbers, a log of system events, a report), where splitting rows into cards would hide the comparison.',
      '**Priority** (`mobile="priority"`): columns marked `priority: "low"` hide, and each row gets "View all fields", which shows them under the row. Use it when two or three columns tell most of the story and the rest are details (owner, plan, notes). For a server-rendered table, mark headings `data-priority="low"` and link each row to its record instead.',
      'Commmerce CRM (/v4): cards for At risk, Tasks and Renewals; visible scroll for Team and for the Accounts system events log.',
      'Whatever the strategy: numbers stay right-aligned and never wrap, dates never wrap, and text that doesn\'t fit ends in "…" (the full value is read by screen readers and shows on hover). Put Pagination under the table; on phones it keeps only the page field and the arrows.',
      'A list people select and act on in bulk is a [[Resource list|/components/resource-list]], not a table: on phones its rows already stack, with column cells left out.',
    ],
    notes: ['The preview shows each strategy in a 390px column: cards (At risk), scroll (Team) and priority (Renewals). Open "View all fields" on a renewal, and scroll the Team table sideways.', 'Since 1.6, from the owner\'s UI/UX standardisation brief (#33) after reviewing the CRM\'s 55 /v4 screens.'],
  },
  {
    slug: 'undo-instead-of-confirm', name: 'Undo instead of confirm', kind: 'example',
    task: 'Archive, move or remove things in one step, and take it back if it was a slip.',
    uses: ['toast', 'resource-list', 'button', 'modal'],
    html: undoArchiveHtml, wire: wireUndoArchive,
    layout: [
      'Reversible actions (archive, mark done, move to another status or list, remove from a list, hide) happen at once, with no question first. Then a toast says what happened, in the past tense, with Undo: "Lead archived. Undo".',
      'Ask first, with [[Confirm before deleting|/patterns/confirm-delete]], only when the action can\'t be undone: deleting for good, sending a message, charging or refunding money, anything that leaves the store. Never both a confirmation and Undo for one action.',
      'In code: `undoable(doIt, undoIt, { message: \'Lead archived\' })` runs `doIt` at once and `undoIt` if Undo is pressed, and resolves with how the toast closed (`action`, `timeout`, `close` or `removed`). Or call `showToast(message, { action: { label: \'Undo\', onAction } })` and `await toast.closed` yourself.',
      'Make undo cheap on your server: archive with a flag (or soft-delete) and clear it on Undo. If the record must really be deleted later, do it only once the toast has closed without Undo, and on the server, not in the page.',
      'Move focus somewhere sensible when the row goes (the next row\'s button, or the list), never leave it on nothing. On Undo, put the row back where it was and focus it again.',
      'One toast per action: for a bulk action, one toast for the lot ("3 leads archived. Undo"), and Undo restores all of them.',
      'If the action fails, show no Undo: say what went wrong (a critical toast plus a banner or field error) and leave things as they were.',
      'The toast stays 10 seconds with Undo and pauses while the pointer or focus is on it. Keyboard users press F6 to reach Undo and F6 again to go back; Esc closes it; screen readers hear the message, the action and "Press F6 to reach it." politely.',
    ],
    notes: ['Try it: press Archive on a lead, then Undo in the toast, or press F6 and then Enter.'],
  },
  {
    slug: 'confirm-delete', name: 'Confirm before deleting', kind: 'example',
    task: 'Delete something on purpose, never by accident, and know exactly what will go.',
    uses: ['modal', 'button', 'page-header', 'banner', 'resource-list'],
    html: confirmDeleteHtml, wire: wireConfirmDelete, banner: true,
    layout: [
      'Ask only when the action can\'t be undone. If it can be undone (archive, mark done, move, remove from a list, hide), do it at once and offer Undo in a toast instead: see [[Undo instead of confirm|/patterns/undo-instead-of-confirm]].',
      'A small Modal whose title names the thing: "Delete “Linen shirt”?". For several records, give the count: "Delete 3 products?".',
      'Say what goes with it (variants, images) and what stays (past orders keep their details), then "This can\'t be undone."',
      'Cancel first, the main action last, named with the same verb as the button that opened it ("Delete product", never "OK" or "Yes").',
      'While the request runs, keep the modal open and the button busy (`loading`); cancel `cm-close` so Esc can\'t close it half-way. On success, close it and confirm in a banner; on failure, keep it open and say what went wrong.',
    ],
    notes: ['Try it: press Delete product, then Delete product in the modal.', 'Focus starts on the modal itself, so its title is read, and returns to the Delete button when it closes. Don\'t put `autofocus` on the destructive button: Enter should never delete by accident.'],
  },
  {
    slug: 'unsaved-changes', name: 'Unsaved changes when leaving', kind: 'example',
    task: 'Leave a form without losing work by accident, or throw changes away on purpose.',
    uses: ['save-bar', 'modal', 'page-header', 'card', 'text-field', 'checkbox'],
    html: unsavedChangesHtml, wire: wireUnsavedChanges, banner: true,
    layout: [
      'The save bar shows as soon as anything changes; Save and Discard live there, so there is no Cancel button on the page.',
      'Leaving inside the admin (a breadcrumb, a link, the navigation) while the save bar is open asks with a small Modal: "Leave page with unsaved changes?", with Keep editing and Leave page.',
      'Closing the tab or reloading asks with the browser\'s own `beforeunload` prompt; its text can\'t be changed.',
      'Don\'t ask when nothing changed, after a successful save, or after Discard.',
    ],
    notes: ['Try it: change the name, then press the "Customers" breadcrumb.', 'Embedded apps: when your app shows the admin save bar through App Bridge, the admin asks before leaving your app; inside your app\'s own pages, use this pattern.'],
  },
  {
    slug: 'app-layout', name: 'Embedded app layout and navigation', kind: 'example',
    task: 'Open your app inside the Commmerce admin and find your way around it like any other admin page.',
    uses: ['page-header', 'card', 'resource-list', 'text-field', 'toggle', 'save-bar', 'modal', 'empty-state'],
    app: appLayoutApp,
    layout: [
      'The admin draws its own header and navigation. Your app fills the page area: start each screen with a page header, then cards on `bg-page`.',
      'Keep your own navigation shallow: a first page that lists things, a page per thing, and settings. Link back with breadcrumbs; don\'t draw a side navigation or tabs that copy the admin\'s.',
      'Route inside your frame (here: its `#` address) and call `app.navigate(path)` on every screen change, so the admin\'s address, reloads and shared links open the same screen.',
      'Use the admin\'s save bar (`app.saveBar.show()`) for unsaved changes and the admin\'s modal (`app.modal.open()`) for confirmations: they cover the whole admin, not just your frame.',
      'Confirm finished actions with `app.toast.show()`. Follow the admin\'s theme from `app.ready` and `theme.change`.',
      'Design for the admin\'s content width at desktop and for 414px phones; every ready component already adapts.',
    ],
    notes: ['Try it: open a review, type a reply (the save bar above the frame appears), save, then delete the review. Watch the admin address above the frame.', 'This page plays the admin with App Bridge\'s reference host; your app\'s code is exactly what runs in the frame. Before relying on App Bridge in a store, confirm with support that your store\'s admin is connected (see [[App Bridge|/apps/app-bridge]]).'],
  },
];
