# Temporary OpenNext manifest workaround

Scope: @opennextjs/cloudflare 1.20.10, dist/cli/build/patches/plugins/load-manifest.js.
Provenance: https://github.com/opennextjs/opennextjs-cloudflare/pull/1356
This proposal is unmerged and is not an official released fix.

The npm postinstall script verifies the exact adapter version and published file
SHA-256, then adds preview-props to the existing manifest glob. It embeds the
actual manifest, including draft-mode data; it never substitutes an empty object.
The resulting file hash is checked, and applying it again is an exact no-op.
No patch tool dependency, lockfile migration or generated-bundle patch is needed.

Run npm ci normally; do not use --ignore-scripts for adapter builds. Production
installs that explicitly omit dev dependencies skip the absent development adapter.
A changed version or source fails closed and requires owner review.

Before removing this workaround, verify a published adapter includes this fix
and test clean builds, dynamic/API routes, 404s, metadata and draft behavior.
Then remove the postinstall hook, patch script and `cf:verify` command, and
remove the verification prefixes from both `cf:build` and `cf:preview` together.
Update the pinned adapter and lockfile in a separately reviewed change.
Lifecycle-disabled installation is not a substitute for this reviewed removal.
Do not deploy based on this patch alone.

## Mandatory verification before Cloudflare commands

`npm run cf:verify` is non-mutating and requires the installed adapter to be
exactly 1.20.10 with patched source SHA-256
`004eb30e9128d0d31a6837cad4b2cb81777003087dca73dcee81bca0c53303fb`.
The supported original SHA-256 is
`7465f0f005b9a027b1d32e7bafdb23e92e2f3b7937dfbf61fbddcae9c1e9ce41`.

Both `npm run cf:build` and `npm run cf:preview` run verification first using
`&&`; a missing package, changed version, unpatched source or unexpected source
stops the command before the adapter executes. The script resolves paths from
its own location rather than the shell working directory. Verification never
reapplies a patch, writes files or makes network requests.

Lifecycle-disabled installs (`npm ci --ignore-scripts`) skip postinstall and
leave the upstream manifest bug present. They are intentionally blocked by
these Cloudflare commands until a normal guarded installation succeeds.
Direct adapter CLI invocation bypasses npm scripts and is not the documented
supported workflow; this guard is not protection against deliberate bypass.

An explicit `npm ci --omit=dev` may skip the absent adapter during postinstall,
but verification and both Cloudflare commands still fail: that production-only
installation cannot build or preview the Cloudflare worker. Build with dev
dependencies present. This exception never weakens verification.

If the adapter version changes, stop and review the published source and upstream
fix, then perform a separately approved clean installation, build and runtime
test. Do not simply update hashes to accept unknown source. Remove the workaround
only after verifying a published fix and testing real draft-mode behavior; remove
the postinstall hook, verification command and both script prefixes together.
Passing local checks does not establish production readiness or resolve audits.
