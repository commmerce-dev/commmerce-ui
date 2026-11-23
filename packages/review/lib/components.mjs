// The component data bundled at build time (dist/components.json, from docs/content.js and custom-elements.json).
import { readFileSync } from 'node:fs';

/** @type {{ version: string, components: any[] } | null} */
let data = null;
export function bundle() {
  data ??= JSON.parse(readFileSync(new URL('../dist/components.json', import.meta.url), 'utf8'));
  return /** @type {{ version: string, components: any[] }} */ (data);
}
export const components = () => bundle().components;
export const UI_VERSION = () => bundle().version;
