// commmerce-review: the CLI. Exit codes: 0 ok, 1 blockers / changes needed / failed review, 2 usage or setup error,
// 3 timed out waiting.
import { parseArgs } from 'node:util';
import { readFileSync, writeFileSync } from 'node:fs';
import { createClient, waitFor, KEY_HELP, ApiError } from './api.mjs';
import { checkPage, formatCheck } from './check.mjs';
import { prepareSubmission, DEMO_DATA_RULE } from './submit.mjs';
import { mask } from './shoot.mjs';
import { SetupError } from './browser.mjs';
import { createMcp, serveStdio } from './mcp-protocol.mjs';
import { localTools, INSTRUCTIONS } from './tools.mjs';

const VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

export const HELP = `commmerce-review ${VERSION}: review what you build with Commmerce UI, from your coding agent or CI.

PRIVATE BY DEFAULT: everything you send (here, through the MCP server, or the feedback form) is seen only
by Commmerce and your team, never published. Replies come back only to you: \`commmerce-review status <id>\` / get_review,
or the form's private status link. Screenshots and source are deleted 30 days after a review is done. Send demo data only.
Public GitHub issues are optional, only if you want to report a library bug in public.

Usage: commmerce-review <command> [options]

Commands
  mcp                         Run the MCP server on stdio (for Claude Code, Codex and other agents).
  check <url>                 Check a running page locally (no AI, nothing is sent): Commmerce UI present and version,
                              axe-core, sideways scroll at 320/390/768/1280px, text under 12px, targets under 24px,
                              native controls where a cm-* component exists. Exits 1 on blockers (use it in CI).
      --json                  JSON output          --strict   also fail on major findings
      --widths 390,1280       widths to check      --out <file>  also write the JSON report to a file
  submit <url>                Take screenshots locally at 390, 768 and 1280px and send them for review.
      --screen name=/path     a screen (path relative to <url>); repeat, up to 4. Default: the url itself.
      --images <file...>      send image files instead (name@width=path, name=path or path); up to 12.
      --app <name>            your app or product (required)
      --question <text>       what to look at; repeat
      --source <file>         include the screen's markup/code; repeat (200 KB total)
      --resubmission-of <id>  previous review of the same screens
      --yes                   send even though emails/phone numbers are visible (you confirm they are demo data)
      --wait                  wait for the result (like \`wait\`)
  status <id>                 Show a review, component request or feedback item.
  wait <id>                   Poll until done. Exits 0 approved, 1 changes needed / needs a component / failed,
      --timeout <s>           3 timed out (default 1800s). --json for JSON.
  request-component           Ask for a component Commmerce UI doesn't have.
      --name <n> --need <text> --app <name> [--example <text or @file>]
  feedback                    Report a bug, suggest a refinement or ask a question.
      --kind bug|refinement|question --title <t> --body <text or @file> [--app <name>]

Environment
  COMMMERCE_REVIEW_KEY        your key (submit, status, wait, request-component, feedback). Keys are issued by
                              Commmerce on request: send the feedback form (type Question). check and
                              component lookup need no key.
  COMMMERCE_REVIEW_URL        API base (default https://commmerce.com/commmerceui/api/v1)

Docs: https://commmerce.com/commmerceui/#apps--review
Feedback form (no key needed): https://commmerce.com/commmerceui/#apps--feedback`;

/** @param {string | undefined} v */
const fileOrText = (v) => (v?.startsWith('@') ? readFileSync(v.slice(1), 'utf8') : v);
const out = (/** @type {string} */ s) => process.stdout.write(`${s}\n`);
const err = (/** @type {string} */ s) => process.stderr.write(`${s}\n`);

/** @param {any} item */
function formatItem(item) {
  const lines = [`${item.id} (${item.type}${item.app ? `, ${item.app}` : ''}): ${item.status}${item.verdict ? `, ${item.verdict}` : ''}`];
  if (item.summary) lines.push('', item.summary);
  for (const f of item.findings ?? []) {
    lines.push('', `[${f.severity}] ${f.id} ${f.screen} @${f.width}px: ${f.element}`, `  problem: ${f.problem}`, `  fix: ${f.fix}`);
    if (f.snippet) lines.push(`  snippet:\n${f.snippet.split('\n').map((/** @type {string} */ l) => `    ${l}`).join('\n')}`);
    if (f.docs_url) lines.push(`  docs: ${f.docs_url}`);
  }
  if (item.resolved?.length) lines.push('', `Resolved from the previous review: ${item.resolved.join(', ')}`);
  if (item.reply) lines.push('', item.reply);
  if (item.poll_after_s) lines.push('', `Not finished yet: check again in ${item.poll_after_s}s (commmerce-review wait ${item.id}).`);
  return lines.join('\n');
}
/** @param {any} item */
const exitFor = (item) => (item.status === 'done' && item.verdict !== 'changes-needed' && item.verdict !== 'needs-component' ? 0 : 1);

/** @param {string[]} argv @returns {Promise<number>} */
export async function main(argv) {
  const [cmd, ...rest] = argv;
  /** @type {(options: any) => { values: any, positionals: string[] }} */
  const parse = (options) => parseArgs({ args: rest, options: { json: { type: 'boolean' }, ...options }, allowPositionals: true });
  try {
    switch (cmd) {
      case undefined: case 'help': case '--help': case '-h': out(HELP); return 0;
      case '--version': case '-v': case 'version': out(VERSION); return 0;
      case 'mcp': {
        const handle = createMcp({ name: 'commmerce-review', version: VERSION, instructions: INSTRUCTIONS, tools: localTools(createClient()) });
        await serveStdio(handle);
        return 0;
      }
      case 'check': {
        const { values: v, positionals: [url] } = parse({ strict: { type: 'boolean' }, widths: { type: 'string' }, out: { type: 'string' } });
        if (!url) { err('usage: commmerce-review check <url> [--json] [--strict] [--widths 390,1280]'); return 2; }
        const widths = v.widths ? String(v.widths).split(',').map(Number) : undefined;
        const r = await checkPage(url, { widths });
        if (v.out) writeFileSync(String(v.out), JSON.stringify(r, null, 2));
        out(v.json ? JSON.stringify(r, null, 2) : formatCheck(r));
        return r.counts.blocker || (v.strict && r.counts.major) ? 1 : 0;
      }
      case 'submit': {
        const { values: v, positionals } = parse({
          screen: { type: 'string', multiple: true }, images: { type: 'string', multiple: true }, app: { type: 'string' },
          question: { type: 'string', multiple: true }, source: { type: 'string', multiple: true }, 'resubmission-of': { type: 'string' },
          yes: { type: 'boolean' }, wait: { type: 'boolean' }, timeout: { type: 'string' },
        });
        // --images a.png b.png: the extra files arrive as positionals after the first.
        const url = positionals[0];
        const images = v.images ? [...v.images, ...positionals] : undefined;
        const base = images ? undefined : url;
        if (!v.app || (!base && !images)) { err('usage: commmerce-review submit <url> --app <name> [--screen name=/path ...] | submit --images <file...> --app <name>'); return 2; }
        const client = createClient();
        if (!client.hasKey) { err(KEY_HELP); return 2; }
        const screens = (v.screen ?? []).map((/** @type {string} */ s) => { const i = s.indexOf('='); if (i < 1) throw new Error(`--screen ${s}: use name=/path`); return { name: s.slice(0, i), path: s.slice(i + 1) }; });
        err(images ? `Reading ${images.length} image(s)...` : `Taking screenshots of ${screens.length || 1} screen(s) at 390, 768 and 1280px...`);
        const prep = await prepareSubmission({ app: String(v.app), url: base, screens, images, questions: v.question, sourceFiles: v.source, resubmissionOf: v['resubmission-of'] });
        const { emails, phones } = prep.personal;
        if (prep.fromFiles) err(`Reminder: ${DEMO_DATA_RULE} (image files can't be scanned.)`);
        if (emails.length || phones.length) {
          err(`Warning: ${DEMO_DATA_RULE}\nVisible on the page: ${[...emails, ...phones].slice(0, 10).map(mask).join(', ')}`);
          if (!v.yes) { err('Not sent. Replace them with demo data (e.g. name@example.com), or re-run with --yes if they are fake.'); return 2; }
        }
        for (const s of prep.summary) err(`  ${s}`);
        const res = await client.submitReview(prep.body);
        if (!v.wait) { out(v.json ? JSON.stringify(res, null, 2) : `Submitted privately: ${res.id}\nOnly Commmerce and your team see it. Result: commmerce-review wait ${res.id}`); return 0; }
        err(`Submitted privately: ${res.id}. Waiting for the review...`);
        return await doWait(client, res.id, Number(v.timeout ?? 1800), !!v.json);
      }
      case 'status': {
        const { values: v, positionals: [id] } = parse({});
        if (!id) { err('usage: commmerce-review status <id>'); return 2; }
        const item = await createClient().getItem(id);
        out(v.json ? JSON.stringify(item, null, 2) : formatItem(item));
        return 0;
      }
      case 'wait': {
        const { values: v, positionals: [id] } = parse({ timeout: { type: 'string' } });
        if (!id) { err('usage: commmerce-review wait <id> [--timeout seconds]'); return 2; }
        return await doWait(createClient(), id, Number(v.timeout ?? 1800), !!v.json);
      }
      case 'request-component': {
        const { values: v } = parse({ name: { type: 'string' }, need: { type: 'string' }, app: { type: 'string' }, example: { type: 'string' } });
        if (!v.name || !v.need || !v.app) { err('usage: commmerce-review request-component --name <name> --need <text> --app <app> [--example <text or @file>]'); return 2; }
        const res = await createClient().requestComponent({ name: String(v.name), need: String(fileOrText(String(v.need))), app: String(v.app), ...(v.example ? { example: fileOrText(String(v.example)) } : {}) });
        out(v.json ? JSON.stringify(res, null, 2) : `Requested privately: ${res.id}. The reply comes back here: commmerce-review status ${res.id}`);
        return 0;
      }
      case 'feedback': {
        const { values: v } = parse({ kind: { type: 'string' }, title: { type: 'string' }, body: { type: 'string' }, app: { type: 'string' } });
        if (!v.kind || !v.title || !v.body) { err('usage: commmerce-review feedback --kind bug|refinement|question --title <title> --body <text or @file> [--app <app>]'); return 2; }
        const res = await createClient().sendFeedback({ kind: String(v.kind), title: String(v.title), body: String(fileOrText(String(v.body))), ...(v.app ? { app: String(v.app) } : {}) });
        out(v.json ? JSON.stringify(res, null, 2) : `Sent privately: ${res.id}. The reply comes back here: commmerce-review status ${res.id}`);
        return 0;
      }
      default:
        err(`Unknown command "${cmd}".\n\n${HELP}`);
        return 2;
    }
  } catch (e) {
    if (e instanceof SetupError || (e instanceof ApiError && [0, 400, 401, 403, 404, 413, 429].includes(e.status))) { err(e.message); return 2; }
    if (e instanceof Error && e.name === 'TypeError' && /** @type {any} */ (e).code?.startsWith?.('ERR_PARSE_ARGS')) { err(`${e.message}\n\n${HELP}`); return 2; }
    err(e instanceof Error ? e.message : String(e));
    return 2;
  }
}

/** @param {ReturnType<typeof createClient>} client @param {string} id @param {number} timeoutS @param {boolean} json */
async function doWait(client, id, timeoutS, json) {
  let last = '';
  const { item, timedOut } = await waitFor(client, id, { timeoutS, onPoll: (i) => { if (!json && i.status !== last) { err(`${id}: ${i.status}`); last = i.status; } } });
  out(json ? JSON.stringify(item, null, 2) : formatItem(item));
  if (timedOut) { err(`Still ${item.status} after ${timeoutS}s. Check later: commmerce-review status ${id}`); return 3; }
  if (item.status === 'needs-owner') { err('Waiting for a decision at Commmerce; you will get the reply here (commmerce-review status).'); return 3; }
  return exitFor(item);
}
