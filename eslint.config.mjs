import nextVitals from 'eslint-config-next/core-web-vitals';

const config = [
  ...nextVitals,
  {
    // React Compiler is not enabled. Keep its new diagnostics visible without
    // expanding this security migration into UI refactors. Existing Hooks
    // rules (rules-of-hooks and exhaustive-deps) retain the preset severities.
    rules: {
      'react-hooks/static-components': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
];

export default config;
