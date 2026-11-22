// Cloudflare Worker "commmerceui-proxy" (commmerce.com zone).
// Routes: commmerce.com/commmerceui, commmerce.com/commmerceui/* and cdn.commmerce.com/commmerceui/* (added 22 Nov 2026)
// Serves the docs at commmerce.com/commmerceui/ from the blog server, which keeps serving them at
// /blog/commmerceui/ (nginx `location ^~ /blog/commmerceui/`). Same pattern as the blog-proxy Worker.
// Paste this file into the Worker in the Cloudflare dashboard; this copy is the record of what runs there.
const ORIGIN = 'https://blog.commmerce.com';
const PUBLIC_PREFIX = '/commmerceui';
const ORIGIN_PREFIX = '/blog/commmerceui';

export default {
  async fetch(request) {
    const url = new URL(request.url);
    // The page uses relative links, so it needs the trailing slash.
    if (url.pathname === PUBLIC_PREFIX) {
      return Response.redirect(`https://commmerce.com${PUBLIC_PREFIX}/${url.search}`, 301);
    }
    const target = `${ORIGIN}${ORIGIN_PREFIX}${url.pathname.slice(PUBLIC_PREFIX.length)}${url.search}`;
    const res = await fetch(new Request(target, request), { redirect: 'manual' });
    // Keep any redirect the origin sends on the public address.
    const loc = res.headers.get('location');
    if (loc) {
      const fixed = loc.replace(`${ORIGIN}${ORIGIN_PREFIX}`, `https://commmerce.com${PUBLIC_PREFIX}`)
        .replace(new RegExp(`^${ORIGIN_PREFIX}`), PUBLIC_PREFIX);
      if (fixed !== loc) {
        const headers = new Headers(res.headers);
        headers.set('location', fixed);
        return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
      }
    }
    return res;
  },
};
