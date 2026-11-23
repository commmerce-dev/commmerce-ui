// The stdio MCP server's tools. The remote endpoint (https://commmerce.com/commmerceui/api/mcp) has the same tool names
// and arguments; there, check_page explains how to run it locally and submit_review takes base64 screenshots.
import { search, find } from './components-index.mjs';
import { components } from './components.mjs';
import { checkPage } from './check.mjs';
import { prepareSubmission, DEMO_DATA_RULE } from './submit.mjs';
import { mask } from './shoot.mjs';

export const INSTRUCTIONS = `Commmerce UI review tools. Commmerce UI is the design system for apps in the Commmerce admin (web components named cm-*).
Workflow:
1. BEFORE building or changing a screen, call search_components with what the screen needs, then get_component for each component you will use. Use cm-* components (with their attributes and slots) instead of native controls or custom CSS.
2. When a screen is done, run check_page on its URL (localhost works) and fix every blocker.
3. Then call submit_review (screenshots are taken locally at 390, 768 and 1280px; demo data only) and poll get_review until the status is done. Apply each finding's fix (the Commmerce UI way, with the docs link) and resubmit with resubmission_of.
4. Missing a component? request_component. Found a bug or have a suggestion? send_feedback.
PRIVATE: everything sent through these tools (or by email to ui@commmerce.com) is seen only by Commmerce and your team, never published; replies come back only to you (get_review, or the same email thread). Screenshots and source are deleted 30 days after the review is done. Public GitHub issues are optional, only for someone who wants to report a library bug in public. Keys are issued by Commmerce on request: ui@commmerce.com.`;

const COMPONENT_HINT = 'Always look components up before building UI: Commmerce UI has ready-made, accessible cm-* components, and reviews flag native controls or custom CSS where a cm-* component exists.';

/** @param {ReturnType<typeof import('./api.mjs').createClient>} client */
export function localTools(client) {
  return [
    {
      name: 'search_components',
      title: 'Search Commmerce UI components',
      description: `Find Commmerce UI components for what you are building ("orders table with bulk actions", "date filter", "save bar"). Returns tag, name, summary and docs link. ${COMPONENT_HINT} Then call get_component for the full API.`,
      inputSchema: { type: 'object', properties: { query: { type: 'string', description: 'What the screen or control needs to do.' }, limit: { type: 'integer', minimum: 1, maximum: 30 } }, required: ['query'] },
      annotations: { readOnlyHint: true, openWorldHint: false },
      handler: async (/** @type {any} */ { query, limit }) => ({ components: search(components(), query, limit ?? 8) }),
    },
    {
      name: 'get_component',
      title: 'Get a Commmerce UI component',
      description: `Full reference for one component (tag like "cm-button", slug or name): attributes and properties, slots, events, methods, examples (HTML), do/don't, content and accessibility rules, docs link. Use it before writing markup for that component. ${COMPONENT_HINT}`,
      inputSchema: { type: 'object', properties: { name: { type: 'string', description: 'Tag (cm-data-table), slug (data-table) or name (Data table).' } }, required: ['name'] },
      annotations: { readOnlyHint: true, openWorldHint: false },
      handler: async (/** @type {any} */ { name }) => {
        const c = find(components(), name);
        if (!c) throw new Error(`No component "${name}". Closest: ${search(components(), name, 5).map((x) => x.tag).join(', ') || 'none'}. Use search_components.`);
        return c;
      },
    },
    {
      name: 'check_page',
      title: 'Check a page',
      description: 'Deterministic checks of a running page, in a local headless Chromium (localhost works; nothing is sent anywhere): Commmerce UI present and its version, axe-core accessibility, sideways scroll at 320/390/768/1280px, text under 12px, targets under 24px, native controls where a cm-* component exists. Run it after building a screen and fix every blocker before submit_review. Needs Playwright in the project.',
      inputSchema: { type: 'object', properties: { url: { type: 'string', description: 'Page to check, e.g. http://localhost:5173/orders' }, widths: { type: 'array', items: { type: 'integer' } } }, required: ['url'] },
      annotations: { readOnlyHint: true },
      handler: async (/** @type {any} */ { url, widths }) => checkPage(url, { widths }),
    },
    {
      name: 'submit_review',
      title: 'Submit screens for review',
      description: `Send finished screens to Commmerce for a PRIVATE design and code review against Commmerce UI (only Commmerce and your team see it; the result comes back only through get_review). Screenshots are taken locally at 390, 768 and 1280px from url (+ each screen path; localhost works), or pass image file paths. ${DEMO_DATA_RULE} If emails or phone numbers are visible the tool refuses: replace them with demo data, or ask the user to confirm they are fake and set confirm_demo_data. Returns an id: poll get_review until status is done, then apply the findings. On a resubmission pass resubmission_of with the previous id.`,
      inputSchema: {
        type: 'object',
        properties: {
          app: { type: 'string', description: 'App or product name.' },
          url: { type: 'string', description: 'Base URL of the running app, e.g. http://localhost:5173' },
          screens: { type: 'array', maxItems: 4, items: { type: 'object', properties: { name: { type: 'string' }, path: { type: 'string', description: 'Path relative to url, e.g. /orders' } }, required: ['name', 'path'] } },
          images: { type: 'array', maxItems: 12, items: { type: 'string' }, description: 'Instead of url: image files, as "name@width=path" or a path.' },
          questions: { type: 'array', items: { type: 'string' }, description: 'What you want the reviewer to look at.' },
          source_files: { type: 'array', items: { type: 'string' }, description: 'Paths of the screens\' markup/code to include (200 KB max in total).' },
          resubmission_of: { type: 'string', description: 'Id of the previous review of the same screens.' },
          confirm_demo_data: { type: 'boolean', description: 'Set true only when the user confirmed the emails/phone numbers shown are fake.' },
        },
        required: ['app'],
      },
      handler: async (/** @type {any} */ a) => {
        const prep = await prepareSubmission({ app: a.app, url: a.url, screens: a.screens, images: a.images, questions: a.questions, sourceFiles: a.source_files, resubmissionOf: a.resubmission_of });
        const { emails, phones } = prep.personal;
        if ((emails.length || phones.length) && a.confirm_demo_data !== true) {
          throw new Error(`Not sent. ${DEMO_DATA_RULE} Visible on the page: ${[...emails, ...phones].slice(0, 8).map(mask).join(', ')}. Replace them with demo data (e.g. name@example.com), or ask the user to confirm they are fake and call again with confirm_demo_data: true.`);
        }
        const res = await client.submitReview(prep.body);
        return { ...res, images: prep.summary, next: `Call get_review with id ${res.id} after ${res.poll_after_s}s.` };
      },
    },
    {
      name: 'get_review',
      title: 'Get a review (or any submitted item)',
      description: 'Status and result of something you submitted (review, component request or feedback) by id. A review is done when status is "done": then read verdict, summary and findings (each with severity, element, problem, fix in the Commmerce UI way, and a docs link). While queued or reviewing, wait poll_after_s seconds and call again.',
      inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      annotations: { readOnlyHint: true, openWorldHint: false },
      handler: async (/** @type {any} */ { id }) => client.getItem(id),
    },
    {
      name: 'request_component',
      title: 'Request a component',
      description: 'Ask Commmerce for a component Commmerce UI does not have yet. Search first (search_components). Describe the need, not the implementation; give an example (markup or a link) if you have one.',
      inputSchema: { type: 'object', properties: { name: { type: 'string', description: 'Short name, e.g. "Kanban swimlanes".' }, need: { type: 'string', description: 'What the screen needs and why existing components fall short.' }, app: { type: 'string' }, example: { type: 'string' } }, required: ['name', 'need', 'app'] },
      handler: async (/** @type {any} */ a) => client.requestComponent({ name: a.name, need: a.need, app: a.app, ...(a.example ? { example: a.example } : {}) }),
    },
    {
      name: 'send_feedback',
      title: 'Send feedback',
      description: 'Report a Commmerce UI bug, suggest a refinement, or ask a question. Include steps, the component and version. Private: only Commmerce sees it and the reply comes back only to you (get_review). People can also send UI feedback privately by email to ui@commmerce.com.',
      inputSchema: { type: 'object', properties: { kind: { type: 'string', enum: ['bug', 'refinement', 'question'] }, title: { type: 'string' }, body: { type: 'string' }, app: { type: 'string' } }, required: ['kind', 'title', 'body'] },
      handler: async (/** @type {any} */ a) => client.sendFeedback({ kind: a.kind, title: a.title, body: a.body, ...(a.app ? { app: a.app } : {}) }),
    },
  ];
}
