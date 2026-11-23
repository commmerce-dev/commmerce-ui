// Run after `flutter build web` into docs/flutter/: makes the demo self-contained so it loads nothing from Google.
// - CanvasKit: keeps only canvaskit/canvaskit.{js,wasm} (the "full" variant the bootstrap asks for, every browser).
// - Fallback fonts: downloads every font file the engine may ask for (the list is compiled into main.dart.js)
//   from fonts.gstatic.com into fallback-fonts/, so characters render exactly as with Google's copy.
// The bootstrap (flutter/commmerce_ui/example/web/flutter_bootstrap.js) points both at cdn.commmerce.com.
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const OUT = new URL('../docs/flutter/', import.meta.url).pathname;
const GOOGLE_FONTS = 'https://fonts.gstatic.com/s/';

// CanvasKit: flutter build copies every variant plus debug symbols; keep the one variant we load.
const ck = join(OUT, 'canvaskit');
for (const name of await readdir(ck)) {
  if (name !== 'canvaskit.js' && name !== 'canvaskit.wasm') await rm(join(ck, name), { recursive: true, force: true });
}
for (const f of ['canvaskit.js', 'canvaskit.wasm']) await stat(join(ck, f)); // fails loudly if the build left them out

// Fallback fonts.
const main = await readFile(join(OUT, 'main.dart.js'), 'utf8');
const fonts = [...new Set([...main.matchAll(/"([a-z0-9]+\/v\d+\/[\w-]+\.(?:woff2|ttf))"/g)].map((m) => m[1]))];
if (fonts.length < 100) throw new Error(`Only ${fonts.length} fallback fonts found in main.dart.js; the engine format changed?`);
const dir = join(OUT, 'fallback-fonts');
await rm(dir, { recursive: true, force: true });
let bytes = 0;
const queue = [...fonts];
await Promise.all(Array.from({ length: 12 }, async () => {
  for (let f; (f = queue.shift()); ) {
    const res = await fetch(GOOGLE_FONTS + f);
    if (!res.ok) throw new Error(`${GOOGLE_FONTS}${f}: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await mkdir(dirname(join(dir, f)), { recursive: true });
    await writeFile(join(dir, f), buf);
    bytes += buf.length;
  }
}));
await writeFile(join(dir, 'README.txt'), `Fallback fonts for the Flutter web demo, copied unchanged from Google Fonts (${GOOGLE_FONTS}).
Each family (Roboto and the Noto families) is under the SIL Open Font License 1.1 or the Apache License 2.0,
as listed for it on https://fonts.google.com. Refreshed by scripts/flutter-web-mirror.mjs.
`);
console.log(`canvaskit: canvaskit.js + canvaskit.wasm; fallback-fonts: ${fonts.length} files, ${(bytes / 1048576).toFixed(1)} MB`);
