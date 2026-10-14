// Temporary local workaround: https://github.com/opennextjs/opennextjs-cloudflare/pull/1356
// Remove only after a published replacement is verified and tested.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== '--check')) {
  throw new Error('Usage: node scripts/apply-opennext-manifest-patch.cjs [--check]');
}
const checkOnly = args[0] === '--check';
const root = path.resolve(__dirname, '..');
const dir = path.join(root, 'node_modules/@opennextjs/cloudflare');
const metadata = path.join(dir, 'package.json');
if (!fs.existsSync(metadata)) {
  if (!checkOnly && (process.env.npm_config_omit || '').split(/[ ,]+/).includes('dev')) {
    console.log('[OpenNext patch] Development adapter omitted; nothing to patch.');
    process.exit(0);
  }
  throw new Error('OpenNext adapter missing; refusing to silently skip the patch.');
}
if (JSON.parse(fs.readFileSync(metadata, 'utf8')).version !== '1.20.10') {
  throw new Error('OpenNext version changed; review the workaround before proceeding.');
}
const file = path.join(dir, 'dist/cli/build/patches/plugins/load-manifest.js');
const source = fs.readFileSync(file, 'utf8');
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const originalHash = '7465f0f005b9a027b1d32e7bafdb23e92e2f3b7937dfbf61fbddcae9c1e9ce41';
const patchedHash = '004eb30e9128d0d31a6837cad4b2cb81777003087dca73dcee81bca0c53303fb';
if (digest(source) === patchedHash) {
  console.log(checkOnly ? '[OpenNext check] Verified adapter 1.20.10 and exact patched SHA-256.' : '[OpenNext patch] Exact correction already applied.');
  process.exit(0);
}
if (checkOnly) {
  if (digest(source) === originalHash) {
    throw new Error('Required OpenNext manifest patch is missing. Run npm ci with lifecycle scripts enabled, then verify again; verification never applies the patch.');
  }
  throw new Error('OpenNext patched source SHA-256 mismatch; refusing Cloudflare build/preview. Review the installed adapter; verification never modifies it.');
}
if (digest(source) !== originalHash) throw new Error('OpenNext source differs from verified release; refusing to patch.');
const before = '**/{*-manifest,required-server-files,prefetch-hints}.json';
const after = '**/{*-manifest,required-server-files,prefetch-hints,preview-props}.json';
if (source.split(before).length !== 2) throw new Error('Expected exactly one manifest pattern.');
const output = source.replace(before, after);
if (digest(output) !== patchedHash) throw new Error('Unexpected patch result.');
fs.writeFileSync(file, output);
console.log('[OpenNext patch] Included real preview-props.json in build-time manifest inlining.');
