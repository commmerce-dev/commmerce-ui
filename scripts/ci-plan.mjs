// Decides what a CI run must test (owner's fast-CI rules, 17 Nov 2026).
// - Pushes to main, tags and manual runs test everything.
// - Pull requests test only what the change can reach: a package's own changed tests (vitest --changed follows the
//   import graph), every test of the packages downstream of it, and only the starters whose folder changed.
// - Lockfiles, package.json, configs, CI files, scripts and the generated packages (tokens, icons) force a full run.
// Writes `tests` (JSON: suite -> "full" | "changed" | "skip"), `starters` (JSON array) and `review` ("true" when the
// @commmerce/review suite can be reached: packages/review, the component docs it bundles, or packages/ui) to $GITHUB_OUTPUT.
// Locally: node scripts/ci-plan.mjs [base-ref]  (prints the plan for the diff against base-ref).
import { execSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

export const STARTERS = ['react-starter', 'vue-starter', 'svelte-starter', 'angular-starter', 'next-starter'];
export const PACKAGES = ['ui', 'ui-react', 'app-bridge'];
// Packages whose tests import another package's build: a change upstream runs all of their tests.
const DOWNSTREAM = { ui: ['ui-react', 'app-bridge'], 'ui-react': [], 'app-bridge': [] };

const FORCE_FULL = [
  /(^|\/)package-lock\.json$/,
  /^package\.json$/, /^packages\/[^/]+\/package\.json$/,
  /^\.github\//, /^scripts\//, /^\.oxlintrc\.json$/,
  /(^|\/)tsconfig[^/]*\.json$/, /(^|\/)[^/]+\.config\.[cm]?[jt]s$/,
  /^packages\/(tokens|icons)\//, // generated CSS, JSON and icon modules every component builds on
];

// What the @commmerce/review tests depend on: the package, the docs content and the ui API it bundles.
const REVIEW_INPUTS = [/^packages\/review\//, /^docs\/content\.js$/, /^packages\/ui\//];

export function plan({ event, changed }) {
  const all = { tests: Object.fromEntries(PACKAGES.map((p) => [p, 'full'])), starters: STARTERS, review: true, reason: '' };
  if (event !== 'pull_request') return { ...all, reason: `${event}: everything runs` };
  const forced = changed.find((f) => FORCE_FULL.some((re) => re.test(f)));
  if (forced) return { ...all, reason: `${forced} changed: everything runs` };
  const tests = Object.fromEntries(PACKAGES.map((p) => [p, 'skip']));
  for (const p of PACKAGES) {
    if (!changed.some((f) => f.startsWith(`packages/${p}/`))) continue;
    if (tests[p] === 'skip') tests[p] = 'changed';
    for (const d of DOWNSTREAM[p]) tests[d] = 'full';
  }
  const starters = STARTERS.filter((s) => changed.some((f) => f.startsWith(`examples/${s}/`)));
  const review = changed.some((f) => REVIEW_INPUTS.some((re) => re.test(f)));
  return { tests, starters, review, reason: `pull request: ${changed.length} files changed` };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const event = process.env.GITHUB_EVENT_NAME ?? (process.argv[2] ? 'pull_request' : 'push');
  const base = process.env.GITHUB_BASE_REF ? `origin/${process.env.GITHUB_BASE_REF}` : process.argv[2];
  const changed = event === 'pull_request'
    ? execSync(`git diff --name-only ${base}...HEAD`).toString().split('\n').filter(Boolean)
    : [];
  const p = plan({ event, changed });
  console.log(p.reason);
  console.log(JSON.stringify({ tests: p.tests, starters: p.starters, review: p.review }, null, 2));
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT,
      `tests=${JSON.stringify(p.tests)}\nstarters=${JSON.stringify(p.starters)}\nreview=${p.review}\n` +
      `any_tests=${Object.values(p.tests).some((m) => m !== 'skip')}\n`);
  }
}
