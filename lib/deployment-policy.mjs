// Shared by Next configuration and server handlers. Never use NODE_ENV to
// distinguish a production build from a preview deployment.
export const PRODUCTION_ORIGIN = 'https://setuvidya.com';
export const SUBMISSION_DENIAL_CODE = 'PREVIEW_SUBMISSIONS_DISABLED';
export const SUBMISSION_DENIAL_MESSAGE =
  'Submissions are disabled in this preview. Nothing was sent or saved.';

export function isExplicitProduction() {
  const site = process.env.SITE_ENV;
  const vercel = process.env.VERCEL_ENV;
  // An absent optional marker is allowed, but empty/unknown/conflicting
  // markers are not. At least one explicit production marker is required.
  return (site === 'production' || vercel === 'production') &&
    (site === undefined || site === 'production') &&
    (vercel === undefined || vercel === 'production');
}

// Next embeds this non-secret marker in compiled application code via env in
// next.config.mjs. Do not replace it with a request header or runtime override.
// It detects accidental mode mismatches, not malicious artifact replacement.
export function deploymentModeAgrees() {
  const builtMode = process.env.SETUVIDYA_BUILD_MODE;
  const runtimeMode = isExplicitProduction() ? 'production' : 'restricted';
  return (builtMode === 'production' || builtMode === 'restricted') &&
    builtMode === runtimeMode;
}

export function productionAllowed() {
  return deploymentModeAgrees() && isExplicitProduction();
}
