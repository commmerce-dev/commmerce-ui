// Test harness: a review service to talk to, and a static server for pages and the docs.
// - COMMMERCE_REVIEW_SERVICE_DIR=/path/to/review-service (the real service, from the private repo): started with a
//   temporary data dir and real keys. This is the end-to-end run.
// - Otherwise an in-memory fake with the same API shape (CI has no access to the private service).
import { createServer, request } from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, statSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';

export const ROOT = resolve(import.meta.dirname, '..', '..', '..');
export const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const listen = (srv) => new Promise((r) => srv.listen(0, '127.0.0.1', () => r(srv.address().port)));

export async function startService() {
  const dir = process.env.COMMMERCE_REVIEW_SERVICE_DIR;
  return dir ? startReal(dir) : startFake();
}

async function startReal(dir) {
  const data = mkdtempSync(join(tmpdir(), 'review-e2e-'));
  const probe = createServer(); const port = await listen(probe); await new Promise((r) => probe.close(r));
  const env = { ...process.env, DATA_DIR: data, PORT: String(port), HOST: '127.0.0.1', COMPONENTS_DIR: join(ROOT, 'docs'), PUBLIC_ORIGINS: 'http://127.0.0.1:*' };
  const key = (args) => execFileSync(process.execPath, [join(dir, 'bin', 'keys.mjs'), 'create', ...args, '--quiet'], { env }).toString().trim();
  const adminKey = key(['--team', 'owner', '--kind', 'admin']);
  const teamKey = key(['--team', 'e2e', '--kind', 'internal']);
  const child = spawn(process.execPath, ['--disable-warning=ExperimentalWarning', join(dir, 'server.mjs')], { env, stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((r, j) => { child.stdout.on('data', (d) => { if (String(d).includes('commmerce-review')) r(); }); child.on('exit', (c) => j(new Error(`service exited ${c}`))); });
  return { kind: 'real', base: `http://127.0.0.1:${port}`, adminKey, teamKey, close: () => { child.kill(); rmSync(data, { recursive: true, force: true }); } };
}

// ---------- fake ----------
async function startFake() {
  const adminKey = `cma_${randomBytes(8).toString('hex')}`, teamKey = `cmr_${randomBytes(8).toString('hex')}`;
  const items = new Map();
  let n = 0;
  const id = (p) => `${p}_fake${++n}`;
  const view = (it) => { const { token: _t, email: _e, ...v } = it; return v; };
  const srv = createServer(async (req, res) => {
    const chunks = []; for await (const c of req) chunks.push(c);
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
    const send = (status, data) => { res.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(data)); };
    const url = new URL(req.url, 'http://x');
    const path = url.pathname.replace(/^\/(blog\/)?commmerceui\/api/, '');
    const auth = req.headers.authorization?.replace(/^Bearer /, '');
    const now = new Date().toISOString();
    let m;
    if (path === '/v1/public/reviews' && req.method === 'POST') {
      if (body.website) return send(201, { id: id('rv'), status: 'queued', status_url: 'x' });
      if (!body.name || !/@/.test(body.email ?? '') || !body.app || !['internal', 'third-party'].includes(body.submitter_kind ?? body.kind)) return send(400, { error: { code: 'invalid', message: 'name, email, app and submitter_kind are required' } });
      if (!body.url && !body.screens?.length) return send(400, { error: { code: 'invalid', message: 'Give the URL of your build or add screenshots.' } });
      const it = { id: id('rv'), type: 'review', status: 'queued', app: body.app, findings: [], summary: null, verdict: null, created_at: now, updated_at: now, poll_after_s: 60, token: randomBytes(12).toString('hex'), email: body.email, screens: body.screens ?? [] };
      items.set(it.id, it);
      return send(201, { id: it.id, status: 'queued', status_url: `https://commmerce.com/commmerceui/#apps--feedback?id=${it.id}&t=${it.token}`, poll_after_s: 60 });
    }
    if (path === '/v1/public/feedback' && req.method === 'POST') {
      if (body.website) return send(201, { id: id('fb'), status: 'queued', status_url: 'x' });
      if (!body.name || !/@/.test(body.email ?? '') || !body.app || !['internal', 'third-party'].includes(body.submitter_kind) || !body.title || !body.body
        || !['bug', 'refinement', 'question', 'component-request'].includes(body.kind)) return send(400, { error: { code: 'invalid', message: 'missing fields' } });
      const cr = body.kind === 'component-request';
      const it = { id: id(cr ? 'cr' : 'fb'), type: cr ? 'component-request' : 'feedback', ...(cr ? { name: body.title } : { kind: body.kind, title: body.title }), status: 'queued', app: body.app, findings: [], summary: null, reply: null, created_at: now, updated_at: now, poll_after_s: 60, token: randomBytes(12).toString('hex'), email: body.email, fields: body.fields, images: body.images ?? [] };
      items.set(it.id, it);
      return send(201, { id: it.id, status: 'queued', status_url: `https://commmerce.com/commmerceui/#apps--feedback?id=${it.id}&t=${it.token}`, poll_after_s: 60 });
    }
    if ((m = /^\/v1\/public\/(?:items|reviews|feedback)\/(\w+)$/.exec(path))) {
      const it = items.get(m[1]);
      const t = req.headers['x-status-token'] ?? url.searchParams.get('t');
      return it && it.token && t === it.token ? send(200, view(it)) : send(404, { error: { code: 'not_found', message: 'No review at this link.' } });
    }
    if (auth !== adminKey && auth !== teamKey) return send(401, { error: { code: 'unauthorized', message: 'This key is not valid or has been revoked.' } });
    if (path === '/v1/reviews' && req.method === 'POST') {
      if (!body.app || (!body.url && !body.screens?.length)) return send(400, { error: { code: 'invalid', message: 'app and screens or url required' } });
      const it = { id: id('rv'), type: 'review', status: 'queued', app: body.app, findings: [], summary: null, verdict: null, created_at: now, updated_at: now, poll_after_s: 1, screens: body.screens, ui_version: body.ui_version, questions: body.questions };
      items.set(it.id, it);
      return send(201, { id: it.id, status: 'queued', poll_after_s: 1 });
    }
    if (path === '/v1/component-requests' && req.method === 'POST') { const it = { id: id('cr'), type: 'component-request', status: 'queued', name: body.name, created_at: now, updated_at: now }; items.set(it.id, it); return send(201, { id: it.id, status: 'queued' }); }
    if (path === '/v1/feedback' && req.method === 'POST') { const it = { id: id('fb'), type: 'feedback', status: 'queued', kind: body.kind, title: body.title, created_at: now, updated_at: now }; items.set(it.id, it); return send(201, { id: it.id, status: 'queued' }); }
    if ((m = /^\/v1\/reviews\/(\w+)$/.exec(path))) { const it = items.get(m[1]); return it && !it.token ? send(200, view(it)) : send(404, { error: { code: 'not_found', message: 'No item' } }); }
    if ((m = /^\/v1\/admin\/items\/(\w+)\/claim$/.exec(path)) && auth === adminKey) { const it = items.get(m[1]); it.status = 'reviewing'; return send(200, view(it)); }
    if ((m = /^\/v1\/admin\/items\/(\w+)\/result$/.exec(path)) && auth === adminKey) {
      const it = items.get(m[1]); Object.assign(it, body, { updated_at: now }); if (['done', 'failed'].includes(it.status)) delete it.poll_after_s;
      return send(200, view(it));
    }
    if ((m = /^\/v1\/admin\/items\/(\w+)$/.exec(path)) && auth === adminKey) { const it = items.get(m[1]); return send(200, { ...it, submitter_email: it.email, source: it.token ? 'form' : 'api', payload: { fields: it.fields }, status_url: it.token ? `https://commmerce.com/commmerceui/#apps--feedback?id=${it.id}&t=${it.token}` : undefined }); }
    return send(404, { error: { code: 'not_found', message: path } });
  });
  const port = await listen(srv);
  return { kind: 'fake', base: `http://127.0.0.1:${port}`, adminKey, teamKey, close: () => srv.close() };
}

/** Admin call (to finish a review the way the runner does). */
export async function admin(svc, method, path, body) {
  const init = { method, headers: { authorization: `Bearer ${svc.adminKey}`, 'content-type': 'application/json' } };
  if (method !== 'GET' && body) init.body = JSON.stringify(body);
  const res = await fetch(`${svc.base}${path}`, init);
  return res.json();
}

// ---------- static pages ----------
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2' };
/**
 * Serves `pages` ({ '/path': html }) and, under `mount`, a directory. Requests under `${mount}api/` are proxied to
 * `apiBase` (like nginx in production).
 */
export async function startStatic({ pages = {}, dir, mount = '/', apiBase } = {}) {
  const srv = createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    if (apiBase && u.pathname.startsWith(`${mount}api/`)) {
      const target = new URL(apiBase);
      const p = request({ hostname: target.hostname, port: target.port, path: req.url, method: req.method, headers: req.headers }, (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); });
      req.pipe(p);
      return;
    }
    if (pages[u.pathname] !== undefined) { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(pages[u.pathname]); }
    if (dir && u.pathname.startsWith(mount)) {
      let f = join(dir, decodeURIComponent(u.pathname.slice(mount.length)) || 'index.html');
      if (existsSync(f) && statSync(f).isDirectory()) f = join(f, 'index.html');
      if (f.startsWith(dir) && existsSync(f)) { res.writeHead(200, { 'content-type': TYPES[extname(f)] ?? 'application/octet-stream' }); return res.end(readFileSync(f)); }
    }
    res.writeHead(404); res.end('not found');
  });
  const port = await listen(srv);
  return { base: `http://127.0.0.1:${port}`, close: () => srv.close() };
}

/** Runs the CLI; resolves { code, stdout, stderr }. */
export function cli(args, env = {}) {
  return new Promise((done) => {
    const child = spawn(process.execPath, [join(import.meta.dirname, '..', 'bin', 'commmerce-review.mjs'), ...args], { env: { ...process.env, ...env } });
    let stdout = '', stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('close', (code) => done({ code, stdout, stderr }));
  });
}

export const UI_CDN = join(ROOT, 'packages', 'ui', 'dist', 'cdn.js');
export const TOKENS_CSS = join(ROOT, 'packages', 'tokens', 'dist', 'tokens.css');
