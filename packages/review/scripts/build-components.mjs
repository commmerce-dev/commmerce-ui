// Bundles the component data agents look up (search_components, get_component) into dist/components.json:
// the docs' written content (docs/content.js) plus the generated API (packages/ui/dist/custom-elements.json).
// Run after the ui build: `npm run build` at the repo root does both.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildIndex } from '../lib/components-index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..', '..');
const pkg = join(here, '..');
// docs/content.js has no package.json "type" next to it: load a .mjs copy so Node reads it as an ES module.
const tmp = join(pkg, 'dist', '.content.mjs');
mkdirSync(join(pkg, 'dist'), { recursive: true });
copyFileSync(join(root, 'docs', 'content.js'), tmp);
const { components } = await import(pathToFileURL(tmp).href);
rmSync(tmp);
const cem = JSON.parse(readFileSync(join(root, 'packages', 'ui', 'dist', 'custom-elements.json'), 'utf8'));
const index = buildIndex(components, cem);
const missing = index.filter((c) => !c.properties && !c.slots);
if (missing.length) throw new Error(`review: no API in custom-elements.json for ${missing.map((c) => c.tag).join(', ')}`);
const { version } = JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf8'));
writeFileSync(join(pkg, 'dist', 'components.json'), JSON.stringify({ version, components: index }));
console.log(`review: dist/components.json, ${index.length} components (Commmerce UI ${version})`);
