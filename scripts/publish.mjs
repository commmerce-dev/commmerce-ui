// Publishes @commmerce/tokens, icons, ui, ui-react, app-bridge and review to npm, in dependency order.
//   node scripts/publish.mjs        dry run: builds, tests, and shows exactly what would be published
//   node scripts/publish.mjs --yes  publishes (needs `npm login` as the npm user "commmerce", which owns the @commmerce scope)
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const yes = process.argv.includes('--yes');
const run = (cmd) => { console.log(`$ ${cmd}`); execSync(cmd, { stdio: 'inherit' }); };
const names = ['tokens', 'icons', 'ui', 'ui-react', 'app-bridge', 'review'];
const versions = names.map((n) => JSON.parse(readFileSync(`packages/${n}/package.json`, 'utf8')).version);
if (new Set(versions).size !== 1) throw new Error(`versions differ: ${versions.join(', ')}`);
const version = versions[0];
console.log(`Commmerce UI ${version}${yes ? '' : ' (dry run)'}`);
// In GitHub Actions with an id-token, npm authenticates each publish through trusted publishing (OIDC). There is no
// login session, so `npm whoami` would fail; only check the login when publishing from a machine.
const oidc = !!process.env.ACTIONS_ID_TOKEN_REQUEST_URL;
if (yes && !oidc) {
  try { console.log(`npm user: ${execSync('npm whoami').toString().trim()}`); }
  catch { throw new Error('Not logged in to npm. Run `npm login` first.'); }
}
if (yes && oidc) console.log('npm: trusted publishing (OIDC) from GitHub Actions');
run('npm run build');
run('npm test');
run('node scripts/build-docs.mjs');          // fails if the release note for this version is missing
run('node scripts/test-packages.mjs chromium');
// Release candidates (1.0.0-rc.1) go to the `next` dist-tag, so `npm install @commmerce/ui` keeps the last final release.
const tag = version.includes('-') ? ' --tag next' : '';
for (const n of names) {
  // Trusted publishing (OIDC) can't create a package: a new one must be published once by hand (npm login as "commmerce")
  // and given its trusted publisher first. Until then the release skips it instead of failing after the others are out.
  if (yes && oidc) {
    try { execSync(`npm view @commmerce/${n} name`, { stdio: 'ignore' }); }
    catch { console.warn(`::warning::@commmerce/${n} is not on npm yet: publish it once by hand and add its trusted publisher. Skipped.`); continue; }
  }
  // Already on npm at this version (e.g. a new package's first publish was done by hand): skip instead of failing.
  let published = '';
  try { published = execSync(`npm view @commmerce/${n}@${version} version`, { stdio: 'pipe' }).toString().trim(); } catch {}
  if (published === version) { console.log(`@commmerce/${n}@${version} is already on npm. Skipped.`); continue; }
  run(`npm publish --workspace @commmerce/${n} --access public${tag}${yes ? '' : ' --dry-run'}`);
}
console.log(yes ? `Published ${version}. Tag it: git tag v${version} && git push --tags` : 'Dry run complete. Re-run with --yes to publish.');
