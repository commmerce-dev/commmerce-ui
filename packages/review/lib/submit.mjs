// Builds a review submission (shared by the CLI and the stdio MCP server's submit_review).
import { readFileSync } from 'node:fs';
import { shoot, readImages, findPersonalData, SHOT_WIDTHS } from './shoot.mjs';

export const MAX_IMAGES = 12;
const MAX_SOURCE = 200 * 1024;

/**
 * @param {{ app: string, url?: string, screens?: { name: string, path: string }[], images?: string[], questions?: string[],
 *   sourceFiles?: string[], resubmissionOf?: string, uiVersion?: string }} input
 */
export async function prepareSubmission(input) {
  if (!input.app) throw new Error('app is required (your app or product name).');
  /** @type {{ name: string, width: number, image: string, bytes: number }[]} */
  let images = [];
  let text = '';
  let uiVersion = input.uiVersion ?? null;
  const fromFiles = !!input.images?.length;
  if (fromFiles) {
    images = readImages(/** @type {string[]} */ (input.images));
  } else {
    if (!input.url) throw new Error('Give a url (screenshots are taken locally at 390, 768 and 1280px) or images.');
    const screens = input.screens?.length
      ? input.screens.map((s) => ({ name: s.name, url: new URL(s.path, /** @type {string} */ (input.url)).href }))
      : [{ name: 'page', url: input.url }];
    if (screens.length * SHOT_WIDTHS.length > MAX_IMAGES) throw new Error(`At most ${MAX_IMAGES / SHOT_WIDTHS.length} screens per review (each is taken at ${SHOT_WIDTHS.join(', ')}px).`);
    const shot = await shoot(screens);
    images = shot.images; text = shot.text; uiVersion ??= shot.uiVersion;
  }
  if (images.length > MAX_IMAGES) throw new Error(`At most ${MAX_IMAGES} images per review.`);
  const source_files = (input.sourceFiles ?? []).map((path) => ({ path, text: readFileSync(path, 'utf8') }));
  const srcBytes = source_files.reduce((n, f) => n + Buffer.byteLength(f.text) + Buffer.byteLength(f.path), 0);
  if (srcBytes > MAX_SOURCE) throw new Error('Source files are over 200 KB together: send only the screens\' markup.');
  for (const f of source_files) text += `\n${f.text}`;
  const personal = findPersonalData(text);
  const body = {
    app: input.app,
    ...(input.url && /^https?:\/\//.test(input.url) ? { url: input.url } : {}),
    screens: images.map(({ name, width, image }) => ({ name, width, image })),
    questions: input.questions ?? [],
    ...(uiVersion ? { ui_version: uiVersion } : {}),
    ...(source_files.length ? { source_files } : {}),
    ...(input.resubmissionOf ? { resubmission_of: input.resubmissionOf } : {}),
  };
  return { body, personal, fromFiles, summary: images.map((i) => `${i.name} @${i.width}px (${Math.round(i.bytes / 1024)} KB)`) };
}

export const DEMO_DATA_RULE = 'Submissions must show demo data only: no real customer names, emails, phone numbers or addresses.';
