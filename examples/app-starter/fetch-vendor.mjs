// Downloads one pinned version of the Commmerce UI hosted build into vendor/.
// Pinned files never change; raise VERSION after reading the release notes.
import { mkdir, writeFile } from 'node:fs/promises';

const VERSION = process.env.COMMMERCE_UI_VERSION || '1.21.1';
const BASE = `https://cdn.commmerce.com/commmerceui/v/${VERSION}`;
await mkdir(new URL('./vendor/', import.meta.url), { recursive: true });
const download = async (file) => {
  const res = await fetch(`${BASE}/${file}`);
  if (!res.ok) throw new Error(`${BASE}/${file}: ${res.status}`);
  const bytes = Buffer.from(await res.arrayBuffer());
  await writeFile(new URL(`./vendor/${file}`, import.meta.url), bytes);
  console.log(`vendor/${file} (v${VERSION})`);
  return bytes;
};
for (const file of ['tokens.css', 'cdn.js', 'app-bridge.js']) await download(file);
// The Poppins typeface: fonts.css and the font files it points at (fonts/*.woff2, plus the font licence).
const fontFiles = [...(await download('fonts.css')).toString().matchAll(/url\(['"]?(fonts\/[\w.-]+)['"]?\)/g)].map((m) => m[1]);
if (fontFiles.length) {
  await mkdir(new URL('./vendor/fonts/', import.meta.url), { recursive: true });
  for (const file of new Set([...fontFiles, 'fonts/OFL.txt'])) await download(file);
}
