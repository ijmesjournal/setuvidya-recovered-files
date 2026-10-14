import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------
   Book mockups, drawn rather than photographed.

   Three covers in the house style, standing on a shelf line. Vector keeps
   them crisp on any display and costs nothing to load, and it avoids the
   stock-photo look the brief rules out. Cover text is generic enough to read
   as a design specimen rather than as a claimed publication.
------------------------------------------------------------------------- */

type Cover = {
  title: string[];
  kind: string;
  fill: string;
  band: string;
  text: string;
};

const COVERS: Cover[] = [
  {
    title: ['Advances in', 'Structural', 'Reliability'],
    kind: 'Research monograph',
    fill: '#12314F',
    band: '#A8802C',
    text: '#FFFFFF',
  },
  {
    title: ['Applied', 'Research', 'Methodology'],
    kind: 'Textbook',
    fill: '#F4F6F9',
    band: '#2B4A8B',
    text: '#0B1B2B',
  },
  {
    title: ['Interdisciplinary', 'Perspectives', 'in Policy'],
    kind: 'Edited volume',
    fill: '#2B4A8B',
    band: '#A8802C',
    text: '#FFFFFF',
  },
];

export function BookMockup({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 720 320"
      className={cn('h-auto w-full max-w-3xl', className)}
      role="img"
      aria-label="Three academic book covers in the SetuVidya house style: a research monograph, a textbook and an edited volume."
      focusable="false"
    >
      <defs>
        <filter id="sv-book-shadow" x="-25%" y="-15%" width="150%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#0B1B2B" floodOpacity="0.18" />
        </filter>
      </defs>

      {COVERS.map((cover, i) => {
        const x = 40 + i * 224;
        const y = 24 + (i === 1 ? -10 : 0);
        const w = 168;
        const h = 244;

        return (
          <g key={cover.kind} filter="url(#sv-book-shadow)">
            {/* spine */}
            <rect x={x - 12} y={y + 6} width="12" height={h} fill={cover.fill} opacity="0.72" />
            {/* board */}
            <rect x={x} y={y} width={w} height={h} fill={cover.fill} />
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill="none"
              stroke="#0B1B2B"
              strokeOpacity="0.14"
            />

            {/* top rule */}
            <rect x={x + 22} y={y + 30} width="52" height="3" fill={cover.band} />

            {/* title */}
            {cover.title.map((line, li) => (
              <text
                key={line}
                x={x + 22}
                y={y + 74 + li * 26}
                fill={cover.text}
                fontFamily="var(--font-serif), Georgia, serif"
                fontSize="20"
                fontWeight="600"
              >
                {line}
              </text>
            ))}

            {/* rule + kind */}
            <line
              x1={x + 22}
              y1={y + 168}
              x2={x + w - 22}
              y2={y + 168}
              stroke={cover.text}
              strokeOpacity="0.28"
            />
            <text
              x={x + 22}
              y={y + 190}
              fill={cover.text}
              fillOpacity="0.72"
              fontFamily="var(--font-sans), system-ui, sans-serif"
              fontSize="10.5"
              letterSpacing="1.6"
            >
              {cover.kind.toUpperCase()}
            </text>

            {/* imprint mark: the bridge, small */}
            <g transform={`translate(${x + 22}, ${y + h - 46})`} opacity="0.85">
              <path
                d="M0 14 C 5 4, 21 4, 26 14"
                fill="none"
                stroke={cover.text}
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <line x1="0" y1="14" x2="26" y2="14" stroke={cover.text} strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="13" cy="6.2" r="2.4" fill={cover.band} />
            </g>
          </g>
        );
      })}

      {/* shelf line */}
      <line x1="10" y1="292" x2="710" y2="292" stroke="#0B1B2B" strokeOpacity="0.16" strokeWidth="2" />
    </svg>
  );
}
