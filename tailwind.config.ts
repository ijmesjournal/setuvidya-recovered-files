import type { Config } from 'tailwindcss';

/** Tokens resolve from CSS custom properties in app/globals.css. */
const rgb = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: rgb('--sv-ink'),
        navy: rgb('--sv-navy'),
        indigo: {
          DEFAULT: rgb('--sv-indigo'),
          lift: rgb('--sv-indigo-lift'),
        },
        brass: rgb('--sv-brass'),
        'brass-text': rgb('--sv-brass-text'),
        'brass-on-dark': rgb('--sv-brass-on-dark'),
        numeral: rgb('--sv-numeral'),
        teal: rgb('--sv-teal'),
        'brand-navy': rgb('--sv-brand-navy'),
        'brand-teal': rgb('--sv-brand-teal'),
        'brand-teal-deep': rgb('--sv-brand-teal-deep'),
        'brand-teal-on-navy': rgb('--sv-brand-teal-on-navy'),
        royal: rgb('--sv-royal'),
        purple: rgb('--sv-purple'),
        saffron: rgb('--sv-saffron'),
        'saffron-text': rgb('--sv-saffron-text'),
        body: rgb('--sv-body'),
        muted: rgb('--sv-muted'),
        rule: rgb('--sv-rule'),
        surface: rgb('--sv-surface'),
        paper: rgb('--sv-paper'),
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'Times New Roman', 'serif'],
      },
      fontSize: {
        /* One scale, used everywhere. Sizes are measured, not guessed:
           display-xl  hero h1      34px mobile -> 52px desktop
           display-lg  page h1      32px        -> 46px
           display-md  section h2   26px        -> 34px
           display-sm  card h3      19px        -> 23px
           display-xs  h4, sparing  17px        -> 18px
           lede        intro text   17px        -> 18px
           micro       kicker       12.5px, modest tracking */
        'display-xl': ['clamp(2.125rem, 1.55rem + 1.85vw, 3.25rem)', { lineHeight: '1.1', letterSpacing: '-0.018em' }],
        'display-lg': ['clamp(2rem, 1.6rem + 1.25vw, 2.875rem)', { lineHeight: '1.12', letterSpacing: '-0.016em' }],
        'display-md': ['clamp(1.625rem, 1.42rem + 0.7vw, 2.125rem)', { lineHeight: '1.2', letterSpacing: '-0.012em' }],
        'display-sm': ['clamp(1.2rem, 1.12rem + 0.28vw, 1.44rem)', { lineHeight: '1.3', letterSpacing: '-0.008em' }],
        'display-xs': ['clamp(1.0625rem, 1.03rem + 0.1vw, 1.125rem)', { lineHeight: '1.4' }],
        lede: ['clamp(1.0625rem, 1.02rem + 0.16vw, 1.125rem)', { lineHeight: '1.7' }],
        micro: ['0.78rem', { lineHeight: '1.45', letterSpacing: '0.08em' }],
      },
      borderRadius: {
        DEFAULT: 'var(--sv-radius)',
        lg: 'var(--sv-radius-lg)',
      },
      maxWidth: {
        prose: '68ch',
        shell: '78rem',
      },
      boxShadow: {
        // Reserved for genuinely interactive elevation only.
        lift: '0 12px 32px -14px rgb(11 27 43 / 0.22), 0 2px 6px -2px rgb(11 27 43 / 0.08)',
        panel: '0 1px 2px 0 rgb(11 27 43 / 0.04)',
      },
      transitionTimingFunction: {
        sv: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
