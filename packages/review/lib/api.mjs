// Client for the Commmerce review service (API v1). The key comes from COMMMERCE_REVIEW_KEY; keys are issued by
// Commmerce by email: `commmerce-review key request` (or ask your agent: request_key).

export const FEEDBACK_FORM = 'https://commmerce.com/commmerceui/#apps--feedback';
export const DEFAULT_BASE = 'https://commmerce.com/commmerceui/api/v1';
export const KEY_HELP = 'Set COMMMERCE_REVIEW_KEY to your review key. Get one by email: npx @commmerce/review key request --email you@company.com --name "Your name" --team "Your team"';

export class ApiError extends Error {
  /** @param {number} status @param {string} code @param {string} message */
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}

/** @param {{ key?: string, base?: string, fetch?: typeof fetch }} [opts] */
export function createClient(opts = {}) {
  const key = opts.key ?? process.env.COMMMERCE_REVIEW_KEY;
  const base = (opts.base ?? process.env.COMMMERCE_REVIEW_URL ?? DEFAULT_BASE).replace(/\/+$/, '');
  const f = opts.fetch ?? fetch;

  /** @param {string} method @param {string} path @param {unknown} [body] @returns {Promise<any>} */
  async function call(method, path, body) {
    if (!key) throw new ApiError(0, 'no_key', KEY_HELP);
    let res;
    try {
      res = await f(base + path, {
        method,
        headers: { authorization: `Bearer ${key}`, accept: 'application/json', ...(body === undefined ? {} : { 'content-type': 'application/json' }) },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (e) {
      throw new ApiError(0, 'network', `Could not reach ${base}: ${e instanceof Error ? e.message : e}`);
    }
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { /* not JSON */ }
    if (!res.ok) {
      const msg = data?.error?.message ?? `HTTP ${res.status}`;
      throw new ApiError(res.status, data?.error?.code ?? 'http', res.status === 401 ? `${msg} ${KEY_HELP}` : msg);
    }
    return data;
  }

  return {
    base,
    hasKey: !!key,
    /** @param {object} body */
    submitReview: (body) => call('POST', '/reviews', body),
    /** @param {string} id */
    getItem: (id) => call('GET', `/reviews/${encodeURIComponent(id)}`),
    listItems: () => call('GET', '/reviews'),
    /** @param {{name: string, need: string, app: string, example?: string}} body */
    requestComponent: (body) => call('POST', '/component-requests', body),
    /** @param {{kind: string, title: string, body: string, app?: string, images?: string[]}} body */
    sendFeedback: (body) => call('POST', '/feedback', body),
    /**
     * Asks Commmerce to email a key (no key needed). Goes through the remote MCP endpoint's request_key tool, which has
     * the same rules and limits as the form. The answer never contains the key.
     * @param {{email: string, name: string, team: string, kind?: string}} args
     */
    async requestKey(args) {
      const mcpUrl = base.replace(/\/v1$/, '/mcp');
      let res;
      try {
        res = await f(mcpUrl, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'request_key', arguments: args } }) });
      } catch (e) { throw new ApiError(0, 'network', `Could not reach ${mcpUrl}: ${e instanceof Error ? e.message : e}`); }
      const data = await res.json().catch(() => null);
      const result = data?.result;
      if (!res.ok || !result) throw new ApiError(res.status, 'http', data?.error?.message ?? `HTTP ${res.status}`);
      if (result.isError) throw new ApiError(400, 'invalid', result.content?.[0]?.text ?? 'Request refused');
      return JSON.parse(result.content[0].text);
    },
  };
}

const FINAL = ['done', 'failed'];
/**
 * Polls an item until it is done/failed (or needs-owner, which can take days), or the timeout passes.
 * @param {ReturnType<typeof createClient>} client @param {string} id
 * @param {{ timeoutS?: number, onPoll?: (item: any) => void, sleep?: (ms: number) => Promise<void>, untilNeedsOwner?: boolean }} [opts]
 */
export async function waitFor(client, id, opts = {}) {
  const sleep = opts.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
  const deadline = Date.now() + (opts.timeoutS ?? 1800) * 1000;
  for (;;) {
    const item = await client.getItem(id);
    opts.onPoll?.(item);
    if (FINAL.includes(item.status) || (item.status === 'needs-owner' && opts.untilNeedsOwner !== false)) return { item, timedOut: false };
    const wait = Math.min(Math.max(item.poll_after_s ?? 60, 5), 300) * 1000;
    if (Date.now() + wait > deadline) return { item, timedOut: true };
    await sleep(wait);
  }
}
