// Minimal MCP server core (tools only), transport-agnostic. The same file is in the public repo
// (packages/review/lib/mcp-protocol.mjs): keep both copies identical.
//
// createMcp({ name, version, instructions, tools }) returns handle(message, ctx) -> response | null.
// A tool is { name, title?, description, inputSchema, annotations?, handler(args, ctx) }. The handler returns a string
// or a JSON-able value (sent as pretty-printed text); throwing returns the message as a tool error (isError: true), so
// the calling agent sees it and can correct itself.

export const PROTOCOL_VERSIONS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];

export class ToolError extends Error {}

const rpcError = (id, code, message) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

export function createMcp({ name, version, instructions, tools }) {
  const byName = new Map(tools.map((t) => [t.name, t]));

  async function one(msg, ctx) {
    if (!msg || typeof msg !== 'object' || msg.jsonrpc !== '2.0') return rpcError(msg?.id, -32600, 'Invalid request');
    const isRequest = msg.id !== undefined && msg.id !== null;
    if (typeof msg.method !== 'string') return null; // a response from the client: nothing to answer
    if (!isRequest) return null; // notifications (initialized, cancelled, ...)
    const ok = (result) => ({ jsonrpc: '2.0', id: msg.id, result });
    const params = msg.params ?? {};
    switch (msg.method) {
      case 'initialize': {
        const asked = params.protocolVersion;
        return ok({
          protocolVersion: PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSIONS[0],
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name, version },
          instructions,
        });
      }
      case 'ping': return ok({});
      case 'tools/list':
        return ok({ tools: tools.map(({ name: n, title, description, inputSchema, annotations }) => ({ name: n, ...(title ? { title } : {}), description, inputSchema, ...(annotations ? { annotations } : {}) })) });
      case 'tools/call': {
        const tool = byName.get(params.name);
        if (!tool) return rpcError(msg.id, -32602, `Unknown tool: ${params.name}`);
        const args = params.arguments ?? {};
        const missing = (tool.inputSchema.required ?? []).filter((k) => args[k] === undefined || args[k] === null || args[k] === '');
        if (missing.length) return ok({ content: [{ type: 'text', text: `Missing required argument(s): ${missing.join(', ')}` }], isError: true });
        try {
          const out = await tool.handler(args, ctx);
          return ok({ content: [{ type: 'text', text: typeof out === 'string' ? out : JSON.stringify(out, null, 2) }] });
        } catch (e) {
          return ok({ content: [{ type: 'text', text: e instanceof Error ? e.message : String(e) }], isError: true });
        }
      }
      default:
        return rpcError(msg.id, -32601, `Method not found: ${msg.method}`);
    }
  }

  return async function handle(msg, ctx = {}) {
    if (Array.isArray(msg)) {
      if (!msg.length) return rpcError(null, -32600, 'Invalid request');
      const out = (await Promise.all(msg.map((m) => one(m, ctx)))).filter(Boolean);
      return out.length ? out : null;
    }
    return one(msg, ctx);
  };
}

// Line-delimited JSON-RPC over stdin/stdout (the MCP stdio transport). Logs go to stderr only.
export function serveStdio(handle, { input = process.stdin, output = process.stdout, ctx = {} } = {}) {
  // Requests run concurrently (a slow page check must not hold up a ping); each answer carries its request's id.
  let buf = '';
  const pending = new Set();
  input.setEncoding('utf8');
  input.on('data', (chunk) => {
    buf += chunk;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim();
      buf = buf.slice(i + 1);
      if (!line) continue;
      const p = (async () => {
        let msg;
        try { msg = JSON.parse(line); } catch { output.write(JSON.stringify(rpcError(null, -32700, 'Parse error')) + '\n'); return; }
        const res = await handle(msg, ctx);
        if (res) output.write(JSON.stringify(res) + '\n');
      })();
      pending.add(p);
      p.finally(() => pending.delete(p));
    }
  });
  return new Promise((resolve) => input.on('end', () => Promise.all(pending).then(() => resolve())));
}
